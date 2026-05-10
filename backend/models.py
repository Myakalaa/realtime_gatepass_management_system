# from sqlalchemy import (
#     Boolean,
#     Column,
#     Integer,
#     String,
#     DateTime,
#     ForeignKey,
# )
# from sqlalchemy.orm import relationship
# from datetime import datetime
# from database import Base


# # ======================================================
# # USER MODEL
# # ======================================================
# class User(Base):
#     __tablename__ = "users"

#     id = Column(Integer, primary_key=True, index=True)
#     fullname = Column(String(255), nullable=False)
#     email = Column(String(255), unique=True, index=True, nullable=False)
#     password = Column(String(255), nullable=False)
#     role = Column(String(50), default="admin")   # CHANGE IF NEEDED

#     # 1 user → many passes
#     passes = relationship("Pass", back_populates="user")



# class Pass(Base):
#     __tablename__ = "passes"

#     id = Column(Integer, primary_key=True, index=True)

#     user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
#     user = relationship("User", back_populates="passes")

#     purpose = Column(String(255), nullable=False)
#     department = Column(String(255), nullable=False)

#     pass_type = Column(String(50), nullable=False)
#     vehicle_number = Column(String(50), nullable=True)
#     vehicle_type = Column(String(50), nullable=True)

#     in_time = Column(DateTime, nullable=False)
#     out_time = Column(DateTime, nullable=False)
#     expiry_time = Column(DateTime, nullable=False)

#     status = Column(String(50), default="PENDING")
#     approved_by = Column(Integer, nullable=True)

#     entry_time = Column(DateTime, nullable=True)
#     exit_time = Column(DateTime, nullable=True)  

#     created_at = Column(DateTime, default=datetime.utcnow)

#     qr_code_path = Column(String(500), nullable=True)

#     documents = relationship("Document", back_populates="pass_ref", cascade="all, delete")

#     # ✅ Fine handling (CORRECT)
#     fine_paid = Column(Boolean, default=False)
#     fine_paid_at = Column(DateTime, nullable=True)
#     fine_amount = Column(Integer, default=0)




# # ======================================================
# # DOCUMENT MODEL
# # ======================================================
# class Document(Base):
#     __tablename__ = "documents"

#     id = Column(Integer, primary_key=True)
#     pass_id = Column(Integer, ForeignKey("passes.id"))

#     filename = Column(String(255), nullable=False)
#     filepath = Column(String(500), nullable=False)
#     doc_type = Column(String(100), nullable=True)

#     uploaded_at = Column(DateTime, default=datetime.utcnow)

#     # Link back to Pass
#     pass_ref = relationship("Pass", back_populates="documents")



from sqlalchemy import (
    Boolean,
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    fullname = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(50), default="student")
    institution = Column(String(255), nullable=True)

    passes = relationship("Pass", back_populates="user")


class Pass(Base):
    __tablename__ = "passes"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="passes")

    student_name = Column(String(100), nullable=False)
    purpose = Column(String(255), nullable=False)
    department = Column(String(255), nullable=False)
    institution = Column(String(255), nullable=True)

    mobile_number = Column(String(20), nullable=False, index=True)
    student_id = Column(String(50), nullable=False, index=True)

    pass_type = Column(String(50), nullable=False)
    vehicle_number = Column(String(50), nullable=True)
    vehicle_type = Column(String(50), nullable=True)

    in_time = Column(DateTime, nullable=False)
    out_time = Column(DateTime, nullable=False)
    expiry_time = Column(DateTime, nullable=False)

    status = Column(String(50), default="PENDING")
    approved_by = Column(Integer, nullable=True)

    entry_time = Column(DateTime, nullable=True)
    exit_time = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    qr_code_path = Column(String(500), nullable=True)

    fine_paid = Column(Boolean, default=False)
    fine_paid_at = Column(DateTime, nullable=True)
    fine_amount = Column(Integer, default=0)
    late_minutes = Column(Integer, default=0)

    documents = relationship(
        "Document",
        back_populates="pass_ref",
        cascade="all, delete"
    )


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True)
    pass_id = Column(Integer, ForeignKey("passes.id"))

    filename = Column(String(255), nullable=False)
    filepath = Column(String(500), nullable=False)
    doc_type = Column(String(100), nullable=True)

    uploaded_at = Column(DateTime, default=datetime.utcnow)

    pass_ref = relationship("Pass", back_populates="documents")