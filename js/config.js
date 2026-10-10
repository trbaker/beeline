/* Beeline: config
   Data and tuning: cities, grid sizes, wasps and difficulty. Edit this file to change how the game plays. */

/* ---------- City definitions ----------
   rot = bearing (deg clockwise from true north) of the grid's "up" streets
   bu  = spacing between lines running "up" (metres), bv = spacing between cross streets
   These are approximations of each real street grid; tweak to snap tighter. */
const CITIES = [
  {name:"New York",        area:"Midtown Manhattan",   lat:40.7590, lon:-73.9890,  rot:29,  bu:270, bv:80, elev:15},
  {name:"Chicago",         area:"The Loop",            lat:41.8810, lon:-87.6290,  rot:0,   bu:120, bv:120, elev:180},
  {name:"Washington, D.C.",area:"Downtown",            lat:38.9010, lon:-77.0320,  rot:0,   bu:130, bv:120, elev:20},
  {name:"Philadelphia",    area:"Center City",         lat:39.9505, lon:-75.1650,  rot:0,   bu:140, bv:120, elev:15},
  {name:"Toronto",         area:"Financial District",  lat:43.6500, lon:-79.3840,  rot:-17, bu:170, bv:140, elev:90},
  {name:"San Francisco",   area:"Union Square",        lat:37.7880, lon:-122.4080, rot:0,   bu:125, bv:85, elev:40},
  {name:"Portland",        area:"Downtown",            lat:45.5180, lon:-122.6800, rot:0,   bu:82,  bv:82, elev:20},
  {name:"Barcelona",       area:"L'Eixample",          lat:41.3925, lon:2.1630,    rot:45,  bu:133, bv:133, elev:40},
  {name:"Salt Lake City",  area:"Downtown",            lat:40.7640, lon:-111.8900, rot:0,   bu:201, bv:201, elev:1300},
  {name:"Kyoto",           area:"Shijō–Karasuma",      lat:35.0037, lon:135.7596,  rot:0,   bu:120, bv:120, elev:45},
];
const ROUNDS = CITIES.length;

// Grid size for each round, in blocks [across, up]. Street lines = blocks + 1.
const GRIDS = [[2,3],[3,3],[3,4],[4,3],[4,4],[3,5],[4,5],[5,5],[4,6],[5,6]];

// The wasps (body = stripe color, color = head and ground ring). corner() is where each wanders to when not chasing.
const WASPS = [
  {name:"Zippy",   color:[185,40,40],   body:[185,105,15], corner:()=>[BX+0.5,BY+0.5]},
  {name:"Whizz",   color:[35,95,185],   body:[190,112,20], corner:()=>[-0.5,BY+0.5]},
  {name:"Dart",    color:[45,135,40],   body:[180,100,15], corner:()=>[BX+0.5,-0.5]},
  {name:"Jitters", color:[180,45,145],  body:[188,108,12], corner:()=>[-0.5,-0.5]},
  {name:"Zoomer",  color:[110,55,185],  body:[178,104,20], corner:()=>[CX,BY+1]}
];
const FRIGHT = [200,190,255]; // nervous, lavender
const SUPER_SIZE=2.2;   // how big the bee grows after eating a super flower

/* Difficulty: 2 = the original balance */
const DIFF = {
  // pMul: bee speed · dMul/dCap: wasp speed and its ceiling · fMul/fMin: super-bee time · drones/closures: added to the normal count
  // chase/scatter: seconds wasps spend hunting vs. wandering · release: delay before wasps leave the nest · lifeEvery: rounds per bonus life
  1:{name:"Easy",   note:"Slow, wandering wasps, long super-bee time, 7 lives", lives:7, maxLives:9, pMul:1.12, dMul:0.62, dCap:0.9,  fMul:2.2,  fMin:8,   drones:-2, closures:-99, chase:7,  scatter:9, release:2.2, lifeEvery:2},
  2:{name:"Normal", note:"Standard speed, 3 lives",                       lives:3, maxLives:5, pMul:1,    dMul:1,    dCap:1.48, fMul:1,    fMin:2.2, drones:0,  closures:0,   chase:18, scatter:5, release:1,   lifeEvery:3},
  3:{name:"Hard",   note:"Faster wasps, short super-bee time, 3 lives",     lives:3, maxLives:4, pMul:1,    dMul:1.15, dCap:1.7,  fMul:0.65, fMin:1.5, drones:1,  closures:2,   chase:18, scatter:5, release:1,   lifeEvery:3}
};
const EASE=0.9;   // every level 10% easier: wasps 10% slower and chase 10% less, super-bee time 10% longer
