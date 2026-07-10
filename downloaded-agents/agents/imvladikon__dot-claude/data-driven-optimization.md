# Data-Driven Prompt Optimization

Complete guide to optimizing prompts using real data instead of manual guessing.

## Overview

**IMPORTANT: If you have real data, ALWAYS optimize prompts using that data!**

When real input/output examples exist, don't just manually craft prompts. Instead, write a script to automatically optimize prompts using the data (similar to DSPy approach).

## When to Use Data-Driven Optimization

Use this approach when you have:
- ✅ Real input/output examples (100+ pairs minimum)
- ✅ Ground truth labels or reference outputs
- ✅ Measurable quality metrics (accuracy, F1, exact match, etc.)
- ✅ Time to run optimization (1-4 hours typical)

**Don't use** when you have:
- ❌ No real data (< 10 examples)
- ❌ No way to measure quality
- ❌ Purely exploratory task with no ground truth

## Pattern 1: DSPy-Style Automatic Optimization

**DSPy approach**: Treat prompts as learnable parameters, optimize using data.

```python
# Install: pip install dspy-ai
import dspy

# 1. Configure LLM
lm = dspy.OpenAI(model="gpt-4")
dspy.settings.configure(lm=lm)

# 2. Define signature (input → output)
class TableToSQL(dspy.Signature):
    """Convert HTML table description to SQL query."""
    table_html = dspy.InputField(desc="HTML table structure")
    table_type = dspy.InputField(desc="ADAM table type (ADAE, ADSL, etc)")
    sql_query = dspy.OutputField(desc="DuckDB SQL query")

# 3. Create module with chain-of-thought
class SQLGenerator(dspy.Module):
    def __init__(self):
        super().__init__()
        self.generate_sql = dspy.ChainOfThought(TableToSQL)

    def forward(self, table_html, table_type):
        return self.generate_sql(
            table_html=table_html,
            table_type=table_type
        )

# 4. Load your real data
train_data = [
    dspy.Example(
        table_html="<table>...",
        table_type="ADAE",
        sql_query="SELECT USUBJID, AEDECOD FROM adae WHERE..."
    ).with_inputs("table_html", "table_type")
    for example in your_dataset[:100]  # Use 100+ examples
]

# 5. Define metric
def sql_correctness_metric(example, pred, trace=None):
    """Check if generated SQL is correct."""
    try:
        # Execute both queries
        expected_result = duckdb.execute(example.sql_query).df()
        predicted_result = duckdb.execute(pred.sql_query).df()

        # Compare results
        return expected_result.equals(predicted_result)
    except Exception:
        return False

# 6. Optimize prompt automatically
from dspy.teleprompt import BootstrapFewShot

optimizer = BootstrapFewShot(
    metric=sql_correctness_metric,
    max_bootstrapped_demos=8,  # How many examples to include
    max_labeled_demos=4
)

# This will automatically:
# - Try different prompts
# - Select best examples
# - Optimize instruction wording
optimized_generator = optimizer.compile(
    SQLGenerator(),
    trainset=train_data
)

# 7. Save optimized prompt
optimized_generator.save("optimized_sql_generator.json")

# 8. Use in production
result = optimized_generator(
    table_html="<table>...</table>",
    table_type="ADAE"
)
print(result.sql_query)
```

**When to use DSPy:**
- You have 100+ training examples
- Need state-of-the-art performance
- Have budget for optimization time (1-4 hours)
- Want automatic prompt engineering

## Pattern 2: Manual Grid Search Optimization

If DSPy is too heavy, do manual optimization with data:

