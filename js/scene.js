/* Beeline: scene
   The ArcGIS 3D scene: map, buildings, layers and the view. initScene() runs once the ArcGIS SDK has loaded. */

// ArcGIS classes, filled in by main.js once the SDK has loaded
const esri = {};
let map, buildings, streetLayer, propLayer, dotLayer, actorLayer, view;

// See-through buildings
let origRenderer = null, xray = true;
const XRAY = { type:"simple", symbol:{ type:"mesh-3d", symbolLayers:[{ type:"fill",
  material:{ color:[190,205,235,0.16], colorMixMode:"replace" },
  edges:{ type:"solid", color:[234,242,255,0.45], size:0.6 } }] } };
function applyXray(){ buildings.opacity = xray ? 0.55 : 1; try{ buildings.renderer = xray ? XRAY : origRenderer; }catch(e){} }

// While playing, the map ignores its own mouse/touch/keyboard navigation
let navLocked = true;

function initScene(){
  map = new esri.Map({ basemap:"satellite", ground:"world-elevation" });
  buildings = new esri.SceneLayer({ portalItem:{ id:"ca0470dbbddb4db28bad74ed39949e25" }, popupEnabled:false, opacity:0.55 }); // OpenStreetMap 3D Buildings
  map.add(buildings);
  streetLayer = new esri.GraphicsLayer({ elevationInfo:{mode:"on-the-ground"} });
  propLayer   = new esri.GraphicsLayer({ elevationInfo:{mode:"relative-to-ground"} });
  dotLayer    = new esri.GraphicsLayer({ elevationInfo:{mode:"relative-to-ground"} });
  actorLayer  = new esri.GraphicsLayer({ elevationInfo:{mode:"relative-to-ground"} });
  map.addMany([streetLayer, propLayer, dotLayer, actorLayer]);

  view = new esri.SceneView({
    container:"viewDiv", map,
    camera:{ position:{longitude:-73.995, latitude:40.735, z:3500}, heading:29, tilt:40 },
    ui:{ components:["attribution"] },
    qualityProfile:"medium",
    popupEnabled:false,
    environment:{ atmosphereEnabled:true, starsEnabled:false }
  });

  buildings.load().then(()=>{ origRenderer = buildings.renderer ? buildings.renderer.clone() : null; applyXray(); })
    .catch(()=> toast("3D buildings didn't load — the game still works on the imagery."));

  ["drag","mouse-wheel","double-click","immediate-double-click","hold","key-down"].forEach(ev=>{
    view.on(ev, e=>{ if(navLocked) e.stopPropagation(); });
  });
}

async function groundAt(){
  try{
    const r=await Promise.race([ map.ground.queryElevation(new esri.Point({longitude:city.lon,latitude:city.lat})), sleep(4000).then(()=>null) ]);
    const z=r && r.geometry && r.geometry.z;
    return Number.isFinite(z) ? z : city.elev;
  }catch(e){ return city.elev; }
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function settle(ms){ return Promise.race([esri.reactiveUtils.whenOnce(()=>!view.updating), sleep(ms)]); }
