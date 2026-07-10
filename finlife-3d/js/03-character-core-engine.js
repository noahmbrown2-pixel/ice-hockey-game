// ════════════════════════════════════════════════════════════════
//  CHARACTER & CORE ENGINE
// ════════════════════════════════════════════════════════════════

const EDU_LEVELS = ['none','high_school','associates','bachelors','masters','doctoral','professional'];
const EDU_LABELS = {none:'No Diploma',high_school:'High School',associates:"Associate's",bachelors:"Bachelor's",masters:"Master's",doctoral:'PhD',professional:'JD/MD'};
const EDU_SALARY = {none:[18000,32000],high_school:[28000,55000],associates:[35000,65000],bachelors:[45000,110000],masters:[60000,160000],doctoral:[75000,220000],professional:[90000,350000]};
const SCHOOL_DEFS = {
  high_school:{dur:4,cost:0,result:'high_school',minAge:14,maxAge:20,req:null},
  associates:{dur:2,cost:6000,result:'associates',minAge:18,maxAge:30,req:'high_school'},
  bachelors:{dur:4,cost:18000,result:'bachelors',minAge:18,maxAge:35,req:'high_school'},
  masters:{dur:2,cost:25000,result:'masters',minAge:22,maxAge:45,req:'bachelors'},
  doctoral:{dur:4,cost:15000,result:'doctoral',minAge:24,maxAge:50,req:'bachelors'},
  professional:{dur:3,cost:45000,result:'professional',minAge:22,maxAge:45,req:'bachelors'},
};
const CAREER_TIERS = [
  {id:'entry',title:['Cashier','Warehouse Worker','Server','Call Center Rep'],salScale:1.0,promYrs:4},
  {id:'skilled',title:['Technician','Office Manager','Sales Rep','Supervisor'],salScale:1.4,promYrs:5},
  {id:'professional',title:['Engineer','Accountant','Financial Analyst','IT Manager'],salScale:2.0,promYrs:6},
  {id:'executive',title:['Director','VP of Finance','General Manager','Senior VP'],salScale:3.5,promYrs:7},
  {id:'ceo',title:['CEO','CFO','COO','CTO'],salScale:8.0,promYrs:999},
];
const DEATH_CAUSES = ['Heart Attack','Cancer','Stroke','Old Age','Pneumonia','Liver Failure','Accident'];

// ── Monthly Expense Items ─────────────────────────────────────────
const MONTHLY_EXPENSES = [
  {name:'New Shoes',          icon:'👟', min:80,   max:180},
  {name:'Brand New TV',       icon:'📺', min:300,  max:900},
  {name:'New Smartphone',     icon:'📱', min:400,  max:1100},
  {name:'Designer Jacket',    icon:'🧥', min:120,  max:400},
  {name:'New Laptop',         icon:'💻', min:600,  max:1500},
  {name:'Gaming Console',     icon:'🎮', min:300,  max:600},
  {name:'Headphones',         icon:'🎧', min:50,   max:350},
  {name:'Smart Watch',        icon:'⌚', min:150,  max:500},
  {name:'New Couch',          icon:'🛋️', min:400,  max:1200},
  {name:'Coffee Maker',       icon:'☕', min:40,   max:200},
  {name:'Gym Equipment',      icon:'🏋️', min:100,  max:600},
  {name:'Kitchen Appliance',  icon:'🍳', min:80,   max:400},
  {name:'Car Accessories',    icon:'🚗', min:60,   max:300},
  {name:'New Outfit',         icon:'👔', min:80,   max:250},
  {name:'Sunglasses',         icon:'🕶️', min:30,   max:300},
  {name:'Power Tool',         icon:'🔧', min:80,   max:350},
  {name:'Backpack',           icon:'🎒', min:40,   max:200},
  {name:'Home Decor Set',     icon:'🪴', min:60,   max:250},
  {name:'Bluetooth Speaker',  icon:'🔊', min:50,   max:300},
  {name:'Air Purifier',       icon:'💨', min:80,   max:350},
];

function createChar(name, scenario){
  const sc = {broke:{cash:500,savings:0,debt:25000,salaryMult:0.7},middle:{cash:5000,savings:2000,debt:8000,salaryMult:1.0},rich:{cash:50000,savings:100000,debt:0,salaryMult:1.5}};
  const s = sc[scenario]||sc.middle;
  return {
    name, monthAge:264, age:22, alive:true, deathCause:null,
    health:ri(65,95), happiness:ri(55,85), smarts:ri(40,90), looks:ri(40,85),
    checking:s.cash, savings:s.savings, highYield:0,
    debt:s.debt, salary:0, creditScore:580,
    education: scenario==='broke'?'high_school':'bachelors',
    inSchool:false, schoolType:null, schoolMonthsLeft:0, schoolCostMonthly:0,
    employed:false, jobTitle:null, careerTierId:'entry', yearsAtJob:0, monthsAtJob:0, performance:ri(50,80), bossMorale:ri(55,75),
    sideHustleIncome:0,
    relationship:'single', spouseName:null, spouseIncome:0, yearsTogether:0,
    kids:0, hasCar:(scenario!=='broke'), hasHouse:false, houseValue:0, houseDebt:0,
    retired:false, lifestyle:'normal',
    creditCards:0, studentDebt:s.debt,
    _graduated:scenario!=='broke', _hadFirstJob:false, _everMarried:false,
    events:[],
    pendingExpenses:[],  // [{name, icon, cost, monthsLeft}]
    belongings:[],       // [{id, name, icon, cost, purchasedAt}]
    bankId:null, bankTenureMonths:0, _bankFeeWaivedMonth:-1,
  };
}

function ageDisplay(char){
  const m = char.monthAge % 12;
  return m===0 ? `${char.age}` : `${char.age}y ${m}m`;
}

function eduIdx(e){return EDU_LEVELS.indexOf(e)}

function computeSalary(char, tier){
  const [mn,mx] = EDU_SALARY[char.education]||[28000,55000];
  const base = rf(mn,mx);
  const sm = 0.5+(char.smarts/100);
  return Math.round(base*tier.salScale*sm);
}

function getJobTier(char){
  const eidx = eduIdx(char.education);
  if(eidx>=5) return CAREER_TIERS[3]; // doctoral+
  if(eidx>=3) return CAREER_TIERS[2]; // bachelors
  if(eidx>=2) return CAREER_TIERS[1]; // associates
  return CAREER_TIERS[0];
}

