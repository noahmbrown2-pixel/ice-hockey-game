// --- END OF SEASON ---
function endSeason() {
  endOfSeasonAwards();
  const div = G.division;
  const standings = G.standings[div];
  const list = Object.values(standings).sort((a,b)=> b.pts - a.pts || (b.gf-b.ga)-(a.gf-a.ga) || b.gf - a.gf);
  const myRank = list.findIndex(s => s.teamId === G.userTeamId) + 1;
  // Prize money + promotion/relegation
  let prize = 0;
  let promoted = false, relegated = false, gameOver = false;
  if (div === "Championship") {
    if (myRank === 1) { prize = 170e6 + 1e6; promoted = true; }
    else if (myRank === 2) { prize = 170e6; promoted = true; }
    else if (myRank >= 3 && myRank <= 6) {
      // Playoffs — simplified, 50% chance based on rank
      const winChance = 0.6 - (myRank - 3) * 0.1;
      if (Math.random() < winChance) { prize = 170e6; promoted = true; addMessage("Board","PLAYOFF WINNERS! Promoted to the Premier League!"); }
      else { prize = 5e6; addMessage("Board","Heartbreak in the playoff final. We'll come back stronger."); }
    } else if (myRank >= 22) {
      relegated = true; prize = 1e6;
    } else {
      prize = 3e6 + (24 - myRank) * 200e3;
    }
  } else if (div === "Premier League") {
    if (myRank === 1) prize = 175e6;
    else prize = 100e6 + (20 - myRank) * 5e6;
    if (myRank >= 18) relegated = true;
  } else if (div === "League One") {
    if (myRank === 1) prize = 5e6 + 500e3;
    else if (myRank === 2) prize = 5e6;
    else if (myRank >= 3 && myRank <= 6) {
      if (Math.random() < 0.5) { prize = 5e6; promoted = true; addMessage("Board","PROMOTED via playoffs!"); }
      else prize = 1e6;
    } else if (myRank >= 21) {
      relegated = true; gameOver = true;
    } else {
      prize = 500e3 + (24 - myRank) * 100e3;
    }
  }
  G.budget += prize;
  // Apply promotion/relegation
  if (promoted) {
    if (div === "Championship") G.division = "Premier League";
    else if (div === "League One") G.division = "Championship";
    G.teams[G.userTeamId].division = G.division;
    addMessage("Board",`PROMOTED to the ${G.division}! Prize money: £${(prize/1e6).toFixed(0)}M`);
  }
  if (relegated && !gameOver) {
    let relegationBonus = 0;
    if (div === "Premier League") { G.division = "Championship"; relegationBonus = 200e6; }
    else if (div === "Championship") { G.division = "League One"; relegationBonus = 500e6; }
    G.teams[G.userTeamId].division = G.division;
    G.budget += relegationBonus;
    addMessage("Board", `Relegated to ${G.division}. The board has given you a £${(relegationBonus/1e6).toFixed(0)}M war chest to rebuild.`);
    toast(`Relegated — £${(relegationBonus/1e6).toFixed(0)}M rebuild fund granted`, "gold");
  }
  // European qualification based on final standings
  determineEuropeanQualification();

  // Save end-of-season state for screen
  G.endOfSeason = {
    division: div, finalRank: myRank, list, prize,
    promoted, relegated, gameOver,
    euroQual: G.europeanQualification
  };
  renderTab(); // ensures something to show
  saveGame();
}

function beginNewSeason() {
  // Reset stats (keep career)
  for (const id in G.playerStats) {
    G.playerStats[id] = { apps:0, goals:0, assists:0, cleanSheets:0, rating: 6.5 };
  }
  // Age players and evolve ratings (no contract expiry — players stay until transferred)
  Object.values(G.players).forEach(p => {
    p.age++;
    if (p.age < 25 && p.rating < p.potential) p.rating = Math.min(p.potential, p.rating + randInt(0, 2));
    else if (p.age > 30) p.rating = Math.max(40, p.rating - randInt(0, 2));
    p.value = ratingToValue(p.rating, p.age);
  });
  // AI transfers - small percentage swap
  Object.values(G.teams).forEach(team => {
    if (team.id === G.userTeamId) return;
    if (Math.random() < 0.5 && team.players.length > 10) {
      const swapCount = randInt(1, 3);
      for (let i = 0; i < swapCount; i++) {
        const removeIdx = randInt(0, team.players.length - 1);
        const removedId = team.players[removeIdx];
        if (G.players[removedId]) G.players[removedId].teamId = null;
        team.players.splice(removeIdx, 1);
        // Add new free agent
        const free = Object.values(G.players).filter(p => p.teamId === null);
        if (free.length > 0) {
          const newP = pick(free);
          newP.teamId = team.id;
          team.players.push(newP.id);
        }
      }
    }
  });
  // Reset standings & fixtures
  setupAllFixtures();
  // Reset European leagues for new season simulation
  setupEuropeanLeagues();
  G.season++;
  G.seasonYear++;
  G.week = 1;
  G.results = [];
  G.endOfSeason = null;
  G.incomingBids = [];
  G.transferList = [];
  G.currentEuroComp = G.europeanQualification || null;
  // Rebuild European competitions (new participants based on Euro league standings)
  rebuildEuroCompParticipants();
  saveGame();
}

