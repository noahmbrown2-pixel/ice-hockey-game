# Plan: Home Interior Rooms, Belongings Visualizer, Shower Mechanic, City Polish

**Type:** feature · **Complexity:** complex
**Target file:** `finlife-3d.html` (single self-contained HTML game)

## Task Description

Pressing **F** on the Home building should no longer just open a "sleep" modal — it should bring the player into a real 3D interior **room** sized and furnished according to the value of their current property. The room must contain a complete checklist of housing essentials (structure, bedroom, kitchen, bathroom, safety, comfort, cleaning, utilities). Player belongings purchased throughout the game (`GS.char.belongings`) must appear inside the room at sensible locations (clothes in the closet, computer on the desk, tools in the car/garage).

A **shower** must be present in the bathroom: standing on it and pressing F counts as a daily shower. Skipping showers reduces **health and happiness by 2 each game tick (month)** the shower is missed, until the player showers again.

Additionally, the city must be **denser at its center** (a "downtown core" of taller skyscrapers around the origin), and **every action building's entrance must face the nearest road** instead of facing the island center as it does today.

## Objective

When the player walks up to Home and presses **F**:
1. They are seamlessly teleported into a 3D walkable interior whose **size and quality scale with `GS.char.houseValue` / `inv.properties.livedIn`**.
2. The interior contains every required essential (full list below) placed in its correct sub-zone.
3. Items in `GS.char.belongings` are visualized as small meshes/icons in the appropriate zone.
4. A shower is interactable; missing it causes a daily penalty until the next shower.
5. Pressing F on the interior door returns the player to the world at the Home doorstep.

Beyond Home: a downtown skyline emerges in the central blocks, and every shop/office/etc.'s door points at a road, not at the island center.

## Problem Statement

Currently `finlife-3d.html` treats Home as a single billboard-faced cube whose only function is to open a sleep dialog. That underserves the user's ambition for the player to *live* in a home that grows with their finances. Belongings purchased through the existing finance simulator (`btn-belongings`, Real Estate, etc.) accumulate in `GS.char.belongings` as a flat list — invisible in the world. Hygiene is also entirely abstract; the user wants a tangible mechanic that punishes neglect.

Visually, the city's central blocks render with the same mid-rise filler density as the suburbs, and action buildings rotate to face origin (looks unnatural — an entrance on the back of the lot when origin is "behind" the lot's road frontage).

## Solution Approach

1. **Dual-scene architecture**: keep the exterior `scene` exactly as it is. Build a separate `interiorScene` lazily when the player first enters Home. Single shared `camera`/`renderer`. A boolean `inInterior` decides which scene gets rendered each frame and which collision array is used.
2. **Tier table** maps `houseValue` → room size + feature set. Tier upgrades = bigger room, more zones, nicer furniture.
3. **Essentials registry**: declarative list of `{id, zone, builder(group, x, z, qual)}`. The room generator walks this list and places every required item at zone-specific anchor points.
4. **Belongings placement**: a regex-based classifier maps each `belongings[]` entry to a zone (`closet`, `desk`, `garage`, `shelf`, `wall`, `dresser`). Renders each as a small canvas-textured sprite/box at a free anchor in that zone.
5. **Shower mechanic**: `c.lastShowerMonth` field added to char state. A wrapper around `#btn-age` post-tick subtracts 2/2 from `c.health`/`c.happiness` per missed month. Standing on the shower mesh and pressing F resets the counter and emits a "fresh" buff toast.
6. **Downtown core**: a new `buildDowntownCore()` pass spawns 6–10 tall skyscrapers (40–80m) with neon billboards in the four central lots adjacent to origin, reusing the existing skyscraper geometry from `buildBuilding`.
7. **Road-facing rotation**: replace the existing `Math.atan2(-cfg.pos[0], -cfg.pos[1])` "face origin" math with a `nearestRoadFacing(cx, cz)` helper that finds the closest avenue/street line and rotates the building so its local +Z (door direction) points at it.

## Relevant Files

