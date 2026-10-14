'use strict';
(() => {
 const mod=n=>(n%5+5)%5;
 // Constant speed first; then a continuous, progressively slower brake.
 function progress(p){
  p=Math.max(0,Math.min(1,p));
  const cruise=.35,brake=1-cruise,total=cruise+brake/3;
  return p<cruise?p/total:(cruise+brake/3*(1-Math.pow(1-(p-cruise)/brake,3)))/total;
 }
 function plan(from,to,reel){
  return {distance:(6+reel*2)*5+mod(to-from),duration:2200+reel*700};
 }
 function create(elements,icons){
  let symbols=[0,1,3],active=null,frame=0,stops=[],signature='';
  function stripFor(el,from,length){
   const strip=document.createElement('div');strip.className='reel-strip';strip.setAttribute('aria-hidden','true');
   for(let n=0;n<length;n++){const cell=document.createElement('span');cell.className='reel-symbol';cell.textContent=icons[mod(from+n-1)];strip.append(cell);}
   el.replaceChildren(strip);return strip;
  }
  function position(strip,n){strip.style.transform=`translateY(calc(var(--reel-height) * ${-n}))`;}
  function settle(el,symbol,i){
   position(stripFor(el,symbol,3),1);el.classList.remove('spinning');
   el.setAttribute('aria-label',`Walze ${i+1}: ${icons[symbol]}`);
  }
  function show(next){if(active||signature===next.join(','))return;signature=next.join(',');symbols=[...next];elements.forEach((el,i)=>settle(el,symbols[i],i));}
  function finish(){
   if(!active)return;
   const round=active;active=null;cancelAnimationFrame(frame);show(round.outcome);stops.forEach(a=>a.cancel());stops=[];round.done();
  }
  function spin(outcome,animate,done){
   if(active)return;signature='';
   if(!animate){show(outcome);done();return;}
   const reels=elements.map((el,i)=>{
    const p=plan(symbols[i],outcome[i],i),strip=stripFor(el,symbols[i],p.distance+4);
    position(strip,1);el.classList.add('spinning');el.setAttribute('aria-label',`Walze ${i+1} dreht`);
    return {...p,strip,stopped:false};
   });
   active={outcome:[...outcome],done};let start;
   function tick(now){
    if(!active)return;
    if(start===undefined)start=now;
    const elapsed=now-start;
    reels.forEach((r,i)=>{
     if(r.stopped)return;
     if(elapsed>=r.duration){r.stopped=true;settle(elements[i],outcome[i],i);stops.push(elements[i].animate([{transform:'translateY(0)'},{transform:'translateY(5px)',offset:.35},{transform:'translateY(-2px)',offset:.7},{transform:'translateY(0)'}],{duration:240,easing:'ease-out'}));}
     else position(r.strip,1+r.distance*progress(elapsed/r.duration));
    });
    if(reels.every(r=>r.stopped)&&elapsed>=reels[2].duration+260)finish();else frame=requestAnimationFrame(tick);
   }
   frame=requestAnimationFrame(tick);
  }
  return {show,spin,finish};
 }
 const api={progress,plan,create};
 if(typeof module==='object'&&module.exports)module.exports=api;
 else window.SockpotReels=api;
})();
