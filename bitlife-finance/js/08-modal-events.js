// ════════════════════════════════════════════════════════════════
//  MODAL / EVENTS
// ════════════════════════════════════════════════════════════════

function showNextEvent(){
  if(!GS.pendingEvents.length)return;
  const ev=GS.pendingEvents.shift();
  showEventModal(ev);
}

function showEventModal(ev){
  const overlay=$('modal-overlay');
  $('m-icon').textContent=ev.icon||'💬';
  const tagEl=$('m-tag');
  tagEl.textContent=ev.cat||'Event';
  tagEl.className='modal-tag '+(ev.cat==='opportunity'?'opp':ev.cat==='disaster'?'dis':ev.cat==='milestone'?'mil':ev.cat==='expense'?'exp':ev.cat==='tip'?'tip':'fla');
  $('m-title').textContent=ev.title;
  $('m-body').textContent=ev.desc;
  $('m-result').style.display='none';
  const choices=$('m-choices');choices.innerHTML='';
  for(let i=0;i<ev.choices.length;i++){
    const btn=document.createElement('button');btn.className='choice-btn';
    btn.textContent=ev.choices[i].text;
    btn.onclick=()=>resolveChoice(ev,i);
    choices.appendChild(btn);
  }
  overlay.classList.add('open');
}

function resolveChoice(ev, idx){
  const result=ev.choices[idx].fn(GS.char);
  const rEl=$('m-result');rEl.style.display='block';rEl.textContent=result;
  $('m-choices').innerHTML='<button class="choice-btn" onclick="closeModal()">Continue →</button>';
  logEvent(`${ev.title}: ${result}`, ev.cat==='disaster'?'bad':ev.cat==='opportunity'?'good':'info');
  const nw=calcNetWorth(GS.char,GS.inv);
  if(GS.nwHistory.length)GS.nwHistory[GS.nwHistory.length-1]=nw;
  updateUI(null, nw, nw);
}

function closeModal(){
  $('modal-overlay').classList.remove('open');
  $('modal-box').classList.remove('wide');
  $('modal-box').classList.remove('compact');
  if(GS.pendingEvents.length>0) setTimeout(showNextEvent,200);
}
// Esc closes the modal
document.addEventListener('keydown', e=>{
  if(e.key==='Escape' && $('modal-overlay').classList.contains('open')) closeModal();
});

