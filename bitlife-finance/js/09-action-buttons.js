// ════════════════════════════════════════════════════════════════
//  ACTION BUTTONS
// ════════════════════════════════════════════════════════════════

function showActionModal(title, desc, choices){
  const overlay=$('modal-overlay');
  $('m-icon').textContent='⚙️';
  $('m-tag').textContent='Action';$('m-tag').className='modal-tag fla';
  $('m-title').textContent=title;
  $('m-body').textContent=desc;
  $('m-result').style.display='none';
  const ch=$('m-choices');ch.innerHTML='';
  for(const c of choices){
    if(c.header){
      const h=document.createElement('div');
      h.textContent=c.header;
      h.style.cssText='font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;padding:6px 4px 2px;border-top:1px solid var(--border);margin-top:4px';
      ch.appendChild(h);
      continue;
    }
    const btn=document.createElement('button');btn.className='choice-btn';btn.textContent=c.text;
    btn.onclick=()=>{
      const res=c.fn();
      const rEl=$('m-result');rEl.style.display='block';rEl.textContent=res||'Done.';
      ch.innerHTML='<button class="choice-btn" onclick="closeModal()">OK</button>';
      const nw=calcNetWorth(GS.char,GS.inv);
      if(GS.nwHistory.length)GS.nwHistory[GS.nwHistory.length-1]=nw;
      updateUI(null,nw,nw);
    };
    ch.appendChild(btn);
  }
  const cancel=document.createElement('button');cancel.className='choice-btn';cancel.textContent='Cancel';
  cancel.onclick=closeModal;ch.appendChild(cancel);
  overlay.classList.add('open');
}

// ── Mini sparkline chart for asset cards ──
function drawMiniChart(canvas, history, up){
  if(!canvas) return;
  const dpr=window.devicePixelRatio||1;
  const W=canvas.clientWidth||220, H=50;
  canvas.width=W*dpr; canvas.height=H*dpr;
  const ctx=canvas.getContext('2d'); ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,W,H);
  if(!history||history.length<2){
    ctx.strokeStyle='#4a6a4a'; ctx.lineWidth=1; ctx.beginPath();
    ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.stroke();
    ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--muted');
    ctx.font='10px sans-serif'; ctx.textAlign='center';
    ctx.fillText('No history yet',W/2,H/2+14);
    return;
  }
  const mn=Math.min(...history), mx=Math.max(...history);
  const range=mx-mn||Math.abs(mn)*0.01||1;
  const pad=4;
  const pts=history.map((v,i)=>[i/(history.length-1)*W, H-pad-((v-mn)/range)*(H-pad*2)]);
  const col=up?'#00c853':'#ff3d3d';
  // fill gradient
  const grad=ctx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0, up?'rgba(0,200,83,.35)':'rgba(255,61,61,.35)');
  grad.addColorStop(1,'rgba(0,0,0,0)');
  ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i][0],pts[i][1]);
  ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath();
  ctx.fillStyle=grad; ctx.fill();
  // line
  ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i][0],pts[i][1]);
  ctx.strokeStyle=col; ctx.lineWidth=1.5; ctx.stroke();
  // end dot
  const last=pts[pts.length-1];
  ctx.beginPath(); ctx.arc(last[0],last[1],2.5,0,Math.PI*2);
  ctx.fillStyle=col; ctx.fill();
}