- `C:\Users\noahm\Project\finlife-3d.html` — the only file edited. New code added inside the existing `(function(){…})()` IIFE that already holds the 3D logic.
- `C:\Users\noahm\Project\bitlife-finance.html` — **read-only reference**. Confirms data shapes used by Phase 3:
  - `c.belongings` is `Array<{id, name, icon, cost, purchasedAt}>` — created at line 1423, appended at lines 3493/3524.
  - `c.houseValue`, `c.houseDebt`, `c.hasHouse`, `c.lifestyle` — declared at line 1417.
  - `inv.properties[]` with `livedIn` flag — read at lines 4761/4779/4790.
  - `c.spouseName`, `c.kids` — line 1416/1418.
- `C:\Users\noahm\Project\CLAUDE.md` — append a one-line update under the existing `finlife-3d.html` row noting the new interior + shower mechanic.

### New code groups (no new files)

All additions live in `finlife-3d.html`:
- `HOME_TIERS[]` table + `getHomeTier()` helper
- `interiorScene`, `interiorObstacles[]`, `inInterior`, `enterHome()`, `exitHome()`
- `buildInterior(tier)`, `placeEssentials(tier)`, `placeBelongings(tier)`
- Per-essential builders: `buildBed`, `buildFridge`, `buildStove`, `buildSink`, `buildToilet`, `buildShower`, `buildCloset`, `buildCouch`, `buildTable`, `buildLights`, `buildDoor`, etc.
- Shower state: `c.lastShowerMonth`, `tickShowerPenalty()`, post-tick hook
- `buildDowntownCore()`
- `nearestRoadFacing(cx, cz)` helper, applied to all `BUILDINGS` in `buildBuilding`

## Implementation Phases

### Phase 1 — Foundation (data + helpers)
Add tier table, shower fields on char state, road-facing helper, dual-scene plumbing. No interior content yet. Verify exterior still works.

### Phase 2 — Interior generator
Build the interior scene generator end-to-end for the lowest tier (Studio). All structure + essentials placed. Wire enter/exit to/from Home in the existing `interact()` path.

### Phase 3 — Tiers + belongings + shower
Implement the remaining four tiers (Apartment, Condo, House, Mansion) by extending the essentials list and room dimensions. Implement belongings classifier and placement. Wire shower interaction + monthly penalty.

### Phase 4 — City polish
Apply `nearestRoadFacing()` to all action buildings (this also fixes Home so its door faces the south street). Run the new `buildDowntownCore()` pass. Visual QA via headless screenshots.

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Add tier table + helpers (Phase 1)
- Near the existing `BUILDINGS` const (top of the IIFE), declare:
  ```js
  const HOME_TIERS = [
    { id:'studio',   name:'Studio',     min:0,        size:[7, 6],   zones:['bed','kitchen','bath','util'],                              qual:1 },
    { id:'apt',      name:'Apartment',  min:150000,   size:[10, 8],  zones:['bed','kitchen','bath','util','living','closet'],            qual:2 },
    { id:'condo',    name:'Condo',      min:500000,   size:[14, 10], zones:['bed','kitchen','bath','util','living','closet','desk'],     qual:3 },
    { id:'house',    name:'House',      min:1500000,  size:[18, 14], zones:['bed','kitchen','bath','util','living','closet','desk','dining','garage','laundry'], qual:4 },
    { id:'mansion',  name:'Mansion',    min:5000000,  size:[26, 18], zones:['bed','kitchen','bath','util','living','closet','desk','dining','garage','laundry','library','homegym','master'], qual:5 },
  ];
  function getHomeTier(){
    const v = (readGS()?.char?.houseValue) || 0;
    let t = HOME_TIERS[0];
    for (const x of HOME_TIERS) if (v >= x.min) t = x;
    return t;
  }
  ```

### 2. Add `nearestRoadFacing(cx, cz)` and apply (Phase 4 piece, done early so we test once)
- Add this helper:
  ```js
  function nearestRoadFacing(cx, cz){
    let best = Infinity, rot = 0;
    for (const ax of AVENUES){
      const d = Math.abs(cx - ax);
      if (d < best){ best = d; rot = (cx > ax) ? Math.PI/2 : -Math.PI/2; }
    }
    for (const sz of STREETS){
      const d = Math.abs(cz - sz);
      if (d < best){ best = d; rot = (cz > sz) ? Math.PI : 0; }
    }
    return rot;
  }
  ```
