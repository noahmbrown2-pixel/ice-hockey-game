// --- LOSS / COACHING DIAGNOSIS ---
function analyzeLossReason(r) {
  if (!r) return "We just weren't at the races today.";
  const myIsHome = r.homeId === G.userTeamId;
  const myGoals = myIsHome ? r.goalsHome : r.goalsAway;
  const theirGoals = myIsHome ? r.goalsAway : r.goalsHome;
  const diff = theirGoals - myGoals;
  const myStr = getTeamStrength(G.userTeamId);
  const oppId = myIsHome ? r.awayId : r.homeId;
  const oppStr = oppId ? getTeamStrength(oppId) : null;
  const reasons = [];
  if (diff >= 3) reasons.push(`A ${myGoals}-${theirGoals} hiding — embarrassing.`);
  else if (diff === 1) reasons.push(`Lost by a single goal — small margins.`);
  if (myGoals === 0) reasons.push(`Zero goals scored — attack (rating ${Math.round(myStr.attack)}) couldn't break them down. Buy a striker.`);
  else if (myGoals === 1 && myStr.attack < 70) reasons.push(`Attack rating ${Math.round(myStr.attack)} is too low for this level.`);
  if (theirGoals >= 3) reasons.push(`Defense (rating ${Math.round(myStr.defense)}) leaked ${theirGoals} — the backline needs work.`);
  if (oppStr && oppStr.overall - myStr.overall >= 8) reasons.push(`Opponent overall ${Math.round(oppStr.overall)} vs ours ${Math.round(myStr.overall)} — squad is outclassed.`);
  if (G.myPlayers.length < 14) reasons.push(`Squad depth is thin (${G.myPlayers.length} players) — injuries away from disaster.`);
  const moraleAvg = G.myPlayers.length ? G.myPlayers.reduce((s,id)=>s+(G.players[id]?.morale||0),0)/G.myPlayers.length : 70;
  if (moraleAvg < 55) reasons.push(`Squad morale is low (${Math.round(moraleAvg)}/100) — players aren't motivated.`);
  if (reasons.length === 0) return "Mixed performance — nothing systemic, just one of those days.";
  return reasons.join(" ");
}

function analyzeCoachingProblem() {
  const coaches = (G.myCoaches || []).map(id => G.coaches[id]).filter(c => c);
  const head = coaches.find(c => c.role === "Head Coach");
  if (!head) return "You don't even have a head coach — that's the root problem.";
  const divMin = G.division === "Premier League" ? 78 : G.division === "Championship" ? 68 : 58;
  if (head.rating < divMin - 10) return `Head coach ${head.name} (${head.rating}) is way below the standard needed in the ${G.division}. Sack him.`;
  if (head.rating < divMin) return `Head coach ${head.name} (${head.rating}) is below par for the ${G.division} — minimum should be ~${divMin}.`;
  if (coaches.length < 3) return `Coaching staff is dangerously thin — only ${coaches.length} on the books. Hire assistants.`;
  const avgAssist = coaches.filter(c => c.role !== "Head Coach").reduce((s,c)=>s+c.rating,0) / Math.max(1, coaches.length - 1);
  if (avgAssist < divMin - 10) return `Assistants average ${Math.round(avgAssist)} rating — the support staff is dragging the head coach down.`;
  return `The squad has the staff but isn't delivering — maybe motivation, tactics, or recruitment is to blame.`;
}

// Team rating used for displaying star strength on tables and team cards
function teamRating(team) {
  if (!team) return 50;
  const pids = team.id === G.userTeamId ? (G.myPlayers || []) : (team.players || []);
  const players = pids.map(id => G.players[id]).filter(p => p);
  if (players.length === 0) {
    // fall back to AI coach rating tier for empty AI squads
    return team.coachHeadRating || 60;
  }
  // Average rating of the top 11 highest-rated players (the realistic XI)
  const sorted = [...players].sort((a, b) => b.rating - a.rating).slice(0, 11);
  return sorted.reduce((s, p) => s + p.rating, 0) / sorted.length;
}

// --- TEAM STRENGTH ---
function getTeamStrength(teamId) {
  const team = G.teams[teamId];
  if (!team) return { attack: 50, defense: 50, mid: 50, overall: 50, players: [] };
  const idList = teamId === G.userTeamId ? (G.myPlayers || []) : (team.players || []);
  const players = idList.map(id => G.players[id]).filter(p => p && p.position && POSITIONS[p.position]);
  if (players.length === 0) {
    const base = team.coachHeadRating || 65;
    return { attack: base, defense: base, mid: base, overall: base, players: [] };
  }
  let attRatings = [], midRatings = [], defRatings = [];
  players.forEach(p => {
    const pos = POSITIONS[p.position];
    if (!pos) return;
    const grp = pos.group;
    let effRating = p.rating;
    if (p.moraleBoostWeeks > 0) effRating += 3;
    if (grp === "FWD" || p.position === "CAM" || p.position === "LW" || p.position === "RW") attRatings.push(effRating);
    else if (grp === "MID") midRatings.push(effRating);
    else defRatings.push(effRating);
  });
  const avg = a => a.length ? a.reduce((s,v)=>s+v,0)/a.length : 55;
  const attack = avg(attRatings);
  const mid = avg(midRatings);
  const defense = avg(defRatings);
  let coachBonus = 0;
  if (teamId === G.userTeamId) {
    const head = G.myCoaches.map(id => G.coaches[id]).find(c => c.role === "Head Coach");
    if (head) coachBonus = (head.rating / 100) * 5;
    const others = G.myCoaches.map(id => G.coaches[id]).filter(c => c.role !== "Head Coach");
    if (others.length) coachBonus += (others.reduce((s,c)=>s+c.rating,0)/others.length / 100) * 2;
  } else {
    coachBonus = (team.coachHeadRating / 100) * 5;
  }
  return {
    attack: attack * 0.5 + mid * 0.3 + coachBonus * 2,
    defense: defense * 0.5 + mid * 0.3 + coachBonus * 2,
    mid, overall: (attack + mid + defense) / 3,
    players
  };
}

