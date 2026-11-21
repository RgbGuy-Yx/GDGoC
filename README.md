# GDGoC VJIT Recruitment Management System — Full Stack (Phase 1, 2 & 3)

Production-grade internal recruitment management system for **Google Developer Groups on Campus (GDGoC) VJIT**, featuring a secure Node.js/Express backend, MongoDB persistence, and an administrative React + Tailwind CSS dashboard.

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Access-code-based login with bcrypt hashing & signed JSON Web Tokens (JWT)
- **Data Ingestion**: Multer & SheetJS (`xlsx`) for Excel (`.xlsx`) and CSV parsing
- **Testing**: Jest, Supertest, and `mongodb-memory-server`

### Frontend
- **Library**: React 19 + Vite
- **Styling**: Tailwind CSS (Minimal, Google-inspired administrative palette: `#1a73e8` / `#4285F4`)
- **Routing**: React Router v7 with role-based protected routes
- **API Client**: Axios with automatic JWT injection interceptors and configurable base URL
- **Icons**: Lucide React

---

## 📁 Project Architecture

```
d:\gdgoc\
├── src/
│   ├── app.js                          # Express app configuration & middleware
│   ├── server.js                       # Server entry point & graceful shutdown
│   ├── config/
│   │   ├── index.js                    # Centralized environment variable loader
│   │   └── db.js                       # MongoDB connection & lifecycle handlers
│   ├── models/
│   │   ├── Admin.js                    # Admin access code & profile schema
│   │   ├── TeamLead.js                 # Team lead profile, domains & access code schema
│   │   ├── Candidate.js                # Form responses, domain state & immutability guards
│   │   ├── Evaluation.js               # Historical interview evaluations (0-10 score & remarks)
│   │   └── TransferLog.js              # Historical immutable transfer log entries
│   ├── controllers/
│   │   ├── authController.js           # Admin & Team Lead login, current user profile
│   │   ├── candidateController.js      # Candidate query, detail, shortlist & final selection
│   │   ├── evaluationController.js     # Interview evaluation submission & history
│   │   ├── transferController.js       # Candidate cross-domain transfer & transfer log
│   │   ├── importController.js         # Excel (.xlsx) & CSV file ingestion
│   │   └── leadController.js           # Team lead list and creation
│   ├── routes/
│   │   ├── authRoutes.js               # /api/auth
│   │   ├── candidateRoutes.js          # /api/candidates
│   │   ├── leadRoutes.js               # /api/leads
│   │   └── index.js                    # Main router mount & /api/health
│   ├── middleware/
│   │   ├── authMiddleware.js           # Bearer JWT verification
│   │   ├── roleMiddleware.js           # Role authorization (admin vs lead)
│   │   ├── candidateAccessMiddleware.js# Domain-scoped candidate access control
│   │   ├── uploadMiddleware.js         # Multer in-memory upload filter (.xlsx, .csv)
│   │   └── errorMiddleware.js          # Centralized error handler
│   ├── services/
│   │   ├── authService.js              # Authentication logic & token generation
│   │   ├── candidateService.js         # Candidate domain business logic & audits
│   │   └── importService.js            # Spreadsheet header mapping, validation & duplicate checks
│   └── utils/
│       ├── apiResponse.js              # Standardized JSON response formatters
│       ├── candidateIdGenerator.js     # Unique ID generator (e.g. GDGOC-2025-XXXXX)
│       └── columnMapper.js             # Fuzzy Google Form header mapping patterns
├── client/                             # React Frontend (Phase 2)
│   ├── src/
│   │   ├── api/                        # Axios API client modules
│   │   ├── context/                    # AuthContext (JWT, active user, role helpers)
│   │   ├── components/                 # Reusable tables, forms, badges, modals, layouts
│   │   └── pages/                      # Admin & Team Lead dashboard pages
│   ├── vite.config.js                  # Vite configuration & dev proxy
│   ├── tailwind.config.js              # Google-inspired administrative palette
│   ├── vercel.json                     # Vercel SPA rewrite configuration
│   └── package.json
├── scripts/
│   ├── seed.js                         # Database seeder for Admin, Leads, & Demo data
│   └── createSampleSpreadsheet.js      # Generates sample .xlsx and .csv files for testing
├── samples/
│   ├── sample_google_forms_responses.xlsx
│   └── sample_google_forms_responses.csv
├── tests/
│   ├── setup.js                        # In-memory MongoDB lifecycle setup for Jest
│   ├── auth.test.js                    # Authentication & token tests
│   ├── candidates.test.js              # Access control, shortlist & final selection tests
│   ├── evaluationAndTransfer.test.js   # Evaluation preservation & domain transfer tests
│   ├── import.test.js                  # Spreadsheet upload, deduplication & parsing tests
│   └── e2eWorkflows.test.js            # Phase 3 Full End-to-End integration test suite
├── render.yaml                         # Render Backend deployment blueprint
├── .env.example
├── .env
├── package.json
└── README.md
```