- In `buildBuilding(cfg)`, replace `const yaw = Math.atan2(-cfg.pos[0], -cfg.pos[1]);` with `const yaw = nearestRoadFacing(cfg.pos[0], cfg.pos[1]);`.
- Apply the same rotation to corner stores in `buildCornerStore` (replace the existing ad-hoc rotation logic).

### 3. Add dual-scene plumbing (Phase 1)
- Declare module-scoped:
  ```js
  let interiorScene = null;
  let interiorObstacles = [];
  let inInterior = false;
  let exitDoorPos = null;        // mesh in interior used to leave
  let showerSpot = null;         // mesh in interior used to shower
  let exteriorSnapshot = null;   // {x,y,z,yaw,pitch}
  ```
- In the render loop **swap which scene is rendered** based on `inInterior`:
  ```js
  renderer.render(inInterior ? interiorScene : scene, camera);
  ```
- Building collision + proximity-prompt loop must iterate `inInterior ? interiorObstacles : buildings3d`.
- Routing beacon + HUD route chip hide while `inInterior` is true.
- Skip the existing exterior `ISLAND_R - 2` clamp while indoors; instead clamp to `[-w/2+0.4, w/2-0.4]` × `[-d/2+0.4, d/2-0.4]` of the active room dimensions.

### 4. Wire Home interact → enter / exit (Phase 2 entry)
- In `interact()`, when `cfg.action === 'sleep'`, **do not** open the existing sleep dialog. Instead call `enterHome()`.
- Implement:
  ```js
  function enterHome(){
    const tier = getHomeTier();
    if (!interiorScene || interiorScene.userData.tierId !== tier.id){
      buildInterior(tier);
    } else {
      // tier hasn't changed; just refresh belongings in case new ones were bought
      refreshBelongings(tier);
    }
    exteriorSnapshot = { x:player.x, y:player.y, z:player.z, yaw:player.yaw, pitch:player.pitch };
    inInterior = true;
    // teleport to room entrance (south wall, facing into the room)
    player.x = 0; player.y = 1.6; player.z = tier.size[1]/2 - 1.2; player.yaw = Math.PI; player.pitch = 0;
    if (document.pointerLockElement) document.exitPointerLock();
  }
  function exitHome(){
    inInterior = false;
    Object.assign(player, exteriorSnapshot);
    // step the player one unit south of Home so they don't immediately re-trigger F prompt
    const home = BUILDINGS.find(b => b.id === 'home');
    player.x = home.pos[0]; player.z = home.pos[1] + 5; player.yaw = Math.PI;
  }
  ```
- Add an interior interactable for the **exit door**: when `inInterior` and player is within 1.5m of `exitDoorPos`, the F-prompt reads "Press **F** to exit Home" and pressing F calls `exitHome()`.
- Add an interior interactable for the **shower** (`showerSpot`): "Press **F** to shower" → call `doShower()`.

### 5. Build the room generator (Phase 2 core)
- Implement `buildInterior(tier)`:
  ```js
  function buildInterior(tier){
    interiorScene = new THREE.Scene();
    interiorScene.userData.tierId = tier.id;
    interiorScene.background = new THREE.Color(0x111111);
    interiorScene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const lamp = new THREE.PointLight(0xfff2c8, 0.9, 18);
    lamp.position.set(0, 3.0, 0);
    interiorScene.add(lamp);
    interiorObstacles = [];
    const [w, d] = tier.size;
    const h = 3.2;
    // Floor (wood)
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshLambertMaterial({ color: 0x8d6e63 })
    );
    floor.rotation.x = -Math.PI/2;
    interiorScene.add(floor);
    // Ceiling
    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshLambertMaterial({ color: 0xeeeeee })
    );
    ceil.rotation.x =  Math.PI/2; ceil.position.y = h;
    interiorScene.add(ceil);
    // Walls (4)
    addWall( 0, h/2,  d/2, w, h, 0);            // north
    addWall( 0, h/2, -d/2, w, h, Math.PI);      // south (with door)
    addWall( w/2, h/2, 0, d, h,  Math.PI/2);    // east
    addWall(-w/2, h/2, 0, d, h, -Math.PI/2);    // west
    // Door cutout = simple "door" mesh against south wall
    exitDoorPos = new THREE.Vector3(0, 1, -d/2 + 0.05);
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.0, 0.05),
      new THREE.MeshLambertMaterial({ color: 0x4f342a }));
    door.position.copy(exitDoorPos);
    interiorScene.add(door);
    // Place essentials and belongings
    placeEssentials(tier);
    placeBelongings(tier);
  }
  ```