// ── Asset-grid modal for stocks ──
function showStockModal(){
  const inv=GS.inv, c=GS.char;
  const overlay=$('modal-overlay');
  $('modal-box').classList.add('wide');
  $('m-icon').textContent='📈';
  $('m-tag').textContent='Market'; $('m-tag').className='modal-tag fla';
  $('m-title').textContent='Stock Market';
  $('m-body').textContent=`Climate: ${inv.climate.toUpperCase()} · Cash: ${fmt$(c.checking)} · Prices update monthly.`;
  $('m-result').style.display='none';
  const ch=$('m-choices'); ch.innerHTML='';
  const grid=document.createElement('div'); grid.className='asset-grid';
  const cards=[];
  inv.stocks.forEach((s,idx)=>{
    const h=s.history||[s.price]; const prev=h.length>1?h[h.length-2]:s.price;
    const chg=prev>0?((s.price-prev)/prev*100):0;
    const pos=inv.portfolio[s.id];
    const owned=pos?pos.shares:0;
    const canAfford=c.checking>=s.price*10;
    const card=document.createElement('div'); card.className='asset-card'; card.setAttribute('data-stock-card', s.id);
    const defaultBuy = Math.max(100, Math.round(s.price*10));
    card.innerHTML=`
      <div class="ac-hdr"><div><div class="ac-name">${s.name}</div><div class="ac-ticker">${s.id} · ${s.sector||'stocks'}</div></div>
      <div style="text-align:right"><div class="ac-price">$${s.price.toFixed(2)}</div><div class="ac-chg ${chg>=0?'pos':'neg'}">${chg>=0?'+':''}${chg.toFixed(1)}%</div></div></div>
      <canvas class="ac-chart" id="ch-stk-${idx}"></canvas>
      <div class="ac-meta"><span>${owned?`Owned: ${owned} sh · ${fmt$(s.price*owned)}`:'Not held'}</span><span>1sh = $${s.price.toFixed(2)}</span></div>
      <div class="ac-actions">
        <input class="ac-buy-input" type="number" min="1" step="1" value="${defaultBuy}" data-buy-input="${s.id}" title="Dollar amount to invest">
        <button class="ac-btn buy" ${canAfford?'':'disabled'} data-buy="${s.id}">Buy $</button>
        <button class="ac-btn sell" ${owned?'':'disabled'} data-sell="${s.id}">Sell All</button>
      </div>`;
    grid.appendChild(card); cards.push({canvas:'ch-stk-'+idx, history:h, up:chg>=0});
  });
  ch.appendChild(grid);
  const closeBtn=document.createElement('button'); closeBtn.className='choice-btn'; closeBtn.textContent='Close';
  closeBtn.onclick=()=>{$('modal-box').classList.remove('wide'); closeModal();};
  ch.appendChild(closeBtn);
  function refreshStockCard(id){
    const s=inv.stocks.find(x=>x.id===id); if(!s) return;
    const card=grid.querySelector(`[data-stock-card="${id}"]`); if(!card) return;
    const pos=inv.portfolio[s.id]; const owned=pos?pos.shares:0;
    const meta=card.querySelector('.ac-meta');
    if(meta) meta.innerHTML=`<span>${owned?`Owned: ${owned} sh · ${fmt$(s.price*owned)}`:'Not held'}</span><span>1sh = $${s.price.toFixed(2)}</span>`;
    const sellBtn=card.querySelector('.ac-btn.sell'); if(sellBtn) sellBtn.disabled=!owned;
  }
  function refreshStockAffordability(){
    $('m-body').textContent=`Climate: ${inv.climate.toUpperCase()} · Cash: ${fmt$(c.checking)} · Prices update monthly.`;
    inv.stocks.forEach(stk=>{
      const b=grid.querySelector(`[data-buy="${stk.id}"]`);
      if(b) b.disabled=c.checking<stk.price;
    });
  }
  grid.onclick=(e)=>{
    const buyId=e.target.getAttribute('data-buy');
    const sellId=e.target.getAttribute('data-sell');
    if(buyId){
      const s=inv.stocks.find(x=>x.id===buyId);
      const input=grid.querySelector(`[data-buy-input="${buyId}"]`);
      const wanted=Math.max(0, Math.floor(parseFloat(input?.value)||0));
      if(wanted<s.price){ showToast(`Need at least $${s.price.toFixed(2)} for 1 share.`); return; }
      if(c.checking<wanted){ showToast('Not enough cash.'); return; }
      const shares=Math.floor(wanted / s.price);
      const cost=Math.round(shares * s.price);
      if(shares<1){ showToast('Amount buys 0 shares.'); return; }
      c.checking-=cost;
      if(!inv.portfolio[s.id]) inv.portfolio[s.id]={shares:0,avgCost:0};
      const p=inv.portfolio[s.id]; p.avgCost=(p.avgCost*p.shares+cost)/(p.shares+shares); p.shares+=shares;
      showToast(`Bought ${shares} ${s.id} for ${fmt$(cost)}`);
      refreshStockCard(buyId); refreshStockAffordability();
    }else if(sellId){
      const s=inv.stocks.find(x=>x.id===sellId); const p=inv.portfolio[sellId]; if(!p) return;
      const proceeds=Math.round(s.price*p.shares);
      const cg=Math.round((s.price-p.avgCost)*p.shares);
      const tax=cg>0?Math.round(cg*0.15):0;
      c.checking+=proceeds-tax;
      delete inv.portfolio[sellId];
      showToast(`Sold ${sellId} for ${fmt$(proceeds-tax)}`);
      refreshStockCard(sellId); refreshStockAffordability();
    }
  };
  overlay.classList.add('open');
  requestAnimationFrame(()=>cards.forEach(cd=>drawMiniChart($(cd.canvas), cd.history, cd.up)));
}

