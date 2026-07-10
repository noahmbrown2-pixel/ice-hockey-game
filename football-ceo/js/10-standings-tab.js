// --- STANDINGS TAB ---
function renderStandings() {
  const sub = currentSubTab.standings || "your";
  currentSubTab.standings = sub;
  const euroSubtabs = Object.keys(EURO_LEAGUE_DATA).map(ln => {
    const key = 'euro_' + ln.replace(/\s+/g,'_');
    return `<button class="subtab ${sub===key?'active':''}" onclick="setSubTab('standings','${key}')">${EURO_LEAGUE_DATA[ln].flag} ${ln}</button>`;
  }).join("");
  const euroCompSub = `<button class="subtab ${sub==='eurocomp'?'active':''}" onclick="setSubTab('standings','eurocomp')">⭐ EUROPEAN CUPS</button>`;
  let body = "";
  if (sub === "your" || sub === "pl" || sub === "ch" || sub === "l1") {
    let division;
    if (sub === "your") division = G.division;
    else if (sub === "pl") division = "Premier League";
    else if (sub === "ch") division = "Championship";
    else division = "League One";
    body = renderStandingsTable(division);
  } else if (sub === "eurocomp") {
    body = renderEuroCompetitionsStandings();
  } else if (sub.startsWith("euro_")) {
    const ln = sub.replace("euro_","").replace(/_/g," ");
    // Find exact key
    const realKey = Object.keys(EURO_LEAGUE_DATA).find(k => k.replace(/\s+/g,'_') === sub.replace("euro_",""));
    body = renderEuroLeagueTable(realKey || ln);
  }
  document.getElementById("tabContent").innerHTML = `
    <div class="subtab-bar">
      <button class="subtab ${sub==='your'?'active':''}" onclick="setSubTab('standings','your')">YOUR LEAGUE</button>
      <button class="subtab ${sub==='pl'?'active':''}" onclick="setSubTab('standings','pl')">PREMIER LEAGUE</button>
      <button class="subtab ${sub==='ch'?'active':''}" onclick="setSubTab('standings','ch')">CHAMPIONSHIP</button>
      <button class="subtab ${sub==='l1'?'active':''}" onclick="setSubTab('standings','l1')">LEAGUE ONE</button>
      ${euroSubtabs}
      ${euroCompSub}
    </div>
    <div id="standingsBody">${body}</div>
  `;
}

