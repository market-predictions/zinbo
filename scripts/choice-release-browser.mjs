#!/usr/bin/env node
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';

const url=pathToFileURL(resolve('public/index.html')).href;
await mkdir(resolve('artifacts/choice-release'),{recursive:true});
const browser=await chromium.launch({headless:true});
const errors=[];
try {
  for(const [width,height] of [[1366,768],[1024,768],[390,844]]){
    const context=await browser.newContext({viewport:{width,height}});
    const page=await context.newPage();
    page.on('pageerror',error=>errors.push(width+'px: '+error.message));
    await page.goto(url,{waitUntil:'load'});
    assert.equal(await page.locator('.zb-choice-pilot-card').count(),0,
      'Regular child route must have no adult demonstration controls');

    async function setLevel(level){
      await page.locator('[data-action="world-profile"]').click();
      await page.locator('.op1-menu [data-action="world-group"]').click();
      await page.locator('.world-parent-dialog [data-level="'+level+'"]').click();
      assert.equal(await page.locator('.world-parent-dialog [data-level="'+level+'"]').getAttribute('aria-pressed'),'true');
      await page.locator('.parent-close').click();
    }
    const enter=async (level,world)=>{
      await setLevel(level);
      await page.locator('.op1-card[data-action="world-open"][data-world="'+world+'"]').click();
      const state=await page.evaluate(()=>window.__zinsbouwerTest.getState());
      assert.equal(state.worldId,world);
      assert.equal(state.lessonItems.length,5);
      return state.lessonItems;
    };
    // Level three in Sport has published stage-two verbs with four credible
    // options. This must work on the normal learner route, not via ?choice-pilot.
    let items=await enter(3,'sport');
    const expanded=items.filter(q=>q.choiceCount>2);
    assert.ok(expanded.length>=1,
      'Level 3 Sport must actually expose at least one reviewed variant');
    assert.ok(expanded.every(q=>[3,4].includes(q.choices.length)));
    let checkedVariant=false;
    for(let step=0;step<5;step++){
      const q=await page.evaluate(()=>window.__zinsbouwerTest.getCurrent());
      assert.equal(q.id,items[step].id,'Normal lesson item did not match preview');
      if(q.choices&&q.choiceCount>2){
        checkedVariant=true;
        assert.equal(await page.locator('.choice-row .ending').count(),q.choiceCount);
        assert.equal(await page.locator('.choice-row.zb-choice-grid').count(),1);
        const layout=await page.locator('.choice-row').evaluate(el=>({
          display:getComputedStyle(el).display,
          cols:getComputedStyle(el).gridTemplateColumns.split(' ').length
        }));
        assert.equal(layout.display,'grid');
        assert.ok(layout.cols>=2,'Choices must have a balanced responsive grid');
        const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
        assert.ok(overflow<=2,'Choice grid overflows by '+overflow+' px at '+width);
        await page.screenshot({path:resolve('artifacts/choice-release/'+width+'px-normal-level3-'+q.choiceCount+'-choices.png'),fullPage:true});
        if(!q.tiles){
          const wrong=q.choices.find(x=>x!==q.ending&&q.choiceErrorTypes?.[x]==='time');
          assert.ok(wrong,'Expected a specific time-based distractor');
          await page.locator('[data-action="ending"][data-ending="'+wrong+'"]').click();
          await page.locator('[data-action="check"]').click();
          assert.match(await page.locator('.feedback-text').innerText(),/wanneer het gebeurt/,
            'Normal learner must receive time-specific feedback');
        }
      }
      if(q.tiles){
        for(const tile of q.solutions[0])
          await page.locator('[data-action="tile"][data-id="'+tile+'"]').click();
      }else{
        await page.locator('[data-action="ending"][data-ending="'+q.ending+'"]').click();
      }
      await page.locator('[data-action="check"]').click();
      assert.equal(await page.locator('.feedback.good').count(),1);
      await page.locator('[data-action="next"]').click();
    }
    assert.ok(checkedVariant,'Expected a released variant to appear within five real exercises');
    assert.equal(await page.locator('.zbv4-review-row').count(),5);
    const learning=await page.evaluate(()=>window.__zinsbouwerTest.getBasicHistory());
    assert.ok(learning.some(entry=>entry.choiceGoal==='combined'&&[3,4].includes(entry.choicesOffered)),
      'Actual learner results must retain offered choice count and combined goal');
    await page.locator('[data-action="home"]').first().click();

    // Level one has only familiar two-option source exercises.
    items=await enter(1,'sport');
    assert.ok(items.filter(q=>q.choices).every(q=>q.choices.length===2));
    await page.locator('[data-action="home"]').first().click();

    // At level two the approved stage-one tense tasks can have three choices.
    items=await enter(2,'thuis');
    const three=items.filter(q=>q.choiceCount===3);
    assert.ok(three.length>=1,'Level 2 Thuis must include a suitable three-choice form');
    assert.ok(items.every(q=>!q.choiceCount||q.choiceCount<=3),
      'Level 2 must not offer four answers');

    assert.deepEqual(errors.filter(e=>e.startsWith(width+'px: ')),[],
      'Uncaught browser error at '+width+'px');
    await context.close();
  }
  console.log('PASS regular learner choices on 1366, 1024 and 390px: 2/3/4 options, feedback, history and round completion');
}finally{
  await browser.close();
}
