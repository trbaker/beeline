/* Beeline: input
   Keyboard, on-screen pad, swipes, pinch and mouse-wheel zoom. */

const SCREEN_TO_GRID_90 = {up:"right", right:"down", down:"left", left:"up"};
const CW={up:"right",right:"down",down:"left",left:"up"}, CCW={up:"left",left:"down",down:"right",right:"up"};
function press(screenDir){
  if(viewMode==="fp"){   // first person: up = forward, down = turn around, left/right = turn
    const f=(player && player.dir) || "up";
    want = screenDir==="up" ? f : screenDir==="down" ? OPP[f] : screenDir==="right" ? CW[f] : CCW[f];
    return;
  }
  want = turn===90 ? SCREEN_TO_GRID_90[screenDir] : screenDir;
}
const KEYS={ArrowUp:"up",KeyW:"up",ArrowDown:"down",KeyS:"down",ArrowLeft:"left",KeyA:"left",ArrowRight:"right",KeyD:"right"};
addEventListener("keydown",e=>{
  if(KEYS[e.code] && navLocked){ press(KEYS[e.code]); e.preventDefault(); }
  if(e.code==="KeyP"||e.code==="Escape") togglePause();
  if(e.code==="KeyV") setViewMode(viewMode==="bird"?"fp":"bird");
  if(navLocked && (e.code==="Equal"||e.code==="NumpadAdd")) zoomBy(1/1.35);
  if(navLocked && (e.code==="Minus"||e.code==="NumpadSubtract")) zoomBy(1.35);
});
document.querySelectorAll("#pad button").forEach(b=>b.addEventListener("pointerdown",e=>{ e.preventDefault(); press(b.dataset.d); }));
document.getElementById("zIn").onclick=()=>zoomBy(1/1.35);
document.getElementById("zOut").onclick=()=>zoomBy(1.35);
const touch=document.getElementById("touch"); let sx=0, sy=0, tracking=false;
touch.addEventListener("wheel",e=>{ e.preventDefault(); zoomBy(e.deltaY>0?1.1:1/1.1, true); },{passive:false});
const pts=new Map(); let pinch0=0;
const pinchDist=()=>{ const [a,b]=[...pts.values()]; return Math.hypot(a.x-b.x,a.y-b.y); };
touch.addEventListener("pointerdown",e=>{
  pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pts.size===2){ tracking=false; pinch0=pinchDist(); return; }   // two fingers = pinch to zoom
  tracking=true; sx=e.clientX; sy=e.clientY;
});
touch.addEventListener("pointermove",e=>{
  if(pts.has(e.pointerId)) pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pts.size===2 && pinch0>0){ const d=pinchDist(); if(d>0){ zoomBy(pinch0/d, true); pinch0=d; } return; }
  if(!tracking) return; const dx=e.clientX-sx, dy=e.clientY-sy;
  if(Math.hypot(dx,dy)>24){ press(Math.abs(dx)>Math.abs(dy)?(dx>0?"right":"left"):(dy>0?"down":"up")); sx=e.clientX; sy=e.clientY; }
});
["pointerup","pointercancel","pointerleave"].forEach(ev=>touch.addEventListener(ev,e=>{ tracking=false; pts.delete(e.pointerId); if(pts.size<2) pinch0=0; }));
