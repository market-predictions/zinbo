  function exercise(){
    const q=item(),morph=state.mode==='morph';
    const subtitle=esc(taskInstruction());
    const controls=`<div class="actions premium-actions zbv2-actions"><button class="secondary reset-action" data-action="reset" ${state.completed?'disabled':''}>${uiIcon('replay',28)} <span>Opnieuw</span></button><div class="action-middle"><button class="secondary hint-action" data-action="hint" aria-pressed="${state.showHint}" ${state.completed?'disabled':''}>${uiIcon('bulb',28)} <span>Hint</span></button>${state.attempts>=2&&!state.completed?'<button class="secondary answer-action" data-action="answer">Laat zien</button>':''}</div><button class="primary check-action" data-action="${state.completed?'next':'check'}" ${!state.completed&&!currentComplete()?'disabled':''}>${uiIcon('check',28)} <span>${state.completed?(state.index===4?'Afronden':'Volgende'):'Controleer'}</span></button></div>`;
    return `<section class="panel zbv2-exercise">${topBar()}<div class="zbv2-exercise-body"><div class="zbv2-task-panel ${SCENE_ART[q.art]||V43_ART[q.art]?'has-art':'no-art'}"><button class="instruction-card" data-action="speak-task" ${state.audioOn?'':'disabled'} aria-label="Herhaal de opdracht"><span class="zbv2-listen-icon">${uiIcon('audio',32)}</span><span class="zbv2-task-text">${subtitle}</span></button>${scene(q)}</div>${rewardSuccessMarkup()}<div class="work-area zbv2-work-area">${morph?morphBody(q):orderBody(q)}</div>${controls}${isRewardPreview()&&!state.completed?`<div class="reward-prototype-tools"><span class="reward-preview-label">QA · geen echte munten</span><button class="reward-demo-trigger" data-action="reward-demo-complete">Toon visuele beloning</button></div>`:isRewardPreview()?`<div class="reward-prototype-tools"><span class="reward-preview-label">QA · geen echte munten</span></div>`:""}</div></section>`;
  }
  function correctSentence(){const q=item();return state.mode==='order'?sentence(q,state.positions):q.full;}
  function speakBuiltSentence(){
    if(state.screen!=='exercise'||state.completed||!currentComplete()||!state.audioOn||!preferences.listenOwnSentence)return;
    const q=item();
    // Replay the child's own sequence/form, never the approved answer model.
    let spoken='';
    if(state.mode==='order')spoken=sentence(q,state.positions);
    else if(q.kind==='tense'||q.kind==='strong')spoken=[q.subject,state.selected,q.tail].filter(Boolean).join(' ');
    else spoken=[q.subject,(q.stem||'')+(state.selected||''),q.tail].filter(Boolean).join(' ');
    if(spoken.trim())speak(spoken);
  }

  function speakOwnPrompt(){speak('Wil je iets over jezelf vertellen? Zeg één zin over iets dat je graag doet. Je mag ook passen.');}
  function ownVoicePrompt(){return `<div class="voice-optional"><strong>Jouw zin (als je wilt)</strong><p>Vertel hardop één ding dat jij graag doet. Je mag ook overslaan. We luisteren niet mee en bewaren niets.</p><button type="button" class="secondary" data-action="own-prompt" ${state.audioOn?'':'disabled'}>Luister naar de vraag</button></div>`;}
  function roundEnd(action,label,extra=''){
    const review=Array.isArray(state.roundReview)?state.roundReview:[];
    const independent=review.filter(entry=>entry.independent).length;
    const assisted=review.length-independent;
    const items=review.map((entry,i)=>`<li class="zbv4-review-row">
      <span class="zbv4-review-symbol ${entry.independent?'is-self':'is-assisted'}" aria-hidden="true">${entry.independent?'✓':'◈'}</span>
      <span class="zbv4-review-sentence">${esc(entry.sentence)}</span>
      <span class="zbv4-review-label">${entry.independent?'Zelf':'Met hulp'}</span>
      <button type="button" class="zbv4-review-listen" data-action="speak-summary" data-index="${entry.index}" ${state.audioOn?'':'disabled'} aria-label="Luister naar zin ${i+1}">${uiIcon('audio',20)}</button>
    </li>`).join('');
    const message=review.length
      ?independent+' '+(independent===1?'zin deed':'zinnen deed')+' je zelfstandig. '+(assisted?assisted+' '+(assisted===1?'zin maakte':'zinnen maakte')+' je met hulp.':'Goed gedaan!')
      :'Goed geoefend!';
    return `<section class="panel success zbv4-end">
      <header class="zbv4-end-brand">Zinbo</header>
      <div class="zbv4-end-layout">
        <div class="zbv4-end-celebration"><div class="zbv4-end-star" aria-hidden="true">★</div>
        <h1>Ronde klaar!</h1><p>Je verdiende een ster. Je hebt er nu ${stars}.</p></div>
        <div class="zbv4-review-card"><h2>Jouw ${review.length===5?'vijf':review.length} zinnen</h2>
        <ol class="zbv4-review-list">${items}</ol>
        <p class="zbv4-review-summary">${message}</p></div>
      </div>
      <div class="zbv4-end-actions">
        <button class="secondary" data-action="home">Naar start</button>
        <button class="primary" data-action="${action}" ${extra}>${label} ${uiIcon('chevron-right',22)}</button>
      </div>
      <details class="zbv4-end-optional"><summary>Wil je nog iets vertellen?</summary>${ownVoicePrompt()}</details>
    </section>`;
  }
  function end(){
    if(isRewardPreview())return rewardPreviewEnd();
    if(isPilotO4())return `<section class="panel success"><div class="checkicon" aria-hidden="true">★</div><h1>O4-oefenronde afgerond</h1><p>Vijf oefenzinnen, met ondersteuning waar nodig. Nog geen officiële taalniveau-uitspraak.</p><div class="actions"><button class="secondary" data-action="home">Terug naar de werelden</button><button class="primary" data-action="o4-start">Nog vijf adaptieve zinnen</button></div></section>`;
    if(isPilotO3())return `<section class="panel success"><div class="checkicon" aria-hidden="true">★</div><h1>O3-pilot afgerond</h1><p>Vijf proefzinnen geoefend, nog niet vrijgegeven.</p><div class="actions"><button class="secondary" data-action="home">Terug naar de leerwereld</button><button class="primary" data-action="o3-pilot-again">Nog vijf proefzinnen</button></div></section>`;
    if(isPilotVTT())return `<section class="panel success"><div class="checkicon" aria-hidden="true">★</div><h1>VTT-pilot afgerond</h1><p>Je hebt vijf proefzinnen gemaakt. Ze blijven kandidaatmateriaal.</p><div class="actions"><button class="secondary" data-action="home">Terug naar de leerwereld</button><button class="primary" data-action="vtt-pilot-again">Nog vijf proefzinnen</button></div></section>`;
    if(isWorld())return roundEnd('repeat-world','Nog een ronde','data-world="'+state.worldId+'"');
    if(isPlacement())return `<section class="panel success"><div class="checkicon" aria-hidden="true">★</div><h1>Goed geprobeerd!</h1><p>Dit was een kennismaking, geen toets. Kies een oefening die je leuk vindt.</p><div class="actions"><button class="primary" data-action="home">Kies een oefening →</button></div></section>`;
    if(isAdaptive())return roundEnd('repeat-skill','Nog een ronde');
    const hasNext=state.series<3;
    return roundEnd(hasNext?'next-series':'series','Nog een ronde');
  }


  // O1/O2 vertical pilot: VTT, candidate content. This uses the SAME order checker and tile UI.
  // QA-only launcher, separate storage. Never joins ALL_LEGACY_ITEMS or normal skill selector.
  const VTT_PILOT = __ZINBO_CONTENT_VTT_PILOT__;
  const VTT_PILOT_KEY='zinsbouwer-vtt-o1-qa-feedback-20261019';
  let vttPilotHistory=[];
  try {const prior=JSON.parse(localStorage.getItem(VTT_PILOT_KEY)||'[]');if(Array.isArray(prior))vttPilotHistory=prior.filter(x=>x&&typeof x.id==='string').slice(-150);}catch(_){}
  function isPilotVTT(){return state.lessonSkill==='vtt-pilot';}
  function recordPilotVTT(){
    const q=item();const independent=state.attempts===0&&!state.helpUsed&&!state.pilotAttemptedError&&!state.pilotUsedHelp;
    vttPilotHistory.push({id:q.id,goalId:q.goalId,level:q.level,day:todayKey(),independent,helpUsed:state.helpUsed,attempts:state.attempts,lexeme:q.lexeme,scene:q.art});
    vttPilotHistory=vttPilotHistory.slice(-150);
    try{localStorage.setItem(VTT_PILOT_KEY,JSON.stringify(vttPilotHistory));}catch(_){}
  }
  function startPilotVTT(firstId){
    const first=VTT_PILOT.find(q=>q.id===firstId)||VTT_PILOT[0];
    const rest=VTT_PILOT.filter(q=>q.id!==first.id&&q.lexeme!==first.lexeme);
    const selected=[first,...rest.slice(0,4)];
    stopAudio();profileMenuOpen=false;parentPanelOpen=false;
    const {audioOn,motionOn}=state;
    state={screen:'exercise',lessonSkill:'vtt-pilot',lessonItems:selected,mode:'order',series:0,index:0,positions:[],selected:null,attempts:0,helpUsed:false,solvedFirst:0,message:'',showHint:false,completed:false,focusPos:null,audioOn,motionOn,settingsOpen:false};
    resetItem();render();speak(taskInstruction());
  }
  const VTT_PILOT_CHOOSER=`<section class="qa-chooser" aria-label="Niveau 2 — VTT auteurspilot"><h2>Niveau 2 · Werkwoorden combineren</h2>
  <p><strong>VTT-auteurspilot: 15 niet-vrijgegeven oefenkandidaten.</strong> Het systeem gebruikt de bestaande oefentegels en antwoordcontrole. Het leert hier nog niet adaptief door naar een ander niveau.</p>
  <div class="qa-chooser-controls"><select id="vtt-pilot-picker" aria-label="Kies VTT pilotopgave">${VTT_PILOT.map(q=>`<option value="${q.id}">${q.id} · ${q.lexeme} · ${q.subject}</option>`).join('')}</select><button type="button" data-action="vtt-pilot-open">Open vijf pilotzinnen</button></div>
  <p class="qa-small">Eigen testvoortgang · geen wijziging in de kindapp · nog geen onafhankelijke TOS-goedkeuring voor deze nieuwe vijftien zinnen.</p></section>`;


  // O3 author-only content, not part of normal child selection.
  const O3_PILOT = __ZINBO_CONTENT_O3_PILOT__;
  const O3_PILOT_KEY = 'zinsbouwer-o3-qa-feedback-20261019';
  let o3PilotHistory=[];
  try { const stored=JSON.parse(localStorage.getItem(O3_PILOT_KEY)||'[]');
    if(Array.isArray(stored))o3PilotHistory=stored.filter(x=>x&&typeof x.id==='string').slice(-200);
  }catch(_){}
  function isPilotO3(){return state.lessonSkill==='o3-pilot';}
  function isRewardPreview(){return Boolean(state.rewardPreview && isPilotO3());}
  function isAuthorPilot(){return isPilotVTT()||isPilotO3()||isPilotO4();}
  function recordPilotO3(){
    const q=item();const independent=state.attempts===0&&!state.helpUsed&&!state.pilotAttemptedError&&!state.pilotUsedHelp;
    o3PilotHistory.push({id:q.id,goalId:q.goalId,level:q.level,day:todayKey(),independent,
      helpUsed:state.helpUsed||Boolean(state.pilotUsedHelp),attempts:state.attempts,scene:q.art,lexeme:q.lexeme});
    o3PilotHistory=o3PilotHistory.slice(-200);
    try{localStorage.setItem(O3_PILOT_KEY,JSON.stringify(o3PilotHistory));}catch(_){}
  }
  function startPilotO3(firstId,visualPrototype=false){
    const first=O3_PILOT.find(q=>q.id===firstId)||O3_PILOT[0];
    const other=O3_PILOT.filter(q=>q.id!==first.id&&q.lexeme!==first.lexeme);
    const mixed=first.level===4?[...other.filter(q=>q.level===4),...other.filter(q=>q.level===3)]:other;
    const selected=[first,...mixed.slice(0,4)];
    stopAudio();profileMenuOpen=false;parentPanelOpen=false;
    const {audioOn,motionOn}=state;
    state={screen:'exercise',lessonSkill:'o3-pilot',lessonItems:selected,mode:'order',series:0,index:0,
      positions:[],selected:null,attempts:0,helpUsed:false,solvedFirst:0,message:'',showHint:false,
      completed:false,focusPos:null,audioOn,motionOn,settingsOpen:false,
      rewardPreview:visualPrototype,previewCoins:0,previewShownCoins:0,previewLastGain:0,previewChestOpen:false};
    resetItem();render();speak(taskInstruction());
  }
  const O3_PILOT_CHOOSER=`<section class="qa-chooser" aria-label="Niveau 3 en 4 — O3 auteurspilot">
  <h2>Niveau 3 en 4 · Zinnen verbinden</h2>
  <p><strong>O3-auteurspilot: 12 omdat-zinnen en 2 als-zinnen.</strong> Niet vrijgegeven. Bij de als-oefeningen zijn twee correcte woordvolgordes mogelijk. Nieuwe grammatica met de bestaande tegels en validator.</p>
  <div class="qa-chooser-controls"><select id="o3-pilot-picker" aria-label="Kies O3 pilotopgave">
  ${O3_PILOT.map(q=>`<option value="${q.id}">${q.id} · Niveau ${q.level} · ${q.lexeme} · ${q.subject}</option>`).join('')}
  </select><button type="button" data-action="o3-pilot-open">Open vijf pilotzinnen</button><button type="button" data-action="reward-preview-open">Bekijk beloningsprototype (5 zinnen)</button></div>
  <p class="qa-small">Eigen testvoortgang · geen automatische niveausprong · geen onafhankelijke TOS-vrijgave voor deze 14 kandidaten.</p></section>`;


  // O4 QA only: neutral challenge preference is independent of historical schoolGroup.
  // Never reinterpret a schoolGroup preference as an attained language level.
  const O4_KEY='zinsbouwer-o4-adaptive-qa-20261019';
  let o4Data={level:null,history:[]};
  try {
    const prior=JSON.parse(localStorage.getItem(O4_KEY)||'null');
    if(prior && typeof prior==='object'){
      if([1,2,3,4].includes(prior.level))o4Data.level=prior.level;
      if(Array.isArray(prior.history))o4Data.history=prior.history.filter(x=>x&&typeof x.id==='string'&&typeof x.goalId==='string'&&[1,2,3,4].includes(x.level)&&typeof x.day==='string').slice(-240);
    }
  }catch(_){} // Private browser mode can disable storage.
  const O4_LEVEL_NAMES={1:'Zinnen bouwen',2:'Werkwoorden combineren',3:'Zinnen verbinden',4:'Rijke taal gebruiken'};
  const O4_GOALS=['base-word-order','vtt-aux-participle','subclause-omdat-verb-final','conditional-als-main-inversion'];
  function saveO4(){try{localStorage.setItem(O4_KEY,JSON.stringify(o4Data));}catch(_){}}
  function isPilotO4(){return state.lessonSkill==='o4-adaptive';}
  function o4History(goalId){return o4Data.history.filter(h=>h.goalId===goalId);}
  function o4Evidence(goalId){
    const events=o4History(goalId), independent=events.filter(h=>h.independent);
    const contexts=new Set(independent.map(h=>h.lexeme+'|'+h.scene+'|'+h.perspective));
    const delayed=independent.some(h=>h.delayedReview);
    const transfer=independent.some(h=>h.newCombination);
    return {goalId,tried:events.length,assisted:events.length-independent.length,
      independent:independent.length,contexts:contexts.size,transfer,delayed,
      description:!events.length?'Nog niet geoefend':events.at(-1).independent?
        (delayed?'Later zelfstandig herhaald':transfer?'Zelfstandig in een nieuwe combinatie':'Zelfstandig in een bekende oefening'):'Nog oefenen met hulp'};
  }
  function o4Pool(goalId){
    if(goalId==='base-word-order')return ORDER.map(q=>({...q,level:1,goalId,lexeme:itemFamily(q),purpose:'practice',reviewStatus:'existing',contextCue:'Kijk naar de situatie en bouw een zin.'}));
    if(goalId==='vtt-aux-participle')return VTT_PILOT;
    return O3_PILOT.filter(q=>q.goalId===goalId);
  }
  function o4Pick(goalId,used,reason){
    const pool=o4Pool(goalId).filter(q=>!used.includes(q.id));
    if(!pool.length)return null;
    const events=o4History(goalId), seen=new Set(events.map(h=>h.id));
    const lastEvents=events.slice(-4);
    const usedLex=new Set(used.map(id=>[...o4Pool(goalId),...VTT_PILOT,...O3_PILOT].find(q=>q.id===id)?.lexeme).filter(Boolean));
    const due=new Set(events.filter(h=>h.day<todayKey()&&h.independent&&!events.some(next=>next.id===h.id&&next.day>h.day)).map(h=>h.id));
    const earlierAssisted=new Set(lastEvents.filter(h=>!h.independent).map(h=>h.id));
    const poolScore=q=>{
      let score=seen.has(q.id)?10:0;
      if(usedLex.has(q.lexeme))score+=7;
      if(reason==='revisit'&&due.has(q.id))score-=50;
      if(reason==='support'&&earlierAssisted.has(q.id))score-=20;
      if(reason==='transfer'&&q.purpose==='new-example'&&!seen.has(q.id))score-=30;
      if(reason==='variation'&&!seen.has(q.id))score-=10;
      return score;
    };
    const choice=pool.map(q=>({q,s:poolScore(q)})).sort((a,b)=>a.s-b.s||a.q.id.localeCompare(b.q.id))[0]?.q;
    return choice?{...choice,o4Reason:reason}:null;
  }
  function o4Next(selectedLevel,used,slot){
    const target=O4_GOALS[selectedLevel-1], evidence=o4Evidence(target);
    const last=o4History(target).at(-1);
    let requested=target,reason='practice';
    // One short session: focus on the chosen target, with occasional accessible review.
    if(slot===3&&selectedLevel>=2){requested=O4_GOALS[selectedLevel-2];reason='refresh';}
    else if(slot===4&&selectedLevel<4&&evidence.independent>=2&&evidence.contexts>=2){requested=O4_GOALS[selectedLevel];reason='stretch';}
    else if(last&&!last.independent){reason='support';}
    else if(o4History(target).some(h=>h.day<todayKey()&&h.independent&&!h.delayedReview)){reason='revisit';}
    else if(evidence.independent>=1){reason=evidence.transfer?'variation':'transfer';}
    const chosen=o4Pick(requested,used,reason);
    if(chosen)return chosen;
    // Level 4 has only TWO authored items. Fill remaining slots from lower goals,
    // never repeat the same item in a five-item block or fabricate level-4 proof.
    for(let l=selectedLevel-1;l>=1;l--){const fallback=o4Pick(O4_GOALS[l-1],used,'refresh');if(fallback)return fallback;}
    return o4Pick(O4_GOALS[0],used,'refresh');
  }
  function startPilotO4(){
    if(!o4Data.level)return;
    stopAudio();profileMenuOpen=false;parentPanelOpen=false;
    const {audioOn,motionOn}=state;
    state={screen:'exercise',lessonSkill:'o4-adaptive',o4StartLevel:o4Data.level,lessonItems:[],mode:'order',
      series:0,index:0,positions:[],selected:null,attempts:0,helpUsed:false,solvedFirst:0,
      message:'',showHint:false,completed:false,focusPos:null,audioOn,motionOn,settingsOpen:false};
    const first=o4Next(o4Data.level,[],0);
    if(!first){goHome();return;}
    state.lessonItems.push(first);state.mode=first.tiles?'order':'morph';
    resetItem();render();speak(taskInstruction());
  }
  function recordPilotO4(){
    const q=item(),independent=state.attempts===0&&!state.helpUsed&&!state.pilotAttemptedError&&!state.pilotUsedHelp;
    const previous=o4History(q.goalId);
    const context=(q.lexeme||itemFamily(q))+'|'+q.art+'|'+itemPerspective(q);
    const known=previous.some(h=>h.lexeme+'|'+h.scene+'|'+h.perspective===context);
    const preceding=previous.filter(h=>h.id===q.id&&h.day<todayKey());
    const delayedReview=independent&&preceding.some(h=>h.independent);
    const event={id:q.id,goalId:q.goalId,level:q.level,day:todayKey(),independent,
      helped:!independent,helpUsed:Boolean(state.helpUsed||state.pilotUsedHelp),
      attempts:state.attempts,pilotAttemptedError:Boolean(state.pilotAttemptedError),
      lexeme:q.lexeme||itemFamily(q),scene:q.art,perspective:itemPerspective(q),
      firstSeen:!previous.some(h=>h.id===q.id),
      newCombination:independent&&!known&&previous.some(h=>h.independent),
      delayedReview,selectionReason:q.o4Reason||'practice'};
    o4Data.history.push(event);o4Data.history=o4Data.history.slice(-240);saveO4();
  }
  function o4Chooser(){
    const opts=[1,2,3,4].map(n=>`<button type="button" class="group-option" data-action="o4-level" data-level="${n}" aria-pressed="${o4Data.level===n}" style="font-size:17px;padding:12px;${o4Data.level===n?'outline:3px solid #2180d5;':''}">Niveau ${n}</button>`).join('');
    const chosen=o4Data.level,goal=chosen?O4_GOALS[chosen-1]:null;
    const stats=goal?o4Evidence(goal):null;
    return `<section class="qa-chooser" aria-label="O4 adaptieve leerroute niveau één tot en met vier">
      <h2>O4 · Jouw oefenniveau</h2><p>Vier inhoudsniveaus, <strong>geen schoolgroep of taaldiagnose</strong>. Kies een startpunt; de app past de volgende oefening per leerdoel aan. Deze route is uitsluitend een auteurstest.</p>
      <div class="group-options" role="group" aria-label="Startniveau kiezen">${opts}</div>
      <p class="qa-small">${chosen?'Gekozen: Niveau '+chosen+' — '+O4_LEVEL_NAMES[chosen]+'. '+stats.description+'.':'Kies eerst een niveau. Eerdere schoolgroepinstellingen worden bewust niet automatisch omgezet.'}</p>
      <div class="qa-chooser-controls"><button type="button" data-action="o4-start" ${chosen?'':'disabled'}>Start vijf adaptieve proefzinnen</button></div>
      <p class="qa-small">Hulp of een fout telt nooit als zelfstandig. Resultaten blijven apart van bestaande voortgang. Niveau 4 heeft nog slechts twee verschillende kandidaatopgaven.</p>
      ${O4_GOALS.map((g,i)=>{const e=o4Evidence(g);return `<p class="qa-small"><strong>Niveau ${i+1}:</strong> ${e.description} · ${e.tried} keer geoefend, ${e.independent} zelfstandig, ${e.assisted} met hulp of fout.</p>`;}).join('')}
      ${preferences.schoolGroup?`<p class="qa-small">Historische voorkeur bewaard: schoolgroep ${esc(preferences.schoolGroup)}. Deze wordt <strong>niet</strong> omgerekend naar niveau.</p>`:''}
    </section>`;
  }

  let lastRenderedScreen=null;
  function render(){
    const didChangeScreen=state.screen!==lastRenderedScreen;
    lastRenderedScreen=state.screen;
    document.body.classList.toggle('in-exercise',state.screen==='exercise');
    document.body.classList.toggle('in-landing',state.screen!=='exercise');
    document.body.classList.toggle('in-world',state.screen==='home');
    document.body.classList.toggle('no-motion',!state.motionOn);
    document.body.classList.toggle('no-role-colors',preferences.roleColorsOn===false);
    document.body.classList.toggle('reward-preview-mode',isRewardPreview());
    const previous = document.activeElement;
    const action = previous && previous.dataset ? previous.dataset.action : null;
    const key = previous && previous.dataset ? previous.dataset.id : null;
    let content=state.screen==='home'?worldDashboard():state.screen==='routes'?home():state.screen==='series'?seriesScreen():state.screen==='challenge-menu'?challengeHome():state.screen==='exercise'?exercise():end();

    baseLayout(content);
    if(didChangeScreen)window.scrollTo(0,0);
    let target = null;
    if(action){
      if(state.screen==='end') target=app.querySelector('.zbv4-end-actions .primary')||app.querySelector('[data-action="repeat-skill"]')||app.querySelector('[data-action="next-series"]')||app.querySelector('[data-action="series"]');
      else if(state.screen==='challenge-menu')target=app.querySelector('[data-action="start-skill"]');
      else if(state.screen==='home')target=app.querySelector('[data-action="start-order"]');
      else if(state.screen==='series')target=app.querySelector('[data-action="pick-series"]');
      else if(action==='tile')target=app.querySelector('[data-action="tile"]')||app.querySelector('[data-action="check"]');
      else if(action==='unplace')target=app.querySelector('[data-action="tile"][data-id="'+key+'"]')||app.querySelector('[data-action="tile"]');
      else if(action==='ending')target=app.querySelector('[data-action="ending"].selected');
      else if(action==='start-order'||action==='start-morph'||action==='start-skill'||action==='next')target=app.querySelector('[data-action="speak-task"]');
      else if(action==='check'||action==='answer')target=app.querySelector('[data-action="next"]')||app.querySelector('.feedback');
      else target=app.querySelector('[data-action="'+action+'"]');
    }
    if(target)target.focus({preventScroll:true});
  }
  function wire(){
    app.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{
      if(button===suppressDragClick.button && Date.now()<suppressDragClick.until)return;
      const a=button.dataset.action;
      if(a==='o4-level'){const value=button.dataset.level;const n=Number(value);if(value==='auto'||[1,2,3,4].includes(n)){o4Data.level=value==='auto'?null:n;saveO4();render();}}
      else if(a==='o4-start'){startPilotO4();}
      else if(a==='o3-pilot-open'){startPilotO3(app.querySelector('#o3-pilot-picker')?.value);}
      else if(a==='reward-preview-open'){startPilotO3('o3-omdat-01',true);}
      else if(a==='reward-preview-again'){if(isWorld())startWorld(state.worldId);else startPilotO3('o3-omdat-01',true);}
      else if(a==='reward-chest-open'&&isRewardPreview()&&state.screen==='end'&&!state.previewChestOpen){stopAudio();state.previewChestOpen=true;render();playRewardChestSound();}
      else if(a==='reward-demo-complete'&&isRewardPreview()&&state.screen==='exercise'&&!state.completed){state.positions=item().solutions[0].slice();check();}
      else if(a==='o3-pilot-again'){startPilotO3(O3_PILOT[Math.floor(Math.random()*O3_PILOT.length)].id);}
      else if(a==='vtt-pilot-open'){startPilotVTT(app.querySelector('#vtt-pilot-picker')?.value);}
      else if(a==='vtt-pilot-again'){startPilotVTT(VTT_PILOT[(Math.floor(Math.random()*VTT_PILOT.length))].id);}
      else if(a==='qa-jump'){
        const selectedId=app.querySelector('#qa-picker')?.value;
        const q=ALL_LEGACY_ITEMS.find(x=>x.id===selectedId);
        if(!q)return;
        const w=q.primaryWorld || (itemPerspective(q)==='ik'?'zelf':'school');
        const rest=worldItems(w).filter(x=>x.id!==q.id).slice(0,4);
        const items=[q,...rest];
        while(items.length<5)items.push(q);
        profileMenuOpen=false;parentPanelOpen=false;stopAudio();
        const {audioOn,motionOn}=state;
        state={screen:'exercise',worldId:w,lessonItems:items,mode:q.tiles?'order':'morph',
          series:0,index:0,positions:[],selected:null,attempts:0,helpUsed:false,
          solvedFirst:0,message:'',showHint:false,completed:false,focusPos:null,audioOn,motionOn,settingsOpen:false};
        resetItem();render();speak(taskInstruction());
      }
      else if(a==='world-open'){startWorld(button.dataset.world);} 
      else if(a==='repeat-world'){startWorld(button.dataset.world);}
      else if(a==='world-progress'){profileMenuOpen=false;app.querySelector('.op1-menu')?.remove();const p=app.querySelector('#op1-progress');if(p){p.open=true;p.scrollIntoView({behavior:state.motionOn?'smooth':'instant',block:'center'});p.setAttribute('tabindex','-1');p.focus({preventScroll:true});}}
      else if(a==='world-profile'){profileMenuOpen=!profileMenuOpen;render();}

      else if(a==='profile-edit'){
        profileMenuOpen=false;pendingAvatarPurchase=null;
        profileDraftName=preferences.displayName||'';
        profileDraftAvatar=validProfileAvatar(preferences.avatarId);
        profileDialogOpen=true;render();app.querySelector('#zinbo-profile-name')?.focus();
      }
      else if(a==='profile-avatar'&&profileDialogOpen){
        profileDraftName=app.querySelector('#zinbo-profile-name')?.value||'';
        profileDraftAvatar=validProfileAvatar(button.dataset.avatar);
        pendingAvatarPurchase=null;
        render();app.querySelector('[data-avatar="'+profileDraftAvatar+'"]')?.focus();
      }
      else if(a==='profile-avatar-choose'&&profileDialogOpen&&avatarOwned(profileDraftAvatar)){
        preferences.avatarId=validProfileAvatar(profileDraftAvatar);saveLearning();render();
      }
      else if(a==='profile-avatar-buy'&&profileDialogOpen&&!avatarOwned(profileDraftAvatar)&&stars>=AVATAR_PRICE){pendingAvatarPurchase=profileDraftAvatar;render();}
      else if(a==='profile-avatar-cancel-buy'&&profileDialogOpen){pendingAvatarPurchase=null;render();}
      else if(a==='profile-avatar-confirm'&&profileDialogOpen&&pendingAvatarPurchase===profileDraftAvatar){
        if(!avatarOwned(profileDraftAvatar)&&stars>=AVATAR_PRICE){
          stars-=AVATAR_PRICE;
          unlockedAvatarIds.push(profileDraftAvatar);
          preferences.avatarId=profileDraftAvatar;
          saveLearning();
        }
        pendingAvatarPurchase=null;render();
      }
      else if(a==='profile-cancel'&&profileDialogOpen){pendingAvatarPurchase=null;closeProfileDialog();}
      else if(a==='profile-save'&&profileDialogOpen){
        const typed=app.querySelector('#zinbo-profile-name')?.value||'';
        preferences.displayName=cleanProfileName(typed);
        saveLearning();closeProfileDialog();
      }

      else if(a==='world-group'||a==='world-settings'||a==='parent-open'){profileMenuOpen=false;parentPanelMode=a==='world-group'?'group':'settings';parentPanelOpen=true;resetConfirmOpen=false;render();app.querySelector('.parent-close')?.focus();}
      else if(a==='close-parent'){parentPanelOpen=false;resetConfirmOpen=false;render();}
      else if(a==='confirm-clear'){resetConfirmOpen=true;render();}
      else if(a==='cancel-clear'){resetConfirmOpen=false;render();}
      else if(a==='toggle-challenge'){challengeRequested=!challengeRequested;render();}
       else if(a==='routes'){stopAudio();state.screen='routes';state.lessonSkill=null;render();}
      else if(a==='challenge-home'){stopAudio();state.screen='challenge-menu';state.lessonSkill=null;render();}
       else if(a==='start-placement'){parentPanelOpen=false;profileMenuOpen=false;startPlacement();}
       else if(a==='school-group'){preferences.schoolGroup=button.dataset.group||null;saveLearning();render();const parent=app.querySelector('details.landing-parent');if(parent)parent.open=true;}
       else if(a==='start-skill')startSkill(button.dataset.skill);
      else if(a==='repeat-skill')startSkill(state.lessonSkill);
      else if(a==='clear-learning'){parentPanelOpen=false;resetConfirmOpen=false;learning=Object.fromEntries(SKILLS.map(k=>[k,emptySkill()]));placement={seen:[],history:[],done:false,recommendedLevel:null};basicHistory=[];completedSeries={order:new Set(),morph:new Set()};saveLearning();render();}
      else if(a==='start-order')pickMode('order');
      else if(a==='start-morph')pickMode('morph');
      else if(a==='home')goHome();
      else if(a==='pick-series')start(state.mode,Number(button.dataset.series));
      else if(a==='series')pickMode(state.mode);
      else if(a==='next-series')start(state.mode,state.series+1);
      else if(a==='tile')chooseTile(button.dataset.id);
      else if(a==='unplace')unplace(Number(button.dataset.pos));
      else if(a==='ending')chooseEnding(button.dataset.ending);
      else if(a==='reset'&&!state.completed){stopAudio();state.positions=state.mode==='order'?Array(item().tiles.length).fill(null):[];state.selected=null;state.message='';state.focusPos=null;render();}
      else if(a==='hint')toggleHint();
      else if(a==='settings'){state.settingsOpen=!state.settingsOpen;render();}
      else if(a==='motion'){state.motionOn=!state.motionOn;preferences.motionOn=state.motionOn;saveLearning();render();}
       else if(a==='role-colors'){preferences.roleColorsOn=preferences.roleColorsOn===false;saveLearning();render();}
      else if(a==='sound'){state.audioOn=!state.audioOn;preferences.audioOn=state.audioOn;saveLearning();stopAudio();render();if(state.audioOn)speak('Geluid aan.');}
      else if(a==='listen-preview-toggle'){preferences.listenOwnSentence=!preferences.listenOwnSentence;saveLearning();render();}
      else if(a==='speak-built')speakBuiltSentence();
      else if(a==='speak-task')speak(taskInstruction());
      else if(a==='speak-feedback')speak(state.message);
      else if(a==='hear-tile'){const tile=item().tiles.find(t=>t.id===button.dataset.id);if(tile)speak(tile.text);}
      else if(a==='check')check();
      else if(a==='answer')showAnswer();
       else if(a==='own-prompt')speakOwnPrompt();
       else if(a==='speak-correct'&&state.completed)speak(correctSentence());
        else if(a==='speak-summary'&&state.screen==='end'&&state.audioOn){const entry=(state.roundReview||[]).find(x=>x.index===Number(button.dataset.index));if(entry)speak(entry.sentence);}
      else if(a==='next')next();
      else if(a==='again')start(state.mode,state.series);
    }));
    if(profileDialogOpen){
      app.querySelector('#zinbo-profile-name')?.addEventListener('input',event=>{profileDraftName=event.target.value;});
    }
    setupDragging();
  }
  // Native pointer events cover mouse, pen and touch. Tap and keyboard still work.
  // Drag from the bank to a specific slot, swap two placed tiles, or drag an ending to the suffix.
  function setupDragging(){
    app.querySelectorAll('[data-draggable]').forEach(source=>{
      source.addEventListener('pointerdown',event=>{
        if(event.button!==0 || state.screen!=='exercise')return;
        const startX=event.clientX,startY=event.clientY;
        let dragging=false,ghost=null,highlight=null;
        const kind=source.dataset.draggable;
        const id=source.dataset.id;
        const from=source.dataset.pos===undefined?null:Number(source.dataset.pos);
        const ending=source.dataset.ending;
        const cleanup=()=>{
          if(ghost)ghost.remove();
          if(highlight)highlight.classList.remove('drop-target');
          ghost=null;highlight=null;
          source.removeEventListener('pointermove',move);
          source.removeEventListener('pointerup',up);
          source.removeEventListener('pointercancel',cancel);
        };
        const move=e=>{
          if(!dragging&&Math.hypot(e.clientX-startX,e.clientY-startY)<9)return;
          if(!dragging){
            dragging=true;
            ghost=document.createElement('div');
            ghost.className='drag-ghost';ghost.textContent=source.textContent.trim();
            document.body.appendChild(ghost);
            source.classList.add('is-dragging');
          }
          ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';
          if(highlight)highlight.classList.remove('drop-target');
          const drop=document.elementFromPoint(e.clientX,e.clientY);
          highlight=drop&&(kind==='tile'?drop.closest('[data-slot]'):drop.closest('[data-ending-slot]'));
          if(highlight)highlight.classList.add('drop-target');
        };
        const up=e=>{
          const target=dragging?document.elementFromPoint(e.clientX,e.clientY):null;
          const dest=target&&(kind==='tile'?target.closest('[data-slot]'):target.closest('[data-ending-slot]'));
          cleanup();source.classList.remove('is-dragging');
          if(!dragging)return;
          suppressDragClick={button:source,until:Date.now()+300};
          if(kind==='tile'&&dest){placeTile(id,Number(dest.dataset.slot),from);const t=item().tiles.find(t=>t.id===id);if(t)speak(t.text);}
          else if(kind==='ending'&&dest)chooseEnding(ending);
        };
        const cancel=()=>{cleanup();source.classList.remove('is-dragging');};
        source.addEventListener('pointermove',move);
        source.addEventListener('pointerup',up);
        source.addEventListener('pointercancel',cancel);
        try{source.setPointerCapture(event.pointerId);}catch(_){}
      });
    });
  }
  document.addEventListener('keydown',event=>{
    if(profileDialogOpen&&event.key==='Tab'){
      const dialog=app.querySelector('.zinbo-profile-dialog');
      const focusable=dialog?[...dialog.querySelectorAll('button:not([disabled]),input:not([disabled])')]:[];
      const first=focusable[0],last=focusable[focusable.length-1];
      if(first&&last&&((event.shiftKey&&document.activeElement===first)||(!event.shiftKey&&document.activeElement===last))){
        event.preventDefault();(event.shiftKey?last:first).focus();
      }
    }
    if(event.key==='Escape'&&profileDialogOpen){event.preventDefault();closeProfileDialog();return;}
    if(event.key==='Escape'&&parentPanelOpen){parentPanelOpen=false;resetConfirmOpen=false;render();return;}
    if(event.key==='Escape'&&profileMenuOpen){profileMenuOpen=false;render();return;}
    if(event.key==='Escape'&&state.settingsOpen){state.settingsOpen=false;render();return;}
    if(event.key==='Backspace'&&state.screen==='exercise'&&state.mode==='order'&&!state.completed && !event.target.closest('input,textarea,[contenteditable]')){
      const last=state.positions.findLastIndex(id=>id!==null);
      if(last>=0){event.preventDefault();unplace(last);}
    }
  });
  // Small test surface used only to verify deterministic educational logic in a browser.
  Object.defineProperty(window,'__zinsbouwerTest',{value:Object.freeze({getOrder:()=>ORDER.map(({id,solutions,tiles,bankOrder,beginWith})=>({id,solutions,tiles,bankOrder,beginWith})),getMorph:()=>MORPH.map(({id,stem,ending,full})=>({id,stem,ending,full})),getState:()=>JSON.parse(JSON.stringify(state)),getAudioAudit:()=>audioAudit.map(x=>({...x})),getCurrentId:()=>item()?.id||null,getWorldItemIds:id=>worldItems(id).map(q=>q.id),getNextPreview:()=>state.lessonSkill?state.lessonItems.map(q=>q.id):state.seriesItems,getSeries:()=>JSON.parse(JSON.stringify(SERIES)),getCurrent:()=>JSON.parse(JSON.stringify(item())),getAdvanced:()=>JSON.parse(JSON.stringify(ADVANCED)),getLearning:()=>JSON.parse(JSON.stringify(learning)),getPlacement:()=>JSON.parse(JSON.stringify(placement)),getBasicHistory:()=>JSON.parse(JSON.stringify(basicHistory)),getPreferences:()=>({...preferences}),getProfileAvatars:()=>PROFILE_AVATARS.map(a=>({...a})),getHintAudit:()=>{
    const seen=new Set();
    const banks=[...ORDER,...O3_PILOT,...VTT_PILOT,...Object.values(V43_CANDIDATES).flat(),...Object.values(ADVANCED).flat()];
    return banks.filter(q=>q?.id&&q.tiles&&q.solutions&&!seen.has(q.id)&&seen.add(q.id)).map(q=>{
      const verb=q.tiles.filter(t=>t.role==='verb');
      return {id:q.id,kind:q.kind||'order',hint:hintText(q),expectedSlot:commonVerbSlot(q),
        verbPositions:q.solutions.map(sol=>verb.map(v=>sol.indexOf(v.id)+1))};
    });
  },getCandidates:()=>JSON.parse(JSON.stringify(V43_CANDIDATES)),getEvidenceSummary:()=>evidenceSummary(),getReleasedIds:()=>SKILLS.flatMap(k=>ADVANCED[k].filter(q=>q.id.startsWith("v43-")).map(q=>q.id)),getCandidateCounts:()=>Object.fromEntries(SKILLS.map(k=>[k,V43_CANDIDATES[k].length])),getSceneCount:()=>Object.keys(SCENE_ART).length,getO4State:()=>JSON.parse(JSON.stringify(o4Data)),getO4Evidence:()=>O4_GOALS.map(g=>o4Evidence(g)),getO4Goals:()=>[...O4_GOALS],getRewardPreview:()=>({active:isRewardPreview(),coins:state.previewCoins||0,storedCoins:rewardCoins,chestOpen:!!state.previewChestOpen}),getQAMode:()=>QA_PREVIEW,getQAExtraIds:()=>[...QA_EXTRA_IDS],startPilotO3Test:()=>startPilotO3('o3-omdat-01'),startPilotVTTTest:()=>startPilotVTT('vtt-001'),startRewardTest:()=>startPilotO3('o3-omdat-01',true)})});
  render();
})();
