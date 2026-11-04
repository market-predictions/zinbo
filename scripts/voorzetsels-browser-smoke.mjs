import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';

const url=pathToFileURL(resolve('public/voorzetsels-test.html')).href;
const browser=await chromium.launch({headless:true});
const errors=[];
try{
  for(const [width,height] of [[1366,768],[1024,768],[390,844]]){
    const context=await browser.newContext({viewport:{width,height}});
    const page=await context.newPage();
    page.on('pageerror',error=>errors.push(width+': '+error.message));
    await page.goto(url,{waitUntil:'load'});
    assert.equal(await page.locator('h1').innerText(),'Welk woord past bij het plaatje?');
    assert.equal(await page.locator('.level').count(),4);
    assert.ok(await page.locator('#scene').evaluate(img=>img.complete&&img.naturalWidth>=1000),
      'Existing WebP should load at '+width+'px');
    const levels=width===1366?[1,2,3,4]:[2];
    for(const level of levels){
      await page.locator('.level[data-level="'+level+'"]').click();
      assert.equal(await page.locator('.level[aria-pressed="true"]').count(),1);
      assert.equal(await page.locator('.choice').count(),level===1?2:3);
      for(let i=0;i<5;i++){
        const q=await page.evaluate(()=>state.round[state.index]);
        assert.equal(q.level,level,'Wrong level in generated round');
        assert.ok(await page.locator('#scene').evaluate(img=>img.complete&&img.naturalWidth>=1000),'Missing picture '+q.id);
        if(i===0){
          const wrong=q.choices.find(x=>x!==q.answer);
          await page.getByRole('button',{name:wrong,exact:true}).click();
          await page.locator('#check').click();
          assert.ok((await page.locator('#feedback').innerText()).includes('Probeer het nog eens.'),'Expected corrective hint');
        }
        await page.getByRole('button',{name:q.answer,exact:true}).click();
        assert.ok((await page.locator('#sentence').innerText()).includes(q.answer),'Blank must display choice');
        await page.locator('#check').click();
        assert.ok(await page.locator('#next').isVisible(),'Correct answer should advance');
        await page.locator('#next').click();
      }
      assert.ok(await page.locator('#end').isVisible(),'Round end should appear');
      assert.ok(await page.locator('#practice').isHidden(),'Exercise must be hidden at end');
      const result=await page.locator('#result').innerText();
      assert.ok(result.includes('4 van de 5'),'Assisted response must not count independently');
      await page.locator('#again').click();
      assert.equal(await page.locator('#progressText').innerText(),'Oefening 1 van 5');
    }
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert.ok(overflow<=2,'Horizontal overflow at '+width+': '+overflow);
    assert.equal(await page.evaluate(()=>localStorage.length),0,'Isolated test may not touch production browser storage');
    await context.close();
  }
  assert.deepEqual(errors,[],'Uncaught JavaScript errors in trial');
  console.log('PASS Voorzetsels Chromium: four levels, reused images, five-item rounds, feedback, audio path, focus and mobile layout.');
}finally{
  await browser.close();
}
