(() => {
 'use strict';
 const key='footverse-discoveries-v1',reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const secrets=[
  {id:'orbit',title:'Orbit ohne Schuhe',hint:'Das Logo hat fünf Zacken. Vielleicht braucht es fünf Grüße.',text:'Du hast den Fußreaktor auf eine Extrarunde geschickt.'},
  {id:'scan',title:'Unidentified Foot Object',hint:'Ein Scan ist Wissenschaft. Drei Scans sind verdächtig.',text:'Drei Vibe-Scans später: Ein außerirdischer Fuß meldet sich.'},
  {id:'night',title:'Oldschool, barfuß',hint:'Ein alter Spielecode: ↑ ↑ ↓ ↓ ← → ← → B A. Außerhalb von Textfeldern.',text:'Der Klassiker funktioniert auch ohne Schuhe. Willkommen in der Nachtschicht.'}
 ];
 let found=new Set(),logoHits=0,logoAt=0,scans=0,sequence=[],effectTimer=0;
 try{const saved=JSON.parse(localStorage.getItem(key));if(Array.isArray(saved))found=new Set(saved.filter(id=>secrets.some(s=>s.id===id)));}catch{}
 const button=document.createElement('button');button.type='button';button.className='secret-journal-button';
 const dialog=document.createElement('dialog');dialog.id='secret-journal';dialog.setAttribute('aria-labelledby','secret-title');
 dialog.innerHTML='<button type="button" class="close-dialog" aria-label="Schließen">×</button><span class="secret-count"></span><h2 id="secret-title">Die geheimen Akten.</h2><p class="secret-intro">Drei kleine Geheimnisse im Footverse. Nur zum Entdecken — ohne Coins oder Einfluss auf die Spiele.</p><div class="secret-list"></div>';
 const sky=document.createElement('div');sky.className='secret-sky';sky.setAttribute('aria-hidden','true');
 document.body.append(dialog,sky);const footer=document.querySelector('footer');if(footer)footer.before(button);else document.body.append(button);
 function paint(){
  button.textContent='✦ GEHEIME AKTEN · '+found.size+' / 3';dialog.querySelector('.secret-count').textContent=found.size+' VON 3 ENTDECKT';
  const list=dialog.querySelector('.secret-list');list.replaceChildren();
  for(const secret of secrets){const entry=document.createElement('article'),title=document.createElement('b'),copy=document.createElement('p');entry.className='secret-entry'+(found.has(secret.id)?'':' locked');title.textContent=found.has(secret.id)?'✦ '+secret.title:'? Verschlossene Akte';copy.textContent=found.has(secret.id)?secret.text:secret.hint;entry.append(title,copy);if(found.has(secret.id)){const replay=document.createElement('button');replay.type='button';replay.className='secret-replay';replay.textContent='Noch einmal ansehen ↗';replay.addEventListener('click',()=>{dialog.close();effect(secret.id);});entry.append(replay);}list.append(entry);}
 }
 function effect(id){
  clearTimeout(effectTimer);sky.replaceChildren();document.body.classList.remove('secret-night','secret-orbit');
  if(id==='orbit')document.querySelector('#chamber').scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'center'});
  if(!reduced.matches){if(id==='scan'){const ufo=document.createElement('span');ufo.className='secret-flyer';ufo.innerHTML='🛸<small>FEET COME IN PEACE</small>';sky.append(ufo);}else document.body.classList.add('secret-'+id);}
  effectTimer=setTimeout(()=>{sky.replaceChildren();document.body.classList.remove('secret-night','secret-orbit');},id==='night'?12000:4500);
  const secret=secrets.find(s=>s.id===id);if(typeof notify==='function')notify('Geheimnis entdeckt: '+secret.title+' ✦');
 }
 function unlock(id){found.add(id);try{localStorage.setItem(key,JSON.stringify([...found]));}catch{}paint();effect(id);}
 button.addEventListener('click',()=>{paint();dialog.showModal();});dialog.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{const r=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))dialog.close();});
 document.querySelector('.logo').addEventListener('click',()=>{const now=Date.now();logoHits=now-logoAt>2200?1:logoHits+1;logoAt=now;if(logoHits===5){logoHits=0;unlock('orbit');}});
 document.querySelector('#scan').addEventListener('click',()=>{if(++scans===3){scans=0;unlock('scan');}});
 const code=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
 document.addEventListener('keydown',event=>{if(event.repeat||event.ctrlKey||event.altKey||event.metaKey||event.target.closest('input,textarea,select,[contenteditable],dialog')){sequence=[];return;}const pressed=event.key.length===1?event.key.toLowerCase():event.key;sequence.push(pressed);sequence=sequence.slice(-code.length);if(sequence.length===code.length&&sequence.every((v,i)=>v===code[i])){sequence=[];unlock('night');}});
 if('IntersectionObserver' in window){const road=document.querySelector('#visual-road');new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('road-resting',!entry.isIntersecting)),{rootMargin:'80px'}).observe(road);}
 if('IntersectionObserver' in window&&!reduced.matches){
  const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-seen');reveal.unobserve(entry.target);}}),{threshold:.08});
  document.querySelectorAll('.drop-card,.connection-steps article,.transmission,.ending').forEach((el,i)=>{el.classList.add('footverse-reveal');el.style.setProperty('--reveal-delay',(i%3)*65+'ms');reveal.observe(el);el.addEventListener('focusin',()=>el.classList.add('is-seen'));});
 }
 paint();
})();
