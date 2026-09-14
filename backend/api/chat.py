from fastapi import APIRouter
from backend.schemas.chat import ChatRequest
from backend.services.ai_service import AIService
from backend.services.query_service import QueryService
from backend.utils.logger import logger
import time

router = APIRouter()


@router.post("/chat")
def chat(request: ChatRequest):

    question = request.question

    start = time.time()

    logger.info(f"Question Received: {question}")

    ai = AIService()

    sql = ai.generate_sql(question)

    logger.info(f"Generated SQL: {sql}")

    result = QueryService.execute_query(sql)

    end = time.time()

    logger.info(f"Execution Time: {end-start:.2f} seconds")

    return {
        "question": question,
        "generated_sql": sql,
        "result": result
    }