function makeLimb(radius, length, color){
  const g = new T.Group();
  const m = new T.Mesh(new T.CapsuleGeometry(radius, length, 6, 12),
                       new T.MeshStandardMaterial({ color, roughness: 0.7 }));
  m.position.y = -length/2 - radius*0.2;
  m.castShadow = true;
  g.add(m);
  return g;
}
function joint(radius, color){
  const m = new T.Mesh(new T.SphereGeometry(radius, 12, 12), new T.MeshStandardMaterial({ color, roughness: 0.6 }));
  m.castShadow = true; return m;
}

function makeFighter(cfg){
  const skin = cfg.skin, trunks = cfg.trunks, glove = cfg.glove, hair = cfg.hair;
  const root = new T.Group();          // sits on the mat, forward = +Z
  const parts = {};

  // hips — thick waist (stocky, not tiny)
  const hips = new T.Group(); hips.position.y = 0.94; root.add(hips); parts.hips = hips;
  const pelvis = new T.Mesh(new T.BoxGeometry(0.70, 0.42, 0.48), new T.MeshStandardMaterial({ color: trunks, roughness:0.85 }));
  pelvis.castShadow = true; hips.add(pelvis);

  // torso — WIDE, SHORT, square BLACK sleeveless shirt (tank silhouette)
  const torso = new T.Group(); torso.position.y = 0.14; hips.add(torso); parts.torso = torso;
  const shirtMat = new T.MeshStandardMaterial({ color: 0x141414, roughness: 0.85 });
  // Curved torso profile (radius vs height) — a lathe gives smooth, organic mass:
  //  flares at the hips, tapers slightly at the midsection, swells at the chest,
  //  expands near the shoulders ("armored"), then tucks in to the collar.
  const prof = [
    new T.Vector2(0.03, -0.02),   // bottom cap
    new T.Vector2(0.31, 0.02),
    new T.Vector2(0.345, 0.09),   // lower-torso expansion (connects to hips, stable)
    new T.Vector2(0.305, 0.20),   // midsection taper (core, not a slim waist)
    new T.Vector2(0.35, 0.33),    // chest swell (pec fullness)
    new T.Vector2(0.355, 0.45),   // upper chest
    new T.Vector2(0.365, 0.54),   // expand outward near shoulders (broad/armored)
    new T.Vector2(0.30, 0.60),    // shoulder-to-chest inward curve
    new T.Vector2(0.19, 0.64),    // taper toward the neck
    new T.Vector2(0.03, 0.66),    // top cap
  ];
  const chest = new T.Mesh(new T.LatheGeometry(prof, 32), shirtMat);
  chest.scale.set(1.28, 1, 0.82);   // wider than deep, rounded front surface
  chest.castShadow = true; torso.add(chest);
  // bare upper chest / traps showing above the sleeveless collar
  const traps = new T.Mesh(new T.SphereGeometry(0.22, 14, 12), new T.MeshStandardMaterial({ color: skin, roughness:0.6 }));
  traps.scale.set(1.15, 0.55, 0.7); traps.position.y = 0.60; torso.add(traps);

  // SHORT neck + blocky (classic Roblox) head
  const neck = new T.Mesh(new T.CylinderGeometry(0.15, 0.17, 0.05, 10), new T.MeshStandardMaterial({color:skin}));
  neck.position.y = 0.67; torso.add(neck);
  const head = new T.Group(); head.position.y = 0.82; torso.add(head); parts.head = head;
  const skull = new T.Mesh(new T.BoxGeometry(0.40, 0.40, 0.38), new T.MeshStandardMaterial({ color: skin, roughness:0.55 }));
  skull.castShadow = true; head.add(skull);
  const hairM = new T.Mesh(new T.BoxGeometry(0.42, 0.16, 0.40), new T.MeshStandardMaterial({color:hair}));
  hairM.position.y = 0.18; head.add(hairM);
  const eyeMat = new T.MeshStandardMaterial({ color: 0x111111 });
  const eL = new T.Mesh(new T.BoxGeometry(0.055,0.07,0.02), eyeMat); eL.position.set(-0.09,0.02,0.19); head.add(eL);
  const eR = eL.clone(); eR.position.x = 0.09; head.add(eR);

  // arms — broad bare shoulders + bulky upper arms & big forearms
  function arm(side){ // side -1 left, +1 right
    const sh = new T.Group(); sh.position.set(0.52*side, 0.48, 0); torso.add(sh);
    sh.add(joint(0.18, skin));                       // big deltoid (widest point)
    const upper = makeLimb(0.155, 0.28, skin); sh.add(upper);   // bulky bicep/tricep
    const el = new T.Group(); el.position.y = -0.36; upper.add(el);
    el.add(joint(0.13, skin));
    const lower = makeLimb(0.14, 0.26, skin); el.add(lower);    // thick forearm
    const gl = new T.Mesh(new T.SphereGeometry(0.155,12,12), new T.MeshStandardMaterial({ color: glove, roughness:0.5 }));
    gl.scale.set(1,1,1.15); gl.position.y = -0.34; gl.castShadow = true; lower.add(gl);
    return { sh, el };
  }
  const aL = arm(-1), aR = arm(1);
  parts.shL = aL.sh; parts.elL = aL.el; parts.shR = aR.sh; parts.elR = aR.el;

  // legs — thick & solid, stance widened to match the upper body
  function leg(side){
    const hip = new T.Group(); hip.position.set(0.27*side, -0.15, 0); hips.add(hip);
    hip.add(joint(0.17, trunks));
    const thigh = makeLimb(0.185, 0.34, skin); hip.add(thigh);
    const quad = new T.Mesh(new T.SphereGeometry(0.185,10,10), new T.MeshStandardMaterial({color:skin})); quad.scale.set(0.95,1.4,0.95); quad.position.set(0,-0.16,0.06); thigh.add(quad);
    const kn = new T.Group(); kn.position.y = -0.44; thigh.add(kn);
    kn.add(joint(0.145, skin));
    const shin = makeLimb(0.155, 0.32, skin); kn.add(shin);
    const calf = new T.Mesh(new T.SphereGeometry(0.16,10,10), new T.MeshStandardMaterial({color:skin})); calf.scale.set(0.85,1.4,0.85); calf.position.set(0,-0.12,-0.06); shin.add(calf);
    const foot = new T.Mesh(new T.BoxGeometry(0.26,0.12,0.38), new T.MeshStandardMaterial({color:0x2a1d14}));
    foot.position.set(0,-0.42,0.09); foot.castShadow = true; shin.add(foot);
    return { hip, kn, foot };
  }
  const lL = leg(-1), lR = leg(1);
  parts.hipL = lL.hip; parts.knL = lL.kn; parts.hipR = lR.hip; parts.knR = lR.kn;
  parts.footL = lL.foot; parts.footR = lR.foot;

  scene.add(root);
  return { root, parts };
}

// ─────────────────────────────────────────────
//  Strike table  (range now in world units)
// ─────────────────────────────────────────────
