import re
from collections import defaultdict
import math

# ------------------------------
# Text cleaning (can be shared)
# ------------------------------
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"[^a-z\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

# ------------------------------
# Naive Bayes Classifier
# ------------------------------
class NaiveBayesClassifier:
    def __init__(self):
        self.class_priors = {}
        self.word_counts = {}
        self.vocab = set()
        self.class_word_counts = {}

    def fit(self, X, y):
        n = len(y)
        self.classes = set(y)

        self.word_counts = {c: defaultdict(int) for c in self.classes}
        self.class_word_counts = {c: 0 for c in self.classes}
        self.class_priors = {c: 0 for c in self.classes}

        for text, label in zip(X, y):
            self.class_priors[label] += 1
            for word in text.split():
                self.word_counts[label][word] += 1
                self.vocab.add(word)
                self.class_word_counts[label] += 1

        for c in self.classes:
            self.class_priors[c] /= n

    def predict(self, X):
        predictions = []
        for text in X:
            scores = {}
            for c in self.classes:
                score = math.log(self.class_priors[c])
                for word in text.split():
                    prob = (self.word_counts[c].get(word, 0) + 1) / (
                        self.class_word_counts[c] + len(self.vocab)
                    )
                    score += math.log(prob)
                scores[c] = score
            predictions.append(max(scores, key=scores.get))
        return predictions
