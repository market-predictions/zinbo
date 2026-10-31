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
    try {await page.locator('.op1-brand span').waitFor({timeout:10000});}
    catch(error){throw Error('Zinbo failed to start at '+width+'px: '+errors.join(' | ')+'; '+error.message);}
    const tagline=page.locator('.op1-brand span');
    assert.equal(await tagline.isVisible(),true,'Tagline must be visible at '+width);
    const rect=await tagline.boundingBox();
    assert.ok(rect&&rect.x>=0&&rect.x+rect.width<=width+2,
      'Tagline must remain in viewport at '+width);
    assert.equal(await page.locator('#qa-banner,.qa-chooser,.qa-item-notice').count(),0,
      'Authoring controls must not appear in learner interface');
    if(width===1366){
      const inventory=await page.evaluate(()=>{
        const api=window.__zinsbouwerTest;
        const worlds=['sport','thuis','familie','school','uitstapjes','zelf'];
        return {
          releasedV43:api.getReleasedIds(),
          worldIds:worlds.flatMap(w=>api.getWorldItemIds(w))
        };
      });
      assert.equal(new Set(inventory.releasedV43).size,180,
        'All 180 reviewed V4.3 exercises must be released');
      assert.equal(new Set(inventory.worldIds).size,389,
        'All 389 unique approved exercises must be discoverable in normal worlds');
      const family=await page.evaluate(()=>window.__zinsbouwerTest.getWorldItemIds('familie'));
      for(const dogId of ['v43-p01-ik-nu','v43-p01-and-nu','v43-p01-ik-past',
                          'v43-p01-and-past','v43-i01-past','v43-i01-present']){
        assert.ok(family.includes(dogId),'Reviewed petting-dog exercise not in learner world: '+dogId);
      }
      const school=await page.evaluate(()=>window.__zinsbouwerTest.getWorldItemIds('school'));
      const home=await page.evaluate(()=>window.__zinsbouwerTest.getWorldItemIds('thuis'));
      assert.ok(school.some(id=>id.startsWith('o3-'))||
        home.some(id=>id.startsWith('o3-')),'O3 must be available through a normal world');
      assert.ok(school.some(id=>id.startsWith('vtt-'))||
        home.some(id=>id.startsWith('vtt-')),'VTT must be available through a normal world');
    }
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
    assert.ok(overflow<=2,'Unexpected horizontal overflow at '+width+': '+overflow);


    // Four starter smileys, eight flat premium vectors; one canonical profile dialog.
    const openProfile=async()=>{
      await page.locator('.op1-star[data-action="profile-edit"]').click();
      assert.equal(await page.locator('.zinbo-avatar-tile').count(),12,
        'Four free and eight unlockable avatars must be visible');
      assert.equal(await page.locator('.zinbo-profile-dialog[role="dialog"]').count(),1);
      assert.equal(await page.locator('.zinbo-avatar-grid').count(),2);
    };
    await openProfile();
    const prefBefore=await page.evaluate(()=>window.__zinsbouwerTest.getPreferences());
    await page.locator('#zinbo-profile-name').fill('Niet opslaan');
    await page.locator('[data-action="profile-avatar"][data-avatar="smile-wink"]').click();
    await page.locator('[data-action="profile-cancel"]').last().click();
    assert.equal((await page.evaluate(()=>window.__zinsbouwerTest.getPreferences())).displayName,
      prefBefore.displayName,'Cancel must not save the nickname');
    await openProfile();
    await page.locator('#zinbo-profile-name').fill('Sam');
    await page.locator('[data-action="profile-avatar"][data-avatar="smile-cool"]').click();
    await page.locator('[data-action="profile-avatar-choose"]').click();
    await page.locator('[data-action="profile-save"]').click();
    assert.equal((await page.locator('.op1-profile-name').innerText()).trim(),'Sam');
    assert.equal(await page.locator('.op1-profile-avatar svg[data-avatar-id="smile-cool"]').count(),1);
    let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('zinsbouwer-qa-360-feedback-20261019')));
    assert.equal(saved.preferences.displayName,'Sam');
    assert.equal(saved.preferences.avatarId,'smile-cool');
    await page.reload({waitUntil:'load'});
    assert.equal((await page.locator('.op1-profile-name').innerText()).trim(),'Sam');
    assert.equal(await page.locator('.op1-profile-avatar svg[data-avatar-id="smile-cool"]').count(),1,
      'Selected avatar must survive reload');
    if(width===1366){
      // A previous release's vector-avatar ID must never be lost.
      await page.evaluate(()=>{
        const key='zinsbouwer-qa-360-feedback-20261019';
        const o=JSON.parse(localStorage.getItem(key));
        o.preferences.avatarId='obj-rocket';
        o.stars=10;
        localStorage.setItem(key,JSON.stringify(o));
      });
      await page.reload({waitUntil:'load'});
      assert.equal(await page.locator('svg[data-avatar-id="obj-rocket"]').count(),1);
      await openProfile();
      assert.equal(await page.locator('.zinbo-avatar-tile[data-avatar="obj-rocket"]').count(),1,
        'Older chosen avatars remain owned');
      await page.locator('[data-action="profile-avatar"][data-avatar="premium-explorer"]').click();
      assert.equal(await page.locator('[data-action="profile-avatar-buy"]').count(),1);
      await page.locator('[data-action="profile-avatar-buy"]').click();
      assert.equal(await page.locator('[data-action="profile-avatar-confirm"]').count(),1);
      await page.locator('[data-action="profile-avatar-confirm"]').click();
      saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('zinsbouwer-qa-360-feedback-20261019')));
      assert.equal(saved.stars,5,'Buying a premium avatar costs exactly five stars');
      assert.ok(saved.unlockedAvatarIds.includes('premium-explorer'));
      assert.ok(saved.unlockedAvatarIds.includes('obj-rocket'),'Historical avatar remains available');
      assert.equal(saved.preferences.avatarId,'premium-explorer');
      await page.locator('[data-action="profile-save"]').click();
      await page.reload({waitUntil:'load'});
      assert.equal(await page.locator('.op1-profile-avatar svg[data-avatar-id="premium-explorer"]').count(),1);
      await openProfile();
      await page.locator('[data-action="profile-avatar"][data-avatar="premium-explorer"]').click();
      assert.equal(await page.locator('[data-action="profile-avatar-confirm"]').count(),0,'Ownership must be idempotent');
      await page.locator('#zinbo-profile-name').fill('Ada < Zoe');
      await page.locator('[data-action="profile-save"]').click();
      assert.equal((await page.locator('.op1-profile-name').innerText()).trim(),'Ada < Zoe');
      assert.equal(await page.locator('.op1-profile-name img').count(),0,'Name must be escaped');
      const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('zinsbouwer-qa-360-feedback-20261019')));
      assert.equal(after.stars,5);
      assert.deepEqual(after.skills,saved.skills,'Avatar actions must not modify learning evidence');
    }
    if(width===390){
      await openProfile();
      const bounds=await page.locator('.zinbo-profile-dialog').boundingBox();
      assert.ok(bounds&&bounds.x>=-2&&bounds.x+bounds.width<=width+2,
        'Avatar library must fit narrow viewport');
      await page.locator('#zinbo-profile-name').fill('Youssef');
      await page.locator('[data-action="profile-avatar"][data-avatar="smile-wink"]').click();
      assert.equal(await page.locator('#zinbo-profile-name').inputValue(),'Youssef',
        'Avatar preview must retain uncommitted name');
      await page.locator('[data-action="profile-avatar-choose"]').click();
      await page.locator('[data-action="profile-save"]').click();
      assert.equal((await page.locator('.op1-profile-name').innerText()).trim(),'Youssef');
      const profileOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
      assert.ok(profileOverflow<=2,'Customized header must not overflow mobile');
    }

    // Normal learning worlds use the chest reward, not only the author demo.
    await page.locator('.op1-card[data-action="world-open"][data-world="sport"]').click();
    const worldState=await page.evaluate(()=>window.__zinsbouwerTest.getState());
    assert.equal(worldState.rewardPreview,true,'Regular learner world should get chest rewards');
    await page.locator('[data-action="settings"]').first().click();
    await page.locator('[data-action="sound"]').click();
    await page.locator('[data-action="settings"]').first().click();

    const balancesBefore=await page.evaluate(()=>{
      const o=JSON.parse(localStorage.getItem('zinsbouwer-qa-360-feedback-20261019'));
      return {stars:o.stars,coins:o.rewardCoins};
    });
    for(let i=0;i<5;i++){
      const q=await page.evaluate(()=>window.__zinsbouwerTest.getCurrent());
      if(q.tiles){
        for(const id of q.solutions[0])
          await page.locator('[data-action="tile"][data-id="'+id+'"]').click();
      }else{
        await page.locator('[data-action="ending"][data-ending="'+q.ending+'"]').click();
      }
      await page.locator('[data-action="check"]').click();
      assert.equal(await page.locator('.reward-preview-feedback').count(),1,'World lacks feedback');
      const earned=await page.evaluate(()=>window.__zinsbouwerTest.getRewardPreview());
      assert.equal(earned.coins,i+1,'Chest visually counts five completed sentences');
      assert.equal(earned.storedCoins,balancesBefore.coins,'No second spendable currency should be awarded');
      await page.locator('[data-action="next"]').click();
    }
    assert.equal(await page.locator('.reward-preview-end').count(),1,'World must end with chest');
    const balancesAfter=await page.evaluate(()=>{
      const o=JSON.parse(localStorage.getItem('zinsbouwer-qa-360-feedback-20261019'));
      return {stars:o.stars,coins:o.rewardCoins};
    });
    assert.equal(balancesAfter.stars,balancesBefore.stars+1,'Five completed exercises earn one star');
    assert.equal(balancesAfter.coins,balancesBefore.coins,'Legacy coin counter is no longer a wallet');
    await page.locator('[data-action="reward-chest-open"]').click();
    assert.equal(await page.locator('.reward-preview-found').count(),1,'World chest must open');
    await page.locator('[data-action="home"]').first().click();
    await page.reload({waitUntil:'load'});
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('zinsbouwer-qa-360-feedback-20261019')).stars),
      balancesAfter.stars,'Earned star must persist after reload');
    // Restore the starting sound preference before exercising older audio regressions.
    await page.locator('.op1-card[data-action="world-open"][data-world="sport"]').click();
    await page.locator('[data-action="settings"]').first().click();
    await page.locator('[data-action="sound"]').click();
    await page.locator('[data-action="settings"]').first().click();
    await page.locator('[data-action="home"]').first().click();


    const assertChestSilhouette=async()=>{
      const v=await page.locator('.reward-vault-chest').evaluate(chest=>{
        const lid=chest.querySelector('.reward-vault-lid').getBoundingClientRect();
        const front=chest.querySelector('.reward-vault-front').getBoundingClientRect();
        const slot=chest.querySelector('.reward-vault-slot').getBoundingClientRect();
        const parent=chest.getBoundingClientRect();
        return {gap:front.top-lid.bottom,slotHeight:slot.height,
          hasSolidBody:getComputedStyle(chest).backgroundImage!=='none',
          left:parent.left,right:parent.right};
      });
      assert.ok(v.hasSolidBody,'Mini chest should have one continuous blue body');
      assert.ok(v.gap<=5,'Mini chest lid must visibly overlap the body, not float above it: '+v.gap);
      assert.ok(v.slotHeight<=6,'Chest should show only a narrow coin opening');
      assert.ok(v.left>=0&&v.right<=width+2,'Mini chest must fit the viewport');
    };
    if(width===1366) {
      const first=async level=>{
        await page.locator('[data-action="world-group"]').click();
        await page.locator('.world-parent-dialog [data-action="o4-level"][data-level="'+level+'"]').click();
        await page.locator('.parent-close').click();
        await page.locator('.op1-card[data-action="world-open"][data-world="sport"]').click();
        const id=await page.evaluate(()=>window.__zinsbouwerTest.getCurrentId());
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
      await page.evaluate(()=>window.__zinsbouwerTest.startPilotO3Test());
      const visible=await page.locator('.instruction-card span').innerText();
      const spoken=await page.evaluate(()=>window.__zinsbouwerTest.getAudioAudit().filter(x=>x.kind==='speech').at(-1)?.text);
      assert.equal(visible,spoken,'O3 screen and audio instruction must be identical');
      assert.equal(visible,'Je bent blij en je zingt. Maak met de blokjes één zin met omdat.');
      await page.locator('.instruction-card').click();
      const repeated=await page.evaluate(()=>window.__zinsbouwerTest.getAudioAudit().filter(x=>x.kind==='speech').at(-1)?.text);
      assert.equal(repeated,visible,'Audio replay must repeat the visible instruction');

      await page.locator('[data-action="home"]').first().click();
      await page.evaluate(()=>window.__zinsbouwerTest.startPilotVTTTest());
      const vttVisible=await page.locator('.instruction-card span').innerText();
      const vttSpoken=await page.evaluate(()=>window.__zinsbouwerTest.getAudioAudit().filter(x=>x.kind==='speech').at(-1)?.text);
      assert.equal(vttVisible,vttSpoken,'VTT text must match audio');

      // Reward prototype is a QA extension of the REAL O3 exercise; no learning points.
      await page.locator('[data-action="home"]').first().click();
      await page.evaluate(()=>window.__zinsbouwerTest.startRewardTest());
      assert.equal((await page.evaluate(()=>window.__zinsbouwerTest.getRewardPreview())).active,true);
      // QA: disable voice so the test can sample the animation deterministically.
      await page.locator('[data-action="settings"]').first().click();
      await page.locator('[data-action="sound"]').click();
      await page.locator('[data-action="settings"]').first().click();
      assert.equal((await page.evaluate(()=>window.__zinsbouwerTest.getState())).audioOn,false);
      assert.equal(await page.locator('.reward-preview-total').count(),1);
      await assertChestSilhouette();
      for(let turn=0;turn<5;turn++){
        await page.locator('[data-action="reward-demo-complete"]').click();
        if(turn===0){
          await page.locator('.reward-flying-coin').waitFor({state:'visible'});
          const opening=await page.locator('.reward-flying-coin').boundingBox();
          assert.ok(opening&&opening.y>=46&&opening.y+opening.height<=height-12,'Coin starts outside viewport');
          assert.equal((await page.locator('.reward-vault-number').innerText()).trim(),'0/5','Do not show gain before landing');
          await page.waitForTimeout(850);
          const travelling=await page.locator('.reward-flying-coin').boundingBox();
          assert.ok(travelling&&travelling.x>=4&&travelling.x+travelling.width<=width+4
            &&travelling.y>=46&&travelling.y+travelling.height<=height+4,'Coin escapes viewport mid-flight');
          await page.locator('.reward-flying-coin').waitFor({state:'detached',timeout:6500});
          assert.equal((await page.locator('.reward-vault-number').innerText()).trim(),'2/5','Coin should land and count');
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
    if(width===1024){
      // Mid-size laptop: the coin must remain visible and 'Volgende' must cancel safely.
      await page.evaluate(()=>window.__zinsbouwerTest.startRewardTest());
      await assertChestSilhouette();
      await page.locator('[data-action="settings"]').first().click();
      await page.locator('[data-action="sound"]').click();
      await page.locator('[data-action="settings"]').first().click();
      await page.locator('[data-action="reward-demo-complete"]').click();
      await page.locator('.reward-flying-coin').waitFor({state:'visible'});
      await page.waitForTimeout(850);
      const midCoin=await page.locator('.reward-flying-coin').boundingBox();
      assert.ok(midCoin&&midCoin.x>=4&&midCoin.x+midCoin.width<=width+4
        &&midCoin.y>=46&&midCoin.y+midCoin.height<=height+4,'1024px coin leaves screen');
      await page.locator('[data-action="next"]').click();
      assert.equal(await page.locator('.reward-flying-coin').count(),0,'Next must clean up moving coin');
      assert.equal((await page.locator('.reward-vault-number').innerText()).trim(),'2',
        'Skipping flight must not lose coins');
    }
    if(width===390){
      // A full-size coin must also stay within mobile bounds with motion enabled.
      await page.evaluate(()=>window.__zinsbouwerTest.startRewardTest());
      await assertChestSilhouette();
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
      await page.evaluate(()=>window.__zinsbouwerTest.startRewardTest());
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
