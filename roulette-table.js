(function(){
 'use strict';
 function create(root,E,changed,spin){
  const $=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)],rules=E.ROULETTE_BETS,key='footverse-roulette-table-v1';let placements=[],previous=[],mode='number',locked=false,balance=0,chip=25,resultKey='',winning=null;
  const buttons=new Map(),format=n=>new Intl.NumberFormat('de-AT').format(n),total=()=>placements.reduce((n,b)=>n+b.amount,0);
  function ticket(){const sums=new Map();for(const b of placements)sums.set(b.id,(sums.get(b.id)||0)+b.amount);return [...sums].map(([id,amount])=>({id,amount}));}
  function valid(list){return Array.isArray(list)&&list.length<=10000&&list.every(b=>b&&rules.some(r=>r.id===b.id)&&Number.isSafeInteger(b.amount)&&b.amount>0&&b.amount<=E.CAP)&&list.reduce((n,b)=>n+b.amount,0)<=E.CAP;}
  try{const saved=JSON.parse(localStorage.getItem(key));if(valid(saved?.placements))placements=saved.placements;if(valid(saved?.previous))previous=saved.previous;}catch{}
  function save(){try{localStorage.setItem(key,JSON.stringify({placements,previous}));}catch{}}
  function hint(rule){$('#rt-hint').textContent=rule?rule.label+' · '+rule.numbers.length+' '+(rule.numbers.length===1?'Zahl':'Zahlen')+' · '+rule.mult+'× inklusive Einsatz · Klick setzt '+format(chip)+' Coins.':'Wähle den Chipwert und lege deine Chips auf die Felder.';all('[data-rt-number]').forEach(el=>el.classList.toggle('covered',Boolean(rule?.numbers.includes(+el.dataset.rtNumber))));}
  function place(rule){if(locked)return;if(!Number.isSafeInteger(chip)||chip<1){$('#rt-hint').textContent='Gib rechts einen ganzen Chipwert ab 1 Coin ein.';return;}if(total()+chip>balance){$('#rt-hint').textContent='Dafür reichen deine freien Coins nicht. Chipwert reduzieren oder einen Einsatz entfernen.';return;}placements.push({id:rule.id,amount:chip});winning=null;save();paint();const token=buttons.get(rule.id).querySelector('.rt-chip');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)token.animate([{transform:'translate(-50%,-100%) scale(.4)',opacity:0},{transform:'translate(-50%,-45%) scale(1.15)',opacity:1},{transform:'translate(-50%,-50%) scale(1)',opacity:1}],{duration:330,easing:'ease-out'});changed();}
  function make(rule,parent,text){const b=document.createElement('button');b.type='button';b.dataset.rtBet=rule.id;b.className='rt-bet';const label=document.createElement('span'),token=document.createElement('i');label.textContent=text??rule.label;token.className='rt-chip';token.hidden=true;b.append(label,token);b.title=rule.label+' · '+rule.mult+'× inkl. Einsatz';b.addEventListener('click',()=>place(rule));b.addEventListener('mouseenter',()=>hint(rule));b.addEventListener('focus',()=>hint(rule));b.addEventListener('mouseleave',()=>hint(null));parent.append(b);buttons.set(rule.id,b);return b;}
  const by=id=>rules.find(r=>r.id===id);
  const zero=make(by('n0'),$('.rt-zero'));zero.dataset.rtNumber=0;zero.classList.add('green');
  for(let r=0;r<3;r++)for(let c=0;c<12;c++){const n=c*3+3-r,b=make(by('n'+n),$('.rt-number-grid'));b.dataset.rtNumber=n;b.classList.add(E.RED.includes(n)?'red':'black');}
  for(let r=2;r>=0;r--)make(by('column'+r),$('.rt-columns'),'2:1');
  for(let i=0;i<3;i++)make(by('dozen'+i),$('.rt-dozens'),(i+1)+'. Dutzend');
  for(const id of ['low','even','red','black','odd','high']){const b=make(by(id),$('.rt-outside'));if(['red','black'].includes(id))b.classList.add(id);}
  for(const rule of rules.filter(r=>r.x!==undefined)){const b=make(rule,$('.rt-spots'),'✦');b.classList.add('rt-spot');b.dataset.kind=rule.kind;b.style.left=rule.x*100+'%';b.style.top=rule.y*100+'%';}
  for(const rule of rules.filter(r=>r.kind==='zero'))make(rule,$('.rt-zero-bets'));
  all('[data-rt-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.rtMode;paint();$('#rt-hint').textContent=({number:'Klicke auf eine Zahl. Ein Treffer zahlt 36× inklusive Einsatz.',split:'Setze auf eine Markierung zwischen zwei benachbarten Zahlen. Auszahlung: 18×.',corner:'Setze auf einen Schnittpunkt von vier Zahlen. Auszahlung: 9×.',street:'Setze auf die untere Kante einer Dreierreihe. Auszahlung: 12×.',six:'Setze unten zwischen zwei Dreierreihen. Auszahlung: 6×.',zero:'Wähle eine Kombination mit der grünen Null.'})[mode];}));
  $('#rt-undo').addEventListener('click',()=>{if(locked)return;placements.pop();winning=null;save();paint();changed();});
  $('#rt-clear').addEventListener('click',()=>{if(locked)return;placements=[];winning=null;save();paint();changed();});
  $('#rt-repeat').addEventListener('click',()=>{if(locked)return;if(previous.reduce((n,b)=>n+b.amount,0)>balance){$('#rt-hint').textContent='Für die letzten Einsätze reicht dein aktuelles Guthaben nicht.';return;}placements=previous.map(b=>({...b}));winning=null;save();paint();changed();});
  const spinButton=document.createElement('button');spinButton.type='button';spinButton.id='rt-spin';spinButton.className='play-button';spinButton.textContent='Kugel starten';$('.rt-footer').append(spinButton);spinButton.addEventListener('click',spin);
  function paint(){
   const sums=new Map(ticket().map(b=>[b.id,b.amount]));for(const rule of rules){const b=buttons.get(rule.id),amount=sums.get(rule.id)||0,token=b.querySelector('.rt-chip');token.hidden=!amount;token.textContent=amount>=10000?new Intl.NumberFormat('de-AT',{notation:'compact',maximumFractionDigits:1}).format(amount):format(amount);b.disabled=locked;b.classList.toggle('has-chip',Boolean(amount));b.classList.toggle('winning-number',rule.kind==='number'&&rule.numbers[0]===winning);b.classList.toggle('winning-bet',winning!==null&&amount>0&&rule.numbers.includes(winning));b.setAttribute('aria-label',rule.label+', '+rule.mult+'-fache Auszahlung, '+amount+' Coins gesetzt');if(rule.x!==undefined)b.hidden=rule.kind!==mode&&!amount;}
   all('[data-rt-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.rtMode===mode)));$('.rt-zero-bets').hidden=mode!=='zero'&&!ticket().some(b=>by(b.id).kind==='zero');
   $('#rt-total').textContent=format(total())+' Feet Coins auf dem Tisch';$('#rt-undo').disabled=locked||!placements.length;$('#rt-clear').disabled=locked||!placements.length;$('#rt-repeat').disabled=locked||!previous.length;
   spinButton.disabled=locked||!total()||total()>balance;spinButton.textContent=locked?'Kugel läuft …':'Kugel starten · '+format(total())+' Coins';
   const list=$('#rt-ticket');list.replaceChildren();for(const b of ticket()){const item=document.createElement('button');item.type='button';item.className='rt-ticket-chip';item.textContent=by(b.id).label+' · '+format(b.amount)+' ×';item.setAttribute('aria-label','Einsatz '+by(b.id).label+' entfernen');item.disabled=locked;item.addEventListener('click',()=>{if(locked)return;placements=placements.filter(x=>x.id!==b.id);winning=null;save();paint();changed();});list.append(item);}
  }
  function render(state,busy,active,bet){balance=state.balance;chip=bet;locked=busy||Boolean(active);const r=state.last.roulette,k=JSON.stringify(r);if(busy){winning=null;resultKey='';}else if(k!==resultKey){resultKey=k;winning=r?.result??null;}$('#rt-outcome').textContent=busy?'Die Kugel rollt …':r?'Letzte Runde: '+r.result+' · '+format(r.payout)+' Coins zurück · Einsatz '+format(r.bet):'Dein Tisch ist bereit.';paint();}
  function commit(){previous=ticket();save();}
  return {ticket,total,render,commit};
 }
 window.RouletteTable={create};
})();
