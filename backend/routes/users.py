from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from schemas import UserCreate, UserLogin, UserOut, Token
from crud import create_user, authenticate_user
from auth import create_access_token
from models import User

router = APIRouter(prefix="/users", tags=["Users"])

# REGISTER
@router.post("/register", response_model=UserOut)
def register(data: UserCreate, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.email == data.email).first()
    if exists:
        raise HTTPException(status_code=400, detail="Email already exists")

    return create_user(db, data)

# LOGIN
@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, data.email, data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Credentials",
        )

    token = create_access_token({
        "id": user.id,
        "email": user.email 
    })

    return {"access_token": token, "token_type": "bearer"}
