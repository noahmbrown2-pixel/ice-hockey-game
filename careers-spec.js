// ============================================================
// BITLIFE-FINANCE GAME — CAREERS & EDUCATION SPECIFICATION
// careers-spec.js
// All data structures + pseudocode ready to implement.
// ============================================================

// ============================================================
// SECTION 1 — SHARED CONSTANTS & HELPERS
// ============================================================

const YEAR_MS = 1;        // 1 real second = 1 game year (tune as needed)
const TAX_BRACKETS = [    // Federal marginal rates (simplified)
  { upTo: 11_000,  rate: 0.10 },
  { upTo: 44_725,  rate: 0.12 },
  { upTo: 95_375,  rate: 0.22 },
  { upTo: 201_050, rate: 0.24 },
  { upTo: 383_900, rate: 0.32 },
  { upTo: 487_450, rate: 0.35 },
  { upTo: Infinity, rate: 0.37 },
];

// Compute after-tax annual take-home
function calcTakeHome(grossAnnual) {
  let tax = 0, remaining = grossAnnual;
  let prev = 0;
  for (const bracket of TAX_BRACKETS) {
    if (remaining <= 0) break;
    const slice = Math.min(remaining, bracket.upTo - prev);
    tax += slice * bracket.rate;
    remaining -= slice;
    prev = bracket.upTo;
  }
  // Add 7.65% FICA (social security + medicare)
  tax += grossAnnual * 0.0765;
  return Math.round(grossAnnual - tax);
}

// Random float in [min, max]
function rand(min, max) { return min + Math.random() * (max - min); }

// Random int in [min, max] inclusive
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

// Clamp value
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// Roll probability (0–1)
function roll(prob) { return Math.random() < prob; }


// ============================================================
// SECTION 2 — EDUCATION SYSTEM
// ============================================================

/*
  Player state relevant to education:
  {
    age: 18,
    education: [],          // array of completed EDUCATION_IDs
    debt: 0,                // total student loan balance
    skills: {},             // see SECTION 5
    gpa: null,              // null until enrolled
    currentEnrollment: null // { type, yearsLeft, cost, degreeId }
  }

  Education gating:
  - High school diploma required for everything else.
  - Community college & trade school: HS diploma required.
  - University: HS diploma required. Better GPA → more majors unlocked.
  - Grad school: relevant undergrad major required (see GRAD_SCHOOLS).
  - Online certs: any age, no prerequisite.
*/

// ----- 2A. HIGH SCHOOL -----
// Happens automatically at age 14-18. No cost.
// GPA rolled at graduation (affects university admission & starting modifier).

const HIGH_SCHOOL = {
  id: 'hs',
  label: 'High School Diploma',
  duration: 4,    // years (ages 14–18, simulated)
  cost: 0,
  gpaRange: [1.5, 4.0],   // rolled on finish
  // Salary modifier applied to ALL future entry-level salaries
  salaryMod: (gpa) => {
    if (gpa >= 3.8) return 1.05;   // honor roll
    if (gpa >= 3.0) return 1.00;
    if (gpa >= 2.0) return 0.95;
    return 0.88;                    // barely graduated
  },
  // Unlocks
  unlocks: ['community_college', 'trade_school', 'university', 'online_cert'],
};

// ----- 2B. COMMUNITY COLLEGE -----
// 2-year programs. Associate degrees. Cheaper debt, narrower career gates.

const COMMUNITY_COLLEGE_DEGREES = {
  assoc_business: {
    id: 'assoc_business',
    label: 'Associate of Business Administration',
    duration: 2,
    costPerYear: 15_000,
    skillGrants: { negotiation: 1, financial_literacy: 1 },
    careerUnlocks: ['accountant', 'sales', 'real_estate'],
    salaryBoost: 1.08,   // multiplier on top of HS modifier
  },
  assoc_nursing: {
    id: 'assoc_nursing',
    label: 'Associate of Nursing (ADN)',
    duration: 2,
    costPerYear: 15_000,
    skillGrants: { discipline: 1 },
    careerUnlocks: ['nurse'],
    salaryBoost: 1.10,
  },
  assoc_it: {
    id: 'assoc_it',
    label: 'Associate of Information Technology',
    duration: 2,
    costPerYear: 15_000,
    skillGrants: { tech_savvy: 1 },
    careerUnlocks: ['software_engineer'],  // starts at junior level, slower progression
    salaryBoost: 1.06,
  },
  assoc_culinary: {
    id: 'assoc_culinary',
    label: 'Associate of Culinary Arts',
    duration: 2,
    costPerYear: 15_000,
    skillGrants: { creativity: 1 },
    careerUnlocks: ['chef'],
    salaryBoost: 1.05,
  },
  assoc_paralegal: {
    id: 'assoc_paralegal',
    label: 'Associate of Paralegal Studies',
    duration: 2,
    costPerYear: 15_000,
    skillGrants: { negotiation: 1 },
    careerUnlocks: ['lawyer'],  // only as paralegal entry, not attorney
    salaryBoost: 1.06,
  },
};

// ----- 2C. TRADE SCHOOL -----
// 2-year vocational programs. Low cost, strong union wages, very low layoff risk.

const TRADE_SCHOOL_PROGRAMS = {
  electrician: {
    id: 'trade_electrician',
    label: 'Electrician Certificate',
    duration: 2,
    costPerYear: 8_000,
    skillGrants: { discipline: 1, physical_labor: 1 },
    careerUnlocks: ['electrician'],
    salaryBoost: 1.12,
    // Apprenticeship note: first 2 in-game years on career treated as apprentice
    apprenticeYears: 2,
  },
  plumber: {
    id: 'trade_plumber',
    label: 'Plumber Certificate',
    duration: 2,
    costPerYear: 8_000,
    skillGrants: { discipline: 1, physical_labor: 1 },
    careerUnlocks: ['plumber'],
    salaryBoost: 1.12,
    apprenticeYears: 2,
  },
  hvac: {
    id: 'trade_hvac',
    label: 'HVAC Technician Certificate',
    duration: 2,
    costPerYear: 8_000,
    skillGrants: { discipline: 1 },
    careerUnlocks: ['hvac_tech'],
    salaryBoost: 1.10,
    apprenticeYears: 2,
  },
  welder: {
    id: 'trade_welder',
    label: 'Welding Certificate',
    duration: 2,
    costPerYear: 8_000,
    skillGrants: { physical_labor: 1 },
    careerUnlocks: ['welder'],
    salaryBoost: 1.08,
    apprenticeYears: 1,
  },
  automotive: {
    id: 'trade_auto',
    label: 'Automotive Technology Certificate',
    duration: 2,
    costPerYear: 8_000,
    skillGrants: { physical_labor: 1 },
    careerUnlocks: ['mechanic'],
    salaryBoost: 1.07,
    apprenticeYears: 1,
  },
};

// ----- 2D. UNIVERSITY -----
// 4-year bachelor's degrees. Wider career gates, higher debt, higher ceiling.
// Cost per year varies by school tier (chosen at enrollment).

const UNIVERSITY_TIERS = {
  state:    { label: 'State University',     costPerYear: 25_000, admitMinGpa: 2.0, prestige: 1 },
  private:  { label: 'Private University',   costPerYear: 45_000, admitMinGpa: 3.0, prestige: 2 },
  elite:    { label: 'Elite University',     costPerYear: 60_000, admitMinGpa: 3.7, prestige: 3 },
};
// prestige affects: starting salary boost, promotion speed, networking skill gain

const UNIVERSITY_MAJORS = {
  computer_science: {
    id: 'bs_cs',
    label: 'B.S. Computer Science',
    duration: 4,
    skillGrants: { tech_savvy: 2, financial_literacy: 1 },
    careerUnlocks: ['software_engineer', 'entrepreneur'],
    // Salary modifier on top of tier modifier
    salaryMod: (tier) => ({ state: 1.18, private: 1.25, elite: 1.35 }[tier]),
    gradSchoolUnlocks: ['mba', 'phd_cs'],
  },
  business_admin: {
    id: 'bs_business',
    label: 'B.S. Business Administration',
    duration: 4,
    skillGrants: { negotiation: 2, financial_literacy: 1 },
    careerUnlocks: ['accountant', 'sales', 'finance_banking', 'entrepreneur', 'real_estate'],
    salaryMod: (tier) => ({ state: 1.12, private: 1.18, elite: 1.25 }[tier]),
    gradSchoolUnlocks: ['mba'],
  },
  finance: {
    id: 'bs_finance',
    label: 'B.S. Finance',
    duration: 4,
    skillGrants: { financial_literacy: 2, investment_acumen: 1 },
    careerUnlocks: ['finance_banking', 'accountant', 'entrepreneur'],
    salaryMod: (tier) => ({ state: 1.14, private: 1.22, elite: 1.30 }[tier]),
    gradSchoolUnlocks: ['mba', 'law'],
  },
  accounting: {
    id: 'bs_accounting',
    label: 'B.S. Accounting',
    duration: 4,
    skillGrants: { financial_literacy: 2, negotiation: 1 },
    careerUnlocks: ['accountant', 'finance_banking'],
    salaryMod: (tier) => ({ state: 1.12, private: 1.18, elite: 1.24 }[tier]),
    gradSchoolUnlocks: ['mba', 'law'],
    certUnlocks: ['cpa'],
  },
  pre_med: {
    id: 'bs_premed',
    label: 'B.S. Pre-Medicine / Biology',
    duration: 4,
    skillGrants: { discipline: 2 },
    careerUnlocks: ['nurse'],   // doctor requires med school
    salaryMod: (tier) => ({ state: 1.10, private: 1.15, elite: 1.20 }[tier]),
    gradSchoolUnlocks: ['medical'],
  },
  pre_law: {
    id: 'bs_prelaw',
    label: 'B.A. Pre-Law / Political Science',
    duration: 4,
    skillGrants: { negotiation: 2 },
    careerUnlocks: [],            // lawyer requires JD
    salaryMod: (tier) => ({ state: 1.08, private: 1.12, elite: 1.18 }[tier]),
    gradSchoolUnlocks: ['law'],
  },
  education: {
    id: 'bs_education',
    label: 'B.S. Education',
    duration: 4,
    skillGrants: { discipline: 1, creativity: 1 },
    careerUnlocks: ['teacher'],
    salaryMod: (tier) => ({ state: 1.05, private: 1.08, elite: 1.10 }[tier]),
    gradSchoolUnlocks: ['phd_education'],
  },
  nursing_bsn: {
    id: 'bsn',
    label: 'B.S. Nursing (BSN)',
    duration: 4,
    skillGrants: { discipline: 2 },
    careerUnlocks: ['nurse'],
    salaryMod: (tier) => ({ state: 1.14, private: 1.18, elite: 1.22 }[tier]),
    gradSchoolUnlocks: ['medical'],   // NP / CRNA tracks simplified as 'medical'
  },
  culinary_arts: {
    id: 'bs_culinary',
    label: 'B.S. Culinary Arts & Restaurant Management',
    duration: 4,
    skillGrants: { creativity: 2, negotiation: 1 },
    careerUnlocks: ['chef', 'entrepreneur'],
    salaryMod: (tier) => ({ state: 1.06, private: 1.10, elite: 1.14 }[tier]),
    gradSchoolUnlocks: ['mba'],
  },
  real_estate: {
    id: 'bs_realestate',
    label: 'B.S. Real Estate',
    duration: 4,
    skillGrants: { negotiation: 2, investment_acumen: 1 },
    careerUnlocks: ['real_estate', 'entrepreneur'],
    salaryMod: (tier) => ({ state: 1.10, private: 1.15, elite: 1.20 }[tier]),
    gradSchoolUnlocks: ['mba'],
  },
};