- Helper `addWall(x, y, z, w, h, ry)` builds a `BoxGeometry(w, h, 0.2)` with rotation, adds to scene + obstacles. Window meshes are inset rectangles on each non-south wall.

### 6. Implement essentials registry (Phase 2 / 3)
- Declare an array of essentials with their per-zone anchors. Each builder takes `(targetScene, anchor, qual)` and creates simple BoxGeometry/CylinderGeometry meshes:
  ```js
  const ESSENTIALS = [
    // structure already handled by buildInterior — these are *furnishings*
    { id:'bed',         zone:'bed',     build: buildBed },        // BoxGeometry mattress + pillow
    { id:'closet',      zone:'closet',  build: buildCloset },     // tall box w/ doors; exposes anchors for clothing belongings
    { id:'dresser',     zone:'bed',     build: buildDresser },
    { id:'couch',       zone:'living',  build: buildCouch },
    { id:'chair',       zone:'living',  build: buildChair },
    { id:'table',       zone:'dining',  build: buildTable },      // falls back to 'living' if no dining
    { id:'fridge',      zone:'kitchen', build: buildFridge },
    { id:'stove',       zone:'kitchen', build: buildStove },
    { id:'sink_kit',    zone:'kitchen', build: buildKitchenSink },
    { id:'utensils',    zone:'kitchen', build: buildUtensils },
    { id:'plates',      zone:'kitchen', build: buildPlates },
    { id:'toilet',      zone:'bath',    build: buildToilet },
    { id:'sink_bath',   zone:'bath',    build: buildBathSink },
    { id:'shower',      zone:'bath',    build: buildShower },     // ALSO sets showerSpot
    { id:'towels',      zone:'bath',    build: buildTowels },
    { id:'toiletries',  zone:'bath',    build: buildToiletries },
    { id:'smokedet',    zone:'ceiling', build: buildSmokeDetector },
    { id:'extinguisher',zone:'kitchen', build: buildExtinguisher },
    { id:'firstaid',    zone:'bath',    build: buildFirstAid },
    { id:'lock',        zone:'door',    build: buildLock },
    { id:'heater',      zone:'wall',    build: buildHeater },
    { id:'ac',          zone:'wall',    build: buildAC },
    { id:'wifi',        zone:'living',  build: buildWifi },
    { id:'trash',       zone:'kitchen', build: buildTrash },
    { id:'broom',       zone:'util',    build: buildBroom },
    { id:'laundry',     zone:'laundry', build: buildLaundry },    // higher tiers only — mansion swaps for full machine
    { id:'cleansup',    zone:'util',    build: buildCleaningSupplies },
    { id:'desk',        zone:'desk',    build: buildDesk },       // tier ≥ condo
  ];
  ```
- `placeEssentials(tier)` iterates `ESSENTIALS`, skips items whose zone is not in `tier.zones` (with smart fallbacks: e.g., `dining` falls back to `living`, `living` falls back to `bed`), and calls `build()` at a zone-specific anchor point determined by tier `size`.
- Each builder creates a `THREE.Group`, adds geometry, sets `qual` styling (drab vs wood vs marble), and pushes to `interiorObstacles` if it should block movement (bed yes; smoke detector no).

### 7. Belongings classifier + placement (Phase 3)
- Define rules:
  ```js
  const BELONG_RULES = [
    { match:/coat|jacket|sweater|shirt|pants|dress|suit|hat|shoe|boot|tux/i, zone:'closet' },
    { match:/computer|laptop|monitor|pc|desktop|server/i,                     zone:'desk' },
    { match:/phone|tablet|gadget|console|gaming/i,                            zone:'desk' },
    { match:/book|novel|encyclopedia|kindle/i,                                zone:'shelf' },
    { match:/tool|wrench|drill|hammer|saw/i,                                  zone:'garage' },
    { match:/trophy|award|medal|ring/i,                                       zone:'mantle' },
    { match:/painting|art|sculpture|vase/i,                                   zone:'wall' },
    { match:/jewelry|watch|necklace|bracelet/i,                               zone:'dresser' },
    { match:/sport|gear|equipment|skis|surf|bike|gym/i,                       zone:'garage' },
    { match:/.*/i,                                                            zone:'shelf' }, // fallback
  ];
  ```
