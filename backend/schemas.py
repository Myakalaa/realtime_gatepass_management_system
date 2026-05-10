from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


# ======================================================
# USER SCHEMAS  ⭐ REQUIRED
# ======================================================

class UserCreate(BaseModel):
    fullname: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    fullname: str
    email: EmailStr
    role: Optional[str] = None
    institution: Optional[str] = None

    class Config:
        from_attributes = True


# ======================================================
# TOKEN SCHEMA  ⭐ REQUIRED
# ======================================================

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ======================================================
# DOCUMENT SCHEMA
# ======================================================

class DocumentOut(BaseModel):
    id: int
    filename: str
    filepath: str
    doc_type: Optional[str]
    uploaded_at: datetime

    class Config:
        from_attributes = True


# ======================================================
# PASS CREATE
# ======================================================

class PassCreate(BaseModel):
    student_name: str
    mobile_number: str
    student_id: str
    purpose: str
    department: str
    pass_type: str
    vehicle_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    in_time: datetime
    out_time: datetime
    expiry_time: datetime


# ======================================================
# PASS OUT
# ======================================================

class PassOut(BaseModel):
    id: int
    user_id: int
    student_name: str
    mobile_number: str
    student_id: str
    purpose: str
    department: str
    pass_type: str
    vehicle_number: Optional[str] = None
    vehicle_type: Optional[str] = None

    in_time: datetime
    out_time: datetime
    expiry_time: datetime
    qr_code_path: Optional[str] = None

    status: Optional[str] = None
    approved_by: Optional[int] = None
    entry_time: Optional[datetime] = None
    exit_time: Optional[datetime] = None
    created_at: Optional[datetime] = None

    fine_amount: int = 0
    fine_paid: bool = False
    late_minutes: int = 0
    
    user: Optional[UserOut] = None
    documents: List[DocumentOut] = Field(default_factory=list)

    class Config:
        from_attributes = True