// --- EURO AI USER MATCH SIMULATION ---
function simulateEuroAIUserMatch(cupMatch) {
  const aiRating = cupMatch.opponentRating || 75;
  const myStr = getTeamStrength(G.userTeamId);
  const myRating = myStr.overall || 65;
  const homeAdv = 5;
  const myIsHome = cupMatch.isHome;
  const hRating = myIsHome ? myRating + homeAdv : aiRating + homeAdv;
  const aRating = myIsHome ? aiRating : myRating;
  let xgH = (hRating - aRating) / 8 + 1.2 + rand(-0.25, 0.25);
  let xgA = (aRating - hRating) / 8 + 0.8 + rand(-0.25, 0.25);
  const goalsHome = Math.max(0, Math.round(xgH + normalRandom()));
  const goalsAway = Math.max(0, Math.round(xgA + normalRandom()));
  const myGoals = myIsHome ? goalsHome : goalsAway;
  const aiGoals = myIsHome ? goalsAway : goalsHome;
  const won = myGoals > aiGoals, lost = myGoals < aiGoals;
  const myScorers = pickScorers(myStr.players, myGoals);
  const myRatings = computeMatchRatings(myStr.players, myScorers, aiGoals === 0, won, lost);
  const myBest = findBestPlayer(myRatings);
  // Update Euro comp standings
  if (cupMatch.isEuroLP && G.currentEuroComp) {
    updateUserEuroCompStandings(G.currentEuroComp, myGoals, aiGoals);
    // If this was last LP matchday, evaluate phase
    const comp = G.euroComp[G.currentEuroComp];
    if (comp && cupMatch.mdIdx === comp.mdCount - 1) {
      evaluateEuroLeaguePhase(G.currentEuroComp);
    }
  }
  return {
    homeId: myIsHome ? G.userTeamId : null,
    awayId: myIsHome ? null : G.userTeamId,
    goalsHome, goalsAway,
    homeScorers: myIsHome ? myScorers : [],
    awayScorers: myIsHome ? [] : myScorers,
    homeBest: myIsHome ? myBest : null,
    awayBest: myIsHome ? null : myBest,
    homeMatchRatings: myIsHome ? myRatings : [],
    awayMatchRatings: myIsHome ? [] : myRatings,
    division: G.division, week: G.week,
    isEuroMatch: true,
    euroOpponentName: cupMatch.opponentName
  };
}

// --- MATCH SIMULATION ---
function simulateMatch(homeId, awayId) {
  if (!G.teams[homeId] || !G.teams[awayId]) return null;
  const hs = getTeamStrength(homeId);
  const as = getTeamStrength(awayId);
  const homeAdvantage = 5;
  // xG based on attacking ability vs opponent defense — stronger rating influence, less noise
  let xgHome = (hs.attack + homeAdvantage - as.defense) / 8 + 1.2 + rand(-0.25, 0.25);
  let xgAway = (as.attack - hs.defense) / 8 + 0.8 + rand(-0.25, 0.25);
  let goalsHome = Math.max(0, Math.round(xgHome + normalRandom()));
  let goalsAway = Math.max(0, Math.round(xgAway + normalRandom()));
  // Pick scorers
  const homeScorers = pickScorers(hs.players, goalsHome);
  const awayScorers = pickScorers(as.players, goalsAway);
  // Determine outcome from the home team's perspective for rating bonuses
  const homeWon = goalsHome > goalsAway;
  const awayWon = goalsAway > goalsHome;
  // Compute per-match ratings and update season averages
  const homeMatchRatings = computeMatchRatings(hs.players, homeScorers, goalsAway === 0, homeWon, awayWon);
  const awayMatchRatings = computeMatchRatings(as.players, awayScorers, goalsHome === 0, awayWon, homeWon);
  // Standings
  const div = G.teams[homeId].division;
  const ts = G.standings[div];
  if (ts && ts[homeId] && ts[awayId]) {
    ts[homeId].p++; ts[awayId].p++;
    ts[homeId].gf += goalsHome; ts[homeId].ga += goalsAway;
    ts[awayId].gf += goalsAway; ts[awayId].ga += goalsHome;
    if (homeWon) { ts[homeId].w++; ts[homeId].pts += 3; ts[awayId].l++; }
    else if (awayWon) { ts[awayId].w++; ts[awayId].pts += 3; ts[homeId].l++; }
    else { ts[homeId].d++; ts[awayId].d++; ts[homeId].pts++; ts[awayId].pts++; }
  }
  // Find best player on each side
  const homeBest = findBestPlayer(homeMatchRatings);
  const awayBest = findBestPlayer(awayMatchRatings);
  return {
    homeId, awayId, goalsHome, goalsAway,
    homeScorers, awayScorers,
    homeBest, awayBest,
    homeMatchRatings, awayMatchRatings,
    division: div, week: G.week
  };
}

