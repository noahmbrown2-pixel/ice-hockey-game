function applyPose(b, dt){
  const tgt = (b.action==='downed'||b.action==='mount') ? null : computePose(b);
  if (!tgt) return; // ground handled separately
  if (!b.cur.shLx){ Object.assign(b.cur, tgt); } // init
  const k = 1 - Math.exp(-18*dt);
  for (const key in tgt){ b.cur[key] = (b.cur[key]??tgt[key]) + (tgt[key]-(b.cur[key]??tgt[key]))*k; }
  const P = b.parts, c = b.cur;
  // KO ragdoll
  if (b.action==='ko'){ const pr=Math.min(1,b.actionT/0.6);
    b.root.rotation.x = -pr*1.3; b.root.position.y = pr*0.1; }
  else b.root.rotation.x = 0;
  P.torso.rotation.set(c.torsoX, c.torsoY, c.torsoZ);
  P.shL.rotation.set(c.shLx,0,c.shLz); P.elL.rotation.x=c.elL;
  P.shR.rotation.set(c.shRx,0,c.shRz); P.elR.rotation.x=c.elR;
  P.hipL.rotation.set(c.hipLx,0,c.hipLz); P.knL.rotation.x=c.knL;
  P.hipR.rotation.set(c.hipRx,0,c.hipRz); P.knR.rotation.x=c.knR;
  // leg locomotion — forward/back gait + lateral shuffle while strafing
  if (b.action==='idle' || b.action==='block'){
    const gait = Math.sin(b.legPhase*Math.PI*2);
    const fAmt = Math.min(1, Math.abs(b.moveF||0));
    const sAmt = Math.min(1, Math.abs(b.moveS||0));
    // W/S — legs swing forward & back
    P.hipL.rotation.x += gait*0.4*fAmt;
    P.hipR.rotation.x -= gait*0.4*fAmt;
    // A/D — legs step out & in to the side (lateral shuffle)
    P.hipL.rotation.z += gait*0.38*sAmt;
    P.hipR.rotation.z -= gait*0.38*sAmt;
    // lift the trailing knee so the step reads as a real step
    P.knL.rotation.x += Math.max(0, gait)*0.45*(fAmt+sAmt);
    P.knR.rotation.x += Math.max(0,-gait)*0.45*(fAmt+sAmt);
  }
  // no hop — fighters stay flat-footed and grounded
  const bounce = 0;
  // keep the soles flat on the mat through every step — counter-rotate each foot
  // against its leg's accumulated pitch so the sole plants instead of pointing
  if (b.action!=='ko'){
    P.footL.rotation.x = -(P.hipL.rotation.x + P.knL.rotation.x);
    P.footR.rotation.x = -(P.hipR.rotation.x + P.knR.rotation.x);
    P.footL.rotation.z = -P.hipL.rotation.z;   // keep soles flat against the wide splay
    P.footR.rotation.z = -P.hipR.rotation.z;
  }
  // apply transform — lunge drives strikes into the target; lift raises high kicks
  const fdir = { x:Math.sin(b.yaw), z:Math.cos(b.yaw) };
  const lunge = c.lunge || 0;
  b.root.position.x = b.x + fdir.x*lunge;
  b.root.position.z = b.z + fdir.z*lunge;
  b.root.position.y = b.jumpY + (c.rootDip||0) + (c.lift||0) + bounce;
  b.root.rotation.y = b.yaw;
}

function poseGround(g){
  const bot=g.bottom, top=g.top;
  // bottom lies on back
  const mid = { x:(bot.x+top.x)/2, z:(bot.z+top.z)/2 };
  bot.root.position.set(mid.x-Math.sin(top.yaw)*0.4, 0.32, mid.z-Math.cos(top.yaw)*0.4);
  bot.root.rotation.set(-Math.PI/2*0.92, top.yaw, 0);
  const Pb=bot.parts;
  Pb.torso.rotation.set(0,0,0);
  Pb.shL.rotation.set(-0.6,0,0.6); Pb.elL.rotation.x=-1.6;
  Pb.shR.rotation.set(-0.6,0,-0.6); Pb.elR.rotation.x=-1.6;
  Pb.hipL.rotation.set(-1.0,0,0.3); Pb.knL.rotation.x=1.2;
  Pb.hipR.rotation.set(-1.0,0,-0.3); Pb.knR.rotation.x=1.2;
  // top mounted, kneeling, pounding
  top.root.position.set(mid.x+Math.sin(top.yaw)*0.3, 0.25, mid.z+Math.cos(top.yaw)*0.3);
  top.root.rotation.set(0, top.yaw, 0);
  const Pt=top.parts;
  // mounted top fighter — rear the fist overhead then hammer straight down, alternating hands
  let raise=0, slam=0; const isElbow = g.tAction==='elbow';
  if (g.tAction!=='idle'){ const pr=g.tT/g.tDur; raise=Math.min(1,pr/0.4); slam=pr<0.4?0:Math.min(1,(pr-0.4)/0.45); }
  Pt.torso.rotation.set(0.42 + slam*0.45, 0, 0);   // drop the bodyweight into the slam
  Pt.hipL.rotation.set(-1.6,0,0.3); Pt.knL.rotation.x=1.8;
  Pt.hipR.rotation.set(-1.6,0,-0.3); Pt.knR.rotation.x=1.8;
  const swingX = -1.2 - raise*1.5 + slam*2.6;                       // overhead on windup → drive down
  const swingE = isElbow ? (-2.3 + slam*0.4) : (-1.7 + slam*1.7);   // elbow point stays bent; punch extends
  if (g.poundSide){   // right fist hammers, left hand posts for balance
    Pt.shR.rotation.set(swingX,0,-0.2); Pt.elR.rotation.x=swingE;
    Pt.shL.rotation.set(-0.85,0,0.35);  Pt.elL.rotation.x=-1.0;
  } else {            // left fist hammers, right hand posts
    Pt.shL.rotation.set(swingX,0,0.2);  Pt.elL.rotation.x=swingE;
    Pt.shR.rotation.set(-0.85,0,-0.35); Pt.elR.rotation.x=-1.0;
  }
}

// ─────────────────────────────────────────────
//  Camera (third person, behind player)
// ─────────────────────────────────────────────
