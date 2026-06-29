"""Run every brain.py test suite; exit non-zero if any fails.
   Run: python tests/run_all.py"""
import sys, os, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
SUITES = ["test_brain.py", "test_hardening.py", "test_gradient.py", "test_stress_perf.py"]

failed = []
for s in SUITES:
    print(f"\n########## {s} ##########")
    rc = subprocess.run([sys.executable, os.path.join(HERE, s)]).returncode
    if rc != 0:
        failed.append(s)

print("\n" + "=" * 50)
if failed:
    print("SUITES FAILED:", ", ".join(failed))
    sys.exit(1)
print(f"ALL {len(SUITES)} SUITES PASSED")
sys.exit(0)
