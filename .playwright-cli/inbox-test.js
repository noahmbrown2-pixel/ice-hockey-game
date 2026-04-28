// Validates new 2-section inbox + colored priority dots + toggle behavior.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('page: ' + e.message));
  p.on('console', m => { if (m.type()==='error') errs.push('console: ' + m.text()); });
  await p.goto('http://localhost:3000/bitlife-finance.html', { waitUntil: 'domcontentloaded' });
  await p.evaluate(() => { try { localStorage.removeItem('finlife_save'); } catch(e){} });
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForSelector('#screen-new.active', { timeout: 5000 });
  await p.fill('#inp-name', 'InboxTest');
  await p.click('#btn-start');
  await p.waitForSelector('#screen-game.active', { timeout: 5000 });

  // 1. Add a variety of inbox items spanning all 3 colors and 2 sections.
  const seeded = await p.evaluate(() => {
    GS.inbox = [];
    addInboxItem({type:'bill', icon:'🧾', subject:'Bill Report Jan — $4,200', date:'Y22-Jan', body:'Monthly bill total $4,200.'});
    addInboxItem({type:'news', icon:'📅', subject:'Manchester United — Premier League fixtures released', date:'Y22-Aug', body:'Fixtures for the season.'});
    addInboxItem({type:'offer', icon:'⚽', subject:'Real Madrid offers you a contract', date:'Y23-Mar', body:'Sign with us for $20M/yr.'});
    addInboxItem({type:'news', icon:'🚑', subject:'Injury: Sprained ankle', date:'Y22-Apr', body:'You will miss 4 weeks.'});
    addInboxItem({type:'news', icon:'📜', subject:'Lawsuit filed against you', date:'Y22-May', body:'A former coworker is suing you.'});
    addInboxItem({type:'news', icon:'🤝', subject:'Promotion to Senior Engineer', date:'Y22-Jun', body:'Congrats on the raise.'});
    addInboxItem({type:'news', icon:'💔', subject:'Your spouse passed away', date:'Y22-Jul', body:'Funeral arrangements.'});
    addInboxItem({type:'news', icon:'🏆', subject:'Hall of Fame induction', date:'Y22-Aug', body:'You\'ve made it.'});
    renderInbox();
    return GS.inbox.map(i => ({ subject: i.subject, type: i.type, priority: i.priority, section: i.section }));
  });

  // 2. Check the colored badge dots
  const dots = await p.evaluate(() => ({
    red:    { count: $('ibd-red').textContent,    show: $('ibd-red').className.includes('show') },
    blue:   { count: $('ibd-blue').textContent,   show: $('ibd-blue').className.includes('show') },
    orange: { count: $('ibd-orange').textContent, show: $('ibd-orange').className.includes('show') },
  }));

  // 3. Open inbox, verify Bills & News tab content
  await p.click('#btn-inbox');
  await p.waitForSelector('#modal-overlay.open', { timeout: 3000 });
  await p.waitForTimeout(150);
  const billsTabContent = await p.evaluate(() => {
    const subs = Array.from(document.querySelectorAll('#m-choices .ii-subject')).map(d => d.textContent.trim());
    const tabs = Array.from(document.querySelectorAll('#m-choices > div:first-child button')).map(b => b.textContent.trim());
    return { subjectCount: subs.length, subs, tabs };
  });

  // 4. Switch to Offers & Promos tab
  await p.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('#m-choices > div:first-child button'));
    const off = tabs.find(t => /Offers/.test(t.textContent));
    off.click();
  });
  await p.waitForTimeout(150);
  const offersTabContent = await p.evaluate(() => {
    const subs = Array.from(document.querySelectorAll('#m-choices .ii-subject')).map(d => d.textContent.trim());
    return { subjectCount: subs.length, subs };
  });

  // 5. Toggle the orange dot off and re-check badge
  await p.evaluate(() => {
    const setBtns = Array.from(document.querySelectorAll('#m-choices button')).filter(b => /Regular|Big Offers|Emergencies/.test(b.textContent));
    const orange = setBtns.find(b => /Regular/.test(b.textContent));
    orange.click();
  });
  await p.waitForTimeout(150);
  const dotsAfterToggle = await p.evaluate(() => ({
    red:    { count: $('ibd-red').textContent,    show: $('ibd-red').className.includes('show') },
    blue:   { count: $('ibd-blue').textContent,   show: $('ibd-blue').className.includes('show') },
    orange: { count: $('ibd-orange').textContent, show: $('ibd-orange').className.includes('show') },
    prefs: GS.inboxPrefs,
  }));

  // 6. Toggle orange back on
  await p.evaluate(() => {
    const setBtns = Array.from(document.querySelectorAll('#m-choices button')).filter(b => /Regular|Big Offers|Emergencies/.test(b.textContent));
    const orange = setBtns.find(b => /Regular/.test(b.textContent));
    orange.click();
  });
  await p.waitForTimeout(150);
  const dotsAfterReToggle = await p.evaluate(() => ({
    orange: { count: $('ibd-orange').textContent, show: $('ibd-orange').className.includes('show') },
    prefs: GS.inboxPrefs,
  }));

  console.log(JSON.stringify({
    errors: errs.slice(0, 6),
    seeded, dots, billsTabContent, offersTabContent, dotsAfterToggle, dotsAfterReToggle,
  }, null, 2));
  await b.close();
})().catch(e => { console.error('FATAL', e.message || e); process.exit(1); });
