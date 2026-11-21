// --- GAME STATE ---
let G = null;

function defaultState() {
  return {
    season: 1,
    seasonYear: 2025,
    week: 1,
    division: "Championship",
    userTeamId: null,
    budget: 0,
    weeklyWages: 0,
    myPlayers: [],
    myCoaches: [],
    transferList: [],
    incomingBids: [],
    youthPlayers: [],
    scoutingMission: null,
    messages: [],
    awards: [],
    teams: {},
    players: {},
    coaches: {},
    fixtures: {},
    standings: {},
    results: [],
    lastMonthResultsCount: 0,
    monthlyAwardsGiven: 0,
    playerStats: {},
    careerStats: {},
    userFormation: null,
    manualSlots: {},
    lossStreak: 0,
    stadium: { capacity: 30000, tier: 1, ticketPrice: 35 },
    totalAwards: 0,
    cupMatches: [],      // [{ week, cup, round, opponentId, isHome, played, result }]
    cupResults: {},      // { 'fa': {status: 'in'|'out', round: 'R5'}, ... }
    europeanQualification: null, // 'cl'|'el'|'uecl'|null — set at end of PL season
    currentEuroComp: null,       // which comp user is currently in this season
    euroLeagues: null,           // European domestic league state (standings + fixtures)
    euroComp: null,              // CL/EL/UECL competition state
    nextId: 1
  };
}

