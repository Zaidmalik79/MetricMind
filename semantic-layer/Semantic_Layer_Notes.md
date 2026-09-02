# Semantic Layer Notes

## Introduction

A Semantic Layer is a business friendly layer that sits between the database and the users. It provides a simple and consistent way to access data without requiring knowledge of complex database queries. It ensures that everyone in an organization uses the same definitions for business terms and metrics

---

## Why is a Semantic Layer Important?

- Simplifies complex database structures.
- Provides consistent business definitions.
- Reduces duplicate calculations.
- Makes reporting faster and more accurate.
- Allows both technical and non-technical users to understand data easily.

---

## Metrics

### Definition

Metrics are business performance indicators used to measure how a business is performing. They are usually calculated from one or more measures and help organizations make business decisions.

### Examples

- Revenue
- Profit
- Total Orders
- Customer Count
- Average Order Value
- Sales Growth

### Example

If the total sales amount for a day is ₹1,00,000, then **Revenue = ₹1,00,000** is a business metric.

---

## Dimensions

### Definition

Dimensions are descriptive attributes that provide context to business data. They are used to group, filter, and analyze information.

### Examples

- Customer Name
- Product Name
- Region
- Category
- Date
- Month
- Year

### Example

A company can analyze revenue by:
- Region
- Product
- Month
- Customer

Here, Region, Product, Month, and Customer are dimensions.

---

## Facts

### Definition

Facts represent actual business events or transactions that have occurred. They usually contain numerical values and are stored in fact tables.

### Examples

- A customer placed an order.
- A product was sold.
- A payment was received.
- A shipment was delivered.

### Example

| Order ID | Customer | Product | Quantity | Sales Amount |
|----------|----------|----------|----------|-------------:|
| 1001 | Rahul | Laptop | 1 | ₹50,000 |

This transaction is a **Fact** because it records a real business event.

---

## Measures

### Definition

Measures are numerical values that can be calculated or aggregated from facts. They are used to perform business analysis.

### Common Aggregations

- SUM
- COUNT
- AVERAGE
- MIN
- MAX

### Example

Sales Transactions:

- ₹50,000
- ₹20,000
- ₹30,000

Total Sales = ₹1,00,000

Here, **Total Sales** is a **Measure** because it is calculated from the sales transactions.

---

## Difference Between Metrics, Dimensions, Facts and Measures

| Term | Description |
|------|-------------|
| Metrics | Business performance indicators such as Revenue and Profit. |
| Dimensions | Descriptive information used to categorize data, such as Product or Region. |
| Facts | Actual business events or transactions. |
| Measures | Numerical values calculated from facts using functions like SUM or COUNT. |

---

## Relationship

- Business Transactions create **Facts**.
- **Facts** contain the raw business data.
- **Measures** are calculated from Facts.
- **Metrics** are business performance indicators built from Measures.
- **Dimensions** are used to filter, group, and analyze Facts, Measures, and Metrics.
## Conclusion

A Semantic Layer makes business data easier to understand by providing consistent definitions for metrics, dimensions, facts, and measures. It improves reporting, supports better decision-making, and allows users to analyze data without needing deep technical knowledge of the underlying database.
