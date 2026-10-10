/* Beeline: minimap
   The small overhead map in the corner. */

const mini=document.getElementById("mini"), mctx=mini.getContext("2d");
function toScreen(gx,gy){ return turn===90 ? [BY-gy, BX-gx] : [gx, BY-gy]; }
function drawMini(){
  const W=mini.width, pad=26, s=(W-pad*2)/Math.max(BX,BY);
  const sw=(turn===90?BY:BX)*s, sh=(turn===90?BX:BY)*s, ox=(W-sw)/2, oy=(W-sh)/2;
  mctx.clearRect(0,0,W,W);
  if(!player) return;
  const P=(gx,gy)=>{ const [x,y]=toScreen(gx,gy); return [ox+x*s, oy+y*s]; };
  mctx.lineCap="round";
  for(let j=0;j<NY;j++) for(let i=0;i<NX;i++) for(const d of ["right","up"]){
    const ni=i+DV[d][0], nj=j+DV[d][1]; if(!inGrid(ni,nj)) continue;
    const c=closed.has(ekey(nid(i,j),nid(ni,nj)));
    mctx.strokeStyle=c?"rgba(150,95,60,.45)":"rgba(139,212,110,.5)"; mctx.lineWidth=c?3:6;
    const a=P(i,j), b=P(ni,nj); mctx.beginPath(); mctx.moveTo(...a); mctx.lineTo(...b); mctx.stroke();
  }
  for(const d of dots){ if(d.eaten) continue; const [x,y]=P(d.gx,d.gy);
    mctx.fillStyle=d.power?"#FFD978":"#FF7AB6"; mctx.beginPath(); mctx.arc(x,y,d.power?16:5,0,7); mctx.fill(); }
  for(const d of drones){ if(d.state==="towed") continue; const [x,y]=P(...entityPos(d));
    const c=d.symState==="normal"?d.color:d.symState==="blink"?[234,242,255]:FRIGHT;
    mctx.strokeStyle=`rgb(${c})`; mctx.lineWidth=5; for(const r of [15,9]){ mctx.beginPath(); mctx.arc(x,y,r,0.4,5.6); mctx.stroke(); } }
  const [x,y]=P(...entityPos(player));
  const r=15*(player.lastSize>1?1.6:1);
  mctx.fillStyle="#FFC23D"; mctx.beginPath(); mctx.arc(x,y,r,0,7); mctx.fill(); mctx.fillStyle="#2A201C"; mctx.fillRect(x-r*0.27,y-r*0.93,r*0.27,r*1.86); mctx.fillRect(x+r*0.33,y-r*0.8,r*0.27,r*1.6); mctx.strokeStyle="#FFFFFF"; mctx.lineWidth=3; mctx.beginPath(); mctx.arc(x,y,r,0,7); mctx.stroke();
}
