// --- INBOX TAB ---
function renderInbox() {
  const sub = currentSubTab.inbox || "messages";
  currentSubTab.inbox = sub;
  const unread = G.messages.filter(m => !m.read).length;
  document.getElementById("tabContent").innerHTML = `
    <div class="subtab-bar">
      <button class="subtab ${sub==='messages'?'active':''}" onclick="setSubTab('inbox','messages')">MESSAGES (${unread})</button>
      <button class="subtab ${sub==='awards'?'active':''}" onclick="setSubTab('inbox','awards')">AWARDS (${G.awards.length})</button>
      <button class="subtab ${sub==='bids'?'active':''}" onclick="setSubTab('inbox','bids')">BIDS (${G.incomingBids.length})</button>
    </div>
    <div id="inboxBody"></div>
  `;
  if (sub === "messages") renderInboxMessages();
  else if (sub === "awards") renderInboxAwards();
  else renderMarketBids();
}

function renderInboxMessages() {
  const body = document.getElementById("inboxBody");
  if (G.messages.length === 0) {
    body.innerHTML = `<div class="card" style="text-align:center; color:#8b949e;">No messages</div>`;
    return;
  }
  body.innerHTML = G.messages.slice(0, 30).map(m => `
    <div class="message-item ${m.read?'':'unread'}" onclick="readMessage(${m.id})">
      <div class="from">${m.from}</div>
      <div class="body">${m.body}</div>
      <div class="time">Season ${m.season} · Week ${m.week}</div>
    </div>
  `).join("");
}

function readMessage(id) {
  const m = G.messages.find(x => x.id === id);
  if (m) m.read = true;
  renderTab();
}

function renderInboxAwards() {
  const body = document.getElementById("inboxBody");
  if (G.awards.length === 0) {
    body.innerHTML = `<div class="card" style="text-align:center; color:#8b949e;">No awards yet. Perform well to earn trophies!</div>`;
    return;
  }
  body.innerHTML = G.awards.slice(0, 50).map(a => `
    <div class="award-card">
      <div class="award-icon">${a.icon}</div>
      <div style="flex:1;">
        <div class="award-name">${a.name}</div>
        <div class="award-recipient">${a.recipientName}</div>
        <div class="award-stat">${a.stat} · Season ${a.season}, Week ${a.week}</div>
      </div>
    </div>
  `).join("");
}