function renderStandingsTable(division) {
  const standings = G.standings[division];
  if (!standings) return "";
  const list = Object.values(standings).sort((a,b)=>{
    if (b.pts !== a.pts) return b.pts - a.pts;
    if ((b.gf - b.ga) !== (a.gf - a.ga)) return (b.gf-b.ga) - (a.gf-a.ga);
    return b.gf - a.gf;
  });
  let promoZone, playoffZone, relegZone;
  if (division === "Premier League") {
    promoZone = [0, 1, 2, 3]; // CL
    playoffZone = [4, 5, 6];  // EL (4-5) + UECL (6)
    relegZone = [17, 18, 19];
  } else if (division === "Championship") {
    promoZone = [0, 1];
    playoffZone = [2, 3, 4, 5];
    relegZone = [21, 22, 23];
  } else {
    promoZone = [0, 1];
    playoffZone = [2, 3, 4, 5];
    relegZone = [20, 21, 22, 23];
  }
  return `
    <div class="card" style="padding:0; overflow-x:auto;">
      <table class="standings">
        <thead><tr><th>#</th><th>Team</th><th>Strength</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr></thead>
        <tbody>
          ${list.map((s, i) => {
            const team = G.teams[s.teamId];
            let cls = "";
            if (promoZone.includes(i)) cls = "promotion";
            else if (playoffZone.includes(i)) cls = "playoff";
            else if (relegZone.includes(i)) cls = "relegation";
            if (s.teamId === G.userTeamId) cls = "you";
            return `<tr class="${cls}">
              <td>${i+1}</td>
              <td>${team.name}</td>
              <td>${starsHTML(teamRating(team))}</td>
              <td>${s.p}</td><td>${s.w}</td><td>${s.d}</td><td>${s.l}</td>
              <td>${s.gf}</td><td>${s.ga}</td><td>${s.gf-s.ga>0?'+':''}${s.gf-s.ga}</td>
              <td><b>${s.pts}</b></td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>
    <div style="display:flex; gap:14px; margin-top:10px; flex-wrap:wrap; font-size:11px; color:#8b949e;">
      <span><span style="display:inline-block; width:12px; height:12px; background:rgba(35,134,54,0.5); border-radius:2px; vertical-align:middle;"></span> ${division === "Premier League" ? "Champions League (Top 4)" : "Promotion"}</span>
      <span><span style="display:inline-block; width:12px; height:12px; background:rgba(210,153,34,0.5); border-radius:2px; vertical-align:middle;"></span> ${division === "Premier League" ? "Europa League (5th-6th) / Conference League (7th)" : "Playoffs"}</span>
      <span><span style="display:inline-block; width:12px; height:12px; background:rgba(218,54,51,0.5); border-radius:2px; vertical-align:middle;"></span> Relegation</span>
    </div>
  `;
}

// --- EUROPEAN LEAGUE TABLE ---
function renderEuroLeagueTable(leagueName) {
  if (!G.euroLeagues) setupEuropeanLeagues();
  const lg = G.euroLeagues[leagueName];
  if (!lg) return `<div class="card" style="color:#8b949e;">No data for ${leagueName}</div>`;
  const data = EURO_LEAGUE_DATA[leagueName];
  const list = Object.values(lg.standings).sort((a,b) => b.pts - a.pts || (b.gf-b.ga)-(a.gf-a.ga) || b.gf - a.gf);
  const clEnd = data.clSpots - 1;
  const elEnd = data.clSpots + data.elSpots - 1;
  const ueclEnd = data.clSpots + data.elSpots + data.ueclSpots - 1;
  const relegStart = list.length - 3;
  let rows = list.map((s, i) => {
    let cls = "";
    let badge = "";
    if (i <= clEnd) { cls = "promotion"; badge = `<span style="color:#1a73e8;font-size:10px;font-weight:700;margin-left:4px;">CL</span>`; }
    else if (i <= elEnd) { cls = "playoff"; badge = `<span style="color:#ef6c00;font-size:10px;font-weight:700;margin-left:4px;">EL</span>`; }
    else if (i <= ueclEnd) { badge = `<span style="color:#388e3c;font-size:10px;font-weight:700;margin-left:4px;">UECL</span>`; }
    else if (i >= relegStart) cls = "relegation";
    const gd = s.gf - s.ga;
    return `<tr class="${cls}"><td>${i+1}</td><td>${s.name}${badge}</td><td>${s.p}</td><td>${s.w}</td><td>${s.d}</td><td>${s.l}</td><td>${s.gf}</td><td>${s.ga}</td><td>${gd>0?'+':''}${gd}</td><td><b>${s.pts}</b></td></tr>`;
  }).join("");
  return `
    <div class="card" style="padding:0 0 4px 0; overflow-x:auto;">
      <div style="padding:12px 16px 8px; font-size:15px; font-weight:700; color:#d29922;">${data.flag} ${leagueName} — ${data.country}</div>
      <table class="standings">
        <thead><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div style="display:flex; gap:14px; margin-top:10px; flex-wrap:wrap; font-size:11px; color:#8b949e;">
      <span><span style="display:inline-block;width:12px;height:12px;background:rgba(35,134,54,0.5);border-radius:2px;vertical-align:middle;"></span> Champions League (top ${data.clSpots})</span>
      <span><span style="display:inline-block;width:12px;height:12px;background:rgba(210,153,34,0.5);border-radius:2px;vertical-align:middle;"></span> Europa League</span>
      <span style="color:#388e3c;">UECL = Conference League spot</span>
      <span><span style="display:inline-block;width:12px;height:12px;background:rgba(218,54,51,0.5);border-radius:2px;vertical-align:middle;"></span> Relegation</span>
    </div>
    <div style="color:#8b949e;font-size:12px;margin-top:8px;padding:0 4px;">Teams earn European qualification each season based on final standings. Qualified teams appear next season in CL/EL/UECL.</div>
  `;
}

// --- EUROPEAN COMPETITION STANDINGS ---
function renderEuroCompetitionsStandings() {
  if (!G.euroComp) {
    return `<div class="card" style="color:#8b949e; text-align:center;">European competition data not available yet. Qualify for European football through the Premier League!</div>`;
  }
  let html = "";
  ['cl','el','uecl'].forEach(key => {
    const comp = G.euroComp[key];
    const info = CUP_INFO[key];
    if (!comp) return;
    const list = Object.values(comp.standings).sort((a,b) => b.pts-a.pts || (b.gf-b.ga)-(a.gf-a.ga) || b.gf - a.gf);
    const mdCount = comp.mdCount;
    const mdsDone = comp.mdPlayed;
    const rows = list.map((s, i) => {
      let cls = "";
      if (i < 8) cls = "promotion";
      else if (i < 24) cls = "playoff";
      else cls = "relegation";
      if (comp.userIn && s.euroId === comp.userEuroId) cls = "you";
      const gd = s.gf - s.ga;
      const badge = i < 8 ? '→R16' : i < 24 ? '→Playoff' : '✗';
      return `<tr class="${cls}"><td>${i+1}</td><td>${s.name}<span style="font-size:10px;color:#8b949e;margin-left:4px;">${s.league||""}</span></td><td>${s.p}</td><td>${s.w}</td><td>${s.d}</td><td>${s.l}</td><td>${s.gf}</td><td>${s.ga}</td><td>${gd>0?'+':''}${gd}</td><td><b>${s.pts}</b></td><td style="font-size:10px;color:#8b949e;">${badge}</td></tr>`;
    }).join("");
    html += `
      <div class="cup-banner ${info.cls}" style="margin-bottom:0; border-radius:8px 8px 0 0; font-size:13px; padding:10px 14px;">
        <span class="cup-name">${info.name} — League Phase (${mdsDone}/${mdCount} matchdays played)</span>
        ${comp.userIn ? `<span style="font-size:11px; background:rgba(255,255,255,0.2); padding:2px 8px; border-radius:4px;">YOUR CLUB IN COMP</span>` : ""}
      </div>
      <div class="card" style="padding:0; overflow-x:auto; border-radius:0 0 8px 8px; margin-bottom:16px;">
        <table class="standings">
          <thead><tr><th>#</th><th>Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th><th>Next</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  });
  html += `
    <div style="display:flex;gap:14px;flex-wrap:wrap;font-size:11px;color:#8b949e;margin-top:4px;">
      <span><span style="display:inline-block;width:12px;height:12px;background:rgba(35,134,54,0.5);border-radius:2px;vertical-align:middle;"></span> Top 8 → R16</span>
      <span><span style="display:inline-block;width:12px;height:12px;background:rgba(210,153,34,0.5);border-radius:2px;vertical-align:middle;"></span> 9th–24th → Playoff</span>
      <span><span style="display:inline-block;width:12px;height:12px;background:rgba(218,54,51,0.5);border-radius:2px;vertical-align:middle;"></span> 25th–36th → Eliminated</span>
    </div>
  `;
  return html;
}

