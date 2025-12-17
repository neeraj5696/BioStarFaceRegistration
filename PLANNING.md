# BioStar Face Registration - Planning & Roadmap

## System Architecture

**Stack Decision:**
- **Backend:** Node.js + Express (better for scalability, async operations, email handling)
- **Frontend:** React (simpler than Next.js for this use case)
- **Database:** PostgreSQL (robust, scalable)
- **Email:** AWS SES or Nodemailer with Gmail
- **Storage:** Local storage initially, S3 for production

---

## Database Schema

### Tables

```sql
-- 1. HR Users
CREATE TABLE hr_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Employees
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Verification Requests
CREATE TABLE verification_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, expired
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP
);

-- 4. Captured Photos
CREATE TABLE captured_photos (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES verification_requests(id),
    employee_id INTEGER REFERENCES employees(id),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints

### Backend Routes

```
POST   /api/auth/login              - HR login
GET    /api/auth/verify             - Verify HR session

GET    /api/employees               - Get all employees
POST   /api/employees               - Add new employee

POST   /api/send-verification       - Send email to selected employees
GET    /api/verify/:token           - Validate token from email link
POST   /api/upload-photo            - Upload captured photo
POST   /api/update-biostar          - Call external BioStar API
```

---

## Application Flow

### Phase 1: HR Login & Employee Selection
1. HR opens dashboard → Login page
2. Enter username/password → POST /api/auth/login
3. Backend validates credentials → Return JWT token
4. Dashboard loads → GET /api/employees
5. Display employees in searchable multi-select dropdown
6. HR selects employees → Click "Send Email"
7. POST /api/send-verification with employee IDs
8. Backend generates unique tokens, sends emails, stores in DB

### Phase 2: Employee Verification
1. Employee receives email with link: `https://domain.com/verify/{token}`
2. Employee clicks link → GET /api/verify/:token
3. Backend validates token (not expired, status=pending)
4. Frontend opens camera page
5. Request camera permission → Show live preview
6. Employee clicks "Capture" → Take snapshot
7. POST /api/upload-photo with image + token
8. Backend saves photo, updates verification status
9. Backend calls external BioStar API → POST /api/update-biostar

### Phase 3: BioStar Integration
1. After photo upload success
2. Backend prepares data (employee_id, photo_url)
3. Call BioStar API with employee data
4. Log response, update status

---

## Folder Structure

```
BioStarFaceRegistration/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── email.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── employees.js
│   │   │   └── verification.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── employeeController.js
│   │   │   └── verificationController.js
│   │   ├── services/
│   │   │   ├── emailService.js
│   │   │   └── biostarService.js
│   │   └── server.js
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── EmployeeSelector.jsx
│   │   │   └── CameraCapture.jsx
│   │   ├── pages/
│   │   │   ├── HRPage.jsx
│   │   │   └── VerifyPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── Dockerfile
├── database/
│   └── schema.sql
├── docker-compose.yml
└── README.md
```

---

## Security Measures

1. **Authentication:** JWT tokens for HR, expiring verification tokens for employees
2. **Password:** bcrypt hashing
3. **Token Expiry:** Verification links expire in 24 hours
4. **CORS:** Restrict origins
5. **Rate Limiting:** Prevent spam
6. **Input Validation:** Sanitize all inputs
7. **HTTPS:** SSL in production

---

## Development Roadmap

### Step 1: Database Setup
- [ ] Install PostgreSQL
- [ ] Create database
- [ ] Run schema.sql
- [ ] Add sample HR user and employees

### Step 2: Backend Core
- [ ] Initialize Node.js project
- [ ] Install dependencies (express, pg, bcrypt, jsonwebtoken, multer, nodemailer)
- [ ] Setup database connection
- [ ] Create middleware (auth, error handling)

### Step 3: Backend APIs
- [ ] Auth routes (login)
- [ ] Employee routes (list, add)
- [ ] Verification routes (send email, verify token, upload photo)
- [ ] BioStar integration service

### Step 4: Frontend Setup
- [ ] Initialize React project (Vite)
- [ ] Install dependencies (axios, react-router-dom, react-select)
- [ ] Setup routing

### Step 5: Frontend Pages
- [ ] HR Login page
- [ ] HR Dashboard with employee selector
- [ ] Employee verification page with camera

### Step 6: Integration & Testing
- [ ] Connect frontend to backend
- [ ] Test complete flow
- [ ] Handle errors

### Step 7: Deployment
- [ ] Create Dockerfiles
- [ ] Setup docker-compose
- [ ] Configure Nginx
- [ ] Deploy to server

---

## Environment Variables

### Backend (.env)
```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/biostar_db

EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:3000
BIOSTAR_API_URL=https://biostar-api.com/endpoint
BIOSTAR_API_KEY=your_api_key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

---

## Next Steps

1. Review this plan
2. Confirm tech stack choices
3. Start with Step 1: Database Setup
4. Build incrementally following the roadmap
