# Plan: Heavy Hitters 3D — Anatomically-Realistic Fighter Joints

## Task Description
Upgrade the fighter rigs in `boxing-3d.html` so their movement looks anatomically real. The key insight from the Human Joints reference doc: every limb segment must pivot from the correct joint type — ball-and-socket at shoulder and hip (3-axis), hinge at elbow/knee/ankle (1-axis flex/extend), pivot at forearm (1-axis pronation/supination), condyloid at wrist (2-axis). Each punch animation must respect those constraints so the body moves like a real boxer, not a puppet.

## Objective
Rewrite the `createBoxer3D` rig to use a full anatomical joint hierarchy, then update every punch pose and animation to drive only the axes each joint actually allows. Result: fighters whose arms, torso, legs, and head move exactly as a real human body moves when throwing punches, blocking, dodging, and doing footwork.

## Problem Statement
The current rig has a two-group arm (`shoulder` + `forearmRot`) and a single torso lean. This means:
- Forearm pronation/supination doesn't exist (hooks and crosses look flat)
- Wrist has no own pivot (impact angle is always the same)
- Spine is one rigid block — no cross rotation or body-shot lean
- Ankle is absent — footwork floats rather than pushing off
- Hip-per-leg ball-and-socket is missing — weight shift is not reflected in leg geometry
- Head nod (atlanto-occipital) and head rotation (atlanto-axial) share one group

## Solution Approach
Replace the arm with a 4-group chain:  
`shoulder → elbow_hinge → forearm_pivot → wrist_condyloid → glove`  
Replace the torso with a 2-segment spine:  
`pelvis → lumbar → thoracic → neck (pivot+condyloid) → head`  
Add per-leg hip groups and ankle groups.  
Provide a constraint table so punch animations only rotate each joint on its legal axes. Idle animation oscillates within those same constraints for a living-breathing stance.

---

## Relevant Files

- **`boxing-3d.html`** — the only file to change; all logic is self-contained here
- **`specs/heavy-hitters-3d-realistic-fighter-joints.md`** — this plan

### New Files
None — single-file project convention.

---

## Implementation Phases

### Phase 1: Foundation — New Joint Hierarchy
Rebuild `createBoxer3D` with the full joint chain. No animation logic changes yet — just get the rig standing correctly in the guard pose using the new groups.

### Phase 2: Core Implementation — Punch Poses & Constraints
Map every punch in `PUNCH` to per-joint rotation values that respect anatomical constraints. Update `setArmPose`, all windup/active/recover target poses, and the idle sway loop.

### Phase 3: Integration & Polish
- Footwork (ankle dorsiflexion on step, knee bend on slip)
- Head reactions (atlanto-occipital nod on jab, atlanto-axial rotation on cross)
- Muscle bulge: scale ellipsoid meshes during flex (bicep scales up as elbow bends past 90°, deltoid flares during shoulder abduction)
- Confirm CPU fighter mirrors all the same poses correctly
- Mobile touch still works; no regressions

---

## Step by Step Tasks

### 1. Document the anatomical constraints table (reference while coding)

| Joint | Type | Legal axes in THREE.js | Range |
|-------|------|----------------------|-------|
| Shoulder (glenohumeral) | Ball-and-socket | X (flex/extend), Y (internal/external rotation), Z (abduct/adduct) | ~180°/60°/180° |
| Elbow (humeroulnar) | Hinge | X only (flexion = negative X in rig) | 0–145° |
| Forearm (radioulnar) | Pivot | Z only (pronation = +Z, supination = −Z) | ±80° |
| Wrist (radiocarpal) | Condyloid | X (flex/extend) + Z (radial/ulnar deviation) | ±70° / ±20° |
| Spine-lumbar | Symphysis | X (flex/extend) + Y (rotation) | ±30° / ±30° |
| Spine-thoracic | Symphysis | Y (rotation) | ±25° |
| Neck-atlanto-axial | Pivot | Y only (head turn) | ±45° |
| Neck-atlanto-occipital | Condyloid | X only (nod) | ±30° |
| Hip (acetabulofemoral) | Ball-and-socket | X (flex/extend) + Y (internal rotation) + Z (abduct) | 120°/45°/45° |
| Knee (tibiofemoral) | Hinge | X only (flexion) | 0–130° |
| Ankle (talocrural) | Hinge | X only (dorsi/plantar) | +20°/−45° |

