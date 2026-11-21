'use strict';
// ─────────────────────────────────────────────
//  Boxer rig (3D) — anatomical joint hierarchy
//  Shoulder: ball-and-socket (3-axis)
//  Elbow: hinge (Z-axis only)
//  Forearm: pivot (Y-axis only = pronation/supination)
//  Wrist: condyloid (X + Z only)
//  Spine: lumbar (pivot at waist) + thoracic (mid-spine twist)
//  Neck: atlanto-axial pivot (Y) + atlanto-occipital nod (Z in this rig)
//  Hip: ball-and-socket per leg; Knee: hinge (Z); Ankle: hinge (Z)
// ─────────────────────────────────────────────
function createBoxer3D(opts){
  const root = new THREE.Group();
  const skinMat   = new THREE.MeshLambertMaterial({ color: opts.skin });
  const trunkMat  = new THREE.MeshLambertMaterial({ color: opts.trunks });
  const beltMat   = new THREE.MeshLambertMaterial({ color: 0xffd700 });
  const bootMat   = new THREE.MeshLambertMaterial({ color: 0x111111 });
  const gloveMat  = new THREE.MeshLambertMaterial({ color: opts.gloveColor });
  const cuffMat   = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const stripeMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
  const hairMat   = new THREE.MeshLambertMaterial({ color: 0x1a0d0d });
  const eyeMat    = new THREE.MeshBasicMaterial({ color: 0x000 });
  const detailMat = new THREE.MeshLambertMaterial({ color: 0x6a4a30 });
  const mouthMat  = new THREE.MeshLambertMaterial({ color: 0x4a1a1a });
  const laceMat   = new THREE.MeshLambertMaterial({ color: 0xffffff });

  // ═══ LEGS — hipGrp → kneeGrp (hinge Z) → ankleGrp (hinge Z) ═══
  function buildLeg(side){
    const hipGrp = new THREE.Group();
    hipGrp.position.set(0, 0.92, side * 0.145);
    root.add(hipGrp);

    // ── Upper thigh shell (trunk-colored for shorts coverage) ──
    const thighShorts = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.175, 0.36, 14), trunkMat);
    thighShorts.position.y = -0.16;
    hipGrp.add(thighShorts);

    // ── QUADRICEPS — 4-head muscle group ──
    // Rectus femoris (center front — tallest, most visible)
    const quadMesh = new THREE.Mesh(new THREE.SphereGeometry(0.125, 12, 8), skinMat);
    quadMesh.scale.set(0.72, 2.10, 0.82);
    quadMesh.position.set(0.065, -0.30, 0);
    hipGrp.add(quadMesh);
    // Vastus lateralis (outer sweep)
    const quadVL = new THREE.Mesh(new THREE.SphereGeometry(0.115, 10, 8), skinMat);
    quadVL.scale.set(0.58, 1.80, 0.90);
    quadVL.position.set(0.030, -0.28, -side * 0.115);
    hipGrp.add(quadVL);
    // Vastus medialis (inner teardrop — signature bodybuilder detail)
    const quadVM = new THREE.Mesh(new THREE.SphereGeometry(0.105, 10, 8), skinMat);
    quadVM.scale.set(0.68, 1.05, 0.92);
    quadVM.position.set(0.065, -0.44, side * 0.085);
    hipGrp.add(quadVM);

    // ── HAMSTRINGS — rear thigh mass ──
    const hamBicep = new THREE.Mesh(new THREE.SphereGeometry(0.108, 10, 8), skinMat);
    hamBicep.scale.set(0.52, 1.90, 0.88);
    hamBicep.position.set(-0.065, -0.28, -side * 0.055);
    hipGrp.add(hamBicep);
    const hamSemi = new THREE.Mesh(new THREE.SphereGeometry(0.095, 8, 6), skinMat);
    hamSemi.scale.set(0.50, 1.70, 0.80);
    hamSemi.position.set(-0.060, -0.28, side * 0.06);
    hipGrp.add(hamSemi);

    // Lower thigh taper (skin-colored, below shorts)
    const thighLower = new THREE.Mesh(new THREE.CylinderGeometry(0.150, 0.128, 0.22, 12), skinMat);
    thighLower.position.y = -0.46;
    hipGrp.add(thighLower);

    // Knee joint sphere
    const kneeSphere = new THREE.Mesh(new THREE.SphereGeometry(0.122, 12, 8), skinMat);
    kneeSphere.position.y = -0.57;
    hipGrp.add(kneeSphere);

    // ── kneeGrp — HINGE: Z axis only ──
    const kneeGrp = new THREE.Group();
    kneeGrp.position.y = -0.57;
    hipGrp.add(kneeGrp);

    // Patella (kneecap) — flat oval on the anterior face
    const kneecap = new THREE.Mesh(new THREE.SphereGeometry(0.078, 10, 8),
      new THREE.MeshLambertMaterial({ color: opts.skin }));
    kneecap.scale.set(1.0, 0.68, 1.22);
    kneecap.position.set(0.092, 0.024, 0);
    kneeGrp.add(kneecap);

    // Lower leg shell cylinder
    const calfCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.118, 0.082, 0.36, 12), skinMat);
    calfCyl.position.y = -0.18;
    kneeGrp.add(calfCyl);

    // ── GASTROCNEMIUS — diamond calf, two distinct heads ──
    const calfMesh = new THREE.Mesh(new THREE.SphereGeometry(0.105, 12, 8), skinMat);
    calfMesh.scale.set(0.70, 1.65, 0.92);
    calfMesh.position.set(-0.042, -0.155, -0.042);
    kneeGrp.add(calfMesh);
    const gastroR = new THREE.Mesh(new THREE.SphereGeometry(0.105, 12, 8), skinMat);
    gastroR.scale.set(0.70, 1.65, 0.92);
    gastroR.position.set(-0.042, -0.155, 0.042);
    kneeGrp.add(gastroR);
    // Soleus (deeper, wider — visible below gastro heads)
    const soleus = new THREE.Mesh(new THREE.SphereGeometry(0.088, 8, 6), skinMat);
    soleus.scale.set(0.75, 1.25, 1.18);
    soleus.position.set(-0.028, -0.285, 0);
    kneeGrp.add(soleus);
    // Tibialis anterior (front shin — visible stripe)
    const tibialis = new THREE.Mesh(new THREE.SphereGeometry(0.068, 8, 6), skinMat);
    tibialis.scale.set(0.60, 1.55, 0.65);
    tibialis.position.set(0.068, -0.17, 0);
    kneeGrp.add(tibialis);

    // ── ankleGrp — HINGE: Z axis only ──
    const ankleGrp = new THREE.Group();
    ankleGrp.position.y = -0.37;
    kneeGrp.add(ankleGrp);
    ankleGrp.rotation.z = 0.14;

    // Ankle knob (medial malleolus detail)
    const ankleKnob = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), skinMat);
    ankleKnob.scale.set(0.65, 0.72, 0.90);
    ankleKnob.position.set(0, -0.015, 0);
    ankleGrp.add(ankleKnob);

    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.13, 0.34), bootMat);
    boot.position.set(0.04, -0.06, 0);
    ankleGrp.add(boot);
    const bootStripe = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.022, 0.35), beltMat);
    bootStripe.position.set(0.04, -0.012, 0);
    ankleGrp.add(bootStripe);

    return { hipGrp, kneeGrp, ankleGrp, quadMesh, calfMesh };
  }
  const legLData = buildLeg(-1);
  const legRData = buildLeg(+1);
  const legL = legLData;
  const legR = legRData;

  // ═══ HIPS / BELT ═══
  const hipsGroup = new THREE.Group();
  hipsGroup.position.y = 0;
  root.add(hipsGroup);
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.215, 0.13, 16), beltMat);
  belt.position.y = 0.96;
  hipsGroup.add(belt);
  // Glutes — two large posterior spheres
  [-1,1].forEach(s => {
    const glute = new THREE.Mesh(new THREE.SphereGeometry(0.148, 12, 8), skinMat);
    glute.scale.set(0.76, 0.88, 1.05);
    glute.position.set(-0.09, 0.82, s * 0.10);
    hipsGroup.add(glute);
  });
  // Iliac crests (hip bone protrusions)
  [-1,1].forEach(s => {
    const hipCrest = new THREE.Mesh(new THREE.SphereGeometry(0.095, 10, 7), skinMat);
    hipCrest.scale.set(0.62, 0.58, 0.95);
    hipCrest.position.set(0.08, 0.93, s * 0.205);
    hipsGroup.add(hipCrest);
  });

  // ═══ SPINE — lumbar (pivot at waist y=0) → thoracic (pivot at mid-spine y=1.00) ═══
  const lumbar = new THREE.Group();
  lumbar.position.y = 0;
  root.add(lumbar);

  // Abs — 6-pack (3 rows × 2 columns of muscle spheres)
  [-1,1].forEach(s => {
    [0,1,2].forEach(i => {
      const ab = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), skinMat);
      ab.scale.set(0.80, 0.88, 0.62);
      ab.position.set(0.025, 1.215 - i * 0.092, s * 0.085);
      lumbar.add(ab);
    });
  });
  // Linea alba (center vertical groove)
  const lineaAlba = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.007, 0.285, 6), detailMat);
  lineaAlba.position.set(0.092, 1.12, 0);
  lineaAlba.rotation.z = Math.PI / 2;
  lumbar.add(lineaAlba);
  // Obliques — large angled slabs on sides of waist
  [-1,1].forEach(s => {
    const oblique = new THREE.Mesh(new THREE.SphereGeometry(0.108, 10, 8), skinMat);
    oblique.scale.set(0.58, 1.48, 0.78);
    oblique.position.set(-0.008, 1.135, s * 0.178);
    lumbar.add(oblique);
  });

  // thoracic — rotates at mid-spine for cross/hook spine twist
  const thoracic = new THREE.Group();
  thoracic.position.y = 1.00; // pivot at mid-spine in lumbar space
  lumbar.add(thoracic);

  // Lats — broad V-taper masses sweeping down from armpits
  [-1,1].forEach(s => {
    const lat = new THREE.Mesh(new THREE.SphereGeometry(0.158, 12, 8), skinMat);
    lat.scale.set(0.50, 1.60, 0.85);
    lat.position.set(-0.018, 0.235, s * 0.225);
    thoracic.add(lat);
  });
  // Serratus anterior — finger serrations below pecs
  [-1,1].forEach(s => {
    [0,1,2].forEach(i => {
      const serra = new THREE.Mesh(new THREE.SphereGeometry(0.048, 8, 6), skinMat);
      serra.scale.set(0.58, 0.38, 1.18);
      serra.position.set(0.045, 0.155 - i * 0.068, s * 0.208);
      thoracic.add(serra);
    });
  });
  // Pecs — prominent hemispherical masses (chest = left pec, breathes in animateBoxer)
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.168, 14, 10), skinMat);
  chest.scale.set(0.88, 0.76, 1.22);
  chest.position.set(0.118, 0.325, -0.088);
  thoracic.add(chest);
  const pecR = new THREE.Mesh(new THREE.SphereGeometry(0.168, 14, 10), skinMat);
  pecR.scale.set(0.88, 0.76, 1.22);
  pecR.position.set(0.118, 0.325, 0.088);
  thoracic.add(pecR);
  // Pec lower shelf (under-pec ridge)
  [-1,1].forEach(s => {
    const shelf = new THREE.Mesh(new THREE.SphereGeometry(0.102, 10, 8), skinMat);
    shelf.scale.set(0.72, 0.40, 1.08);
    shelf.position.set(0.138, 0.162, s * 0.080);
    thoracic.add(shelf);
  });
  // Sternum groove between pecs
  const sternum = new THREE.Mesh(new THREE.BoxGeometry(0.220, 0.005, 0.016), detailMat);
  sternum.position.set(0.118, 0.298, 0);
  thoracic.add(sternum);
  // Trapezius — thick traps rising toward neck
  [-1,1].forEach(s => {
    const trap = new THREE.Mesh(new THREE.SphereGeometry(0.118, 10, 8), skinMat);
    trap.scale.set(0.58, 0.88, 0.98);
    trap.position.set(-0.038, 0.485, s * 0.118);
    thoracic.add(trap);
  });

  // ═══ NECK — cylinder mesh + pivot groups for atlanto-axial (Y) and atlanto-occipital (Z) ═══
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.112, 0.14, 12), skinMat);
  neck.position.y = 0.55; // 1.00 + 0.55 = 1.55 in world
  thoracic.add(neck);
  // Sternocleidomastoid (neck muscle columns)
  [-1,1].forEach(s => {
    const scm = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 6), skinMat);
    scm.scale.set(0.55, 1.60, 0.70);
    scm.position.set(0.045, 0.55, s * 0.068);
    thoracic.add(scm);
  });

  // neckPivot: atlanto-axial joint — Y axis only (head rotation left/right)
  const neckPivot = new THREE.Group();
  neckPivot.position.y = 0.62; // 1.00 + 0.62 = 1.62 in world
  thoracic.add(neckPivot);

  // neckNod: atlanto-occipital joint — Z axis = nod (forward/back) in this rig
  const neckNod = new THREE.Group();
  neckNod.position.y = 0.06;
  neckPivot.add(neckNod);

  // ═══ HEAD ═══
  const headGroup = new THREE.Group();
  headGroup.position.y = 0.10; // neckNod y=0.06 + headGroup y=0.10 ≈ 1.78 world
  neckNod.add(headGroup);

  const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), skinMat);
  headSphere.scale.set(1.0, 1.05, 0.95);
  headGroup.add(headSphere);
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.186, 16, 10, 0, Math.PI*2, 0, Math.PI/2.3),
    hairMat
  );
  hair.scale.set(1.0, 1.0, 0.95);
  hair.position.y = 0.011;
  headGroup.add(hair);
  const earL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), skinMat);
  earL.position.set(0, 0, -0.18);
  earL.scale.set(0.5, 1, 1);
  headGroup.add(earL);
  const earR = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), skinMat);
  earR.position.set(0, 0, 0.18);
  earR.scale.set(0.5, 1, 1);
  headGroup.add(earR);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.06, 8), skinMat);
  nose.position.set(0.18, -0.02, 0);
  nose.rotation.z = -Math.PI/2;
  headGroup.add(nose);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), eyeMat);
  eyeL.position.set(0.155, 0.04, -0.06);
  headGroup.add(eyeL);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), eyeMat);
  eyeR.position.set(0.155, 0.04, 0.06);
  headGroup.add(eyeR);
  const browL = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.015, 0.05), hairMat);
  browL.position.set(0.165, 0.085, -0.06);
  browL.rotation.x = -0.15;
  headGroup.add(browL);
  const browR = browL.clone();
  browR.position.z = 0.06;
  headGroup.add(browR);
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.012, 0.06), mouthMat);
  mouth.position.set(0.166, -0.07, 0);
  headGroup.add(mouth);
  const chin = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), skinMat);
  chin.position.set(0.135, -0.13, 0);
  chin.scale.set(0.6, 0.5, 0.85);
  headGroup.add(chin);

  // ═══ ARMS — 4-group chain: shoulderGrp → elbowGrp → forearmPivot → wristGrp ═══
  // Arms attach to thoracic so they follow spine twist naturally.
  function buildArm(side){
    // shoulderGrp: ball-and-socket (3-axis)
    const shoulderGrp = new THREE.Group();
    shoulderGrp.position.set(0, 0.50, side * 0.22); // thoracic y=1.00, +0.50 = world y=1.50
    thoracic.add(shoulderGrp);

    // Upper arm cylinder (structural base)
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.080, 0.32, 12), skinMat);
    upper.position.y = -0.16;
    shoulderGrp.add(upper);
    // Bicep — tall peak sphere (scales with elbow flexion in animateBoxer)
    const bicepMesh = new THREE.Mesh(new THREE.SphereGeometry(0.100, 12, 8), skinMat);
    bicepMesh.position.set(0.042, -0.10, 0);
    bicepMesh.scale.set(0.80, 1.95, 0.85);
    shoulderGrp.add(bicepMesh);
    // Tricep — long head (back of arm)
    const triLong = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), skinMat);
    triLong.position.set(-0.055, -0.148, side * 0.022);
    triLong.scale.set(0.70, 1.65, 0.78);
    shoulderGrp.add(triLong);
    // Tricep — lateral head (horseshoe outer sweep)
    const triLat = new THREE.Mesh(new THREE.SphereGeometry(0.076, 10, 8), skinMat);
    triLat.position.set(-0.058, -0.092, side * 0.080);
    triLat.scale.set(0.65, 1.28, 0.82);
    shoulderGrp.add(triLat);
    // Deltoid — 3 heads (lateral cap = deltoidMesh for animateBoxer scaling)
    const deltoidMesh = new THREE.Mesh(new THREE.SphereGeometry(0.102, 12, 8), skinMat);
    deltoidMesh.position.set(0.005, 0.022, side * 0.122);
    deltoidMesh.scale.set(0.80, 0.70, 1.38);
    shoulderGrp.add(deltoidMesh);
    const deltFront = new THREE.Mesh(new THREE.SphereGeometry(0.086, 10, 8), skinMat);
    deltFront.position.set(0.052, 0.005, side * 0.048);
    deltFront.scale.set(0.98, 0.76, 1.02);
    shoulderGrp.add(deltFront);
    const deltRear = new THREE.Mesh(new THREE.SphereGeometry(0.080, 10, 8), skinMat);
    deltRear.position.set(-0.042, 0.005, side * 0.082);
    deltRear.scale.set(0.82, 0.72, 1.08);
    shoulderGrp.add(deltRear);

    // elbowGrp: HINGE — Z axis only (flexion/extension)
    const elbowGrp = new THREE.Group();
    elbowGrp.position.y = -0.33;
    shoulderGrp.add(elbowGrp);

    // Olecranon — posterior elbow knob
    const olecranon = new THREE.Mesh(new THREE.SphereGeometry(0.074, 10, 8), skinMat);
    olecranon.scale.set(0.76, 0.62, 1.05);
    olecranon.position.set(-0.040, 0, 0);
    elbowGrp.add(olecranon);

    // forearmPivot: PIVOT — Y axis only (pronation / supination)
    const forearmPivot = new THREE.Group();
    elbowGrp.add(forearmPivot);

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.062, 0.26, 12), skinMat);
    forearm.position.y = -0.13;
    forearmPivot.add(forearm);
    // Brachioradialis / extensor bulge (outer forearm mass)
    const extensor = new THREE.Mesh(new THREE.SphereGeometry(0.070, 10, 8), skinMat);
    extensor.scale.set(0.62, 1.52, 0.82);
    extensor.position.set(0.040, -0.075, side * 0.020);
    forearmPivot.add(extensor);

    // wristGrp: CONDYLOID — X (flex/extend) + Z (radial/ulnar deviation) only
    const wristGrp = new THREE.Group();
    wristGrp.position.y = -0.27;
    forearmPivot.add(wristGrp);

    // ─── BOXING GLOVE ───
    const gloveGroup = new THREE.Group();
    wristGrp.add(gloveGroup);

    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.10, 14), cuffMat);
    cuff.position.y = 0.10;
    gloveGroup.add(cuff);
    for (let i = 0; i < 4; i++){
      const lace = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.006, 0.005), laceMat);
      lace.position.set(0.083, 0.13 - i * 0.018, 0);
      gloveGroup.add(lace);
      const lace2 = lace.clone();
      lace2.position.x = -0.083;
      gloveGroup.add(lace2);
    }
    const fist = new THREE.Mesh(new THREE.SphereGeometry(0.155, 14, 10), gloveMat);
    fist.scale.set(1.0, 0.95, 1.05);
    fist.position.y = -0.05;
    gloveGroup.add(fist);
    const knuckle = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.10, 0.20), gloveMat);
    knuckle.position.set(0.14, -0.04, 0);
    gloveGroup.add(knuckle);
    const brand = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, 0.22), stripeMat);
    brand.position.set(-0.13, -0.01, 0);
    gloveGroup.add(brand);
    const thumb = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), gloveMat);
    thumb.scale.set(0.9, 1.2, 1.0);
    thumb.position.set(0.06, 0.02, -side * 0.12);
    gloveGroup.add(thumb);

    return { shoulderGrp, elbowGrp, forearmPivot, wristGrp, glove: gloveGroup, bicepMesh, deltoidMesh };
  }
  const armL = buildArm(-1);
  const armR = buildArm(+1);

  // ─── Default guard pose — orthodox stance ───
  function setGuardPose(){
    // Left (lead) arm: jab hand, forward and close
    armL.shoulderGrp.rotation.set(-0.30, 0, 1.35);
    armL.elbowGrp.rotation.set(0, 0, 1.05);     // HINGE: ~60° flex
    armL.forearmPivot.rotation.set(0, -0.30, 0); // PIVOT: slight supination
    armL.wristGrp.rotation.set(0.10, 0, 0);      // CONDYLOID: slight flex

    // Right (rear) arm: power hand, chin tucked
    armR.shoulderGrp.rotation.set( 0.25, 0, 1.40);
    armR.elbowGrp.rotation.set(0, 0, 1.20);     // more flexed
    armR.forearmPivot.rotation.set(0, -0.25, 0);
    armR.wristGrp.rotation.set(0.08, 0, 0);

    // Spine: slight forward lean + orthodox rotation
    lumbar.rotation.set(0.06, 0, 0);
    thoracic.rotation.set(0, 0.06, 0);
  }
  setGuardPose();

  // ─── Stun stars ───
  const stunGroup = new THREE.Group();
  stunGroup.position.y = 1.15; // relative to thoracic (1.00) = world 2.15
  stunGroup.visible = false;
  thoracic.add(stunGroup);
  const starColors = [0xfff44a, 0xffd700, 0xffe066];
  const stars = [];
  for (let i = 0; i < 3; i++){
    const s = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 8, 6),
      new THREE.MeshBasicMaterial({ color: starColors[i] })
    );
    stars.push(s);
    stunGroup.add(s);
  }

  // Shadow
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.5, 18),
    new THREE.MeshBasicMaterial({ color: 0x000, transparent: true, opacity: 0.55 })
  );
  shadow.rotation.x = -Math.PI/2;
  shadow.position.y = 0.012;
  root.add(shadow);

  return {
    root, lumbar, thoracic, headGroup, neck, neckPivot, neckNod, chest,
    armL, armR, legL, legR,
    setGuardPose, stunGroup, stars,
  };
}

// Generic per-arm pose helper — drives all 4 joints.
function setArmPose(arm, pose){
  if (pose.sRot) arm.shoulderGrp.rotation.set(pose.sRot[0], pose.sRot[1], pose.sRot[2]);
  if (pose.eRot) arm.elbowGrp.rotation.set(0, 0, pose.eRot[2]);       // HINGE: Z only
  if (pose.pRot) arm.forearmPivot.rotation.set(0, pose.pRot[1], 0);   // PIVOT: Y only
  if (pose.wRot) arm.wristGrp.rotation.set(pose.wRot[0], 0, pose.wRot[2]); // CONDYLOID
}

