'use strict';
(() => {
 const root=document.querySelector('.arcade-app');
 const E=window.FootArcade,$=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
 const embedded=root.classList.contains('arcade-embedded');
 const KEY='footverse-arcade-v2',OLD='toni-sockpot-v1';
 const icons=['🦶','🧦','🛸','💎','🍀'],dice=['⚀','⚁','⚂','⚃','⚄','⚅'];
 const reels=window.SockpotReels.create($$('.reel'),icons),roadView=window.FootRoad.create($('#visual-road'),E);
 const blackjackView=window.BlackjackMotion.create($('#visual-blackjack'),E);
 const plinkoView=window.LivePlinko.create($('#visual-plinko'),E.PLINKO,landBalls,saveBalls),scenes=window.ArcadeScenes.create(root,E);
 const rouletteView=window.RouletteTable.create($('#roulette-table'),E,()=>render(),()=>$('#play').click());
 const names={flight:'Foot Flight',blackjack:'Blackjack',roulette:'Roulette',plinko:'Plinko',limbo:'Limbo',keno:'Keno',slots:'Sockpot',wheel:'Glücksrad',coin:'Fuß oder Socke',dice:'Würfelwerk',mines:'Socken-Minen',road:'Foot Road'};
 const titles={flight:'Dieser Fuß hebt ab.',blackjack:'21 Gründe, Toni zu schlagen.',roulette:'Dein Tisch. Deine Zahlen.',plinko:'Lass die Coins fallen.',limbo:'Toni will hoch hinaus.',keno:'Deine Zahlen. Dein Moment.',slots:'Drei Walzen. Ein Sockpot.',wheel:'Heute dreht Toni das Rad.',coin:'Fuß oder Socke? Deine Wahl.',dice:'Große Würfe. Kleine Socken.',mines:'Sieben Füße. Zwei Socken.',road:'Ein Fuß. Endlose Straße. Keine Schuhe.'};
 const rules={flight:'<p>Starte einen Flug und sichere deine Coins, solange der Fuß fliegt. Dein Einsatz wird mit dem angezeigten Faktor multipliziert. Nach einem Absturz ist der Einsatz verloren. Der Absturz wird beim Start zufällig festgelegt; Neuladen setzt denselben Flug fort.</p>',
  blackjack:'<p>Ein Deck mit 52 Karten. Ass zählt 1 oder 11, Bilder zählen 10. Dealer steht auf jeder 17. Ziehen oder Stehen; Verdoppeln ist nur mit den ersten zwei Karten möglich und gibt genau eine weitere Karte. Keine Teilung, keine Versicherung.</p><p>Blackjack zahlt 3:2 Gewinn, also 2,5× inklusive Einsatz (abgerundet). Normaler Sieg: 2×. Gleichstand: Einsatz zurück. Dealer-Blackjack wird sofort geprüft. Eine laufende Hand wird gespeichert.</p>',
  roulette:'<p>Europäisches Roulette mit 0–36. Wähle einen Chipwert und setze mehrere Chips auf dem Tisch. Der Gesamteinsatz wird beim Start abgebucht. Einzelzahl 36×, Split 18×, Straße/Trio 12×, Ecke/erste Vier 9×, Sechserlinie 6×, Dutzend/Kolonne 3×, einfache Chancen 2× — jeweils inklusive Einsatz. Die Null verliert auf allen Außenchancen; kein La Partage.</p>',
  plinko:'<p>Der Ball fällt mit Schwerkraft und Dämpfung durch acht Pinreihen. Abpraller und Fachtrennungen werden mit Kreis-Kollisionen berechnet. Du kannst weitere Bälle starten, solange dein Guthaben reicht. Bälle stoßen auch miteinander zusammen. Jeder Ball hat seinen eigenen Einsatz und wird erst bei der Landung ausgezahlt. Ein kleiner zufälliger Startversatz und Startimpuls verändern den Verlauf; das tatsächlich erreichte Fach bestimmt die Auszahlung. Die Fächer sind nicht gleich wahrscheinlich.</p><p>Von links nach rechts: 12×, 3×, 1,2×, 0,5×, 0,2×, 0,5×, 1,2×, 3×, 12×. Auszahlung wird abgerundet.</p>',
  limbo:'<p>Wähle 2×, 5× oder 10×. Das Ergebnis muss dein Ziel erreichen. Die Gewinnchance beträgt 48 %, 19,2 % oder 9,6 %. Ein Treffer zahlt den gewählten Zielmultiplikator.</p>',
  keno:'<p>Wähle genau drei Zahlen aus 1–20. Fünf unterschiedliche Zahlen werden zufällig gezogen. 0 / 1 / 2 / 3 Treffer zahlen 0× / 1× / 4× / 40×.</p>', 
  slots:'<p>Fünf Symbole, je 20 % pro Walze. Genau ein Paar zahlt 2×. Drei gleiche: 🦶 15× · 💎 10× · 🛸 6× · 🧦 5× · 🍀 4×.</p><p>Drei gleiche: 4 %. Genau ein Paar: 48 %. Drei verschiedene: 48 % und keine Auszahlung.</p>',
  wheel:'<p>Acht gleich große Felder mit jeweils 12,5 % Chance. Vier Felder zahlen 0×, zwei zahlen 2×, eines 3× und eines 5×. Der Zeiger oben zeigt das Ergebnis.</p>',
  coin:'<p>Wähle vor dem Wurf Fuß oder Socke. Beide Seiten haben genau 50 % Chance. Richtig: 2× Einsatz zurück. Falsch: keine Auszahlung.</p>',
  dice:'<p>Wähle 1–3 oder 4–6. Jede Zahl hat eine Chance von 1/6. Dein Bereich gewinnt mit 50 % Chance und zahlt 2× Einsatz. Sonst gibt es nichts zurück.</p>',
  mines:'<p>In neun Feldern liegen genau zwei Socken. Füße sammeln und nach jedem Treffer freiwillig Feet Coins sichern. Eine Socke beendet die Runde ohne Auszahlung.</p><p>Auszahlung nach 1 / 2 / 3 / 4 / 5 / 6 / 7 Füße: 1,25× / 1,6× / 2,2× / 3,1× / 4,8× / 8× / 20×. Es wird auf ganze Punkte abgerundet. Beim siebten Füße wird automatisch ausgezahlt.</p><p>Die erste Auswahl ist mit 7/9 sicher. Nach k Füße sind noch 7−k von 9−k Feldern sicher. Ein Neuladen speichert Feld und Fortschritt, würfelt aber nicht neu. Abbrechen verliert den Einsatz.</p>',
  road:'<p>Setze Feet Coins und gehe mit „Nächste Spur“ weiter. Nach jedem sicheren Schritt kannst du sichern oder weitergehen. Ein Autotreffer beendet die Runde ohne Auszahlung. Die Straße hat kein Ziel und kein automatisches Ende.</p><p>Das Trefferrisiko steigt mit jeder Spur: rund 18 % auf Spur 1, 40 % auf Spur 5 und 59 % auf Spur 10. Es nähert sich später 95 %. Jeder Schritt bleibt zufällig; es gibt keine festgelegte Todes-Spur. Das genaue Risiko der nächsten Spur steht über der Straße.</p><p>Der Multiplikator wächst passend zum Risiko. Auszahlungen enthalten den Einsatz und werden auf ganze Feet Coins abgerundet. Die technische Punkteobergrenze beträgt 1 Milliarde Feet Coins pro Konto; sie beendet den Fußweg nicht.</p><p>Die Autos stellen das Ergebnis dar. Warten oder schneller Klicken verändert die Chance nicht. Neuladen setzt die Runde und ihren Zufallsverlauf fort. Abbrechen verliert den Einsatz. Eigene Footverse-Spielregeln.</p>'
 };
 let state=E.fresh(),storageOK=true,busy=false,game='blackjack',bet=25,picks={coin:0,dice:0,roulette:0,limbo:2},kenoPicks=[3,7,16];
 let visualGame='',resultStamp='';
 let pendingStorage,roundTimer,finishRound=null,extraFrame=0,extraAnimations=[],balanceFrame=0,shownBalance=null,balanceTarget=null;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let motion=!reduced.matches;
 const activeGame=()=>state.blackjack?'blackjack':state.mines?'mines':state.road?'road':state.flight?'flight':state.plinko?.length?'plinko':null;
 const canAnimate=()=>motion&&!reduced.matches&&!document.body.classList.contains('fx-off');
 function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;}catch{storageOK=false;}}
 try{const stored=localStorage.getItem(KEY);if(stored)state=E.clean(JSON.parse(stored));else{const old=JSON.parse(localStorage.getItem(OLD)||'null');if(old&&Number.isSafeInteger(old.balance)&&old.balance>=0&&old.balance<=E.CAP){state.balance=old.balance;state.rounds=Number.isSafeInteger(old.spins)&&old.spins>=0?Math.min(E.CAP,old.spins):0;state.best=Number.isSafeInteger(old.best)&&old.best>=0?Math.min(E.CAP,old.best):0;}}}catch{storageOK=false;}
 try{const savedBet=Number(localStorage.getItem(KEY+'-stake'));if(Number.isSafeInteger(savedBet)&&savedBet>0&&savedBet<=E.CAP)bet=savedBet;}catch{}
 function rememberBet(){try{if(Number.isSafeInteger(bet)&&bet>0&&bet<=E.CAP)localStorage.setItem(KEY+'-stake',String(bet));}catch{}}
 const fmt=n=>new Intl.NumberFormat('de-AT').format(n);
 const factor=n=>n.toLocaleString('de-AT',{minimumFractionDigits:n<10000?2:0,maximumFractionDigits:2,notation:n>=10000?'compact':'standard'})+'×';
 const mult=n=>factor(E.roadMultiplier(n));
 const risk=n=>(E.roadRisk(n)*100).toLocaleString('de-AT',{minimumFractionDigits:1,maximumFractionDigits:1})+' %';
 const roadPayout=()=>E.roadValue(state.road,E.CAP-state.balance);
 const resultText=r=>`${r.detail}. ${fmt(r.payout)} Feet Coins zurück · netto ${r.payout-r.bet>=0?'+':''}${fmt(r.payout-r.bet)} Feet Coins.`;
 function rand(n){if(globalThis.crypto?.getRandomValues){const a=new Uint32Array(1),limit=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a);}while(a[0]>=limit);return a[0]%n;}return Math.floor(Math.random()*n);}
 function stopExtra(){cancelAnimationFrame(extraFrame);extraFrame=0;extraAnimations.forEach(a=>a.cancel());extraAnimations=[];}
 function stopAnimation(){stopExtra();reels.finish();roadView.finish();blackjackView.finish();plinkoView.finish();scenes.finish();if(finishRound){clearTimeout(roundTimer);finishRound();}}
 function setMotion(){root.classList.toggle('no-motion',!motion);if(!motion)stopAnimation();}
 function updateBalance(){
  if(balanceTarget===state.balance)return;
  const from=shownBalance??state.balance,to=state.balance;balanceTarget=to;cancelAnimationFrame(balanceFrame);
  const write=n=>{$('#balance').innerHTML=`${fmt(Math.round(n))} <small>Feet Coins</small>`;shownBalance=n;};
  if(!canAnimate()||from===to){write(to);return;}
  $('#balance').animate([{transform:'translateY(0)',color:'var(--arc-ink)'},{transform:'translateY(-3px)',color:to>from?'var(--arc-acid)':'#f4c3df'},{transform:'translateY(0)',color:'var(--arc-ink)'}],{duration:650});
  let start;const tick=now=>{if(start===undefined)start=now;const p=Math.min(1,(now-start)/650);write(from+(to-from)*(1-Math.pow(1-p,3)));if(p<1)balanceFrame=requestAnimationFrame(tick);};balanceFrame=requestAnimationFrame(tick);
 }
 function roadStep(){return state.road?.step??state.last.road?.result.step??0;}
 function renderVisual(){
  const r=state.last[game];
  if(visualGame!==game){visualGame=game;const el=$('#visual-'+game);if(canAnimate())el.animate([{opacity:.25,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,easing:'cubic-bezier(.2,.7,.2,1)'});}
  if(game==='slots')reels.show(r&&Array.isArray(r.result)?r.result:[0,1,3]);
  if(game==='mines'){
   const m=state.mines,ended=!m&&r?r.result:null;
   $$('.mine-cell').forEach((cell,i)=>{const open=m?.open.includes(i)||ended?.open.includes(i);const bomb=ended?.bombs.includes(i);cell.className='mine-cell'+((open||ended&&!bomb)?' safe':'')+(bomb?' bomb':'')+(ended?.hit===i?' hit':'')+(open||ended?' revealed':'')+(ended&&!open&&!bomb?' unpicked':'');cell.querySelector('.mine-front').textContent=bomb?'🧦':'🦶';cell.disabled=!m||open||busy;cell.setAttribute('aria-label',`Feld ${i+1}: ${bomb?'Socke':open?'Fuß':'verdeckt'}`);});
   const count=m?m.open.length:0;$('#mine-value').textContent=m?`${count} / 7 · ${fmt(Math.floor(m.bet*E.MINE_MULT[count]))} Feet Coins sicherbar`:'Bereit für ein neues Feld';
   $('#mine-hint').textContent=m?`Nächste Auswahl: ${7-count} von ${9-count} Feldern sind sicher.`:'Zwei Socken liegen zufällig verteilt. Öffne Füße oder starte eine neue Runde.';
  }
  renderExtra();
  if(game==='road'){
   const run=state.road,step=roadStep(),status=run?'active':r?.result.status||'ready';
   roadView.show(step,status);
   $('#road-multiplier').textContent=status==='crash'?'0,00×':!run&&r?.result.status==='cashout'?factor(r.result.factor??r.payout/r.bet):mult(step);
   $('#road-progress').textContent=(status==='crash'?'Erwischt · Spur ':step===0?'Start · Spur ':'Spur ')+fmt(step);
   $('.road-dashboard>div:last-child>small').textContent=run||!r?'RISIKO NÄCHSTE SPUR':'RISIKO DIESER SPUR';
   $('#road-risk').textContent=risk(run?step+1:Math.max(1,step));
   $('#road-risk-fill').style.setProperty('--risk-width',E.roadRisk(run?step+1:Math.max(1,step))*100+'%');
   $('#road-next').textContent=run?`Nächste Spur: ${mult(step+1)} · ${risk(step+1)} Trefferrisiko`:'Endlose Straße. Jeder weitere Schritt ist riskanter.';
   $('#road-value').textContent=run?(step?fmt(roadPayout())+' Feet Coins sicherbar':'Erst eine Spur überqueren'):status==='crash'?'Einsatz verloren':status==='cancel'?'Runde abgebrochen':r?fmt(r.payout)+' Feet Coins gesichert':'Setze Feet Coins und starte.';
  }
 }
 function render(){
  const active=activeGame(),mineActive=game==='mines'&&state.mines,roadActive=game==='road'&&state.road,bjActive=game==='blackjack'&&state.blackjack,ownActive=mineActive||roadActive||bjActive||(game==='flight'&&state.flight);
  $('#roulette-table').hidden=game!=='roulette';if(game==='roulette')rouletteView.render(state,busy,active,bet);$('.bet-group label').textContent=game==='roulette'?'CHIPWERT / FEET COINS':'EINSATZ / FEET COINS';
  if(!busy){updateBalance();$('#rounds').textContent=fmt(state.rounds);$('#wins').textContent=fmt(state.wins);$('#best').textContent=fmt(state.best)+' Feet Coins';renderVisual();}
  $$('#game-stage .game-visual').forEach(el=>el.hidden=el.id!=='visual-'+game);
  $('#game-stage').classList.toggle('road-selected',game==='road');
  $('#game-stage').classList.toggle('blackjack-selected',game==='blackjack');$('#game-stage').dataset.game=game;
  if(busy)$('#game-stage').classList.remove('round-positive');
  if(!busy)$('#game-stage').classList.toggle('round-positive',!active&&state.last[game]?.payout>state.last[game]?.bet);
  $$('[data-game]').forEach(el=>{el.setAttribute('aria-pressed',String(el.dataset.game===game));el.disabled=busy;});
  $('#game-title').textContent=titles[game];$('#game-number').textContent='SPIEL '+String(['blackjack','roulette','plinko','limbo','keno','road','slots','wheel','coin','dice','mines','flight'].indexOf(game)+1).padStart(2,'0')+' / '+names[game].toUpperCase();
  $('#round-state').textContent=busy?'LÄUFT':active==='flight'?'IM FLUG':active==='plinko'?state.plinko.length+' BÄLLE':active==='blackjack'?'DEINE HAND':active==='road'?'FUSS UNTERWEGS':active?'MINENRUNDE AKTIV':'BEREIT';
  $('.rules').hidden=game==='road';
  $('#rules-content').innerHTML=rules[game]+'<p><strong>Alle Auszahlungen enthalten den Einsatz.</strong> 25 Feet Coins setzen und 50 Feet Coins zurückbekommen bedeutet netto +25 Feet Coins. Feet Coins sind kostenlose Spielpunkte ohne Geldwert.</p>';
  $$('[data-bet]').forEach(el=>{el.setAttribute('aria-pressed',String(Number(el.dataset.bet)===bet));el.disabled=busy||Boolean(active&&active!=='plinko');});
  $('#bet-input').disabled=busy||Boolean(active&&active!=='plinko');if(document.activeElement!==$('#bet-input'))$('#bet-input').value=Number.isSafeInteger(bet)?bet:'';
  $$('[data-stake]').forEach(el=>el.disabled=busy||Boolean(active&&active!=='plinko'));
  $$('[data-pick-game]').forEach(el=>{el.setAttribute('aria-pressed',String(Number(el.dataset.pick)===picks[el.dataset.pickGame]));el.disabled=busy||Boolean(active);});
  $('#active-reminder').hidden=!active||game===active;
  $('#active-text').textContent=active==='flight'?'Dein Fuß ist noch in der Luft.':active==='plinko'?'Deine Plinko-Bälle fallen noch.':active==='blackjack'?'Deine Blackjack-Hand wartet.':active==='road'?'Dein Fuß steht noch auf der Straße.':'Eine Minenrunde läuft.';
  $('#play').hidden=Boolean(ownActive);$('#collect').hidden=!(mineActive||roadActive);$('#cancel-mine').hidden=!(mineActive||roadActive);$('#road-step').hidden=!roadActive;
  const collectible=mineActive?Math.floor(state.mines.bet*E.MINE_MULT[state.mines.open.length]):roadActive&&state.road.step?roadPayout():0;
  $('#collect').disabled=busy||!collectible;$('#collect').textContent=collectible?`${fmt(collectible)} Feet Coins sichern →`:roadActive?'Erst eine Spur überqueren':'Feet Coins sichern';
  $('#road-step').disabled=busy||!roadActive;$('#road-step').textContent=busy?'Fuß ist unterwegs …':roadActive?`Nächste Spur · ${mult(state.road.step+1)} →`:'Nächste Spur →';
  $('#play').disabled=busy||Boolean(active&&!(active==='plinko'&&game==='plinko'))||!Number.isSafeInteger(bet)||bet<1||bet>E.CAP||state.balance<bet||(game==='keno'&&kenoPicks.length!==3);$('#play').textContent=busy?'Runde läuft …':(game==='flight'?'Flug starten':game==='blackjack'?'Karten geben':game==='roulette'?'Kugel drehen':game==='plinko'?'Ball fallen lassen':game==='limbo'?'Abheben':game==='keno'?'Zahlen ziehen':game==='road'?'Fußweg starten':game==='mines'?'Feld starten':game==='coin'?'Münze werfen':game==='dice'?'Würfeln':'Drehen')+' · '+(Number.isSafeInteger(bet)?fmt(bet):'–')+' Feet Coins';
  if(game==='roulette'){$('#play').disabled=busy||Boolean(active)||!rouletteView.total()||rouletteView.total()>state.balance;$('#play').textContent=busy?'Kugel läuft …':'Kugel starten · '+fmt(rouletteView.total())+' Feet Coins';}
  $('#refill').hidden=state.balance!==0;$('#refill').disabled=busy||Boolean(active);
  $$('.table-actions button').forEach(el=>el.disabled=busy||!bjActive||(el.id==='bj-double'&&(state.blackjack?.player.length!==2||state.balance<state.blackjack?.bet)));
  $$('#keno-grid button').forEach(el=>el.disabled=busy||Boolean(active));$$('.mine-cell').forEach((el,i)=>el.disabled=busy||!state.mines||state.mines.open.includes(i));$('#cancel-mine').disabled=busy;
  $('#storage-note').textContent=storageOK?'Spielstand nur auf diesem Gerät gespeichert. Keine Anmeldung nötig.':'Der Browser blockiert die Speicherung. Du kannst spielen; beim Schließen kann der Spielstand verloren gehen.';
  if(!busy){
   const r=state.last[game];$('#result').className='result-bar'+(r&&!ownActive?(r.payout>r.bet?' positive':' neutral'):'');
   $('#result').textContent=game==='flight'&&state.flight?'Sichere deine Coins, bevor der Fuß abstürzt.':game==='plinko'&&state.plinko.length?state.plinko.length+' Bälle unterwegs. Jeder weitere Klick startet einen neuen Ball.':!Number.isSafeInteger(bet)||bet<1?'Gib einen ganzen Einsatz ab 1 Feet Coin ein.':bjActive?'Deine Hand: '+E.handValue(state.blackjack.player)+' · Ziehen, Stehen oder Verdoppeln?':roadActive?(state.road.step?'Spur geschafft. Feet Coins sichern oder den nächsten Schritt wagen?':'Der Fuß wartet am Straßenrand. Wähle „Nächste Spur“.'):mineActive?(state.mines.open.length?'Fuß gefunden. Weiter öffnen oder Feet Coins sichern.':'Die Runde läuft. Wähle ein Feld.'):r?resultText(r):state.balance<bet?(state.balance===0?'Konto leer. Hol dir 100 Coins für die nächste Runde.':'Wähle einen kleineren Einsatz.'):'Wähle deinen Einsatz. Keine Socke muss dafür bezahlt werden.';
  }
  if(busy)return;
  const stamp=game+JSON.stringify(state.last[game]);if(stamp!==resultStamp){resultStamp=stamp;if(state.last[game]&&!active&&canAnimate())$('#result').animate([{opacity:.3,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:380,easing:'ease-out'});}
  const rows=$('#history-rows');rows.replaceChildren();
  if(!state.history.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=5;td.textContent='Noch keine Runden. Die Socken sind tiefenentspannt.';tr.append(td);rows.append(tr);}else state.history.forEach(r=>{const tr=document.createElement('tr');[names[r.game],r.detail,fmt(r.bet)+' Feet Coins',fmt(r.payout)+' Feet Coins',(r.payout-r.bet>=0?'+':'')+fmt(r.payout-r.bet)+' Feet Coins'].forEach((value,i)=>{const td=document.createElement('td');td.textContent=value;if(i===4)td.className=r.payout>r.bet?'positive-text':'muted-text';tr.append(td);});rows.append(tr);});
 }
 function readExternalState(value){try{state=E.clean(JSON.parse(value||'null'));}catch{state=E.fresh();}plinkoView.sync(state.plinko);runFlight();}
 function complete(){if(!busy)return;stopExtra();finishRound=null;busy=false;if(pendingStorage!==undefined){readExternalState(pendingStorage);pendingStorage=undefined;}$('#game-stage').classList.remove('is-rolling');render();if(game==='road')roadView.focus(roadStep());}
 function fail(error){stopExtra();busy=false;clearTimeout(roundTimer);finishRound=null;reels.finish();roadView.finish();blackjackView.finish();plinkoView.finish();scenes.finish();if(pendingStorage!==undefined){readExternalState(pendingStorage);pendingStorage=undefined;}$('#game-stage').classList.remove('is-rolling');render();$('#result').textContent=error.message||'Die Runde konnte nicht starten. Bitte noch einmal versuchen.';}
 function navigate(next,changeHash=true){if(!Object.prototype.hasOwnProperty.call(names,next)||busy)return;game=next;if(changeHash){try{history.replaceState(null,'','#'+(embedded?'sockpot-':'')+game);}catch{location.hash=(embedded?'sockpot-':'')+game;}}render();if(game==='road')roadView.focus(roadStep());}
 $$('[data-game]').forEach(button=>button.addEventListener('click',()=>navigate(button.dataset.game)));
 $$('[data-bet]').forEach(button=>button.addEventListener('click',()=>{if(busy||(activeGame()&&activeGame()!=='plinko'))return;bet=Number(button.dataset.bet);rememberBet();render();}));
 $$('[data-pick-game]').forEach(button=>button.addEventListener('click',()=>{if(busy||activeGame())return;picks[button.dataset.pickGame]=Number(button.dataset.pick);render();}));
 $('#bet-input').addEventListener('input',()=>{bet=$('#bet-input').value===''?NaN:Number($('#bet-input').value);rememberBet();render();});
 $$('[data-stake]').forEach(button=>button.addEventListener('click',()=>{if(busy||(activeGame()&&activeGame()!=='plinko'))return;const current=Number.isSafeInteger(bet)&&bet>0?bet:1;bet=button.dataset.stake==='all'?state.balance:button.dataset.stake==='half'?Math.max(1,Math.floor(current/2)):Math.min(E.CAP,current*2);$('#bet-input').value=bet;rememberBet();render();}));
 $('#play').addEventListener('click',()=>{
  if(busy)return;bet=$('#bet-input').value===''?NaN:Number($('#bet-input').value);rememberBet();
  try{
   if(game==='roulette'){const outcome=rand(37);state=E.rouletteRound(state,rouletteView.ticket(),outcome);rouletteView.commit();persist();$('#visual-roulette').scrollIntoView({behavior:canAnimate()?'smooth':'auto',block:'center'});busy=true;render();finishRound=complete;$('#game-stage').classList.add('is-rolling');$('#result').textContent='Rien ne va plus. Die Kugel rollt, deine Chips liegen.';scenes.start('roulette',outcome,state,4600,canAnimate(),complete);return;}
   if(game==='plinko'){state=E.dropPlinko(state,bet,crypto.randomUUID(),rand(4294967296));persist();plinkoView.sync(state.plinko);render();return;}
   if(game==='flight'){state=E.startFlight(state,bet,rand(1000000),Date.now());persist();render();runFlight();return;}
   if(game==='blackjack'){const before=state,next=E.startBlackjack(state,bet,shuffle(Array.from({length:52},(_,i)=>i)));busy=true;render();state=next;persist();finishRound=complete;$('#result').textContent='Die Karten werden ausgeteilt …';blackjackView.transition(before,next,canAnimate(),complete);return;}
   if(game==='road'){state=E.startRoad(state,bet,rand(4294967295)+1);persist();render();roadView.focus(0);return;}
   if(game==='mines'){const a=rand(9);let b=rand(8);if(b>=a)b++;state=E.startMines(state,bet,[a,b]);persist();render();busy=true;render();finishRound=complete;$('#result').textContent='Der Tresor wird vorbereitet …';scenes.start('mines',null,state,650,canAnimate(),complete);return;}

   const current=game,outcome=game==='roulette'?rand(37):game==='limbo'?rand(1000000):game==='keno'?shuffle(Array.from({length:20},(_,i)=>i+1)).slice(0,5):game==='slots'?[rand(5),rand(5),rand(5)]:game==='wheel'?rand(8):game==='coin'?rand(2):rand(6)+1;
   state=E.instant(state,current,bet,current==='keno'?kenoPicks:picks[current],outcome);persist();busy=true;render();$('#result').textContent=({plinko:'Der Ball fällt. Das Landefach bestimmt deine Auszahlung.',roulette:'Die Kugel läuft. Welches Fach wird es?',limbo:'Flug gestartet. Dein Ziel: '+picks.limbo+'×.',keno:'Die Trommel mischt. Fünf Zahlen werden gezogen.',coin:'Die Münze ist in der Luft …',dice:'Der Würfel rollt über den Tisch …',wheel:'Das Rad dreht. Der Zeiger entscheidet.',slots:'Die Walzen drehen. Drei Stopps, eine Gewinnlinie.'})[current];$('#game-stage').classList.add('is-rolling');
   const animate=canAnimate();finishRound=complete;
   if(current==='slots'){$('.slots-meter').textContent='DREI WALZEN. DREI STOPPS.';$$('.reel').forEach(el=>el.classList.remove('reel-winning'));reels.spin(outcome,animate,complete);return;}
   const duration=({roulette:3700,wheel:3600,limbo:3100,keno:2900,coin:1950,dice:1900})[current]||1200;
   scenes.start(current,outcome,state,duration,animate,complete);
  }catch(error){fail(error);}
 });
 $('#road-step').addEventListener('click',()=>{
  if(busy||!state.road||game!=='road')return;
  try{
   const next=E.stepRoad(state),step=next.road?.step??next.last.road.result.step,crash=!next.road&&next.last.road.result.status==='crash';
   busy=true;render();state=next;persist();finishRound=complete;$('#result').textContent='Der Fuß geht rüber. Toni schaut lieber weg …';
   roadView.move(step,crash,canAnimate(),complete);
  }catch(error){fail(error);}
 });
 for(let i=0;i<9;i++){const button=document.createElement('button');button.type='button';button.className='mine-cell';const inner=document.createElement('span'),front=document.createElement('span'),back=document.createElement('span');inner.className='mine-inner';front.className='mine-front';back.className='mine-back';inner.setAttribute('aria-hidden','true');front.textContent='🦶';back.textContent='✳';inner.append(back,front);button.append(inner);button.addEventListener('click',()=>{if(busy||!state.mines)return;try{const before=state,next=E.reveal(state,i);busy=true;render();state=next;persist();finishRound=complete;$('#result').textContent='Das Feld wird aufgedeckt …';scenes.mines(before,next,i,canAnimate(),complete);}catch(error){fail(error);}});$('.mine-grid').append(button);}
 $('#collect').addEventListener('click',()=>{if(busy)return;try{if(game==='mines'){const before=state,next=E.collect(state);busy=true;render();state=next;persist();finishRound=complete;$('#result').textContent='Füße gesichert. Der Tresor öffnet sich …';scenes.mines(before,next,null,canAnimate(),complete);}else{state=E.collectRoad(state);persist();render();}}catch(error){fail(error);}});
 $('#cancel-mine').addEventListener('click',()=>{if(busy)return;try{state=game==='road'?E.cancelRoad(state):E.cancel(state);persist();render();}catch(error){fail(error);}});
 $('#resume-mines').addEventListener('click',()=>navigate(activeGame()));
 $('#refill').addEventListener('click',()=>{if(busy||activeGame()||state.balance!==0)return;try{state=E.refill(state);persist();render();$('#result').textContent='100 Feet Coins. Neue Runde, neues Sockenglück.';}catch(error){fail(error);}});
 reduced.addEventListener?.('change',e=>{motion=!e.matches;setMotion();});
 window.addEventListener('hashchange',()=>navigate(location.hash.slice(1).replace(/^sockpot-/, ''),false));
 window.addEventListener('storage',event=>{if(event.key!==KEY&&event.key!==null)return;if(busy){pendingStorage=event.newValue;return;}readExternalState(event.newValue);render();if(game==='road')roadView.focus(roadStep());});

 function shuffle(values){for(let i=values.length-1;i>0;i--){const j=rand(i+1);[values[i],values[j]]=[values[j],values[i]];}return values;}
 function renderExtra(){
  if(game==='blackjack')blackjackView.show(state);
  if(game==='plinko')plinkoView.show(state.last.plinko?.result);
  if(game==='keno'){$$('#keno-grid button').forEach(el=>{const selected=kenoPicks.includes(Number(el.dataset.number));el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',String(selected));});$('#keno-count').textContent=kenoPicks.length+' / 3';}
  if(game==='flight')drawFlight();
  scenes.show(state,game,picks);
 }
 for(const action of ['hit','stand','double'])$('#bj-'+action).addEventListener('click',()=>{if(busy||!state.blackjack)return;try{const before=state,next=E.blackjackAction(state,action);busy=true;render();state=next;persist();finishRound=complete;$('#result').textContent=action==='stand'?'Toni deckt auf und spielt seine Hand …':action==='double'?'Doppelter Einsatz. Eine letzte Karte …':'Eine weitere Karte für dich …';blackjackView.transition(before,next,canAnimate(),complete);}catch(error){fail(error);}});
 for(let n=1;n<=20;n++){const el=document.createElement('button');el.type='button';el.dataset.number=n;el.textContent=n;el.setAttribute('aria-label','Keno Zahl '+n);el.addEventListener('click',()=>{if(busy||activeGame())return;if(kenoPicks.includes(n))kenoPicks=kenoPicks.filter(x=>x!==n);else if(kenoPicks.length<3)kenoPicks.push(n);else{$('#result').textContent='Entferne zuerst eine Zahl. Du kannst genau drei wählen.';return;}render();});$('#keno-grid').append(el);}

 function saveBalls(bodies){const map=new Map(bodies.map(b=>[b.id,b]));for(const b of state.plinko){const body=map.get(b.id);if(body)b.body={...body};}persist();}
 function landBalls(landed,bodies){for(const b of landed){if(state.plinko.some(x=>x.id===b.id))state=E.settlePlinko(state,b.id,b.bin);}saveBalls(bodies);render();}
 let flightFrame=0;
 function drawFlight(){const f=state.flight,r=state.last.flight?.result,value=f?E.flightFactor(f,Date.now()):r?.factor??1,crashed=!f&&r?.status==='crash';
  const stage=$('#visual-flight');stage.dataset.status=f?'flying':crashed?'crashed':r?'secured':'ready';$('#flight-factor').textContent=factor(Math.floor(value*100)/100);$('#flight-status').textContent=f?'FUSS IN DER LUFT':crashed?'ABGESTÜRZT':r?'COINS GESICHERT':'BEREIT ZUM ABHEBEN';
  const payout=f?Math.min(E.CAP-state.balance,Math.floor(f.bet*Math.floor(value*100)/100)):state.last.flight?.payout??0;$('#flight-value').textContent=f?fmt(payout)+' Feet Coins sicherbar':r?fmt(payout)+' Feet Coins zurück':'Dein Einsatz. Dein Ausstieg.';
  $('#flight-cashout').disabled=!f;$('#flight-cashout').textContent=f?fmt(payout)+' Feet Coins sichern →':'Feet Coins sichern';
  const t=Math.log(value),x=45+425*(1-Math.exp(-t*.65)),y=260-215*(1-Math.exp(-t*.7)),endY=crashed?265:y,d='M45 260 Q '+(45+(x-45)*.65)+' 260 '+x+' '+endY;
  $('#flight-path').setAttribute('d',d);$('#flight-area').setAttribute('d',d+' L'+x+' 290 L45 290Z');$('#flying-foot').setAttribute('transform','translate('+x+' '+endY+') rotate('+(crashed?115:-25)+')');
 }
 function runFlight(){cancelAnimationFrame(flightFrame);flightFrame=0;if(!state.flight){drawFlight();return;}const now=Date.now();if(E.flightFactor(state.flight,now)>=state.flight.crash){state=E.finishFlight(state,now);persist();render();return;}drawFlight();flightFrame=requestAnimationFrame(runFlight);}
 $('#flight-cashout').addEventListener('click',()=>{if(!state.flight)return;state=E.finishFlight(state,Date.now(),true);persist();runFlight();render();});
 window.addEventListener('pageshow',()=>{if(!busy&&!activeGame()){bet=$('#bet-input').value===''?NaN:Number($('#bet-input').value);rememberBet();render();}});
 window.addEventListener('pagehide',()=>saveBalls(plinkoView.snapshot()));
 const initial=location.hash.slice(1).replace(/^sockpot-/, '');game=Object.prototype.hasOwnProperty.call(names,initial)?initial:activeGame()||'blackjack';setMotion();render();plinkoView.sync(state.plinko);runFlight();if(game==='road')roadView.focus(roadStep());
})();
