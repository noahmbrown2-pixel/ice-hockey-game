// ════════════════════════════════════════════════════════════════
//  TABLE ACTION — Standings + Partners
// ════════════════════════════════════════════════════════════════
const COWORKER_COUNTRIES = ['USA','UK','Canada','Mexico','Brazil','Argentina','France','Germany','Spain','Italy','Portugal','Netherlands','Sweden','Norway','Poland','Japan','South Korea','China','India','Nigeria','Egypt','Australia','New Zealand','Ireland','Greece','Turkey','Russia','Ukraine','Kenya','South Africa','Colombia','Chile','Croatia','Belgium','Denmark'];
const COWORKER_FIRST = ['Alex','Jordan','Taylor','Morgan','Casey','Riley','Jamie','Avery','Drew','Quinn','Sage','Blake','Harper','Skyler','Reese','Parker','Rowan','Sasha','Dakota','Emerson','Finley','River','Hayden','Kai','Logan','Marlowe','Noa','Phoenix','Remy','Shiloh','Tatum','Wren','Zion','Aiden','Olivia','Lucas','Mia','Ethan','Sofia','Liam','Emma','Noah','Ava','Mason','Charlotte'];
const COWORKER_LAST = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Martinez','Davis','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nakamura','Patel','Kim','Khan','Silva','Rossi','Schmidt','Dubois'];
const POSITIONS_BY_SECTOR = {
  healthcare: { boss:'Chief of Medicine', senior:['Department Head','Lead Surgeon','Head Nurse','Chief Resident'], regular:['Resident','RN','MA','Tech','PA','Aide'] },
  finance:    { boss:'Managing Director', senior:['VP Finance','Senior Analyst','Portfolio Mgr','Risk Lead'], regular:['Analyst','Associate','Trader','Banker','Advisor','Auditor'] },
  tech:       { boss:'CTO', senior:['Engineering Mgr','Tech Lead','Principal Eng','Staff Eng'], regular:['Sr Engineer','Engineer','SWE','SRE','QA','PM'] },
  education:  { boss:'Principal', senior:['Dept Chair','Asst Principal','Curriculum Lead','Senior Faculty'], regular:['Teacher','TA','Counselor','Coach','Tutor','Adjunct'] },
  law:        { boss:'Managing Partner', senior:['Partner','Senior Counsel','Lead Attorney','Captain'], regular:['Associate','Paralegal','Officer','Detective','Agent','Clerk'] },
  creative:   { boss:'Creative Director', senior:['Art Director','Senior Designer','Lead Editor','Producer'], regular:['Designer','Photographer','Editor','Illustrator','Writer','Artist'] },
  trades:     { boss:'Foreman', senior:['Master Craftsman','Site Lead','Senior Mechanic','Lead Electrician'], regular:['Plumber','Mechanic','Carpenter','Electrician','Welder','Apprentice'] },
  service:    { boss:'General Manager', senior:['Asst Manager','Floor Lead','Head Chef','Shift Supervisor'], regular:['Server','Cook','Barista','Cashier','Host','Valet'] },
  blue_collar:{ boss:'Operations Mgr', senior:['Shift Lead','Senior Operator','Crew Chief','Supervisor'], regular:['Driver','Operator','Worker','Loader','Picker','Cleaner'] },
  agriculture:{ boss:'Farm Owner', senior:['Senior Rancher','Field Mgr','Crop Lead','Harvest Lead'], regular:['Hand','Farmer','Picker','Planter','Herder','Apprentice'] },
  sports:     { boss:'Head Coach', senior:['Captain','Vice Captain','Senior Veteran','Star Player'], regular:['Forward','Midfielder','Defender','Striker','Keeper','Sub','Rookie','Veteran'] },
};
function getPositions(sector){ return POSITIONS_BY_SECTOR[sector] || POSITIONS_BY_SECTOR.tech; }
function genCoworkers(c){
  if(!c.employed){ return null; }
  const cacheKey = (c.jobId||'unknown') + '|' + (c.sportsTeam||'');
  if(c._coworkersKey === cacheKey && Array.isArray(c._coworkers)) return c._coworkers;
  const pos = getPositions(c.jobSector || 'tech');
  const list = [];
  // Boss (1)
  list.push({
    name: pick(COWORKER_FIRST)+' '+pick(COWORKER_LAST),
    age: ri(45, 62),
    position: pos.boss,
    morale: ri(55, 90),
    fitness: ri(40, 80),
    tenure: ri(8, 25),
    smarts: ri(70, 95),
    justHired: false,
    country: pick(COWORKER_COUNTRIES),
    tier: 'boss',
  });
  // Senior (3)
  for(let i=0; i<3; i++){
    list.push({
      name: pick(COWORKER_FIRST)+' '+pick(COWORKER_LAST),
      age: ri(35, 55),
      position: pos.senior[i % pos.senior.length],
      morale: ri(45, 90),
      fitness: ri(45, 85),
      tenure: ri(4, 15),
      smarts: ri(60, 90),
      justHired: pct(0.05),
      country: pick(COWORKER_COUNTRIES),
      tier: 'senior',
    });
  }
  // Regular (8)
  for(let i=0; i<8; i++){
    list.push({
      name: pick(COWORKER_FIRST)+' '+pick(COWORKER_LAST),
      age: ri(22, 45),
      position: pos.regular[i % pos.regular.length],
      morale: ri(35, 90),
      fitness: ri(40, 90),
      tenure: ri(0, 8),
      smarts: ri(45, 85),
      justHired: pct(0.18),
      country: pick(COWORKER_COUNTRIES),
      tier: 'regular',
    });
  }
  c._coworkers = list;
  c._coworkersKey = cacheKey;
  return list;
}

