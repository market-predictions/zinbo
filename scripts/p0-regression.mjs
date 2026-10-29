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

// Production-world wiring: unreleased author candidates must never be selectable.
const learnerStart=html.indexOf('  function releasedExtension(q){');
const learnerEnd=html.indexOf('  function worldExerciseBand(q){',learnerStart);
assert.ok(learnerStart>=0&&learnerEnd>learnerStart,'Production extension review gate missing');
const learnerCode=html.slice(learnerStart,learnerEnd);
assert.ok(learnerCode.includes('...O3_PILOT.filter(releasedExtension)'),
  'O3 content not wired to normal learner pool');
assert.ok(learnerCode.includes('...VTT_PILOT.filter(releasedExtension)'),
  'VTT content not wired to normal learner pool');
assert.ok(learnerCode.includes("q.reviewStatus,q.reviewBy,q.reviewAt,'human-approved'"),
  'Missing human review evidence gate');
assert.ok(learnerCode.includes("q.imageReviewStatus,q.imageReviewBy,q.imageReviewAt,'premium-approved'"),
  'Missing image review evidence gate');
const reviewPredicate=runInNewContext(
  learnerCode.slice(0,learnerCode.indexOf('  function learnerItems(){'))+
  '\nreleasedExtension',
  {RELEASE_REVIEW_IDS:new Set(),V43_ART:{'scene.webp':'data:image/webp;base64,valid'},
   SCENE_ART:{},EXISTING_PREMIUM_SCENES:new Set()});
const example={
  id:'approval-gate-test',art:'scene.webp',reviewStatus:'candidate',
  tiles:[{id:'subject'},{id:'verb'}],solutions:[['subject','verb']]
};
assert.equal(reviewPredicate(example),false,'Candidate reached learner route');
const complete={...example,reviewStatus:'human-approved',reviewBy:'Reviewer',
  reviewAt:'2026-10-28',imageReviewStatus:'premium-approved',
  imageReviewBy:'Image reviewer',imageReviewAt:'2026-10-28'};
assert.equal(reviewPredicate(complete),true,'Fully reviewed item must be eligible');
assert.equal(reviewPredicate({...complete,imageReviewAt:null}),false,
  'Unreviewed image reached learner route');
assert.equal(reviewPredicate({...complete,solutions:[['missing','verb']]}),false,
  'Invalid tile reference reached learner route');
const injected=html.match(/const RELEASE_REVIEW_IDS=new Set\((\[[^;]*?\])\);/);
assert.ok(injected,'Build must inject centrally reviewed content IDs');
const releaseIds=new Set(JSON.parse(injected[1]));
assert.equal(releaseIds.size,209,'Reviewed 180 V4.3 + 14 O3 + 15 VTT items');
assert.ok(releaseIds.has('o3-omdat-01')&&releaseIds.has('vtt-001'),
  'New language families must be centrally approved');
const approvedFromSnapshot=runInNewContext(
  learnerCode.slice(0,learnerCode.indexOf('  function learnerItems(){'))+
  '\nreleasedExtension',
  {RELEASE_REVIEW_IDS:new Set(['approval-gate-test']),
   V43_ART:{'scene.webp':'data:image/webp;base64,valid'},
   SCENE_ART:{},EXISTING_PREMIUM_SCENES:new Set()});
assert.equal(approvedFromSnapshot(example),true,'Central review should release unchanged content');
assert.equal(approvedFromSnapshot({...example,solutions:[['bad','verb']]}),false,
  'Central review must not bypass malformed exercise shape');

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
    assert.equal(sentences.length,2,q.id+' must accept both modal orders');
    const infinitive=q.id.endsWith('10')?'zien':'vragen';
    assert.ok(sentences.some(x=>x.endsWith('iets wil '+infinitive)),q.id);
    assert.ok(sentences.some(x=>x.endsWith('iets '+infinitive+' wil')),q.id);
  }
}
assert.ok(!html.includes('Premium illustratie bij '), 'Leaked internal image-review label');
assert.ok(!html.includes('Kijk naar Ik.'), 'Awkward pronoun hint');
assert.ok(!html.includes('De persoonsvorm komt achteraan in dat stukje.'), 'Modal-clause hint must not assert an incorrect final finite verb');
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

