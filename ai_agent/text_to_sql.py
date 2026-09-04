from pathlib import Path
import re

BASE_DIR = Path(__file__).parent
prompt_path = BASE_DIR / "prompts" / "sql_prompt.txt"

with open(prompt_path, "r", encoding="utf-8") as file:
    sql_prompt = file.read()


def fallback_generate_sql(question: str) -> str:
    """Fallback rule-based SQL generator when local Ollama service is unavailable."""
    q = question.lower().strip()

    if "total revenue" in q or "total sales" in q or "sum sales" in q or "overall revenue" in q:
        return 'SELECT SUM("SalesAmount") AS total_revenue FROM sales;'

    if "region" in q or "sales by region" in q or "revenue by region" in q:
        return 'SELECT c."Region", SUM(s."SalesAmount") AS total_sales FROM sales s JOIN customer c ON s."CustomerID" = c."CustomerID" GROUP BY c."Region" ORDER BY total_sales DESC;'

    if "top" in q and "product" in q:
        match = re.search(r'\d+', q)
        limit = match.group(0) if match else "5"
        return f'SELECT p."ProductName", SUM(s."SalesAmount") AS total_sales FROM sales s JOIN products p ON s."ProductID" = p."ProductID" GROUP BY p."ProductName" ORDER BY total_sales DESC LIMIT {limit};'

    if "top" in q and ("customer" in q or "client" in q):
        match = re.search(r'\d+', q)
        limit = match.group(0) if match else "5"
        return f'SELECT s."CustomerID", SUM(s."SalesAmount") AS total_sales FROM sales s GROUP BY s."CustomerID" ORDER BY total_sales DESC LIMIT {limit};'

    if "category" in q:
        return 'SELECT p."Category", SUM(s."SalesAmount") AS total_sales FROM sales s JOIN products p ON s."ProductID" = p."ProductID" GROUP BY p."Category" ORDER BY total_sales DESC;'

    if "monthly" in q or "trend" in q or "month" in q:
        return 'SELECT s."OrderDate", SUM(s."SalesAmount") AS daily_sales FROM sales s GROUP BY s."OrderDate" ORDER BY s."OrderDate" LIMIT 15;'

    if "customer" in q or "all customer" in q:
        return 'SELECT * FROM customer LIMIT 10;'

    if "product" in q:
        return 'SELECT * FROM products LIMIT 10;'

    if "order" in q:
        return 'SELECT * FROM sales LIMIT 10;'

    # Default query
    return 'SELECT * FROM sales LIMIT 10;'


def generate_sql(question: str) -> str:
    try:
        from langchain_ollama import OllamaLLM
        llm = OllamaLLM(model="llama3:latest", timeout=3.0)
        prompt = f"""
{sql_prompt}

User Request:
{question}

SQL:
"""
        result = llm.invoke(prompt)
        if result and isinstance(result, str) and len(result.strip()) > 5:
            return result
        return fallback_generate_sql(question)
    except Exception:
        return fallback_generate_sql(question)


def main():
    question = input("Enter your question: ")
    print("\nGenerated SQL:\n")
    print(generate_sql(question))


if __name__ == "__main__":
    main()