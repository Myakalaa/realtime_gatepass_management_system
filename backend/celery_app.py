import os
from celery import Celery
from services.email_service import send_approval_email

# Initialize Celery app
# We use Redis as the message broker
# If REDIS_URL is not provided, it defaults to localhost
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "gatepass_tasks",
    broker=REDIS_URL,
    backend=REDIS_URL
)

# Optional: configure Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
)

@celery_app.task(name="send_approval_email_task")
def send_approval_email_task(student_email: str, student_name: str, qr_url: str):
    """
    Celery task that wraps our existing email service logic.
    This runs asynchronously in the background worker!
    """
    # Call the existing service function
    send_approval_email(student_email, student_name, qr_url)
    return f"Email sent to {student_email}"
