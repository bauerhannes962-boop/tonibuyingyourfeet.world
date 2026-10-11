'use strict';
(() => {
 function create(root,engine){
  const $=s=>root.querySelector(s),hands={player:$('#player-hand'),dealer:$('#dealer-hand')};
  const scores={player:$('#player-score'),dealer:$('#dealer-score')};
  const shoe=$('.bj-shoe'),hint=$('#bj-hint'),result=$('.bj-result'),chips=$('.bj-chips');
  let pending=null,timers=[],animations=[],display={player:[],dealer:[],hidden:false},signature='';
  const suits=['♠','♥','♣','♦'],ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const messages={win:'GEWONNEN',lose:'TONI GEWINNT',push:'GLEICHSTAND',blackjack:'BLACKJACK!'};
  function card(value,hidden=false){
   const el=document.createElement('div'),inner=document.createElement('div'),front=document.createElement('div'),back=document.createElement('div');
   el.className='bj-card';el.setAttribute('role','img');inner.setAttribute('aria-hidden','true');inner.className='bj-card-inner';front.className='bj-card-front';back.className='bj-card-back';
   const rank=ranks[value%13],suit=suits[Math.floor(value/13)];
   if(suit==='♥'||suit==='♦')front.classList.add('red-card');
   const corner=document.createElement('span'),center=document.createElement('b'),bottom=document.createElement('span');
   corner.textContent=rank+'\n'+suit;bottom.textContent=rank+'\n'+suit;
   const number=value%13+1;
   if(number>=2&&number<=10){
    center.className='bj-pips';center.dataset.rank=number;
    const rows=number<=5?2:number<=8?3:number===9?4:5;
    const positions=number<=3?Array.from({length:number},(_,i)=>[50,i*100/(number-1)]):Array.from({length:rows*2},(_,i)=>[i%2?72:28,Math.floor(i/2)*100/(rows-1)]);
    if([5,7,9].includes(number))positions.push([50,number===7?25:50]);if(number===8)positions.push([50,25],[50,75]);
    positions.forEach(([x,y])=>{const pip=document.createElement('i');pip.textContent=suit;pip.style.left=x+'%';pip.style.top=y+'%';if(y>50)pip.className='lower';center.append(pip);});
   }else if(number>10){center.className='bj-court';const crown=document.createElement('small'),mark=document.createElement('i');crown.textContent='♛';mark.textContent=suit;center.append(crown,document.createTextNode(rank),mark);}else center.textContent=suit;
   front.append(corner,center,bottom);
   back.textContent='✳';inner.append(front,back);el.append(inner);el.classList.toggle('face-down',hidden);
   el.setAttribute('aria-label',hidden?'Verdeckte Dealer-Karte':rank+' '+suit);return el;
  }
  function play(el,frames,options){const a=el.animate(frames,options);animations.push(a);return a;}
  function schedule(fn,time){timers.push(setTimeout(()=>{if(pending)fn();},time));}
  function updateShoe(){const label=shoe.querySelector('small');if(label)label.textContent=Math.max(0,52-display.player.length-display.dealer.length)+' CARDS';}
  function updateScore(side,animate=false){
   const cards=display[side],value=cards.length?engine.handValue(side==='dealer'&&display.hidden?cards.slice(0,1):cards):null;
   scores[side].textContent=value===null?'–':value+(side==='dealer'&&display.hidden?' + ?':'');
   scores[side].classList.toggle('busted',value>21);scores[side].classList.toggle('twenty-one',value===21);
   if(animate)play(scores[side],[{transform:'scale(.8)',opacity:.4},{transform:'scale(1.2)',opacity:1},{transform:'scale(1)',opacity:1}],{duration:330});
  }
  function add(side,value,hidden=false,animate=false){
   const el=card(value,hidden);display[side].push(value);if(side==='dealer')display.hidden=hidden;
   hands[side].append(el);updateShoe();updateScore(side,animate);
   if(!animate)return;
   const from=shoe.getBoundingClientRect(),to=el.getBoundingClientRect(),dx=from.left+from.width/2-to.left-to.width/2,dy=from.top+from.height/2-to.top-to.height/2;
   play(el,[{transform:`translate(${dx}px,${dy}px) rotate(-24deg) scale(.78)`,opacity:.4},{transform:`translate(${dx*.25}px,${dy*.25-22}px) rotate(7deg) scale(1.04)`,opacity:1,offset:.7},{transform:'translate(0,0) rotate(0deg) scale(1)',opacity:1}],{duration:530,easing:'cubic-bezier(.2,.75,.25,1)'});
   play(shoe,[{transform:'rotate(-12deg)'},{transform:'rotate(-10deg) translateY(-3px)'},{transform:'rotate(-12deg)'}],{duration:260});
  }
  function reveal(animate){
   const el=hands.dealer.children[1];display.hidden=false;
   if(el){el.classList.remove('face-down');const inner=el.querySelector('.bj-card-inner');if(animate)play(inner,[{transform:'rotateY(180deg)'},{transform:'rotateY(0deg)'}],{duration:630,easing:'cubic-bezier(.25,.65,.25,1)'});el.setAttribute('aria-label',ranks[display.dealer[1]%13]+' '+suits[Math.floor(display.dealer[1]/13)]);}
   updateScore('dealer',animate);
  }
  function clear(){hands.player.replaceChildren();hands.dealer.replaceChildren();display={player:[],dealer:[],hidden:false};result.hidden=true;root.classList.remove('bj-winning','bj-losing','bj-dealing');updateScore('player');updateScore('dealer');updateShoe();}
  function setChips(stake){chips.style.visibility='visible';chips.replaceChildren();for(let i=0;i<3;i++){const chip=document.createElement('i');chip.className='bj-chip';chip.style.setProperty('--chip-i',i);chip.textContent=i===2?stake:'✳';chips.append(chip);}}
  function outcome(r,animate=false){
   result.hidden=false;result.dataset.status=r.result.status;result.querySelector('strong').textContent=messages[r.result.status];
   result.querySelector('span').textContent=r.payout?new Intl.NumberFormat('de-AT').format(r.payout)+' FEET COINS ZURÜCK':'EINSATZ VERLOREN';
   root.classList.toggle('bj-winning',r.result.status==='win'||r.result.status==='blackjack');root.classList.toggle('bj-losing',r.result.status==='lose');
   hint.textContent=r.result.status==='blackjack'?'Ass und Zehn. Besser wird’s nicht.':r.result.status==='push'?'Gleiche Punkte. Dein Einsatz kommt zurück.':r.result.status==='win'?'Diese Runde gehört dir.':'Toni nimmt diese Runde mit.';
   if(!animate)chips.style.visibility='hidden';
   if(animate){play(result,[{opacity:0,transform:'translate(-50%,15px) scale(.85)'},{opacity:1,transform:'translate(-50%,-4px) scale(1.03)'},{opacity:1,transform:'translate(-50%,0) scale(1)'}],{duration:530,easing:'ease-out'});[...chips.children].forEach((chip,i)=>play(chip,[{transform:'translate(-50%,0) scale(1)',opacity:1},{transform:`translate(${(i-1)*30}px,${r.payout?75:-110}px) scale(.7)`,opacity:0}],{duration:620,delay:i*70,easing:'ease-in',fill:'forwards'}));}
  }
  function show(state){
   if(pending)return;const run=state.blackjack,r=state.last.blackjack,key=JSON.stringify(run||r||null);if(signature===key)return;signature=key;
   clear();setChips(run?.bet||r?.bet||25);const source=run||r?.result;
   if(source){source.player.forEach(v=>add('player',v));source.dealer.forEach((v,i)=>add('dealer',v,Boolean(run&&i===1)));if(run)display.hidden=true;updateScore('dealer');}
   if(!run&&r)outcome(r);else hint.textContent=run?'Deine Entscheidung. Ziehen, Stehen oder Verdoppeln.':'Dein Platz ist frei. Setz dich an Tonis Tisch.';
  }
  function finish(){
   if(!pending)return;const done=pending;pending=null;timers.forEach(clearTimeout);timers=[];animations.forEach(a=>a.cancel());animations=[];root.classList.remove('bj-dealing');signature='';done();
  }
  function transition(before,after,animate,done){
   if(pending)return;if(!animate){signature='';show(after);done();return;}
   show(before);pending=done;signature='';result.hidden=true;root.classList.remove('bj-winning','bj-losing');root.classList.add('bj-dealing');
   const starting=!before.blackjack,run=after.blackjack,r=after.last.blackjack,target=run||r.result;let time=0;
   if(starting){
    clear();root.classList.add('bj-dealing');setChips(run?.bet||r.bet);hint.textContent='Die Karten werden ausgeteilt …';
    [['player',0],['dealer',0],['player',1],['dealer',1]].forEach(([side,index],i)=>schedule(()=>add(side,target[side][index],side==='dealer'&&index===1,true),i*260));
    [...chips.children].forEach((chip,i)=>play(chip,[{transform:'translateY(70px) rotate(30deg)',opacity:0},{transform:'translateY(0) rotate(0deg)',opacity:1}],{duration:500,delay:i*90,easing:'ease-out'}));time=1400;
   }else{
    if(!run&&r.bet>before.blackjack.bet){setChips(r.bet);[...chips.children].forEach((chip,i)=>play(chip,[{transform:'translateY(45px)',opacity:0},{transform:'translateY(0)',opacity:1}],{duration:450,delay:i*70}));}
    const oldLength=before.blackjack.player.length;
    for(let i=oldLength;i<target.player.length;i++){const index=i;schedule(()=>{hint.textContent='Eine Karte für dich …';add('player',target.player[index],false,true);},time);time+=650;}
   }
   if(!run){
    schedule(()=>{hint.textContent=engine.handValue(target.player)>21?'Über 21. Toni deckt auf.':'Toni deckt seine Hand auf …';reveal(true);},time);time+=750;
    for(let i=2;i<target.dealer.length;i++){const index=i;schedule(()=>{hint.textContent='Toni zieht nach …';add('dealer',target.dealer[index],false,true);},time);time+=730;}
    schedule(()=>outcome(r,true),time);time+=1100;
   }else schedule(()=>{hint.textContent='Deine Entscheidung. Ziehen, Stehen oder Verdoppeln.';},time);
   schedule(finish,time+100);
  }
  return {show,transition,finish};
 }
 window.BlackjackMotion={create};
})();
