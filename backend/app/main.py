from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import video, user

app = FastAPI(title="YouTube Sentiment Analyzer")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(video.router, prefix="/video")
app.include_router(user.router)  # ✅ do NOT add prefix here
