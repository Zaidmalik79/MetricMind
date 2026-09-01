 import pandas as pd
import sqlite3


DB_PATH = "backend/metricmind.db"


conn = sqlite3.connect(DB_PATH)


files = {
    "Sales": "datsets/Sales.csv",
    "Customer": "datsets/Customer.csv",
    "Order": "datsets/Order.csv",
    "Products": "datsets/Products.csv",
    "Date": "datsets/Date.csv",
    "Region": "datsets/Region.csv",
    "Category": "datsets/Category.csv"
}


for table, file in files.items():

    df = pd.read_csv(file)

    df.to_sql(
        table,
        conn,
        if_exists="replace",
        index=False
    )

    print(
        f"{table} loaded successfully"
    )

for table, file in files.items():

    df = pd.read_csv(file)

    df.to_sql(
        table,
        conn,
        if_exists="replace",
        index=False
    )

    print(f"{table} loaded successfully")


# Create ChatHistory table
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS ChatHistory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    generated_sql TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")

conn.commit()

print("ChatHistory table created successfully")

conn.close()

print("Database loading completed")
conn.close()

print("Database loading completed")