// ── Asset-grid modal for crypto ──
function showCryptoModal(){
  const inv=GS.inv, c=GS.char;
  const overlay=$('modal-overlay');
  $('modal-box').classList.add('wide');
  $('m-icon').textContent='₿';
  $('m-tag').textContent='Market'; $('m-tag').className='modal-tag fla';
  $('m-title').textContent='Crypto Market';
  $('m-body').textContent=`Climate: ${inv.climate.toUpperCase()} · Cash: ${fmt$(c.checking)} · Extremely volatile. Prices update monthly.`;
  $('m-result').style.display='none';
  const ch=$('m-choices'); ch.innerHTML='';
  const grid=document.createElement('div'); grid.className='asset-grid';
  const cards=[];
  inv.cryptos.forEach((coin,idx)=>{
    const h=coin.history||[coin.price]; const prev=h.length>1?h[h.length-2]:coin.price;
    const chg=prev>0?((coin.price-prev)/prev*100):0;
    const pos=inv.cryptoHeld[coin.id];
    const owned=pos?pos.coins:0;
    const canAfford=c.checking>=1000;
    const priceLbl=coin.price>=1000?'$'+(coin.price/1000).toFixed(2)+'k':coin.price>=1?'$'+coin.price.toFixed(2):'$'+coin.price.toFixed(5);
    const card=document.createElement('div'); card.className='asset-card'; card.setAttribute('data-crypto-card', coin.id);
    card.innerHTML=`
      <div class="ac-hdr"><div><div class="ac-name">${coin.name}</div><div class="ac-ticker">${coin.id}</div></div>
      <div style="text-align:right"><div class="ac-price">${priceLbl}</div><div class="ac-chg ${chg>=0?'pos':'neg'}">${chg>=0?'+':''}${chg.toFixed(1)}%</div></div></div>
      <canvas class="ac-chart" id="ch-cry-${idx}"></canvas>
      <div class="ac-meta"><span>${owned?`Owned: ${owned.toFixed(4)} · ${fmt$(coin.price*owned)}`:'Not held'}</span><span>1 = ${priceLbl}</span></div>
      <div class="ac-actions">
        <input class="ac-buy-input" type="number" min="1" step="1" value="1000" data-buy-input="${coin.id}" title="Dollar amount to invest">
        <button class="ac-btn buy" ${canAfford?'':'disabled'} data-buy="${coin.id}">Buy $</button>
        <button class="ac-btn sell" ${owned?'':'disabled'} data-sell="${coin.id}">Sell All</button>
      </div>`;
    grid.appendChild(card); cards.push({canvas:'ch-cry-'+idx, history:h, up:chg>=0});
  });
  ch.appendChild(grid);
  const closeBtn=document.createElement('button'); closeBtn.className='choice-btn'; closeBtn.textContent='Close';
  closeBtn.onclick=()=>{$('modal-box').classList.remove('wide'); closeModal();};
  ch.appendChild(closeBtn);
  function refreshCryptoCard(id){
    const coin=inv.cryptos.find(x=>x.id===id); if(!coin) return;
    const card=grid.querySelector(`[data-crypto-card="${id}"]`); if(!card) return;
    const pos=inv.cryptoHeld[coin.id]; const owned=pos?pos.coins:0;
    const priceLbl=coin.price>=1000?'$'+(coin.price/1000).toFixed(2)+'k':coin.price>=1?'$'+coin.price.toFixed(2):'$'+coin.price.toFixed(5);
    const meta=card.querySelector('.ac-meta');
    if(meta) meta.innerHTML=`<span>${owned?`Owned: ${owned.toFixed(4)} · ${fmt$(coin.price*owned)}`:'Not held'}</span><span>1 = ${priceLbl}</span>`;
    const sellBtn=card.querySelector('.ac-btn.sell'); if(sellBtn) sellBtn.disabled=!owned;
  }
  function refreshCryptoAffordability(){
    $('m-body').textContent=`Climate: ${inv.climate.toUpperCase()} · Cash: ${fmt$(c.checking)} · Extremely volatile. Prices update monthly.`;
    inv.cryptos.forEach(coin=>{
      const b=grid.querySelector(`[data-buy="${coin.id}"]`);
      if(b) b.disabled=c.checking<1;
    });
  }
  grid.onclick=(e)=>{
    const buyId=e.target.getAttribute('data-buy');
    const sellId=e.target.getAttribute('data-sell');
    if(buyId){
      const coin=inv.cryptos.find(x=>x.id===buyId);
      const input=grid.querySelector(`[data-buy-input="${buyId}"]`);
      const wanted=Math.max(0, Math.floor(parseFloat(input?.value)||0));
      if(wanted<1){ showToast('Enter a dollar amount.'); return; }
      if(c.checking<wanted){ showToast('Not enough cash.'); return; }
      const coins=wanted/coin.price;
      c.checking-=wanted;
      if(!inv.cryptoHeld[coin.id]) inv.cryptoHeld[coin.id]={coins:0,avgCost:0};
      const p=inv.cryptoHeld[coin.id]; p.avgCost=(p.avgCost*p.coins+wanted)/(p.coins+coins); p.coins+=coins;
      showToast(`Bought ${coins.toFixed(4)} ${coin.id} for ${fmt$(wanted)}`);
      refreshCryptoCard(buyId); refreshCryptoAffordability();
    }else if(sellId){
      const coin=inv.cryptos.find(x=>x.id===sellId); const p=inv.cryptoHeld[sellId]; if(!p) return;
      const proceeds=coin.price*p.coins;
      const tax=proceeds>p.avgCost*p.coins?Math.round((proceeds-p.avgCost*p.coins)*0.15):0;
      c.checking+=proceeds-tax;
      delete inv.cryptoHeld[sellId];
      showToast(`Sold ${sellId} for ${fmt$(proceeds-tax)}`);
      refreshCryptoCard(sellId); refreshCryptoAffordability();
    }
  };
  overlay.classList.add('open');
  requestAnimationFrame(()=>cards.forEach(cd=>drawMiniChart($(cd.canvas), cd.history, cd.up)));
}

