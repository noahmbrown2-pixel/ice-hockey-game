'use strict';
// ─────────────────────────────────────────────
//  Main loop
// ─────────────────────────────────────────────
let lastT = performance.now();
function loop(now){
  requestAnimationFrame(loop);
  let dt = (now - lastT) / 1000;
  lastT = now;
  if (dt > 0.1) dt = 0.1;
  if (slowmoT > 0){ slowmoT -= dt; dt *= 0.32; }

  if (state === 'fight' && !paused) update(dt);

  if (player) animateBoxer(player, dt);
  if (cpu)    animateBoxer(cpu,    dt);

  updateHitBursts(dt);
  updateHud();
  updateCamera(dt);

  // Glove raise celebration
  if (gloveRaiseMode){
    gloveRaiseMode.t += dt;
    const winner = gloveRaiseMode.who === 'player' ? player : cpu;
    if (winner && winner.rig){
      const t = Math.min(1, gloveRaiseMode.t / 0.8);
      const eased = 1 - Math.pow(1 - t, 3);
      const rear = winner.rig.armR;
      rear.shoulderGrp.rotation.set(-0.10, -0.60, -2.60 + eased * 0.60);
      rear.elbowGrp.rotation.set(0, 0, 0.75);  // arm bent triumphantly
      rear.forearmPivot.rotation.set(0, -0.40, 0); // slight supination = fist faces crowd
      rear.wristGrp.rotation.set(-0.10, 0, 0);
    }
  }

  // Crowd backlight pulse
  back.intensity = backBaseIntensity + Math.max(0, backPulse);
  backPulse = Math.max(0, backPulse - dt * 0.8);

  // Flash
  if (flashAmount > 0){
    document.getElementById('flash').style.opacity = flashAmount;
    flashAmount = Math.max(0, flashAmount - dt * 1.6);
  } else {
    document.getElementById('flash').style.opacity = 0;
  }

  renderer.render(scene, camera);
}

// Third-person follow camera.
function updateCamera(dt){
  if (!player) return;
  // Anchor the "view subject".  Normally the player; during glove raise, the winner.
  const subject = (gloveRaiseMode && gloveRaiseMode.who === 'cpu') ? cpu : player;
  const otherFighter = (subject === player) ? cpu : player;

  // Forward (subject) → opponent direction in XZ.
  const dirX = (otherFighter.pos.x - subject.pos.x);
  const dirZ = (otherFighter.pos.z - subject.pos.z);
  const len = Math.max(0.001, Math.sqrt(dirX*dirX + dirZ*dirZ));
  const fX = dirX / len, fZ = dirZ / len;

  let backDist = 3.0;
  let upHeight = 2.2;
  let lookAhead = 0.8;
  if (gloveRaiseMode){
    backDist = 1.8;
    upHeight = 1.9;
    lookAhead = 0.0;
  }

  // Camera sits behind the subject (opposite of forward), slightly elevated.
  camDesiredPos.set(
    subject.pos.x - fX * backDist,
    subject.pos.y + upHeight,
    subject.pos.z - fZ * backDist
  );
  // Look toward the opponent / subject head height.
  camDesiredTarget.set(
    subject.pos.x + fX * lookAhead,
    subject.pos.y + 1.5,
    subject.pos.z + fZ * lookAhead
  );

  const k = Math.min(1, dt * 6);
  camPos.lerp(camDesiredPos, k);
  camTarget.lerp(camDesiredTarget, k);

  const shakeX = cameraShake > 0 ? (Math.random() - 0.5) * cameraShake : 0;
  const shakeY = cameraShake > 0 ? (Math.random() - 0.5) * cameraShake : 0;
  if (cameraShake > 0) cameraShake = Math.max(0, cameraShake - dt * 1.6);

  camera.position.set(camPos.x + shakeX, camPos.y + shakeY, camPos.z);
  camera.lookAt(camTarget);
}