```python
import json
from itertools import product
from tqdm import tqdm

def optimize_prompt_with_data(
    train_examples,  # List[dict] with input/output pairs
    test_examples,   # Held-out test set
    prompt_templates,  # List of prompt variations to test
    metric_fn        # Function to evaluate quality
):
    """Systematically test prompt variations on real data."""

    results = []

    # Test each prompt template
    for template_idx, template in enumerate(tqdm(prompt_templates)):
        print(f"\n✓ Testing template {template_idx+1}/{len(prompt_templates)}")

        # Test on training set
        train_scores = []
        for example in train_examples[:50]:  # Sample for speed
            prompt = template.format(**example["input"])
            output = call_llm(prompt)
            score = metric_fn(output, example["expected_output"])
            train_scores.append(score)

        # Test on test set
        test_scores = []
        for example in test_examples:
            prompt = template.format(**example["input"])
            output = call_llm(prompt)
            score = metric_fn(output, example["expected_output"])
            test_scores.append(score)

        results.append({
            "template": template,
            "train_score": np.mean(train_scores),
            "test_score": np.mean(test_scores),
            "train_scores": train_scores,
            "test_scores": test_scores
        })

        print(f"Train: {np.mean(train_scores):.2%}, Test: {np.mean(test_scores):.2%}")

    # Find best template
    best = max(results, key=lambda x: x["test_score"])

    print(f"\n✓ Best template (test score: {best['test_score']:.2%}):")
    print(best["template"])

    return best, results

# Example usage
prompt_templates = [
    # Variation 1: Concise
    "Convert this table to SQL: {table_html}",

    # Variation 2: Detailed with examples
    """You are an expert SQL generator for clinical data.

Table type: {table_type}
Table structure: {table_html}

Generate a DuckDB SQL query following this pattern:
{example_sql}

SQL query:""",

    # Variation 3: Step-by-step
    """Analyze this clinical table step-by-step:

1. Identify the table type: {table_type}
2. Parse the structure: {table_html}
3. Determine required columns
4. Generate SQL query

SQL:""",

    # Add more variations...
]

best_prompt, all_results = optimize_prompt_with_data(
    train_examples=your_train_data,
    test_examples=your_test_data,
    prompt_templates=prompt_templates,
    metric_fn=sql_correctness_metric
)

# Save best prompt
with open("best_prompt.json", "w") as f:
    json.dump(best_prompt, f, indent=2)
```

**When to use Grid Search:**
- You have 30-100 examples
- Need interpretable results
- Want full control over variations tested
- Don't want DSPy dependency

## Pattern 3: Few-Shot Example Selection via Data

Use data to select the BEST few-shot examples automatically:

```python
from sentence_transformers import SentenceTransformer
import numpy as np

def select_best_examples(
    query,              # Current input
    candidate_examples, # Pool of possible examples
    n_examples=5,       # How many to select
    diversity_weight=0.3  # Balance similarity vs diversity
):
    """Select most relevant few-shot examples for query."""

    # Encode query and all candidates
    model = SentenceTransformer('all-MiniLM-L6-v2')
    query_emb = model.encode([query])[0]
    candidate_embs = model.encode([ex["input"] for ex in candidate_examples])

    # Compute similarity to query
    similarities = np.dot(candidate_embs, query_emb)

    # Select examples with MMR (Maximum Marginal Relevance)
    selected_indices = []
    selected_embeddings = []

    for _ in range(n_examples):
        if not selected_indices:
            # First example: most similar to query
            best_idx = np.argmax(similarities)
        else:
            # Balance relevance and diversity
            relevance = similarities

            # Diversity: avoid similar to already selected
            diversity = np.min([
                1 - np.dot(candidate_embs, sel_emb)
                for sel_emb in selected_embeddings
            ], axis=0)

            # Combined score
            scores = (1 - diversity_weight) * relevance + diversity_weight * diversity
            scores[selected_indices] = -np.inf  # Don't reselect
            best_idx = np.argmax(scores)

        selected_indices.append(best_idx)
        selected_embeddings.append(candidate_embs[best_idx])

    return [candidate_examples[i] for i in selected_indices]

# Use in practice
def generate_with_dynamic_examples(query, example_pool):
    """Generate output with data-selected examples."""

    # Select best examples for this specific query
    relevant_examples = select_best_examples(query, example_pool, n_examples=5)

    # Build prompt with selected examples
    prompt = f"""
Task: Convert table to SQL

Examples:
{format_examples(relevant_examples)}

Now convert this table:
{query}

SQL:"""

    return call_llm(prompt)
```

**When to use Example Selection:**
- You already have a working prompt
- Want to improve few-shot examples
- Have large pool of examples (500+)
- Need per-query customization

