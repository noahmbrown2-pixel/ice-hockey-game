'use strict';
const T = THREE;

// ─────────────────────────────────────────────
//  Renderer / scene / camera
// ─────────────────────────────────────────────
const canvas = document.getElementById('scene');
const renderer = new T.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFSoftShadowMap;

const scene = new T.Scene();
scene.background = new T.Color(0x05070a);
scene.fog = new T.Fog(0x05070a, 16, 34);

const camera = new T.PerspectiveCamera(55, 1, 0.1, 200);
camera.position.set(0, 4, -9);

function resize(){
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize); resize();

// Lights
scene.add(new T.AmbientLight(0x4a5566, 0.7));
const key = new T.DirectionalLight(0xffffff, 1.5);
key.position.set(6, 14, 4);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 1; key.shadow.camera.far = 40;
key.shadow.camera.left = -12; key.shadow.camera.right = 12;
key.shadow.camera.top = 12; key.shadow.camera.bottom = -12;
scene.add(key);
const rim = new T.DirectionalLight(0xff5a5a, 0.5); rim.position.set(-8, 6, -6); scene.add(rim);
const rim2 = new T.DirectionalLight(0x5a9bff, 0.5); rim2.position.set(8, 6, 8); scene.add(rim2);
// overhead cage spotlights
const spot = new T.SpotLight(0xffffff, 2.2, 30, Math.PI/3.2, 0.5, 1.2);
spot.position.set(0, 16, 0); spot.target.position.set(0,0,0);
scene.add(spot); scene.add(spot.target);

// ─────────────────────────────────────────────
//  Octagon cage
// ─────────────────────────────────────────────
const R = 6.2;            // octagon radius
const FENCE_H = 3.4;
function octVerts(r){
  const v = [];
  for (let i = 0; i < 8; i++){
    const a = Math.PI/8 + i * Math.PI/4;
    v.push(new T.Vector3(Math.cos(a)*r, 0, Math.sin(a)*r));
  }
  return v;
}
function makeChainTexture(){
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  g.clearRect(0,0,128,128);
  g.strokeStyle = 'rgba(150,160,172,0.55)'; g.lineWidth = 2;
  for (let i=-128;i<256;i+=18){ g.beginPath(); g.moveTo(i,0); g.lineTo(i+128,128); g.stroke();
    g.beginPath(); g.moveTo(i,128); g.lineTo(i+128,0); g.stroke(); }
  const tex = new T.CanvasTexture(c); tex.wrapS = tex.wrapT = T.RepeatWrapping; tex.repeat.set(3,2);
  return tex;
}
function buildCage(){
  const cage = new T.Group();

  // Mat (octagon)
  const matGeo = new T.CircleGeometry(R + 0.6, 8);
  const matMat = new T.MeshStandardMaterial({ color: 0x2c343d, roughness: 0.9 });
  const mat = new T.Mesh(matGeo, matMat);
  mat.rotation.x = -Math.PI/2; mat.rotation.z = Math.PI/8; mat.receiveShadow = true;
  cage.add(mat);

  // Center logo (canvas texture)
  const lc = document.createElement('canvas'); lc.width = lc.height = 512;
  const lg = lc.getContext('2d');
  lg.translate(256,256);
  lg.strokeStyle = 'rgba(255,59,59,0.7)'; lg.lineWidth = 14;
  function octPath(rad){ lg.beginPath(); for(let i=0;i<8;i++){const a=Math.PI/8+i*Math.PI/4;const px=Math.cos(a)*rad,py=Math.sin(a)*rad;i?lg.lineTo(px,py):lg.moveTo(px,py);} lg.closePath(); }
  octPath(210); lg.stroke();
  lg.strokeStyle='rgba(255,210,59,0.6)'; lg.lineWidth=8; octPath(150); lg.stroke();
  lg.strokeStyle='rgba(255,255,255,0.12)'; lg.lineWidth=4;
  lg.beginPath(); lg.moveTo(-200,0); lg.lineTo(200,0); lg.moveTo(0,-200); lg.lineTo(0,200); lg.stroke();
  lg.fillStyle='rgba(255,255,255,0.22)'; lg.font='900 78px Arial Black'; lg.textAlign='center'; lg.textBaseline='middle';
  lg.fillText('CAGE FURY', 0, -10);
  lg.fillStyle='rgba(255,59,59,0.5)'; lg.font='700 34px Arial'; lg.fillText('★ THE OCTAGON ★', 0, 56);
  const logoTex = new T.CanvasTexture(lc);
  const logo = new T.Mesh(new T.CircleGeometry(4.4, 48), new T.MeshBasicMaterial({ map: logoTex, transparent: true }));
  logo.rotation.x = -Math.PI/2; logo.position.y = 0.02; cage.add(logo);

  // Fence panels + posts (black)
  const verts = octVerts(R);
  const chainTex = makeChainTexture();
  const fenceMat = new T.MeshBasicMaterial({ map: chainTex, transparent: true, side: T.DoubleSide, opacity: 0.55, depthWrite: false });
  const postMat = new T.MeshStandardMaterial({ color: 0x050505, roughness: 0.6, metalness: 0.2 });
  const railMat = new T.MeshStandardMaterial({ color: 0x000000, roughness: 0.5 });
  for (let i = 0; i < 8; i++){
    const a = verts[i], b = verts[(i+1)%8];
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const len = a.distanceTo(b);
    const ang = Math.atan2(b.x - a.x, b.z - a.z);
    // panel
    const panel = new T.Mesh(new T.PlaneGeometry(len, FENCE_H), fenceMat);
    panel.position.set(mid.x, FENCE_H/2, mid.z);
    panel.rotation.y = ang + Math.PI/2;
    cage.add(panel);
    // (no solid backing — fence is see-through wire only)
    // top rail
    const rail = new T.Mesh(new T.BoxGeometry(len, 0.16, 0.16), railMat);
    rail.position.set(mid.x, FENCE_H, mid.z); rail.rotation.y = ang + Math.PI/2; cage.add(rail);
    // post at vertex
    const post = new T.Mesh(new T.CylinderGeometry(0.13, 0.13, FENCE_H + 0.3, 12), postMat);
    post.position.set(a.x, (FENCE_H+0.3)/2, a.z); post.castShadow = true; cage.add(post);
    const cap = new T.Mesh(new T.CylinderGeometry(0.16,0.16,0.18,12), new T.MeshStandardMaterial({color:0xff3b3b}));
    cap.position.set(a.x, FENCE_H+0.3, a.z); cage.add(cap);
  }
  // floor outside the cage
  const out = new T.Mesh(new T.CircleGeometry(40, 48), new T.MeshStandardMaterial({ color: 0x0a0b0d, roughness: 1 }));
  out.rotation.x = -Math.PI/2; out.position.y = -0.05; out.receiveShadow = true; cage.add(out);

  scene.add(cage);
}
buildCage();

// ─────────────────────────────────────────────
//  Fighter rig (muscular, capsule limbs)
// ─────────────────────────────────────────────
