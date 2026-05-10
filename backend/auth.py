# import os
# from datetime import datetime, timedelta
# from jose import jwt, JWTError
# from dotenv import load_dotenv
# from fastapi import Depends, HTTPException, status
# from fastapi.security import OAuth2PasswordBearer
# from sqlalchemy.orm import Session
# from passlib.context import CryptContext

# from database import get_db
# from models import User

# load_dotenv()

# SECRET_KEY = os.getenv("SECRET_KEY", "MY_SECRET_KEY")
# ALGORITHM = os.getenv("ALGORITHM", "HS256")
# ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "180"))

# # Correct login endpoint
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")

# # ============================
# # PASSWORD HASHING
# # ============================
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# def hash_password(password: str):
#     """Hash a plaintext password."""
#     return pwd_context.hash(password)


# def verify_password(plain_password: str, hashed_password: str):
#     """Verify entered password with stored hash."""
#     return pwd_context.verify(plain_password, hashed_password)


# # ============================
# # CREATE JWT ACCESS TOKEN
# # ============================
# def create_access_token(data: dict):
#     to_encode = data.copy()
#     expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#     to_encode.update({"exp": expire})
#     return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# # ============================
# # GET CURRENT USER (JWT CHECK)
# # ============================
# def get_current_user(
#     token: str = Depends(oauth2_scheme),
#     db: Session = Depends(get_db)
# ):
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Invalid authentication",
#         headers={"WWW-Authenticate": "Bearer"},
#     )

#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         uid = payload.get("id")

#         if uid is None:
#             raise credentials_exception

#     except JWTError:
#         raise credentials_exception

#     user = db.query(User).filter(User.id == uid).first()

#     if not user:
#         raise credentials_exception

#     return user


import os
from datetime import datetime, timedelta
from jose import jwt, JWTError
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from database import get_db
from models import User
from utils import hash_password, verify_password

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "MY_SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "180"))

# Functions moved to utils.py


# ============================
# CREATE JWT ACCESS TOKEN
# ============================
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ============================
# GET CURRENT USER  ✅ FIXED HEADER
# ============================
def get_current_user(
    authorization: str = Header(None, alias="Authorization"),  # ✅ FIX
    db: Session = Depends(get_db)
):
    print("AUTH HEADER:", authorization)

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication",
        )

    token = authorization.split(" ")[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        uid = payload.get("id")
        email = payload.get("sub")

        if uid:
            user = db.query(User).filter(User.id == uid).first()
        elif email:
            user = db.query(User).filter(User.email == email).first()
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication",
            )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication",
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication",
        )

    return user