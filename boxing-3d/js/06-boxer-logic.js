'use strict';
// ─────────────────────────────────────────────
//  Boxer logic
// ─────────────────────────────────────────────
function startAction(b, kind, sideOverride){
  if (b.hp <= 0) return;
  if (b.action === 'ko') return;
  if (b.stunned && kind !== 'block') return;
  if (b.action !== 'idle' && b.action !== 'block') return;
  if (kind in PUNCH){
    const p = PUNCH[kind];
    const pf = b.physicsProfile;
    const staminaCost = p.stam * (pf ? pf.staminaMult : 1);
    if (b.stamina < staminaCost * 0.5) return;
    b.stamina = Math.max(0, b.stamina - staminaCost);
    let arm;
    const handRule = PUNCH_HAND[kind];
    if (sideOverride) arm = sideOverride;
    else if (handRule === 'lead') arm = 'lead';
    else if (handRule === 'rear') arm = 'rear';
    else {
      arm = b.nextSide[kind] || 'lead';
      b.nextSide[kind] = (arm === 'lead') ? 'rear' : 'lead';
    }
    b.action = kind;
    b.actionKind = kind;
    b.actionT = 0;
    // Fatigue: only kicks in when nearly empty — subtle slowdown
    const fatigueMult = 1 + Math.max(0, (20 - b.stamina) / 20) * 0.35;
    const wMult = pf ? pf.windupMult  : 1;
    const rMult = pf ? pf.recoverMult : 1;
    b.actionDur = (p.windup * wMult + p.active + p.recover * rMult) * fatigueMult;
    b.activeArm = arm;
    b.hitFrameDone = false;
    b.punchesThrown++;
  } else if (kind === 'block'){
    b.action = 'block'; b.actionT = 0; b.actionDur = 0;
  }
}
function endAction(b){ b.action = 'idle'; b.actionT = 0; b.actionKind = null; }

function startDodge(b){
  if (b.hp <= 0 || b.action === 'ko') return;
  if (b.dodgeCooldown > 0) return;
  if (b.action !== 'idle') return;
  b.action = 'dodge';
  b.actionT = 0;
  b.actionDur = 0.38;
  // Defensive specialist: halved cooldown
  const cdMult = (b.physicsProfile && b.physicsProfile.specialRule === 'shortDodgeCd') ? 0.5 : 1;
  b.dodgeCooldown = 0.9 * cdMult;
}

function zoneForHit(attacker, kind){
  const p = PUNCH[kind];
  if (p.zone !== 'RIBS') return p.zone;
  // Shovel hook: which side of opponent's torso depending on attacker's arm.
  // Attacker's left arm hits opponent's right ribs, and vice-versa.
  return (attacker.activeArm === 'lead') ? 'RIGHT_RIBS' : 'LEFT_RIBS';
  // (Lead = left arm in orthodox stance; "left arm hits right side" of opp.)
}

function zoneColorClass(amount){
  if (amount > 28) return 'red';
  if (amount > 12) return 'yellow';
  return 'white';
}
function zoneMultiplier(amount){
  if (amount > 28) return 1.25;
  if (amount > 12) return 1.10;
  return 1.0;
}