// --- MESSAGES & TOASTS ---
function addMessage(from, body) {
  G.messages.unshift({
    id: nextId(),
    from, body,
    week: G.week, season: G.season,
    read: false
  });
  if (G.messages.length > 100) G.messages.pop();
}

function toast(msg, kind = "ok") {
  const c = document.getElementById("toast-container");
  const d = document.createElement("div");
  d.className = "toast" + (kind === "error" ? " error" : kind === "gold" ? " gold" : "");
  d.textContent = msg;
  c.appendChild(d);
  setTimeout(() => { d.style.opacity = "0"; d.style.transition = "opacity 0.3s"; }, 2500);
  setTimeout(() => d.remove(), 3000);
}

// --- SAVE/LOAD ---
function saveGame() {
  try {
    localStorage.setItem("footballCEO_save", JSON.stringify(G));
  } catch (e) { console.warn("Save failed", e); }
}
function loadGame() {
  try {
    const data = localStorage.getItem("footballCEO_save");
    if (data) {
      G = JSON.parse(data);
      return true;
    }
  } catch (e) { console.warn("Load failed", e); }
  return false;
}
function hasSave() {
  return !!localStorage.getItem("footballCEO_save");
}

// --- SCREEN NAV ---
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo(0, 0);
}

// --- WELCOME ---
function initWelcome() {
  if (hasSave()) document.getElementById("continueBtn").style.display = "inline-block";
}
function newGame() {
  G = defaultState();
  setupTeams();
  generateAllPlayers();
  generateAllCoaches();
  renderTeamSelect();
  showScreen("teamSelect");
}
function continueGame() {
  if (loadGame()) {
    if (G.userTeamId) {
      showScreen("game");
      renderGameHeader();
      switchTab("advance");
    }
  }
}

// --- TEAM SELECT ---
function renderTeamSelect() {
  const grid = document.getElementById("teamGrid");
  const champTeams = Object.values(G.teams).filter(t => t.division === "Championship");
  // Every team starts with £200M budget regardless of tier
  champTeams.forEach(t => { t.startBudget = 150e6; });
  grid.innerHTML = champTeams.map(t => `
    <div class="team-card" onclick="selectTeam(${t.id})">
      <div class="name">${t.name}</div>
      <div class="city">${t.city}</div>
      <div class="fact">${t.fact}</div>
      <div class="budget">Starting Budget: £150M</div>
    </div>
  `).join("");
}

function selectTeam(teamId) {
  G.userTeamId = teamId;
  const team = G.teams[teamId];
  G.budget = 150e6; // Starting budget: £150M
  G.division = "Championship";
  // Build AI squads for ALL teams except user
  Object.values(G.teams).forEach(t => {
    if (t.id !== teamId) generateAITeamSquad(t);
  });
  // Guarantee a healthy free-agent pool for the user
  ensureFreeAgentPool();
  setupAllFixtures();
  setupEuropeanLeagues();
  generateCupSchedule();
  renderSetupPlayers();
  showScreen("playerSetup");
}

