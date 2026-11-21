# SQL Queries Skill

Auto-triggered skill for SQL best practices and query optimization.

## Trigger Phrases

- "write SQL to"
- "query for"
- "SELECT"
- "JOIN tables"
- "aggregate data"
- "group by"
- "database query"

## SQL Best Practices

### 1. Query Structure
```sql
-- Standard pattern
SELECT
    column1,
    column2,
    aggregate_function(column3) AS alias
FROM table1
JOIN table2 ON table1.id = table2.foreign_id
WHERE conditions
GROUP BY column1, column2
HAVING aggregate_conditions
ORDER BY column1
LIMIT n;
```

### 2. Performance Guidelines

**Index Usage**:
- Filter on indexed columns first
- Avoid functions on indexed columns in WHERE
- Use EXPLAIN to verify index usage

**Join Optimization**:
- Join smaller tables first
- Use appropriate join types (INNER vs LEFT)
- Avoid Cartesian products

**Aggregation**:
- Filter before aggregating
- Use HAVING only for aggregate conditions
- Consider materialized views for complex aggregates

### 3. Common Patterns

**Running Totals**:
```sql
SELECT
    date,
    amount,
    SUM(amount) OVER (ORDER BY date) AS running_total
FROM transactions;
```

**Ranking**:
```sql
SELECT
    product,
    sales,
    RANK() OVER (ORDER BY sales DESC) AS sales_rank
FROM products;
```

**Pivoting**:
```sql
SELECT
    product,
    SUM(CASE WHEN month = 'Jan' THEN sales ELSE 0 END) AS jan_sales,
    SUM(CASE WHEN month = 'Feb' THEN sales ELSE 0 END) AS feb_sales
FROM monthly_sales
GROUP BY product;
```

### 4. Dialect Differences

| Feature | PostgreSQL | MySQL | SQLite |
|---------|------------|-------|--------|
| Date add | + INTERVAL '1 day' | DATE_ADD() | datetime('+1 day') |
| String concat | \|\| | CONCAT() | \|\| |
| Boolean | TRUE/FALSE | 1/0 | 1/0 |
| Upsert | ON CONFLICT | ON DUPLICATE KEY | ON CONFLICT |

## Integration

Works with quick-data MCP for query execution and result formatting.