function takeHit(target, source, kind){
  const p = PUNCH[kind];
  const zone = zoneForHit(source, kind);
  const blocked = (target.action === 'block');

  // Dodge check — crouching slips jabs/hooks/most punches; uppercut punishes
  if (!blocked && target.kneesBent > 0.5 && target.action === 'dodge'){
    if (kind !== 'uppercut'){
      spawnHitText('DODGE!', target, '#44ff88');
      return;
    }
    spawnHitText('CAUGHT!', target, '#ff8800');
  }

  let dmg = p.dmg;
  // Check-hook bonus when hitting a target mid-windup
  if (kind === 'checkHook' && target.actionKind && target.action in PUNCH){
    const tp = PUNCH[target.action];
    if (target.actionT < tp.windup) dmg += 4;
  }
  // Liver = crit modifier
  if (kind === 'liverShot') dmg += 2;
  // Pre-existing zone damage multiplier (BEFORE we add this hit)
  dmg = dmg * zoneMultiplier(target.zoneDmg[zone] || 0);

  // ── Fighter-archetype multipliers ──
  const srcPf = source.physicsProfile;
  const tgtPf = target.physicsProfile;
  if (srcPf){
    dmg *= srcPf.dmgMult || 1;
    if (srcPf.punchTypeMults && srcPf.punchTypeMults[kind] != null){
      dmg *= srcPf.punchTypeMults[kind];
    }
    // Counter-puncher: 1.8× when throwing within 250 ms of being hit
    if (srcPf.specialRule === 'counterPunch' && source.lastHitTime > 0){
      if (Date.now() - source.lastHitTime < 250) dmg *= 1.8;
    }
  }
  if (tgtPf){
    dmg *= tgtPf.damageTakenMult || 1;
  }

  if (blocked){
    const blkMult = (tgtPf && tgtPf.blockMult) ? tgtPf.blockMult : 1;
    // Higher blockMult = more damage reduction (less damage through)
    const dmgThrough = 0.18 / blkMult;
    dmg = Math.round(dmg * dmgThrough);
    target.stamina = Math.max(0, target.stamina - p.stam * 0.6 / blkMult);
    playBlock();
    spawnHitText('BLOCK', target, '#9fdcff');
  } else {
    source.punchesLanded++;
    target.flinch = 0.35;
    target.flinchDir = (Math.random() < 0.5 ? -1 : 1);
    if (target.action !== 'ko') target.action = 'hit';
    target.actionT = 0;
    target.actionDur = p.windup + 0.05;
    target.lastHitTime = Date.now();
    // Pressure fighter: extra stamina drain on opponent per landed hit
    if (srcPf && srcPf.specialRule === 'staminaDrain'){
      target.stamina = Math.max(0, target.stamina - 8);
    }
    // Slugger: big extra stun on landed bombs
    if (srcPf && srcPf.specialRule === 'sluggerStun' && (kind === 'haymaker' || kind === 'overhand' || kind === 'hook')){
      if (target.action !== 'ko'){
        target.stunned = true;
        target.stunT = Math.max(target.stunT, 1.6);
      }
    }
    // Knockback in 3D — push along the source-to-target vector (XZ plane only)
    const kbDir = new THREE.Vector3().subVectors(target.pos, source.pos);
    kbDir.y = 0;
    if (kbDir.lengthSq() < 0.0001) kbDir.set(target.facing, 0, 0);
    kbDir.normalize();
    const kbMult = (srcPf && srcPf.kbMult) ? srcPf.kbMult : 1;
    target.pos.x += kbDir.x * p.knockback * kbMult;
    target.pos.z += kbDir.z * p.knockback * kbMult;
    playHit(p.power);
    spawnHitText(p.word, target, p.col);
    if (p.power >= 3) flashAmount = Math.max(flashAmount, 0.32);
    cameraShake = Math.max(cameraShake, p.power === 1 ? 0.05 : p.power === 2 ? 0.10 : 0.18);
    target.zoneDmg[zone] = (target.zoneDmg[zone] || 0) + dmg;
    // Stun roll — 10% per clean hit
    if (Math.random() < 0.10 && target.action !== 'ko'){
      target.stunned = true;
      target.stunT = 1.4;
      spawnHitText('STUNNED!', target, '#ff5e3a');
    }
  }
  target.hp -= dmg;
  // Race mode: accumulate player's damage dealt regardless of knockdowns
  if (raceMode && !target.isPlayer) raceDamageDealt += dmg;
  if (target.hp <= 0){
    target.hp = 0;
    target.action = 'ko';
    target.actionT = 0;
    target.actionDur = 1.6;
    target.koStaggered = false;
    slowmoT = 1.5;
    flashAmount = 0.45;
    if (target.isPlayer) knockdownsPlayer++; else { knockdownsCpu++; totalCpuKnockdowns++; }
  }
}

