'use strict';
(() => {
 const WINDOW=18,BEHIND=4;
 const clamp=n=>Math.max(0,Math.min(1,n));
 const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
 const mix=(a,b,t)=>a+(b-a)*t;
 function create(root,engine){
  const track=root.querySelector('.road-track'),viewport=root.querySelector('.road-viewport');
  const world=root.querySelector('.road-world'),runner=root.querySelector('.road-foot'),impact=root.querySelector('.road-impact');
  let tiles=[],base=0,pending=null,frame=0,lastStep=0;
  const number=n=>new Intl.NumberFormat('de-AT',{maximumFractionDigits:2,notation:n>=10000?'compact':'standard'}).format(n);
  function makeTile(index){
   const el=document.createElement('div'),numberEl=document.createElement('small'),badge=document.createElement('b');
   badge.className='road-mult';
   const car=document.createElement('i'),barrier=document.createElement('span');
   car.className='road-car';barrier.className='road-barrier';const trail=document.createElement('span'),lights=document.createElement('span');trail.className='road-speed-trail';lights.className='road-headlight-beams';car.append(trail,lights);
   const lane={el,numberEl,badge,car,barrier,index};el.append(numberEl,badge,car,barrier);updateTile(lane,index);return lane;
  }
  function updateTile(tile,index){
   tile.index=index;tile.up=false;tile.truck=index%5===0&&index>0;
   tile.numberEl.textContent=index===0?'START':'SPUR '+number(index);
   tile.badge.textContent=index===0?'LOS GEHT’S':number(engine.roadMultiplier(index))+'×';
   tile.el.style.setProperty('--car-color',['#e4bdff','#d5ef88','#9edee8','#e9bb91','#bac3ed'][index%5]);
   tile.el.style.setProperty('--traffic-time',(3.3-engine.roadRisk(Math.max(1,index))*1.9+(index%3)*.28)+'s');
   tile.el.style.setProperty('--traffic-delay',(-index*.731%5)+'s');
   tile.car.style.animation='';tile.car.style.transform='';tile.car.style.opacity='';tile.car.style.setProperty('--speed-trail','.08');
  }
  function size(){return track.getBoundingClientRect().width/WINDOW||90;}
  function targetCamera(step){return Math.max(0,Math.min(WINDOW*size()-viewport.clientWidth,(step-base+.5)*size()-viewport.clientWidth*.42));}
  function windowAt(step){
   const wanted=Math.max(0,step-BEHIND),delta=wanted-base,width=size();
   if(!tiles.length||delta<0||delta>=WINDOW){
    base=wanted;tiles=Array.from({length:WINDOW},(_,i)=>makeTile(base+i));track.replaceChildren(...tiles.map(t=>t.el));
   }else if(delta>0){
    for(let i=0;i<delta;i++){const tile=tiles.shift();updateTile(tile,base+WINDOW+i);tiles.push(tile);track.append(tile.el);}
    base=wanted;viewport.scrollLeft=Math.max(0,(viewport.scrollLeft||0)-delta*width);
   }
  }
  function place(step){runner.style.left=`calc(var(--lane-width) * ${step-base+.5})`;}
  function pose(lift=0,tilt=26,squash=1){runner.style.setProperty('--foot-lift',lift+'px');runner.style.setProperty('--foot-tilt',tilt+'deg');runner.style.setProperty('--foot-squash',squash);}
  function show(step,status='ready',focus=false){
   if(pending)return;
   lastStep=step;windowAt(step);place(step);pose();
   root.classList.remove('road-moving','road-impact-now');world.style.transform='';runner.classList.remove('walking');runner.classList.toggle('hit',status==='crash');
   tiles.forEach(t=>{
    if(t.index>step&&t.el.classList.contains('cleared')){t.car.style.animation='';t.car.style.transform='';}
    t.el.className=(t.index===0?'road-bank road-start':'road-lane')+(t.truck?' truck':'')+(t.index>0&&t.index<=step?' cleared':'')+(t.index===step?' current':'')+(status==='crash'&&t.index===step?' wreck':'');
    t.el.classList.toggle('next',t.index===step+1&&status!=='crash'&&status!=='cashout');
   });
   impact.hidden=status!=='crash';root.classList.toggle('road-won',status==='cashout');
   viewport.setAttribute('aria-label',status==='crash'?`Fuß auf Spur ${step} vom Auto erwischt.`:`Fuß ${step===0?'am Start':'auf Spur '+step}. Die Straße geht endlos weiter.`);
   if(focus)viewport.scrollLeft=targetCamera(step);
  }
  function finish(){
   if(!pending)return;
   const done=pending;pending=null;cancelAnimationFrame(frame);tiles.forEach(t=>t.el.classList.remove('crossing'));root.classList.remove('road-moving','road-impact-now');world.style.transform='';runner.classList.remove('walking');done();
  }
  function move(step,crash,animate,done){
   if(pending)return;
   if(!animate){done();viewport.scrollLeft=targetCamera(lastStep);return;}
   const tile=tiles.find(t=>t.index===step);
   if(!tile){show(step-1,'active',true);return move(step,crash,animate,done);}
   // Continue the visible vehicle from its exact current CSS-animation position.
   const computed=getComputedStyle(tile.car),matrix=new DOMMatrixReadOnly(computed.transform);
   const carStart=matrix.m42,carEnd=435,carHeight=tile.truck?100:76;
   const speed=570/(parseFloat(computed.animationDuration)*1000||3000);
   const acceleration=.0024,carContact=176-carHeight/2;
   const travelTime=distance=>(Math.sqrt(speed*speed+2*acceleration*Math.max(0,distance))-speed)/acceleration;
   // If this car has already passed the collision point, let it leave completely
   // before the following car enters from outside the viewport at normal speed.
   const following=crash&&carStart>carContact-speed*550;
   const nextEntry=following?(carEnd-carStart)/speed:0;
   const contact=crash?(following?nextEntry+(carContact+135)/speed:(carContact-carStart)/speed):0;
   const walkStart=crash?Math.max(0,contact-600):travelTime(210-carStart)+80;
   const walkDuration=crash?contact-walkStart:600;
   const duration=crash?contact+(carEnd-carContact)/speed+100:walkStart+walkDuration+160;
   tile.car.style.animation='none';tile.car.style.transform=`translate3d(0,${carStart}px,0)`;
   pending=done;impact.hidden=true;runner.classList.remove('hit');root.classList.add('road-moving');
   tile.el.classList.add('crossing');
   const cameraStart=viewport.scrollLeft||0,cameraEnd=targetCamera(step),startX=step-1-base+.5,endX=step-base+.5;
   let start,hit=false;
   function tick(now){
    if(!pending)return;
    if(start===undefined)start=now;
    const t=Math.min(duration,now-start),progress=clamp((t-walkStart)/walkDuration),walk=ease(progress);
    runner.classList.toggle('walking',progress>0&&progress<1&&!hit);
    runner.style.left=`calc(var(--lane-width) * ${mix(startX,endX,walk)})`;
    viewport.scrollLeft=mix(cameraStart,cameraEnd,ease((t-walkStart)/Math.max(600,walkDuration)));
    if(!hit){const gait=Math.sin(progress*Math.PI*2);pose(-Math.abs(gait)*13,26+gait*9,1-Math.abs(gait)*.035);}
    let carY;
    if(crash)carY=following&&t>=nextEntry?-135+speed*(t-nextEntry):carStart+speed*t;
    else carY=carStart+speed*t+.5*acceleration*t*t;
    tile.car.style.transform=`translate3d(0,${Math.min(carEnd,carY)}px,0)`;tile.car.style.setProperty('--speed-trail',crash?'.08':Math.min(1,(speed+acceleration*t)*.5));
    if(crash&&t>=contact){
     if(!hit){hit=true;runner.classList.remove('walking');runner.classList.add('hit');root.classList.add('road-impact-now');impact.hidden=false;}
     const decay=Math.max(0,1-(t-contact)/230);world.style.transform=`translate3d(${Math.sin(t*.13)*4*decay}px,${Math.cos(t*.15)*2*decay}px,0)`;
    }
    if(t>=duration)finish();else frame=requestAnimationFrame(tick);
   }
   frame=requestAnimationFrame(tick);
  }
  show(0);
  window.addEventListener('resize',()=>{if(!pending)viewport.scrollLeft=targetCamera(lastStep);});
  return {show,move,finish,focus:step=>{if(!pending){windowAt(step);place(step);viewport.scrollLeft=targetCamera(step);}}};
 }
 window.FootRoad={create};
})();
