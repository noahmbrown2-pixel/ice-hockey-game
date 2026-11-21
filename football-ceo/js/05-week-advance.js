// --- WEEK ADVANCE ---
function simulateWeek() {
  // Defensive: rebuild fixtures if missing (e.g., loaded old save or post-promotion bug)
  if (!G.fixtures || !G.fixtures[G.division] || !G.fixtures[G.division].length) {
    setupAllFixtures();
  }
  const weekIdx = G.week - 1;
  const divisions = ["Premier League", "Championship", "League One"];
  let userResult = null;
  const allResults = [];
  divisions.forEach(div => {
    const rounds = G.fixtures[div];
    if (rounds && weekIdx < rounds.length && rounds[weekIdx]) {
      rounds[weekIdx].matches.forEach(([homeId, awayId]) => {
        if (!G.teams[homeId] || !G.teams[awayId]) return;
        try {
          const r = simulateMatch(homeId, awayId);
          if (!r) return;
          allResults.push(r);
          if (homeId === G.userTeamId || awayId === G.userTeamId) userResult = r;
        } catch (matchErr) {
          console.error(`Match ${homeId} vs ${awayId} failed:`, matchErr);
        }
      });
    }
  });
  // Simulate European league rounds and comp matchdays for this week
  simulateEuroLeagueRound(weekIdx);
  simulateEuroCompMatchday(G.week);

  // Cup match for this week
  const cupMatch = getCupMatchForWeek(G.week);
  let cupResult = null;
  if (cupMatch) {
    try {
      let r;
      if (!cupMatch.opponentId && cupMatch.opponentName) {
        // Euro AI opponent — use rating-based simulation
        r = simulateEuroAIUserMatch(cupMatch);
      } else {
        const homeId = cupMatch.isHome ? G.userTeamId : cupMatch.opponentId;
        const awayId = cupMatch.isHome ? cupMatch.opponentId : G.userTeamId;
        r = simulateMatch(homeId, awayId);
      }
      if (r) {
        cupResult = { ...r, cup: cupMatch.cup, round: cupMatch.round };
        cupMatch.played = true;
        cupMatch.result = { goalsHome: r.goalsHome, goalsAway: r.goalsAway };
        // Determine if user advanced
        const myGoals = cupMatch.isHome ? r.goalsHome : r.goalsAway;
        const theirGoals = cupMatch.isHome ? r.goalsAway : r.goalsHome;
        if (myGoals < theirGoals) {
          // Eliminated — knock out all future rounds of this cup
          (G.cupMatches || []).forEach(m => {
            if (m.cup === cupMatch.cup && m.week > G.week) m.eliminated = true;
          });
          G.cupResults[cupMatch.cup] = { status: "out", round: cupMatch.round };
          addMessage("Cup", `Knocked out of ${CUP_INFO[cupMatch.cup].name} at the ${cupMatch.round}.`);
        } else if (myGoals === theirGoals) {
          // Draw on penalties — 50/50
          if (Math.random() < 0.5) {
            (G.cupMatches || []).forEach(m => {
              if (m.cup === cupMatch.cup && m.week > G.week) m.eliminated = true;
            });
            G.cupResults[cupMatch.cup] = { status: "out", round: cupMatch.round };
            addMessage("Cup", `Knocked out of ${CUP_INFO[cupMatch.cup].name} on penalties at the ${cupMatch.round}.`);
          } else {
            addMessage("Cup", `Through to the next round of ${CUP_INFO[cupMatch.cup].name} on penalties!`);
            if (cupMatch.round === "FINAL") {
              G.cupResults[cupMatch.cup] = { status: "won" };
              addMessage("Cup", `🏆 WON THE ${CUP_INFO[cupMatch.cup].name}!`);
            } else {
              unlockNextEuroRound(cupMatch.cup, cupMatch.round);
            }
          }
        } else {
          if (cupMatch.round === "FINAL") {
            G.cupResults[cupMatch.cup] = { status: "won" };
            addMessage("Cup", `🏆 WON THE ${CUP_INFO[cupMatch.cup].name}!`);
            const prize = (cupMatch.cup === "cl") ? 120e6 : (cupMatch.cup === "el") ? 35e6 : (cupMatch.cup === "uecl") ? 20e6 : cupMatch.cup === "fa" ? 2e6 : cupMatch.cup === "carabao" ? 200e3 : 5e6;
            G.budget += prize;
          } else {
            unlockNextEuroRound(cupMatch.cup, cupMatch.round);
            addMessage("Cup", `Through to the next round of ${CUP_INFO[cupMatch.cup].name}!`);
          }
        }
        // Find best player of cup match for the user
        const myCupBest = cupMatch.isHome ? r.homeBest : r.awayBest;
        if (myCupBest) cupResult.myBest = myCupBest;
      }
    } catch (e) {
      console.error("Cup match failed:", e);
    }
  }
  // Decrement morale boosts & contracts
  G.myPlayers.forEach(id => {
    const p = G.players[id];
    if (p && p.moraleBoostWeeks > 0) p.moraleBoostWeeks--;
  });
  // Pay wages
  const wages = computeWeeklyWages();
  G.budget -= wages;
  G.weeklyWages = wages;
  // Stadium ticket revenue if user played at home this week (league or cup)
  const userPlayedHome = (userResult && userResult.homeId === G.userTeamId)
    || (cupMatch && cupMatch.isHome && cupMatch.played);
  if (userPlayedHome && G.stadium) {
    const attendance = Math.round(G.stadium.capacity * rand(0.85, 1.0));
    const gate = attendance * (G.stadium.ticketPrice || 35);
    G.budget += gate;
    G.lastGate = { attendance, gate };
  }
  // AI bids on user's players (random chance)
  generateAIBids();
  // Scouting tick
  if (G.scoutingMission) {
    G.scoutingMission.weeksLeft--;
    if (G.scoutingMission.weeksLeft <= 0) {
      completeScouting();
    }
  }
  // Win bonus, loss diagnosis, coaching analysis
  if (userResult) {
    const won = (userResult.homeId === G.userTeamId && userResult.goalsHome > userResult.goalsAway) ||
                (userResult.awayId === G.userTeamId && userResult.goalsAway > userResult.goalsHome);
    const lost = (userResult.homeId === G.userTeamId && userResult.goalsHome < userResult.goalsAway) ||
                 (userResult.awayId === G.userTeamId && userResult.goalsAway < userResult.goalsHome);
    if (won) {
      G.budget += 10e6;
      G.lossStreak = 0;
      addMessage("Board", "Win bonus: +£10M added to the transfer budget!");
      addMessage("Fans", "The supporters are buzzing after that win! Keep it up.");
    } else if (lost) {
      G.lossStreak = (G.lossStreak || 0) + 1;
      addMessage("Coach", `Tough loss. ${analyzeLossReason(userResult)}`);
      if (G.lossStreak >= 4) {
        addMessage("Board", `${G.lossStreak} defeats in a row! ${analyzeCoachingProblem()} Time for changes.`);
      }
    } else {
      G.lossStreak = 0;
    }
  }
  if (Math.random() < 0.05) addMessage("Board","The board is monitoring your performance closely.");
  if (Math.random() < 0.04 && G.myPlayers.length > 0) {
    const p = G.players[pick(G.myPlayers)];
    const msgs = [
      "I love it at this club, boss.",
      "The lads are working hard in training.",
      "I'm fully committed to this club.",
    ];
    if (p) addMessage(p.name, pick(msgs));
  }
  // Save results
  G.results.unshift({ week: G.week, results: allResults, userResult });
  if (G.results.length > 20) G.results.pop();
  // Monthly POTM check (every 4 weeks)
  if (G.week % 4 === 0) checkMonthlyAwards();
  G.week++;
  // End of season check
  const totalWeeks = G.division === "Premier League" ? 38 : 46;
  if (G.week > totalWeeks) {
    endSeason();
    return { userResult, allResults, cupResult, endOfSeason: true };
  }
  saveGame();
  return { userResult, allResults, cupResult, endOfSeason: false };
}

