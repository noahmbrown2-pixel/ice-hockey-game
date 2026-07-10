// --- MARKET TAB ---
function renderMarket() {
  const sub = currentSubTab.market || "buyPlayers";
  currentSubTab.market = sub;
  const html = `
    <div class="subtab-bar">
      <button class="subtab ${sub==='buyPlayers'?'active':''}" onclick="setSubTab('market','buyPlayers')">BUY PLAYERS</button>
      <button class="subtab ${sub==='buyCoaches'?'active':''}" onclick="setSubTab('market','buyCoaches')">BUY COACHES</button>
      <button class="subtab ${sub==='bids'?'active':''}" onclick="setSubTab('market','bids')">INCOMING BIDS (${G.incomingBids.length})</button>
    </div>
    <div id="marketBody"></div>
  `;
  document.getElementById("tabContent").innerHTML = html;
  if (sub === "buyPlayers") renderMarketBuyPlayers();
  else if (sub === "buyCoaches") renderMarketBuyCoaches();
  else renderMarketBids();
}

function setSubTab(tab, sub) {
  currentSubTab[tab] = sub;
  renderTab();
}

let marketFilters = { search: "", pos: "", star: 0, price: 0 };

function refreshMarket() {
  // Wipe untouched free agents and regenerate a fresh wave
  const freeIds = Object.values(G.players).filter(p => p.teamId === null).map(p => p.id);
  freeIds.forEach(id => { delete G.players[id]; delete G.playerStats[id]; delete G.careerStats[id]; });
  ensureFreeAgentPool();
  // Add an extra batch so the refresh feels substantial
  const positions = ["GK","CB","LB","RB","CDM","CM","CAM","LW","RW","ST","CF"];
  for (let i = 0; i < 60; i++) generatePlayer(pick(positions));
  toast("Transfer market refreshed", "gold");
  updateMarketGrid();
}

function updateMarketGrid() {
  const grid = document.getElementById("mktGrid");
  if (!grid) return;
  let pool = Object.values(G.players).filter(p => {
    if (p.teamId === G.userTeamId) return false;
    if (p.teamId === null && p.rating > 64) return false;
    return true;
  });
  const { search, pos, star, price } = marketFilters;
  if (search) pool = pool.filter(p => p.name.toLowerCase().includes(search));
  if (pos) pool = pool.filter(p => POSITIONS[p.position].group === pos);
  if (star) pool = pool.filter(p => ratingToHalfStars(p.rating) >= star);
  if (price) pool = pool.filter(p => p.value <= price);
  pool.sort((a, b) => b.rating - a.rating);
  pool = pool.slice(0, 80);
  grid.innerHTML = pool.length === 0
    ? `<div class="card" style="text-align:center;color:#8b949e;">No players match your filters. Try widening the criteria or hit Refresh Pool.</div>`
    : pool.map(p => `
    <div class="player-card">
      <img class="player-avatar" src="${p.avatar}">
      <div class="player-info">
        <div class="player-name">${p.name}</div>
        <div class="player-meta"><span class="player-pos">${p.position}</span> ${p.age} · ${p.nationality} ${p.teamId ? '· '+G.teams[p.teamId].name : '· Free Agent'}</div>
        ${starsHTML(p.rating)}
        <div class="player-price">${fmtMoney(p.value)} · ${fmtMoney(p.wage)}/wk</div>
      </div>
      <button class="btn btn-sm btn-gold" onclick="makeBid(${p.id})">Bid</button>
    </div>
  `).join("");
}

function onMarketFilterChange() {
  marketFilters.search = (document.getElementById("mktSearch").value || "").toLowerCase();
  marketFilters.pos = document.getElementById("mktPosFilter").value;
  marketFilters.star = parseInt(document.getElementById("mktStarFilter").value) || 0;
  marketFilters.price = parseFloat(document.getElementById("mktPriceFilter").value) || 0;
  updateMarketGrid();
}

