'use strict';
(() => {
 const root=document.querySelector('.arcade-app');
 const E=window.FootArcade,$=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
 const embedded=root.classList.contains('arcade-embedded');
 const KEY='footverse-arcade-v2',OLD='toni-sockpot-v1';
 const icons=['🦶','🧦','🛸','💎','🍀'],dice=['⚀','⚁','⚂','⚃','⚄','⚅'];
 const reels=window.SockpotReels.create($$('.reel'),icons);
 const names={slots:'Sockpot',wheel:'Glücksrad',coin:'Fuß oder Socke',dice:'Würfelwerk',mines:'Socken-Minen'};
 const titles={slots:'Drei Walzen. Ein Sockpot.',wheel:'Heute dreht Toni das Rad.',coin:'Fuß oder Socke? Deine Wahl.',dice:'Große Würfe. Kleine Socken.',mines:'Sieben Diamanten. Zwei Socken.'};
 const rules={
  slots:'<p>Fünf Symbole, je 20 % pro Walze. Genau ein Paar zahlt 2×. Drei gleiche: 💎 15× · 🦶 10× · 🛸 6× · 🧦 5× · 🍀 4×.</p><p>Drei gleiche: 4 %. Genau ein Paar: 48 %. Drei verschiedene: 48 % und keine Auszahlung.</p>',
  wheel:'<p>Acht gleich große Felder mit jeweils 12,5 % Chance. Vier Felder zahlen 0×, zwei zahlen 2×, eines 3× und eines 5×. Der Zeiger oben zeigt das Ergebnis.</p>',
  coin:'<p>Wähle vor dem Wurf Fuß oder Socke. Beide Seiten haben genau 50 % Chance. Richtig: 2× Einsatz zurück. Falsch: keine Auszahlung.</p>',
  dice:'<p>Wähle 1–3 oder 4–6. Jede Zahl hat eine Chance von 1/6. Dein Bereich gewinnt mit 50 % Chance und zahlt 2× Einsatz. Sonst gibt es nichts zurück.</p>',
  mines:'<p>In neun Feldern liegen genau zwei Socken. Diamanten sammeln und nach jedem Treffer freiwillig Feet Coins sichern. Eine Socke beendet die Runde ohne Auszahlung.</p><p>Auszahlung nach 1 / 2 / 3 / 4 / 5 / 6 / 7 Diamanten: 1,25× / 1,6× / 2,2× / 3,1× / 4,8× / 8× / 20×. Es wird auf ganze Punkte abgerundet. Beim siebten Diamanten wird automatisch ausgezahlt.</p><p>Die erste Auswahl ist mit 7/9 sicher. Nach k Diamanten sind noch 7−k von 9−k Feldern sicher. Ein Neuladen speichert Feld und Fortschritt, würfelt aber nicht neu. Abbrechen verliert den Einsatz.</p>'
 };
 let state=E.fresh(),storageOK=true,busy=false,game='slots',bet=25,picks={coin:0,dice:0},wheelAngle=0;
 let pendingStorage,roundTimer,finishRound=null;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let motion=!reduced.matches;
 function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;}catch{storageOK=false;}}
 try{const stored=localStorage.getItem(KEY);if(stored)state=E.clean(JSON.parse(stored));else{const old=JSON.parse(localStorage.getItem(OLD)||'null');if(old&&Number.isSafeInteger(old.balance)&&old.balance>=0&&old.balance<=E.CAP){state.balance=old.balance;state.rounds=Number.isSafeInteger(old.spins)&&old.spins>=0?Math.min(E.CAP,old.spins):0;state.best=Number.isSafeInteger(old.best)&&old.best>=0?Math.min(E.CAP,old.best):0;}}}catch{storageOK=false;}
 const fmt=n=>new Intl.NumberFormat('de-AT').format(n);
 const resultText=r=>`${r.detail}. ${fmt(r.payout)} Feet Coins zurück · netto ${r.payout-r.bet>=0?'+':''}${fmt(r.payout-r.bet)} Feet Coins.`;
 function rand(n){if(globalThis.crypto?.getRandomValues){const a=new Uint32Array(1),limit=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a);}while(a[0]>=limit);return a[0]%n;}return Math.floor(Math.random()*n);}
 function stopAnimation(){reels.finish();if(finishRound){clearTimeout(roundTimer);finishRound();}}
 function setMotion(){root.classList.toggle('no-motion',!motion);if(!motion)stopAnimation();$('#motion-toggle').textContent=motion?'Animationen an':'Animationen aus';$('#motion-toggle').setAttribute('aria-pressed',String(motion));}
 function renderVisual(){
  const r=state.last[game];
  if(game==='slots')reels.show(r&&Array.isArray(r.result)?r.result:[0,1,3]);
  if(game==='coin')$('#coin span').textContent=r&&r.result===1?'🧦':'🦶';
  if(game==='dice'){const n=r&&Number.isInteger(r.result)&&r.result>=1&&r.result<=6?r.result:1;$('#die span').textContent=dice[n-1];$('#die').setAttribute('aria-label','Würfel zeigt '+n);}
  if(game==='wheel'){const target=r?(360-r.result*45)%360:0;if(wheelAngle%360!==target)wheelAngle=Math.floor(wheelAngle/360)*360+target;$('#wheel').style.transitionDuration='0ms';$('#wheel').style.transform=`rotate(${wheelAngle}deg)`;}
  if(game==='mines'){
   const m=state.mines,ended=!m&&r&&r.result&&Array.isArray(r.result.bombs)&&Array.isArray(r.result.open)?r.result:null;
   $$('.mine-cell').forEach((cell,i)=>{const open=m?.open.includes(i)||ended?.open.includes(i);const bomb=ended?.bombs.includes(i);cell.textContent=bomb?'🧦':open?'💎':'?';cell.className='mine-cell'+(open?' safe':'')+(bomb?' bomb':'')+(ended?.hit===i?' hit':'');cell.disabled=!m||open||busy;cell.setAttribute('aria-label',`Feld ${i+1}: ${bomb?'Socke':open?'Diamant':'verdeckt'}`);});
   const count=m?m.open.length:0;$('#mine-value').textContent=m?`${count} / 7 · ${fmt(Math.floor(m.bet*E.MINE_MULT[count]))} Feet Coins sicherbar`:'Bereit für ein neues Feld';
   $('#mine-hint').textContent=m?`Nächste Auswahl: ${7-count} von ${9-count} Feldern sind sicher.`:'Zwei Socken liegen zufällig verteilt. Öffne Diamanten oder starte eine neue Runde.';
  }
 }
 function render(){
  if(!busy){$('#balance').innerHTML=`${fmt(state.balance)} <small>Feet Coins</small>`;$('#rounds').textContent=fmt(state.rounds);$('#wins').textContent=fmt(state.wins);$('#best').textContent=fmt(state.best)+' Feet Coins';renderVisual();}
  $$('#game-stage .game-visual').forEach(el=>el.hidden=el.id!=='visual-'+game);
  $$('[data-game]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.game===game)));
  $('#game-title').textContent=titles[game];$('#game-number').textContent='SPIEL 0'+(Object.keys(names).indexOf(game)+1)+' / '+names[game].toUpperCase();
  $('#round-state').textContent=busy?'LÄUFT':state.mines?'MINENRUNDE AKTIV':'BEREIT';
  $('#rules-content').innerHTML=rules[game]+'<p><strong>Alle Auszahlungen enthalten den Einsatz.</strong> 25 Feet Coins setzen und 50 Feet Coins zurückbekommen bedeutet netto +25 Feet Coins. Feet Coins sind kostenlose Spielpunkte ohne Geldwert.</p>';
  $$('[data-bet]').forEach(el=>{el.setAttribute('aria-pressed',String(Number(el.dataset.bet)===bet));el.disabled=busy||Boolean(state.mines);});
  $$('[data-pick-game]').forEach(el=>{el.setAttribute('aria-pressed',String(Number(el.dataset.pick)===picks[el.dataset.pickGame]));el.disabled=busy||Boolean(state.mines);});
  $$('[data-game]').forEach(el=>el.disabled=busy);
  $('#active-reminder').hidden=!state.mines||game==='mines';
  const mineActive=game==='mines'&&state.mines;
  $('#play').hidden=Boolean(mineActive);$('#collect').hidden=!mineActive;$('#cancel-mine').hidden=!mineActive;
  $('#collect').disabled=busy||!state.mines?.open.length;$('#collect').textContent=mineActive?`${fmt(Math.floor(state.mines.bet*E.MINE_MULT[state.mines.open.length]))} Feet Coins sichern →`:'Feet Coins sichern';
  $('#play').disabled=busy||Boolean(state.mines)||state.balance<bet;$('#play').textContent=busy?'Runde läuft …':(game==='mines'?'Feld starten':game==='coin'?'Münze werfen':game==='dice'?'Würfeln':'Drehen')+' · '+bet+' Feet Coins';
  $('#refill').disabled=busy;$('#reset').disabled=busy||Boolean(state.mines);$('#cancel-mine').disabled=busy;
  $('#storage-note').textContent=storageOK?'Spielstand nur auf diesem Gerät gespeichert. Keine Anmeldung nötig.':'Der Browser blockiert die Speicherung. Du kannst spielen; beim Schließen kann der Spielstand verloren gehen.';
  if(!busy){const r=state.last[game];$('#result').className='result-bar'+(r&&!mineActive?(r.payout>r.bet?' positive':' neutral'):'');$('#result').textContent=mineActive?(state.mines.open.length?'Diamant gefunden. Weiter öffnen oder Feet Coins sichern.':'Die Runde läuft. Wähle ein Feld.'):r?resultText(r):state.balance<bet?'Nicht genug Feet Coins für diesen Einsatz. Du kannst kostenlos nachladen.':'Wähle deinen Einsatz. Keine Socke muss dafür bezahlt werden.';}
  if(busy)return;
  const rows=$('#history-rows');rows.replaceChildren();
  if(!state.history.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=5;td.textContent='Noch keine Runden. Die Socken sind tiefenentspannt.';tr.append(td);rows.append(tr);}else state.history.forEach(r=>{const tr=document.createElement('tr');[names[r.game],r.detail,fmt(r.bet)+' Feet Coins',fmt(r.payout)+' Feet Coins',(r.payout-r.bet>=0?'+':'')+fmt(r.payout-r.bet)+' Feet Coins'].forEach((value,i)=>{const td=document.createElement('td');td.textContent=value;if(i===4)td.className=r.payout>r.bet?'positive-text':'muted-text';tr.append(td);});rows.append(tr);});
 }
 function readExternalState(value){try{state=E.clean(JSON.parse(value||'null'));}catch{state=E.fresh();}wheelAngle=0;}
 function fail(error){busy=false;clearTimeout(roundTimer);finishRound=null;reels.finish();if(pendingStorage!==undefined){readExternalState(pendingStorage);pendingStorage=undefined;}$('#game-stage').classList.remove('is-rolling');render();$('#result').textContent=error.message||'Die Runde konnte nicht starten. Bitte noch einmal versuchen.';}
 function navigate(next,changeHash=true){if(!Object.prototype.hasOwnProperty.call(names,next)||busy)return;game=next;if(changeHash){try{history.replaceState(null,'','#'+(embedded?'sockpot-':'')+game);}catch{location.hash=(embedded?'sockpot-':'')+game;}}render();}
 $$('[data-game]').forEach(button=>button.addEventListener('click',()=>navigate(button.dataset.game)));
 $$('[data-bet]').forEach(button=>button.addEventListener('click',()=>{if(busy||state.mines)return;bet=Number(button.dataset.bet);render();}));
 $$('[data-pick-game]').forEach(button=>button.addEventListener('click',()=>{if(busy||state.mines)return;picks[button.dataset.pickGame]=Number(button.dataset.pick);render();}));
 $('#play').addEventListener('click',()=>{
  if(busy)return;
  try{
   if(game==='mines'){const a=rand(9);let b=rand(8);if(b>=a)b++;state=E.startMines(state,bet,[a,b]);persist();render();return;}
   const current=game;const outcome=game==='slots'?[rand(5),rand(5),rand(5)]:game==='wheel'?rand(8):game==='coin'?rand(2):rand(6)+1;
   state=E.instant(state,current,bet,picks[current],outcome);persist();busy=true;render();$('#result').textContent='Toni sortiert seine Glückssocken …';$('#game-stage').classList.add('is-rolling');
   const animate=motion&&!reduced.matches&&!document.body.classList.contains('fx-off');
   const complete=()=>{if(!busy)return;finishRound=null;busy=false;if(pendingStorage!==undefined){readExternalState(pendingStorage);pendingStorage=undefined;}$('#game-stage').classList.remove('is-rolling');render();};
   finishRound=complete;
   if(current==='slots'){reels.spin(outcome,animate,complete);return;}
   const duration=animate?(game==='wheel'?1500:900):0;
   if(current==='wheel'){wheelAngle=Math.ceil(wheelAngle/360)*360+720+(360-outcome*45)%360;$('#wheel').style.transitionDuration=duration+'ms';$('#wheel').style.transform=`rotate(${wheelAngle}deg)`;}
   roundTimer=setTimeout(complete,duration);
  }catch(error){fail(error);}
 });
 for(let i=0;i<9;i++){const button=document.createElement('button');button.type='button';button.className='mine-cell';button.textContent='?';button.addEventListener('click',()=>{if(busy||!state.mines)return;try{state=E.reveal(state,i);persist();render();}catch(error){fail(error);}});$('.mine-grid').append(button);}
 $('#collect').addEventListener('click',()=>{if(busy)return;try{state=E.collect(state);persist();render();}catch(error){fail(error);}});
 $('#cancel-mine').addEventListener('click',()=>{if(busy)return;try{state=E.cancel(state);persist();render();}catch(error){fail(error);}});
 $('#resume-mines').addEventListener('click',()=>navigate('mines'));
 $('#refill').addEventListener('click',()=>{if(busy)return;state=E.refill(state);persist();render();$('#result').textContent='1.000 kostenlose Feet Coins nachgeladen. Keine Socke wurde belastet.';});
 $('#reset').addEventListener('click',()=>{if(busy||state.mines)return;state=E.fresh();wheelAngle=0;$('#wheel').style.transform='rotate(0deg)';persist();render();$('#result').textContent='Alles auf Anfang: 2.500 Feet Coins. Runden und Statistik zurückgesetzt.';});
 $('#motion-toggle').addEventListener('click',()=>{motion=!motion;setMotion();});reduced.addEventListener?.('change',e=>{if(e.matches){motion=false;setMotion();}});
 document.querySelector('#effects')?.addEventListener('click',()=>{if(document.body.classList.contains('fx-off'))stopAnimation();});
 window.addEventListener('hashchange',()=>navigate(location.hash.slice(1).replace(/^sockpot-/, ''),false));
 window.addEventListener('storage',event=>{if(event.key!==KEY&&event.key!==null)return;if(busy){pendingStorage=event.newValue;return;}readExternalState(event.newValue);render();});
 const initial=location.hash.slice(1).replace(/^sockpot-/, '');game=Object.prototype.hasOwnProperty.call(names,initial)?initial:state.mines?'mines':'slots';setMotion();render();
})();
