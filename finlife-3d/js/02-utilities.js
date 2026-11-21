// ════════════════════════════════════════════════════════════════
//  UTILITIES
// ════════════════════════════════════════════════════════════════

const ri = (lo,hi) => Math.floor(Math.random()*(hi-lo+1))+lo;
const rf = (lo,hi) => Math.random()*(hi-lo)+lo;
const clamp = (v,lo,hi) => Math.max(lo,Math.min(hi,v));
const fmt$ = n => {
  if(n===undefined||n===null) return '$0';
  const abs = Math.abs(n);
  const sign = n<0?'-':'';
  if(abs>=1e9) return sign+'$'+(abs/1e9).toFixed(1)+'B';
  if(abs>=1e6) return sign+'$'+(abs/1e6).toFixed(1)+'M';
  if(abs>=1e3) return sign+'$'+Math.round(abs/100)/10+'k';
  return sign+'$'+Math.round(abs).toLocaleString();
};
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
const pct = p => Math.random()<p;
function randn(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}

