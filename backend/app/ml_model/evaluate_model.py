import pickle
import os
import pandas as pd
from sklearn.metrics import confusion_matrix, classification_report
from app.ml_model.naive_bayes import NaiveBayesClassifier, clean_text

# Load trained model
model_path = os.path.join(os.path.dirname(__file__), "nb_model.pkl")
with open(model_path, "rb") as f:
    nb = pickle.load(f)

# Load your dataset
df = pd.read_csv(os.path.join(os.path.dirname(__file__), "dataset.csv"))

# Clean comments
X_test = df['comment'].apply(clean_text)
y_true = df['sentiment']  # actual labels: "positive" / "negative"

# Predict and convert numbers to text
y_pred_raw = nb.predict(X_test)
y_pred = ["positive" if p == 1 else "negative" for p in y_pred_raw]

# Confusion Matrix
cm = confusion_matrix(y_true, y_pred, labels=["negative", "positive"])
print("Confusion Matrix:")
print(cm)

# Full report
print("\nClassification Report:")
print(classification_report(y_true, y_pred, target_names=["negative", "positive"]))

#python -m app.ml_model.evaluate_model