// Work tab (left panel) — populated by renderWorkTab(); buttons open the same applyForJob / runSideHustle
let _wkSideOffers = null;
function refreshSideOffers(){ _wkSideOffers = [...SIDE_HUSTLES].sort(()=>Math.random()-0.5).slice(0,6); }
function renderWorkTab(){
  const c = GS.char;
  if(!c) return;
  // Header summary
  setText('wk-job', c.inSchool?'In School':c.retired?'Retired':c.employed?c.jobTitle:'Unemployed');
  setText('wk-sector', c.jobSector ? c.jobSector.charAt(0).toUpperCase()+c.jobSector.slice(1) : '—');
  setText('wk-salary', c.employed ? fmt$(c.salary)+'/yr' : '$0/yr');
  setText('wk-side', fmt$(c.sideHustleIncome||0)+'/yr');
  setText('wk-years', c.yearsAtJob||0);
  const perfLabels=['','','Struggling','Fair','Good','Very Good','Excellent','Outstanding'];
  setText('wk-perf', c.employed ? (perfLabels[Math.round(c.performance/14)]||'Good') : '—');

  // Careers list
  const carEl = $('wk-careers-list');
  if(carEl){
    if(c.inSchool){ carEl.innerHTML = '<p style="color:var(--muted);font-size:11px">Finish school first!</p>'; }
    else if(c.retired){ carEl.innerHTML = '<p style="color:var(--muted);font-size:11px">You\'re retired. Enjoy life!</p>'; }
    else {
      const jobs = (typeof getBalancedJobChoices === 'function') ? getBalancedJobChoices(c) : [];
      if(!jobs.length){
        carEl.innerHTML = '<p style="color:var(--muted);font-size:11px">No jobs available — get more education.</p>';
      } else {
        carEl.innerHTML = jobs.map((j,i) => `
          <button class="wk-apply-btn" data-job-idx="${i}" style="display:block;width:100%;text-align:left;padding:10px;margin-bottom:6px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);cursor:pointer;font-size:12px">
            <div style="font-weight:700;color:var(--gold)">${j.name} <span style="color:var(--muted);font-weight:400;font-size:10px">· ${j.sector} · T${j.tier}</span></div>
            <div style="color:var(--muted);font-size:11px;margin-top:2px">${fmt$(j.min)}–${fmt$(j.max)}/yr</div>
          </button>`).join('');
        carEl.querySelectorAll('.wk-apply-btn').forEach(btn => {
          btn.onclick = () => {
            const idx = +btn.dataset.jobIdx;
            const job = jobs[idx];
            applyForJob(c, job);
            showToast(`Hired as ${job.name}! ${fmt$(c.salary)}/yr`);
            renderWorkTab();
            updateUI();
          };
        });
      }
    }
  }

  // Side hustles list
  if(!_wkSideOffers) refreshSideOffers();
  const sideEl = $('wk-side-list');
  if(sideEl){
    sideEl.innerHTML = _wkSideOffers.map((h,i) => {
      const statNote = h.stat==='smarts'?' · smarts':h.stat==='looks'?' · looks':'';
      const costNote = h.cost>0?`$${(h.cost/1000).toFixed(1)}k start`:'free';
      return `<button class="wk-hustle-btn" data-hustle-idx="${i}" style="display:block;width:100%;text-align:left;padding:10px;margin-bottom:6px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);cursor:pointer;font-size:12px">
        <div style="font-weight:700">${h.icon} ${h.name}</div>
        <div style="color:var(--muted);font-size:11px;margin-top:2px">${costNote}${statNote}</div>
      </button>`;
    }).join('');
    sideEl.querySelectorAll('.wk-hustle-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = +btn.dataset.hustleIdx;
        const result = runSideHustle(_wkSideOffers[idx]);
        showToast(result);
        renderWorkTab();
        updateUI();
      };
    });
  }
  const refBtn = $('wk-side-refresh');
  if(refBtn){ refBtn.onclick = () => { refreshSideOffers(); renderWorkTab(); }; }
}
// Work-tab subtab switching (Careers / Side Projects)
document.addEventListener('click', (e) => {
  const t = e.target.closest('.wk-tab-btn');
  if(!t) return;
  document.querySelectorAll('.wk-tab-btn').forEach(b => {
    const active = b === t;
    b.style.background = active ? 'var(--bg3)' : 'transparent';
    b.style.borderBottomColor = active ? 'var(--gold)' : 'transparent';
    b.style.color = active ? 'var(--gold)' : 'var(--muted)';
    b.classList.toggle('active', active);
  });
  $('wk-careers-pane').style.display = t.dataset.wktab === 'careers' ? 'block' : 'none';
  $('wk-side-pane').style.display = t.dataset.wktab === 'side' ? 'block' : 'none';
});

