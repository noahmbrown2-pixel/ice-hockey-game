'use strict';
// ─────────────────────────────────────────────
//  Agent vs Agent — autonomous brains for both fighters
// ─────────────────────────────────────────────
function pickPunch(style){
  const brawler = ['hook','hook','haymaker','bodyShot','liverShot','uppercut','cross'];
  const boxer   = ['jab','jab','cross','straight','checkHook','hook','overhand'];
  const list = (style === 'brawler') ? brawler : boxer;
  return list[Math.floor(Math.random() * list.length)];
}

// Step the agent toward (or away from) the opponent along the XZ vector.
function agentStep(me, opponent, amount){
  const dx = opponent.pos.x - me.pos.x;
  const dz = opponent.pos.z - me.pos.z;
  const len = Math.max(0.001, Math.sqrt(dx*dx + dz*dz));
  me.pos.x += (dx / len) * amount;
  me.pos.z += (dz / len) * amount;
  clampToRing(me);
}

function updateAgentBrain(me, opponent, style, dt){
  if (me.hp <= 0 || me.action === 'ko') return;
  // Always face the opponent so punches actually land.
  aimYawAt(me, opponent);

  // Per-fighter decision timer (independent of the CPU's aiTimer).
  me.agentTimer = (me.agentTimer || 0) - dt * 1000;

  // Run the punching/dodge step animations every frame (these handle their own timing).
  tickAction(me, dt);

  // Walking leg phase when moving
  if (me.agentMoving && me.action !== 'ko'){
    me.legPhase = (me.legPhase + dt * 3.8) % 1;
  }
  // Hint the animator that this fighter is "advancing" so legs animate.
  me.aiState = me.agentMoving ? 'advance' : 'idle';

  if (me.agentTimer > 0) return;

  // Detect if opponent is mid-punch (in their active strike — windup or active frame).
  const opponentAttacking = (opponent.action in PUNCH);
  // Only act when not locked in another action.
  const meCanAct = (me.action === 'idle' || me.action === 'block');

  // Reset motion flag — re-evaluated each decision.
  me.agentMoving = false;

  // Don't try to act while stunned.
  if (me.stunned){
    me.agentTimer = 200;
    return;
  }

  // If we can't act yet (mid-punch / mid-hit / dodging), wait a tiny bit.
  if (!meCanAct){
    me.agentTimer = 80;
    return;
  }

  // End a defensive block before re-evaluating.
  if (me.action === 'block') endAction(me);

  const dx = opponent.pos.x - me.pos.x;
  const dz = opponent.pos.z - me.pos.z;
  const dist = Math.sqrt(dx*dx + dz*dz);

  // Initialize combo counter on the fighter object.
  me.comboCount = me.comboCount || 0;

  // ─── STAMINA CONSERVATION: brief breathing room when truly gassed ──────────
  // Only back off below 15 (nearly empty), and only for one short pause —
  // then get right back in the fight. Fighters should stay aggressive.
  const gasThreshold = 15;
  if (me.stamina < gasThreshold){
    // Take one step back and breathe — don't block-spam, just circle out
    agentStep(me, opponent, -0.4);
    me.agentMoving = true;
    me.comboCount = 0;
    me.agentTimer = 300 + Math.random() * 150; // short breath, then back at it
    return;
  }
  // Combo length scales with stamina — still throws combos even when tired
  const maxCombo = me.stamina > 60 ? 4 : me.stamina > 30 ? 3 : 2;

  // ─── DEFENSIVE: opponent is throwing a punch — dodge or block. ───
  if (opponentAttacking){
    const r = Math.random();
    if (r < 0.70){
      // 70% chance to dodge; if dodge is on cooldown, block instead.
      if (me.dodgeCooldown <= 0) startDodge(me);
      else startAction(me, 'block');
    } else if (r < 0.85){
      startAction(me, 'block');
    }
    // else: stand pat — eat the shot but maybe counter on the next frame.
    me.comboCount = 0;
    me.agentTimer = 180 + Math.random() * 140;
    return;
  }

  // ─── AGGRESSIVE: opponent is open — get in their face and unload. ───
  if (dist > 3.0){
    // Sprint close — opponent is far away.
    agentStep(me, opponent, 0.6);
    me.agentMoving = true;
    me.agentTimer = 110;
    me.comboCount = 0;
  } else if (dist > 1.5){
    // Close the gap fast, harass with jabs to keep pressure on.
    agentStep(me, opponent, 0.45);
    me.agentMoving = true;
    if (Math.random() < 0.6) startAction(me, 'jab');
    me.agentTimer = 180 + Math.random() * 80;
    me.comboCount = 0;
  } else {
    // IN RANGE AND GUARD IS DOWN — unleash a combo burst.
    if (dist > 1.0){
      // Squeeze in even tighter for cleaner hits.
      agentStep(me, opponent, 0.12);
      me.agentMoving = true;
    }
    me.comboCount++;
    if (me.comboCount <= maxCombo){
      // Throw the next punch in the combo — rapid fire.
      startAction(me, pickPunch(style));
      // Tired fighter punches slower between shots
      const tiredness = Math.max(0, (50 - me.stamina) / 50);
      me.agentTimer = 150 + Math.random() * 100 + tiredness * 200;
    } else {
      // Brief recovery after a 4-punch combo, then resume.
      me.comboCount = 0;
      me.agentTimer = 400 + Math.random() * 200;
    }
  }
}

