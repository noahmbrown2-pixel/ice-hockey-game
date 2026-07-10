// --- CALENDAR TAB ---
function weekToDate(week) {
  // Season starts Aug 10. Each fixture week = +7 days.
  const start = new Date(G.seasonYear, 7, 10); // Aug 10
  const d = new Date(start);
  d.setDate(start.getDate() + (week - 1) * 7);
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

function renderCalendar() {
  const totalWeeks = G.division === "Premier League" ? 38 : 46;
  const rounds = (G.fixtures && G.fixtures[G.division]) || [];
  // Group weeks into 10 months (Aug → May)
  const monthNames = ["August","September","October","November","December","January","February","March","April","May"];
  const weeksPerMonth = totalWeeks / monthNames.length;
  // Build a map of played results by week → result for the user's match
  const userResultsByWeek = {};
  G.results.forEach(w => {
    if (w.userResult) userResultsByWeek[w.week] = w.userResult;
  });

  // Build month groupings
  const months = monthNames.map((name, idx) => {
    const startWeek = Math.floor(idx * weeksPerMonth) + 1;
    const endWeek = Math.min(totalWeeks, Math.floor((idx + 1) * weeksPerMonth));
    const weeks = [];
    for (let w = startWeek; w <= endWeek; w++) {
      const round = rounds[w - 1];
      if (!round) continue;
      const myMatch = round.matches.find(m => m[0] === G.userTeamId || m[1] === G.userTeamId);
      if (!myMatch) continue;
      const isHome = myMatch[0] === G.userTeamId;
      const opponentId = isHome ? myMatch[1] : myMatch[0];
      const result = userResultsByWeek[w];
      weeks.push({ week: w, isHome, opponentId, result });
    }
    return { name, startWeek, endWeek, weeks };
  });

  // Stats per month: W/D/L
  function monthStats(monthWeeks) {
    let w=0, d=0, l=0;
    monthWeeks.forEach(({ result, isHome }) => {
      if (!result) return;
      const my = isHome ? result.goalsHome : result.goalsAway;
      const them = isHome ? result.goalsAway : result.goalsHome;
      if (my > them) w++;
      else if (my < them) l++;
      else d++;
    });
    return { w, d, l, total: monthWeeks.length };
  }

  const teamName = G.teams[G.userTeamId].name;
  // Index cup matches by week for quick lookup
  const cupByWeek = {};
  (G.cupMatches || []).forEach(m => {
    if (!m.eliminated) {
      if (!cupByWeek[m.week]) cupByWeek[m.week] = [];
      cupByWeek[m.week].push(m);
    }
  });

  const euroLegendBadge = G.currentEuroComp ? `<span class="cup-banner cup-${G.currentEuroComp}" style="margin:0; padding:4px 8px; font-size:11px;">${CUP_INFO[G.currentEuroComp].name}</span>` : "";
  const cupLegend = `
    <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;">
      <span class="cup-banner cup-fa" style="margin:0; padding:4px 8px; font-size:11px;">FA CUP</span>
      <span class="cup-banner cup-carabao" style="margin:0; padding:4px 8px; font-size:11px;">CARABAO CUP</span>
      ${euroLegendBadge}
    </div>
  `;

  const html = `
    <div class="card" style="margin-bottom:14px;">
      <div class="card-title">Season ${G.seasonYear}-${(G.seasonYear+1).toString().slice(2)} · ${G.division}</div>
      <div style="color:#8b949e; font-size:13px;">All ${teamName} fixtures for the season. Cup matches have colored headlines. Current week is highlighted in gold.</div>
      ${cupLegend}
    </div>
    ${months.map(m => {
      if (m.weeks.length === 0) return "";
      const stats = monthStats(m.weeks);
      const played = stats.w + stats.d + stats.l;
      return `
        <div class="cal-month">
          <div class="cal-month-title">
            <span>${m.name}</span>
            <span class="cal-month-stats">${played}/${m.weeks.length} played${played > 0 ? ` · ${stats.w}W ${stats.d}D ${stats.l}L` : ""}</span>
          </div>
          ${m.weeks.map(({ week, isHome, opponentId, result }) => {
            const opp = G.teams[opponentId] ? G.teams[opponentId].name : "—";
            let scoreCell;
            let rowClass = "you";
            if (result) {
              const my = isHome ? result.goalsHome : result.goalsAway;
              const them = isHome ? result.goalsAway : result.goalsHome;
              const cls = my > them ? "win" : my < them ? "loss" : "draw";
              scoreCell = `<div class="cal-score ${cls}">${result.goalsHome}-${result.goalsAway}</div>`;
              rowClass += " played";
            } else if (week === G.week) {
              scoreCell = `<div class="cal-score future">vs</div>`;
              rowClass += " current";
            } else {
              scoreCell = `<div class="cal-score future">vs</div>`;
              rowClass += " upcoming";
            }
            const homeTeamName = isHome ? teamName : opp;
            const awayTeamName = isHome ? opp : teamName;
            const leagueRow = `
              <div class="cal-week-row ${rowClass}">
                <span class="cal-week-num">Wk ${week}<br><span style="font-size:9px; color:#8b949e; font-weight:normal;">${weekToDate(week)}</span></span>
                <span class="cal-home">${homeTeamName}</span>
                ${scoreCell}
                <span class="cal-away">${awayTeamName}</span>
                <span><span class="cal-venue ${isHome ? "home" : "away"}">${isHome ? "HOME" : "AWAY"}</span></span>
              </div>
            `;
            // Cup banner(s) appearing in the same week
            const cupRows = (cupByWeek[week] || []).map(cm => {
              const ci = CUP_INFO[cm.cup];
              const cOpp = cm.opponentName || (G.teams[cm.opponentId] ? G.teams[cm.opponentId].name : "—");
              let cScore;
              if (cm.played && cm.result) {
                const myG = cm.isHome ? cm.result.goalsHome : cm.result.goalsAway;
                const thG = cm.isHome ? cm.result.goalsAway : cm.result.goalsHome;
                const cls = myG > thG ? "win" : myG < thG ? "loss" : "draw";
                cScore = `<div class="cal-score ${cls}">${cm.result.goalsHome}-${cm.result.goalsAway}</div>`;
              } else {
                cScore = `<div class="cal-score future">vs</div>`;
              }
              const cHome = cm.isHome ? teamName : cOpp;
              const cAway = cm.isHome ? cOpp : teamName;
              return `
                <div class="cup-banner ${ci.cls}" style="margin:6px 0 6px 0; padding:6px 10px; font-size:12px;">
                  <div>
                    <span class="cup-name">${ci.name}</span>
                    <span class="cup-round" style="margin-left:6px;">· ${cm.round}</span>
                  </div>
                </div>
                <div class="cal-week-row you ${cm.played ? 'played' : 'upcoming'}">
                  <span class="cal-week-num">Wk ${week}<br><span style="font-size:9px; color:#8b949e; font-weight:normal;">${weekToDate(week)}</span></span>
                  <span class="cal-home">${cHome}</span>
                  ${cScore}
                  <span class="cal-away">${cAway}</span>
                  <span><span class="cal-venue ${cm.isHome ? "home" : "away"}">${cm.isHome ? "HOME" : "AWAY"}</span></span>
                </div>
              `;
            }).join("");
            return leagueRow + cupRows;
          }).join("")}
        </div>
      `;
    }).join("")}
  `;
  document.getElementById("tabContent").innerHTML = html;
}

// --- TEAM / FORMATION TAB ---
const FORMATIONS = {
  "4-3-3": {
    name: "4-3-3",
    slots: [
      { role: "GK",  groups: ["GK"],            x: 50, y: 92 },
      { role: "LB",  groups: ["LB","LWB","CB"], x: 15, y: 73 },
      { role: "CB",  groups: ["CB","SW"],       x: 38, y: 76 },
      { role: "CB",  groups: ["CB","SW"],       x: 62, y: 76 },
      { role: "RB",  groups: ["RB","RWB","CB"], x: 85, y: 73 },
      { role: "CM",  groups: ["CM","CDM","CAM"],x: 25, y: 52 },
      { role: "CM",  groups: ["CM","CDM"],      x: 50, y: 55 },
      { role: "CM",  groups: ["CM","CAM"],      x: 75, y: 52 },
      { role: "LW",  groups: ["LW","LM"],       x: 18, y: 26 },
      { role: "ST",  groups: ["ST","CF","SS"],  x: 50, y: 18 },
      { role: "RW",  groups: ["RW","RM"],       x: 82, y: 26 }
    ]
  },
  "4-4-2": {
    name: "4-4-2",
    slots: [
      { role: "GK",  groups: ["GK"],            x: 50, y: 92 },
      { role: "LB",  groups: ["LB","LWB","CB"], x: 15, y: 73 },
      { role: "CB",  groups: ["CB","SW"],       x: 38, y: 76 },
      { role: "CB",  groups: ["CB","SW"],       x: 62, y: 76 },
      { role: "RB",  groups: ["RB","RWB","CB"], x: 85, y: 73 },
      { role: "LM",  groups: ["LM","LW"],       x: 15, y: 48 },
      { role: "CM",  groups: ["CM","CDM"],      x: 38, y: 52 },
      { role: "CM",  groups: ["CM","CAM"],      x: 62, y: 52 },
      { role: "RM",  groups: ["RM","RW"],       x: 85, y: 48 },
      { role: "ST",  groups: ["ST","CF","SS"],  x: 36, y: 20 },
      { role: "ST",  groups: ["ST","CF","SS"],  x: 64, y: 20 }
    ]
  },
  "4-2-3-1": {
    name: "4-2-3-1",
    slots: [
      { role: "GK",  groups: ["GK"],            x: 50, y: 92 },
      { role: "LB",  groups: ["LB","LWB","CB"], x: 15, y: 73 },
      { role: "CB",  groups: ["CB","SW"],       x: 38, y: 76 },
      { role: "CB",  groups: ["CB","SW"],       x: 62, y: 76 },
      { role: "RB",  groups: ["RB","RWB","CB"], x: 85, y: 73 },
      { role: "CDM", groups: ["CDM","CM"],      x: 36, y: 56 },
      { role: "CDM", groups: ["CDM","CM"],      x: 64, y: 56 },
      { role: "LW",  groups: ["LW","LM","CAM"], x: 18, y: 34 },
      { role: "CAM", groups: ["CAM","CM","SS"], x: 50, y: 36 },
      { role: "RW",  groups: ["RW","RM","CAM"], x: 82, y: 34 },
      { role: "ST",  groups: ["ST","CF","SS"],  x: 50, y: 16 }
    ]
  },
  "3-5-2": {
    name: "3-5-2",
    slots: [
      { role: "GK",  groups: ["GK"],            x: 50, y: 92 },
      { role: "CB",  groups: ["CB","SW"],       x: 25, y: 76 },
      { role: "CB",  groups: ["CB","SW"],       x: 50, y: 78 },
      { role: "CB",  groups: ["CB","SW"],       x: 75, y: 76 },
      { role: "LWB", groups: ["LWB","LB","LM"], x: 12, y: 52 },
      { role: "CM",  groups: ["CM","CDM"],      x: 32, y: 54 },
      { role: "CM",  groups: ["CM","CAM"],      x: 50, y: 56 },
      { role: "CM",  groups: ["CM","CAM"],      x: 68, y: 54 },
      { role: "RWB", groups: ["RWB","RB","RM"], x: 88, y: 52 },
      { role: "ST",  groups: ["ST","CF","SS"],  x: 36, y: 20 },
      { role: "ST",  groups: ["ST","CF","SS"],  x: 64, y: 20 }
    ]
  }
};

// Pick the best formation given the user's squad composition
function pickBestFormation() {
  const players = G.myPlayers.map(id => G.players[id]).filter(p => p);
  const have = { LW:0, RW:0, ST:0, CAM:0, CDM:0, LB:0, RB:0, LWB:0, RWB:0, CB:0, CM:0, LM:0, RM:0, CF:0, SS:0, SW:0, GK:0 };
  players.forEach(p => { if (have[p.position] !== undefined) have[p.position]++; });
  // Quick heuristic
  if (have.LW >= 1 && have.RW >= 1) return "4-3-3";
  if ((have.LWB + have.RWB) >= 1 && have.CB >= 3) return "3-5-2";
  if ((have.CAM + have.SS) >= 1 && have.CDM >= 1) return "4-2-3-1";
  return "4-4-2";
}

// For a given formation, assign the best-fitting players to each slot (no duplicates)
function pickStartingXI(formationKey) {
  const formation = FORMATIONS[formationKey];
  const players = G.myPlayers.map(id => G.players[id]).filter(p => p);
  const used = new Set();
  const lineup = [];
  formation.slots.forEach((slot, idx) => {
    const manualId = G.manualSlots && G.manualSlots[idx];
    if (manualId && G.myPlayers.includes(manualId) && !used.has(manualId)) {
      used.add(manualId);
      lineup.push({ slot, player: G.players[manualId] || null, slotIdx: idx });
      return;
    }
    const candidates = players.filter(p => !used.has(p.id) && slot.groups.includes(p.position));
    let chosen;
    if (candidates.length) {
      candidates.sort((a, b) => b.rating - a.rating);
      chosen = candidates[0];
    } else {
      const fallback = players.filter(p => !used.has(p.id));
      fallback.sort((a, b) => b.rating - a.rating);
      chosen = fallback[0] || null;
    }
    if (chosen) used.add(chosen.id);
    lineup.push({ slot, player: chosen, slotIdx: idx });
  });
  const subs = players.filter(p => !used.has(p.id)).sort((a, b) => b.rating - a.rating);
  return { lineup, subs };
}

function renderTeam() {
  const headCoach = G.myCoaches.map(id => G.coaches[id]).find(c => c && c.role === "Head Coach");
  if (!G.userFormation) G.userFormation = pickBestFormation();
  const formationKey = G.userFormation;
  const { lineup, subs } = pickStartingXI(formationKey);
  const myTeamRating = teamRating(G.teams[G.userTeamId]);
  const hasManual = G.manualSlots && Object.keys(G.manualSlots).length > 0;

  const formationOptions = Object.keys(FORMATIONS).map(k =>
    `<option value="${k}" ${k === formationKey ? 'selected' : ''}>${k}</option>`
  ).join("");

  const html = `
    <div class="card">
      <div class="card-title">${G.teams[G.userTeamId].name} — Starting XI</div>
      <div style="display:flex; gap:14px; flex-wrap:wrap; align-items:center; margin-bottom:10px;">
        <div>
          <div class="stat-label">Head Coach</div>
          <div style="font-weight:700;">${headCoach ? headCoach.name : "— None hired —"}</div>
        </div>
        <div>
          <div class="stat-label">Squad Strength</div>
          <div>${starsHTML(myTeamRating)}</div>
        </div>
        <div>
          <div class="stat-label">Formation</div>
          <select onchange="setFormation(this.value)" style="background:#0d1117; color:#e6edf3; border:1px solid #30363d; padding:6px 10px; border-radius:6px;">
            ${formationOptions}
          </select>
        </div>
        ${hasManual ? `<button class="btn btn-sm btn-ghost" onclick="clearAllSlots()">Reset to Auto</button>` : ''}
      </div>
    </div>

    <div class="card">
      <div class="pitch">
        <div class="pitch-box top"></div>
        <div class="pitch-box bottom"></div>
        ${lineup.map(({ slot, player, slotIdx }) => `
          <div class="pitch-slot" style="left:${slot.x}%; top:${slot.y}%; cursor:pointer;" onclick="showSlotPicker(${slotIdx})">
            ${player ? `
              <img src="${player.avatar}" alt="" style="width:38px;height:38px;border-radius:50%;border:2px solid #2ea043;">
              <div class="ppos">${slot.role}</div>
              <div class="pname">${player.lastName || player.name}</div>
              <div class="prating">${player.rating}</div>
            ` : `
              <div style="width:38px;height:38px;border-radius:50%;border:2px dashed rgba(255,255,255,0.3);margin:0 auto;" onclick="showSlotPicker(${slotIdx})"></div>
              <div class="ppos">${slot.role}</div>
              <div class="pname" style="color:#aaa;">(tap to set)</div>
            `}
          </div>
        `).join("")}
      </div>
    </div>

    <div class="card">
      <div class="card-title">Substitutes (${subs.length})</div>
      ${subs.length === 0 ? '<div style="color:#8b949e;">No substitutes — your full squad is starting.</div>' : `
        <div class="subs-list">
          ${subs.map(p => `
            <div class="sub-card" style="cursor:default;">
              <img src="${p.avatar}" alt="" style="border-radius:50%;border:2px solid #2ea043;">
              <div class="info" style="flex:1;">
                <div class="nm">${p.name}</div>
                <div class="mt"><span class="player-pos">${p.position}</span> · ${p.rating}</div>
              </div>
              <button class="btn btn-sm btn-ghost" style="font-size:11px;padding:4px 8px;" onclick="showMoveToStarting(${p.id})">▲ Start</button>
            </div>
          `).join("")}
        </div>
      `}
    </div>
  `;
  document.getElementById("tabContent").innerHTML = html;
}

function showSlotPicker(slotIdx) {
  const formation = FORMATIONS[G.userFormation || pickBestFormation()];
  const slot = formation.slots[slotIdx];
  const { lineup } = pickStartingXI(G.userFormation || pickBestFormation());
  const usedIds = new Set(lineup.map(l => l.player?.id).filter((id,i) => i !== slotIdx && id != null));
  const available = G.myPlayers.map(id => G.players[id]).filter(p => p && !usedIds.has(p.id))
    .sort((a,b) => {
      const aFit = slot.groups.includes(a.position) ? 1 : 0;
      const bFit = slot.groups.includes(b.position) ? 1 : 0;
      return bFit - aFit || b.rating - a.rating;
    });
  const currentPlayer = lineup[slotIdx]?.player;
  const html = `
    <button class="modal-close" onclick="closeModal()">×</button>
    <div class="card-title" style="margin-bottom:12px;">Select player for ${slot.role}</div>
    ${currentPlayer ? `
      <div style="margin-bottom:10px; padding:8px; background:#21262d; border-radius:6px; display:flex; align-items:center; gap:8px;">
        <img src="${currentPlayer.avatar}" style="width:36px;height:36px;border-radius:50%;">
        <span style="color:#8b949e; font-size:12px;">Current: ${currentPlayer.name}</span>
        <button class="btn btn-sm btn-ghost" style="margin-left:auto;font-size:11px;" onclick="clearSlot(${slotIdx})">Auto-pick</button>
      </div>
    ` : ''}
    <div style="max-height:340px; overflow-y:auto;">
      ${available.map(p => {
        const fit = slot.groups.includes(p.position);
        return `<div onclick="setSlotPlayer(${slotIdx},${p.id})" style="display:flex;align-items:center;gap:10px;padding:8px;cursor:pointer;border-radius:6px;margin-bottom:4px;background:#161b22;border:1px solid ${fit?'#2ea043':'#30363d'};" onmouseover="this.style.background='#21262d'" onmouseout="this.style.background='#161b22'">
          <img src="${p.avatar}" style="width:40px;height:40px;border-radius:50%;border:2px solid #2ea043;">
          <div style="flex:1;">
            <div style="font-weight:600;font-size:13px;">${p.name} ${fit ? '<span style="color:#2ea043;font-size:10px;">✓ natural</span>' : '<span style="color:#8b949e;font-size:10px;">out of pos</span>'}</div>
            <div style="font-size:11px;color:#8b949e;">${p.position} · ${p.rating} rating</div>
          </div>
        </div>`;
      }).join("")}
    </div>
  `;
  showModal(html);
}

function showMoveToStarting(pid) {
  const p = G.players[pid];
  if (!p) return;
  const formation = FORMATIONS[G.userFormation || pickBestFormation()];
  const html = `
    <button class="modal-close" onclick="closeModal()">×</button>
    <div class="card-title" style="margin-bottom:12px;">Move ${p.name} to Starting XI</div>
    <div style="margin-bottom:10px; display:flex; align-items:center; gap:10px; padding:10px; background:#21262d; border-radius:8px;">
      <img src="${p.avatar}" style="width:44px;height:44px;border-radius:50%;">
      <div><div style="font-weight:600;">${p.name}</div><div style="font-size:12px;color:#8b949e;">${p.position} · ${p.rating} rating</div></div>
    </div>
    <div style="color:#8b949e;font-size:12px;margin-bottom:8px;">Pick a slot to replace:</div>
    <div style="max-height:320px;overflow-y:auto;">
      ${formation.slots.map((slot, idx) => {
        const { lineup } = pickStartingXI(G.userFormation || pickBestFormation());
        const cur = lineup[idx]?.player;
        return `<div onclick="setSlotPlayer(${idx},${pid})" style="display:flex;align-items:center;gap:10px;padding:8px;cursor:pointer;border-radius:6px;margin-bottom:4px;background:#161b22;border:1px solid #30363d;" onmouseover="this.style.background='#21262d'" onmouseout="this.style.background='#161b22'">
          <div style="width:36px;text-align:center;font-size:11px;color:#8b949e;font-weight:700;">${slot.role}</div>
          ${cur ? `<img src="${cur.avatar}" style="width:34px;height:34px;border-radius:50%;"><div style="font-size:12px;">${cur.name} <span style="color:#8b949e;">(${cur.rating})</span></div>` : `<div style="font-size:12px;color:#8b949e;">(empty)</div>`}
        </div>`;
      }).join("")}
    </div>
  `;
  showModal(html);
}

function setSlotPlayer(slotIdx, playerId) {
  if (!G.manualSlots) G.manualSlots = {};
  // Remove this player from any other manual slot
  Object.keys(G.manualSlots).forEach(k => { if (G.manualSlots[k] === playerId) delete G.manualSlots[k]; });
  G.manualSlots[slotIdx] = playerId;
  saveGame();
  closeModal();
  renderTeam();
}

function clearSlot(slotIdx) {
  if (G.manualSlots) delete G.manualSlots[slotIdx];
  saveGame();
  closeModal();
  renderTeam();
}

function clearAllSlots() {
  G.manualSlots = {};
  saveGame();
  renderTeam();
}

function setFormation(key) {
  G.userFormation = key;
  saveGame();
  renderTeam();
}

// Repair game state if anything required is missing — old saves, post-promotion, etc.
function validateGameState() {
  if (!G.teams || Object.keys(G.teams).length === 0) {
    console.warn("No teams in state — cannot validate");
    return false;
  }
  if (!G.fixtures) G.fixtures = {};
  if (!G.standings) G.standings = {};
  if (!G.results) G.results = [];
  if (!G.euroLeagues) setupEuropeanLeagues();
  if (!G.euroComp && G.currentEuroComp) setupEuroCompetitions();
  if (!G.messages) G.messages = [];
  if (!G.awards) G.awards = [];
  if (!G.incomingBids) G.incomingBids = [];
  if (!G.transferList) G.transferList = [];
  if (!G.youthPlayers) G.youthPlayers = [];
  if (!G.playerStats) G.playerStats = {};
  if (!G.careerStats) G.careerStats = {};
  // Ensure current division has fixtures and standings
  const divs = ["Premier League", "Championship", "League One"];
  let needsFixtures = false;
  divs.forEach(d => {
    if (!G.fixtures[d] || !Array.isArray(G.fixtures[d]) || G.fixtures[d].length === 0) needsFixtures = true;
    if (!G.standings[d]) needsFixtures = true;
  });
  if (needsFixtures) {
    console.log("Rebuilding fixtures and standings...");
    setupAllFixtures();
  }
  // Ensure every player in myPlayers has stats entries
  G.myPlayers.forEach(id => {
    if (!G.playerStats[id]) G.playerStats[id] = { apps:0, goals:0, assists:0, cleanSheets:0, rating:6.5 };
    if (!G.careerStats[id]) G.careerStats[id] = { apps:0, goals:0, assists:0, cleanSheets:0 };
  });
  if (!G.manualSlots) G.manualSlots = {};
  if (G.lossStreak === undefined) G.lossStreak = 0;
  if (!G.stadium) G.stadium = { capacity: 30000, tier: 1, ticketPrice: 35 };
  // Same for every AI player still on a team
  Object.values(G.teams).forEach(t => {
    (t.players || []).forEach(id => {
      if (!G.playerStats[id]) G.playerStats[id] = { apps:0, goals:0, assists:0, cleanSheets:0, rating:6.5 };
      if (!G.careerStats[id]) G.careerStats[id] = { apps:0, goals:0, assists:0, cleanSheets:0 };
    });
  });
  return true;
}

function doSimulateWeek() {
  try {
    if (!validateGameState()) {
      toast("Game state is incomplete — please start a New Game", "error");
      return;
    }
    const res = simulateWeek();
    if (res.endOfSeason) {
      renderEndOfSeason();
      return;
    }
    if (res.userResult) {
      const r = res.userResult;
      const isHome = r.homeId === G.userTeamId;
      const my = isHome ? r.goalsHome : r.goalsAway;
      const them = isHome ? r.goalsAway : r.goalsHome;
      const opp = isHome ? G.teams[r.awayId].name : G.teams[r.homeId].name;
      let outcome = my > them ? "WON" : my < them ? "LOST" : "DREW";
      toast(`${outcome} ${my}-${them} vs ${opp}`, my > them ? "gold" : my < them ? "error" : "ok");
      showMatchModal(r, res.cupResult);
    } else if (res.cupResult) {
      // Only a cup match this week
      showMatchModal(res.cupResult, res.cupResult);
    } else {
      toast(`Week ${G.week - 1} simulated — no fixture this week`, "ok");
    }
    renderTab();
  } catch (err) {
    console.error("Simulate week failed:", err);
    toast("Simulation error: " + err.message, "error");
    alert("Simulation error — open browser console (F12) for details:\n\n" + err.message);
  }
}

function showMatchModal(r, cupCtx) {
  const isHome = r.homeId === G.userTeamId;
  const my = isHome ? r.goalsHome : r.goalsAway;
  const them = isHome ? r.goalsAway : r.goalsHome;
  // Euro AI match — opponent not in G.teams
  const opp = r.euroOpponentName
    || (isHome ? (G.teams[r.awayId] ? G.teams[r.awayId].name : "—") : (G.teams[r.homeId] ? G.teams[r.homeId].name : "—"));
  const myName = G.teams[G.userTeamId].name;
  const myScorers = isHome ? r.homeScorers : r.awayScorers;
  const theirScorers = isHome ? r.awayScorers : r.homeScorers;
  const myRatings = isHome ? r.homeMatchRatings : r.awayMatchRatings;
  const theirRatings = isHome ? r.awayMatchRatings : r.homeMatchRatings;
  const myBest = isHome ? r.homeBest : r.awayBest;
  const theirBest = isHome ? r.awayBest : r.homeBest;
  const isCup = cupCtx && cupCtx.cup;
  const cupInfo = isCup ? CUP_INFO[cupCtx.cup] : null;
  // Player of the Match = higher rated of the two
  const motm = (myBest && theirBest)
    ? (myBest.rating >= theirBest.rating ? { ...myBest, team: myName, isYou: true } : { ...theirBest, team: opp, isYou: false })
    : null;
  // Top 3 from user team
  const myTop3 = [...(myRatings || [])].sort((a, b) => b.rating - a.rating).slice(0, 3);
  // Get player avatars
  const playerAvatar = pid => {
    const p = G.players[pid];
    return p ? p.avatar : "";
  };
  const ratingColor = rt => rt >= 8.5 ? "#d29922" : rt >= 7.5 ? "#2ea043" : rt >= 6.5 ? "#e6edf3" : "#8b949e";
  const html = `
    <button class="modal-close" onclick="closeModal()">×</button>
    ${isCup ? `
      <div class="cup-banner ${cupInfo.cls}" style="margin-bottom:0; border-radius:8px 8px 0 0;">
        <div>
          <div class="cup-name">${cupInfo.name}</div>
          <div class="cup-round">${cupCtx.round}</div>
        </div>
        <div style="font-size:24px;">${cupCtx.cup === 'fa' ? '🏆' : cupCtx.cup === 'carabao' ? '🏅' : '⭐'}</div>
      </div>
    ` : ""}
    <div class="match-display" style="margin:0 0 16px 0; ${isCup ? "border-radius:0 0 8px 8px;" : ""}">
      <div class="match-info">FULL TIME · Week ${r.week}</div>
      <div class="match-teams">${isHome ? myName : opp}<br>vs<br>${isHome ? opp : myName}</div>
      <div class="match-score" style="color:${my > them ? '#2ea043' : my < them ? '#f85149' : '#d29922'};">${r.goalsHome} - ${r.goalsAway}</div>
      <div class="match-info" style="font-size:14px; font-weight:700;">${my > them ? "VICTORY 🏆" : my < them ? "DEFEAT" : "DRAW"}</div>
    </div>

    ${motm ? `
      <div style="background:linear-gradient(135deg, #2a2515, #1a1810); border:1px solid #d29922; border-radius:10px; padding:14px; margin-bottom:14px; display:flex; align-items:center; gap:14px;">
        <img src="${playerAvatar(motm.playerId)}" style="width:56px; height:56px; border-radius:50%; border:2px solid #d29922;">
        <div style="flex:1;">
          <div style="font-size:11px; color:#d29922; font-weight:700; letter-spacing:1px;">⭐ PLAYER OF THE MATCH</div>
          <div style="font-size:17px; font-weight:700; margin-top:2px;">${motm.name} <span style="color:#8b949e; font-size:13px; font-weight:400;">· ${motm.position}</span></div>
          <div style="font-size:12px; color:#8b949e; margin-top:2px;">${motm.team}${motm.goals ? ` · ${motm.goals}⚽` : ''}${motm.assists ? ` · ${motm.assists}🅰️` : ''}${motm.cleanSheet ? ` · 🧤 CS` : ''}</div>
        </div>
        <div style="font-size:28px; font-weight:900; color:#d29922;">${motm.rating.toFixed(1)}</div>
      </div>
    ` : ""}

    ${myBest && (!motm || !motm.isYou) ? `
      <div style="background:#161b22; border:1px solid #30363d; border-left:3px solid #2ea043; border-radius:8px; padding:12px; margin-bottom:14px; display:flex; align-items:center; gap:12px;">
        <img src="${playerAvatar(myBest.playerId)}" style="width:44px; height:44px; border-radius:50%;">
        <div style="flex:1;">
          <div style="font-size:10px; color:#2ea043; font-weight:700; letter-spacing:1px;">YOUR BEST PLAYER</div>
          <div style="font-size:15px; font-weight:700;">${myBest.name} <span style="color:#8b949e; font-size:12px; font-weight:400;">· ${myBest.position}</span></div>
          <div style="font-size:11px; color:#8b949e;">${myBest.goals ? `${myBest.goals}⚽ ` : ''}${myBest.assists ? `${myBest.assists}🅰️ ` : ''}${myBest.cleanSheet ? '🧤 CS ' : ''}${!myBest.goals && !myBest.assists && !myBest.cleanSheet ? 'Strong all-round performance' : ''}</div>
        </div>
        <div style="font-size:22px; font-weight:900; color:${ratingColor(myBest.rating)};">${myBest.rating.toFixed(1)}</div>
      </div>
    ` : ""}

    <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:14px;">
      <div style="flex:1; min-width:200px;">
        <div class="card-title">${myName} Scorers</div>
        ${myScorers.map(s => `<div class="stat-row"><span>⚽ ${s.name}</span><span style="font-size:11px; color:#8b949e;">${s.assistName ? 'asst: ' + s.assistName : ''}</span></div>`).join("") || '<div class="stat-row"><span style="color:#8b949e;">No goals</span></div>'}
      </div>
      <div style="flex:1; min-width:200px;">
        <div class="card-title">${opp} Scorers</div>
        ${theirScorers.map(s => `<div class="stat-row"><span>⚽ ${s.name}</span><span></span></div>`).join("") || '<div class="stat-row"><span style="color:#8b949e;">No goals</span></div>'}
      </div>
    </div>

    ${myTop3.length > 0 ? `
      <div class="card-title">${myName} Top Performers</div>
      <div style="margin-bottom:14px;">
        ${myTop3.map((pr, i) => `
          <div class="stat-row">
            <span><span style="color:#d29922; font-weight:700; margin-right:8px;">${i+1}.</span>${pr.name} <span style="font-size:11px; color:#8b949e;">${pr.position}</span></span>
            <span style="font-weight:700; color:${ratingColor(pr.rating)};">${pr.rating.toFixed(1)}</span>
          </div>
        `).join("")}
      </div>
    ` : ""}

    <div style="text-align:center; margin-top:16px;">
      <button class="btn" onclick="closeModal()">Continue</button>
    </div>
  `;
  showModal(html);
}

