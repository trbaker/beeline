/* Beeline: movement
   How the bee and wasps move along streets, and how each wasp decides where to go. */

function entityPos(e){
  if(!e.moving) return [e.i,e.j];
  return [e.i+DV[e.dir][0]*e.t, e.j+DV[e.dir][1]*e.t];
}
function reverseEntity(e){
  if(!e.moving) return;
  e.i+=DV[e.dir][0]; e.j+=DV[e.dir][1]; e.t=1-e.t; e.dir=OPP[e.dir];
}
function advance(e, dist, choose){
  let guard=0;
  while(dist>1e-6 && guard++<10){
    if(!e.moving){
      const d=choose(e); if(!d) return;
      e.dir=d; e.moving=true; e.t=0;
    }
    const left=1-e.t;
    if(dist<left){ e.t+=dist; dist=0; }
    else{ dist-=left; e.i+=DV[e.dir][0]; e.j+=DV[e.dir][1]; e.t=0; e.moving=false; }
  }
}
function choosePlayer(e){
  if(want && canMove(e.i,e.j,want)) return want;
  if(e.dir && canMove(e.i,e.j,e.dir)) return e.dir;
  return null;
}
function droneTarget(k,d){
  const [px,py]=entityPos(player), pd=DV[player.dir||"up"];
  if(d.state==="fright") return null;
  if(mode==="scatter") return d.corner();
  if(k===0) return [px,py];
  if(k===1) return [px+pd[0]*2, py+pd[1]*2];
  if(k===2){ const [rx,ry]=entityPos(drones[0]); const ax=px+pd[0], ay=py+pd[1]; return [2*ax-rx, 2*ay-ry]; }
  if(k===3){ const [x,y]=entityPos(d); return Math.hypot(x-px,y-py)>2.5 ? [px,py] : d.corner(); }
  return Math.random()<0.6 ? [px,py] : null;
}
function chooseDrone(e){
  let opts=DIRS.filter(d=>canMove(e.i,e.j,d) && d!==OPP[e.dir]);
  if(!opts.length) opts=DIRS.filter(d=>canMove(e.i,e.j,d));
  const tgt=droneTarget(e.k,e);
  if(!tgt) return opts[Math.floor(Math.random()*opts.length)];
  let best=null, bd=Infinity;
  for(const d of opts){
    const nx=e.i+DV[d][0], ny=e.j+DV[d][1], dd=(nx-tgt[0])**2+(ny-tgt[1])**2;
    if(dd<bd){ bd=dd; best=d; }
  }
  return best;
}
