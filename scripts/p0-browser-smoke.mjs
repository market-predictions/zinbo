import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

// Browser smoke runs only in GitHub CI, not in the child-facing app.
const html = await readFile(resolve('public/index.html'),'utf8');
const adv=JSON.parse(html.match(/const ADVANCED = (\{[\s\S]*?\});/)[1]);
const order=JSON.parse(html.match(/const ORDER = (\[[\s\S]*?\]);/)[1]);
const morph=JSON.parse(html.match(/const MORPH = (\[[\s\S]*?\]);/)[1]);
const v43=JSON.parse(html.match(/const V43_CANDIDATES = (\{[\s\S]*?\});/)[1]);
const byId=new Map([...order,...morph,...Object.values(adv).flat(),...Object.values(v43).flat()].map(q=>[q.id,q]));
const band=q=>{
  const stage=Number.isInteger(q.stage)?q.stage:0;
  if(q.kind==='inversion'||q.kind==='strong')return stage>=2?4:stage>=1?3:2;
  if(q.kind==='tense')return stage>=2?3:stage>=1?2:1;
  return 1;
};
const url=pathToFileURL(resolve('public/index.html')).href;
const browser=await chromium.launch({headless:true});
const errors=[];
try {
  for(const [width,height] of [[1366,768],[1024,768],[390,844]]) {
    const context=await browser.newContext({viewport:{width,height}});
    const page=await context.newPage();
    page.on('pageerror',e=>errors.push(width+': '+e.message));
    await page.goto(url,{waitUntil:'load'});
    await page.locator('.op1-brand span').waitFor();
    const tagline=page.locator('.op1-brand span');
    assert.equal(await tagline.isVisible(),true,'Tagline must be visible at '+width);
    const rect=await tagline.boundingBox();
    assert.ok(rect&&rect.x>=0&&rect.x+rect.width<=width+2,
      'Tagline must remain in viewport at '+width);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
    assert.ok(overflow<=2,'Unexpected horizontal overflow at '+width+': '+overflow);
    if(width===1366) {
      const first=async level=>{
        await page.locator('[data-action="world-group"]').click();
        await page.locator('.world-parent-dialog [data-action="o4-level"][data-level="'+level+'"]').click();
        await page.locator('.parent-close').click();
        await page.locator('.op1-card[data-action="world-open"][data-world="sport"]').click();
        const label=await page.locator('.qa-item-id').innerText();
        const id=label.match(/Oefening-ID:\s*([^\s·]+)/)?.[1];
        assert.ok(id&&byId.has(id),'Unknown sport exercise: '+id);
        assert.equal(band(byId.get(id)),level,'World level '+level+' chose wrong construct: '+id);
        assert.equal(await page.locator('[data-action="speak-task"].instruction-card').isEnabled(),true,
          'Instruction replay must work when audio is on');
        const onScreen=await page.locator('.instruction-card span').innerText();
        const spoken=await page.evaluate(()=>window.__zinsbouwerTest.getAudioAudit().filter(x=>x.kind==='speech').at(-1)?.text);
        assert.equal(onScreen,spoken,'World level '+level+' text must match audio');
        return byId.get(id);
      };
      const easy=await first(1);
      await page.locator('[data-action="home"]').first().click();
      const hard=await first(4);
      assert.notEqual(easy.id,hard.id,'Different levels must choose different content');
      // Level 4 contains both sentence-order and strong-verb exercises.
      // Validate the real interaction for whichever suitable item was chosen.
      if(hard.tiles?.length){
        for(const tile of [...hard.solutions[0]].reverse())
          await page.locator('[data-action="tile"][data-id="'+tile+'"]').click();
      } else {
        const wrong=hard.choices.find(v=>v!==hard.ending);
        assert.ok(wrong,'Expected a distractor');
        await page.locator('[data-action="ending"][data-ending="'+wrong+'"]').click();
      }
      await page.locator('[data-action="check"]').click();
      if(!hard.tiles?.length){
        const wrong=hard.choices.find(v=>v!==hard.ending);
        await page.locator('[data-action="ending"][data-ending="'+wrong+'"]').click();
      }
      await page.locator('[data-action="check"]').click();
      await page.locator('[data-action="answer"]').click();
      if(hard.tiles?.length)
        assert.equal(await page.locator('.slot.filled').count(),0,'Reveal should reset tiles');
      else
        assert.equal((await page.locator('[data-ending-slot]').innerText()).trim(),'?',
          'Reveal should reset the chosen verb');
      assert.equal(await page.locator('[data-action="check"]').isDisabled(),true,
        'Revealed answer must not count as completed');
      if(hard.tiles?.length){
        for(const tile of hard.solutions[0])
          await page.locator('[data-action="tile"][data-id="'+tile+'"]').click();
      } else {
        await page.locator('[data-action="ending"][data-ending="'+hard.ending+'"]').click();
      }
      await page.locator('[data-action="check"]').click();
      assert.ok((await page.locator('.feedback-text').innerText()).includes('Je hebt de zin opnieuw gemaakt'),
        'Assisted completion should not receive the independent-success message');
      // The child must read exactly the same text that the speaker reads.
      await page.locator('[data-action="home"]').first().click();
      await page.locator('#o3-pilot-picker').selectOption('o3-omdat-01');
      await page.locator('[data-action="o3-pilot-open"]').click();
      const visible=await page.locator('.instruction-card span').innerText();
      const spoken=await page.evaluate(()=>window.__zinsbouwerTest.getAudioAudit().filter(x=>x.kind==='speech').at(-1)?.text);
      assert.equal(visible,spoken,'O3 screen and audio instruction must be identical');
      assert.equal(visible,'Je bent blij en je zingt. Maak met de blokjes één zin met omdat.');
      await page.locator('.instruction-card').click();
      const repeated=await page.evaluate(()=>window.__zinsbouwerTest.getAudioAudit().filter(x=>x.kind==='speech').at(-1)?.text);
      assert.equal(repeated,visible,'Audio replay must repeat the visible instruction');

      await page.locator('[data-action="home"]').first().click();
      await page.locator('#vtt-pilot-picker').selectOption('vtt-001');
      await page.locator('[data-action="vtt-pilot-open"]').click();
      const vttVisible=await page.locator('.instruction-card span').innerText();
      const vttSpoken=await page.evaluate(()=>window.__zinsbouwerTest.getAudioAudit().filter(x=>x.kind==='speech').at(-1)?.text);
      assert.equal(vttVisible,vttSpoken,'VTT text must match audio');

      // Reward prototype is a QA extension of the REAL O3 exercise; no learning points.
      await page.locator('[data-action="home"]').first().click();
      await page.locator('[data-action="reward-preview-open"]').click();
      assert.equal((await page.evaluate(()=>window.__zinsbouwerTest.getRewardPreview())).active,true);
      // QA: disable voice so the test can sample the animation deterministically.
      await page.locator('[data-action="settings"]').first().click();
      await page.locator('[data-action="sound"]').click();
      await page.locator('[data-action="settings"]').first().click();
      assert.equal((await page.evaluate(()=>window.__zinsbouwerTest.getState())).audioOn,false);
      assert.equal(await page.locator('.reward-preview-total').count(),1);
      for(let turn=0;turn<5;turn++){
        await page.locator('[data-action="reward-demo-complete"]').click();
        if(turn===0){
          await page.locator('.reward-flying-coin').waitFor({state:'visible'});
          const opening=await page.locator('.reward-flying-coin').boundingBox();
          assert.ok(opening&&opening.y>=46&&opening.y+opening.height<=height-12,'Coin starts outside viewport');
          assert.equal((await page.locator('.reward-vault-number').innerText()).trim(),'0','Do not show gain before landing');
          await page.waitForTimeout(850);
          const travelling=await page.locator('.reward-flying-coin').boundingBox();
          assert.ok(travelling&&travelling.x>=4&&travelling.x+travelling.width<=width+4
            &&travelling.y>=46&&travelling.y+travelling.height<=height+4,'Coin escapes viewport mid-flight');
          await page.locator('.reward-flying-coin').waitFor({state:'detached',timeout:6500});
          assert.equal((await page.locator('.reward-vault-number').innerText()).trim(),'2','Coin should land and count');
          assert.equal(await page.locator('.reward-vault-received').count(),1,'Chest must react to landing');
        }
        assert.equal(await page.locator('.reward-preview-feedback').count(),1,'Missing success reaction');
        const s=await page.evaluate(()=>window.__zinsbouwerTest.getRewardPreview());
        assert.equal(s.coins,(turn+1)*2,'Demo coins should track 5 independent successes');
        await page.locator('[data-action="next"]').click();
      }
      assert.equal(await page.locator('.reward-preview-end').count(),1,'No chest after five sentences');
      await page.locator('[data-action="reward-chest-open"]').click();
      assert.equal(await page.locator('.reward-preview-found').count(),1,'Chest prize not revealed');
      assert.equal((await page.evaluate(()=>window.__zinsbouwerTest.getRewardPreview())).chestOpen,true);
      await page.locator('[data-action="home"]').first().click();
      assert.equal((await page.evaluate(()=>window.__zinsbouwerTest.getRewardPreview())).active,false);

    }
    if(width===390){
      // A full-size coin must also stay within mobile bounds with motion enabled.
      await page.locator('[data-action="reward-preview-open"]').click();
      await page.locator('[data-action="settings"]').first().click();
      await page.locator('[data-action="sound"]').click();
      await page.locator('[data-action="settings"]').first().click();
      await page.locator('[data-action="reward-demo-complete"]').click();
      await page.locator('.reward-flying-coin').waitFor({state:'visible'});
      await page.waitForTimeout(900);
      const mobileCoin=await page.locator('.reward-flying-coin').boundingBox();
      assert.ok(mobileCoin&&mobileCoin.x>=4&&mobileCoin.x+mobileCoin.width<=width+4
        &&mobileCoin.y>=70&&mobileCoin.y+mobileCoin.height<=height+4,'Mobile coin leaves screen');
      await page.locator('.reward-flying-coin').waitFor({state:'detached',timeout:6500});
      await page.locator('[data-action="home"]').first().click();
      // Reduced-motion still shows the earned reward; no flying decoration.
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.locator('[data-action="reward-preview-open"]').click();
      await page.locator('[data-action="reward-demo-complete"]').click();
      assert.equal(await page.locator('.reward-preview-feedback').count(),1,'Mobile visual reward missing');
      assert.equal(await page.locator('.reward-flying-coin').count(),0,'Reduced-motion coin should not fly');
      assert.equal((await page.locator('.reward-vault-number').innerText()).trim(),'2',
        'Reduced motion must still award and show 2 coins');
      const card=await page.locator('.reward-preview-feedback').boundingBox();
      assert.ok(card&&card.x>=-2&&card.x+card.width<=width+2,'Mobile reward card clipped');
      const scrollOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
      assert.ok(scrollOverflow<=2,'Reward visual horizontal overflow at 390: '+scrollOverflow);
    }
    await context.close();
  }
  assert.deepEqual(errors,[],'No uncaught JS errors in Chromium');
  console.log('PASS Chromium smoke: 1366/1024/390, levels, audio, assisted answer, reward flow, mobile reduced motion');
} finally { await browser.close(); }
