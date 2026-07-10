// ════════════════════════════════════════════════════════════════
//  FINLIFE 3D — ISLAND + PHONE OVERLAY
//  Wraps the existing game without modifying its handlers.
// ════════════════════════════════════════════════════════════════
(function(){
  'use strict';

  const $$ = id => document.getElementById(id);
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  if (isTouch) document.documentElement.classList.add('has-touch');

  // ── City grid ──
  // Avenues run N–S (along Z), spaced every 45 units.
  // Streets run E–W (along X), spaced every 45 units.
  const AVENUES = [-90, -45, 0, 45, 90];
  const STREETS = [-90, -45, 0, 45, 90];
  const AVE_W = 10, ST_W = 8, SIDEWALK_W = 1.6;
  const ISLAND_R = 120, SAND_R = 130;

  // Buildings live on lot interiors. Lot center = avenue/street midpoint + (15, 15) offset.
  const BUILDINGS = [
    { id:'home',     pos:[ 15,  15], icon:'🏠', label:'Home',         color:'#a1887f', action:'sleep' },
    { id:'bank',     pos:[ 60,  15], icon:'🏦', label:'Bank',         color:'#ffd700', action:'btn-bank' },
    { id:'stocks',   pos:[ 60,  60], icon:'📈', label:'Stock Exch.',  color:'#00c853', action:'btn-invest' },
    { id:'crypto',   pos:[ 15,  60], icon:'₿',  label:'Crypto Lab',   color:'#ffa726', action:'btn-crypto' },
    { id:'realty',   pos:[-30,  60], icon:'🏘',  label:'Realty',       color:'#4fc3f7', action:'btn-realty' },
    { id:'edu',      pos:[-30,  15], icon:'🎓', label:'University',   color:'#ce93d8', action:'btn-edu' },
    { id:'gym',      pos:[-30, -30], icon:'🏋',  label:'Gym',          color:'#ff7a8a', action:'btn-fitness' },
    // Sponsors used to be here at (15,-30) — removed: sponsor offers now arrive as
    // yellow inbox notifications (see tickSponsors below). Lot is open for fillers.
    { id:'inbox',    pos:[ 60, -30], icon:'📬', label:'Post Office',  color:'#ff3d3d', action:'btn-inbox' },
    { id:'table',    pos:[ 15, -75], icon:'📊', label:'Stadium',      color:'#7e9e7a', action:'btn-table' },
  ];

  let scene, camera, renderer, clock;
  let phoneModel = null, phoneBobT = 0;
  let workplacePos = null; // chosen filler that represents the player's office for Maps
  const player = { x:15, y:1.6, z:30, yaw:0, pitch:0 };
  const buildings3d = [];
  let nearestBuilding = null;
  let nearestStoreFiller = null;
  let initialized = false;
  let phoneOpen = false;
  let pointerLocked = false;

  const keys = {};
  let mouseDX = 0, mouseDY = 0;
  const touchMove = { active:false, dx:0, dy:0 };
  const touchLook = { active:false, lastX:0, lastY:0 };

  // ═════════ SCENE INIT ═════════
  function initScene(){
    if (initialized) return;
    initialized = true;
    if (typeof THREE === 'undefined'){
      console.error('Three.js failed to load');
      return;
    }

    const canvas = $$('world3d');
    renderer = new THREE.WebGLRenderer({ canvas, antialias:false, powerPreference:'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x9bd3ec, 80, 320);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 800);
    camera.rotation.order = 'YXZ';
    camera.position.set(player.x, player.y, player.z);
    clock = new THREE.Clock();
    scene.add(camera); // so children of camera (the carried phone) render

    resizeRenderer();

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const sun = new THREE.DirectionalLight(0xfff2c8, 0.85);
    sun.position.set(80, 120, 40);
    scene.add(sun);

    // Sky dome (vertical gradient)
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        topColor:    { value: new THREE.Color(0x4aa3df) },
        bottomColor: { value: new THREE.Color(0xffe0b3) },
      },
      vertexShader: 'varying vec3 vP; void main(){ vP=position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 topColor; uniform vec3 bottomColor; varying vec3 vP; void main(){ float h = normalize(vP).y * 0.5 + 0.5; gl_FragColor = vec4(mix(bottomColor, topColor, smoothstep(0.0, 0.65, h)), 1.0); }',
    });
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(600, 32, 16), skyMat));

    // Water
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(1500, 1500),
      new THREE.MeshBasicMaterial({ color: 0x2196f3 })
    );
    water.rotation.x = -Math.PI/2;
    water.position.y = -0.4;
    scene.add(water);

    // Sand ring
    const sand = new THREE.Mesh(
      new THREE.CircleGeometry(SAND_R, 64),
      new THREE.MeshBasicMaterial({ color: 0xead9a8 })
    );
    sand.rotation.x = -Math.PI/2;
    sand.position.y = -0.08;
    scene.add(sand);

    // Grass island
    const grass = new THREE.Mesh(
      new THREE.CircleGeometry(ISLAND_R, 64),
      new THREE.MeshBasicMaterial({ color: 0x4caf50 })
    );
    grass.rotation.x = -Math.PI/2;
    grass.position.y = 0;
    scene.add(grass);

    // City grid: roads, sidewalks, lane stripes, crosswalks
    buildCity();

    // Action buildings (the 10 interactable ones)
    for (const cfg of BUILDINGS) buildBuilding(cfg);

    // Filler buildings + corner stores fill the rest of every block (city fillers carry isCityFiller flag)
    buildFiller._cityMode = true;
    fillCity();
    buildFiller._cityMode = false;

    // Suburbs / outer ring buildings — fill the island all the way to the sand
    fillSuburbs();

    // Brand stores: assign each city filler a store, render their sign banners
    assignStoresToFillers();
    renderStoreSigns();

    // Pick a workplace filler near the center for the Maps "Work" destination
    workplacePos = chooseWorkplace();

    // Street props
    placeStreetProps();

    // Carried phone model (parented to camera)
    buildCarriedPhone();

    // A few trees on the very edge for park feel
    for (let i=0; i<24; i++){
      const r = 113 + Math.random()*4;
      const a = Math.random() * Math.PI*2;
      const x = Math.cos(a)*r, z = Math.sin(a)*r;
      buildTree(x, z);
    }

    bindInput();
    requestAnimationFrame(loop);
    if (!isTouch) $$('hud-pointerlock').classList.add('show');
  }

  // Sign canvas: front-of-building shop sign with icon + label
  function makeSignTexture(cfg){
    const c = document.createElement('canvas');
    c.width = 384; c.height = 96;
    const ctx = c.getContext('2d');
    ctx.fillStyle = cfg.color;
    ctx.fillRect(0, 0, 384, 96);
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, 378, 90);
    // icon
    ctx.font = '64px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText(cfg.icon, 56, 50);
    // label
    ctx.font = 'bold 34px Segoe UI, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText(cfg.label.toUpperCase(), 110, 52);
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    return tex;
  }

  function buildBuilding(cfg){
    if (cfg.id === 'table'){ buildStadium(cfg); return; }
    const W = 5, H = 3.5, D = 5;
    const group = new THREE.Group();

    // Variant per cfg.id — different silhouettes so each feels distinct
    const variant = cfg.id;
    const isSkyscraper = (variant === 'bank' || variant === 'stocks' || variant === 'crypto');
    const isCozy = (variant === 'home' || variant === 'realty');
    const isStadium = (variant === 'table');
    const isTall = (variant === 'edu');

    // ── Walls ──
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xf4e8d0 });
    const tier1H = isSkyscraper ? 5.5 : (isTall ? 4.5 : (isCozy ? 3.0 : H));
    const tier1W = isStadium ? 7 : W;
    const tier1D = isStadium ? 7 : D;
    const body = new THREE.Mesh(new THREE.BoxGeometry(tier1W, tier1H, tier1D), wallMat);
    body.position.y = tier1H / 2;
    group.add(body);

    // Skyscraper: add a slimmer second tier
    let topY = tier1H;
    if (isSkyscraper){
      const tier2 = new THREE.Mesh(
        new THREE.BoxGeometry(tier1W*0.7, 3.2, tier1D*0.7),
        new THREE.MeshLambertMaterial({ color: 0xe8dcc0 })
      );
      tier2.position.y = tier1H + 1.6;
      group.add(tier2);
      topY = tier1H + 3.2;
    }

    // ── Roof ──
    const roofMat = new THREE.MeshLambertMaterial({ color: cfg.color });
    if (isSkyscraper){
      // Flat parapet roof + antenna
      const parapet = new THREE.Mesh(
        new THREE.BoxGeometry(tier1W*0.72, 0.35, tier1D*0.72),
        roofMat
      );
      parapet.position.y = topY + 0.18;
      group.add(parapet);
      const antenna = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 1.6, 6),
        new THREE.MeshLambertMaterial({ color: 0x8a8a8a })
      );
      antenna.position.y = topY + 1.2;
      group.add(antenna);
    } else if (isStadium){
      // Open stadium: rim only, with bowl interior
      const rim = new THREE.Mesh(
        new THREE.BoxGeometry(tier1W*1.05, 0.3, tier1D*1.05),
        roofMat
      );
      rim.position.y = topY + 0.15;
      group.add(rim);
      // green pitch on top
      const pitch = new THREE.Mesh(
        new THREE.BoxGeometry(tier1W*0.85, 0.05, tier1D*0.85),
        new THREE.MeshLambertMaterial({ color: 0x5cb85c })
      );
      pitch.position.y = topY + 0.32;
      group.add(pitch);
    } else {
      // Pyramid roof (4-sided cone, rotated 45°)
      const r = Math.max(tier1W, tier1D) * 0.78;
      const roof = new THREE.Mesh(new THREE.ConeGeometry(r, 1.7, 4), roofMat);
      roof.position.y = topY + 0.85;
      roof.rotation.y = Math.PI / 4;
      group.add(roof);
      // Trim band at top of walls
      const trim = new THREE.Mesh(
        new THREE.BoxGeometry(tier1W + 0.15, 0.25, tier1D + 0.15),
        roofMat
      );
      trim.position.y = topY - 0.13;
      group.add(trim);
    }

    // ── Door (front face = +Z in local space) ──
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 1.7, 0.1),
      new THREE.MeshLambertMaterial({ color: 0x5d4037 })
    );
    door.position.set(0, 0.87, tier1D/2 + 0.06);
    group.add(door);
    const knob = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 6),
      new THREE.MeshLambertMaterial({ color: 0xffd700 })
    );
    knob.position.set(0.32, 0.95, tier1D/2 + 0.13);
    group.add(knob);
    // Doorstep
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.12, 0.6),
      new THREE.MeshLambertMaterial({ color: 0x9e9e9e })
    );
    step.position.set(0, 0.06, tier1D/2 + 0.32);
    group.add(step);

    // ── Windows ──
    const winMat = new THREE.MeshLambertMaterial({
      color: 0x9fdcff,
      emissive: 0x4fc3f7,
      emissiveIntensity: 0.15,
    });
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    function addWindow(x, y, z, rotY, ww=0.95, wh=0.95){
      const fr = new THREE.Mesh(new THREE.BoxGeometry(ww+0.12, wh+0.12, 0.06), frameMat);
      const w  = new THREE.Mesh(new THREE.BoxGeometry(ww, wh, 0.04), winMat);
      fr.position.set(x, y, z); fr.rotation.y = rotY;
      w.position.set(x, y, z);  w.rotation.y = rotY;
      const out = 0.05;
      if (rotY === 0)             { fr.position.z += 0.01; w.position.z += out; }
      else if (rotY === Math.PI)  { fr.position.z -= 0.01; w.position.z -= out; }
      else if (rotY ===  Math.PI/2){fr.position.x += 0.01; w.position.x += out; }
      else if (rotY === -Math.PI/2){fr.position.x -= 0.01; w.position.x -= out; }
      group.add(fr); group.add(w);
    }
    if (!isStadium){
      // Front (each side of door)
      addWindow(-1.55, 1.7, tier1D/2, 0);
      addWindow( 1.55, 1.7, tier1D/2, 0);
      // Sides
      addWindow( tier1W/2,  1.7,  1.4, Math.PI/2);
      addWindow( tier1W/2,  1.7, -1.4, Math.PI/2);
      addWindow(-tier1W/2,  1.7,  1.4,-Math.PI/2);
      addWindow(-tier1W/2,  1.7, -1.4,-Math.PI/2);
      // Back
      addWindow(-1.55, 1.7, -tier1D/2, Math.PI);
      addWindow( 1.55, 1.7, -tier1D/2, Math.PI);
      // Skyscraper: row of windows on tier 2
      if (isSkyscraper){
        for (const xz of [[-1.0, tier1D*0.35], [1.0, tier1D*0.35]]){
          addWindow(xz[0], tier1H + 1.6, xz[1] + 0.02, 0, 0.8, 0.9);
        }
        addWindow( tier1W*0.36, tier1H + 1.6, 0,  Math.PI/2, 0.8, 0.9);
        addWindow(-tier1W*0.36, tier1H + 1.6, 0, -Math.PI/2, 0.8, 0.9);
      }
    } else {
      // Stadium: vertical slits all around
      for (let i=0; i<6; i++){
        const f = (i+0.5)/6 - 0.5;
        addWindow(f*tier1W, 1.6, tier1D/2, 0, 0.4, 1.6);
        addWindow(f*tier1W, 1.6,-tier1D/2, Math.PI, 0.4, 1.6);
        addWindow( tier1W/2, 1.6, f*tier1D,  Math.PI/2, 0.4, 1.6);
        addWindow(-tier1W/2, 1.6, f*tier1D, -Math.PI/2, 0.4, 1.6);
      }
    }

    // ── Storefront sign above the door ──
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(tier1W * 0.85, 0.95),
      new THREE.MeshBasicMaterial({ map: makeSignTexture(cfg) })
    );
    sign.position.set(0, tier1H - 0.55, tier1D/2 + 0.08);
    group.add(sign);

    // Position + face-toward-island-center rotation
    group.position.set(cfg.pos[0], 0, cfg.pos[1]);
    // Building's local +Z is the front. Aim that vector at the origin.
    const yaw = Math.atan2(-cfg.pos[0], -cfg.pos[1]);
    group.rotation.y = yaw;
    scene.add(group);

    // Floating label well above the roof, visible from anywhere on the island
    const lc = document.createElement('canvas');
    lc.width = 256; lc.height = 64;
    const lctx = lc.getContext('2d');
    lctx.fillStyle = 'rgba(0,0,0,.78)';
    lctx.fillRect(0, 14, 256, 40);
    lctx.font = 'bold 24px Segoe UI, sans-serif';
    lctx.textAlign = 'center';
    lctx.fillStyle = '#ffd700';
    lctx.fillText(cfg.label, 128, 42);
    const ltex = new THREE.CanvasTexture(lc);
    const lsprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: ltex, transparent: true, depthTest: false }));
    lsprite.renderOrder = 999;
    lsprite.scale.set(4.2, 1.05, 1);
    const labelY = topY + (isSkyscraper ? 2.5 : (isStadium ? 1.6 : 2.6));
    lsprite.position.set(cfg.pos[0], labelY, cfg.pos[1]);
    scene.add(lsprite);

    buildings3d.push({
      group, label: lsprite, cfg,
      pos: new THREE.Vector3(cfg.pos[0], 0, cfg.pos[1]),
      collideR: Math.max(tier1W, tier1D) * 0.5 + 0.4,
    });
  }

  // ═════════ REAL STADIUM ═════════
  // Bowl-shaped arena: outer steel/glass shell, ribs, 3 tiered seating rings,
  // vivid green field with painted lines + goals, roof trusses, 4 floodlight
  // towers, hanging scoreboards, LED ribbon, VIP boxes, crowd, entry tunnels.
  function buildStadium(cfg){
    const group = new THREE.Group();
    const RAD = 14;          // outer radius
    const HEIGHT = 12;       // shell height
    const TEAM = cfg.color;  // primary team color (from BUILDINGS cfg)
    const AWAY = '#ff7700';  // away accent

    // ── Outer concrete/steel shell ──
    const shell = new THREE.Mesh(
      new THREE.CylinderGeometry(RAD, RAD, HEIGHT, 32, 1, true),
      new THREE.MeshLambertMaterial({ color: 0x9ca3af, side: THREE.DoubleSide })
    );
    shell.position.y = HEIGHT/2;
    group.add(shell);

    // Glass band (upper part of shell, slightly larger ring)
    const glass = new THREE.Mesh(
      new THREE.CylinderGeometry(RAD + 0.25, RAD + 0.25, 4, 32, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x4a90d9, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
    );
    glass.position.y = HEIGHT - 2;
    group.add(glass);

    // Vertical concrete ribs around the shell (every 15°)
    for (let i = 0; i < 24; i++){
      const a = (i / 24) * Math.PI * 2;
      const rib = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, HEIGHT, 0.4),
        new THREE.MeshLambertMaterial({ color: 0x6b7280 })
      );
      rib.position.set(Math.cos(a) * (RAD + 0.05), HEIGHT/2, Math.sin(a) * (RAD + 0.05));
      group.add(rib);
    }

    // Entry tunnels (4 dark openings cut into the shell)
    for (let i = 0; i < 4; i++){
      const a = (i / 4) * Math.PI * 2 + Math.PI/4;
      const tunnel = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 3.0, 0.6),
        new THREE.MeshLambertMaterial({ color: 0x1a1a1a })
      );
      tunnel.position.set(Math.cos(a) * RAD, 1.5, Math.sin(a) * RAD);
      tunnel.lookAt(0, 1.5, 0);
      group.add(tunnel);
    }

    // ── Tiered seating bowl (3 concentric rings, stepped down toward field) ──
    const TIERS = [
      { r1: 13.0, r2: 11.5, h: 4.0, y: 3.5, color: TEAM },
      { r1: 11.0, r2:  9.5, h: 2.5, y: 1.0, color: 0x1f4e79 },
      { r1:  9.0, r2:  8.0, h: 1.0, y: 0.0, color: 0x0066cc },
    ];
    for (const t of TIERS){
      const tier = new THREE.Mesh(
        new THREE.CylinderGeometry(t.r1, t.r2, t.h, 32, 1, true),
        new THREE.MeshLambertMaterial({ color: t.color, side: THREE.DoubleSide })
      );
      tier.position.y = t.y + t.h/2;
      group.add(tier);
    }

    // Concrete walkway ring around the field
    const walkway = new THREE.Mesh(
      new THREE.RingGeometry(7.5, 8.0, 32),
      new THREE.MeshLambertMaterial({ color: 0x6b7280, side: THREE.DoubleSide })
    );
    walkway.rotation.x = -Math.PI/2;
    walkway.position.y = 0.04;
    group.add(walkway);

    // ── Field ──
    const FIELD_W = 14, FIELD_D = 9;
    const fc = document.createElement('canvas');
    fc.width = 512; fc.height = 320;
    const fctx = fc.getContext('2d');
    // Striped grass
    for (let y = 0; y < 320; y += 32){
      fctx.fillStyle = ((y/32) % 2 === 0) ? '#3da043' : '#4caf50';
      fctx.fillRect(0, y, 512, 32);
    }
    // Painted lines (soccer pitch)
    fctx.strokeStyle = '#ffffff'; fctx.lineWidth = 4;
    fctx.strokeRect(8, 8, 496, 304);
    fctx.beginPath(); fctx.moveTo(256, 8); fctx.lineTo(256, 312); fctx.stroke();
    fctx.beginPath(); fctx.arc(256, 160, 50, 0, Math.PI*2); fctx.stroke();
    fctx.fillStyle = '#ffffff';
    fctx.beginPath(); fctx.arc(256, 160, 4, 0, Math.PI*2); fctx.fill();
    fctx.strokeRect(8, 60, 100, 200);     // left penalty box
    fctx.strokeRect(404, 60, 100, 200);   // right penalty box
    fctx.strokeRect(8, 100, 50, 120);     // left goal area
    fctx.strokeRect(454, 100, 50, 120);   // right goal area
    // Penalty spots
    fctx.beginPath(); fctx.arc(80, 160, 4, 0, Math.PI*2); fctx.fill();
    fctx.beginPath(); fctx.arc(432, 160, 4, 0, Math.PI*2); fctx.fill();
    const fieldTex = new THREE.CanvasTexture(fc);
    fieldTex.anisotropy = 4;
    const field = new THREE.Mesh(
      new THREE.PlaneGeometry(FIELD_W, FIELD_D),
      new THREE.MeshLambertMaterial({ map: fieldTex })
    );
    field.rotation.x = -Math.PI/2;
    field.position.y = 0.06;
    group.add(field);

    // Goals at each end
    for (const side of [-1, 1]){
      const goal = new THREE.Group();
      const post1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 1.6, 8),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
      );
      post1.position.set(0, 0.8, -1.5); goal.add(post1);
      const post2 = post1.clone(); post2.position.set(0, 0.8, 1.5); goal.add(post2);
      const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 3, 8),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
      );
      bar.rotation.x = Math.PI/2;
      bar.position.set(0, 1.6, 0);
      goal.add(bar);
      // Net (translucent)
      const net = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 1.6, 3),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 })
      );
      net.position.set(side * 0.5, 0.8, 0);
      goal.add(net);
      goal.position.set(side * (FIELD_W/2 - 0.4), 0, 0);
      group.add(goal);
    }

    // Center ball
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 6),
      new THREE.MeshLambertMaterial({ color: 0xffffff })
    );
    ball.position.set(0, 0.18, 0);
    group.add(ball);

    // Technical area benches at sidelines
    for (const side of [-1, 1]){
      const bench = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.4, 0.6),
        new THREE.MeshLambertMaterial({ color: 0x2a2a2a })
      );
      bench.position.set(0, 0.2, side * (FIELD_D/2 + 0.45));
      group.add(bench);
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(3.1, 0.05, 0.7),
        new THREE.MeshLambertMaterial({ color: TEAM })
      );
      roof.position.set(0, 1.4, side * (FIELD_D/2 + 0.45));
      group.add(roof);
    }

    // ── Roof: torus rim + radial steel trusses ──
    const roofRim = new THREE.Mesh(
      new THREE.TorusGeometry(RAD - 0.5, 0.4, 8, 32),
      new THREE.MeshLambertMaterial({ color: 0x4a4a4a })
    );
    roofRim.rotation.x = Math.PI/2;
    roofRim.position.y = HEIGHT + 0.3;
    group.add(roofRim);
    for (let i = 0; i < 16; i++){
      const a = (i / 16) * Math.PI * 2;
      const truss = new THREE.Mesh(
        new THREE.BoxGeometry(RAD - 1, 0.18, 0.12),
        new THREE.MeshLambertMaterial({ color: 0x5a5a5a })
      );
      truss.position.set(Math.cos(a) * (RAD/2 - 0.5), HEIGHT + 0.25, Math.sin(a) * (RAD/2 - 0.5));
      truss.rotation.y = a;
      group.add(truss);
    }
    // Inner roof panel ring (partial cover)
    const roofPanel = new THREE.Mesh(
      new THREE.RingGeometry(7.5, RAD - 0.5, 32),
      new THREE.MeshLambertMaterial({ color: 0x6a6a6a, side: THREE.DoubleSide, transparent: true, opacity: 0.55 })
    );
    roofPanel.rotation.x = -Math.PI/2;
    roofPanel.position.y = HEIGHT + 0.1;
    group.add(roofPanel);

    // ── 4 Floodlight towers at compass corners ──
    for (let i = 0; i < 4; i++){
      const a = (i / 4) * Math.PI * 2 + Math.PI/4;
      const x = Math.cos(a) * (RAD + 1.8);
      const z = Math.sin(a) * (RAD + 1.8);
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.18, HEIGHT + 5, 6),
        new THREE.MeshLambertMaterial({ color: 0x2c2c2c })
      );
      pole.position.set(x, (HEIGHT + 5)/2, z);
      group.add(pole);
      // Floodlight head pointing at field center
      const head = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.9, 0.5),
        new THREE.MeshLambertMaterial({ color: 0x2c2c2c })
      );
      head.position.set(x, HEIGHT + 4.4, z);
      head.lookAt(0, 5, 0);
      group.add(head);
      // Glowing lamp face
      const glow = new THREE.Mesh(
        new THREE.PlaneGeometry(1.9, 0.8),
        new THREE.MeshBasicMaterial({ color: 0xfffce0 })
      );
      glow.position.set(x * 0.96, HEIGHT + 4.4, z * 0.96);
      glow.lookAt(0, 5, 0);
      group.add(glow);
    }

    // ── Hanging scoreboards at field ends ──
    for (const side of [-1, 1]){
      const sc = document.createElement('canvas');
      sc.width = 512; sc.height = 256;
      const sctx = sc.getContext('2d');
      sctx.fillStyle = '#000000'; sctx.fillRect(0,0,512,256);
      sctx.fillStyle = '#ff7700';
      sctx.font = 'bold 56px Arial Black, sans-serif';
      sctx.textAlign = 'center'; sctx.textBaseline = 'middle';
      sctx.fillText('HOME 2 - 1 AWAY', 256, 70);
      sctx.fillStyle = '#00ff00';
      sctx.font = 'bold 96px Arial Black, sans-serif';
      sctx.fillText('45:23', 256, 160);
      sctx.fillStyle = '#ffffff';
      sctx.font = 'bold 24px Arial';
      sctx.fillText('● LIVE', 60, 30);
      sctx.fillText('1ST HALF', 256, 220);
      const scoreTex = new THREE.CanvasTexture(sc);
      const score = new THREE.Mesh(
        new THREE.PlaneGeometry(6, 3),
        new THREE.MeshBasicMaterial({ map: scoreTex })
      );
      score.position.set(side * (FIELD_W/2 + 1.2), 7, 0);
      score.rotation.y = side > 0 ? -Math.PI/2 : Math.PI/2;
      group.add(score);
      // Frame around screen
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(6.4, 3.4, 0.2),
        new THREE.MeshLambertMaterial({ color: 0x1a1a1a })
      );
      frame.position.set(side * (FIELD_W/2 + 1.3), 7, 0);
      frame.rotation.y = side > 0 ? -Math.PI/2 : Math.PI/2;
      group.add(frame);
      // Cables to roof
      for (const xo of [-2, 2]){
        const cable = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 4.5, 6),
          new THREE.MeshLambertMaterial({ color: 0x222222 })
        );
        cable.position.set(side * (FIELD_W/2 + 1.2), 9.7, xo);
        group.add(cable);
      }
    }

    // ── LED ribbon ring (animated team-color band) ──
    const ribbonCanvas = document.createElement('canvas');
    ribbonCanvas.width = 1024; ribbonCanvas.height = 32;
    const rctx = ribbonCanvas.getContext('2d');
    rctx.fillStyle = '#000'; rctx.fillRect(0, 0, 1024, 32);
    // alternating segments in team colors
    const segs = ['#ff7700', '#ffd700', '#ff3d3d', '#00c853', '#4fc3f7'];
    for (let i = 0; i < 32; i++){
      rctx.fillStyle = segs[i % segs.length];
      rctx.fillRect(i * 32, 4, 30, 24);
    }
    rctx.fillStyle = '#fff';
    rctx.font = 'bold 22px Arial Black';
    rctx.fillText('● GOAL ● GOAL ● GOAL ● GOAL ● GOAL', 30, 22);
    const ribbonTex = new THREE.CanvasTexture(ribbonCanvas);
    ribbonTex.wrapS = THREE.RepeatWrapping;
    ribbonTex.repeat.x = 4;
    const ribbon = new THREE.Mesh(
      new THREE.CylinderGeometry(RAD + 0.05, RAD + 0.05, 0.6, 32, 1, true),
      new THREE.MeshBasicMaterial({ map: ribbonTex, side: THREE.DoubleSide })
    );
    ribbon.position.y = 7.6;
    group.add(ribbon);

    // ── VIP / press boxes (glass-fronted booths high up) ──
    for (let i = 0; i < 8; i++){
      const a = (i / 8) * Math.PI * 2;
      const r = RAD - 0.3;
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 1.0, 0.7),
        new THREE.MeshLambertMaterial({ color: 0x2a2a2a })
      );
      box.position.set(Math.cos(a) * r, HEIGHT - 2, Math.sin(a) * r);
      box.lookAt(0, HEIGHT - 2, 0);
      group.add(box);
      const win = new THREE.Mesh(
        new THREE.PlaneGeometry(2.2, 0.75),
        new THREE.MeshBasicMaterial({ color: 0x9fdcff, transparent: true, opacity: 0.7 })
      );
      const inward = 0.36;
      win.position.set(Math.cos(a) * (r - inward), HEIGHT - 2, Math.sin(a) * (r - inward));
      win.lookAt(0, HEIGHT - 2, 0);
      group.add(win);
    }

    // ── Crowd dots: ~280 little colored cylinders in the seats ──
    for (let i = 0; i < 280; i++){
      const a = Math.random() * Math.PI * 2;
      // Pick a tier
      const tIdx = Math.random() < 0.45 ? 0 : (Math.random() < 0.5 ? 1 : 2);
      const t = TIERS[tIdx];
      const r = t.r2 + 0.3 + Math.random() * (t.r1 - t.r2 - 0.6);
      const y = t.y + 0.4 + Math.random() * (t.h - 0.5);
      const homeFan = Math.random() < 0.7;
      const col = homeFan ? TEAM : AWAY;
      const person = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.45, 6),
        new THREE.MeshLambertMaterial({ color: col })
      );
      person.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
      group.add(person);
      // Head
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 6, 4),
        new THREE.MeshLambertMaterial({ color: 0xf2c98a })
      );
      head.position.set(Math.cos(a) * r, y + 0.3, Math.sin(a) * r);
      group.add(head);
    }

    // ── Plaza paving around the stadium ──
    const plaza = new THREE.Mesh(
      new THREE.RingGeometry(RAD + 0.5, RAD + 4.5, 48),
      new THREE.MeshLambertMaterial({ color: 0xb8b0a0, side: THREE.DoubleSide })
    );
    plaza.rotation.x = -Math.PI/2;
    plaza.position.y = 0.02;
    group.add(plaza);

    // ── Team banner at the top of the shell facing the road ──
    const bc = document.createElement('canvas');
    bc.width = 1024; bc.height = 256;
    const bctx = bc.getContext('2d');
    bctx.fillStyle = TEAM; bctx.fillRect(0, 0, 1024, 256);
    bctx.fillStyle = '#fff';
    bctx.fillRect(0, 8, 1024, 6); bctx.fillRect(0, 242, 1024, 6);
    bctx.font = 'bold 130px Arial Black, sans-serif';
    bctx.textAlign = 'center'; bctx.textBaseline = 'middle';
    bctx.fillStyle = '#fff';
    bctx.fillText('STADIUM', 512, 128);
    const bannerTex = new THREE.CanvasTexture(bc);
    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 2.5),
      new THREE.MeshBasicMaterial({ map: bannerTex })
    );
    banner.position.set(0, HEIGHT - 1.5, RAD + 0.05);
    group.add(banner);
    const bannerBack = banner.clone();
    bannerBack.position.set(0, HEIGHT - 1.5, -(RAD + 0.05));
    bannerBack.rotation.y = Math.PI;
    group.add(bannerBack);

    // ── Floating Stadium label above ──
    const lc = document.createElement('canvas');
    lc.width = 256; lc.height = 64;
    const lctx = lc.getContext('2d');
    lctx.fillStyle = 'rgba(0,0,0,.78)';
    lctx.fillRect(0, 14, 256, 40);
    lctx.font = 'bold 24px Segoe UI, sans-serif';
    lctx.textAlign = 'center';
    lctx.fillStyle = '#ffd700';
    lctx.fillText(cfg.label, 128, 42);
    const ltex = new THREE.CanvasTexture(lc);
    const lsprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: ltex, transparent: true, depthTest: false }));
    lsprite.renderOrder = 999;
    lsprite.scale.set(4.2, 1.05, 1);
    lsprite.position.set(cfg.pos[0], HEIGHT + 6, cfg.pos[1]);
    scene.add(lsprite);

    // Position whole stadium and register for collision
    group.position.set(cfg.pos[0], 0, cfg.pos[1]);
    scene.add(group);
    buildings3d.push({
      group, label: lsprite, cfg,
      pos: new THREE.Vector3(cfg.pos[0], 0, cfg.pos[1]),
      collideR: RAD + 0.5,
    });
  }

  function buildTree(x, z){
    const group = new THREE.Group();
    const trunkH = 1.4 + Math.random() * 0.6;
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.26, trunkH, 6),
      new THREE.MeshLambertMaterial({ color: 0x6d4c2a })
    );
    trunk.position.y = trunkH / 2;
    group.add(trunk);
    const foliageH = 2.0 + Math.random() * 0.8;
    const foliage = new THREE.Mesh(
      new THREE.ConeGeometry(0.95 + Math.random()*0.25, foliageH, 7),
      new THREE.MeshLambertMaterial({ color: 0x2e7d32 })
    );
    foliage.position.y = trunkH + foliageH/2 - 0.2;
    group.add(foliage);
    // Second smaller cone for layered look
    const foliage2 = new THREE.Mesh(
      new THREE.ConeGeometry(0.7, 1.4, 7),
      new THREE.MeshLambertMaterial({ color: 0x388e3c })
    );
    foliage2.position.y = trunkH + foliageH - 0.2;
    group.add(foliage2);
    group.position.set(x, 0, z);
    group.rotation.y = Math.random() * Math.PI * 2;
    scene.add(group);
  }

  // ═════════ CITY: roads, sidewalks, lane stripes, crosswalks ═════════
  function buildCity(){
    const roadMat     = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
    const sidewalkMat = new THREE.MeshLambertMaterial({ color: 0xb0b0b0 });
    const stripeMat   = new THREE.MeshBasicMaterial({ color: 0xffe066 });
    const zebraMat    = new THREE.MeshBasicMaterial({ color: 0xf6f3ee });
    const ROAD_LEN = 220;

    function plane(geom, mat, x, y, z){
      const m = new THREE.Mesh(geom, mat);
      m.rotation.x = -Math.PI/2;
      m.position.set(x, y, z);
      scene.add(m);
      return m;
    }

    // Avenues (run along Z)
    for (const ax of AVENUES){
      plane(new THREE.PlaneGeometry(AVE_W, ROAD_LEN), roadMat, ax, 0.02, 0);
      plane(new THREE.PlaneGeometry(SIDEWALK_W, ROAD_LEN), sidewalkMat, ax - (AVE_W/2 + SIDEWALK_W/2), 0.05, 0);
      plane(new THREE.PlaneGeometry(SIDEWALK_W, ROAD_LEN), sidewalkMat, ax + (AVE_W/2 + SIDEWALK_W/2), 0.05, 0);
      // dashed yellow center
      for (let z = -ROAD_LEN/2 + 2; z < ROAD_LEN/2; z += 6){
        plane(new THREE.PlaneGeometry(0.25, 3), stripeMat, ax, 0.027, z);
      }
    }
    // Streets (run along X)
    for (const sz of STREETS){
      plane(new THREE.PlaneGeometry(ROAD_LEN, ST_W), roadMat, 0, 0.022, sz);
      plane(new THREE.PlaneGeometry(ROAD_LEN, SIDEWALK_W), sidewalkMat, 0, 0.052, sz - (ST_W/2 + SIDEWALK_W/2));
      plane(new THREE.PlaneGeometry(ROAD_LEN, SIDEWALK_W), sidewalkMat, 0, 0.052, sz + (ST_W/2 + SIDEWALK_W/2));
      for (let x = -ROAD_LEN/2 + 2; x < ROAD_LEN/2; x += 6){
        plane(new THREE.PlaneGeometry(3, 0.25), stripeMat, x, 0.028, sz);
      }
    }
    // Crosswalks at every avenue×street intersection (4 crossings each)
    for (const ax of AVENUES){
      for (const sz of STREETS){
        for (const side of [-1, 1]){
          // crossings on north/south sides of intersection (parallel to street)
          const z = sz + side * (ST_W/2 + 0.9);
          for (let i = 0; i < 5; i++){
            const cw = AVE_W * 0.85;
            const sx = ax - cw/2 + i*cw/5 + cw/10;
            plane(new THREE.PlaneGeometry(cw/5*0.65, 0.6), zebraMat, sx, 0.029, z);
          }
          // crossings on east/west sides
          const x = ax + side * (AVE_W/2 + 0.9);
          for (let i = 0; i < 5; i++){
            const cd = ST_W * 0.85;
            const sz2 = sz - cd/2 + i*cd/5 + cd/10;
            plane(new THREE.PlaneGeometry(0.6, cd/5*0.65), zebraMat, x, 0.029, sz2);
          }
        }
      }
    }
  }

  // ═════════ FILLER buildings + corner stores on every lot ═════════
  function isActionLot(cx, cz){
    for (const b of BUILDINGS){
      if (Math.abs(b.pos[0] - cx) < 18 && Math.abs(b.pos[1] - cz) < 18) return true;
    }
    return false;
  }
  const FILLER_PALETTE = [0xb98a6e, 0x8a8a8a, 0xa67c5d, 0xc7b299, 0x9a8a7a, 0x7a6f6a, 0xb6a08a, 0x807168, 0x5a4f48, 0xa6603d];

  function fillCity(){
    for (let i = 0; i < AVENUES.length-1; i++){
      for (let j = 0; j < STREETS.length-1; j++){
        const x0 = AVENUES[i] + AVE_W/2 + SIDEWALK_W;
        const x1 = AVENUES[i+1] - AVE_W/2 - SIDEWALK_W;
        const z0 = STREETS[j] + ST_W/2 + SIDEWALK_W;
        const z1 = STREETS[j+1] - ST_W/2 - SIDEWALK_W;
        const cx = (x0+x1)/2, cz = (z0+z1)/2;

        // Corner store at the SW corner of every lot — covers all corners across the grid
        buildCornerStore(x0 + 3, z0 + 3, FILLER_PALETTE[(i+j) % FILLER_PALETTE.length]);

        // Skip filler if this lot hosts an action building
        if (isActionLot(cx, cz)) continue;

        // Pack 6 filler towers per non-action lot — N/S/E/W edges + 2 interior
        const slots = [
          [x0 + 6, z0 + 9],         // SW
          [x1 - 6, z0 + 9],         // SE
          [x0 + 6, z1 - 9],         // NW
          [x1 - 6, z1 - 9],         // NE
          [cx, z0 + 6],             // S center
          [cx, z1 - 6],             // N center
        ];
        for (const [fx, fz] of slots){
          const jitter = () => (Math.random() - 0.5) * 1.6;
          const w = 5 + Math.random()*4;
          const d = 5 + Math.random()*4;
          const h = 7 + Math.random()*22;
          buildFiller(fx + jitter(), fz + jitter(), w, d, h, FILLER_PALETTE[Math.floor(Math.random()*FILLER_PALETTE.length)]);
        }
      }
    }
  }

  // ═════════ SUBURBS — fill the green ring outside the city grid ═════════
  function fillSuburbs(){
    const innerR = 95;            // start just outside the 90-line grid
    const outerR = ISLAND_R - 6;  // leave a thin park strip at the water
    const minSpacing = 7.0;
    const placed = []; // local list for spacing checks

    function tooClose(x, z){
      // existing buildings (action + grid fillers + corner stores)
      for (const b of buildings3d){
        if (Math.hypot(x - b.pos.x, z - b.pos.z) < (b.collideR || 3) + 4) return true;
      }
      // other suburbs we just placed
      for (const p of placed){
        if (Math.hypot(x - p[0], z - p[1]) < minSpacing) return true;
      }
      return false;
    }

    // A few curved access roads connecting the grid to the suburbs
    const accessRoadMat = new THREE.MeshLambertMaterial({ color: 0x2e2e2e });
    for (let k = 0; k < 8; k++){
      const a = (k / 8) * Math.PI * 2 + Math.PI/16;
      const r0 = 92, r1 = ISLAND_R - 4;
      const segments = 8;
      for (let s = 0; s < segments; s++){
        const t  = s / segments;
        const t1 = (s+1) / segments;
        const r  = r0 + (r1 - r0) * t;
        const r2 = r0 + (r1 - r0) * t1;
        const x1s = Math.cos(a)*r, z1s = Math.sin(a)*r;
        const x2s = Math.cos(a)*r2, z2s = Math.sin(a)*r2;
        const cx = (x1s+x2s)/2, cz = (z1s+z2s)/2;
        const len = Math.hypot(x2s-x1s, z2s-z1s);
        const ang = Math.atan2(z2s-z1s, x2s-x1s);
        const seg = new THREE.Mesh(new THREE.PlaneGeometry(len + 0.2, 4), accessRoadMat);
        seg.rotation.x = -Math.PI/2;
        seg.rotation.z = -ang;
        seg.position.set(cx, 0.018, cz);
        scene.add(seg);
      }
    }

    // Pack random small buildings in the ring
    let attempts = 0, total = 0, max = 220;
    while (total < max && attempts < max * 6){
      attempts++;
      const r = innerR + Math.random() * (outerR - innerR);
      const a = Math.random() * Math.PI * 2;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (tooClose(x, z)) continue;
      // Mostly small brownstones, a few mid-rises
      const isMid = Math.random() < 0.18;
      const w = isMid ? (5 + Math.random()*3)  : (3.4 + Math.random()*2);
      const d = isMid ? (5 + Math.random()*3)  : (3.4 + Math.random()*2);
      const h = isMid ? (12 + Math.random()*16) : (4 + Math.random()*6);
      buildFiller(x, z, w, d, h, FILLER_PALETTE[Math.floor(Math.random()*FILLER_PALETTE.length)]);
      placed.push([x, z]);
      total++;
    }
  }

  // Pick a city-center filler that will represent the player's office on Maps.
  function chooseWorkplace(){
    // Use a building near (45, 0) — the avenue between Bank lot and the central lot.
    let best = null, bestD = Infinity;
    const target = { x: 45, z: 0 };
    for (const b of buildings3d){
      if (!b.isFiller || b.cfg) continue;
      const d = Math.hypot(b.pos.x - target.x, b.pos.z - target.z);
      if (d < bestD){ bestD = d; best = b; }
    }
    if (best) return { x: best.pos.x, z: best.pos.z };
    return { x: 45, z: 0 };
  }

  function buildFiller(cx, cz, w, d, h, col){
    // Window-row texture
    const c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#' + col.toString(16).padStart(6,'0');
    ctx.fillRect(0, 0, 64, 64);
    for (let r = 0; r < 4; r++){
      for (let c2 = 0; c2 < 4; c2++){
        ctx.fillStyle = (Math.random() < 0.7) ? '#ffe7a0' : '#3a4660';
        ctx.fillRect(8 + c2*14, 8 + r*14, 8, 10);
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(Math.max(1, Math.round(w/3)), Math.max(2, Math.round(h/3)));
    tex.magFilter = THREE.NearestFilter;

    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshLambertMaterial({ map: tex })
    );
    wall.position.set(cx, h/2, cz);
    scene.add(wall);
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.4, 0.4, d + 0.4),
      new THREE.MeshLambertMaterial({ color: 0x3a3a3a })
    );
    roof.position.set(cx, h + 0.2, cz);
    scene.add(roof);
    // Rooftop water tower (NYC signature)
    if (Math.random() < 0.45){
      const tank = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.55, 1.0, 12),
        new THREE.MeshLambertMaterial({ color: 0x6b4a32 })
      );
      tank.position.set(cx + (Math.random()-0.5)*1.5, h + 1.0, cz + (Math.random()-0.5)*1.5);
      scene.add(tank);
      const top = new THREE.Mesh(
        new THREE.ConeGeometry(0.6, 0.5, 12),
        new THREE.MeshLambertMaterial({ color: 0x4a3422 })
      );
      top.position.copy(tank.position); top.position.y += 0.7;
      scene.add(top);
    }
    // Track for collision (no interaction)
    const fillerEntry = {
      group: wall, label: null, cfg: null,
      pos: new THREE.Vector3(cx, 0, cz),
      collideR: Math.max(w, d) * 0.55,
      isFiller: true,
      isCityFiller: !!buildFiller._cityMode,
    };
    buildings3d.push(fillerEntry);
  }

  function buildCornerStore(cx, cz, awningColor){
    const group = new THREE.Group();
    const W = 5, H = 4, D = 5;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(W, H, D),
      new THREE.MeshLambertMaterial({ color: 0xc57b57 })
    );
    body.position.y = H/2;
    group.add(body);

    // Striped awning
    const ac = document.createElement('canvas');
    ac.width = 64; ac.height = 16;
    const acx = ac.getContext('2d');
    for (let i = 0; i < 8; i++){
      acx.fillStyle = (i & 1) ? '#ffffff' : '#' + awningColor.toString(16).padStart(6, '0');
      acx.fillRect(i*8, 0, 8, 16);
    }
    const awTex = new THREE.CanvasTexture(ac);
    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(W * 0.95, 0.22, 1.3),
      new THREE.MeshLambertMaterial({ map: awTex })
    );
    awning.position.set(0, 2.7, D/2 + 0.6);
    awning.rotation.x = -0.12;
    group.add(awning);

    // Sign
    const sigC = document.createElement('canvas');
    sigC.width = 256; sigC.height = 64;
    const sctx = sigC.getContext('2d');
    sctx.fillStyle = '#1a1a1a'; sctx.fillRect(0, 0, 256, 64);
    const names = ['DELI','BODEGA','PIZZA','MARKET','DINER','LAUNDRY','COFFEE','LIQUOR','BAGELS','GROCER','BARBER','RAMEN'];
    sctx.font = 'bold 36px Arial Black, sans-serif';
    sctx.textAlign = 'center'; sctx.textBaseline = 'middle';
    sctx.fillStyle = '#ffe066';
    sctx.fillText(names[Math.floor(Math.random()*names.length)], 128, 34);
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(W * 0.85, 0.7),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sigC) })
    );
    sign.position.set(0, 3.4, D/2 + 0.04);
    group.add(sign);

    // Door + window
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 1.6, 0.05),
      new THREE.MeshLambertMaterial({ color: 0x4f342a })
    );
    door.position.set(-1.2, 0.8, D/2 + 0.03);
    group.add(door);
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 1.4, 0.04),
      new THREE.MeshLambertMaterial({ color: 0xa9d6e8, emissive: 0x4fc3f7, emissiveIntensity: 0.18 })
    );
    win.position.set(1.0, 1.4, D/2 + 0.03);
    group.add(win);

    group.position.set(cx, 0, cz);
    // Face the nearest road
    group.rotation.y = (Math.abs(cx) > Math.abs(cz)) ? (cx > 0 ? -Math.PI/2 : Math.PI/2) : (cz > 0 ? 0 : Math.PI);
    scene.add(group);

    buildings3d.push({
      group, label: null, cfg: null,
      pos: new THREE.Vector3(cx, 0, cz),
      collideR: Math.max(W, D) * 0.55,
      isFiller: true,
    });
  }

  // ═════════ STREET PROPS ═════════
  function placeStreetProps(){
    // Lamps along avenues every 12 units, both sidewalks
    for (const ax of AVENUES){
      for (let z = -100; z <= 100; z += 12){
        buildLamp(ax + AVE_W/2 + SIDEWALK_W * 0.5, z);
        buildLamp(ax - AVE_W/2 - SIDEWALK_W * 0.5, z);
      }
    }
    // Hydrants at every intersection
    for (const ax of AVENUES){
      for (const sz of STREETS){
        const hx = ax + AVE_W/2 + SIDEWALK_W * 0.5;
        const hz = sz + ST_W/2 + SIDEWALK_W * 0.5;
        const h = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.22, 0.7, 8),
          new THREE.MeshLambertMaterial({ color: 0xc62828 })
        );
        h.position.set(hx, 0.35, hz);
        scene.add(h);
      }
    }
  }

  function buildLamp(x, z){
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.10, 4.6, 6),
      new THREE.MeshLambertMaterial({ color: 0x1f1f1f })
    );
    post.position.set(x, 2.3, z);
    scene.add(post);
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xfff2a8 })
    );
    lamp.position.set(x, 4.7, z);
    scene.add(lamp);
  }

  // ═════════ CARRIED PHONE (lower-right of view) ═════════
  function buildCarriedPhone(){
    phoneModel = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.075, 0.135, 0.012),
      new THREE.MeshLambertMaterial({ color: 0x111111 })
    );
    phoneModel.add(body);
    // Screen canvas — mini phone home screen with 6 app icons
    const sc = document.createElement('canvas');
    sc.width = 128; sc.height = 232;
    const sctx = sc.getContext('2d');
    sctx.fillStyle = '#0a1a0a'; sctx.fillRect(0, 0, 128, 232);
    sctx.fillStyle = '#ffd700'; sctx.font = 'bold 14px sans-serif';
    sctx.textAlign = 'center'; sctx.fillText('FinLife', 64, 22);
    const apps = [
      ['❤',  '#ff7a8a'], ['$',  '#ffd700'], ['🏢', '#ce93d8'],
      ['💼', '#ffa726'], ['📈', '#00c853'], ['🏠', '#26c6da'],
    ];
    for (let i = 0; i < 6; i++){
      const r = Math.floor(i/3), c = i%3;
      const ix = 14 + c*36, iy = 50 + r*48;
      sctx.fillStyle = apps[i][1];
      sctx.fillRect(ix, iy, 28, 28);
      sctx.font = '20px serif'; sctx.textBaseline = 'middle'; sctx.fillStyle = '#000';
      sctx.fillText(apps[i][0], ix + 14, iy + 17);
    }
    sctx.fillStyle = '#ffd700'; sctx.font = 'bold 11px sans-serif';
    sctx.fillText('Press E', 64, 215);
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.062, 0.122),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc) })
    );
    screen.position.z = 0.0066;
    phoneModel.add(screen);

    // Position in lower-right of view
    phoneModel.position.set(0.17, -0.13, -0.34);
    phoneModel.rotation.set(-0.22, -0.42, -0.12);
    camera.add(phoneModel);
  }

  function resizeRenderer(){
    if (!renderer) return;
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    if (camera){ camera.aspect = w/h; camera.updateProjectionMatrix(); }
  }

  // ═════════ INPUT ═════════
  function bindInput(){
    window.addEventListener('keydown', e => {
      // If a phone-app iframe has focus, route keys to that iframe (not FinLife).
      if (blockTradeIframe && document.activeElement === blockTradeIframe) return;
      if (wordleIframe && document.activeElement === wordleIframe) return;
      if (blockBlastIframe && document.activeElement === blockBlastIframe) return;
      const k = (e.key || '').toLowerCase();
      keys[k] = true;
      if (k === 'e'){ e.preventDefault(); togglePhone(); }
      else if (k === 'tab'){ e.preventDefault(); togglePhone(); } // legacy compatibility
      else if (k === 'f' && !phoneOpen) interact();
      else if (k === 'escape' && phoneOpen) closePhone();
    });
    window.addEventListener('keyup', e => { keys[(e.key||'').toLowerCase()] = false; });

    const canvas = $$('world3d');
    canvas.addEventListener('click', () => {
      if (phoneOpen || isTouch) return;
      if (!pointerLocked) canvas.requestPointerLock();
    });
    document.addEventListener('pointerlockchange', () => {
      pointerLocked = (document.pointerLockElement === canvas);
      $$('hud-pointerlock').classList.toggle('show', !pointerLocked && !phoneOpen && !isTouch);
    });
    document.addEventListener('mousemove', e => {
      if (!pointerLocked) return;
      mouseDX += e.movementX || 0;
      mouseDY += e.movementY || 0;
    });
    window.addEventListener('resize', resizeRenderer);

    // Phone wiring
    document.querySelectorAll('#phone-home button').forEach(b => {
      b.onclick = () => openApp(b.dataset.app);
    });
    $$('phone-back').onclick = showPhoneHome;

    // Route cancel
    $$('hr-cancel').onclick = clearRoute;

    // Sleep dialog
    $$('sleep-no').onclick = () => $$('sleep-dialog').classList.remove('open');
    $$('sleep-ok').onclick = () => {
      $$('sleep-dialog').classList.remove('open');
      const ageBtn = $$('btn-age');
      if (ageBtn) ageBtn.click();
      setTimeout(updateHud, 60);
    };

    // Mobile
    if (isTouch) bindMobile();
  }

  function bindMobile(){
    const stick = $$('mob-stick'), knob = $$('mob-stick-knob');
    let stickActive = false, sCx = 0, sCy = 0;
    stick.addEventListener('touchstart', e => {
      e.preventDefault();
      const r = stick.getBoundingClientRect();
      sCx = r.left + r.width/2; sCy = r.top + r.height/2;
      stickActive = true;
    }, { passive:false });
    window.addEventListener('touchmove', e => {
      if (!stickActive) return;
      const t = e.touches[0]; if (!t) return;
      const dx = t.clientX - sCx, dy = t.clientY - sCy;
      const m = Math.min(50, Math.hypot(dx, dy));
      const a = Math.atan2(dy, dx);
      knob.style.left = (50 + Math.cos(a)*m*0.7) + '%';
      knob.style.top = (50 + Math.sin(a)*m*0.7) + '%';
      touchMove.active = true;
      touchMove.dx = Math.cos(a) * (m/50);
      touchMove.dy = Math.sin(a) * (m/50);
    }, { passive:false });
    window.addEventListener('touchend', e => {
      if (!e.touches || e.touches.length === 0){
        stickActive = false; touchLook.active = false;
        touchMove.active = false; touchMove.dx = 0; touchMove.dy = 0;
        knob.style.left = '50%'; knob.style.top = '50%';
      }
    });

    const look = $$('mob-look');
    look.addEventListener('touchstart', e => {
      const t = e.touches[0]; if (!t) return;
      touchLook.active = true; touchLook.lastX = t.clientX; touchLook.lastY = t.clientY;
    }, { passive:false });
    look.addEventListener('touchmove', e => {
      if (!touchLook.active) return;
      const t = e.touches[0]; if (!t) return;
      mouseDX += (t.clientX - touchLook.lastX) * 1.6;
      mouseDY += (t.clientY - touchLook.lastY) * 1.6;
      touchLook.lastX = t.clientX; touchLook.lastY = t.clientY;
    }, { passive:false });

    $$('mob-e').addEventListener('touchstart', e => { e.preventDefault(); interact(); }, { passive:false });
    $$('mob-phone').addEventListener('touchstart', e => { e.preventDefault(); togglePhone(); }, { passive:false });
  }

  // ═════════ PHONE ═════════
  function togglePhone(){ phoneOpen ? closePhone() : openPhone(); }
  function openPhone(){
    phoneOpen = true;
    $$('phone').classList.add('open');
    showPhoneHome();
    if (document.pointerLockElement) document.exitPointerLock();
    updateHud();
  }
  function closePhone(){
    returnTabContent();
    phoneOpen = false;
    $$('phone').classList.remove('open');
  }
  function returnTabContent(){
    const apc = $$('phone-app-content');
    // Stash the Block Trade iframe so its game state survives back-navigation
    if (blockTradeIframe && blockTradeIframe.parentElement === apc){
      blockTradeStash.appendChild(blockTradeIframe);
    }
    // Same for Wordle
    if (wordleIframe && wordleIframe.parentElement === apc){
      wordleStash.appendChild(wordleIframe);
    }
    // Same for Block Blast
    if (blockBlastIframe && blockBlastIframe.parentElement === apc){
      blockBlastStash.appendChild(blockBlastIframe);
    }
    while (apc.firstChild){
      const tab = apc.firstChild;
      const lp = $$('left-panel');
      if (lp) lp.appendChild(tab); else apc.removeChild(tab);
    }
    apc.classList.remove('active');
    delete apc.dataset.fullbleed;
  }
  function showPhoneHome(){
    returnTabContent();
    $$('phone-home').style.display = 'grid';
    $$('phone-back').classList.remove('show');
  }
  function openApp(name){
    if (name === 'inbox'){
      // Open the existing inbox modal; close the phone first so the modal sits on top cleanly.
      closePhone();
      const btn = document.getElementById('btn-inbox');
      if (btn) btn.click();
      return;
    }
    if (name === 'maps'){
      showMapsApp();
      return;
    }
    if (name === 'blocktrade'){
      if (!blockTradeStash){
        blockTradeStash = document.createElement('div');
        blockTradeStash.style.display = 'none';
        document.body.appendChild(blockTradeStash);
      }
      if (!blockTradeIframe){
        blockTradeIframe = document.createElement('iframe');
        blockTradeIframe.src = './blocktrade.html';
        blockTradeIframe.title = 'Block Trade';
        blockTradeIframe.allow = 'autoplay; gamepad; fullscreen';
      }
      returnTabContent();
      const apc = $$('phone-app-content');
      apc.appendChild(blockTradeIframe);
      apc.classList.add('active');
      apc.dataset.fullbleed = '1';
      $$('phone-home').style.display = 'none';
      $$('phone-back').classList.add('show');
      // Focus the iframe so its keys reach the game, not FinLife
      setTimeout(() => { try { blockTradeIframe.focus(); } catch(e){} }, 50);
      return;
    }
    if (name === 'wordle'){
      if (!wordleStash){
        wordleStash = document.createElement('div');
        wordleStash.style.display = 'none';
        document.body.appendChild(wordleStash);
      }
      if (!wordleIframe){
        wordleIframe = document.createElement('iframe');
        wordleIframe.src = './wordle.html';
        wordleIframe.title = 'Wordle';
        wordleIframe.allow = 'autoplay; fullscreen';
      }
      returnTabContent();
      const apc = $$('phone-app-content');
      apc.appendChild(wordleIframe);
      apc.classList.add('active');
      apc.dataset.fullbleed = '1';
      $$('phone-home').style.display = 'none';
      $$('phone-back').classList.add('show');
      setTimeout(() => { try { wordleIframe.focus(); } catch(e){} }, 50);
      return;
    }
    if (name === 'blockblast'){
      if (!blockBlastStash){
        blockBlastStash = document.createElement('div');
        blockBlastStash.style.display = 'none';
        document.body.appendChild(blockBlastStash);
      }
      if (!blockBlastIframe){
        blockBlastIframe = document.createElement('iframe');
        blockBlastIframe.src = './blockblast.html';
        blockBlastIframe.title = 'Block Blast';
        blockBlastIframe.allow = 'autoplay; fullscreen';
      }
      returnTabContent();
      const apc = $$('phone-app-content');
      apc.appendChild(blockBlastIframe);
      apc.classList.add('active');
      apc.dataset.fullbleed = '1';
      $$('phone-home').style.display = 'none';
      $$('phone-back').classList.add('show');
      setTimeout(() => { try { blockBlastIframe.focus(); } catch(e){} }, 50);
      return;
    }
    const tab = $$('tab-' + name);
    if (!tab) return;
    returnTabContent();
    const apc = $$('phone-app-content');
    apc.appendChild(tab);
    tab.classList.add('active');
    apc.classList.add('active');
    $$('phone-home').style.display = 'none';
    $$('phone-back').classList.add('show');
    apc.scrollTop = 0;
  }

  // ═════════ MAPS APP ═════════
  // mapsTarget: { x, z, name, icon } | null — drives in-world beacon and HUD chip
  let mapsTarget = null;
  let mapsBeacon = null;
  let blockTradeIframe = null;
  let blockTradeStash  = null;
  let wordleIframe = null;
  let wordleStash  = null;
  let blockBlastIframe = null;
  let blockBlastStash  = null;

  function showMapsApp(){
    returnTabContent();
    const apc = $$('phone-app-content');
    apc.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'maps-app';
    wrap.innerHTML = `
      <div class="maps-canvas-wrap">
        <canvas class="maps-canvas" width="380" height="380"></canvas>
        <button class="maps-clear-btn" id="maps-clear-btn">Clear route</button>
      </div>
      <div class="maps-section">Buildings</div>
      <div class="maps-list" id="maps-list-buildings"></div>
      <div class="maps-section">People &amp; Work</div>
      <div class="maps-list" id="maps-list-people"></div>
    `;
    apc.appendChild(wrap);
    apc.classList.add('active');
    $$('phone-home').style.display = 'none';
    $$('phone-back').classList.add('show');

    renderMapsApp();

    if (mapsTarget) $$('maps-clear-btn').classList.add('show');
    $$('maps-clear-btn').onclick = () => { clearRoute(); renderMapsApp(); };
  }

  function getMapsDestinations(){
    const dests = [];
    for (const b of BUILDINGS){
      dests.push({ kind:'building', x:b.pos[0], z:b.pos[1], name:b.label, icon:b.icon, id:b.id });
    }
    // Work: pick a designated workplace filler if char is employed
    const gs = readGS();
    const c = gs && gs.char;
    if (c && c.employed && workplacePos){
      dests.push({ kind:'work', x:workplacePos.x, z:workplacePos.z, name: c.jobTitle || 'Office', icon:'💼' });
    }
    // Family: spouse + kids live at home
    if (c && (c.spouseName || (c.kids|0) > 0)){
      const homeBld = BUILDINGS.find(b => b.id === 'home');
      const fam = [];
      if (c.spouseName) fam.push(c.spouseName);
      if ((c.kids|0) > 0) fam.push((c.kids|0) + ' ' + ((c.kids|0) === 1 ? 'kid' : 'kids'));
      dests.push({ kind:'family', x:homeBld.pos[0], z:homeBld.pos[1], name:'Family — ' + fam.join(' · '), icon:'❤️' });
    }
    return dests;
  }

  function renderMapsApp(){
    const canvas = document.querySelector('.maps-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    // World extent — island radius ISLAND_R; map fits a square slightly larger
    const view = ISLAND_R + 8;
    const scale = (W * 0.5) / view;
    const wx = (x) => W/2 + x*scale;
    const wz = (z) => H/2 + z*scale; // +z is south (down on map)

    // Water
    ctx.fillStyle = '#1565c0';
    ctx.fillRect(0, 0, W, H);
    // Sand
    ctx.fillStyle = '#ead9a8';
    ctx.beginPath(); ctx.arc(W/2, H/2, SAND_R*scale, 0, Math.PI*2); ctx.fill();
    // Grass
    ctx.fillStyle = '#4caf50';
    ctx.beginPath(); ctx.arc(W/2, H/2, ISLAND_R*scale, 0, Math.PI*2); ctx.fill();

    // Roads
    ctx.fillStyle = '#2a2a2a';
    for (const ax of AVENUES){
      ctx.fillRect(wx(ax) - (AVE_W*scale)/2, 0, AVE_W*scale, H);
    }
    for (const sz of STREETS){
      ctx.fillRect(0, wz(sz) - (ST_W*scale)/2, W, ST_W*scale);
    }

    // Filler buildings (small dark dots)
    ctx.fillStyle = '#3e3e3e';
    for (const b of buildings3d){
      if (!b.isFiller) continue;
      ctx.fillRect(wx(b.pos.x) - 1.5, wz(b.pos.z) - 1.5, 3, 3);
    }

    // Action buildings (colored dots with letters)
    for (const b of BUILDINGS){
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(wx(b.pos[0]), wz(b.pos[1]), 6, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = '#000'; ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Route line + target
    if (mapsTarget){
      ctx.strokeStyle = '#ffe066';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(wx(player.x), wz(player.z));
      ctx.lineTo(wx(mapsTarget.x), wz(mapsTarget.z));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ffe066';
      ctx.beginPath(); ctx.arc(wx(mapsTarget.x), wz(mapsTarget.z), 9, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();
    }

    // Player (blue arrow)
    const px = wx(player.x), pz = wz(player.z);
    ctx.save();
    ctx.translate(px, pz);
    // yaw: 0 = looking -Z (up on map). +yaw = looking +X side (right on map).
    ctx.rotate(player.yaw);
    ctx.fillStyle = '#4fc3f7';
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -10); ctx.lineTo(7, 7); ctx.lineTo(0, 4); ctx.lineTo(-7, 7); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();

    // Build the destination lists
    const dests = getMapsDestinations();
    const buildingsList = $$('maps-list-buildings');
    const peopleList    = $$('maps-list-people');
    if (!buildingsList || !peopleList) return;
    buildingsList.innerHTML = '';
    peopleList.innerHTML = '';
    for (const d of dests){
      const dist = Math.hypot(d.x - player.x, d.z - player.z);
      const row = document.createElement('div');
      row.className = 'maps-row';
      if (mapsTarget && mapsTarget.x === d.x && mapsTarget.z === d.z) row.classList.add('active');
      row.innerHTML = `
        <span class="mr-name">${d.icon} ${d.name}</span>
        <span class="mr-dist">${Math.round(dist)} m</span>
      `;
      row.onclick = () => { setRoute(d); closePhone(); };
      if (d.kind === 'building') buildingsList.appendChild(row);
      else peopleList.appendChild(row);
    }
    if (peopleList.childNodes.length === 0){
      peopleList.innerHTML = '<div style="color:var(--muted);font-size:11px;padding:6px 4px">No people or workplace yet — get a job and start a family!</div>';
    }
    const clearBtn = $$('maps-clear-btn');
    if (clearBtn) clearBtn.classList.toggle('show', !!mapsTarget);
  }

  function setRoute(dest){
    mapsTarget = { x: dest.x, z: dest.z, name: dest.name, icon: dest.icon };
    if (!mapsBeacon){
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xffe066, transparent:true, opacity:0.85 });
      mapsBeacon = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 80, 12), beaconMat);
      mapsBeacon.position.y = 40;
      scene.add(mapsBeacon);
    }
    mapsBeacon.position.x = dest.x;
    mapsBeacon.position.z = dest.z;
    mapsBeacon.visible = true;
    $$('hud-route').classList.add('show');
    $$('hr-name').textContent = (dest.icon || '') + ' ' + dest.name;
  }

  function clearRoute(){
    mapsTarget = null;
    if (mapsBeacon) mapsBeacon.visible = false;
    $$('hud-route').classList.remove('show');
  }

  // ═════════ INTERACT ═════════
  function interact(){
    // In-store: buy nearest item OR exit if at the south door
    if (inStore){
      const si = findNearestStoreItem();
      if (si){ buyStoreItem(si); return; }
      if (isAtStoreExit()){ exitStore(); return; }
      return;
    }
    // City filler that's been assigned a brand store
    if (nearestStoreFiller){
      enterStore(nearestStoreFiller);
      return;
    }
    if (!nearestBuilding) return;
    const cfg = nearestBuilding.cfg;
    if (cfg.action === 'sleep'){
      $$('sleep-dialog').classList.add('open');
      if (document.pointerLockElement) document.exitPointerLock();
      return;
    }
    const btn = document.getElementById(cfg.action);
    if (!btn) return;
    if (document.pointerLockElement) document.exitPointerLock();
    btn.click();
  }

  // ═════════ MAIN LOOP ═════════
  function loop(){
    requestAnimationFrame(loop);
    if (!scene || !renderer) return;
    const dt = Math.min(0.05, clock.getDelta());

    // Look
    if (mouseDX || mouseDY){
      player.yaw   -= mouseDX * 0.0025;
      player.pitch -= mouseDY * 0.0025;
      if (player.pitch >  1.2) player.pitch =  1.2;
      if (player.pitch < -1.2) player.pitch = -1.2;
      mouseDX = 0; mouseDY = 0;
    }

    // Move
    if (!phoneOpen){
      const speed = inStore ? 5 : 14;
      let fwd = 0, right = 0;
      if (keys['w'] || keys['arrowup'])    fwd   += 1;
      if (keys['s'] || keys['arrowdown'])  fwd   -= 1;
      if (keys['a'] || keys['arrowleft'])  right -= 1;
      if (keys['d'] || keys['arrowright']) right += 1;
      if (touchMove.active){ fwd -= touchMove.dy; right += touchMove.dx; }
      if (fwd || right){
        const mag = Math.hypot(fwd, right) || 1;
        fwd /= mag; right /= mag;
        const sin = Math.sin(player.yaw), cos = Math.cos(player.yaw);
        const dx = (-sin * fwd + cos * right) * speed * dt;
        const dz = (-cos * fwd - sin * right) * speed * dt;
        let nx = player.x + dx, nz = player.z + dz;
        if (inStore){
          // Clamp to store room walls
          const halfW = storeRoom.w/2 - 0.4, halfD = storeRoom.d/2 - 0.4;
          if (nx >  halfW) nx =  halfW;
          if (nx < -halfW) nx = -halfW;
          if (nz >  halfD) nz =  halfD;
          if (nz < -halfD) nz = -halfD;
        } else {
          const r = Math.hypot(nx, nz);
          if (r > ISLAND_R - 2){ const k = (ISLAND_R - 2)/r; nx *= k; nz *= k; }
          for (const b of buildings3d){
            const d = Math.hypot(nx - b.pos.x, nz - b.pos.z);
            const cr = b.collideR || 2.8;
            if (d < cr){
              const pa = Math.atan2(nz - b.pos.z, nx - b.pos.x);
              nx = b.pos.x + Math.cos(pa) * cr;
              nz = b.pos.z + Math.sin(pa) * cr;
            }
          }
        }
        player.x = nx; player.z = nz;
      }
    }

    camera.position.set(player.x, player.y, player.z);
    camera.rotation.set(player.pitch, player.yaw, 0);

    // Proximity: in-store = nearest shelf item; outside = action building or store entrance
    nearestBuilding = null;
    nearestStoreFiller = null;
    const prompt = $$('hud-prompt');
    if (inStore){
      const si = findNearestStoreItem();
      if (si && !phoneOpen){
        prompt.innerHTML = `Press <b>F</b> to buy <b>${si.item[2]} ${si.item[0]}</b> — $${si.item[1]}`;
        prompt.classList.add('show');
      } else if (isAtStoreExit() && !phoneOpen){
        prompt.innerHTML = `Press <b>F</b> to leave the store`;
        prompt.classList.add('show');
      } else {
        prompt.classList.remove('show');
      }
    } else {
      let bestD = Infinity;
      for (const b of buildings3d){
        if (!b.cfg) continue;
        const d = Math.hypot(player.x - b.pos.x, player.z - b.pos.z);
        const range = (b.collideR || 2.8) + 1.6;
        if (d < range && d < bestD){ bestD = d; nearestBuilding = b; }
      }
      // Brand-store fillers
      let bestS = Infinity;
      for (const b of buildings3d){
        if (!b.isCityFiller || b.storeIdx === undefined) continue;
        const d = Math.hypot(player.x - b.pos.x, player.z - b.pos.z);
        const range = (b.collideR || 2.8) + 1.6;
        if (d < range && d < bestS){ bestS = d; nearestStoreFiller = b; }
      }
      if (nearestBuilding && !phoneOpen){
        prompt.innerHTML = nearestBuilding.cfg.action === 'sleep'
          ? `Press <b>F</b> to sleep at <b>${nearestBuilding.cfg.label}</b>`
          : `Press <b>F</b> to enter <b>${nearestBuilding.cfg.label}</b>`;
        prompt.classList.add('show');
      } else if (nearestStoreFiller && !phoneOpen){
        const [name] = STORES[nearestStoreFiller.storeIdx];
        prompt.innerHTML = `Press <b>F</b> to enter <b>${name}</b>`;
        prompt.classList.add('show');
      } else {
        prompt.classList.remove('show');
      }
    }

    // Carried phone bob + hide while overlay is open
    if (phoneModel){
      phoneBobT += dt;
      const moving = !phoneOpen && (keys['w']||keys['a']||keys['s']||keys['d']||keys['arrowup']||keys['arrowdown']||keys['arrowleft']||keys['arrowright']||touchMove.active);
      const bob = moving ? Math.sin(phoneBobT * 9) * 0.006 : 0;
      phoneModel.position.y = -0.13 + bob;
      phoneModel.visible = !phoneOpen;
    }

    // While in a store, hide the routing chip
    if (inStore){
      $$('hud-route').classList.remove('show');
    }
    // Routing HUD chip + auto-clear on arrival (skip while in a store)
    if (mapsTarget && !inStore){
      const dx = mapsTarget.x - player.x;
      const dz = mapsTarget.z - player.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 4.5){
        clearRoute();
      } else {
        // Bearing relative to player heading. yaw=0 → forward = -Z; +yaw rotates toward +X.
        // World direction-to-target angle (atan2(x, -z) yields 0 when target is straight ahead).
        const targetAngle = Math.atan2(dx, -dz);
        let rel = targetAngle - player.yaw;
        // wrap to [-π, π]
        rel = ((rel + Math.PI) % (Math.PI*2) + (Math.PI*2)) % (Math.PI*2) - Math.PI;
        const arrowEl = $$('hr-arrow');
        const distEl  = $$('hr-dist');
        if (arrowEl) arrowEl.style.transform = 'rotate(' + (rel * 180/Math.PI) + 'deg)';
        if (distEl)  distEl.textContent  = Math.round(dist) + 'm';
        // Subtle beacon pulse via emissive scale
        if (mapsBeacon){
          const t = clock ? clock.elapsedTime : 0;
          mapsBeacon.scale.x = mapsBeacon.scale.z = 1 + Math.sin(t * 3) * 0.06;
        }
      }
    }

    // Render the active scene through the shared camera. Camera stays parented to `scene`
    // so the carried phone (its child) renders outside; inside a store the phone is hidden
    // but the store interior renders correctly.
    renderer.render(inStore && storeScene ? storeScene : scene, camera);
  }

  // ═════════ HUD ═════════
  // GS / MONTH_NAMES / GAME_START_YEAR are top-level `const` in the prior script
  // (lexically global but NOT on window). Read them defensively.
  function readGS(){ try { return GS; } catch(e){ return null; } }
  function readMonthNames(){ try { return MONTH_NAMES; } catch(e){ return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; } }
  function readStartYear(){ try { return GAME_START_YEAR; } catch(e){ return 2026; } }

  function updateHud(){
    const gs = readGS();
    const c = gs && gs.char;
    if (!c) return;
    const money = (c.checking||0) + (c.savings||0) + (c.highYield||0);
    const fmt = m => '$' + Math.round(m).toLocaleString();
    $$('hud-money').textContent = fmt(money);
    $$('hud-age').textContent = c.age;
    const startY = readStartYear();
    const monthAge = (c.monthAge != null) ? c.monthAge : (c.age * 12);
    const monthsSinceStart = monthAge - 18*12;
    const yr = startY + Math.floor(monthsSinceStart / 12);
    const mo = ((monthsSinceStart % 12) + 12) % 12;
    const monthNames = readMonthNames();
    $$('hud-date').textContent = `${monthNames[mo]} ${yr}`;
    $$('ps-info').textContent = `${fmt(money)} · Age ${c.age}`;
  }

  // ═════════ HOOK INTO GAME START ═════════
  function attachStart(){
    const startBtn = $$('btn-start');
    if (!startBtn) return;
    const original = startBtn.onclick;
    startBtn.onclick = function(ev){
      if (original) original.call(this, ev);
      setTimeout(() => { initScene(); updateHud(); }, 30);
    };
  }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', attachStart);
  } else {
    attachStart();
  }

  // Periodic HUD refresh
  setInterval(() => { if (initialized) updateHud(); }, 1000);

  // ═══════════════════════════════════════════════════════════════
  //  SPONSORS — yellow inbox notifications instead of a building
  //  Eligibility:
  //    • Sport-job players  → personal endorsement offers (better with awards)
  //    • Business owners    → biz must be ≥ $250K to attract sponsors
  //  Once a sponsor signs a business: monthly value × 1.08333…
  // ═══════════════════════════════════════════════════════════════
  const SPONSOR_BRANDS = ['Nike','Adidas','Puma','Pepsi','Coca-Cola','Red Bull','Gatorade','Toyota','BMW','Apple','Samsung','Visa','Mastercard','Microsoft','Google','Tesla','Sony','Spotify'];
  const SPORT_JOB_RE = /\b(player|athlete|forward|midfielder|defender|goalie|goalkeeper|striker|quarterback|pitcher|catcher|guard|center|olympic|nba|nfl|mlb|nhl|mls|coach|jockey|boxer|wrestler|skater)\b/i;

  function pickBrand(){ return SPONSOR_BRANDS[Math.floor(Math.random()*SPONSOR_BRANDS.length)]; }
  function fmtSp(n){ return '$' + Math.round(n||0).toLocaleString(); }
  function bizValue(b){ return b.value || b.valuation || b.equity || 0; }

  function getSponsorEligibility(){
    const gs = readGS(); if (!gs?.char) return null;
    const c = gs.char, inv = gs.inv || {};
    const hasSportJob = !!(c.employed && SPORT_JOB_RE.test(c.jobTitle || ''));
    const eligibleBiz = (inv.businesses || []).filter(b => bizValue(b) >= 250000);
    return { hasSportJob, eligibleBiz, awards: c.sportsAwards || 0 };
  }

  function getPendingSponsorOffers(){
    const gs = readGS();
    return ((gs?.inbox)||[]).filter(i =>
      i && i.category === 'sponsor' && i.offer && !i.offer.accepted && !i.offer.declined
    );
  }

  function refreshSponsorBadge(){
    const btn = document.querySelector('#phone-home button.inbox');
    if (!btn) return;
    const pending = getPendingSponsorOffers().length;
    let badge = btn.querySelector('.spons-badge');
    if (pending === 0){ if (badge) badge.remove(); return; }
    if (!badge){
      badge = document.createElement('span');
      badge.className = 'spons-badge';
      badge.style.cssText = 'position:absolute;top:6px;right:6px;background:#fdc52a;color:#000;border-radius:50%;width:20px;height:20px;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;border:2px solid #000;z-index:5;cursor:pointer;animation:pulse-yellow 1.6s infinite';
      btn.style.position = 'relative';
      btn.appendChild(badge);
      // inject keyframes once
      if (!document.getElementById('spons-keyframes')){
        const s = document.createElement('style');
        s.id = 'spons-keyframes';
        s.textContent = '@keyframes pulse-yellow{0%,100%{box-shadow:0 0 0 0 rgba(253,197,42,.6)}50%{box-shadow:0 0 0 8px rgba(253,197,42,0)}}';
        document.head.appendChild(s);
      }
    }
    badge.textContent = String(pending);
  }

  function tickSponsors(){
    const gs = readGS(); if (!gs?.char) return;
    const c = gs.char, inv = gs.inv || {};

    // Track sports awards over time (if they have a sport job)
    if (c.employed && SPORT_JOB_RE.test(c.jobTitle || '')){
      if (Math.random() < 0.045){
        c.sportsAwards = (c.sportsAwards || 0) + 1;
        showToast('🏆 Won a sports award!');
      }
    }

    // Monthly compound boost for any sponsored business
    for (const biz of (inv.businesses || [])){
      if (biz.sponsored){
        const v = bizValue(biz);
        const newV = Math.round(v * 1.08333333333);
        if (biz.value !== undefined) biz.value = newV;
        if (biz.valuation !== undefined) biz.valuation = newV;
        if (biz.equity !== undefined) biz.equity = newV;
      }
    }

    const elig = getSponsorEligibility(); if (!elig) return;
    if (!gs.inbox) gs.inbox = [];
    const monthAge = c.monthAge || 0;
    let droppedAny = false;

    // Business sponsorship offers
    for (const biz of elig.eligibleBiz){
      if (biz.sponsored) continue;
      // 22% chance per eligible biz per month
      if (Math.random() > 0.22) continue;
      const v = bizValue(biz);
      // Better value → richer deal: 5–14% of valuation
      const deal = Math.round(v * (0.05 + Math.random() * 0.09));
      const brand = pickBrand();
      gs.inbox.push({
        id: 'sp_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),
        icon: '🟡',
        name: brand + ' wants to sponsor ' + (biz.name || 'your business'),
        copy: brand + ' offers a ' + fmtSp(deal) + ' signing bonus to sponsor "' + (biz.name||'your business') + '" (currently valued at ' + fmtSp(v) + '). While the deal is active, the business value compounds 8.33% per month.',
        category: 'sponsor', priority: 'yellow', monthAge,
        offer: { kind:'business', brand, deal, businessId: biz.id, businessName: biz.name||'business', accepted:false, declined:false },
      });
      droppedAny = true;
    }

    // Sports endorsement offers
    if (elig.hasSportJob && Math.random() < 0.25){
      const aw = elig.awards;
      const tier = aw >= 5 ? 'Mega' : aw >= 3 ? 'Premium' : aw >= 1 ? 'Standard' : 'Rookie';
      const baseDeal = 30000 + aw*70000 + Math.random()*180000;
      const deal = Math.round(baseDeal);
      const brand = pickBrand();
      gs.inbox.push({
        id: 'sp_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),
        icon: '🟡',
        name: brand + ' ' + tier + ' endorsement',
        copy: brand + ' offers ' + fmtSp(deal) + ' for a personal endorsement deal. (' + aw + ' career awards = ' + tier + ' tier — win more to unlock bigger deals.)',
        category: 'sponsor', priority: 'yellow', monthAge,
        offer: { kind:'sport', brand, deal, tier, awards:aw, accepted:false, declined:false },
      });
      droppedAny = true;
    }

    if (droppedAny){
      showToast('🟡 New sponsor offer in your inbox');
      refreshSponsorBadge();
    }
  }

  function showSponsorOffersModal(){
    const offers = getPendingSponsorOffers();
    if (offers.length === 0){ showToast('No pending sponsor offers'); return; }
    const overlay = document.createElement('div');
    overlay.id = 'spons-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;padding:18px;backdrop-filter:blur(6px)';
    let html = '<h2 style="color:#fdc52a;text-align:center;margin:0 0 14px;font-size:20px">🟡 Sponsorship Offers (' + offers.length + ')</h2>';
    for (const item of offers){
      const o = item.offer;
      const bizExtra = o.kind === 'business' ? ' <span style="color:#43b02a">+8.33%/mo while active</span>' : '';
      html +=
        '<div style="background:#1a2e1a;border:1px solid #fdc52a;border-radius:10px;padding:14px;margin-bottom:12px">' +
          '<div style="font-weight:700;color:#fdc52a;font-size:14px;margin-bottom:6px">' + escapeSpHtml(item.name) + '</div>' +
          '<div style="color:#b0c0b0;font-size:12px;line-height:1.5;margin-bottom:12px">' + escapeSpHtml(item.copy) + bizExtra + '</div>' +
          '<div style="display:flex;gap:8px">' +
            '<button data-id="' + item.id + '" data-act="accept" style="flex:1;background:#43b02a;color:#fff;border:none;padding:10px;border-radius:6px;font-weight:700;cursor:pointer;font-size:13px">Accept ' + fmtSp(o.deal) + '</button>' +
            '<button data-id="' + item.id + '" data-act="decline" style="flex:1;background:#7a2e2e;color:#fff;border:none;padding:10px;border-radius:6px;font-weight:700;cursor:pointer;font-size:13px">Decline</button>' +
          '</div>' +
        '</div>';
    }
    html += '<button id="spons-close" style="margin-top:6px;width:100%;background:#2a2a2a;color:#fff;border:none;padding:10px;border-radius:6px;cursor:pointer;font-weight:700">Close</button>';
    const box = document.createElement('div');
    box.style.cssText = 'background:#0f1f0f;border:2px solid #fdc52a;border-radius:14px;padding:18px;max-width:480px;width:100%;max-height:84vh;overflow-y:auto;box-shadow:0 12px 40px rgba(0,0,0,.7)';
    box.innerHTML = html;
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    box.querySelector('#spons-close').onclick = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    box.querySelectorAll('button[data-id]').forEach(b => {
      b.onclick = () => {
        applySponsorAction(b.dataset.id, b.dataset.act);
        overlay.remove();
        if (getPendingSponsorOffers().length > 0) showSponsorOffersModal();
      };
    });
  }

  function escapeSpHtml(s){ return String(s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  function applySponsorAction(id, act){
    const gs = readGS();
    const item = (gs?.inbox || []).find(i => i.id === id);
    if (!item || !item.offer) return;
    if (act === 'decline'){
      item.offer.declined = true;
      showToast('Declined ' + item.offer.brand);
    } else if (act === 'accept'){
      item.offer.accepted = true;
      if (gs.char){
        gs.char.checking = (gs.char.checking || 0) + (item.offer.deal || 0);
      }
      if (item.offer.kind === 'business'){
        const biz = (gs.inv?.businesses || []).find(b => b.id === item.offer.businessId);
        if (biz){
          biz.sponsored = true;
          biz.sponsorBrand = item.offer.brand;
        }
      }
      showToast('Signed with ' + item.offer.brand + ' · +' + fmtSp(item.offer.deal));
    }
    refreshSponsorBadge();
    if (typeof updateHud === 'function') updateHud();
  }

  function installSponsorSystem(){
    const ageBtn = document.getElementById('btn-age');
    if (ageBtn){
      const prev = ageBtn.onclick;
      ageBtn.onclick = function(ev){
        if (prev) prev.call(this, ev);
        setTimeout(tickSponsors, 60);
      };
    }
    document.addEventListener('click', e => {
      const badge = e.target.closest('.spons-badge');
      if (badge){ e.stopPropagation(); e.preventDefault(); showSponsorOffersModal(); }
    });
    setTimeout(refreshSponsorBadge, 200);
  }

  // Hook installation onto game start (after existing wrappers ran)
  (function(){
    const startBtn = $$('btn-start');
    if (!startBtn) return;
    const prevStart = startBtn.onclick;
    startBtn.onclick = function(ev){
      if (prevStart) prevStart.call(this, ev);
      setTimeout(installSponsorSystem, 120);
    };
  })();

  // ═════════════════════════════════════════════════════════════════
  //  STORES — registry, inventories, archetype interiors, shop flow
  // ═════════════════════════════════════════════════════════════════

  const STORE_INVS = {
    bigbox:     [['Coat',35,'🧥'],['TV',299,'📺'],['Cookware',39,'🍳'],['Headphones',25,'🎧'],['Bedsheets',29,'🛏️'],['Towels',15,'🛁'],['Lamp',24,'💡'],['Backpack',32,'🎒'],['Microwave',79,'🍱'],['Vacuum',129,'🧹'],['Toaster',24,'🍞']],
    grocery:    [['Milk',4,'🥛'],['Bread',3,'🍞'],['Eggs',5,'🥚'],['Apples',6,'🍎'],['Cheese',8,'🧀'],['Cereal',5,'🥣'],['Coffee',12,'☕'],['Frozen Pizza',7,'🍕'],['Pasta',3,'🍝'],['Yogurt',5,'🥛'],['Chips',4,'🥨']],
    pharmacy:   [['Vitamins',15,'💊'],['Bandaids',5,'🩹'],['Toothpaste',4,'🦷'],['Shampoo',8,'🧴'],['Cough Syrup',9,'🥄'],['Sunscreen',12,'🧴'],['Allergy Pills',11,'💊'],['Soap',4,'🧼'],['Razor',8,'🪒']],
    convenience:[['Slushie',3,'🥤'],['Hot Dog',4,'🌭'],['Chips',3,'🥨'],['Energy Drink',4,'⚡'],['Lottery',2,'🎟️'],['Cigarettes',12,'🚬'],['Coffee',3,'☕']],
    dollar:     [['Snacks',1,'🍪'],['Cleaning Spray',1,'🧴'],['Greeting Card',1,'💌'],['Plastic Toy',1,'🪀'],['Batteries',2,'🔋'],['Stationery',1,'📝']],
    fashion:    [['Dress',79,'👗'],['Jeans',59,'👖'],['T-shirt',24,'👕'],['Sneakers',89,'👟'],['Coat',129,'🧥'],['Hat',35,'🎩'],['Scarf',28,'🧣'],['Gloves',24,'🧤']],
    beauty:     [['Lipstick',24,'💄'],['Mascara',28,'👁️'],['Foundation',45,'🧴'],['Perfume',79,'🌺'],['Skincare Set',89,'🌸'],['Nail Polish',12,'💅'],['Hair Care',32,'💇']],
    electronics:[['Laptop',999,'💻'],['Phone',699,'📱'],['Headphones',249,'🎧'],['Smart Watch',399,'⌚'],['Tablet',499,'📱'],['Speaker',129,'🔊'],['Camera',599,'📷'],['Cables',15,'🔌'],['Console',499,'🎮']],
    furniture:  [['Sofa',899,'🛋️'],['Bed',1299,'🛏️'],['Dining Table',649,'🍽️'],['Lamp',129,'💡'],['Bookshelf',249,'📚'],['Mattress',699,'🛏️'],['Rug',199,'🟫'],['Desk',299,'🪑'],['Chair',149,'🪑']],
    cafe:       [['Latte',5,'☕'],['Croissant',4,'🥐'],['Muffin',3,'🧁'],['Donut',2,'🍩'],['Sandwich',8,'🥪'],['Smoothie',6,'🥤'],['Cookie',3,'🍪'],['Cake Slice',5,'🍰'],['Bagel',4,'🥯']],
    sport:      [['Treadmill',899,'🏃'],['Dumbbells',49,'🏋️'],['Yoga Mat',29,'🧘'],['Tennis Racket',119,'🎾'],['Bike',499,'🚲'],['Running Shoes',89,'👟'],['Football',24,'🏈'],['Basketball',29,'🏀']],
    toy:        [['Lego Set',79,'🧱'],['Action Figure',24,'🦸'],['Board Game',39,'🎲'],['Plush Toy',19,'🧸'],['Puzzle',15,'🧩'],['Doll',29,'👸'],['Toy Car',12,'🚗']],
    books:      [['Novel',16,'📕'],['Cookbook',24,'📗'],['Comic Book',8,'📔'],['Magazine',6,'📰'],['Notebook',9,'📓'],['Video Game',59,'🎮'],['Audiobook',19,'🎧']],
    jewelry:    [['Necklace',299,'📿'],['Earrings',149,'💎'],['Ring',499,'💍'],['Bracelet',199,'⌚'],['Watch',699,'⌚']],
    pet:        [['Dog Food',32,'🥫'],['Cat Toy',9,'🐈'],['Leash',19,'🦮'],['Pet Bed',49,'🛏️'],['Aquarium',129,'🐠'],['Bird Cage',69,'🦜'],['Litter',12,'📦']],
    auto:       [['Motor Oil',24,'🛢️'],['Tires',129,'⚙️'],['Battery',149,'🔋'],['Brake Pads',49,'⚙️'],['Wipers',19,'🪟'],['Air Filter',15,'🌀']],
    car:        [['Sedan',24999,'🚗'],['SUV',32999,'🚙'],['Truck',39999,'🛻'],['EV',45999,'🔋'],['Sports Car',69999,'🏎️']],
    home:       [['Power Drill',79,'🔧'],['Paint',39,'🎨'],['Lumber',49,'🪵'],['Light Bulb',8,'💡'],['Hammer',24,'🔨'],['Screwdriver',12,'🪛'],['Garden Hose',29,'🌱']],
    liquor:     [['Wine',24,'🍷'],['Beer 6-pack',12,'🍺'],['Whiskey',49,'🥃'],['Vodka',29,'🍶'],['Champagne',69,'🍾']],
    office:     [['Pens',6,'🖊️'],['Notebook',8,'📓'],['Printer',199,'🖨️'],['Stapler',12,'📎'],['Paper',9,'📄'],['Calculator',19,'🔢']],
    vitamin:    [['Multivitamin',19,'💊'],['Protein Powder',39,'💪'],['Pre-workout',29,'⚡'],['Probiotics',24,'🌿']],
    lingerie:   [['Bra',39,'👙'],['Sleepwear',49,'😴'],['Robe',69,'🧣']],
    eyewear:    [['Sunglasses',149,'🕶️'],['Glasses Frame',199,'👓'],['Contacts',39,'👁️']],
    music:      [['Guitar',299,'🎸'],['Keyboard',499,'🎹'],['Microphone',79,'🎤'],['Sheet Music',12,'🎼']],
    craft:      [['Yarn',8,'🧶'],['Paint Set',29,'🎨'],['Canvas',12,'🖼️'],['Beads',9,'📿'],['Glue',5,'🍯']],
    fanstore:   [['Team Jersey',119,'👕'],['Hat',32,'🧢'],['Mug',12,'☕'],['Pennant',15,'🚩'],['Foam Finger',9,'👆']],
    party:      [['Balloons',8,'🎈'],['Streamers',5,'🎊'],['Costume',45,'🎭'],['Cake',24,'🎂'],['Party Hat',6,'🎉']],
    shoes:      [['Sneakers',89,'👟'],['Boots',129,'🥾'],['Sandals',39,'🩴'],['Heels',79,'👠'],['Loafers',69,'👞']],
    teen:       [['Graphic Tee',24,'👕'],['Funko Pop',12,'🎁'],['Anime Plush',24,'🧸'],['Pop Poster',9,'🖼️']],
    accessory:  [['Earrings',12,'💎'],['Necklace',24,'📿'],['Hair Tie',5,'💇'],['Phone Case',19,'📱']],
  };

  // Map archetype tag → visual archetype (which interior generator to use)
  const VIS_OF = {
    bigbox:'warehouse', sport:'warehouse', books:'warehouse', toy:'warehouse',
    auto:'warehouse', pet:'warehouse', office:'warehouse', home:'warehouse',
    furniture:'warehouse', electronics:'warehouse', craft:'warehouse',
    party:'warehouse', fanstore:'warehouse', car:'warehouse', shoes:'warehouse',
    grocery:'grocery', pharmacy:'grocery', liquor:'grocery', vitamin:'grocery',
    convenience:'grocery', dollar:'grocery',
    fashion:'boutique', beauty:'boutique', jewelry:'boutique',
    lingerie:'boutique', eyewear:'boutique', music:'boutique',
    teen:'boutique', accessory:'boutique',
    cafe:'cafe',
  };

  // Massive store registry: [name, archetype, primary, secondary]
  const STORES = [
    // Big-box & general retail
    ['Walmart','bigbox','#0071ce','#ffc220'],['Target','bigbox','#cc0000','#ffffff'],
    ['Costco','bigbox','#005daa','#e31837'],['Costco Wholesale','bigbox','#005daa','#e31837'],
    ['Sam\'s Club','bigbox','#003a70','#ffffff'],['BJ\'s Wholesale Club','bigbox','#0066cc','#ffd700'],
    ['Amazon','bigbox','#ff9900','#232f3e'],['Big Lots','bigbox','#003db5','#ffd700'],
    ['Five Below','bigbox','#0033a0','#fdf500'],['Ollie\'s Bargain Outlet','bigbox','#ff7900','#003a70'],
    ['At Home','bigbox','#13578d','#ffffff'],['HomeGoods','bigbox','#cc2229','#ffffff'],
    ['Homesense','bigbox','#cc2229','#ffffff'],['Kirkland\'s','bigbox','#5c3317','#f0e6d2'],
    ['Tuesday Morning','bigbox','#7c3a3a','#ffffff'],['Container Store','bigbox','#bf2e2e','#ffffff'],
    ['Restaurant Depot','bigbox','#003366','#cc2229'],['Gordon Food Service','bigbox','#205c40','#ffffff'],
    ['Overstock Store','bigbox','#bf2e3a','#ffffff'],['Wayfair Store','bigbox','#7b189f','#ffffff'],
    // Department stores
    ['Macy\'s','fashion','#e21a23','#ffffff'],['Kohl\'s','fashion','#6f2da8','#ffffff'],
    ['JCPenney','fashion','#cc0000','#ffffff'],['Nordstrom','fashion','#1a1a1a','#ffffff'],
    ['Nordstrom Rack','fashion','#1a1a1a','#ff5566'],
    // Discount fashion
    ['TJ Maxx','fashion','#bf2e3a','#ffffff'],['Marshalls','fashion','#0067a1','#ffffff'],
    ['Ross','fashion','#003c8f','#ffffff'],['Burlington','fashion','#a31426','#ffffff'],
    ['Sierra Trading Post','fashion','#5d4037','#cca96a'],['DSW Warehouse','shoes','#bf2e3a','#ffffff'],
    ['Citi Trends','fashion','#ff7a1a','#000000'],['Rainbow Shops','fashion','#e91e63','#ffffff'],
    ['Forman Mills','fashion','#0066b3','#ffd700'],['Gabe\'s','fashion','#cc0000','#ffd700'],
    // Dollar stores & discount
    ['Dollar Tree','dollar','#0a8c4a','#ffffff'],['Family Dollar','dollar','#dc2626','#ffd700'],
    ['Dollar General','dollar','#fdc52a','#000000'],['99 Cents Only Stores','dollar','#fdc52a','#cc0000'],
    ['Daiso','dollar','#cc2229','#ffd700'],['Miniso','dollar','#cc2229','#ffffff'],
    ['Muji','boutique','#8c8c8c','#ffffff'],['Dollar Tree Plus','dollar','#0a8c4a','#fdc52a'],
    ['Family Dollar Combo','dollar','#dc2626','#0a8c4a'],['Dollar General Market','dollar','#fdc52a','#0a8c4a'],
    // Pharmacy
    ['Walgreens','pharmacy','#e21a23','#ffffff'],['CVS','pharmacy','#cc0000','#ffffff'],
    ['Rite Aid','pharmacy','#0a3a82','#cc0000'],['CVS Pharmacy','pharmacy','#cc0000','#ffffff'],
    ['Walmart Pharmacy','pharmacy','#0071ce','#ffc220'],['Walgreens Pharmacy','pharmacy','#e21a23','#ffffff'],
    ['Rite Aid Pharmacy','pharmacy','#0a3a82','#cc0000'],['Costco Pharmacy','pharmacy','#005daa','#e31837'],
    // Convenience
    ['7-Eleven','convenience','#28933e','#ed1c24'],['GoPuff','convenience','#7b189f','#ffd700'],
    ['Instacart Pickup','convenience','#43b02a','#ffffff'],['Amazon Fresh','grocery','#28a745','#232f3e'],
    // Grocery
    ['Whole Foods','grocery','#006B3F','#ffd700'],['Trader Joe\'s','grocery','#cc0000','#ffffff'],
    ['Aldi','grocery','#0e4b8a','#ed1c24'],['Kroger','grocery','#004990','#ed1c24'],
    ['Safeway','grocery','#cc0000','#ffffff'],['Publix','grocery','#007a3d','#ffffff'],
    ['Wegmans','grocery','#003e7e','#ed1c24'],['Stop & Shop','grocery','#0067a1','#ed1c24'],
    ['ShopRite','grocery','#cc0000','#ffd700'],['Giant','grocery','#cc0000','#ffd700'],
    ['Food Lion','grocery','#0067a1','#ffffff'],['Harris Teeter','grocery','#0067a1','#ffd700'],
    ['Meijer','grocery','#cc0000','#ffffff'],['H-E-B','grocery','#cc0000','#ffffff'],
    ['Winn-Dixie','grocery','#cc0000','#ffd700'],['Sprouts','grocery','#43b02a','#ffd700'],
    ['Fresh Market','grocery','#5d3a1a','#ffd700'],['Piggly Wiggly','grocery','#cc0000','#ffffff'],
    ['Save-A-Lot','grocery','#cc0000','#ffd700'],['Smart & Final','grocery','#0067a1','#ed1c24'],
    ['Grocery Outlet','grocery','#43b02a','#ffd700'],['Market Basket','grocery','#cc0000','#ffffff'],
    ['Price Chopper','grocery','#cc0000','#ffd700'],['Save Mart','grocery','#cc0000','#ffffff'],
    ['Lucky Supermarkets','grocery','#43b02a','#ffd700'],['Food 4 Less','grocery','#cc0000','#ffd700'],
    ['WinCo Foods','grocery','#003a70','#ffd700'],['Fred Meyer','grocery','#003a70','#ed1c24'],
    ['King Soopers','grocery','#003a70','#ed1c24'],['Fry\'s Food','grocery','#cc0000','#ffd700'],
    ['Ralphs','grocery','#cc0000','#ffffff'],['Vons','grocery','#cc0000','#ffd700'],
    ['Albertsons','grocery','#003a70','#cc0000'],['Shaw\'s','grocery','#003a70','#ed1c24'],
    ['Acme Markets','grocery','#cc0000','#ffd700'],['Jewel-Osco','grocery','#cc0000','#ffffff'],
    ['Tom Thumb','grocery','#cc0000','#ffd700'],['Randalls','grocery','#cc0000','#ffd700'],
    ['Brookshire\'s','grocery','#cc0000','#ffd700'],['Ingles','grocery','#cc0000','#ffffff'],
    ['Hy-Vee','grocery','#cc0000','#ffd700'],['Fareway','grocery','#cc0000','#ffd700'],
    ['Bashas\'','grocery','#cc0000','#43b02a'],['Coborn\'s','grocery','#cc0000','#ffffff'],
    ['Lunds & Byerlys','grocery','#5d3a1a','#ffd700'],['Gelson\'s','grocery','#43b02a','#ffd700'],
    ['Bristol Farms','grocery','#5d3a1a','#ffd700'],['Erewhon','grocery','#43b02a','#ffd700'],
    ['Central Market','grocery','#43b02a','#ed1c24'],['Earth Fare','grocery','#43b02a','#ffd700'],
    ['Fresh Thyme','grocery','#43b02a','#ffd700'],['Natural Grocers','grocery','#43b02a','#5d3a1a'],
    ['Eataly Market','grocery','#cc2229','#ffd700'],['H Mart','grocery','#0067a1','#ffd700'],
    ['99 Ranch Market','grocery','#cc0000','#ffd700'],['Patel Brothers','grocery','#ff7900','#43b02a'],
    ['Mitsuwa Marketplace','grocery','#cc0000','#ffd700'],['Uwajimaya','grocery','#43b02a','#cc0000'],
    ['Seafood City','grocery','#0067a1','#ffd700'],['El Super','grocery','#cc0000','#ffd700'],
    ['Vallarta Supermarkets','grocery','#cc0000','#ffd700'],['Fiesta Mart','grocery','#cc0000','#ffd700'],
    ['Cardenas Market','grocery','#43b02a','#ed1c24'],['Superior Grocers','grocery','#cc0000','#ffd700'],
    ['Northgate Market','grocery','#cc0000','#ffd700'],
    // Electronics
    ['Best Buy','electronics','#003b64','#fff200'],['Apple Store','electronics','#000000','#ffffff'],
    ['Microsoft Store','electronics','#737373','#ffffff'],['Samsung Store','electronics','#1428a0','#ffffff'],
    ['Verizon','electronics','#cd040b','#000000'],['AT&T','electronics','#00a8e0','#ff7900'],
    ['T-Mobile','electronics','#e20074','#ffffff'],['Boost Mobile','electronics','#ff7a00','#000000'],
    ['Cricket Wireless','electronics','#65b32e','#000000'],['Metro by T-Mobile','electronics','#e20074','#ffd700'],
    ['Micro Center','electronics','#cc0000','#ffffff'],['B&H Photo','electronics','#003366','#ffd700'],
    ['Adorama','electronics','#003366','#cc0000'],['Newegg Pickup','electronics','#ff7a00','#000000'],
    ['Fry\'s Electronics','electronics','#ed1c24','#ffd700'],['RadioShack','electronics','#cc0000','#ffffff'],
    ['Batteries Plus','electronics','#ed1c24','#ffd700'],['uBreakiFix','electronics','#0067a1','#ed1c24'],
    ['CPR Cell Phone Repair','electronics','#0067a1','#ffd700'],['Apple Authorized Reseller','electronics','#000000','#a8a8a8'],
    // Home improvement
    ['Home Depot','home','#f96302','#ffffff'],['Lowe\'s','home','#004990','#ffffff'],
    ['Menards','home','#0c5cab','#ffd700'],['Floor & Decor','home','#cc2229','#ffd700'],
    ['Sherwin-Williams','home','#cc0000','#003366'],['Benjamin Moore','home','#0067a1','#ed1c24'],
    ['PPG Paints','home','#003a70','#ffd700'],['Sherwin-Williams Paints','home','#cc0000','#003366'],
    ['Benjamin Moore Paints','home','#0067a1','#ed1c24'],['Sherwin Outlet','home','#cc0000','#ffd700'],
    ['Benjamin Outlet','home','#0067a1','#ffd700'],['Floor & Decor Outlet','home','#cc2229','#ffd700'],
    ['Ace Hardware','home','#cc0000','#ffd700'],['True Value','home','#cc0000','#003366'],
    ['Harbor Freight','home','#ff7a00','#003366'],['Tractor Supply Co.','home','#cc0000','#ffd700'],
    ['Rural King','home','#cc0000','#ffd700'],['Fleet Farm','home','#0067a1','#ffd700'],
    ['Blain\'s Farm & Fleet','home','#0067a1','#ffd700'],['Northern Tool + Equipment','home','#0067a1','#ffd700'],
    ['Grainger','home','#cc0000','#ffd700'],['Fastenal','home','#0067a1','#ffd700'],
    ['Ferguson Plumbing','home','#003366','#ffd700'],
    // Furniture
    ['IKEA','furniture','#0051ba','#ffda1a'],['IKEA Planning Studio','furniture','#0051ba','#ffda1a'],
    ['Ethan Allen','furniture','#5d3a1a','#f0e6d2'],['Ashley Furniture','furniture','#5d3a1a','#cc0000'],
    ['Raymour & Flanigan','furniture','#cc0000','#ffd700'],['Bob\'s Discount Furniture','furniture','#0067a1','#ffd700'],
    ['Mattress Firm','furniture','#cc0000','#ffd700'],['Sleep Number','furniture','#0067a1','#ffffff'],
    ['La-Z-Boy','furniture','#003366','#ed1c24'],['Pottery Barn','furniture','#5d3a1a','#f0e6d2'],
    ['West Elm','furniture','#5d3a1a','#ffffff'],['Crate & Barrel','furniture','#000000','#ffffff'],
    ['CB2','furniture','#000000','#ed1c24'],['Williams Sonoma','furniture','#5d3a1a','#ffd700'],
    ['Sur La Table','furniture','#cc0000','#5d3a1a'],['Bed Bath & Beyond','furniture','#0067a1','#ffffff'],
    ['Buy Buy Baby','furniture','#003a70','#65b32e'],['Pier 1 Imports','furniture','#5d3a1a','#ed1c24'],
    ['Ashley Outlet','furniture','#5d3a1a','#cc0000'],['Bob\'s Outlet','furniture','#0067a1','#ffd700'],
    ['Mattress Firm Outlet','furniture','#cc0000','#ffd700'],['Sleep Number Outlet','furniture','#0067a1','#ffffff'],
    ['La-Z-Boy Outlet','furniture','#003366','#ed1c24'],['Pottery Barn Outlet','furniture','#5d3a1a','#f0e6d2'],
    ['West Elm Outlet','furniture','#5d3a1a','#ffffff'],['Crate & Barrel Outlet','furniture','#000000','#ffffff'],
    ['CB2 Outlet','furniture','#000000','#ed1c24'],['Williams Sonoma Outlet','furniture','#5d3a1a','#ffd700'],
    ['Sur La Table Outlet','furniture','#cc0000','#5d3a1a'],['Container Store Outlet','bigbox','#bf2e2e','#ffffff'],
    ['Bed Bath & Beyond Outlet','furniture','#0067a1','#ffffff'],
    // Fashion: mall + fast
    ['Gap','fashion','#003a70','#ffffff'],['Old Navy','fashion','#003a70','#ffd700'],
    ['Banana Republic','fashion','#000000','#a8a8a8'],['American Eagle','fashion','#003a70','#cc0000'],
    ['Hollister','fashion','#003a70','#cc0000'],['Abercrombie & Fitch','fashion','#000000','#5d3a1a'],
    ['Urban Outfitters','fashion','#5d3a1a','#ffffff'],['PacSun','fashion','#000000','#ed1c24'],
    ['Zara','fashion','#000000','#ffffff'],['H&M','fashion','#cc0000','#ffffff'],
    ['Uniqlo','fashion','#cc0000','#ffffff'],['Forever 21','fashion','#ffd700','#000000'],
    ['Shein','fashion','#000000','#ffffff'],['Anthropologie','fashion','#5d3a1a','#f0e6d2'],
    ['Free People','fashion','#5d3a1a','#ed1c24'],['Brandy Melville','fashion','#000000','#ffffff'],
    ['Aritzia','fashion','#000000','#ffffff'],['Express','fashion','#000000','#a8a8a8'],
    ['Ann Taylor','fashion','#5d3a1a','#000000'],['LOFT','fashion','#5d3a1a','#f0e6d2'],
    ['Chico\'s','fashion','#5d3a1a','#ed1c24'],['White House Black Market','fashion','#000000','#ffffff'],
    ['Talbots','fashion','#003a70','#cc0000'],['Torrid','fashion','#000000','#cc0000'],
    ['Lane Bryant','fashion','#000000','#ed1c24'],['Primark','fashion','#0067a1','#ffd700'],
    ['River Island','fashion','#000000','#ed1c24'],['Mango','fashion','#000000','#ffffff'],
    ['Bershka','fashion','#000000','#ffffff'],['Pull & Bear','fashion','#000000','#ffd700'],
    ['Stradivarius','fashion','#000000','#ed1c24'],['Massimo Dutti','fashion','#5d3a1a','#000000'],
    // Lingerie
    ['Victoria\'s Secret','lingerie','#ed1c95','#000000'],['Pink','lingerie','#ed1c95','#ffffff'],
    ['Savage X Fenty','lingerie','#000000','#ed1c95'],
    // Beauty
    ['Sephora','beauty','#000000','#ed1c95'],['Ulta Beauty','beauty','#cc0000','#000000'],
    ['Sally Beauty','beauty','#ed1c95','#000000'],['Bath & Body Works','beauty','#003a70','#ed1c95'],
    ['The Body Shop','beauty','#43b02a','#ffffff'],['Lush','beauty','#000000','#43b02a'],
    ['Glossier','beauty','#ffd1d6','#000000'],['MAC Cosmetics','beauty','#000000','#ffffff'],
    ['Clinique','beauty','#a8d6f0','#ed1c24'],['Estée Lauder','beauty','#003a70','#ffd700'],
    // Auto
    ['AutoZone','auto','#cc0000','#ffd700'],['Advance Auto Parts','auto','#cc0000','#ffd700'],
    ['O\'Reilly Auto Parts','auto','#cc0000','#ffd700'],['Pep Boys','auto','#003a70','#ffd700'],
    ['CarMax','car','#0067a1','#ffd700'],['Tesla Store','car','#cc0000','#000000'],
    // Pet
    ['Petco','pet','#cc0000','#0067a1'],['PetSmart','pet','#cc0000','#0067a1'],
    // Office
    ['Staples','office','#cc0000','#ffffff'],['Office Depot','office','#cc0000','#ffffff'],
    ['OfficeMax','office','#cc0000','#003a70'],['Staples Print Center','office','#cc0000','#ffffff'],
    ['Office Depot Print','office','#cc0000','#ffffff'],['FedEx Office','office','#4d148c','#ff6600'],
    ['UPS Store','office','#5d3a1a','#ffd700'],
    // Books / Games
    ['GameStop','books','#cc0000','#000000'],['Barnes & Noble','books','#5d3a1a','#f0e6d2'],
    ['Books-A-Million','books','#cc0000','#ffd700'],['GameStop Retro','books','#cc0000','#000000'],
    ['ThinkGeek','books','#43b02a','#000000'],
    // Sport
    ['Dick\'s Sporting Goods','sport','#43b02a','#ffd700'],['Academy Sports','sport','#0067a1','#ffd700'],
    ['REI','sport','#43b02a','#ffffff'],['REI Outlet','sport','#43b02a','#ffd700'],
    ['Bass Pro Shops','sport','#43b02a','#ffd700'],['Cabela\'s','sport','#43b02a','#5d3a1a'],
    ['Decathlon','sport','#0067a1','#ffd700'],['JD Sports','sport','#000000','#ed1c24'],
    ['Sports Direct','sport','#003a70','#cc0000'],['Camping World','sport','#43b02a','#ffd700'],
    ['Gander Outdoors','sport','#43b02a','#ffd700'],['Patagonia Store','sport','#003a70','#43b02a'],
    ['The North Face Store','sport','#000000','#cc0000'],['Columbia Sportswear','sport','#003a70','#43b02a'],
    ['Arc\'teryx Store','sport','#000000','#a8d6f0'],['Fjällräven Store','sport','#cc0000','#ffd700'],
    // Athletic / Footwear
    ['Foot Locker','shoes','#000000','#ed1c24'],['Finish Line','shoes','#000000','#43b02a'],
    ['Champs Sports','shoes','#cc0000','#000000'],['Nike Store','shoes','#000000','#ffffff'],
    ['Adidas Store','shoes','#000000','#ffffff'],['Under Armour','shoes','#000000','#cc0000'],
    ['Lululemon','fashion','#cc0000','#000000'],['Vans Store','shoes','#cc0000','#000000'],
    ['Converse Store','shoes','#000000','#ffffff'],['Crocs Store','shoes','#43b02a','#ffd700'],
    ['Dr. Martens Store','shoes','#000000','#ffd700'],['Skechers','shoes','#000000','#ed1c24'],
    ['Clarks','shoes','#5d3a1a','#000000'],['Aldo','shoes','#000000','#a8a8a8'],
    ['Steve Madden','shoes','#000000','#ed1c95'],['Nine West','shoes','#000000','#a8a8a8'],
    ['DSW','shoes','#cc0000','#ffffff'],['Famous Footwear','shoes','#cc0000','#ffd700'],
    ['Payless','shoes','#cc0000','#ffffff'],['Rack Room Shoes','shoes','#cc0000','#ffd700'],
    ['Shoe Carnival','shoes','#ed1c95','#ffd700'],['Finish Line Outlet','shoes','#000000','#43b02a'],
    ['Champs Outlet','shoes','#cc0000','#000000'],['Nike Factory Store','shoes','#000000','#ffffff'],
    ['Adidas Outlet','shoes','#000000','#ffffff'],['Puma Outlet','shoes','#000000','#cc0000'],
    ['Reebok Outlet','shoes','#000000','#cc0000'],['Shoe Dept Encore','shoes','#cc0000','#ffd700'],
    ['Rack Room Outlet','shoes','#cc0000','#ffd700'],['Payless Outlet','shoes','#cc0000','#ffffff'],
    // Toys / kids
    ['Lego Store','toy','#cc0000','#ffd700'],['Disney Store','toy','#003a70','#ed1c95'],
    ['Build-A-Bear','toy','#5d3a1a','#ffd700'],['FAO Schwarz','toy','#cc0000','#ffd700'],
    ['Toys "R" Us','toy','#003a70','#ed1c24'],['Babies "R" Us','toy','#003a70','#ed1c95'],
    ['Carter\'s','toy','#cc0000','#ffd700'],['OshKosh B\'gosh','toy','#cc0000','#ffd700'],
    ['Gymboree','toy','#43b02a','#ed1c95'],['Janie and Jack','toy','#ed1c95','#ffd700'],
    ['Crazy 8','toy','#43b02a','#ffd700'],['Lego Discovery Store','toy','#cc0000','#ffd700'],
    ['Disney Outlet','toy','#003a70','#ed1c95'],['Character Warehouse','toy','#003a70','#ed1c95'],
    ['Universal Store','toy','#cc0000','#ffd700'],['Warner Bros Studio Store','toy','#003a70','#ffd700'],
    // Jewelry
    ['Pandora','jewelry','#ed1c95','#ffffff'],['Kay Jewelers','jewelry','#5d3a1a','#ffd700'],
    ['Zales','jewelry','#003a70','#ffd700'],['Jared','jewelry','#5d3a1a','#ffd700'],
    ['Tiffany & Co.','jewelry','#0abab5','#ffffff'],['Cartier','jewelry','#cc0000','#ffd700'],
    ['Rolex Boutique','jewelry','#43b02a','#ffd700'],
    // Eyewear
    ['Sunglass Hut','eyewear','#000000','#ed1c24'],['LensCrafters','eyewear','#003a70','#ed1c24'],
    ['Warby Parker','eyewear','#003a70','#ffffff'],['Pearle Vision','eyewear','#003a70','#ffd700'],
    ['America\'s Best Contacts','eyewear','#cc0000','#0067a1'],['Visionworks','eyewear','#0067a1','#ffd700'],
    // Music
    ['Guitar Center','music','#cc0000','#000000'],['Sam Ash','music','#003a70','#ed1c24'],
    ['Music & Arts','music','#003a70','#ffd700'],['Sweetwater','music','#cc0000','#0067a1'],
    // Crafts
    ['Michaels','craft','#cc0000','#ffffff'],['Joann Fabrics','craft','#cc0000','#ffffff'],
    ['Hobby Lobby','craft','#cc0000','#ffd700'],['Blick Art Materials','craft','#000000','#ffd700'],
    // Party
    ['Party City','party','#ed1c95','#ffd700'],
    // Mall teen
    ['Tillys','teen','#000000','#ed1c24'],['Zumiez','teen','#000000','#65b32e'],
    ['Hot Topic','teen','#000000','#ed1c95'],['BoxLunch','teen','#000000','#ed1c24'],
    ['Spencer\'s','teen','#000000','#ed1c95'],['Hot Topic Pop Culture','teen','#000000','#ed1c95'],
    ['BoxLunch Gifts','teen','#000000','#ed1c24'],
    // Accessories
    ['Claire\'s','accessory','#ed1c95','#ffd700'],['Icing','accessory','#a8d6f0','#ed1c95'],
    // Cafe / dessert
    ['Starbucks Store','cafe','#006241','#a07a4f'],['Dunkin\' Store','cafe','#ff6f00','#ed1c95'],
    ['Krispy Kreme Shop','cafe','#43b02a','#cc0000'],['Tim Hortons Store','cafe','#cc0000','#5d3a1a'],
    ['Cold Stone Creamery','cafe','#003a70','#ed1c24'],['Baskin Robbins','cafe','#ed1c95','#003a70'],
    ['Dairy Queen Store','cafe','#cc0000','#003a70'],['Insomnia Cookies','cafe','#ed1c95','#ffd700'],
    ['Crumbl Cookies','cafe','#ed1c95','#000000'],['Nothing Bundt Cakes','cafe','#5d3a1a','#ed1c95'],
    ['Edible Arrangements','cafe','#43b02a','#ed1c95'],['Smoothie King','cafe','#43b02a','#cc0000'],
    ['Jamba','cafe','#ff7a00','#ed1c95'],
    // Liquor
    ['Total Wine & More','liquor','#cc0000','#ffd700'],['BevMo!','liquor','#cc0000','#003a70'],
    ['ABC Fine Wine','liquor','#cc0000','#ffd700'],['Spec\'s','liquor','#cc0000','#000000'],
    ['Binny\'s Beverage Depot','liquor','#cc0000','#ffd700'],['Goody Goody Liquor','liquor','#cc0000','#ffd700'],
    ['Liquor Barn','liquor','#cc0000','#ffd700'],['Party Source','liquor','#cc0000','#ffd700'],
    ['Walgreens Liquor','liquor','#e21a23','#ffffff'],['CVS Liquor','liquor','#cc0000','#ffffff'],
    // Sports fan / locker
    ['Lids','fanstore','#000000','#ed1c24'],['Hat Club','fanstore','#000000','#ffd700'],
    ['New Era Store','fanstore','#000000','#ed1c24'],['Mitchell & Ness','fanstore','#5d3a1a','#ffd700'],
    ['Fanatics','fanstore','#cc0000','#003a70'],['Lids Locker Room','fanstore','#000000','#ed1c24'],
    ['Champs Locker Room','fanstore','#cc0000','#000000'],['House of Hoops','fanstore','#cc0000','#000000'],
    ['Nike House of Innovation','shoes','#000000','#ffffff'],['NBA Store','fanstore','#003a70','#ed1c24'],
    ['NFL Shop','fanstore','#003a70','#ed1c24'],['MLB Shop','fanstore','#003a70','#ed1c24'],
    ['NHL Shop','fanstore','#000000','#ed1c24'],['MLS Store','fanstore','#003a70','#ed1c24'],
    ['Pro Image Sports','fanstore','#003a70','#ed1c24'],['Rally House','fanstore','#cc0000','#ffd700'],
    ['Soccer Post','fanstore','#43b02a','#ed1c24'],
    // Specialty sport
    ['Tennis Warehouse','sport','#ffd700','#43b02a'],['Golf Galaxy','sport','#43b02a','#ffd700'],
    ['PGA Tour Superstore','sport','#43b02a','#ffd700'],['Edwin Watts Golf','sport','#43b02a','#ffd700'],
    ['Bike World','sport','#cc0000','#ffd700'],['Trek Store','sport','#cc0000','#ffffff'],
    ['Specialized Store','sport','#cc0000','#000000'],['Giant Bicycles Store','sport','#003a70','#ffd700'],
    ['Performance Bike','sport','#cc0000','#000000'],['Cycle Gear','sport','#cc0000','#000000'],
    ['RevZilla Store','sport','#cc0000','#000000'],['Harley-Davidson Shop','sport','#ff7a00','#000000'],
    ['Indian Motorcycle Store','sport','#cc0000','#ffd700'],
    // Vitamins
    ['Vitamin Shoppe','vitamin','#ffd700','#003a70'],['GNC','vitamin','#000000','#ffd700'],
    // Outlet (mostly fashion/shoes)
    ['Sierra Trading Post','sport','#5d3a1a','#cca96a'],['HomeGoods','bigbox','#cc2229','#ffffff'],
    ['Burlington Coat Factory','fashion','#a31426','#ffffff'],['Ross Dress for Less','fashion','#003c8f','#ffffff'],
    ['TJ Maxx Runway','fashion','#bf2e3a','#ffffff'],['Marshalls Mega','fashion','#0067a1','#ffffff'],
    ['Five Below Outlet','dollar','#0033a0','#fdf500'],
  ];

  // ── Archetype interior generators (built by 4 swarmed agents) ────

  function buildWarehouseInterior(scene, store, palette, w, d){
    const shelfItems = [];
    function makeItemTexture(name, price, icon){
      const c = document.createElement('canvas'); c.width=128; c.height=128;
      const ctx = c.getContext('2d');
      ctx.fillStyle = palette.accent; ctx.fillRect(0,0,128,128);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(4,4,120,120);
      ctx.fillStyle = palette.accent; ctx.fillRect(8,8,112,112);
      ctx.font = '64px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(icon||'?', 64, 54);
      ctx.fillStyle = palette.primary; ctx.font = 'bold 22px Arial Black, sans-serif';
      ctx.fillText('$'+price, 64, 100);
      return new THREE.CanvasTexture(c);
    }
    function makeBannerTexture(text){
      const c = document.createElement('canvas'); c.width=1024; c.height=256;
      const ctx = c.getContext('2d');
      ctx.fillStyle = palette.primary; ctx.fillRect(0,0,1024,256);
      ctx.fillStyle = palette.secondary; ctx.fillRect(0,6,1024,6); ctx.fillRect(0,244,1024,6);
      ctx.font = 'bold 96px Arial Black, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(text, 512, 128);
      return new THREE.CanvasTexture(c);
    }
    const frameMat = new THREE.MeshLambertMaterial({color:0x3a3a3a});
    const shelfMat = new THREE.MeshLambertMaterial({color:0x808080});
    const counterMat = new THREE.MeshLambertMaterial({color:palette.primary});
    const registerMat = new THREE.MeshLambertMaterial({color:0x222222});
    const tubeMat = new THREE.MeshBasicMaterial({color:0xfff8d6});
    const cartMat = new THREE.MeshLambertMaterial({color:0xb0b4b8});
    const numUnits = 4, unitW=4, unitH=3, unitD=0.7, aisleHalf=2.2;
    const totalRowLen = numUnits*unitW;
    const startX = -totalRowLen/2 + unitW/2;
    const shelfYs = [0.5, 1.4, 2.3];
    const shelves = [];
    for (let row = 0; row < 2; row++){
      const zPos = (row===0?-1:1)*aisleHalf;
      const facing = (row===0?1:-1);
      for (let i = 0; i < numUnits; i++){
        const x = startX + i*unitW;
        const group = new THREE.Group();
        const back = new THREE.Mesh(new THREE.BoxGeometry(unitW, unitH, 0.05), frameMat);
        back.position.set(0, unitH/2, -facing*unitD/2); group.add(back);
        for (let s=-1; s<=1; s+=2){
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, unitH, unitD), frameMat);
          post.position.set(s*unitW/2, unitH/2, 0); group.add(post);
        }
        for (const sy of shelfYs){
          const sh = new THREE.Mesh(new THREE.BoxGeometry(unitW-0.1, 0.05, unitD), shelfMat);
          sh.position.set(0, sy, 0); group.add(sh);
          shelves.push({x:x, y:sy+0.05+0.175, z:zPos, facing:facing, unitW:unitW});
        }
        group.position.set(x, 0, zPos); scene.add(group);
      }
    }
    const inv = store.inv||[];
    const itemsPerShelf = Math.ceil(inv.length/shelves.length);
    for (let i=0; i<inv.length; i++){
      const item = inv[i];
      const shelfIdx = i % shelves.length;
      const slotIdx = Math.floor(i/shelves.length);
      const sh = shelves[shelfIdx];
      const slotsAcross = Math.max(itemsPerShelf, 4);
      const spacing = (sh.unitW-0.6)/slotsAcross;
      const localX = -sh.unitW/2 + 0.3 + (slotIdx+0.5)*spacing;
      const px = sh.x + localX, py = sh.y, pz = sh.z + sh.facing*0.05;
      const tex = makeItemTexture(item[0], item[1], item[2]);
      const sideMat = new THREE.MeshLambertMaterial({color:palette.accent});
      const frontMat = new THREE.MeshLambertMaterial({map:tex});
      const mats = [sideMat,sideMat,sideMat,sideMat,sideMat,sideMat];
      if (sh.facing>0) mats[4]=frontMat; else mats[5]=frontMat;
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.35), mats);
      box.position.set(px, py, pz); scene.add(box);
      shelfItems.push({type:'shelfItem', item, mesh:box, pos:[px,py,pz]});
    }
    const counter = new THREE.Mesh(new THREE.BoxGeometry(4, 0.8, 1), counterMat);
    counter.position.set(-w/4, 0.4, d/2 - 1.5); scene.add(counter);
    const register = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.5), registerMat);
    register.position.set(-w/4 + 1.2, 1.0, d/2 - 1.5); scene.add(register);
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.05), new THREE.MeshBasicMaterial({color:0x88ddff}));
    screen.position.set(-w/4 + 1.2, 1.05, d/2 - 1.27); scene.add(screen);
    const bannerTex = makeBannerTexture((store.n||'STORE').toUpperCase());
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(w*0.6, 1.5), new THREE.MeshBasicMaterial({map:bannerTex}));
    banner.position.set(0, 3, -d/2 + 0.05); scene.add(banner);
    const numTubes = 5, tubeLen = w*0.9;
    for (let i=0; i<numTubes; i++){
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, tubeLen, 8), tubeMat);
      tube.rotation.z = Math.PI/2;
      const tz = -d/2 + (i+1)*(d/(numTubes+1));
      tube.position.set(0, 3.85, tz); scene.add(tube);
      const housing = new THREE.Mesh(new THREE.BoxGeometry(tubeLen, 0.08, 0.25), new THREE.MeshLambertMaterial({color:0xeeeeee}));
      housing.position.set(0, 3.95, tz); scene.add(housing);
    }
    const corralX = w/2 - 2, corralZ = d/2 - 1.5;
    for (let i=0; i<4; i++){
      const cart = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.5), cartMat);
      cart.position.set(corralX - i*0.25, 0.4, corralZ); scene.add(cart);
    }
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(totalRowLen+2, 0.15),
      new THREE.MeshBasicMaterial({color:palette.secondary}));
    stripe.rotation.x = -Math.PI/2; stripe.position.set(0, 0.01, 0); scene.add(stripe);
    return shelfItems;
  }

  function buildBoutiqueInterior(scene, store, palette, w, d){
    const shelfItems = [];
    const makeItemTex = (name, price, icon) => {
      const c = document.createElement('canvas'); c.width=256; c.height=256;
      const ctx = c.getContext('2d');
      ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,256,256);
      ctx.fillStyle = palette.primary;
      ctx.font = '120px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(icon, 128, 110);
      ctx.font = 'bold 22px Georgia, serif';
      const nm = (name||'').length > 14 ? name.slice(0,13)+'…' : (name||'');
      ctx.fillText(nm, 128, 188);
      ctx.font = 'bold 26px Georgia, serif';
      ctx.fillText('$'+price, 128, 220);
      return new THREE.CanvasTexture(c);
    };
    const makeSignTex = (text) => {
      const c = document.createElement('canvas'); c.width=1024; c.height=256;
      const ctx = c.getContext('2d');
      ctx.fillStyle = palette.primary; ctx.fillRect(0,0,1024,256);
      ctx.fillStyle = palette.secondary;
      ctx.font = 'bold 96px Georgia, serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(text, 512, 128);
      return new THREE.CanvasTexture(c);
    };
    const woodMat = new THREE.MeshLambertMaterial({color:0x5d3a1a});
    const glassMat = new THREE.MeshBasicMaterial({color:0xb8e0ff, transparent:true, opacity:0.35});
    const itemBoxGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const floorAccent = new THREE.Mesh(new THREE.PlaneGeometry(w-0.5, d-0.5),
      new THREE.MeshLambertMaterial({color:0x8b5a2b}));
    floorAccent.rotation.x = -Math.PI/2; floorAccent.position.y = 0.01; scene.add(floorAccent);
    const mirror = new THREE.Mesh(new THREE.PlaneGeometry(w*0.55, 2.4),
      new THREE.MeshBasicMaterial({color:0xa8c8e8, transparent:true, opacity:0.7}));
    mirror.position.set(0, 2.0, -d/2 + 0.03); scene.add(mirror);
    const frame = new THREE.Mesh(new THREE.PlaneGeometry(w*0.55+0.2, 2.6),
      new THREE.MeshLambertMaterial({color:palette.primary}));
    frame.position.set(0, 2.0, -d/2 + 0.02); scene.add(frame);
    const inv = store.inv||[];
    const casePositions = [
      {x:-w/2+1.2, z:-d/4, ry:Math.PI/2},
      {x: w/2-1.2, z:-d/4, ry:-Math.PI/2},
      {x:-w/2+1.2, z: d/4, ry:Math.PI/2},
      {x: w/2-1.2, z: d/4, ry:-Math.PI/2},
    ];
    let invIdx = 0;
    casePositions.forEach((cp) => {
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.0, 0.6), woodMat);
      base.position.set(cp.x, 0.5, cp.z); base.rotation.y = cp.ry; scene.add(base);
      const top = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.6), glassMat);
      top.rotation.x = -Math.PI/2; top.position.set(cp.x, 1.02, cp.z); scene.add(top);
      for (let i = 0; i < 3 && invIdx < inv.length; i++){
        const item = inv[invIdx % inv.length];
        const tex = makeItemTex(item[0], item[1], item[2]);
        const mat = new THREE.MeshLambertMaterial({map:tex});
        const mesh = new THREE.Mesh(itemBoxGeo, mat);
        const offset = (i-1)*0.45;
        const lx = cp.x - Math.sin(cp.ry)*offset;
        const lz = cp.z + Math.cos(cp.ry)*offset;
        mesh.position.set(lx, 1.18, lz); scene.add(mesh);
        shelfItems.push({type:'shelfItem', item, mesh, pos:[lx,1.18,lz]});
        invIdx++;
      }
    });
    const shelfYs = [1.6, 2.4];
    const sides = [{x:-w/2+0.05, dir:1},{x:w/2-0.05, dir:-1}];
    sides.forEach((s) => {
      shelfYs.forEach((y) => {
        const shelf = new THREE.Mesh(new THREE.PlaneGeometry(d*0.6, 0.25),
          new THREE.MeshLambertMaterial({color:0x5d3a1a, side:THREE.DoubleSide}));
        shelf.rotation.y = s.dir > 0 ? Math.PI/2 : -Math.PI/2;
        shelf.position.set(s.x, y, 0); scene.add(shelf);
        const count = 4;
        for (let i = 0; i < count && invIdx < inv.length*2; i++){
          const item = inv[invIdx % inv.length];
          const tex = makeItemTex(item[0], item[1], item[2]);
          const mat = new THREE.MeshLambertMaterial({map:tex});
          const mesh = new THREE.Mesh(itemBoxGeo, mat);
          const zPos = (i-(count-1)/2)*(d*0.55/count);
          mesh.position.set(s.x + s.dir*0.2, y+0.2, zPos); scene.add(mesh);
          shelfItems.push({type:'shelfItem', item, mesh, pos:[s.x+s.dir*0.2, y+0.2, zPos]});
          invIdx++;
        }
      });
    });
    const podium = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.0, 24), woodMat);
    podium.position.set(0, 0.5, d/2 - 1.8); scene.add(podium);
    const register = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.35),
      new THREE.MeshLambertMaterial({color:palette.accent}));
    register.position.set(0, 1.13, d/2 - 1.8); scene.add(register);
    const mannMat = new THREE.MeshLambertMaterial({color:palette.accent});
    const mann = new THREE.Group();
    mann.add(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.8, 12), mannMat));
    mann.children[0].position.set(-0.1, 0.4, 0);
    const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.8, 12), mannMat);
    legR.position.set(0.1, 0.4, 0); mann.add(legR);
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.65, 14), mannMat);
    torso.position.set(0, 1.13, 0); mann.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 12), mannMat);
    head.position.set(0, 1.65, 0); mann.add(head);
    mann.position.set(-w/2 + 1.5, 0, d/2 - 2.5); scene.add(mann);
    const pendantPositions = [-w/3, 0, w/3];
    pendantPositions.forEach((px) => {
      const bulb = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.4, 16),
        new THREE.MeshBasicMaterial({color:0xfff2c8}));
      bulb.position.set(px, 3.1, 0); scene.add(bulb);
    });
    const signTex = makeSignTex(store.n);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(w*0.5, 0.7),
      new THREE.MeshBasicMaterial({map:signTex}));
    sign.position.set(0, 3.3, d/2 - 0.05); sign.rotation.y = Math.PI; scene.add(sign);
    return shelfItems;
  }

  function buildGroceryInterior(scene, store, palette, w, d){
    const shelfItems = [];
    const lam = (col) => new THREE.MeshLambertMaterial({color:col});
    const makeProductTex = (item) => {
      const c = document.createElement('canvas'); c.width=128; c.height=160;
      const g = c.getContext('2d');
      g.fillStyle = palette.primary; g.fillRect(0,0,128,160);
      g.fillStyle = '#ffffff'; g.fillRect(4,4,120,152);
      g.fillStyle = palette.primary; g.fillRect(8,8,112,100);
      g.font = '64px sans-serif'; g.textAlign='center'; g.textBaseline='middle';
      g.fillText(item[2]||'*', 64, 60);
      g.fillStyle = palette.accent; g.font = 'bold 22px Arial';
      g.fillText('$'+item[1], 64, 130);
      return new THREE.CanvasTexture(c);
    };
    // checkered floor
    const floorCan = document.createElement('canvas'); floorCan.width=256; floorCan.height=256;
    const fg = floorCan.getContext('2d');
    for (let i=0; i<8; i++) for (let j=0; j<8; j++){
      fg.fillStyle = ((i+j)%2===0) ? '#ffffff' : '#222222';
      fg.fillRect(i*32, j*32, 32, 32);
    }
    const floorTex = new THREE.CanvasTexture(floorCan);
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(w/4, d/4);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(w-0.2, d-0.2),
      new THREE.MeshLambertMaterial({map:floorTex}));
    floor.rotation.x = -Math.PI/2; floor.position.y = 0.01; scene.add(floor);
    // produce stands
    const produceColors = [0xff3b3b, 0xff7a1a, 0xffd84d, 0x6cd24a, 0xa83fff, 0xff9bd2];
    for (let s=0; s<3; s++){
      const bx = -w/3 + s*(w/3);
      const bin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 1.2), lam(0xc9a36a));
      bin.position.set(bx, 0.35, d/2 - 2.2); scene.add(bin);
      for (let i=0; i<10; i++){
        const sph = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6),
          lam(produceColors[(i+s)%produceColors.length]));
        sph.position.set(bx+(Math.random()-0.5)*1.4, 0.78+Math.random()*0.1, d/2-2.2+(Math.random()-0.5)*0.9);
        scene.add(sph);
      }
    }
    // pantry shelves
    const aisleZs = [-d/6, 0, d/6];
    let invIdx = 0;
    const inv = store.inv || [];
    for (let a=0; a<3; a++){
      const z = aisleZs[a];
      const unit = new THREE.Mesh(new THREE.BoxGeometry(Math.min(6, w*0.6), 2.4, 0.7), lam(0xf0f0f0));
      unit.position.set(0, 1.2, z); scene.add(unit);
      for (const yL of [0.55, 1.25, 1.95]){
        for (const side of [-1, 1]){
          for (let i=0; i<6; i++){
            if (invIdx >= inv.length) break;
            const item = inv[invIdx++];
            const tex = makeProductTex(item);
            const mats = [lam(0xdddddd),lam(0xdddddd),lam(0xdddddd),lam(0xdddddd),
              new THREE.MeshLambertMaterial({map:tex}), lam(0xdddddd)];
            if (side===-1){ mats[5]=mats[4]; mats[4]=lam(0xdddddd); }
            const box = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.25), mats);
            const px = -2.4 + i*0.55, pz = z + side*0.32;
            box.position.set(px, yL+0.2, pz); scene.add(box);
            shelfItems.push({type:'shelfItem', item, mesh:box, pos:[px, yL+0.2, pz]});
          }
        }
      }
    }
    // freezer aisle
    const freezerCount = 4, freezerSpan = w*0.7;
    const freezerStart = -freezerSpan/2 + 0.75;
    for (let f=0; f<freezerCount; f++){
      const fx = freezerStart + f*(freezerSpan/(freezerCount-1));
      const fz = -d/2 + 0.45;
      const cab = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.2, 0.8), lam(0xc0c8d0));
      cab.position.set(fx, 1.1, fz); scene.add(cab);
      const door = new THREE.Mesh(new THREE.PlaneGeometry(1.36, 2.05),
        new THREE.MeshBasicMaterial({color:0xb8e0ff, transparent:true, opacity:0.5}));
      door.position.set(fx, 1.1, fz+0.42); scene.add(door);
    }
    // checkout
    for (let lane=0; lane<2; lane++){
      const lx = (lane===0?-1:1)*2.2, lz = d/2 - 4.2;
      const beltBase = new THREE.Mesh(new THREE.BoxGeometry(2, 0.85, 0.55), lam(0xdddddd));
      beltBase.position.set(lx, 0.42, lz); scene.add(beltBase);
      const reg = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.5),
        lam(parseInt((palette.primary||'#666').replace('#',''), 16)));
      reg.position.set(lx+1.1, 1.2, lz); scene.add(reg);
    }
    // sign
    const signCan = document.createElement('canvas'); signCan.width=1024; signCan.height=256;
    const sg = signCan.getContext('2d');
    sg.fillStyle = palette.primary; sg.fillRect(0,0,1024,256);
    sg.fillStyle = palette.accent;
    sg.font = 'bold 80px Arial Black, sans-serif'; sg.textAlign='center'; sg.textBaseline='middle';
    sg.fillText((store.n||'').toUpperCase(), 512, 128);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(w*0.55, 1.2),
      new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(signCan)}));
    sign.position.set(0, 3.2, d/2 - 0.05); sign.rotation.y = Math.PI; scene.add(sign);
    return shelfItems;
  }

  function buildCafeInterior(scene, store, palette, w, d){
    const shelfItems = [];
    const primary = palette.primary || '#006241';
    const secondary = palette.secondary || '#a07a4f';
    const accent = palette.accent || '#ffffff';
    function makeTextTex(draw, ww, hh){
      const c = document.createElement('canvas'); c.width=ww; c.height=hh;
      draw(c.getContext('2d'), ww, hh);
      return new THREE.CanvasTexture(c);
    }
    const counterZ = -d/2 + 1.5;
    const counter = new THREE.Mesh(new THREE.BoxGeometry(8, 1.05, 0.9),
      new THREE.MeshLambertMaterial({color:0x3a2618}));
    counter.position.set(0, 0.525, counterZ); scene.add(counter);
    const marble = new THREE.Mesh(new THREE.PlaneGeometry(8, 0.9),
      new THREE.MeshLambertMaterial({color:0xdcd0c0}));
    marble.rotation.x = -Math.PI/2; marble.position.set(0, 1.06, counterZ); scene.add(marble);
    const caseGroup = new THREE.Group();
    const caseBody = new THREE.Mesh(new THREE.BoxGeometry(2, 0.8, 0.6),
      new THREE.MeshLambertMaterial({color:0x2a1810}));
    caseBody.position.y = 0.4; caseGroup.add(caseBody);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.8),
      new THREE.MeshBasicMaterial({color:0xb8e0ff, transparent:true, opacity:0.4}));
    glass.position.set(0, 0.4, 0.301); caseGroup.add(glass);
    caseGroup.position.set(-2.8, 1.07, counterZ + 0.1); scene.add(caseGroup);
    const items = store.inv || [];
    const cols = Math.min(5, Math.max(1, items.length));
    for (let i=0; i<items.length; i++){
      const it = items[i];
      const tex = makeTextTex((ctx, ww, hh) => {
        ctx.fillStyle = '#fff7e6'; ctx.fillRect(0,0,ww,hh);
        ctx.fillStyle = primary; ctx.font = 'bold 60px serif'; ctx.textAlign='center';
        ctx.fillText(it[2]||'', ww/2, hh*0.5);
        ctx.font = 'bold 22px Arial';
        ctx.fillText(String(it[0]).slice(0,10), ww/2, hh*0.78);
        ctx.font = 'bold 24px Arial'; ctx.fillText('$'+it[1], ww/2, hh*0.95);
      }, 128, 128);
      const mat = new THREE.MeshLambertMaterial({map:tex});
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.25), mat);
      const col = i % cols, row = Math.floor(i/cols);
      const x = -2.8 + (col-(cols-1)/2)*0.36;
      const y = 0.95 + row*0.3;
      const z = counterZ + 0.1;
      box.position.set(x, y, z); caseGroup.add(box);
      shelfItems.push({type:'shelfItem', item:it, mesh:box, pos:[x,y,z]});
    }
    // espresso machine
    const espBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.5),
      new THREE.MeshLambertMaterial({color:0xc0c0c0}));
    espBody.position.set(1.2, 1.4, counterZ); scene.add(espBody);
    // tables + chairs
    const tableMat = new THREE.MeshLambertMaterial({color:0xc9a36a});
    const pedMat = new THREE.MeshLambertMaterial({color:0x3a2618});
    const chairMat = new THREE.MeshLambertMaterial({color:primary});
    const tablePositions = [[-w/4, d/8],[w/4, d/8],[-w/4, d/3.5],[w/4, d/3.5]];
    for (const [tx, tz] of tablePositions){
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.7, 12), pedMat);
      ped.position.set(tx, 0.35, tz); scene.add(ped);
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.05, 16), tableMat);
      top.position.set(tx, 0.75, tz); scene.add(top);
      for (let cc=0; cc<2; cc++){
        const off = cc===0 ? -0.95 : 0.95;
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.05, 0.45), chairMat);
        seat.position.set(tx+off, 0.45, tz); scene.add(seat);
      }
    }
    // pendant lights
    for (let i=0; i<3; i++){
      const px = -2.5 + i*2.5;
      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.4, 12, 1, true),
        new THREE.MeshBasicMaterial({color:0xfff2c8}));
      shade.position.set(px, 3.0, counterZ); scene.add(shade);
    }
    // sign
    const signTex = makeTextTex((ctx, ww, hh) => {
      ctx.fillStyle = primary; ctx.fillRect(0,0,ww,hh);
      ctx.fillStyle = accent; ctx.font = 'bold 56px Georgia, serif';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(store.n||'Cafe', ww/2, hh/2);
    }, 1024, 200);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(w*0.45, 0.7),
      new THREE.MeshBasicMaterial({map:signTex}));
    sign.position.set(0, 3.3, d/2 - 0.05); sign.rotation.y = Math.PI; scene.add(sign);
    return shelfItems;
  }

  const STORE_BUILDERS = {
    warehouse: buildWarehouseInterior,
    boutique:  buildBoutiqueInterior,
    grocery:   buildGroceryInterior,
    cafe:      buildCafeInterior,
  };

  // ── Store flow: assignment, signage, enter, shop, exit ───────────

  let storeScene = null;
  let storeShelfItems = [];
  let inStore = false;
  let currentStoreIdx = -1;
  let storeRoom = { w: 18, d: 14 };
  let storeSnapshot = null;

  function assignStoresToFillers(){
    // Only city-grid fillers (not suburbs ring)
    const eligible = buildings3d.filter(b => b.isCityFiller);
    for (let i = 0; i < eligible.length; i++){
      eligible[i].storeIdx = i % STORES.length;
    }
  }

  function makeStoreSignTexture(name, primary, secondary){
    const c = document.createElement('canvas');
    c.width = 512; c.height = 96;
    const g = c.getContext('2d');
    g.fillStyle = primary; g.fillRect(0, 0, 512, 96);
    g.fillStyle = secondary;
    g.fillRect(0, 4, 512, 4); g.fillRect(0, 88, 512, 4);
    g.fillStyle = secondary;
    let fontSize = 44;
    if (name.length > 14) fontSize = 32;
    if (name.length > 22) fontSize = 24;
    g.font = `bold ${fontSize}px Arial Black, sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(name.toUpperCase(), 256, 48);
    return new THREE.CanvasTexture(g.canvas);
  }

  function renderStoreSigns(){
    for (const b of buildings3d){
      if (!b.isCityFiller || b.storeIdx === undefined) continue;
      const [name, , primary, secondary] = STORES[b.storeIdx];
      const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(4.5, 0.85),
        new THREE.MeshBasicMaterial({ map: makeStoreSignTexture(name, primary, secondary) })
      );
      // Place above the building, facing the nearest road
      const faceRot = nearestRoadFacingHelper(b.pos.x, b.pos.z);
      const offX = Math.sin(faceRot) * 0.42, offZ = Math.cos(faceRot) * 0.42;
      // Sign sits just outside the building at mid-height
      const yOff = (b.collideR || 3) * 0.6;
      sign.position.set(b.pos.x + offX * (b.collideR + 0.05), 4.5 + yOff*0, b.pos.z + offZ * (b.collideR + 0.05));
      sign.rotation.y = faceRot;
      scene.add(sign);
    }
  }

  function nearestRoadFacingHelper(cx, cz){
    let best = Infinity, rot = 0;
    for (const ax of AVENUES){
      const dd = Math.abs(cx - ax);
      if (dd < best){ best = dd; rot = (cx > ax) ? Math.PI/2 : -Math.PI/2; }
    }
    for (const sz of STREETS){
      const dd = Math.abs(cz - sz);
      if (dd < best){ best = dd; rot = (cz > sz) ? Math.PI : 0; }
    }
    return rot;
  }

  function enterStore(filler){
    if (!filler || filler.storeIdx === undefined) return;
    const [name, archetype, primary, secondary] = STORES[filler.storeIdx];
    const palette = { primary, secondary, accent: '#ffffff' };
    const inv = STORE_INVS[archetype] || STORE_INVS.bigbox;
    const store = { n: name, a: archetype, p: [primary, secondary], inv: inv.slice() };
    const vis = VIS_OF[archetype] || 'warehouse';
    const w = (vis === 'warehouse') ? 22 : (vis === 'grocery' ? 20 : (vis === 'cafe' ? 14 : 14));
    const d = (vis === 'warehouse') ? 18 : (vis === 'grocery' ? 16 : (vis === 'cafe' ? 12 : 12));
    storeRoom = { w, d };

    // Build a fresh interior scene
    storeScene = new THREE.Scene();
    storeScene.background = new THREE.Color(0xd8cebd);
    storeScene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const lamp = new THREE.PointLight(0xfff2c8, 1.1, 60);
    lamp.position.set(0, 3.6, 0); storeScene.add(lamp);
    const fill = new THREE.DirectionalLight(0xffffff, 0.35);
    fill.position.set(8, 12, 6); storeScene.add(fill);
    // NOTE: keep the camera in `scene` so the carried phone (child of camera) still renders outside.
    // We add a separate cloned phone to storeScene and update its transform each frame.

    // Floor
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d),
      new THREE.MeshLambertMaterial({ color: 0x8d6e63 }));
    floor.rotation.x = -Math.PI/2; storeScene.add(floor);
    // Ceiling
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(w, d),
      new THREE.MeshLambertMaterial({ color: 0xeeeeee }));
    ceil.rotation.x = Math.PI/2; ceil.position.y = 4; storeScene.add(ceil);
    // Walls
    function addWall(x, y, z, ww, hh, ry){
      const wall = new THREE.Mesh(new THREE.BoxGeometry(ww, hh, 0.2),
        new THREE.MeshLambertMaterial({ color: 0xf0e6d2 }));
      wall.position.set(x, y, z); wall.rotation.y = ry; storeScene.add(wall);
    }
    addWall( 0, 2,  d/2, w, 4, 0);
    addWall( 0, 2, -d/2, w, 4, Math.PI);
    addWall( w/2, 2, 0, d, 4,  Math.PI/2);
    addWall(-w/2, 2, 0, d, 4, -Math.PI/2);
    // Door + exit marker on south wall
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.05),
      new THREE.MeshLambertMaterial({ color: 0x4f342a }));
    door.position.set(0, 1.1, d/2 - 0.05); storeScene.add(door);

    // Archetype-specific furnishings
    const builder = STORE_BUILDERS[vis] || buildWarehouseInterior;
    storeShelfItems = builder(storeScene, store, palette, w, d);

    // Snapshot exterior + teleport into store
    storeSnapshot = { x:player.x, y:player.y, z:player.z, yaw:player.yaw, pitch:player.pitch };
    inStore = true;
    currentStoreIdx = filler.storeIdx;
    player.x = 0; player.y = 1.6; player.z = d/2 - 1.8; player.yaw = 0; player.pitch = 0;
    if (document.pointerLockElement) document.exitPointerLock();
    showToast('Entered ' + name);
  }

  function exitStore(){
    if (!inStore) return;
    inStore = false;
    currentStoreIdx = -1;
    if (storeSnapshot){
      player.x = storeSnapshot.x; player.y = storeSnapshot.y; player.z = storeSnapshot.z;
      player.yaw = storeSnapshot.yaw; player.pitch = storeSnapshot.pitch;
    }
    storeScene = null;
    storeShelfItems = [];
  }

  function findNearestStoreItem(){
    if (!inStore) return null;
    let nearest = null, best = 1.6;
    for (const si of storeShelfItems){
      const d = Math.hypot(player.x - si.pos[0], player.z - si.pos[2]);
      if (d < best){ best = d; nearest = si; }
    }
    return nearest;
  }

  function isAtStoreExit(){
    if (!inStore) return false;
    return player.z > storeRoom.d/2 - 1.8;
  }

  function buyStoreItem(si){
    const c = readGS()?.char;
    if (!c){ showToast('Game not started'); return; }
    const [name, price, icon] = si.item;
    const total = (c.checking||0) + (c.savings||0);
    if (total < price){ showToast('Not enough cash for ' + name); return; }
    if ((c.checking||0) >= price) c.checking -= price;
    else { const fromCk = c.checking||0; c.checking = 0; c.savings = (c.savings||0) - (price - fromCk); }
    if (!c.belongings) c.belongings = [];
    c.belongings.push({
      id:'b_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),
      name, icon, cost:price,
      purchasedAt: c.monthAge,
      from: STORES[currentStoreIdx]?.[0] || 'Store',
    });
    // Hide the bought item box from the shelf
    if (si.mesh && si.mesh.parent) si.mesh.parent.remove(si.mesh);
    // Remove from active list so it's no longer interactable
    const idx = storeShelfItems.indexOf(si);
    if (idx >= 0) storeShelfItems.splice(idx, 1);
    showToast(`Bought ${icon} ${name} for $${price}`);
    updateHud();
  }

  // Make these accessible to existing interact()/render code below
  window.__finlife3d_stores = {
    enterStore, exitStore, findNearestStoreItem, isAtStoreExit, buyStoreItem,
    isInStore: () => inStore, getStoreScene: () => storeScene, getStoreRoom: () => storeRoom,
    STORES, STORE_INVS, VIS_OF,
  };

  window.__finlife3d = {
    initScene, openPhone, closePhone, BUILDINGS,
    // dev/test hooks — handy for debugging viewpoint and screenshotting
    _getPlayer: () => player,
    _getScene:  () => scene,
    _getCamera: () => camera,
    _getBuildings: () => buildings3d,
    _getStores: () => STORES,
    _enterStore: enterStore,
    _exitStore: exitStore,
    _isInStore: () => inStore,
  };
})();
