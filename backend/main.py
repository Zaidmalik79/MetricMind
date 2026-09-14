

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.charts import router as charts_router
from backend.api.investigate import router as investigate_router
from backend.schemas.chat import ChatRequest
from backend.services.query_service import QueryService

from ai_agent.text_to_sql import generate_sql
from ai_agent.insight_generator import generate_insight
from ai_agent.recommendation_engine import generate_recommendation
from ai_agent.chart_recommender import recommend_chart
print(">>> backend.main loaded <<<")


app = FastAPI(
    title="MetricMind Backend API",
    version="1.0.0"
)

# ---------------- CORS ---------------- #

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Routers ---------------- #

app.include_router(charts_router)
app.include_router(investigate_router)

# ---------------- Dashboard Stats API ---------------- #

@app.get("/api/dashboard/stats", summary="Get Overview KPIs")
def get_dashboard_stats():
    try:
        rev_res = QueryService.execute_query('SELECT SUM("SalesAmount") as total_revenue, COUNT("OrderID") as total_orders, AVG("SalesAmount") as avg_order_value FROM sales;')
        cust_res = QueryService.execute_query('SELECT COUNT(DISTINCT "CustomerID") as total_customers FROM customer;')
        
        rev_data = rev_res[0] if rev_res else {}
        cust_data = cust_res[0] if cust_res else {}
        
        return {
            "status": "success",
            "kpis": {
                "total_revenue": round(float(rev_data.get("total_revenue", 0) or 0), 2),
                "total_orders": int(rev_data.get("total_orders", 0) or 0),
                "avg_order_value": round(float(rev_data.get("avg_order_value", 0) or 0), 2),
                "total_customers": int(cust_data.get("total_customers", 0) or 0),
                "revenue_growth": 14.8
            }
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/tables/{table_name}", summary="Explore Table Data")
def explore_table(table_name: str, limit: int = 15):
    try:
        allowed_tables = ["sales", "customer", "products", "category", "region"]
        clean_name = table_name.lower()
        if clean_name not in allowed_tables:
            return {"status": "error", "message": "Invalid table requested"}
            
        res = QueryService.execute_query(f'SELECT * FROM "{clean_name}" LIMIT {limit};')
        return {"status": "success", "table": clean_name, "rows": res}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ---------------- Root API ---------------- #

@app.get(
    "/",
    summary="Root API",
    description="Returns a welcome message to verify that the MetricMind Backend API is running."
)
def root():
    return {
        "message": "Welcome to MetricMind Backend API"
    }


# ---------------- Health API ---------------- #

@app.get(
    "/health",
    summary="Health Check",
    description="Checks whether the backend service is running successfully."
)
def health():
    return {
        "status": "healthy"
    }


# ---------------- Chat API ---------------- #
@app.post("/chat")
def chat(request: ChatRequest):
    try:
        print("===== CHAT API CALLED =====")
        print("Question:", request.question)

        sql = generate_sql(request.question)
        print("Generated SQL:", sql)
        print("=" * 60)
        print("RAW AI SQL:")
        print(sql)
        print("=" * 60)

        sql = (
            sql.replace("```sql", "")
               .replace("```", "")
               .strip()
        )

        if not QueryService.validate_sql(sql):
            return {
                "success": False,
                "generated_sql": sql,
                "error": "Unsafe SQL generated."
            }

        query_result = QueryService.execute_query(sql)
        print("Query Result:", query_result)

        insight = generate_insight(query_result)
        recommendation = generate_recommendation(query_result)
        chart = recommend_chart(request.question)

        return {
            "question": request.question,
            "generated_sql": sql,
            "query_result": query_result,
            "chart": chart,
            "insight": insight,
            "recommendation": recommendation
        }

    except Exception as e:
        import traceback
        traceback.print_exc()

        return {
            "success": False,
            "error": str(e)
        }