// Build a synthetic vertical league table for the player's team's league
function buildSoccerStandings(c){
  const league = soccerPlayerTeamLeague(c);
  if(!league || !SOCCER_LEAGUE_TEAMS[league]) return null;
  const teams = SOCCER_LEAGUE_TEAMS[league].slice();
  if(!teams.includes(c.sportsTeam)) teams.unshift(c.sportsTeam);
  // Use cached standings per league/team if present
  const key = league+'|'+c.sportsTeam;
  if(c._lgStandingsKey === key && Array.isArray(c._lgStandings)) return { league, rows: c._lgStandings };
  const rows = teams.map(t => {
    const played = ri(20, 28);
    const w = ri(4, played-3);
    const d = ri(1, Math.max(2, played-w-1));
    const l = Math.max(0, played - w - d);
    const gf = w*2 + d + ri(0, 12);
    const ga = l*2 + ri(0, 14);
    return { team: t, p: played, w, d, l, gf, ga, gd: gf-ga, pts: w*3+d };
  });
  rows.sort((a,b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  c._lgStandings = rows;
  c._lgStandingsKey = key;
  return { league, rows };
}
function buildEuroCompStandings(c){
  if(!c._euroComp || !EURO_COMP_POOLS[c._euroComp]) return null;
  const meta = EURO_COMP_META[c._euroComp];
  const pool = [c.sportsTeam, ...EURO_COMP_POOLS[c._euroComp].filter(t => t !== c.sportsTeam)].slice(0, 36);
  const key = c._euroComp+'|'+c.sportsTeam;
  if(c._euroStandingsKey === key && Array.isArray(c._euroStandings)) return { meta, rows: c._euroStandings };
  const rows = pool.map(t => {
    const p = ri(2, 8);
    const w = ri(0, p);
    const d = ri(0, Math.max(0, p-w));
    const l = Math.max(0, p-w-d);
    return { team: t, p, w, d, l, gf: w*2+d+ri(0,4), ga: l*2+ri(0,5), gd: 0, pts: w*3+d };
  });
  rows.forEach(r => r.gd = r.gf - r.ga);
  rows.sort((a,b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  c._euroStandings = rows;
  c._euroStandingsKey = key;
  return { meta, rows };
}

// Render Standings panel HTML
function renderStandingsHTML(c){
  if(!c.employed){
    return '<p style="color:var(--muted);text-align:center;padding:20px">Not employed. Get a job to see your company table.</p>';
  }
  const isSport = c.jobSector === 'sports';
  let html = '';
  if(isSport){
    // Athlete view: monthly competitions + vertical league tables
    const monthIdx = c.monthAge % 12;
    const monthName = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][monthIdx];
    const compsThisMonth = ri(3, 4);
    // Roll match results based on performance
    const perf = c.performance || 65;
    const winChance = 0.30 + (perf/100) * 0.40;
    const matches = [];
    for(let i=0; i<compsThisMonth; i++){
      const r = Math.random();
      let result, score;
      if(r < winChance){ result='W'; score = `${ri(1,4)}-${ri(0,2)}`; }
      else if(r < winChance + 0.25){ result='D'; score = `${ri(0,2)}-${ri(0,2)}`; }
      else { result='L'; score = `${ri(0,2)}-${ri(1,4)}`; }
      matches.push({ result, score, opp: c.sportsTeam ? 'Opponent ' + (i+1) : 'Match '+(i+1) });
    }
    const wins = matches.filter(m=>m.result==='W').length;
    const draws = matches.filter(m=>m.result==='D').length;
    const losses = matches.filter(m=>m.result==='L').length;
    const playerRating = (perf/10 + (wins-losses)*0.4).toFixed(1);
    html += `<div style="margin-bottom:14px">
      <h4 style="color:var(--gold);font-size:13px;margin:0 0 8px;text-transform:uppercase;letter-spacing:.5px">📅 ${monthName} — Match Reports</h4>
      <div style="display:grid;gap:4px">${matches.map(m=>{
        const col = m.result==='W'?'#3fa34d':m.result==='D'?'#c4a754':'#c44';
        return `<div style="display:flex;justify-content:space-between;padding:6px 10px;background:var(--bg3);border-radius:4px;font-size:12px">
          <span>${c.sportsTeam||'You'} vs ${m.opp}</span>
          <span><b style="color:${col}">${m.result}</b> · ${m.score}</span>
        </div>`;
      }).join('')}</div>
      <div style="margin-top:8px;font-size:11px;color:var(--muted);text-align:center">
        Record: <b style="color:#3fa34d">${wins}W</b> · <b style="color:#c4a754">${draws}D</b> · <b style="color:#c44">${losses}L</b> · Avg Rating: <b style="color:var(--gold)">${playerRating}</b>/10
      </div>
    </div>`;
    // Vertical league table
    if(c.jobId === 'soccer_player'){
      const standings = buildSoccerStandings(c);
      if(standings){
        const rows = standings.rows;
        const playerIdx = rows.findIndex(r => r.team === c.sportsTeam);
        html += `<div style="margin-bottom:14px">
          <h4 style="color:var(--gold);font-size:13px;margin:0 0 6px;text-transform:uppercase;letter-spacing:.5px">🏆 ${standings.league} Table</h4>
          <div style="border:1px solid var(--border);border-radius:6px;overflow:hidden">
            <div style="display:grid;grid-template-columns:28px 1fr 28px 28px 28px 28px 36px;gap:0;padding:6px 8px;background:var(--bg3);font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase">
              <span>#</span><span>Team</span><span>P</span><span>W</span><span>D</span><span>L</span><span>Pts</span>
            </div>
            ${rows.map((r,i) => {
              const isPlayer = r.team === c.sportsTeam;
              const bg = isPlayer ? 'background:rgba(212,175,55,0.15);' : '';
              const col = isPlayer ? 'color:var(--gold);font-weight:700;' : '';
              const zone = i<5?'border-left:3px solid #3fa34d':i===5?'border-left:3px solid #4a8fc4':i===6?'border-left:3px solid #b07a3a':i>=rows.length-3?'border-left:3px solid #c44':'border-left:3px solid transparent';
              return `<div style="display:grid;grid-template-columns:28px 1fr 28px 28px 28px 28px 36px;gap:0;padding:5px 8px;font-size:11px;border-top:1px solid var(--border);${bg}${col}${zone}">
                <span>${i+1}</span><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.team}${isPlayer?' ←':''}</span>
                <span>${r.p}</span><span>${r.w}</span><span>${r.d}</span><span>${r.l}</span><span><b>${r.pts}</b></span>
              </div>`;
            }).join('')}
          </div>
          <div style="font-size:10px;color:var(--muted);margin-top:4px;display:flex;gap:8px;flex-wrap:wrap">
            <span><span style="color:#3fa34d">▌</span>UCL</span>
            <span><span style="color:#4a8fc4">▌</span>UEL</span>
            <span><span style="color:#b07a3a">▌</span>UECL</span>
            <span><span style="color:#c44">▌</span>Relegation</span>
          </div>
        </div>`;
      }
      // European competition table if qualified
      const euro = buildEuroCompStandings(c);
      if(euro){
        const rows = euro.rows;
        html += `<div style="margin-bottom:14px">
          <h4 style="color:var(--gold);font-size:13px;margin:0 0 6px;text-transform:uppercase;letter-spacing:.5px">${euro.meta.icon} ${euro.meta.label} — League Phase</h4>
          <div style="border:1px solid var(--border);border-radius:6px;overflow:hidden;max-height:280px;overflow-y:auto">
            <div style="display:grid;grid-template-columns:28px 1fr 28px 28px 28px 28px 36px;gap:0;padding:6px 8px;background:var(--bg3);font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase;position:sticky;top:0">
              <span>#</span><span>Team</span><span>P</span><span>W</span><span>D</span><span>L</span><span>Pts</span>
            </div>
            ${rows.map((r,i) => {
              const isPlayer = r.team === c.sportsTeam;
              const bg = isPlayer ? 'background:rgba(212,175,55,0.15);' : '';
              const col = isPlayer ? 'color:var(--gold);font-weight:700;' : '';
              const zone = i<8?'border-left:3px solid #3fa34d':i<24?'border-left:3px solid #c4a754':'border-left:3px solid #c44';
              return `<div style="display:grid;grid-template-columns:28px 1fr 28px 28px 28px 28px 36px;gap:0;padding:5px 8px;font-size:11px;border-top:1px solid var(--border);${bg}${col}${zone}">
                <span>${i+1}</span><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.team}${isPlayer?' ←':''}</span>
                <span>${r.p}</span><span>${r.w}</span><span>${r.d}</span><span>${r.l}</span><span><b>${r.pts}</b></span>
              </div>`;
            }).join('')}
          </div>
          <div style="font-size:10px;color:var(--muted);margin-top:4px;display:flex;gap:8px;flex-wrap:wrap">
            <span><span style="color:#3fa34d">▌</span>R16</span>
            <span><span style="color:#c4a754">▌</span>Playoff</span>
            <span><span style="color:#c44">▌</span>Eliminated</span>
          </div>
        </div>`;
      }
    } else {
      html += `<div style="background:var(--bg3);padding:10px;border-radius:6px;font-size:12px;color:var(--muted);text-align:center">Season standings update each ${monthName==='Jul'?'August':'matchday'}.</div>`;
    }
  } else {
    // Non-athlete: revenue, sentiment, efficiency, your stats, job rank
    const tier = c.careerTierId ? +c.careerTierId.replace('tier','') : 2;
    const tierMult = [1, 1, 5, 25, 120, 500][tier] || 5;
    const revenueAnnual = Math.round((c.salary || 60000) * tierMult * rf(0.85, 1.2));
    const revenueMonthly = Math.round(revenueAnnual / 12);
    const sentiment = clamp(Math.round(60 + (c.performance-50)*0.4 + (c.bossMorale-65)*0.2 + ri(-5,5)), 30, 98);
    const efficiency = clamp(Math.round(55 + (c.performance-50)*0.5 + ri(-8,8)), 30, 98);
    // Job rank in field — based on performance
    const rankMax = 100;
    const playerRank = clamp(Math.round(rankMax - (c.performance/100)*80 - (c.smarts/100)*15 + ri(-5,5)), 1, rankMax);
    const monthIdx = c.monthAge % 12;
    const monthName = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][monthIdx];
    const monthlyPerfNote = c.performance>=85?'Outstanding':c.performance>=70?'Very Good':c.performance>=55?'Good':c.performance>=40?'Fair':'Struggling';
    const sentColor = sentiment>=75?'#3fa34d':sentiment>=55?'#c4a754':'#c44';
    const effColor = efficiency>=75?'#3fa34d':efficiency>=55?'#c4a754':'#c44';
    html += `<div style="margin-bottom:14px">
      <h4 style="color:var(--gold);font-size:13px;margin:0 0 8px;text-transform:uppercase;letter-spacing:.5px">📈 Company Performance</h4>
      <div class="info-row"><span class="ir-label">Annual Revenue</span><span class="ir-value pos">${fmt$(revenueAnnual)}</span></div>
      <div class="info-row"><span class="ir-label">Monthly Revenue</span><span class="ir-value pos">${fmt$(revenueMonthly)}</span></div>
      <div class="info-row"><span class="ir-label">Customer Sentiment</span><span class="ir-value" style="color:${sentColor}">${sentiment}% ${sentiment>=75?'😊':sentiment>=55?'😐':'😠'}</span></div>
      <div class="info-row"><span class="ir-label">Workplace Efficiency</span><span class="ir-value" style="color:${effColor}">${efficiency}% ${efficiency>=75?'⚡':efficiency>=55?'⚙️':'🐢'}</span></div>
      <div class="info-row"><span class="ir-label">Order Fulfillment</span><span class="ir-value" style="color:${effColor}">${Math.round(efficiency*0.95)}%</span></div>
    </div>
    <div style="margin-bottom:14px">
      <h4 style="color:var(--gold);font-size:13px;margin:0 0 8px;text-transform:uppercase;letter-spacing:.5px">🎯 Your Stats at ${c.jobTitle}</h4>
      <div class="info-row"><span class="ir-label">Performance</span><span class="ir-value gold">${Math.round(c.performance)}% · ${monthlyPerfNote}</span></div>
      <div class="info-row"><span class="ir-label">Boss Morale</span><span class="ir-value">${Math.round(c.bossMorale)}%</span></div>
      <div class="info-row"><span class="ir-label">Smarts</span><span class="ir-value">${Math.round(c.smarts)}%</span></div>
      <div class="info-row"><span class="ir-label">Tenure</span><span class="ir-value">${c.yearsAtJob||0} yrs · ${c.monthsAtJob||0} mo</span></div>
      <div class="info-row"><span class="ir-label">Salary</span><span class="ir-value pos">${fmt$(c.salary)}/yr</span></div>
    </div>
    <div style="margin-bottom:14px">
      <h4 style="color:var(--gold);font-size:13px;margin:0 0 8px;text-transform:uppercase;letter-spacing:.5px">🏅 ${monthName} — Field Ranking</h4>
      <div class="info-row"><span class="ir-label">Job Rank in Field</span><span class="ir-value gold">#${playerRank} of ${rankMax}</span></div>
      <div class="info-row"><span class="ir-label">Top ${Math.round(playerRank/rankMax*100)}%</span><span class="ir-value">${playerRank<=10?'Elite ⭐':playerRank<=25?'High Performer':playerRank<=50?'Solid':playerRank<=75?'Average':'Below Avg'}</span></div>
      <div class="info-row"><span class="ir-label">Monthly Performance</span><span class="ir-value">${monthlyPerfNote}</span></div>
    </div>`;
  }
  return html;
}

