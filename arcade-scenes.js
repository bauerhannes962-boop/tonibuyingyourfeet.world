'use strict';
(() => {
 const ORDER=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
 const dicePose=n=>[{x:0,y:0},{x:-90,y:0},{x:0,y:-90},{x:0,y:90},{x:90,y:0},{x:0,y:180}][n-1];
 function create(root,E){
  const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
  let active=null,frame=0,animations=[],timers=[],wheelAngle=0,rouletteAngle=0,coinAngle=0,diceRotation=dicePose(1);
  const format=n=>n.toLocaleString('de-AT',{minimumFractionDigits:2,maximumFractionDigits:2})+'×';
  const theme={roulette:['EUROPEAN SINGLE ZERO','37 POCKETS'],plinko:['THE GRAVITY ROOM','ONE BALL. REAL BOUNCES.'],limbo:['FLIGHT CONTROL','TARGET LOCKED'],keno:['TONI’S NUMBER CLUB','LIVE DRAW / 05'],slots:['THE ORIGINAL SOCKPOT','THREE REELS. ONE LINE.'],wheel:['THE LUCK STUDIO','08 EQUAL SEGMENTS'],coin:['FEET OR SOCKS','THE COIN ROOM'],dice:['TONI’S DICE TABLE','ONE DIE. SIX SIDES.'],mines:['THE DIAMOND VAULT','07 GEMS / 02 SOCKS']};
  for(const [game,words] of Object.entries(theme)){const el=document.createElement('div');el.className='scene-heading';const a=document.createElement('span'),b=document.createElement('b');a.textContent=words[0];b.textContent=words[1];el.append(a,b);$('#visual-'+game).prepend(el);}
  const colors=[];ORDER.forEach((n,i)=>{const el=document.createElement('span');el.className='roulette-pocket';el.textContent=n;el.style.setProperty('--pocket-angle',i*360/37+'deg');$('.roulette-pockets').append(el);const c=n===0?'#418b70':E.RED.includes(n)?'#b34d66':'#20242b';colors.push(c+' '+i*360/37+'deg '+(i+1)*360/37+'deg');});$('#roulette-disc').style.background='conic-gradient(from '+(-180/37)+'deg,'+colors.join(',')+')';
  for(let i=0;i<24;i++){const el=document.createElement('i');el.style.setProperty('--bulb-angle',i*15+'deg');$('.wheel-bulbs').append(el);}
  for(let i=0;i<10;i++){const el=document.createElement('i');el.style.transform='translateZ('+(i-5)+'px)';el.className='coin-edge';$('#coin').prepend(el);}
  const pips=[[4],[0,8],[0,4,8],[0,2,6,8],[0,2,4,6,8],[0,2,3,5,6,8]];
  $$('.die-face').forEach((el,i)=>{el.replaceChildren();const grid=document.createElement('div');grid.className='dice-pips';for(let n=0;n<9;n++){const pip=document.createElement('i');pip.className=pips[i].includes(n)?'pip':'blank';grid.append(pip);}el.append(grid);});
  function animate(el,frames,options){const a=el.animate(frames,options);animations.push(a);return a;}
  function schedule(fn,delay){timers.push(setTimeout(()=>{if(active)fn();},delay));}
  function clear(){cancelAnimationFrame(frame);frame=0;timers.forEach(clearTimeout);timers=[];animations.forEach(a=>a.cancel());animations=[];}
  function finish(){if(!active)return;const a=active;active=null;clear();a.done();}
  function transformDie(p){return 'rotateX(-16deg) rotateY(24deg) rotateX('+p.x+'deg) rotateY('+p.y+'deg) rotateZ(-8deg)';}
  function setKeno(draw,pick){const slots=$$('.keno-draw>span');slots.forEach((el,i)=>{el.textContent=draw[i]??'–';el.classList.toggle('hit',pick.includes(draw[i]));});$$('#keno-grid button').forEach(el=>{const n=+el.dataset.number;el.classList.toggle('drawn',draw.includes(n));el.classList.toggle('matched',draw.includes(n)&&pick.includes(n));});}
  function limboDraw(value,target,progress=1){
   const x=44+progress*402,y=237-Math.min(1,Math.log(Math.max(1,value))/Math.log(Math.max(2,target*1.8)))*182;
   const controlY=237+(y-237)*.15,d='M44 237 Q '+(44+(x-44)*.54)+' '+controlY+' '+x+' '+y;
   $('#limbo-curve').setAttribute('d',d);$('#limbo-area').setAttribute('d',d+' L'+x+' 250 L44 250 Z');$('#limbo-rocket').setAttribute('transform','translate('+x+' '+y+') rotate(-40)');
   const targetY=237-Math.min(1,Math.log(target)/Math.log(Math.max(2,target*1.8)))*182;$('#limbo-target').setAttribute('y1',targetY);$('#limbo-target').setAttribute('y2',targetY);$('#limbo-target-label').setAttribute('y',targetY-8);$('#limbo-target-label').textContent='ZIEL '+target+'×';$('#limbo-number').textContent=format(value);
  }
  function show(state,game,picks){
   if(active)return;const r=state.last[game];
   if(game==='roulette'){const n=r?.result;$('#roulette-number').textContent=n??'–';$('#roulette-disc').dataset.color=n===0?'green':E.RED.includes(n)?'red':'black';const target=n===undefined?0:(360-ORDER.indexOf(n)*360/37)%360;rouletteAngle=Math.floor(rouletteAngle/360)*360+target;$('#roulette-disc').style.transform='rotate('+rouletteAngle+'deg)';$('.roulette-ball-track').style.transform='rotate(0deg) scale('+(n===undefined?1.1:.86)+')';const recent=$('.roulette-recent');recent.replaceChildren();state.history.filter(h=>h.game==='roulette'&&Number.isInteger(h.result)).slice(0,7).forEach(h=>{const el=document.createElement('span');el.textContent=h.result;el.dataset.color=h.result===0?'green':E.RED.includes(h.result)?'red':'black';recent.append(el);});}
   if(game==='wheel'){const target=r?(360-r.result*45)%360:0;wheelAngle=Math.floor(wheelAngle/360)*360+target;$('#wheel').style.transitionDuration='0ms';$('#wheel').style.transform='rotate('+wheelAngle+'deg)';$('.wheel-readout').textContent=r?E.WHEEL[r.result]+'× · '+(r.payout?'GETROFFEN':'NÄCHSTE RUNDE?'):'DEIN GLÜCK WARTET';}
   if(game==='coin'){const side=r?.result??0;coinAngle=Math.floor(coinAngle/360)*360+side*180;$('#coin').style.transform='rotateY('+coinAngle+'deg)';$('#coin').setAttribute('aria-label','Münze zeigt '+(side?'Socke':'Fuß'));$('.coin-readout').textContent=r?(side?'SOCKE':'FUSS'):'BEREIT ZUM WURF';}
   if(game==='dice'){const n=r?.result??1;diceRotation=dicePose(n);$('#die').style.transform=transformDie(diceRotation);$('#die').setAttribute('aria-label','Würfel zeigt '+n);$('.dice-readout').textContent=r?n+' · '+(n<=3?'NIEDRIG':'HOCH'):'DEIN WURF WARTET';}
   if(game==='limbo'){const value=r?.result??1;limboDraw(value,r?.pick??picks.limbo,r?1:0);$('#visual-limbo').dataset.flight=r?(value>=r.pick?'won':'crashed'):'ready';$('.limbo-flight-status').textContent=r?(value>=r.pick?'ZIEL ERREICHT':'FLUG BEENDET'):'BEREIT ZUM ABHEBEN';}
   if(game==='keno'){const result=r?.result;setKeno(result?.draw??[],result?.pick??[]);$('.keno-draw-label').textContent=result?result.pick.filter(n=>result.draw.includes(n)).length+' / 3 TREFFER':'DIE NÄCHSTEN FÜNF ZAHLEN';}
   if(game==='slots'){const result=r?.result;$$('.reel').forEach((el,i)=>el.classList.toggle('reel-winning',Boolean(result&&r.payout&&result.filter(n=>n===result[i]).length>=2)));$('.slots-meter').textContent=r?(r.payout?'HIT · '+r.payout+' FEET COINS':'NEXT SPIN. SAME ENERGY.'):'PAAR 2× / DREIER BIS 15×';}
   if(game==='mines'){const count=state.mines?.open.length??r?.result.open.length??0;$$('.mine-progress>i').forEach((el,i)=>el.classList.toggle('lit',i<count));$('.mine-grid').dataset.status=state.mines?'active':r?(r.result.hit!==null?'hit':'collected'):'ready';}
  }
  function start(game,outcome,state,duration,animateMotion,done){
   if(active)return;active={done};if(!animateMotion){finish();return;}
   const play=(el,frames,options={})=>animate(el,frames,{duration,fill:'forwards',...options});
   if(game==='mines')$$('.mine-cell').forEach((el,i)=>play(el,[{transform:'translateY(18px) scale(.9)',opacity:0},{transform:'translateY(0) scale(1)',opacity:1}],{duration:350,delay:i*30}));
   if(game==='coin'){
    const from=coinAngle;coinAngle+=2160+((outcome*180-from%360+360)%360);$('.coin-readout').textContent='IN DER LUFT …';
    play($('#coin'),[{transform:'translateY(0) rotateY('+from+'deg)'},{transform:'translateY(-115px) rotateY('+(from+950)+'deg) rotateZ(-16deg)',offset:.38},{transform:'translateY(12px) rotateY('+coinAngle+'deg) rotateZ(5deg)',offset:.79},{transform:'translateY(-16px) rotateY('+coinAngle+'deg) rotateZ(-3deg)',offset:.89},{transform:'translateY(0) rotateY('+coinAngle+'deg) rotateZ(0deg)'}],{easing:'linear'});
    play($('.coin-shadow'),[{transform:'scale(1)',opacity:.45},{transform:'scale(.35)',opacity:.12,offset:.38},{transform:'scale(1.3)',opacity:.65,offset:.79},{transform:'scale(1)',opacity:.45}]);
   }
   if(game==='dice'){
    const from=diceRotation,to=dicePose(outcome);$('.dice-readout').textContent='WÜRFEL ROLLT …';
    play($('#die'),[{transform:transformDie(from)},{transform:'translate(-55px,-62px) rotateX('+(to.x+390)+'deg) rotateY('+(to.y+320)+'deg) rotateZ(45deg)',offset:.32},{transform:'translate(40px,7px) rotateX('+(to.x+710)+'deg) rotateY('+(to.y+740)+'deg) rotateZ(-16deg)',offset:.68},{transform:'translate(-10px,-18px) rotateX('+(to.x+730)+'deg) rotateY('+(to.y+718)+'deg) rotateZ(-2deg)',offset:.84},{transform:transformDie({x:to.x+720,y:to.y+720})}],{easing:'cubic-bezier(.2,.5,.3,1)'});
    play($('.dice-shadow'),[{transform:'translateX(0) scale(1)',opacity:.35},{transform:'translateX(-55px) scale(.6)',opacity:.15,offset:.32},{transform:'translateX(40px) scale(1.2)',opacity:.5,offset:.68},{transform:'translateX(0) scale(1)',opacity:.35}]);
   }
   if(game==='roulette'){
    const from=rouletteAngle;rouletteAngle+=1800+((360-ORDER.indexOf(outcome)*360/37-from%360+360)%360);$('#roulette-number').textContent='…';
    play($('#roulette-disc'),[{transform:'rotate('+from+'deg)'},{transform:'rotate('+rouletteAngle+'deg)'}],{easing:'cubic-bezier(.1,.65,.12,1)'});
    play($('.roulette-ball-track'),[{transform:$('.roulette-ball-track').style.transform||'rotate(0deg) scale(1.1)'},{transform:'rotate(-90deg) scale(1.1)',offset:.07},{transform:'rotate(-1200deg) scale(1.1)',offset:.66},{transform:'rotate(-1410deg) scale(.9)',offset:.88},{transform:'rotate(-1440deg) scale(.86)'}],{easing:'cubic-bezier(.15,.55,.2,1)'});
   }
   if(game==='wheel'){
    const from=wheelAngle;wheelAngle=Math.ceil(from/360)*360+1440+(360-outcome*45)%360;$('.wheel-readout').textContent='DAS RAD DREHT …';let previous=Math.floor(from/45),startTime;
    const tick=now=>{if(!active)return;if(startTime===undefined)startTime=now;const p=Math.min(1,(now-startTime)/duration),angle=from+(wheelAngle-from)*(1-Math.pow(1-p,4));$('#wheel').style.transform='rotate('+angle+'deg)';const sector=Math.floor((angle+22.5)/45);if(sector!==previous){previous=sector;animate($('.wheel-pointer'),[{transform:'translateX(-50%) rotate(-24deg)'},{transform:'translateX(-50%) rotate(0)'}],{duration:120});}if(p<1)frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);
   }
   if(game==='limbo'){
    const result=state.last.limbo,target=result.pick,value=result.result;let started;$('#visual-limbo').dataset.flight='flying';$('.limbo-flight-status').textContent='FLUG LÄUFT …';
    const tick=now=>{if(!active)return;if(started===undefined)started=now;const p=Math.min(1,(now-started)/(duration-400));limboDraw(Math.pow(value,p),target,p);if(p<1)frame=requestAnimationFrame(tick);else{$('#visual-limbo').dataset.flight=value>=target?'won':'crashed';$('.limbo-flight-status').textContent=value>=target?'ZIEL ERREICHT':'FLUG BEENDET';if(value<target)animate($('#limbo-rocket'),[{opacity:1},{opacity:.35,filter:'blur(1px)'}],{duration:350,fill:'forwards'});}};frame=requestAnimationFrame(tick);
   }
   if(game==='keno'){
    const picked=state.last.keno.result.pick;setKeno([],[]);$('.keno-draw-label').textContent='DIE TROMMEL MISCHT …';
    outcome.forEach((n,i)=>schedule(()=>{const draw=outcome.slice(0,i+1);setKeno(draw,picked);$('.keno-draw-label').textContent='ZAHL '+(i+1)+' / 5 · '+draw.filter(x=>picked.includes(x)).length+' TREFFER';const el=$$('.keno-draw>span')[i],from=$('.keno-globe').getBoundingClientRect(),to=el.getBoundingClientRect();animate(el,[{transform:'translate('+(from.left+from.width/2-to.left-to.width/2)+'px,'+(from.top+from.height/2-to.top-to.height/2)+'px) scale(.45)',opacity:0},{transform:'translate(0,-10px) scale(1.15)',opacity:1,offset:.78},{transform:'translate(0,0) scale(1)',opacity:1}],{duration:470,easing:'ease-out'});animate($('#keno-grid button[data-number="'+n+'"]'),[{transform:'scale(.9)'},{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:350});},450+i*440));
   }
   schedule(finish,duration);
  }
  function mines(before,after,index,animateMotion,done){
   if(active)return;active={done};if(!animateMotion){finish();return;}
   const old=before.mines?.open??[],run=after.mines,result=after.last.mines?.result,bombs=run?[]:result?.bombs??[],opened=run?.open??result?.open??[];
   const cells=$$('.mine-cell');cells.forEach(el=>el.disabled=true);
   function reveal(i,bomb){const cell=cells[i],inner=cell.querySelector('.mine-inner');cell.classList.add(bomb?'bomb':'safe');cell.querySelector('.mine-front').textContent=bomb?'🧦':'💎';cell.setAttribute('aria-label','Feld '+(i+1)+': '+(bomb?'Socke':'Diamant'));cell.classList.add('revealed');animate(inner,[{transform:'rotateY(0deg)'},{transform:'rotateY(180deg)'}],{duration:550,easing:'cubic-bezier(.2,.7,.25,1)',fill:'forwards'});}
   if(index!==null)reveal(index,bombs.includes(index));
   if(!run){const rest=cells.map((_,i)=>i).filter(i=>!old.includes(i)&&i!==index);rest.forEach((i,n)=>schedule(()=>reveal(i,bombs.includes(i)),600+n*100));if(result?.hit!==null)animate($('.mine-grid'),[{transform:'translateX(0)'},{transform:'translateX(-7px)'},{transform:'translateX(7px)'},{transform:'translateX(0)'}],{duration:400,delay:350});schedule(finish,1200+rest.length*100);}else schedule(finish,700);
  }
  return {show,start,mines,finish};
 }
 window.ArcadeScenes={create,ORDER,dicePose};
})();
