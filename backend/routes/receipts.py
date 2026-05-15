from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime
import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch

from database import get_db
from models import Pass

router = APIRouter(prefix="/receipts", tags=["Receipts"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RECEIPT_DIR = os.path.join(BASE_DIR, "static", "receipts")
os.makedirs(RECEIPT_DIR, exist_ok=True)

@router.get("/download/{pass_id}")
def download_receipt(pass_id: int, db: Session = Depends(get_db)):
    gp = db.query(Pass).filter(Pass.id == pass_id).first()
    if not gp:
        raise HTTPException(status_code=404, detail="Pass not found")

    if gp.status not in ["COMPLETED", "APPROVED", "ACTIVATED"]:
        raise HTTPException(status_code=400, detail="Receipt only available for approved or completed passes")

    filename = f"receipt_{gp.id}.pdf"
    filepath = os.path.join(RECEIPT_DIR, filename)

    # Generate PDF
    c = canvas.Canvas(filepath, pagesize=letter)
    width, height = letter

    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width / 2.0, height - 1 * inch, "GATE PASS RECEIPT")

    # Content
    c.setFont("Helvetica", 12)
    y = height - 1.5 * inch
    
    details = [
        ("Pass ID:", str(gp.id)),
        ("Student Name:", gp.student_name),
        ("Student ID:", gp.student_id),
        ("Mobile Number:", gp.mobile_number),
        ("Purpose:", gp.purpose),
        ("Department:", gp.department),
        ("Pass Type:", gp.pass_type),
        ("Out Time:", gp.out_time.strftime("%Y-%m-%d %H:%M:%S") if gp.out_time else "N/A"),
        ("In Time (Exp):", gp.expiry_time.strftime("%Y-%m-%d %H:%M:%S") if gp.expiry_time else "N/A"),
        ("Actual Exit:", gp.exit_time.strftime("%Y-%m-%d %H:%M:%S") if gp.exit_time else "N/A"),
        ("Actual Entry:", gp.entry_time.strftime("%Y-%m-%d %H:%M:%S") if gp.entry_time else "N/A"),
        ("Late Minutes:", str(gp.late_minutes or 0)),
        ("Fine Amount:", f"RS {gp.fine_amount or 0}"),
        ("Status:", gp.status),
    ]

    for label, value in details:
        c.drawString(1 * inch, y, label)
        c.drawString(3 * inch, y, value)
        y -= 0.25 * inch

    # Add QR Code Image if exists
    if gp.qr_code_path:
        qr_img_path = os.path.join(BASE_DIR, gp.qr_code_path.lstrip("/"))
        if os.path.exists(qr_img_path):
            # Position it at the top right
            c.drawImage(qr_img_path, width - 2.5 * inch, height - 2.8 * inch, width=1.8 * inch, height=1.8 * inch)
            c.setFont("Helvetica-Bold", 8)
            c.drawCentredString(width - 1.6 * inch, height - 2.9 * inch, "SCAN AT GATE")

    c.line(1 * inch, y - 0.1 * inch, width - 1 * inch, y - 0.1 * inch)
    y -= 0.5 * inch
    c.setFont("Helvetica", 10)
    c.drawString(1 * inch, y, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    c.save()

    return FileResponse(filepath, media_type='application/pdf', filename=filename)
