const { chromium, devices } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  // Test on iPhone SE (375x667) — small screen
  const ctx = await browser.newContext({ ...devices['iPhone SE'] });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('page: ' + e.message));
  await page.goto('http://localhost:3000/bitlife-finance.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { try { localStorage.removeItem('finlife_save'); } catch(e){} });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#screen-new.active', { timeout: 5000 });
  await page.fill('#inp-name', 'Mobile');
  await page.click('#btn-start');
  await page.waitForSelector('#screen-game.active', { timeout: 5000 });

  // Check every action button is visible + has a reasonable tap target
  const ids = ['btn-age','btn-job','btn-bank','btn-invest','btn-realty','btn-crypto','btn-edu','btn-fitness','btn-sponsors','btn-inbox'];
  const results = {};
  for (const id of ids) {
    const box = await page.locator('#' + id).boundingBox();
    results[id] = box ? { visible: true, w: Math.round(box.width), h: Math.round(box.height), y: Math.round(box.y) } : { visible: false };
  }

  // Viewport info
  const vp = page.viewportSize();
  await page.screenshot({ path: 'C:\\Users\\noahm\\Project\\mobile-screenshot.png', fullPage: false });

  // Try clicking one action button to verify it works
  await page.locator('#btn-fitness').click();
  await page.waitForSelector('#modal-overlay.open', { timeout: 3000 });
  const fitnessModalOpen = await page.locator('#modal-overlay.open').isVisible();
  await page.locator('#modal-close-x').click();

  console.log(JSON.stringify({ errors: errs, viewport: vp, results, fitnessModalOpen }, null, 2));
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