function computeWeeklyWages() {
  let total = 0;
  G.myPlayers.forEach(id => { const p = G.players[id]; if (p) total += p.wage; });
  G.myCoaches.forEach(id => { const c = G.coaches[id]; if (c) total += c.wage; });
  return total;
}

function generateAIBids() {
  if (Math.random() < 0.4 && G.myPlayers.length > 18) {
    const candidatePlayers = G.myPlayers.filter(id => {
      const p = G.players[id];
      return p && (G.transferList.includes(id) || Math.random() < 0.15);
    });
    if (candidatePlayers.length > 0) {
      const pid = pick(candidatePlayers);
      const p = G.players[pid];
      const otherTeams = Object.values(G.teams).filter(t => t.id !== G.userTeamId);
      const bidder = pick(otherTeams);
      const offer = Math.round(p.value * rand(0.7, 1.3));
      const bidIdx = G.incomingBids.length;
      G.incomingBids.push({ playerId: pid, teamId: bidder.id, offer });
      addMessage("Transfer", `${bidder.name} have made a £${(offer/1e6).toFixed(1)}M bid for ${p.name}`);
      showBidPopup(bidIdx);
    }
  }
}

function showBidPopup(bidIdx) {
  const b = G.incomingBids[bidIdx];
  if (!b) return;
  const p = G.players[b.playerId];
  const team = G.teams[b.teamId];
  if (!p || !team) return;
  const html = `
    <button class="modal-close" onclick="closeModal()">×</button>
    <div style="text-align:center; padding:6px 0 14px;">
      <div style="font-size:11px; color:#d29922; font-weight:700; letter-spacing:2px; margin-bottom:6px;">📨 INCOMING BID</div>
      <div style="font-size:22px; font-weight:800; color:#e6edf3;">${team.name}</div>
      <div style="font-size:13px; color:#8b949e; margin-top:4px;">wants to sign</div>
    </div>
    <div style="background:#0d1117; border:1px solid #30363d; border-radius:10px; padding:14px; display:flex; align-items:center; gap:12px; margin-bottom:14px;">
      <img src="${p.avatar}" style="width:56px; height:56px; border-radius:50%; border:2px solid #d29922;">
      <div style="flex:1;">
        <div style="font-weight:700; font-size:16px;">${p.name}</div>
        <div style="font-size:12px; color:#8b949e;">${p.position} · ${p.age}yo · Rating ${p.rating} · Value ${fmtMoney(p.value)}</div>
      </div>
    </div>
    <div style="text-align:center; padding:10px; background:linear-gradient(135deg,#2a2515,#1a1810); border:1px solid #d29922; border-radius:10px; margin-bottom:14px;">
      <div style="font-size:11px; color:#d29922; letter-spacing:1px;">OFFER</div>
      <div style="font-size:28px; font-weight:800; color:#d29922; margin-top:2px;">${fmtMoney(b.offer)}</div>
      <div style="font-size:11px; color:#8b949e; margin-top:4px;">${b.offer >= p.value ? "✓ At or above market value" : `${Math.round((b.offer/p.value)*100)}% of market value`}</div>
    </div>
    <div style="display:flex; gap:8px;">
      <button class="btn btn-red" style="flex:1;" onclick="rejectBidFromPopup(${bidIdx})">Reject</button>
      <button class="btn btn-gold" style="flex:1;" onclick="acceptBidFromPopup(${bidIdx})">Accept ${fmtMoney(b.offer)}</button>
    </div>
  `;
  showModal(html);
}

