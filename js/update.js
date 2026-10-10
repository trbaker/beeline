/* Beeline: update
   The per-frame game logic: moving, eating flowers, the super-bee power and bumping into wasps. */

function setDroneSym(d,s){
  if(d.symState===s) return; d.symState=s;
  d.g.symbol = waspLook(d,s);
}
function update(dt){
  gameTime+=dt;
  const frightActive = gameTime<frightUntil;
  if(!frightActive && gameTime>=modeSwitchAt){
    mode = mode==="scatter"?"chase":"scatter";
    modeSwitchAt = gameTime + (mode==="chase"?diffCfg().chase*EASE:diffCfg().scatter/EASE);
    drones.forEach(d=>{ if(d.state==="normal") d.reverse=true; });
  }
  if(frightUntil && !frightActive){ frightUntil=0; toast("Back to bee size."); drones.forEach(d=>{ if(d.state==="fright"){ d.state="normal"; setDroneSym(d,"normal"); } }); }

  // player
  if(want && player.moving && want===OPP[player.dir]) reverseEntity(player);
  advance(player, pSpeed*dt, choosePlayer);
  eatDots();
  if(state!=="playing") return;

  // drones
  for(const d of drones){
    if(d.state==="towed"){
      if(gameTime>=d.respawnAt){ Object.assign(d,{i:HOUSE[d.k][0],j:HOUSE[d.k][1],moving:false,t:0,state:"normal",dir:"up"}); d.g.visible=true; setDroneSym(d,"normal"); }
      continue;
    }
    if(gameTime<d.releaseAt) continue;
    if(d.reverse){ reverseEntity(d); d.reverse=false; }
    advance(d, (d.state==="fright"?0.55:1)*dSpeed*dt, chooseDrone);
    if(d.state==="fright"){
      const remain=frightUntil-gameTime;
      setDroneSym(d, remain<1.6 && Math.floor(remain*4)%2===0 ? "blink" : "fright");
    }
  }
  // collisions
  const [px,py]=entityPos(player);
  for(const d of drones){
    if(d.state==="towed") continue;
    const [dx,dy]=entityPos(d);
    const reach = d.state==="fright" ? 0.55 : 0.33;   // a super bee is wide enough to bonk wasps nearby
    if(Math.abs(dx-px)+Math.abs(dy-py) < reach){
      if(d.state==="fright"){
        combo++; const pts=200*2**(combo-1); score+=pts; toast(`Bonk! ${d.name} buzzed back to the nest, dizzy. +${pts}`);
        d.state="towed"; d.respawnAt=gameTime+3; d.g.visible=false; beep(300,0.25,"square",0.05,900);
      } else { toast(`${d.name} bumped you and spilled your pollen!`); loseLife(); return; }
    }
  }
}
let chompAlt=false, lastChomp=0;
function eatDots(){
  const [px,py]=entityPos(player);
  for(const d of dots){
    if(d.eaten) continue;
    if(Math.abs(d.gx-px)+Math.abs(d.gy-py) < 0.12){
      d.eaten=true; dotsLeft--;
      (d.power?propLayer:dotLayer).remove(d.g);
      if(d.power){
        score+=50; combo=0; frightUntil=gameTime+frightTime; toast("Super flower! You're a giant bee. Bonk the wasps!"); beep(220,0.45,"sine",0.07,700);
        drones.forEach(dr=>{ if(dr.state!=="towed"){ dr.state="fright"; dr.reverse=true; setDroneSym(dr,"fright"); } });
      } else {
        score+=10;
        if(performance.now()-lastChomp>70){ beep(chompAlt?520:660,0.04,"square",0.025); chompAlt=!chompAlt; lastChomp=performance.now(); }
      }
      updateHud();
      if(dotsLeft<=0){ roundClear(); return; }
    }
  }
}
function renderActors(){
  if(!player) return;
  const [px,py]=entityPos(player);
  player.g.geometry=pt(px,py);
  let size=1;
  if(frightUntil && gameTime<frightUntil){
    const remain=frightUntil-gameTime;
    size = remain<1.6 && Math.floor(remain*5)%2===0 ? 1.35 : SUPER_SIZE;   // flicker smaller when time is almost up
  }
  if(player.dir!==player.lastHead || size!==player.lastSize){
    player.lastHead=player.dir; player.lastSize=size; player.g.symbol=beeSym(bearingOf(player.dir||"right"), size);
  }
  for(const d of drones){ if(d.state==="towed") continue; const [x,y]=entityPos(d); d.g.geometry=pt(x,y);
    if(d.dir && d.dir!==d.lastHead){ d.lastHead=d.dir; d.g.symbol=waspLook(d,d.symState); } }
}
