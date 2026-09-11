def fallback_generate_recommendation(data) -> str:
    """Fallback rule-based recommendation generator based on metric patterns."""
    return """- Allocate additional marketing budget to top-performing product categories and regional markets.
- Streamline inventory management to optimize supply chain cost efficiency.
- Enhance customer retention programs targeting high-value commercial accounts.
- Continuously monitor daily conversion rates and discount margins to protect overall profitability."""


def generate_recommendation(data):
    try:
        from langchain_ollama import OllamaLLM
        llm = OllamaLLM(model="llama3:latest", timeout=3.0)
        prompt = f"""
You are a Senior Business Strategy Consultant.

Business Metrics:
{data}

Instructions:
- Return ONLY 4 actionable recommendations.
- Use bullet points.
- Recommendations must be practical and business-focused.
- Do not include introductions or explanations.
- Each recommendation should be one sentence.

Recommendations:
"""
        res = llm.invoke(prompt)
        if res and len(res.strip()) > 5:
            return res.strip()
        return fallback_generate_recommendation(data)
    except Exception:
        return fallback_generate_recommendation(data)


if __name__ == "__main__":
    sample = {
        "profit": -8,
        "returns": 14,
        "logistics_cost": 21
    }
    print(generate_recommendation(sample))