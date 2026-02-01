from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from googleapiclient.discovery import build
from dotenv import load_dotenv
import os
import pickle
import json

from app.ml_model.naive_bayes import clean_text
from app import auth, crud  # your auth and crud modules

load_dotenv()

router = APIRouter(tags=["Video"])

# Load ML model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../ml_model/nb_model.pkl")
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

# YouTube API
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)

# HTTP Bearer security
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Authenticate user from Bearer token"""
    token = credentials.credentials
    user_email = auth.verify_access_token(token)
    if not user_email:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_email

def fetch_video_title(video_id: str) -> str:
    """Fetch video title from YouTube API"""
    try:
        response = youtube.videos().list(part="snippet", id=video_id).execute()
        title = response["items"][0]["snippet"]["title"]
        return title
    except Exception:
        return "Unknown Title"


@router.post("/analyze_video")
def analyze_video(
    payload: dict = Body(...),
    current_user: str = Depends(get_current_user)
):
    """Analyze a YouTube video's comments and save sentiment history"""
    video_id = payload.get("video_id")
    if not video_id:
        raise HTTPException(status_code=400, detail="Video ID is required")

    # Extract video ID if a full URL is provided
    if "v=" in video_id:
        video_id = video_id.split("v=")[1].split("&")[0]

    # Fetch video title automatically
    video_title = fetch_video_title(video_id)

    # Fetch top-level comments
    try:
        response = youtube.commentThreads().list(
            part="snippet",
            videoId=video_id,
            maxResults=100,
            textFormat="plainText"
        ).execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not fetch comments: {str(e)}")

    comments = [
        item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
        for item in response.get("items", [])
    ]

    # Clean comments and predict sentiment
    cleaned = [clean_text(c) for c in comments]
    predictions = model.predict(cleaned)

    # Save sentiment history to DB
    user_row = crud.get_user_by_email(current_user)
    if not user_row:
        raise HTTPException(status_code=404, detail="User not found")

    user_id = user_row['id']
    crud.save_sentiment_history(
        user_id=user_id,
        video_url=video_id,
        video_title=video_title,
        result=[{"comment": c, "sentiment": int(s)} for c, s in zip(comments, predictions)]
    )

    # Return sentiment results
    return {
        "video_id": video_id,
        "video_title": video_title,
        "results": [
            {"comment": c, "sentiment": int(s)}
            for c, s in zip(comments, predictions)
        ]
    }


@router.get("/history")
def get_history(current_user: str = Depends(get_current_user)):
    """Fetch all sentiment analysis history for the current user"""
    user_row = crud.get_user_by_email(current_user)
    if not user_row:
        raise HTTPException(status_code=404, detail="User not found")

    user_id = user_row['id']
    history = crud.get_sentiment_history(user_id)
    return {"history": history}
