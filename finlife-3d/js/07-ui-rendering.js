// ════════════════════════════════════════════════════════════════
//  UI RENDERING
// ════════════════════════════════════════════════════════════════

function $(id){return document.getElementById(id)}
function setText(id,v){const el=$(id);if(el)el.textContent=v}

function updateUI(fin, prevNW, nw){
  const c=GS.char, inv=GS.inv;

  // Sponsors button: always visible next to Education, disabled until $500k biz value
  const spBtn = $('btn-sponsors');
  if(spBtn){
    const unlocked = sponsorsUnlocked(inv);
    spBtn.disabled = !unlocked;
    spBtn.title = unlocked ? 'Browse sponsorship deals' : 'Unlocks at $500k total business value';
    if(unlocked && (inv.sponsors||[]).length){
      spBtn.innerHTML = `<span class="aico">🤝</span>Sponsors (${inv.sponsors.length})`;
    } else if(unlocked){
      spBtn.innerHTML = `<span class="aico">🤝</span>Sponsors`;
    } else {
      spBtn.innerHTML = `<span class="aico">🔒</span>Sponsors`;
    }
  }

  // Stats bar
  setText('char-name',c.name);
  setText('char-age-job',`Age ${ageDisplay(c)}${c.employed?` · ${c.jobTitle}`:c.inSchool?' · Student':' · Unemployed'}`);
  $('bar-health').style.width=c.health+'%';$('val-health').textContent=Math.round(c.health);
  $('bar-happy').style.width=c.happiness+'%';$('val-happy').textContent=Math.round(c.happiness);
  $('bar-smarts').style.width=c.smarts+'%';$('val-smarts').textContent=Math.round(c.smarts);

  const nwEl=$('nw-value'); nwEl.textContent=fmt$(nw);
  nwEl.className='pos '+(nw>=0?'pos':'neg');
  const delta=nw-prevNW;
  const dEl=$('nw-delta'); dEl.textContent=(delta>=0?'+':'')+fmt$(delta)+' this year';
  dEl.className=delta>=0?'pos':'neg';

  // Life tab
  setText('li-name',c.name); setText('li-age',ageDisplay(c));
  setText('li-edu',EDU_LABELS[c.education]||(c.inSchool?`Studying ${EDU_LABELS[c.schoolType]||''}`:'-'));
  const relLabels={single:'Single',dating:`Dating ${c.spouseName||''}`,married:`Married to ${c.spouseName||''}`,divorced:'Divorced',widowed:'Widowed'};
  setText('li-rel',relLabels[c.relationship]||c.relationship);
  setText('li-kids',c.kids);
  setText('li-job',c.inSchool?'In School':c.employed?c.jobTitle:'Unemployed');
  setText('li-salary',c.employed?fmt$(c.salary)+'/yr':'$0/yr');
  setText('li-side',fmt$(c.sideHustleIncome||0)+'/yr');
  setText('li-total-inc',fmt$((c.employed?c.salary:0)+(c.sideHustleIncome||0))+'/yr');
  setText('li-yrs',c.yearsAtJob||0);
  const perfLabels=['','','Struggling','Fair','Good','Very Good','Excellent','Outstanding'];
  setText('li-perf',perfLabels[Math.round(c.performance/14)]||'Good');
  if(c.employed){
    const m=c.bossMorale||c.performance||50;
    let tag='Safe';
    if(m>=75) tag='Likely Raise';
    else if(m<=30) tag='At Risk';
    else if(m<=50) tag='Cautious';
    setText('li-morale',`${Math.round(m)}% · ${tag}`);
  } else setText('li-morale','—');

  // Work tab
  if(typeof renderWorkTab === 'function') renderWorkTab();

  // Finances tab
  setText('fi-check',fmt$(c.checking));
  setText('fi-save',fmt$(c.savings));
  setText('fi-hy',fmt$(c.highYield));
  setText('fi-liq',fmt$(c.checking+c.savings+c.highYield));
  if(fin){
    setText('cf-gross',fmt$(fin.gross));
    setText('cf-tax','-'+fmt$(fin.taxes));
    setText('cf-exp','-'+fmt$(fin.livingCost));
    setText('cf-debt','-'+fmt$(fin.debtPay));
    const netEl=$('cf-net'); netEl.textContent=fmt$(fin.annSavings); netEl.className='ir-value '+(fin.annSavings>=0?'pos':'neg');
    const gross=fin.gross||1; const savePct=Math.max(0,Math.min(100,((fin.annSavings/gross)*100)));
    $('cf-bar').style.width=savePct+'%';
    $('cf-bar').className='cf-fill '+(fin.annSavings>=0?'pos':'neg');
  }
  setText('d-student',fmt$(c.studentDebt||0));
  setText('d-cc',fmt$(c.creditCards||0));
  setText('d-loans',fmt$(Math.max(0,c.debt-(c.studentDebt||0)-(c.creditCards||0))));
  setText('d-total',fmt$(c.debt));
  // Deferred expenses
  const defEl=$('d-deferred');
  if(defEl){
    const pending=c.pendingExpenses||[];
    if(!pending.length){defEl.innerHTML='<p style="color:var(--muted);font-size:11px">No deferred expenses.</p>';}
    else{defEl.innerHTML=pending.map(e=>`<div class="info-row"><span class="ir-label">${e.icon} ${e.name}</span><span class="ir-value neg">${fmt$(e.cost)} <span style="color:var(--muted);font-size:10px">(${e.monthsLeft}mo left)</span></span></div>`).join('');}
  }
  drawCreditDial(c.creditScore);

  // Invest tab
  const stVal=stockPortfolioValue(inv); const crVal=cryptoPortfolioValue(inv);
  const retVal=totalRetirement(inv);
  setText('pf-stocks',fmt$(stVal));
  setText('pf-etfs','$0'); // merged into stocks
  setText('pf-crypto',fmt$(crVal));
  setText('pf-retire',fmt$(retVal));
  setText('pf-total',fmt$(stVal+crVal+retVal));
  $('mkt-badge').textContent='· Market: '+inv.climate.toUpperCase();
  renderStocksTable(inv);
  renderCryptoGrid(inv);
  setText('ret-401k',fmt$(inv.k401));
  setText('ret-ira',fmt$(inv.ira));
  setText('ret-roth',fmt$(inv.roth));
  $('ret-bar').style.width=Math.min(100,(retVal/1000000)*100)+'%';

  // Assets tab
  const liquid=c.checking+c.savings+c.highYield;
  const investTotal=stVal+crVal+retVal;
  const reEq=totalPropertyEquity(inv); const bizVal=totalBizValue(inv);
  const totalAssets=liquid+investTotal+reEq+bizVal;
  const totalDebt=c.debt+inv.properties.reduce((s,p)=>s+p.debt,0);
  setText('as-liquid',fmt$(liquid)); setText('as-invest',fmt$(investTotal));
  setText('as-re-eq',fmt$(reEq)); setText('as-biz',fmt$(bizVal));
  setText('as-assets',fmt$(totalAssets)); setText('as-liab',fmt$(totalDebt));
  setText('as-nw',fmt$(nw));
  renderProperties(inv); renderBusinesses(inv); renderBelongings(c);
  renderBusinessTab();

  drawNetWorthChart();
  renderInbox();
}

