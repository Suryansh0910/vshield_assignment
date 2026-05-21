# Backend API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 📝 AUTH ENDPOINTS

### Register User
```
POST /api/auth/register
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2026-05-21T10:00:00Z"
    },
    "token": "jwt_token"
  }
}
```

### Login User
```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt_token"
  }
}
```

---

## 👤 CANDIDATE ENDPOINTS

### Create Candidate
```
POST /api/candidates
Authorization: Bearer <token>
```
**Body:**
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "9876543210",
  "aadhaarNumber": "123456789012",
  "panNumber": "ABCDE1234F",
  "dob": "1990-01-01T00:00:00Z",
  "address": "123 Main Street, City"
}
```

### Get All Candidates
```
GET /api/candidates
Authorization: Bearer <token>
Query Parameters:
  - page (default: 1)
  - limit (default: 10)
  - search (optional: search by name, email, or phone)
  - status (optional: VERIFIED, PARTIAL, FAILED, PENDING)
```

### Get Candidate by ID
```
GET /api/candidates/:id
Authorization: Bearer <token>
```

### Update Candidate
```
PUT /api/candidates/:id
Authorization: Bearer <token>
```
**Body:** (All fields optional)
```json
{
  "fullName": "Jane Smith",
  "email": "jane.smith@example.com",
  "phone": "9876543210",
  "aadhaarNumber": "123456789012",
  "panNumber": "ABCDE1234F",
  "dob": "1990-01-01T00:00:00Z",
  "address": "New Address"
}
```

### Delete Candidate
```
DELETE /api/candidates/:id
Authorization: Bearer <token>
```

---

## ✔️ VERIFICATION ENDPOINTS

### Start Verification
```
POST /api/verifications/:id/start
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "message": "Verification completed",
  "data": {
    "candidate": { /* candidate data with masked Aadhaar/PAN */ },
    "verification": {
      "aadhaar": {
        "status": "VERIFIED",
        "response": { /* API response */ }
      },
      "pan": {
        "status": "VERIFIED",
        "response": { /* API response */ }
      },
      "overallStatus": "VERIFIED"
    }
  }
}
```

### Get Verification Logs
```
GET /api/verifications/:id/logs
Authorization: Bearer <token>
```

---

## 📄 REPORT ENDPOINTS

### Generate Report
```
POST /api/reports/:id/generate
Authorization: Bearer <token>
```
**Response:** PDF file download

### Download Report
```
GET /api/reports/:id/download
Authorization: Bearer <token>
```
**Response:** PDF file download

---

## 🧪 MOCK API ENDPOINTS (No Auth Required)

### Mock Aadhaar Verification
```
POST /mock-api/aadhaar/verify
```
**Body:**
```json
{
  "aadhaarNumber": "123456789012"
}
```
**Response:**
```json
{
  "success": true,
  "status": "VERIFIED",
  "message": "Aadhaar verification VERIFIED",
  "data": {
    "aadhaarNumber": "123456789012",
    "verifiedAt": "2026-05-21T10:00:00Z",
    "verificationType": "AADHAAR"
  }
}
```

### Mock PAN Verification
```
POST /mock-api/pan/verify
```
**Body:**
```json
{
  "panNumber": "ABCDE1234F"
}
```
**Response:**
```json
{
  "success": true,
  "status": "VERIFIED",
  "message": "PAN verification VERIFIED",
  "data": {
    "panNumber": "ABCDE1234F",
    "verifiedAt": "2026-05-21T10:00:00Z",
    "verificationType": "PAN"
  }
}
```

---

## Health Check
```
GET /health
```
**Response:**
```json
{
  "success": true,
  "message": "Server is running"
}
```

---

## Validation Rules

### Aadhaar Number
- Must be exactly 12 digits
- Regex: `^\d{12}$`

### PAN Number
- Format: 5 uppercase letters, 4 digits, 1 uppercase letter
- Regex: `^[A-Z]{5}[0-9]{4}[A-Z]{1}$`
- Example: ABCDE1234F

### Phone Number
- Must be exactly 10 digits
- Regex: `^\d{10}$`

### Password
- Minimum 6 characters

---

## Error Responses

### 400 - Bad Request (Validation Error)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "code": "invalid_string",
      "expected": "email",
      "received": "string",
      "message": "Invalid email format",
      "path": ["email"]
    }
  ]
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Candidate not found"
}
```

### 409 - Conflict
```json
{
  "success": false,
  "message": "email already exists"
}
```

### 429 - Too Many Requests
```json
{
  "success": false,
  "message": "Too many authentication attempts, please try again later"
}
```

---

## Notes

1. **Aadhaar Masking**: In all responses, Aadhaar numbers are masked (e.g., `XXXX-XXXX-9012`)
2. **PAN Masking**: PAN numbers are masked (e.g., `ABCDE****F`)
3. **Rate Limiting**:
   - Auth endpoints: 10 requests per 15 minutes
   - Verification endpoints: 5 requests per hour
4. **JWT Expiry**: 15 minutes
5. **Database**: PostgreSQL (Prisma ORM)