---

## 🔒 Key Business Rules & Security Guarantees

1. **Access-Code Authentication**:
   - Access codes are **never** returned in API responses or exposed in frontend code.
   - Codes are hashed using `bcrypt` (10 salt rounds) before storage.
   - Distinct access codes exist for the Admin and each Team Lead.
   - Returns expiring signed JWT tokens with claims (`id`, `role`, `name`, `domains`).

2. **Domain Isolation & Scoped Access Control**:
   - **Admin**: Unrestricted access across all domains, evaluations, transfers, and final decisions.
   - **Team Lead**: Restricted strictly to candidates whose `currentDomain` matches the lead's `assignedDomains` or who are explicitly assigned to the lead. Any attempt by a lead to access candidates in other domains returns `403 Forbidden`.

3. **Immutability of `originalDomain`**:
   - When a candidate applies, their `originalDomain` is set from `preferredDomain`.
   - `originalDomain` has `immutable: true` in the Mongoose schema, enforced by pre-save and pre-update lifecycle hooks that block any direct modification.

4. **Preservation of Evaluation History**:
   - Previous evaluations are **never overwritten**.
   - Multiple evaluations can be submitted for a single candidate (e.g. during multiple interview rounds or across domain transfers).
   - Receiving leads can access the complete evaluation history of transferred candidates.

5. **Transfer Business Rules**:
   - Transferring a candidate modifies `currentDomain` and (optionally) `assignedLead`.
   - Transfer **does NOT automatically shortlist** or alter candidate shortlist status.
   - An immutable record is created in `TransferLog` capturing previous domain, previous lead, destination domain, destination lead, transfer reason, remarks, and user who performed the transfer.

6. **Final Selection Exclusivity**:
   - Only the **Admin** role can update `finalSelectionStatus` (`PENDING`, `SELECTED`, `REJECTED`, `WAITLISTED`). Any lead attempt is blocked at the route level with `403 Forbidden`.

---

## 🧪 Comprehensive Automated Test Verification

All 5 test suites (covering unit, integration, and full end-to-end workflows) execute against an in-memory MongoDB server:

```bash
npm test
```

### Verified Workflows & Guarantees (38/38 Tests Passing):
1. **Full Admin Workflow**:
   - ✅ Admin logs in with `GDGOC_ADMIN_2025`
   - ✅ Admin imports Google Forms response spreadsheet (`.xlsx` & `.csv`)
   - ✅ Admin views all candidates with pagination
   - ✅ Admin filters candidates by domain (`Web Development`, `AI/ML`, etc.)
   - ✅ Admin inspects complete candidate profile (15 Google Form fields)
   - ✅ Admin reviews interview evaluations across leads
   - ✅ Admin inspects candidate transfer audit histories
   - ✅ Admin updates final selection status (`SELECTED`, `REJECTED`, `WAITLISTED`)
2. **Full Team Lead Workflow & Cross-Domain Handover**:
   - ✅ Web Lead logs in with `LEAD_WEB_2025`
   - ✅ Lead sees only authorized candidates in their domain
   - ✅ Lead opens candidate profile
   - ✅ Lead shortlists candidate (`SHORTLISTED`)
   - ✅ Lead submits interview evaluation (score 8.5/10 and remarks)
   - ✅ Lead transfers candidate to `AI/ML` domain with destination lead and justification
   - ✅ Receiving Lead (`LEAD_AIML_2025`) logs in
   - ✅ Receiving Lead sees transferred candidate under their assigned domain
   - ✅ Receiving Lead inspects complete previous evaluation history from Web Lead
   - ✅ Receiving Lead independently submits subsequent evaluation (score 9.5/10)
   - ✅ Both evaluations and transfer logs are preserved without overwriting!
3. **Data Integrity & Security**:
   - ✅ `originalDomain` is never overwritten even after transfers
   - ✅ Duplicate spreadsheet imports reject duplicate emails and roll numbers
   - ✅ Unrelated leads cannot access unauthorized candidate data (`403 Forbidden`)
   - ✅ Team leads cannot access admin-only endpoints (`403 Forbidden`)
   - ✅ Team leads cannot alter final selection status (`403 Forbidden`)
   - ✅ Invalid access codes, expired tokens, or malformed tokens are rejected (`401 Unauthorized`)
   - ✅ Access codes are never returned in JSON payloads

