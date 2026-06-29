"""Stress, performance, and integration tests for brain.py — categories the
   unit suite does not cover. Run: python tests/test_stress_perf.py"""
import sys, os, json, math, time
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import brain, random

P, F, fails = 0, 0, []
def check(name, cond, detail=""):
    global P, F
    if cond: P += 1; print(f"  PASS  {name}" + (f"  -- {detail}" if detail else ""))
    else: F += 1; fails.append(name); print(f"  FAIL  {name}" + (f"  -- {detail}" if detail else ""))
def all_finite(net):
    return (all(math.isfinite(v) for m in net.W for r in m for v in r) and
            all(math.isfinite(v) for b in net.B for v in b))

print("\n=== BRAIN.PY STRESS / PERF / INTEGRATION ===\n")

# ---- INTEGRATION: a loaded brain must RESUME training (not just predict the same) ----
random.seed(1)
X, Y = brain.make_data("circle", 240, 0.08)
net = brain.Net([2, 6, 6, 1], "tanh")
for _ in range(120): net.train(X, Y, 0.3)
loss_at_save = net.train(X, Y, 0.3)
saved = json.loads(json.dumps(brain.serialize_brain(net)))
net2 = brain.load_brain(saved)
d0 = max(abs(net2.predict(p) - net.predict(p)) for p in [[0.1,0.2],[-.3,.4],[.5,-.5]])
loss_after_load = net2.train(X, Y, 0.3)
last = loss_after_load
for _ in range(200): last = net2.train(X, Y, 0.3)
check("INT loaded brain predicts identically", d0 == 0.0, f"diff={d0:.2e}")
check("INT first epoch after load matches pre-save loss", abs(loss_after_load - loss_at_save) < 0.05,
      f"save={loss_at_save:.3f} resume={loss_after_load:.3f}")
check("INT loaded brain keeps learning (loss drops)", last < loss_at_save, f"{loss_at_save:.3f} -> {last:.3f}")

# ---- STRESS: deep + wide net, large dataset, stays finite & saves/loads ----
random.seed(2)
Xb, Yb = brain.make_data("spiral", 1500, 0.1)
big = brain.Net([2, 24, 24, 16, 8, 1], "tanh")
t = time.time()
for _ in range(20): bl = big.train(Xb, Yb, 0.3)
dt = time.time() - t
check("STRESS deep net (5 hidden) trains finite", all_finite(big) and math.isfinite(bl),
      f"params={big.params}, 20 epochs/1500pts in {dt:.2f}s, loss={bl:.3f}")
bigsaved = json.loads(json.dumps(brain.serialize_brain(big)))
big2 = brain.load_brain(bigsaved)
bd = max(abs(big2.predict(p) - big.predict(p)) for p in Xb[:50])
check("STRESS big net save/load bit-exact", bd == 0.0, f"maxDiff={bd:.2e}, json={len(json.dumps(bigsaved))//1024}KB")

# ---- STRESS: degenerate shapes ----
random.seed(3)
Xd, Yd = brain.make_data("blobs", 100, 0.1)
no_hidden = brain.Net([2, 1], "sigmoid")
wide = brain.Net([2, 64, 1], "relu")
for _ in range(50): no_hidden.train(Xd, Yd, 0.3)
for _ in range(50): wide.train(Xd, Yd, 0.3)
check("STRESS no-hidden-layer net trains", all_finite(no_hidden), f"acc={brain.accuracy(no_hidden,Xd,Yd)*100:.0f}%")
check("STRESS very-wide (64) net trains finite", all_finite(wide), f"acc={brain.accuracy(wide,Xd,Yd)*100:.0f}%")

# ---- PERFORMANCE: epoch time scales sanely, no pathological blowup ----
random.seed(4)
configs = [("default [2,6,6,1] x240", [2,6,6,1], 240),
           ("deep [2,16,12,8,1] x600", [2,16,12,8,1], 600)]
timings = {}
for name, arch, npts in configs:
    Xc, Yc = brain.make_data("xor", npts, 0.08)
    nc = brain.Net(arch, "tanh")
    nc.train(Xc, Yc, 0.3)  # warm
    t = time.time()
    for _ in range(20): nc.train(Xc, Yc, 0.3)
    ms = (time.time() - t) / 20 * 1000
    timings[name] = ms
    check(f"PERF {name}", ms < 2000, f"{ms:.1f} ms/epoch")
proj = timings["default [2,6,6,1] x240"] * 2000 / 1000
check("PERF default 2000-epoch run projected < 60s", proj < 60, f"~{proj:.1f}s projected")

# ---- FAILURE-PATH: soft labels in [0,1] don't crash BCE ----
random.seed(5)
Xe = [[0.1,0.2],[0.3,0.4],[-.5,-.6]]
weird = brain.Net([2,4,1], "tanh")
soft = weird.train(Xe, [0.0, 1.0, 0.5], 0.3)
check("FAIL soft labels [0,1] don't crash", math.isfinite(soft), f"loss={soft:.3f}")

print(f"\n=== RESULT: {P} passed, {F} failed ===")
print("Timings:", {k: f"{v:.1f}ms" for k, v in timings.items()})
if fails: print("FAILED:", ", ".join(fails))
sys.exit(1 if F else 0)