// ----- 2E. GRADUATE SCHOOL -----
// Requires relevant undergrad. High cost, high salary ceiling boost.

const GRAD_SCHOOLS = {
  mba: {
    id: 'mba',
    label: 'Master of Business Administration (MBA)',
    duration: 2,
    costPerYear: 55_000,          // elite program rate
    prerequisite: ['bs_business', 'bs_finance', 'bs_accounting', 'bs_cs', 'bs_culinary', 'bs_realestate'],
    skillGrants: { negotiation: 2, financial_literacy: 2, investment_acumen: 1 },
    salaryBoost: 1.30,            // applied to entry salary on career switch or promo
    careerBoosts: {               // career-specific salary modifier stacks
      finance_banking: 1.40,
      entrepreneur:    1.35,
      accountant:      1.25,
      sales:           1.20,
    },
    promotionSpeedMod: 0.75,      // 25% faster promotions
  },
  law: {
    id: 'jd',
    label: 'Juris Doctor (JD)',
    duration: 3,
    costPerYear: 58_000,
    prerequisite: ['bs_prelaw', 'bs_business', 'bs_finance', 'bs_accounting'],
    skillGrants: { negotiation: 3, financial_literacy: 1 },
    salaryBoost: 1.0,             // salary determined by lawyer career track
    careerUnlocks: ['lawyer'],    // ONLY path to lawyer (attorney)
    barExamPassRate: 0.65,        // roll on JD completion; retry costs 1 yr + $5k
    promotionSpeedMod: 0.80,
  },
  medical: {
    id: 'md',
    label: 'Doctor of Medicine (MD)',
    duration: 4,
    costPerYear: 60_000,
    residencyYears: 3,            // 3 extra years post-graduation at resident pay ($65k/yr)
    prerequisite: ['bs_premed', 'bsn'],
    skillGrants: { discipline: 3 },
    salaryBoost: 1.0,             // salary determined by doctor career track
    careerUnlocks: ['doctor'],    // ONLY path to doctor
    licensingExamPassRate: 0.80,
    promotionSpeedMod: 0.70,
  },
  phd_cs: {
    id: 'phd_cs',
    label: 'PhD Computer Science',
    duration: 5,
    costPerYear: 0,               // stipend-funded; player earns $28k/yr during PhD
    stipendPerYear: 28_000,
    prerequisite: ['bs_cs'],
    skillGrants: { tech_savvy: 3, financial_literacy: 1 },
    salaryBoost: 1.45,            // massive salary boost for research/principal roles
    careerBoosts: { software_engineer: 1.45 },
    promotionSpeedMod: 0.60,
  },
  phd_education: {
    id: 'phd_education',
    label: 'PhD Education / EdD',
    duration: 4,
    costPerYear: 20_000,
    prerequisite: ['bs_education'],
    skillGrants: { discipline: 2, creativity: 1 },
    salaryBoost: 1.20,
    careerBoosts: { teacher: 1.25 },
    promotionSpeedMod: 0.80,
  },
};

// ----- 2F. ONLINE CERTIFICATIONS -----
// Short, cheap, stackable. No age/degree requirement (some need experience flag).

const ONLINE_CERTS = {
  coding_bootcamp: {
    id: 'cert_bootcamp',
    label: 'Coding Bootcamp',
    duration: 0.5,      // 6 months
    cost: 12_000,
    skillGrants: { tech_savvy: 1 },
    careerUnlocks: ['software_engineer'],  // entry level only, slower promo
    salaryBoost: 1.05,
    requiresExperience: false,
  },
  cpa_exam: {
    id: 'cert_cpa',
    label: 'CPA License',
    duration: 0.5,
    cost: 3_000,
    prerequisite: ['bs_accounting'],
    skillGrants: { financial_literacy: 1 },
    // CPA-holding accountants get +$12k/yr and faster promotions
    careerBoosts: { accountant: { salaryAdd: 12_000, promotionSpeedMod: 0.85 } },
    requiresExperience: true,       // need 1yr accountant experience
    passRate: 0.50,                 // four-part exam; retry for free after 6mo
  },
  cfa_level1: {
    id: 'cert_cfa1',
    label: 'CFA Level I',
    duration: 0.5,
    cost: 1_500,
    skillGrants: { investment_acumen: 1 },
    careerBoosts: { finance_banking: { salaryAdd: 8_000 } },
    requiresExperience: false,
    passRate: 0.42,
  },
  cfa_level2: {
    id: 'cert_cfa2',
    label: 'CFA Level II',
    duration: 0.5,
    cost: 1_500,
    prerequisite: ['cert_cfa1'],
    skillGrants: { investment_acumen: 1 },
    careerBoosts: { finance_banking: { salaryAdd: 15_000 } },
    requiresExperience: true,       // 2yr finance experience
    passRate: 0.45,
  },
  cfa_charter: {
    id: 'cert_cfa3',
    label: 'CFA Charter (Level III + 4yr exp)',
    duration: 0.5,
    cost: 1_500,
    prerequisite: ['cert_cfa2'],
    skillGrants: { investment_acumen: 2 },
    careerBoosts: { finance_banking: { salaryAdd: 30_000, promotionSpeedMod: 0.70 } },
    requiresExperience: true,
    passRate: 0.56,
  },
  real_estate_license: {
    id: 'cert_re_license',
    label: 'Real Estate License',
    duration: 0.25,   // 3 months
    cost: 1_000,
    skillGrants: { negotiation: 1 },
    careerUnlocks: ['real_estate'],
    requiresExperience: false,
    passRate: 0.70,
  },
  project_mgmt: {
    id: 'cert_pmp',
    label: 'PMP Certification',
    duration: 0.25,
    cost: 2_000,
    prerequisite: ['bs_cs', 'bs_business'],
    skillGrants: { negotiation: 1, discipline: 1 },
    careerBoosts: {
      software_engineer: { salaryAdd: 10_000, promotionSpeedMod: 0.90 },
      entrepreneur: { salaryAdd: 5_000 },
    },
    requiresExperience: true,       // 3yr experience required
    passRate: 0.60,
  },
  six_sigma: {
    id: 'cert_sixsigma',
    label: 'Six Sigma Black Belt',
    duration: 0.5,
    cost: 4_000,
    skillGrants: { discipline: 2 },
    careerBoosts: { sales: { salaryAdd: 8_000 }, accountant: { salaryAdd: 5_000 } },
    requiresExperience: true,
    passRate: 0.65,
  },
};

/*  PSEUDOCODE — enrollInEducation(player, programId, options) ---------------
    function enrollInEducation(player, programId, options = {}) {
      const prog = findProgram(programId); // search all tables above
      if (!meetsPrerequisite(player, prog)) return { error: 'prerequisite_not_met' };
      if (prog.admitMinGpa && player.gpa < prog.admitMinGpa)
        return { error: 'gpa_too_low' };

      const tier = options.tier || 'state';  // for university
      const costPerYear = prog.costPerYear
        ?? UNIVERSITY_TIERS[tier]?.costPerYear
        ?? prog.cost;

      player.currentEnrollment = {
        programId,
        tier,
        yearsLeft: prog.duration,
        costPerYear,
        totalCost: costPerYear * prog.duration,
      };
      // Loans auto-drawn each year via advanceYear()
    }

    function completeEducation(player, prog) {
      // Roll pass/fail where applicable
      if (prog.passRate && !roll(prog.passRate)) {
        return { outcome: 'failed', canRetry: true };
      }
      // Award degree
      player.education.push(prog.id);
      // Grant skills
      for (const [skill, lvl] of Object.entries(prog.skillGrants ?? {}))
        gainSkillLevels(player, skill, lvl);
      // Unlock careers
      for (const career of prog.careerUnlocks ?? [])
        player.unlockedCareers.add(career);
      // Apply salary boost (stored for lookup during hiring)
      player.educationMods.push({ id: prog.id, boost: prog.salaryBoost ?? 1.0 });
      return { outcome: 'passed' };
    }
    -------------------------------------------------------------------------- */


// ============================================================
// SECTION 3 — CAREER TRACKS
// ============================================================

/*
  Player job state:
  {
    careerId: 'software_engineer',
    levelIndex: 0,        // index into career.levels[]
    yearsAtLevel: 0,
    salary: 95000,        // current gross annual
    performanceScore: 50, // 0-100 scale, reset each year review cycle
    unemployed: false,
    unemployedYears: 0,
    sideGig: null,        // see SECTION 3E
    perks: [],            // active career perks
  }
*/

// Each level structure:
// { title, minSalary, maxSalary, avgYearsToNext, promoteBaseChance, layoffChance }
// Salary on hire = randInt(minSalary, maxSalary) * educationMod * skillMod * hsGpaMod
// Annual raise = raiseRange rolled at performance review

