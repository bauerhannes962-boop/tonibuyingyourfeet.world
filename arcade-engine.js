/* Gemeinsame, rein lokale Regeln für kostenlose Spielpunkte. */
(function(root){
 'use strict';
 const CAP=1000000000,BETS=[10,25,50,100],MINE_MULT=[0,1.25,1.6,2.2,3.1,4.8,8,20],WHEEL=[0,2,0,3,0,2,0,5];
 const copy=x=>JSON.parse(JSON.stringify(x));
 const integer=(n,min=0,max=CAP)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
 const fresh=()=>({version:2,balance:2500,rounds:0,wins:0,best:0,history:[],last:{},mines:null});
 function validResult(game,result){
  if(game==='slots')return Array.isArray(result)&&result.length===3&&result.every(n=>integer(n,0,4));
  if(game==='wheel')return integer(result,0,7);
  if(game==='coin')return integer(result,0,1);
  if(game==='dice')return integer(result,1,6);
  if(game!=='mines'||!result||typeof result!=='object')return false;
  const {bombs,open,hit}=result;
  return Array.isArray(bombs)&&bombs.length===2&&new Set(bombs).size===2&&bombs.every(n=>integer(n,0,8))&&Array.isArray(open)&&open.length<=7&&new Set(open).size===open.length&&open.every(n=>integer(n,0,8)&&!bombs.includes(n))&&(hit===null||bombs.includes(hit));
 }
 function clean(raw){
  if(!raw||raw.version!==2||!integer(raw.balance))return fresh();
  const s=fresh();s.balance=raw.balance;
  for(const k of ['rounds','wins','best'])if(integer(raw[k]))s[k]=raw[k];
  const games=['slots','wheel','coin','dice','mines'];
  if(Array.isArray(raw.history))s.history=raw.history.filter(r=>r&&games.includes(r.game)&&BETS.includes(r.bet)&&integer(r.payout)&&typeof r.detail==='string').slice(0,6).map(r=>({game:r.game,bet:r.bet,payout:r.payout,detail:r.detail.slice(0,100)}));
  if(raw.last&&typeof raw.last==='object')for(const game of games){const r=raw.last[game];if(r&&integer(r.payout)&&BETS.includes(r.bet)&&typeof r.detail==='string'&&validResult(game,r.result))s.last[game]={game,bet:r.bet,payout:r.payout,detail:r.detail.slice(0,100),result:copy(r.result)};}
  const m=raw.mines;
  if(m&&BETS.includes(m.bet)&&Array.isArray(m.bombs)&&m.bombs.length===2&&new Set(m.bombs).size===2&&m.bombs.every(n=>integer(n,0,8))&&Array.isArray(m.open)&&m.open.length<7&&new Set(m.open).size===m.open.length&&m.open.every(n=>integer(n,0,8)&&!m.bombs.includes(n)))s.mines={bet:m.bet,bombs:[...m.bombs],open:[...m.open]};
  return s;
 }
 function check(s,bet){if(s.mines)throw Error('Erst die laufende Minenrunde beenden.');if(!BETS.includes(bet))throw Error('Bitte einen gültigen Einsatz wählen.');if(s.balance<bet)throw Error('Zu wenig Feet Coins. Lade kostenlos Feet Coins nach.');}
 function record(s,game,bet,payout,detail,result){
  s.balance=Math.min(CAP,s.balance+payout);s.rounds=Math.min(CAP,s.rounds+1);if(payout>bet)s.wins=Math.min(CAP,s.wins+1);s.best=Math.max(s.best,payout);
  const r={game,bet,payout,detail,result};s.last[game]=r;s.history.unshift({game,bet,payout,detail});s.history=s.history.slice(0,6);return s;
 }
 function instant(state,game,bet,pick,outcome){
  check(state,bet);const s=copy(state);let payout=0,detail='',result=outcome;
  if(game==='slots'){
   if(!Array.isArray(outcome)||outcome.length!==3||outcome.some(n=>!integer(n,0,4)))throw Error('Ungültiges Walzenergebnis.');
   const [a,b,c]=outcome;const mult=a===b&&b===c?[10,5,6,15,4][a]:(a===b||a===c||b===c?2:0);payout=bet*mult;detail=mult>2?'Drei gleiche · '+mult+'×':mult===2?'Ein Paar · 2×':'Drei verschiedene';
  }else if(game==='wheel'){
   if(!integer(outcome,0,7))throw Error('Ungültiges Radsegment.');payout=bet*WHEEL[outcome];detail='Rad landet auf '+WHEEL[outcome]+'×';
  }else if(game==='coin'){
   if(![0,1].includes(pick)||![0,1].includes(outcome))throw Error('Wähle Fuß oder Socke.');payout=pick===outcome?bet*2:0;detail=(outcome===0?'Fuß':'Socke')+' · '+(payout?'richtig getippt':'anders getippt');
  }else if(game==='dice'){
   if(![0,1].includes(pick)||!integer(outcome,1,6))throw Error('Wähle eine Würfelhälfte.');payout=(pick===0?outcome<=3:outcome>=4)?bet*2:0;detail='Gewürfelt: '+outcome+' · '+(payout?'richtig getippt':'andere Hälfte');
  }else throw Error('Unbekanntes Spiel.');
  s.balance-=bet;return record(s,game,bet,payout,detail,result);
 }
 function startMines(state,bet,bombs){check(state,bet);if(!Array.isArray(bombs)||bombs.length!==2||new Set(bombs).size!==2||bombs.some(n=>!integer(n,0,8)))throw Error('Ungültiges Spielfeld.');const s=copy(state);s.balance-=bet;s.mines={bet,bombs:[...bombs],open:[]};delete s.last.mines;return s;}
 function reveal(state,index){
  if(!state.mines||!integer(index,0,8))throw Error('Starte zuerst eine Minenrunde.');if(state.mines.open.includes(index))throw Error('Dieses Feld ist schon offen.');const s=copy(state),m=s.mines;
  if(m.bombs.includes(index)){s.mines=null;return record(s,'mines',m.bet,0,'Socke erwischt · Einsatz verloren',{bombs:m.bombs,open:m.open,hit:index});}
  m.open.push(index);if(m.open.length===7)return collect(s);return s;
 }
 function collect(state){if(!state.mines||!state.mines.open.length)throw Error('Öffne zuerst ein sicheres Feld.');const s=copy(state),m=s.mines;s.mines=null;return record(s,'mines',m.bet,Math.floor(m.bet*MINE_MULT[m.open.length]),m.open.length+' sichere Felder · '+MINE_MULT[m.open.length]+'×',{bombs:m.bombs,open:m.open,hit:null});}
 function cancel(state){if(!state.mines)throw Error('Keine aktive Minenrunde.');const s=copy(state),m=s.mines;s.mines=null;return record(s,'mines',m.bet,0,'Runde abgebrochen',{bombs:m.bombs,open:m.open,hit:null});}
 function refill(state){const s=copy(state);s.balance=Math.min(CAP,s.balance+1000);return s;}
 const api={CAP,BETS,MINE_MULT,WHEEL,fresh,clean,instant,startMines,reveal,collect,cancel,refill};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FootArcade=api;
})(typeof window!=='undefined'?window:globalThis);
