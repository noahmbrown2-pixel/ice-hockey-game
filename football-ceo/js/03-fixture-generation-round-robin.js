// --- FIXTURE GENERATION (round-robin) ---
function generateFixtures(teamIds) {
  const n = teamIds.length;
  const teams = teamIds.slice();
  if (n % 2 !== 0) teams.push(null); // bye
  const rounds = [];
  const total = teams.length;
  const half = total / 2;
  const arr = teams.slice();
  for (let r = 0; r < total - 1; r++) {
    const matches = [];
    for (let i = 0; i < half; i++) {
      const home = arr[i];
      const away = arr[total - 1 - i];
      if (home !== null && away !== null) {
        // alternate home/away by round
        if (r % 2 === 0) matches.push([home, away]);
        else matches.push([away, home]);
      }
    }
    rounds.push({ round: r + 1, matches });
    // rotate (keep first fixed)
    const last = arr.pop();
    arr.splice(1, 0, last);
  }
  // Reverse leg
  const reverse = rounds.map(rd => ({
    round: rd.round + rounds.length,
    matches: rd.matches.map(m => [m[1], m[0]])
  }));
  return rounds.concat(reverse);
}

function setupAllFixtures() {
  const divisions = ["Premier League", "Championship", "League One"];
  divisions.forEach(div => {
    const teamIds = Object.values(G.teams).filter(t => t.division === div).map(t => t.id);
    G.fixtures[div] = generateFixtures(teamIds);
    G.standings[div] = {};
    teamIds.forEach(tid => {
      G.standings[div][tid] = { teamId: tid, p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 };
    });
  });
}

// ============================================================
// EUROPEAN LEAGUES SETUP & SIMULATION
// ============================================================

function setupEuropeanLeagues() {
  G.euroLeagues = {};
  Object.entries(EURO_LEAGUE_DATA).forEach(([leagueName, data]) => {
    const leagueKey = leagueName.replace(/\s+/g,'_');
    const teamObjs = data.teams.map(([name, rating], i) => ({ id: `el_${leagueKey}_${i}`, name, rating }));
    const standings = {};
    teamObjs.forEach(t => { standings[t.id] = { teamId: t.id, name: t.name, rating: t.rating, p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0 }; });
    const teamIds = teamObjs.map(t => t.id);
    G.euroLeagues[leagueName] = {
      data,
      teams: teamObjs,
      standings,
      fixtures: generateEuroLgFixtures(teamIds)
    };
  });
}

function generateEuroLgFixtures(teamIds) {
  const n = teamIds.length;
  let arr = [...teamIds];
  if (n % 2 !== 0) arr.push(null);
  const total = arr.length;
  const half = total / 2;
  const rounds = [];
  for (let r = 0; r < total - 1; r++) {
    const matches = [];
    for (let i = 0; i < half; i++) {
      const home = arr[i], away = arr[total - 1 - i];
      if (home && away) matches.push([home, away]);
    }
    rounds.push(matches);
    const last = arr.pop(); arr.splice(1, 0, last);
  }
  // Double round-robin
  const reverse = rounds.map((rd, ri) => ({
    matches: rd.map(m => [m[1], m[0]])
  }));
  return rounds.concat(reverse).map((rd, i) => ({ round: i + 1, matches: rd.matches || rd }));
}

function simulateEuroLeagueRound(weekIdx) {
  if (!G.euroLeagues) return;
  Object.entries(G.euroLeagues).forEach(([ln, lg]) => {
    const round = lg.fixtures[weekIdx];
    if (!round) return;
    const ms = round.matches || round;
    ms.forEach(([hId, aId]) => {
      const h = lg.standings[hId], a = lg.standings[aId];
      if (!h || !a) return;
      const hTeam = lg.teams.find(t => t.id === hId);
      const aTeam = lg.teams.find(t => t.id === aId);
      if (!hTeam || !aTeam) return;
      const { gh, ga } = simEuroAI(hTeam.rating + 5, aTeam.rating);
      h.p++; a.p++; h.gf += gh; h.ga += ga; a.gf += ga; a.ga += gh;
      if (gh > ga) { h.w++; h.pts += 3; a.l++; }
      else if (ga > gh) { a.w++; a.pts += 3; h.l++; }
      else { h.d++; a.d++; h.pts++; a.pts++; }
    });
  });
}

function simEuroAI(hRating, aRating) {
  let xgH = (hRating - aRating) / 8 + 1.2 + rand(-0.25, 0.25);
  let xgA = (aRating - hRating) / 8 + 0.8 + rand(-0.25, 0.25);
  return {
    gh: Math.max(0, Math.round(xgH + normalRandom())),
    ga: Math.max(0, Math.round(xgA + normalRandom()))
  };
}

// ============================================================
// EUROPEAN COMPETITIONS SETUP
// ============================================================

