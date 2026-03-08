from fastapi import APIRouter
from pydantic import BaseModel
import os
import pickle
from app.ml_model.naive_bayes import NaiveBayesClassifier, clean_text  # use the proper one

router = APIRouter(tags=["SingleComment"])

# ------------------------------
# Load trained pickled model
# ------------------------------
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../ml_model/nb_model.pkl")

with open(MODEL_PATH, "rb") as f:
    nb_model = pickle.load(f)

# ------------------------------
# Request model
# ------------------------------
class Comment(BaseModel):
    text: str

# ------------------------------
# Comment validation (no minimum word count)
# ------------------------------
def is_valid_comment(text: str) -> bool:
    cleaned = clean_text(text)

    if not cleaned:
        return False

    words = cleaned.split()
    
    # Remove short tokens like a b c l x
    meaningful_words = [w for w in words if len(w) > 1]  # keep words of length 2+ to allow short phrases

    # Must contain at least one meaningful word
    if len(meaningful_words) < 1:
        return False

    # Must contain letters
    if not any(c.isalpha() for c in cleaned):
        return False

    # Prevent same word repetition like "good good good"
    if len(set(meaningful_words)) <= 1 and len(meaningful_words) > 1:
        return False

    # Prevent nonsense like "aaaaa aaaaa"
    if all(len(set(w)) == 1 for w in meaningful_words):
        return False

    return True

# ------------------------------
# Single comment analysis
# ------------------------------
@router.post("/analyze")
def analyze_comment(comment: Comment):
    if not is_valid_comment(comment.text):
        return {
            "comment": comment.text,
            "sentiment": "Comment not valid or too short to analyze."
        }

    # Use the imported clean_text (negation-aware)
    cleaned = clean_text(comment.text)
    prediction = nb_model.predict([cleaned])[0]

    sentiment = "positive" if prediction in [1, "1"] else "negative"
    
    return {
        "comment": comment.text,
        "cleaned_text": cleaned,
        "sentiment": sentiment
    }