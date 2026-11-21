// ════════════════════════════════════════════════════════════════
//  START GAME
// ════════════════════════════════════════════════════════════════

$('btn-start').onclick=()=>{
  const name=$('inp-name').value.trim()||'Player';
  const scenarios=['broke','broke','middle','middle','middle','rich'];
  GS.scenario=pick(scenarios);
  GS.char=createChar(name, GS.scenario);
  GS.inv=createInvState();
  GS.nwHistory=[];
  GS.pendingEvents=[];
  const nw=calcNetWorth(GS.char,GS.inv);
  GS.nwHistory.push(nw);
  showScreen('game');
  updateUI({gross:GS.char.salary,taxes:0,livingCost:28000,debtPay:0,annSavings:0},0,nw);
  const scLabels={broke:'💸 You started Broke — student debt and minimum wage.',middle:'🏡 You started Middle Class — college grad with some savings.',rich:'💰 You started Wealthy — trust fund and a head start!'};
  showToast(scLabels[GS.scenario]||'Welcome!');
};

// Load save on page open (optional — commented out to always start fresh)
// if(loadGame()){ showScreen('game'); updateUI(null, 0, calcNetWorth(GS.char, GS.inv)); }

window.addEventListener('resize', drawNetWorthChart);

