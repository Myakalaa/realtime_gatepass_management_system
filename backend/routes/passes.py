from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import os
import shutil
import qrcode

from database import get_db
from schemas import PassOut, PassCreate
from crud import create_pass
from auth import get_current_user
from models import User, Pass

router = APIRouter(prefix="/passes", tags=["Passes"])

# ================= PATH CONFIG =================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOC_DIR = os.path.join(BASE_DIR, "static", "documents")
QR_DIR = os.path.join(BASE_DIR, "static", "qr")

os.makedirs(DOC_DIR, exist_ok=True)
os.makedirs(QR_DIR, exist_ok=True)

import socket

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "localhost"

LOCAL_IP = get_local_ip()
PUBLIC_FRONTEND_URL = os.getenv("PUBLIC_FRONTEND_URL")
if PUBLIC_FRONTEND_URL:
    PUBLIC_FRONTEND_URL = PUBLIC_FRONTEND_URL.rstrip("/")
else:
    PUBLIC_FRONTEND_URL = f"http://{LOCAL_IP}:3000"


# ================= DATETIME PARSER =================

def parse_dt(value: str):

    if not value:
        raise HTTPException(
            status_code=400,
            detail="Datetime missing"
        )

    try:
        return datetime.fromisoformat(value)

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid datetime format"
        )


# ================= CREATE PASS =================

@router.post("/", response_model=PassOut)
def create_gatepass(

    student_name: str = Form(...),
    purpose: str = Form(...),
    department: str = Form(...),
    mobile_number: str = Form(...),
    student_id: str = Form(...),
    pass_type: str = Form(...),

    in_time: str = Form(...),
    out_time: str = Form(...),

    vehicle_number: Optional[str] = Form(None),
    vehicle_type: Optional[str] = Form(None),

    documents: List[UploadFile] = File([]),

    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),

):

    # ===== ROLE CHECK =====
    if current_user.role not in ["student", "user"]:
        raise HTTPException(
            status_code=403,
            detail="Only students can apply pass"
        )

    # ===== PASS VALIDATION =====
    # Check if this mobile number already has an active or pending pass
    existing_active_pass = (
        db.query(Pass)
        .filter(
            Pass.mobile_number == mobile_number,
            Pass.status.in_(["PENDING", "APPROVED"])
        )
        .order_by(Pass.created_at.desc())
        .first()
    )

    if existing_active_pass:
        raise HTTPException(
            status_code=400,
            detail=f"Duplicate Application: Mobile number {mobile_number} already has an active pass (ID: {existing_active_pass.id}). Please complete or cancel the existing pass first."
        )

    # ===== DATETIME VALIDATION =====
    in_time_dt = parse_dt(in_time)
    out_time_dt = parse_dt(out_time)

    if in_time_dt <= out_time_dt:
        raise HTTPException(
            status_code=400,
            detail="Expected Return time (In Time) must be after Exit time (Out Time)"
        )

    # ===== CREATE PASS DATA =====
    data = PassCreate(
        student_name=student_name,
        purpose=purpose,
        department=department,
        mobile_number=mobile_number,
        student_id=student_id,
        pass_type=pass_type,
        vehicle_number=vehicle_number,
        vehicle_type=vehicle_type,
        in_time=in_time_dt,
        out_time=out_time_dt,
        expiry_time=in_time_dt
    )

    gp = create_pass(db, current_user.id, data)

    db.commit()
    db.refresh(gp)

    # ===== SAVE DOCUMENTS =====
    for file in documents:

        if file.filename:

            file_path = os.path.join(
                DOC_DIR,
                f"{gp.id}_{file.filename}"
            )

            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

    return gp


# ================= MY PASSES =================

@router.get("/my", response_model=List[PassOut])
def my_passes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    passes = (
        db.query(Pass)
        .filter(Pass.user_id == current_user.id)
        .order_by(Pass.created_at.desc())
        .all()
    )

    return passes