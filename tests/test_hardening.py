"""Regression suite for the 2 edge bugs found in independent review (bool-sizes
   leak in load_brain; predict() accepting wrong-length input). Asserts the
   hardened contract and guards the happy path. Run: python tests/test_hardening.py"""
import sys, os, json, math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import brain

P, F, fails = 0, 0, []
def check(name, cond, detail=""):
    global P, F
    if cond: P += 1; print(f"  PASS  {name}" + (f"  -- {detail}" if detail else ""))
    else: F += 1; fails.append(name); print(f"  FAIL  {name}" + (f"  -- {detail}" if detail else ""))

def good():
    return json.loads(json.dumps(brain.serialize_brain(brain.Net([2, 6, 6, 1], "tanh"))))

print("\n=== BRAIN.PY HARDENING REGRESSION ===\n")

# H1 — bool in sizes must be rejected. Build files whose W/B ARE dimensionally
#      consistent with the bool sizes, so only the sizes-bool check can catch them.
def consistent_with(sizes):
    real = [s if not isinstance(s, bool) else int(s) for s in sizes]
    o = json.loads(json.dumps(brain.serialize_brain(brain.Net(real, "tanh"))))
    o["sizes"] = sizes
    return o
for bad_sizes, name in [([2, True, 1], "[2,True,1] (consistent)"), ([2, 1, True], "[2,1,True] (consistent)")]:
    threw = None
    try: brain.load_brain(consistent_with(bad_sizes))
    except ValueError as e: threw = str(e)
    check(f"H1 bool sizes {name} rejected", threw is not None, threw or "ACCEPTED")
g = good(); g["sizes"] = [2, 4, False]
threw = None
try: brain.load_brain(g)
except ValueError as e: threw = str(e)
check("H1 False size rejected", threw is not None, threw or "ACCEPTED")

# H2 — predict must reject wrong-length input vectors consistently
net = brain.Net([2, 4, 1], "tanh")
for vec, name in [([], "len0"), ([0.5], "len1"), ([0.1, 0.2, 0.3], "len3")]:
    raised = None
    try: net.predict(vec)
    except ValueError: raised = "ValueError"
    except Exception as e: raised = type(e).__name__
    check(f"H2 predict({name}) raises ValueError", raised == "ValueError", raised or "RETURNED A NUMBER")

# H3 — REGRESSION: valid net still loads and predicts finite
g = good()
ok = None
try:
    n = brain.load_brain(g)
    ok = math.isfinite(n.predict([0.3, -0.2])) and n.sizes == [2, 6, 6, 1]
except Exception:
    ok = False
check("H3 valid brain still loads + predicts", ok is True, "round-trips fine")

# H4 — REGRESSION: correct-length input still works
check("H4 predict([x,y]) still works", math.isfinite(net.predict([0.1, -0.4])), "finite")

print(f"\n=== RESULT: {P} passed, {F} failed ===")
if fails: print("FAILED:", ", ".join(fails))
sys.exit(1 if F else 0)
