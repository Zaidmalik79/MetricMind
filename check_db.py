import sqlite3

conn = sqlite3.connect("metricmind.db")

cursor = conn.cursor()

tables = cursor.execute(
    "SELECT name FROM sqlite_master WHERE type='table';"
).fetchall()

print("Tables:")
for table in tables:
    print(table[0])

conn.close()
