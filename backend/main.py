from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import Base, engine, SessionLocal
from models import Pass, User
from auth import hash_password
from apscheduler.schedulers.background import BackgroundScheduler
from routes.scan_pass import now_ist, GRACE_MINUTES, FINE_PER_HOUR

# ====================================================
# CREATE DB TABLES
# ====================================================
Base.metadata.create_all(bind=engine)

# ====================================================
# FASTAPI APP START  ⭐ MUST BE BEFORE ROUTERS
# ====================================================
app = FastAPI(title="Gate Pass Management System")

# ====================================================
# CORS SETTINGS
# ====================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # Set to False to allow wildcard origins [*]
    allow_methods=["*"],
    allow_headers=["*"],
)

# ====================================================
# STATIC FILES (QR Codes & Documents)
# ====================================================
# Absolute path to backend/static
BASE_DIR = os.path.dirname(os.path.abspath(__file__))   # backend/
STATIC_DIR = os.path.join(BASE_DIR, "static")           # backend/static

# ensure folders exist
os.makedirs(os.path.join(STATIC_DIR, "qr"), exist_ok=True)
os.makedirs(os.path.join(STATIC_DIR, "documents"), exist_ok=True)

# mount static
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# ====================================================
# ROUTERS IMPORT  ⭐ AFTER app created
# ====================================================
from routes.admin import router as admin_router
from routes.users import router as user_router
from routes.passes import router as passes_router
from routes.scan_pass import router as scan_router
from routes.receipts import router as receipts_router

# ====================================================
# ROUTE REGISTRATIONS
# ====================================================
app.include_router(user_router)
app.include_router(passes_router)
app.include_router(admin_router)
app.include_router(scan_router)
app.include_router(receipts_router)

# ====================================================
# HEALTH CHECK / ROOT ENDPOINT
# ====================================================
@app.get("/")
def read_root():
    return {"message": "Gatepass System API is running successfully!"}

# ====================================================
# CREATE DEFAULT ADMIN USER
# ====================================================
def create_default_admin():
    db = SessionLocal()

    admin_email = "admin@gatepass.com"
    admin_password = "admin123"

    existing_admin = db.query(User).filter(User.email == admin_email).first()

    if existing_admin is None:
        admin = User(
            fullname="Default Admin",
            email=admin_email,
            password=hash_password(admin_password),
            role="admin"
        )
        db.add(admin)
        db.commit()

        print("\n" + "=" * 40)
        print("DONE: Default Admin Created Successfully")
        print(f"Email:    {admin_email}")
        print(f"Password: {admin_password}")
        print("=" * 40 + "\n")
    else:
        # Ensure existing default admin has admin role
        if existing_admin.role != "admin":
            existing_admin.role = "admin"
            db.commit()
            print("DONE: Default Admin Role Updated to 'admin'")
        else:
            print("DONE: Default Admin Already Exists")

    db.close()


create_default_admin()

# ====================================================
# AUTOMATIC EXPIRY & FINE CALCULATION (CRON JOB)
# ====================================================
def process_expired_passes():
    db = SessionLocal()
    now = now_ist()
    
    # Passes that left, haven't returned, and are still marked APPROVED
    late_passes = db.query(Pass).filter(
        Pass.status == "APPROVED",
        Pass.exit_time.isnot(None),
        Pass.entry_time.is_(None)
    ).all()

    updated_count = 0
    for gp in late_passes:
        late_minutes = int((now - gp.expiry_time).total_seconds() / 60)
        if late_minutes > GRACE_MINUTES:
            hours_late = (late_minutes + 59) // 60
            fine = hours_late * FINE_PER_HOUR
            
            # Only update if the fine has increased
            if gp.fine_amount != fine or gp.late_minutes != late_minutes:
                gp.late_minutes = late_minutes
                gp.fine_amount = fine
                updated_count += 1
    
    db.commit()
    db.close()
    if updated_count > 0:
        print(f"🕒 Cron Job: Automatically updated fines for {updated_count} delayed students.")

scheduler = BackgroundScheduler()
scheduler.add_job(process_expired_passes, 'interval', minutes=60)
scheduler.start()