const CAREERS = {

  // ----------------------------------------------------------
  software_engineer: {
    id: 'software_engineer',
    label: 'Software Engineer',
    sector: 'tech',
    educationRequired: ['bs_cs', 'assoc_it', 'cert_bootcamp', 'phd_cs'],
    // Salary negotiation base skill: tech_savvy
    levels: [
      {
        title: 'Junior Software Engineer',
        minSalary: 72_000,
        maxSalary: 105_000,
        raiseRange: [0.03, 0.07],     // 3-7% annual raise
        avgYearsToNext: 2,
        promoteBaseChance: 0.35,
        layoffChance: 0.04,
      },
      {
        title: 'Software Engineer II',
        minSalary: 105_000,
        maxSalary: 145_000,
        raiseRange: [0.04, 0.09],
        avgYearsToNext: 3,
        promoteBaseChance: 0.30,
        layoffChance: 0.04,
      },
      {
        title: 'Senior Software Engineer',
        minSalary: 145_000,
        maxSalary: 210_000,
        raiseRange: [0.05, 0.12],
        avgYearsToNext: 4,
        promoteBaseChance: 0.20,
        layoffChance: 0.03,
      },
      {
        title: 'Staff / Principal Engineer',
        minSalary: 210_000,
        maxSalary: 310_000,
        raiseRange: [0.04, 0.10],
        avgYearsToNext: 5,
        promoteBaseChance: 0.15,
        layoffChance: 0.02,
      },
      {
        title: 'Engineering Director / VP Engineering',
        minSalary: 290_000,
        maxSalary: 500_000,
        raiseRange: [0.03, 0.08],
        avgYearsToNext: null,     // terminal
        promoteBaseChance: 0,
        layoffChance: 0.03,
      },
    ],
    // Special perks
    perks: {
      stock_options: {
        label: 'Stock Options / RSUs',
        // On hire at SWE II+, receive RSU grant
        triggerLevel: 1,
        grantFormula: (salary) => salary * randInt(1, 3),  // 1-3x salary in RSUs
        vestingYears: 4,       // 25% per year
        // Each vesting event: player.cash += vestedAmount * stockMultiplier
        // stockMultiplier = 1.0 + rand(-0.3, 0.8) rolled on vest date (company luck)
      },
      remote_work: {
        label: 'Remote Work Option',
        triggerLevel: 1,
        effect: 'Reduces effective cost of living by 15% if player opts in.',
      },
      annual_bonus: {
        label: 'Performance Bonus',
        formula: (salary, perfScore) => salary * clamp(perfScore / 100, 0.05, 0.20),
        // e.g. 100 perf → 20% of salary as bonus
      },
    },
    // Education salary stacking
    educationMultipliers: {
      phd_cs: 1.45,
      mba: 1.20,
      cert_pmp: 1.10,
      cert_bootcamp: 0.90,   // bootcamp → lower starting band
    },
  },

  // ----------------------------------------------------------
  doctor: {
    id: 'doctor',
    label: 'Physician',
    sector: 'healthcare',
    educationRequired: ['md'],
    levels: [
      {
        title: 'Medical Resident',
        minSalary: 60_000,
        maxSalary: 70_000,     // residents earn little by design
        raiseRange: [0.02, 0.04],
        avgYearsToNext: 3,     // residency length (already baked into grad school)
        promoteBaseChance: 0.90,   // near-automatic after residency
        layoffChance: 0.00,
      },
      {
        title: 'Attending Physician (General Practice)',
        minSalary: 200_000,
        maxSalary: 260_000,
        raiseRange: [0.03, 0.06],
        avgYearsToNext: 5,
        promoteBaseChance: 0.25,
        layoffChance: 0.01,
      },
      {
        title: 'Specialist (Internal Medicine / Surgeon)',
        minSalary: 280_000,
        maxSalary: 450_000,
        raiseRange: [0.03, 0.07],
        avgYearsToNext: 6,
        promoteBaseChance: 0.20,
        layoffChance: 0.01,
      },
      {
        title: 'Department Chief / Hospital Medical Director',
        minSalary: 420_000,
        maxSalary: 700_000,
        raiseRange: [0.03, 0.06],
        avgYearsToNext: null,
        promoteBaseChance: 0,
        layoffChance: 0.01,
      },
    ],
    perks: {
      malpractice_risk: {
        label: 'Malpractice Lawsuit Risk',
        // Each year at Specialist+: 2% chance of lawsuit
        // Lawsuit: player pays $50k–$200k (capped by malpractice insurance at $20k out-of-pocket)
        chancePerYear: 0.02,
        outOfPocketRange: [10_000, 20_000],
      },
      private_practice_option: {
        label: 'Open Private Practice',
        // Available at Attending+. Entrepreneur sub-track.
        // Requires $200k startup capital. Revenue: 1.3x current salary but high variance.
        minLevel: 1,
        startupCost: 200_000,
        revenueMultiplier: () => rand(0.9, 1.6),
      },
      signing_bonus: {
        label: 'Hospital Signing Bonus',
        formula: () => randInt(20_000, 60_000),
        triggerOnHire: true,
      },
    },
    educationMultipliers: { md: 1.0 },  // MD is prerequisite, not additive
  },

  // ----------------------------------------------------------
  lawyer: {
    id: 'lawyer',
    label: 'Attorney / Lawyer',
    sector: 'legal',
    educationRequired: ['jd'],
    levels: [
      {
        title: 'Associate Attorney',
        minSalary: 80_000,
        maxSalary: 215_000,   // wide range: big law vs. small firm
        raiseRange: [0.05, 0.12],
        avgYearsToNext: 4,
        promoteBaseChance: 0.30,
        layoffChance: 0.06,   // up-or-out culture
      },
      {
        title: 'Senior Associate',
        minSalary: 160_000,
        maxSalary: 280_000,
        raiseRange: [0.05, 0.10],
        avgYearsToNext: 3,
        promoteBaseChance: 0.25,
        layoffChance: 0.07,
      },
      {
        title: 'Of Counsel / Junior Partner',
        minSalary: 250_000,
        maxSalary: 400_000,
        raiseRange: [0.04, 0.09],
        avgYearsToNext: 4,
        promoteBaseChance: 0.20,
        layoffChance: 0.04,
      },
      {
        title: 'Equity Partner',
        minSalary: 350_000,
        maxSalary: 1_000_000,  // profit-sharing makes this extremely variable
        raiseRange: [0.05, 0.20],
        avgYearsToNext: null,
        promoteBaseChance: 0,
        layoffChance: 0.01,
      },
    ],
    perks: {
      case_bonus: {
        label: 'Contingency / Win Bonus',
        // At Senior+, each year: roll if a major case closes
        chancePerYear: 0.30,
        bonusRange: [20_000, 200_000],
        scaledByLevel: true,   // higher levels → bigger potential bonus
      },
      billable_hours_bonus: {
        label: 'Billable Hour Bonus',
        // Each year: if performanceScore >= 80, add bonus
        formula: (salary, perfScore) => perfScore >= 80 ? salary * 0.15 : 0,
      },
      bar_dues: {
        label: 'Annual Bar Dues',
        annualCost: 1_500,  // deducted from cash each year
      },
    },
    educationMultipliers: {
      jd: 1.0,
      mba: 1.15,  // JD+MBA unlocks corporate law track bonus
    },
  },

  // ----------------------------------------------------------
  teacher: {
    id: 'teacher',
    label: 'Teacher',
    sector: 'education',
    educationRequired: ['bs_education'],
    levels: [
      {
        title: 'Substitute / Student Teacher',
        minSalary: 28_000,
        maxSalary: 38_000,
        raiseRange: [0.02, 0.03],
        avgYearsToNext: 1,
        promoteBaseChance: 0.70,
        layoffChance: 0.02,
      },
      {
        title: 'Teacher (K-12)',
        minSalary: 38_000,
        maxSalary: 62_000,
        raiseRange: [0.02, 0.04],
        avgYearsToNext: 8,     // tenure track is slow
        promoteBaseChance: 0.15,
        layoffChance: 0.02,
      },
      {
        title: 'Tenured Teacher / Department Head',
        minSalary: 55_000,
        maxSalary: 82_000,
        raiseRange: [0.02, 0.04],
        avgYearsToNext: 6,
        promoteBaseChance: 0.15,
        layoffChance: 0.005,   // tenure = near-impossible to fire
      },
      {
        title: 'Vice Principal',
        minSalary: 80_000,
        maxSalary: 105_000,
        raiseRange: [0.03, 0.05],
        avgYearsToNext: 4,
        promoteBaseChance: 0.20,
        layoffChance: 0.01,
      },
      {
        title: 'Principal / Superintendent',
        minSalary: 95_000,
        maxSalary: 180_000,
        raiseRange: [0.03, 0.05],
        avgYearsToNext: null,
        promoteBaseChance: 0,
        layoffChance: 0.02,
      },
    ],
    perks: {
      pension: {
        label: 'Defined Benefit Pension',
        // After 10yr in career: guaranteed monthly pension at retirement
        // = (yearsEmployed * 0.02) * finalSalary  e.g. 25yr = 50% of final salary
        vestingYears: 10,
        formula: (years, finalSalary) => (years * 0.02) * finalSalary,
        monthlyAtRetirement: true,
      },
      summers_off: {
        label: 'Summers Off',
        effect: 'Player has 2.5 in-game months free each year for side gigs or study.',
        freeMonths: 2.5,
      },
      public_loan_forgiveness: {
        label: 'Public Service Loan Forgiveness',
        effect: 'After 10 game-years as teacher, all remaining student debt forgiven.',
        yearsRequired: 10,
      },
    },
    educationMultipliers: { phd_education: 1.20 },
  },

  // ----------------------------------------------------------
  electrician: {
    id: 'electrician',
    label: 'Electrician',
    sector: 'trades',
    educationRequired: ['trade_electrician'],
    levels: [
      {
        title: 'Apprentice Electrician',
        minSalary: 38_000,
        maxSalary: 50_000,
        raiseRange: [0.03, 0.05],
        avgYearsToNext: 2,
        promoteBaseChance: 0.60,
        layoffChance: 0.03,
      },
      {
        title: 'Journeyman Electrician',
        minSalary: 58_000,
        maxSalary: 82_000,
        raiseRange: [0.03, 0.06],
        avgYearsToNext: 5,
        promoteBaseChance: 0.30,
        layoffChance: 0.03,
      },
      {
        title: 'Master Electrician',
        minSalary: 78_000,
        maxSalary: 110_000,
        raiseRange: [0.03, 0.06],
        avgYearsToNext: 5,
        promoteBaseChance: 0.20,
        layoffChance: 0.02,
      },
      {
        title: 'Electrical Contractor / Business Owner',
        minSalary: 95_000,
        maxSalary: 250_000,
        raiseRange: [0.05, 0.15],    // revenue-dependent
        avgYearsToNext: null,
        promoteBaseChance: 0,
        layoffChance: 0.01,
      },
    ],
    perks: {
      union_benefits: {
        label: 'IBEW Union Benefits',
        annualBonus: 2_500,          // union halls pay holiday bonus
        healthInsuranceSaving: 8_000, // subsidized health, saves vs. market
        pension: {
          vestingYears: 5,
          formula: (years, finalSalary) => (years * 0.015) * finalSalary,
        },
      },
      overtime: {
        label: 'Overtime Pay',
        // Each year: roll chance of overtime project
        chancePerYear: 0.40,
        extraIncomeRange: [5_000, 22_000],
      },
      side_contracting: {
        label: 'Side Contracting',
        effect: 'At Journeyman+, can take private jobs on weekends.',
        minLevel: 1,
        extraIncomeRange: [8_000, 30_000],
        requiresSideGigSlot: true,
      },
    },
    educationMultipliers: {},
  },

  // ----------------------------------------------------------
  accountant: {
    id: 'accountant',
    label: 'Accountant / CPA',
    sector: 'finance',
    educationRequired: ['bs_accounting', 'assoc_business', 'bs_business'],
    levels: [
      {
        title: 'Staff Accountant',
        minSalary: 48_000,
        maxSalary: 65_000,
        raiseRange: [0.03, 0.06],
        avgYearsToNext: 2,
        promoteBaseChance: 0.40,
        layoffChance: 0.04,
      },
      {
        title: 'Senior Accountant',
        minSalary: 65_000,
        maxSalary: 92_000,
        raiseRange: [0.04, 0.07],
        avgYearsToNext: 3,
        promoteBaseChance: 0.30,
        layoffChance: 0.04,
      },
      {
        title: 'Accounting Manager / Controller',
        minSalary: 90_000,
        maxSalary: 135_000,
        raiseRange: [0.04, 0.08],
        avgYearsToNext: 4,
        promoteBaseChance: 0.25,
        layoffChance: 0.03,
      },
      {
        title: 'Director of Finance / VP Finance',
        minSalary: 130_000,
        maxSalary: 200_000,
        raiseRange: [0.04, 0.08],
        avgYearsToNext: 5,
        promoteBaseChance: 0.15,
        layoffChance: 0.03,
      },
      {
        title: 'CFO / Partner',
        minSalary: 185_000,
        maxSalary: 450_000,
        raiseRange: [0.04, 0.10],
        avgYearsToNext: null,
        promoteBaseChance: 0,
        layoffChance: 0.02,
      },
    ],
    perks: {
      tax_season_bonus: {
        label: 'Tax Season Overtime Bonus',
        chancePerYear: 1.0,         // guaranteed during tax season
        bonusRange: [3_000, 18_000],
        scaledByLevel: true,
      },
      cpa_salary_bump: {
        label: 'CPA License Premium',
        // Applied automatically if player holds cert_cpa
        salaryAdd: 12_000,
      },
      big4_prestige: {
        label: 'Big 4 Firm Option',
        // At hire: player can choose Big 4 (starts 20% higher salary, 15% faster promo,
        // 8% higher layoff risk in economic downturns)
        salaryMod: 1.20,
        promotionMod: 0.85,
        layoffMod: 1.08,
      },
    },
    educationMultipliers: { mba: 1.25, cert_cpa: 1.18 },
  },

  // ----------------------------------------------------------
  sales: {
    id: 'sales',
    label: 'Sales Representative',
    sector: 'business',
    educationRequired: ['hs', 'assoc_business', 'bs_business', 'bs_finance'],
    // HS diploma alone allowed — lowest education barrier
    levels: [
      {
        title: 'Sales Representative',
        minSalary: 32_000,
        maxSalary: 55_000,      // base; commission is major income source
        raiseRange: [0.02, 0.05],
        avgYearsToNext: 2,
        promoteBaseChance: 0.40,
        layoffChance: 0.08,     // high volatility
      },
      {
        title: 'Account Executive',
        minSalary: 52_000,
        maxSalary: 85_000,
        raiseRange: [0.03, 0.07],
        avgYearsToNext: 3,
        promoteBaseChance: 0.30,
        layoffChance: 0.07,
      },
      {
        title: 'Senior Account Executive / Regional Manager',
        minSalary: 80_000,
        maxSalary: 140_000,
        raiseRange: [0.04, 0.09],
        avgYearsToNext: 4,
        promoteBaseChance: 0.25,
        layoffChance: 0.05,
      },
      {
        title: 'Director of Sales',
        minSalary: 130_000,
        maxSalary: 220_000,
        raiseRange: [0.04, 0.10],
        avgYearsToNext: 5,
        promoteBaseChance: 0.15,
        layoffChance: 0.04,
      },
      {
        title: 'VP of Sales / Chief Revenue Officer',
        minSalary: 200_000,
        maxSalary: 500_000,
        raiseRange: [0.04, 0.12],
        avgYearsToNext: null,
        promoteBaseChance: 0,
        layoffChance: 0.05,
      },
    ],
    perks: {
      commission: {
        label: 'Sales Commission',
        // Added on top of base salary each year
        formula: (baseSalary, perfScore, levelIndex) => {
          const rate = [0.10, 0.15, 0.20, 0.25, 0.30][levelIndex];
          const multiplier = 0.5 + (perfScore / 100) * 1.5; // 0.5x–2.0x of rate
          return baseSalary * rate * multiplier;
        },
        // e.g. $60k base, perf 80 → $60k * 0.15 * 1.7 = $15,300 commission
      },
      car_allowance: {
        label: 'Company Car / Mileage Allowance',
        annualValue: 8_400,  // saves player car expense
      },
      quota_pressure: {
        label: 'Quota Miss Risk',
        // If performanceScore < 40: additional 10% layoff risk
        perfThreshold: 40,
        extraLayoffRisk: 0.10,
      },
    },
    educationMultipliers: { mba: 1.20, cert_sixsigma: 1.08 },
  },

  // ----------------------------------------------------------
  finance_banking: {
    id: 'finance_banking',
    label: 'Finance / Investment Banking',
    sector: 'finance',
    educationRequired: ['bs_finance', 'bs_business', 'bs_accounting', 'mba'],
    levels: [
      {
        title: 'Financial Analyst',
        minSalary: 65_000,
        maxSalary: 100_000,
        raiseRange: [0.05, 0.10],
        avgYearsToNext: 2,
        promoteBaseChance: 0.40,
        layoffChance: 0.06,
      },
      {
        title: 'Associate / Senior Analyst',
        minSalary: 110_000,
        maxSalary: 175_000,
        raiseRange: [0.06, 0.12],
        avgYearsToNext: 3,
        promoteBaseChance: 0.30,
        layoffChance: 0.06,
      },
      {
        title: 'Vice President (IB / Asset Mgmt)',
        minSalary: 180_000,
        maxSalary: 300_000,
        raiseRange: [0.06, 0.12],
        avgYearsToNext: 4,
        promoteBaseChance: 0.22,
        layoffChance: 0.05,
      },
      {
        title: 'Director / Executive Director',
        minSalary: 280_000,
        maxSalary: 450_000,
        raiseRange: [0.05, 0.12],
        avgYearsToNext: 4,
        promoteBaseChance: 0.15,
        layoffChance: 0.05,
      },
      {
        title: 'Managing Director / Partner',
        minSalary: 400_000,
        maxSalary: 1_500_000,   // bonus-heavy at this level
        raiseRange: [0.05, 0.20],
        avgYearsToNext: null,
        promoteBaseChance: 0,
        layoffChance: 0.04,
      },
    ],
    perks: {
      annual_bonus: {
        label: 'Year-End Bonus',
        formula: (salary, perfScore, levelIndex) => {
          const rates = [0.20, 0.50, 0.80, 1.20, 2.00];
          const rate = rates[levelIndex];
          const perfMult = clamp(perfScore / 100, 0.2, 1.5);
          return salary * rate * perfMult;
          // e.g. $200k VP salary, perf 90, rate 0.80 → $144k bonus
        },
      },
      market_risk: {
        label: 'Market Crash Layoff Risk',
        // During economic downturn event: layoffChance doubles
        downturnMultiplier: 2.0,
      },
      investment_access: {
        label: 'Institutional Investment Access',
        effect: 'Player gains access to private equity deals and hedge fund vehicles not available to other careers. investment_acumen skill checks unlock these.',
      },
      deal_fee: {
        label: 'Deal Closing Fee',
        // At VP+: chance of large one-time deal fee
        minLevel: 2,
        chancePerYear: 0.20,
        feeRange: [50_000, 500_000],
      },
    },
    educationMultipliers: {
      mba: 1.40,
      cert_cfa1: 1.08,
      cert_cfa2: 1.15,
      cert_cfa3: 1.25,
    },
  },

  // ----------------------------------------------------------
  entrepreneur: {
    id: 'entrepreneur',
    label: 'Entrepreneur / Business Owner',
    sector: 'business',
    educationRequired: ['hs', 'bs_business', 'bs_cs', 'bs_finance', 'bs_culinary', 'bs_realestate'],
    // Note: entrepreneur is less a "job" and more a status.
    // Player must invest startup capital to unlock each level.
    levels: [
      {
        title: 'Solo Freelancer / Sole Proprietor',
        minSalary: 15_000,
        maxSalary: 60_000,    // high variance; this is net income
        raiseRange: [0.00, 0.00],   // raises replaced by business revenue rolls
        avgYearsToNext: 3,
        promoteBaseChance: 0.30,
        layoffChance: 0.00,         // can't be "laid off" — but can go bankrupt
        startupCost: 5_000,
      },
      {
        title: 'Small Business Owner (< 10 employees)',
        minSalary: 40_000,
        maxSalary: 150_000,
        raiseRange: [0.00, 0.00],
        avgYearsToNext: 4,
        promoteBaseChance: 0.25,
        layoffChance: 0.00,
        startupCost: 50_000,
        bankruptcyChance: 0.15,    // annual chance of business failure
      },
      {
        title: 'Mid-Size Company CEO (10-100 employees)',
        minSalary: 100_000,
        maxSalary: 400_000,
        raiseRange: [0.00, 0.00],
        avgYearsToNext: 5,
        promoteBaseChance: 0.20,
        layoffChance: 0.00,
        startupCost: 200_000,
        bankruptcyChance: 0.10,
      },
      {
        title: 'Growth Stage CEO / Series A Startup',
        minSalary: 150_000,
        maxSalary: 600_000,
        raiseRange: [0.00, 0.00],
        avgYearsToNext: 6,
        promoteBaseChance: 0.15,
        layoffChance: 0.00,
        startupCost: 0,          // funded by VC; no capital required if VC event fires
        bankruptcyChance: 0.18,  // startups fail often
      },
      {
        title: 'Successful Exit / Serial Entrepreneur',
        minSalary: 300_000,
        maxSalary: 2_000_000,
        raiseRange: [0.00, 0.00],
        avgYearsToNext: null,
        promoteBaseChance: 0,
        layoffChance: 0.00,
        startupCost: 0,
        bankruptcyChance: 0.05,
      },
    ],
    perks: {
      revenue_variance: {
        label: 'Business Revenue Roll',
        // Replaces standard salary. Each year:
        formula: (baseIncome, levelIndex, businessSkill) => {
          const luck = rand(-0.40, 0.80);
          const skillBoost = businessSkill * 0.05;
          return baseIncome * (1 + luck + skillBoost);
        },
      },
      equity_exit: {
        label: 'Business Sale / IPO',
        // At mid-size+ level: annual chance of acquisition offer
        chancePerYear: 0.05,
        exitMultiple: () => rand(3, 15),   // 3-15x current annual revenue
      },
      vc_funding: {
        label: 'VC Funding Event',
        // At Growth Stage: random VC injects cash, skipping capital requirement
        chancePerYear: 0.12,
        fundingRange: [500_000, 5_000_000],
      },
      tax_advantages: {
        label: 'Business Tax Deductions',
        effect: 'Business expenses reduce taxable income by up to 30% of gross.',
        deductionRate: 0.30,
      },
    },
    educationMultipliers: { mba: 1.35, cert_pmp: 1.10 },
  },

  // ----------------------------------------------------------
  real_estate: {
    id: 'real_estate',
    label: 'Real Estate Agent / Broker',
    sector: 'real_estate',
    educationRequired: ['hs', 'cert_re_license', 'assoc_business', 'bs_realestate'],
    levels: [
      {
        title: 'Real Estate Agent (New)',
        minSalary: 20_000,
        maxSalary: 45_000,    // entirely commission-dependent early on
        raiseRange: [0.00, 0.00],
        avgYearsToNext: 3,
        promoteBaseChance: 0.30,
        layoffChance: 0.00,    // self-employed
        // Commission income replaces fixed salary — see perk below
      },
      {
        title: 'Experienced Agent',
        minSalary: 55_000,
        maxSalary: 130_000,
        raiseRange: [0.00, 0.00],
        avgYearsToNext: 4,
        promoteBaseChance: 0.25,
        layoffChance: 0.00,
      },
      {
        title: 'Real Estate Broker',
        minSalary: 90_000,
        maxSalary: 250_000,
        raiseRange: [0.00, 0.00],
        avgYearsToNext: 5,
        promoteBaseChance: 0.20,
        layoffChance: 0.00,
      },
      {
        title: 'Broker / Agency Owner',
        minSalary: 150_000,
        maxSalary: 600_000,
        raiseRange: [0.00, 0.00],
        avgYearsToNext: null,
        promoteBaseChance: 0,
        layoffChance: 0.00,
      },
    ],
    perks: {
      commission_income: {
        label: 'Transaction Commission',
        // Each year: roll number of closed deals based on level + market + negotiation skill
        dealsPerYearRange: (levelIndex) => [[1, 4], [3, 10], [6, 20], [10, 40]][levelIndex],
        avgDealSize: (market) => market === 'hot' ? 500_000 : market === 'cold' ? 200_000 : 350_000,
        commissionRate: 0.025,  // 2.5% per side
        // income = deals * avgDeal * commissionRate * negotiationBonus
      },
      market_sensitivity: {
        label: 'Housing Market Sensitivity',
        // Market state: hot / neutral / cold — set by random economic event
        // hot market: +50% commission income
        // cold market: -40% commission income
      },
      rental_portfolio: {
        label: 'Personal Rental Portfolio',
        effect: 'Agent can purchase investment properties at 10% below market using inside knowledge.',
        discountRate: 0.10,
      },
    },
    educationMultipliers: { bs_realestate: 1.15, mba: 1.10 },
  },

  // ----------------------------------------------------------
  nurse: {
    id: 'nurse',
    label: 'Registered Nurse',
    sector: 'healthcare',
    educationRequired: ['assoc_nursing', 'bsn'],
    levels: [
      {
        title: 'Graduate Nurse / RN I',
        minSalary: 55_000,
        maxSalary: 72_000,
        raiseRange: [0.03, 0.06],
        avgYearsToNext: 2,
        promoteBaseChance: 0.50,
        layoffChance: 0.01,
      },
      {
        title: 'RN II / Staff Nurse',
        minSalary: 70_000,
        maxSalary: 95_000,
        raiseRange: [0.03, 0.06],
        avgYearsToNext: 4,
        promoteBaseChance: 0.30,
        layoffChance: 0.01,
      },
      {
        title: 'Senior RN / Charge Nurse',
        minSalary: 90_000,
        maxSalary: 120_000,
        raiseRange: [0.03, 0.06],
        avgYearsToNext: 5,
        promoteBaseChance: 0.20,
        layoffChance: 0.01,
      },
      {
        title: 'Nurse Manager / Director of Nursing',
        minSalary: 110_000,
        maxSalary: 160_000,
        raiseRange: [0.03, 0.06],
        avgYearsToNext: null,
        promoteBaseChance: 0,
        layoffChance: 0.01,
      },
    ],
    perks: {
      shift_differential: {
        label: 'Night/Weekend Shift Differential',
        // Player chooses shift each year; night shift pays 12-18% more
        options: [
          { label: 'Day Shift',   modifier: 1.00 },
          { label: 'Night Shift', modifier: 1.15 },
          { label: 'Travel Nurse', modifier: 1.30, note: 'Frequent relocation, no benefits' },
        ],
      },
      overtime_demand: {
        label: 'Mandatory Overtime Events',
        chancePerYear: 0.30,
        extraIncome: (salary) => salary * 0.08,
      },
      travel_nursing: {
        label: 'Travel Nurse Contract',
        // Player can quit regular job for contract work
        contractSalary: (currentSalary) => currentSalary * 1.30,
        contractDuration: 0.25,   // 3 months
        noJobSecurity: true,
      },
    },
    educationMultipliers: { bsn: 1.10, md: 1.30 },  // NP track via md
  },

  // ----------------------------------------------------------
  chef: {
    id: 'chef',
    label: 'Chef / Culinary Professional',
    sector: 'hospitality',
    educationRequired: ['assoc_culinary', 'bs_culinary', 'hs'],  // HS-only possible
    levels: [
      {
        title: 'Line Cook',
        minSalary: 28_000,
        maxSalary: 40_000,
        raiseRange: [0.02, 0.04],
        avgYearsToNext: 2,
        promoteBaseChance: 0.40,
        layoffChance: 0.07,
      },
      {
        title: 'Sous Chef',
        minSalary: 45_000,
        maxSalary: 68_000,
        raiseRange: [0.03, 0.06],
        avgYearsToNext: 4,
        promoteBaseChance: 0.28,
        layoffChance: 0.06,
      },
      {
        title: 'Head Chef / Executive Chef',
        minSalary: 65_000,
        maxSalary: 110_000,
        raiseRange: [0.03, 0.07],
        avgYearsToNext: 5,
        promoteBaseChance: 0.20,
        layoffChance: 0.05,
      },
      {
        title: 'Restaurant Owner / Celebrity Chef',
        minSalary: 80_000,
        maxSalary: 800_000,    // celebrity + media deals
        raiseRange: [0.00, 0.00],
        avgYearsToNext: null,
        promoteBaseChance: 0,
        layoffChance: 0.00,
        startupCost: 250_000,  // opening a restaurant
        bankruptcyChance: 0.25,  // restaurants fail frequently
      },
    ],
    perks: {
      restaurant_ownership: {
        label: 'Open Own Restaurant',
        minLevel: 2,
        startupCost: 250_000,
        revenueFormula: (skill) => rand(80_000, 500_000) * (1 + skill.creativity * 0.05),
        bankruptcyChance: 0.25,
      },
      media_deal: {
        label: 'Media / TV Deal',
        // At Head Chef+: annual chance of cookbook or TV show
        minLevel: 2,
        chancePerYear: 0.05,
        dealValue: () => randInt(50_000, 500_000),
      },
      tips: {
        label: 'Staff Meal Perks',
        annualSaving: 2_400,  // food costs eliminated
      },
    },
    educationMultipliers: { bs_culinary: 1.08, mba: 1.05 },
  },

  // ----------------------------------------------------------
  // BONUS TRADES (abbreviated — follow same level structure)

  plumber: {
    id: 'plumber', label: 'Plumber', sector: 'trades',
    educationRequired: ['trade_plumber'],
    levels: [
      { title: 'Apprentice Plumber',  minSalary: 36_000, maxSalary: 48_000, raiseRange: [0.03, 0.05], avgYearsToNext: 2, promoteBaseChance: 0.60, layoffChance: 0.03 },
      { title: 'Journeyman Plumber',  minSalary: 56_000, maxSalary: 80_000, raiseRange: [0.03, 0.06], avgYearsToNext: 5, promoteBaseChance: 0.28, layoffChance: 0.03 },
      { title: 'Master Plumber',      minSalary: 75_000, maxSalary: 105_000, raiseRange: [0.03, 0.06], avgYearsToNext: 5, promoteBaseChance: 0.20, layoffChance: 0.02 },
      { title: 'Plumbing Contractor', minSalary: 90_000, maxSalary: 240_000, raiseRange: [0.05, 0.15], avgYearsToNext: null, promoteBaseChance: 0, layoffChance: 0.01 },
    ],
    perks: { union_benefits: true, overtime: true, side_contracting: true },
    educationMultipliers: {},
  },

  hvac_tech: {
    id: 'hvac_tech', label: 'HVAC Technician', sector: 'trades',
    educationRequired: ['trade_hvac'],
    levels: [
      { title: 'HVAC Apprentice',    minSalary: 34_000, maxSalary: 46_000, raiseRange: [0.03, 0.05], avgYearsToNext: 2, promoteBaseChance: 0.60, layoffChance: 0.03 },
      { title: 'HVAC Technician',    minSalary: 52_000, maxSalary: 75_000, raiseRange: [0.03, 0.06], avgYearsToNext: 4, promoteBaseChance: 0.28, layoffChance: 0.03 },
      { title: 'Senior HVAC Tech',   minSalary: 70_000, maxSalary: 98_000, raiseRange: [0.03, 0.06], avgYearsToNext: 5, promoteBaseChance: 0.20, layoffChance: 0.02 },
      { title: 'HVAC Business Owner',minSalary: 85_000, maxSalary: 220_000, raiseRange: [0.05, 0.15], avgYearsToNext: null, promoteBaseChance: 0, layoffChance: 0.01 },
    ],
    perks: { union_benefits: true, seasonal_demand: { note: 'Summer/winter boom = 20% extra income chance', chancePerYear: 0.50, bonus: 8_000 } },
    educationMultipliers: {},
  },
};


