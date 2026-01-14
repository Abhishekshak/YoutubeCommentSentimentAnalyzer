from fastapi import APIRouter, Query
from googleapiclient.discovery import build
from dotenv import load_dotenv
import os
import pickle

from app.ml_model.naive_bayes import clean_text

load_dotenv()

router = APIRouter(tags=["Video"])

# Load model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../ml_model/nb_model.pkl")

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

# YouTube API
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)

@router.get("/analyze_video")
def analyze_video(video_id: str = Query(...)):
    if "v=" in video_id:
        video_id = video_id.split("v=")[1].split("&")[0]

    response = youtube.commentThreads().list(
        part="snippet",
        videoId=video_id,
        maxResults=100,
        textFormat="plainText"
    ).execute()

    comments = [
        item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
        for item in response.get("items", [])
    ]

    cleaned = [clean_text(c) for c in comments]
    predictions = model.predict(cleaned)

    return {
        "video_id": video_id,
        "results": [
            {"comment": c, "sentiment": s}
            for c, s in zip(comments, predictions)
        ]
    }
