
import pandas as pd

files = [
    "datsets/Sales.csv",
    "datsets/Customer.csv",
    "datsets/Order.csv",
    "datsets/Products.csv",
    "datsets/Date.csv",
    "datsets/Region.csv",
    "datsets/Category.csv"
]

for file in files:
    print("\n====================")
    print("FILE:", file)

    df = pd.read_csv(file)

    print("Columns:")
    print(df.columns.tolist())

    print("\nSample:")
    print(df.head(3))