---

## 🚀 Local Setup & Development

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local instance or MongoDB Atlas cluster URI)

### 2. Installation
```bash
# Install root backend dependencies
npm install

# Install client dependencies
npm install --prefix client
```

### 3. Environment Configuration
Create a `.env` file in the root directory (based on `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gdgoc_recruitment
JWT_SECRET=gdgoc_vjit_recruitment_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=24h
DEFAULT_ADMIN_ACCESS_CODE=GDGOC_ADMIN_2025
CLIENT_ORIGIN=*
```

### 4. Database Seeding
Initialize the Admin account, Team Leads with designated domains, and initial sample candidates:
```bash
npm run seed
```

#### Pre-configured Seed Credentials:
| Role | Name | Access Code | Assigned Domain(s) |
|---|---|---|---|
| **Admin** | GDGoC VJIT Lead Admin | `GDGOC_ADMIN_2025` | `*` (All Domains) |
| **Lead** | Aarav - Web Lead | `LEAD_WEB_2025` | `Web Development` |
| **Lead** | Bhavya - AI/ML Lead | `LEAD_AIML_2025` | `AI/ML` |
| **Lead** | Charan - Cloud Lead | `LEAD_CLOUD_2025` | `Cloud Computing` |
| **Lead** | Divya - App Dev Lead | `LEAD_APP_2025` | `App Development` |
| **Lead** | Eshwar - Design Lead | `LEAD_DESIGN_2025` | `Design & Media` |
| **Lead** | Farhan - Management Lead | `LEAD_MGMT_2025` | `Management / Non-Tech` |

### 5. Running the Application

#### Development Mode:
```bash
# Terminal 1: Start Express Backend (Port 5000)
npm run dev

# Terminal 2: Start React Frontend (Port 3000)
npm run client
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`

#### Production Mode (Unified Single-Port):
```bash
# Build React client into static assets
npm run client:build

# Start unified production server (serves API and React UI on port 5000)
npm start
```
- Production URL: `http://localhost:5000`

---

## 🌐 Production Deployment Guide

### Architecture:
- **Frontend**: Vercel (or served statically by Express)
- **Backend**: Render
- **Database**: MongoDB Atlas

---

### Step 1: Database Setup on MongoDB Atlas
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Under **Database Access**, create a user (e.g., `gdgoc_admin`) with password.
3. Under **Network Access**, add IP `0.0.0.0/0` (allow connections from anywhere) so Render can connect.
4. Click **Connect** ➔ **Drivers** ➔ copy the SRV connection string:
   ```
   mongodb+srv://gdgoc_admin:<password>@cluster0.abcde.mongodb.net/gdgoc_recruitment?retryWrites=true&w=majority
   ```

---

### Step 2: Backend Deployment on Render
1. Push your repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), click **New** ➔ **Web Service**.
3. Connect your repository.
4. Configure service settings:
   - **Name**: `gdgoc-vjit-recruitment-backend`
   - **Environment**: `Node`
   - **Region**: Closest to Hyderabad / India (e.g., Singapore)
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run client:build`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGODB_URI` | *Your MongoDB Atlas connection string from Step 1* |
   | `JWT_SECRET` | *Strong random string (e.g., 64-character hex)* |
   | `JWT_EXPIRES_IN` | `24h` |
   | `DEFAULT_ADMIN_ACCESS_CODE` | *Your chosen Admin Access Code* |
   | `CLIENT_ORIGIN` | `*` *(or your Vercel frontend URL)* |
6. Click **Deploy Web Service**.
7. Once deployed, run the seed script via Render's **Shell** tab:
   ```bash
   node scripts/seed.js
   ```
8. Note your backend URL: e.g. `https://gdgoc-vjit-recruitment-backend.onrender.com`.

---

### Step 3: Frontend Deployment on Vercel
1. In [Vercel Dashboard](https://vercel.com), click **Add New** ➔ **Project**.
2. Select your repository.
3. In **Project Settings**:
   - **Root Directory**: Click edit and choose `client`.
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://gdgoc-vjit-recruitment-backend.onrender.com/api` |
5. Click **Deploy**.
6. The `client/vercel.json` file automatically handles single-page application (SPA) client-side routing so refreshing pages like `/admin/candidates` or `/lead/shortlisted` loads seamlessly without 404s.

---

## 🛡️ License

Proprietary — Built exclusively for internal recruitment operations at **Google Developer Groups on Campus (GDGoC) VJIT**.