function checkPunchHit(attacker, defender){
  if (!(attacker.action in PUNCH)) return;
  const p = PUNCH[attacker.action];
  if (attacker.actionT < p.windup || attacker.actionT > p.windup + p.active) return;
  if (attacker.hitFrameDone) return;
  // 3D distance
  const dx = defender.pos.x - attacker.pos.x;
  const dz = defender.pos.z - attacker.pos.z;
  const dist = Math.sqrt(dx*dx + dz*dz);
  const rangeMult = (attacker.physicsProfile && attacker.physicsProfile.rangeMult) || 1;
  if (dist > p.range * rangeMult) return;
  if (dist < 0.05) return;
  // Forward cone: defender must be in front of attacker (yaw-based).
  const fwdX = Math.cos(attacker.yaw);
  const fwdZ = -Math.sin(attacker.yaw); // because root.rotation.y rotates around +Y
  const dot = (dx * fwdX + dz * fwdZ);
  if (dot < 0.6 * dist) return;
  attacker.hitFrameDone = true;
  takeHit(defender, attacker, attacker.action);
}

// Set yaw so defender's forward vector points toward target.
function aimYawAt(b, target){
  const dx = target.pos.x - b.pos.x;
  const dz = target.pos.z - b.pos.z;
  // forward = (cos(yaw), -sin(yaw)).  yaw = atan2(-dz, dx)
  b.targetYaw = Math.atan2(-dz, dx);
  // initialize current facing label for legacy bits
  b.facing = (Math.cos(b.targetYaw) >= 0) ? 1 : -1;
}

function clampToRing(b){
  const r = RING_HALF - 0.4;
  if (b.pos.x >  r) b.pos.x =  r;
  if (b.pos.x < -r) b.pos.x = -r;
  if (b.pos.z >  r) b.pos.z =  r;
  if (b.pos.z < -r) b.pos.z = -r;
}

function tickPlayer(b, dt){
  aimYawAt(b, cpu);
  // Forward / right vectors based on yaw
  const fwdX = Math.cos(b.yaw),  fwdZ = -Math.sin(b.yaw);
  const rgtX = Math.sin(b.yaw),  rgtZ =  Math.cos(b.yaw);

  let fIn = 0, sIn = 0;
  if (keys['w']) fIn += 1;
  if (keys['s']) fIn -= 1;
  if (keys['a']) sIn -= 1;
  if (keys['d']) sIn += 1;

  let speed = (b.action === 'idle' || b.action === 'block') ? 2.4 : 0.6;
  if (b.stunned) speed *= 0.4;
  // Low stamina = heavy legs — only meaningful penalty below 20 (nearly empty)
  if (b.stamina < 20) speed *= 0.70 + (b.stamina / 20) * 0.30;
  // Fighter archetype movement speed
  if (b.physicsProfile && b.physicsProfile.speedMult) speed *= b.physicsProfile.speedMult;

  if (b.action !== 'ko' && b.action !== 'hit'){
    // W = approach (toward enemy = forward). S = retreat (back).
    // A/D = strafe — that's how we circle.
    b.pos.x += (fIn * fwdX + sIn * rgtX) * speed * dt;
    b.pos.z += (fIn * fwdZ + sIn * rgtZ) * speed * dt;
  }
  clampToRing(b);

  // Leg phase advances when moving
  if (b.action !== 'ko' && (fIn !== 0 || sIn !== 0)){
    b.legPhase = (b.legPhase + dt * 3.8) % 1;
  }

  if (b.action === 'block' && !keys[' ']) endAction(b);

  if ((b.action === 'idle' || b.action === 'block') && !b.stunned){
    if (keys[' ']){
      if (b.action !== 'block') startAction(b, 'block');
    } else {
      // Dodge (edge-triggered so a held key fires once)
      if (b.action === 'idle' && consumeEdge('q')) {
        startDodge(b);
      } else {
        // Edge-triggered punches so a held key only fires once.
        for (const k of PUNCH_KEYS){
          if (consumeEdge(k)){
            startAction(b, KEY_PUNCH[k]);
            break;
          }
        }
      }
    }
  } else {
    // Drain edge events that came in while we were locked out.
    for (const k of PUNCH_KEYS) keyEdge[k] = false;
  }
  tickAction(b, dt);
}