function tickCareer(char, ev){
  if(char.inSchool||!char.employed) return;
  char.yearsAtJob++;
  const raise = 0.01+(char.smarts/100)*0.02+(char.performance/100)*0.02;
  char.salary = Math.round(char.salary*(1+raise));
  // Promotion check
  const tIdx = CAREER_TIERS.findIndex(t=>t.id===char.careerTierId);
  const tier = CAREER_TIERS[tIdx];
  if(tIdx<CAREER_TIERS.length-1 && char.yearsAtJob>=tier.promYrs){
    if(pct(0.15+(char.performance/100)*0.35)){
      const next = CAREER_TIERS[tIdx+1];
      char.careerTierId = next.id;
      char.jobTitle = pick(next.title);
      char.salary = computeSalary(char, next);
      char.yearsAtJob = 0;
      ev.push({type:'career',text:`Promoted to ${char.jobTitle}! Salary: ${fmt$(char.salary)}/yr`});
    }
  }
  char.performance = clamp(char.performance+ri(-5,5),10,100);
  if(pct(0.03+(char.performance<30?0.1:0))){
    char.employed=false; char.salary=0; char.happiness=clamp(char.happiness-15,0,100);
    ev.push({type:'career',text:'Laid off. Job lost.'});
  }
}

// ── 50-Job System ─────────────────────────────────────────────────
const ALL_JOBS = [
  // Healthcare
  {id:'doctor',              name:'Doctor',              sector:'healthcare', min:180000, max:300000, edu:'professional', tier:4},
  {id:'nurse',               name:'Nurse',               sector:'healthcare', min:75000,  max:100000, edu:'bachelors',    tier:3},
  {id:'surgeon',             name:'Surgeon',             sector:'healthcare', min:250000, max:400000, edu:'professional', tier:5},
  {id:'dentist',             name:'Dentist',             sector:'healthcare', min:150000, max:220000, edu:'professional', tier:4},
  {id:'pharmacist',          name:'Pharmacist',          sector:'healthcare', min:120000, max:140000, edu:'professional', tier:4},
  {id:'physical_therapist',  name:'Physical Therapist',  sector:'healthcare', min:85000,  max:110000, edu:'masters',      tier:3},
  {id:'emt',                 name:'EMT',                 sector:'healthcare', min:35000,  max:50000,  edu:'high_school',  tier:1},
  {id:'paramedic',           name:'Paramedic',           sector:'healthcare', min:40000,  max:60000,  edu:'associates',   tier:2},
  // Business & Finance
  {id:'accountant',          name:'Accountant',          sector:'finance',    min:60000,  max:90000,  edu:'bachelors',    tier:3},
  {id:'financial_advisor',   name:'Financial Advisor',   sector:'finance',    min:70000,  max:120000, edu:'bachelors',    tier:3},
  {id:'banker',              name:'Banker',              sector:'finance',    min:50000,  max:90000,  edu:'bachelors',    tier:2},
  {id:'stockbroker',         name:'Stockbroker',         sector:'finance',    min:70000,  max:150000, edu:'bachelors',    tier:3},
  {id:'real_estate_agent',   name:'Real Estate Agent',   sector:'finance',    min:50000,  max:120000, edu:'high_school',  tier:2},
  {id:'marketing_manager',   name:'Marketing Manager',   sector:'finance',    min:80000,  max:140000, edu:'bachelors',    tier:3},
  // Technology
  {id:'software_developer',  name:'Software Developer',  sector:'tech',       min:90000,  max:150000, edu:'bachelors',    tier:3},
  {id:'web_developer',       name:'Web Developer',       sector:'tech',       min:70000,  max:110000, edu:'associates',   tier:3},
  {id:'data_scientist',      name:'Data Scientist',      sector:'tech',       min:100000, max:160000, edu:'masters',      tier:4},
  {id:'cybersecurity_analyst',name:'Cybersecurity Analyst',sector:'tech',     min:95000,  max:140000, edu:'bachelors',    tier:3},
  {id:'it_support',          name:'IT Support',          sector:'tech',       min:45000,  max:70000,  edu:'high_school',  tier:2},
  {id:'game_developer',      name:'Game Developer',      sector:'tech',       min:70000,  max:120000, edu:'bachelors',    tier:3},
  // Education
  {id:'teacher',             name:'Teacher',             sector:'education',  min:50000,  max:80000,  edu:'bachelors',    tier:2},
  {id:'professor',           name:'Professor',           sector:'education',  min:70000,  max:150000, edu:'doctoral',     tier:4},
  {id:'tutor',               name:'Tutor',               sector:'education',  min:30000,  max:60000,  edu:'high_school',  tier:1},
  {id:'school_counselor',    name:'School Counselor',    sector:'education',  min:60000,  max:90000,  edu:'masters',      tier:3},
  // Law & Government
  {id:'lawyer',              name:'Lawyer',              sector:'law',        min:80000,  max:200000, edu:'professional', tier:4},
  {id:'police_officer',      name:'Police Officer',      sector:'law',        min:50000,  max:90000,  edu:'high_school',  tier:2},
  {id:'firefighter',         name:'Firefighter',         sector:'law',        min:50000,  max:85000,  edu:'high_school',  tier:2},
  {id:'fbi_agent',           name:'FBI Agent',           sector:'law',        min:70000,  max:130000, edu:'bachelors',    tier:3},
  // Creative
  {id:'actor',               name:'Actor',               sector:'creative',   min:30000,  max:100000, edu:'none',         tier:2},
  {id:'photographer',        name:'Photographer',        sector:'creative',   min:40000,  max:80000,  edu:'none',         tier:2},
  {id:'graphic_designer',    name:'Graphic Designer',    sector:'creative',   min:50000,  max:85000,  edu:'associates',   tier:2},
  {id:'video_editor',        name:'Video Editor',        sector:'creative',   min:45000,  max:75000,  edu:'associates',   tier:2},
  // Trades
  {id:'electrician',         name:'Electrician',         sector:'trades',     min:55000,  max:90000,  edu:'high_school',  tier:2},
  {id:'plumber',             name:'Plumber',             sector:'trades',     min:50000,  max:85000,  edu:'high_school',  tier:2},
  {id:'mechanic',            name:'Mechanic',            sector:'trades',     min:40000,  max:70000,  edu:'high_school',  tier:2},
  {id:'carpenter',           name:'Carpenter',           sector:'trades',     min:45000,  max:75000,  edu:'high_school',  tier:2},
  {id:'construction_worker', name:'Construction Worker', sector:'trades',     min:40000,  max:65000,  edu:'none',         tier:1},
  // Service
  {id:'chef',                name:'Chef',                sector:'service',    min:45000,  max:80000,  edu:'high_school',  tier:2},
  {id:'waiter',              name:'Waiter',              sector:'service',    min:25000,  max:50000,  edu:'none',         tier:1},
  {id:'barber',              name:'Barber',              sector:'service',    min:30000,  max:70000,  edu:'none',         tier:1},
  {id:'personal_trainer',    name:'Personal Trainer',    sector:'service',    min:40000,  max:75000,  edu:'high_school',  tier:2},
  // Transportation
  {id:'truck_driver',        name:'Truck Driver',        sector:'transport',  min:50000,  max:80000,  edu:'high_school',  tier:2},
  {id:'pilot',               name:'Pilot',               sector:'transport',  min:100000, max:250000, edu:'bachelors',    tier:4},
  {id:'bus_driver',          name:'Bus Driver',          sector:'transport',  min:40000,  max:65000,  edu:'high_school',  tier:1},
  // Other
  {id:'architect',           name:'Architect',           sector:'other',      min:70000,  max:120000, edu:'bachelors',    tier:3},
  {id:'civil_engineer',      name:'Civil Engineer',      sector:'other',      min:75000,  max:110000, edu:'bachelors',    tier:3},
  {id:'scientist',           name:'Scientist',           sector:'other',      min:70000,  max:130000, edu:'doctoral',     tier:4},
  {id:'veterinarian',        name:'Veterinarian',        sector:'other',      min:90000,  max:140000, edu:'professional', tier:4},
  {id:'social_worker',       name:'Social Worker',       sector:'other',      min:45000,  max:70000,  edu:'bachelors',    tier:2},
  {id:'fitness_coach',       name:'Fitness Coach',       sector:'other',      min:35000,  max:65000,  edu:'none',         tier:1},
  // Sports / Athletes
  {id:'semipro_athlete',     name:'Semi-Pro Athlete',    sector:'sports',     min:35000,  max:85000,  edu:'high_school',  tier:1},
  {id:'mma_fighter',         name:'MMA Fighter',         sector:'sports',     min:50000,  max:500000, edu:'none',         tier:2},
  {id:'boxer',               name:'Professional Boxer',  sector:'sports',     min:45000,  max:750000, edu:'none',         tier:2},
  {id:'esports_pro',         name:'Esports Pro',         sector:'sports',     min:55000,  max:500000, edu:'high_school',  tier:3},
  {id:'swimmer',             name:'Pro Swimmer',         sector:'sports',     min:45000,  max:250000, edu:'high_school',  tier:2},
  {id:'track_athlete',       name:'Track & Field Pro',   sector:'sports',     min:40000,  max:180000, edu:'high_school',  tier:2},
  {id:'olympic_athlete',     name:'Olympic Athlete',     sector:'sports',     min:50000,  max:300000, edu:'high_school',  tier:3},
  {id:'tennis_player',       name:'Tennis Player',       sector:'sports',     min:65000,  max:2500000,edu:'high_school',  tier:3},
  {id:'golfer',              name:'Professional Golfer', sector:'sports',     min:80000,  max:2500000,edu:'high_school',  tier:3},
  {id:'soccer_player',       name:'Soccer Player',       sector:'sports',     min:75000,  max:3500000,edu:'high_school',  tier:3},
  {id:'race_car_driver',     name:'Race Car Driver',     sector:'sports',     min:150000, max:3000000,edu:'high_school',  tier:4},
  {id:'baseball_player',     name:'Baseball Player',     sector:'sports',     min:600000, max:5000000,edu:'high_school',  tier:4},
  {id:'hockey_player',       name:'Hockey Player',       sector:'sports',     min:700000, max:4500000,edu:'high_school',  tier:4},
  {id:'football_player',     name:'NFL Football Player', sector:'sports',     min:800000, max:6000000,edu:'bachelors',    tier:5},
  {id:'basketball_player',   name:'NBA Basketball Player',sector:'sports',    min:1000000,max:10000000,edu:'bachelors',   tier:5},
  {id:'team_coach',          name:'Team Coach',          sector:'sports',     min:60000,  max:300000, edu:'bachelors',    tier:3},
  {id:'athletic_trainer',    name:'Athletic Trainer',    sector:'sports',     min:45000,  max:85000,  edu:'bachelors',    tier:2},
  // Healthcare (extended)
  {id:'nurse_practitioner',  name:'Nurse Practitioner',  sector:'healthcare', min:115000, max:135000, edu:'masters',      tier:4},
  {id:'physician_assistant', name:'Physician Assistant', sector:'healthcare', min:110000, max:135000, edu:'masters',      tier:4},
  {id:'orthodontist',        name:'Orthodontist',        sector:'healthcare', min:180000, max:280000, edu:'professional', tier:5},
  {id:'occupational_therapist',name:'Occupational Therapist',sector:'healthcare',min:80000,max:100000,edu:'masters',      tier:3},
  {id:'speech_therapist',    name:'Speech Therapist',    sector:'healthcare', min:75000,  max:100000, edu:'masters',      tier:3},
  {id:'psychologist',        name:'Psychologist',        sector:'healthcare', min:80000,  max:130000, edu:'doctoral',     tier:4},
  {id:'psychiatrist',        name:'Psychiatrist',        sector:'healthcare', min:200000, max:300000, edu:'professional', tier:5},
  {id:'medical_assistant',   name:'Medical Assistant',   sector:'healthcare', min:32000,  max:48000,  edu:'high_school',  tier:1},
  {id:'radiologic_tech',     name:'Radiologic Technologist',sector:'healthcare',min:55000,max:80000, edu:'associates',   tier:2},
  {id:'lab_technician',      name:'Lab Technician',      sector:'healthcare', min:45000,  max:70000,  edu:'associates',   tier:2},
  {id:'anesthesiologist',    name:'Anesthesiologist',    sector:'healthcare', min:350000, max:450000, edu:'professional', tier:5},
  {id:'dietitian',           name:'Dietitian',           sector:'healthcare', min:55000,  max:75000,  edu:'bachelors',    tier:2},
  {id:'chiropractor',        name:'Chiropractor',        sector:'healthcare', min:70000,  max:120000, edu:'professional', tier:3},
  {id:'optometrist',         name:'Optometrist',         sector:'healthcare', min:110000, max:140000, edu:'professional', tier:4},
  {id:'vet_assistant',       name:'Vet Assistant',       sector:'healthcare', min:28000,  max:40000,  edu:'high_school',  tier:1},
  {id:'home_health_aide',    name:'Home Health Aide',    sector:'healthcare', min:25000,  max:38000,  edu:'none',         tier:1},
  // Technology (extended)
  {id:'app_developer',       name:'App Developer',       sector:'tech',       min:85000,  max:140000, edu:'bachelors',    tier:3},
  {id:'game_designer',       name:'Game Designer',       sector:'tech',       min:65000,  max:120000, edu:'bachelors',    tier:3},
  {id:'data_analyst',        name:'Data Analyst',        sector:'tech',       min:60000,  max:95000,  edu:'bachelors',    tier:2},
  {id:'network_engineer',    name:'Network Engineer',    sector:'tech',       min:75000,  max:120000, edu:'bachelors',    tier:3},
  {id:'sys_admin',           name:'Systems Administrator',sector:'tech',      min:65000,  max:95000,  edu:'associates',   tier:2},
  {id:'cloud_engineer',      name:'Cloud Engineer',      sector:'tech',       min:110000, max:170000, edu:'bachelors',    tier:4},
  {id:'ai_engineer',         name:'AI Engineer',         sector:'tech',       min:130000, max:220000, edu:'masters',      tier:4},
  {id:'ml_engineer',         name:'ML Engineer',         sector:'tech',       min:120000, max:200000, edu:'masters',      tier:4},
  {id:'ux_designer',         name:'UX Designer',         sector:'tech',       min:75000,  max:120000, edu:'bachelors',    tier:3},
  {id:'ui_designer',         name:'UI Designer',         sector:'tech',       min:70000,  max:110000, edu:'bachelors',    tier:3},
  {id:'db_admin',            name:'Database Administrator',sector:'tech',     min:80000,  max:120000, edu:'bachelors',    tier:3},
  {id:'devops_engineer',     name:'DevOps Engineer',     sector:'tech',       min:100000, max:160000, edu:'bachelors',    tier:3},
  {id:'qa_tester',           name:'QA Tester',           sector:'tech',       min:55000,  max:85000,  edu:'associates',   tier:2},
  {id:'programmer',          name:'Computer Programmer', sector:'tech',       min:70000,  max:110000, edu:'bachelors',    tier:2},
  {id:'blockchain_dev',      name:'Blockchain Developer',sector:'tech',       min:110000, max:200000, edu:'bachelors',    tier:4},
  {id:'robotics_engineer',   name:'Robotics Engineer',   sector:'tech',       min:85000,  max:140000, edu:'bachelors',    tier:3},
  {id:'hardware_engineer',   name:'Hardware Engineer',   sector:'tech',       min:80000,  max:130000, edu:'bachelors',    tier:3},
  {id:'tech_consultant',     name:'Tech Consultant',     sector:'tech',       min:90000,  max:160000, edu:'bachelors',    tier:3},
  {id:'it_pm',               name:'IT Project Manager',  sector:'tech',       min:95000,  max:140000, edu:'bachelors',    tier:3},
  {id:'infosec_manager',     name:'Information Security Manager',sector:'tech',min:130000,max:200000, edu:'masters',      tier:4},
  // Skilled Trades (extended)
  {id:'welder',              name:'Welder',              sector:'trades',     min:45000,  max:70000,  edu:'high_school',  tier:2},
  {id:'hvac_tech',           name:'HVAC Technician',     sector:'trades',     min:50000,  max:80000,  edu:'high_school',  tier:2},
  {id:'auto_body',           name:'Auto Body Repair',    sector:'trades',     min:40000,  max:70000,  edu:'high_school',  tier:2},
  {id:'roofer',              name:'Roofer',              sector:'trades',     min:38000,  max:62000,  edu:'none',         tier:1},
  {id:'mason',               name:'Mason',               sector:'trades',     min:45000,  max:70000,  edu:'high_school',  tier:2},
  {id:'painter',             name:'Painter',             sector:'trades',     min:35000,  max:60000,  edu:'none',         tier:1},
  {id:'tile_installer',      name:'Tile Installer',      sector:'trades',     min:40000,  max:65000,  edu:'high_school',  tier:2},
  {id:'ironworker',          name:'Ironworker',          sector:'trades',     min:55000,  max:85000,  edu:'high_school',  tier:2},
  {id:'boilermaker',         name:'Boilermaker',         sector:'trades',     min:60000,  max:95000,  edu:'high_school',  tier:2},
  {id:'elevator_installer',  name:'Elevator Installer',  sector:'trades',     min:85000,  max:120000, edu:'high_school',  tier:3},
  {id:'lineworker',          name:'Lineworker',          sector:'trades',     min:75000,  max:110000, edu:'high_school',  tier:3},
  {id:'crane_operator',      name:'Crane Operator',      sector:'trades',     min:60000,  max:95000,  edu:'high_school',  tier:2},
  {id:'heavy_equip_op',      name:'Heavy Equipment Operator',sector:'trades', min:50000,  max:80000,  edu:'high_school',  tier:2},
  {id:'bricklayer',          name:'Bricklayer',          sector:'trades',     min:45000,  max:70000,  edu:'high_school',  tier:2},
  {id:'glazier',             name:'Glazier',             sector:'trades',     min:42000,  max:65000,  edu:'high_school',  tier:2},
  {id:'flooring_installer',  name:'Flooring Installer',  sector:'trades',     min:38000,  max:58000,  edu:'none',         tier:1},
  {id:'cabinetmaker',        name:'Cabinetmaker',        sector:'trades',     min:45000,  max:70000,  edu:'high_school',  tier:2},
  {id:'locksmith',           name:'Locksmith',           sector:'trades',     min:40000,  max:65000,  edu:'high_school',  tier:2},
  {id:'tool_die_maker',      name:'Tool & Die Maker',    sector:'trades',     min:55000,  max:80000,  edu:'high_school',  tier:2},
  {id:'diesel_tech',         name:'Diesel Technician',   sector:'trades',     min:50000,  max:80000,  edu:'high_school',  tier:2},
  // Education (extended)
  {id:'principal',           name:'Principal',           sector:'education',  min:95000,  max:140000, edu:'masters',      tier:4},
  {id:'sped_teacher',        name:'Special Ed Teacher',  sector:'education',  min:55000,  max:85000,  edu:'bachelors',    tier:2},
  {id:'librarian',           name:'Librarian',           sector:'education',  min:55000,  max:80000,  edu:'masters',      tier:2},
  {id:'archivist',           name:'Archivist',           sector:'education',  min:50000,  max:75000,  edu:'masters',      tier:2},
  {id:'instructional_designer',name:'Instructional Designer',sector:'education',min:70000,max:100000, edu:'masters',      tier:3},
  {id:'edu_consultant',      name:'Education Consultant',sector:'education',  min:75000,  max:120000, edu:'masters',      tier:3},
  {id:'substitute_teacher',  name:'Substitute Teacher',  sector:'education',  min:28000,  max:45000,  edu:'bachelors',    tier:1},
  {id:'preschool_teacher',   name:'Preschool Teacher',   sector:'education',  min:32000,  max:48000,  edu:'associates',   tier:1},
  {id:'teaching_assistant',  name:'Teaching Assistant',  sector:'education',  min:28000,  max:42000,  edu:'high_school',  tier:1},
  {id:'academic_advisor',    name:'Academic Advisor',    sector:'education',  min:55000,  max:80000,  edu:'masters',      tier:2},
  // Law & Government (extended)
  {id:'judge',               name:'Judge',               sector:'law',        min:150000, max:220000, edu:'professional', tier:5},
  {id:'paralegal',           name:'Paralegal',           sector:'law',        min:50000,  max:80000,  edu:'associates',   tier:2},
  {id:'legal_assistant',     name:'Legal Assistant',     sector:'law',        min:40000,  max:62000,  edu:'high_school',  tier:1},
  {id:'detective',           name:'Detective',           sector:'law',        min:70000,  max:110000, edu:'high_school',  tier:3},
  {id:'border_patrol',       name:'Border Patrol Agent', sector:'law',        min:55000,  max:85000,  edu:'high_school',  tier:2},
  {id:'corrections_officer', name:'Corrections Officer', sector:'law',        min:45000,  max:70000,  edu:'high_school',  tier:2},
  {id:'bailiff',             name:'Bailiff',             sector:'law',        min:42000,  max:60000,  edu:'high_school',  tier:1},
  {id:'probation_officer',   name:'Probation Officer',   sector:'law',        min:55000,  max:80000,  edu:'bachelors',    tier:2},
  {id:'political_scientist', name:'Political Scientist', sector:'law',        min:80000,  max:130000, edu:'masters',      tier:3},
  {id:'diplomat',            name:'Diplomat',            sector:'law',        min:90000,  max:150000, edu:'masters',      tier:4},
  {id:'city_planner',        name:'City Planner',        sector:'law',        min:70000,  max:105000, edu:'masters',      tier:3},
  {id:'legislator',          name:'Legislator',          sector:'law',        min:70000,  max:180000, edu:'bachelors',    tier:4},
  {id:'court_reporter',      name:'Court Reporter',      sector:'law',        min:55000,  max:85000,  edu:'associates',   tier:2},
  {id:'public_defender',     name:'Public Defender',     sector:'law',        min:65000,  max:110000, edu:'professional', tier:3},
  {id:'prosecutor',          name:'Prosecutor',          sector:'law',        min:80000,  max:140000, edu:'professional', tier:4},
  {id:'intel_analyst',       name:'Intelligence Analyst',sector:'law',        min:75000,  max:130000, edu:'bachelors',    tier:3},
  // Business & Finance (extended)
  {id:'financial_analyst',   name:'Financial Analyst',   sector:'finance',    min:75000,  max:125000, edu:'bachelors',    tier:3},
  {id:'investment_banker',   name:'Investment Banker',   sector:'finance',    min:125000, max:400000, edu:'bachelors',    tier:5},
  {id:'loan_officer',        name:'Loan Officer',        sector:'finance',    min:55000,  max:90000,  edu:'bachelors',    tier:2},
  {id:'insurance_agent',     name:'Insurance Agent',     sector:'finance',    min:45000,  max:85000,  edu:'high_school',  tier:2},
  {id:'actuary',             name:'Actuary',             sector:'finance',    min:90000,  max:150000, edu:'bachelors',    tier:3},
  {id:'auditor',             name:'Auditor',             sector:'finance',    min:70000,  max:110000, edu:'bachelors',    tier:3},
  {id:'business_analyst',    name:'Business Analyst',    sector:'finance',    min:70000,  max:105000, edu:'bachelors',    tier:3},
  {id:'project_manager',     name:'Project Manager',     sector:'finance',    min:75000,  max:125000, edu:'bachelors',    tier:3},
  {id:'hr_manager',          name:'HR Manager',          sector:'finance',    min:75000,  max:115000, edu:'bachelors',    tier:3},
  {id:'recruiter',           name:'Recruiter',           sector:'finance',    min:55000,  max:95000,  edu:'bachelors',    tier:2},
  {id:'sales_manager',       name:'Sales Manager',       sector:'finance',    min:85000,  max:150000, edu:'bachelors',    tier:3},
  {id:'property_manager',    name:'Property Manager',    sector:'finance',    min:55000,  max:85000,  edu:'high_school',  tier:2},
  {id:'entrepreneur_job',    name:'Entrepreneur',        sector:'finance',    min:30000,  max:300000, edu:'none',         tier:3},
  {id:'ceo',                 name:'CEO',                 sector:'finance',    min:200000, max:3000000,edu:'masters',      tier:5},
  {id:'consultant',          name:'Consultant',          sector:'finance',    min:80000,  max:150000, edu:'bachelors',    tier:3},
  {id:'operations_manager',  name:'Operations Manager',  sector:'finance',    min:80000,  max:125000, edu:'bachelors',    tier:3},
  // Creative & Media (extended)
  {id:'videographer',        name:'Videographer',        sector:'creative',   min:40000,  max:75000,  edu:'none',         tier:2},
  {id:'animator',            name:'Animator',            sector:'creative',   min:55000,  max:95000,  edu:'bachelors',    tier:2},
  {id:'director',            name:'Director',            sector:'creative',   min:65000,  max:200000, edu:'bachelors',    tier:3},
  {id:'producer',            name:'Producer',            sector:'creative',   min:70000,  max:180000, edu:'bachelors',    tier:3},
  {id:'musician',            name:'Musician',            sector:'creative',   min:30000,  max:120000, edu:'none',         tier:2},
  {id:'dj',                  name:'DJ',                  sector:'creative',   min:28000,  max:100000, edu:'none',         tier:2},
  {id:'writer',              name:'Writer',              sector:'creative',   min:45000,  max:90000,  edu:'bachelors',    tier:2},
  {id:'journalist',          name:'Journalist',          sector:'creative',   min:45000,  max:85000,  edu:'bachelors',    tier:2},
  {id:'book_editor',         name:'Editor',              sector:'creative',   min:55000,  max:95000,  edu:'bachelors',    tier:2},
  {id:'copywriter',          name:'Copywriter',          sector:'creative',   min:50000,  max:85000,  edu:'bachelors',    tier:2},
  {id:'fashion_designer',    name:'Fashion Designer',    sector:'creative',   min:55000,  max:110000, edu:'bachelors',    tier:3},
  {id:'interior_designer',   name:'Interior Designer',   sector:'creative',   min:52000,  max:95000,  edu:'bachelors',    tier:2},
  {id:'art_director',        name:'Art Director',        sector:'creative',   min:80000,  max:140000, edu:'bachelors',    tier:3},
  {id:'illustrator',         name:'Illustrator',         sector:'creative',   min:42000,  max:75000,  edu:'bachelors',    tier:2},
  {id:'social_media_manager',name:'Social Media Manager',sector:'creative',   min:50000,  max:95000,  edu:'bachelors',    tier:2},
  {id:'content_creator',     name:'Content Creator',     sector:'creative',   min:30000,  max:300000, edu:'none',         tier:2},
  // Service & Retail (extended)
  {id:'cashier',             name:'Cashier',             sector:'service',    min:22000,  max:32000,  edu:'none',         tier:1},
  {id:'retail_associate',    name:'Retail Associate',    sector:'service',    min:24000,  max:35000,  edu:'none',         tier:1},
  {id:'store_manager',       name:'Store Manager',       sector:'service',    min:45000,  max:75000,  edu:'high_school',  tier:2},
  {id:'customer_service',    name:'Customer Service Rep',sector:'service',    min:30000,  max:48000,  edu:'high_school',  tier:1},
  {id:'bartender',           name:'Bartender',           sector:'service',    min:30000,  max:60000,  edu:'none',         tier:1},
  {id:'barista',             name:'Barista',             sector:'service',    min:26000,  max:42000,  edu:'none',         tier:1},
  {id:'cook',                name:'Cook',                sector:'service',    min:30000,  max:48000,  edu:'high_school',  tier:1},
  {id:'baker',               name:'Baker',               sector:'service',    min:32000,  max:52000,  edu:'high_school',  tier:1},
  {id:'hotel_clerk',         name:'Hotel Clerk',         sector:'service',    min:28000,  max:42000,  edu:'high_school',  tier:1},
  {id:'concierge',           name:'Concierge',           sector:'service',    min:34000,  max:55000,  edu:'high_school',  tier:2},
  {id:'housekeeper',         name:'Housekeeper',         sector:'service',    min:24000,  max:38000,  edu:'none',         tier:1},
  {id:'janitor',             name:'Janitor',             sector:'service',    min:26000,  max:38000,  edu:'none',         tier:1},
  {id:'security_guard',      name:'Security Guard',      sector:'service',    min:32000,  max:50000,  edu:'high_school',  tier:1},
  {id:'delivery_driver',     name:'Delivery Driver',     sector:'service',    min:32000,  max:52000,  edu:'high_school',  tier:1},
  {id:'warehouse_worker',    name:'Warehouse Worker',    sector:'service',    min:28000,  max:45000,  edu:'none',         tier:1},
  {id:'stock_clerk',         name:'Stock Clerk',         sector:'service',    min:26000,  max:40000,  edu:'none',         tier:1},
  {id:'call_center',         name:'Call Center Agent',   sector:'service',    min:30000,  max:45000,  edu:'high_school',  tier:1},
  {id:'receptionist',        name:'Receptionist',        sector:'service',    min:32000,  max:48000,  edu:'high_school',  tier:1},
  // Transportation & Travel (extended)
  {id:'flight_attendant',    name:'Flight Attendant',    sector:'transport',  min:50000,  max:85000,  edu:'high_school',  tier:2},
  {id:'atc',                 name:'Air Traffic Controller',sector:'transport',min:100000, max:175000, edu:'associates',   tier:4},
  {id:'taxi_driver',         name:'Taxi Driver',         sector:'transport',  min:30000,  max:55000,  edu:'none',         tier:1},
  {id:'uber_driver',         name:'Uber Driver',         sector:'transport',  min:26000,  max:48000,  edu:'none',         tier:1},
  {id:'train_conductor',     name:'Train Conductor',     sector:'transport',  min:55000,  max:85000,  edu:'high_school',  tier:2},
  {id:'subway_operator',     name:'Subway Operator',     sector:'transport',  min:55000,  max:80000,  edu:'high_school',  tier:2},
  {id:'ship_captain',        name:'Ship Captain',        sector:'transport',  min:80000,  max:160000, edu:'bachelors',    tier:3},
  {id:'sailor',              name:'Sailor',              sector:'transport',  min:40000,  max:70000,  edu:'high_school',  tier:2},
  {id:'travel_agent',        name:'Travel Agent',        sector:'transport',  min:38000,  max:60000,  edu:'high_school',  tier:1},
  {id:'tour_guide',          name:'Tour Guide',          sector:'transport',  min:28000,  max:48000,  edu:'none',         tier:1},
  {id:'logistics_manager',   name:'Logistics Manager',   sector:'transport',  min:75000,  max:125000, edu:'bachelors',    tier:3},
  {id:'dispatcher',          name:'Dispatcher',          sector:'transport',  min:42000,  max:65000,  edu:'high_school',  tier:2},
  // Environment & Agriculture (sector:'other')
  {id:'farmer',              name:'Farmer',              sector:'other',      min:35000,  max:90000,  edu:'none',         tier:2},
  {id:'rancher',             name:'Rancher',             sector:'other',      min:40000,  max:110000, edu:'none',         tier:2},
  {id:'landscaper',          name:'Landscaper',          sector:'other',      min:30000,  max:55000,  edu:'none',         tier:1},
  {id:'gardener',            name:'Gardener',            sector:'other',      min:28000,  max:48000,  edu:'none',         tier:1},
  {id:'arborist',            name:'Arborist',            sector:'other',      min:42000,  max:70000,  edu:'high_school',  tier:2},
  {id:'env_scientist',       name:'Environmental Scientist',sector:'other',   min:65000,  max:105000, edu:'bachelors',    tier:3},
  {id:'conservationist',     name:'Conservationist',     sector:'other',      min:50000,  max:80000,  edu:'bachelors',    tier:2},
  {id:'wildlife_biologist',  name:'Wildlife Biologist',  sector:'other',      min:60000,  max:95000,  edu:'bachelors',    tier:3},
  {id:'park_ranger',         name:'Park Ranger',         sector:'other',      min:42000,  max:68000,  edu:'high_school',  tier:2},
  {id:'zookeeper',           name:'Zookeeper',           sector:'other',      min:38000,  max:60000,  edu:'bachelors',    tier:2},
  {id:'marine_biologist',    name:'Marine Biologist',    sector:'other',      min:65000,  max:115000, edu:'masters',      tier:3},
  {id:'soil_scientist',      name:'Soil Scientist',      sector:'other',      min:65000,  max:100000, edu:'masters',      tier:3},
  {id:'hydrologist',         name:'Hydrologist',         sector:'other',      min:75000,  max:115000, edu:'masters',      tier:3},
  {id:'forester',            name:'Forester',            sector:'other',      min:55000,  max:85000,  edu:'bachelors',    tier:2},
  {id:'solar_installer',     name:'Solar Panel Installer',sector:'other',     min:42000,  max:68000,  edu:'high_school',  tier:2},
];

