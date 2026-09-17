from sqlalchemy import text

from backend.database.database import engine


class QueryService:

    @staticmethod
    def execute_query(sql: str):

        with engine.connect() as conn:

            result = conn.execute(text(sql))

            columns = result.keys()

            rows = result.fetchall()

            return [
                dict(zip(columns, row))
                for row in rows
            ]

    @staticmethod
    def validate_sql(sql: str):

        if not sql:
            return False

        sql = sql.strip().lower()

        allowed = (
            "select",
            "show",
            "with"
        )

        return sql.startswith(allowed)