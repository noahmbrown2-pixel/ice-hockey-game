'use strict';
// ─────────────────────────────────────────────
//  Three.js scene
// ─────────────────────────────────────────────
const canvas = document.getElementById('game3d');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setClearColor(0x0a0a0a);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);

// Camera state for third-person follow
const camPos = new THREE.Vector3(0, 3.0, 8.5);
const camTarget = new THREE.Vector3(0, 1.5, 0);
const camDesiredPos = new THREE.Vector3();
const camDesiredTarget = new THREE.Vector3();
camera.position.copy(camPos);
camera.lookAt(camTarget);

function fitRenderer(){
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', fitRenderer);
fitRenderer();

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.55));
const sun = new THREE.DirectionalLight(0xfff2c8, 0.85);
sun.position.set(6, 14, 8);
scene.add(sun);
const spot = new THREE.PointLight(0xfff2c8, 0.8, 16);
spot.position.set(0, 5, 0);
scene.add(spot);
const back = new THREE.PointLight(0xff7a3a, 0.35, 18);
back.position.set(0, 3, -5);
scene.add(back);
const backBaseIntensity = 0.35;
let backPulse = 0;

// Sky
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(50, 24, 12),
  new THREE.MeshBasicMaterial({ color: 0x1a0d0d, side: THREE.BackSide })
);
scene.add(sky);

// Crowd
function buildCrowd(){
  const grp = new THREE.Group();
  for (let i = 0; i < 200; i++){
    const a = (i / 200) * Math.PI * 2;
    const r = 7.5 + Math.random() * 2.5;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const tier = Math.floor(Math.random() * 3);
    const yBase = 0.5 + tier * 0.6;
    const col = Math.random() < 0.4 ? 0x331a1a : (Math.random() < 0.5 ? 0x222 : 0x442222);
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.55, 6),
      new THREE.MeshLambertMaterial({ color: col })
    );
    body.position.set(x, yBase + 0.27, z);
    grp.add(body);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 6, 5),
      new THREE.MeshLambertMaterial({ color: 0xc88a55 })
    );
    head.position.set(x, yBase + 0.65, z);
    grp.add(head);
  }
  scene.add(grp);
  return grp;
}
const crowd = buildCrowd();

// Arena floor
const arenaFloor = new THREE.Mesh(
  new THREE.CircleGeometry(15, 48),
  new THREE.MeshLambertMaterial({ color: 0x0d0606 })
);
arenaFloor.rotation.x = -Math.PI/2;
arenaFloor.position.y = -0.02;
scene.add(arenaFloor);

