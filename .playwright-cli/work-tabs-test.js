const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('page: ' + e.message));
  p.on('console', m => { if (m.type()==='error') errs.push('console: ' + m.text()); });
  await p.goto('http://localhost:3000/bitlife-finance.html', { waitUntil: 'domcontentloaded' });
  await p.evaluate(() => { try { localStorage.removeItem('finlife_save'); } catch(e){} });
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForSelector('#screen-new.active', { timeout: 5000 });
  await p.fill('#inp-name', 'Tabber');
  await p.click('#btn-start');
  await p.waitForSelector('#screen-game.active', { timeout: 5000 });
  await p.click('#btn-job');
  await p.waitForSelector('#modal-overlay.open', { timeout: 3000 });
  // Careers tab should be active initially
  const initial = await p.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('#m-choices button'));
    const tabBtns = btns.filter(b => /Careers|Side Projects/.test(b.textContent));
    const careerBtn = tabBtns.find(b => /Careers/.test(b.textContent));
    const sideBtn = tabBtns.find(b => /Side Projects/.test(b.textContent));
    const careerActive = careerBtn.style.color.includes('gold') || getComputedStyle(careerBtn).color.includes('215');
    // Count non-tab choice buttons
    const choiceBtns = btns.filter(b => b.classList.contains('choice-btn'));
    return {
      tabCount: tabBtns.length,
      choiceCount: choiceBtns.length,
      firstChoice: choiceBtns[0] ? choiceBtns[0].textContent.slice(0, 80) : null,
      careerActive
    };
  });

  // Click Side Projects tab
  await p.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('#m-choices button'));
    const sideBtn = btns.find(b => /Side Projects/.test(b.textContent));
    sideBtn.click();
  });
  await p.waitForTimeout(100);

  const afterSide = await p.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('#m-choices button'));
    const tabBtns = btns.filter(b => /Careers|Side Projects/.test(b.textContent));
    const choiceBtns = btns.filter(b => b.classList.contains('choice-btn'));
    return {
      tabCount: tabBtns.length,
      choiceCount: choiceBtns.length,
      hasRefresh: choiceBtns.some(b => /Refresh side projects/.test(b.textContent)),
      sampleHustle: choiceBtns[0] ? choiceBtns[0].textContent.slice(0, 80) : null
    };
  });

  // Click back to Careers
  await p.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('#m-choices button'));
    const careerBtn = btns.find(b => /Careers/.test(b.textContent));
    careerBtn.click();
  });
  await p.waitForTimeout(100);
  const backToCareers = await p.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('#m-choices button'));
    const choiceBtns = btns.filter(b => b.classList.contains('choice-btn'));
    return {
      choiceCount: choiceBtns.length,
      firstChoice: choiceBtns[0] ? choiceBtns[0].textContent.slice(0, 80) : null
    };
  });

  console.log(JSON.stringify({ errors: errs, initial, afterSide, backToCareers }, null, 2));
  await b.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