// ============================================================
// SECTION 4 — JOB MECHANICS
// ============================================================

// ----- 4A. ANNUAL PERFORMANCE REVIEW -----

/*
  Triggered once per game year for employed players.
  performanceScore (0-100) is rolled from multiple factors.
*/

function rollPerformanceScore(player, career) {
  const level = career.levels[player.job.levelIndex];
  let score = randInt(30, 100);   // base roll — employee variance

  // Skill bonuses
  score += player.skills.discipline     * 3;
  score += player.skills.tech_savvy     * (career.sector === 'tech' ? 4 : 1);
  score += player.skills.creativity     * (career.sector === 'hospitality' ? 3 : 1);
  score += player.skills.negotiation    * 2;
  score += player.skills.financial_literacy * (career.sector === 'finance' ? 3 : 1);

  // Work-life events (set by random event system)
  if (player.flags.healthIssue)    score -= 10;
  if (player.flags.familyStress)   score -= 8;
  if (player.flags.certEarned)     score += 8;   // recently got a cert

  return clamp(score, 0, 100);
}

function applyPerformanceReview(player, career) {
  const perf = rollPerformanceScore(player, career);
  player.job.performanceScore = perf;

  const level = career.levels[player.job.levelIndex];
  const [minRaise, maxRaise] = level.raiseRange;

  // Raise calculation
  const raiseMultiplier = perf >= 80 ? 1.3 : perf >= 50 ? 1.0 : 0.5;
  const raise = rand(minRaise, maxRaise) * raiseMultiplier;
  player.job.salary = Math.round(player.job.salary * (1 + raise));

  // Bonus payout (career-specific perks fire here)
  const bonus = calcCareerBonus(player, career, perf);
  player.cash += bonus;
  player.job.yearsAtLevel++;

  // Promotion check
  checkPromotion(player, career, perf);

  // Firing risk
  if (perf < 25 && roll(0.30)) {
    firePlayer(player, 'performance');
  }

  return { perf, raise, bonus };
}

