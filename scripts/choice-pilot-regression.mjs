#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

const read=async p=>JSON.parse(await readFile(new URL('../'+p,import.meta.url),'utf8'));
const pilot=await read('src/content/choice_pilot.json');
const adv=await read('src/content/advanced.json');
const v43=await read('src/content/v43_candidates.json');
const raw=await readFile(new URL('../src/app/runtime.js',import.meta.url),'utf8');
const start=raw.indexOf('  const CHOICE_VARIANTS_APPROVED=');
const end=raw.indexOf('  // V4.1 adaptive selection:',start);
assert.ok(start>=0&&end>start,'Pilot selector must be isolated from released selection');
const sourceMap=new Map([...Object.values(adv).flat(),...Object.values(v43).flat()].map(q=>[q.id,q]));
const simulated={
  CHOICE_PILOT_PREVIEW:true,
  CHOICE_PILOT:pilot,
  ADVANCED:{past:[...adv.past,...v43.past],strong:[...adv.strong,...v43.strong]},
};
const selector=runInNewContext(raw.slice(start,end)+'\n({choicePilotItem,choicePilotItems})',simulated);
assert.equal(pilot.items.length,16,'Small reviewable pilot set (16 items)');
assert.equal(new Set(pilot.items.map(q=>q.sourceId)).size,16,'No duplicate source IDs');
const expectedIds=[
 'v43-p06-ik-past','p01','p03','p04','p05','p07','pr11','pr14',
 'pr16','sv01','sv02','sv04','sv08','sv11','sv14','sv16'
];
assert.deepEqual(pilot.items.map(q=>q.sourceId),expectedIds,'Fixed, source-linked pilot inventory');
for(const entry of pilot.items){
  const base=sourceMap.get(entry.sourceId);
  assert.ok(base,'Unknown canonical source '+entry.sourceId);
  assert.ok(['tense','strong'].includes(base.kind),'Only finite-verb selection');
  assert.equal(base.choices.length,2);
  const err=base.choices.find(v=>v!==base.ending);
  for(const count of [2,3,4]){
    const q=selector.choicePilotItem(entry,count);
    assert.equal(q.id,base.id,'Source ID must not change');
    assert.equal(q.full,base.full,'Approved sentence must not change');
    assert.deepEqual(Array.from(q.choices).slice(0,2),base.choices,'Canonical choices remain intact');
    assert.equal(q.choices.length,count);
    assert.equal(new Set(q.choices).size,count);
    assert.equal(q.choices.filter(v=>v===q.ending).length,1);
    assert.equal(q.pilotGoal,count===2?'time':'combined');
    assert.equal(q.pilotErrorTypes[err],'time');
    if(count>=3)assert.equal(q.pilotErrorTypes[entry.extra[0].form],'agreement');
    if(count===4)assert.equal(q.pilotErrorTypes[entry.extra[1].form],'time-and-agreement');
  }
}
for(const first of expectedIds){
  const round=selector.choicePilotItems(4,first);
  assert.equal(round.length,5,'Five unique trial sentences');
  assert.equal(new Set(round.map(q=>q.id)).size,5);
  assert.equal(round[0].id,first);
}
simulated.CHOICE_PILOT_PREVIEW=false;
assert.deepEqual(Array.from(selector.choicePilotItems(4,expectedIds[0])),[],
  'Pilot bank must remain closed without explicit URL opt-in');
assert.equal(selector.choicePilotItem(pilot.items[0],4),null,'No direct activation without opt-in');
const html=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
assert.ok(html.includes("get('choice-pilot')==='1'"),'Explicit preview URL guard required');
assert.ok(html.includes('if(isChoicePilot()){ /* Candidate trial: never update SAVE_KEY or pilot evidence. */ }'),
  'Trial success must not enter released learner evidence');
assert.ok(html.includes('||isChoicePilot();'), 'Trial must use no-star author completion path');
assert.ok(html.includes('function choicePilotCard(){'),'Review entry required');
assert.ok(!html.includes('choicePilotItems(n,firstId);saveLearning()'),'Trial must never write learning data');
console.log('PASS Choice pilot: 16 source-linked, isolated candidates; 2/3/4 unique options; review gate and no learner evidence');
