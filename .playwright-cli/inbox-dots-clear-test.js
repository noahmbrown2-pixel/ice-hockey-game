const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('page: ' + e.message));
  await p.goto('http://localhost:3000/bitlife-finance.html', { waitUntil: 'domcontentloaded' });
  await p.evaluate(() => { try { localStorage.removeItem('finlife_save'); } catch(e){} });
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForSelector('#screen-new.active', { timeout: 5000 });
  await p.fill('#inp-name', 'DotTest');
  await p.click('#btn-start');
  await p.waitForSelector('#screen-game.active', { timeout: 5000 });

  await p.evaluate(() => {
    GS.inbox = [];
    addInboxItem({type:'bill', icon:'🧾', subject:'Bill Report Jan', date:'Y22-Jan', body:'Bills.'});
    addInboxItem({type:'offer', icon:'⚽', subject:'Real Madrid offers you a contract', date:'Y23-Mar', body:'Sign.'});
    addInboxItem({type:'news', icon:'🚑', subject:'Injury: Sprained ankle', date:'Y22-Apr', body:'Hurt.'});
    renderInbox();
  });

  const before = await p.evaluate(() => ({
    red:    $('ibd-red').className.includes('show'),
    blue:   $('ibd-blue').className.includes('show'),
    orange: $('ibd-orange').className.includes('show'),
  }));

  // Open inbox
  await p.click('#btn-inbox');
  await p.waitForSelector('#modal-overlay.open', { timeout: 3000 });
  await p.waitForTimeout(150);

  // Per-item unread should still appear (gold border) — check that messages still render
  const modalState = await p.evaluate(() => ({
    unreadInModal: document.querySelectorAll('#m-choices .inbox-item.unread').length,
    readInModal:   document.querySelectorAll('#m-choices .inbox-item.read').length,
  }));

  // Close modal
  await p.evaluate(() => { document.getElementById('modal-close-x').click(); });
  await p.waitForTimeout(150);

  const after = await p.evaluate(() => ({
    red:    $('ibd-red').className.includes('show'),
    blue:   $('ibd-blue').className.includes('show'),
    orange: $('ibd-orange').className.includes('show'),
    redCount:    $('ibd-red').textContent,
    blueCount:   $('ibd-blue').textContent,
    orangeCount: $('ibd-orange').textContent,
    dotSeenAll: GS.inbox.every(i => i.dotSeen === true),
    stillUnread: GS.inbox.filter(i => !i.read).length,
  }));

  // Add a fresh notification — its dot should appear again
  await p.evaluate(() => {
    addInboxItem({type:'news', icon:'💔', subject:'Your spouse passed away', date:'Y23-Jul', body:'Funeral.'});
    renderInbox();
  });
  const afterNew = await p.evaluate(() => ({
    red:    $('ibd-red').className.includes('show'),
    blue:   $('ibd-blue').className.includes('show'),
    orange: $('ibd-orange').className.includes('show'),
    redCount: $('ibd-red').textContent,
  }));

  console.log(JSON.stringify({ errors: errs, before, modalState, after, afterNew }, null, 2));
  await b.close();
})().catch(e => { console.error('FATAL', e.message || e); process.exit(1); });
