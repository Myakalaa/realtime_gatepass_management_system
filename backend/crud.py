from sqlalchemy.orm import Session
from models import User, Pass, Document
from schemas import PassCreate, UserCreate
from utils import hash_password, verify_password


# ===============================
# USER FUNCTIONS  ⭐ FIX
# ===============================

def create_user(db: Session, user: UserCreate):
    db_user = User(
        fullname=user.fullname,
        email=user.email,
        password=hash_password(user.password),
        role="student"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password):
        return None
    return user


# ===============================
# PASS FUNCTIONS (your existing)
# ===============================

from sqlalchemy.orm import Session
from models import Pass
from schemas import PassCreate


def create_pass(db: Session, user_id: int, data: PassCreate):
    gp = Pass(
        user_id=user_id,
        student_name=data.student_name,
        purpose=data.purpose,
        department=data.department,
        mobile_number=data.mobile_number,
        student_id=data.student_id,
        pass_type=data.pass_type,
        vehicle_number=data.vehicle_number,
        vehicle_type=data.vehicle_type,
        in_time=data.in_time,
        out_time=data.out_time,
        expiry_time=data.expiry_time,
        status="PENDING"
    )

    db.add(gp)
    db.commit()
    db.refresh(gp)
    return gp


def save_document(db: Session, pass_id: int, filename: str, filepath: str, doc_type: str):
    doc = Document(
        pass_id=pass_id,
        filename=filename,
        filepath=filepath,
        doc_type=doc_type,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc