'use strict';
(() => {
 const W=540,H=610,R=9,P=6,LEFT=27,RIGHT=513,FLOOR=551,DT=1/240;
 const pegs=[];
 for(let row=0;row<8;row++)for(let col=0;col<=row;col++)pegs.push({x:270+(col-row/2)*54,y:128+row*46,row});
 function random(seed){let v=seed>>>0;return ()=>{v+=0x6D2B79F5;let t=v;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
 // A fixed-step circle simulation. The landed compartment determines the payout.
 // No target compartment or scripted left/right path is supplied to the solver.
 function simulate(seed){
  const rng=random(seed);let x=270+(rng()-.5)*32,y=42,vx=(rng()-.5)*64,vy=0,angle=0,settled=0;
  const frames=[{t:0,x,y,angle}],hits=[];let bin;
  for(let step=1;step<=240*14;step++){
   const t=step*DT;vy+=1080*DT;vx*=Math.exp(-4*DT);vy*=Math.exp(-4*DT);x+=vx*DT;y+=vy*DT;angle+=vx/R*DT*.45;
   for(let i=0;i<pegs.length;i++){
    const p=pegs[i],dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy),contact=R+P;
    if(d>=contact)continue;
    const nx=d>1e-8?dx/d:1,ny=d>1e-8?dy/d:0;
    x=p.x+nx*(contact+.02);y=p.y+ny*(contact+.02);
    const approach=vx*nx+vy*ny;
    if(approach<0){const impulse=-(1+.66)*approach;vx+=impulse*nx;vy+=impulse*ny;
     const tangent=-vx*ny+vy*nx;vx+=tangent*ny*.035;vy-=tangent*nx*.035;
     hits.push({t,x:p.x,y:p.y,peg:i,energy:Math.min(1,-approach/350)});
    }
   }
   if(x<LEFT+R){x=LEFT+R;vx=Math.abs(vx)*.55;}
   if(x>RIGHT-R){x=RIGHT-R;vx=-Math.abs(vx)*.55;}
   // Rounded separator tips and vertical walls physically capture the ball.
   for(let n=1;n<9;n++){
    const wall=LEFT+n*54,dx=x-wall,dy=y-503;
    if(y<503){const d=Math.hypot(dx,dy);if(d<R+2){const nx=d>1e-8?dx/d:1,ny=d>1e-8?dy/d:0;x=wall+nx*(R+2.01);y=503+ny*(R+2.01);const a=vx*nx+vy*ny;if(a<0){vx-=1.5*a*nx;vy-=1.5*a*ny;}}}
    else if(Math.abs(dx)<R+2){const side=dx>=0?1:-1;x=wall+side*(R+2.01);if(vx*side<0)vx=-vx*.4;}
   }
   if(y>FLOOR-R){y=FLOOR-R;if(vy>0){vy=-vy*.28;vx*=.7;}if(Math.abs(vy)<20)vy=0;}
   if(!Number.isFinite(x+y+vx+vy))throw Error('Die Plinko-Physik konnte nicht berechnet werden.');
   frames.push({t,x,y,angle});
   if(y>=FLOOR-R-.15&&Math.abs(vy)<20){settled+=DT;if(settled>.2){bin=Math.max(0,Math.min(8,Math.floor((x-LEFT)/54)));break;}}else settled=0;
  }
  if(bin===undefined)throw Error('Der Ball ist noch nicht gelandet. Bitte erneut starten.');
  return {seed:seed>>>0,frames,hits,bin,duration:frames.at(-1).t};
 }
 function create(root,multipliers){
  const canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d'),status=root.querySelector('.plinko-status'),bins=root.querySelector('.plinko-bins');
  let run=null,frame=0,start=null,lastBin=null,display=null;const liveTrails=new Map(),liveHits=[];
  const colors=['#ff799c','#ffb68c','#eaca93','#a8e1cc','#adcbda','#a8e1cc','#eaca93','#ffb68c','#ff799c'];
  bins.replaceChildren();multipliers.forEach((m,i)=>{const el=document.createElement('span');el.textContent=m.toLocaleString('de-AT')+'×';el.style.setProperty('--bin-color',colors[i]);bins.append(el);});
  function circle(x,y,r,fill){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();}
  function draw(samples,time=0,flight=null){
   const ratio=Math.min(2,globalThis.devicePixelRatio||1);if(canvas.width!==W*ratio){canvas.width=W*ratio;canvas.height=H*ratio;}ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,W,H);
   const bg=ctx.createRadialGradient(270,230,20,270,280,400);bg.addColorStop(0,'#213c48');bg.addColorStop(1,'#111d2b');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
   ctx.strokeStyle='#a3c2c00c';ctx.lineWidth=1;for(let x=0;x<W;x+=27){ctx.beginPath();ctx.moveTo(x,75);ctx.lineTo(x,565);ctx.stroke();}for(let y=80;y<560;y+=27){ctx.beginPath();ctx.moveTo(12,y);ctx.lineTo(528,y);ctx.stroke();}
   ctx.strokeStyle='#8198a54d';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(LEFT,84);ctx.lineTo(LEFT,551);ctx.lineTo(RIGHT,551);ctx.lineTo(RIGHT,84);ctx.stroke();
   ctx.fillStyle='#dcff89';ctx.font='bold 10px Courier New';ctx.textAlign='center';ctx.fillText('DROP ZONE',270,20);
   ctx.strokeStyle='#dcff8955';ctx.lineWidth=2;ctx.strokeRect(242,29,56,29);ctx.fillStyle='#e7ffe412';ctx.fillRect(244,31,52,25);
   for(let i=0;i<9;i++){ctx.fillStyle=colors[i]+'19';ctx.fillRect(LEFT+i*54+3,503,48,48);ctx.fillStyle=colors[i];ctx.fillRect(LEFT+i*54+3,551,48,3);}
   ctx.strokeStyle='#b8d6d4';ctx.lineWidth=4;ctx.lineCap='round';for(let n=1;n<9;n++){ctx.beginPath();ctx.moveTo(LEFT+n*54,503);ctx.lineTo(LEFT+n*54,550);ctx.stroke();}
   pegs.forEach((p,i)=>{
    const hit=flight?.hits.findLast(h=>h.peg===i&&h.t<=time&&time-h.t<.4),glow=hit?1-(time-hit.t)/.4:0;
    if(glow){ctx.globalAlpha=glow*.65;ctx.strokeStyle='#dcff89';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,P+4+(1-glow)*19,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
    circle(p.x+1,p.y+3,P+1,'#06141c');const grad=ctx.createRadialGradient(p.x-2,p.y-3,0,p.x,p.y,P);grad.addColorStop(0,glow?'#f4ffb4':'#e7f7ed');grad.addColorStop(1,glow?'#aadd67':'#628c93');circle(p.x,p.y,P,grad);
   });
   if(flight){const recent=flight.frames.filter(s=>s.t<=time&&s.t>time-.15);for(let i=0;i<recent.length;i+=3){ctx.globalAlpha=(i/recent.length)*.17;circle(recent[i].x,recent[i].y,R*.7,'#dcff89');}ctx.globalAlpha=1;}
   for(const sample of (Array.isArray(samples)?samples:samples?[samples]:[])){
    ctx.shadowColor='#dcff8977';ctx.shadowBlur=17;const g=ctx.createRadialGradient(sample.x-3,sample.y-4,1,sample.x,sample.y,R);g.addColorStop(0,'#fffde6');g.addColorStop(.35,'#edffba');g.addColorStop(1,'#99c756');circle(sample.x,sample.y,R,g);ctx.shadowBlur=0;
    ctx.save();ctx.translate(sample.x,sample.y);ctx.rotate(sample.angle||0);ctx.strokeStyle='#6a923680';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,6,-1,1);ctx.stroke();ctx.restore();
   }
   ctx.fillStyle='#89ada6';ctx.font='9px Courier New';ctx.textAlign='left';ctx.fillText('08 ROWS / 36 PINS',27,603);ctx.textAlign='right';ctx.fillText('GRAVITY ON',513,603);
  }
  function show(bin){if(run)return;if(bin!==lastBin)display=bin===undefined?{x:270,y:42,angle:0}:{x:LEFT+(bin+.5)*54,y:FLOOR-R,angle:0};lastBin=bin;[...bins.children].forEach((el,i)=>el.classList.toggle('landed',i===bin));canvas.setAttribute('aria-label',bin===undefined?'Plinko: Ball bereit über acht Pinreihen.':'Plinko: Ball in Fach '+(bin+1)+', '+multipliers[bin]+'-fache Auszahlung.');status.textContent=bin===undefined?'Ball bereit. Lass ihn fallen.':'Gelandet · '+multipliers[bin].toLocaleString('de-AT')+'×';draw(display);}
  function finish(){if(!run)return;const current=run;run=null;cancelAnimationFrame(frame);display=current.flight.frames.at(-1);lastBin=current.flight.bin;show(lastBin);current.done();}
  function drop(flight,animate,done){
   if(run)return;lastBin=undefined;[...bins.children].forEach(el=>el.classList.remove('landed'));status.textContent='Ball fällt …';
   run={flight,done};start=null;if(!animate){finish();return;}
   canvas.setAttribute('aria-label','Plinko: Ball fällt und prallt an den Pins ab.');
   function tick(now){if(!run)return;if(start===null)start=now;const elapsed=(now-start)/1000;
    if(elapsed>=flight.duration+.45){finish();return;}
    const t=Math.min(flight.duration,elapsed),idx=Math.min(flight.frames.length-1,Math.floor(t/DT)),a=flight.frames[idx],b=flight.frames[Math.min(idx+1,flight.frames.length-1)],p=Math.max(0,Math.min(1,(t-a.t)/DT));
    display={x:a.x+(b.x-a.x)*p,y:a.y+(b.y-a.y)*p,angle:a.angle+(b.angle-a.angle)*p};draw(display,t,flight);
    const contacts=flight.hits.filter(h=>h.t<=t).length;status.textContent=elapsed>=flight.duration?'Gelandet · '+multipliers[flight.bin].toLocaleString('de-AT')+'×':'Ball fällt · '+contacts+(contacts===1?' Pin-Kontakt':' Pin-Kontakte');
    if(elapsed>=flight.duration)bins.children[flight.bin].classList.add('landed');frame=requestAnimationFrame(tick);
   }frame=requestAnimationFrame(tick);
  }
  const resize=new ResizeObserver(()=>draw(display,0));resize.observe(canvas);show(undefined);return {show,drop,finish,land:(sample,bin)=>{display={...sample};lastBin=bin;show(bin);},drawMany:samples=>{
   const now=performance.now()/1000,ids=new Set(samples.map(b=>b.id));for(const id of liveTrails.keys())if(!ids.has(id))liveTrails.delete(id);
   for(const b of samples){let trail=liveTrails.get(b.id)||[];trail=trail.filter(p=>now-p.t<.12);trail.push({x:b.x,y:b.y,t:now});liveTrails.set(b.id,trail);for(let i=0;i<pegs.length;i++)if(Math.hypot(b.x-pegs[i].x,b.y-pegs[i].y)<18)liveHits.push({peg:i,t:now});}
   while(liveHits.length&&now-liveHits[0].t>.4)liveHits.shift();draw(samples,now,{hits:liveHits,frames:[...liveTrails.values()].flat()});
  }};
 }
 const api={simulate,create,pegs,W,H,R,DT};if(typeof module==='object'&&module.exports)module.exports=api;else window.PlinkoPhysics=api;
})();
