#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Script, runInNewContext } from 'node:vm';

const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');

// Compile embedded JavaScript: catch unterminated templates, malformed regexes
// and accidental source-segment corruption before publication.
let scripts = 0;
for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  if (/\btype\s*=\s*["'](?:application\/json|text\/plain)["']/i.test(match[1])) continue;
  if (match[2].trim()) { new Script(match[2], { filename: 'zinbo-inline-' + scripts + '.js' }); scripts++; }
}
assert.ok(scripts > 0, 'Expected at least one embedded JS program');

// Test actual application formatter rather than reimplementing its logic.
const begin = html.indexOf('  function caps(s){');
const end = html.indexOf('  function item(){', begin);
assert.ok(begin >= 0 && end > begin, 'Missing tile formatting functions');
const formatTile = runInNewContext(html.slice(begin,end) + '\ntileText');
for (const [input,first,expected] of [
  ['De kinderen',false,'de kinderen'],
  ['De kinderen',true,'De kinderen'],
  ['De hond',false,'de hond'],
  ['Oma',false,'oma'],
  ['Ik',false,'ik'],
  ['Wij',false,'wij'],
  ['Vandaag',false,'vandaag'],
  ['Sam',false,'Sam'],
  ['Sara',true,'Sara'],
]) assert.equal(formatTile(input,first),expected, `Tile casing: ${input}, first=${first}`);
assert.ok(html.includes('tileText(tile.text,i===0)'), 'Visible slot must use normalized casing');
assert.ok(html.includes('tileText(t.text)'), 'Unplaced tile must not reveal sentence position');

const matched = html.match(/const O3_PILOT = (\[[\s\S]*?\]);/);
assert.ok(matched, 'O3 author items missing');
const o3 = JSON.parse(matched[1]);
const modal = new Set(['o3-omdat-05','o3-omdat-06','o3-omdat-08','o3-omdat-09','o3-omdat-10','o3-omdat-11']);
assert.equal(o3.filter(x=>modal.has(x.id)).length, 6);
for (const q of o3.filter(x=>modal.has(x.id))) {
  const sentences = q.solutions.map(sol=>sol.map(id=>q.tiles.find(t=>t.id===id)?.text).join(' '));
  assert.ok(sentences.every(sentence => !sentence.includes('zien iets wil') && !sentence.includes('vragen iets wil')), q.id);
  if (['05','06','08','09'].some(suffix=>q.id.endsWith(suffix))) {
    assert.equal(sentences.length,2, q.id+' must accept both modal cluster orders');
    assert.ok(sentences.some(sentence=>/wil (lezen|bewegen|spelen)$/.test(sentence)),q.id);
    assert.ok(sentences.some(sentence=>/(lezen|bewegen|spelen) wil$/.test(sentence)),q.id);
  } else {
    assert.equal(sentences.length,1,q.id+' must keep object before verb group');
    assert.ok(sentences[0].endsWith('iets wil zien')||sentences[0].endsWith('iets wil vragen'),q.id);
  }
}
assert.ok(!html.includes('Premium illustratie bij '), 'Leaked internal image-review label');
assert.ok(!html.includes('Kijk naar Ik.'), 'Awkward pronoun hint');
assert.ok(html.includes('data-action="speak-task" ${state.audioOn?\'\':\'disabled\'} aria-label="Herhaal de opdracht"'),
  'Instruction audio must be enabled when sound is on');

const answerStart=html.indexOf('  function showAnswer(){');
const answerEnd=html.indexOf('  function next(){',answerStart);
assert.ok(answerStart>=0&&answerEnd>answerStart, 'Answer-reveal handler missing');
const handler=html.slice(answerStart,answerEnd);
assert.ok(!handler.includes('finishItem()'), 'Reveal must never complete item automatically');
assert.ok(handler.includes('state.answerRevealed=true'), 'Reveal must not count as independent');
assert.ok(handler.includes('Maak het nu zelf opnieuw.'), 'Rebuild instruction must appear');
assert.ok(html.includes("state.answerRevealed?'Je hebt de zin opnieuw gemaakt.':'Goed!'"), 'Neutral assisted completion expected');

const candidateMatch = html.match(/const V43_CANDIDATES = (\\{[\\s\\S]*?\\});/);
assert.ok(candidateMatch, 'V4.3 exercise candidate bank missing');
const candidateBank = JSON.parse(candidateMatch[1]);
const expectedPastForms = {
  'v43-p01':'aaide', 'v43-p03':'voetbalde', 'v43-p04':'kookte',
  'v43-d1-01':'leende', 'v43-d1-02':'zwom', 'v43-d1-03':'zong',
  'v43-d1-04':'klom', 'v43-d1-05':'kocht', 'v43-d1-06':'bekeek'
};
const expectedStrongPastForms = { 'v43-p02':'liep', 'v43-p06':'keek' };
const thirdPresent = {
  'v43-p01':'aait', 'v43-p03':'voetbalt', 'v43-p04':'kookt',
  'v43-p02':'loopt', 'v43-p06':'kijkt'
};
let verifiedContrasts=0;
for (const [skill,mapping] of [['past',expectedPastForms],['strong',expectedStrongPastForms]]) {
  for (const q of candidateBank[skill]) {
    const family=Object.keys(mapping).find(key=>q.id.startsWith(key+'-'));
    if (!family) continue;
    if (q.when==='Nu') {
      assert.deepEqual(q.choices,[q.ending,mapping[family]],q.id+' must test tense, not person');
      verifiedContrasts++;
    } else if (q.when==='Gisteren' && q.id.includes('-and-past') && thirdPresent[family]) {
      assert.deepEqual(q.choices,[thirdPresent[family],q.ending],q.id+' distractor must agree with subject');
      verifiedContrasts++;
    }
  }
}
assert.equal(verifiedContrasts,27,'All 27 candidate contrast corrections covered');

console.log(`PASS P0 regression: ${scripts} JS program(s), 6 modal items, 27 distractor repairs, casing, audio, help and text labels`);
