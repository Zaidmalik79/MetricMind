from langchain_ollama import OllamaLLM


class AIService:

    MODEL_NAME = "llama3:latest"

    PROMPT_TEMPLATE = """
You are a SQL Expert.

Convert the following question into SQL.

Return ONLY SQL.

Question:
{question}

SQL:
"""

    def __init__(self):
        self.llm = OllamaLLM(model=self.MODEL_NAME)

    def generate_sql(self, question: str):
        prompt = self.PROMPT_TEMPLATE.format(question=question)

        sql = self.llm.invoke(prompt)

        sql = (
            sql.replace("```sql", "")
               .replace("```", "")
               .strip()
        )

        return sql