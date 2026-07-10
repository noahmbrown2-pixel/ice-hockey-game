// --- PLAYER SETUP ---
function renderSetupPlayers() {
  // Auto-top up the free agent pool every render to guarantee the user can always sign players
  ensureFreeAgentPool();
  const grid = document.getElementById("setupPlayerGrid");
  const search = document.getElementById("setupSearch").value.toLowerCase();
  const posFilter = document.getElementById("setupPosFilter").value;
  const starFilter = parseInt(document.getElementById("setupStarFilter").value);
  // Setup squad: only show 1.5★ to 3★ players (rating 45-64) — higher must be bought during the season.
  const free = Object.values(G.players).filter(p => p.teamId === null && p.rating >= 45 && p.rating <= 64);
  let filtered = free;
  if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search));
  if (posFilter) filtered = filtered.filter(p => POSITIONS[p.position].group === posFilter);
  if (starFilter) filtered = filtered.filter(p => ratingToHalfStars(p.rating) >= starFilter);
  filtered.sort((a,b) => b.rating - a.rating);
  filtered = filtered.slice(0, 100);
  grid.innerHTML = filtered.map(p => playerSetupCard(p)).join("");
  updateSetupBar();
}

function playerSetupCard(p) {
  return `
    <div class="player-card">
      <img class="player-avatar" src="${p.avatar}">
      <div class="player-info">
        <div class="player-name">${p.name}</div>
        <div class="player-meta"><span class="player-pos">${p.position}</span> ${p.age} · ${p.nationality}</div>
        ${starsHTML(p.rating)}
        <div class="player-price">${fmtMoney(p.value)} · ${fmtMoney(p.wage)}/wk</div>
      </div>
      <button class="btn btn-sm btn-gold" onclick="signPlayerSetup(${p.id})">Sign</button>
    </div>
  `;
}

function signPlayerSetup(pid) {
  const p = G.players[pid];
  if (!p) return;
  if (G.myPlayers.length >= 25) { toast("Max 25 players", "error"); return; }
  if (G.budget < p.value) { toast("Not enough budget", "error"); return; }
  G.budget -= p.value;
  p.teamId = G.userTeamId;
  G.myPlayers.push(pid);
  toast(`Signed ${p.name} for ${fmtMoney(p.value)}`);
  renderSetupPlayers();
}

function updateSetupBar() {
  document.getElementById("setupBudget").textContent = fmtMoney(G.budget);
  document.getElementById("setupCount").textContent = `${G.myPlayers.length}/20`;
  const counts = { GK:0, DEF:0, MID:0, FWD:0 };
  G.myPlayers.forEach(id => {
    const p = G.players[id];
    if (p) counts[POSITIONS[p.position].group]++;
  });
  document.getElementById("setupGK").textContent = `${counts.GK}/2`;
  document.getElementById("setupDEF").textContent = `${counts.DEF}/4`;
  document.getElementById("setupMID").textContent = `${counts.MID}/4`;
  document.getElementById("setupFWD").textContent = `${counts.FWD}/3`;
  const ok = G.myPlayers.length >= 20 && counts.GK >= 2 && counts.DEF >= 4 && counts.MID >= 4 && counts.FWD >= 3;
  document.getElementById("setupDoneBtn").disabled = !ok;
}

function finishPlayerSetup() {
  // Populate coach role filter
  const sel = document.getElementById("coachRoleFilter");
  sel.innerHTML = '<option value="">All Roles</option>' + COACH_ROLES.map(r => `<option value="${r}">${r}</option>`).join("");
  renderSetupCoaches();
  showScreen("coachSetup");
}

// --- COACH SETUP ---
function ensureFreeCoachPool() {
  const free = Object.values(G.coaches).filter(c => c.teamId === null);
  const byRole = {};
  COACH_ROLES.forEach(r => byRole[r] = 0);
  free.forEach(c => { if (byRole[c.role] !== undefined) byRole[c.role]++; });
  // At least 4 free coaches per role
  COACH_ROLES.forEach(r => {
    while ((byRole[r] || 0) < 4) {
      const c = generateCoach();
      c.role = r;
      byRole[r] = (byRole[r] || 0) + 1;
    }
  });
}

function renderSetupCoaches() {
  ensureFreeCoachPool();
  const grid = document.getElementById("setupCoachGrid");
  const search = document.getElementById("coachSearch").value.toLowerCase();
  const roleFilter = document.getElementById("coachRoleFilter").value;
  const free = Object.values(G.coaches).filter(c => c.teamId === null);
  let filtered = free;
  if (search) filtered = filtered.filter(c => c.name.toLowerCase().includes(search));
  if (roleFilter) filtered = filtered.filter(c => c.role === roleFilter);
  filtered.sort((a,b) => b.rating - a.rating);
  filtered = filtered.slice(0, 80);
  grid.innerHTML = filtered.map(c => coachSetupCard(c)).join("");
  updateCoachBar();
}

