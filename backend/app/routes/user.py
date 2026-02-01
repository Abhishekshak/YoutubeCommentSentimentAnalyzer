from fastapi import APIRouter, HTTPException, Depends, Header
from app import schemas, crud, auth
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter(prefix="/auth", tags=["auth"])

security = HTTPBearer()  # ✅ for Bearer token

# ------------------ REGISTER ------------------
@router.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate):
    if crud.get_user_by_email(user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = crud.create_user(user.username, user.address, user.email, user.password)
    token = auth.create_access_token({"sub": new_user["email"]})
    return {"access_token": token, "token_type": "bearer", "username": user.username}

# ------------------ LOGIN ------------------
@router.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin):
    db_user = crud.get_user_by_email(user.email)
    if not db_user or not auth.verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = auth.create_access_token({"sub": db_user["email"]})
    return {"access_token": token, "token_type": "bearer", "username": db_user["username"]}

# ------------------ GET CURRENT USER ------------------
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = auth.decode_access_token(token)
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email  # you can return full user info if needed
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
