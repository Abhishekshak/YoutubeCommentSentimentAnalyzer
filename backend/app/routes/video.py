from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from googleapiclient.discovery import build
from dotenv import load_dotenv
import os
import pickle
import re

from app.ml_model.naive_bayes import clean_text
from app import auth, crud

load_dotenv()

router = APIRouter(tags=["Video"])

# Load ML model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../ml_model/nb_model.pkl")
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

# YouTube API
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)

# Security
security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Authenticate user from Bearer token"""
    token = credentials.credentials
    user_email = auth.verify_access_token(token)

    if not user_email:
        raise HTTPException(status_code=401, detail="Invalid token")

    return user_email


# -----------------------------
# Comment Filtering
# -----------------------------

def is_valid_comment(comment: str):
    """Filter useless comments"""
    text = clean_text(comment)

    if len(text.split()) < 3:
        return False

    if not re.search(r"[a-zA-Z]", text):
        return False

    return True


# -----------------------------
# Fetch Video Title
# -----------------------------

def fetch_video_title(video_id: str):
    try:
        response = youtube.videos().list(
            part="snippet",
            id=video_id
        ).execute()

        return response["items"][0]["snippet"]["title"]

    except Exception:
        return "Unknown Title"


# -----------------------------
# Fetch MANY Comments
# -----------------------------

def fetch_comments(video_id: str, max_comments: int = 500):
    """Fetch comments using pagination"""
    comments = []
    next_page_token = None

    while len(comments) < max_comments:

        response = youtube.commentThreads().list(
            part="snippet",
            videoId=video_id,
            maxResults=100,
            pageToken=next_page_token,
            textFormat="plainText"
        ).execute()

        for item in response.get("items", []):
            comment = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
            comments.append(comment)

        next_page_token = response.get("nextPageToken")

        if not next_page_token:
            break

    return comments[:max_comments]


# -----------------------------
# Analyze Video
# -----------------------------

@router.post("/analyze_video")
def analyze_video(
    payload: dict = Body(...),
    current_user: str = Depends(get_current_user)
):

    video_id = payload.get("video_id")

    if not video_id:
        raise HTTPException(status_code=400, detail="Video ID is required")

    # Extract ID from full URL
    if "v=" in video_id:
        video_id = video_id.split("v=")[1].split("&")[0]

    video_title = fetch_video_title(video_id)

    try:
        comments = fetch_comments(video_id, 500)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Could not fetch comments: {str(e)}"
        )

    # -----------------------------
    # Filter bad comments
    # -----------------------------

    filtered_comments = [c for c in comments if is_valid_comment(c)]

    if not filtered_comments:
        raise HTTPException(
            status_code=400,
            detail="No valid comments found for analysis"
        )

    # -----------------------------
    # Clean + Predict
    # -----------------------------

    cleaned = [clean_text(c) for c in filtered_comments]

    predictions = model.predict(cleaned)

    # -----------------------------
    # Save History
    # -----------------------------

    user_row = crud.get_user_by_email(current_user)

    if not user_row:
        raise HTTPException(status_code=404, detail="User not found")

    user_id = user_row["id"]

    result_data = [
        {"comment": c, "sentiment": int(s)}
        for c, s in zip(filtered_comments, predictions)
    ]

    crud.save_sentiment_history(
        user_id=user_id,
        video_url=video_id,
        video_title=video_title,
        result=result_data
    )

    # -----------------------------
    # Return results
    # -----------------------------

    return {
        "video_id": video_id,
        "video_title": video_title,
        "total_comments_fetched": len(comments),
        "comments_analyzed": len(filtered_comments),
        "results": result_data
    }


# -----------------------------
# History Route
# -----------------------------

@router.get("/history")
def get_history(current_user: str = Depends(get_current_user)):

    user_row = crud.get_user_by_email(current_user)

    if not user_row:
        raise HTTPException(status_code=404, detail="User not found")

    user_id = user_row["id"]

    history = crud.get_sentiment_history(user_id)

    return {"history": history}