from fastapi import APIRouter, Depends, HTTPException, Form, Body
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import User, Pass
from schemas import PassOut, UserLogin
from auth import get_current_user, create_access_token, verify_password
from datetime import datetime
import qrcode
import os
from typing import Optional
from sqlalchemy import func
from celery_app import send_approval_email_task

router = APIRouter(prefix="/admin", tags=["Admin"])

# ====================================================
# QR CODE DIRECTORY
# ====================================================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QR_DIR = os.path.join(BASE_DIR, "static", "qr")
os.makedirs(QR_DIR, exist_ok=True)

from .passes import PUBLIC_FRONTEND_URL


@router.post("/login")
def admin_login(
    data: UserLogin,
    db: Session = Depends(get_db)
):
    admin = db.query(User).filter(User.email == data.email).first()

    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")

    if admin.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied: Not an admin")

    if not verify_password(data.password, admin.password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    token = create_access_token({
        "id": admin.id,
        "role": admin.role,
        "sub": admin.email
    })

    return {
        "access_token": token,
        "fullname": admin.fullname,
        "email": admin.email,
        "role": admin.role
    }


# ====================================================
# ADMIN ACCESS CHECK
# ====================================================
def admin_only(user):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin Access Only")


# ====================================================
# GET ALL PASSES
# ====================================================
@router.get("/passes", response_model=list[PassOut])
def get_all_passes(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    admin_only(user)

    passes = (
        db.query(Pass)
        .options(
            joinedload(Pass.user),
            joinedload(Pass.documents)
        )
        .order_by(Pass.created_at.desc())
        .all()
    )

    return passes


# ====================================================
# APPROVE PASS (Clear Permission)
# ====================================================
@router.put("/approve/{pass_id}")
def approve_pass(
    pass_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    admin_only(user)

    gp = db.query(Pass).filter(Pass.id == pass_id).first()

    if not gp:
        raise HTTPException(status_code=404, detail="Pass not found")

    if gp.status != "PENDING":
        raise HTTPException(status_code=400, detail="Pass already processed (Status: " + gp.status + ")")

    gp.status = "APPROVED"
    gp.approved_by = user.id

    # QR Code generation upon approval
    scan_url = f"{PUBLIC_FRONTEND_URL}/scan-result/{gp.id}"
    qr_filename = f"pass_{gp.id}.png"
    qr_path = os.path.join(QR_DIR, qr_filename)

    qr = qrcode.make(scan_url)
    qr.save(qr_path)

    gp.qr_code_path = f"/static/qr/{qr_filename}"

    db.commit()
    db.refresh(gp)

    # Queue Email Sending via CELERY 
    student_email = gp.user.email if gp.user else None
    if student_email:
        send_approval_email_task.delay(student_email, gp.student_name, scan_url)

    return {
        "message": "Gate Pass Approved and Permission Cleared",
        "scan_url": scan_url,
        "qr_path": gp.qr_code_path,
        "status": gp.status
    }


# ====================================================
# REJECT PASS
# ====================================================
@router.put("/reject/{pass_id}")
def reject_pass(
    pass_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    admin_only(user)

    gp = db.query(Pass).filter(Pass.id == pass_id).first()

    if not gp:
        raise HTTPException(status_code=404, detail="Pass not found")

    if gp.status != "PENDING":
        raise HTTPException(status_code=400, detail="Already processed")

    gp.status = "REJECTED"
    db.commit()
    db.refresh(gp)

    return {"message": "Gate Pass Rejected", "pass": gp}


# ====================================================
# DELETE PASS
# ====================================================
@router.delete("/delete/{pass_id}")
def delete_pass(
    pass_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    admin_only(user)

    gp = db.query(Pass).filter(Pass.id == pass_id).first()

    if not gp:
        raise HTTPException(status_code=404, detail="Pass not found")

    # Delete QR code file if it exists
    if gp.qr_code_path:
        qr_filename = os.path.basename(gp.qr_code_path)
        qr_file_path = os.path.join(QR_DIR, qr_filename)
        if os.path.exists(qr_file_path):
            try:
                os.remove(qr_file_path)
            except Exception:
                pass

    db.delete(gp)
    db.commit()

    return {"message": "Pass deleted successfully"}


# ====================================================
# ADMIN ANALYTICS DASHBOARD
# ====================================================
@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    admin_only(user)

    # 1. Busiest Days (Passes per day)
    busiest_days_query = (
        db.query(func.date(Pass.created_at).label("date"), func.count(Pass.id).label("count"))
        .group_by(func.date(Pass.created_at))
        .order_by(func.date(Pass.created_at))
        .all()
    )
    busiest_days = [{"date": str(r.date), "count": r.count} for r in busiest_days_query]

    # 2. Top Reasons
    top_reasons_query = (
        db.query(Pass.purpose, func.count(Pass.id).label("count"))
        .group_by(Pass.purpose)
        .order_by(func.count(Pass.id).desc())
        .limit(5)
        .all()
    )
    top_reasons = [{"purpose": r.purpose, "count": r.count} for r in top_reasons_query]

    # 3. Total Fines Collected
    total_fines = db.query(func.sum(Pass.fine_amount)).filter(Pass.fine_paid == True).scalar() or 0

    # 4. Total Passes (Summary stat)
    total_passes = db.query(func.count(Pass.id)).scalar() or 0

    return {
        "busiest_days": busiest_days,
        "top_reasons": top_reasons,
        "total_fines": total_fines,
        "total_passes": total_passes
    }