function resaleValue(item, c){
  const ageMonths = Math.max(0, (c.monthAge||0) - (item.purchasedAt||0));
  // First month: 70% resale; drop 3% per month; floor at 15% of cost
  const factor = Math.max(0.15, 0.70 - ageMonths*0.03);
  return Math.max(1, Math.round(item.cost * factor));
}

function renderBelongings(c){
  const el=$('belongings-list'); if(!el) return;
  const items=c.belongings||[];
  if(!items.length){
    el.innerHTML='<p style="color:var(--muted);font-size:12px">Nothing to sell. Monthly expense items you buy will show up here.</p>';
    return;
  }
  el.innerHTML = items.map((b,i)=>{
    const resale = resaleValue(b, c);
    const ageM = Math.max(0, (c.monthAge||0) - (b.purchasedAt||0));
    return `<div class="info-row" style="align-items:center">
      <span class="ir-label">${b.icon} ${b.name} <span style="color:var(--muted);font-size:10px">· ${ageM}mo old · paid ${fmt$(b.cost)}</span></span>
      <span style="display:flex;gap:6px;align-items:center">
        <span class="ir-value pos">${fmt$(resale)}</span>
        <button class="choice-btn" style="padding:4px 10px;font-size:11px;margin:0" onclick="sellBelonging('${b.id}')">Sell</button>
      </span>
    </div>`;
  }).join('');
}

