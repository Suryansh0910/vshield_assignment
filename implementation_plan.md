# Background Verification Platform — Implementation Plan

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Repository Structure](#3-repository-structure)
4. [Development Phases](#4-development-phases)
5. [Environment Setup](#5-environment-setup)
6. [Database Setup](#6-database-setup)
7. [Backend Implementation](#7-backend-implementation)
8. [Frontend Implementation](#8-frontend-implementation)
9. [Verification Module](#9-verification-module)
10. [Report Generation](#10-report-generation)
11. [Security Checklist](#11-security-checklist)
12. [Testing Plan](#12-testing-plan)
13. [Deployment](#13-deployment)
14. [Final Deliverables Checklist](#14-final-deliverables-checklist)

---

## 1. Project Overview

A secure, scalable Background Verification Platform that enables organizations and recruiters to submit candidate details, run Aadhaar and PAN verification checks via mock APIs, and generate professional verification reports.

**Core Goals:**
- Secure JWT-based authentication
- Candidate CRUD management
- Aadhaar & PAN verification via mock APIs
- PDF report generation
- Professional enterprise dashboard UI

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Next.js), Tailwind CSS, Axios, React Hook Form, Zod, Zustand |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL (via Prisma ORM) |
| Auth | JWT + bcrypt |
| PDF Generation | Puppeteer |
| File Storage | AWS S3 / Cloudinary |
| Deployment | Vercel (frontend), Render/Railway (backend), Neon/Supabase (DB) |

---

## 3. Repository Structure

```
bgv-platform/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   ├── services/          # Business logic
│   │   ├── routes/            # Express routers
│   │   ├── middleware/        # Auth, error, rate-limit
│   │   ├── utils/             # Helpers (masking, PDF, etc.)
│   │   ├── prisma/            # Prisma client instance
│   │   ├── validations/       # Zod schemas
│   │   ├── config/            # Env config
│   │   ├── types/             # TypeScript types
│   │   └── app.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/             # Next.js pages
│   │   ├── components/        # Reusable UI components
│   │   ├── layouts/           # Page layouts
│   │   ├── services/          # Axios API calls
│   │   ├── hooks/             # Custom React hooks
│   │   ├── store/             # Zustand state
│   │   ├── utils/             # Frontend helpers
│   │   ├── types/             # Shared TypeScript types
│   │   └── styles/
│   ├── public/
│   └── package.json
│
├── .env.example
└── README.md
```

---

## 4. Development Phases

### Day 1 — Project Setup & Authentication

**Backend**
- [ ] Initialize Node.js + TypeScript project
- [ ] Configure Express app with Helmet, CORS, rate-limiting
- [ ] Set up Prisma with PostgreSQL connection
- [ ] Run initial migration (Users table)
- [ ] Implement `POST /api/auth/register` — hash password with bcrypt, return JWT
- [ ] Implement `POST /api/auth/login` — validate credentials, return JWT
- [ ] Build `authMiddleware` to protect routes

**Frontend**
- [ ] Initialize Next.js project with Tailwind CSS
- [ ] Build Login page with React Hook Form + Zod validation
- [ ] Build Register page
- [ ] Set up Zustand auth store (token, user)
- [ ] Axios instance with Authorization header interceptor
- [ ] Redirect authenticated users to dashboard

---

### Day 2 — Candidate CRUD APIs

**Backend**
- [ ] Add Candidates table migration (Prisma)
- [ ] `POST /api/candidates` — create candidate (validate Aadhaar regex, PAN regex)
- [ ] `GET /api/candidates` — list with pagination, search, status filter
- [ ] `GET /api/candidates/:id` — fetch single candidate with verification logs
- [ ] `PUT /api/candidates/:id` — update candidate details
- [ ] `DELETE /api/candidates/:id` — soft delete or hard delete

**Frontend**
- [ ] Candidate List page — data table with search, filter, status badges, pagination
- [ ] Add Candidate form modal — all fields with validation
- [ ] Candidate Detail page — personal info + verification timeline

---

### Day 3 — Verification APIs Integration

**Backend**
- [ ] Add VerificationLogs table migration (Prisma)
- [ ] Build mock Aadhaar verification endpoint: `POST /mock-api/aadhaar/verify`
- [ ] Build mock PAN verification endpoint: `POST /mock-api/pan/verify`
- [ ] `POST /api/verifications/:id/start`
  - Call Aadhaar mock API
  - Call PAN mock API
  - Store request + response payloads in VerificationLogs
  - Compute `overallStatus`: VERIFIED / PARTIAL / FAILED
  - Update candidate status in DB

**Verification Logic**

```typescript
if (aadhaar === 'verified' && pan === 'verified') status = 'VERIFIED';
else if (aadhaar === 'verified' || pan === 'verified') status = 'PARTIAL';
else status = 'FAILED';
```

**Frontend**
- [ ] "Start Verification" button on Candidate Detail page
- [ ] Loading state / skeleton during verification
- [ ] Display verification timeline (Aadhaar result, PAN result, overall status)
- [ ] Toast notifications for success/failure

---

### Day 4 — Frontend Dashboard & Forms

**Frontend**
- [ ] Dashboard page with stats cards:
  - Total Candidates
  - Verified
  - Pending
  - Failed
- [ ] Status badge components (VERIFIED=green, PARTIAL=yellow, FAILED=red, PENDING=gray)
- [ ] Responsive layout — sidebar + main content
- [ ] Skeleton loaders for async data
- [ ] Form validations with inline error messages
- [ ] Search and filter bar on Candidate List

---

### Day 5 — Report Generation

**Backend**
- [ ] Build HTML report template (inject candidate data + verification results)
- [ ] Use Puppeteer to render HTML → PDF
- [ ] Upload PDF to AWS S3 / Cloudinary
- [ ] Store PDF URL in DB against candidate
- [ ] `GET /api/reports/:id` — return signed URL or stream PDF

**Report Contents**
```
--------------------------------------
BACKGROUND VERIFICATION REPORT
--------------------------------------
Candidate Name:      John Doe
Email:               john@test.com
Phone:               9876543210
Aadhaar Verification: VERIFIED
PAN Verification:    VERIFIED
Overall Status:      VERIFIED
Generated On:        20-May-2026
Verified By:         Admin User
--------------------------------------
```

**Frontend**
- [ ] "Generate Report" button on Candidate Detail page
- [ ] PDF preview modal
- [ ] Download report button

---

### Day 6 — Security & Testing

**Security**
- [ ] Mask Aadhaar in all API responses (`XXXX-XXXX-1234`)
- [ ] Encrypt sensitive DB fields (Aadhaar, PAN)
- [ ] Add rate limiting to auth and verification endpoints
- [ ] Validate all inputs server-side (Zod schemas)
- [ ] Prevent SQL injection via Prisma ORM
- [ ] Set JWT expiry (15 min access token, optional refresh token)
- [ ] Add Helmet security headers

**Testing**
- [ ] Backend: Jest + Supertest — auth, candidate CRUD, verification flow
- [ ] Frontend: React Testing Library — form validation, login flow
- [ ] Manual: Postman collection for all API endpoints

---

### Day 7 — Deployment & Polish

- [ ] Dockerize backend (optional)
- [ ] Deploy backend to Render / Railway
- [ ] Deploy frontend to Vercel
- [ ] Provision PostgreSQL on Neon / Supabase
- [ ] Set all environment variables in hosting dashboards
- [ ] Run Prisma migrations on production DB
- [ ] Smoke test all flows on production
- [ ] Write README.md
- [ ] Export Postman collection

---

## 5. Environment Setup

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- npm / yarn / pnpm

### Installation

```bash
# Clone repo
git clone https://github.com/your-org/bgv-platform.git
cd bgv-platform

# Backend setup
cd backend
npm install
cp .env.example .env
# Fill in .env values (see below)
npx prisma migrate dev --name init
npm run dev

# Frontend setup
cd ../frontend
npm install
cp .env.example .env.local
npm run dev
```

### Environment Variables (`.env`)

```env
# Backend
DATABASE_URL=postgresql://user:password@localhost:5432/bgv_db
JWT_SECRET=your_super_secret_key
PORT=5000
AADHAAR_API_URL=http://localhost:5000/mock-api/aadhaar/verify
PAN_API_URL=http://localhost:5000/mock-api/pan/verify
AWS_BUCKET_NAME=bgv-reports
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 6. Database Setup

### Prisma Schema (key models)

```prisma
model User {
  id           String      @id @default(uuid())
  name         String
  email        String      @unique
  passwordHash String
  createdAt    DateTime    @default(now())
  candidates   Candidate[]
}

model Candidate {
  id                String             @id @default(uuid())
  fullName          String
  email             String
  phone             String
  aadhaarNumber     String
  panNumber         String
  dob               DateTime
  address           String
  status            String             @default("PENDING")
  reportUrl         String?
  createdAt         DateTime           @default(now())
  createdById       String
  createdBy         User               @relation(fields: [createdById], references: [id])
  verificationLogs  VerificationLog[]
}

model VerificationLog {
  id                 String    @id @default(uuid())
  candidateId        String
  verificationType   String    // "AADHAAR" | "PAN"
  requestPayload     Json
  responsePayload    Json
  verificationStatus String
  verifiedAt         DateTime  @default(now())
  candidate          Candidate @relation(fields: [candidateId], references: [id])
}
```

### Migrations

```bash
npx prisma migrate dev --name add_candidates
npx prisma migrate dev --name add_verification_logs
npx prisma studio   # visual DB browser
```

---

## 7. Backend Implementation

### Key Validation Regexes

```typescript
const aadhaarRegex = /^\d{12}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
```

### Aadhaar Masking Utility

```typescript
export const maskAadhaar = (aadhaar: string): string =>
  `XXXX-XXXX-${aadhaar.slice(-4)}`;
```

### Verification Service

```typescript
export const verifyAadhaar = async (aadhaarNumber: string) => {
  const response = await axios.post(process.env.AADHAAR_API_URL!, { aadhaarNumber });
  return response.data;
};

export const verifyPAN = async (panNumber: string) => {
  const response = await axios.post(process.env.PAN_API_URL!, { panNumber });
  return response.data;
};
```

### REST API Summary

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register user |
| POST | `/api/auth/login` | ❌ | Login user |
| GET | `/api/candidates` | ✅ | List candidates |
| POST | `/api/candidates` | ✅ | Create candidate |
| GET | `/api/candidates/:id` | ✅ | Candidate details |
| PUT | `/api/candidates/:id` | ✅ | Update candidate |
| DELETE | `/api/candidates/:id` | ✅ | Delete candidate |
| POST | `/api/verifications/:id/start` | ✅ | Run verification |
| GET | `/api/reports/:id` | ✅ | Download report |
| POST | `/mock-api/aadhaar/verify` | ❌ | Mock Aadhaar API |
| POST | `/mock-api/pan/verify` | ❌ | Mock PAN API |

---

## 8. Frontend Implementation

### Pages

| Route | Page | Description |
|---|---|---|
| `/login` | Login | Email + password, JWT stored |
| `/register` | Register | New user signup |
| `/dashboard` | Dashboard | Stats overview |
| `/candidates` | Candidate List | Table, search, filter |
| `/candidates/new` | Add Candidate | Create form |
| `/candidates/[id]` | Candidate Detail | Info + verification timeline |
| `/candidates/[id]/report` | Report | PDF preview + download |

### Zustand Auth Store (example)

```typescript
interface AuthStore {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}
```

---

## 9. Verification Module

### Flow

```
User clicks "Start Verification"
        ↓
POST /api/verifications/:id/start
        ↓
Backend calls Aadhaar mock API  →  Store log in DB
Backend calls PAN mock API      →  Store log in DB
        ↓
Compute overall status
  Both verified     → VERIFIED
  One verified      → PARTIAL
  None verified     → FAILED
        ↓
Update candidate.status in DB
        ↓
Return result to frontend
        ↓
Frontend shows timeline + status badge
```

---

## 10. Report Generation

### Puppeteer Flow

```typescript
const generateReport = async (candidate: Candidate) => {
  const html = buildReportHTML(candidate);       // HTML template
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();
  const url = await uploadToS3(pdfBuffer, candidate.id);
  return url;
};
```

---

## 11. Security Checklist

- [x] JWT access tokens with expiry (15 min)
- [x] bcrypt password hashing (salt rounds: 12)
- [x] Aadhaar number masked in all responses
- [x] Sensitive fields encrypted at rest
- [x] Rate limiting on `/api/auth/*` (max 10 req/min)
- [x] Helmet.js security headers
- [x] CORS restricted to frontend origin
- [x] Input validation via Zod on all endpoints
- [x] SQL injection prevention via Prisma ORM
- [x] No raw identity numbers in server logs

---

## 12. Testing Plan

### Backend (Jest + Supertest)

| Test Case | Expected Result |
|---|---|
| Register with valid data | 201 + user object |
| Login with wrong password | 401 Unauthorized |
| Create candidate with invalid Aadhaar | 400 Validation error |
| Create candidate with invalid PAN | 400 Validation error |
| Start verification (mock) | 200 + VERIFIED status |
| Access protected route without token | 401 Unauthorized |
| Generate report | 200 + PDF URL |

### Frontend (React Testing Library)

| Test Case |
|---|
| Login form shows errors on empty submit |
| Login redirects to dashboard on success |
| Candidate form validates Aadhaar format |
| Candidate form validates PAN format |
| Verification status badge renders correctly |

---

## 13. Deployment

### Architecture

```
Vercel (Next.js Frontend)
        ↓
Render / Railway (Express API)
        ↓
Neon / Supabase (PostgreSQL)
        ↓
Mock Verification APIs (same backend)
        ↓
AWS S3 / Cloudinary (PDF reports)
```

### Deployment Steps

1. Push code to GitHub
2. Connect Vercel to `frontend/` — set `NEXT_PUBLIC_API_URL`
3. Connect Render to `backend/` — set all env variables
4. Provision PostgreSQL on Neon — copy `DATABASE_URL`
5. Run `npx prisma migrate deploy` on production
6. Verify all endpoints via Postman
7. Test end-to-end: register → add candidate → verify → download report

---

## 14. Final Deliverables Checklist

- [ ] GitHub repository (public or shared)
- [ ] `README.md` with setup, env vars, API docs, screenshots
- [ ] Postman collection (exported JSON)
- [ ] Database schema / ERD
- [ ] `.env.example` file
- [ ] Sample verification report (PDF)
- [ ] Live deployment links (frontend + backend)
- [ ] Passing test suite

---

## Suggested Git Commit Structure

```
feat: initialize project with TypeScript and Express
feat: add Prisma schema and database migrations
feat: implement JWT authentication (register + login)
feat: add candidate CRUD APIs with validation
feat: integrate mock Aadhaar and PAN verification APIs
feat: implement verification workflow and status logic
feat: add Puppeteer PDF report generation
feat: build Next.js dashboard and candidate list UI
feat: add candidate detail page with verification timeline
fix: mask Aadhaar number in API responses
chore: add security middleware (helmet, rate-limit, CORS)
test: add Jest tests for auth and verification endpoints
docs: finalize README and API documentation
chore: deploy to Vercel and Render
```

---

*Generated for: Background Verification Platform Assignment*
*Timeline: 7 days | Stack: Next.js + Node.js + PostgreSQL + Prisma*