### 2. Rebuild the arm chain in `buildArm(side)`

Replace the current two-group arm with four nested groups:

```js
// Shoulder group — ball-and-socket (3-axis)
const shoulderGrp = new THREE.Group();
shoulderGrp.position.set(0, 1.50, side * 0.23);
// upper arm mesh inside shoulderGrp, pointing -Y

// Elbow group — HINGE, only rotate X
const elbowGrp = new THREE.Group();
elbowGrp.position.y = -0.33;    // end of upper arm
shoulderGrp.add(elbowGrp);

// Forearm rotation group — PIVOT, only rotate Z
const forearmPivot = new THREE.Group();
forearmPivot.position.y = 0;    // sits at elbow joint origin
elbowGrp.add(forearmPivot);
// forearm cylinder mesh inside forearmPivot

// Wrist group — CONDYLOID, rotate X + Z only
const wristGrp = new THREE.Group();
wristGrp.position.y = -0.27;   // end of forearm
forearmPivot.add(wristGrp);
// glove group inside wristGrp
```

Return from `buildArm`: `{ shoulderGrp, elbowGrp, forearmPivot, wristGrp, glove }`

Update `setArmPose` to accept and set all four groups.

### 3. Rebuild the spine chain in `createBoxer3D`

Replace single `torso` group with three chained groups:

```js
// Pelvis/lumbar group — attach to root, holds the base of the torso
const lumbar = new THREE.Group();
lumbar.position.y = 0.95;   // top of belt
root.add(lumbar);

// Thoracic group — attaches to top of lumbar
const thoracic = new THREE.Group();
thoracic.position.y = 0.48;  // mid-spine to shoulder level
lumbar.add(thoracic);

// Neck assembly — two stacked pivots
const neckPivot = new THREE.Group();   // atlanto-axial: Y only
neckPivot.position.y = 0.55;          // at cervical vertebrae
thoracic.add(neckPivot);

const neckNod = new THREE.Group();     // atlanto-occipital: X only
neckNod.position.y = 0.06;
neckPivot.add(neckNod);

// Head group attaches to neckNod
headGroup.position.y = 0.13;
neckNod.add(headGroup);
```

Chest, pec detail, ab detail meshes go inside `thoracic`.
Waist/rib meshes go inside `lumbar`.
Arms attach to `thoracic` (not root) so they follow spine rotation.

### 4. Add per-leg hip groups and ankle groups

```js
function buildLeg(side){
  // Hip group — ball-and-socket, attached to root at pelvis height
  const hipGrp = new THREE.Group();
  hipGrp.position.set(0, 0.92, side * 0.13);
  root.add(hipGrp);

  // thigh mesh inside hipGrp, pointing -Y

  // Knee group — HINGE, X only
  const kneeGrp = new THREE.Group();
  kneeGrp.position.y = -0.51;
  hipGrp.add(kneeGrp);

  // calf mesh inside kneeGrp

  // Ankle group — HINGE, X only
  const ankleGrp = new THREE.Group();
  ankleGrp.position.y = -0.33;
  kneeGrp.add(ankleGrp);

  // boot mesh inside ankleGrp

  return { hipGrp, kneeGrp, ankleGrp };
}
```

### 5. Update guard pose to use anatomically correct joint angles

