from auth import verify_password, hash_password
from database import SessionLocal
from models import User

db = SessionLocal()
admin_email = "admin@gatepass.com"
admin_password = "admin123"

admin = db.query(User).filter(User.email == admin_email).first()
if admin:
    print(f"Admin found: {admin.email}")
    print(f"Stored Hash: {admin.password}")
    is_correct = verify_password(admin_password, admin.password)
    print(f"Password correct: {is_correct}")
else:
    print("Admin NOT found")
db.close()
