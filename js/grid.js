/* Beeline: grid
   The street grid: size of the current round, which streets are blocked, and who can move where. */

let BX=5, BY=5, NX=6, NY=6, CX=2.5, CY=2.5, HOUSE=[];
function setGrid(r){
  [BX,BY]=GRIDS[(r-1)%GRIDS.length]; NX=BX+1; NY=BY+1; CX=BX/2; CY=BY/2;
  const a=Math.floor(CX), b=Math.ceil(CX), c=Math.max(1,Math.floor(CY)), d=Math.max(1,Math.ceil(CY));
  HOUSE=[[a,d],[b,d],[a,c],[b,c],[a,d]];   // the wasp nest, in the middle of the grid
}
const DV  = { up:[0,1], down:[0,-1], left:[-1,0], right:[1,0] };
const OPP = { up:"down", down:"up", left:"right", right:"left" };
const DIRS = ["up","left","down","right"];
const nid = (i,j)=> i + j*NX;
const ekey = (a,b)=> a<b ? a+"-"+b : b+"-"+a;
let closed = new Set();
function inGrid(i,j){ return i>=0 && j>=0 && i<NX && j<NY; }
function canMove(i,j,d){
  const ni=i+DV[d][0], nj=j+DV[d][1];
  return inGrid(ni,nj) && !closed.has(ekey(nid(i,j),nid(ni,nj)));
}
function gridValid(){
  for(let j=0;j<NY;j++) for(let i=0;i<NX;i++){
    if(DIRS.filter(d=>canMove(i,j,d)).length<2) return false;
  }
  const seen=new Set([0]), q=[[0,0]];
  while(q.length){ const [i,j]=q.pop();
    for(const d of DIRS){ if(!canMove(i,j,d)) continue; const ni=i+DV[d][0], nj=j+DV[d][1], k=nid(ni,nj);
      if(!seen.has(k)){ seen.add(k); q.push([ni,nj]); } } }
  return seen.size===NX*NY;
}
function genClosures(count){
  closed = new Set();
  const edges=[];
  for(let j=0;j<NY;j++) for(let i=0;i<NX;i++){
    if(i<NX-1) edges.push(ekey(nid(i,j),nid(i+1,j)));
    if(j<NY-1) edges.push(ekey(nid(i,j),nid(i,j+1)));
  }
  shuffle(edges);
  for(const k of edges){ if(closed.size>=count) break; closed.add(k); if(!gridValid()) closed.delete(k); }
}
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const r=Math.floor(Math.random()*(i+1)); [a[i],a[r]]=[a[r],a[i]]; } return a; }