// ----- 4B. PROMOTION LOGIC -----

function checkPromotion(player, career, perfScore) {
  const level = career.levels[player.job.levelIndex];
  if (!level.avgYearsToNext) return;    // terminal level

  const yearsNeeded = level.avgYearsToNext;
  const yearsAt = player.job.yearsAtLevel;

  // Must meet minimum years
  if (yearsAt < Math.floor(yearsNeeded * 0.5)) return;

  // Base promotion chance scales with time at level + performance
  let chance = level.promoteBaseChance;
  chance *= clamp(yearsAt / yearsNeeded, 0.3, 1.5);  // scales up over time
  chance *= (perfScore / 60);   // perf 60 = 1x, perf 100 = 1.67x

  // Education modifiers
  const grad = player.education.find(e => GRAD_SCHOOLS[e]);
  if (grad) chance *= GRAD_SCHOOLS[grad]?.promotionSpeedMod ?? 1;

  // Skill boost
  chance += player.skills.negotiation * 0.02;
  chance += player.skills.discipline * 0.015;

  if (roll(chance)) {
    promotePlayer(player, career);
  }
}

function promotePlayer(player, career) {
  player.job.levelIndex++;
  const newLevel = career.levels[player.job.levelIndex];
  // New salary is max of old salary and new level floor (no salary cut on promotion)
  player.job.salary = Math.max(
    player.job.salary * 1.08,            // guaranteed 8% bump
    randInt(newLevel.minSalary, newLevel.maxSalary * 0.6)  // entry into new band
  );
  player.job.yearsAtLevel = 0;
  // Award promotion perks
  triggerPromotionPerks(player, career);
}

// ----- 4C. JOB SWITCHING & SALARY NEGOTIATION -----

