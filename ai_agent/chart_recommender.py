def recommend_chart(question: str):
    """
    Recommend the best chart type based on the business question.
    """

    question = question.lower()

    # Line Chart
    if "trend" in question or "monthly" in question or "yearly" in question:
        return "Line Chart"

    # Bar Chart
    elif "region" in question or "top" in question or "category" in question:
        return "Bar Chart"

    # Area Chart
    elif "profit trend" in question:
        return "Area Chart"

    # Pie Chart
    elif "distribution" in question or "share" in question:
        return "Pie Chart"

    # Column Chart
    elif "orders" in question:
        return "Column Chart"

    # Default
    return "Table"
if __name__ == "__main__":

    test_questions = [
        "Show sales by region",
        "Monthly revenue",
        "Profit trend",
        "Customer distribution",
        "Orders by month",
        "Top customers"
    ]

    for question in test_questions:
        chart = recommend_chart(question)
        print(f"Question : {question}")
        print(f"Chart    : {chart}")
        print("-" * 40)