function sellBelonging(id){
  const c=GS.char; if(!c||!c.belongings) return;
  const idx=c.belongings.findIndex(b=>b.id===id); if(idx<0) return;
  const item=c.belongings[idx];
  const resale=resaleValue(item, c);
  c.checking += resale;
  c.belongings.splice(idx,1);
  logEvent(`Sold ${item.icon} ${item.name} for ${fmt$(resale)} (paid ${fmt$(item.cost)}).`, 'info');
  showToast(`Sold ${item.name} for ${fmt$(resale)}`);
  saveGame();
  renderBelongings(c);
  setText('fi-check',fmt$(c.checking));
}

function renderStocksTable(inv){
  const held=Object.entries(inv.portfolio);
  if(!held.length){$('stocks-table-wrap').innerHTML='<p style="color:var(--muted);font-size:12px">No stocks owned.</p>';return;}
  let h='<table class="stock-table"><thead><tr><th>Ticker</th><th>Shares</th><th>Price</th><th>Change</th><th>Value</th></tr></thead><tbody>';
  for(const[id,pos]of held){
    const s=inv.stocks.find(x=>x.id===id);if(!s)continue;
    const hist=s.history;const prev=hist.length>1?hist[hist.length-2]:s.price;
    const chg=((s.price-prev)/prev*100).toFixed(1);
    const val=s.price*pos.shares;
    const cls=parseFloat(chg)>=0?'chg-pos':'chg-neg';
    h+=`<tr><td>${id}</td><td>${pos.shares}</td><td>$${s.price.toFixed(2)}</td><td class="${cls}">${parseFloat(chg)>=0?'+':''}${chg}%</td><td>${fmt$(val)}</td></tr>`;
  }
  $('stocks-table-wrap').innerHTML=h+'</tbody></table>';
}

function renderCryptoGrid(inv){
  const held=Object.entries(inv.cryptoHeld);
  if(!held.length){$('crypto-grid').innerHTML='<p style="color:var(--muted);font-size:12px;grid-column:1/-1">No crypto owned.</p>';return;}
  let h='';
  for(const[id,pos]of held){
    const c=inv.cryptos.find(x=>x.id===id);if(!c)continue;
    const val=c.price*pos.coins;
    h+=`<div class="crypto-card"><div class="cc-name">${c.name}</div><div class="cc-price">${fmt$(val)}</div><div class="cc-hold">${pos.coins.toFixed(4)} coins @ $${c.price.toFixed(2)}</div></div>`;
  }
  $('crypto-grid').innerHTML=h;
}

function renderProperties(inv){
  if(!inv.properties.length){$('prop-list').innerHTML='<p style="color:var(--muted);font-size:12px">No properties owned.</p>';return;}
  $('prop-list').innerHTML=inv.properties.map(p=>{
    const tag=p.livedIn?' 🏡':p.rented?' 💰':'';
    return `<div class="info-row"><span class="ir-label">${p.name}${tag}</span><span class="ir-value pos">${fmt$(p.value-p.debt)} equity</span></div>`;
  }).join('');
}
function renderBusinesses(inv){
  if(!inv.businesses.length){$('biz-list').innerHTML='<p style="color:var(--muted);font-size:12px">No businesses owned.</p>';return;}
  $('biz-list').innerHTML=inv.businesses.map(b=>{
    const emp=(b.employees||[]).length;
    const empNote=emp>0?` · 👥 ${emp}`:'';
    return `<div class="info-row"><span class="ir-label">${b.name}${empNote}</span><span class="ir-value ${b.profit>=0?'pos':'neg'}">${fmt$(b.value)} value</span></div>`;
  }).join('');
}