function setupEuroCompetitions() {
  const comps = {
    cl:   { teams: [...INITIAL_CL_TEAMS],   mdWeeks: [6,9,11,13,16,18,21,23], mdCount:8, playoffWeek:26, r16Week:29, qfWeek:33, sfWeek:37, finalWeek:43 },
    el:   { teams: [...INITIAL_EL_TEAMS],   mdWeeks: [6,9,11,13,16,18,21,23], mdCount:8, playoffWeek:26, r16Week:29, qfWeek:33, sfWeek:37, finalWeek:43 },
    uecl: { teams: [...INITIAL_UECL_TEAMS], mdWeeks: [6,9,11,15,18,21],       mdCount:6, playoffWeek:24, r16Week:27, qfWeek:31, sfWeek:35, finalWeek:41 }
  };
  G.euroComp = {};
  Object.entries(comps).forEach(([key, cfg]) => {
    const participants = cfg.teams.map((t, i) => ({ ...t, euroId: i + 1, isUserTeam: false }));
    // Check if user's team should be in this competition
    let userIdx = -1;
    if (G.currentEuroComp === key) {
      // Add user's team as last participant
      const userTeam = G.teams[G.userTeamId];
      participants.push({ name: userTeam.name, league: G.division, rating: 75, euroId: participants.length + 1, isUserTeam: true });
      userIdx = participants.length - 1;
    }
    const standings = {};
    participants.forEach(p => { standings[p.euroId] = { p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0, name: p.name, league: p.league, euroId: p.euroId }; });
    // Generate partial round-robin schedule (mdCount rounds)
    const mdSchedule = generateEuroCompSchedule(participants, cfg.mdCount);
    G.euroComp[key] = {
      participants,
      standings,
      mdSchedule, // array of mdCount rounds, each = array of [euroIdHome, euroIdAway]
      mdWeeks: cfg.mdWeeks,
      mdCount: cfg.mdCount,
      mdPlayed: 0,
      playoffWeek: cfg.playoffWeek,
      r16Week: cfg.r16Week,
      qfWeek: cfg.qfWeek,
      sfWeek: cfg.sfWeek,
      finalWeek: cfg.finalWeek,
      userIn: G.currentEuroComp === key,
      userEuroId: G.currentEuroComp === key ? participants[participants.length - 1].euroId : null,
      userStatus: G.currentEuroComp === key ? 'league' : 'n/a'
    };
  });
}

function generateEuroCompSchedule(participants, numRounds) {
  let arr = participants.map(p => p.euroId);
  if (arr.length % 2 !== 0) arr.push(null);
  const total = arr.length, half = total / 2;
  const rounds = [];
  for (let r = 0; r < numRounds; r++) {
    const matches = [];
    for (let i = 0; i < half; i++) {
      const h = arr[i], a = arr[total - 1 - i];
      if (h !== null && a !== null) matches.push([h, a]);
    }
    rounds.push(matches);
    const last = arr.pop(); arr.splice(1, 0, last);
  }
  return rounds;
}

function simulateEuroCompMatchday(week) {
  if (!G.euroComp) return;
  ['cl','el','uecl'].forEach(key => {
    const comp = G.euroComp[key];
    if (!comp) return;
    const mdIdx = comp.mdWeeks.indexOf(week);
    if (mdIdx === -1 || mdIdx >= comp.mdSchedule.length) return;
    const round = comp.mdSchedule[mdIdx];
    round.forEach(([hId, aId]) => {
      // Skip the user's match (handled by cup system)
      if (comp.userIn && (hId === comp.userEuroId || aId === comp.userEuroId)) return;
      const hP = comp.participants.find(p => p.euroId === hId);
      const aP = comp.participants.find(p => p.euroId === aId);
      if (!hP || !aP) return;
      const { gh, ga } = simEuroAI(hP.rating + 5, aP.rating);
      updateEuroCompStandings(comp, hId, aId, gh, ga);
    });
    comp.mdPlayed = Math.max(comp.mdPlayed, mdIdx + 1);
  });
}

function updateEuroCompStandings(comp, hId, aId, gh, ga) {
  const h = comp.standings[hId], a = comp.standings[aId];
  if (!h || !a) return;
  h.p++; a.p++; h.gf += gh; h.ga += ga; a.gf += ga; a.ga += gh;
  if (gh > ga) { h.w++; h.pts += 3; a.l++; }
  else if (ga > gh) { a.w++; a.pts += 3; h.l++; }
  else { h.d++; a.d++; h.pts++; a.pts++; }
}

function updateUserEuroCompStandings(cup, goalsFor, goalsAgainst) {
  if (!G.euroComp || !G.euroComp[cup]) return;
  const comp = G.euroComp[cup];
  if (!comp.userIn || !comp.userEuroId) return;
  // User's result: we always treat user as "home" in terms of GF/GA
  const s = comp.standings[comp.userEuroId];
  if (!s) return;
  s.p++;
  s.gf += goalsFor; s.ga += goalsAgainst;
  if (goalsFor > goalsAgainst) { s.w++; s.pts += 3; }
  else if (goalsAgainst > goalsFor) { s.l++; }
  else { s.d++; s.pts++; }
}