Orthodox stance (player):
```js
// LEFT (lead) arm — jab hand, close guard
armL.shoulderGrp.rotation.set(-0.30, 0, 1.35);     // shoulder: forward+abduct
armL.elbowGrp.rotation.set(-1.05, 0, 0);            // HINGE only: ~60° flexion
armL.forearmPivot.rotation.set(0, 0, -0.30);        // slight supination (palm faces you)
armL.wristGrp.rotation.set(0.10, 0, 0);             // slight flexion

// RIGHT (rear) arm — power hand, chin tucked
armR.shoulderGrp.rotation.set( 0.25, 0, 1.40);
armR.elbowGrp.rotation.set(-1.20, 0, 0);            // more flexed, hand near chin
armR.forearmPivot.rotation.set(0, 0, -0.25);
armR.wristGrp.rotation.set(0.08, 0, 0);

// Spine — slight forward lean
lumbar.rotation.set(0.08, 0, 0);
thoracic.rotation.set(0.04, 0.08, 0);  // slight left rotation (orthodox)

// Legs — boxing stance: knees soft
legL.hipGrp.rotation.set(0.05, 0, 0);
legL.kneeGrp.rotation.set(-0.18, 0, 0);
legL.ankleGrp.rotation.set(0.14, 0, 0);  // slight dorsiflexion
legR.hipGrp.rotation.set(0.05, 0, 0);
legR.kneeGrp.rotation.set(-0.20, 0, 0);
legR.ankleGrp.rotation.set(0.14, 0, 0);
```

### 6. Rewrite punch target poses respecting joint constraints

Replace all `shoulderRot/forearmRot` 2-group objects with 4-group objects. Key poses per punch type:

**Jab (lead arm extends forward):**
```js
// Shoulder flexes forward (shoulder X toward -0.05), stays mostly neutral
shoulderGrp: [-0.05, 0, 1.25]    // almost no abduct, slight forward flex
elbowGrp:   [-0.15, 0, 0]        // nearly full extension (HINGE only)
forearmPivot:[0, 0, 1.40]        // PRONATION: fist rotates palm-down at impact
wristGrp:   [0, 0, -0.10]        // radial deviation at impact (natural)
```

**Cross (rear arm, hip rotation drives it):**
```js
// lumbar.rotation.y += -0.45 (toward opponent)
// thoracic.rotation.y += -0.35
shoulderGrp: [-0.05, -0.35, 1.20]  // shoulder internally rotates with cross
elbowGrp:   [-0.10, 0, 0]          // near full extension
forearmPivot:[0, 0, 1.55]          // full pronation
wristGrp:   [0, 0, -0.08]
```

**Hook (shoulder horizontal adduction, elbow stays bent):**
```js
shoulderGrp: [0, -0.60, 0.70]     // Y rotation = horizontal adduction
elbowGrp:   [-1.50, 0, 0]         // HINGE stays at ~90° — hook NEVER straightens fully
forearmPivot:[0, 0, 0.30]         // slight pronation
wristGrp:   [-0.10, 0, 0]         // slight extension (knuckles forward)
```

**Uppercut (elbow flexion increases, shoulder flexes up):**
```js
// Hip flexion first frame, then extends to drive power
shoulderGrp: [-0.80, 0, 0.60]    // shoulder flexes strongly upward
elbowGrp:   [-0.60, 0, 0]        // elbow bends MORE than guard (driving up)
forearmPivot:[0, 0, -0.80]       // supination: palm faces fighter = classic uppercut grip
wristGrp:   [-0.20, 0, 0]        // slight flexion
```

**Overhand (arc over top):**
```js
shoulderGrp: [-0.25, 0.50, 0.90] // shoulder abducts + externally rotates (wind-back)
elbowGrp:   [-0.80, 0, 0]        // mid-flexion during arc
forearmPivot:[0, 0, 0.80]        // pronation at impact
wristGrp:   [0, 0, -0.05]
```

**Body shot (shoulder drops, lumbar side-bends):**
```js
// lumbar.rotation.z = ±0.25 (side bend toward throwing arm)
shoulderGrp: [0.30, 0, 1.60]    // shoulder drops down (Z abduct increases = arm goes down)
elbowGrp:   [-1.10, 0, 0]       // moderate flex
forearmPivot:[0, 0, 1.20]       // pronation
wristGrp:   [0.15, 0, 0]        // slight flexion (drives knuckles into ribs)
```