const candidateMatch = html.match(/const V43_CANDIDATES = (\{[\s\S]*?\});/);
assert.ok(candidateMatch, 'V4.3 exercise candidate bank missing');
const candidateBank = JSON.parse(candidateMatch[1]);
const resolutionMatch=html.match(/const V43_RESOLUTION_PASS = (\{[\s\S]*?\});/);
assert.ok(resolutionMatch,'Missing image-resolution quality map');
const resolutions=JSON.parse(resolutionMatch[1]);
assert.equal(resolutions['market-flowers.webp'],true,'1536x1024 flower image must pass');
assert.equal(resolutions['schoolyard.webp'],true,'1536x1024 schoolyard image must pass');
assert.equal(resolutions['pet-dog.webp'],true,'Reviewed replacement dog scene should pass image resolution');
const dogData = html.match(/"pet-dog\\.webp":"data:image\\/webp;base64,([A-Za-z0-9+/=]+)"/);
assert.ok(dogData,'Embedded dog image missing');
const dogBytes=Buffer.from(dogData[1],'base64');
assert.equal(dogBytes.toString('ascii',0,4),'RIFF','Dog image must be WebP');
const dogVp8=dogBytes.indexOf(Buffer.from('VP8 '));
assert.ok(dogVp8>=12,'Dog image needs a VP8 WebP frame');
const dogWidth=dogBytes.readUInt16LE(dogVp8+8+6)&0x3fff;
const dogHeight=dogBytes.readUInt16LE(dogVp8+8+8)&0x3fff;
assert.ok(dogWidth>=1536&&dogHeight>=1024,'Dog image lacks required 1536 x 1024 resolution');

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
const repairedCandidates=[...candidateBank.past,...candidateBank.strong].filter(q=>{
  const family = Object.keys({...expectedPastForms,...expectedStrongPastForms})
    .find(prefix=>q.id.startsWith(prefix+'-'));
  return family && (q.when==='Nu'||(q.when==='Gisteren'&&q.id.endsWith('-and-past')&&thirdPresent[family]));
});
assert.equal(repairedCandidates.length,27);
for(const q of repairedCandidates){
  assert.equal(q.reviewStatus,'candidate',q.id+' must be re-reviewed after alteration');
  assert.ok(!q.reviewBy&&!q.reviewAt,q.id+' must not retain a stale approval claim');
}


// Check the actual world picker on four distinct construct bands. The selected
// level is a user preference, not a clinical score or the old stage 0-2 number.
const bandStart=html.indexOf('  function worldExerciseBand(q){');
const bandEnd=html.indexOf('  function worldFamilies(items){',bandStart);
const pickerStart=html.indexOf('  function selectWorldItems(id){');
const pickerEnd=html.indexOf('  function startWorld(id){',pickerStart);
assert.ok(bandStart>=0&&bandEnd>bandStart&&pickerStart>bandEnd&&pickerEnd>pickerStart,
  'World selection functions must exist');
const samples=[1,2,3,4].flatMap(level=>Array.from({length:6},(_,i)=>{
  const kind=level===1?'order':level===2?'tense':'inversion';
  const stage=level===1?0:level===2?1:level===3?1:2;
  return {id:'sample-'+level+'-'+i,art:'scene-'+i,family:'family-'+i,kind,stage};
}));
const context={
  o4Data:{level:1}, worldItems:()=>samples, worldHistory:()=>[],
  evidenceFamily:q=>q.family, itemFamily:q=>q.family
};
const picker=runInNewContext(
  html.slice(bandStart,bandEnd)+'\n'+html.slice(pickerStart,pickerEnd)+
  '\n({worldExerciseBand,selectWorldItems})',context);
