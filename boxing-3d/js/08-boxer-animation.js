'use strict';
// ─────────────────────────────────────────────
//  Boxer animation
// ─────────────────────────────────────────────
const _v3 = new THREE.Vector3();

function animateBoxer(b, dt){
  const r = b.rig;
  r.root.position.x = b.pos.x;
  r.root.position.z = b.pos.z;

  // Smooth yaw turn
  let dy = b.targetYaw - b.yaw;
  while (dy > Math.PI) dy -= Math.PI * 2;
  while (dy < -Math.PI) dy += Math.PI * 2;
  b.yaw += dy * Math.min(1, dt * 10);
  r.root.rotation.y = b.yaw;

  // KO fall
  if (b.action === 'ko'){
    if (!b.koStaggered){
      const staggerT = Math.min(1, b.actionT / 0.25);
      r.root.position.x += Math.sin(b.actionT * 60) * 0.08 * (1 - staggerT);
      if (b.actionT > 0.25) b.koStaggered = true;
    }
    const t = Math.min(1, Math.max(0, (b.actionT - 0.25)) / 0.6);
    r.root.rotation.x = t * (Math.PI/2);
    r.root.position.y = -t * 0.15;
  } else {
    r.root.rotation.x = 0;
    // Toe-bounce: sin wave lifts root slightly at peak, sinks at trough
    b.bouncePhase = (b.bouncePhase || 0) + dt * 6.5; // ~6.5 rad/s ≈ 1 bounce/sec
    const bounceSin = Math.sin(b.bouncePhase);
    const bounceAmt = (bounceSin * 0.5 + 0.5); // 0→1, peaks up
    r.root.position.y = -b.kneesBent * 0.18 + bounceAmt * 0.055;
  }

  const tNow = performance.now() * 0.001;

  // Breathing & idle bob
  let breath = 0, lateralShift = 0;
  if (b.action === 'idle' && b.hp > 0){
    breath = Math.sin(tNow * 2.2) * 0.025;
    lateralShift = Math.sin(tNow * 1.4) * 0.012;
    // Boxer bob: lead shoulder slightly up-down, thoracic breathes with slight twist
    r.thoracic.rotation.y = 0.06 + Math.sin(tNow * 2.2) * 0.04;
    r.armL.shoulderGrp.rotation.z = 1.35 - Math.sin(tNow * 2.2) * 0.05;
    r.armR.shoulderGrp.rotation.z = 1.40 + Math.sin(tNow * 2.2) * 0.03;
  }
  r.chest.scale.y = 0.76 + breath * 0.28;
  r.lumbar.position.x = lateralShift;
  r.lumbar.position.z = (b._torsoShiftZ || 0);

  // Stun sway — thoracic rocks, stars orbit
  if (b.stunned){
    r.lumbar.position.x += Math.sin(tNow * 6) * 0.06;
    r.thoracic.rotation.z = Math.sin(tNow * 6) * 0.10;
    r.stunGroup.visible = true;
    for (let i = 0; i < r.stars.length; i++){
      const a = tNow * 1.2 + i * (Math.PI*2/3);
      r.stars[i].position.set(Math.cos(a) * 0.22, Math.sin(tNow * 4 + i) * 0.04, Math.sin(a) * 0.22);
    }
  } else {
    r.stunGroup.visible = false;
    if (b.action !== 'hit') r.thoracic.rotation.z = (r.thoracic.rotation.z || 0) * (1 - dt * 8);
  }

  // Forward lean — drives lumbar rotation around X (L5-S1 pivot)
  let targetLeanX = 0.06; // base forward lean = boxing crouch
  if (b.action === 'idle'){
    if (b.isPlayer){
      if (keys['w']) targetLeanX = 0.14;
      else if (keys['s']) targetLeanX = -0.06;
    } else {
      if (b.aiState === 'advance') targetLeanX = 0.12;
      else if (b.aiState === 'retreat') targetLeanX = -0.06;
    }
  }
  if (b.action in PUNCH) targetLeanX = 0.20;
  r.lumbar.rotation.x = (r.lumbar.rotation.x || 0.06) + (targetLeanX - (r.lumbar.rotation.x || 0.06)) * Math.min(1, dt * 6);

  // Spine twist + lateral weight shift during punches
  let targetSpineTwist = 0.06; // base orthodox lean
  let hipTwist = 0;
  let targetTorsoShiftZ = 0; // lateral lumbar shift toward punching side
  if (b.action in PUNCH){
    const tp = b.actionT / Math.max(0.001, b.actionDur);
    const spinePulse = Math.sin(tp * Math.PI);
    const isRear = (b.activeArm === 'rear');
    // Cross/straight/haymaker use heavy spine rotation; hook medium; jab light
    const spineScale =
      (b.action === 'cross' || b.action === 'corkscrew' || b.action === 'haymaker') ? 0.45 :
      (b.action === 'hook' || b.action === 'overhand' || b.action === 'shovelHook') ? 0.28 :
      (b.action === 'uppercut') ? 0.15 : 0.10;
    targetSpineTwist = 0.06 + spinePulse * spineScale * (isRear ? -1 : 1);
    hipTwist = spinePulse * 0.18 * (isRear ? -1 : 1);
    // Torso slides sideways toward the arm throwing the punch — weight transfer
    // lead arm (left) = local -Z side; rear arm (right) = local +Z side
    const lateralScale =
      (b.action === 'hook' || b.action === 'checkHook' || b.action === 'shovelHook') ? 0.14 :
      (b.action === 'cross' || b.action === 'haymaker' || b.action === 'overhand')   ? 0.10 :
      (b.action === 'uppercut') ? 0.08 : 0.05;
    targetTorsoShiftZ = spinePulse * lateralScale * (isRear ? 1 : -1);
  }
  if (b.action !== 'idle') r.thoracic.rotation.y = (r.thoracic.rotation.y || 0.06) + (targetSpineTwist - (r.thoracic.rotation.y || 0.06)) * Math.min(1, dt * 10);
  // Smooth the lateral shift — applied to lumbar position Z
  b._torsoShiftZ = ((b._torsoShiftZ || 0) + (targetTorsoShiftZ - (b._torsoShiftZ || 0)) * Math.min(1, dt * 9));

  // Hip counter-rotation drives the leg groups
  r.legL.hipGrp.rotation.y = hipTwist * 0.6;
  r.legR.hipGrp.rotation.y = hipTwist * 0.6;

  // ── Stepping animation — directional bipedal gait ──
  //
  // cycleL peaks +1 when left leg is in full swing (foot off ground, moving forward/sideways).
  // cycleR = -cycleL so the legs are always in opposite phases — one pushes while the other lifts.
  //
  // Travel direction decides which rotation axis drives the hip swing:
  //   forward / back  → sagittal plane: hipGrp.rotation.z  (leg swings fwd/back)
  //   left / right    → frontal plane:  hipGrp.rotation.x  (leg abducts/adducts sideways)
  // Diagonal input blends both axes proportionally.

  let moveFwd = 0, moveSide = 0;
  if (b.isPlayer){
    if (keys['w']) moveFwd  += 1;
    if (keys['s']) moveFwd  -= 1;
    if (keys['d']) moveSide += 1;
    if (keys['a']) moveSide -= 1;
  } else {
    if      (b.aiState === 'advance') moveFwd  =  1;
    else if (b.aiState === 'retreat') moveFwd  = -1;
    else if (b.aiState === 'circle') moveSide  = b.circleDir || 1;
  }
  const isMoving = b.action !== 'ko' && (moveFwd !== 0 || moveSide !== 0);

  // Dodge crouch adds a forward hip flex on top of everything else
  const hipDodgeFlex = b.kneesBent * 0.20;

  if (isMoving){
    const cycleL = Math.sin(b.legPhase * Math.PI * 2);
    const cycleR = -cycleL; // exactly opposite — legs always alternate

    const hipAmp  = 0.42; // max hip swing in radians

    // Smooth knee bend: quadratic rise on swing phase only (0 at stance, peaks at 0.52 rad)
    const kBendL = Math.max(0, cycleL) ** 2 * 0.52;
    const kBendR = Math.max(0, cycleR) ** 2 * 0.52;

    // Ankle: dorsiflexed (foot lifted) during swing, plantarflexed (push-off) during stance
    const ankleL = 0.14 - cycleL * 0.22;
    const ankleR = 0.14 - cycleR * 0.22;

    // Blend fwd vs side contribution based on input magnitudes
    const totalMag  = Math.abs(moveFwd) + Math.abs(moveSide);
    const fwdWeight = totalMag > 0 ? Math.abs(moveFwd)  / totalMag : 0;
    const sideWeight= totalMag > 0 ? Math.abs(moveSide) / totalMag : 0;
    const fwdSign   = Math.sign(moveFwd);
    const sideSign  = Math.sign(moveSide);

    // Sagittal swing (forward/back stepping) — hipGrp.rotation.z
    r.legL.hipGrp.rotation.z = cycleL * hipAmp * fwdSign * fwdWeight;
    r.legR.hipGrp.rotation.z = cycleR * hipAmp * fwdSign * fwdWeight;

    // Frontal swing (sideways stepping) — hipGrp.rotation.x + dodge crouch flex
    r.legL.hipGrp.rotation.x = hipDodgeFlex + cycleL * hipAmp * sideSign * sideWeight;
    r.legR.hipGrp.rotation.x = hipDodgeFlex + cycleR * hipAmp * sideSign * sideWeight;

    // Knee hinge (Z axis) bends on swing phase regardless of travel direction
    r.legL.kneeGrp.rotation.z = -(0.08 + kBendL);
    r.legR.kneeGrp.rotation.z = -(0.08 + kBendR);

    // Ankle
    r.legL.ankleGrp.rotation.z = ankleL;
    r.legR.ankleGrp.rotation.z = ankleR;

  } else {
    // Smoothly return hips to neutral (rest pose)
    const decay = 1 - Math.min(1, dt * 12);
    r.legL.hipGrp.rotation.z *= decay;
    r.legR.hipGrp.rotation.z *= decay;
    // Hip x blends toward dodge-flex value (0 when upright, non-zero when crouching)
    r.legL.hipGrp.rotation.x = r.legL.hipGrp.rotation.x * decay + hipDodgeFlex * (1 - decay);
    r.legR.hipGrp.rotation.x = r.legR.hipGrp.rotation.x * decay + hipDodgeFlex * (1 - decay);
    // Soft knees at rest + toe-bounce
    const kBounce = (typeof bounceAmt !== 'undefined') ? bounceAmt : 0;
    const kRest = -0.14 - b.kneesBent * 0.88 - kBounce * 0.22;
    r.legL.kneeGrp.rotation.z = kRest;
    r.legR.kneeGrp.rotation.z = kRest;
    // Ankle: plantarflexes at peak (pushing off toes), dorsiflexes at trough (landing)
    const aBase = 0.14 + b.kneesBent * 0.18 - kBounce * 0.18;
    r.legL.ankleGrp.rotation.z = aBase;
    r.legR.ankleGrp.rotation.z = aBase;
  }

  // ── Muscle bulge — scale driven by joint angle ──
  if (b.action !== 'ko'){
    for (const arm of [r.armL, r.armR]){
      const eFlex = Math.abs(arm.elbowGrp.rotation.z);
      // Bicep swells as elbow bends (hinge = anatomically correct)
      arm.bicepMesh.scale.y = 1.95 + eFlex * 0.48;
      arm.bicepMesh.scale.x = 0.80 + eFlex * 0.24;
      // Deltoid flares with shoulder abduction (deviation from neutral guard)
      const abduct = Math.max(0, Math.abs(arm.shoulderGrp.rotation.z) - 0.6);
      arm.deltoidMesh.scale.z = 1.38 + abduct * 0.34;
    }
    // Quad swells with knee flex
    const kBendL = Math.abs(r.legL.kneeGrp.rotation.z);
    const kBendR = Math.abs(r.legR.kneeGrp.rotation.z);
    r.legL.quadMesh.scale.x = 0.72 + kBendL * 0.22;
    r.legR.quadMesh.scale.x = 0.72 + kBendR * 0.22;
    // Calf swells on plantarflexion (ankle bends backward)
    const pFlex = Math.max(0, 0.14 - r.legL.ankleGrp.rotation.z);
    const pFlexR = Math.max(0, 0.14 - r.legR.ankleGrp.rotation.z);
    r.legL.calfMesh.scale.x = 0.70 + pFlex * 0.54;
    r.legR.calfMesh.scale.x = 0.70 + pFlexR * 0.54;
  }

  // ── Head tracking via atlanto-axial pivot (Y) ──
  const opp = b.isPlayer ? cpu : player;
  if (opp){
    _v3.subVectors(opp.pos, b.pos);
    const localAngle = Math.atan2(-_v3.z, _v3.x) - b.yaw;
    let la = localAngle;
    while (la > Math.PI) la -= Math.PI*2;
    while (la < -Math.PI) la += Math.PI*2;
    r.neckPivot.rotation.y = la * 0.35;
  }

  // ── Flinch — split by joint: neckNod (Z = back snap) + neckNod.x (lateral) ──
  if (b.flinch > 0 && b.action !== 'ko'){
    const ft = b.flinch;
    const jerk = Math.min(1, (0.35 - ft) / 0.15);
    const recoil = Math.max(0, 1 - jerk);
    // Z = head snaps back (atlanto-occipital nod axis)
    r.neckNod.rotation.z = -(jerk * 0.38 + recoil * 0.14);
    // X = lateral tilt from flinchDir
    r.neckNod.rotation.x = (-b.flinchDir) * (jerk * 0.22 + recoil * 0.08);
  } else {
    r.neckNod.rotation.z = (r.neckNod.rotation.z || 0) * (1 - dt * 10);
    r.neckNod.rotation.x = (r.neckNod.rotation.x || 0) * (1 - dt * 10);
  }

  // Default guard pose (resets non-punching arm each frame)
  r.setGuardPose();

  // Per-punch arm + spine animation
  if (b.action in PUNCH){
    const kind = b.action;
    const p = PUNCH[kind];
    const phase =
      (b.actionT < p.windup) ? (b.actionT / p.windup) :
      (b.actionT < p.windup + p.active) ? (1 + (b.actionT - p.windup) / Math.max(0.001, p.active)) :
      (2 + (b.actionT - p.windup - p.active) / Math.max(0.001, p.recover));
    animatePunch(b, kind, phase);
  } else if (b.action === 'block'){
    setArmPose(r.armL, { sRot:[-0.20, 0, 1.55], eRot:[0,0,1.25], pRot:[0,0.10,0], wRot:[0.05,0,0] });
    setArmPose(r.armR, { sRot:[ 0.20, 0, 1.55], eRot:[0,0,1.25], pRot:[0,0.10,0], wRot:[0.05,0,0] });
  } else if (b.action === 'hit'){
    setArmPose(r.armL, { sRot:[-0.20, 0, 1.20], eRot:[0,0,1.05], pRot:[0,-0.20,0], wRot:[0.05,0,0] });
    setArmPose(r.armR, { sRot:[ 0.20, 0, 1.20], eRot:[0,0,1.05], pRot:[0,-0.20,0], wRot:[0.05,0,0] });
  }

  // ── Upper-body slip: weave torso to the side on predictable punches ──
  // Additive onto lumbar.position.z which already carries the punch torso-shift
  if (b.weaveT > 0 && !b.stunned && b.action !== 'ko'){
    const wProg = Math.sin((1 - b.weaveT / 0.45) * Math.PI);
    r.thoracic.rotation.z += (b.weaveDir || 0) * 0.34 * wProg;
    r.lumbar.position.z   += (b.weaveDir || 0) * 0.12 * wProg;
  }

  // ── One-arm parry: raise a single arm high to deflect incoming punch ──
  if (b.parryT > 0 && b.action === 'idle' && !b.stunned){
    const pProg = Math.sin((1 - b.parryT / 0.35) * Math.PI);
    const pArm = (b.parryArm === 'L') ? r.armL : r.armR;
    pArm.shoulderGrp.rotation.z -= 0.60 * pProg;
    pArm.elbowGrp.rotation.z    += 0.28 * pProg;
  }
}