function renderMarketBuyPlayers() {
  ensureFreeAgentPool();
  const body = document.getElementById("marketBody");
  const f = marketFilters;
  body.innerHTML = `
    <div class="filter-bar">
      <input type="text" placeholder="Search name..." id="mktSearch" value="${f.search}" oninput="onMarketFilterChange()">
      <select id="mktPosFilter" onchange="onMarketFilterChange()">
        <option value="" ${f.pos===""?"selected":""}>All Positions</option>
        <option value="GK" ${f.pos==="GK"?"selected":""}>GK</option>
        <option value="DEF" ${f.pos==="DEF"?"selected":""}>Defenders</option>
        <option value="MID" ${f.pos==="MID"?"selected":""}>Midfielders</option>
        <option value="FWD" ${f.pos==="FWD"?"selected":""}>Forwards</option>
      </select>
      <select id="mktStarFilter" onchange="onMarketFilterChange()">
        <option value="0" ${f.star===0?"selected":""}>All Ratings</option>
        <option value="3" ${f.star===3?"selected":""}>1.5★+</option>
        <option value="4" ${f.star===4?"selected":""}>2★+</option>
        <option value="5" ${f.star===5?"selected":""}>2.5★+</option>
        <option value="6" ${f.star===6?"selected":""}>3★+</option>
        <option value="7" ${f.star===7?"selected":""}>3.5★+</option>
        <option value="8" ${f.star===8?"selected":""}>4★+</option>
        <option value="9" ${f.star===9?"selected":""}>4.5★+</option>
        <option value="10" ${f.star===10?"selected":""}>5★ only</option>
      </select>
      <input type="number" placeholder="Max price (£)" id="mktPriceFilter" value="${f.price || ""}" oninput="onMarketFilterChange()" style="width:140px;">
      <button class="btn btn-sm btn-ghost" onclick="refreshMarket()">🔄 Refresh Pool</button>
    </div>
    <div class="player-grid" id="mktGrid"></div>
  `;
  updateMarketGrid();
}

function makeBid(pid) {
  const p = G.players[pid];
  if (!p) return;
  const recommended = p.value;
  const html = `
    <button class="modal-close" onclick="closeModal()">×</button>
    <div class="card-title">Bid for ${p.name}</div>
    <div class="player-detail-header">
      <img src="${p.avatar}">
      <div>
        <div class="player-detail-name">${p.name}</div>
        <div class="player-detail-meta">${p.position} · ${p.age} · ${p.nationality}</div>
        ${starsHTML(p.rating)}
      </div>
    </div>
    <div class="stat-row"><span>Market Value</span><span>${fmtMoney(p.value)}</span></div>
    <div class="stat-row"><span>Weekly Wage</span><span>${fmtMoney(p.wage)}</span></div>
    <div class="stat-row"><span>Your Budget</span><span>${fmtMoney(G.budget)}</span></div>
    <div style="margin:14px 0;">
      <label style="font-size:12px; color:#8b949e;">Your Bid (£)</label>
      <input type="number" id="bidAmount" value="${recommended}" style="width:100%; padding:10px; background:#0d1117; border:1px solid #30363d; color:#e6edf3; border-radius:6px; font-size:16px; margin-top:4px;">
    </div>
    <div style="display:flex; gap:8px; justify-content:flex-end;">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-gold" onclick="submitBid(${p.id})">Submit Bid</button>
    </div>
  `;
  showModal(html);
}

function submitBid(pid) {
  const p = G.players[pid];
  const amount = parseFloat(document.getElementById("bidAmount").value);
  if (isNaN(amount) || amount <= 0) { toast("Invalid bid", "error"); return; }
  if (amount > G.budget) { toast("Not enough budget", "error"); return; }
  if (G.myPlayers.length >= 35) { toast("Squad full (max 35)", "error"); return; }
  const ratio = amount / p.value;
  let chance;
  if (ratio >= 1) chance = 0.9;
  else if (ratio >= 0.8) chance = 0.7;
  else chance = 0.3;
  if (Math.random() < chance) {
    G.budget -= amount;
    if (p.teamId && p.teamId !== G.userTeamId) {
      const oldTeam = G.teams[p.teamId];
      oldTeam.players = oldTeam.players.filter(id => id !== pid);
    }
    p.teamId = G.userTeamId;
    G.myPlayers.push(pid);
    toast(`Bid Accepted! ${p.name} signed for ${fmtMoney(amount)}`, "gold");
    addMessage("Transfer", `${p.name} has joined the club for ${fmtMoney(amount)}!`);
  } else {
    toast(`Bid Rejected for ${p.name}`, "error");
  }
  closeModal();
  saveGame();
  renderTab();
}

function renderMarketBuyCoaches() {
  ensureFreeCoachPool();
  const body = document.getElementById("marketBody");
  const free = Object.values(G.coaches).filter(c => c.teamId === null && !G.myCoaches.includes(c.id));
  free.sort((a,b) => b.rating - a.rating);
  body.innerHTML = `
    <div class="player-grid">
      ${free.slice(0, 60).map(c => `
        <div class="player-card">
          <img class="player-avatar" src="${c.avatar}">
          <div class="player-info">
            <div class="player-name">${c.name}</div>
            <div class="player-meta"><span class="player-pos">${c.role}</span> ${c.age} · ${c.nationality}</div>
            ${starsHTML(c.rating)}
            <div class="player-price">${fmtMoney(c.wage)}/wk</div>
          </div>
          <button class="btn btn-sm btn-gold" onclick="hireCoach(${c.id})">Hire</button>
        </div>
      `).join("")}
    </div>
  `;
}

