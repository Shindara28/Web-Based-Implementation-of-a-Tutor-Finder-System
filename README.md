# Shindara — Web-Based Tutor Finder System

A prototype web application for matching students with qualified tutors. Built as a three-tier MVC system following the OOADM methodology described in the project report (Chapter Three).

---

## Architecture

| Tier | Technology |
|------|-----------|
| Presentation | React 18, Tailwind CSS, React Router v6 |
| Application | Python 3, Flask 3, JWT (PyJWT), bcrypt |
| Data | SQLite via Python's built-in `sqlite3` module |

---

## Project Structure

```
tutor/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/
│       ├── context/    # AuthContext (JWT state)
│       ├── pages/
│       └── utils/api.js
├── server/          # Flask backend
│   ├── db/
│   │   ├── database.py  # schema + connection management
│   │   └── seed.py      # demo data
│   ├── middleware/
│   │   └── auth.py      # JWT authenticate + RBAC authorize decorators
│   ├── models/          # SQLite query functions (parameterised)
│   ├── routes/          # Flask Blueprints (auth, profiles, search, bookings, reviews, admin)
│   ├── uploads/         # Uploaded credential files
│   ├── app.py           # Flask app factory
│   ├── config.py        # JWT config, TrustScore weights, upload limits
│   ├── requirements.txt
│   └── run.py           # Entry point
└── README.md
```

---

## Setup Instructions

### Prerequisites

- Python 3.10+ (tested on Python 3.13)
- Node.js 18+ (tested on Node 24)
- pip

---

### 1. Install Python dependencies

```bash
cd tutor/server
pip install -r requirements.txt
```

### 2. Seed the database

```bash
cd tutor/server
py db/seed.py        # Windows
# or
python3 db/seed.py   # Mac/Linux
```

This creates `server/db/tutor_finder.sqlite` with demo account:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tutor.com | admin123 |
| Student | alice@student.com | student123 |
| Tutor | carol@tutor.com | tutor123 |

### 3. Start the Flask server

```bash
cd tutor/server
py run.py            # Windows
# or
python3 run.py       # Mac/Linux
```

Server runs on **http://localhost:5000**

### 4. Install and start the React client

```bash
cd tutor/client
npm install
npm run dev
```

Client runs on **http://localhost:5173**

Open http://localhost:5173 in your browser.

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | — | Register (Student or Tutor) |
| POST | /api/auth/login | — | Login (returns HTTP-only cookie) |
| POST | /api/auth/logout | — | Clear token cookie |
| GET | /api/auth/me | Any | Current user info |
| GET | /api/profiles/:id | — | View tutor profile |
| GET | /api/profiles/me | Tutor | Own profile |
| PUT | /api/profiles/ | Tutor | Update profile |
| POST | /api/profiles/credentials | Tutor | Upload credential (PDF/JPEG) |
| GET | /api/search?subject=&maxRate=&location= | — | Three-stage tutor search |
| POST | /api/bookings | Student | Request a session |
| GET | /api/bookings | Student/Tutor | List own bookings |
| PATCH | /api/bookings/:id/status | Student/Tutor | Update booking status |
| POST | /api/reviews | Student | Submit review (Completed sessions only) |
| GET | /api/reviews/tutor/:id | — | Reviews for a tutor |
| GET | /api/admin/pending-tutors | Admin | Tutor verification queue |
| PATCH | /api/admin/tutors/:id/verify | Admin | Approve or reject tutor |
| GET | /api/admin/reviews | Admin | All reviews |
| DELETE | /api/admin/reviews/:id | Admin | Remove a review |
| GET | /api/admin/metrics | Admin | Platform statistics |

---

## Three-Stage Search Algorithm (Section 3.13.1)

Implemented in `server/models/tutor_profile.py → search()`:

1. **Stage 1 — Subject filter:** exact case-insensitive match on `SubjectSpecialty`
2. **Stage 2 — Parameter constraints:** `HourlyRate <= maxRate` and `Location LIKE %location%`
3. **Stage 3 — TrustScore ranking:** `AvgRating * 0.7 + CompletedSessionCount * 0.3`

Weights are constants in `server/config.py` (`TRUST_RATING_WEIGHT`, `TRUST_BOOKING_WEIGHT`).

---

## Security

- Passwords hashed with bcrypt (10 rounds)
- JWT stored in HTTP-only, SameSite=Lax cookies (not localStorage)
- All SQL uses parameterised queries — no string concatenation
- User input sanitised server-side before storage
- RBAC enforced at the API layer via `@authorize` decorator
- File uploads restricted to PDF/JPEG, max 5 MB

---

## Schema Additions vs Chapter 3, Section 3.11

The following columns were added beyond the original MySQL schema to support implemented features:

| Table | Column | Reason |
|-------|--------|--------|
| Tutor_Profiles | Location TEXT | Stage 2 location filter (3.13.1) |
| Tutor_Profiles | CredentialFile TEXT | FR #2 credential upload |
| Reviews | StudentID INTEGER | Identify review author; FR #6 moderation |
| Reviews | IsModerated INTEGER | FR #6 admin moderation flag |
| Bookings, Reviews | CreatedAt TIMESTAMP | Audit trail |

---

## Out of Scope (Section 1.4)

- Real-time video conferencing
- Payment gateway / processing

---

## User Roles

| Role | Access |
|------|--------|
| Student | Search tutors, book sessions, leave reviews |
| Tutor | Manage profile, upload credentials, respond to bookings |
| Admin | Verify tutors, moderate reviews, view metrics |