// Drive an arm by punch family + phase (0..3).
// Each joint is constrained to its anatomical axes:
//   shoulderGrp: 3-axis (ball-and-socket)
//   elbowGrp:    Z only (hinge)
//   forearmPivot:Y only (pivot = pronation/supination)
//   wristGrp:    X + Z only (condyloid)
function animatePunch(b, kind, phase){
  const r = b.rig;
  const arm = (b.activeArm === 'lead') ? r.armL : r.armR;
  const sign = (b.activeArm === 'lead') ? -1 : 1;

  const ext = (phase < 1) ? (phase * 0.25) :
              (phase < 2) ? (0.25 + 0.75 * (phase - 1)) :
              Math.max(0, 1 - (phase - 2));

  // Separate elbow timing so the joint visibly cocks then snaps straight.
  // eBend:   0→1 during windup  (elbow flexes MORE = arm cocks)
  //          1→0 during active  (elbow extends = arm launches)
  //          0   during recover
  // eStrike: 0   during windup
  //          0→1 during active  (drives extension)
  //          1→0 during recover
  const eBend   = (phase < 1) ? phase : (phase < 2) ? (2 - phase) : 0;
  const eStrike = (phase < 1) ? 0 : (phase < 2) ? (phase - 1) : Math.max(0, 1 - (phase - 2));

  const gSZ = (sign > 0 ? 1.40 : 1.35);
  const gEZ = (sign > 0 ? 1.20 : 1.05);
  const gSX = (sign > 0 ? 0.25 : -0.30);

  let sX = gSX, sY = 0, sZ = gSZ;
  let eZ = gEZ;
  let pY = -0.28;
  let wX = 0.09, wZ = 0;

  switch (kind){

    case 'jab':
    case 'straight': {
      // Shoulder sweeps forward (Y), arm stays elevated (Z drops less).
      // Elbow cocks back during windup then SNAPS straight — the key visible motion.
      sZ = gSZ - ext * 0.55;                     // arm stays fairly elevated throughout
      sY = -sign * ext * 0.85;                   // drives arm toward opponent
      sX = gSX + ext * 0.35;
      eZ = gEZ + eBend * 0.50                    // WINDUP: cocks to ~1.55 (clearly more bent)
             - eStrike * (gEZ + 0.50 - 0.08);   // STRIKE:  snaps to 0.08 (nearly straight) ✓
      pY = -0.28 + ext * 1.55;                   // supinated guard → full pronation at impact
      wX = 0.09;
      wZ = -ext * 0.08;
      break;
    }

    case 'cross': {
      // Same snap as jab but rear hand — more shoulder drive, deeper reach.
      sZ = gSZ - ext * 0.60;
      sY = -sign * ext * 1.00;
      sX = gSX + ext * 0.55;
      eZ = gEZ + eBend * 0.55
             - eStrike * (gEZ + 0.55 - 0.06);   // snaps to 0.06 ✓
      pY = -0.28 + ext * 1.70;
      wX = 0.09 - ext * 0.05;
      wZ = -ext * 0.08;
      break;
    }

    case 'hook': {
      // Elbow stays LOCKED — the bent arm SWINGS as one unit around the shoulder Y axis.
      // Elbow only tightens slightly on windup, DOES NOT straighten at impact.
      sZ = gSZ - ext * 0.70;
      sY = -sign * (0.50 + ext * 1.50);          // big horizontal sweep
      sX = gSX + ext * 0.28;
      eZ = gEZ + eBend * 0.20                    // slight extra cock on windup
             - eStrike * 0.10;                   // barely opens at impact (stays ~gEZ) ✓
      eZ = Math.max(0.90, eZ);                   // never below 90° — hook rule
      pY = -0.28 + ext * 0.50;                   // partial pronation (palm ~45°)
      wX = -0.12 * ext;
      wZ = sign * ext * 0.10;
      break;
    }

    case 'checkHook': {
      // Compact defensive hook — very tight elbow, quick snap.
      sZ = gSZ - ext * 0.45;
      sY = -sign * (0.60 + ext * 1.05);
      sX = gSX + ext * 0.15;
      eZ = gEZ + eBend * 0.15 - eStrike * 0.08;
      eZ = Math.max(1.05, eZ);
      pY = -0.28 + ext * 0.65;
      wX = -0.08 * ext;
      wZ = sign * ext * 0.12;
      break;
    }

    case 'uppercut': {
      // Elbow BENDS MORE at impact (not less). Forearm stays SUPINATED (palm toward self).
      // Shoulder dips on windup, drives UP on strike.
      sZ = gSZ - eStrike * 1.50;                // arm rises sharply only during strike
      sX = gSX - eBend * 0.45 + eStrike * 0.90; // dips back, then drives forward-up
      sY = -sign * (0.10 + ext * 0.38);
      eZ = gEZ + eBend * 0.30                   // slight cock
             + eStrike * 0.60;                  // MORE BENT at impact: gEZ+0.90 ≈ 1.95 ✓
      eZ = Math.min(1.95, eZ);
      pY = -0.28 - eBend * 0.35 - eStrike * 0.55; // stays supinated throughout ✓
      wX = -0.20 * eStrike;
      wZ = 0;
      break;
    }

    case 'overhand': {
      // Arm arcs OVER the top: shoulder cocks high on windup, crashes down-forward on strike.
      sZ = gSZ + eBend * 0.40 - eStrike * 1.10; // rises during windup, drops hard on strike
      sY = -sign * (0.22 + eBend * 0.28 + eStrike * 0.85);
      sX = gSX - eBend * 0.80 + eStrike * 1.00; // leans back on windup, crashes forward ✓
      eZ = gEZ + eBend * 0.35                   // cocks on windup
             - eStrike * (gEZ + 0.35 - 0.35);   // extends partially on crash
      pY = -0.28 - eBend * 0.20 + eStrike * 1.45;
      wX = -0.05 * eBend + 0.08 * eStrike;
      wZ = -ext * 0.06;
      break;
    }

    case 'bodyShot': {
      // Shoulder drops DOWN, elbow cocks then extends into the ribs.
      sZ = gSZ - ext * 0.80;
      sY = -sign * (0.28 + ext * 0.65);
      sX = gSX - ext * 0.55;                    // shoulder tilts downward ✓
      eZ = gEZ + eBend * 0.40
             - eStrike * (gEZ + 0.40 - 0.35);  // extends to moderate bend (arm downward)
      pY = -0.28 + ext * 1.05;
      wX = 0.18 * eStrike;                      // wrist flexes into ribs
      wZ = 0;
      break;
    }

    case 'liverShot': {
      // Drops even further, drives inward under right rib cage.
      sZ = gSZ - ext * 0.90;
      sY = -sign * (0.20 + ext * 0.60);
      sX = gSX - ext * 0.65;                    // biggest downward tilt ✓
      eZ = gEZ + eBend * 0.30
             - eStrike * (gEZ + 0.30 - 0.55);  // extends to ~0.55 (hook-into-liver bend)
      pY = -0.28 + ext * 1.20;
      wX = 0.14 * eStrike;
      wZ = sign * ext * 0.18;                   // ulnar deviation drives into liver ✓
      break;
    }

    case 'shovelHook': {
      // Diagonal between hook (horizontal) and uppercut (upward).
      // Elbow stays bent like a hook but shoulder drives diagonally upward.
      sZ = gSZ - ext * 1.10;                    // shoulder elevation drops (midway)
      sY = -sign * (0.38 + ext * 0.92);
      sX = gSX - eBend * 0.25 + eStrike * 0.60; // dips then drives diagonally up
      eZ = gEZ + eBend * 0.25
             - eStrike * 0.20;                  // barely extends — hook trait ✓
      eZ = Math.max(0.85, eZ);
      pY = -0.28 - ext * 0.12;                  // slight supination
      wX = -0.10 * eStrike;
      wZ = sign * ext * 0.10;
      break;
    }

    case 'corkscrew': {
      // Straight extension with extra forearm twist well past full pronation.
      sZ = gSZ - ext * 0.55;
      sY = -sign * ext * 0.88;
      sX = gSX + ext * 0.40;
      eZ = gEZ + eBend * 0.50
             - eStrike * (gEZ + 0.50 - 0.07);  // snaps fully straight ✓
      pY = -0.28 + ext * 2.10;                  // WAY past pronation = the corkscrew twist ✓
      wX = 0.05 - ext * 0.10;
      wZ = -sign * ext * 0.22;
      break;
    }

    case 'haymaker': {
      // Huge wind-back: shoulder cocks all the way back, then swings with full body.
      // Windup is longer and more dramatic than any other punch.
      sZ = gSZ + eBend * 0.55 - eStrike * 1.35;  // arm lifts back on windup, crashes on strike
      sY = -sign * (-0.70 * eBend + (0.90 + eStrike * 1.55)); // rotates BACK then FORWARD ✓
      sX = gSX + eBend * 0.55 - eStrike * 0.18;
      eZ = gEZ + eBend * 0.60                    // cocks DEEPLY (gEZ+0.60 ≈ 1.80)
             - eStrike * (gEZ + 0.60 - 0.10);   // crashes to 0.10 (nearly straight)
      pY = -0.28 - eBend * 0.65 + eStrike * 1.85; // supinated windup → full pronation crash ✓
      wX = -0.15 * eBend + 0.05 * eStrike;
      wZ = -sign * 0.14 * eStrike;
      break;
    }
  }

  if (eZ > 2.0) eZ = 2.0;
  if (eZ < 0)   eZ = 0;

  arm.shoulderGrp.rotation.set(sX, sY, sZ);
  arm.elbowGrp.rotation.set(0, 0, eZ);      // HINGE: only Z
  arm.forearmPivot.rotation.set(0, pY, 0);  // PIVOT: only Y
  arm.wristGrp.rotation.set(wX, 0, wZ);     // CONDYLOID: X + Z
}