function coachSetupCard(c) {
  return `
    <div class="player-card">
      <img class="player-avatar" src="${c.avatar}">
      <div class="player-info">
        <div class="player-name">${c.name}</div>
        <div class="player-meta"><span class="player-pos">${c.role}</span> ${c.age} · ${c.nationality}</div>
        ${starsHTML(c.rating)}
        <div class="player-price">${fmtMoney(c.wage)}/wk</div>
      </div>
      <button class="btn btn-sm btn-gold" onclick="signCoachSetup(${c.id})">Hire</button>
    </div>
  `;
}

function signCoachSetup(cid) {
  const c = G.coaches[cid];
  if (!c) return;
  if (G.myCoaches.length >= 10) { toast("Max 10 coaches", "error"); return; }
  c.teamId = G.userTeamId;
  G.myCoaches.push(cid);
  toast(`Hired ${c.name}`);
  renderSetupCoaches();
}

function updateCoachBar() {
  document.getElementById("coachBudget").textContent = fmtMoney(G.budget);
  const wages = G.myCoaches.reduce((s,id) => s + (G.coaches[id] ? G.coaches[id].wage : 0), 0);
  document.getElementById("coachWages").textContent = fmtMoney(wages) + "/wk";
  document.getElementById("coachCount").textContent = `${G.myCoaches.length}/5`;
  const hasHead = G.myCoaches.some(id => G.coaches[id] && G.coaches[id].role === "Head Coach");
  document.getElementById("hasHead").textContent = hasHead ? "Yes" : "No";
  document.getElementById("coachDoneBtn").disabled = !(G.myCoaches.length >= 5 && hasHead);
}

function startSeason() {
  addMessage("Board", `Welcome to ${G.teams[G.userTeamId].name}! We expect a strong campaign in the Championship.`);
  saveGame();
  showScreen("game");
  renderGameHeader();
  switchTab("advance");
}

// --- GAME HEADER ---
function renderGameHeader() {
  const team = G.teams[G.userTeamId];
  if (!team) return;
  document.getElementById("gameClubName").textContent = team.name;
  document.getElementById("gameClubMeta").textContent = `Season ${G.seasonYear}-${(G.seasonYear+1).toString().slice(2)} · Week ${G.week} · ${G.division}`;
  document.getElementById("gameBudget").textContent = fmtMoney(G.budget);
  document.getElementById("gameWages").textContent = fmtMoney(computeWeeklyWages()) + "/wk";
  const standings = G.standings && G.standings[G.division];
  if (standings) {
    const list = Object.values(standings).sort((a,b)=>b.pts-a.pts || (b.gf-b.ga)-(a.gf-a.ga));
    const idx = list.findIndex(s => s.teamId === G.userTeamId);
    document.getElementById("gamePos").textContent = idx >= 0 ? "#" + (idx + 1) : "—";
  } else {
    document.getElementById("gamePos").textContent = "—";
  }
}

// --- TAB SWITCHING ---
let currentTab = "advance";
let currentSubTab = {};

function switchTab(name) {
  currentTab = name;
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab").forEach(t => {
    if (t.textContent.toLowerCase() === name.toLowerCase()) t.classList.add("active");
  });
  renderTab();
}

function renderTab() {
  if (G.endOfSeason) {
    renderEndOfSeason();
    return;
  }
  switch(currentTab) {
    case "advance": renderAdvance(); break;
    case "calendar": renderCalendar(); break;
    case "team": renderTeam(); break;
    case "market": renderMarket(); break;
    case "youth": renderYouth(); break;
    case "standings": renderStandings(); break;
    case "roster": renderRoster(); break;
    case "stats": renderStats(); break;
    case "stadium": renderStadium(); break;
    case "inbox": renderInbox(); break;
    case "settings": renderSettings(); break;
  }
  renderGameHeader();
}

