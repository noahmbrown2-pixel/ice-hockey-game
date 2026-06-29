"""Adversarial verification of the REAL brain.py (imported, not copied).
Run: python tests/test_brain.py"""
import sys, os, json, math, copy, tempfile, subprocess
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, REPO)
BRAIN = os.path.join(REPO, "brain.py")
import brain

P, F, fails = 0, 0, []
def check(name, cond, detail=""):
    global P, F
    if cond: P += 1; print(f"  PASS  {name}" + (f"  -- {detail}" if detail else ""))
    else: F += 1; fails.append(name); print(f"  FAIL  {name}" + (f"  -- {detail}" if detail else ""))

def all_finite(net):
    return (all(math.isfinite(v) for m in net.W for r in m for v in r) and
            all(math.isfinite(v) for b in net.B for v in b))

GRID = [[x, y] for x in (-1, -.5, 0, .5, 1) for y in (-1, -.5, 0, .5, 1)]
print("\n=== BRAIN.PY VERIFICATION SUITE ===\n")

# T1 — learns XOR
import random
random.seed(1)
X, Y = brain.make_data("xor", 240, 0.05)
net = brain.Net([2, 6, 6, 1], "tanh")
l0 = net.train(X, Y, 0.3)
for _ in range(600): net.train(X, Y, 0.3)
lN = net.train(X, Y, 0.3)
acc = brain.accuracy(net, X, Y)
check("T1 XOR loss decreases", lN < l0, f"{l0:.3f} -> {lN:.3f}")
check("T1 XOR accuracy > 0.9", acc > 0.9, f"acc={acc*100:.1f}%")

# T2 — save/load bit-exact through JSON round-trip
before = [net.predict(p) for p in GRID]
saved = json.loads(json.dumps(brain.serialize_brain(net, ds="xor", epoch=600)))
scrambled = brain.Net([2, 6, 6, 1], "tanh")
moved = max(abs(scrambled.predict(p) - before[i]) for i, p in enumerate(GRID))
net2 = brain.load_brain(saved)
after = [net2.predict(p) for p in GRID]
maxdiff = max(abs(after[i] - before[i]) for i in range(len(GRID)))
check("T2 fresh net differs (control)", moved > 1e-3, f"move={moved:.2e}")
check("T2 save->load bit-exact", maxdiff == 0.0, f"maxDiff={maxdiff:.2e}")

# T3 — file round-trip (save_file/load_file)
with tempfile.TemporaryDirectory() as d:
    fp = os.path.join(d, "b.json")
    brain.save_file(net, fp, ds="xor", epoch=600, lr=0.3)
    net3 = brain.load_file(fp)
    fd = max(abs(net3.predict(p) - before[i]) for i, p in enumerate(GRID))
    check("T3 file save/load bit-exact", fd == 0.0, f"maxDiff={fd:.2e}")

# T4 — toxic/malformed rejection
def good(): return json.loads(json.dumps(brain.serialize_brain(net, ds="xor")))
toxic = {
    "None": None, "list": [1, 2], "empty": {}, "wrong fmt": {"fmt": "x"},
    "fmt only": {"fmt": "brain.py"},
    "unknown act": {**good(), "act": "frobnicate"},
    "dim mismatch": {**good(), "sizes": [2, 3, 1]},
    "string weight": (lambda g: (g["W"][0][0].__setitem__(0, "x"), g)[1])(good()),
    "None weight": (lambda g: (g["W"][0][0].__setitem__(0, None), g)[1])(good()),
    "bool weight": (lambda g: (g["W"][0][0].__setitem__(0, True), g)[1])(good()),
    "bad sizes type": {**good(), "sizes": "2,3,1"},
}
accepted = []
for k, v in toxic.items():
    try: brain.load_brain(v); accepted.append(k)
    except (ValueError, TypeError, KeyError): pass
check("T4 all toxic inputs rejected", not accepted, "all threw" if not accepted else f"ACCEPTED: {accepted}")

# T5 — NaN / Infinity survive JSON in Python; must be rejected
nan_brain = good(); nan_brain["W"][0][0][0] = float("nan"); nan_brain["B"][0][0] = float("inf")
js = json.dumps(nan_brain)  # Python json emits literal NaN/Infinity tokens
check("T5 json kept NaN/Inf tokens", "NaN" in js and "Infinity" in js, "tokens present")
threw = None
try: brain.load_brain(json.loads(js))
except ValueError as e: threw = str(e)
check("T5 NaN/Inf weights rejected", threw is not None, threw or "ACCEPTED")