// --- END OF SEASON ---
function renderEndOfSeason() {
  const eos = G.endOfSeason;
  const team = G.teams[G.userTeamId];
  const seasonAwards = G.awards.filter(a => a.season === G.season).slice(0, 8);
  let resultText, resultColor;
  if (eos.gameOver) {
    resultText = "GAME OVER — Relegated to League Two";
    resultColor = "#da3633";
  } else if (eos.promoted) {
    resultText = `PROMOTED to ${G.division}!`;
    resultColor = "#238636";
  } else if (eos.relegated) {
    resultText = `RELEGATED to ${G.division}`;
    resultColor = "#da3633";
  } else {
    resultText = `Finished #${eos.finalRank} in ${eos.division}`;
    resultColor = "#d29922";
  }
  const html = `
    <div class="card" style="text-align:center;">
      <div style="font-size:24px; font-weight:900; color:#d29922; margin-bottom:8px;">END OF SEASON ${G.season}</div>
      <div style="font-size:18px; color:${resultColor}; margin-bottom:6px;">${resultText}</div>
      <div style="color:#8b949e;">${team.name} · Prize Money: ${fmtMoney(eos.prize)}</div>
      ${eos.euroQual ? `<div style="margin-top:10px; padding:8px 16px; border-radius:6px; display:inline-block; background:${eos.euroQual==='cl'?'rgba(40,53,147,0.4)':eos.euroQual==='el'?'rgba(239,108,0,0.3)':'rgba(56,142,60,0.3)'}; color:#fff; font-weight:700; font-size:14px;">⭐ QUALIFIED: ${CUP_INFO[eos.euroQual].name} next season!</div>` : ""}
    </div>

    <div class="card">
      <div class="card-title">Final Standings — ${eos.division}</div>
      <div style="overflow-x:auto;">
        <table class="standings">
          <thead><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>Pts</th></tr></thead>
          <tbody>
            ${eos.list.map((s, i) => {
              const t = G.teams[s.teamId];
              const isYou = s.teamId === G.userTeamId;
              return `<tr class="${isYou?'you':''}">
                <td>${i+1}</td><td>${t.name}</td><td>${s.p}</td><td>${s.w}</td><td>${s.d}</td><td>${s.l}</td><td>${s.gf}</td><td>${s.ga}</td><td><b>${s.pts}</b></td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>

    ${seasonAwards.length > 0 ? `
      <div class="card">
        <div class="card-title">Season Awards</div>
        ${seasonAwards.map(a => `
          <div class="award-card">
            <div class="award-icon">${a.icon}</div>
            <div style="flex:1;">
              <div class="award-name">${a.name}</div>
              <div class="award-recipient">${a.recipientName}</div>
              <div class="award-stat">${a.stat}</div>
            </div>
          </div>
        `).join("")}
      </div>
    ` : ""}

    <div style="text-align:center; margin:20px 0;">
      ${eos.gameOver
        ? `<button class="btn btn-red" onclick="restartFromGameOver()">New Game</button>`
        : `<button class="btn btn-gold" onclick="beginNewSeasonAndRender()">Begin New Season</button>`}
    </div>
  `;
  document.getElementById("tabContent").innerHTML = html;
}

function beginNewSeasonAndRender() {
  beginNewSeason();
  renderGameHeader();
  switchTab("advance");
}

function restartFromGameOver() {
  localStorage.removeItem("footballCEO_save");
  G = null;
  showScreen("welcome");
  initWelcome();
}

// --- MODAL ---
function showModal(html) {
  document.getElementById("modalContent").innerHTML = html;
  document.getElementById("modal").classList.add("active");
}
function closeModal() {
  document.getElementById("modal").classList.remove("active");
}
document.getElementById("modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") closeModal();
});

// --- STATS TAB ---
function renderStats() {
  const team = G.teams[G.userTeamId];
  // Aggregate user squad season + career stats
  const players = G.myPlayers.map(id => G.players[id]).filter(p => p);
  let seasonG=0, seasonA=0, seasonApps=0, seasonCS=0;
  let careerG=0, careerA=0, careerApps=0, careerCS=0;
  let allAwardIcons = [];
  players.forEach(p => {
    const s = G.playerStats[p.id] || {};
    const c = G.careerStats[p.id] || {};
    seasonG += s.goals || 0; seasonA += s.assists || 0; seasonApps += s.apps || 0; seasonCS += s.cleanSheets || 0;
    careerG += c.goals || 0; careerA += c.assists || 0; careerApps += c.apps || 0; careerCS += c.cleanSheets || 0;
    (p.awards || []).forEach(aid => {
      const aw = (G.awards || []).find(a => a.id === aid);
      if (aw) allAwardIcons.push({ icon: aw.icon, name: aw.name, recipient: p.name });
    });
  });
  // Cup trophies won
  const cupTrophies = [];
  Object.entries(G.cupResults || {}).forEach(([cup, r]) => {
    if (r && r.status === "won") cupTrophies.push({ icon: "🏆", name: CUP_INFO[cup]?.name || cup });
  });
  // League position so far
  const tableList = G.standings[G.division] ? Object.values(G.standings[G.division]).sort((a,b)=>b.pts-a.pts || (b.gf-b.ga)-(a.gf-a.ga)) : [];
  const myRank = tableList.findIndex(s => s.teamId === G.userTeamId) + 1;
  const myRow = tableList[myRank - 1];
  // Top scorer / top assister in squad
  const sorted = players.map(p => ({ p, s: G.playerStats[p.id] || {} }));
  const topScorer = sorted.slice().sort((a,b) => (b.s.goals||0) - (a.s.goals||0))[0];
  const topAssist = sorted.slice().sort((a,b) => (b.s.assists||0) - (a.s.assists||0))[0];
  const totalAwardsCount = allAwardIcons.length + cupTrophies.length;
  document.getElementById("tabContent").innerHTML = `
    <div class="card">
      <div class="card-title">${team.name} — Season ${G.season} (${G.seasonYear}-${(G.seasonYear+1).toString().slice(2)})</div>
      <div class="stat-row"><span>Current Division</span><span>${G.division}</span></div>
      <div class="stat-row"><span>League Position</span><span>${myRank ? `${myRank}${myRank===1?"st":myRank===2?"nd":myRank===3?"rd":"th"}` : "—"}</span></div>
      ${myRow ? `
      <div class="stat-row"><span>Played</span><span>${myRow.p}</span></div>
      <div class="stat-row"><span>Wins</span><span style="color:#2ea043;">${myRow.w}</span></div>
      <div class="stat-row"><span>Draws</span><span style="color:#d29922;">${myRow.d}</span></div>
      <div class="stat-row"><span>Losses</span><span style="color:#da3633;">${myRow.l}</span></div>
      <div class="stat-row"><span>Goal Difference</span><span>${(myRow.gf-myRow.ga)>=0?"+":""}${myRow.gf-myRow.ga}</span></div>
      <div class="stat-row"><span>Points</span><span style="font-weight:700;">${myRow.pts}</span></div>
      ` : ""}
      <div class="stat-row"><span>Current Loss Streak</span><span style="color:${(G.lossStreak||0)>=3?'#da3633':'#8b949e'};">${G.lossStreak || 0}</span></div>
    </div>

    <div class="card">
      <div class="card-title">Squad Season Stats</div>
      <div class="stat-row"><span>Appearances</span><span>${seasonApps}</span></div>
      <div class="stat-row"><span>Goals Scored</span><span>${seasonG}</span></div>
      <div class="stat-row"><span>Assists</span><span>${seasonA}</span></div>
      <div class="stat-row"><span>Clean Sheets</span><span>${seasonCS}</span></div>
      ${topScorer && topScorer.s.goals ? `<div class="stat-row"><span>Top Scorer</span><span>${topScorer.p.name} — ${topScorer.s.goals} goals</span></div>` : ""}
      ${topAssist && topAssist.s.assists ? `<div class="stat-row"><span>Top Assister</span><span>${topAssist.p.name} — ${topAssist.s.assists} assists</span></div>` : ""}
    </div>

    <div class="card">
      <div class="card-title">Squad Career Stats (since debut)</div>
      <div class="stat-row"><span>Career Appearances</span><span>${careerApps}</span></div>
      <div class="stat-row"><span>Career Goals</span><span>${careerG}</span></div>
      <div class="stat-row"><span>Career Assists</span><span>${careerA}</span></div>
      <div class="stat-row"><span>Career Clean Sheets</span><span>${careerCS}</span></div>
    </div>

    <div class="card">
      <div class="card-title">🏆 Trophies & Awards (${totalAwardsCount})</div>
      ${totalAwardsCount === 0 ? `<div style="color:#8b949e;">No trophies or awards yet. Keep winning!</div>` : `
        ${cupTrophies.length > 0 ? `
          <div style="margin-bottom:14px;">
            <div style="font-size:12px; color:#d29922; letter-spacing:1px; margin-bottom:6px;">CUP TROPHIES (${cupTrophies.length})</div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              ${cupTrophies.map(t => `<div style="background:#21262d; padding:8px 12px; border-radius:8px; border:1px solid #d29922;"><span style="font-size:18px;">${t.icon}</span> ${t.name}</div>`).join("")}
            </div>
          </div>
        ` : ""}
        ${allAwardIcons.length > 0 ? `
          <div>
            <div style="font-size:12px; color:#d29922; letter-spacing:1px; margin-bottom:6px;">PLAYER AWARDS (${allAwardIcons.length})</div>
            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:6px;">
              ${allAwardIcons.map(a => `<div style="background:#161b22; padding:6px 10px; border-radius:6px; font-size:12px; border:1px solid #30363d;"><span style="font-size:14px;">${a.icon}</span> ${a.name}<div style="color:#8b949e; font-size:10px;">${a.recipient}</div></div>`).join("")}
            </div>
          </div>
        ` : ""}
      `}
    </div>
  `;
}

// --- STADIUM TAB ---
const STADIUM_TIERS = [
  { tier: 1, capacity: 30000, name: "Basic Stadium" },
  { tier: 2, capacity: 45000, name: "Expanded Stadium",   cost: 80e6 },
  { tier: 3, capacity: 60000, name: "Modern Arena",       cost: 200e6 },
  { tier: 4, capacity: 75000, name: "Premium Stadium",    cost: 350e6 },
  { tier: 5, capacity: 90000, name: "World-Class Arena",  cost: 500e6 },
];

function renderStadium() {
  const s = G.stadium;
  const currentTier = STADIUM_TIERS.find(t => t.tier === s.tier) || STADIUM_TIERS[0];
  const nextTier = STADIUM_TIERS.find(t => t.tier === s.tier + 1);
  const avgGate = Math.round(s.capacity * 0.92);
  const matchRevenue = avgGate * (s.ticketPrice || 35);
  const last = G.lastGate;
  document.getElementById("tabContent").innerHTML = `
    <div class="card">
      <div class="card-title">${G.teams[G.userTeamId].name} Stadium</div>
      <div style="display:flex; gap:14px; flex-wrap:wrap; margin-bottom:10px;">
        <div><div class="stat-label">Current Tier</div><div style="font-weight:700;">${currentTier.name}</div></div>
        <div><div class="stat-label">Capacity</div><div style="font-weight:700;">${s.capacity.toLocaleString()}</div></div>
        <div><div class="stat-label">Ticket Price</div><div style="font-weight:700;">£${s.ticketPrice}</div></div>
      </div>
      <div class="stat-row"><span>Expected Attendance per Home Match</span><span>${avgGate.toLocaleString()} (92%)</span></div>
      <div class="stat-row"><span>Expected Gate Revenue per Home Match</span><span style="color:#2ea043; font-weight:700;">${fmtMoney(matchRevenue)}</span></div>
      ${last ? `<div class="stat-row"><span>Last Home Gate</span><span>${last.attendance.toLocaleString()} fans · ${fmtMoney(last.gate)}</span></div>` : ""}
    </div>

    <div class="card">
      <div class="card-title">Stadium Upgrade</div>
      ${nextTier ? `
        <div style="display:flex; align-items:center; gap:14px; padding:12px; background:#0d1117; border:1px solid #30363d; border-radius:10px; margin-bottom:10px;">
          <div style="flex:1;">
            <div style="font-weight:700; font-size:16px;">${nextTier.name}</div>
            <div style="color:#8b949e; font-size:13px;">Capacity: ${currentTier.capacity.toLocaleString()} → <span style="color:#2ea043;">${nextTier.capacity.toLocaleString()}</span> (+${(nextTier.capacity-currentTier.capacity).toLocaleString()} seats)</div>
            <div style="color:#8b949e; font-size:13px;">New gate per match: ~${fmtMoney(Math.round(nextTier.capacity * 0.92 * s.ticketPrice))}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:11px; color:#8b949e;">COST</div>
            <div style="font-size:18px; font-weight:700; color:#d29922;">${fmtMoney(nextTier.cost)}</div>
          </div>
        </div>
        <button class="btn btn-gold" style="width:100%;" onclick="upgradeStadium()" ${G.budget < nextTier.cost ? "disabled" : ""}>
          ${G.budget < nextTier.cost ? `Need ${fmtMoney(nextTier.cost - G.budget)} more` : `Upgrade for ${fmtMoney(nextTier.cost)}`}
        </button>
      ` : `<div style="color:#d29922; text-align:center; padding:14px; font-weight:700;">🏟️ MAX TIER — World-Class Arena</div>`}
    </div>

    <div class="card">
      <div class="card-title">Ticket Pricing</div>
      <div style="color:#8b949e; font-size:13px; margin-bottom:10px;">Higher prices = more revenue per fan, but lower attendance (currently fixed at 92%).</div>
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        ${[25, 35, 50, 75, 100, 150].map(price => `
          <button class="btn btn-sm ${s.ticketPrice === price ? 'btn-gold' : 'btn-ghost'}" onclick="setTicketPrice(${price})">£${price}</button>
        `).join("")}
      </div>
    </div>
  `;
}

function upgradeStadium() {
  const s = G.stadium;
  const next = STADIUM_TIERS.find(t => t.tier === s.tier + 1);
  if (!next) { toast("Already at max tier", "error"); return; }
  if (G.budget < next.cost) { toast("Not enough budget", "error"); return; }
  G.budget -= next.cost;
  s.tier = next.tier;
  s.capacity = next.capacity;
  toast(`Stadium upgraded to ${next.name}!`, "gold");
  addMessage("Board", `Stadium upgraded to ${next.name} — capacity ${next.capacity.toLocaleString()}.`);
  saveGame();
  renderStadium();
  renderGameHeader();
}

function setTicketPrice(price) {
  G.stadium.ticketPrice = price;
  toast(`Ticket price set to £${price}`, "gold");
  saveGame();
  renderStadium();
}