function acceptBidFromPopup(idx) {
  acceptBid(idx);
  closeModal();
}

function rejectBidFromPopup(idx) {
  declineBid(idx);
  closeModal();
}

// --- AWARDS ---
function checkMonthlyAwards() {
  // POTM from my players based on recent performance
  if (G.myPlayers.length === 0) return;
  const candidates = G.myPlayers.map(id => {
    const p = G.players[id];
    const s = G.playerStats[id];
    if (!p || !s || s.apps < 2) return null;
    const score = s.goals * 3 + s.assists * 2 + s.rating;
    return { p, s, score };
  }).filter(x => x);
  if (candidates.length === 0) return;
  candidates.sort((a,b) => b.score - a.score);
  // Only award if player has had a strong month
  if (candidates[0].score > 6) {
    const top = candidates[0];
    const monthNum = Math.floor(G.week / 4);
    const award = {
      id: nextId(),
      type: "POTM",
      name: `Player of the Month`,
      icon: "🏆",
      recipientId: top.p.id,
      recipientName: top.p.name,
      stat: `${top.s.goals}G ${top.s.assists}A · Rating ${top.s.rating.toFixed(2)}`,
      season: G.season, week: G.week
    };
    G.awards.unshift(award);
    G.players[top.p.id].awards.push(award.id);
    addMessage("Awards", `${top.p.name} has been named Player of the Month!`);
    toast(`POTM: ${top.p.name}!`, "gold");
  }
  // MOTM check — only award once per 4-week block per season
  if (G.myPlayers.length) {
    const monthBlock = Math.floor(G.week / 4);
    const alreadyGiven = G.awards.some(a => a.type === "MOTM" && a.season === G.season && Math.floor(a.week / 4) === monthBlock);
    if (!alreadyGiven) {
      const standings = G.standings[G.division];
      const list = Object.values(standings).sort((a,b)=>b.pts-a.pts);
      const myRank = list.findIndex(s => s.teamId === G.userTeamId) + 1;
      if (myRank <= 3 && Math.random() < 0.6) {
        const award = {
          id: nextId(),
          type: "MOTM",
          name: "Manager of the Month",
          icon: "🎖️",
          recipientName: "You",
          stat: `Position #${myRank} in ${G.division}`,
          season: G.season, week: G.week
        };
        G.awards.unshift(award);
        addMessage("Awards", "You've been named Manager of the Month!");
      }
    }
  }
}