// --- UTILITIES ---
function rand(a, b) { return Math.random() * (b - a) + a; }
function randInt(a, b) { return Math.floor(rand(a, b + 1)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function fmtMoney(v) {
  if (v >= 1e9) return "£" + (v/1e9).toFixed(2) + "B";
  if (v >= 1e6) return "£" + (v/1e6).toFixed(1) + "M";
  if (v >= 1e3) return "£" + (v/1e3).toFixed(0) + "k";
  return "£" + Math.round(v);
}
function normalRandom() {
  // Box-Muller, scaled small
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * 0.6;
}
function nextId() { return G.nextId++; }

// Returns number of half-stars (1..10) — so 5 = 2.5 stars, 10 = 5 stars
function ratingToHalfStars(r) {
  if (r < 40) return 1;
  if (r >= 88) return 10;
  return Math.max(1, Math.min(10, Math.floor((r - 40) / 5.4) + 1));
}
// Legacy compat — full-star integer (1..5) used by filter dropdowns
function ratingToStars(r) {
  return Math.ceil(ratingToHalfStars(r) / 2);
}
function starsHTML(r) {
  const half = ratingToHalfStars(r);
  const display = (half / 2).toFixed(1).replace(/\.0$/, '');
  let h = '<span class="stars">';
  for (let i = 0; i < 5; i++) {
    const slot = i * 2;
    if (half >= slot + 2) h += '★';
    else if (half >= slot + 1) h += '<span class="star-half">★</span>';
    else h += '<span class="star-empty">★</span>';
  }
  h += `<span class="rating-num">${display}/5</span></span>`;
  return h;
}

function ratingToValue(rating, age) {
  let base;
  if (rating >= 85) base = rand(25e6, 60e6);
  else if (rating >= 75) base = rand(8e6, 25e6);
  else if (rating >= 65) base = rand(2e6, 8e6);
  else if (rating >= 55) base = rand(500e3, 2e6);
  else if (rating >= 45) base = rand(100e3, 500e3);
  else base = rand(10e3, 100e3);
  if (age < 23) base *= 1.5;
  else if (age > 30) base *= 0.7;
  const final = Math.round(base);
  // 3 stars and under (rating <= 64) hard-capped at £10M
  if (rating <= 64) return Math.min(final, 10e6);
  return final;
}

function ratingToWage(rating) {
  // Weekly wage roughly scales with rating
  if (rating >= 85) return Math.round(rand(80e3, 250e3));
  if (rating >= 75) return Math.round(rand(30e3, 80e3));
  if (rating >= 65) return Math.round(rand(10e3, 30e3));
  if (rating >= 55) return Math.round(rand(3e3, 10e3));
  if (rating >= 45) return Math.round(rand(1e3, 3e3));
  return Math.round(rand(300, 1500));
}

function coachWage(rating) {
  if (rating >= 85) return Math.round(rand(20e3, 25e3));
  if (rating >= 75) return Math.round(rand(12e3, 20e3));
  if (rating >= 65) return Math.round(rand(7e3, 12e3));
  if (rating >= 55) return Math.round(rand(4e3, 7e3));
  return Math.round(rand(3e3, 5e3));
}

// --- AVATAR ---
function makeAvatar(id, name, nationality) {
  let s = (id * 2654435761) >>> 0;
  const rng = () => { s = (s ^ (s << 13)) >>> 0; s = (s ^ (s >> 17)) >>> 0; s = (s ^ (s << 5)) >>> 0; return s / 4294967296; };

  const skinPalette = [
    { skin:'#FDBCB4', shadow:'#D48070', nose:'#C07060' },
    { skin:'#F5CBA7', shadow:'#D4975E', nose:'#B87848' },
    { skin:'#E0AC69', shadow:'#B87842', nose:'#A0682E' },
    { skin:'#C68642', shadow:'#9A6028', nose:'#885018' },
    { skin:'#8D5524', shadow:'#6A3A10', nose:'#5A2C08' },
    { skin:'#4A2912', shadow:'#321808', nose:'#2A1206' },
  ];
  const fair = ['English','Spanish','German','French','Dutch','Belgian','Italian','Portuguese','Scottish','Welsh','Irish'];
  const mid  = ['Brazilian','Colombian','Argentinian','Uruguayan','Moroccan'];
  let si;
  if (fair.includes(nationality)) si = Math.floor(rng() * 3);
  else if (mid.includes(nationality)) si = 2 + Math.floor(rng() * 2);
  else si = 3 + Math.floor(rng() * 3);
  si = Math.min(si, 5);
  const { skin, shadow, nose: noseClr } = skinPalette[si];

  const hairPalette = ['#111','#1C1008','#2C1810','#4A2E18','#6B3A20','#8B5E2A','#A07830','#C4A050','#E0B060','#C0C0C0','#808080'];
  const hair = hairPalette[Math.floor(rng() * hairPalette.length)];
  const browColor = (hair === '#C0C0C0' || hair === '#808080') ? '#888' : hair;

  const eyePalette = ['#3B5A3C','#4A6E8A','#7B5A38','#2A3C52','#6B4226','#3D5A3D'];
  const eyeColor = eyePalette[Math.floor(rng() * eyePalette.length)];

  const jerseyPalette = ['#c0392b','#2980b9','#27ae60','#d35400','#8e44ad','#16a085','#e67e22','#e91e63','#00bcd4','#ff5722','#1565c0','#558b2f'];
  const jersey = jerseyPalette[(id * 7) % jerseyPalette.length];

  const styles = ['short','fade','wavy','curly','bald','mohawk','long','buzz'];
  const hairStyle = styles[Math.floor(rng() * styles.length)];

  const hasBeard = rng() < 0.35;
  const hasMustache = !hasBeard && rng() < 0.25;
  const hasTattoo = rng() < 0.15;
  const beardStyle = Math.floor(rng() * 3);
  const mouthStyle = Math.floor(rng() * 3);

  let hairSVG = '';
  switch(hairStyle) {
    case 'short':
      hairSVG = `<path d="M16,30 Q16,12 30,11 Q44,12 44,30 Q42,16 30,15 Q18,16 16,30Z" fill="${hair}"/>`;
      break;
    case 'fade':
      hairSVG = `<path d="M17,29 Q17,12 30,11 Q43,12 43,29 Q41,17 30,15 Q19,17 17,29Z" fill="${hair}"/>`;
      break;
    case 'wavy':
      hairSVG = `<path d="M16,28 Q17,10 30,10 Q43,10 44,28 Q42,14 30,13 Q18,14 16,28Z" fill="${hair}"/>
<path d="M16,28 Q18,22 20,26 Q22,20 24,24 Q26,18 28,22 Q30,16 32,20 Q34,16 36,20 Q38,18 40,24 Q42,22 44,28Z" fill="${hair}" opacity="0.7"/>`;
      break;
    case 'curly':
      hairSVG = `<path d="M16,28 Q16,8 30,8 Q44,8 44,28 Q42,12 30,11 Q18,12 16,28Z" fill="${hair}"/>
<circle cx="21" cy="15" r="3.5" fill="${hair}"/>
<circle cx="27" cy="10" r="4" fill="${hair}"/>
<circle cx="33" cy="10" r="4" fill="${hair}"/>
<circle cx="39" cy="15" r="3.5" fill="${hair}"/>
<circle cx="24" cy="13" r="3" fill="${hair}"/>
<circle cx="36" cy="13" r="3" fill="${hair}"/>`;
      break;
    case 'bald':
      hairSVG = `<path d="M18,27 Q18,17 30,16 Q42,17 42,27 Q40,20 30,19 Q20,20 18,27Z" fill="${hair}" opacity="0.12"/>`;
      break;
    case 'mohawk':
      hairSVG = `<path d="M27,22 L27.5,10 Q30,7 32.5,10 L33,22 Q30,19 27,22Z" fill="${hair}"/>`;
      break;
    case 'long':
      hairSVG = `<path d="M16,28 Q16,12 30,11 Q44,12 44,28 Q42,14 30,13 Q18,14 16,28Z" fill="${hair}"/>
<rect x="14" y="27" width="5" height="24" rx="2.5" fill="${hair}"/>
<rect x="41" y="27" width="5" height="24" rx="2.5" fill="${hair}"/>`;
      break;
    case 'buzz':
    default:
      hairSVG = `<path d="M17,28 Q17,14 30,13 Q43,14 43,28 Q41,17 30,16 Q19,17 17,28Z" fill="${hair}" opacity="0.85"/>`;
      break;
  }

  let beardSVG = '';
  if (hasBeard) {
    if (beardStyle === 0)
      beardSVG = `<ellipse cx="30" cy="44" rx="11" ry="7" fill="${hair}" opacity="0.9"/>
<path d="M19,40 Q30,48 41,40 Q41,47 30,50 Q19,47 19,40Z" fill="${hair}" opacity="0.85"/>`;
    else if (beardStyle === 1)
      beardSVG = `<ellipse cx="30" cy="43" rx="11" ry="6" fill="${hair}" opacity="0.28"/>`;
    else
      beardSVG = `<ellipse cx="30" cy="46" rx="5.5" ry="5" fill="${hair}" opacity="0.9"/>`;
  }

  let mustacheSVG = hasMustache
    ? `<path d="M24.5,39.5 Q27,37.5 30,38.5 Q33,37.5 35.5,39.5 Q33,40.5 30,39.5 Q27,40.5 24.5,39.5Z" fill="${hair}"/>`
    : '';

  let tattooSVG = '';
  if (hasTattoo) {
    const tStyle = Math.floor(rng() * 3);
    if (tStyle === 0)
      tattooSVG = `<text x="14" y="30" font-size="5" fill="${shadow}" opacity="0.55" font-family="serif">★</text>`;
    else if (tStyle === 1)
      tattooSVG = `<path d="M15,27 L16,30 M14,29 L17,29" stroke="${shadow}" stroke-width="0.9" opacity="0.45" stroke-linecap="round"/>`;
    else
      tattooSVG = `<path d="M14,26 L15.5,29 L14,32 L16.5,30 L19,31.5 L17.5,29 L19,26.5 L16.5,28Z" fill="${shadow}" opacity="0.38"/>`;
  }

  let mouthSVG;
  if (mouthStyle === 0)
    mouthSVG = `<path d="M25,40 Q30,43 35,40" stroke="#b06070" stroke-width="1.8" fill="none" stroke-linecap="round"/>
<path d="M25,40 Q30,39 35,40" stroke="#c07880" stroke-width="0.8" fill="none"/>`;
  else if (mouthStyle === 1)
    mouthSVG = `<path d="M25.5,40.5 Q30,41.5 34.5,40.5" stroke="#b06070" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  else
    mouthSVG = `<path d="M25,41 Q30,39.5 35,41" stroke="#b06070" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
<circle cx="30" cy="30" r="30" fill="#0d1117"/>
<ellipse cx="30" cy="66" rx="28" ry="22" fill="${jersey}"/>
<rect x="26" y="46" width="8" height="14" rx="3" fill="${skin}"/>
<ellipse cx="30" cy="30" rx="14" ry="16" fill="${skin}"/>
${hairSVG}
<ellipse cx="16" cy="30" rx="3" ry="4" fill="${skin}"/>
<ellipse cx="44" cy="30" rx="3" ry="4" fill="${skin}"/>
<path d="M21,23.5 Q24.5,21 28,23" stroke="${browColor}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
<path d="M32,23 Q35.5,21 39,23.5" stroke="${browColor}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
<ellipse cx="24.5" cy="27" rx="3.8" ry="3" fill="white"/>
<circle cx="24.5" cy="27" r="2.2" fill="${eyeColor}"/>
<circle cx="24.5" cy="27" r="1.3" fill="#111"/>
<circle cx="25.3" cy="26.2" r="0.55" fill="white"/>
<ellipse cx="35.5" cy="27" rx="3.8" ry="3" fill="white"/>
<circle cx="35.5" cy="27" r="2.2" fill="${eyeColor}"/>
<circle cx="35.5" cy="27" r="1.3" fill="#111"/>
<circle cx="36.3" cy="26.2" r="0.55" fill="white"/>
<path d="M29,30 L27.8,35" stroke="${noseClr}" stroke-width="0.9" fill="none" stroke-linecap="round"/>
<path d="M31,30 L32.2,35" stroke="${noseClr}" stroke-width="0.9" fill="none" stroke-linecap="round"/>
<path d="M26.8,35.5 Q28.2,37 30,36.5 Q31.8,37 33.2,35.5" stroke="${noseClr}" stroke-width="0.9" fill="none" stroke-linecap="round"/>
${mouthSVG}
${beardSVG}
${mustacheSVG}
${tattooSVG}
</svg>`;

  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

// --- GENERATORS ---
function generatePlayer(position, ageRange = [17, 35], maxRating = 99) {
  const nat = pick(NATIONALITIES);
  const firstName = pick(FIRST_NAMES[nat]);
  const lastName = pick(LAST_NAMES[nat]);
  const age = randInt(ageRange[0], ageRange[1]);
  // Rating distribution
  let rating;
  const r = Math.random();
  if (r < 0.05) rating = randInt(85, 92);     // Elite
  else if (r < 0.20) rating = randInt(75, 84); // Top
  else if (r < 0.45) rating = randInt(65, 74); // Good
  else if (r < 0.75) rating = randInt(55, 64); // Average
  else rating = randInt(45, 54);               // Lower
  if (rating > maxRating) rating = randInt(Math.max(40, maxRating - 14), maxRating);
  const id = nextId();
  const fullName = firstName + " " + lastName;
  const p = {
    id,
    firstName, lastName,
    name: fullName,
    age,
    nationality: nat,
    position,
    rating,
    potential: Math.min(99, rating + randInt(0, 15)),
    value: ratingToValue(rating, age),
    wage: ratingToWage(rating),
    contractYears: randInt(1, 4),
    teamId: null,
    morale: 70,
    moraleBoostWeeks: 0,
    avatar: makeAvatar(id, fullName, nat),
    awards: [],
  };
  G.players[id] = p;
  G.playerStats[id] = { apps: 0, goals: 0, assists: 0, cleanSheets: 0, rating: 6.5 };
  G.careerStats[id] = { apps: 0, goals: 0, assists: 0, cleanSheets: 0 };
  return p;
}

function generateAllPlayers() {
  const dist = [
    ["GK", 15],
    ["CB", 30], ["LB", 10], ["RB", 10],
    ["LWB", 5], ["RWB", 5],
    ["CDM", 20], ["CM", 30], ["CAM", 20],
    ["LM", 7], ["RM", 8],
    ["LW", 12], ["RW", 13],
    ["ST", 30], ["CF", 15], ["SS", 10],
    ["SW", 5]
  ];
  dist.forEach(([pos, count]) => {
    for (let i = 0; i < count; i++) generatePlayer(pos);
  });
}

function generateCoach() {
  const nat = pick(NATIONALITIES);
  const firstName = pick(FIRST_NAMES[nat]);
  const lastName = pick(LAST_NAMES[nat]);
  const age = randInt(30, 65);
  const role = pick(COACH_ROLES);
  let rating;
  const r = Math.random();
  if (r < 0.10) rating = randInt(80, 90);
  else if (r < 0.40) rating = randInt(65, 79);
  else rating = randInt(50, 64);
  const id = nextId();
  const name = firstName + " " + lastName;
  const c = {
    id, firstName, lastName, name, age,
    nationality: nat,
    role, rating,
    wage: coachWage(rating),
    contractYears: randInt(1, 3),
    teamId: null,
    avatar: makeAvatar(id, name, nat),
    type: "coach",
    careerWins: 0,
    careerSeasons: 0
  };
  G.coaches[id] = c;
  return c;
}

function generateAllCoaches() {
  for (let i = 0; i < 80; i++) generateCoach();
}

function generateAITeamSquad(team) {
  // Tier-based avg rating
  let avgRange;
  if (team.division === "Premier League") avgRange = [75, 85];
  else if (team.division === "Championship") {
    // top/mid/bottom
    if (team.tier === 1) avgRange = [68, 75];
    else if (team.tier === 2) avgRange = [62, 68];
    else avgRange = [58, 64];
  } else {
    avgRange = [55, 62];
  }
  const targetAvg = rand(avgRange[0], avgRange[1]);
  const needed = {
    GK: 2,
    DEF: 6,
    MID: 6,
    FWD: 4
  };
  const squad = [];
  // Pull from existing free pool
  const free = Object.values(G.players).filter(p => p.teamId === null);
  // Group by position-group
  function pickFor(group, count) {
    const pool = free.filter(p => POSITIONS[p.position].group === group && !squad.includes(p.id));
    // Sort by closeness to target rating
    pool.sort((a, b) => Math.abs(a.rating - targetAvg) - Math.abs(b.rating - targetAvg));
    for (let i = 0; i < count && i < pool.length; i++) {
      squad.push(pool[i].id);
      pool[i].teamId = team.id;
    }
  }
  pickFor("GK", needed.GK);
  pickFor("DEF", needed.DEF);
  pickFor("MID", needed.MID);
  pickFor("FWD", needed.FWD);
  team.players = squad;
}

function setupTeams() {
  let id = 1;
  const setup = (list, division) => {
    list.forEach(([name, city, fact], i) => {
      const tier = i < 8 ? 1 : (i < 16 ? 2 : 3);
      const team = {
        id: id++,
        name, city, fact,
        division,
        tier,
        players: [],
        coachHeadRating: division === "Premier League" ? randInt(75, 90)
                       : division === "Championship" ? randInt(65, 80)
                       : randInt(55, 70),
        budget: 0,
        founded: division
      };
      G.teams[team.id] = team;
    });
  };
  setup(PREMIER_LEAGUE, "Premier League");
  setup(CHAMPIONSHIP, "Championship");
  setup(LEAGUE_ONE, "League One");
}

