# Business Metrics Documentation

## Introduction

Business metrics are standardized measurements used to evaluate the performance of an organization. A Semantic Layer ensures that these metrics are consistently defined and calculated across reports, dashboards, and analytical applications, providing a single source of truth for business users

---

# 1. Revenue

## Definition

Revenue is the total income generated from the sale of products or services before deducting any expenses.

## Formula

Revenue = SUM(sales_amount)

## Expected Database Column

- sales_amount

## Business Meaning

Revenue measures the total money earned from sales and helps evaluate the overall business performance.

---

# 2. Profit

## Definition

Profit is the amount remaining after deducting the total cost from the total revenue.

## Formula

Profit = Revenue − Cost

## Expected Database Columns

- sales_amount
- cost

## Business Meaning

Profit indicates the actual earnings of the business after covering all costs and expenses.

---

# 3. Orders

## Definition

Orders represent the total number of customer orders placed during a given period.

## Formula

Orders = COUNT(order_id)

## Expected Database Column

- order_id

## Business Meaning

This metric measures customer demand and overall business activity.

---

# 4. Customers

## Definition

Customers represent the total number of unique customers who have placed orders.

## Formula

Customers = COUNT(DISTINCT customer_id)

## Expected Database Column

- customer_id

## Business Meaning

This metric helps measure customer reach and engagement.

---

# 5. Average Order Value (AOV)

## Definition

Average Order Value (AOV) represents the average amount spent by a customer in a single order.

## Formula

Average Order Value = Revenue / Orders

## Expected Database Columns

- sales_amount
- order_id

## Business Meaning

This metric helps analyze customer purchasing behavior and average spending per transaction.

---

# 6. Growth Percentage

## Definition

Growth Percentage measures the increase or decrease in business performance over a specific period.

## Formula

Growth % = ((Current Value − Previous Value) / Previous Value) × 100

## Expected Database Columns

- sales_amount
- order_date

## Business Meaning

This metric helps track business growth over time and evaluate performance trends.

---

# 7. Sales

## Definition

Sales represent the total value of products or services sold during a given period.

## Formula

Sales = SUM(sales_amount)

## Expected Database Column

- sales_amount

## Business Meaning

Sales indicate the total value generated from completed transactions.

---

# 8. Discount

## Definition

Discount is the reduction in the original selling price offered to customers.

## Formula

Discount = SUM(discount_amount)

## Expected Database Column

- discount_amount

## Business Meaning

This metric helps evaluate promotional strategies and their impact on revenue.

---

# 9. Cost

## Definition

Cost represents the total expense incurred in producing or purchasing products or services.

## Formula

Cost = SUM(cost)

## Expected Database Column

- cost

## Business Meaning

Cost helps monitor operational expenses and is essential for calculating profitability.

---

# 10. Margin

## Definition

Margin represents the percentage of revenue that remains as profit after covering all costs.

## Formula

Margin % = (Profit / Revenue) × 100

## Expected Database Columns

- sales_amount
- cost

## Business Meaning

Margin measures business profitability and operational efficiency.

---

# Summary

| Metric | Formula | Expected Database Column(s) |
|---------|---------|-----------------------------|
| Revenue | SUM(sales_amount) | sales_amount |
| Profit | Revenue − Cost | sales_amount, cost |
| Orders | COUNT(order_id) | order_id |
| Customers | COUNT(DISTINCT customer_id) | customer_id |
| Average Order Value | Revenue / Orders | sales_amount, order_id |
| Growth Percentage | ((Current Value − Previous Value) / Previous Value) × 100 | sales_amount, order_date |
| Sales | SUM(sales_amount) | sales_amount |
| Discount | SUM(discount_amount) | discount_amount |
| Cost | SUM(cost) | cost |
| Margin | (Profit / Revenue) × 100 | sales_amount, cost |

---

# Conclusion

Standardizing business metrics within a Semantic Layer ensures consistency, accuracy, and reliability across reports, dashboards, and analytical applications. Clearly defined metrics enable both technical teams and business users to interpret data consistently and make informed business decisions.
