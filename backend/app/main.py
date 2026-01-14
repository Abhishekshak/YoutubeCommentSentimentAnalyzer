from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import video  # import router

app = FastAPI(title="YouTube Sentiment Analyzer")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include router with prefix
app.include_router(video.router, prefix="/video")
