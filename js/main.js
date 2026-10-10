/* Beeline: main
   Starts everything: loads the ArcGIS SDK modules, builds the scene, runs the game loop and the start screen. */

require([
  "esri/Map","esri/views/SceneView","esri/layers/GraphicsLayer","esri/layers/SceneLayer",
  "esri/Graphic","esri/Camera","esri/geometry/Point","esri/geometry/Polygon","esri/geometry/Polyline","esri/core/reactiveUtils",
  "esri/widgets/Zoom","esri/widgets/Home","esri/widgets/Compass","esri/widgets/NavigationToggle","esri/widgets/Fullscreen"
], function(Map, SceneView, GraphicsLayer, SceneLayer, Graphic, Camera, Point, Polygon, Polyline, reactiveUtils,
            Zoom, Home, Compass, NavigationToggle, Fullscreen){
  Object.assign(esri, { Map, SceneView, GraphicsLayer, SceneLayer, Graphic, Camera, Point, Polygon, Polyline, reactiveUtils,
                        Zoom, Home, Compass, NavigationToggle, Fullscreen });
  initScene();

  let last=performance.now();
  function loop(now){
    requestAnimationFrame(loop);
    const dt=Math.min(0.05,(now-last)/1000); last=now;
    if(state==="playing") update(dt);
    if(state==="playing"||state==="ready"||state==="dying") renderActors();
    updateCamera(dt);
    drawMini();
  }
  requestAnimationFrame(loop);

  const sel=document.getElementById("startAt");
  CITIES.forEach((c,i)=>{ const o=document.createElement("option"); o.value=i+1; o.textContent=`Start in ${c.name}`; sel.appendChild(o); });
  view.when(()=>{
    const b=document.getElementById("bStart"); b.disabled=false; b.textContent="Start buzzing";
    b.onclick=()=>{ beep(1,0.01); startGame(parseInt(sel.value,10)||1); };
    document.getElementById("hArea").textContent="Midtown Manhattan";
  }, err=>{
    banner(`<div class="kicker">The 3D scene couldn't start</div><h1>No map</h1><div class="note">${(err&&err.message)||"WebGL or the ArcGIS SDK is unavailable."} Open this page in a current desktop or mobile browser with WebGL enabled, then reload.</div>`);
  });
});