function renderPartnersHTML(c){
  if(!c.employed){
    return '<p style="color:var(--muted);text-align:center;padding:20px">Not employed. Coworkers appear once you have a job.</p>';
  }
  const list = genCoworkers(c);
  if(!list || !list.length) return '<p style="color:var(--muted)">No coworkers yet.</p>';
  const boss = list.find(p => p.tier === 'boss');
  const seniors = list.filter(p => p.tier === 'senior');
  const regulars = list.filter(p => p.tier === 'regular');

  const seatHTML = (p, idx, total, ringR) => {
    const angle = (idx / total) * Math.PI * 2 - Math.PI/2;
    const x = 50 + Math.cos(angle) * ringR;
    const y = 50 + Math.sin(angle) * ringR;
    const moraleColor = p.morale>=70?'#3fa34d':p.morale>=45?'#c4a754':'#c44';
    return `<div style="position:absolute;left:${x}%;top:${y}%;transform:translate(-50%,-50%);width:78px;text-align:center;font-size:9px">
      <div style="position:relative;width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#3a3a3a,#1f1f1f);border:2px solid ${moraleColor};margin:0 auto 2px;display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--gold);font-weight:700">
        ${p.name.split(' ').map(s=>s[0]).join('')}
        ${p.justHired?'<div style="position:absolute;top:-4px;right:-4px;background:#3fa34d;color:white;border-radius:8px;padding:1px 4px;font-size:8px;font-weight:700">NEW</div>':''}
      </div>
      <div style="font-weight:700;color:var(--text);line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name.split(' ')[0]}</div>
      <div style="color:var(--muted);line-height:1.1">${p.position}</div>
      <div style="color:var(--gold);line-height:1.2;font-size:8px">${p.country}</div>
    </div>`;
  };
  const popoverData = list.map((p,i) => `data-cw-${i}="${encodeURIComponent(JSON.stringify(p))}"`).join(' ');
  let html = `<div style="font-size:11px;color:var(--muted);margin-bottom:8px;text-align:center">Tap a name for full stats</div>`;

  // Boss office
  if(boss){
    const moraleColor = boss.morale>=70?'#3fa34d':boss.morale>=45?'#c4a754':'#c44';
    html += `<div style="margin-bottom:14px">
      <h4 style="color:var(--gold);font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:.5px">🏢 Boss's Office</h4>
      <div class="cw-card" data-cw='${JSON.stringify(boss).replace(/'/g, "&#39;")}' style="display:flex;align-items:center;gap:12px;padding:12px;background:linear-gradient(135deg,#2a2218,#1a1410);border:2px solid var(--gold);border-radius:8px;cursor:pointer">
        <div style="width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,#4a3a1c,#2a1f10);border:2px solid ${moraleColor};display:flex;align-items:center;justify-content:center;font-size:18px;color:var(--gold);font-weight:700;flex-shrink:0">
          ${boss.name.split(' ').map(s=>s[0]).join('')}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;color:var(--gold);font-size:14px">${boss.name}</div>
          <div style="font-size:11px;color:var(--text)">${boss.position} · Age ${boss.age} · ${boss.country}</div>
          <div style="font-size:10px;color:var(--muted);margin-top:2px">Tenure ${boss.tenure}y · Morale <b style="color:${moraleColor}">${boss.morale}%</b> · Smarts ${boss.smarts}%</div>
        </div>
      </div>
    </div>`;
  }

  // Senior round table
  if(seniors.length){
    html += `<div style="margin-bottom:14px">
      <h4 style="color:var(--gold);font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:.5px">🎯 Senior Table</h4>
      <div style="position:relative;width:100%;max-width:340px;margin:0 auto;aspect-ratio:1;background:radial-gradient(ellipse at center, #2d4a2d 0%, #1a2e1a 60%, #0d1a0d 100%);border:3px solid #6b4f1c;border-radius:50%">
        ${seniors.map((p,i) => seatHTML(p, i, seniors.length, 38)).join('')}
        <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:10px;color:#6b4f1c;font-weight:700;letter-spacing:1px">SENIOR</div>
      </div>
    </div>`;
  }

  // Regular round table (poker style)
  if(regulars.length){
    html += `<div style="margin-bottom:8px">
      <h4 style="color:var(--gold);font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:.5px">🤝 Coworker Table</h4>
      <div style="position:relative;width:100%;max-width:380px;margin:0 auto;aspect-ratio:1;background:radial-gradient(ellipse at center, #1f3a4a 0%, #142a36 60%, #0a1820 100%);border:3px solid #6b4f1c;border-radius:50%">
        ${regulars.map((p,i) => seatHTML(p, i, regulars.length, 40)).join('')}
        <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:10px;color:#6b4f1c;font-weight:700;letter-spacing:1px">TEAM</div>
      </div>
    </div>`;
  }

  // Detailed list (alternative view)
  html += `<details style="margin-top:10px"><summary style="cursor:pointer;color:var(--gold);font-size:12px;font-weight:700;padding:6px 0">📋 Full Coworker List</summary>
    <div style="display:grid;gap:6px;margin-top:6px">${list.map(p => {
      const moraleColor = p.morale>=70?'#3fa34d':p.morale>=45?'#c4a754':'#c44';
      const fitColor = p.fitness>=70?'#3fa34d':p.fitness>=45?'#c4a754':'#c44';
      return `<div style="padding:8px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;font-size:11px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
          <span style="font-weight:700;color:var(--gold)">${p.name} ${p.justHired?'<span style="background:#3fa34d;color:white;border-radius:6px;padding:1px 5px;font-size:9px;margin-left:4px">NEW HIRE</span>':''}</span>
          <span style="color:var(--muted);font-size:10px">${p.country}</span>
        </div>
        <div style="color:var(--muted);font-size:10px;margin-bottom:3px">${p.position} · Age ${p.age} · ${p.tenure}y tenure</div>
        <div style="display:flex;gap:8px;font-size:10px;flex-wrap:wrap">
          <span>Morale <b style="color:${moraleColor}">${p.morale}%</b></span>
          <span>Fitness <b style="color:${fitColor}">${p.fitness}%</b></span>
          <span>Smarts <b style="color:var(--text)">${p.smarts}%</b></span>
        </div>
      </div>`;
    }).join('')}</div>
  </details>`;
  return html;
}

