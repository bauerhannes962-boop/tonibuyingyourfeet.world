/* Shared fixed-step world: every visible ball takes part in the same simulation. */
(function(root){
 'use strict';
 const P=typeof module==='object'?require('./plinko-physics.js'):root.PlinkoPhysics,DT=1/240;
 function body(ball){let n=ball.seed>>>0;const random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};return {id:ball.id,...(ball.body||{x:270+(random()-.5)*32,y:42,vx:(random()-.5)*64,vy:0,angle:0,settled:0})};}
 function step(balls){
  const landed=[];
  function obstacle(b,x,y,r,bounce=.66){const dx=b.x-x,dy=b.y-y,d=Math.hypot(dx,dy),contact=9+r;if(d>=contact)return;const nx=d>1e-8?dx/d:1,ny=d>1e-8?dy/d:0;b.x=x+nx*(contact+.01);b.y=y+ny*(contact+.01);const v=b.vx*nx+b.vy*ny;if(v<0){b.vx-=(1+bounce)*v*nx;b.vy-=(1+bounce)*v*ny;}}
  for(const b of balls){b.vy+=1080*DT;b.vx*=Math.exp(-4*DT);b.vy*=Math.exp(-4*DT);b.x+=b.vx*DT;b.y+=b.vy*DT;b.angle+=b.vx/9*DT*.45;}
  // Spatial buckets keep repeated drops practical even when many balls coexist.
  for(let pass=0;pass<3;pass++){
   const cells=new Map();
   for(const b of balls){const cx=Math.floor(b.x/18),cy=Math.floor(b.y/18);for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(const a of cells.get((cx+dx)+','+(cy+dy))||[]){
    const x=b.x-a.x,y=b.y-a.y,d=Math.hypot(x,y);if(d>=18)continue;const nx=d>1e-8?x/d:1,ny=d>1e-8?y/d:0,over=(18-d+.01)/2;
    a.x-=nx*over;a.y-=ny*over;b.x+=nx*over;b.y+=ny*over;const approach=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
    if(approach<0){const impulse=-(1+.72)*approach/2;a.vx-=impulse*nx;a.vy-=impulse*ny;b.vx+=impulse*nx;b.vy+=impulse*ny;}
   }const key=cx+','+cy;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(b);}
   for(const b of balls){for(const peg of P.pegs)obstacle(b,peg.x,peg.y,6);
    if(b.x<36){b.x=36;b.vx=Math.abs(b.vx)*.55;}if(b.x>504){b.x=504;b.vx=-Math.abs(b.vx)*.55;}
    for(let n=1;n<9;n++){const wall=27+n*54;if(b.y<503)obstacle(b,wall,503,2,.5);else if(Math.abs(b.x-wall)<11){const side=b.x>=wall?1:-1;b.x=wall+side*11.01;if(b.vx*side<0)b.vx=-b.vx*.4;}}
    if(b.y>542){b.y=542;if(b.vy>0){b.vy=-b.vy*.28;b.vx*=.7;}if(Math.abs(b.vy)<20)b.vy=0;}
   }
  }
  for(const b of balls){if(b.y>=541.85&&Math.abs(b.vy)<20)b.settled+=DT;else b.settled=0;if(b.settled>.12)landed.push({id:b.id,bin:Math.max(0,Math.min(8,Math.floor((b.x-27)/54)))});}
  return landed;
 }
 function create(root,multipliers,onLand,onSnapshot){
  const painter=P.create(root,multipliers),status=root.querySelector('.plinko-status');let balls=[],raf=0,last=0,acc=0,saved=0;
  function snapshot(){return balls.map(b=>({...b}));}
  function tick(now){raf=0;if(!balls.length)return;acc+=last?Math.min(.05,(now-last)/1000):0;last=now;
   while(acc>=DT){acc-=DT;const landed=step(balls);if(landed.length){const positions=new Map(balls.map(b=>[b.id,{...b}])),ids=new Set(landed.map(b=>b.id));balls=balls.filter(b=>!ids.has(b.id));onLand(landed,snapshot());for(const b of landed)painter.land(positions.get(b.id),b.bin);}}
   if(balls.length)painter.drawMany(balls);status.textContent=balls.length?balls.length+' Bälle unterwegs · Klicke für den nächsten Ball.':'Alle Bälle gelandet. Bereit für den nächsten Drop.';
   if(now-saved>250){saved=now;onSnapshot(snapshot());}if(balls.length)raf=requestAnimationFrame(tick);else{last=0;onSnapshot([]);}
  }
  function sync(entries){const old=new Map(balls.map(b=>[b.id,b]));balls=entries.map(b=>old.get(b.id)||body(b));if(balls.length&&!raf)raf=requestAnimationFrame(tick);if(!balls.length){cancelAnimationFrame(raf);raf=0;last=0;}}
  return {sync,snapshot,show:bin=>{if(!balls.length)painter.show(bin);},finish:()=>{}};
 }
 const api={body,step,create,DT};if(typeof module==='object'&&module.exports)module.exports=api;else root.LivePlinko=api;
})(typeof window==='object'?window:globalThis);
