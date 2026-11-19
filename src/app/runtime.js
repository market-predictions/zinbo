
(function () {
  'use strict';
  // Keep one tile per zinsdeel. The tile bank deliberately NEVER starts in a good sentence order.
  // Alternative solutions are explicitly authored; optional first-tile prompts narrow the task.
  const ORDER = __ZINBO_CONTENT_ORDER__;
  const MORPH = __ZINBO_CONTENT_MORPH__;

  // V4.0: two explicit grammar goals; old 40 exercises and image library stay intact.
  // The new goals are exercises requiring human TOS-logopedist review, not clinical claims.
  const ADVANCED = __ZINBO_CONTENT_ADVANCED__;
  // Explicit author preview: new answer forms are candidates, never part of
  // released ADVANCED/world pools or the existing review attestation.
  const CHOICE_PILOT = __ZINBO_CONTENT_CHOICE_PILOT__;
  const CHOICE_PILOT_PREVIEW = new URLSearchParams(window.location.search).get('choice-pilot')==='1';
  // V4.3: candidate authored items are inert until a traceable independent review.
  const V43_CANDIDATES = __ZINBO_CONTENT_V43_CANDIDATES__;
  const V43_ART = {"pet-dog.webp":"./art/pet-dog.webp","school-gate.webp":"./art/school-gate.webp","sports-field.webp":"./art/sports-field.webp","kitchen-cooking.webp":"./art/kitchen-cooking.webp","family-talk.webp":"./art/family-talk.webp","town-outing.webp":"./art/town-outing.webp","kitchen-cooking-v2.webp":"./art/kitchen-cooking-v2.webp","family-talk-v2.webp":"./art/family-talk-v2.webp","school-walking-v2.webp":"./art/school-walking-v2.webp","town-lookout-v2.webp":"./art/town-lookout-v2.webp","self-colors-choose.webp":"./art/self-colors-choose.webp","self-backpack-take.webp":"./art/self-backpack-take.webp","station-walk-to-stop.webp":"./art/station-walk-to-stop.webp","library-borrow.webp":"./art/library-borrow.webp","pool-swimming.webp":"./art/pool-swimming.webp","music-singing.webp":"./art/music-singing.webp","playground-climbing.webp":"./art/playground-climbing.webp","museum-looking.webp":"./art/museum-looking.webp"};
  // B2: owner-approved standalone scene art; release remains gated by independent content and image-match review.
  Object.assign(V43_ART,{"classroom-reading.webp":"./art/classroom-reading.webp","schoolyard.webp":"./art/schoolyard.webp","self-painting.webp":"./art/self-painting.webp","self-backpack.webp":"./art/self-backpack.webp","station-trip.webp":"./art/station-trip.webp","shopping-store.webp":"./art/shopping-store.webp"});
  const V43_RESOLUTION_PASS = __ZINBO_CONTENT_V43_RESOLUTION_PASS__;
  Object.assign(V43_RESOLUTION_PASS,{"classroom-reading.webp":true,"schoolyard.webp":true,"self-painting.webp":true,"self-backpack.webp":true,"station-trip.webp":true,"shopping-store.webp":true});
  const EXISTING_PREMIUM_SCENES = new Set(["bike-to-school.webp", "garden-work.webp", "grandma-reading.webp", "kids-dancing.webp", "park-walk-grandma.webp", "sam-soccer.webp"]);
  const validCandidateShape=q=>(q.kind==='tense'||q.kind==='strong')?Array.isArray(q.choices)&&q.choices.includes(q.ending)&&typeof q.full==='string'&&q.full.length>4:(q.kind==='inversion'&&Array.isArray(q.tiles)&&Array.isArray(q.solutions)&&q.solutions.length>0&&q.solutions[0].length===q.tiles.length);
  // QA-only: 14 unreleased candidates are visible for review, NOT marked as visually approved.
  const QA_PREVIEW=false; // production: do not bypass reviewer gates
  const QA_EXTRA_IDS=new Set(["v43-p01-ik-nu", "v43-p01-and-nu", "v43-p01-ik-past", "v43-p01-and-past", "v43-d1-05-ik-nu", "v43-d1-05-ander-nu", "v43-i01-past", "v43-i01-present", "v43-d1-05-ik-inversie", "v43-d1-05-ander-inversie", "v43-b2-02-strong2-ik-nu", "v43-b2-02-strong2-ik-vt", "v43-d1-05-ik-gisteren", "v43-d1-05-ander-gisteren"]);
  V43_ART["market-flowers.webp"]="./art/market-flowers.webp"; // premium flower handover, NOT proof of purchase
  // A signed per-item review or the exactly verified central content review may
  // authorize grammar; technical image-resolution checks remain independent.
  const reviewedCandidate=q=>RELEASE_REVIEW_IDS.has(q.id)||
    (q.reviewStatus==='human-approved'&&typeof q.reviewBy==='string'&&q.reviewBy.trim().length>1&&
    /^\d{4}-\d{2}-\d{2}$/.test(q.reviewAt||'')&&
    q.imageReviewStatus==='premium-approved'&&typeof q.imageReviewBy==='string'&&
    q.imageReviewBy.trim().length>1&&/^\d{4}-\d{2}-\d{2}$/.test(q.imageReviewAt||''));
  const releasedCandidate=q=>validCandidateShape(q)&&reviewedCandidate(q)&&
    Boolean(V43_ART[q.art]||EXISTING_PREMIUM_SCENES.has(q.art))&&
    V43_RESOLUTION_PASS[q.art]===true;
  for(const skill of ['past','inversion','strong']){
    ADVANCED[skill].push(...V43_CANDIDATES[skill].filter(releasedCandidate));
  }
  // Approved additions are attached to temporary lesson copies. Canonical
  // content, subject, image, correct form and stable item IDs stay unchanged.
  // The expert approval was reported by the owner; no external report was supplied.
  const CHOICE_VARIANTS_APPROVED=CHOICE_PILOT.releaseStatus==='owner-attested-approved'&&
    CHOICE_PILOT.approval?.logopedistApprovedAsReportedByOwner===true;
  const APPROVED_CHOICE_BY_ID=new Map(CHOICE_VARIANTS_APPROVED
    ?CHOICE_PILOT.items.filter(c=>c.reviewStatus==='owner-attested-approved').map(c=>[c.sourceId,c])
    :[]);
  function makeChoiceVariant(base,candidate,count){
    if(!base||!candidate||!['tense','strong'].includes(base.kind)||
       !Array.isArray(base.choices)||base.choices.length!==2||
       ![2,3,4].includes(count))return null;
    const extra=candidate.extra.slice(0,count-2);
    const choices=[...base.choices,...extra.map(x=>x.form)];
    if(new Set(choices).size!==count||choices.filter(v=>v===base.ending).length!==1)return null;
    const originalWrong=base.choices.find(form=>form!==base.ending);
    const choiceErrorTypes={
      [originalWrong]:'time',
      ...Object.fromEntries(extra.map(x=>[x.form,x.possibleError]))
    };
    return {...base,choices,choiceErrorTypes,choiceCount:count,
      choiceGoal:count===2?'time':'combined'};
  }
  // These are *presentation* bands, not a new clinical language level.
  // Levels 2/3 offer an extra choice only when the source stage warrants it.
  function releasedChoiceCount(level,base){
    if(level<=1)return 2;
    const stage=Number.isInteger(base.stage)?base.stage:0;
    if(level===2)return stage>=1?3:2;
    if(level===3)return stage>=2?4:3;
    return 4;
  }
  function releaseVerbChoices(base,level){
    const candidate=APPROVED_CHOICE_BY_ID.get(base?.id);
    if(!candidate)return base; // all other exercises remain byte-for-byte identical
    const count=releasedChoiceCount(level,base);
    if(count===2)return base; // levels with one objective keep the original choice pair
    const variant=makeChoiceVariant(base,candidate,count);
    return variant||base;
  }
  function choicePilotItem(candidate,count){
    if(!CHOICE_PILOT_PREVIEW)return null;
    const base=[...ADVANCED.past,...ADVANCED.strong].find(q=>q.id===candidate.sourceId);
    const variant=makeChoiceVariant(base,candidate,count);
    return variant?{...variant,pilotErrorTypes:variant.choiceErrorTypes,
      pilotChoiceCount:count,pilotGoal:variant.choiceGoal}:null;
  }
  function choicePilotItems(count,firstId){
    if(!CHOICE_PILOT_PREVIEW)return [];
    const source=CHOICE_PILOT.items;
    const first=Math.max(0,source.findIndex(x=>x.sourceId===firstId));
    const rotated=[...source.slice(first),...source.slice(0,first)];
    return rotated.slice(0,5).map(v=>choicePilotItem(v,count)).filter(Boolean);
  }
  function adaptiveChoiceLevel(skill){
    if([1,2,3,4].includes(o4Data.level))return o4Data.level;
    // Normal practice unlocks complexity gradually, with a deliberate
    // advanced challenge able to offer level-four choice sets.
    return state.challengeFloor===2?4:Math.min(4,skillStage(skill)+1);
  }
  function releaseAdaptiveVerbChoices(base,skill){
    return releaseVerbChoices(base,adaptiveChoiceLevel(skill));
  }

  // V4.1 adaptive selection: separate grammar skills, spaced review on subsequent days.
  // No remote data, AI scorer or time-pressure. Saved results are indicative only.
  const SAVE_KEY='zinsbouwer-qa-360-feedback-20261019';
  const SKILLS=['past','inversion','strong'];
  const todayKey=()=>{
    const d=new Date();
    return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
  };
  const emptySkill=()=>({streak:0,independent:0,assisted:0,novel:0,reviewSuccess:0,seen:[],history:[],lastStarted:null});
  let learning=Object.fromEntries(SKILLS.map(k=>[k,emptySkill()]));
  let stars=0; // Spendable reward stars; independent learning evidence lives in basicHistory/skills.
  let rewardCoins=0; // Motivation only: never used as evidence of language mastery.

  // One small avatar collection; previous profile IDs remain readable forever.
  const AVATAR_PRICE=5;
  const PROFILE_AVATARS=[
    {id:'smile-happy',name:'Blij',free:true},{id:'smile-cool',name:'Stoer',free:true},
    {id:'smile-wink',name:'Knipoog',free:true},{id:'smile-grin',name:'Grote lach',free:true},
    {id:'premium-explorer',name:'Verkenner'},{id:'premium-astronaut',name:'Astronaut'},
    {id:'premium-crown',name:'Koning(in)'},{id:'premium-cat',name:'Kat'},
    {id:'premium-robot',name:'Robot'},{id:'premium-hero',name:'Superheld'},
    {id:'premium-rainbow',name:'Regenboog'},{id:'premium-music',name:'Muziek'}
  ];
  const LEGACY_PROFILE_AVATARS=[
    {id:'obj-rocket',name:'Raket'}, {id:'obj-star',name:'Ster'},
    {id:'obj-volleyball',name:'Volleybal'}, {id:'obj-bolt',name:'Bliksem'}
  ];
  const DEFAULT_PROFILE_AVATAR='smile-happy';
  let unlockedAvatarIds=[];
  const allAvatarInfo=id=>PROFILE_AVATARS.find(a=>a.id===id)||LEGACY_PROFILE_AVATARS.find(a=>a.id===id);
  function validProfileAvatar(id){return allAvatarInfo(id)?id:DEFAULT_PROFILE_AVATAR;}
  function avatarOwned(id){const a=allAvatarInfo(id);return !!a&&(!!a.free||unlockedAvatarIds.includes(id));}
  function cleanProfileName(raw){
    if(typeof raw!=='string')return '';
    return Array.from(raw.normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f]/g,'').replace(/\s+/g,' ').trim()).slice(0,14).join('');
  }
  function profileLabel(){return preferences.displayName||'Mijn Zinbo';}
  function profileAvatar(id){
    const selected=validProfileAvatar(id);
    const base='<circle cx="32" cy="33" r="25" fill="#BCE9FF" stroke="#0C4A89" stroke-width="2.5"/><path d="M17 19Q31 8 46 18" fill="none" stroke="#FFF" stroke-width="4" stroke-linecap="round" opacity=".7"/>';
    const face='<circle cx="32" cy="32" r="23" fill="#FFCB52" stroke="#DA8B16" stroke-width="2.5"/><path d="M17 20Q27 10 39 17" fill="none" stroke="#FFF4C4" stroke-width="5" stroke-linecap="round"/>';
    const svg={
      'smile-happy':face+'<circle cx="24" cy="29" r="3.2" fill="#102F66"/><circle cx="40" cy="29" r="3.2" fill="#102F66"/><path d="M21 38Q32 50 43 38" stroke="#102F66" stroke-width="3.7" stroke-linecap="round" fill="none"/>',
      'smile-wink':face+'<path d="M19 30Q24 25 29 30" stroke="#102F66" stroke-width="3.5" stroke-linecap="round" fill="none"/><circle cx="41" cy="29" r="3.2" fill="#102F66"/><path d="M22 39Q31 46 42 36" stroke="#102F66" stroke-width="3.7" stroke-linecap="round" fill="none"/>',
      'smile-grin':face+'<circle cx="23" cy="28" r="3" fill="#102F66"/><circle cx="41" cy="28" r="3" fill="#102F66"/><path d="M20 38Q32 55 44 38Z" fill="#102F66"/><path d="M24 41H40" stroke="#FFF" stroke-width="3.2" stroke-linecap="round"/>',
      'smile-cool':face+'<path d="M16 25H47L44 36Q38 40 34 33L31 33Q26 40 20 36Z" fill="#123464" stroke="#071D44" stroke-width="1.5"/><path d="M20 27L26 27" stroke="#77CBFF" stroke-width="2.5" stroke-linecap="round"/><path d="M28 44Q32 47 37 43" fill="none" stroke="#102F66" stroke-width="2.8" stroke-linecap="round"/>',
      'obj-rocket':base+'<path d="M27 44L20 52L18 42L24 36M39 44L46 52L48 42L42 36" fill="#FF9A23" stroke="#0C4A89" stroke-width="2"/><path d="M24 44L24 27Q25 16 33 11Q41 18 42 28L42 44Z" fill="#FFF" stroke="#0C4A89" stroke-width="2.5"/><circle cx="33" cy="28" r="6" fill="#69C7FF" stroke="#0C4A89" stroke-width="2.5"/><path d="M28 44H38L34 53Z" fill="#FF9A23"/>',
      'obj-star':base+'<path d="M32 12L38 25L52 27L42 37L45 52L32 45L19 52L22 37L12 27L26 25Z" fill="#FFD052" stroke="#E79416" stroke-width="3" stroke-linejoin="round"/><circle cx="27" cy="34" r="2" fill="#0C4A89"/><circle cx="37" cy="34" r="2" fill="#0C4A89"/><path d="M27 39Q32 44 37 39" fill="none" stroke="#0C4A89" stroke-width="2" stroke-linecap="round"/>',
      'obj-volleyball':base+'<circle cx="32" cy="32" r="18" fill="#FFF" stroke="#0C4A89" stroke-width="2.5"/><path d="M17 29Q29 19 44 20M22 45Q23 26 32 15M32 50Q39 34 49 31M17 29Q31 31 43 45M26 16Q31 28 47 37" fill="none" stroke="#168DE1" stroke-width="3"/>',
      'obj-bolt':base+'<path d="M33 10L16 36H30L27 54L50 27H35L40 10Z" fill="#FFCC48" stroke="#E58F13" stroke-width="3" stroke-linejoin="round"/><path d="M33 18L24 32" stroke="#FFF6BA" stroke-width="3" stroke-linecap="round"/>'
    };
    return '<svg class="zinbo-avatar-svg" data-avatar-id="'+selected+'" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">'+(selected.startsWith('premium-')?premiumAvatarArtwork(selected):svg[selected])+'</svg>';
  }

  // Flat 64x64 vector assets: one SVG drawing shared by grid, preview and top bar.
  function premiumAvatarArtwork(id){
    const eyes='<circle cx="25" cy="33" r="2.6" fill="#102e68"/><circle cx="39" cy="33" r="2.6" fill="#102e68"/>';
    const mouth='<path d="M25 42Q32 48 39 42" stroke="#102e68" stroke-width="2.8" fill="none" stroke-linecap="round"/>';
    const face='<circle cx="32" cy="34" r="21" fill="#FFD5A0" stroke="#BC7A43" stroke-width="2"/>'+eyes+mouth;
    const art={
      'premium-explorer':face+'<path d="M11 28Q12 8 32 8Q52 8 53 28Z" fill="#4EA36B" stroke="#247049" stroke-width="2"/><path d="M8 28Q32 21 56 28Q40 34 12 32Z" fill="#65B87C" stroke="#247049" stroke-width="2"/><path d="M32 12L28 21H36Z" fill="#E4F8C0"/>',
      'premium-astronaut':'<circle cx="32" cy="32" r="28" fill="#D9F0FF" stroke="#4384C6" stroke-width="3"/><circle cx="32" cy="34" r="20" fill="#FFD5A0" stroke="#A5C4E8" stroke-width="2"/>'+eyes+mouth+'<rect x="2" y="25" width="8" height="17" rx="4" fill="#4384C6"/><rect x="54" y="25" width="8" height="17" rx="4" fill="#4384C6"/>',
      'premium-crown':face+'<path d="M14 21L12 7L23 15L32 5L41 15L52 7L50 23Z" fill="#FFD050" stroke="#E6921A" stroke-width="2.5" stroke-linejoin="round"/><circle cx="32" cy="14" r="3" fill="#F88759"/><path d="M17 27Q32 20 47 27" fill="none" stroke="#6B3D2A" stroke-width="5"/>',
      'premium-cat':'<path d="M9 23L13 7L28 18Q32 16 37 18L52 7L55 23Q62 39 51 51Q32 65 13 51Q2 39 9 23Z" fill="#FFB55E" stroke="#C76D28" stroke-width="2.5"/><path d="M13 13L18 22L25 19ZM51 13L46 22L39 19Z" fill="#FFDFCC"/><path d="M18 34Q23 29 28 34M36 34Q41 29 46 34" fill="none" stroke="#102e68" stroke-width="2.8"/><path d="M30 39H34L32 42Z" fill="#C55D53"/><path d="M26 46Q32 53 38 46M10 42L23 44M41 44L54 42" stroke="#102e68" stroke-width="2" fill="none" stroke-linecap="round"/>',
      'premium-robot':'<rect x="10" y="17" width="44" height="39" rx="10" fill="#9ED8F5" stroke="#316FAD" stroke-width="3"/><rect x="15" y="24" width="34" height="26" rx="7" fill="#16365E"/><circle cx="25" cy="36" r="3.5" fill="#52E7F1"/><circle cx="39" cy="36" r="3.5" fill="#52E7F1"/><path d="M26 43Q32 48 38 43" stroke="#52E7F1" stroke-width="2.5" fill="none"/><path d="M32 17V9" stroke="#316FAD" stroke-width="3"/><circle cx="32" cy="7" r="4" fill="#52D4ED"/>',
      'premium-hero':face+'<path d="M13 26Q32 15 51 26L47 38Q39 30 32 37Q25 30 17 38Z" fill="#207FC9"/><circle cx="25" cy="32" r="3" fill="#fff"/><circle cx="39" cy="32" r="3" fill="#fff"/><path d="M16 21Q28 6 43 17" stroke="#75402A" stroke-width="8" stroke-linecap="round" fill="none"/>',
      'premium-rainbow':'<circle cx="32" cy="32" r="25" fill="#FFD965" stroke="#E38C38" stroke-width="2"/><path d="M8 24Q25 0 48 15L56 24" stroke="#F37578" stroke-width="8" fill="none"/><path d="M8 30Q30 10 55 30" stroke="#50B6E5" stroke-width="6" fill="none"/><path d="M16 37Q24 30 30 37M35 37Q43 30 49 37" stroke="#102e68" stroke-width="2.5" fill="none"/><path d="M23 44Q32 52 42 44" stroke="#102e68" stroke-width="3" fill="none"/>',
      'premium-music':face+'<path d="M16 27Q15 6 32 6Q49 6 48 27" fill="none" stroke="#218BDC" stroke-width="7"/><rect x="7" y="25" width="10" height="22" rx="5" fill="#168DDD" stroke="#165A9E" stroke-width="2"/><rect x="47" y="25" width="10" height="22" rx="5" fill="#168DDD" stroke="#165A9E" stroke-width="2"/><path d="M22 18Q32 10 42 18" stroke="#9358B2" stroke-width="6" fill="none"/>'
    };
    return art[id]||face;
  }

  let preferences={audioOn:true,motionOn:true,roleColorsOn:true,schoolGroup:null,displayName:'',avatarId:'smile-happy',listenOwnSentence:false};
  // A placement round is provisional. Its observations never count as mastery evidence.
  let placement={seen:[],history:[],done:false,recommendedLevel:null};
  let basicHistory=[];
  function loadLearning(){
    try {
      const raw=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
      if(!raw||![1,2,3].includes(raw.version))return;
      stars=Math.max(0,Math.floor(Number(raw.stars)||0));
      rewardCoins=Math.max(0,Math.min(1000000,Math.floor(Number(raw.rewardCoins)||0)));
      unlockedAvatarIds=Array.isArray(raw.unlockedAvatarIds)
        ? [...new Set(raw.unlockedAvatarIds.filter(id=>allAvatarInfo(id)&&!allAvatarInfo(id).free))].slice(0,16):[];
      if(raw.preferences && typeof raw.preferences==='object'){
        if(typeof raw.preferences.audioOn==='boolean')preferences.audioOn=raw.preferences.audioOn;
        if(typeof raw.preferences.motionOn==='boolean')preferences.motionOn=raw.preferences.motionOn;
        if(typeof raw.preferences.roleColorsOn==='boolean')preferences.roleColorsOn=raw.preferences.roleColorsOn;
        if(typeof raw.preferences.listenOwnSentence==='boolean')preferences.listenOwnSentence=raw.preferences.listenOwnSentence;
        preferences.displayName=cleanProfileName(raw.preferences.displayName);
        preferences.avatarId=validProfileAvatar(raw.preferences.avatarId);
        // Old profile objects stay owned after switching away from them.
        if(LEGACY_PROFILE_AVATARS.some(a=>a.id===preferences.avatarId)&&!unlockedAvatarIds.includes(preferences.avatarId))unlockedAvatarIds.push(preferences.avatarId);
         if(['5','6','7','8'].includes(raw.preferences.schoolGroup))preferences.schoolGroup=raw.preferences.schoolGroup;
        if(['sport','thuis','familie'].includes(raw.preferences.lastWorld))preferences.lastWorld=raw.preferences.lastWorld;
      }
      if(Array.isArray(raw.basicHistory))basicHistory=raw.basicHistory.filter(h=>h&&typeof h.id==='string'&&h.evidenceVersion===3).slice(-100);
      if(raw.placement && typeof raw.placement==='object'){
        placement={seen:Array.isArray(raw.placement.seen)?raw.placement.seen.filter(x=>typeof x==='string').slice(-100):[],
          history:Array.isArray(raw.placement.history)?raw.placement.history.filter(x=>x&&typeof x.id==='string').slice(-60):[],
          done:Boolean(raw.placement.done),
          recommendedLevel:[1,2,3].includes(raw.placement.recommendedLevel)?raw.placement.recommendedLevel:null};
      }
      for(const skill of SKILLS){
        const x=raw.skills?.[skill];if(!x)continue;
        learning[skill]={
          streak:Math.max(0,Math.min(8,Number(x.streak)||0)),
          independent:Math.max(0,Number(x.independent)||0),
          assisted:Math.max(0,Number(x.assisted)||0),
          novel:Math.max(0,Number(x.novel)||0),
          reviewSuccess:Math.max(0,Number(x.reviewSuccess)||0),
          seen:Array.isArray(x.seen)?x.seen.filter(y=>typeof y==='string').slice(-120):[],
          history:Array.isArray(x.history)?x.history.filter(y=>y&&typeof y.id==='string'&&typeof y.day==='string').slice(-80):[],
          lastStarted:typeof x.lastStarted==='string'?x.lastStarted:null
        };
      }
    }catch(_){} // Graceful in-memory fallback on blocked storage.
  }
  function saveLearning(){
    try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:3,skills:learning,stars,rewardCoins,unlockedAvatarIds,preferences,placement,basicHistory}));}catch(_){}
  }
  loadLearning();
  function isAdaptive(){return Boolean(state.lessonSkill);}
  function isPlacement(){return state.lessonSkill==='placement';}
  // Non-cryptographic randomness is sufficient: selection is NOT a security decision.
  function shuffleItems(items){
    const result=[...items];
    for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
    return result;
  }
  function itemFamily(q){
    return q.lexeme || (Array.isArray(q.choices)?q.choices[0]:null)
      || (q.tiles?.find(t=>t.role==='verb')?.text) || q.id;
  }
  function itemPerspective(q){
    const subject=q.subject||q.tiles?.find(t=>t.role==='subject')?.text||'';
    return /^ik$/i.test(subject.trim())?'ik':'ander';
  }
  function evidenceFamily(q){
    if(q.lexeme)return q.lexeme;
    if(q.family && !/^(?:p|i)\d+$/.test(q.family))return q.family;
    return null; // unknown is not independent evidence of lexical diversity
  }
  function skillStage(skill){
    const stats=learning[skill];
    const recent=stats.history.slice(-12).filter(h=>h.evidenceVersion===3&&h.independent);
    const families=new Set(recent.map(h=>h.evidenceFamily).filter(Boolean));
    // Start with evidence across verb families rather than ID-only streaks.
    // The familiar streak still guards against premature escalation.
    const differentDays=new Set(recent.map(h=>h.day));
    if(stats.streak>=4&&families.size>=3&&differentDays.size>=2)return 2;
    if(stats.streak>=2&&families.size>=2)return 1;
    return 0;
  }
  function pickAdaptiveItem(skill,used=[]){
    const pool=ADVANCED[skill],stats=learning[skill];
    const available=pool.filter(q=>!used.includes(q.id));
    if(!available.length)return shuffleItems(pool)[0];
    const stage=state.challengeFloor===2?2:skillStage(skill);
    const recent=stats.history.slice(-5),recentFamilies=new Set(recent.map(h=>h.family).filter(Boolean));
    const usedFamilies=new Set((state.lessonItems||[]).slice(-3).map(itemFamily));
    const usedScenes=new Set((state.lessonItems||[]).slice(-2).map(q=>q.art));
    const visited=new Set([...stats.seen,...placement.seen]);
    if(!state.reviewPicked){
      const priorIds=new Set(stats.history.filter(h=>h.day<todayKey()).map(h=>h.id));
      const due=available.filter(q=>priorIds.has(q.id));
      if(due.length){
        state.reviewPicked=true;
        const ranked=shuffleItems(due).sort((a,b)=>Number(usedFamilies.has(itemFamily(a)))-Number(usedFamilies.has(itemFamily(b))));
        return ranked[0];
      }
    }
    const score=q=>{
      let s=Math.abs(q.stage-stage)*90;
      if(visited.has(q.id))s+=28;
      if(usedFamilies.has(itemFamily(q)))s+=35;
      if(usedScenes.has(q.art))s+=12;
      if(recentFamilies.has(itemFamily(q)))s+=8;
      if(used.length===0&&q.id===stats.lastStarted)s+=60;
      const last=state.lessonItems?.slice(-1)[0];
      if(last && itemPerspective(last)===itemPerspective(q) && itemPerspective(q)==='ik')s+=9;
      if(last && evidenceFamily(last) && evidenceFamily(last)===evidenceFamily(q) && itemPerspective(last)!==itemPerspective(q))s-=8;
      const window=stats.history.filter(h=>h.evidenceVersion===3).slice(-10);
      const ikShare=window.length?window.filter(h=>h.perspective==='ik').length/window.length:0;
      if(itemPerspective(q)==='ik'&&ikShare<.35)s-=11;
      // Target the observed perspective weakness without forcing a 2/5 quota.
      const perspectiveErrors=[...basicHistory,...stats.history].filter(h=>h.evidenceVersion===3&&!h.independent).slice(-8);
      if(perspectiveErrors.filter(h=>h.perspective==='ik').length>=2 && itemPerspective(q)==='ik')s-=8;
      if(q.purpose==='new-example'&&stats.streak<3&&state.challengeFloor!==2)s+=12;
      return s;
    };
    const sorted=available.map(q=>({q,s:score(q)})).sort((a,b)=>a.s-b.s);
    return shuffleItems(sorted.filter(x=>x.s<=sorted[0].s+12).map(x=>x.q))[0];
  }
  const PLACEMENT_SKILLS=['past','inversion','strong','past','inversion'];
  function placementItem(index){
    const skill=PLACEMENT_SKILLS[index],pool=ADVANCED[skill];
    const independent=state.placementResults.filter(r=>r.independent).length;
    const errors=state.placementResults.length-independent;
    const first=(o4Data.level>=3)?1:0;
    const stage=Math.max(0,Math.min(1,first+(independent>=2?1:0)-(errors>=1?1:0)));
    const available=pool.filter(q=>q.stage===stage&&!placement.seen.includes(q.id)&&!state.lessonItems.some(x=>x.id===q.id));
    const rest=pool.filter(q=>q.stage===0&&!state.lessonItems.some(x=>x.id===q.id));
    const chosen=shuffleItems(available.length?available:rest)[0];
    return {...chosen,placementSkill:skill};
  }
  // A five-item kennismaking can suggest an accessible starting point, not diagnose TOS
  // or establish level 4. A recommendation requires evidence in multiple constructs.
  function placementRecommendation(results){
    if(!Array.isArray(results)||results.length<5)return null;
    const successes=results.filter(r=>r.independent&&r.attempts===0&&!r.helpUsed);
    const skills=new Set(successes.map(r=>r.placementSkill).filter(Boolean));
    const supportedStage=successes.filter(r=>r.stage>=1).length;
    if(successes.length>=4&&skills.size>=3&&supportedStage>=1)return 3;
    if(successes.length>=3&&skills.size>=2)return 2;
    return 1;
  }
  function startPlacement(){
    stopAudio();
    const {audioOn,motionOn}=state;
    state={screen:'exercise',motionOn,settingsOpen:false,mode:'morph',series:0,index:0,positions:[],selected:null,attempts:0,helpUsed:false,solvedFirst:0,message:'',showHint:false,completed:false,focusPos:null,audioOn,lessonSkill:'placement',lessonItems:[],placementResults:[],reviewPicked:false};
    state.lessonItems.push(placementItem(0));
    state.mode=state.lessonItems[0].kind==='inversion'?'order':'morph';
    resetItem();render();speak(taskInstruction());
  }
  function recordPlacementResult(){
    const q=item(),independent=state.attempts===0&&!state.helpUsed;
    const proof={id:q.id,day:todayKey(),focus:state.mode==='order'?'volgorde':'vorm',perspective:itemPerspective(q),evidenceFamily:evidenceFamily(q),scene:q.art,independent,
      helpUsed:state.helpUsed,attempts:state.attempts,family:itemFamily(q),stage:q.stage,placementSkill:q.placementSkill};
    state.placementResults.push(proof);
    placement.history.push(proof);placement.history=placement.history.slice(-60);
    placement.seen=Array.from(new Set([...placement.seen,q.id])).slice(-100);
    if(state.index===4){
      placement.done=true;
      placement.recommendedLevel=placementRecommendation(state.placementResults);
    }
    saveLearning();
  }
  let challengeRequested=false;
  function startSkill(skill){
    if(!ADVANCED[skill])return;
    stopAudio();
    const {audioOn,motionOn}=state;
    state={screen:'exercise',motionOn,settingsOpen:false,mode:skill==='inversion'?'order':'morph',series:0,index:0,positions:[],selected:null,attempts:0,helpUsed:false,solvedFirst:0,message:'',showHint:false,completed:false,focusPos:null,audioOn,lessonSkill:skill,lessonItems:[],reviewPicked:false,challengeFloor:challengeRequested?2:0};
    challengeRequested=false;
    state.lessonItems.push(releaseAdaptiveVerbChoices(pickAdaptiveItem(skill),skill));
    learning[skill].lastStarted=state.lessonItems[0].id;
    saveLearning();
    resetItem();render();speak(taskInstruction());
  }
  function recordAdaptiveResult(){
    const stats=learning[state.lessonSkill];
    const q=item(),alreadySeen=stats.seen.includes(q.id)||placement.seen.includes(q.id);
    const independently=state.attempts===0&&!state.helpUsed;
    const family=evidenceFamily(q);
    const oldPairs=[...stats.history,...placement.history];
    const newCombination=family ? !oldPairs.some(h=>h.evidenceFamily===family&&h.scene===q.art) : null;
    if(independently){stats.streak=Math.min(8,stats.streak+1);stats.independent++;if(q.stage===2&&newCombination===true)stats.novel++;}
    else {stats.streak=Math.max(0,stats.streak-1);stats.assisted++;}
    const latest=stats.history.filter(h=>h.id===q.id).slice(-1)[0];
    if(independently&&latest&&latest.day<todayKey())stats.reviewSuccess++;
    stats.seen=stats.seen.filter(id=>id!==q.id).concat(q.id).slice(-120);
    const previousIndependent=stats.history.find(h=>h.id===q.id&&h.evidenceVersion===3&&h.independent&&h.day<todayKey());
    stats.history.push({id:q.id,day:todayKey(),evidenceVersion:3,
      focus:q.focus||(state.mode==='order'?'volgorde':'vorm'),perspective:itemPerspective(q),
      independent:independently,helpUsed:state.helpUsed,attempts:state.attempts,
      newCombination,unseenItem:!alreadySeen,evidenceFamily:family,retention:Boolean(independently&&previousIndependent),
      stage:q.stage,family:itemFamily(q),scene:q.art,purpose:q.purpose||'practice',
      ...(q.choiceCount?{choicesOffered:q.choiceCount,choiceGoal:q.choiceGoal}: {})});
    stats.history=stats.history.slice(-80);
    saveLearning();
  }
  function recordBasicResult(){
    const q=item(),independent=state.attempts===0&&!state.helpUsed;
    basicHistory.push({id:q.id,day:todayKey(),evidenceVersion:3,independent,
      focus:state.mode==='order'?'volgorde':'vorm',perspective:itemPerspective(q),
      helpUsed:state.helpUsed,attempts:state.attempts,evidenceFamily:evidenceFamily(q),scene:q.art,
      ...(q.choiceCount?{choicesOffered:q.choiceCount,choiceGoal:q.choiceGoal}: {})});
    basicHistory=basicHistory.slice(-100);
    saveLearning();
  }
  function evidenceSummary(){
    const events=SKILLS.flatMap(skill=>learning[skill].history.filter(h=>h.evidenceVersion===3).map(h=>({...h,skill})));
    const supported=events.filter(h=>!h.independent).length,independent=events.filter(h=>h.independent).length;
    const newExamples=events.filter(h=>h.independent&&h.newCombination).length;
    return `In de adaptieve uitdagingen sinds V4.3: ${supported} keer geholpen, ${independent} keer zelfstandig en ${newExamples} keer zelfstandig bij een nieuwe combinatie. In de basis: ${basicHistory.length} gemaakte zinnen. Dit bewijst geen spontaan spreken.`;
  }
  function challengeHome(){
    const progress=(key)=>skillStage(key)>=2?'Nieuwe voorbeelden':skillStage(key)>=1?'Verder oefenen':'Rustig beginnen';
    const card=(skill,title,desc,symbol)=>`<button class="mode premium-skill" data-action="start-skill" data-skill="${skill}"><span class="skill-top"><span class="skill-symbol" aria-hidden="true">${symbol}</span><span class="skill-arrow" aria-hidden="true">→</span></span><span class="mode-title">${title}</span><span class="mode-desc">${desc}</span><span class="mode-go">${progress(skill)} →</span></button>`;
    return `<section class="panel home landing-shell">${landingTop()}${landingHero('Kies je uitdaging','Oefen rustig verder. Vijf zinnen per keer.','Verder oefenen',true)}
      <div class="landing-content"><button class="landing-back" data-action="home">← Terug naar oefeningen</button><div class="landing-section-label">Welke uitdaging kies je?</div>
        <div class="mode-grid premium-skill-grid">
          ${card('past','Nu of gisteren?','Oefen wat vandaag of gisteren gebeurt.','◷')}
          ${card('inversion','Zinnen omdraaien','Begin met een ander woord.','⇄')}
          ${card('strong','Bijzondere werkwoorden','Bijvoorbeeld: lopen → liep.','✦')}
        </div><button class="challenge-toggle premium-toggle" data-action="toggle-challenge" aria-pressed="${challengeRequested}"><span aria-hidden="true">${challengeRequested?'✓':'↑'}</span><span>${challengeRequested?'Moeilijkere opgaven aan':'Probeer iets moeilijkers'}</span></button>
      ${parentDetails('Er zijn '+SKILLS.reduce((n,k)=>n+ADVANCED[k].length,0)+' bestaande adaptieve oefendefinities over drie uitdagingen. Antwoorden met een hint zijn geen zelfstandig bewijs; de oefeningen zijn niet klinisch gevalideerd. '+evidenceSummary(),true)}</div></section>`;
  }


  // No name, recording or account data. V4 challenge-progress only stays on this device.
  let state = { screen:'home', mode:null, series:0, index:0, positions:[], selected:null, attempts:0, helpUsed:false, solvedFirst:0, message:'', showHint:false, completed:false, focusPos:null, audioOn:preferences.audioOn, motionOn:preferences.motionOn, settingsOpen:false };
  const SERIES = {"order":[["o1","o8","o9","o10","o12"],["o3","o6","o13","o14","o15"],["o17","o2","o11","o19","o20"],["o7","o16","o18","o5","o4"]],"morph":[["m1","m3","m2","m5","m9"],["m4","m7","m8","m10","m12"],["m6","m11","m13","m15","m17"],["m14","m16","m18","m19","m20"]]};
  let completedSeries={order:new Set(),morph:new Set()};
  let suppressDragClick = {button:null,until:0};
  const app=document.getElementById('app');
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function caps(s){return s.charAt(0).toLocaleUpperCase('nl-NL')+s.slice(1);}
  // Sentence-initial capitals are presentation, not a clue printed on a loose tile.
  // Preserve personal names (Sam, Sara, ...) while normalizing common sentence starters.
  function tileText(raw,first=false){
    const text=String(raw);
    const ordinary=/^(De |Het |Een |Ik\b|Wij\b|Jij\b|Hij\b|Zij\b|Ze\b|Oma\b|Papa\b|Mama\b|Vandaag\b|Gisteren\b|Buiten\b)/;
    const neutral=ordinary.test(text)?text.charAt(0).toLocaleLowerCase('nl-NL')+text.slice(1):text;
    return first?caps(neutral):neutral;
  }
  function item(){
    if(isWorld()||isAdaptive())return state.lessonItems[state.index];
    const list=state.mode==='order'?ORDER:MORPH;
    const id=(state.seriesItems||SERIES[state.mode][state.series])[state.index];
    return list.find(q=>q.id===id);
  }
  function pilotSentence(it, sequence){
    const words=sequence.map((id,i)=>tileText(it.tiles.find(t=>t.id===id).text,i===0));
    if(it.kind==='conditional'&&sequence[0]==='w0')words[2]=words[2]+',';
    return words.join(' ')+'.';
  }
  function sentence(it, sequence){if(it.kind==='conditional')return pilotSentence(it, sequence);return sequence.map((id,i)=>tileText(it.tiles.find(t=>t.id===id).text,i===0)).join(' ')+'.';}
  function currentComplete(){return state.mode==='order'?state.positions.every(x=>x!==null):state.selected!==null;}
  // One audiovisual director: old speech and queued celebrations are cancelled together.
  // Browser speech is temporary prototype-quality; all instructions remain visible.
  let audioTicket=0, speechTimer=null, soundContext=null, toneNodes=[];
  const audioAudit=[];
  function stopAudio(){
    audioTicket++;
    if(speechTimer!==null){clearTimeout(speechTimer);speechTimer=null;}
    for(const osc of toneNodes){try{osc.stop();}catch(_){}}
    toneNodes=[];
    if('speechSynthesis' in window){try{window.speechSynthesis.cancel();}catch(_){}}
    if(typeof cancelRewardFlight==='function')cancelRewardFlight();
  }
  // Prefer a Netherlands Dutch voice; do not accidentally select a Flemish
  // nl-BE voice merely because it is listed first by the browser.
  function speak(text, onFinished){
    stopAudio();
    if(!state.audioOn){if(onFinished)onFinished();return;}
    audioAudit.push({kind:'speech',text:String(text)});
    if(!('speechSynthesis' in window)){if(onFinished)onFinished();return;} // visual fallback
    try{
      const u=new SpeechSynthesisUtterance(String(text));u.lang='nl-NL';u.rate=.85;u.pitch=1;
      const voices=window.speechSynthesis.getVoices();
      const dutch=voices.find(v=>String(v.lang||'').toLowerCase()==='nl-nl');
      if(dutch)u.voice=dutch;
      if(onFinished){
        const ticket=audioTicket;
        let completed=false;
        const finish=()=>{
          if(completed||ticket!==audioTicket)return;
          completed=true;
          if(speechTimer!==null){clearTimeout(speechTimer);speechTimer=null;}
          onFinished();
        };
        u.onend=finish;u.onerror=finish;
        // Some embedded browsers never fire speech callbacks: fail gracefully.
        speechTimer=setTimeout(finish,Math.min(12000,Math.max(2500,String(text).length*120)));
      }
      window.speechSynthesis.speak(u);
    }catch(_){
      if(speechTimer!==null){clearTimeout(speechTimer);speechTimer=null;}
      if(onFinished)onFinished(); // Speech failed, but the visible reward still works.
    }
  }

  function celebrateAndRead(){
    stopAudio();
    if(!state.audioOn)return;
    const ticket=audioTicket;
    audioAudit.push({kind:'celebration'});
    // A very short positive two-note cue; no sound during the spoken language model.
    try{
      const AudioCtx=window.AudioContext||window.webkitAudioContext;
      if(AudioCtx){
        soundContext=soundContext||new AudioCtx();
        if(soundContext.state==='suspended')soundContext.resume().catch(()=>{});
        const startAt=soundContext.currentTime;
        [660,880].forEach((hz,i)=>{
          const osc=soundContext.createOscillator(),gain=soundContext.createGain();
          osc.type='sine';osc.frequency.value=hz;
          const t=startAt+i*.095;
          gain.gain.setValueAtTime(.0001,t);
          gain.gain.exponentialRampToValueAtTime(.055,t+.018);
          gain.gain.exponentialRampToValueAtTime(.0001,t+.092);
          osc.connect(gain);gain.connect(soundContext.destination);
          toneNodes.push(osc);
          osc.onended=()=>{toneNodes=toneNodes.filter(node=>node!==osc);};
          osc.start(t);osc.stop(t+.1);
        });
      }
    }catch(_){ /* muted or unsupported audio is a valid fallback */ }
    speechTimer=setTimeout(()=>{
      speechTimer=null;
      if(ticket===audioTicket&&state.audioOn&&state.screen==='exercise'&&state.completed){
        speak('Goed! '+correctSentence());
      }
    },260);
  }

  // One curated primary-theme mapping; the same item ID is never copied.
  const WORLD_SCENES={
    sport:['sam-soccer.webp','dog-run.webp','sam-friend-dog-soccer.webp','kids-dancing.webp','sports-field.webp'],
    thuis:['grandma-reading.webp','drawing-together.webp','garden-work.webp','kitchen-cooking.webp','self-painting.webp','self-backpack.webp'],
    familie:['sara-parcel.webp','park-walk-grandma.webp','family-talk.webp','pet-dog.webp'],
    school:['bike-to-school.webp','school-gate.webp','classroom-reading.webp','schoolyard.webp'],
    uitstapjes:['town-outing.webp','station-trip.webp','shopping-store.webp']
  };
  const WORLD_INFO=[
    {id:'zelf',name:'Over jezelf',sub:'Wat doe jij?',art:'bike-to-school.webp',sample:'Ik oefen met zinnen over mezelf.'},
    {id:'school',name:'Op school',sub:'Leren en spelen',art:'bike-to-school.webp',sample:'Nieuwe schoolscènes zijn in voorbereiding.'},
    {id:'sport',name:"Sport en hobby's",sub:'Bewegen en plezier',art:'sam-friend-dog-soccer.webp',sample:'Voetballen, dansen en buitenspelen.'},
    {id:'thuis',name:'Thuis',sub:'Eten, helpen en doen',art:'drawing-together.webp',sample:'Lezen, tekenen en helpen thuis.'},
    {id:'familie',name:'Familie en vrienden',sub:'Samen zijn',art:'sara-parcel.webp',sample:'Oma bezoeken en elkaar helpen.'},
    {id:'uitstapjes',name:'Uitstapjes',sub:'Op pad',art:'park-walk-grandma.webp',sample:'Meer plekken en activiteiten komen eraan.'}
  ];
  const ALL_LEGACY_ITEMS=[...ORDER,...MORPH,...SKILLS.flatMap(key=>ADVANCED[key])];
  // One normal learner route. Author-only O3/VTT candidates remain inaccessible
  // until each item has verifiable language and image review metadata.
  function releasedExtension(q){
    const reviewed=(status,by,at,expected)=>status===expected &&
      typeof by==='string'&&by.trim().length>1 &&
      typeof at==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(at);
    return q&&Array.isArray(q.tiles)&&q.tiles.length>0 &&
      Array.isArray(q.solutions)&&q.solutions.length>0 &&
      q.solutions.every(tiles=>tiles.length===q.tiles.length &&
        tiles.every(id=>q.tiles.some(t=>t.id===id))) &&
      (RELEASE_REVIEW_IDS.has(q.id)||
        (reviewed(q.reviewStatus,q.reviewBy,q.reviewAt,'human-approved') &&
         reviewed(q.imageReviewStatus,q.imageReviewBy,q.imageReviewAt,'premium-approved'))) &&
      Boolean(q.art&&(SCENE_ART[q.art]||V43_ART[q.art]||EXISTING_PREMIUM_SCENES.has(q.art)));
  }
  function learnerItems(){
    return [...ALL_LEGACY_ITEMS,...O3_PILOT.filter(releasedExtension),
      ...VTT_PILOT.filter(releasedExtension)];
  }
  function worldItems(id){
    const all=learnerItems();
    if(id==='zelf')return all.filter(q=>itemPerspective(q)==='ik');
    const arts=WORLD_SCENES[id]||[];
    return all.filter(q=>q.primaryWorld ? q.primaryWorld===id : arts.includes(q.art));
  }
  // Four entry levels select demonstrably different existing exercise constructs.
  // This is a preference, never a diagnostic measure of the child's language ability.
  function worldExerciseBand(q){
    const stage=Number.isInteger(q.stage)?q.stage:0;
    if(q.kind==='because'||q.kind==='conditional')return q.level===4?4:3;
    if(q.kind==='vtt')return stage>=2?3:2;
    if(q.kind==='inversion'||q.kind==='strong')return stage>=2?4:stage>=1?3:2;
    if(q.kind==='tense')return stage>=2?3:stage>=1?2:1;
    return 1; // basic word order and present-tense agreement
  }
  function worldFamilies(items){return new Set(items.map(q=>evidenceFamily(q)||itemFamily(q)).filter(Boolean));}
  function worldIsPlayable(id){
    if(!['sport','thuis','familie','school','uitstapjes','zelf'].includes(id))return false; // V1 approved primary domains only
    const items=worldItems(id);
    return items.length>=(id==='zelf'?12:5) && new Set(items.map(q=>q.art)).size>=(id==='zelf'?3:2) && worldFamilies(items).size>=(id==='zelf'?3:2);
  }
  function worldHistory(){
    return [...basicHistory,...SKILLS.flatMap(key=>learning[key].history)];
  }
  function worldPracticedIds(id){
    const allowed=new Set(worldItems(id).map(q=>q.id));
    return new Set(worldHistory().filter(h=>allowed.has(h.id)).map(h=>h.id));
  }
  function worldCount(){return WORLD_INFO.filter(w=>worldIsPlayable(w.id)).length;}
  // Manual level selection takes precedence. Automatic progression is local and
  // evidence-based: four different, independent exercises in at least two
  // contexts and on two days before advancing by one construct level.
  // It remains a practice preference, not a clinical ability measurement.
  function worldAutomaticLevel(id){
    let level=placement.done&&[1,2,3].includes(placement.recommendedLevel)
      ?placement.recommendedLevel:1;
    const byId=new Map(worldItems(id).map(q=>[q.id,q]));
    const history=worldHistory().filter(h=>h.evidenceVersion===3&&byId.has(h.id)).slice(-90);
    for(;level<4;level++){
      const atLevel=history.filter(h=>worldExerciseBand(byId.get(h.id))===level).slice(-16);
      const strong=atLevel.filter(h=>h.independent);
      if(strong.length<4||strong.length/Math.max(1,atLevel.length)<.7)break;
      if(new Set(strong.map(h=>h.id)).size<4||
         new Set(strong.map(h=>h.day)).size<2||
         new Set(strong.map(h=>h.scene).filter(Boolean)).size<2)break;
    }
    return level;
  }
  function worldSelectedLevel(id){
    return [1,2,3,4].includes(o4Data.level)?o4Data.level:worldAutomaticLevel(id);
  }
  function selectWorldItems(id){
    const pool=worldItems(id);
    const prior=new Set(worldHistory().map(h=>h.id));
    const recent=worldHistory().slice(-15),recentArts=new Set(recent.map(h=>h.scene).filter(Boolean));
    const chosen=[],target=worldSelectedLevel(id);
    const family=q=>evidenceFamily(q)||itemFamily(q);
    while(chosen.length<5){
      const options=pool.filter(q=>!chosen.some(p=>p.id===q.id));
      if(!options.length)break;
      // Strict two-per-family cap whenever sufficient distinct material exists.
      // Keep a five-item round possible when the reviewed pool lacks diversity.
      const varied=options.filter(q=>chosen.filter(x=>family(x)===family(q)).length<2);
      const choices=varied.length?varied:options;
      const score=q=>{
        const sameScene=chosen.filter(x=>x.art===q.art).length;
        const sameFamily=chosen.filter(x=>family(x)===family(q)).length;
        return Math.abs(worldExerciseBand(q)-target)*180+
          (prior.has(q.id)?20:0)+sameScene*45+sameFamily*25+
          (recentArts.has(q.art)?6:0)+Math.random()*9;
      };
      const ranked=choices.map(q=>({q,value:score(q)})).sort((a,b)=>a.value-b.value);
      chosen.push(ranked[0].q);
    }
    return chosen;
  }
  function startWorld(id){profileMenuOpen=false;
    if(!worldIsPlayable(id))return;
    const targetLevel=worldSelectedLevel(id);
    const items=selectWorldItems(id).map(q=>releaseVerbChoices(q,targetLevel));
    if(items.length!==5)return;
    preferences.lastWorld=id;
    saveLearning();
    stopAudio();
    const {audioOn,motionOn}=state;
    state={screen:'exercise',motionOn,settingsOpen:false,mode:items[0].tiles?'order':'morph',series:0,
      index:0,worldId:id,lessonItems:items,positions:[],selected:null,attempts:0,helpUsed:false,
      solvedFirst:0,message:'',showHint:false,completed:false,focusPos:null,audioOn,
      rewardPreview:false,previewCoins:0,previewShownCoins:0,previewLastGain:0,previewChestOpen:false};
    resetItem();render();speak(taskInstruction());
  }
  function isWorld(){return Boolean(state.worldId);}
  let parentPanelOpen=false;
  let profileMenuOpen=false;

  let profileDialogOpen=false;
  let profileDraftName='';
  let profileDraftAvatar=DEFAULT_PROFILE_AVATAR;
  function closeProfileDialog(){
    profileDialogOpen=false;profileMenuOpen=false;render();
    app.querySelector('[data-action="world-profile"]')?.focus();
  }
  let pendingAvatarPurchase=null;
  function profileDialog(){
    const selected=validProfileAvatar(profileDraftAvatar);
    const info=allAvatarInfo(selected);
    const owned=avatarOwned(selected);
    const card=a=>{
      const picked=selected===a.id,has=avatarOwned(a.id);
      return '<button type="button" data-action="profile-avatar" data-avatar="'+a.id+'" aria-label="'+a.name+(has?', beschikbaar':', vergrendeld, '+AVATAR_PRICE+' sterren')+'" aria-pressed="'+picked+'" class="zinbo-avatar-tile '+(picked?'is-picked ':'')+(has?'is-owned':'is-locked')+'">'+profileAvatar(a.id)+'<span class="zinbo-avatar-name">'+esc(a.name)+'</span><small>'+(has?'✓ Beschikbaar':'★ '+AVATAR_PRICE+' sterren')+'</small></button>';
    };
    const free=PROFILE_AVATARS.filter(a=>a.free).map(card).join('');
    const premium=PROFILE_AVATARS.filter(a=>!a.free).map(card).join('');
    const legacy=LEGACY_PROFILE_AVATARS.filter(a=>unlockedAvatarIds.includes(a.id)).map(card).join('');
    const needed=Math.max(0,AVATAR_PRICE-stars);
    const button=owned
      ? '<button type="button" class="zinbo-avatar-cta" data-action="profile-avatar-choose" '+(selected===preferences.avatarId?'disabled':'')+'>'+(selected===preferences.avatarId?'✓ Deze avatar gebruik je':'Kies deze avatar')+'</button>'
      : needed
        ? '<p class="zinbo-avatar-need">Nog '+needed+' sterren nodig om te ontgrendelen.</p>'
        : pendingAvatarPurchase===selected
          ? '<p class="zinbo-avatar-confirm">Deze avatar voor '+AVATAR_PRICE+' sterren ontgrendelen?</p><button type="button" class="zinbo-avatar-cta" data-action="profile-avatar-confirm">Ja, ontgrendel</button><button type="button" class="zinbo-avatar-back" data-action="profile-avatar-cancel-buy">Annuleren</button>'
          : '<button type="button" class="zinbo-avatar-cta" data-action="profile-avatar-buy">Ontgrendel voor '+AVATAR_PRICE+' sterren</button>';
    return '<div class="zinbo-profile-backdrop" data-action="profile-cancel" aria-hidden="true"></div>'+
      '<section class="zinbo-profile-dialog zinbo-avatar-dialog" role="dialog" aria-modal="true" aria-labelledby="zinbo-profile-title">'+
      '<header class="zinbo-profile-titlebar"><div><span class="zinbo-profile-kicker">Jouw plek in Zinbo</span><h2 id="zinbo-profile-title">Kies je avatar</h2><p>Spaar sterren en ontgrendel nieuwe avatars.</p></div><button type="button" class="zinbo-profile-close" data-action="profile-cancel" aria-label="Sluit avatarbibliotheek">×</button></header>'+
      '<p class="zinbo-avatar-info">★ '+stars+' '+(stars===1?'ster':'sterren')+' beschikbaar · Gratis avatars kies je meteen.</p>'+
      '<div class="zinbo-avatar-layout"><div class="zinbo-avatar-lists">'+
        '<h3>Gratis avatars</h3><div class="zinbo-avatar-grid" role="group" aria-label="Gratis avatars">'+free+'</div>'+
        '<h3>Nieuwe avatars</h3><div class="zinbo-avatar-grid" role="group" aria-label="Ontgrendelbare avatars">'+premium+'</div>'+
        (legacy?'<h3>Eerder gekozen avatars</h3><div class="zinbo-avatar-grid" role="group" aria-label="Jouw oudere avatars">'+legacy+'</div>':'')+
      '</div><aside class="zinbo-avatar-preview" aria-live="polite"><h3>Jouw keuze</h3><div class="zinbo-avatar-big">'+profileAvatar(selected)+'</div><h4>'+esc(info.name)+'</h4><p>'+(owned?'Deze avatar is van jou.':'Ontgrendel met sterren uit je oefenrondes.')+'</p>'+button+'</aside></div>'+
      '<div class="zinbo-avatar-footer"><label for="zinbo-profile-name">Jouw naam</label><input type="text" id="zinbo-profile-name" maxlength="14" autocomplete="off" placeholder="Naam of bijnaam" value="'+esc(profileDraftName)+'"/><button type="button" class="zinbo-profile-save" data-action="profile-save">Naam opslaan</button></div>'+
      '<p class="zinbo-profile-local-note">Je naam, sterren en avatars blijven alleen in deze browser bewaard.</p></section>';
  }

  let resetConfirmOpen=false;
  function worldHeading(){
    const events=worldHistory();
    const unique=new Set(events.map(h=>h.id)).size;
    const independent=events.filter(h=>h.independent).length;
    const wordFamilies=new Set(events.filter(h=>h.focus==='vorm').map(h=>h.evidenceFamily||h.family).filter(Boolean));
    return {count:events.length,unique,independent,words:wordFamilies.size};
  }
  function opIcon(name,size=26){const paths={"message-circle": "<path d=\"M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z\"/>", "circle-check": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m7.5 12 3 3 6-6\"/>", "chart-column": "<path d=\"M4 20v-3M10 20V9M16 20V4M22 20V13\" stroke-width=\"3.2\" stroke-linecap=\"round\"/>", "target": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"5\"/><circle cx=\"12\" cy=\"12\" r=\"1.2\"/><path d=\"m17 7 5-5m0 0v5m0-5h-5\"/>", "lock": "<rect x=\"5\" y=\"10\" width=\"14\" height=\"12\" rx=\"2\"/><path d=\"M8 10V7a4 4 0 0 1 8 0v3\"/>", "chevron-down": "<path d=\"m6 9 6 6 6-6\"/>", "chevron-right": "<path d=\"m9 18 6-6-6-6\"/>", "book-open": "<path d=\"M12 7a8 8 0 0 0-9-2v14a8 8 0 0 1 9 2 8 8 0 0 1 9-2V5a8 8 0 0 0-9 2Zm0 0v14\"/>", "graduation-cap": "<path d=\"m2 10 10-5 10 5-10 5-10-5ZM6 12v5c3 3 9 3 12 0v-5M22 10v7\"/>", "house": "<path d=\"m3 11 9-8 9 8v10h-7v-7h-4v7H3V11Z\"/>", "users": "<circle cx=\"9\" cy=\"8\" r=\"3\"/><path d=\"M3 21v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6M17 15a5 5 0 0 1 4 5v1\"/>", "bike": "<circle cx=\"5\" cy=\"18\" r=\"4\"/><circle cx=\"19\" cy=\"18\" r=\"4\"/><path d=\"m5 18 5-10 5 10H5Zm10 0 4-8h-6M9 5h3\"/>", "map-pin": "<path d=\"M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/>", "star": "<path d=\"m12 2 3.1 6.3 7 1-5 4.9 1.2 7-6.3-3.3-6.3 3.3 1.2-7-5-4.9 7-1L12 2Z\"/>", "person": "<circle cx=\"12\" cy=\"7\" r=\"4\"/><path d=\"M4 22v-3a8 8 0 0 1 16 0v3\"/>", "play": "<path d=\"m8 4 12 8-12 8V4Z\" fill=\"currentColor\" stroke=\"none\"/>", "settings": "<path d=\"M12 3a2 2 0 0 1 2 2l.2.8 1.6.7.8-.4a2 2 0 0 1 2.6 1l1 1.8a2 2 0 0 1-.5 2.6l-.6.5v2l.6.5a2 2 0 0 1 .5 2.6l-1 1.8a2 2 0 0 1-2.6 1l-.8-.4-1.6.7-.2.8a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2l-.2-.8-1.6-.7-.8.4a2 2 0 0 1-2.6-1l-1-1.8a2 2 0 0 1 .5-2.6l.6-.5v-2l-.6-.5a2 2 0 0 1-.5-2.6l1-1.8a2 2 0 0 1 2.6-1l.8.4 1.6-.7.2-.8a2 2 0 0 1 2-2h2Z\" transform=\"translate(1 0) scale(.88)\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", "volume": "<path d=\"M4 9h4l5-4v14l-5-4H4V9ZM17 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12\"/>", "rotate-ccw": "<path d=\"M3 11a9 9 0 1 1 3 7M3 4v7h7\"/>"};return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name]||paths.target}</svg>`;}
