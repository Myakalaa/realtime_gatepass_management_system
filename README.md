# 🎓 Smart Campus Gatepass System

An enterprise-grade, full-stack Gatepass Management System designed for modern educational institutions. It digitizes the process of students applying for exit passes, administrators approving them, and security guards scanning QR codes at the gate.

![Gatepass System](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/Frontend-React-blue)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)

---

## ✨ Key Features

- **📱 Mobile-Optimized QR Scanner:** Security guards can scan student QR codes directly from their mobile phones to record exact exit and entry times.
- **📊 Admin Analytics Dashboard:** Beautiful, interactive charts (built with `recharts`) that track the busiest days, top reasons for leaving, and total fines collected.
- **📧 Automated Email Alerts:** Asynchronous background tasks (powered by `Celery` & `Redis`) instantly email students their approved QR codes without freezing the Admin dashboard.
- **⏱️ Automated Fine Calculation (Cron Jobs):** A background scheduler (`APScheduler`) automatically identifies "ghost" students who left but never returned, calculating their escalating fines in real-time.
- **🌍 IP Geo-Fencing:** Advanced security layer that prevents students from screenshotting their QR codes. The scanner's IP must belong to the authorized College Wi-Fi subnet, or the scan is rejected with a `403 Forbidden` error.
- **🔐 Strict Role-Based Access Control (RBAC):** Stateless JWT authentication ensures students cannot tamper with the API to approve their own passes or access analytics.

---

## 🛠️ Technology Stack

### Frontend
- **React.js** (User Interfaces)
- **React Router** (Navigation)
- **Recharts** (Data Visualization)
- **Axios** (API Communication)
- **HTML5-QRCode** (Mobile Camera Scanning)

### Backend
- **FastAPI** (High-performance API framework)
- **SQLite / SQLAlchemy** (Database & ORM)
- **Celery & Redis** (Asynchronous Task Queue)
- **APScheduler** (Time-based Cron Jobs)
- **JWT (JSON Web Tokens)** (Authentication & Security)
- **Python `smtplib`** (Automated Emails)

---

## 🚀 Getting Started (Local Development)

Because this system uses enterprise-grade background task queues, running it requires starting three separate components.

### 1. Prerequisites
- Python 3.10+
- Node.js & npm
- Redis Server (Must be running on port `6379`)

### 2. Setup the Backend
Open a terminal and navigate to the `backend` folder:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend` folder and add your credentials:
```env
# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your_email@gmail.com
SENDER_PASSWORD=your_app_password

# Security
SECRET_KEY=your_super_secret_jwt_key
COLLEGE_IP_SUBNET=192.168.
```

### 3. Setup the Frontend
Open a new terminal and navigate to the `frontend` folder:
```bash
cd frontend
npm install
```

---

## 🏃‍♂️ Running the Application

To run the full stack, you need to open **three separate terminal windows**.

**Terminal 1: Start the Backend API**
```bash
cd backend
python run_backend.py
```
*(The API will be available at http://localhost:8000)*

**Terminal 2: Start the Celery Worker (For Emails)**
```bash
cd backend
python -m celery -A celery_app worker --loglevel=info -P gevent
```

**Terminal 3: Start the Frontend React App**
```bash
cd frontend
npm start
```
*(The Web App will open at http://localhost:3000)*

---

## 🏗️ Deployment Architecture (Cloud)
This project is designed as a **Monorepo** and is ready to be deployed to the cloud:
1. **Frontend:** Deploy the `frontend` directory to **Vercel** or **Netlify**.
2. **Backend (API):** Deploy the `backend` directory to **Render** or **Railway**.
3. **Backend (Worker):** Deploy a secondary worker process on Render running the Celery command.
4. **Database:** Migrate from SQLite to a managed PostgreSQL database.
