'use strict';
// ─────────────────────────────────────────────
//  Fighter selection UI
// ─────────────────────────────────────────────
(function buildFighterUI(){
  const tabs = document.getElementById('fighter-tabs');
  const preview = document.getElementById('fighter-preview');
  if (!tabs || !preview) return;

  function renderPreview(){
    const f = selectedFighter;
    const b = f.bars || { speed:5, power:5, defense:5, stamina:5 };
    const bar = (lbl, key) => {
      const v = Math.max(0, Math.min(10, b[key] || 0));
      const pct = (v / 10) * 100;
      return '<div class="fp-stat"><span class="lbl">'+lbl+'</span>'
           + '<span class="meter"><span class="meter-fill" style="width:'+pct+'%"></span></span>'
           + '<span class="val">'+v+'</span></div>';
    };
    preview.innerHTML =
      '<div class="fp-head"><div class="fp-name">'+f.name+'</div></div>'
    + '<div class="fp-desc">'+f.desc+'</div>'
    + '<div class="fp-stats">'
    +   bar('SPEED','speed')
    +   bar('POWER','power')
    +   bar('DEFENSE','defense')
    +   bar('STAMINA','stamina')
    + '</div>';
  }

  function renderTabs(){
    tabs.innerHTML = '';
    FIGHTERS.forEach((f, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fighter-tab' + (f === selectedFighter ? ' active' : '');
      btn.textContent = f.name;
      btn.dataset.idx = i;
      btn.addEventListener('click', () => {
        selectedFighter = FIGHTERS[i];
        renderTabs();
        renderPreview();
      });
      tabs.appendChild(btn);
    });
  }

  renderTabs();
  renderPreview();
})();

// Spawn placeholder boxers so the title screen renders the ring with both fighters in view
setupRound(true);
state = 'title';
requestAnimationFrame(loop);