- `placeBelongings(tier)`: iterate `GS.char.belongings || []`. For each item:
  1. Find matching rule.
  2. If chosen zone isn't available at this tier, fall back: `desk → living`, `garage → util`, `mantle → living`, `shelf → living`.
  3. Append to a per-zone queue with offset anchors so multiple items don't overlap.
  4. Render each as a tiny box (0.4 × 0.4 × 0.05) with a CanvasTexture face that draws the item's `icon` (emoji) on a colored background. No collision.
- Tools also get visualized on the player's car if `c.hasCar` — append to `inv.vehicles[0]` exterior (place a sprite on the trunk/roof in the *exterior* scene the next time interior is regenerated).

### 8. Shower mechanic (Phase 3)
- In char init (lazy): `if (c.lastShowerMonth === undefined) c.lastShowerMonth = c.monthAge;`
- Add `doShower()`:
  ```js
  function doShower(){
    const c = readGS()?.char; if (!c) return;
    c.lastShowerMonth = c.monthAge;
    showToast('Fresh and clean! +1 happy');
    c.happiness = Math.min(100, (c.happiness || 0) + 1);
  }
  ```
- Hook **after** the existing extras chain on `#btn-age`. Wrap once more at game-start time (after the extras IIFE has installed its own wrapper, so ours runs last):
  ```js
  function installShowerHook(){
    const btn = document.getElementById('btn-age');
    if (!btn) return;
    const prev = btn.onclick;
    btn.onclick = function(ev){
      if (prev) prev.call(this, ev);
      const c = readGS()?.char; if (!c) return;
      const since = (c.monthAge || 0) - (c.lastShowerMonth || 0);
      if (since > 1){
        const skipped = since - 1;
        c.health     = Math.max(0, (c.health     || 0) - 2*skipped);
        c.happiness  = Math.max(0, (c.happiness  || 0) - 2*skipped);
        showToast('Cleanliness drop: -' + (2*skipped) + ' health & happy');
      }
    };
  }
  // call after game init (in attachStart)
  ```
- Add a HUD pill `#hud-cleanliness` that turns red when `since > 1` and reads "Shower overdue · -2/mo".