function getAvailableJobs(char){
  const charEdu = eduIdx(char.education);
  return ALL_JOBS
    .filter(j => charEdu >= eduIdx(j.edu))
    .sort((a,b) => b.min - a.min)
    .slice(0,8);
}

const ENV_JOB_IDS = new Set(['farmer','rancher','landscaper','gardener','arborist','env_scientist','conservationist','wildlife_biologist','park_ranger','zookeeper','marine_biologist','soil_scientist','hydrologist','forester','solar_installer']);
const JOB_CATEGORY_ORDER = ['healthcare','tech','trades','education','law','finance','creative','service','transport','environment','sports'];
function jobCategory(j){
  if(ENV_JOB_IDS.has(j.id)) return 'environment';
  return j.sector;
}
function getBalancedJobChoices(char){
  const charEdu = eduIdx(char.education);
  const eligible = ALL_JOBS.filter(j => charEdu >= eduIdx(j.edu));
  const byCat = {};
  JOB_CATEGORY_ORDER.forEach(c => byCat[c] = []);
  eligible.forEach(j => { const c = jobCategory(j); if(byCat[c]) byCat[c].push(j); });
  const shuffle = arr => { const a = arr.slice(); for(let i=a.length-1;i>0;i--){ const k=Math.floor(Math.random()*(i+1)); [a[i],a[k]]=[a[k],a[i]]; } return a; };
  const picked = [];
  const usedIds = new Set();
  // Guarantee one from each category if available
  shuffle(JOB_CATEGORY_ORDER).forEach(cat => {
    const pool = shuffle(byCat[cat]);
    if(pool.length){ picked.push(pool[0]); usedIds.add(pool[0].id); }
  });
  // Fill up to 14 with random eligible extras for variety
  const extras = shuffle(eligible.filter(j => !usedIds.has(j.id)));
  while(picked.length < 14 && extras.length) picked.push(extras.shift());
  return shuffle(picked);
}