**Haymaker (full windup, shoulder externally rotates all the way back):**
```js
// windup: shoulder externally rotates, pulls back
shoulderGrp: [0.45, 0.80, 1.10]  // external rotation + extension = cocked
elbowGrp:   [-1.20, 0, 0]
forearmPivot:[0, 0, -0.70]       // supination in windup
// impact: snaps to full pronation with shoulder internally rotating
shoulderGrp: [-0.10, -0.70, 0.85]
forearmPivot:[0, 0, 1.60]
```

### 7. Update the animation interpolation system

The current system lerps `shoulder.rotation` and `forearmRot.rotation`. Extend it to lerp all 4 arm groups plus spine segments per frame. Store punch state as:
```js
{
  shoulderRot: [x,y,z],
  elbowRot:    [x,0,0],       // enforce hinge: always y=0, z=0
  forearmRot:  [0,0,z],       // enforce pivot: always x=0, y=0
  wristRot:    [x,0,z],       // enforce condyloid: always y=0
  lumbarRot:   [x,y,0],
  thoracicRot: [0,y,0],
}
```

Helper `enforcedLerp(group, target, t)` — lerps but zeroes out illegal axes.

### 8. Add ankle and knee animation during footwork

In the player/CPU movement update (where `root.position` changes per WASD):
- Forward step (+X): `ankleGrp.rotation.x = -0.25` (dorsiflexion push-off), `kneeGrp.rotation.x = -0.15`
- Retreat (-X): `ankleGrp.rotation.x = 0.35` (plantarflexion push), `kneeGrp.rotation.x = -0.10`
- Slip/dodge: `kneeGrp.rotation.x = -0.35` (deep knee bend), `hipGrp.rotation.x = 0.20` (hip flex)
- Return to guard: all ease back via lerp in update loop

### 9. Add head reaction split by joint type

When player/CPU is hit:
- Head punch → `neckNod.rotation.x` snaps +0.35 (atlanto-occipital nod: head snaps back), then eases to 0. **Never** rotate Y here.
- Cross or hook → `neckPivot.rotation.y` snaps ±0.55 (atlanto-axial turn: head spins), then eases.
- Uppercut → `neckNod.rotation.x` snaps +0.55 (larger nod = "lights out" snap).

### 10. Add muscle bulge geometry scaling

In the animation update loop, drive mesh scales based on joint angle:
```js
// Bicep bulge: grows when elbow flexes
const elbowFlex = Math.abs(elbowGrp.rotation.x);  // 0=straight, 1.5=fully bent
bicepMesh.scale.y = 1.0 + elbowFlex * 0.25;
bicepMesh.scale.x = 1.0 + elbowFlex * 0.15;

// Deltoid flare: grows when shoulder abducts
const shoulderAbduct = Math.abs(shoulderGrp.rotation.z - 1.35);  // deviation from guard
deltoidMesh.scale.x = 1.0 + shoulderAbduct * 0.20;

// Quad (thigh front): grows when knee bends
const kneeFlex = Math.abs(kneeGrp.rotation.x);
quadMesh.scale.x = 1.0 + kneeFlex * 0.18;

// Calf (gastrocnemius): grows on plantarflexion
const plantarFlex = Math.max(0, ankleGrp.rotation.x - 0.1);
calfMesh.scale.x = 1.0 + plantarFlex * 0.22;
```

Add bicep, deltoid, quad, calf as separate ellipsoid meshes alongside the existing cylinder segments.

### 11. Update idle sway loop to use joint-constrained animation

