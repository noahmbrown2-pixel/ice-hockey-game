# brain.py tests

Verification suites for `../brain.py` — a from-scratch, pure-Python neural net.
No dependencies (stdlib only); each file imports the real module (not a copy)
and exits non-zero on failure.

## Run

```bash
python tests/run_all.py          # everything
# or individually:
python tests/test_brain.py       # unit / edge / failure-path / CLI (24 checks)
python tests/test_hardening.py   # regression locks for the 2 fixed edge bugs (8)
python tests/test_gradient.py    # analytic backprop vs finite-difference (3)
python tests/test_stress_perf.py # stress / performance / integration (11)
```

## What each covers

| File | Focus |
|---|---|
| `test_brain.py` | learning (XOR), save/load bit-exact (JSON + file), malformed/toxic file rejection, NaN/Inf, dataset invariants, dim-mismatch, render smoke, end-to-end CLI |
| `test_hardening.py` | the two bugs fixed after independent review: `bool` in `sizes`, and `predict()` accepting wrong-length input — plus happy-path regression guards |
| `test_gradient.py` | numerical gradient check — proves backprop is correct, not just convergent |
| `test_stress_perf.py` | deep/wide nets, large datasets, epoch timing, and that a *loaded* brain resumes training (not just predicts the same) |