### 9. Downtown core (Phase 4)
- Add `buildDowntownCore()` called from `initScene()` after `fillCity()` but before `fillSuburbs()`.
- For lots whose center `(cx, cz)` satisfies `Math.hypot(cx, cz) < 35` and `!isActionLot(cx, cz)`:
  1. Remove (or skip) regular fillers in those lots (or accept that they'll be replaced — easier: in `fillCity`, mark these lots so they spawn 0 fillers).
  2. Spawn 1–2 tall skyscrapers per lot: 8×8 footprint, 40–80 m tall, with neon billboard plane texture (CanvasTexture rendered with random ad text: "EAT", "DRINK", "BUY", "TIMES SQ").
  3. Add a couple of street-level shop entrances at the base.
- Re-bound the player walk/clamp logic if needed (no change expected — buildings stay inside grid).

### 10. CLAUDE.md update + headless verification
- Append to the `finlife-3d.html` row:
  > "Home → 3D walkable interior tiered by `houseValue` (Studio/Apartment/Condo/House/Mansion) with shower mechanic and belongings visualizer. Downtown core skyscrapers around origin."
- Run a headless playwright smoke test that:
  1. Starts the game.
  2. Walks to Home, presses F, screenshots the **Studio** interior.
  3. Sets `GS.char.houseValue = 6_000_000`, calls `enterHome()`, screenshots the **Mansion** interior.
  4. Manually pushes a belonging `{name:'Custom Computer', icon:'💻', cost:2000}` into `GS.char.belongings`, re-enters, and asserts the icon mesh appears in the desk zone.
  5. Skips two months without showering, asserts `c.health` and `c.happiness` each dropped by ≥4.
  6. Verifies `BUILDINGS[].group.rotation.y` for each action building matches `nearestRoadFacing(cfg.pos[0], cfg.pos[1])`.
  7. Confirms no JS errors and `interiorObstacles.length > 20`.

## Testing Strategy

**Unit-style spot checks** (eval expressions inside the headless browser):
- `getHomeTier()` returns Studio at `houseValue=0`, Apartment at `200_000`, Mansion at `10_000_000`.
- `nearestRoadFacing(60, 15)` returns `Math.PI/2` (door faces -X toward avenue at x=45) — verify by asserting absolute equality with rounding tolerance.
- After `enterHome()`, `inInterior === true` and `player.x` falls within the room bounds.

**Integration screenshots**:
- Studio interior shot — confirm bed, mini fridge, toilet, shower, smoke detector all visible.
- Mansion interior shot — confirm separate dining/library/homegym zones render distinctly.
- Belongings test: inject 3 items (`💻 Laptop`, `🧥 Coat`, `🔧 Wrench`), screenshot — coat in closet, laptop on desk, wrench on car (exterior). Use `__finlife3d._getInteriorObstacles?.()` (new dev hook).

**Edge cases**:
- Old saves where `c.lastShowerMonth === undefined` — initialized lazily on first tick.
- Empty `c.belongings` — room renders without errors.
- Player buys a property between two enterHome calls — interior must regenerate (tier id mismatch triggers rebuild).
- Player at very edge of Home doorstep when pressing F — exit teleports player to safe outdoor offset, not back inside the building.

## Acceptance Criteria

- [ ] Pressing F at Home places the player inside a 3D walkable room; pressing F at the interior door returns to the world at the south side of Home.
- [ ] Room dimensions visibly differ between at least three tiers (Studio vs Condo vs Mansion screenshots).
- [ ] Every essential from the user's list is present in every tier (lower tiers may use simpler/smaller variants but ALL items must exist).
- [ ] Standing at the shower and pressing F sets `c.lastShowerMonth = c.monthAge`; ageing a month without showering decreases health and happiness by 2 each, twice over two months without showering decreases by 4 each.
- [ ] At least three sample belongings (clothing, electronics, tools) render in their correct zone.
- [ ] All ten action buildings + corner stores have door rotations equal to `nearestRoadFacing(cx, cz)` — visible by walking the perimeter and seeing every entrance facing the curb.
- [ ] At least four tall skyscrapers visible from spawn looking toward origin (downtown core).
- [ ] No JS errors in console after spawning the game and entering/exiting Home five times.

## Validation Commands

Run these from the project root:

- `node -e "const fs=require('fs'); const html=fs.readFileSync('finlife-3d.html','utf8'); const m=[...html.matchAll(/<script(?:\\s[^>]*)?>([\\s\\S]*?)<\\/script>/g)]; new Function(m[m.length-1][1]); console.log('parse OK');"`
  Verifies the new 3D script block parses cleanly.

- `node specs/scripts/verify-home-interior.js`  *(new headless test script — written as part of step 10)*
  Runs the full smoke-test flow above and exits non-zero on any failed assertion. Saves screenshots to `.shot-studio.png`, `.shot-mansion.png`, `.shot-downtown.png`.

- Manual: open `http://localhost:3000/finlife-3d.html`, press **F** at Home, walk to the shower, press **F**, walk to the door, press **F** to exit. Confirm no flicker / no scene corruption.

## Notes

- **Performance**: each tier interior carries roughly 30–60 meshes; even Mansion is well under 200. Combined with the existing 203 exterior meshes and dual-scene rendering (only one active at a time) this stays well within Three.js comfort.
- **Save compatibility**: `c.lastShowerMonth` is the only new field on char state. Lazy-init at game start avoids breaking existing saves. `interiorScene` is purely runtime — never persisted.
- **No new libraries** required — all geometry is `THREE.BoxGeometry` / `CylinderGeometry` / `CanvasTexture`, already used.
- **Future hooks** (out of scope but easy to add later):
  - Sleep mechanic moves into the interior (press F at the bed instead of at the building).
  - Spouse + kids NPCs spawn in the living room when family exists.
  - Mortgage/tax events visualize on the kitchen fridge as paper notes.
- **Risk**: the existing extras IIFE wraps `#btn-age` once already. Our `installShowerHook` must wrap AFTER it. Place the install call inside `attachStart()` so it runs after the extras IIFE has executed (which it has, since the IIFE runs at script-parse time and `attachStart` runs on DOMContentLoaded / after the script).