function applyForJob(char, job){
  const smartsMod = 0.7 + (char.smarts/100)*0.6;
  char.employed     = true;
  char.jobId        = job.id;
  char.jobTitle     = job.name;
  char.jobSector    = job.sector;
  char.jobMin       = job.min;
  char.jobMax       = job.max;
  char.sportsTeam   = null;
  char.salary       = Math.round(rf(job.min, job.max) * smartsMod);
  char.yearsAtJob   = 0;
  char.monthsAtJob  = 0;
  char.careerTierId = 'tier' + job.tier;
  char.bossName     = pick(['Alex Mercer','Jordan Hayes','Taylor Quinn','Morgan Vance','Dana Rhodes','Sam Whitaker','Casey Lin','Riley Okafor']);
  char.bossMorale   = ri(55,75);
}

function tickCareerNew(char, ev){
  if(!char.employed) return;
  char.yearsAtJob++;
  // Boss morale tracks performance with some lag/noise
  const prevMorale = char.bossMorale||char.performance;
  char.bossMorale = clamp(Math.round(prevMorale*0.5 + char.performance*0.5 + ri(-6,6)), 5, 100);
  const morale = char.bossMorale;

  // Raise logic
  let raisePct = 0;
  let raiseNote = '';
  if(morale >= 75){
    // Likely raise — 80% chance, 5-12%
    if(pct(0.80)){ raisePct = rf(0.05,0.12); raiseNote='big raise'; }
    else { raisePct = rf(0.02,0.05); raiseNote='standard raise'; }
  } else if(morale >= 50){
    raisePct = rf(0.01,0.04); raiseNote='standard raise';
  } else if(morale >= 31){
    // Safety zone — small raise or flat
    raisePct = pct(0.5) ? rf(0.005,0.02) : 0;
    raiseNote = raisePct>0 ? 'small bump' : 'no raise';
  } else {
    raisePct = 0; raiseNote='no raise — performance concerns';
  }
  char.salary = Math.round(char.salary * (1 + raisePct));

  // Promotion every 4 years if morale > 65
  let promoted = false;
  if(char.yearsAtJob % 4 === 0 && morale > 65 && pct(0.30)){
    const cap = char.jobMax || char.salary * 2;
    char.salary = Math.min(cap, Math.round(char.salary * 1.15));
    promoted = true;
    ev.push({type:'career',text:`Promoted at ${char.jobTitle}! New salary: ${fmt$(char.salary)}/yr`});
  }

  // Layoff chances
  let layoffChance = 0.005; // 0.5% random layoff
  let layoffReason = 'random restructuring';
  if(morale <= 30){ layoffChance += 0.35; layoffReason='poor performance'; }
  else if(morale <= 50){ layoffChance += 0.05; layoffReason='budget cuts'; }
  const wasLaidOff = pct(layoffChance);

  // Annual boss message — goes to inbox
  const bossName = char.bossName || (char.bossName = pick(['Alex Mercer','Jordan Hayes','Taylor Quinn','Morgan Vance','Dana Rhodes','Sam Whitaker','Casey Lin','Riley Okafor']));
  let status = morale>=75?'🟢 Excellent — likely raise':morale>=50?'🟢 Safe':morale>=31?'🟡 Cautious — keep it up':'🔴 At risk — improvement needed';
  const updates = pick([
    'We\'re rolling out a new project pipeline next quarter.',
    'The team hit its targets last year — nice work from everyone involved.',
    'Leadership is restructuring some reporting lines. Details coming soon.',
    'Budget reviews finished. Some teams expanding, others consolidating.',
    'We\'re refreshing the office tech stack; expect some training sessions.',
    'Customer retention numbers improved — thanks to everyone\'s effort.',
    'A few senior folks are moving on. Opportunities may open up internally.',
    'New compliance training rolls out next month. Completion required.',
    'Q4 goals are ambitious but achievable. Let\'s keep the momentum.',
  ]);
  const raiseChance = morale>=75?'HIGH':morale>=50?'Moderate':morale>=31?'Low':'Very Low';
  const layoffRisk = morale<=30?'HIGH':morale<=50?'Moderate':morale<=74?'Low':'Very Low';
  const date = currentMonthDate(char);
  let bodyLines = [
    `Hey ${char.name.split(' ')[0]||char.name},`,
    '',
    `It\'s that time again — year-end check-in.`,
    '',
    `Status: ${status}`,
    `My morale on your work: ${morale}%`,
    `Raise likelihood: ${raiseChance}`,
    `Layoff risk: ${layoffRisk}`,
    '',
    `Company update: ${updates}`,
    '',
  ];
  if(promoted) bodyLines.push(`🎉 Big news — we\'re moving you up. Salary adjusted to ${fmt$(char.salary)}/yr.`);
  else if(raisePct>0) bodyLines.push(`Pay bump: +${(raisePct*100).toFixed(1)}% (${raiseNote}). New salary: ${fmt$(char.salary)}/yr.`);
  else bodyLines.push(`No pay change this year (${raiseNote}). Let\'s talk at next review.`);
  if(wasLaidOff){
    bodyLines.push('');
    bodyLines.push(`Unfortunately — effective today, your position has been eliminated (${layoffReason}). HR will be in touch.`);
  }
  bodyLines.push('');
  bodyLines.push(`— ${bossName}, ${char.jobTitle||'Manager'}`);
  addInboxItem({
    type:'news', icon:'📧', subject:`Year-end note from ${bossName}`, date, body: bodyLines.join('\n'),
  });

  if(wasLaidOff){
    char.employed = false; char.salary = 0; char.monthsAtJob = 0;
    char.happiness = clamp(char.happiness - 15, 0, 100);
    ev.push({type:'career',text:`Laid off from ${char.jobTitle} — ${layoffReason}.`});
  }

  // Performance drift
  char.performance = clamp(char.performance + ri(-5,5), 10, 100);
}