/*
  Player can apply for a new job in any career they have unlocked.
  Negotiation uses the negotiation skill + education to improve offer.
*/

function generateJobOffer(player, targetCareerId, options = {}) {
  const career = CAREERS[targetCareerId];
  // Determine entry level based on years of experience in related sector
  const entryLevel = calcEntryLevel(player, career);
  const levelData = career.levels[entryLevel];

  // Base offer at mid-range of level
  let offerSalary = randInt(levelData.minSalary, levelData.maxSalary);

  // Education multiplier
  const eduMult = getEducationMultiplier(player, career);
  offerSalary = Math.round(offerSalary * eduMult);

  // Skill multiplier
  const skillMult = 1 + player.skills.negotiation * 0.02
                      + player.skills.financial_literacy * 0.01;

  // First offer is conservative
  const firstOffer = Math.round(offerSalary * rand(0.88, 0.96));

  return {
    careerId: targetCareerId,
    levelIndex: entryLevel,
    firstOffer,
    reservationPrice: offerSalary,      // max employer will go
    maxAskable: Math.round(offerSalary * 1.10),  // player can ask up to 10% over
    counterAllowed: true,
  };
}

function negotiateOffer(player, offer, askAmount) {
  // Player states desired salary
  if (askAmount > offer.maxAskable) {
    // Company walks — offer withdrawn (chance based on negotiation skill)
    const walkChance = 0.40 - player.skills.negotiation * 0.05;
    if (roll(walkChance)) return { outcome: 'offer_withdrawn' };
  }

  // Negotiation roll
  const negotiationPower = player.skills.negotiation * 8;     // up to +40 to roll at skill 5
  const roll100 = randInt(0, 100) + negotiationPower;

  if (roll100 >= 70) {
    // Full ask granted
    return { outcome: 'accepted', salary: askAmount };
  } else if (roll100 >= 45) {
    // Split the difference
    return { outcome: 'counter', salary: Math.round((askAmount + offer.firstOffer) / 2) };
  } else {
    // Stand firm on original
    return { outcome: 'stand_firm', salary: offer.firstOffer };
  }
}

// Counter-offer from current employer when player resigns
function generateCounterOffer(player) {
  const currentSalary = player.job.salary;
  // Employer counters at 5-15% above current salary
  const counter = Math.round(currentSalary * rand(1.05, 1.15));
  return {
    type: 'counter_offer',
    salary: counter,
    // Side benefit: occasionally adds a perk (extra PTO, title bump)
    bonusPerk: roll(0.25) ? 'extra_pto' : null,
  };
}

// ----- 4D. LAYOFFS & FIRING -----

const ECONOMIC_STATES = {
  boom:       { layoffMultiplier: 0.50, hiringBonus: 1.10 },
  normal:     { layoffMultiplier: 1.00, hiringBonus: 1.00 },
  recession:  { layoffMultiplier: 2.50, hiringBonus: 0.90 },
  depression: { layoffMultiplier: 4.00, hiringBonus: 0.80 },
};

function checkLayoff(player, career, economicState) {
  const level = career.levels[player.job.levelIndex];
  let layoffChance = level.layoffChance;

  // Economic modifier
  layoffChance *= ECONOMIC_STATES[economicState].layoffMultiplier;

  // Performance protection
  if (player.job.performanceScore >= 80) layoffChance *= 0.5;
  if (player.job.performanceScore < 40)  layoffChance *= 1.8;

  // Tenure protection (harder to lay off long-timers)
  if (player.job.yearsAtLevel >= 5) layoffChance *= 0.7;

  // Skill protection
  layoffChance -= player.skills.discipline * 0.002;

  if (roll(clamp(layoffChance, 0, 0.5))) {
    laidOffPlayer(player, 'economic');
  }
}

function laidOffPlayer(player, reason) {
  player.job.unemployed = true;
  player.job.unemployedYears = 0;
  player.job.prevSalary = player.job.salary;
  player.job.prevCareerId = player.job.careerId;
  player.job.careerId = null;

  // Severance: typically 1-2 weeks per year worked
  const severanceWeeks = clamp(player.job.yearsTotal * 1.5, 2, 26);
  const severancePay = (player.job.prevSalary / 52) * severanceWeeks;
  player.cash += severancePay;

  return { reason, severancePay };
}

function firePlayer(player, reason) {
  // Fired for cause — no severance
  player.job.unemployed = true;
  player.job.unemployedYears = 0;
  player.job.prevSalary = player.job.salary;
  player.job.careerId = null;
  player.job.firedRecord = true;   // makes future negotiation harder
}

// ----- 4E. UNEMPLOYMENT BENEFITS -----

const UNEMPLOYMENT = {
  // Replaces % of salary up to weekly cap
  replacementRate: 0.50,
  weeklyMaxBenefit: 823,    // US average max (~$42k/yr cap)
  durationWeeks: 26,        // 6 months standard
  // Extended benefits during recession
  recessionExtension: 13,   // additional 13 weeks

  calcWeeklyBenefit(prevAnnualSalary) {
    const weekly = (prevAnnualSalary / 52) * this.replacementRate;
    return Math.min(weekly, this.weeklyMaxBenefit);
  },

  // Each year unemployed: pay out benefits and apply job search pressure
  advanceUnemployedYear(player, economicState) {
    player.job.unemployedYears++;
    const weeklyBenefit = this.calcWeeklyBenefit(player.job.prevSalary);
    const maxWeeks = this.durationWeeks
      + (economicState === 'recession' ? this.recessionExtension : 0);
    const benefitWeeks = Math.min(52, maxWeeks - (player.job.unemployedYears - 1) * 52);
    const annualBenefit = Math.max(0, weeklyBenefit * benefitWeeks);
    player.cash += annualBenefit;

    // Skills decay slightly while unemployed
    if (player.job.unemployedYears >= 2) {
      const keyCareers = { software_engineer: 'tech_savvy', finance_banking: 'financial_literacy' };
      const decaySkill = keyCareers[player.job.prevCareerId];
      if (decaySkill) gainSkillLevels(player, decaySkill, -1);
    }

    return annualBenefit;
  },
};

// ----- 4F. SIDE GIGS -----

const SIDE_GIGS = {
  freelance_dev: {
    id: 'freelance_dev',
    label: 'Freelance Software Development',
    requires: { career: 'software_engineer', minLevel: 0, skills: { tech_savvy: 2 } },
    incomeRange: [15_000, 60_000],
    timeCommitment: 'medium',   // reduces promotion speed by 10%
    promotionPenalty: 0.10,
  },
  tutoring: {
    id: 'tutoring',
    label: 'Private Tutoring',
    requires: { career: 'teacher', minLevel: 0 },
    incomeRange: [5_000, 20_000],
    timeCommitment: 'low',
    promotionPenalty: 0.0,
  },
  tax_prep: {
    id: 'tax_prep',
    label: 'Tax Preparation (Seasonal)',
    requires: { skills: { financial_literacy: 2 } },
    incomeRange: [4_000, 18_000],
    timeCommitment: 'low',
    promotionPenalty: 0.0,
    seasonal: true,   // income only during tax season (Q1)
  },
  rideshare: {
    id: 'rideshare',
    label: 'Rideshare / Delivery Driver',
    requires: {},   // no requirements
    incomeRange: [6_000, 22_000],
    timeCommitment: 'medium',
    promotionPenalty: 0.05,
  },
  landlord: {
    id: 'landlord',
    label: 'Rental Property Income',
    requires: { assets: { realEstate: 1 } },  // needs at least 1 property
    incomeRange: (rent, mortgage) => rent * 12 - mortgage * 12,  // net rental income
    timeCommitment: 'low',
    promotionPenalty: 0.0,
    passive: true,
  },
  content_creator: {
    id: 'content_creator',
    label: 'Content Creator / Influencer',
    requires: {},
    incomeRange: [500, 200_000],   // extremely variable; log-normal distribution
    incomeFormula: (creativity, followers) => {
      const base = Math.pow(10, rand(2, 5));   // $100 to $100k
      return base * (1 + creativity * 0.1) * (followers / 10_000);
    },
    timeCommitment: 'medium',
    promotionPenalty: 0.05,
    growthMechanic: true,   // followers compound over years
  },
  stock_trading: {
    id: 'stock_trading',
    label: 'Active Stock / Options Trading',
    requires: { skills: { investment_acumen: 2 } },
    incomeRange: [-0.30, 0.40],   // % of invested capital; can lose money
    incomeFormula: (invested, acumen) => {
      const marketReturn = rand(-0.30, 0.40);
      const skillAdjust  = (acumen - 2) * 0.03;  // acumen 2=0, 5=+9%
      return invested * (marketReturn + skillAdjust);
    },
    timeCommitment: 'low',
    promotionPenalty: 0.0,
  },
  // Electrician / plumber side contracting already referenced in career perks
};

/*  PSEUDOCODE — activateSideGig(player, gigId) --------------------------------
    function activateSideGig(player, gigId) {
      if (player.sideGig) return { error: 'already_have_side_gig' };  // 1 slot only
      const gig = SIDE_GIGS[gigId];
      if (!meetsGigRequirements(player, gig)) return { error: 'requirements_not_met' };
      player.sideGig = { gigId, yearsActive: 0 };
      // Income and promotion penalty applied in advanceYear()
    }
    --------------------------------------------------------------------------- */


// ============================================================
// SECTION 5 — SKILLS SYSTEM
// ============================================================

/*
  Skills are 0-5 integer levels. They affect:
  - Salary negotiation outcomes
  - Investment returns
  - Business revenue
  - Promotion chances
  - Career-specific perk effectiveness

  Skills are gained via:
  - Education completions (skillGrants in education records)
  - Years of experience (passive gain, see SKILL_XP_RATES)
  - Random life events
  - Online course purchases (see SKILL_COURSES)
*/

