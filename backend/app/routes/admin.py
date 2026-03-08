from fastapi import APIRouter, HTTPException, Request, Depends
from datetime import datetime, timedelta
import jwt

from psycopg2.extras import RealDictCursor
from passlib.context import CryptContext

from app.schemas import AdminLogin
from app.database import get_connection

router = APIRouter(prefix="/admin", tags=["Admin"])

# ---------------- CONFIG ----------------
SECRET_KEY = "super_secret_admin_key"
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------------- PASSWORD HELPER ----------------
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# ---------------- ADMIN TOKEN VERIFY ----------------
def verify_admin(request: Request):
    auth = request.headers.get("Authorization")

    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")

    token = auth.split(" ")[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Forbidden")
        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ---------------- ADMIN LOGIN ----------------
@router.post("/login")
def admin_login(data: AdminLogin):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute(
            "SELECT id, username, password_hash FROM admins WHERE username = %s",
            (data.username,)
        )
        admin = cursor.fetchone()

        if not admin:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if not verify_password(data.password, admin["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        expire = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)

        token = jwt.encode(
            {
                "sub": admin["username"],
                "admin_id": admin["id"],
                "role": "admin",
                "exp": expire,
            },
            SECRET_KEY,
            algorithm=ALGORITHM,
        )

        return {"token": token}

    finally:
        cursor.close()
        conn.close()

# ---------------- FETCH ALL USERS ----------------
@router.get("/users")
def get_users(admin=Depends(verify_admin)):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    cursor.execute("SELECT id, username, email, address FROM users ORDER BY id DESC")
    users = cursor.fetchall()

    cursor.close()
    conn.close()

    return users

# ---------------- DELETE USER ----------------
@router.delete("/users/{user_id}")
def delete_user(user_id: int, admin=Depends(verify_admin)):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
    conn.commit()

    cursor.close()
    conn.close()

    return {"detail": "User deleted successfully"}

# ---------------- FETCH ANALYZED VIDEOS ----------------
@router.get("/videos")
def get_videos(admin=Depends(verify_admin)):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute("""
            SELECT
                sh.id,
                sh.video_url,
                sh.video_title,
                u.email AS analyzed_by,
                sh.created_at
            FROM sentiment_history sh
            JOIN users u ON sh.user_id = u.id
            ORDER BY sh.created_at DESC
        """)
        return cursor.fetchall()

    except Exception as e:
        print("ADMIN VIDEOS ERROR:", e)
        raise HTTPException(status_code=500, detail="Failed to fetch videos")

    finally:
        cursor.close()
        conn.close()
