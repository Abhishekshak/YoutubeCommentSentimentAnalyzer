import pandas as pd
import pickle
import os
from app.ml_model.naive_bayes import NaiveBayesClassifier, clean_text

# ------------------------------
# Paths
# ------------------------------
BASE_DIR = os.path.dirname(__file__)
DATASET_PATH = os.path.join(BASE_DIR, "dataset.csv")
MODEL_PATH = os.path.join(BASE_DIR, "nb_model.pkl")

# ------------------------------
# Load dataset
# ------------------------------
try:
    df = pd.read_csv(DATASET_PATH)
except FileNotFoundError:
    raise FileNotFoundError(f"Dataset not found at {DATASET_PATH}")

# Keep only positive & negative labels
df = df[df["sentiment"].isin(["positive", "negative"])]

# Map sentiment labels to 1 (positive) and 0 (negative)
df["sentiment"] = df["sentiment"].map({
    "positive": 1,
    "negative": 0
})

# Clean comments
df["comment"] = df["comment"].apply(clean_text)

X = df["comment"].tolist()
y = df["sentiment"].tolist()

# ------------------------------
# Train Naive Bayes model
# ------------------------------
nb_model = NaiveBayesClassifier()
nb_model.fit(X, y)

# ------------------------------
# Save trained model
# ------------------------------
with open(MODEL_PATH, "wb") as f:
    pickle.dump(nb_model, f)

print(f"✅ Model retrained and saved successfully at {MODEL_PATH}")