function hireCoach(cid) {
  const c = G.coaches[cid];
  if (!c) return;
  if (G.myCoaches.length >= 15) { toast("Too many coaches", "error"); return; }
  c.teamId = G.userTeamId;
  G.myCoaches.push(cid);
  toast(`Hired ${c.name}`, "gold");
  saveGame();
  renderTab();
}

function renderMarketBids() {
  const body = document.getElementById("marketBody");
  if (G.incomingBids.length === 0) {
    body.innerHTML = `<div class="card" style="text-align:center; color:#8b949e;">No incoming bids at the moment.</div>`;
    return;
  }
  body.innerHTML = G.incomingBids.map((b, i) => {
    const p = G.players[b.playerId];
    const team = G.teams[b.teamId];
    if (!p || !team) return "";
    return `
      <div class="bid-row">
        <div style="display:flex; align-items:center; gap:10px;">
          <img class="player-avatar" src="${p.avatar}">
          <div>
            <div class="player-name">${p.name} <span class="player-pos">${p.position}</span></div>
            <div class="player-meta">${team.name} offer ${fmtMoney(b.offer)}</div>
            ${starsHTML(p.rating)}
          </div>
        </div>
        <div>
          <button class="btn btn-sm btn-gold" onclick="acceptBid(${i})">Accept</button>
          <button class="btn btn-sm btn-red" onclick="declineBid(${i})">Decline</button>
        </div>
      </div>
    `;
  }).join("");
}

function acceptBid(idx) {
  const b = G.incomingBids[idx];
  const p = G.players[b.playerId];
  const team = G.teams[b.teamId];
  if (!p || !team) return;
  G.budget += b.offer;
  G.myPlayers = G.myPlayers.filter(id => id !== p.id);
  G.transferList = G.transferList.filter(id => id !== p.id);
  p.teamId = team.id;
  team.players.push(p.id);
  G.incomingBids.splice(idx, 1);
  toast(`Sold ${p.name} for ${fmtMoney(b.offer)}`, "gold");
  addMessage("Transfer", `${p.name} has left for ${team.name}. Funds received: ${fmtMoney(b.offer)}`);
  saveGame();
  renderTab();
}

function declineBid(idx) {
  const b = G.incomingBids[idx];
  const p = G.players[b.playerId];
  G.incomingBids.splice(idx, 1);
  toast(`Declined offer for ${p ? p.name : 'player'}`);
  renderTab();
}

// --- YOUTH TAB ---
function renderYouth() {
  const sub = currentSubTab.youth || "your";
  currentSubTab.youth = sub;
  document.getElementById("tabContent").innerHTML = `
    <div class="subtab-bar">
      <button class="subtab ${sub==='your'?'active':''}" onclick="setSubTab('youth','your')">YOUR YOUTH</button>
      <button class="subtab ${sub==='scout'?'active':''}" onclick="setSubTab('youth','scout')">SCOUT</button>
    </div>
    <div id="youthBody"></div>
  `;
  if (sub === "your") renderYouthYour();
  else renderYouthScout();
}

function renderYouthYour() {
  const body = document.getElementById("youthBody");
  if (G.youthPlayers.length === 0) {
    body.innerHTML = `<div class="card" style="text-align:center; color:#8b949e;">No youth players discovered yet. Send your scouts on a mission!</div>`;
    return;
  }
  body.innerHTML = `<div class="player-grid">
    ${G.youthPlayers.map(p => `
      <div class="player-card">
        <img class="player-avatar" src="${p.avatar}">
        <div class="player-info">
          <div class="player-name">${p.name}</div>
          <div class="player-meta"><span class="player-pos">${p.position}</span> ${p.age} · ${p.nationality}</div>
          ${starsHTML(p.rating)}
          <div class="player-price">Potential: ${p.potential} · ${fmtMoney(p.wage)}/wk</div>
        </div>
        <button class="btn btn-sm btn-gold" onclick="promoteYouth(${p.id})">Promote</button>
      </div>
    `).join("")}
  </div>`;
}