const SKILLS = {
  negotiation: {
    id: 'negotiation',
    label: 'Negotiation',
    maxLevel: 5,
    description: 'Improves salary negotiation, job offers, and real estate deals.',
    effects: {
      // Each level adds to negotiation roll (see negotiateOffer)
      salaryNegotiationBonus: (lvl) => lvl * 8,    // +8 to negotiation roll per level
      jobOfferRange: (lvl) => lvl * 0.02,           // +2% max salary per level
      realEstateDiscount: (lvl) => lvl * 0.005,     // -0.5% purchase price per level
    },
  },
  financial_literacy: {
    id: 'financial_literacy',
    label: 'Financial Literacy',
    maxLevel: 5,
    description: 'Reduces investment fees, improves tax optimization, unlocks financial products.',
    effects: {
      taxSavings: (lvl) => lvl * 0.02,              // 2% lower effective tax rate per level
      investmentFeeReduction: (lvl) => lvl * 0.001, // -0.1% fund ER per level
      // Unlocks: lvl1=index funds, lvl2=bonds, lvl3=REITs, lvl4=options, lvl5=alternatives
      unlocksAtLevel: {
        1: ['index_funds', 'savings_account'],
        2: ['bonds', 'treasury'],
        3: ['reits', 'dividend_stocks'],
        4: ['options_trading', 'sector_etfs'],
        5: ['hedge_fund_access', 'private_equity'],
      },
    },
  },
  investment_acumen: {
    id: 'investment_acumen',
    label: 'Investment Acumen',
    maxLevel: 5,
    description: 'Boosts investment returns and risk management.',
    effects: {
      returnBoost: (lvl) => lvl * 0.015,            // +1.5% annual return per level
      riskReduction: (lvl) => lvl * 0.005,          // -0.5% portfolio volatility per level
      stockPickBonus: (lvl) => lvl * 0.02,          // individual stock picks more accurate
    },
  },
  tech_savvy: {
    id: 'tech_savvy',
    label: 'Tech Savvy',
    maxLevel: 5,
    description: 'Critical for software/IT careers. Boosts side gig income and automation.',
    effects: {
      seSalaryBoost: (lvl) => lvl * 0.03,           // +3% salary per level if SE
      sideGigIncome: (lvl) => lvl * 0.10,           // +10% freelance income per level
      automationSaving: (lvl) => lvl * 500,         // automates tasks, saves $500/yr per level
    },
  },
  discipline: {
    id: 'discipline',
    label: 'Discipline',
    maxLevel: 5,
    description: 'Reduces layoff risk, speeds promotions, supports savings habits.',
    effects: {
      layoffReduction: (lvl) => lvl * 0.002,        // -0.2% layoff chance per level
      savingsRateBonus: (lvl) => lvl * 0.01,        // +1% annual savings rate per level
      promotionBonus: (lvl) => lvl * 0.015,         // +1.5% promotion chance per level
    },
  },
  creativity: {
    id: 'creativity',
    label: 'Creativity',
    maxLevel: 5,
    description: 'Boosts chef, entrepreneur, and content creator earnings.',
    effects: {
      chefRevenueBoost: (lvl) => lvl * 0.05,        // +5% restaurant revenue per level
      contentCreatorBoost: (lvl) => lvl * 0.10,
      entrepreneurBoost: (lvl) => lvl * 0.03,
    },
  },
  physical_labor: {
    id: 'physical_labor',
    label: 'Physical Labor',
    maxLevel: 5,
    description: 'For trades careers: boosts overtime chance and contracting income.',
    effects: {
      overtimeChance: (lvl) => lvl * 0.04,          // +4% overtime chance per level
      contractingIncome: (lvl) => lvl * 0.08,       // +8% contracting income per level
      // NOTE: diminishes with age (over 50: -1 effective level per decade)
    },
  },
  charisma: {
    id: 'charisma',
    label: 'Charisma',
    maxLevel: 5,
    description: 'Boosts sales commission, real estate deals, and leadership roles.',
    effects: {
      salesCommissionBoost: (lvl) => lvl * 0.05,
      realEstateDealsPerYear: (lvl) => lvl * 0.5,   // +0.5 extra deals per level
      promotionBonus: (lvl) => lvl * 0.01,
    },
  },
};

// ----- 5A. PASSIVE SKILL XP RATES (per year employed) -----
const SKILL_XP_RATES = {
  // { careerId: { skillId: xpPerYear } }
  // XP thresholds: level 0→1 = 2 XP, 1→2 = 4, 2→3 = 8, 3→4 = 16, 4→5 = 32
  software_engineer: { tech_savvy: 2, financial_literacy: 0.5 },
  doctor:            { discipline: 2 },
  lawyer:            { negotiation: 2, financial_literacy: 0.5 },
  teacher:           { discipline: 1, creativity: 0.5 },
  electrician:       { physical_labor: 2, discipline: 0.5 },
  plumber:           { physical_labor: 2 },
  hvac_tech:         { physical_labor: 2 },
  accountant:        { financial_literacy: 2, negotiation: 0.5 },
  sales:             { negotiation: 2, charisma: 2 },
  finance_banking:   { financial_literacy: 2, investment_acumen: 2 },
  entrepreneur:      { negotiation: 1, creativity: 1, financial_literacy: 1 },
  real_estate:       { negotiation: 2, charisma: 1 },
  nurse:             { discipline: 2 },
  chef:              { creativity: 2, discipline: 0.5 },
};

const SKILL_XP_THRESHOLDS = [2, 4, 8, 16, 32];  // XP to advance from level N to N+1

function gainSkillXp(player, skillId, xp) {
  if (!(skillId in player.skillXp)) player.skillXp[skillId] = 0;
  player.skillXp[skillId] += xp;
  const lvl = player.skills[skillId] ?? 0;
  if (lvl >= 5) return;
  const threshold = SKILL_XP_THRESHOLDS[lvl];
  if (player.skillXp[skillId] >= threshold) {
    player.skillXp[skillId] -= threshold;
    player.skills[skillId] = lvl + 1;
    // Trigger UI notification
    return { levelUp: true, skill: skillId, newLevel: lvl + 1 };
  }
}

function gainSkillLevels(player, skillId, levels) {
  player.skills[skillId] = clamp((player.skills[skillId] ?? 0) + levels, 0, 5);
}

// ----- 5B. PURCHASABLE SKILL COURSES -----
const SKILL_COURSES = [
  { id: 'course_negotiation_1', label: 'Negotiation Workshop',        cost: 800,  skill: 'negotiation',       xp: 2 },
  { id: 'course_negotiation_2', label: 'Advanced Negotiation (MBA)',  cost: 3_000, skill: 'negotiation',      xp: 5 },
  { id: 'course_finlit_1',      label: 'Personal Finance 101',        cost: 200,  skill: 'financial_literacy', xp: 2 },
  { id: 'course_finlit_2',      label: 'Investment Theory Course',    cost: 1_200, skill: 'financial_literacy', xp: 4 },
  { id: 'course_invest_1',      label: 'Stock Market Fundamentals',   cost: 500,  skill: 'investment_acumen',  xp: 2 },
  { id: 'course_invest_2',      label: 'Options & Derivatives',       cost: 2_500, skill: 'investment_acumen', xp: 5 },
  { id: 'course_tech_1',        label: 'Coding Basics (free MOOC)',   cost: 0,    skill: 'tech_savvy',         xp: 2 },
  { id: 'course_tech_2',        label: 'Advanced CS Algorithms',      cost: 400,  skill: 'tech_savvy',         xp: 4 },
  { id: 'course_charisma_1',    label: 'Public Speaking Course',      cost: 600,  skill: 'charisma',           xp: 3 },
  { id: 'course_discipline_1',  label: 'Time Management Workshop',    cost: 150,  skill: 'discipline',         xp: 2 },
  { id: 'course_creativity_1',  label: 'Creative Entrepreneurship',   cost: 1_000, skill: 'creativity',        xp: 3 },
];


// ============================================================
// SECTION 6 — ANNUAL ADVANCE LOOP (PSEUDOCODE INTEGRATION)
// ============================================================

/*
  Call once per "year" event in the game loop.
  Returns an array of { type, message, data } events to show the player.
*/

function advanceYear(player, economicState = 'normal') {
  const events = [];

  // --- Education ---
  if (player.currentEnrollment) {
    const enroll = player.currentEnrollment;
    // Deduct tuition (add to debt if player has no cash)
    const tuition = enroll.costPerYear;
    if (player.cash >= tuition) {
      player.cash -= tuition;
    } else {
      player.debt += tuition - player.cash;
      player.cash = 0;
    }
    enroll.yearsLeft--;
    if (enroll.yearsLeft <= 0) {
      const prog = findProgram(enroll.programId);
      const result = completeEducation(player, prog);
      events.push({ type: 'education_complete', data: result });
      player.currentEnrollment = null;
    } else {
      events.push({ type: 'education_progress', data: { yearsLeft: enroll.yearsLeft } });
    }
  }

  // --- Loan Repayment ---
  if (player.debt > 0) {
    // Standard 10-year repayment plan
    const monthlyPayment = calcLoanPayment(player.debt, 0.055, 120);  // 5.5% interest, 10yr
    const annualPayment = monthlyPayment * 12;
    const actual = Math.min(annualPayment, player.cash);
    player.cash -= actual;
    player.debt = Math.max(0, player.debt - actual + player.debt * 0.055);
    events.push({ type: 'loan_payment', data: { paid: actual, remaining: player.debt } });
  }

  // --- Employment ---
  if (!player.job.unemployed) {
    const career = CAREERS[player.job.careerId];

    // Gain skill XP
    const xpRates = SKILL_XP_RATES[player.job.careerId] ?? {};
    for (const [skill, xpRate] of Object.entries(xpRates)) {
      const result = gainSkillXp(player, skill, xpRate);
      if (result?.levelUp) events.push({ type: 'skill_levelup', data: result });
    }

    // Performance review
    const review = applyPerformanceReview(player, career);
    events.push({ type: 'performance_review', data: review });

    // Layoff check
    checkLayoff(player, career, economicState);
    if (player.job.unemployed) {
      events.push({ type: 'layoff', data: { career: career.label } });
    } else {
      // Collect salary (monthly, but totaled annually)
      const annualNet = calcTakeHome(player.job.salary);
      player.cash += annualNet;
      events.push({ type: 'salary_paid', data: { gross: player.job.salary, net: annualNet } });
    }

    // Career-specific annual events (bonuses, malpractice, etc.)
    const perkEvents = processCareerPerks(player, career, review.perf);
    events.push(...perkEvents);

  } else {
    // Unemployed — collect benefits, search for work
    const benefit = UNEMPLOYMENT.advanceUnemployedYear(player, economicState);
    events.push({ type: 'unemployment_benefit', data: { amount: benefit } });

    // Auto job search (if player triggers manual search, better results)
    if (player.job.unemployedYears >= 2) {
      events.push({ type: 'job_search_pressure', data: { message: 'Long-term unemployment is hurting your skills.' } });
    }
  }

  // --- Side Gig ---
  if (player.sideGig) {
    const gig = SIDE_GIGS[player.sideGig.gigId];
    const gigIncome = calcSideGigIncome(player, gig);
    player.cash += gigIncome;
    events.push({ type: 'side_gig_income', data: { gig: gig.label, income: gigIncome } });
  }

  // --- Age ---
  player.age++;

  // --- Teacher loan forgiveness check ---
  if (player.job.careerId === 'teacher') {
    const teacherYears = player.job.yearsTotal ?? 0;
    if (teacherYears >= 10 && player.debt > 0) {
      events.push({ type: 'loan_forgiven', data: { amount: player.debt } });
      player.debt = 0;
    }
  }

  // --- Skill decay (physical_labor after 50) ---
  if (player.age > 50 && (player.skills.physical_labor ?? 0) > 0) {
    const decade = Math.floor((player.age - 50) / 10);
    player.skills.physical_labor = Math.max(0, (player.skills.physical_labor ?? 0) - decade);
  }

  return events;
}

// Helper: standard loan payment formula
function calcLoanPayment(principal, annualRate, months) {
  const r = annualRate / 12;
  return principal * r / (1 - Math.pow(1 + r, -months));
}

// Helper: total education multiplier for a career
function getEducationMultiplier(player, career) {
  let mult = 1.0;
  for (const eduId of player.education) {
    const careerMult = career.educationMultipliers?.[eduId];
    if (careerMult) mult *= careerMult;
  }
  // Apply HS GPA modifier
  if (player.gpa != null) mult *= HIGH_SCHOOL.salaryMod(player.gpa);
  return mult;
}

// Helper: find program in all education tables
function findProgram(programId) {
  return (
    COMMUNITY_COLLEGE_DEGREES[programId] ||
    TRADE_SCHOOL_PROGRAMS[programId] ||
    Object.values(UNIVERSITY_MAJORS).find(m => m.id === programId) ||
    GRAD_SCHOOLS[programId] ||
    ONLINE_CERTS[programId] ||
    null
  );
}


