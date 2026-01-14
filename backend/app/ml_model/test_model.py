import pickle
import os
from naive_bayes import NaiveBayesClassifier, clean_text

# ------------------------------
# Load trained model
# ------------------------------
model_path = os.path.join(os.path.dirname(__file__), "nb_model.pkl")
with open(model_path, "rb") as f:
    nb = pickle.load(f)

# ------------------------------
# Test comments
# ------------------------------
test_comments = [
    "I really love this video",
    "This is terrible and boring",
    "Worst content ever",
    "Amazing explanation, very helpful",
    "I hate this video"
]

print("\n🔍 Testing Sentiment Predictions:\n")

for comment in test_comments:
    cleaned = clean_text(comment)
    pred = nb.predict([cleaned])[0]
    sentiment = "positive" if pred == 1 else "negative"
    print(f"Comment: {comment}")
    print(f"Predicted Sentiment: {sentiment}\n")