function promoteYouth(pid) {
  const idx = G.youthPlayers.findIndex(p => p.id === pid);
  if (idx === -1) return;
  if (G.myPlayers.length >= 35) { toast("Squad full", "error"); return; }
  const p = G.youthPlayers[idx];
  p.teamId = G.userTeamId;
  G.players[pid] = p;
  G.playerStats[pid] = { apps:0, goals:0, assists:0, cleanSheets:0, rating:6.5 };
  G.careerStats[pid] = { apps:0, goals:0, assists:0, cleanSheets:0 };
  G.myPlayers.push(pid);
  G.youthPlayers.splice(idx, 1);
  toast(`${p.name} promoted to first team!`, "gold");
  saveGame();
  renderTab();
}

function renderYouthScout() {
  const body = document.getElementById("youthBody");
  if (G.scoutingMission) {
    body.innerHTML = `
      <div class="card">
        <div class="card-title">Active Scouting Mission</div>
        <div class="stat-row"><span>Region</span><span>${G.scoutingMission.region}</span></div>
        <div class="stat-row"><span>Duration</span><span>${G.scoutingMission.totalWeeks} weeks</span></div>
        <div class="stat-row"><span>Weeks Remaining</span><span>${G.scoutingMission.weeksLeft}</span></div>
        <div style="color:#8b949e; font-size:13px; margin-top:10px;">Advance weeks to complete the mission.</div>
      </div>
    `;
    return;
  }
  const regions = ["England","Europe","South America","Africa","Asia"];
  body.innerHTML = `
    <div class="card">
      <div class="card-title">Send Scouting Mission</div>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; color:#8b949e;">Region</label>
        <select id="scoutRegion" style="width:100%; padding:8px; background:#0d1117; border:1px solid #30363d; color:#e6edf3; border-radius:6px; margin-top:4px;">
          ${regions.map(r => `<option value="${r}">${r}</option>`).join("")}
        </select>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn" onclick="startScouting(1)">1 week (£50k) — Low</button>
        <button class="btn" onclick="startScouting(2)">2 weeks (£120k) — Medium</button>
        <button class="btn" onclick="startScouting(3)">3 weeks (£250k) — High</button>
      </div>
    </div>
  `;
}

function startScouting(weeks) {
  const cost = weeks === 1 ? 50e3 : weeks === 2 ? 120e3 : 250e3;
  if (G.budget < cost) { toast("Not enough budget", "error"); return; }
  G.budget -= cost;
  const region = document.getElementById("scoutRegion").value;
  G.scoutingMission = { region, weeksLeft: weeks, totalWeeks: weeks };
  toast(`Scouts dispatched to ${region}`, "gold");
  saveGame();
  renderTab();
}

function completeScouting() {
  const m = G.scoutingMission;
  if (!m) return;
  const numFound = randInt(1, 3);
  const ratingBoost = m.totalWeeks === 1 ? 0 : m.totalWeeks === 2 ? 5 : 10;
  const found = [];
  // Pick nationalities matching region
  const regionMap = {
    "England": ["English","Scottish","Welsh","Irish"],
    "Europe": ["Spanish","French","German","Portuguese","Dutch","Belgian","Italian"],
    "South America": ["Brazilian","Argentinian","Uruguayan","Colombian"],
    "Africa": ["Nigerian","Ghanaian","Senegalese","Ivorian","Moroccan"],
    "Asia": ["English","Spanish"] // fallback if needed
  };
  for (let i = 0; i < numFound; i++) {
    const positions = Object.keys(POSITIONS);
    const pos = pick(positions);
    const nat = pick(regionMap[m.region] || NATIONALITIES);
    const firstName = pick(FIRST_NAMES[nat] || FIRST_NAMES.English);
    const lastName = pick(LAST_NAMES[nat] || LAST_NAMES.English);
    const age = randInt(16, 20);
    const rating = randInt(35 + ratingBoost, 55 + ratingBoost);
    const id = nextId();
    const name = firstName + " " + lastName;
    const p = {
      id, firstName, lastName, name, age, nationality: nat, position: pos,
      rating, potential: Math.min(99, rating + randInt(15, 30)),
      value: ratingToValue(rating, age),
      wage: ratingToWage(rating),
      contractYears: 3, teamId: null,
      morale: 70, moraleBoostWeeks: 0,
      avatar: makeAvatar(id, name, nat),
      awards: [], isYouth: true
    };
    G.youthPlayers.push(p);
    found.push(p);
  }
  toast(`Scouts found ${numFound} youth prospects!`, "gold");
  addMessage("Scouting", `Mission to ${m.region} complete. Found ${numFound} promising youth players: ${found.map(p=>p.name).join(", ")}`);
  G.scoutingMission = null;
}