function showTableModal(tab){
  const c = GS.char;
  const headline = c.employed
    ? `${c.jobTitle}${c.sportsTeam?` @ ${c.sportsTeam}`:''} · ${fmt$(c.salary)}/yr`
    : 'Not employed';
  showActionModal('📊 Company Table', headline, [{text:'Close', fn(){ return ''; }}]);
  $('modal-box').classList.add('compact');
  const ch = $('m-choices');
  // Tab bar
  const tabBar = document.createElement('div');
  tabBar.style.cssText = 'display:flex;gap:4px;margin-bottom:10px;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--bg2);z-index:2';
  ['standings','partners'].forEach(id => {
    const b = document.createElement('button');
    b.textContent = id === 'standings' ? '📊 Standings' : '🤝 Partners';
    const active = id === tab;
    b.style.cssText = `flex:1;padding:10px 8px;background:${active?'var(--bg3)':'transparent'};border:none;border-bottom:2px solid ${active?'var(--gold)':'transparent'};color:${active?'var(--gold)':'var(--muted)'};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;cursor:pointer;transition:all .15s;border-radius:6px 6px 0 0`;
    b.onclick = () => showTableModal(id);
    tabBar.appendChild(b);
  });
  ch.insertBefore(tabBar, ch.firstChild);
  // Body container — insert before the Close button
  const bodyDiv = document.createElement('div');
  bodyDiv.style.cssText = 'padding:0 4px';
  bodyDiv.innerHTML = tab === 'partners' ? renderPartnersHTML(c) : renderStandingsHTML(c);
  // Insert before the last button (Close)
  const closeBtn = ch.lastElementChild;
  ch.insertBefore(bodyDiv, closeBtn);
}