// --- ROSTER TAB ---
function renderRoster() {
  const sub = currentSubTab.roster || "players";
  currentSubTab.roster = sub;
  document.getElementById("tabContent").innerHTML = `
    <div class="subtab-bar">
      <button class="subtab ${sub==='players'?'active':''}" onclick="setSubTab('roster','players')">PLAYERS (${G.myPlayers.length})</button>
      <button class="subtab ${sub==='coaches'?'active':''}" onclick="setSubTab('roster','coaches')">COACHES (${G.myCoaches.length})</button>
    </div>
    <div id="rosterBody"></div>
  `;
  if (sub === "players") renderRosterPlayers();
  else renderRosterCoaches();
}


function renderRosterPlayers() {
  const body = document.getElementById("rosterBody");
  if (G.myPlayers.length === 0) {
    body.innerHTML = `<div class="card">No players</div>`;
    return;
  }
  const players = G.myPlayers.map(id => G.players[id]).filter(p => p);
  // Sort by position then rating
  const order = { GK:0, DEF:1, MID:2, FWD:3 };
  players.sort((a,b) => order[POSITIONS[a.position].group] - order[POSITIONS[b.position].group] || b.rating - a.rating);
  body.innerHTML = `<div class="player-grid">${players.map(p => {
    const s = G.playerStats[p.id] || { apps:0, goals:0, assists:0, rating:6.5 };
    return `
      <div class="player-card" onclick="showPlayerDetail(${p.id})" style="cursor:pointer;">
        <img class="player-avatar" src="${p.avatar}">
        <div class="player-info">
          <div class="player-name">${p.name}</div>
          <div class="player-meta"><span class="player-pos">${p.position}</span> ${p.age} · ${p.nationality}</div>
          ${starsHTML(p.rating)}
          <div class="player-meta" style="margin-top:4px;">Apps: ${s.apps} · G: ${s.goals} · A: ${s.assists} · Rating: ${s.rating.toFixed(2)}</div>
        </div>
      </div>
    `;
  }).join("")}</div>`;
}

