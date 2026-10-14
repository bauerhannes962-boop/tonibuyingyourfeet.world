/* Gemeinsame, rein lokale Regeln für kostenlose Spielpunkte. */
(function(root){
 'use strict';
 const CAP=1000000000,BETS=[1,5,10,25,50,100],MINE_MULT=[0,1.25,1.6,2.2,3.1,4.8,8,20],WHEEL=[0,2,0,3,0,2,0,5];
 const UINT_MAX=4294967295,ROAD_MAX_MULT=1000000000;
 // Each next lane is riskier. A nonzero survival chance remains, with no final lane.
 const roadRisk=step=>.18+.77*(-Math.expm1(-Math.max(0,step-1)/12));
 const roadMultipliers=[1];
 function roadMultiplier(step){
  if(!Number.isSafeInteger(step)||step<0)return 1;
  // The point cap is reached well before this bound; very large lane numbers stay O(1).
  const n=Math.min(step,100);
  while(roadMultipliers.length<=n){const i=roadMultipliers.length;roadMultipliers.push(Math.min(ROAD_MAX_MULT,roadMultipliers[i-1]*(i===1?.96:1)/(1-roadRisk(i))));}
  return Math.floor(roadMultipliers[n]*100)/100;
 }
 function roadRandom(seed){let x=seed>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;}
 const roadStepNumber=n=>Number.isSafeInteger(n)&&n>=0&&n<Number.MAX_SAFE_INTEGER;
 const copy=x=>JSON.parse(JSON.stringify(x));
 const integer=(n,min=0,max=CAP)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
 const fresh=()=>({version:2,balance:100,rounds:0,wins:0,best:0,history:[],last:{},mines:null,road:null,blackjack:null,plinko:[],flight:null});
 function validResult(game,result){
  if(game==='blackjack')return result&&['win','lose','push','blackjack'].includes(result.status)&&Array.isArray(result.player)&&Array.isArray(result.dealer)&&[...result.player,...result.dealer].every(n=>integer(n,0,51));
  if(game==='roulette')return integer(result,0,36);
  if(game==='plinko')return integer(result,0,8);
  if(game==='flight')return result&&['crash','cashout'].includes(result.status)&&Number.isFinite(result.factor)&&result.factor>=1&&result.factor<=1000;
  if(game==='limbo')return typeof result==='number'&&Number.isFinite(result)&&result>=1&&result<=1000;
  if(game==='keno')return result&&Array.isArray(result.draw)&&result.draw.length===5&&new Set(result.draw).size===5&&result.draw.every(n=>integer(n,1,20))&&Array.isArray(result.pick)&&result.pick.length===3&&new Set(result.pick).size===3&&result.pick.every(n=>integer(n,1,20));
  if(game==='slots')return Array.isArray(result)&&result.length===3&&result.every(n=>integer(n,0,4));
  if(game==='wheel')return integer(result,0,7);
  if(game==='coin')return integer(result,0,1);
  if(game==='dice')return integer(result,1,6);
  if(game==='road')return result&&['crash','cashout','cancel'].includes(result.status)&&roadStepNumber(result.step)&&(result.status==='cancel'||result.step>0);
  if(game!=='mines'||!result||typeof result!=='object')return false;
  const {bombs,open,hit}=result;
  return Array.isArray(bombs)&&bombs.length===2&&new Set(bombs).size===2&&bombs.every(n=>integer(n,0,8))&&Array.isArray(open)&&open.length<=7&&new Set(open).size===open.length&&open.every(n=>integer(n,0,8)&&!bombs.includes(n))&&(hit===null||bombs.includes(hit));
 }
 function clean(raw){
  if(!raw||raw.version!==2||!integer(raw.balance))return fresh();
  const s=fresh();s.balance=raw.balance;
  for(const k of ['rounds','wins','best'])if(integer(raw[k]))s[k]=raw[k];
  const games=['blackjack','slots','wheel','coin','dice','mines','road','roulette','plinko','limbo','keno','flight'];
  const validBet=r=>integer(r.bet,1);
  if(Array.isArray(raw.history))s.history=raw.history.filter(r=>r&&games.includes(r.game)&&validBet(r)&&integer(r.payout)&&typeof r.detail==='string').slice(0,6).map(r=>({game:r.game,bet:r.bet,payout:r.payout,detail:r.detail.slice(0,100),...(validResult(r.game,r.result)?{result:copy(r.result)}:{})}));
  if(raw.last&&typeof raw.last==='object')for(const game of games){const r=raw.last[game];if(r&&integer(r.payout)&&validBet(r)&&typeof r.detail==='string'&&validResult(game,r.result))s.last[game]={game,bet:r.bet,payout:r.payout,detail:r.detail.slice(0,100),result:copy(r.result),...(game==='limbo'?{pick:[2,5,10].includes(r.pick)?r.pick:Number(r.detail.match(/Ziel (2|5|10)×/)?.[1])||2}:{})};}
  const m=raw.mines;
  if(m&&integer(m.bet,1)&&Array.isArray(m.bombs)&&m.bombs.length===2&&new Set(m.bombs).size===2&&m.bombs.every(n=>integer(n,0,8))&&Array.isArray(m.open)&&m.open.length<7&&new Set(m.open).size===m.open.length&&m.open.every(n=>integer(n,0,8)&&!m.bombs.includes(n)))s.mines={bet:m.bet,bombs:[...m.bombs],open:[...m.open]};
  const r=raw.road;
  if(!s.mines&&r&&integer(r.bet,1)&&roadStepNumber(r.step)){
   if(r.version===2&&integer(r.seed,1,UINT_MAX))s.road={version:2,bet:r.bet,step:r.step,seed:r.seed};
   // Deterministically migrate a running version-9 road without charging the stake again.
   else if(integer(r.step,0,11)&&integer(r.crashAt,r.step+1,13))s.road={version:2,bet:r.bet,step:r.step,seed:roadRandom((r.crashAt*2654435761+r.step)>>>0)||1};
  }
  const bj=raw.blackjack;
  if(!s.mines&&!s.road&&bj&&integer(bj.bet,1)&&Array.isArray(bj.player)&&bj.player.length>=2&&Array.isArray(bj.dealer)&&bj.dealer.length===2&&Array.isArray(bj.deck)){
   const cards=[...bj.player,...bj.dealer,...bj.deck];
   if(cards.length===52&&new Set(cards).size===52&&cards.every(n=>integer(n,0,51))&&handValue(bj.player)<21&&handValue(bj.dealer)!==21)s.blackjack={bet:bj.bet,player:[...bj.player],dealer:[...bj.dealer],deck:[...bj.deck]};
  }
  if(!s.mines&&!s.road&&!s.blackjack){
   if(Array.isArray(raw.plinko)){const ids=new Set();s.plinko=raw.plinko.filter(b=>b&&typeof b.id==='string'&&b.id.length<80&&!ids.has(b.id)&&integer(b.bet,1)&&integer(b.seed,0,UINT_MAX)&&(ids.add(b.id),true)).map(b=>({id:b.id,bet:b.bet,seed:b.seed,...(b.body&&['x','y','vx','vy','angle','settled'].every(k=>Number.isFinite(b.body[k]))&&b.body.x>=0&&b.body.x<=540&&b.body.y>=-10000&&b.body.y<=551?{body:copy(b.body)}:{})}));}
   const f=raw.flight;if(!s.plinko.length&&f&&integer(f.bet,1)&&Number.isSafeInteger(f.started)&&f.started>0&&Number.isFinite(f.crash)&&f.crash>=1&&f.crash<=1000)s.flight={bet:f.bet,started:f.started,crash:f.crash};
  }
  return s;
 }
 function check(s,bet){if(s.mines||s.road||s.blackjack||s.flight||s.plinko?.length)throw Error('Erst die laufende Runde beenden.');if(!integer(bet,1))throw Error('Bitte einen gültigen Einsatz wählen.');if(s.balance<bet)throw Error('Zu wenig Feet Coins. Lade kostenlos Feet Coins nach.');}
 function record(s,game,bet,payout,detail,result,pick){
  payout=Math.min(CAP-s.balance,Math.floor(payout));s.balance=Math.min(CAP,s.balance+payout);s.rounds=Math.min(CAP,s.rounds+1);if(payout>bet)s.wins=Math.min(CAP,s.wins+1);s.best=Math.max(s.best,payout);
  const r={game,bet,payout,detail,result,...(game==='limbo'?{pick}:{})};s.last[game]=r;s.history.unshift({game,bet,payout,detail,result:copy(result)});s.history=s.history.slice(0,6);return s;
 }
 function instant(state,game,bet,pick,outcome){
  check(state,bet);const s=copy(state);let payout=0,detail='',result=outcome;
  if(game==='slots'){
   if(!Array.isArray(outcome)||outcome.length!==3||outcome.some(n=>!integer(n,0,4)))throw Error('Ungültiges Walzenergebnis.');
   const [a,b,c]=outcome;const mult=a===b&&b===c?[15,5,6,10,4][a]:(a===b||a===c||b===c?2:0);payout=bet*mult;detail=mult>2?'Drei gleiche · '+mult+'×':mult===2?'Ein Paar · 2×':'Drei verschiedene';
  }else if(game==='wheel'){
   if(!integer(outcome,0,7))throw Error('Ungültiges Radsegment.');payout=bet*WHEEL[outcome];detail='Rad landet auf '+WHEEL[outcome]+'×';
  }else if(game==='coin'){
   if(![0,1].includes(pick)||![0,1].includes(outcome))throw Error('Wähle Fuß oder Socke.');payout=pick===outcome?bet*2:0;detail=(outcome===0?'Fuß':'Socke')+' · '+(payout?'richtig getippt':'anders getippt');
  }else if(game==='dice'){
   if(![0,1].includes(pick)||!integer(outcome,1,6))throw Error('Wähle eine Würfelhälfte.');payout=(pick===0?outcome<=3:outcome>=4)?bet*2:0;detail='Gewürfelt: '+outcome+' · '+(payout?'richtig getippt':'andere Hälfte');
  }else if(game==='roulette'){
   if(!integer(outcome,0,36)||![0,1,2].includes(pick))throw Error('Ungültige Roulette-Auswahl.');
   const color=outcome===0?2:RED.includes(outcome)?0:1;payout=color===pick?bet*(pick===2?36:2):0;detail='Roulette · '+outcome+' '+['Rot','Schwarz','Grün'][color];
  }else if(game==='plinko'){
   if(!integer(outcome,0,8))throw Error('Ungültiges Plinko-Fach.');payout=Math.floor(bet*PLINKO[outcome]);detail='Plinko · Fach '+(outcome+1)+' · '+PLINKO[outcome].toLocaleString('de-AT')+'×';
  }else if(game==='limbo'){
   if(![2,5,10].includes(pick)||!integer(outcome,0,999999))throw Error('Ungültiges Limbo-Ergebnis.');
   result=Math.max(1,Math.min(1000,Math.floor(.96/(1-outcome/1000000)*100)/100));payout=result>=pick?bet*pick:0;detail='Limbo · '+result.toFixed(2)+'× / Ziel '+pick+'×';
  }else if(game==='keno'){
   if(!Array.isArray(pick)||pick.length!==3||new Set(pick).size!==3||pick.some(n=>!integer(n,1,20))||!Array.isArray(outcome)||outcome.length!==5||new Set(outcome).size!==5||outcome.some(n=>!integer(n,1,20)))throw Error('Wähle drei Keno-Zahlen.');
   const hits=pick.filter(n=>outcome.includes(n)).length;payout=bet*[0,1,4,40][hits];result={draw:[...outcome],pick:[...pick]};detail='Keno · '+hits+' von 3 Treffern';
  }else throw Error('Unbekanntes Spiel.');
  s.balance-=bet;return record(s,game,bet,payout,detail,result,game==='limbo'?pick:undefined);
 }
 function startMines(state,bet,bombs){check(state,bet);if(!Array.isArray(bombs)||bombs.length!==2||new Set(bombs).size!==2||bombs.some(n=>!integer(n,0,8)))throw Error('Ungültiges Spielfeld.');const s=copy(state);s.balance-=bet;s.mines={bet,bombs:[...bombs],open:[]};delete s.last.mines;return s;}
 function reveal(state,index){
  if(!state.mines||!integer(index,0,8))throw Error('Starte zuerst eine Minenrunde.');if(state.mines.open.includes(index))throw Error('Dieses Feld ist schon offen.');const s=copy(state),m=s.mines;
  if(m.bombs.includes(index)){s.mines=null;return record(s,'mines',m.bet,0,'Socke erwischt · Einsatz verloren',{bombs:m.bombs,open:m.open,hit:index});}
  m.open.push(index);if(m.open.length===7)return collect(s);return s;
 }
 function collect(state){if(!state.mines||!state.mines.open.length)throw Error('Öffne zuerst ein sicheres Feld.');const s=copy(state),m=s.mines;s.mines=null;return record(s,'mines',m.bet,Math.floor(m.bet*MINE_MULT[m.open.length]),m.open.length+(m.open.length===1?' sicheres Feld · ':' sichere Felder · ')+MINE_MULT[m.open.length].toLocaleString('de-AT')+'×',{bombs:m.bombs,open:m.open,hit:null});}
 function cancel(state){if(!state.mines)throw Error('Keine aktive Minenrunde.');const s=copy(state),m=s.mines;s.mines=null;return record(s,'mines',m.bet,0,'Runde abgebrochen',{bombs:m.bombs,open:m.open,hit:null});}
 function refill(state){if(state.balance!==0||state.mines||state.road||state.blackjack||state.flight||state.plinko?.length)throw Error('100 Coins gibt es erst bei leerem Konto und ohne laufende Runde.');const s=copy(state);s.balance=100;return s;}
 const roadValue=(r,available=CAP)=>Math.min(available,CAP,Math.floor(r.bet*roadMultiplier(r.step)+1e-7));
 function startRoad(state,bet,seed){
  check(state,bet);
  if(!integer(seed,1,UINT_MAX))throw Error('Ungültige Straßenrunde.');
  const s=copy(state);s.balance-=bet;s.road={version:2,bet,step:0,seed};delete s.last.road;return s;
 }
 function stepRoad(state){
  if(!state.road)throw Error('Starte zuerst eine Straßenrunde.');
  const s=copy(state),r=s.road;r.step++;r.seed=roadRandom(r.seed);
  if(r.seed/4294967296<roadRisk(r.step)){s.road=null;return record(s,'road',r.bet,0,'Auto auf Spur '+r.step+' · Fuß überfahren',{step:r.step,status:'crash'});}
  return s;
 }
 function collectRoad(state){
  if(!state.road||!state.road.step)throw Error('Überquere zuerst eine Spur.');
  const s=copy(state),r=s.road;s.road=null;
  return record(s,'road',r.bet,roadValue(r,CAP-s.balance),'Auf Spur '+r.step+' gesichert · '+roadMultiplier(r.step).toLocaleString('de-AT')+'×',{step:r.step,status:'cashout',factor:roadMultiplier(r.step)});
 }
 function cancelRoad(state){
  if(!state.road)throw Error('Keine aktive Straßenrunde.');
  const s=copy(state),r=s.road;s.road=null;return record(s,'road',r.bet,0,'Straßenrunde abgebrochen',{step:r.step,status:'cancel'});
 }
 const RED=[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36],PLINKO=[12,3,1.2,.5,.2,.5,1.2,3,12];
 function handValue(cards){let value=0,aces=0;for(const card of cards){const rank=card%13;value+=rank===0?11:Math.min(rank+1,10);if(rank===0)aces++;}while(value>21&&aces>0){value-=10;aces--;}return value;}
 function finishBlackjack(s,doubled=false,natural=false){
  const b=s.blackjack,stake=b.bet*(doubled?2:1),player=handValue(b.player);let dealer=handValue(b.dealer);
  if(!natural&&player<=21){while(dealer<17){b.dealer.push(b.deck.pop());dealer=handValue(b.dealer);}}
  const playerNatural=b.player.length===2&&player===21,dealerNatural=b.dealer.length===2&&dealer===21;
  const status=player>21?'lose':dealerNatural?(playerNatural?'push':'lose'):playerNatural?'blackjack':dealer>21||player>dealer?'win':player===dealer?'push':'lose';
  const payout=status==='push'?stake:status==='blackjack'?Math.floor(stake*2.5):status==='win'?stake*2:0;
  const result={player:[...b.player],dealer:[...b.dealer],status};s.blackjack=null;
  return record(s,'blackjack',stake,payout,'Blackjack · '+player+' : '+dealer+' · '+({win:'Gewonnen',lose:'Verloren',push:'Gleichstand',blackjack:'Blackjack!'}[status]),result);
 }
 function startBlackjack(state,bet,deck){
  check(state,bet);if(!Array.isArray(deck)||deck.length!==52||new Set(deck).size!==52||deck.some(n=>!integer(n,0,51)))throw Error('Ungültiges Kartendeck.');
  const s=copy(state),d=[...deck];s.balance-=bet;s.blackjack={bet,player:[d.pop()],dealer:[d.pop()],deck:d};s.blackjack.player.push(d.pop());s.blackjack.dealer.push(d.pop());delete s.last.blackjack;
  return handValue(s.blackjack.player)===21||handValue(s.blackjack.dealer)===21?finishBlackjack(s,false,true):s;
 }
 function blackjackAction(state,action){
  if(!state.blackjack||!['hit','stand','double'].includes(action))throw Error('Keine aktive Blackjack-Runde.');
  const s=copy(state),b=s.blackjack;
  if(action==='double'){if(b.player.length!==2||s.balance<b.bet)throw Error('Verdoppeln braucht zwei Karten und genug Coins.');s.balance-=b.bet;b.player.push(b.deck.pop());return finishBlackjack(s,true);}
  if(action==='stand')return finishBlackjack(s);
  b.player.push(b.deck.pop());return handValue(b.player)>=21?finishBlackjack(s):s;
 }
 function dropPlinko(state,bet,id,seed){
  check({...state,plinko:[]},bet);if(typeof id!=='string'||!id||id.length>=80||state.plinko?.some(b=>b.id===id)||!integer(seed,0,UINT_MAX))throw Error('Ungültiger Ball.');
  const s=copy(state);s.balance-=bet;s.plinko??=[];s.plinko.push({id,bet,seed});return s;
 }
 function settlePlinko(state,id,bin){
  const ball=state.plinko?.find(b=>b.id===id);if(!ball||!integer(bin,0,8))throw Error('Ball bereits abgerechnet oder ungültig.');
  const s=copy(state);s.plinko=s.plinko.filter(b=>b.id!==id);return record(s,'plinko',ball.bet,Math.floor(ball.bet*PLINKO[bin]),'Plinko · Fach '+(bin+1)+' · '+PLINKO[bin]+'×',bin);
 }
 const flightFactor=(f,now)=>Math.min(1000,Math.exp(Math.max(0,now-f.started)/9000));
 function startFlight(state,bet,outcome,now){check(state,bet);if(!integer(outcome,0,999999)||!Number.isSafeInteger(now)||now<=0)throw Error('Ungültiger Flug.');const s=copy(state);s.balance-=bet;s.flight={bet,started:now,crash:Math.max(1,Math.min(1000,Math.floor(.96/(1-outcome/1000000)*100)/100))};delete s.last.flight;return s;}
 function finishFlight(state,now,cashout=false){
  if(!state.flight)throw Error('Kein aktiver Flug.');const s=copy(state),f=s.flight,value=flightFactor(f,now),crashed=value>=f.crash;
  if(!cashout&&!crashed)return s;const factor=crashed?f.crash:Math.floor(value*100)/100;s.flight=null;
  return record(s,'flight',f.bet,crashed?0:Math.floor(f.bet*factor),'Foot Flight · '+(crashed?'Absturz bei ':'Gesichert bei ')+factor.toFixed(2)+'×',{status:crashed?'crash':'cashout',factor});
 }
 // European single-zero table. Multipliers include the returned stake.
 const ROULETTE_BETS=[];
 function rouletteBet(id,label,numbers,kind,position={}){ROULETTE_BETS.push({id,label,numbers,mult:36/numbers.length,kind,...position});}
 for(let n=0;n<=36;n++)rouletteBet('n'+n,String(n),[n],'number');
 for(let c=0;c<12;c++){
  const a=c*3+1;rouletteBet('street'+c,a+'–'+(a+2),[a,a+1,a+2],'street',{x:(c+.5)/12,y:1});
  for(let r=0;r<3;r++){const n=a+2-r;if(c<11)rouletteBet('split'+n+'-'+(n+3),n+' / '+(n+3),[n,n+3],'split',{x:(c+1)/12,y:(r+.5)/3});if(r<2)rouletteBet('split'+(n-1)+'-'+n,(n-1)+' / '+n,[n-1,n],'split',{x:(c+.5)/12,y:(r+1)/3});
   if(c<11&&r<2)rouletteBet('corner'+(n-1),[n-1,n,n+2,n+3].join(' / '),[n-1,n,n+2,n+3],'corner',{x:(c+1)/12,y:(r+1)/3});}
  if(c<11)rouletteBet('six'+c,a+'–'+(a+5),Array.from({length:6},(_,i)=>a+i),'six',{x:(c+1)/12,y:1});
 }
 for(let n=1;n<=3;n++)rouletteBet('zero'+n,'0 / '+n,[0,n],'zero');
 rouletteBet('trio012','0 / 1 / 2',[0,1,2],'zero');rouletteBet('trio023','0 / 2 / 3',[0,2,3],'zero');rouletteBet('firstfour','0 / 1 / 2 / 3',[0,1,2,3],'zero');
 for(let i=0;i<3;i++){rouletteBet('dozen'+i,(i*12+1)+'–'+(i*12+12),Array.from({length:12},(_,n)=>i*12+n+1),'dozen');rouletteBet('column'+i,'Kolonne '+(i+1),Array.from({length:12},(_,n)=>n*3+i+1),'column');}
 rouletteBet('red','Rot',RED,'outside');rouletteBet('black','Schwarz',Array.from({length:36},(_,i)=>i+1).filter(n=>!RED.includes(n)),'outside');
 rouletteBet('even','Gerade',Array.from({length:18},(_,i)=>(i+1)*2),'outside');rouletteBet('odd','Ungerade',Array.from({length:18},(_,i)=>i*2+1),'outside');rouletteBet('low','1–18',Array.from({length:18},(_,i)=>i+1),'outside');rouletteBet('high','19–36',Array.from({length:18},(_,i)=>i+19),'outside');
 function rouletteRound(state,ticket,outcome){
  if(!Array.isArray(ticket)||!ticket.length||ticket.length>ROULETTE_BETS.length||new Set(ticket.map(b=>b.id)).size!==ticket.length||!integer(outcome,0,36))throw Error('Lege zuerst Chips auf den Tisch.');
  let total=0,payout=0,hits=0;for(const b of ticket){const rule=ROULETTE_BETS.find(r=>r.id===b.id);if(!rule||!integer(b.amount,1))throw Error('Ungültiger Roulette-Einsatz.');total+=b.amount;if(rule.numbers.includes(outcome)){payout+=b.amount*rule.mult;hits++;}}
  check(state,total);const s=copy(state);s.balance-=total;return record(s,'roulette',total,payout,'Roulette · '+outcome+' '+(outcome===0?'Grün':RED.includes(outcome)?'Rot':'Schwarz')+' · '+hits+' von '+ticket.length+' Feldern getroffen',outcome);
 }
 const api={ROULETTE_BETS,rouletteRound,dropPlinko,settlePlinko,flightFactor,startFlight,finishFlight,RED,PLINKO,handValue,startBlackjack,blackjackAction,CAP,BETS,MINE_MULT,WHEEL,roadRisk,roadMultiplier,roadRandom,fresh,clean,instant,startMines,reveal,collect,cancel,refill,roadValue,startRoad,stepRoad,collectRoad,cancelRoad};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FootArcade=api;
})(typeof window!=='undefined'?window:globalThis);