$('btn-table').onclick = () => {
  const c = GS.char;
  if(!c.employed && !c.retired){ showToast('Get a job first to see your company table!'); return; }
  showTableModal('standings');
};

$('btn-bank').onclick=()=>{
  const c=GS.char;
  const cur = c.bankId ? bankById(c.bankId) : null;
  const sector = c.jobSector;
  const headline = cur
    ? `Bank: ${cur.icon} ${cur.name} · Fee ${fmt$(cur.fee)}/mo · APY +${cur.apyBonus.toFixed(1)}%`
    : 'No bank yet. Pick one to unlock insurance, bonuses, and APY perks.';
  const choices = [
    {text:`Move $5k to Savings (2% APY)`,fn(){if(c.checking<5000)return'Not enough in checking.';c.checking-=5000;c.savings+=5000;return`Moved $5,000 to savings.`}},
    {text:`Move $5k to High-Yield (4%${cur?` +${cur.apyBonus.toFixed(1)}%`:''})`,fn(){if(c.checking<5000)return'Not enough in checking.';c.checking-=5000;c.highYield+=5000;return`Moved $5,000 to high-yield savings.`}},
    {text:`Personal Loan $10k (11.5% APR)`,fn(){c.checking+=10000;c.debt+=10000;return`Loan approved. +$10,000 cash, +$10,000 debt.`}},
    {text:`Pay off $5k debt`,fn(){if(c.checking<5000)return'Not enough.';if(c.debt<5000)return`Debt is only ${fmt$(c.debt)}.`;c.checking-=5000;c.debt-=5000;return`Paid $5,000 debt. Remaining: ${fmt$(c.debt)}`}},
  ];
  // If player has a bank, show current coverage first
  if(cur){
    const covTxt = Object.entries(cur.covers).map(([k,v])=>`${k}:${Math.round(v*100)}%`).join(' · ');
    choices.push({text:`🛡️ View my coverage (${covTxt||'none'})`, fn(){
      return `${cur.icon} ${cur.name}\n${cur.blurb}\nFee: ${fmt$(cur.fee)}/mo · Signup: ${fmt$(cur.signupBonus)} · APY +${cur.apyBonus.toFixed(1)}%\n\nCoverage: ${covTxt||'—'}`;
    }});
  }
  // Browse all 20 banks — sector-matched banks sort first
  const rankedBanks = [...BANKS].sort((a,b)=>{
    const as = sector && a.suits.includes(sector) ? 1 : 0;
    const bs = sector && b.suits.includes(sector) ? 1 : 0;
    return bs - as;
  });
  for(const b of rankedBanks){
    const isMine = cur && cur.id===b.id;
    const fit = sector && b.suits.includes(sector) ? ' ⭐FIT' : '';
    const mineTag = isMine ? ' ✅ CURRENT' : '';
    const covTop = Object.entries(b.covers).sort((x,y)=>y[1]-x[1]).slice(0,2)
      .map(([k,v])=>`${k} ${Math.round(v*100)}%`).join(', ');
    choices.push({
      text:`${b.icon} ${b.name}${fit}${mineTag} — ${fmt$(b.fee)}/mo · ${covTop||'basic'}`,
      fn(){
        if(isMine) return `Already a member at ${b.name}.`;
        return joinBank(c, b.id);
      }
    });
  }
  showActionModal('Banking', headline, choices);
  $('modal-box').classList.add('compact');
};

$('btn-invest').onclick=()=>showStockModal();

$('btn-realty').onclick=()=>{
  const inv=GS.inv,c=GS.char;
  const m=CLIMATE_MULT[inv.climate]||CLIMATE_MULT.normal;
  const tiers=[
    {name:'Starter Condo',price:Math.round(ri(150000,280000)*m.re)},
    {name:'2BR House',price:Math.round(ri(280000,500000)*m.re)},
    {name:'3BR House',price:Math.round(ri(450000,750000)*m.re)},
    {name:'Luxury Home',price:Math.round(ri(800000,2000000)*m.re)},
  ];
  const choices=tiers.map(t=>{
    const down=Math.round(t.price*0.2); const debt=t.price-down;
    const mp=Math.round(debt*(0.065/12)*Math.pow(1+0.065/12,360)/(Math.pow(1+0.065/12,360)-1));
    return{text:`Buy ${t.name}: ${fmt$(t.price)} (${fmt$(down)} down, ${fmt$(mp)}/mo mortgage)`,fn(){
      if(c.checking<down)return`Need ${fmt$(down)} for down payment.`;
      c.checking-=down;
      const isFirst = !inv.properties.some(p=>p.livedIn);
      inv.properties.push({name:t.name,value:t.price,debt,monthlyPayment:mp,rented:false,rent:Math.round(t.price*0.006),age:0,livedIn:isFirst});
      c.hasHouse=inv.properties.some(p=>p.livedIn);
      return`Bought ${t.name}! Equity: ${fmt$(down)}${isFirst?' · Moved in.':''}`;
    }};
  });
  // Per-property options: move in/out, rent toggle, sell
  for(let i=0;i<inv.properties.length;i++){
    const p=inv.properties[i];
    const tag=p.livedIn?' 🏡 (living here)':p.rented?' 💰 (renting out)':' (vacant)';
    if(!p.livedIn){
      choices.push({text:`Move into ${p.name}${tag}`,fn(){
        inv.properties.forEach(x=>x.livedIn=false);
        p.livedIn=true; p.rented=false;
        c.hasHouse=true;
        return`Moved into ${p.name}. Your new home!`;
      }});
    } else {
      choices.push({text:`Move out of ${p.name}${tag}`,fn(){
        p.livedIn=false;
        c.hasHouse=inv.properties.some(x=>x.livedIn);
        return`Moved out of ${p.name}. Now paying rent elsewhere.`;
      }});
    }
    if(!p.livedIn){
      if(!p.rented) choices.push({text:`Rent out ${p.name} (~${fmt$(p.rent)}/mo)`,fn(){p.rented=true;return`Now renting for ${fmt$(p.rent)}/mo!`}});
      else choices.push({text:`Stop renting ${p.name}`,fn(){p.rented=false;return'Stopped renting.'}});
    }
    choices.push({text:`Sell ${p.name} (equity: ${fmt$(p.value-p.debt)})${tag}`,fn(){
      const eq=p.value-p.debt; c.checking+=eq;
      inv.properties.splice(i,1);
      c.hasHouse=inv.properties.some(x=>x.livedIn);
      return`Sold for ${fmt$(eq)} net equity.${!c.hasHouse?' Back to renting.':''}`;
    }});
  }
  choices.unshift({text:'🚗 Browse Vehicles (cars, bikes, boats, planes)',fn(){setTimeout(()=>showVehiclesModal(),50);return'Opening vehicles...';}});
  showActionModal('Real Estate','Buy properties to live in, rent out, or flip. Also browse vehicles from here.',choices);
};

