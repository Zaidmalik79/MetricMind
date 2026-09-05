"""
METRICMIND - Agentic BI
Day 3: First LangChain Program

Objective:
- Connect LangChain with Ollama (Llama 3)
- Ask predefined questions
- Display AI responses in the terminal
"""

# Import the Ollama LLM from LangChain
from langchain_ollama import OllamaLLM

# Initialize the LLM
llm = OllamaLLM(model="llama3:latest")


def ask_ai(question):
    """Send a question to the model and return the response."""
    return llm.invoke(question)


def main():
    questions = [
        "Hello",
        "What is SQL?",
        "What is Revenue?",
        "Explain Profit."
    ]

    print("=" * 60)
    print("METRICMIND - Agentic BI")
    print("Day 3 : LangChain + Llama")
    print("=" * 60)

    for question in questions:
        print(f"\nYou: {question}")
        print(f"AI : {ask_ai(question)}")

    print("\nProgram completed successfully!")


if __name__ == "__main__":
    main()