// Generate cup matches for the user across the season
function generateCupSchedule() {
  G.cupMatches = [];
  G.cupResults = {};
  const otherTeams = Object.values(G.teams).filter(t => t.id !== G.userTeamId);
  // Define cup ladders — each item: { cup, round, week }
  const carabaoSchedule = [
    { cup: "carabao", round: "R1", week: 4 },
    { cup: "carabao", round: "R2", week: 8 },
    { cup: "carabao", round: "R3", week: 12 },
    { cup: "carabao", round: "QF", week: 17 },
    { cup: "carabao", round: "SF", week: 22 },
    { cup: "carabao", round: "FINAL", week: 30 }
  ];
  const faSchedule = [
    { cup: "fa", round: "R3", week: 14 },
    { cup: "fa", round: "R4", week: 19 },
    { cup: "fa", round: "R5", week: 25 },
    { cup: "fa", round: "QF", week: 31 },
    { cup: "fa", round: "SF", week: 38 },
    { cup: "fa", round: "FINAL", week: 45 }
  ];
  // Domestic cups
  const all = [...carabaoSchedule, ...faSchedule];
  all.forEach(({ cup, round, week }) => {
    const opponent = pick(otherTeams);
    G.cupMatches.push({ week, cup, round, opponentId: opponent.id, isHome: Math.random() < 0.5, played: false, eliminated: false });
  });
  G.cupResults = { fa: { status: "in" }, carabao: { status: "in" } };

  // European competition (new 2024-25 league-phase format)
  G.currentEuroComp = G.europeanQualification || null;
  if (G.currentEuroComp) {
    const cup = G.currentEuroComp;
    // Setup competition data (participants + schedule)
    setupEuroCompetitions();
    const comp = G.euroComp[cup];
    const mdWeeks = comp.mdWeeks;
    // Add league phase matchday cup matches
    mdWeeks.forEach((week, idx) => {
      // Find user's opponent for this matchday from the schedule
      const mdRound = comp.mdSchedule[idx];
      const userEid = comp.userEuroId;
      let oppEid = null;
      for (const [h, a] of mdRound) {
        if (h === userEid) { oppEid = a; break; }
        if (a === userEid) { oppEid = h; break; }
      }
      const oppP = comp.participants.find(p => p.euroId === oppEid);
      G.cupMatches.push({
        week, cup, round: `MD${idx + 1}`,
        opponentId: null, // euro AI — not in G.teams
        opponentName: oppP ? oppP.name : "—",
        opponentRating: oppP ? oppP.rating : 75,
        isHome: Math.random() < 0.5,
        played: false, eliminated: false,
        isEuroLP: true, mdIdx: idx
      });
    });
    // Knockout rounds (pre-generated; playoff/R16/QF/SF skipped or eliminated based on LP result)
    const koRounds = [
      { round: 'PLAYOFF', week: comp.playoffWeek },
      { round: 'R16',     week: comp.r16Week },
      { round: 'QF',      week: comp.qfWeek },
      { round: 'SF',      week: comp.sfWeek },
      { round: 'FINAL',   week: comp.finalWeek }
    ];
    koRounds.forEach(({ round, week }) => {
      const oppP = pick(comp.participants.filter(p => !p.isUserTeam));
      G.cupMatches.push({
        week, cup, round,
        opponentId: null,
        opponentName: oppP ? oppP.name : "—",
        opponentRating: oppP ? oppP.rating : 75,
        isHome: Math.random() < 0.5,
        played: false, eliminated: round !== 'PLAYOFF' && round !== 'R16', // Only playoff alive initially for 9-24
        isEuroKO: true
      });
    });
    // Enable R16 for user (will be adjusted after LP evaluation)
    // For now assume top 8 path — eliminate playoff, keep R16 live
    // This gets corrected by evaluateEuroLeaguePhase() after the last MD
    G.cupMatches.filter(m => m.cup === cup && m.round === 'PLAYOFF').forEach(m => m.eliminated = true);
    G.cupMatches.filter(m => m.cup === cup && m.round === 'R16').forEach(m => m.eliminated = false);
    G.cupResults[cup] = { status: 'in' };
    addMessage("Board", `We're in the ${CUP_INFO[cup].name} this season! European nights await.`);
  }
}

const CUP_INFO = {
  fa:      { name: "FA CUP",                      cls: "cup-fa" },
  carabao: { name: "CARABAO CUP",                 cls: "cup-carabao" },
  cl:      { name: "UEFA CHAMPIONS LEAGUE",        cls: "cup-cl" },
  el:      { name: "UEFA EUROPA LEAGUE",           cls: "cup-el" },
  conf:    { name: "UEFA CONFERENCE LEAGUE",       cls: "cup-conf" },
  uecl:    { name: "UEFA CONFERENCE LEAGUE",       cls: "cup-conf" }
};
function euroRoundLabel(round) {
  if (/^MD\d+$/.test(round)) return `Matchday ${round.slice(2)} — League Phase`;
  if (round === 'PLAYOFF') return 'Knockout Playoff Round';
  if (round === 'R16') return 'Round of 16';
  if (round === 'QF') return 'Quarter-Final';
  if (round === 'SF') return 'Semi-Final';
  if (round === 'FINAL') return 'Final';
  return round;
}

function getCupMatchForWeek(week) {
  return (G.cupMatches || []).find(m => m.week === week && !m.eliminated && !m.played);
}
function getPlayedCupMatchForWeek(week) {
  return (G.cupMatches || []).find(m => m.week === week && m.played);
}

function ensureFreeAgentPool() {
  // Only count players in the setup-eligible band (rating 45-64)
  const free = Object.values(G.players).filter(p => p.teamId === null && p.rating >= 45 && p.rating <= 64);
  const byGroup = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  free.forEach(p => byGroup[POSITIONS[p.position].group]++);
  const targets = { GK: 25, DEF: 80, MID: 90, FWD: 60 };
  const positionsByGroup = {
    GK: ["GK"],
    DEF: ["CB", "CB", "CB", "LB", "LB", "RB", "RB", "LWB", "RWB"],
    MID: ["CDM", "CDM", "CM", "CM", "CM", "CAM", "CAM", "LM", "RM"],
    FWD: ["ST", "ST", "ST", "CF", "CF", "SS", "LW", "RW"]
  };
  for (const g of Object.keys(targets)) {
    while (byGroup[g] < targets[g]) {
      generatePlayer(pick(positionsByGroup[g]), [17, 35], 64);
      byGroup[g]++;
    }
  }
}

