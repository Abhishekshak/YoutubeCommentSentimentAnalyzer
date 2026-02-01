from pydantic import BaseModel

# --- User Schemas ---
class UserCreate(BaseModel):
    username: str
    address: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str

# --- Sentiment History Schemas ---
class SentimentHistoryCreate(BaseModel):
    video_url: str
    video_title: str
    sentiment: str  # e.g., "Positive", "Negative", "Neutral"

class SentimentHistoryOut(BaseModel):
    video_url: str
    video_title: str
    sentiment: str
