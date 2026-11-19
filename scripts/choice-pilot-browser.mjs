#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';

const adv=JSON.parse(await readFile(resolve('src/content/advanced.json'),'utf8'));
const v43=JSON.parse(await readFile(resolve('src/content/v43_candidates.json'),'utf8'));
const pilot=JSON.parse(await readFile(resolve('src/content/choice_pilot.json'),'utf8'));
const all=new Map([...Object.values(adv).flat(),...Object.values(v43).flat()].map(q=>[q.id,q]));
const baseURL=pathToFileURL(resolve('public/index.html')).href;
const url=baseURL+'?choice-pilot=1';
const saveKey='zinsbouwer-qa-360-feedback-20261019';
await mkdir(resolve('artifacts/choice-pilot'),{recursive:true});
const browser=await chromium.launch({headless:true});
try {
  for(const [width,height] of [[1366,768],[1024,768],[390,844]]){
    const context=await browser.newContext({viewport:{width,height}});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    // Normal learner never sees candidate choices.
    await page.goto(baseURL,{waitUntil:'load'});
    assert.equal(await page.locator('.zb-choice-pilot-card').count(),0,
      'Candidate launcher must not appear without the explicit opt-in');
    await page.goto(url,{waitUntil:'load'});
    assert.equal(await page.locator('.zb-choice-pilot-card').count(),1);
    assert.equal(await page.locator('#choice-pilot-first option').count(),16);
    const storedBefore=await page.evaluate(key=>localStorage.getItem(key),saveKey);
    const first=pilot.items[0].sourceId;
    for(const count of [2,3,4]){
      await page.locator('#choice-pilot-first').selectOption(first);
      await page.locator('[data-action="start-choice-pilot"][data-count="'+count+'"]').click();
      assert.equal(await page.locator('.zb-choice-pilot-label').count(),1);
      assert.equal(await page.locator('.choice-row .ending').count(),count);
      assert.equal(await page.locator('.choice-row.zb-choice-grid').count(),1);
      const form=await page.evaluate(()=>window.__zinsbouwerTest.getCurrentId());
      assert.equal(form,first,'The preview must use the reviewed source ID');
      const correct=all.get(form).ending;
      const displayed=await page.locator('.choice-row .ending').allTextContents();
      assert.equal(new Set(displayed).size,count,'All offered forms must be unique');
      assert.ok(displayed.includes(correct),'Correct form must always be selectable');
      assert.equal(await page.locator('.choice-row').evaluate(el=>getComputedStyle(el).display),'grid');
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
      assert.ok(overflow<=2,width+'px: choice grid overflows viewport by '+overflow);
      await page.screenshot({path:resolve('artifacts/choice-pilot/'+width+'px-'+count+'-options.png'),fullPage:true});
      if(count===4&&width===1366){
        // Wrong tense versus wrong agreement must produce *different* hints,
        // without treating an isolated error as a learner diagnosis.
        const wrongTime=all.get(form).choices.find(v=>v!==correct);
        await page.locator('[data-action="ending"][data-ending="'+wrongTime+'"]').click();
        await page.locator('[data-action="check"]').click();
        assert.match(await page.locator('.feedback-text').innerText(),/wanneer het gebeurt/);
        const wrongAgreement=pilot.items[0].extra[0].form;
        await page.locator('[data-action="ending"][data-ending="'+wrongAgreement+'"]').click();
        await page.locator('[data-action="check"]').click();
        assert.equal(await page.locator('[data-action="answer"]').count(),1);
        assert.match(await page.locator('.feedback-text').innerText(),/Laat zien/);
        await page.locator('[data-action="answer"]').click();
        assert.equal((await page.locator('[data-ending-slot]').innerText()).trim(),'?',
          'Reveal must require the child to choose again');
      }
      // Completed rounds are deliberately excluded from normal persistent history
      // and from the spendable star economy.
      const toComplete=(count===4&&width===1366)?5:1;
      for(let i=0;i<toComplete;i++){
        const id=await page.evaluate(()=>window.__zinsbouwerTest.getCurrentId());
        const q=all.get(id);
        await page.locator('[data-action="ending"][data-ending="'+q.ending+'"]').click();
        await page.locator('[data-action="check"]').click();
        assert.equal(await page.locator('.feedback.good').count(),1,
          'The original answer validator must accept the canonical form');
        await page.locator('[data-action="next"]').click();
      }
      if(toComplete===5){
        assert.equal(await page.locator('.zb-choice-pilot-end').count(),1);
        assert.match(await page.locator('.zb-choice-pilot-end').innerText(),/geen sterren of leerlingresultaten opgeslagen/);
      }else{
        await page.locator('[data-action="home"]').first().click();
      }
      assert.equal(await page.evaluate(key=>localStorage.getItem(key),saveKey),storedBefore,
        'Experimental answers must not change ordinary learner progress or stars');
      if(toComplete===5)await page.locator('.zb-choice-pilot-end [data-action="home"]').click();
    }
    assert.deepEqual(errors,[],width+'px runtime errors');
    await context.close();
  }
  console.log('PASS Choice pilot browser: 2/3/4 options at 1366, 1024, 390px; feedback, 5-item round, storage unchanged');
}finally{
  await browser.close();
}