## Pattern 4: Automated Prompt Refinement

Iteratively improve prompt based on failures:

```python
def iterative_prompt_refinement(
    initial_prompt,
    train_data,
    n_iterations=5,
    improvement_threshold=0.05
):
    """Automatically refine prompt by analyzing failures."""

    current_prompt = initial_prompt
    current_score = evaluate_prompt(current_prompt, train_data)

    print(f"Initial score: {current_score:.2%}")

    for iteration in range(n_iterations):
        print(f"\n📊 Iteration {iteration + 1}/{n_iterations}")

        # 1. Find failure cases
        failures = []
        for example in train_data:
            output = call_llm(current_prompt.format(**example["input"]))
            if not is_correct(output, example["expected"]):
                failures.append({
                    "input": example["input"],
                    "expected": example["expected"],
                    "actual": output,
                    "error_type": classify_error(output, example["expected"])
                })

        if not failures:
            print("✓ No failures! Prompt is perfect.")
            break

        print(f"Found {len(failures)} failures")

        # 2. Analyze failure patterns
        error_types = {}
        for f in failures:
            error_types[f["error_type"]] = error_types.get(f["error_type"], 0) + 1

        print("Error distribution:", error_types)

        # 3. Generate prompt improvement using LLM
        improvement_prompt = f"""
Current prompt:
{current_prompt}

This prompt fails on these cases:
{json.dumps(failures[:5], indent=2)}

Most common error type: {max(error_types, key=error_types.get)}

Suggest an improved version of the prompt that addresses these failures.
Keep the same format but add clarifications or examples.

Improved prompt:"""

        improved_prompt = call_llm(improvement_prompt)

        # 4. Evaluate improved prompt
        new_score = evaluate_prompt(improved_prompt, train_data)

        print(f"New score: {new_score:.2%} (was {current_score:.2%})")

        # 5. Accept if better
        if new_score > current_score + improvement_threshold:
            current_prompt = improved_prompt
            current_score = new_score
            print("✓ Accepted improvement")
        else:
            print("✗ No significant improvement, keeping current")
            break

    return current_prompt, current_score

# Usage
optimized_prompt, final_score = iterative_prompt_refinement(
    initial_prompt=baseline_prompt,
    train_data=your_training_data,
    n_iterations=5
)
```

**When to use Iterative Refinement:**
- You have baseline prompt that's "okay"
- Want to fix specific failure modes
- Have 50+ examples
- Need explainable improvements

## Optimization Workflow

**Step-by-step process when you have real data:**

### Step 1: Collect Data

```python
# Load your real data (100+ examples minimum)
train_data = load_clinical_tables("train")  # 100+ examples
test_data = load_clinical_tables("test")    # 30+ held-out examples

# Split: 80% train, 20% test
# NEVER optimize on test set!
```

### Step 2: Define Metrics

```python
def evaluate_sql(predicted_sql, expected_sql):
    """Your domain-specific metric."""
    # Execute both and compare results
    pred_df = duckdb.execute(predicted_sql).df()
    exp_df = duckdb.execute(expected_sql).df()
    return pred_df.equals(exp_df)

def calculate_f1(predicted, expected):
    """For classification tasks."""
    tp = len(set(predicted) & set(expected))
    fp = len(set(predicted) - set(expected))
    fn = len(set(expected) - set(predicted))

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0

    if precision + recall == 0:
        return 0
    return 2 * (precision * recall) / (precision + recall)
```

### Step 3: Choose Optimization Method

| Method | Best When | Time | Complexity |
|--------|-----------|------|------------|
| DSPy | 100+ examples, need SOTA | 1-4 hours | High |
| Grid Search | 30-100 examples, need control | 30min-2hr | Medium |
| Example Selection | Have working prompt | 10-30min | Low |
| Iterative Refinement | Have okay baseline | 1-2 hours | Medium |

### Step 4: Run Optimization

```python
# Let the script test 10-50 variations
best_prompt = optimize_prompt_with_data(
    train_data, test_data, prompt_variations
)
```

### Step 5: Validate on Held-Out Test Set

