// ════════════════════════════════════════════════════════════════
//  SCREEN MANAGEMENT
// ════════════════════════════════════════════════════════════════

function showScreen(name){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  $('screen-'+name).classList.add('active');
}

