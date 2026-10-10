/* Beeline: symbols
   3D models built from simple shapes: the bee, wasps, flowers, super flowers and hedges. */

const obj = (prim,color,w,d,h,extra={})=>Object.assign({type:"object",resource:{primitive:prim},material:{color},width:w,depth:d,height:h,anchor:"bottom"},extra);
// place a part at (dx sideways, dy forward, dz up) metres from the graphic's point; offsets turn with heading
const at=(dx,dy,dz,w,d,h)=>({anchor:"relative",anchorPosition:{x:-dx/w, y:-dy/d, z:-0.5-dz/h}});
function beeSym(heading, k=1){
  const L=E/16*k, hov=L*0.35, W=L*0.5, part=(prim,c,w,d,h,dx,dy,dz)=>obj(prim,c,w,d,h,{heading,...at(dx,dy,dz,w,d,h)});
  const Y=[255,194,61,1], K=[40,32,28,1];
  return {type:"point-3d",symbolLayers:[
    obj("cylinder",[255,194,61,0.3],L*1.3,L*1.3,L*0.03),                 // glow on the ground
    part("sphere",Y,W,W*0.6,W,0,-L*0.30,hov),                          // striped body, back to front
    part("sphere",K,W*0.96,W*0.5,W*0.96,0,-L*0.16,hov),
    part("sphere",Y,W*1.02,W*0.5,W*1.02,0,-L*0.02,hov),
    part("sphere",K,W*0.94,W*0.5,W*0.94,0,L*0.12,hov),
    part("sphere",Y,W*0.86,W*0.5,W*0.86,0,L*0.24,hov),
    part("sphere",K,W*0.62,W*0.55,W*0.62,0,L*0.4,hov+W*0.12),          // head
    part("sphere",[255,255,255,1],W*0.18,W*0.18,W*0.18, W*0.17,L*0.55,hov+W*0.35), // eyes
    part("sphere",[255,255,255,1],W*0.18,W*0.18,W*0.18,-W*0.17,L*0.55,hov+W*0.35),
    part("sphere",[235,245,255,0.75],W*0.95,W*0.55,W*0.1, W*0.5,0,hov+W*0.95),     // wings
    part("sphere",[235,245,255,0.75],W*0.95,W*0.55,W*0.1,-W*0.5,0,hov+W*0.95)
  ]};
}
function waspSym(color, body, heading=0){
  const S=E/18, hov=S*0.35, W=S*0.36, part=(prim,c,w,d,h,dx,dy,dz)=>obj(prim,c,w,d,h,{heading,...at(dx,dy,dz,w,d,h)});
  const K=[25,18,22,1], B=[...body,1];
  return {type:"point-3d",symbolLayers:[
    obj("cylinder",[color[0],color[1],color[2],0.4],S*1.2,S*1.2,S*0.03),   // colored ground ring: tells wasps apart
    part("cone",B,W*0.9,W*0.9,W*0.25,0,-S*0.5,hov+W*0.1),                 // little tail point
    part("sphere",B,W,W*1.3,W,0,-S*0.3,hov),                               // abdomen
    part("sphere",K,W*1.02,W*0.35,W*1.02,0,-S*0.3,hov),                    // stripe
    part("sphere",K,W*0.5,W*0.5,W*0.5,0,-S*0.05,hov+W*0.25),               // thin waist
    part("sphere",B,W*0.7,W*0.75,W*0.7,0,S*0.12,hov+W*0.15),               // thorax
    part("sphere",color,W*0.62,W*0.6,W*0.62,0,S*0.32,hov+W*0.25),          // colored head
    part("sphere",[255,255,255,1],W*0.2,W*0.2,W*0.2, W*0.17,S*0.42,hov+W*0.55),
    part("sphere",[255,255,255,1],W*0.2,W*0.2,W*0.2,-W*0.17,S*0.42,hov+W*0.55),
    part("sphere",[230,240,255,0.7],W*1.1,W*0.5,W*0.08, W*0.6,S*0.05,hov+W*0.9), // wings
    part("sphere",[230,240,255,0.7],W*1.1,W*0.5,W*0.08,-W*0.6,S*0.05,hov+W*0.9)
  ]};
}
const PETALS=[[255,122,182],[190,140,255],[255,255,255],[120,180,255],[255,150,90]];
const dotSym = i=>{ const s=E/70, c=PETALS[i%PETALS.length]; return {type:"point-3d",symbolLayers:[   // a little flower
    obj("cylinder",[90,170,80,1],s*0.12,s*0.12,s*0.7),                                                 // stem
    obj("cylinder",c,s*1.1,s*1.1,s*0.12,{anchor:"relative",anchorPosition:{x:0,y:0,z:-0.5-(s*0.7)/(s*0.12)}}), // petals
    obj("sphere",[255,200,40,1],s*0.5,s*0.5,s*0.4,{anchor:"relative",anchorPosition:{x:0,y:0,z:-0.5-(s*0.78)/(s*0.4)}}) // pollen center
]}; };
const beaconSym= ()=>{ const s=E/22, lift=(h,sz)=>({anchor:"relative",anchorPosition:{x:0,y:0,z:-0.5-h/sz}});
  return {type:"point-3d",symbolLayers:[                          // super flower: a giant sunflower-style bloom
    obj("cylinder",[255,215,80,0.35],s*2.6,s*2.6,s*0.04),              // golden glow on the ground
    obj("cylinder",[70,160,70,1],s*0.16,s*0.16,s*1.6),                 // tall stem
    obj("sphere",[90,180,80,1],s*0.7,s*0.3,s*0.12,lift(s*0.7,s*0.12)), // leaf
    obj("cylinder",[255,90,170,1],s*1.9,s*1.9,s*0.14,lift(s*1.6,s*0.14)),   // outer petals
    obj("cylinder",[255,200,60,1],s*1.3,s*1.3,s*0.18,lift(s*1.68,s*0.18)),  // inner petals
    obj("sphere",[130,80,40,1],s*0.8,s*0.8,s*0.45,lift(s*1.75,s*0.45)),     // big seed center
    obj("sphere",[255,250,200,1],s*0.3,s*0.3,s*0.3,lift(s*2.25,s*0.3))      // sparkle on top
  ]}; };
const barrierSym = h=>({type:"point-3d",symbolLayers:[            // a hedge blocks the street
    obj("cube",[60,130,60,1],E/20,E/60,E/55,{heading:h}),
    obj("sphere",[80,160,70,1],E/22,E/50,E/45,{heading:h})
]});
function waspLook(d,s){
  const h=bearingOf(d.dir||"up");
  return s==="fright"?waspSym(FRIGHT,[215,205,250],h) : s==="blink"?waspSym([255,255,255],[245,245,250],h) : waspSym(d.color,d.body,h);
}