// ── Vehicles modal — cars, motorcycles, boats, planes (with EVs) ──
function showVehiclesModal(){
  const inv=GS.inv, c=GS.char;
  if(!inv.vehicles) inv.vehicles=[];
  const choices=[];
  // Group catalog by type for readability
  const order=['car','motorcycle','boat','plane'];
  const labels={car:'🚗 CARS',motorcycle:'🏍️ MOTORCYCLES',boat:'⛵ BOATS',plane:'✈️ PLANES'};
  for(const type of order){
    const items=VEHICLE_CATALOG.filter(v=>v.type===type);
    for(const v of items){
      const evTag = v.isElectric ? ' ⚡EV' : '';
      const canAfford = c.checking>=v.price;
      choices.push({
        text:`${v.icon} ${v.name}${evTag} — ${fmt$(v.price)} · ${fmt$(v.monthlyCost)}/mo`,
        fn(){
          if(c.checking<v.price) return`Need ${fmt$(v.price)}.`;
          c.checking-=v.price;
          inv.vehicles.push({...v, value:v.price, age:0});
          return`Bought ${v.name}! Current fleet value: ${fmt$(totalVehicleValue(inv))}.`;
        }
      });
    }
  }
  // Sell options
  if(inv.vehicles.length){
    for(let i=0;i<inv.vehicles.length;i++){
      const v=inv.vehicles[i];
      const ageYrs=((v.age||0)/12).toFixed(1);
      choices.unshift({
        text:`💸 Sell ${v.icon} ${v.name} — value: ${fmt$(v.value)} (${ageYrs}yr old)`,
        fn(){
          // Private sale takes ~5% loss vs market value
          const proceeds=Math.round(v.value*0.95);
          c.checking+=proceeds;
          inv.vehicles.splice(i,1);
          return`Sold for ${fmt$(proceeds)}.`;
        }
      });
    }
  }
  choices.unshift({text:'🏠 Back to Properties',fn(){setTimeout(()=>$('btn-realty').click(),50);return'Back to real estate...';}});
  showActionModal('Vehicles','Cars, bikes, boats, planes. ⚡ = Electric.',choices);
  $('modal-box').classList.add('compact');
}

$('btn-crypto').onclick=()=>showCryptoModal();

// ── Side Hustle Catalog ──
// Each hustle: low-cost side-income (adds to salary) OR higher-risk business (goes into inv.businesses).
// Success chance scales with smarts/looks where noted.
const SIDE_HUSTLES = [
  // ── GIG / LABOR ──
  {icon:'🍔',name:'DoorDash / Uber Eats',desc:'Drive nights & weekends for food delivery apps.',cost:0,incMin:3500,incMax:8500,success:1.0,stat:null},
  {icon:'🚗',name:'Rideshare (Uber/Lyft)',desc:'Drive people around on evenings and weekends.',cost:0,incMin:5000,incMax:12000,success:1.0,stat:null},
  {icon:'🐕',name:'Dog Walking / Pet Sitting',desc:'Rover or Wag — walk and board neighborhood pets.',cost:100,incMin:2000,incMax:6000,success:0.9,stat:null},
  {icon:'🌿',name:'Lawn Care / Landscaping',desc:'Mow lawns and trim hedges in your area.',cost:400,incMin:3000,incMax:10000,success:0.85,stat:null},
  {icon:'🧹',name:'House Cleaning',desc:'Clean apartments and homes on weekends.',cost:150,incMin:3500,incMax:9000,success:0.9,stat:null},
  {icon:'🔧',name:'Handyman Services',desc:'Fix stuff for neighbors — TaskRabbit style.',cost:500,incMin:4000,incMax:14000,success:0.8,stat:null},

  // ── CREATIVE / CREATOR ──
  {icon:'🎥',name:'YouTube Channel',desc:'Build an audience around a niche — monetize via ads & sponsors.',cost:800,incMin:0,incMax:60000,success:0.35,stat:'smarts'},
  {icon:'🎮',name:'Twitch Streamer',desc:'Stream games nightly. Hit-or-miss chasing the algorithm.',cost:1500,incMin:0,incMax:40000,success:0.28,stat:'smarts'},
  {icon:'📱',name:'TikTok Creator',desc:'Post daily viral content, chase brand deals.',cost:200,incMin:0,incMax:35000,success:0.32,stat:'looks'},
  {icon:'🎙️',name:'Podcast Host',desc:'Record a weekly podcast on a topic you know well.',cost:600,incMin:0,incMax:18000,success:0.40,stat:'smarts'},
  {icon:'✍️',name:'Substack Newsletter',desc:'Write a paid weekly newsletter in your area of expertise.',cost:0,incMin:0,incMax:25000,success:0.45,stat:'smarts'},
  {icon:'📸',name:'Freelance Photographer',desc:'Shoot weddings, portraits, events on weekends.',cost:3000,incMin:2000,incMax:22000,success:0.55,stat:'looks'},
  {icon:'🎨',name:'Etsy Art Shop',desc:'Sell prints, stickers, and digital art.',cost:300,incMin:1000,incMax:14000,success:0.55,stat:'smarts'},
  {icon:'🎵',name:'Sell Music / Beats',desc:'Produce beats on BeatStars, sell instrumentals.',cost:500,incMin:500,incMax:18000,success:0.40,stat:'smarts'},

  // ── TECH ──
  {icon:'💻',name:'Freelance Web Dev',desc:'Build websites for small businesses on Upwork.',cost:0,incMin:8000,incMax:35000,success:0.70,stat:'smarts'},
  {icon:'📲',name:'Mobile App Developer',desc:'Ship a paid app or monetize a free one with ads.',cost:500,incMin:0,incMax:45000,success:0.35,stat:'smarts'},
  {icon:'🤖',name:'AI Prompt Consultant',desc:'Help businesses integrate AI workflows.',cost:200,incMin:5000,incMax:40000,success:0.55,stat:'smarts'},
  {icon:'🛡️',name:'Cybersecurity Consulting',desc:'Pen-test small business networks.',cost:1000,incMin:10000,incMax:50000,success:0.50,stat:'smarts'},

  // ── TEACHING / SERVICE ──
  {icon:'📚',name:'Online Tutoring',desc:'Tutor students in math, writing, or test prep.',cost:0,incMin:4000,incMax:16000,success:0.75,stat:'smarts'},
  {icon:'🏋️',name:'Personal Trainer',desc:'Get certified, train clients at the gym or online.',cost:800,incMin:4000,incMax:20000,success:0.65,stat:'looks'},
  {icon:'🧘',name:'Yoga Instructor',desc:'Teach evening classes at a local studio.',cost:1500,incMin:3000,incMax:12000,success:0.60,stat:'looks'},
  {icon:'🎓',name:'Test Prep Coach',desc:'Coach students on SAT/GRE/LSAT.',cost:400,incMin:6000,incMax:22000,success:0.60,stat:'smarts'},

  // ── RESALE / E-COM ──
  {icon:'👟',name:'Sneaker Reselling',desc:'Cop limited drops, flip on StockX.',cost:2000,incMin:-2000,incMax:18000,success:0.50,stat:null},
  {icon:'📦',name:'Amazon FBA',desc:'Private-label products via Amazon fulfillment.',cost:5000,incMin:-5000,incMax:45000,success:0.40,stat:'smarts'},
  {icon:'🛍️',name:'Dropshipping Store',desc:'Shopify store selling trending products.',cost:2500,incMin:-2500,incMax:35000,success:0.35,stat:'smarts'},
  {icon:'♻️',name:'Thrift Store Flipping',desc:'Buy cheap at thrift stores, resell on eBay/Poshmark.',cost:500,incMin:1500,incMax:12000,success:0.65,stat:null},
  {icon:'🪑',name:'Furniture Flipping',desc:'Restore and resell vintage furniture.',cost:800,incMin:2000,incMax:14000,success:0.55,stat:null},
  {icon:'🚲',name:'Garage Sale Flipper',desc:'Scour garage sales for undervalued finds.',cost:200,incMin:500,incMax:6000,success:0.60,stat:null},

  // ── REAL ESTATE / PASSIVE ──
  {icon:'🏡',name:'Airbnb Co-Host',desc:'Manage listings for other owners (no property needed).',cost:300,incMin:3000,incMax:16000,success:0.70,stat:'smarts'},
  {icon:'🖨️',name:'Print-on-Demand',desc:'Upload designs to Redbubble / Printify — fully passive.',cost:200,incMin:500,incMax:9000,success:0.45,stat:null},
  {icon:'🔗',name:'Affiliate Blog',desc:'Write SEO content, earn affiliate commissions.',cost:400,incMin:0,incMax:22000,success:0.40,stat:'smarts'},

  // ── HIGH RISK ──
  {icon:'📈',name:'Day Trading',desc:'Trade stocks intraday. Most lose money.',cost:3000,incMin:-5000,incMax:50000,success:0.25,stat:'smarts'},
  {icon:'🎰',name:'Sports Betting Arbitrage',desc:'Cross-book bets exploiting line differences.',cost:2000,incMin:-3000,incMax:15000,success:0.35,stat:'smarts'},
];