function buildJobChoices(char){
  const jobs = getBalancedJobChoices(char);
  if(!jobs.length){
    return [{text:'No jobs available — get more education',fn(){return'No qualifying jobs found. Consider furthering your education.'}}];
  }
  return jobs.map(job => ({
    text:`${job.name} (${job.sector}) — ${fmt$(job.min)}–${fmt$(job.max)}/yr`,
    fn(){
      applyForJob(char, job);
      return `Hired as ${job.name} in ${job.sector}! Starting salary: ${fmt$(char.salary)}/yr`;
    }
  }));
}
// ── End 50-Job System ────────────────────────────────────────────

function tickRelationship(char, ev){
  const r = char.relationship;
  if(r==='single'&&char.age>=18){
    if(pct(0.12+(char.looks/100)*0.12)){
      char.relationship='dating'; char.spouseName=genName(); char.yearsTogether=0;
      char.spouseIncome=ri(25000,90000);
      ev.push({type:'good',text:`Started dating ${char.spouseName}.`});
    }
  } else if(r==='dating'){
    char.yearsTogether++;
    if(char.age>=21&&pct(Math.min(0.05+char.yearsTogether*0.07,0.5))){
      char.relationship='married';
      ev.push({type:'gold',text:`Married ${char.spouseName}!`});
    } else if(pct(Math.max(0.08-char.yearsTogether*0.01,0.02))){
      const n=char.spouseName; char.relationship='single'; char.spouseName=null; char.spouseIncome=0; char.yearsTogether=0;
      char.happiness=clamp(char.happiness-10,0,100);
      ev.push({type:'bad',text:`Broke up with ${n}.`});
    }
  } else if(r==='married'){
    char.yearsTogether++;
    char.spouseIncome=Math.round(char.spouseIncome*(1+rf(0.01,0.03)));
    const dChance = char.yearsTogether<5?0.04:char.yearsTogether<15?0.02:0.01;
    if(pct(dChance+(50-char.happiness)/500)){
      const n=char.spouseName; const settle=Math.round(char.checking*0.3);
      char.checking=Math.max(0,char.checking-settle); char.relationship='divorced';
      char.spouseName=null; char.spouseIncome=0; char.yearsTogether=0;
      char.happiness=clamp(char.happiness-20,0,100);
      ev.push({type:'bad',text:`Divorced ${n}. Settlement: ${fmt$(settle)}`});
    }
  } else if(r==='divorced'&&char.age<75){
    if(pct(0.1)){char.relationship='dating';char.spouseName=genName();char.yearsTogether=0;char.spouseIncome=ri(20000,80000);}
  }
}

