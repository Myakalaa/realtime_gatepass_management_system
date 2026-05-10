import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os
from dotenv import load_dotenv

load_dotenv()

# We expect these in .env
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "your_email@gmail.com")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD", "your_app_password")

def send_approval_email(student_email: str, student_name: str, qr_url: str):
    """
    Sends an HTML email to the student with their approved gatepass details and QR Code link.
    """
    if SENDER_EMAIL == "your_email@gmail.com":
        print("⚠️ Email Service Skipped: SENDER_EMAIL not configured in .env")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "✅ Your Gatepass has been APPROVED!"
    msg["From"] = SENDER_EMAIL
    msg["To"] = student_email

    html_content = f"""
    <html>
      <body>
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2e7d32;">Gatepass Approved</h2>
            <p>Hello <b>{student_name}</b>,</p>
            <p>Your gatepass application has been approved by the Administrator.</p>
            <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px;">
                <p>Please present the QR Code to the guard at the gate for scanning when you leave and return.</p>
                <a href="{qr_url}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
                    View QR Code
                </a>
            </div>
            <p>Safe travels!</p>
            <p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply.</p>
        </div>
      </body>
    </html>
    """

    part = MIMEText(html_content, "html")
    msg.attach(part)

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, student_email, msg.as_string())
        server.quit()
        print(f"📧 Approval email sent successfully to {student_email}")
    except Exception as e:
        print(f"❌ Failed to send email to {student_email}: {str(e)}")
