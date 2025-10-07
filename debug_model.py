# debug_dataset.py
import pandas as pd
import os

# Path to your dataset CSV
DATA_PATH = "data/voice.csv"  # replace with your CSV path

if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(f"{DATA_PATH} not found!")

# Load dataset
df = pd.read_csv(DATA_PATH)

# Print column names
print("Columns in the dataset:")
for i, col in enumerate(df.columns, start=1):
    print(f"{i}. {col}")

print("\nFirst 10 rows of the dataset:")
print(df.head(10))