// ============================================================
// SECTION 7 — CAREER-SPECIFIC PERK PROCESSOR
// ============================================================

function processCareerPerks(player, career, perfScore) {
  const events = [];
  const levelIndex = player.job.levelIndex;

  switch (career.id) {

    case 'software_engineer': {
      // RSU vesting
      if (player.job.rsuGrant && levelIndex >= 1) {
        const vestAmount = player.job.rsuGrant * 0.25;   // 25% per year
        const stockMult = rand(0.7, 1.8);
        const vestValue = Math.round(vestAmount * stockMult);
        player.cash += vestValue;
        player.job.rsuGrant -= vestAmount;
        events.push({ type: 'rsu_vested', data: { value: vestValue } });
      }
      // Annual perf bonus
      const bonus = player.job.salary * clamp(perfScore / 100, 0.05, 0.20);
      player.cash += bonus;
      events.push({ type: 'bonus', data: { amount: bonus } });
      break;
    }

    case 'doctor': {
      // Malpractice risk
      if (levelIndex >= 2 && roll(0.02)) {
        const cost = randInt(10_000, 20_000);
        player.cash -= cost;
        events.push({ type: 'malpractice_lawsuit', data: { cost } });
      }
      break;
    }

    case 'lawyer': {
      // Case bonus at Senior+
      if (levelIndex >= 1 && roll(0.30)) {
        const caseBonus = randInt(20_000, 200_000) * (levelIndex / 3 + 0.5);
        player.cash += caseBonus;
        events.push({ type: 'case_bonus', data: { amount: caseBonus } });
      }
      // Billable hour bonus
      if (perfScore >= 80) {
        const billBonus = player.job.salary * 0.15;
        player.cash += billBonus;
        events.push({ type: 'billable_bonus', data: { amount: billBonus } });
      }
      // Bar dues
      player.cash -= 1_500;
      break;
    }

    case 'sales': {
      // Commission
      const rates = [0.10, 0.15, 0.20, 0.25, 0.30];
      const mult = 0.5 + (perfScore / 100) * 1.5;
      const commission = player.job.salary * rates[levelIndex] * mult;
      player.cash += commission;
      events.push({ type: 'commission', data: { amount: commission } });
      // Quota miss
      if (perfScore < 40) {
        player.job.layoffBoost = 0.10;  // checked in checkLayoff
      }
      break;
    }

    case 'finance_banking': {
      // Year-end bonus
      const ibRates = [0.20, 0.50, 0.80, 1.20, 2.00];
      const ibMult = clamp(perfScore / 100, 0.2, 1.5);
      const ibBonus = player.job.salary * ibRates[levelIndex] * ibMult;
      player.cash += ibBonus;
      events.push({ type: 'ib_bonus', data: { amount: ibBonus } });
      // Deal fee
      if (levelIndex >= 2 && roll(0.20)) {
        const fee = randInt(50_000, 500_000);
        player.cash += fee;
        events.push({ type: 'deal_fee', data: { amount: fee } });
      }
      break;
    }

    case 'entrepreneur': {
      // Revenue roll
      const baseIncome = rand(
        career.levels[levelIndex].minSalary,
        career.levels[levelIndex].maxSalary
      );
      const luck = rand(-0.40, 0.80);
      const skillBoost = (player.skills.creativity ?? 0) * 0.05;
      const revenue = Math.round(baseIncome * (1 + luck + skillBoost));
      player.job.salary = revenue;  // dynamic "salary"
      player.cash += calcTakeHome(Math.max(0, revenue));
      // Bankruptcy
      if (roll(career.levels[levelIndex].bankruptcyChance ?? 0)) {
        events.push({ type: 'bankruptcy', data: { message: 'Your business failed!' } });
        player.cash -= randInt(10_000, 80_000);   // debts
        player.job.levelIndex = Math.max(0, player.job.levelIndex - 1);
      }
      // VC funding
      if (levelIndex >= 3 && roll(0.12)) {
        const funding = randInt(500_000, 5_000_000);
        player.cash += funding;
        events.push({ type: 'vc_funding', data: { amount: funding } });
      }
      // Equity exit
      if (levelIndex >= 2 && roll(0.05)) {
        const multiple = rand(3, 15);
        const exitValue = player.job.salary * multiple;
        player.cash += exitValue;
        events.push({ type: 'equity_exit', data: { amount: exitValue } });
      }
      break;
    }

    case 'real_estate': {
      // Commission income
      const dealsPerYearBounds = [[1,4],[3,10],[6,20],[10,40]][levelIndex];
      const deals = randInt(dealsPerYearBounds[0], dealsPerYearBounds[1]);
      const marketState = player.flags.housingMarket ?? 'neutral';
      const avgDeal = { hot: 500_000, neutral: 350_000, cold: 200_000 }[marketState];
      const commRate = 0.025 * (1 + (player.skills.negotiation ?? 0) * 0.01);
      const commission = Math.round(deals * avgDeal * commRate);
      player.job.salary = commission;
      player.cash += calcTakeHome(commission);
      events.push({ type: 're_commission', data: { deals, commission } });
      break;
    }

    case 'electrician':
    case 'plumber':
    case 'hvac_tech': {
      // Union bonus
      if (levelIndex >= 1) {
        player.cash += 2_500;
        events.push({ type: 'union_bonus', data: { amount: 2_500 } });
      }
      // Overtime
      if (roll(0.40)) {
        const ot = randInt(5_000, 22_000);
        player.cash += ot;
        events.push({ type: 'overtime', data: { amount: ot } });
      }
      break;
    }

    case 'teacher': {
      // Pension accrual tracked, not paid until retirement
      player.job.pensionYears = (player.job.pensionYears ?? 0) + 1;
      break;
    }

    case 'chef': {
      // Media deal chance
      if (levelIndex >= 2 && roll(0.05)) {
        const deal = randInt(50_000, 500_000);
        player.cash += deal;
        events.push({ type: 'media_deal', data: { amount: deal } });
      }
      // Food savings
      player.cash += 2_400;
      break;
    }

    case 'nurse': {
      // Overtime demand
      if (roll(0.30)) {
        const nurseOT = player.job.salary * 0.08;
        player.cash += nurseOT;
        events.push({ type: 'overtime', data: { amount: nurseOT } });
      }
      break;
    }
  }

  return events;
}


// ============================================================
// SECTION 8 — ECONOMIC EVENT SYSTEM
// ============================================================

/*
  Every N game years, an economic event fires.
  It sets the global economicState for the next 2-4 years.
*/

const ECONOMIC_EVENTS = [
  {
    id: 'tech_boom',
    label: 'Tech Sector Boom',
    duration: 3,
    effects: {
      economicState: 'boom',
      careerModifiers: {
        software_engineer: { salaryMod: 1.20, hiringBonus: 1.30 },
        finance_banking:   { salaryMod: 1.10 },
      },
      housingMarket: 'hot',
    },
    probability: 0.12,
  },
  {
    id: 'recession',
    label: 'Economic Recession',
    duration: 2,
    effects: {
      economicState: 'recession',
      careerModifiers: {
        software_engineer: { layoffMod: 2.0 },
        finance_banking:   { layoffMod: 3.0 },
        sales:             { layoffMod: 2.5 },
      },
      housingMarket: 'cold',
    },
    probability: 0.10,
  },
  {
    id: 'housing_crash',
    label: 'Housing Market Crash',
    duration: 3,
    effects: {
      economicState: 'normal',
      careerModifiers: {
        real_estate: { salaryMod: 0.50 },
      },
      housingMarket: 'cold',
      propertyValueMod: 0.70,  // player properties lose 30% value
    },
    probability: 0.06,
  },
  {
    id: 'healthcare_boom',
    label: 'Healthcare Demand Surge',
    duration: 4,
    effects: {
      economicState: 'normal',
      careerModifiers: {
        doctor: { salaryMod: 1.15 },
        nurse:  { salaryMod: 1.20, hiringBonus: 1.15 },
      },
    },
    probability: 0.08,
  },
  {
    id: 'trade_shortage',
    label: 'Skilled Trades Shortage',
    duration: 3,
    effects: {
      economicState: 'normal',
      careerModifiers: {
        electrician: { salaryMod: 1.25, overtimeMod: 1.40 },
        plumber:     { salaryMod: 1.20, overtimeMod: 1.40 },
        hvac_tech:   { salaryMod: 1.22, overtimeMod: 1.30 },
      },
    },
    probability: 0.09,
  },
];

function rollEconomicEvent(currentYear) {
  for (const event of ECONOMIC_EVENTS) {
    if (roll(event.probability)) {
      return event;
    }
  }
  return null;  // no event this year
}


// ============================================================
// SECTION 9 — PLAYER STATE TEMPLATE
// ============================================================

function createNewPlayer(name) {
  return {
    name,
    age: 18,
    cash: 500,
    debt: 0,
    netWorth: 500,

    // Education
    education: ['hs'],          // starts with HS diploma
    gpa: null,                  // rolled on first year
    currentEnrollment: null,
    unlockedCareers: new Set(), // populated by education
    educationMods: [],

    // Career
    job: {
      careerId: null,
      levelIndex: 0,
      yearsAtLevel: 0,
      yearsTotal: 0,
      salary: 0,
      performanceScore: 50,
      unemployed: false,
      unemployedYears: 0,
      prevSalary: 0,
      prevCareerId: null,
      firedRecord: false,
      rsuGrant: 0,
      pensionYears: 0,
      layoffBoost: 0,
    },

    // Skills
    skills: {
      negotiation: 0,
      financial_literacy: 0,
      investment_acumen: 0,
      tech_savvy: 0,
      discipline: 0,
      creativity: 0,
      physical_labor: 0,
      charisma: 0,
    },
    skillXp: {},

    // Side gig
    sideGig: null,

    // Investments (for SECTION 5 unlocks — implement in investment module)
    portfolio: {},
    realEstate: [],

    // Flags / transient state
    flags: {
      healthIssue: false,
      familyStress: false,
      certEarned: false,
      housingMarket: 'neutral',
    },
  };
}

// Export everything for use in game HTML file
if (typeof module !== 'undefined') {
  module.exports = {
    HIGH_SCHOOL, COMMUNITY_COLLEGE_DEGREES, TRADE_SCHOOL_PROGRAMS,
    UNIVERSITY_TIERS, UNIVERSITY_MAJORS, GRAD_SCHOOLS, ONLINE_CERTS,
    CAREERS, SKILLS, SKILL_XP_RATES, SKILL_XP_THRESHOLDS, SKILL_COURSES,
    SIDE_GIGS, UNEMPLOYMENT, ECONOMIC_EVENTS, ECONOMIC_STATES,
    TAX_BRACKETS,
    calcTakeHome, rollPerformanceScore, applyPerformanceReview,
    checkPromotion, promotePlayer, generateJobOffer, negotiateOffer,
    generateCounterOffer, checkLayoff, laidOffPlayer, firePlayer,
    gainSkillXp, gainSkillLevels, advanceYear, processCareerPerks,
    rollEconomicEvent, createNewPlayer,
    findProgram, getEducationMultiplier,
    rand, randInt, clamp, roll, calcLoanPayment,
  };
}
