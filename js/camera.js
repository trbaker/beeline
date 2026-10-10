/* Beeline: camera
   Bird's-eye and first-person cameras, smooth following, and player zoom. */

function gridPolygon(m=0.3){ // kept for reference; camera now computed directly
  const ring=[[-m,-m],[BX+m,-m],[BX+m,BY+m],[-m,BY+m],[-m,-m]].map(([x,y])=>toLonLat(x,y));
  return new esri.Polygon({rings:[ring], spatialReference:{wkid:4326}});
}
/* Bird's-eye: tilted view that drifts toward the bee, zoomed in close.
   First person: chase camera just behind and above the bee, facing where it flies. */
let viewMode="bird", camLive=false, camC=null, camH=0, groundZ=0;
const lerp=(a,b,k)=>a+(b-a)*k;
function angLerp(a,b,k){ let d=((b-a)%360+540)%360-180; return a+d*k; }
function birdTarget(){
  const [px,py]= player ? entityPos(player) : [CX,CY];
  return [lerp(CX,px,0.8), lerp(CY,py,0.8)];
}
const wantHeading=()=> viewMode==="fp" ? bearingOf(player && player.dir || "up") : city.rot+turn;
/* Player zoom during play: 1 = default. Smaller = closer. */
const ZMIN=0.4, ZMAX=2.4;
let zoomTarget=1, zoomNow=1;
function zoomBy(f, quiet){
  const before=zoomTarget;
  zoomTarget=Math.min(ZMAX, Math.max(ZMIN, zoomTarget*f));
  if(!quiet){
    if(zoomTarget===before) toast(f>1 ? "Zoomed out as far as it goes" : "Zoomed in as far as it goes");
    else toast(`Zoom ${Math.round(100/zoomTarget)}%`);
  }
}
function birdCam(){
  const D=Math.max(BX*city.bu, BY*city.bv), portrait=innerHeight>innerWidth;
  const R=Math.max(D*(portrait?0.95:0.68), portrait?760:560)*zoomNow, tilt=40, h=camH*Math.PI/180, tr=tilt*Math.PI/180;
  const [e,n]=gridEN(camC[0],camC[1]), back=R*Math.sin(tr);
  const [lon,lat]=enLL(e-Math.sin(h)*back, n-Math.cos(h)*back);
  return new esri.Camera({position:{longitude:lon,latitude:lat,z:groundZ+R*Math.cos(tr)}, heading:camH, tilt});
}
function fpCam(){
  const [px,py]=entityPos(player), [e,n]=gridEN(px,py), L=E/16*Math.sqrt(player.lastSize||1)*zoomNow, h=camH*Math.PI/180, back=L*1.9;
  const [lon,lat]=enLL(e-Math.sin(h)*back, n-Math.cos(h)*back);
  return new esri.Camera({position:{longitude:lon,latitude:lat,z:groundZ+L*1.3}, heading:camH, tilt:76});
}
const currentCam=()=> viewMode==="fp" && player ? fpCam() : birdCam();
function frameCamera(duration){
  computeTurn(); camLive=false;
  view.padding={top:0,bottom:0,left:0,right:0};
  camC=birdTarget(); camH=wantHeading(); zoomNow=zoomTarget;
  return view.goTo(currentCam(),{duration, easing:"in-out-cubic"}).catch(()=>{})
    .then(()=>{ if(navLocked) camLive=true; });
}
function updateCamera(dt){
  if(!camLive || !navLocked || !player) return;
  const [tx,ty]=birdTarget(), k=1-Math.exp(-dt*4.5);
  camC=[lerp(camC[0],tx,k), lerp(camC[1],ty,k)];
  camH=angLerp(camH, wantHeading(), 1-Math.exp(-dt*(viewMode==="fp"?7:3)));
  zoomNow=lerp(zoomNow, zoomTarget, 1-Math.exp(-dt*6));
  view.camera=currentCam();
}