function runSideHustle(h){
  const c=GS.char;
  if(c.checking<h.cost) return `Need ${fmt$(h.cost)} startup capital.`;
  c.checking-=h.cost;
  let successRate=h.success;
  if(h.stat==='smarts') successRate=clamp(successRate*(0.5+c.smarts/100),0,0.95);
  else if(h.stat==='looks') successRate=clamp(successRate*(0.5+c.looks/100),0,0.95);
  if(pct(successRate)){
    const statMult = h.stat==='smarts'?(0.6+c.smarts/120):h.stat==='looks'?(0.6+c.looks/120):1.0;
    const inc = Math.round((h.incMin + Math.random()*(h.incMax-h.incMin)) * statMult);
    if(inc<=0){
      const loss=Math.abs(inc);
      return `${h.name} lost money. Down ${fmt$(loss+h.cost)} total.`;
    }
    c.sideHustleIncome=(c.sideHustleIncome||0)+inc;
    return `🎉 ${h.name} paying off! +${fmt$(inc)}/yr side-hustle income (tracked separately from job salary).`;
  }
  const loss = h.incMin<0 ? Math.round(Math.abs(h.incMin)*Math.random()) : 0;
  if(loss>0){ c.checking-=loss; return `❌ ${h.name} flopped. Lost ${fmt$(h.cost+loss)} total.`; }
  return `❌ ${h.name} didn't gain traction. Lost ${fmt$(h.cost)} startup.`;
}

$('btn-sponsors').onclick=()=>{
  const inv=GS.inv, c=GS.char;
  if(!sponsorsUnlocked(inv)){
    showToast('Sponsors unlock at $500k total business value.');
    return;
  }
  // Refresh offers once per visit if older than 3 months or missing
  const stale = !inv.sponsorOffers || !inv.sponsorOffers.length || (c.monthAge - (inv.sponsorOffersMonth||0) > 3);
  if(stale) rollSponsorOffers();
  const active = inv.sponsors||[];
  const activeLines = active.length
    ? `Active: ${active.map(s=>`${s.icon} ${s.name} (${fmt$(s.monthly)}/mo · ${s.monthsLeft}mo left)`).join(' · ')}`
    : 'No active sponsors yet.';
  const headline = `Total biz value: ${fmt$(totalBizValue(inv))}\n${activeLines}`;
  const choices = [];
  for(const o of (inv.sponsorOffers||[])){
    const alreadySigned = active.some(s=>s.name===o.name);
    if(alreadySigned) continue;
    const bonus = o.monthly * 3;
    choices.push({
      text:`${o.icon} ${o.name} — ${fmt$(o.monthly)}/mo × ${o.months}mo · ${fmt$(bonus)} signing bonus`,
      fn(){ return signSponsor(o); }
    });
  }
  if(!choices.length){
    choices.push({text:'📭 No offers right now — come back next month', fn(){return 'Check back after aging a few months.';}});
  }
  choices.push({text:'🔄 Refresh offers (next visit rerolls)', fn(){ rollSponsorOffers(); setTimeout(()=>$('btn-sponsors').click(),50); return 'Rerolled.'; }});
  showActionModal('Sponsors', headline, choices);
  $('modal-box').classList.add('compact');
};