function genName(){
  const f=['Alex','Jordan','Taylor','Morgan','Casey','Riley','Jamie','Avery','Drew','Quinn','Sage','Blake','Harper','Skyler'];
  const l=['Smith','Johnson','Williams','Brown','Jones','Garcia','Martinez','Davis','Wilson','Anderson'];
  return pick(f)+' '+pick(l);
}

function calcTax(income){
  const brackets=[[11600,0.10],[47150,0.12],[100525,0.22],[191950,0.24],[243725,0.32],[609350,0.35],[Infinity,0.37]];
  let tax=0,prev=0;
  for(const[lim,rate]of brackets){const s=Math.min(income,lim)-prev;if(s<=0)break;tax+=s*rate;prev=lim;}
  return Math.round(tax+income*0.05+Math.min(income,168600)*0.0765);
}

function tickFinances(char, ev){
  // All figures monthly, returned annualized for UI display
  const monthSalary = char.employed ? Math.round(char.salary/12) : 0;
  const monthSide = Math.round((char.sideHustleIncome||0)/12);
  const monthSpouse = char.relationship==='married' ? Math.round(char.spouseIncome*0.5/12) : 0;
  const monthGross = monthSalary + monthSide + monthSpouse;
  const monthTax = Math.round(calcTax(monthGross*12)/12);
  const monthNet = monthGross - monthTax;
  const expTable = {frugal:1500,normal:2333,lavish:3750};
  const livedInProp = (GS.inv&&GS.inv.properties||[]).find(p=>p.livedIn);
  // If living in own property: pay mortgage instead of rent-equivalent (~$1200 of exp), plus upkeep
  const housingAdj = livedInProp ? (livedInProp.monthlyPayment + 300 - 1200) : 0;
  const vehicleCost = vehicleMonthlyCost(GS.inv||{vehicles:[]});
  const monthLiving = (expTable[char.lifestyle]||2333) + Math.round(char.kids*15000/12) + housingAdj + vehicleCost;
  // Monthly debt interest + minimum payment
  if(char.debt>0){
    const interest = Math.round(char.debt*0.05/12);
    const pay = Math.max(50, Math.min(char.debt, Math.round(char.debt*0.01)+interest));
    char.debt = Math.max(0, char.debt+interest-pay);
  }
  // Bank monthly maintenance fee (after fee waiver check)
  if(char.bankId){
    const bk = bankById(char.bankId);
    const waivedThisMonth = char._bankFeeWaivedMonth === char.monthAge;
    if(bk && !waivedThisMonth){
      char.checking -= bk.fee;
    }
    char.bankTenureMonths = (char.bankTenureMonths||0) + 1;
  }
  const monthSavings = monthNet - monthLiving;
  char.checking += monthSavings;
  // Monthly compound interest on savings
  char.savings = Math.round(char.savings*(1+0.02/12));
  // High-yield: base 4% + optional bank APY bonus
  const apyBonus = char.bankId ? (bankById(char.bankId)?.apyBonus || 0) : 0;
  char.highYield = Math.round(char.highYield*(1+(0.04+apyBonus/100)/12));
  // Credit score: drift quarterly
  if(char.monthAge%3===0){
    if(char.debt>0&&char.checking>0) char.creditScore=clamp(char.creditScore+ri(-1,2),300,850);
    else if(char.debt===0) char.creditScore=clamp(char.creditScore+ri(0,2),300,850);
  }
  return {gross:monthGross*12, taxes:monthTax*12, livingCost:monthLiving*12, debtPay:char.debt>0?Math.round(char.debt*0.12):0, annSavings:monthSavings*12};
}

function tickDeath(char){
  // Annual probabilities divided by 12 for monthly check
  let base;
  if(char.age<40)base=0.003/12;
  else if(char.age<50)base=0.007/12;
  else if(char.age<60)base=0.015/12;
  else if(char.age<70)base=0.03/12;
  else if(char.age<80)base=0.07/12;
  else if(char.age<90)base=0.15/12;
  else base=0.30/12;
  const hm=1.0+(50-char.health)/100;
  if(pct(Math.min(base*hm,0.95))){
    char.alive=false;
    char.deathCause=char.age>=75?'Old Age':pick(DEATH_CAUSES);
    return true;
  }
  return false;
}

function tickSchool(char, ev){
  if(!char.inSchool)return;
  char.checking-=char.schoolCostMonthly;
  char.debt+=char.schoolCostMonthly;
  char.schoolMonthsLeft--;
  if(char.schoolMonthsLeft<=0){
    const def=SCHOOL_DEFS[char.schoolType];
    char.inSchool=false; char.education=def.result;
    char.smarts=clamp(char.smarts+ri(5,15),0,100);
    ev.push({type:'gold',text:`Graduated with ${EDU_LABELS[def.result]}!`});
  }
}