function showPlayerDetail(pid) {
  const p = G.players[pid];
  if (!p) return;
  const s = G.playerStats[pid] || { apps:0, goals:0, assists:0, cleanSheets:0, rating:6.5 };
  const c = G.careerStats[pid] || { apps:0, goals:0, assists:0, cleanSheets:0 };
  const awardIcons = p.awards.map(aid => {
    const aw = G.awards.find(a => a.id === aid);
    return aw ? aw.icon : "";
  }).join(" ");
  const html = `
    <button class="modal-close" onclick="closeModal()">×</button>
    ${awardIcons ? `<div class="trophy-row">${awardIcons}</div>` : ""}
    <div class="player-detail-header">
      <img src="${p.avatar}">
      <div>
        <div class="player-detail-name">${p.name}</div>
        <div class="player-detail-meta">${p.position} · ${p.age}yo · ${p.nationality}</div>
        ${starsHTML(p.rating)}
      </div>
    </div>
    <div class="stat-row"><span>Overall Rating</span><span>${p.rating}</span></div>
    <div class="stat-row"><span>Potential</span><span>${p.potential}</span></div>
    <div class="stat-row"><span>Market Value</span><span>${fmtMoney(p.value)}</span></div>
    <div class="stat-row"><span>Wage</span><span>${fmtMoney(p.wage)}/wk</span></div>
    <div class="stat-row"><span>Morale</span><span>${p.morale}${p.moraleBoostWeeks>0?' (boosted '+p.moraleBoostWeeks+'w)':''}</span></div>
    <div class="card-title" style="margin-top:14px;">This Season</div>
    <div class="stat-row"><span>Apps</span><span>${s.apps}</span></div>
    <div class="stat-row"><span>Goals</span><span>${s.goals}</span></div>
    <div class="stat-row"><span>Assists</span><span>${s.assists}</span></div>
    ${p.position === "GK" ? `<div class="stat-row"><span>Clean Sheets</span><span>${s.cleanSheets}</span></div>` : ""}
    <div class="stat-row"><span>Avg Rating</span><span>${s.rating.toFixed(2)}</span></div>
    <div class="card-title" style="margin-top:14px;">Career</div>
    <div class="stat-row"><span>Apps</span><span>${c.apps}</span></div>
    <div class="stat-row"><span>Goals</span><span>${c.goals}</span></div>
    <div class="stat-row"><span>Assists</span><span>${c.assists}</span></div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:14px;">
      <button class="btn btn-sm" onclick="boostMorale(${p.id})">Boost Morale (£50k)</button>
      <button class="btn btn-sm btn-gold" onclick="levelBoost(${p.id})">Level Boost (${fmtMoney(p.value*0.2)})</button>
      <button class="btn btn-sm ${G.transferList.includes(p.id)?'btn-red':'btn-ghost'}" onclick="toggleTransferList(${p.id})">${G.transferList.includes(p.id)?'Remove from List':'Transfer List'}</button>
    </div>
  `;
  showModal(html);
}