# T6 — empty-data train is a no-op (returns nan, weights unchanged)
e = brain.Net([2, 4, 1], "tanh")
snap = copy.deepcopy(e.W)
r = e.train([], [], 0.3)
check("T6 empty train returns nan", isinstance(r, float) and math.isnan(r), f"r={r}")
check("T6 empty train doesn't mutate", e.W == snap and all_finite(e), "weights unchanged")

# T7 — activation stability incl. relu @ max lr
for act, lr in [("tanh", 0.3), ("sigmoid", 0.3), ("relu", 1.5)]:
    random.seed(2)
    Xs, Ys = brain.make_data("spiral", 200, 0.1)
    n = brain.Net([2, 8, 8, 1], act)
    for _ in range(300): n.train(Xs, Ys, lr)
    check(f"T7 {act} stays finite (lr={lr})", all_finite(n), "no NaN/Inf")

# T8 — make_data invariants
for kind in ["xor", "circle", "spiral", "moons", "blobs"]:
    Xk, Yk = brain.make_data(kind, 150, 0.1)
    okc = len(Xk) == 150 and len(Yk) == 150
    okb = all(-1.2 <= px <= 1.2 and -1.2 <= py <= 1.2 for px, py in Xk)
    okl = all(v in (0, 1) for v in Yk)
    check(f"T8 {kind} well-formed", okc and okb and okl, f"n={len(Xk)} bounds={okb} labels={okl}")

# T9 — dim-mismatch THEN train (the realized-risk case from the HTML version)
mm = good(); mm["sizes"] = [2, 3, 1]
threw = None
try:
    nm = brain.load_brain(mm); nm.train([[0.1, 0.2]], [1], 0.3)
except ValueError as ex: threw = str(ex)
check("T9 dim-mismatch rejected at load (no NaN-train)", threw is not None, threw or "ACCEPTED then trained")

# T10 — render() smoke (must not crash)
try:
    import io, contextlib
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf): brain.render(net, X[:20], Y[:20], 20, 10)
    out = buf.getvalue()
    check("T10 render produces ascii grid", "#" in out or "." in out, f"{len(out)} chars")
except Exception as ex:
    check("T10 render produces ascii grid", False, f"crashed: {ex}")

# T11 — CLI end-to-end (real subprocess)
res = subprocess.run([sys.executable, BRAIN, "--data", "xor", "--epochs", "60", "--seed", "1"],
                     capture_output=True, text=True, timeout=120)
check("T11 CLI exits 0", res.returncode == 0, f"rc={res.returncode}; stderr={res.stderr[:120]}")
check("T11 CLI reports accuracy", "final accuracy" in res.stdout,
      res.stdout.strip().splitlines()[-1] if res.stdout else "no stdout")

# T12 — CLI --save writes a loadable file
with tempfile.TemporaryDirectory() as d:
    fp = os.path.join(d, "cli.json")
    res2 = subprocess.run([sys.executable, BRAIN, "--data", "circle", "--epochs", "40",
                           "--seed", "3", "--save", fp], capture_output=True, text=True, timeout=120)
    loaded = os.path.exists(fp)
    reload_ok = False
    if loaded:
        try: brain.load_file(fp); reload_ok = True
        except Exception: reload_ok = False
    check("T12 CLI --save creates loadable brain", res2.returncode == 0 and loaded and reload_ok,
          f"rc={res2.returncode} exists={loaded} reloadable={reload_ok}")

# T13 — corrupt file path: load_file surfaces an error (not a silent wrong net)
with tempfile.TemporaryDirectory() as d:
    fp = os.path.join(d, "bad.json")
    open(fp, "w").write('{"fmt":"brain.py","sizes":[2,4,1]')  # truncated
    threw = None
    try: brain.load_file(fp)
    except Exception as ex: threw = type(ex).__name__
    check("T13 corrupt file raises", threw is not None, threw or "silently accepted")

print(f"\n=== RESULT: {P} passed, {F} failed ===")
if fails: print("FAILED:", ", ".join(fails))
sys.exit(1 if F else 0)
