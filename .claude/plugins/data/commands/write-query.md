# /data:write-query

Write optimized SQL for your dialect with best practices.

## Usage

```
/data:write-query "Get all orders over $100 from last month"
/data:write-query --dialect postgres "Calculate moving average of sales"
/data:write-query --optimize "Find customers who haven't ordered in 90 days"
```

## Description

Generates production-ready SQL with:
1. Proper dialect syntax
2. Performance optimizations
3. Clear formatting and comments
4. Error handling patterns

## Options

- `--dialect [postgres|mysql|sqlite|bigquery|snowflake]`: Target database
- `--optimize`: Include performance hints and index suggestions
- `--explain`: Add detailed comments explaining the query
- `--dry-run`: Show query without execution

## SQL Dialects Supported

| Dialect | Features |
|---------|----------|
| PostgreSQL | CTEs, window functions, JSONB |
| MySQL | Index hints, EXPLAIN |
| SQLite | Lightweight, file-based |
| BigQuery | Unnest, partitioning |
| Snowflake | Semi-structured data, time travel |

## Examples

**Basic Query**:
```
/data:write-query "Find top 5 products by revenue"

SELECT
    product_name,
    SUM(quantity * unit_price) AS total_revenue
FROM orders o
JOIN products p ON o.product_id = p.id
WHERE order_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY product_name
ORDER BY total_revenue DESC
LIMIT 5;
```

**Optimized Query**:
```
/data:write-query --optimize --dialect postgres "Customer lifetime value"

-- Customer Lifetime Value Query
-- Optimized for orders table with customer_id index
WITH customer_orders AS (
    SELECT
        customer_id,
        SUM(total_amount) AS lifetime_value,
        COUNT(*) AS order_count,
        MIN(order_date) AS first_order,
        MAX(order_date) AS last_order
    FROM orders
    WHERE customer_id IS NOT NULL
    GROUP BY customer_id
)
SELECT
    c.customer_name,
    co.lifetime_value,
    co.order_count,
    co.last_order - co.first_order AS customer_tenure
FROM customer_orders co
JOIN customers c ON co.customer_id = c.id
ORDER BY lifetime_value DESC;

-- Performance Notes:
-- - Ensure index on orders(customer_id)
-- - Consider partitioning orders by date for large tables
```

## Best Practices Applied

1. **Explicit column selection** (no SELECT *)
2. **Meaningful aliases**
3. **Consistent formatting**
4. **NULL handling**
5. **Date range optimization**
6. **Index-aware joins**

## Integration

- Execute via quick-data MCP
- Results returned in tabular format
- Supports query explanation