The current idle probably oscillates `torso.rotation`. Replace:
```js
// Breathing sway — shoulders alternate in opposition (realistic boxer bob)
const breathT = Math.sin(t * 1.8);
lumbar.rotation.x = 0.08 + breathT * 0.02;         // slight anterior sway
thoracic.rotation.y = 0.08 + breathT * 0.04;        // thoracic twist

// Shoulder bob: lead shoulder slightly up-down
armL.shoulderGrp.rotation.z = 1.35 - breathT * 0.06;
armR.shoulderGrp.rotation.z = 1.40 + breathT * 0.04;

// Knee bob: soft knees pump slightly
const kneeT = Math.abs(Math.sin(t * 1.8));
legL.kneeGrp.rotation.x = -0.18 - kneeT * 0.06;
legR.kneeGrp.rotation.x = -0.20 - kneeT * 0.05;
```

### 12. Mirror CPU fighter pose correctly

CPU fighter faces -X (rotation.y = 0 or Math.PI depending on convention). The CPU arm mapping mirrors Z-axis: `side * -1` for all Z-component rotations. Verify guard pose, all punch poses, and idle sway produce a mirror image.

### 13. Validate in browser

- Open `http://localhost:3000/boxing-3d.html`
- Check guard pose: both fighters stand in natural orthodox/southpaw stance
- Throw each punch type: verify arm chain bends at correct joints only
- Dodge: knees bend, ankles dorsiflex
- Take a hit: head snaps on correct axis per hit zone
- No z-fighting or limb interpenetration at extreme poses
- Mobile touch controls still send all punches correctly

---

## Testing Strategy

- Visual inspection is the primary test — anatomy is correct if it looks right
- Cross + hook: confirm elbow never fully straightens on hook (illegal for a hook)
- Uppercut: confirm palm faces the fighter (supination) not the floor (pronation)  
- Body shot: confirm lumbar side-bends, shoulder drops — not the entire spine rotating
- Head nod vs. head turn: they must never happen on the same axis
- Footwork: step forward triggers ankle/knee animation, not just root translation

---

## Acceptance Criteria

- [ ] Each arm has 4 pivot groups: shoulder (3-axis), elbow (hinge: x only), forearm (pivot: z only), wrist (condyloid: x+z only)
- [ ] Spine has 2 segments (lumbar + thoracic) plus separate atlanto-axial and atlanto-occipital neck pivots
- [ ] Elbow never rotates on Y or Z axis in any punch animation
- [ ] Hook punch leaves elbow at ≥ 80° flexion (never fully extends)
- [ ] Uppercut has forearm supinated (palm toward fighter = negative Z forearm rotation)
- [ ] Cross drives lumbar + thoracic Y rotation before arm extends
- [ ] Head: jab/cross reactions use atlanto-occipital nod (X); hook reactions use atlanto-axial turn (Y)
- [ ] Ankle dorsiflexion visible on forward step footwork
- [ ] Bicep mesh visibly scales larger when elbow flexes past 90°
- [ ] Game plays identically on mobile — no control regressions

---

## Validation Commands

```
# Start dev server (if not already running)
cd "C:\Users\noahm\Project" && npx browser-sync start --server --files "*.html" --port 3000

# Open in browser:
http://localhost:3000/boxing-3d.html
```

No automated tests exist — validate visually per the Testing Strategy above.

---

## Notes

- The file is ~1690 lines. The joint hierarchy rebuild (steps 2-4) touches `createBoxer3D` (lines ~427-692). The animation lerp update is in the game loop (search for `setArmPose` and the animation tick at the bottom of the file).
- Three.js `Group.rotation` uses Euler XYZ by default — this matches the constraint table above.
- The `enforcedLerp` helper in step 7 is the single most important correctness guard — without it, the lerp system will gradually introduce illegal rotations as poses compound.
- Keep `side` parameter in `buildArm` — it flips Z-sign for left vs right arm. With the new 4-group chain the sign flip only applies to `shoulderGrp.position.z` and `wristGrp.rotation.z` (radial/ulnar deviation mirrors between hands). Pronation/supination direction is the same for both arms.
- Haymaker windup deliberately uses external rotation (illegal in strict hinge sense for elbow) only in the SHOULDER, not the elbow. The elbow stays at ~1.20 rad flexion throughout the haymaker arc — only shoulder and spine drive the wind-back.
