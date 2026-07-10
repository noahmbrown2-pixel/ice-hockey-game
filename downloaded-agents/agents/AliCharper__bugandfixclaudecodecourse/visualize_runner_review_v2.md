# Code Review: visualize_runner.py

**Date:** 2026-05-26  
**Reviewer:** Claude Code  
**File:** `.claude/skills/visualize/scripts/visualize_runner.py`

---

## 1. Correctness & Logic Issues

### 1.1 Missing Column Validation (HIGH)
**Line 33:** The aggregation assumes `store_sk` and `net_amount` columns exist in `fact_sales.csv`. If the CSV schema differs (e.g., column renamed to `store_id` or `sales_amount`), the script fails cryptically.

**Impact:** Silent failure or confusing `KeyError` at runtime.

**Recommendation:** Validate column presence before aggregation:
```python
required_cols = ["store_sk", "net_amount"]
missing = [col for col in required_cols if col not in df.columns]
if missing:
    raise ValueError(f"Missing columns: {missing}. Available: {df.columns.tolist()}")
```

### 1.2 Data Type Assumption (MEDIUM)
**Line 33:** Assumes `net_amount` is numeric. Non-numeric data (e.g., strings, nulls) will cause cryptic aggregation errors.

**Impact:** Runtime failure if data is corrupted or schema changes.

**Recommendation:** Coerce or validate:
```python
df["net_amount"] = pd.to_numeric(df["net_amount"], errors="coerce")
if df["net_amount"].isna().all():
    raise ValueError("net_amount column contains no valid numeric data")
```

### 1.3 Empty DataFrame Handling (MEDIUM)
**Line 29:** Loads CSV without checking if it's empty. Groupby on empty df produces empty chart.

**Impact:** Silent production of a meaningless chart with no visual feedback to user.

**Recommendation:** Add explicit check after load:
```python
if df.empty:
    raise ValueError(f"fact_sales.csv is empty. No data to visualize.")
```

---

## 2. Standards Compliance

### 2.1 Missing Module Docstring (VIOLATION)
**PEP 257 Requirement:** Module docstring exists (lines 1-4) but lacks detail. It should describe purpose, usage notes, and dependencies.

**Current:** "Reads fact_sales.csv from the latest migrate data folder and creates a simple bar chart."

**Better:** Include that it requires pandas, matplotlib; that it targets `.claude/skills/migrate/data`; and that it's meant to run post-migrate.

### 2.2 Missing Function Docstrings (VIOLATION)
**Lines 16, 24:** Both `getLatestFolder()` and `runVisualize()` lack PEP 257 docstrings.

**Recommendation:**
```python
def getLatestFolder() -> str:
    """Locate and return the path to the latest migrate data folder.
    
    Returns:
        str: Absolute path to the most recent migration output directory.
        
    Raises:
        FileNotFoundError: If no migrate data directories exist.
    """
```

### 2.3 Type Annotations Incomplete (VIOLATION)
**Line 45:** `if __name__ == "__main__":` block has no type hints, but it calls `runVisualize()` which returns `None`. This is compliant as-is, but the pattern is inconsistent.

**Status:** Acceptable for main block.

---

## 3. Error Handling & Robustness

### 3.1 No Handling for Missing File (HIGH)
**Line 29:** `pd.read_csv()` will fail with `FileNotFoundError` if `fact_sales.csv` doesn't exist in the folder. Message is unclear to user.

**Recommendation:** Wrap with explicit check:
```python
csv_path = os.path.join(folder, "fact_sales.csv")
if not os.path.exists(csv_path):
    raise FileNotFoundError(f"fact_sales.csv not found in {folder}")
df = pd.read_csv(csv_path)
```

### 3.2 Matplotlib Resource Not Closed (MEDIUM)
**Line 35:** `plt.figure()` creates a figure that is never explicitly closed. In long-running scripts or loops, this accumulates in memory.

**Recommendation:** Use context manager or explicit close:
```python
plt.figure(figsize=(8, 5))
try:
    # ... plotting ...
    plt.savefig(output_path)
finally:
    plt.close()
```

### 3.3 Broad Assumption on Path Sorting (MEDIUM)
**Line 17:** Uses `glob.glob()` sorted lexicographically. If folder names are not ISO 8601 (e.g., `migrate_2026_05_26`), sorting may not reflect chronological order.

**Recommendation:** Add comment or use timestamp-based naming guarantee, or add explicit validation that latest folder is actually the intended one.

### 3.4 No Validation of Output Directory Write (LOW)
**Line 26:** `os.makedirs(..., exist_ok=True)` succeeds, but `plt.savefig()` at line 43 could still fail if the directory becomes read-only after creation.

**Recommendation:** Acceptable for this use case (local dev script), but consider wrapping `savefig()` in try/except.

---

## 4. Code Style & PEP 8

### 4.1 All Import Statements Standard ✓
Lines 6-9 are correctly ordered (stdlib first, then third-party).

### 4.2 Spacing and Naming ✓
- Line 11 separator comment is stylistic but acceptable.
- camelCase function names (`getLatestFolder`, `runVisualize`) comply with project convention.
- Variable names are clear.

### 4.3 Line Length ✓
No lines exceed 88 characters (PEP 8 soft limit).

---

## 5. Intent vs. Implementation

**SKILL.md Intent:**
- Find latest migrate folder ✓
- Read `fact_sales.csv` ✓
- Create bar chart of total sales per store ✓
- Save as PNG ✓

**Implementation Coverage:** Fully aligned with intent, but with data validation gaps that could break the chain.

---

## Summary of Actionable Issues

| Severity | Issue | Line(s) | Fix Type |
|----------|-------|---------|----------|
| HIGH | Missing column existence validation | 33 | Add pre-check before groupby |
| HIGH | No check for missing `fact_sales.csv` | 29 | Explicit file existence check |
| MEDIUM | Data type assumption on `net_amount` | 33 | Coerce to numeric + validate |
| MEDIUM | Empty DataFrame produces silent chart | 29 | Add empty check post-load |
| MEDIUM | Matplotlib figure not explicitly closed | 35-44 | Use `plt.close()` in finally |
| MEDIUM | Folder sorting assumes chronological names | 17 | Add validation or comment |
| VIOLATION | Missing docstrings on functions | 16, 24 | Add PEP 257 docstrings |
| VIOLATION | Thin module docstring | 1-4 | Expand per PEP 257 |

---

## Recommendations for Next Steps

1. **Critical:** Add schema and data validation before aggregation (issues #1, #3).
2. **Critical:** Add explicit file existence check (issue #2).
3. **Important:** Add PEP 257 docstrings to `getLatestFolder()` and `runVisualize()`.
4. **Polish:** Ensure matplotlib cleanup and clarify folder-sorting expectations.
