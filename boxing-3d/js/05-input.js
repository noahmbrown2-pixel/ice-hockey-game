'use strict';
// ─────────────────────────────────────────────
//  Input
// ─────────────────────────────────────────────
const keys = {};
const keyEdge = {}; // single-frame edge-triggered presses for punch keys
const PUNCH_KEYS = Object.keys(KEY_PUNCH);
const RESERVED = new Set(['w','a','s','d',' ','p', ...PUNCH_KEYS]);

window.addEventListener('keydown', e => {
  ensureAudio();
  const k = e.key.toLowerCase();
  if (RESERVED.has(k)) e.preventDefault();
  if (k === 'p' && state === 'fight') togglePause();
  if (!keys[k]) keyEdge[k] = true;
  keys[k] = true;
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

document.querySelectorAll('#touch-controls .touch-btn[data-tk]').forEach(btn => {
  const tk = btn.dataset.tk;
  btn.addEventListener('touchstart', e => { e.preventDefault(); ensureAudio(); if (!keys[tk]) keyEdge[tk] = true; keys[tk] = true; });
  btn.addEventListener('touchend',   e => { e.preventDefault(); keys[tk] = false; });
  btn.addEventListener('touchcancel',e => { keys[tk] = false; });
  // Mouse fallback for testing
  btn.addEventListener('mousedown', e => { e.preventDefault(); ensureAudio(); if (!keys[tk]) keyEdge[tk] = true; keys[tk] = true; });
  btn.addEventListener('mouseup',   e => { e.preventDefault(); keys[tk] = false; });
  btn.addEventListener('mouseleave',e => { keys[tk] = false; });
});

function consumeEdge(k){
  if (keyEdge[k]){ keyEdge[k] = false; return true; }
  return false;
}

function togglePause(){
  paused = !paused;
  const el = document.getElementById('pause-screen');
  el.style.display = paused ? 'flex' : 'none';
}

