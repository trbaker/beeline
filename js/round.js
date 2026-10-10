/* Beeline: round
   Builds a round: streets, hedges, flowers, super flowers, the bee and the wasps. */

function buildRound(){
  streetLayer.removeAll(); propLayer.removeAll(); dotLayer.removeAll(); actorLayer.removeAll();
  E = Math.max(550, Math.max(city.bu, city.bv)*5);
  const edgeCount = BX*(BY+1) + BY*(BX+1);   // 60 on a 5x5 grid
  genClosures(Math.max(0, Math.round(Math.min(1+round+diffCfg().closures, 12) * edgeCount/60)));

  // street lines + closures
  for(let j=0;j<NY;j++) for(let i=0;i<NX;i++){
    for(const d of ["right","up"]){
      const ni=i+DV[d][0], nj=j+DV[d][1]; if(!inGrid(ni,nj)) continue;
      const isClosed = closed.has(ekey(nid(i,j),nid(ni,nj)));
      const a=toLonLat(i,j), b=toLonLat(ni,nj);
      streetLayer.add(new esri.Graphic({ geometry:new esri.Polyline({paths:[[a,b]], spatialReference:{wkid:4326}}),
        symbol:{type:"simple-line", color: isClosed?[150,95,60,0.6]:[139,212,110,0.65], width: isClosed?2:3, style:isClosed?"dash":"solid"} }));
      if(isClosed){
        const h = d==="right" ? city.rot-90 : city.rot;
        propLayer.add(new esri.Graphic({geometry:pt((i+ni)/2,(j+nj)/2), symbol:barrierSym(h)}));
      }
    }
  }
  // fares + beacons
  dots=[];
  const corners=[[0,0],[BX,0],[0,BY],[BX,BY]];
  const isCorner=(i,j)=>corners.some(c=>c[0]===i&&c[1]===j);
  const addDot=(gx,gy,power)=>{
    const g=new esri.Graphic({geometry:pt(gx,gy), symbol: power?beaconSym():dotSym(dots.length)});
    (power?propLayer:dotLayer).add(g); dots.push({gx,gy,power,g,eaten:false});
  };
  for(let j=0;j<NY;j++) for(let i=0;i<NX;i++){
    addDot(i,j,isCorner(i,j));
    for(const d of ["right","up"]){
      const ni=i+DV[d][0], nj=j+DV[d][1]; if(!inGrid(ni,nj) || closed.has(ekey(nid(i,j),nid(ni,nj)))) continue;
      const len = d==="right"?city.bu:city.bv, n=Math.max(1, Math.round(len/45)-1);
      for(let s=1;s<=n;s++){ const f=s/(n+1); addDot(i+DV[d][0]*f, j+DV[d][1]*f, false); }
    }
  }
  dotsLeft=dots.length;

  // actors
  const sx=Math.floor(CX);
  player={i:sx,j:0,dir:"right",moving:false,t:0};
  player.g=new esri.Graphic({geometry:pt(sx,0), symbol:beeSym(bearingOf("right"))}); player.lastHead="right";
  actorLayer.add(player.g);
  const gridCap=Math.max(1, Math.min(5, Math.round(BX*BY/6)));   // small grids get fewer wasps
  const nd=Math.max(1, Math.min(2+Math.floor((round+1)/2)+diffCfg().drones, gridCap));
  drones=[];
  for(let k=0;k<nd;k++){
    const d=Object.assign({k,i:HOUSE[k][0],j:HOUSE[k][1],dir:"up",moving:false,t:0,state:"normal",releaseAt:0},WASPS[k]);
    d.g=new esri.Graphic({geometry:pt(d.i,d.j), symbol:waspSym(d.color,d.body,bearingOf("up"))}); d.symState="normal"; d.lastHead="up";
    actorLayer.add(d.g); drones.push(d);
  }
  pSpeed = (1.35 + 0.02*(round-1)) * diffCfg().pMul;
  dSpeed = Math.min((1.05 + 0.045*(round-1))*diffCfg().dMul, diffCfg().dCap) * EASE;
  frightTime = Math.max(diffCfg().fMin, Math.max(2.2, 7 - 0.5*(round-1)) * diffCfg().fMul) / EASE;
  resetActors();
  updateHud();
}
function resetActors(){
  Object.assign(player,{i:Math.floor(CX),j:0,dir:"right",moving:false,t:0}); want=null;
  drones.forEach((d,k)=>{ Object.assign(d,{i:HOUSE[k][0],j:HOUSE[k][1],dir:"up",moving:false,t:0,state:"normal",reverse:false,
    releaseAt:gameTime+(1+k*2.2)*diffCfg().release}); d.g.visible=true; setDroneSym(d,"normal"); });
  frightUntil=0; mode="scatter"; modeSwitchAt=gameTime+diffCfg().scatter+1;
  renderActors();
}
