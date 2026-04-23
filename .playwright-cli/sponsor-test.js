// Test sponsors & equipment: rich start, start biz, age many years, verify systems fire.
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  page.on('pageerror', e => errs.push('page: ' + e.message));
  await page.goto('http://localhost:3000/bitlife-finance.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { try { localStorage.removeItem('finlife_save'); } catch(e){} });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#screen-new.active', { timeout: 5000 });
  await page.fill('#inp-name', 'Sponsor');
  await page.evaluate(() => { const rb=document.querySelector('input[name="scn"][value="rich"]'); if(rb) rb.checked=true; });
  await page.click('#btn-start');
  await page.waitForSelector('#screen-game.active', { timeout: 5000 });

  async function closeModals(){
    for (let k=0;k<8;k++){
      const open = await page.$('#modal-overlay.open');
      if (!open) break;
      const btns = await page.$$('#m-choices button');
      let idx=-1;
      for(let j=0;j<btns.length;j++){
        const t=(await btns[j].textContent()||'').toLowerCase();
        if(/pass|close|continue|skip|cancel|back/.test(t)){idx=j;break;}
      }
      if(idx<0) idx=Math.max(0,btns.length-1);
      if(btns[idx]) await btns[idx].click({force:true}).catch(()=>{});
      await page.waitForTimeout(30);
    }
  }

  // Age to 20 then force-start a Tech Startup (cheap $30k revMult 3x)
  for (let i=0;i<12;i++){ await closeModals(); await page.click('#btn-age',{force:true}); await page.waitForTimeout(30); }
  await page.evaluate(() => {
    // seed cash for testing and start a couple of high-growth businesses
    GS.char.checking = 300000;
    // bypass UI: call startBusiness directly
    startBusiness(3); // Tech Startup
    startBusiness(9); // SaaS
  });

  // Age 20 years
  for (let i=0;i<240;i++){ await closeModals(); await page.click('#btn-age',{force:true}); await page.waitForTimeout(20); }

  const snap = await page.evaluate(() => ({
    bizVal: GS.inv.businesses.reduce((s,b)=>s+b.value,0),
    biz: GS.inv.businesses.map(b=>({name:b.name, value:b.value, tier:b.equipTier, eqAge:b.equipAge, emps:(b.employees||[]).length})),
    sponsorBtnVisible: document.getElementById('btn-sponsors').style.display !== 'none',
    activeSponsors: (GS.inv.sponsors||[]).length,
    sponsorOffers: (GS.inv.sponsorOffers||[]).length,
    sponsorsUnlocked: typeof sponsorsUnlocked === 'function' ? sponsorsUnlocked(GS.inv) : null,
    equipInfo: GS.inv.businesses.map(b=>equipmentInfo(b)),
  }));

  // If unlocked, open sponsors modal and sign the first
  let signedResult = null;
  if (snap.sponsorsUnlocked) {
    await closeModals();
    await page.click('#btn-sponsors', {force:true});
    await page.waitForTimeout(120);
    const btns = await page.$$('#m-choices button');
    for (const b of btns) {
      const t = (await b.textContent()) || '';
      if (/mo × /.test(t)) { await b.click({force:true}); signedResult = t; break; }
    }
    await page.waitForTimeout(80);
  }
  await closeModals();

  // Try upgrading equipment on first biz
  let equipUpgradeResult = null;
  const upgradeOk = await page.evaluate(() => {
    if (!GS.inv.businesses.length) return false;
    const prevTier = GS.inv.businesses[0].equipTier;
    upgradeEquipment(0);
    return GS.inv.businesses[0].equipTier > prevTier;
  });
  equipUpgradeResult = upgradeOk;
  await closeModals();

  // Try paying bonuses
  const bonusOk = await page.evaluate(() => {
    const b = GS.inv.businesses[0];
    if (!b || !b.employees || !b.employees.length) return 'no staff';
    const moraleBefore = Math.round(b.employees.reduce((s,e)=>s+(e.morale||75),0)/b.employees.length);
    payBonuses(0);
    const moraleAfter = Math.round(b.employees.reduce((s,e)=>s+(e.morale||75),0)/b.employees.length);
    return { before: moraleBefore, after: moraleAfter };
  });

  console.log(JSON.stringify({ errors: errs, snap, signedResult, equipUpgradeResult, bonusOk }, null, 2));
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
