/* Beeline: geo
   Turns grid positions into real longitude/latitude for the current city, and picks the screen orientation. */

let city = CITIES[0], E = 600, turn = 0;
function gridEN(gx,gy){
  const u=(gx-CX)*city.bu, v=(gy-CY)*city.bv, t=city.rot*Math.PI/180;
  return [ u*Math.cos(t) + v*Math.sin(t), -u*Math.sin(t) + v*Math.cos(t) ];
}
const enLL=(e,n)=>[ city.lon + e/(111320*Math.cos(city.lat*Math.PI/180)), city.lat + n/110540 ];
function toLonLat(gx,gy){ const [e,n]=gridEN(gx,gy); return enLL(e,n); }
const pt = (gx,gy,z=0)=>{ const [lon,lat]=toLonLat(gx,gy); return new esri.Point({longitude:lon, latitude:lat, z}); };
const bearingOf = d => city.rot + ({up:0,right:90,down:180,left:270}[d]);
function computeTurn(){
  const portrait = innerHeight > innerWidth;
  const wU=BX*city.bu, hV=BY*city.bv;   // real size of this round's grid
  const tallU = wU > hV*1.25, tallV = hV > wU*1.25;
  turn = (portrait && tallU) || (!portrait && tallV) ? 90 : 0;
}