function boostMorale(pid) {
  const p = G.players[pid];
  if (!p) return;
  if (G.budget < 50e3) { toast("Not enough budget", "error"); return; }
  G.budget -= 50e3;
  p.morale = Math.min(100, p.morale + 15);
  p.moraleBoostWeeks = 4;
  toast(`${p.name} feeling fresh!`, "gold");
  saveGame();
  showPlayerDetail(pid);
  renderGameHeader();
}

function levelBoost(pid) {
  const p = G.players[pid];
  if (!p) return;
  if (p.rating >= 99) { toast("Already at max", "error"); return; }
  const cost = Math.round(p.value * 0.2);
  if (G.budget < cost) { toast("Not enough budget", "error"); return; }
  G.budget -= cost;
  p.rating = Math.min(99, p.rating + 2);
  p.value = ratingToValue(p.rating, p.age);
  toast(`${p.name} levelled up! Rating now ${p.rating}`, "gold");
  saveGame();
  showPlayerDetail(pid);
  renderGameHeader();
}

function toggleTransferList(pid) {
  if (G.transferList.includes(pid)) {
    G.transferList = G.transferList.filter(id => id !== pid);
    toast("Removed from transfer list");
  } else {
    G.transferList.push(pid);
    toast("Listed for transfer", "gold");
  }
  saveGame();
  showPlayerDetail(pid);
}

function renderRosterCoaches() {
  const body = document.getElementById("rosterBody");
  if (G.myCoaches.length === 0) {
    body.innerHTML = `<div class="card">No coaches</div>`;
    return;
  }
  const coaches = G.myCoaches.map(id => G.coaches[id]).filter(c => c);
  body.innerHTML = `<div class="player-grid">${coaches.map(c => `
    <div class="player-card" onclick="showCoachDetail(${c.id})" style="cursor:pointer;">
      <img class="player-avatar" src="${c.avatar}">
      <div class="player-info">
        <div class="player-name">${c.name}</div>
        <div class="player-meta"><span class="player-pos">${c.role}</span> ${c.age} · ${c.nationality}</div>
        ${starsHTML(c.rating)}
        <div class="player-meta">${fmtMoney(c.wage)}/wk</div>
      </div>
    </div>
  `).join("")}</div>`;
}

function showCoachDetail(cid) {
  const c = G.coaches[cid];
  if (!c) return;
  const html = `
    <button class="modal-close" onclick="closeModal()">×</button>
    <div class="player-detail-header">
      <img src="${c.avatar}">
      <div>
        <div class="player-detail-name">${c.name}</div>
        <div class="player-detail-meta">${c.role} · ${c.age}yo · ${c.nationality}</div>
        ${starsHTML(c.rating)}
      </div>
    </div>
    <div class="stat-row"><span>Rating</span><span>${c.rating}</span></div>
    <div class="stat-row"><span>Wage</span><span>${fmtMoney(c.wage)}/wk</span></div>
    <div style="margin-top:14px;">
      <button class="btn btn-sm btn-red" onclick="dismissCoach(${c.id})">Dismiss</button>
    </div>
  `;
  showModal(html);
}

function dismissCoach(cid) {
  const c = G.coaches[cid];
  if (!c) return;
  c.teamId = null;
  G.myCoaches = G.myCoaches.filter(id => id !== cid);
  toast(`Dismissed ${c.name}`);
  closeModal();
  saveGame();
  renderTab();
}

