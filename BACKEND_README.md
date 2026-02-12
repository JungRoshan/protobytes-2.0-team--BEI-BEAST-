# Django Backend API Documentation

## Overview
This is a simple Django REST API backend for the City Complaint Management System.

## Features
- ✅ Complaint submission with auto-generated IDs
- ✅ Complaint tracking by ID
- ✅ Status management (Submitted → Assigned → In Progress → Resolved)
- ✅ Category-based filtering
- ✅ Image upload support
- ✅ Admin dashboard
- ✅ CORS enabled for frontend integration

## API Endpoints

### Complaints API (`/api/complaints/`)

#### List All Complaints
- **GET** `/api/complaints/`
- Returns paginated list of all complaints

#### Create Complaint
- **POST** `/api/complaints/`
- **Body:**
  ```json
  {
    "title": "Pothole on Main Street",
    "category": "road",
    "description": "Large pothole causing traffic issues",
    "location": "Main Street, Ward 5",
    "image": null  // Optional file upload
  }
  ```
- **Response:** Returns complaint with auto-generated `complaint_id` (e.g., "HA-2025-001")

#### Track Complaint by ID
- **GET** `/api/complaints/track/{complaint_id}/`
- Example: `/api/complaints/track/HA-2025-001/`
- Returns detailed complaint information

#### Update Complaint Status
- **PATCH** `/api/complaints/{id}/`
- **Body:**
  ```json
  {
    "status": "In Progress"
  }
  ```

#### Get Specific Complaint
- **GET** `/api/complaints/{id}/`

### Users API (`/api/users/`)

#### Get Current User
- **GET** `/api/users/me/`
- Returns details of the currently authenticated user

### Notifications API (`/api/notifications/`)

#### List Notifications
- **GET** `/api/notifications/`
- Returns list of notifications for the current user

#### Mark as Read
- **POST** `/api/notifications/{id}/mark_read/`
- **POST** `/api/notifications/mark_all_read/`


## Setup Instructions

### 1. Activate Virtual Environment
```bash
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Migrations
```bash
python manage.py migrate
```

### 4. Create Superuser (for Admin Panel)
```bash
python manage.py createsuperuser
```

### 5. Run Development Server
```bash
python manage.py runserver
```

The API will be available at: `http://localhost:8000/api/`

## Admin Panel
Access the Django admin panel at: `http://localhost:8000/admin/`

## Categories
- `road` - Road Issues
- `waste` - Waste Management
- `water` - Water Problems
- `electricity` - Electricity
- `streetlight` - Streetlight
- `other` - Other Issues

## Status Workflow
1. **Submitted** - Initial state when complaint is created
2. **Assigned** - Complaint assigned to a department
3. **In Progress** - Work is being done to resolve
4. **Resolved** - Issue has been fixed

## CORS Configuration
The backend is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000`

To add more origins, update `CORS_ALLOWED_ORIGINS` in `backend/settings.py`.

## Project Structure
```
├── backend/           # Django project settings
├── complaints/        # Main app
│   ├── models.py      # Complaint model
│   ├── serializers.py # REST serializers
│   ├── views.py       # API views
│   ├── urls.py        # URL routing
│   └── admin.py       # Admin configuration
├── media/             # Uploaded images (created automatically)
├── db.sqlite3         # SQLite database
└── manage.py          # Django management script
```

## Next Steps
1. Connect frontend to backend API
2. Test complaint submission from frontend
3. Implement image upload handling
4. Add authentication (if needed)
5. Deploy to production server
