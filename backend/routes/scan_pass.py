from fastapi import APIRouter, Depends, HTTPException, Request
import os
from sqlalchemy.orm import Session
from datetime import datetime
import pytz

from database import get_db
from models import Pass

router = APIRouter(prefix="/scan", tags=["QR Scan"])

# ================= TIMEZONE =================
IST = pytz.timezone("Asia/Kolkata")

def now_ist():
    return datetime.now(IST).replace(tzinfo=None)  # naive datetime for SQLite

GRACE_MINUTES = 15   # 15 minute grace period
FINE_PER_HOUR = 100  # ₹100 per hour (or part of it)

# Read the allowed Subnet from env (default to empty string to allow all if not set, or set to "192.168." to restrict)
# By default, we will restrict to 192.168.1.7 subnet as user is using local IP. We can use "192.168." to allow any device on the local network.
COLLEGE_IP_SUBNET = os.getenv("COLLEGE_IP_SUBNET", "192.168.")

@router.get("/{pass_id}")
def scan_pass(pass_id: int, request: Request, db: Session = Depends(get_db)):

    # ── 0. Geo-Fencing (IP Checking) ──────────────────────────────
    client_ip = request.client.host
    # If COLLEGE_IP_SUBNET is set and it's not a local loopback, enforce the subnet rule
    if COLLEGE_IP_SUBNET and client_ip not in ("127.0.0.1", "::1"):
        if not client_ip.startswith(COLLEGE_IP_SUBNET):
            raise HTTPException(status_code=403, detail="Access Denied: You must be connected to the College Wi-Fi to scan this pass.")

    # ── 1. Find the Pass ──────────────────────────────────────────
    gp = db.query(Pass).filter(Pass.id == pass_id).first()
    if not gp:
        raise HTTPException(status_code=404, detail="Invalid QR Code - Pass not found")

    # ── 2. Must be APPROVED or ACTIVATED ─────────────────────────
    valid_statuses = ["APPROVED", "ACTIVATED"]
    if gp.status.upper() not in valid_statuses and gp.status.upper() != "COMPLETED":
        return {
            "status": gp.status.lower(),
            "message": f"Pass is {gp.status}. Must be APPROVED/ACTIVATED by Admin first."
        }

    now = now_ist()

    # ── 3. FIRST SCAN → Student LEAVING campus ────────────────────
    if gp.exit_time is None:
        gp.exit_time = now
        db.commit()
        return {
            "status": "exit_recorded",
            "student_name": gp.student_name,
            "exit_time": str(gp.exit_time),
            "expected_return": str(gp.expiry_time),
            "message": "✅ Exit Recorded. Safe travels!"
        }

    # ── 4. SECOND SCAN → Student RETURNING to campus ──────────────
    if gp.exit_time is not None and gp.entry_time is None:

        # ── Calculate lateness ──────────────────────────────────
        late_minutes = int((now - gp.expiry_time).total_seconds() / 60)

        if late_minutes > GRACE_MINUTES:
            # Student IS late beyond the grace period
            hours_late = (late_minutes + 59) // 60  # round UP to next hour
            fine = hours_late * FINE_PER_HOUR

            # Save the fine to the database
            gp.late_minutes = late_minutes
            gp.fine_amount = fine
            db.commit()

            return {
                "status": "fine_due",
                "student_name": gp.student_name,
                "fine_amount": fine,
                "late_minutes": late_minutes,
                "message": f"⚠️ {late_minutes} mins late! Fine of ₹{fine} applied."
            }

        # ── Student returned on time (or within grace period) ───
        gp.entry_time = now
        gp.status = "COMPLETED"
        gp.late_minutes = 0
        gp.fine_amount = 0
        db.commit()

        return {
            "status": "entry_recorded",
            "student_name": gp.student_name,
            "entry_time": str(gp.entry_time),
            "message": "✅ Entry Recorded. Welcome back!"
        }

    # ── 5. ALREADY COMPLETED ──────────────────────────────────────
    return {
        "status": "completed",
        "message": "This pass is already completed."
    }