// Ring
function buildRing(){
  const grp = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(7.4, 0.4, 7.4),
    new THREE.MeshLambertMaterial({ color: 0x2a1a14 })
  );
  base.position.y = -0.2;
  grp.add(base);
  const apronCanvas = document.createElement('canvas');
  apronCanvas.width = 256; apronCanvas.height = 32;
  const ax = apronCanvas.getContext('2d');
  ax.fillStyle = '#cc0000'; ax.fillRect(0, 0, 256, 32);
  ax.fillStyle = '#ffd700';
  ax.font = 'bold 22px Arial Black, sans-serif';
  ax.textAlign = 'center'; ax.textBaseline = 'middle';
  ax.fillText('★ HEAVY HITTERS ★ HEAVY HITTERS ★ HEAVY HITTERS ★', 128, 17);
  const apronTex = new THREE.CanvasTexture(apronCanvas);
  apronTex.wrapS = THREE.RepeatWrapping;
  apronTex.repeat.x = 2;
  const apron = new THREE.Mesh(
    new THREE.BoxGeometry(7.45, 0.4, 7.45),
    new THREE.MeshLambertMaterial({ map: apronTex })
  );
  apron.position.y = -0.2;
  apron.scale.set(1.001, 1.0, 1.001);
  grp.add(apron);
  const matCanvas = document.createElement('canvas');
  matCanvas.width = 512; matCanvas.height = 512;
  const mc = matCanvas.getContext('2d');
  mc.fillStyle = '#1a4a8a'; mc.fillRect(0, 0, 512, 512);
  mc.strokeStyle = '#ffd700'; mc.lineWidth = 8;
  mc.beginPath(); mc.arc(256, 256, 100, 0, Math.PI*2); mc.stroke();
  mc.fillStyle = '#ffd700';
  mc.font = 'bold 64px Arial Black, sans-serif';
  mc.textAlign = 'center'; mc.textBaseline = 'middle';
  mc.fillText('HH', 256, 256);
  mc.fillStyle = '#cc0000';
  mc.beginPath(); mc.moveTo(0, 0); mc.lineTo(140, 0); mc.lineTo(0, 140); mc.fill();
  mc.beginPath(); mc.moveTo(512, 512); mc.lineTo(372, 512); mc.lineTo(512, 372); mc.fill();
  mc.fillStyle = '#0066cc';
  mc.beginPath(); mc.moveTo(512, 0); mc.lineTo(372, 0); mc.lineTo(512, 140); mc.fill();
  mc.beginPath(); mc.moveTo(0, 512); mc.lineTo(140, 512); mc.lineTo(0, 372); mc.fill();
  const matTex = new THREE.CanvasTexture(matCanvas);
  const mat = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 6),
    new THREE.MeshLambertMaterial({ map: matTex })
  );
  mat.rotation.x = -Math.PI/2;
  mat.position.y = 0.005;
  grp.add(mat);
  const postPositions = [[ 3.1, 3.1], [-3.1, 3.1], [-3.1, -3.1], [3.1, -3.1]];
  for (const [px, pz] of postPositions){
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.10, 1.85, 8),
      new THREE.MeshLambertMaterial({ color: 0x3a2614 })
    );
    post.position.set(px, 0.92, pz);
    grp.add(post);
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.18, 0.32),
      new THREE.MeshLambertMaterial({ color: 0xffd700 })
    );
    cap.position.set(px, 1.93, pz);
    grp.add(cap);
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 1.6, 8),
      new THREE.MeshLambertMaterial({ color: (px > 0 ? 0x0066cc : 0xcc0000) })
    );
    pad.position.set(px, 0.85, pz);
    grp.add(pad);
  }
  const ropeColors = [0xcc0000, 0xffd700, 0x0066cc];
  for (let lvl = 0; lvl < 3; lvl++){
    const y = 0.85 + lvl * 0.42;
    const col = ropeColors[lvl];
    const frontRope = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 6.2, 8),
      new THREE.MeshLambertMaterial({ color: col })
    );
    frontRope.rotation.z = Math.PI/2;
    frontRope.position.set(0, y, 3.1);
    grp.add(frontRope);
    const backRope = frontRope.clone();
    backRope.position.set(0, y, -3.1);
    grp.add(backRope);
    const leftRope = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 6.2, 8),
      new THREE.MeshLambertMaterial({ color: col })
    );
    leftRope.rotation.x = Math.PI/2;
    leftRope.position.set(-3.1, y, 0);
    grp.add(leftRope);
    const rightRope = leftRope.clone();
    rightRope.position.set(3.1, y, 0);
    grp.add(rightRope);
  }
  scene.add(grp);
  return grp;
}
const ring = buildRing();

// Overhead lamps
for (const pos of [[-2, 5, -2], [2, 5, -2], [-2, 5, 2], [2, 5, 2]]){
  const lampHousing = new THREE.Mesh(
    new THREE.ConeGeometry(0.3, 0.4, 8),
    new THREE.MeshLambertMaterial({ color: 0x222 })
  );
  lampHousing.position.set(...pos);
  scene.add(lampHousing);
  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0xfff2c8 })
  );
  lamp.position.set(pos[0], pos[1] - 0.2, pos[2]);
  scene.add(lamp);
}