function tickAction(b, dt){
  // Always-running timers
  if (b.dodgeCooldown > 0) b.dodgeCooldown = Math.max(0, b.dodgeCooldown - dt);
  if (b.action !== 'dodge') b.kneesBent = Math.max(0, b.kneesBent - dt * 6);
  if (b.flinch > 0) b.flinch = Math.max(0, b.flinch - dt);

  // Stun timer
  if (b.stunned){
    b.stunT -= dt;
    b.stamina = Math.max(0, b.stamina - 4 * dt);
    if (b.stunT <= 0){ b.stunned = false; b.stunT = 0; }
  }

  if (b.action === 'ko'){ b.actionT += dt; return; }
  if (b.action === 'hit'){
    b.actionT += dt;
    if (b.actionT >= b.actionDur) endAction(b);
    return;
  }
  if (b.action === 'block'){
    if (b.stunned) b.stamina = Math.max(0, b.stamina - 4 * dt);
    return;
  }
  if (b.action === 'dodge'){
    b.actionT += dt;
    b.kneesBent = Math.sin((b.actionT / b.actionDur) * Math.PI);
    if (b.actionT >= b.actionDur){ b.kneesBent = 0; endAction(b); }
    return;
  }
  if (b.action in PUNCH){
    b.actionT += dt;
    if (b.actionT >= b.actionDur) endAction(b);
  }
  if (b.action === 'idle' && b.stamina < b.maxStam){
    // Regen: fast enough to sustain aggressive fighting with short pauses
    let regen = b.stunned ? 6 : 28;
    if (b.physicsProfile && b.physicsProfile.staminaRegen) regen *= b.physicsProfile.staminaRegen;
    b.stamina = Math.min(b.maxStam, b.stamina + regen * dt);
  }
  // Track low-stamina ticks for corner advice
  if (b.stamina < 30) b.lowStaminaTicks += dt;
}

