import os
import qrcode
import sys
from dotenv import load_dotenv

# Load .env so PUBLIC_FRONTEND_URL is picked up
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Ensure the backend directory is in the path
sys.path.append(os.path.dirname(__file__))

from database import SessionLocal
from models import Pass

def fix_all():
    db = SessionLocal()
    passes = db.query(Pass).all()

    BASE_DIR = os.path.dirname(__file__)
    QR_DIR = os.path.join(BASE_DIR, "static", "qr")
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

    frontend_url = os.getenv("PUBLIC_FRONTEND_URL", f"http://{get_local_ip()}:3000").rstrip("/")

    count = 0
    for p in passes:
        scan_url = f"{frontend_url}/scan-result/{p.id}"

        qr_path = os.path.join(QR_DIR, f"pass_{p.id}.png")
        qrcode.make(scan_url).save(qr_path)

        # Ensure path in DB is correct
        p.qr_code_path = f"/static/qr/pass_{p.id}.png"
        db.add(p)
        count += 1
        print(f"  [OK] Pass #{p.id} -> {scan_url}")

    db.commit()
    db.close()
    print(f"\nDONE: Re-generated {count} QR code(s) with local network URL.")

if __name__ == "__main__":
    fix_all()
