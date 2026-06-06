# FAQ Portal — Vicharanashala Internship

A full-stack FAQ and community Q&A platform with AI-powered duplicate detection, role-based access, and gamification.

Built with React 18, Node.js, Express, MongoDB (Mongoose 9.x), and Groq AI (LLaMA). Features fuzzy search, voice search, JWT auth (httpOnly cookies), dark/light themes, and an admin moderation panel.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Features](#features)
- [Data Models](#data-models)
- [API Endpoints](#api-endpoints)
- [Frontend Routes](#frontend-routes)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React (Create React App) | ^18.2.0 |
| Routing | React Router | ^7.15.1 |
| Fuzzy Search | Fuse.js | ^7.4.1 |
| Backend | Node.js / Express | ^4.18.2 |
| Database | MongoDB (Mongoose ODM) | ^9.6.2 |
| Auth | JWT (jsonwebtoken + bcrypt) | httpOnly cookies |
| AI | Groq SDK (llama-3.3-70b-versatile) | ^1.2.0 |
| Styling | CSS Custom Properties (dark/light theme) | — |

---

## Architecture

```
Browser ──fetch/credentials:include──> Express API (port 5000)
                                          │
                                    Mongoose ODM
                                          │
                                    MongoDB Atlas
                                          │
                                    Groq AI API
```

- **Auth:** JWT stored in httpOnly cookie (`token`), verified on each request by `middleware/auth.js`. Admin routes additionally checked by `middleware/admin.js`.
- **Caching:** FAQ listing cached in-memory (5 min TTL). Search results cached (1 min TTL, max 500 entries, LRU eviction).
- **State:** React Context for auth (`AuthContext`) and theme (`ThemeContext`). No WebSocket — notification badge updates on mount and after relevant actions.

---

## Project Structure

```
FAQ/
├── frontend/                          # React SPA (port 3000)
│   └── src/
│       ├── index.js                   # Entry point
│       ├── App.js                     # Router setup
│       ├── App.css / index.css        # Global styles, CSS variables
│       ├── components/
│       │   ├── Navbar.js              # Top nav with hamburger menu
│       │   ├── HomePage.js            # Landing: search, categories, trending
│       │   ├── FAQPage.js             # FAQ browser with fuzzy search
│       │   ├── FAQItem.js             # Accordion Q&A with view tracking
│       │   ├── AutocorrectInput.js    # Search input with suggestion dropdown
│       │   ├── CategoryTabs.js        # Category filter pills
│       │   ├── ProtectedRoute.jsx     # Auth gate component
│       │   ├── NotificationBell.js    # Unread count badge
│       │   └── ThemeToggle.js         # Lamp-style dark/light switch
│       ├── pages/
│       │   ├── WelcomePage.jsx        # Entrance landing page
│       │   ├── AuthPage.jsx           # Login / register with password toggle
│       │   ├── OAQPage.js             # Community Q&A, voting, answers
│       │   ├── DashboardPage.js       # User stats, my questions, trending
│       │   ├── AdminPage.js           # Moderation: OAQs, reports, AI checks
│       │   └── LeaderboardPage.js     # Top contributors ranking
│       └── context/
│           ├── AuthContext.js          # User state, login, logout
│           └── ThemeContext.js         # Theme preference persistence
│
├── backend/                           # Express API (port 5000)
│   ├── server.js                      # Entry: routes, cache, DB connect
│   ├── routes/
│   │   ├── auth.js                    # Register, login, logout, theme
│   │   ├── oaq.js                     # Community Q&A CRUD, voting, AI
│   │   ├── notifications.js           # Notifications fetch & mark-read
│   │   ├── reports.js                 # Report submission + admin moderation
│   │   └── ai.js                      # AI summarization & relevance check
│   ├── models/
│   │   ├── User.js                    # name, email, password, role, points
│   │   ├── OAQ.js                     # Community question with answers
│   │   ├── FAQ.js                     # Category with embedded questions
│   │   ├── Notification.js            # User notifications
│   │   └── Report.js                  # Content reports
│   ├── middleware/
│   │   ├── auth.js                    # JWT verification
│   │   └── admin.js                   # Admin role gate
│   └── scripts/
│       ├── seed.js                    # Initial FAQ seed data
│       ├── finalSeed.js               # Extended FAQ seed
│       ├── create-admin.js            # CLI admin user creation
│       └── migrate-to-atlas.js        # Migration helper
│
└── README.md
```

---

## Features

### 🔍 Smart Search

| Feature | Implementation |
|---------|---------------|
| **Fuzzy search** | Fuse.js client-side with typo tolerance (threshold 0.45, weighted fields). "nic" matches "NOC". |
| **Autocomplete** | Debounced `/api/search/suggest` with keyboard navigation (Arrow keys, Enter, Escape). |
| **Voice search** | Web Speech API (`SpeechRecognition`) — microphone button shown when supported. |
| **Full-text search** | MongoDB `$text` indexes on FAQ (`questions.q`, `questions.a`) and OAQ (`question`) with regex fallback. |
| **Unified search** | `/api/search/all` — combines FAQ + OAQ results in a single response. |

### 📚 FAQ Management

- **Category cards** — Grouped by category (About, Selection, NOC, Timing, ...) sorted by priority.
- **Accordion expand** — Single open per category; smooth CSS transition animation.
- **View tracking** — `POST /api/faqs/:catId/questions/:qId/view` — per-user dedup (`viewedBy` array, capped at 100). Falls back to anonymous increment for guests. Server response used to update displayed count.
- **Question sorting** — Within each category, sorted by `views` descending.

### 💬 Community Q&A (OAQ)

- **Submit questions** — With AI duplicate detection: up to 120 existing questions checked via Groq LLaMA. If duplicate found, returns 409 with link to existing question.
- **Voting** — Upvote/downvote on both questions and answers. Net ≥10 upvotes triggers auto-promote.
- **Status workflow** — Open → Approved / Rejected (by admin) → Promoted to FAQ.
- **View tracking** — Same pattern as FAQ: `POST /api/oaq/:id/view`, deduplicated per user.
- **Answers** — Users cannot answer their own question. Accepted answers earn +25 points.

### 🤖 AI Features

| Feature | Endpoint / Trigger | Description |
|---------|-------------------|-------------|
| Duplicate detection | On OAQ submit | Checks 120 relevant existing questions via Groq. Returns 409 + link if match found. |
| Importance scoring | On OAQ submit + batch startup | Scores 0–100 based on specificity, effort, usefulness, clarity. |
| Auto-promote (similar) | On OAQ submit | Finds answered open questions with similar wording; promotes matching Q&A to FAQ. |
| Auto-promote (vote) | At net ≥10 upvotes | Automatically promotes to FAQ, awards submitter 50 points. |
| Summarization | `POST /api/ai/summarize/:oaqId` (admin) | Summarises all answers, picks best fit. |
| Relevance check | `POST /api/ai/check-question/:oaqId` (admin) | Checks if question is on-topic. Auto-creates report if flagged. |
| Related questions | `GET /api/ai/related?q=` | Real-time keyword-matched FAQ/OAQ as user types. |

### 🏆 Gamification

| Action | Points |
|--------|--------|
| Ask a question | +5 |
| Answer a question | +10 |
| Receive an upvote | +3 |
| Receive a downvote | −2 |
| Answer accepted | +25 |
| Q&A promoted to FAQ | +50 |

Leaderboard sorted by total points with pagination (10 per page).

### 🎨 Theming

- **Dark/Light mode** — CSS custom properties (`data-theme="light"` / `data-theme="dark"`). Lamp-toggle UI.
- **Persistence** — Saved to `localStorage` and synced to server via `PUT /api/auth/theme`.
- **Responsive** — Mobile-first (hamburger nav ≤768px). Grid and stacked layouts at 768px, 640px, 480px breakpoints.

### 🔐 Authentication & Authorization

- **JWT in httpOnly cookie** — `token` cookie set server-side on login/register.
- **Role-based** — `student` / `admin`. Admin routes guarded by `middleware/admin.js`.
- **Protected routes** — `/home`, `/dashboard`, `/community`, `/leaderboard` require login. `/admin` requires admin role.
- **Unified auth page** — `/auth` with tab-based sign in / create account. `/login` and `/register` redirect with `?tab=` query param.
- **Password toggle** — Eye icon show/hide on all password fields.
- **Logout** — Clears JWT cookie and redirects to welcome page.

### 🔔 Notifications

- **Types:** `answer`, `promoted`, `accepted`, `approved`, `related`, `follow_up`, `system`.
- **Triggers:** Question answered, QA promoted, answer accepted, question approved, duplicate found.
- **UI:** Bell icon with unread count badge. Mark single or mark all as read.

### 📋 Admin Panel

- **OAQ management** — Approve, reject, promote questions. Edit answers. Toggle accept.
- **Reports** — View pending reports with reason. Resolve, dismiss, or delete reported content.
- **AI tools** — Summarize answers, check question relevance, verify by admin.
- **Dashboard** — Recent OAQs with answer counts, AI-powered analysis.

### 📊 Dashboard & Leaderboard

- **Dashboard:** User's questions, trending OAQs, points summary, activity stats.
- **Leaderboard:** Top contributors sorted by points, enriched with counts (questions asked, answers given, accepted, promoted). Paginated.

---

## Data Models

### User (`users` collection)

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | required |
| `email` | String | unique, lowercase, required |
| `password` | String | bcrypt hashed |
| `role` | String | `student` or `admin`, default `student` |
| `theme` | String | `light` or `dark` |
| `points` | Number | default 0 |

### FAQ (`faqs` collection)

| Field | Type | Notes |
|-------|------|-------|
| `category` | String | e.g. "About", "Selection" |
| `icon` | String | emoji icon |
| `questions` | [Question] | embedded sub-documents |
| — `q` | String | question text |
| — `a` | String | answer text |
| — `source` | String | `official` or `community` |
| — `resolved` | Boolean | default `true` |
| — `views` | Number | view count |
| — `viewedBy` | [ObjectId] | user IDs who viewed (capped ~100) |

### OAQ (`oaqs` collection)

| Field | Type | Notes |
|-------|------|-------|
| `question` | String | required |
| `description` | String | |
| `category` | String | |
| `submittedBy` | ObjectId (ref User) | question author |
| `status` | String | `open` / `approved` / `promoted` / `rejected` |
| `views` | Number | |
| `viewedBy` | [ObjectId] | |
| `votedUpBy` | [ObjectId] | |
| `votedDownBy` | [ObjectId] | |
| `answers` | [Answer] | embedded sub-docs with voting, accept, admin-verify |
| `promotedCount` | Number | |
| `importanceScore` | Number | AI-assigned 0–100 |

### Notification (`notifications` collection)

| Field | Type | Notes |
|-------|------|-------|
| `user` | ObjectId (ref User) | recipient |
| `type` | String | answer / promoted / accepted / approved / related / follow_up / system |
| `message` | String | |
| `link` | String | URL to navigate to |
| `read` | Boolean | default `false` |

### Report (`reports` collection)

| Field | Type | Notes |
|-------|------|-------|
| `reportedBy` | ObjectId (ref User) | |
| `targetType` | String | `question` or `answer` |
| `targetId` | ObjectId | |
| `oaqId` | ObjectId | parent OAQ |
| `reason` | String | free text |
| `status` | String | `pending` / `resolved` / `dismissed` |
| `resolvedBy` | ObjectId (ref User) | admin who resolved |
| `resolvedAt` | Date | |

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register (name, email, password). Sets JWT cookie. |
| POST | `/api/auth/login` | — | Login (email, password). Sets JWT cookie. |
| POST | `/api/auth/logout` | — | Clears JWT cookie. |
| GET | `/api/auth/me` | auth | Returns current user. |
| PUT | `/api/auth/theme` | auth | Update theme preference (`light`/`dark`). |

### FAQ & Search

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/faqs` | — | All FAQ categories with questions (cached 5 min). |
| GET | `/api/faqs/search?q=` | — | FAQ full-text search (min 3 chars, cached 1 min). |
| POST | `/api/faqs/:catId/questions/:qId/view` | — | Record FAQ question view (dedup by userId). |
| GET | `/api/search/all?q=` | — | Unified FAQ + OAQ full-text search. |
| GET | `/api/search/suggest?q=` | — | Search suggestions (min 2 chars). |
| GET | `/api/home` | — | Homepage data (categories, trending, latest). |

### Community Q&A (`/api/oaq`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/oaq` | — | List OAQs (`?status=`, `?hasAnswers=` filters). |
| GET | `/api/oaq/:id` | — | Get single OAQ (read-only, no view increment). |
| POST | `/api/oaq` | auth | Submit question (runs AI duplicate check). |
| POST | `/api/oaq/:id/view` | — | Record OAQ view (dedup by userId). |
| POST | `/api/oaq/:id/vote` | auth | Vote (`value: 1` or `-1`). Auto-promotes at ≥10. |
| POST | `/api/oaq/:id/answers` | auth | Submit answer (cannot answer own question). |
| POST | `/api/oaq/:id/answers/:answerId/vote` | auth | Vote on an answer. |
| PUT | `/api/oaq/:id/approve` | admin | Approve question. |
| PUT | `/api/oaq/:id/reject` | admin | Reject question. |
| PUT | `/api/oaq/:id/promote` | admin | Promote to FAQ (+50 points). |
| PUT | `/api/oaq/:id/answers/:answerId` | admin | Edit answer. |
| PUT | `/api/oaq/:id/answers/:answerId/accept` | admin | Toggle accept (+25 points). |

### AI

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/ai/summarize/:oaqId` | admin | AI summarises answers for a question. |
| POST | `/api/ai/check-question/:oaqId` | admin | AI checks if question is on-topic. |
| POST | `/api/ai/check-duplicate` | — | AI checks question text against existing content. |
| GET | `/api/ai/related?q=` | — | Related questions (keyword-matched FAQ/OAQ). |

### Dashboard & Leaderboard

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/dashboard` | auth | User stats, trending, my questions. |
| GET | `/api/leaderboard` | — | Top contributors (sorted by points, paginated). |

### Reports (`/api/reports`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/reports` | auth | Submit a report. |
| GET | `/api/reports` | admin | List reports (`?status=` filter). |
| PUT | `/api/reports/:id/resolve` | admin | Resolve or dismiss. |
| DELETE | `/api/reports/:id/content` | admin | Delete reported content. |

### Notifications (`/api/notifications`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/notifications` | auth | User notifications (latest 20) + unread count. |
| PUT | `/api/notifications/:id/read` | auth | Mark single as read. |
| PUT | `/api/notifications/read-all` | auth | Mark all as read. |

---

## Frontend Routes

| Path | Component | Access | Description |
|------|-----------|--------|-------------|
| `/` | `WelcomePage` | Public | Entrance page with guest/auth options. |
| `/auth` | `AuthPage` | Public | Sign in / Create account (controlled by `?tab=`). |
| `/login` | → `/auth?tab=signin` | Public | Legacy redirect. |
| `/register` | → `/auth?tab=signup` | Public | Legacy redirect. |
| `/faq` | `FAQPage` | Public | FAQ browsing with fuzzy search. |
| `/home` | `HomePage` | Student | Dashboard with search, categories, trending. |
| `/dashboard` | `DashboardPage` | Student | Personal stats and activity. |
| `/community` | `OAQPage` | Student | Community Q&A. |
| `/leaderboard` | `LeaderboardPage` | Student | Top contributors. |
| `/admin` | `AdminPage` | Admin | Moderation panel. |

---

## Getting Started

```bash
# 1. Clone and install backend
cd backend
npm install

# 2. Install frontend
cd ../frontend
npm install

# 3. Configure environment
#    Create backend/.env (see below)

# 4. Backend (port 5000)
cd ../backend
npm start

# 5. Frontend (port 3000, proxies API to 5000)
cd ../frontend
npm start
```

---

## Environment Variables

Create `backend/.env`:

```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/faq
JWT_SECRET=your-secret-key-change-in-production
GROQ_API_KEY=gsk_...                     # Required for AI features
PORT=5000                                 # Optional, default 5000
```

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `MONGO_URI` | Yes | — | MongoDB connection string. App exits if missing. |
| `JWT_SECRET` | Yes | `faq-app-secret-change-in-production` | Secret for signing JWT tokens. |
| `GROQ_API_KEY` | No* | — | Groq AI API key (duplicate detection, scoring, summarization, relevance checks). |
| `PORT` | No | `5000` | Express server port. |

*AI features (duplicate detection, importance scoring, summarization, relevance checking) are disabled when `GROQ_API_KEY` is not set.

---

## Scripts

| Script | Location | Description |
|--------|----------|-------------|
| `npm start` | `backend/` | Start Express server. |
| `npm start` | `frontend/` | Start React dev server (proxied to port 5000). |
| `node scripts/seed.js` | `backend/` | Seed initial FAQ data. |
| `node scripts/finalSeed.js` | `backend/` | Extended FAQ seed with more categories. |
| `node scripts/create-admin.js` | `backend/` | CLI tool to create an admin user. |
| `node scripts/migrate-to-atlas.js` | `backend/` | Migrate local data to MongoDB Atlas. |

---

## Deployment Notes

- **Frontend:** Build with `npm run build` (produces `frontend/build/`). Serve the static files from the backend or deploy to Vercel/Netlify.
- **Backend:** Deploy to Railway, Render, or any Node.js host. Set all environment variables in the hosting dashboard.
- **MongoDB:** Use MongoDB Atlas (shared cluster is sufficient). Whitelist deployment IP.
- **CORS:** Configured with `{ origin: true, credentials: true }` — update for production domain.
- **JWT:** Change `JWT_SECRET` to a strong random value in production.
- **AI:** A valid `GROQ_API_KEY` is needed for all AI features. Without it, duplicate detection, scoring, summarization, and relevance checks are skipped.