// CPU AI — circling, 2D motion, varied punches.
function tickCpu(c, dt){
  aimYawAt(c, player);
  c.aiTimer    -= dt;
  c.circleTimer -= dt;
  if (c.circleTimer <= 0){
    c.circleTimer = 1.5 + Math.random() * 1.5;
    c.circleDir   = (Math.random() < 0.5 ? -1 : 1);
  }

  const dx = player.pos.x - c.pos.x;
  const dz = player.pos.z - c.pos.z;
  const dist = Math.sqrt(dx*dx + dz*dz);

  // ── Adaptive difficulty: CPU gets smarter every time it's knocked out ──
  // diffTier 0 = base, grows with each KO, capped so it's tough not impossible
  const diffTier = Math.min(4, knockdownsCpu + Math.floor(totalCpuKnockdowns * 0.5));
  const effAgg   = Math.min(0.95, c.aiAggression + diffTier * 0.10);
  const effReact = Math.min(0.95, c.aiReaction   + diffTier * 0.08);

  // ── Stun-chase: player is stunned → close in and unload combos ──
  if (player.stunned && !c.stunned && c.action !== 'ko'){
    if (dist > 0.9){
      const nx = dx / Math.max(0.001, dist), nz = dz / Math.max(0.001, dist);
      c.pos.x += nx * 2.8 * dt;
      c.pos.z += nz * 2.8 * dt;
      clampToRing(c);
      c.aiState = 'advance';
      c.legPhase = (c.legPhase + dt * 3.8) % 1;
    }
    if (dist < 1.7 && c.action === 'idle' && c.aiTimer <= 0){
      const finishers = ['hook','uppercut','cross','overhand','bodyShot','liverShot','shovelHook'];
      const useHay = Math.random() < (0.10 + diffTier * 0.05);
      startAction(c, useHay ? 'haymaker' : finishers[Math.floor(Math.random() * finishers.length)]);
      c.aiTimer = 0.12 + Math.random() * 0.10;
    }
    tickAction(c, dt);
    return;
  }

  // ── Predictable-punch reaction: slip body or raise one arm to parry ──
  // Jab/cross/straight are telegraphed → CPU can learn to weave or parry them
  const predictable = (player.action === 'jab' || player.action === 'cross' || player.action === 'straight')
    && player.actionT < (PUNCH[player.action]?.windup || 0) * 1.8;
  if (predictable && dist < 1.9 && !c.stunned){
    const slipRate  = (0.10 + diffTier * 0.09) * dt * 60;
    const parryRate = (0.07 + diffTier * 0.07) * dt * 60;
    if (c.weaveT <= 0 && Math.random() < slipRate){
      c.weaveDir = (Math.random() < 0.5 ? -1 : 1);
      c.weaveT   = 0.45;
      // At higher difficulty, immediately counter after the slip
      if (diffTier >= 2 && Math.random() < 0.5) c.aiTimer = Math.min(c.aiTimer, 0.15);
    } else if (c.parryT <= 0 && c.weaveT <= 0 && Math.random() < parryRate){
      c.parryArm = (Math.random() < 0.5 ? 'L' : 'R');
      c.parryT   = 0.35;
    }
  }
  if (c.weaveT > 0) c.weaveT = Math.max(0, c.weaveT - dt);
  if (c.parryT > 0) c.parryT = Math.max(0, c.parryT - dt);

  const playerThreatening =
    (player.action === 'hook' || player.action === 'uppercut' || player.action === 'haymaker' || player.action === 'overhand')
    && player.actionT < (PUNCH[player.action]?.windup || 0);
  if (playerThreatening && dist < 1.7 && Math.random() < effReact * dt * 60){
    if (c.dodgeCooldown <= 0 && Math.random() < (0.38 + diffTier * 0.06)) startDodge(c);
    else if (c.action === 'idle') startAction(c, 'block');
  } else if (c.action === 'block' && (!playerThreatening || dist > 2.0)){
    endAction(c);
  }

  if (c.action === 'idle' && !c.stunned){
    if (c.aiTimer <= 0){
      // Higher tier = decisions faster
      const decisionInterval = Math.max(0.15, 0.30 - diffTier * 0.04);
      c.aiTimer = decisionInterval + Math.random() * 0.5;
      if (dist > 3.0)         c.aiState = 'advance';
      else if (dist > 1.6){
        if (Math.random() < effAgg) c.aiState = (Math.random() < 0.5 ? 'advance' : 'jab');
        else c.aiState = 'circle';
      } else {
        if (c.stamina < 25) c.aiState = 'retreat';
        else {
          const r = Math.random();
          if (r < effAgg * 0.55){
            // Punch repertoire grows more dangerous with each KO tier
            const punchSets = [
              ['jab','cross','hook','uppercut','overhand','bodyShot','liverShot','straight','shovelHook','corkscrew'],
              ['cross','hook','uppercut','overhand','liverShot','straight','shovelHook','corkscrew','checkHook','jab'],
              ['hook','uppercut','overhand','liverShot','shovelHook','corkscrew','cross','checkHook','uppercut','hook'],
              ['uppercut','hook','overhand','liverShot','shovelHook','cross','corkscrew','checkHook','hook','uppercut'],
              ['uppercut','hook','liverShot','shovelHook','corkscrew','checkHook','hook','uppercut','overhand','cross'],
            ];
            const choices = punchSets[Math.min(diffTier, 4)];
            c.aiState = choices[Math.floor(Math.random() * choices.length)];
            if (Math.random() < (0.07 + diffTier * 0.03)) c.aiState = 'haymaker';
          } else if (r < 0.85) c.aiState = 'circle';
          else c.aiState = 'block-tactical';
        }
      }
    }
    // Compute movement
    let fIn = 0, sIn = 0;
    if (c.aiState === 'advance')      fIn = 1;
    else if (c.aiState === 'retreat') fIn = -1;
    else if (c.aiState === 'circle')  fIn = 0;
    else if (c.aiState in PUNCH){ startAction(c, c.aiState); }
    else if (c.aiState === 'block-tactical'){ startAction(c, 'block'); }
    // Always add a circling component
    sIn += c.circleDir * 0.7;

    const fwdX = Math.cos(c.yaw),  fwdZ = -Math.sin(c.yaw);
    const rgtX = Math.sin(c.yaw),  rgtZ =  Math.cos(c.yaw);
    let speed = 1.7;
    if (c.stunned) speed *= 0.4;
    if (c.physicsProfile && c.physicsProfile.speedMult) speed *= c.physicsProfile.speedMult;
    c.pos.x += (fIn * fwdX + sIn * rgtX) * speed * dt;
    c.pos.z += (fIn * fwdZ + sIn * rgtZ) * speed * dt;
    clampToRing(c);
    // CPU leg phase
    if ((fIn !== 0 || sIn !== 0) && c.action !== 'ko'){
      c.legPhase = (c.legPhase + dt * 3.8) % 1;
    }
  }
  tickAction(c, dt);
}

