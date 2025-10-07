# debug_columns.py
import pandas as pd

# Load the dataset
df = pd.read_csv("data/voice.csv")

# Print all column names
print("Columns in the dataset:")
for i, col in enumerate(df.columns):
    print(f"{i+1}. {col}")
