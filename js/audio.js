/* Beeline: audio
   Simple sound effects made with the Web Audio API (no sound files needed). */

let soundOn=true;
let AC=null;
function beep(f,d=0.06,type="square",vol=0.04,slide=0){
  if(!soundOn) return;
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    const o=AC.createOscillator(), g=AC.createGain(), t=AC.currentTime;
    o.type=type; o.frequency.setValueAtTime(f,t);
    if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(40,f+slide),t+d);
    g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.0001,t+d);
    o.connect(g).connect(AC.destination); o.start(t); o.stop(t+d+0.02);
  }catch(e){}
}
