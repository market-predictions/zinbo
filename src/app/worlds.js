  function worldCard(w,selectedId){
    const pool=worldItems(w.id),visited=worldPracticedIds(w.id),playable=worldIsPlayable(w.id);
    const art={zelf:'pet-dog.webp',school:'school-gate.webp',sport:'sports-field.webp',thuis:'kitchen-cooking.webp',familie:'family-talk.webp',uitstapjes:'town-outing.webp'}[w.id];
    const cover=V43_ART[art]||SCENE_ART[w.art]||SCENE_ART['bike-to-school.webp'];
    const progress=playable&&pool.length?Math.round(100*visited.size/pool.length):0;
    const icons={zelf:['person','orange'],school:['graduation-cap','blue'],sport:['target','green'],thuis:['house','purple'],familie:['users','pink'],uitstapjes:['map-pin','muted']};
    const [icon,theme]=icons[w.id];
    return `<button ${playable?`data-action="world-open" data-world="${w.id}"`:'disabled aria-disabled="true"'} class="op1-card ${selectedId===w.id&&playable?'is-selected ':''}${playable?'':'op1-card-pending'}" aria-label="${esc(w.name)}: ${playable?`${visited.size} van ${pool.length} oefeningen geoefend`:'Nog niet beschikbaar'}">
      <img src="${cover}" alt="" draggable="false">${!playable?`<span class="op1-lock" title="Nog niet beschikbaar">${opIcon('lock',23)}</span>`:''}
      <span class="op1-card-body"><span class="op1-card-icon ${theme}">${opIcon(icon,25)}</span><span><span class="op1-card-name">${esc(w.name)}</span><span class="op1-card-desc">${esc(w.sub)}</span></span><span class="op1-card-arrow">${playable?opIcon('chevron-right',19):''}</span></span>
      <span class="op1-card-bottom"><span class="op1-card-bar" aria-hidden="true"><i style="width:${progress}%"></i></span><small>${playable?`${visited.size} / ${pool.length}`:opIcon('lock',19)}</small></span>
    </button>`;
  }
  let parentPanelMode='settings';
  function parentPanel(){
    const isGroup=parentPanelMode==='group';
    const chosen=o4Data.level?`Niveau ${o4Data.level}`:'Kies niveau';
    return `<div class="world-parent-backdrop" data-action="close-parent" aria-hidden="true"></div><section class="world-parent-dialog" role="dialog" aria-modal="true" aria-labelledby="parent-title">
    <header><div><span class="parent-kicker">${isGroup?'Kies een uitdagingsniveau':'Voor ouders en begeleiders'}</span><h2 id="parent-title">${isGroup?'Niveau 1 tot en met 4':'Instellingen'}</h2></div><button class="parent-close" data-action="close-parent" aria-label="Sluiten">×</button></header>
    ${isGroup?`<p>Het gekozen niveau bepaalt het <strong>soort oefenzinnen</strong> in de werelden, geen gemeten taalniveau. Niveau 4 bevat voorlopig gevorderde bestaande zinnen; VTT en bijzinnen zijn nog niet vrijgegeven.</p>${groupSelector()}<div class="parent-note"><strong>Instap:</strong> ${chosen}. ${placement.done?'Kennismaking afgerond.':'Kennismaking: '+Math.min(5,placement.history.length)+' van 5 oefenzinnen.'} Dit is geen schoolgroep en geen taaldiagnose.</div><button class="parent-primary" data-action="start-placement">${opIcon('play',22)} ${placement.done?'Kennismaking opnieuw doen':'Start kennismaking'}</button>`
    :`<p>Kies hoe je wilt oefenen. Deze instellingen gelden op dit apparaat.</p><div class="parent-settings"><button data-action="sound" aria-pressed="${state.audioOn}">${opIcon('volume',24)} Geluid <strong>${state.audioOn?'Aan':'Uit'}</strong></button><button data-action="motion" aria-pressed="${state.motionOn}">${opIcon('settings',24)} Animaties <strong>${state.motionOn?'Aan':'Uit'}</strong></button><button data-action="listen-preview-toggle" aria-pressed="${preferences.listenOwnSentence}">${opIcon('volume',24)} Mijn zin terugluisteren (proef) <strong>${preferences.listenOwnSentence?'Aan':'Uit'}</strong></button></div><p class="parent-note">Zelf terugluisteren is een optionele proef met begeleiding. Een fout gelegde zin kan ook fout klinken. Daarom standaard uit.</p><p class="parent-privacy">De voortgang blijft in deze browser opgeslagen. Oefenresultaten bewijzen niet automatisch dat een kind zinnen spontaan kan gebruiken.</p>${resetConfirmOpen?'<div class="reset-confirm"><strong>Alle oefenresultaten wissen?</strong><p>Dit kan niet ongedaan gemaakt worden.</p><button data-action="clear-learning">Ja, resultaten wissen</button><button data-action="cancel-clear">Annuleren</button></div>':'<button class="parent-reset" data-action="confirm-clear">Oefenresultaten wissen</button>'}`}
    </section>`;
  }
  function worldDashboard(){
    const evidence=worldHeading();
    const playable=WORLD_INFO.filter(w=>worldIsPlayable(w.id));
    const last=playable.find(w=>w.id===preferences.lastWorld)||playable[0];
    const chosen=o4Data.level?`Niveau ${o4Data.level}`:'Kies niveau';
    const placed=Math.min(5,placement.history.length);
    const pct=(placed/5)*100;
    const successRate=evidence.count?Math.round(100*evidence.independent/evidence.count):0;
    // These are factual activity ratios, NOT clinical language mastery or a school-group score.
    const approvedTotal=ALL_LEGACY_ITEMS.length;
    const discoveryRate=approvedTotal?(evidence.unique?Math.min(100,100*evidence.unique/approvedTotal<1?Number((100*evidence.unique/approvedTotal).toFixed(1)):Math.round(100*evidence.unique/approvedTotal)):0):0;
    const verbPool=new Set(ALL_LEGACY_ITEMS.map(evidenceFamily).filter(Boolean));
    const totalVerbs=verbPool.size;
    const verbsRate=totalVerbs?Math.min(100,Math.round(100*evidence.words/totalVerbs)):0;
    return `<div class="op1-root" aria-label="Zinbo startpagina">
      <header class="op1-header"><button class="op1-home" data-action="home" aria-label="Startpagina">${uiIcon('home',29)}</button>
        <div class="op1-brand"><strong>Zinbo</strong><span>Zinnen maken. Stap voor stap.</span></div>
        <div class="op1-toolbar"><button data-action="profile-edit" class="op1-pill op1-star" aria-label="${stars} ${stars===1?'ster':'sterren'} beschikbaar. Open avatarbibliotheek" title="Kies een avatar">${opIcon('star',28)}<strong>${stars}</strong></button>
          <button data-action="world-group" class="op1-pill op1-group" aria-label="Oefenniveau: ${chosen}. Kennismaking ${placed} van 5.">${opIcon('graduation-cap',26)}<span class="op1-group-copy"><span>Instap</span><strong>${chosen}</strong><small>${placement.done?'Kennismaking klaar':`${placed} van 5 oefenzinnen`}</small></span><span class="op1-group-track" aria-hidden="true"><i style="width:${pct}%"></i></span></button>
          <div class="op1-profile-holder"><button data-action="world-profile" class="op1-pill op1-profile" aria-haspopup="menu" aria-expanded="${profileMenuOpen}"><span class="op1-profile-avatar">${profileAvatar(preferences.avatarId)}</span><span class="op1-profile-name">${esc(profileLabel())}</span>${opIcon('chevron-down',19)}</button>
          ${profileMenuOpen?`<div class="op1-menu" role="menu"><button role="menuitem" data-action="profile-edit">${opIcon('circle-check',22)} Mijn profiel en avatars</button><button role="menuitem" data-action="world-progress">${opIcon('chart-column',22)} Jouw voortgang</button><button role="menuitem" data-action="world-group">${opIcon('graduation-cap',22)} Oefenniveau</button><button role="menuitem" data-action="start-placement">${opIcon('play',22)} Kennismaking</button><button role="menuitem" data-action="parent-open">${opIcon('users',22)} Voor ouders</button></div>`:''}</div>
        </div>
      </header>
      <section class="op1-hero" aria-label="Welkom bij Zinbo"><div class="op1-welcome"><div class="op1-welcome-top"><h1>Hoi!</h1><p>Waar wil je vandaag mee oefenen?</p><p class="op1-welcome-guide">Kies hieronder een wereld.</p></div></div><span class="op1-hero-message">Jij kunt dit!</span>
      </section>
      <section class="op1-worlds" aria-label="Mijn werelden"><h2>Mijn werelden</h2><p class="op1-sub">Kies wat je wilt oefenen.</p><div class="op1-cards">${WORLD_INFO.map(w=>worldCard(w,last?.id)).join('')}</div></section>
      <section class="op1-progress" id="op1-progress" aria-label="Jouw voortgang"><h2>Jouw voortgang</h2><div class="op1-progress-grid">
        <article class="op1-stat"><span class="op1-stat-icon">${opIcon('message-circle',32)}</span><span class="op1-stat-text"><strong>${evidence.unique}</strong><small>verschillende oefeningen</small></span><div class="op1-stat-meter" role="progressbar" aria-label="Verschillende oefeningen geprobeerd" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${discoveryRate}" title="${evidence.unique} van ${approvedTotal} verschillende oefeningen geprobeerd"><span class="op1-stat-deco"><i style="width:${discoveryRate}%"></i></span><small>${discoveryRate}%</small></div></article>
        <article class="op1-stat"><span class="op1-stat-icon good">${opIcon('circle-check',32)}</span><span class="op1-stat-text"><strong>${evidence.independent}</strong><small>zelfstandig goed</small></span><div class="op1-stat-meter" role="progressbar" aria-label="Zinnen zelfstandig goed gemaakt" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${successRate}" title="${evidence.independent} van ${evidence.count} antwoorden zonder hulp correct"><span class="op1-stat-deco green"><i style="width:${successRate}%"></i></span><small>${successRate}%</small></div></article>
        <article class="op1-stat"><span class="op1-stat-icon accent">${opIcon('chart-column',32)}</span><span class="op1-stat-text"><strong>${evidence.words}</strong><small>werkwoorden geoefend</small></span><div class="op1-stat-meter" role="progressbar" aria-label="Verschillende werkwoorden geoefend" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${verbsRate}" title="${evidence.words} van ${totalVerbs} herkenbare werkwoordfamilies geoefend"><span class="op1-stat-deco orange"><i style="width:${verbsRate}%"></i></span><small>${verbsRate}%</small></div></article>
      </div>
      <div class="op1-progress-action-row">
        <div class="op1-progress-next"><span class="op1-stat-icon">${opIcon('target',28)}</span><span><strong>Volgende stap</strong><small>${last?esc(last.name):'Kies een nieuwe uitdaging'}</small></span></div>
        <button class="op1-start" ${last?`data-action="world-open" data-world="${last.id}"`:'data-action="routes"'}>${opIcon('play',27)} <strong>Verder oefenen</strong></button>
        <button class="op1-change-challenge" data-action="challenge-home">Andere uitdaging</button>
      </div>
    </section>
      <details class="op1-other"><summary>Andere oefenroutes</summary><div class="op1-other-buttons"><button data-action="routes">${opIcon('book-open',20)} Basisoefeningen</button><button data-action="challenge-home">${opIcon('target',20)} Nieuwe uitdaging</button><button data-action="start-placement">${opIcon('play',20)} Kennismaking</button></div></details>
      ${parentPanelOpen?parentPanel():''}${profileDialogOpen?profileDialog():''}</div>`;
  }
  function goHome(){profileMenuOpen=false;stopAudio();state.screen='home';state.mode=null;state.lessonSkill=null;state.worldId=null;render();}
  function pickMode(mode){stopAudio();state.lessonSkill=null;state.mode=mode;state.screen='series';render();}
  function start(mode,series=0){
    stopAudio();
    const {audioOn,motionOn}=state;
    state={screen:'exercise',motionOn,settingsOpen:false,mode,series,index:0,seriesItems:shuffleItems(SERIES[mode][series]),positions:[],selected:null,attempts:0,helpUsed:false,solvedFirst:0,message:'',showHint:false,completed:false,focusPos:null,audioOn};
    resetItem();render();speak(taskInstruction());
  }
  function resetItem(){if(isAuthorPilot()){const same=state.pilotCurrentId===item().id;state.pilotCurrentId=item().id;if(!same){state.pilotAttemptedError=false;state.pilotUsedHelp=false;}}state.positions=state.mode==='order'?Array(item().tiles.length).fill(null):[];state.selected=null;state.choiceOrder=Array.isArray(item().choices)?shuffleItems(item().choices):null;state.attempts=0;state.helpUsed=false;state.message='';state.showHint=false;state.completed=false;state.answerRevealed=false;state.focusPos=null;}
  function chooseTile(id){if(state.screen!=='exercise'||state.completed)return;let empty=state.positions.findIndex(x=>x===null);if(empty<0)return;placeTile(id,empty);const t=item().tiles.find(t=>t.id===id);if(t)speak(t.text);}
  function placeTile(id,at,from=null){
    if(state.screen!=='exercise'||state.completed||state.mode!=='order'||at<0||at>=state.positions.length)return;
    const existing=state.positions.indexOf(id);
    const origin=from===null?existing:from;
    if(origin===at)return;
    const displaced=state.positions[at];
    if(origin>=0)state.positions[origin]=displaced; // swap when moving a placed tile
    state.positions[at]=id; // from bank: displaced tile simply returns to the bank
    stopAudio();
    state.message='';state.focusPos=null;render();
  }
  function unplace(idx){if(state.screen!=='exercise'||state.completed)return;stopAudio();state.positions[idx]=null;state.message='';state.focusPos=null;render();}
  function chooseEnding(value){if(state.screen!=='exercise'||state.completed)return;stopAudio();state.selected=value;state.message='';render();}
  function toggleHint(){if(state.completed)return;state.showHint=!state.showHint;if(state.showHint){state.helpUsed=true;if(isAuthorPilot()){state.pilotUsedHelp=true;state.message='';}}render();if(state.showHint)speak(hintText(item()));}
  // The instruction shown on screen is the exact text that gets spoken.
  // One short context and one concrete action; grammar rules are available via Hint.
  function taskInstruction(){
    const q=item();
    if(q.kind==='because'||q.kind==='conditional')
      return q.contextCue+' Maak met de blokjes één zin met '+(q.kind==='because'?'omdat.':'als.');
    if(q.kind==='vtt')return q.contextCue;
    if(q.kind==='tense'||q.kind==='strong')return q.prompt+' Kies het goede werkwoord.';
    if(state.mode==='order')return (q.beginWith?'Begin met '+q.beginWith+'. ':'')+'Maak met de blokjes een zin.';
    return 'Maak het werkwoord af. Kies wat past.';
  }
  function finishItem(){
    if(state.attempts===0&&!state.helpUsed){state.solvedFirst++;} // Language evidence is separate from spendable stars.
    if(isPilotO4())recordPilotO4();
    else if(isPilotVTT())recordPilotVTT();
    else if(isPilotO3()){if(!isRewardPreview())recordPilotO3();}
    else if(isPlacement())recordPlacementResult();
    else if(isWorld())recordBasicResult();
    else if(isAdaptive())recordAdaptiveResult();
    else recordBasicResult();
    if(isRewardPreview()){
      // Visual QA only: never write practice rewards or learning evidence.
      state.previewLastGain=isWorld()?1:(state.attempts===0&&!state.helpUsed?2:1);
      state.previewCoins+=state.previewLastGain;
      // Coins are only a visual count within this five-sentence round.
    }
    state.completed=true;
    state.message='';state.focusPos=null;
    render();
    // The exercise stays on screen, including the child's finished sentence.
    focusInlineNote();
    if(isRewardPreview()){
      // Reward sound and motion follow the complete spoken language model.
      speak('Goed! '+correctSentence(),()=>animateRewardCoin());
    }else if(state.answerRevealed)speak(correctSentence());
    else celebrateAndRead();
  }
  function check(){
    if(state.screen!=='exercise'||state.completed||!currentComplete())return;
    const q=item();
    const correct=state.mode==='order'
      ?q.solutions.some(sol=>sol.every((id,i)=>state.positions[i]===id))
      :state.selected===q.ending;
    if(correct){finishItem();return;}
    state.attempts++;
    if(isAuthorPilot())state.pilotAttemptedError=true;
    if(state.mode==='morph'){
      state.selected=null;
      if(q.kind==='tense'||q.kind==='strong')state.message=state.attempts>=2?'Kies '+q.ending+'.':q.when==='Nu'?'Dit gebeurt nu. Welk woord past?':'Dit gebeurde gisteren. Welk woord past?';
      else {
      state.message=state.attempts>=2
        ?'Tik op '+(q.ending===''?'geen einde':'-'+q.ending)+'.'
        :q.count==='many'?'Kijk naar '+q.subject+'. Dat zijn meer mensen.'
        :q.count==='i'?'Kijk naar ik. Welk einde past?'
        :'Kijk naar '+q.subject+'. Eén persoon.';
      }
    }else{
      if(q.kind==='conditional'||q.kind==='because'){
        const best=q.solutions.reduce((winner,sol)=>!winner||sol.filter((id,i)=>state.positions[i]!==id).length < winner.filter((id,i)=>state.positions[i]!==id).length?sol:winner,null);
        const wrong=best.findIndex((id,i)=>state.positions[i]!==id);
        state.focusPos=wrong;
        state.message=state.attempts>=2
          ?'Zet '+q.tiles.find(t=>t.id===best[wrong]).text+' op plek '+(wrong+1)+'.'
          :q.kind==='conditional'?'Kijk naar de woorden ná als. Waar komt het werkwoord?':'Kijk naar het stukje na omdat. Wat hoort op plek '+(wrong+1)+'?';
        render();focusInlineNote();speak(state.message);return;
      }
      const verbIndex=state.positions.findIndex(id=>q.tiles.find(t=>t.id===id)?.role==='verb');
      const requiredVerbIndex=commonVerbSlot(q); // No hardcoded V2 for items with different valid orders.
      const solutions=q.solutions.filter(sol=>!q.beginWith||sol[0]===q.solutions[0][0]);
      const best=[...solutions].sort((a,b)=>a.filter((id,i)=>state.positions[i]!==id).length-b.filter((id,i)=>state.positions[i]!==id).length)[0];
      const difference=best.findIndex((id,i)=>state.positions[i]!==id);
      if(q.beginWith&&state.positions[0]!==q.solutions[0][0]){
        state.focusPos=0;state.message=state.attempts>=2?'Begin met '+q.beginWith+'.':'Kijk naar plek 1. Waar begin je mee?';
      }else if(requiredVerbIndex>=0&&verbIndex!==requiredVerbIndex){
        state.focusPos=requiredVerbIndex;
        state.message=state.attempts>=2
          ?'Zet '+q.tiles.find(t=>t.role==='verb').text+' op plek '+(requiredVerbIndex+1)+'.'
          :'Kijk naar het oranje werkwoord. Hoort het op plek '+(requiredVerbIndex+1)+'?';
      }else{
        state.focusPos=difference;
        state.message=state.attempts>=2
          ?'Sleep '+q.tiles.find(t=>t.id===best[difference]).text+' naar plek '+(difference+1)+'.'
          :'Kijk naar plek '+(difference+1)+'. Welk stukje hoort daar?';
      }
    }
    render();focusInlineNote();speak(state.message);
  }
  function focusInlineNote(){
    const note=app.querySelector('.feedback');
    if(!note)return;
    note.focus({preventScroll:true});
    // If the child scrolled to the bank, bring feedback back beside the sentence.
    // This is an in-page adjustment, never a new screen or a forced next exercise.
    const target=app.querySelector('.slots,.stem-line');
    if(!target)return;
    const a=target.getBoundingClientRect(),b=note.getBoundingClientRect();
    if(a.top>=10 && b.bottom<=window.innerHeight-8)return;
    const height=b.bottom-a.top;
    const top=height<=window.innerHeight-20?a.top-12:b.top-12;
    if(top<10||b.bottom>window.innerHeight-8){
      window.scrollBy({top:top,behavior:'instant'});
    }
  }
  function showAnswer(){
    if(state.screen!=='exercise'||state.attempts<2||state.completed)return;
    state.helpUsed=true;state.answerRevealed=true;
    if(isAuthorPilot())state.pilotUsedHelp=true;
    const q=item();
    const model=state.mode==='order'?sentence(q,q.solutions[0]):q.full;
    // Model the correct form, then require the child to rebuild it.
    state.positions=state.mode==='order'?Array(q.tiles.length).fill(null):[];
    state.selected=null;
    state.message='Zo kan het: '+model+' Maak het nu zelf opnieuw.';
    state.focusPos=null;render();speak(model);
  }
  function awardRoundStar(){
    if(state.roundStarAwarded)return;
    state.roundStarAwarded=true;
    stars+=1;saveLearning();
  }
  function next(){
    if(state.screen!=='exercise'||!state.completed)return;
    stopAudio();
    if(isAuthorPilot()){
      if(state.index>=4){state.screen='end';render();speak(isRewardPreview()?'Vijf zinnen gemaakt. Open je schatkist!':'Goed geoefend! Deze auteurspilot blijft in beoordeling.');}
      else{state.index++;if(isPilotO4()){const nextItem=o4Next(state.o4StartLevel,state.lessonItems.map(q=>q.id),state.index);if(nextItem){state.lessonItems.push(nextItem);state.mode=nextItem.tiles?'order':'morph';}else{state.screen='end';render();return;}}resetItem();render();speak(taskInstruction());}
      return;
    }
    if(isPlacement()){
      if(state.index>=4){state.screen='end';render();speak('Goed gedaan! Je kunt nu kiezen wat je wilt oefenen.');}
      else {state.index++;state.lessonItems.push(placementItem(state.index));state.mode=item().kind==='inversion'?'order':'morph';resetItem();render();speak(taskInstruction());}
      return;
    }
    if(isWorld()){
      if(state.index>=4){awardRoundStar();state.screen='end';render();speak('Goed geoefend! Je hebt één ster verdiend.');}
      else{state.index++;state.mode=item().tiles?'order':'morph';resetItem();render();speak(taskInstruction());}
      return;
    }
    if(isAdaptive()){
      if(state.index>=4){
        awardRoundStar();
        // A five-item block is a milestone, not a compulsory stopping point.
        // Continue only when the learner chooses the visible "Nog 5 zinnen" button.
        state.screen='end';render();speak('Goed geoefend! Wil je nog vijf zinnen?');
      } else {
        state.index++;
        state.lessonItems.push(pickAdaptiveItem(state.lessonSkill,state.lessonItems.map(q=>q.id)));
        resetItem();render();speak(taskInstruction());
      }
      return;
    }
    if(state.index>=state.seriesItems.length-1){
      awardRoundStar();
      completedSeries[state.mode].add(state.series);
      state.screen='end';render();speak('Goed geoefend! Wil je nog een serie?');
    }else{
      state.index++;resetItem();render();speak(taskInstruction());
    }
  }
  function baseLayout(content){app.innerHTML=content;wire();}

  function landingTop(){
    return `<div class="landing-top"><div class="landing-brand"><span class="landing-brand-mark" aria-hidden="true">Z</span><span>Zinbo</span></div><div class="landing-rewards" title="Beschikbare avatarsterren" aria-label="${stars} ${stars===1?'ster':'sterren'} beschikbaar"> <span class="star-symbol" aria-hidden="true">★</span><strong>${stars}</strong></div></div>`;
  }
  function landingHero(title, description, kicker='Tijd om te oefenen',small=false){
    const image=SCENE_ART['bike-to-school.webp'];
    return `<div class="landing-hero ${small?'landing-hero-small':''}">
      <img class="landing-image" src="${image}" alt="" aria-hidden="true" draggable="false">
      <div class="landing-hero-text"><span class="landing-kicker">${esc(kicker)}</span><h1>${esc(title)}</h1><p>${esc(description)}</p></div>
    </div>`;
  }
  function landingCard(action,kind,title,description,visual,meta,badge=''){
    return `<button class="landing-card landing-${kind}" data-action="${action}" aria-label="${esc(title)}. ${esc(description)}">
      <span class="landing-card-top"><span class="landing-kind">${badge||'Oefenen'}</span><span class="landing-card-arrow" aria-hidden="true">→</span></span>
      <span class="landing-preview" aria-hidden="true">${visual}</span>
      <span class="landing-card-copy"><strong>${esc(title)}</strong><span>${esc(description)}</span></span>
      <span class="landing-card-bottom">${esc(meta)}<span aria-hidden="true">→</span></span>
    </button>`;
  }
  function groupSelector(){
    return `<div class="group-selector"><p><strong>Oefenniveau (1–4)</strong><span class="group-description"> 1: basiszinnen · 2: tijdsvormen · 3: omdraaien en afwisselen · 4: gevorderde varianten. Een startpunt, geen meting.</span></p><div class="group-options">${[1,2,3,4].map(n=>`<button type="button" class="group-option" data-action="o4-level" data-level="${n}" aria-pressed="${o4Data.level===n}">Niveau ${n}</button>`).join('')}</div>${preferences.schoolGroup?`<p>Historische schoolgroep ${esc(preferences.schoolGroup)} blijft bewaard, maar is niet automatisch omgezet.</p>`:''}</div>`;
  }
  function parentDetails(text,clear=false){
    return `<details class="review-info landing-parent"><summary>Voor ouders en begeleiders</summary><div class="parent-content"><p>${text}</p>${groupSelector()}${clear?'<button class="secondary" data-action="clear-learning">Oefenvoortgang wissen</button>':''}</div></details>`;
  }
  function home(){
    const row=`<span class="preview-word">Sam</span><span class="preview-word preview-verb">fietst</span><span class="preview-word">naar school</span>`;
    const morph=`<span class="preview-word">fiets</span><span class="preview-plus">+</span><span class="preview-word preview-verb">t</span><span class="preview-equals">=</span><span class="preview-word">fietst</span>`;
    return `<section class="panel home landing-shell">${landingTop()}${landingHero('Maak jij de zin?', 'Kies een oefening. Je mag tikken, slepen en luisteren.', 'Welkom bij Zinbo')}
      <div class="landing-content"><div class="landing-section-label">Wat wil je oefenen?</div><div class="landing-choice-grid">
      ${landingCard('start-order','order','Zinnen bouwen','Zet de woorden in de goede volgorde.',row,'4 series · telkens 5 zinnen','Zinnen')}
      ${landingCard('start-morph','morph','Werkwoorden maken','Kies de vorm die bij de zin past.',morph,'4 series · telkens 5 zinnen','Werkwoorden')}
      </div><button class="placement-invite" data-action="start-placement"><span aria-hidden="true">✦</span><span><strong>${placement.done?'Nog eens kennismaken':'Even kijken wat je al kunt'}</strong><small>Vijf rustige proefzinnen, geen toets of cijfer</small></span><span aria-hidden="true">→</span></button><button class="landing-challenge" data-action="challenge-home"><span class="challenge-symbol" aria-hidden="true">✦</span><span class="challenge-copy"><strong>Nieuwe uitdaging</strong><small>Verleden tijd, bijzondere werkwoorden en omdraaien</small></span><span class="challenge-arr" aria-hidden="true">→</span></button>
      ${parentDetails('Dit is een oefenprototype voor kinderen met TOS, geen bewezen behandeling. Oefenvoortgang blijft alleen in deze browser. De inhoud vraagt nog review door een logopedist.')}</div></section>`;
  }
  function seriesScreen(){
    const labels=state.mode==='order'?
      ['Korte zinnen','Meer stukjes','Tijd en plaats','Zinnen omdraaien']:
      ['Ik, hij en wij','Andere werkwoorden','Verder oefenen','Alles door elkaar'];
    const marker=state.mode==='order'?'Zinnen bouwen':'Werkwoorden maken';
    return `<section class="panel home landing-shell">${landingTop()}${landingHero('Kies een serie', 'Vijf zinnen per serie. Je kunt daarna meteen verder.',marker,true)}
      <div class="landing-content"><button class="landing-back" data-action="home">← Terug naar oefeningen</button><div class="landing-section-label">${esc(marker)} · 4 series</div>
      <div class="series-grid premium-series">${labels.map((label,i)=>`<button class="series-card" data-action="pick-series" data-series="${i}" aria-label="Serie ${i+1}: ${esc(label)}. Vijf oefeningen.${completedSeries[state.mode].has(i)?' Eerder gedaan.':''}"><span class="series-number">SERIE ${String(i+1).padStart(2,'0')}</span><span class="series-symbol" aria-hidden="true">${state.mode==='order'?'<span class="series-mini-word"></span><span class="series-mini-word orange"></span><span class="series-mini-word"></span>':'<span class="series-mini-letter">ik</span><span class="series-mini-plus">+</span><span class="series-mini-letter orange">t</span>'}</span><strong>${esc(label)}</strong><span class="series-meta">${completedSeries[state.mode].has(i)?'✓ Eerder gedaan':'5 oefeningen'} <span aria-hidden="true">→</span></span></button>`).join('')}</div>
      </div></section>`;
  }


  function uiIcon(name, size=25){
    const strokes={
      audio:'<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
      muted:'<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m17 9 5 6m0-6-5 6"/>',
      replay:'<path d="M3 11a9 9 0 1 1 3 7"/><path d="M3 4v7h7"/>',
      home:'<path d="m3 10 9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
      settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 1 .34 1.87l-1 1.73a1.7 1.7 0 0 1-1.8.79l-1.67-.32a8 8 0 0 1-2.1 1.2l-.56 1.6h-2l-.55-1.6a8 8 0 0 1-2.1-1.2l-1.68.32a1.7 1.7 0 0 1-1.8-.79l-1-1.73A1.7 1.7 0 0 1 3.8 15l1.12-1.26a8 8 0 0 1 0-2.45L3.8 10a1.7 1.7 0 0 1-.33-1.87l1-1.73a1.7 1.7 0 0 1 1.8-.79l1.67.32a8 8 0 0 1 2.1-1.2l.55-1.6h2l.56 1.6a8 8 0 0 1 2.1 1.2l1.68-.32a1.7 1.7 0 0 1 1.8.79l1 1.73A1.7 1.7 0 0 1 19.4 10l-1.12 1.26a8 8 0 0 1 0 2.45Z"/>',
      bulb:'<path d="M9 18h6m-5 3h4"/><path d="M8 15c-2-1.4-3-3.4-3-5a7 7 0 1 1 14 0c0 1.6-1 3.6-3 5l-1 2H9l-1-2Z"/>',
      check:'<path d="m4 12 5.5 5.5L20 7"/>'
    };
    return `<svg class="ui-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${strokes[name]||''}</svg>`;
  }
  function topBar(){
    const total=(isWorld()||isAdaptive())?5:state.seriesItems.length;
    const done=state.index+(state.completed?1:0);
    const pct=Math.round(done/total*100);
    return `<div class="exercise-bar"><button class="round-tool back" data-action="home" aria-label="Naar het startscherm" title="Naar start">${uiIcon('home',38)}</button><div class="progress-wrap"><div class="progress-track" role="progressbar" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="${total}" aria-label="Zinnen afgerond"><span class="progress-fill" style="width:${pct}%"></span></div><span class="counter">${done} / ${total}</span></div><div class="bar-actions">${isRewardPreview()?`<div class="star-pill reward-preview-total reward-vault" role="status" aria-label="${state.previewShownCoins} munten in de schatkist"><span class="reward-vault-chest" aria-hidden="true"><span class="reward-vault-lid"></span><span class="reward-vault-slot"></span><span class="reward-vault-front">★</span></span><span class="reward-vault-number">${isWorld()?state.previewShownCoins+'/5':state.previewShownCoins}</span></div>`:`<div class="star-pill" title="Een ster voor een zin die meteen goed is, zonder hint" aria-label="${stars} sterren verdiend zonder hint of herkansing"><span aria-hidden="true" class="star-symbol">★</span><span>${stars}</span></div>`}<button class="round-tool settings-button" data-action="settings" aria-label="Instellingen" aria-expanded="${state.settingsOpen}" title="Instellingen">${uiIcon('settings',35)}</button></div>${state.settingsOpen?settingsPanel():''}</div>`;
  }
  function settingsPanel(){return `<div class="settings-panel" role="group" aria-label="Instellingen"><div class="settings-heading">Instellingen <button data-action="settings" class="close-settings" aria-label="Sluit instellingen">×</button></div><button class="setting-row" data-action="sound" aria-pressed="${state.audioOn}"><span>Geluid</span><strong>${state.audioOn?'Aan':'Uit'}</strong></button><button class="setting-row" data-action="motion" aria-pressed="${state.motionOn}"><span>Beweging</span><strong>${state.motionOn?'Aan':'Uit'}</strong></button><p>★ Een ster krijg je als de zin meteen goed is, zonder hint.</p></div>`;}
  function toolbar(){return `<button class="hero-listen round-tool" data-action="speak-task" ${state.audioOn?'':'disabled'} aria-label="Lees de opdracht voor" title="Luister naar de opdracht">${uiIcon('audio',43)}</button>`;}
  const SCENE_LABELS={
    o1:'Sam is buiten met een bal.',o2:'De hond is vandaag buiten.',
    o3:'Oma heeft een boek op de bank.',o4:'Sam is gisteren met zijn vriend in het park.',
    o5:'Sara heeft vandaag een pakket voor oma.'
  };

  function visualScene(q){
    const id=q.id;
    const palette={sky:'#edf6fa',grass:'#d4ead3',hill:'#bfdcb9',ink:'#2b465d',skin:'#d8a07a',hair:'#35506d',accent:'#3569ae',warm:'#d98d6f',leaf:'#7db27f',leaf2:'#a4cd9a',path:'#eadcc8',shirt:'#5f93aa'};
    const svg=(body)=>`<svg class="scene-art" viewBox="0 0 292 176" role="img" aria-label="${esc(sceneAlt(q))}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
    const base=(extra='')=>`
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f4fbff"/><stop offset="100%" stop-color="#edf6fa"/></linearGradient>
      </defs>
      <rect width="292" height="176" rx="20" fill="url(#skyGrad)"/>
      <ellipse cx="46" cy="34" rx="22" ry="9" fill="#ffffff" opacity=".82"/><ellipse cx="84" cy="26" rx="13" ry="6" fill="#ffffff" opacity=".72"/>
      <path d="M0 120 C60 102 110 96 170 110 S250 124 292 114 V176 H0 Z" fill="#d8ebd1"/>
      <path d="M0 130 C56 120 116 112 184 122 S246 134 292 126 V176 H0 Z" fill="#c4e0bf"/>
      ${extra}`;
    const tree=(x=224,y=106,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0V-36" stroke="#8d7255" stroke-width="9" stroke-linecap="round"/><circle cx="0" cy="-50" r="22" fill="#99ca97"/><circle cx="-18" cy="-42" r="17" fill="#7bb07d"/><circle cx="18" cy="-40" r="16" fill="#b0d8aa"/></g>`;
    const ball=(x=234,y=128,r=15)=>`<g><circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#7f9db0" stroke-width="2.2"/><path d="M${x} ${y-r+5} l8 7 -4 9 h-8 l-5-8z" fill="#6d8fa5"/></g>`;
    const book=(x=196,y=110)=>`<g transform="translate(${x} ${y}) rotate(-8)"><rect x="0" y="0" width="34" height="24" rx="4" fill="#f1c46d"/><path d="M17 1v22" stroke="#ffefc7" stroke-width="3"/></g>`;
    const parcel=(x=196,y=106)=>`<g><rect x="${x}" y="${y}" width="34" height="28" rx="4" fill="#d9b180"/><path d="M${x+17} ${y}V${y+28}" stroke="#f8ead3" stroke-width="3.5"/><path d="M${x} ${y+10}H${x+34}" stroke="#c28e57" stroke-width="2" opacity=".45"/></g>`;
    const plant=(x=210,y=118)=>`<g><path d="M${x} ${y}V${y-28}" stroke="#5f9f76" stroke-width="4" stroke-linecap="round"/><path d="M${x} ${y-16} C${x-22} ${y-32}, ${x-28} ${y-11}, ${x-8} ${y-8}" fill="#70ad77"/><path d="M${x} ${y-22} C${x+19} ${y-36}, ${x+24} ${y-15}, ${x+5} ${y-12}" fill="#8bc385"/></g>`;
    const path=(x=120,y=148,w=118)=>`<path d="M${x-36} ${y} C${x+2} ${y-18}, ${x+w-40} ${y-13}, ${x+w} ${y+6} L${x+w} 176 L${x-56} 176 Z" fill="#eadfcf"/>`;
    const child=(x,y,opts={})=>{
      const shirt=opts.shirt||palette.shirt, shorts=opts.shorts||'#314f6d', scale=opts.scale||1, pose=opts.pose||'stand', older=opts.older||false;
      const armR = pose==='kick' ? 'M13 10 L36 24' : pose==='run' ? 'M13 8 L32 20' : 'M14 8 L30 28';
      const armL = pose==='kick' ? 'M-13 10 L-30 26' : pose==='run' ? 'M-13 8 L-26 24' : 'M-14 8 L-28 30';
      const legR = pose==='kick' ? 'M7 36 L30 52' : pose==='run' ? 'M8 36 L24 63' : 'M7 36 L18 70';
      const legL = pose==='kick' ? 'M-8 36 L-16 70' : pose==='run' ? 'M-8 36 L-24 58' : 'M-10 36 L-22 70';
      const hair = older ? '#e7ece9' : (opts.hair||palette.hair);
      return `<g transform="translate(${x} ${y}) scale(${scale})">
        <path d="${legL}" stroke="#334e68" stroke-width="9" stroke-linecap="round"/>
        <path d="${legR}" stroke="#334e68" stroke-width="9" stroke-linecap="round"/>
        <path d="M-16 0 Q0 -10 16 0 L18 39 H-18Z" fill="${shirt}"/>
        <path d="${armL}" stroke="#cb9570" stroke-width="8" stroke-linecap="round"/>
        <path d="${armR}" stroke="#cb9570" stroke-width="8" stroke-linecap="round"/>
        <circle cx="0" cy="-24" r="18" fill="#d8a07a"/>
        <path d="M-17 -29 Q-12 -49 5 -45 Q18 -42 18 -26 Q5 -35 -4 -33 Q-12 -31 -17 -29" fill="${hair}"/>
        ${older?'<circle cx="-10" cy="-23" r="5" fill="none" stroke="#5b6f7d" stroke-width="1.6"/><circle cx="10" cy="-23" r="5" fill="none" stroke="#5b6f7d" stroke-width="1.6"/><path d="M-5 -23 H5" stroke="#5b6f7d" stroke-width="1.2"/>':''}
        <circle cx="-6" cy="-24" r="1.5" fill="#233747"/><circle cx="6" cy="-24" r="1.5" fill="#233747"/>
        <path d="M-4 -15 Q0 -12 4 -15" fill="none" stroke="#995d45" stroke-width="1.7" stroke-linecap="round"/>
      </g>`;
    };
    const dog=(x=152,y=126,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="28" ry="12" fill="#c38b60"/><circle cx="-23" cy="-12" r="14" fill="#d6a372"/><path d="M-33 -16q-8 8 -2 18" fill="#a17149"/><path d="M15 -3 L30 -16" stroke="#b8865e" stroke-width="7" stroke-linecap="round"/><path d="M-12 9 L-18 26M10 10 L16 26" stroke="#9a6e49" stroke-width="6" stroke-linecap="round"/></g>`;

    const scenes={
      o1:()=>svg(base()+`${tree(238,106,.9)}${child(142,102,{pose:'kick',scale:.92,shirt:'#5a93c1'})}${ball(222,130,14)}`),
      o2:()=>svg(base()+`${tree(240,106,.92)}${dog(134,126,1.05)}`),
      o3:()=>svg(base(`<rect x="40" y="120" width="168" height="18" rx="9" fill="#b9c9d7"/><rect x="54" y="98" width="136" height="22" rx="11" fill="#cfdae4"/>`)+`${child(112,98,{older:true,scale:.86,shirt:'#d58e78'})}${book(154,108)}`),
      o4:()=>svg(base()+`${tree(242,106,.92)}${child(112,104,{pose:'kick',scale:.84,shirt:'#5a93c1'})}${child(175,106,{pose:'run',scale:.8,shirt:'#d69878'})}${ball(146,132,12)}`),
      o5:()=>svg(base()+`${path(134,148,102)}${child(118,103,{pose:'stand',scale:.9,shirt:'#d98c73'})}${parcel(172,108)}`),
      m1:()=>svg(base()+`${tree(244,106,.76)}${child(114,106,{pose:'stand',scale:.88,shirt:'#5a93c1'})}${plant(186,126)}`),
      m2:()=>svg(base()+`${child(108,104,{pose:'stand',scale:.88,shirt:'#6c96bf'})}${child(170,104,{pose:'stand',scale:.88,shirt:'#d19a79'})}<rect x="96" y="122" width="32" height="22" rx="4" fill="#fffaf0" stroke="#9db8c8" stroke-width="2"/><path d="M102 137L112 128L123 139" stroke="#df9f73" stroke-width="3" fill="none"/>`),
      m3:()=>svg(base()+`<g fill="none" stroke="#6b90aa" stroke-width="4"><circle cx="93" cy="132" r="26"/><circle cx="176" cy="132" r="26"/><path d="M93 132L125 92L145 132L93 132L121 132L136 82L157 82M176 132L157 95L144 95"/></g>${child(134,84,{pose:'stand',scale:.65,shirt:'#df9d7b'})}`),
      m4:()=>svg(base()+`${child(112,105,{pose:'run',scale:.84,shirt:'#5a93c1'})}${child(172,106,{pose:'run',scale:.84,shirt:'#d59c7d'})}<path d="M85 124Q110 106 132 120M149 120Q173 101 196 117" stroke="#e0adc7" stroke-width="2.5" fill="none" stroke-dasharray="4 5"/>`),
      m5:()=>svg(base()+`${path(150,150,92)}${tree(236,106,.92)}${child(129,103,{older:true,pose:'run',scale:.88,shirt:'#d58c78'})}`)
    };
    return (scenes[id]||scenes.o1)();
  }
  function sceneAlt(q){
    return ({
      o1:'Sam staat buiten bij een voetbal en beweegt zijn been naar de bal.',
      o2:'Een hond in een sprong met alle poten van de grond op een grasveld.',
      o3:'Oma zit op een bank met een boek.',
      o4:'Twee kinderen bewegen samen buiten op een grasveld.',
      o5:'Sara draagt een pakket bij de voordeur.',
      m1:'Sam werkt in de tuin.',
      m2:'Wij tekenen thuis.',
      m3:'Ik fiets naar school.',
      m4:'De kinderen dansen buiten.',
      m5:'Oma beweegt over een wandelpad tussen de bomen.'
    })[q.id] || 'Een illustratie bij de oefening.';
  }
  // Individually approved visual reference assets are embedded for offline use.
  // Other exercises deliberately retain the V3.6 illustrative prototype until
  // the action and actor have been checked rather than showing wrong imagery.
  const SCENE_ART = {"bike-to-school.webp":"./art/bike-to-school.webp","dog-run.webp":"./art/dog-run.webp","drawing-together.webp":"./art/drawing-together.webp","garden-work.webp":"./art/garden-work.webp","grandma-reading.webp":"./art/grandma-reading.webp","kids-dancing.webp":"./art/kids-dancing.webp","park-walk-grandma.webp":"./art/park-walk-grandma.webp","sam-friend-dog-soccer.webp":"./art/sam-friend-dog-soccer.webp","sam-soccer.webp":"./art/sam-soccer.webp","sara-parcel.webp":"./art/sara-parcel.webp"};
  function scene(q){
    const url=SCENE_ART[q.art]||V43_ART[q.art];
    return `<div class="scene scene-wide"><img class="scene-art" src="${url}" alt="${esc(q.alt||'Afbeelding bij de oefening.')}" draggable="false"/></div>`;
  }

  function localFeedback(){
    if(state.completed){
      const sparks=(state.answerRevealed?[]:['✦','✧','✦','✧','✦','✧']).map((x,i)=>`<span class="spark s${i+1}">${x}</span>`).join('');
      return `<div class="feedback good inline-note" role="status" tabindex="-1"><span class="feedback-icon" aria-hidden="true">✓</span><div class="feedback-text"><strong>${state.answerRevealed?'Je hebt de zin opnieuw gemaakt.':'Goed!'}</strong></div><div class="inline-note-actions"><button class="feedback-listen" data-action="speak-correct" ${state.audioOn?'':'disabled'} aria-label="Luister nog eens naar de zin">${uiIcon('audio')} Luister</button></div><div class="sparks" aria-hidden="true">${sparks}</div></div>`;
    }
    if(state.message)return `<div class="feedback inline-note" role="alert" tabindex="-1"><span class="feedback-icon" aria-hidden="true">↪</span><div class="feedback-text"><span>${esc(state.message)}</span></div><button class="feedback-listen" data-action="speak-feedback" ${state.audioOn?'':'disabled'} aria-label="Herhaal de aanwijzing">${uiIcon('audio')} Herhaal</button></div>`;
    if(state.showHint)return `<div class="feedback hint inline-note" role="status"><span class="feedback-icon" aria-hidden="true">◈</span><div class="feedback-text"><span>${esc(hintText(item()))}</span></div></div>`;
    return `<div class="feedback-quiet" aria-hidden="true"></div>`;
  }
  function orderBody(q){
    const used=new Set(state.positions.filter(x=>x!==null));
    const slots=state.positions.map((id,i)=>{
      const tile=q.tiles.find(t=>t.id===id);
      return tile
        ?`<button class="slot filled ${tile.role==='verb'?'verb':''} ${state.focusPos===i?'needs-attention':''}" data-action="unplace" data-id="${tile.id}" data-pos="${i}" data-slot="${i}" ${state.completed?'':'data-draggable="tile"'} aria-label="${esc(tileText(tile.text,i===0))} op plek ${i+1}. Tik om terug te leggen, of sleep naar een ander vak."><span class="slot-number">${i+1}</span>${esc(tileText(tile.text,i===0)+(q.kind==='conditional'&&state.positions[0]==='w0'&&i===2?',':''))}</button>`
        :`<div class="slot ${state.showHint&&i===commonVerbSlot(q)?'middle-hint':''} ${state.focusPos===i?'needs-attention':''}" data-slot="${i}" aria-label="Leeg vak ${i+1}"><span class="slot-number">${i+1}</span><span class="slot-placeholder">Tik of sleep</span></div>`;
    }).join('');
    const pool=q.bankOrder.map(id=>q.tiles.find(t=>t.id===id)).filter(t=>!used.has(t.id))
      .map(t=>`<div class="tile-wrap"><button class="tile ${t.role==='verb'?'verb':''}" data-action="tile" data-draggable="tile" data-id="${t.id}" aria-label="Plaats of sleep ${esc(tileText(t.text))}">${esc(tileText(t.text))}</button><button class="hear-tile" data-action="hear-tile" data-id="${t.id}" aria-label="Luister naar ${esc(t.text)}" ${state.audioOn?'':'disabled'}>${uiIcon('audio')}</button></div>`).join('');
    return `${q.beginWith?`<div class="start-rule">Begin met <strong>${esc(q.beginWith)}</strong>.</div>`:''}<div class="work-label">Zet de stukjes op hun plek</div><div class="slots" data-count="${q.tiles.length}" style="--slot-count:${q.tiles.length}" aria-label="Zinsbalk">${slots}</div>${builtSentenceListenButton()}<div class="feedback-space">${localFeedback()}</div>${state.completed?'':currentComplete()?`<div class="child-instruction">${state.message?'Je kunt een stukje verplaatsen.':'Je kunt de zin nog veranderen.'}</div>`:`<div class="child-instruction">Sleep een stukje, of tik erop.</div><div class="bank">${pool}</div>`}`;
  }
  function tenseBody(q){
    const selected=state.selected;
    return `<div class="work-label">Maak de zin af</div><div class="stem-line"><div class="wordbox">${esc(q.subject)}</div><div class="wordbox stem ${selected===null?'':'chosen'}" data-ending-slot="true">${selected===null?'?':esc(selected)}</div><div class="wordbox">${esc(q.tail)}</div></div>${builtSentenceListenButton()}<div class="feedback-space">${localFeedback()}</div>${state.completed?'':`<div class="child-instruction">Kies het woord dat past.</div><div class="choice-row">${(state.choiceOrder||q.choices).map(v=>`<button class="ending ${selected===v?'selected':''}" data-action="ending" data-draggable="ending" data-ending="${esc(v)}" aria-pressed="${selected===v}">${esc(v)}</button>`).join('')}</div>`}`;
  }
  function morphBody(q){
    if(q.kind==='tense'||q.kind==='strong')return tenseBody(q);
    const endings=[{v:'',label:'geen einde'},{v:'t',label:'-t'},{v:'en',label:'-en'}];
    return `<div class="work-label">De zin</div><div class="stem-line"><div class="wordbox">${esc(q.subject)}</div><div class="wordbox stem">${esc(q.stem)}</div><div class="wordbox suffix ${state.selected===null?'needs-attention':'chosen'}" data-ending-slot="true">${state.selected===null?'?':(state.selected===''?'—':esc(state.selected))}</div><div class="wordbox">${esc(q.tail)}</div></div>${builtSentenceListenButton()}<div class="feedback-space">${localFeedback()}</div>${state.completed?'':`<div class="child-instruction">${currentComplete()?'Je kunt nog veranderen.':'Kies een einde.'}</div><div class="choice-row">${endings.map(e=>`<button class="ending ${state.selected===e.v?'selected':''}" data-action="ending" data-draggable="ending" data-ending="${e.v}" aria-pressed="${state.selected===e.v}">${esc(e.label)}</button>`).join('')}</div>`}`;
  }

  // A positional hint is allowed only when every valid solution agrees.
  function commonVerbSlot(q){
    if(!Array.isArray(q.tiles)||!Array.isArray(q.solutions)||!q.solutions.length)return -1;
    const verbs=q.tiles.filter(tile=>tile.role==='verb');
    if(verbs.length!==1)return -1;
    const slots=q.solutions.map(solution=>solution.indexOf(verbs[0].id));
    return slots[0]>=0&&slots.every(index=>index===slots[0])?slots[0]:-1;
  }
  function hintText(q){
    // The grammar kind, not the active pilot screen, controls the hint.
    if(q.kind==='because')
      return q.tiles.some(t=>t.role==='verb-tail')
        ?'Na omdat komt de reden. De twee werkwoorden horen aan het einde van dit stukje. Hun volgorde mag hier wisselen.'
        :'Na omdat komt de reden. Het werkwoord van de reden staat aan het einde van dat stukje.';
    if(q.kind==='conditional')
      return 'Begint de zin met als? Dan komt in het tweede stukje het werkwoord vóór het onderwerp. Je kunt ook met het andere stukje beginnen.';
    if(q.kind==='vtt')
      return 'Kies het hulpwerkwoord bij het onderwerp. Het voltooid deelwoord staat achteraan.';
    if(q.kind==='tense'||q.kind==='strong')
      return q.when==='Nu'?'Nu: het gebeurt op dit moment.':'Gisteren: het gebeurde al. Luister naar de twee woorden.';
    if(Array.isArray(q.solutions)&&Array.isArray(q.tiles)){
      const slot=commonVerbSlot(q);
      return slot>=0?'Het oranje werkwoord staat op plek '+(slot+1)+'.':'Kijk waar het oranje werkwoord past in deze zin.';
    }
    return q.count==='many'?'Het gaat over meer personen. Denk aan: wij werk-en.'
      :q.count==='i'?'De zin gaat over ik. Denk aan: ik werk.'
      :'Het gaat over één persoon. Denk aan: Sam werk-t.';
  }
  function builtSentenceListenButton(){
    if(!preferences.listenOwnSentence||state.completed)return '';
    return '<div class="sentence-review"><button type="button" class="secondary self-listen-action" data-action="speak-built" '+
      (currentComplete()&&state.audioOn?'':'disabled')+
      ' aria-label="Luister naar mijn gemaakte zin">'+uiIcon('audio',26)+' <span>Mijn zin horen</span></button></div>';
  }


  // Only a visual QA overlay on top of the actual exercise and validator.
  // This state never enters regular learning data or children's rewards.
  function rewardBot(){return `<svg class="reward-bot" viewBox="0 0 146 146" aria-hidden="true" focusable="false"><defs><linearGradient id="reward-shell" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="#bedfff"/></linearGradient></defs><ellipse cx="76" cy="128" rx="44" ry="9" fill="#17335e" opacity=".12"/><rect x="61" y="92" width="31" height="30" rx="12" fill="#087bdc"/><rect x="41" y="28" width="75" height="70" rx="28" fill="url(#reward-shell)" stroke="#158dde" stroke-width="5"/><rect x="48" y="38" width="61" height="47" rx="18" fill="#092b67"/><path d="M61 61q8 12 16 0m6 0q8 12 16 0" fill="none" stroke="#63d8ff" stroke-width="5" stroke-linecap="round"/><path d="M70 73q7 6 14 0" fill="none" stroke="#ffa64a" stroke-width="3" stroke-linecap="round"/><path d="M65 23V15" stroke="#168de1" stroke-width="5" stroke-linecap="round"/><circle cx="65" cy="12" r="5" fill="#ffad24"/><path d="M42 105l-17-14m91 11l13-14" stroke="#168de1" stroke-width="9" stroke-linecap="round"/><circle cx="24" cy="90" r="7" fill="#fff" stroke="#168de1" stroke-width="4"/><circle cx="131" cy="84" r="7" fill="#fff" stroke="#168de1" stroke-width="4"/><path d="M67 122l-8 9m26-9l9 9" stroke="#146cb6" stroke-width="9" stroke-linecap="round"/></svg>`;}
  function rewardSuccessMarkup(){
    if(!isRewardPreview()||!state.completed)return '';
    const independent=state.previewLastGain===2;
    return `<div class="reward-preview-feedback" role="status">${rewardBot()}<div class="reward-preview-words"><strong>${independent?'Yes, gelukt!':'Mooi volgehouden!'}</strong><small>${independent?'Helemaal zelf gemaakt':'Goed opnieuw opgebouwd'}</small><div class="reward-preview-coin" aria-hidden="true">✪</div><small>+${state.previewLastGain} munt${state.previewLastGain===2?'en':''}</small></div></div>`;
  }

  // Animated reward exists only in the QA prototype; real learning evidence is untouched.
  let activeRewardFlight=null;
  function settleRewardFlight(landed=false){
    const flight=activeRewardFlight;
    if(flight){
      activeRewardFlight=null;
      if(flight.animation&&flight.animation.playState!=='finished')flight.animation.cancel();
      flight.coin.remove();
    }
    if(!isRewardPreview())return;
    // The award was recorded once by finishItem; only its display waits for landing.
    state.previewShownCoins=state.previewCoins;
    const vault=app.querySelector('.reward-vault'),amount=app.querySelector('.reward-vault-number');
    if(amount)amount.textContent=isWorld()?String(state.previewShownCoins)+'/5':String(state.previewShownCoins);
    if(vault)vault.setAttribute('aria-label',state.previewShownCoins+' van vijf zinnen in deze oefenronde');
    if(landed&&vault){
      vault.classList.remove('reward-vault-received');
      void vault.offsetWidth;
      vault.classList.add('reward-vault-received');
      playRewardLandingSound();
    }
  }
  function cancelRewardFlight(){
    if(activeRewardFlight)settleRewardFlight(false);
  }
  function playRewardLandingSound(){
    // A soft, short coin cascade rather than a single synthetic ping.
    // Four slightly staggered metallic strikes create a small, bright rinkel.
    if(!state.audioOn)return;
    try{
      const AudioCtx=window.AudioContext||window.webkitAudioContext;
      if(!AudioCtx)return;
      soundContext=soundContext||new AudioCtx();
      if(soundContext.state==='suspended')soundContext.resume().catch(()=>{});
      const start=soundContext.currentTime+.025;
      const notes=[1318.5,1568,1760,2093];
      notes.forEach((frequency,i)=>{
        const at=start+[0,.072,.157,.244][i];
        // The faint inharmonic upper partial suggests small metal coins.
        [1,2.08].forEach((partial,j)=>{
          const osc=soundContext.createOscillator(),gain=soundContext.createGain();
          osc.type='sine';
          osc.frequency.setValueAtTime(frequency*partial,at);
          gain.gain.setValueAtTime(.0001,at);
          gain.gain.exponentialRampToValueAtTime(j===0?.031:.009,at+.013);
          gain.gain.exponentialRampToValueAtTime(.0001,at+(j===0?.31:.19));
          osc.connect(gain);gain.connect(soundContext.destination);
          toneNodes.push(osc);
          osc.onended=()=>{toneNodes=toneNodes.filter(node=>node!==osc);};
          osc.start(at);osc.stop(at+(j===0?.32:.2));
        });
      });
    }catch(_){/* No audio capability: the visual landing remains. */}
  }

  function animateRewardCoin(){
    if(!isRewardPreview()||state.screen!=='exercise'||!state.completed)return;
    cancelRewardFlight();
    const source=app.querySelector('.reward-preview-coin');
    const mouth=app.querySelector('.reward-vault-slot');
    if(!source||!mouth){settleRewardFlight(false);return;}
    if(!state.motionOn||window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      settleRewardFlight(false);
      return;
    }
    const destination=mouth.getBoundingClientRect(),from=source.getBoundingClientRect();
    const size=55,vw=window.innerWidth,vh=window.innerHeight;
    const banner=document.getElementById('qa-banner')?.getBoundingClientRect();
    const safeTop=Math.max(16,(banner?.bottom||0)+16);
    // The source card may be off-screen after clicking 'Controleer'.
    // If so, stage the coin in the visible center instead of letting it fly from outside.
    const usableFrom=from.top>safeTop+55&&from.bottom<vh-18&&from.left>16&&from.right<vw-16&&from.top>destination.bottom+120;
    const startX=Math.max(16,Math.min(vw-size-16,(usableFrom?from.left+from.width/2:vw*.5)-size/2));
    const centerY=usableFrom?from.top+from.height/2:Math.max(safeTop+size+96,vh*.57);
    const startY=Math.max(safeTop,Math.min(vh-size-16,centerY-size/2));
    const endX=Math.max(16,Math.min(vw-size-16,destination.left+destination.width/2-size/2));
    const endY=Math.max(safeTop,Math.min(vh-size-16,destination.top+destination.height/2-size/2));
    const dx=endX-startX,dy=endY-startY;
    // Broad and readable arc; keep its highest point below the QA banner.
    const arc=Math.min(46,Math.max(0,(startY+endY)/2-safeTop-20));
    const coin=document.createElement('span');
    coin.className='reward-flying-coin';
    coin.textContent='✪';
    coin.setAttribute('aria-hidden','true');
    coin.style.left=startX+'px';coin.style.top=startY+'px';
    document.body.appendChild(coin);
    if(typeof coin.animate!=='function'){coin.remove();settleRewardFlight(false);return;}
    const animation=coin.animate([
      {offset:0,transform:'translate(0,0) scale(.85)',opacity:.96},
      {offset:.122,transform:'translate(0,0) scale(1.1)',opacity:1},
      {offset:.278,transform:'translate(0,0) scale(1)',opacity:1},
      {offset:.52,transform:'translate('+(dx*.43)+'px,'+(dy*.43-arc)+'px) scale(1)',opacity:1},
      {offset:.72,transform:'translate('+(dx*.76)+'px,'+(dy*.76-arc*.65)+'px) scale(.92)',opacity:1},
      {offset:.861,transform:'translate('+dx+'px,'+dy+'px) scale(.78)',opacity:1},
      {offset:1,transform:'translate('+dx+'px,'+(dy+6)+'px) scale(.62)',opacity:0}
    ],{duration:1800,easing:'cubic-bezier(.2,.65,.3,1)',fill:'forwards'});
    activeRewardFlight={coin,animation};
    animation.finished.then(()=>{
      if(activeRewardFlight?.coin===coin&&isRewardPreview()&&state.completed)settleRewardFlight(true);
    }).catch(()=>{}); // A cancelled flight must not play the landing sound.
  }

  function playRewardChestSound(){
    if(!state.audioOn)return;
    try{
      const AudioCtx=window.AudioContext||window.webkitAudioContext;
      if(!AudioCtx)return;
      soundContext=soundContext||new AudioCtx();
      if(soundContext.state==='suspended')soundContext.resume().catch(()=>{});
      const start=soundContext.currentTime+.025;
      [523.25,659.25,783.99].forEach((frequency,i)=>{
        const oscillator=soundContext.createOscillator(),gain=soundContext.createGain();
        oscillator.type='sine';oscillator.frequency.value=frequency;
        const at=start+i*.12;
        gain.gain.setValueAtTime(.0001,at);
        gain.gain.exponentialRampToValueAtTime(.045,at+.027);
        gain.gain.exponentialRampToValueAtTime(.0001,at+.44);
        oscillator.connect(gain);gain.connect(soundContext.destination);
        toneNodes.push(oscillator);
        oscillator.onended=()=>{toneNodes=toneNodes.filter(node=>node!==oscillator);};
        oscillator.start(at);oscillator.stop(at+.45);
      });
    }catch(_){/* Browser audio optional; visual reward still works. */}
  }


  function rewardPreviewEnd(){
    const opened=state.previewChestOpen;
    const demo=isPilotO3();
    const top=demo?'<span class="reward-preview-badge">VISUEEL UX-PROTOTYPE · geen kindrelease</span>':'<span class="reward-preview-badge">Vijf zinnen afgerond!</span>';
    const prize=demo
      ?'<div class="reward-preview-found"><span class="reward-found-symbol" aria-hidden="true">🚀</span><strong>Ruimteraket</strong><small>Conceptvondst · nog niet opgeslagen</small></div>'
      :'<div class="reward-preview-found"><span class="reward-found-symbol" aria-hidden="true">★</span><strong>1 ster verdiend!</strong><small>Spaar sterren en ontgrendel een nieuwe avatar.</small></div>';
    return `<section class="panel reward-preview-end">
      ${top}
      <h1>${opened?(demo?'Jouw vondst!':'Goed gedaan!'):'Je schatkist is klaar!'}</h1>
      <p>${opened?'Vijf oefenzinnen afgerond. Kijk wat je hebt verdiend!':'Vijf zinnen gemaakt. Tijd om de schatkist te openen.'}</p>
      ${opened?prize:`<div class="reward-chest" aria-label="Gesloten schatkist"><div class="reward-chest-lid"></div><div class="reward-chest-box"></div><div class="reward-chest-lock">★</div></div>`}
      <div class="reward-preview-badge">${demo?'✪ '+state.previewCoins+' demonstratiemunten':'★ '+stars+' '+(stars===1?'ster':'sterren')+' beschikbaar'}</div>
      <div class="actions">${opened?`<button class="primary" data-action="reward-preview-again">Nog vijf oefenzinnen</button>`:`<button class="primary" data-action="reward-chest-open">Open de schatkist</button>`}
      <button class="secondary" data-action="home">Terug naar Zinbo</button></div>
    </section>`;
  }
