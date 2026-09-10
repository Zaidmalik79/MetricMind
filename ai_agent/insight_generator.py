def fallback_generate_insight(data) -> str:
    """Fallback rule-based insight generator based on result structure."""
    if not data:
        return "No record matching the query criteria was found in the dataset."

    if isinstance(data, list) and len(data) > 0:
        first_row = data[0]
        keys = list(first_row.keys())

        if "total_revenue" in keys:
            rev = first_row["total_revenue"]
            return f"Overall cumulative business revenue stands at ${float(rev):,.2f}, indicating robust top-line commercial activity."

        if "Region" in keys or "total_sales" in keys:
            top_entity = first_row.get("Region") or first_row.get("ProductName") or first_row.get("Category") or "Top segment"
            top_val = first_row.get("total_sales", 0)
            return f"The leading performer is '{top_entity}' generating ${float(top_val):,.2f} in revenue across the evaluated period."

        return f"Successfully retrieved {len(data)} analytical records highlighting key operational business metrics."

    return "Analytical query processed successfully with key performance metrics."


def generate_insight(data):
    try:
        from langchain_ollama import OllamaLLM
        llm = OllamaLLM(model="llama3:latest", timeout=3.0)
        prompt = f"""
You are a Senior Business Analyst.

Analyze the business data below.

Business Data:
{data}

Instructions:
- Return ONLY the business insight.
- Do not explain your reasoning.
- Do not use headings.
- Keep it under 3 sentences.
- Use professional business language.
"""
        res = llm.invoke(prompt)
        if res and len(res.strip()) > 5:
            return res.strip()
        return fallback_generate_insight(data)
    except Exception:
        return fallback_generate_insight(data)


if __name__ == "__main__":
    sample = {
        "region": "South",
        "revenue": 1520000,
        "growth": 18
    }
    print(generate_insight(sample))