for(let level=1;level<=4;level++){
  context.o4Data.level=level;
  const picked=picker.selectWorldItems('sport');
  assert.equal(picked.length,5);
  assert.ok(picked.every(q=>picker.worldExerciseBand(q)===level),
    'Level '+level+' must select its actual grammar construct when available');
}
assert.ok(html.includes('<strong>${evidence.unique}</strong><small>verschillende oefeningen</small>'),
  'Count and progress meter must both describe distinct exercises');
assert.ok(html.includes('@media (min-width:881px) and (max-width:1450px)'),
  'Laptop header must be responsive');


const instructionStart=html.indexOf('  function taskInstruction(){');
const instructionEnd=html.indexOf('  function finishItem(){',instructionStart);
assert.ok(instructionStart>=0&&instructionEnd>instructionStart,'One shared instruction function required');
assert.ok(html.includes('const subtitle=esc(taskInstruction());'),
  'The visible instruction must use exactly the spoken instruction source');
const o3Items=JSON.parse(html.match(/const O3_PILOT = (\[[\s\S]*?\]);/)[1]);
const taskFnSource=html.slice(instructionStart,instructionEnd);
for(const q of o3Items){
  const ctx={item:()=>q,isPilotO3:()=>true,isPilotO4:()=>false,isPilotVTT:()=>false,
    state:{mode:'order'}};
  const spoken=runInNewContext(taskFnSource+'\ntaskInstruction()',ctx);
  assert.ok(spoken.startsWith(q.contextCue),q.id+' context mismatch');
  assert.ok(spoken.endsWith(q.kind==='because'?'één zin met omdat.':'één zin met als.'),q.id+' unclear action');
  assert.ok(spoken.length<=115,q.id+' instruction too long ('+spoken.length+')');
  assert.ok(!/(persoonsvorm|bijzin|omdat-deel|hulpwerkwoord)/i.test(spoken),q.id+' instruction contains jargon');
}
// The October female-voice preference was reverted after a negative listening
// test. Verify the original browser voice order and speaking rate are preserved.
const voiceStart=html.indexOf('  function speak(text, onFinished){');
const voiceEnd=html.indexOf('  function celebrateAndRead(){',voiceStart);
assert.ok(voiceStart>=0&&voiceEnd>voiceStart,'Original speech handler missing');
assert.ok(!html.includes('function chooseDutchVoice('),'Female voice override must be removed');
const spokenUtterances=[];
const availableVoices=[
  {name:'Previously used Dutch voice',lang:'nl-NL',localService:true},
  {name:'New female voice',lang:'nl-NL',localService:true},
  {name:'Another language',lang:'en-US',localService:true}];
function FakeUtterance(text){this.text=text;}
const speechContext={
  window:{speechSynthesis:{getVoices:()=>availableVoices,speak:utterance=>spokenUtterances.push(utterance)}},
  stopAudio:()=>{},state:{audioOn:true},audioAudit:[],SpeechSynthesisUtterance:FakeUtterance
};
runInNewContext(html.slice(voiceStart,voiceEnd)+'\nspeak("Goed gedaan!")',speechContext);
assert.equal(spokenUtterances.length,1);
assert.equal(spokenUtterances[0].voice.name,'Previously used Dutch voice',
  'Return to original first available Dutch voice');
assert.equal(spokenUtterances[0].rate,.85,'Restore original speech rate');

