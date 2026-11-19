#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
const read=async name=>readFile(new URL('../'+name,import.meta.url),'utf8');
const bank=JSON.parse(await read('src/content/choice_pilot.json'));
const advanced=JSON.parse(await read('src/content/advanced.json'));
const v43=JSON.parse(await read('src/content/v43_candidates.json'));
const runtime=await read('src/app/runtime.js');
const worlds=await read('src/app/worlds.js');
const build=await read('scripts/build.mjs');
const canonical=new Map([...Object.values(advanced).flat(),...Object.values(v43).flat()].map(q=>[q.id,q]));
assert.equal(bank.schema,'zinbo.choice-variation-pilot.v1');
assert.equal(bank.releaseStatus,'owner-attested-approved');
assert.equal(bank.approval?.date,'2026-11-19');
assert.equal(bank.approval?.pr,17);
assert.equal(bank.approval?.logopedistApprovedAsReportedByOwner,true);
assert.equal(bank.approval?.independentReportProvided,false);
assert.equal(bank.items.length,16);
assert.ok(bank.items.every(q=>q.reviewStatus==='owner-attested-approved'));
assert.ok(build.includes("choicePilot.releaseStatus!=='owner-attested-approved'"));
assert.ok(build.includes("candidate.reviewStatus!=='owner-attested-approved'"));
const start=runtime.indexOf('  const CHOICE_VARIANTS_APPROVED=');
const end=runtime.indexOf('  // V4.1 adaptive selection:',start);
assert.ok(start>0&&end>start,'Released choice selection helper not found');
const sandbox={
  CHOICE_PILOT:bank,CHOICE_PILOT_PREVIEW:false,
  ADVANCED:{past:[...advanced.past,...v43.past],strong:[...advanced.strong,...v43.strong]},
  state:{challengeFloor:0},o4Data:{level:null},skillStage:()=>0
};
const api=runInNewContext(runtime.slice(start,end)+
  '\n({releaseVerbChoices,releasedChoiceCount,adaptiveChoiceLevel,releaseAdaptiveVerbChoices,choicePilotItems})',sandbox);
const stats={1:{},2:{},3:{},4:{}};
for(const candidate of bank.items){
  const q=canonical.get(candidate.sourceId);
  assert.ok(q,'Unknown original ID: '+candidate.sourceId);
  assert.ok(['strong','tense'].includes(q.kind));
  const original=JSON.stringify(q),originalForms=JSON.stringify(q.choices);
  for(const level of [1,2,3,4]){
    const derived=api.releaseVerbChoices(q,level);
    const expected=level===1?2:level===2?(q.stage>=1?3:2):level===3?(q.stage>=2?4:3):4;
    assert.equal(derived.choices.length,expected,candidate.sourceId+' level '+level);
    assert.equal(derived.choices.filter(f=>f===q.ending).length,1,'Only one correct form');
    assert.equal(new Set(derived.choices).size,expected,'Never offer duplicate forms');
    assert.equal(JSON.stringify(derived.choices.slice(0,2)),originalForms,'Preserve original choices');
    assert.equal(derived.id,q.id,'Stable item ID');
    assert.equal(derived.full,q.full,'Approved sentence unchanged');
    assert.equal(derived.art,q.art,'Approved artwork unchanged');
    if(expected>2){
      assert.equal(derived.choiceGoal,'combined');
      assert.equal(derived.choiceCount,expected);
      assert.equal(derived.choiceErrorTypes[candidate.extra[0].form],'agreement');
      if(expected===4)
        assert.equal(derived.choiceErrorTypes[candidate.extra[1].form],'time-and-agreement');
    }else assert.equal(derived,q,'Original reference should be reused at two choices');
    stats[level][expected]=(stats[level][expected]||0)+1;
  }
  assert.equal(JSON.stringify(q),original,'Canonical content may not be mutated');
}
const unrelated=canonical.get('p02');
assert.ok(unrelated,'Unrelated released source exists');
assert.equal(api.releaseVerbChoices(unrelated,4),unrelated,
  'Unlisted source must never be decorated');
assert.equal(api.adaptiveChoiceLevel('past'),1,'Untrained automatic learner remains at baseline');
sandbox.state.challengeFloor=2;
assert.equal(api.adaptiveChoiceLevel('past'),4,'Explicit advanced challenge can choose four options');
sandbox.state.challengeFloor=0;
sandbox.o4Data.level=2;
assert.equal(api.adaptiveChoiceLevel('past'),2,'Manual level overrides adaptive presentation');
sandbox.o4Data.level=4;
assert.equal(api.releaseAdaptiveVerbChoices(canonical.get('sv02'),'strong').choices.length,4);
sandbox.CHOICE_PILOT_PREVIEW=false;
assert.equal(api.choicePilotItems(4).length,0,'Adult comparison remains URL-gated');
assert.match(runtime,/selectWorldItems\(id\)\.map\(q=>releaseVerbChoices\(q,targetLevel\)\)/,
  'Normal worlds must use released presentation');
assert.match(runtime,/releaseAdaptiveVerbChoices\(pickAdaptiveItem\(skill\),skill\)/,
  'Normal adaptive first question must use released presentation');
assert.match(worlds,/releaseAdaptiveVerbChoices\(/,
  'Normal adaptive next questions must use released presentation');
assert.match(worlds,/q\.choiceGoal==='combined'/,
  'Combined goal must be announced and hinted outside adult comparison');
assert.match(worlds,/q\.choiceErrorTypes\?\.\[selectedWrongAnswer\]/,
  'Released choices must have targeted error guidance');
assert.match(worlds,/isChoicePilot\(\)\|\|q\.choiceCount>2/,
  'Three/four released choices must reuse responsive tile grid');
assert.ok(!runtime.includes("const SAVE_KEY='zinsbouwer-choice"),
  'Release must not rename the existing learning storage key');
console.log('PASS release: 16 owner-attested variants; each has a single correct answer');
console.log('Per-level presentation distribution:',JSON.stringify(stats));
console.log('PASS normal worlds + adaptive practice, level override, original content unchanged');
