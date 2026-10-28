# CampusGig 💜 — Student Freelance & Campus Jobs Marketplace

> **College Project Identification:** `25070521235` | CA-03  
> **Target Repository:** [https://github.com/chunnemugdha-lab/25070521235-CA-03](https://github.com/chunnemugdha-lab/25070521235-CA-03)  
> **Visual Identity:** Purple / Deep Violet `#8b5cf6` • Modern Dark Theme `#0c0d14` • Responsive Design

---

## 📖 Project Overview

**CampusGig** is a full-stack, peer-to-peer freelance and campus gig marketplace specifically built for college students, academic clubs, and campus organizations. Students can discover part-time tasks, micro-internships, coding assignments, event design gigs, and peer tutoring opportunities.

### Key Highlights
- **Real Persistent Data**: Connected to local **MongoDB Community Server** (`mongodb://127.0.0.1:27017/freelance_gig_db`).
- **Secure Authentication**: Password hashing with `bcryptjs` (salt rounds: 12) and server-managed sessions with `express-session`, `connect-mongo`, and `httpOnly` cookies.
- **Strict Separation of Concerns**: React + Vite frontend in `client/` and Express + Node.js backend in `server/`.
- **Zero Mock Data for Production**: Real Mongoose schemas (`User`, `Job`, `Application`) with database-enforced unique indexes and authorization checks.

---

## 📁 Project Structure

```text
25070521235/
├── .gitignore                    # Excludes node_modules, .env, dist, *.log
├── README.md                     # Comprehensive documentation & evaluation guide
├── client/                       # React 19 + Vite Frontend (JSX)
│   ├── .env.example              # Client environment variables
│   ├── index.html                # CampusGig HTML template
│   ├── package.json              # Client scripts & dependencies
│   ├── vite.config.js            # Vite config with backend /api proxy
│   └── src/
│       ├── main.jsx              # React root entry point
│       ├── App.jsx               # Application router & layout structure
│       ├── App.css               # CampusGig component & utility styles
│       ├── index.css             # Dark/purple CSS variables & resets
│       ├── api/
│       │   └── apiClient.js      # Centralized API client with credentials: include
│       ├── context/
│       │   └── AuthContext.jsx   # Global session state & auth methods
│       ├── components/
│       │   ├── Navbar.jsx        # Responsive navigation bar & user pill
│       │   ├── Footer.jsx        # CampusGig footer & college notices
│       │   ├── JobCard.jsx       # Interactive gig card component
│       │   ├── Modal.jsx         # Accessible overlay modal dialog
│       │   ├── ProtectedRoute.jsx# Auth guard for student routes
│       │   ├── AlertBanner.jsx   # Dismissible feedback alerts
│       │   └── LoadingSpinner.jsx# Purple spinner loader
│       └── pages/
│           ├── Home.jsx          # Landing page with stats & featured gigs
│           ├── BrowseJobs.jsx    # Search, multi-category & budget filter
│           ├── JobDetails.jsx    # Full gig info, poster bio & apply modal
│           ├── CreateJob.jsx     # Post a new campus gig form
│           ├── EditJob.jsx       # Edit own gig & change status
│           ├── Dashboard.jsx     # Student hub with metrics & recent activity
│           ├── MyApplications.jsx# View submitted applications & live statuses
│           ├── MyPostedJobs.jsx  # View applicants & accept/reject candidates
│           ├── Profile.jsx       # View/edit student skills, college & bio
│           ├── Login.jsx         # Student login screen
│           ├── Signup.jsx        # Original CampusGig branded registration
│           └── NotFound.jsx      # Friendly 404 page
└── server/                       # Node.js + Express 5 Backend (CommonJS)
    ├── .env                      # Local environment secrets (excluded from Git)
    ├── .env.example              # Environment documentation
    ├── package.json              # Server dependencies & scripts
    ├── server.js                 # Express app, session store, route mounting
    ├── seed.js                   # Realistic sample student jobs seeder
    ├── test-api.js               # 22-step automated integration test suite
    ├── middleware/
    │   └── auth.js               # Session-based requireAuth middleware
    ├── models/
    │   ├── User.js               # Mongoose schema for students & posters
    │   ├── Job.js                # Mongoose schema with search indexes
    │   └── Application.js        # Mongoose schema with unique compound index
    └── routes/
        ├── authRoutes.js         # /api/auth (register, login, logout, me, profile)
        ├── jobRoutes.js          # /api/jobs (CRUD, filtering, stats, my-jobs)
        └── applicationRoutes.js  # /api/applications (apply, status update)
```

---

## ⚡ Prerequisites

1. **Node.js** (v18 or newer; verified on v24.22.1)
2. **MongoDB Community Server** installed and running as a Windows Service on `127.0.0.1:27017`
3. **MongoDB Compass** (optional, recommended for viewing documents)

---

## 🚀 Running the Project on Windows (Two VS Code Terminals)

### Terminal 1: Backend Server (Port 5000)
```powershell
# 1. Navigate into server folder
cd "C:\Users\MUGDHA\OneDrive\Desktop\25070521235\server"

# 2. (Optional) Run the seed script to populate realistic student gigs
node seed.js

# 3. Start the Express server
npm start
```
*The server will display:*
```text
=========================================
MongoDB Connected Successfully!
Database: freelance_gig_db at 127.0.0.1:27017
=========================================
CampusGig Server running on http://localhost:5000
Client Origin: http://localhost:5173
Ready to handle student requests!
```

---

### Terminal 2: Frontend Client (Port 5173)
```powershell
# 1. Open a second terminal and navigate into client folder
cd "C:\Users\MUGDHA\OneDrive\Desktop\25070521235\client"

# 2. Start the Vite development server
npm run dev
```
*Open your browser and navigate to:*  
👉 **`http://localhost:5173/`**

---

## 🧪 Automated End-to-End Integration Tests

You can test all 22 system flows automatically using the built-in test suite:
```powershell
cd "C:\Users\MUGDHA\OneDrive\Desktop\25070521235\server"
npm test
```
**Test Coverage:**
- Health check (`GET /`)
- Platform metrics (`GET /api/jobs/stats`)
- Browse & filter jobs with categories
- Input validation (short password rejection)
- Student registration with bcrypt password hashing
- Duplicate email prevention (409 Conflict)
- Session persistence (`GET /api/auth/me`)
- Profile update (`PUT /api/auth/profile`)
- Create job post
- Edit own job post
- Unauthorized edit rejection (403 Forbidden)
- Self-application prevention (400 Bad Request)
- Application submission with cover letter
- Duplicate application prevention (409 Conflict)
- Student viewing submitted applications
- Job owner viewing candidate applications & pitch
- Job owner updating applicant status (`Accepted` / `Under Review` / `Rejected`)
- Candidate verifying live status update
- Bad password rejection (401 Unauthorized)
- Valid login
- Logout session clearance & cookie invalidation

---

## 🧭 Viewing Documents in MongoDB Compass

1. Launch **MongoDB Compass** on Windows.
2. In the "New Connection" screen, enter the URI:
   ```text
   mongodb://127.0.0.1:27017
   ```
3. Click **Connect**.
4. In the left database navigator, locate and click **`freelance_gig_db`**.
5. You will see four collections:
   - **`users`**: Student accounts. Notice the `password` field contains secure bcrypt hashes (`$2a$12$...`), never plain text!
   - **`jobs`**: Gigs with categories, budgets, required skills, deadlines, and poster references.
   - **`applications`**: Submitted applications containing cover letters, proposed rates, and status (`Pending`, `Under Review`, `Accepted`, `Rejected`).
   - **`sessions`**: Mongo-backed active user sessions managed by `connect-mongo`.

---

## 📡 API Reference Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | API Health Check | No |
| `POST` | `/api/auth/register` | Register new student (bcrypt hash) | No |
| `POST` | `/api/auth/login` | Login and create session cookie | No |
| `POST` | `/api/auth/logout` | Destroy session & clear cookie | Yes |
| `GET` | `/api/auth/me` | Return currently logged-in user | Yes |
| `PUT` | `/api/auth/profile` | Update bio, college, skills, phone | Yes |
| `GET` | `/api/jobs` | Browse & filter gigs (query params) | No |
| `GET` | `/api/jobs/stats` | Platform totals & user metrics | Optional |
| `GET` | `/api/jobs/my-jobs` | Gigs posted by logged-in user | Yes |
| `GET` | `/api/jobs/:id` | Individual gig details & poster bio | No |
| `POST` | `/api/jobs` | Create a new campus gig post | Yes |
| `PUT` | `/api/jobs/:id` | Edit own gig post (ownership check) | Yes |
| `DELETE` | `/api/jobs/:id` | Delete own gig & associated apps | Yes |
| `POST` | `/api/applications` | Apply for a gig with cover letter | Yes |
| `GET` | `/api/applications/my-applications` | View all gigs student applied to | Yes |
| `GET` | `/api/applications/job/:jobId` | View applicants (gig poster only) | Yes |
| `PATCH` | `/api/applications/:id/status` | Accept/reject applicant (poster only) | Yes |

---

## 📤 How to Upload to GitHub Without Git CLI

If Git CLI is not installed on your machine, follow these safe manual steps to upload the project directly to GitHub:

### Step 1: Open Your Target GitHub Repository
Open your browser and visit:  
👉 **[https://github.com/chunnemugdha-lab/25070521235-CA-03](https://github.com/chunnemugdha-lab/25070521235-CA-03)**

### Step 2: What NOT to Upload (Safety Rules)
⚠️ **NEVER upload the following:**
- `client/node_modules/` or `server/node_modules/` (thousands of files, will freeze the upload)
- `server/.env` (contains local secrets)
- `client/dist/` (build output)

### Step 3: Preparing Clean Files for Upload
On your Windows Desktop:
1. Open File Explorer to: `C:\Users\MUGDHA\OneDrive\Desktop\25070521235`
2. You will see:
   - `.gitignore` (file)
   - `README.md` (file)
   - `client/` (folder)
   - `server/` (folder)

### Step 4: Uploading via GitHub Web Interface
1. On your repository page, click the **"Add file"** dropdown button near the top right and select **"Upload files"**.
2. **First, upload root files:** Drag and drop `README.md` and `.gitignore`.
3. **Next, upload server files:**
   - In your File Explorer, open `server/`.
   - Select `server.js`, `seed.js`, `test-api.js`, `package.json`, `.env.example`, the `middleware/` folder, the `models/` folder, and the `routes/` folder.
   - Drag and drop them into the GitHub upload window.
   - *Ensure `node_modules` and `.env` are NOT selected.*
4. **Next, upload client files:**
   - In your File Explorer, open `client/`.
   - Select `index.html`, `vite.config.js`, `package.json`, `.env.example`, `eslint.config.js`, and the entire `src/` folder.
   - Drag and drop them into the GitHub upload window.
   - *Ensure `node_modules` and `dist` are NOT selected.*
5. In the commit message box at the bottom, enter:  
   `Complete CampusGig full-stack marketplace implementation (25070521235)`
6. Click the green **"Commit changes"** button.

Your repository will now have the full, working college project code ready for demonstration!