function endOfSeasonAwards() {
  // POTS, POTY in division
  const divTeams = Object.values(G.teams).filter(t => t.division === G.division).map(t => t.id);
  const allPlayersInDiv = [];
  divTeams.forEach(tid => {
    const ids = tid === G.userTeamId ? G.myPlayers : G.teams[tid].players;
    ids.forEach(id => {
      const p = G.players[id]; const s = G.playerStats[id];
      if (p && s) allPlayersInDiv.push({ p, s });
    });
  });
  // Golden Boot
  const sortGoals = [...allPlayersInDiv].sort((a,b)=>b.s.goals - a.s.goals);
  if (sortGoals[0]) {
    pushAward("Golden Boot", "⚽", sortGoals[0].p, `${sortGoals[0].s.goals} goals`);
  }
  // Golden Glove
  const gks = allPlayersInDiv.filter(x => x.p.position === "GK");
  gks.sort((a,b)=>b.s.cleanSheets - a.s.cleanSheets);
  if (gks[0] && gks[0].s.cleanSheets > 0) {
    pushAward("Golden Glove", "🧤", gks[0].p, `${gks[0].s.cleanSheets} clean sheets`);
  }
  // Playmaker of the Season
  const sortAssists = [...allPlayersInDiv].sort((a,b)=>b.s.assists - a.s.assists);
  if (sortAssists[0]) {
    pushAward("Playmaker of the Season", "🎯", sortAssists[0].p, `${sortAssists[0].s.assists} assists`);
  }
  // POTS — combo
  const posWeight = pos => {
    const g = POSITIONS[pos] ? POSITIONS[pos].group : "MID";
    if (g === "FWD") return 0.75;
    if (g === "MID") return 1.0;
    if (g === "DEF" || g === "GK") return 1.5;
    return 1.0;
  };
  const sortCombo = [...allPlayersInDiv].sort((a,b) => {
    const sa = (a.s.goals*3 + a.s.assists*2) * posWeight(a.p.position) + a.s.rating*a.s.apps*0.5;
    const sb = (b.s.goals*3 + b.s.assists*2) * posWeight(b.p.position) + b.s.rating*b.s.apps*0.5;
    return sb - sa;
  });
  if (sortCombo[0]) {
    pushAward("Player of the Season", "🏆", sortCombo[0].p, `${sortCombo[0].s.goals}G ${sortCombo[0].s.assists}A · ${sortCombo[0].s.rating.toFixed(2)}`);
  }
  // POTY in PL maybe Ballon d'Or
  if (G.division === "Premier League" && sortCombo[0]) {
    const top = sortCombo[0];
    if (top.s.goals + top.s.assists > 30 && top.p.rating > 88) {
      pushAward("Ballon d'Or", "🌟", top.p, `Best in the world`);
    }
  }
  // Manager of the Year
  const standings = G.standings[G.division];
  const list = Object.values(standings).sort((a,b)=>b.pts-a.pts);
  const myRank = list.findIndex(s => s.teamId === G.userTeamId) + 1;
  if (myRank <= 2) {
    G.awards.unshift({
      id: nextId(),
      type: "MOTY",
      name: "Manager of the Year",
      icon: "👑",
      recipientName: "You",
      stat: `Finished #${myRank} in ${G.division}`,
      season: G.season, week: G.week
    });
  }
}

function pushAward(name, icon, player, stat) {
  const award = {
    id: nextId(),
    type: name,
    name, icon,
    recipientId: player.id,
    recipientName: player.name,
    stat,
    season: G.season, week: G.week
  };
  G.awards.unshift(award);
  if (player.awards) player.awards.push(award.id);
}

