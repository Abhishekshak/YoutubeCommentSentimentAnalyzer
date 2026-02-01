from app.database import get_connection
from app import auth
import json

def get_user_by_email(email: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    return user

def create_user(username: str, address: str, email: str, password: str):
    hashed_password = auth.hash_password(password)
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO users (username, address, email, hashed_password) VALUES (%s,%s,%s,%s) RETURNING id, email",
        (username, address, email, hashed_password)
    )
    user = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return user

# --- Sentiment history CRUD ---

def save_sentiment_history(user_id: int, video_url: str, video_title: str, result: list):
    conn = get_connection()
    cur = conn.cursor()
    # Convert result (list of dicts) to JSON string
    json_result = json.dumps(result)
    cur.execute(
        "INSERT INTO sentiment_history (user_id, video_url, video_title, result) VALUES (%s, %s, %s, %s)",
        (user_id, video_url, video_title, json_result)
    )
    conn.commit()
    cur.close()
    conn.close()

def get_sentiment_history(user_id: int):
    """
    Fetches all sentiment history for a given user.
    Returns a list of dicts with id, video_url, video_title, result.
    """
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, video_url, video_title, result,created_at FROM sentiment_history WHERE user_id=%s ORDER BY id DESC",
        (user_id,)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    history = []
    for row in rows:
        history.append({
            "id": row["id"],
            "video_url": row["video_url"],
            "video_title": row["video_title"],
            "result": row["result"],
            "created_at": row["created_at"]  
        })
    return history