// ── Fitness ──────────────────────────────────────────────────────
const FITNESS_GYM = [
  {id:'day_pass',      name:'🏃 Gym day pass',           cost:15,   h:2, p:1},
  {id:'basic_gym',     name:'💪 Basic gym (3-mo pass)',   cost:180,  h:8, p:3},
  {id:'premium_gym',   name:'🏋️ Premium gym (6-mo pass)',cost:560,  h:14,p:5},
  {id:'home_gym',      name:'🏠 Home gym setup',          cost:1800, h:16,p:7},
  {id:'yoga_class',    name:'🧘 Yoga class pack',        cost:90,   h:4, p:6},
  {id:'pilates',       name:'🤸 Pilates studio bundle',  cost:240,  h:7, p:5},
  {id:'swimming',      name:'🏊 Swim club 3-mo',         cost:220,  h:9, p:4},
  {id:'cycling',       name:'🚴 Bike + cycling gear',    cost:650,  h:11,p:6},
];
const FITNESS_FOOD = [
  {id:'healthy_meal',  name:'🥗 Healthy meal prep (week)',cost:110,  h:4, p:2},
  {id:'organic_haul',  name:'🍎 Organic grocery haul',   cost:320,  h:6, p:3},
  {id:'supplements',   name:'💊 Supplements stack',      cost:140,  h:3, p:1},
  {id:'chef_service',  name:'👨‍🍳 Private chef (month)',  cost:1800, h:12,p:8},
  {id:'hydration',     name:'💧 Premium hydration plan', cost:80,   h:2, p:2},
  {id:'protein_plan',  name:'🥩 Protein-rich diet plan', cost:260,  h:6, p:2},
];
const FITNESS_WELLNESS = [
  {id:'massage',       name:'💆 Massage therapy',         cost:130,  h:5, p:7},
  {id:'spa_day',       name:'🧖 Full spa day',            cost:280,  h:6, p:10},
  {id:'meditation',    name:'🕉️ Meditation retreat',      cost:650,  h:5, p:12},
  {id:'therapy',       name:'🧠 Therapy sessions (month)',cost:480,  h:3, p:11},
  {id:'hiking',        name:'🥾 Guided hiking trip',      cost:220,  h:8, p:8},
  {id:'sleep_tracker', name:'😴 Sleep tracker + coach',   cost:350,  h:7, p:5},
];
const FITNESS_ATHLETE = [
  {id:'personal_trainer',name:'🏆 Elite personal trainer',cost:600,  h:14,p:6},
  {id:'nutritionist',  name:'🥙 Sports nutritionist',    cost:900,  h:12,p:4},
  {id:'recovery_spa',  name:'❄️ Cryotherapy + recovery', cost:450,  h:9, p:8},
  {id:'sport_camp',    name:'🏕️ Pro training camp',      cost:3800, h:22,p:12},
  {id:'physio',        name:'🩹 Physiotherapist (month)',cost:800,  h:11,p:5},
  {id:'performance_lab',name:'🧪 Performance lab session',cost:1200,h:13,p:4},
];
function buyFitness(item){
  const c = GS.char;
  if(c.checking < item.cost){ showToast('Not enough cash.'); return null; }
  c.checking -= item.cost;
  c.health    = clamp((c.health||75) + item.h, 0, 100);
  c.happiness = clamp((c.happiness||75) + item.p, 0, 100);
  showToast(`+${item.h} health, +${item.p} happiness`);
  return `Spent ${fmt$(item.cost)} on ${item.name}. +${item.h} health · +${item.p} happiness.`;
}

$('btn-fitness').onclick=()=>{
  const c = GS.char;
  const isAthlete = c.jobSector === 'sports';
  const health = c.health||75, happy = c.happiness||75;
  const headline = `Health: ${health}/100 · Happiness: ${happy}/100 · Cash: ${fmt$(c.checking)}${isAthlete?`\n🏆 Athlete bonuses unlocked (${c.jobTitle})`:''}`;
  const choices = [];
  const mkChoice = item => ({
    text:`${item.name} — ${fmt$(item.cost)} · +${item.h}❤️ +${item.p}😊`,
    fn(){ return buyFitness(item) || ''; }
  });
  choices.push({header:'🏋️ Gym & Workouts'});
  FITNESS_GYM.forEach(i => choices.push(mkChoice(i)));
  choices.push({header:'🥗 Health Food'});
  FITNESS_FOOD.forEach(i => choices.push(mkChoice(i)));
  choices.push({header:'🧘 Wellness'});
  FITNESS_WELLNESS.forEach(i => choices.push(mkChoice(i)));
  if(isAthlete){
    choices.push({header:'🏆 Athlete Exclusives'});
    // Apply 1.4x health multiplier for athletes on athlete-only items
    FITNESS_ATHLETE.forEach(base => {
      const boosted = {...base, h: Math.round(base.h * 1.4)};
      choices.push(mkChoice(boosted));
    });
  }
  showActionModal('Fitness & Wellness', headline, choices);
  $('modal-box').classList.add('compact');
};


$('btn-edu').onclick=()=>{
  const c=GS.char;
  const choices=[];
  for(const[key,def]of Object.entries(SCHOOL_DEFS)){
    if(c.inSchool){const mLeft=c.schoolMonthsLeft;choices.push({text:`In school — ${mLeft} month${mLeft!==1?'s':''} left`,fn(){return'Still studying!'}});break;}
    const reqOk=!def.req||eduIdx(c.education)>=eduIdx(def.req);
    const notDone=eduIdx(c.education)<eduIdx(def.result);
    const ageOk=c.age>=def.minAge&&c.age<=def.maxAge;
    if(reqOk&&notDone&&ageOk){
      const months=def.dur*12; const totalCost=def.cost*def.dur;
      choices.push({text:`${EDU_LABELS[def.result]} (${months} months, ${fmt$(totalCost)} total in loans)`,fn(){
        c.inSchool=true;c.schoolType=key;c.schoolMonthsLeft=months;c.schoolCostMonthly=Math.round(def.cost/12);
        c.employed=false;c.salary=0;
        return`Enrolled in ${EDU_LABELS[def.result]}! Graduating in ${months} months.`;
      }});
    }
  }
  if(!choices.length)choices.push({text:'No education options available at this age/level',fn(){return'Nothing available right now.'}});
  showActionModal('Education','Invest in your future earning potential.',choices);
};

$('btn-inbox').onclick=()=>{ showInboxModal(); };

$('btn-age').onclick=()=>{
  if(!GS.char||!GS.char.alive)return;
  $('btn-age').disabled=true;
  annualTick();
  setTimeout(()=>{$('btn-age').disabled=false;},300);
};

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
    btn.classList.add('active');
    $('tab-'+btn.dataset.tab).classList.add('active');
  };
});


