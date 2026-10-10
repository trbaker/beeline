/* Beeline: ui
   On-screen messages, the score bar, difficulty switch, and the side buttons (pause, see-through, look around, camera view, sound). */

/* ---------- Messages and score bar ---------- */
const bannerEl=document.getElementById("banner"), signEl=document.getElementById("sign");
function banner(html){ signEl.innerHTML=html; bannerEl.classList.remove("hidden"); }
function hideBanner(){ bannerEl.classList.add("hidden"); }
let toastT; function toast(msg){ const t=document.getElementById("toast"); t.textContent=msg; t.style.display="block"; clearTimeout(toastT); toastT=setTimeout(()=>t.style.display="none",2200); }
function updateHud(){
  document.getElementById("hCity").textContent=city.name;
  document.getElementById("hArea").textContent=`${city.area} · ${diffCfg().name}`;
  document.getElementById("hRound").textContent=`${round}/${ROUNDS}`;
  document.getElementById("hScore").textContent=score.toLocaleString();
  document.getElementById("hDots").textContent=dotsLeft;
  document.getElementById("lives").innerHTML="<i></i>".repeat(Math.max(0,lives));
}

/* ---------- Difficulty switch ---------- */
function setDifficulty(n){
  difficulty=n;
  document.querySelectorAll("[data-diff]").forEach(b=>b.setAttribute("aria-pressed", +b.dataset.diff===n));
  document.querySelectorAll("#diffNote").forEach(el=>el.textContent=diffCfg().note);
}
document.addEventListener("click",e=>{ const b=e.target.closest("[data-diff]"); if(b) setDifficulty(+b.dataset.diff); });
const diffHTML=()=>`<div class="diffrow"><span class="lbl">Difficulty</span><div class="diff" role="group" aria-label="Difficulty">${
  [1,2,3].map(n=>`<button data-diff="${n}" aria-pressed="${n===difficulty}">${DIFF[n].name}</button>`).join("")
}</div><span class="lbl" id="diffNote">${diffCfg().note}</span></div>`;

/* ---------- Buttons ---------- */
let pausedFrom=null;
function togglePause(){
  if(state==="playing"){ pausedFrom="playing"; state="paused"; document.getElementById("bPause").textContent="Resume";
    banner(`<div class="kicker">Paused</div><h1>${city.name}</h1><div class="row"><button class="btn" id="bResume">Resume</button></div>`);
    document.getElementById("bResume").onclick=togglePause; }
  else if(state==="paused"){ state=pausedFrom; pausedFrom=null; document.getElementById("bPause").textContent="Pause"; hideBanner(); setLook(false); }
}
document.getElementById("bPause").onclick=togglePause;
document.getElementById("bXray").onclick=e=>{ xray=!xray; e.currentTarget.setAttribute("aria-pressed",xray); applyXray(); };
/* Standard SceneView navigation tools, shown only while looking around */
let navWidgets=null;
function showNavTools(on){
  if(on){
    if(!navWidgets){
      navWidgets=[
        new esri.Zoom({view}),
        new esri.Home({view}),
        new esri.NavigationToggle({view}),   // switch drag between pan and rotate
        new esri.Compass({view})             // click to face north
      ];
      navWidgets.fullscreen=new esri.Fullscreen({view, element:document.body});
    }
    navWidgets[1].viewpoint={ camera: view.camera.clone() };  // Home returns to the game view of this city
    view.ui.padding={ top:70, right:12, bottom:16, left:12 };
    view.ui.add(navWidgets, "top-right");
    view.ui.add(navWidgets.fullscreen, "bottom-right");
  } else if(navWidgets){
    view.ui.remove(navWidgets); view.ui.remove(navWidgets.fullscreen);
  }
  document.body.classList.toggle("looking", on);
}
function setLook(on){
  if(on) showNavTools(true);   // capture Home before the camera moves
  navLocked=!on; touch.classList.toggle("off", on); if(on) camLive=false;
  if(!on) showNavTools(false);
  const b=document.getElementById("bLook"); b.setAttribute("aria-pressed",on); b.textContent=on?"Back to the game view":"Look around";
  if(!on && state!=="title") frameCamera(900);
}
document.getElementById("bLook").onclick=()=>{
  const on=navLocked;
  if(on && state==="playing"){ togglePause(); hideBanner(); toast("Paused while you look around. Drag, pinch or scroll the map."); }
  setLook(on);
  if(!on && state==="paused") togglePause();
};
function setViewMode(m){
  if(m===viewMode) return; viewMode=m; want=null;
  document.querySelectorAll("#viewToggle button[data-v]").forEach(b=>b.setAttribute("aria-pressed", b.dataset.v===m));
  toast(m==="fp" ? "First person: up flies forward, left and right turn, down turns around." : "Bird's-eye view");
  if(player && navLocked && state!=="loading" && state!=="title") frameCamera(800);
}
document.querySelectorAll("#viewToggle button[data-v]").forEach(b=>b.onclick=()=>setViewMode(b.dataset.v));
document.getElementById("bSound").onclick=e=>{ soundOn=!soundOn; e.currentTarget.setAttribute("aria-pressed",soundOn); e.currentTarget.textContent=soundOn?"Sound on":"Sound off"; };
document.addEventListener("visibilitychange",()=>{ if(document.hidden && state==="playing") togglePause(); });
addEventListener("resize",()=>{ if(!player) return; const old=turn; computeTurn(); if(old!==turn && navLocked) frameCamera(600); });