// Reward prototype must stay a non-persistent author-only UI on the real exercise.
assert.ok(html.includes("data-action=\"reward-preview-open\""),'QA reward entry missing');
assert.ok(html.includes("data-action=\"reward-demo-complete\""),'QA reward demo button missing');
assert.ok(html.includes("function rewardPreviewEnd(){"),'QA end celebration missing');
assert.ok(html.includes("state.previewCoins+=state.previewLastGain;"),'Demo reward state missing');
assert.ok(html.includes("else if(isPilotO3()){if(!isRewardPreview())recordPilotO3();}"),'Reward preview must not write author pilot results');
assert.ok(html.includes("if(!isAuthorPilot()){stars++;saveLearning();}"),'Normal independent rewards must be untouched');
assert.ok(html.includes("prefers-reduced-motion: reduce"),'Reduced-motion option missing');
assert.ok(html.includes("class=\"reward-vault-slot\""),'Visible chest landing slot missing');
assert.ok(html.includes("duration:1800"),'Coin must no longer be a 780ms flash');
assert.ok(html.includes("state.previewShownCoins=state.previewCoins"),'Displayed coins must settle only at landing or skip');
assert.ok(html.includes("if(activeRewardFlight)settleRewardFlight(false)"),'Aborting flight must clean up');
assert.ok(html.includes("speak('Goed! '+correctSentence(),()=>animateRewardCoin())"),'Speech must finish before reward flight');



/* A coin landing must ring, not produce a lone sine ping. Verify the actual
   WebAudio implementation makes four staggered two-part strikes and obeys mute. */
const jingleStart=html.indexOf('  function playRewardLandingSound(){');
const jingleEnd=html.indexOf('  function animateRewardCoin(){',jingleStart);
assert.ok(jingleStart>=0&&jingleEnd>jingleStart,'Coin landing jingle missing');
const coinStarts=[];
const jingleScope={
  state:{audioOn:true},toneNodes:[],soundContext:null,
  window:{AudioContext:function(){
    return {state:'running',currentTime:10,destination:{},
      createOscillator:()=>({
        type:'sine',frequency:{setValueAtTime:()=>{}},
        connect:()=>{},start:t=>coinStarts.push(t),stop:()=>{},onended:null
      }),
      createGain:()=>({gain:{setValueAtTime:()=>{},exponentialRampToValueAtTime:()=>{}},
        connect:()=>{}})
    };
  }}
};
runInNewContext(html.slice(jingleStart,jingleEnd)+
  '\nplayRewardLandingSound();state.audioOn=false;playRewardLandingSound();',jingleScope);
assert.equal(coinStarts.length,8,'Coin landing should have 4 soft layered strikes; mute adds none');
assert.ok(new Set(coinStarts).size>=4,'Landing should ring in several staggered moments');

/* Profile customization: original artwork and safe local preferences. */
const expectedAvatars=['smile-happy','smile-wink','smile-grin','smile-cool',
  'obj-rocket','obj-star','obj-volleyball','obj-bolt'];
for(const id of expectedAvatars)
  assert.ok(html.includes("id:'"+id+"'"),'Missing native avatar '+id);
assert.ok(html.includes("getProfileAvatars:()=>PROFILE_AVATARS"),'Avatar list accessor missing');
assert.ok(html.includes("preferences.displayName=cleanProfileName(typed);"),'Name validation missing');
assert.ok(html.includes("preferences.avatarId=validProfileAvatar(profileDraftAvatar);"),'Avatar ID validation missing');
assert.ok(html.includes('${esc(profileLabel())}'),'Display name must be escaped');
assert.ok(html.includes("profileDialogOpen?profileDialog():''"),'Profile must use the existing home surface');
assert.ok(html.includes('version:3,skills:learning,stars,rewardCoins,preferences,placement,basicHistory'),
  'Existing learner progress serialization must remain in place');

// Ordinary world rounds share the successful QA chest animation and persist
// non-diagnostic coins in the same local progress record.
assert.ok(html.includes("rewardPreview:true,previewCoins:rewardCoins"),
  'Ordinary world exercises must enable chest rewards');
assert.ok(html.includes("rewardCoins=state.previewCoins;"),
  'World reward earned must persist');
assert.ok(html.includes("isPilotO3()||isWorld()"),
  'Chest should be available to the normal learner world');
assert.ok(html.includes("rewardCoins=Math.max(0,Math.min("),
  'Stored coins must be bounded');
console.log(`PASS P0 regression: ${scripts} JS program(s), 6 modal items, 27 distractor repairs, 4 world-level choices, casing, audio, help and text labels`);