function computeMatchRatings(players, scorers, cleanSheet, won, lost) {
  // Returns array of { playerId, name, position, rating, goals, assists, cleanSheet }
  const ratings = [];
  // Tally goals & assists for this match
  const goalCount = {};
  const assistCount = {};
  scorers.forEach(s => {
    goalCount[s.playerId] = (goalCount[s.playerId] || 0) + 1;
    if (s.assistId) assistCount[s.assistId] = (assistCount[s.assistId] || 0) + 1;
  });
  players.forEach(p => {
    if (!p || !p.position) return;
    const pos = POSITIONS[p.position];
    if (!pos) return;
    if (!G.playerStats[p.id]) G.playerStats[p.id] = { apps:0, goals:0, assists:0, cleanSheets:0, rating:6.5 };
    if (!G.careerStats[p.id]) G.careerStats[p.id] = { apps:0, goals:0, assists:0, cleanSheets:0 };
    G.playerStats[p.id].apps++;
    G.careerStats[p.id].apps++;
    const isDefensive = p.position === "GK" || pos.group === "DEF";
    const goals = goalCount[p.id] || 0;
    const assists = assistCount[p.id] || 0;
    // Per-match rating: 6.0 base, modulated by player quality, contributions, and result
    let rating = 6.0 + (p.rating - 60) / 25;
    rating += goals * 1.0;
    rating += assists * 0.6;
    if (cleanSheet && isDefensive) rating += 0.5;
    if (won) rating += 0.2;
    if (lost) rating -= 0.2;
    if (p.moraleBoostWeeks > 0) rating += 0.15;
    rating += rand(-0.4, 0.4);
    rating = Math.max(4.5, Math.min(10, rating));
    rating = Math.round(rating * 10) / 10;
    // Update season + career stats
    if (G.playerStats[p.id]) {
      const ps = G.playerStats[p.id];
      ps.goals += goals;
      ps.assists += assists;
      if (cleanSheet && isDefensive) ps.cleanSheets++;
      ps.rating = (ps.rating * (ps.apps - 1) + rating) / ps.apps;
    }
    if (G.careerStats[p.id]) {
      G.careerStats[p.id].goals += goals;
      G.careerStats[p.id].assists += assists;
      if (cleanSheet && isDefensive) G.careerStats[p.id].cleanSheets++;
    }
    ratings.push({
      playerId: p.id, name: p.name, position: p.position,
      rating, goals, assists,
      cleanSheet: cleanSheet && isDefensive
    });
  });
  return ratings;
}

function findBestPlayer(matchRatings) {
  if (!matchRatings || matchRatings.length === 0) return null;
  return [...matchRatings].sort((a, b) => b.rating - a.rating)[0];
}

function pickScorers(players, count) {
  if (count === 0 || !players || players.length === 0) return [];
  const valid = players.filter(p => p && p.position && POSITIONS[p.position]);
  if (valid.length === 0) return [];
  const scorers = [];
  const attackers = valid.filter(p => {
    const pos = POSITIONS[p.position];
    const g = pos && pos.group;
    return g === "FWD" || g === "MID";
  });
  const pool = attackers.length ? attackers : valid.filter(p => p.position !== "GK");
  if (pool.length === 0) return [];
  // Weight by attacking position
  for (let i = 0; i < count; i++) {
    const weights = pool.map(p => {
      const pos = POSITIONS[p.position];
      const g = pos && pos.group;
      let w = 1;
      if (g === "FWD") w = 5;
      else if (p.position === "CAM" || p.position === "LW" || p.position === "RW") w = 3;
      else if (g === "MID") w = 1.5;
      return w * (p.rating / 70);
    });
    const total = weights.reduce((s,v)=>s+v,0);
    let r = Math.random() * total;
    let scorer = pool[0];
    for (let j = 0; j < pool.length; j++) {
      r -= weights[j];
      if (r <= 0) { scorer = pool[j]; break; }
    }
    // Assister
    let assister = null;
    if (Math.random() < 0.7 && pool.length > 1) {
      const others = pool.filter(p => p.id !== scorer.id);
      assister = pick(others);
    }
    scorers.push({ playerId: scorer.id, name: scorer.name, assistId: assister ? assister.id : null, assistName: assister ? assister.name : null });
  }
  return scorers;
}

// Legacy — replaced by computeMatchRatings. Kept as no-op for any stale call sites.
function updateMatchStats() {}