```python
test_score = evaluate_prompt(best_prompt, test_data)
baseline_score = evaluate_prompt(baseline_prompt, test_data)

print(f"Baseline: {baseline_score:.2%}")
print(f"Optimized: {test_score:.2%}")
print(f"Improvement: {test_score - baseline_score:.2%}")

assert test_score > baseline_score, "No improvement!"
```

### Step 6: Deploy Optimized Prompt

```python
# Save to production template
save_template("production_prompt.j2", best_prompt)

# Log optimization results
log_optimization_results({
    "baseline_score": baseline_score,
    "optimized_score": test_score,
    "improvement": test_score - baseline_score,
    "method": "grid_search",
    "n_templates_tested": len(prompt_variations),
    "n_train_examples": len(train_data),
    "n_test_examples": len(test_data)
})
```

## Anti-Patterns

### ❌ DO NOT: Manual Tweaking Without Data

```python
# BAD: Guessing what works
prompt = "Please convert this table to SQL. Be very precise and accurate."
# Added "be very precise" - does it actually help? Unknown!
```

### ✅ DO: Data-Driven Testing

```python
# GOOD: Test multiple variations on real data
variations = [
    "Convert this table to SQL: {table}",
    "Convert this table to SQL. Be precise: {table}",
    "Convert this table to SQL. Be accurate: {table}",
]
best = test_on_data(variations, train_data, test_data)
# Now we KNOW which works best!
```

---

### ❌ DO NOT: Optimize on Test Set

```python
# BAD: Testing prompts on same data used to select them
best_prompt = None
best_score = 0
for prompt in variations:
    score = evaluate(prompt, test_data)  # WRONG! Using test data
    if score > best_score:
        best_prompt = prompt
        best_score = score
```

### ✅ DO: Use Held-Out Test Set

```python
# GOOD: Separate train and test
for prompt in variations:
    train_score = evaluate(prompt, train_data)  # Select using train

best_prompt = select_best(variations, train_data)
test_score = evaluate(best_prompt, test_data)  # Final eval on test
```

---

### ❌ DO NOT: Single Example Validation

```python
# BAD: "It works on this one example!"
example = test_data[0]
output = call_llm(prompt, example)
if output == example["expected"]:
    print("Prompt is good!")  # WRONG! Need more examples
```

### ✅ DO: Statistical Validation

```python
# GOOD: Test on 100+ examples with confidence intervals
scores = [evaluate(prompt, ex) for ex in test_data]
mean_score = np.mean(scores)
std_error = np.std(scores) / np.sqrt(len(scores))
ci_95 = 1.96 * std_error

print(f"Score: {mean_score:.2%} ± {ci_95:.2%} (95% CI)")
```

---

### ❌ DO NOT: Ignore Real Data

```python
# BAD: Manual prompt crafting when you have data
prompt = """You are an expert SQL generator.
Think carefully and generate high-quality SQL..."""
# Sounds good, but does it actually work? Measure it!
```

### ✅ DO: Let Data Guide You

```python
# GOOD: Use data to find what actually works
baseline_prompt = "Generate SQL for: {table}"
fancy_prompt = """You are an expert SQL generator.
Think carefully and generate high-quality SQL for: {table}"""

baseline_score = evaluate_on_data(baseline_prompt, test_data)
fancy_score = evaluate_on_data(fancy_prompt, test_data)

if fancy_score > baseline_score:
    print(f"Fancy prompt wins: {fancy_score:.2%} vs {baseline_score:.2%}")
else:
    print(f"Baseline wins: {baseline_score:.2%} vs {fancy_score:.2%}")
    # Use simpler baseline!
```

## Key Principles

**Remember these rules:**

1. **If you have real data (100+ examples), ALWAYS write an optimization script**
2. **Don't guess what prompt works - measure it**
3. **Always use held-out test set (20% of data)**
4. **Test on statistical sample (30+ examples minimum)**
5. **Start simple, add complexity only if data shows improvement**
6. **Log all optimization experiments for reproducibility**

## References

- [DSPy Documentation](https://dspy-docs.vercel.app/)
- [Sentence Transformers](https://www.sbert.net/)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