function drawCreditDial(score){
  const canvas=$('credit-canvas'); if(!canvas)return;
  const ctx=canvas.getContext('2d');
  const W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H);
  const cx=W/2,cy=H-10,r=H-20;
  // Background arc
  ctx.beginPath();ctx.arc(cx,cy,r,Math.PI,0);ctx.strokeStyle='#2e4a2e';ctx.lineWidth=12;ctx.stroke();
  // Score arc
  const pct=(score-300)/550;
  const col=score>=750?'#00c853':score>=670?'#ffd700':score>=580?'#ffa726':'#ff3d3d';
  ctx.beginPath();ctx.arc(cx,cy,r,Math.PI,Math.PI+(pct*Math.PI));ctx.strokeStyle=col;ctx.lineWidth=12;ctx.lineCap='round';ctx.stroke();
  // Score label
  const el=$('cs-score'); if(el){el.textContent=score;el.style.color=col;}
  const gradeEl=$('cs-grade'); if(gradeEl){
    gradeEl.textContent=score>=800?'Exceptional':score>=740?'Very Good':score>=670?'Good':score>=580?'Fair':'Poor';
  }
}

function drawNetWorthChart(){
  const canvas=$('nw-chart'); if(!canvas)return;
  const dpr=window.devicePixelRatio||1;
  const W=canvas.parentElement.offsetWidth;const H=80;
  canvas.width=W*dpr;canvas.height=H*dpr;
  canvas.style.width=W+'px';canvas.style.height=H+'px';
  const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
  const hist=GS.nwHistory;if(hist.length<2)return;
  const mn=Math.min(...hist),mx=Math.max(...hist);
  const range=mx-mn||1;
  const pts=hist.map((v,i)=>[i/(hist.length-1)*W,H-10-((v-mn)/range)*(H-20)]);
  ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);
  const last=hist[hist.length-1];
  const grad=ctx.createLinearGradient(0,0,0,H);
  const col=last>=0?'rgba(0,200,83,.3)':'rgba(255,61,61,.3)';
  grad.addColorStop(0,col);grad.addColorStop(1,'rgba(0,0,0,0)');
  ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
  ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);
  ctx.strokeStyle=last>=0?'#00c853':'#ff3d3d';ctx.lineWidth=2;ctx.stroke();
  // Current dot
  ctx.beginPath();ctx.arc(pts[pts.length-1][0],pts[pts.length-1][1],4,0,Math.PI*2);
  ctx.fillStyle=last>=0?'#00c853':'#ff3d3d';ctx.fill();
}

function logEvent(text, type='info'){
  // Events feed
  const feed=$('events-feed');
  if(feed){
    const item=document.createElement('div');
    item.style.cssText='padding:4px 6px;background:var(--bg3);border-radius:4px;font-size:11px;border-left:3px solid '+(type==='good'?'var(--green)':type==='bad'||type==='career'?'var(--red)':type==='gold'?'var(--gold)':'var(--blue)');
    item.textContent=text;
    feed.prepend(item);
    while(feed.children.length>15)feed.removeChild(feed.lastChild);
  }
  // Timeline
  addTimeline(text,type);
}

function addTimeline(text, type='info'){
  const feed=$('tl-feed'); if(!feed)return;
  const item=document.createElement('div');item.className='tl-item';
  const dotClass=type==='good'||type==='gold'?'good':type==='bad'||type==='career'?'bad':type==='gold'?'gold':'info';
  item.innerHTML=`<div class="tl-dot ${dotClass}"></div><div class="tl-age">${ageDisplay(GS.char)}</div><div class="tl-text">${text}</div>`;
  feed.prepend(item);
  while(feed.children.length>50)feed.removeChild(feed.lastChild);
}

