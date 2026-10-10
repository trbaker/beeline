/* Beeline: state
   Everything that changes while a game is running, plus the current difficulty. */

let difficulty=2;
const diffCfg=()=>DIFF[difficulty];
let state="title", round=1, score=0, lives=3, gameTime=0, dotsLeft=0, timers=[], flowToken=0;
let player=null, drones=[], dots=[], want=null;
let frightUntil=0, combo=0, mode="scatter", modeSwitchAt=0, lastBlink=0;
let pSpeed=1.35, dSpeed=1.05, frightTime=7;

function clearTimers(){ timers.forEach(clearTimeout); timers=[]; }
const later=(fn,ms)=>{ timers.push(setTimeout(fn,ms)); };
