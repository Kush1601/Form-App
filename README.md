# Kushmusic Form & Admin Dashboard

A full-stack, "Next-Gen" lead generation form and administrative dashboard built to handle partial data capture and high-concurrency traffic.

## 🚀 Live Demo
- **User Form:** [kushmusic.xyz](https://kushmusic.xyz)
- **Admin Dashboard:** [kushmusic.xyz/admin](https://kushmusic.xyz/admin)

## 🏗️ Architecture & Tech Stack

### Frontend (`/frontend`)
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion (for smooth progress bars and multi-step transitions)
- **Data Visualization:** Recharts (for dashboard analytics)

### Backend (`/backend`)
- **Framework:** Python Flask REST API
- **Database ORM:** SQLAlchemy
- **Database Engine:** AWS RDS PostgreSQL
- **Concurrency:** Gunicorn (4 parallel worker processes)

### Infrastructure & Deployment
- **Server:** AWS EC2 (Amazon Linux 2023)
- **Process Management:** PM2 (running both Next.js and Gunicorn daemonized)
- **Load Balancing / Proxy:** Nginx Reverse Proxy routing `/api` traffic to Flask (port 5001) and `/` to Next.js (port 3000).

---

## ✨ Key Features

1. **Partial Response Tracking:** 
   - The multi-step form silently saves visitor data (Name) to the database on Step 1 with a status of `INCOMPLETE`. 
   - If they abandon the form, their data and timestamp are preserved. If they finish Step 2, the entry acts as an atomic update to `COMPLETE`.
2. **High Concurrency:** 
   - The backend runs via Gunicorn with multiple parallel workers, ensuring the Flask API does not bottleneck under heavy concurrent form submissions.
3. **Admin Dashboard:**
   - Server-side paginated data table (10 items/page) to prevent browser memory exhaustion on large datasets.
   - Date range filtering and live DB deletion capabilities.
   - Live time-series analytics visualizing Completion % and Dropout Rates.

---

## 💻 Local Development Setup

### 1. Database Setup
Ensure you have a local PostgreSQL terminal running, or place a valid DB URI in `backend/app.py`.

### 2. Backend API
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 app.py
```
*API will run on `http://127.0.0.1:5001`*

### 3. Frontend App
```bash
cd frontend
npm install
npm run dev
```
*App will run on `http://localhost:3000`*
