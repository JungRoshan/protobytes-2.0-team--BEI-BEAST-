# 🏙️ HamroAwaj — Smart City Civic Complaint Platform

> Citizens can report city-related problems and track their resolution in real time, helping authorities respond faster and improve urban services.

**Team:** BEI BEAST | **Category:** E-Governance

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Running the App](#-running-the-app)
- [Default Accounts](#-default-accounts)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Team Members](#-team-members)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **User Authentication** | Register, login, and logout with JWT tokens |
| 📝 **Report Issues** | Submit complaints with category, description, location, and image |
| 📍 **Geolocation** | Auto-detect your location with one click (OpenStreetMap) |
| 🔎 **Track Complaints** | Track complaint status in real time using a unique Complaint ID |
| 🛡️ **Admin Dashboard** | View all complaints, see full details (image, user, description), update statuses |
| 📂 **Category Filtering** | Click a category on the homepage to pre-fill the report form |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** (dev server & build)
- **Tailwind CSS** + **shadcn/ui** components
- **Axios** (HTTP client)
- **React Router** (routing)

### Backend
- **Django 6.0** + **Django REST Framework**
- **SimpleJWT** (authentication)
- **django-cors-headers** (CORS)
- **Pillow** (image handling)
- **SQLite** (database)

---

## 📦 Prerequisites

Make sure you have the following installed:

| Tool | Version |
|---|---|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |
| Git | latest |

---

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/JungRoshan/protobytes-2.0-team--BEI-BEAST-.git
cd protobytes-2.0-team--BEI-BEAST-
```

### 2. Backend setup

```bash
# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate          # Windows

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
python3 backend/manage.py migrate

# Create a superuser (admin account)
python3 backend/manage.py createsuperuser
```

### 3. Frontend setup

```bash
cd frontend
npm install
cd ..
```

---

## ▶️ Running the App

You need **two terminals** — one for the backend and one for the frontend.

### Terminal 1 — Backend (Django)

```bash
source venv/bin/activate
python3 backend/manage.py runserver 0.0.0.0:8000
```

Backend will be available at: **http://localhost:8000**

### Terminal 2 — Frontend (Vite + React)

```bash
cd frontend
npm run dev
```

Frontend will be available at: **http://localhost:5173**

### Django Admin Panel

Access the built-in admin at: **http://localhost:8000/admin/**

Login with the superuser credentials you created during setup.

---

## 👤 Default Accounts

After running `createsuperuser`, you can log in with your chosen credentials at:
- **Frontend:** http://localhost:5173/login
- **Django Admin:** http://localhost:8000/admin/

New users can register at: http://localhost:5173/register

---

## 📁 Project Structure

```
hackathon_project/
├── backend/                  # Django backend
│   ├── backend/              # Project settings & URLs
│   │   ├── settings.py       # Django configuration
│   │   └── urls.py           # Root URL routing
│   ├── complaints/           # Complaints app
│   │   ├── models.py         # Complaint model
│   │   ├── views.py          # API views (CRUD + track)
│   │   ├── serializers.py    # DRF serializers
│   │   └── urls.py           # Complaint routes
│   ├── users/                # Authentication app
│   │   ├── views.py          # Login, register, logout
│   │   └── serializers.py    # User serializers
│   ├── notifications/        # Notifications app
│   ├── media/                # Uploaded images
│   └── db.sqlite3            # SQLite database
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   │   ├── Index.tsx     # Homepage with categories
│   │   │   ├── ReportIssue.tsx  # Report form + geolocation
│   │   │   ├── TrackComplaint.tsx  # Track by ID
│   │   │   ├── AdminDashboard.tsx  # Admin view
│   │   │   ├── Login.tsx     # Login page
│   │   │   └── Register.tsx  # Registration page
│   │   ├── components/       # Reusable components
│   │   ├── contexts/         # Auth context (JWT)
│   │   └── lib/              # API client & utilities
│   └── package.json
├── requirements.txt          # Python dependencies
└── README.md
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register a new user |
| POST | `/api/auth/login/` | Login (returns JWT tokens) |
| POST | `/api/auth/logout/` | Logout (blacklists refresh token) |
| GET | `/api/auth/me/` | Get current user info |
| POST | `/api/auth/token/refresh/` | Refresh access token |

### Complaints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/complaints/` | List all complaints (auth required) |
| POST | `/api/complaints/` | Submit a new complaint (auth required) |
| GET | `/api/complaints/{id}/` | Get complaint details (auth required) |
| PATCH | `/api/complaints/{id}/` | Update complaint status (admin) |
| GET | `/api/complaints/track/{complaint_id}/` | Track complaint by ID (public) |

---

## 👥 Team Members

| Name | Email | GitHub |
|---|---|---|
| Sabin Kumar Chaudhary | sabinchaudhary168@gmail.com | SABIN-KUMAR |
| Roshan Jung Kunwar | roshanjungkunwar50@gmail.com | JungRoshan |
| Samir Ban | samir.078bei042@acem.edu.np | SamirBan |
| Umesh Kumar Rajbanshi | umesh.078bei047@acem.edu.np | umess-ss |

---

## 📄 License

This project was built for **Protobytes 2.0 Hackathon**.