function update(dt){
  roundClock -= dt;
  tickPlayer(player, dt);
  tickCpu(cpu, dt);
  checkPunchHit(player, cpu);
  checkPunchHit(cpu, player);

  // ── Clinch / body-collision ───────────────────────────────────────────────
  // BODY_RADIUS is the hard collision shell — fighters can never overlap this.
  // CLINCH_DIST is the threshold where they are genuinely too close to throw any
  // punch cleanly (shorter than the shortest active punch range ~1.2). Only at
  // that point do we call a clinch break and reset them to neutral corners.
  const BODY_RADIUS  = 0.42;
  const CLINCH_DIST  = BODY_RADIUS * 2;   // 0.84 — torsos literally touching
  const MIN_PUNCH_RANGE = 0.70;           // below this no punch can land cleanly
  if (state === 'fight' && player.hp > 0 && cpu.hp > 0){
    const cdx = player.pos.x - cpu.pos.x;
    const cdz = player.pos.z - cpu.pos.z;
    const cdist = Math.sqrt(cdx*cdx + cdz*cdz);
    if (cdist < CLINCH_DIST){
      // Push apart to resolve collision every frame
      const overlap = CLINCH_DIST - cdist;
      const nx = cdist < 0.001 ? 1 : cdx / cdist;
      const nz = cdist < 0.001 ? 0 : cdz / cdist;
      player.pos.x += nx * overlap * 0.5;
      player.pos.z += nz * overlap * 0.5;
      cpu.pos.x    -= nx * overlap * 0.5;
      cpu.pos.z    -= nz * overlap * 0.5;
    }
    // Clinch break: only when so close that no punch can reach — no cooldown timer
    if (cdist < MIN_PUNCH_RANGE){
      showBanner('CLINCH!');
      const sep = RING_HALF * 0.7;
      player.pos.x = -sep; player.pos.z = 0;
      cpu.pos.x    =  sep; cpu.pos.z    = 0;
      if (player.action in PUNCH){ player.action = 'idle'; player.actionT = 0; }
      if (cpu.action    in PUNCH){ cpu.action    = 'idle'; cpu.actionT    = 0; }
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  // Race mode: KOs don't end the round — fighters reset and keep going.
  // CPU difficulty (diffTier) keeps climbing with each knockdown.
  if (raceMode){
    if (player.hp <= 0 || cpu.hp <= 0){
      player.hp = player.maxHp || 100;
      cpu.hp    = cpu.maxHp    || 100;
      player.stunned = false; player.stunT = 0;
      cpu.stunned    = false; cpu.stunT    = 0;
      if (player.action === 'ko' || player.action === 'hit'){
        player.action = 'idle'; player.actionT = 0; player.actionKind = null;
        player.koStaggered = false;
      }
      if (cpu.action === 'ko' || cpu.action === 'hit'){
        cpu.action = 'idle'; cpu.actionT = 0; cpu.actionKind = null;
        cpu.koStaggered = false;
      }
      player.flinch = 0; cpu.flinch = 0;
      const sep = RING_HALF * 0.65;
      player.pos.x = -sep; player.pos.z = 0;
      cpu.pos.x    =  sep; cpu.pos.z    = 0;
      showBanner('KEEP GOING!');
    }
    if (roundClock <= 0){
      roundClock = 0;
      state = 'end';
      finishRace();
    }
    return;
  }

  if (player.hp <= 0 || cpu.hp <= 0){
    state = 'roundover';
    showBanner(player.hp <= 0 ? 'YOU GOT KO\'D' : 'KNOCKOUT!');
    setTimeout(roundEnd, 1700);
  } else if (roundClock <= 0){
    roundClock = 0;
    state = 'roundover';
    showBanner('END OF ROUND ' + round);
    setTimeout(roundEnd, 1100);
  }
}

function showBanner(text){
  const b = document.getElementById('round-banner');
  b.textContent = text;
  b.classList.add('show');
  setTimeout(() => b.classList.remove('show'), 1600);
}

