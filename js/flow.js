/* Beeline: flow
   Round flow: fly to a city, count down, lose a life, clear a city, game over and win screens. */

async function loadRound(r){
  const token=++flowToken; clearTimers();
  state="loading"; round=r; city=CITIES[r-1]; setGrid(r);
  banner(`<div class="kicker">Round ${r} of ${ROUNDS}</div><h1>${city.name}</h1><div class="sub">${city.area}</div><div class="note">${BX} × ${BY} blocks. Flying in…</div>`);
  buildRound();
  groundZ = await groundAt();
  if(token!==flowToken) return;
  await frameCamera(r===1?2500:4500);
  await settle(5000);
  if(token!==flowToken) return;
  countdown(token);
}
function countdown(token){
  state="ready"; let n=3;
  const tick=()=>{
    if(token!==flowToken) return;
    if(n>0){ banner(`<div class="kicker">${city.name}, ${BX} × ${BY} blocks</div><div class="count">${n}</div>`); beep(440,0.08); n--; later(tick,700); }
    else{ hideBanner(); beep(880,0.15); state="playing"; }
  };
  tick();
}
function startGame(fromRound){
  score=0; lives=diffCfg().lives; gameTime=0; setLook(false); loadRound(fromRound);
}
function loseLife(){
  state="dying"; lives--; updateHud();
  beep(600,0.6,"sawtooth",0.05,-520);
  const token=flowToken;
  later(()=>{
    if(token!==flowToken) return;
    if(lives<=0){
      state="over";
      banner(`<div class="kicker">Out of buzz in ${city.name}</div><h1>${score.toLocaleString()}</h1><div class="sub">You reached round ${round} of ${ROUNDS}. Take a nectar break and try again?</div>
        ${diffHTML()}<div class="row"><button class="btn" id="bAgain">Play again</button></div>`);
      document.getElementById("bAgain").onclick=()=>startGame(1);
    } else { resetActors(); countdown(token); }
  },1500);
}
function roundClear(){
  state="clear"; const bonus=500*round; score+=bonus;
  if(round%diffCfg().lifeEvery===0 && lives<diffCfg().maxLives) lives++;
  updateHud(); [523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,0.12,"triangle"),i*110));
  const token=flowToken;
  if(round>=ROUNDS){
    state="won";
    banner(`<div class="kicker">All ${ROUNDS} cities cleared</div><h1>${score.toLocaleString()}</h1><div class="sub">You visited every flower in every city. The whole hive is proud of you!</div>
      ${diffHTML()}<div class="row"><button class="btn" id="bAgain">Play again</button></div>`);
    document.getElementById("bAgain").onclick=()=>startGame(1);
    return;
  }
  const next=CITIES[round];
  banner(`<div class="kicker">Every flower in ${city.name} visited! +${bonus} bonus</div><h1>${next.name}</h1><div class="sub">Next stop: ${next.area}</div>`);
  later(()=>{ if(token===flowToken) loadRound(round+1); },2400);
}