function evaluateEuroLeaguePhase(cup) {
  if (!G.euroComp || !G.euroComp[cup]) return;
  const comp = G.euroComp[cup];
  if (!comp.userIn) return;
  const list = Object.values(comp.standings).sort((a,b) => b.pts - a.pts || (b.gf-b.ga) - (a.gf-a.ga) || b.gf - a.gf);
  const rank = list.findIndex(s => s.euroId === comp.userEuroId) + 1;
  if (rank <= 8) {
    comp.userStatus = 'r16';
    addMessage("European", `Top 8 in the ${CUP_INFO[cup].name} league phase! Straight to Round of 16.`);
    toast(`CL League Phase: R16 spot secured! (Pos. ${rank})`, "gold");
    (G.cupMatches || []).forEach(m => {
      if (m.cup !== cup) return;
      if (m.round === 'PLAYOFF') m.eliminated = true;
      if (m.round === 'R16') m.eliminated = false;
    });
  } else if (rank <= 24) {
    comp.userStatus = 'playoff';
    addMessage("European", `Finished ${rank}th — Knockout Playoff Round in ${CUP_INFO[cup].name}.`);
    toast(`League Phase: Playoff Round (Pos. ${rank})`, "ok");
    (G.cupMatches || []).forEach(m => {
      if (m.cup !== cup) return;
      if (m.round === 'PLAYOFF') m.eliminated = false;
      // R16 stays eliminated until playoff is won (unlockNextEuroRound handles it)
      if (m.round === 'R16') m.eliminated = true;
    });
  } else {
    comp.userStatus = 'out';
    addMessage("European", `Eliminated from ${CUP_INFO[cup].name} league phase (Pos. ${rank}).`);
    toast(`Eliminated from league phase (Pos. ${rank})`, "error");
    (G.cupMatches || []).forEach(m => { if (m.cup === cup) m.eliminated = true; });
    G.cupResults[cup] = { status: 'out', round: 'League Phase' };
  }
}

function unlockNextEuroRound(cup, round) {
  if (!["cl","el","uecl"].includes(cup)) return;
  const nextOf = { 'PLAYOFF':'R16', 'R16':'QF', 'QF':'SF', 'SF':'FINAL' };
  const nextRound = nextOf[round];
  if (!nextRound) return;
  (G.cupMatches || []).forEach(m => {
    if (m.cup === cup && m.round === nextRound) m.eliminated = false;
  });
}

function determineEuropeanQualification() {
  if (G.division !== 'Premier League') { G.europeanQualification = null; return; }
  const standings = G.standings['Premier League'];
  if (!standings) return;
  const list = Object.values(standings).sort((a,b) => b.pts - a.pts || (b.gf-b.ga) - (a.gf-a.ga));
  const myRank = list.findIndex(s => s.teamId === G.userTeamId);
  if (PL_CL_POS.includes(myRank)) {
    G.europeanQualification = 'cl';
    addMessage("Board", `Top ${myRank + 1} finish! We've qualified for the UEFA Champions League!`);
    toast("UEFA Champions League qualified!", "gold");
  } else if (PL_EL_POS.includes(myRank)) {
    G.europeanQualification = 'el';
    addMessage("Board", `${myRank + 1}th place earns UEFA Europa League qualification!`);
    toast("UEFA Europa League qualified!", "gold");
  } else if (PL_UECL_POS.includes(myRank)) {
    G.europeanQualification = 'uecl';
    addMessage("Board", `${myRank + 1}th place secures UEFA Conference League football!`);
    toast("UEFA Conference League qualified!", "ok");
  } else {
    G.europeanQualification = null;
  }
}

function rebuildEuroCompParticipants() {
  if (!G.euroLeagues) { setupEuropeanLeagues(); return; }
  const newCL = [], newEL = [], newUECL = [];
  Object.entries(EURO_LEAGUE_DATA).forEach(([ln, data]) => {
    const lg = G.euroLeagues[ln];
    if (!lg) return;
    const sorted = Object.values(lg.standings).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga));
    sorted.forEach((s, i) => {
      const teamObj = lg.teams.find(t => t.id === s.teamId);
      const t = { name: s.name, league: ln, rating: teamObj ? teamObj.rating : 70 };
      if (i < data.clSpots) newCL.push(t);
      else if (i < data.clSpots + data.elSpots) newEL.push(t);
      else if (i < data.clSpots + data.elSpots + data.ueclSpots) newUECL.push(t);
    });
  });
  // Pad each to 36 with original defaults if needed
  function padTo36(arr, defaults) {
    const used = new Set(arr.map(t=>t.name));
    for (const d of defaults) { if (arr.length >= 36) break; if (!used.has(d.name)) { arr.push(d); used.add(d.name); } }
    return arr.slice(0, 36);
  }
  INITIAL_CL_TEAMS.splice(0, INITIAL_CL_TEAMS.length, ...padTo36(newCL, INITIAL_CL_TEAMS));
  INITIAL_EL_TEAMS.splice(0, INITIAL_EL_TEAMS.length, ...padTo36(newEL, INITIAL_EL_TEAMS));
  INITIAL_UECL_TEAMS.splice(0, INITIAL_UECL_TEAMS.length, ...padTo36(newUECL, INITIAL_UECL_TEAMS));
}