// --- ADVANCE TAB ---
function renderAdvance() {
  // Self-heal: rebuild missing fixtures/standings before we read them
  if (!G.fixtures || !G.fixtures[G.division] || !G.standings || !G.standings[G.division]) {
    validateGameState();
  }
  const totalWeeks = G.division === "Premier League" ? 38 : 46;
  const myFix = getMyNextFixture();
  const lastResults = getMyLastResults(5);
  const standings = G.standings[G.division] || {};
  const list = Object.values(standings).sort((a,b)=>b.pts-a.pts || (b.gf-b.ga)-(a.gf-a.ga));
  const myRank = list.findIndex(s => s.teamId === G.userTeamId);
  const myStanding = myRank >= 0 ? list[myRank] : { pts:0, p:0, w:0, d:0, l:0, gf:0, ga:0 };
  const next = myRank > 0 ? list[myRank - 1] : null;

  let recentMatches = "";
  if (G.results.length > 0) {
    const last = G.results[0];
    recentMatches = last.results.filter(r => r.division === G.division).map(r => resultRowHTML(r)).join("");
  }

  const cupMatch = getCupMatchForWeek(G.week);
  const cupBanner = cupMatch ? `
    <div class="cup-banner ${CUP_INFO[cupMatch.cup].cls}">
      <div>
        <div class="cup-name">${CUP_INFO[cupMatch.cup].name}</div>
        <div class="cup-round">${euroRoundLabel ? euroRoundLabel(cupMatch.round) : cupMatch.round} · ${cupMatch.isHome ? "HOME" : "AWAY"} vs ${cupMatch.opponentName || (G.teams[cupMatch.opponentId] ? G.teams[cupMatch.opponentId].name : "—")}</div>
      </div>
      <div style="font-size:24px;">${cupMatch.cup === 'fa' ? '🏆' : cupMatch.cup === 'carabao' ? '🏅' : '⭐'}</div>
    </div>
  ` : "";
  const html = `
    ${cupBanner}
    <div class="card">
      <div class="card-title">Week ${G.week} of ${totalWeeks}</div>
      ${myFix ? `
        <div class="match-display">
          <div class="match-info">Next Fixture · Week ${G.week}</div>
          <div class="match-teams">
            ${myFix.isHome ? G.teams[G.userTeamId].name : G.teams[myFix.opponentId].name}
            vs
            ${myFix.isHome ? G.teams[myFix.opponentId].name : G.teams[G.userTeamId].name}
          </div>
          <div class="match-info">${myFix.isHome ? "Home" : "Away"} · ${G.teams[myFix.opponentId].name}</div>
        </div>
      ` : `<div class="match-info">No fixture this week</div>`}
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <div class="stat-label">Last 5 Results</div>
          <div class="result-badges">${lastResults.map(r => `<div class="result-badge result-${r}">${r}</div>`).join("")}</div>
        </div>
        <button class="btn btn-gold" onclick="doSimulateWeek()">SIMULATE WEEK</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">League Position</div>
      <div style="display:flex; gap:20px; flex-wrap:wrap;">
        <div class="stat-item"><div class="stat-label">Position</div><div class="stat-value">#${myRank >= 0 ? myRank+1 : "—"}</div></div>
        <div class="stat-item"><div class="stat-label">Points</div><div class="stat-value">${myStanding.pts}</div></div>
        <div class="stat-item"><div class="stat-label">P/W/D/L</div><div class="stat-value">${myStanding.p} / ${myStanding.w} / ${myStanding.d} / ${myStanding.l}</div></div>
        <div class="stat-item"><div class="stat-label">GF / GA</div><div class="stat-value">${myStanding.gf} / ${myStanding.ga}</div></div>
        ${next && next.teamId !== G.userTeamId && G.teams[next.teamId] ? `<div class="stat-item"><div class="stat-label">Above</div><div class="stat-value">${G.teams[next.teamId].name} (${next.pts}pts)</div></div>` : myRank === 0 ? `<div class="stat-item"><div class="stat-label">Position</div><div class="stat-value">League Leaders!</div></div>` : ""}
      </div>
    </div>

    ${recentMatches ? `<div class="card"><div class="card-title">Last Week's Results</div>${recentMatches}</div>` : ""}
  `;
  document.getElementById("tabContent").innerHTML = html;
}

function getMyNextFixture() {
  const weekIdx = G.week - 1;
  const rounds = G.fixtures && G.fixtures[G.division];
  if (!rounds || weekIdx >= rounds.length || !rounds[weekIdx]) return null;
  const match = rounds[weekIdx].matches.find(m => m[0] === G.userTeamId || m[1] === G.userTeamId);
  if (!match) return null;
  return {
    isHome: match[0] === G.userTeamId,
    opponentId: match[0] === G.userTeamId ? match[1] : match[0]
  };
}

function getMyLastResults(n) {
  const out = [];
  for (const w of G.results) {
    if (w.userResult) {
      const r = w.userResult;
      const isHome = r.homeId === G.userTeamId;
      const my = isHome ? r.goalsHome : r.goalsAway;
      const them = isHome ? r.goalsAway : r.goalsHome;
      if (my > them) out.push("W");
      else if (my < them) out.push("L");
      else out.push("D");
      if (out.length >= n) break;
    }
  }
  return out;
}

function resultRowHTML(r) {
  if (!r || !G.teams[r.homeId] || !G.teams[r.awayId]) return "";
  const home = G.teams[r.homeId].name;
  const away = G.teams[r.awayId].name;
  const isYou = r.homeId === G.userTeamId || r.awayId === G.userTeamId;
  return `<div class="result-row ${isYou?'you':''}">
    <span>${home}</span>
    <span style="font-weight:700;">${r.goalsHome} - ${r.goalsAway}</span>
    <span>${away}</span>
  </div>`;
}

