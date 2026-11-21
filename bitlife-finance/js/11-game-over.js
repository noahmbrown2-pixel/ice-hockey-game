// ════════════════════════════════════════════════════════════════
//  GAME OVER
// ════════════════════════════════════════════════════════════════

function showGameOver(){
  const c=GS.char,inv=GS.inv;
  const nw=calcNetWorth(c,inv);
  $('go-cause').textContent=`Died at age ${c.death_age||c.age} — ${c.deathCause}`;
  const nwEl=$('go-nw');nwEl.textContent=fmt$(nw);nwEl.style.color=nw>=0?'var(--green)':'var(--red)';
  const stats=[
    {l:'Peak Net Worth',v:fmt$(Math.max(...GS.nwHistory))},
    {l:'Age at Death',v:c.age},
    {l:'Education',v:EDU_LABELS[c.education]||'None'},
    {l:'Relationship',v:c.relationship},
    {l:'Children',v:c.kids},
    {l:'Retirement',v:fmt$(totalRetirement(inv))},
    {l:'Properties Owned',v:inv.properties.length},
    {l:'Businesses',v:inv.businesses.length},
  ];
  $('go-stats').innerHTML=stats.map(s=>`<div class="go-stat"><div class="gs-label">${s.l}</div><div class="gs-val">${s.v}</div></div>`).join('');
  const achs=[];
  const peak=Math.max(...GS.nwHistory);
  if(peak>=1000000)achs.push('💰 Millionaire');
  if(peak>=10000000)achs.push('💎 10 Million Club');
  if(peak>=100000000)achs.push('🚀 Centimillionaire');
  if(inv.properties.length>=3)achs.push('🏠 Real Estate Mogul');
  if(totalRetirement(inv)>=500000)achs.push('🌅 Retirement Secured');
  if(c.creditScore>=750)achs.push('📊 Excellent Credit');
  if(c.age>=80)achs.push('🎂 Long Life (80+)');
  if(c.kids>=3)achs.push('👨‍👩‍👧‍👦 Big Family');
  if(!achs.length)achs.push('🕯️ A life lived.');
  $('go-ach-list').innerHTML=achs.map(a=>`<div class="ach-item">✦ ${a}</div>`).join('');
  showScreen('gameover');
}

