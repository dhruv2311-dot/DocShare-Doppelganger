<div align="center">

<img src="https://img.shields.io/badge/DocShare-Secure%20Legal%20File%20Sharing-C9A227?style=for-the-badge&logo=shield&logoColor=white" alt="DocShare" />

# DocShare

### Secure Legal File Sharing & Audit Platform

**A production-grade MERN stack platform for law firms to upload, share, and audit confidential legal documents with role-based access control, expiring links, MFA authentication, and immutable audit trails.**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-File%20Storage-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com)

[🎬 Demo Video](#demo) · [📖 API Docs](#api-reference) · [🚀 Quick Start](#getting-started) · [🐛 Report Bug](https://github.com/ShubhamModi032006/DocShare-Doppelganger/issues)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Workflow](#workflow)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Role & Permission Matrix](#role--permission-matrix)
- [Demo](#demo)
- [License](#license)

---

## Overview

Legal professionals routinely share sensitive documents — contracts, case files, evidence records, and client agreements — over email and generic cloud tools that offer no access control, no audit trail, and no expiry enforcement.

**DocShare** solves this by providing:

- Cryptographically unique, expiring share links
- Per-link permission controls (view / download / comment)
- Optional recipient lock — a link can be restricted to a single verified email
- A complete, tamper-evident audit log of every file event
- Multi-factor authentication (OTP via email) for every login
- Role-based access so Admins, Partners, and Clients each see only what they should

---

## Features

| Feature | Description |
|---|---|
| 🔐 **JWT + MFA Auth** | Email/password login followed by OTP verification on every session |
| 👥 **RBAC** | Three roles: Administrator, Partner (Lawyer), Client with enforced boundaries |
| 📤 **Secure Upload** | PDF, DOCX, DOC, PNG, JPG — stored on Cloudinary with metadata in MongoDB |
| 🔗 **Expiring Links** | Links expire after 1h / 24h / 7d or a custom date; can be revoked instantly |
| 📧 **Recipient Lock** | Optionally restrict a link to a specific client email — others get an email-gate screen |
| 👁️ **Permission Levels** | View-only, Download, or Comment per link |
| 📋 **Audit Logs** | Every upload, access, download, and revocation is logged with IP and timestamp |
| 📁 **Client Dashboard** | Clients see all files shared with them under "Shared with Me" |
| 🛡️ **Rate Limiting** | Auth endpoints and upload endpoint are rate-limited to prevent abuse |
| 🔄 **Admin Panel** | Manage all users, update status (active/inactive), delete files, review audit logs |

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JSON Web Token (JWT) | Stateless session management (30-day expiry) |
| bcrypt | Password hashing |
| Nodemailer + Gmail SMTP | OTP email delivery |
| Cloudinary | Cloud file storage |
| Multer | Multipart file upload parsing |
| express-rate-limit | Route-level rate limiting |

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite | UI framework & build tool |
| React Router v7 | Client-side routing |
| Axios | HTTP client with JWT interceptor |
| Tailwind CSS v4 | Utility-first styling |
| Framer Motion | Page & component animations |
| React Dropzone | Drag-and-drop file upload |
| Lucide React | Icon library |
| React Hot Toast | Toast notifications |

---

## Folder Structure

```
DocShare-Doppelganger/
│
├── Docshare-Backend/                  # Node.js / Express REST API
│   ├── server.js                      # App entry point, CORS, route mounting
│   ├── package.json
│   ├── .env                           # Environment variables (see below)
│   │
│   ├── config/
│   │   ├── cloudinary.js              # Cloudinary SDK configuration
│   │   ├── db.js                      # MongoDB Atlas connection
│   │   └── mailer.js                  # Nodemailer SMTP transporter
│   │
│   ├── controllers/
│   │   ├── authController.js          # Register, login, OTP verify
│   │   ├── fileController.js          # Upload, list, delete files
│   │   ├── shareController.js         # Create/revoke links, shared-with-me
│   │   └── adminController.js         # User management, audit logs
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js          # JWT protect middleware
│   │   ├── roleMiddleware.js          # Role-based authorization
│   │   ├── uploadMiddleware.js        # Multer config (memory storage)
│   │   └── rateLimiter.js             # Auth & upload rate limits
│   │
│   ├── models/
│   │   ├── User.js                    # User schema
│   │   ├── File.js                    # File metadata schema
│   │   ├── SharedLink.js              # Secure link schema (+ recipientEmail)
│   │   ├── AuditLog.js                # Audit event schema
│   │   └── Comment.js                 # Comment schema
│   │
│   ├── routes/
│   │   ├── authRoutes.js              # /auth
│   │   ├── fileRoutes.js              # /files
│   │   ├── shareRoutes.js             # /share
│   │   └── adminRoutes.js             # /admin
│   │
│   └── utils/
│       ├── auditLogger.js             # Centralized audit log writer
│       ├── generateToken.js           # JWT sign helper
│       └── otpGenerator.js            # 6-digit OTP generator
│
└── Docshare-frontend/                 # React 19 + Vite SPA
    ├── index.html
    ├── vite.config.js
    ├── .env                           # VITE_API_URL
    │
    └── src/
        ├── main.jsx                   # React entry point
        ├── App.jsx                    # Router setup
        │
        ├── context/
        │   ├── AuthContext.jsx        # Auth state, login/logout/MFA flow
        │   └── AppContext.jsx         # Files, links, sharedWithMe, audit data
        │
        ├── components/
        │   ├── layout/
        │   │   ├── Layout.jsx         # Sidebar + main layout wrapper
        │   │   └── ProtectedRoute.jsx # JWT-guarded route component
        │   └── ui/
        │       └── UIComponents.jsx   # Shared: Button, Card, Badge, etc.
        │
        ├── pages/
        │   ├── LandingPage.jsx        # Public landing page
        │   ├── LoginPage.jsx          # Login + OTP verification
        │   ├── RegisterPage.jsx       # User registration
        │   ├── DashboardPage.jsx      # Role-aware dashboard
        │   ├── UploadPage.jsx         # Upload + link generation (3-step)
        │   ├── FilesPage.jsx          # File management / shared-with-me
        │   ├── LinksPage.jsx          # Manage share links
        │   ├── SharedFilePage.jsx     # Public secure file access page
        │   ├── AdminPanel.jsx         # User & file administration
        │   ├── AuditLogPage.jsx       # Audit trail viewer
        │   └── SettingsPage.jsx       # Account settings, MFA status
        │
        ├── utils/
        │   └── api.js                 # Axios instance with JWT interceptor
        │
        └── data/
            └── mockData.js            # Utility functions (formatDate, etc.)
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)
- Gmail account with an [App Password](https://myaccount.google.com/apppasswords) enabled

### 1. Clone the repository

```bash
git clone https://github.com/ShubhamModi032006/DocShare-Doppelganger.git
cd DocShare-Doppelganger
```

### 2. Backend setup

```bash
cd Docshare-Backend
npm install
```

Create a `.env` file (see [Environment Variables](#environment-variables) below), then:

```bash
npm run dev       # development with nodemon
# or
npm start         # production
```

The API server starts on `http://localhost:4000`.

### 3. Frontend setup

```bash
cd ../Docshare-frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:4000
```

Then:

```bash
npm run dev
```

The frontend starts on `http://localhost:5173`.

---

## Environment Variables

### `Docshare-Backend/.env`

```env
# Server
PORT=4000
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/docshare

# JWT
JWT_SECRET=your_jwt_secret_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail App Password required if 2FA is enabled)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password
```

### `Docshare-frontend/.env`

```env
VITE_API_URL=http://localhost:4000
```

---

## Workflow

### Authentication Flow

```
User submits email + password
        │
        ▼
POST /auth/login
 ↳ Validates credentials
 ↳ Generates 6-digit OTP
 ↳ Sends OTP to user's email
        │
        ▼
User enters OTP
        │
        ▼
POST /auth/verify-otp
 ↳ Validates OTP
 ↳ Sets mfaEnabled = true
 ↳ Returns JWT token + user object
        │
        ▼
JWT stored in localStorage
All subsequent requests → Authorization: Bearer <token>
```

### File Share Workflow

```
Partner uploads file (POST /files/upload)
        │
        ▼
File stored on Cloudinary
Metadata saved in MongoDB (File document)
        │
        ▼
Partner creates share link (POST /share/create-link)
 ↳ Sets permission: view | download | comment
 ↳ Sets expiry: 1h | 24h | 7d | custom date
 ↳ Optionally sets recipientEmail (locks link to one email)
        │
        ▼
Unique token generated → SharedLink document saved
Share URL: /shared/:token
        │
        ▼
Recipient opens link (GET /share/token/:token)
 ↳ If recipientEmail set → email-gate screen shown
 ↳ Visitor enters email → re-fetches with ?email=
 ↳ Wrong email → access denied
 ↳ Correct email → document loaded
 ↳ View count incremented, action logged to AuditLog
        │
        ▼
Client logs in → GET /share/shared-with-me
 ↳ All active links with their email appear in dashboard
```

---

## API Reference

**Base URL:** `http://localhost:4000`  
**Auth:** All protected routes require `Authorization: Bearer <token>` header.

---

### Auth — `/auth`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/auth/register` | ❌ | Any | Register a new user |
| `POST` | `/auth/login` | ❌ | Any | Login and trigger OTP email |
| `POST` | `/auth/verify-otp` | ❌ | Any | Verify OTP and receive JWT |

#### `POST /auth/register`
```json
// Request body
{
  "name": "John Doe",
  "email": "john@lawfirm.com",
  "password": "SecurePass123",
  "role": "Partner"
}

// Response 201
{
  "message": "User registered successfully"
}
```

#### `POST /auth/login`
```json
// Request body
{ "email": "john@lawfirm.com", "password": "SecurePass123" }

// Response 200
{ "message": "OTP sent to your email" }
```

#### `POST /auth/verify-otp`
```json
// Request body
{ "email": "john@lawfirm.com", "otp": "482910" }

// Response 200
{
  "token": "<jwt>",
  "user": { "id": "...", "name": "John Doe", "email": "...", "role": "Partner", "mfaEnabled": true }
}
```

---

### Files — `/files`

All routes require authentication.

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/files/upload` | ✅ | Admin, Partner | Upload a file |
| `GET` | `/files/my-files` | ✅ | All | Get own uploaded files |
| `GET` | `/files/all` | ✅ | Admin only | Get all files in system |
| `DELETE` | `/files/:id` | ✅ | Admin, Partner (owner) | Delete a file |

#### `POST /files/upload`
```
Content-Type: multipart/form-data

Fields:
  file  — Binary file (PDF, DOC, DOCX, PNG, JPG — max 50 MB)
  tags  — JSON string array, e.g. '["PDF","Contract"]'

Response 201: File metadata object
```

---

### Share Links — `/share`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `GET` | `/share/token/:token` | ❌ | Public | Access a shared file by token |
| `GET` | `/share/my-links` | ✅ | All | Get links created by the user |
| `GET` | `/share/shared-with-me` | ✅ | All | Get files shared to logged-in user's email |
| `POST` | `/share/create-link` | ✅ | Admin, Partner | Generate a new share link |
| `PUT` | `/share/:id/revoke` | ✅ | Admin, Partner | Revoke an active link |

#### `POST /share/create-link`
```json
// Request body
{
  "fileId": "64abc...",
  "permission": "download",
  "expiresAt": "2026-03-15T00:00:00.000Z",
  "recipientEmail": "client@example.com"
}

// Response 201
{
  "id": "...",
  "token": "...",
  "url": "http://localhost:5173/shared/<token>",
  "permission": "download",
  "expiresAt": "...",
  "recipientEmail": "client@example.com",
  "status": "active"
}
```

#### `GET /share/token/:token`
- If `recipientEmail` is set and no `?email=` query provided → `401 { requiresEmail: true, fileName }`
- If wrong email → `403 Access denied`
- If expired/revoked → `403 Secure link expired`
- If valid → `200 { link, file }`

---

### Admin — `/admin`

All routes require `Administrator` role.

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `GET` | `/admin/users` | ✅ | Admin | List all users |
| `GET` | `/admin/audit-logs` | ✅ | Admin | List all audit log entries |
| `PUT` | `/admin/users/:id/status` | ✅ | Admin | Update user status (active/inactive) |

#### `PUT /admin/users/:id/status`
```json
// Request body
{ "status": "inactive" }

// Response 200
{ "message": "User status updated successfully" }
```

---

## Database Schema

### User
```js
{
  name:       String (required),
  email:      String (required, unique),
  password:   String (bcrypt hashed),
  role:       "Administrator" | "Partner" | "Client",
  mfaEnabled: Boolean,
  otpSecret:  String,
  status:     "active" | "inactive",
  joinedAt:   Date,
  filesCount: Number
}
```

### File
```js
{
  fileName:           String,
  fileUrl:            String (Cloudinary URL),
  cloudinaryPublicId: String,
  owner:              ObjectId → User,
  uploadDate:         Date,
  size:               Number (bytes),
  type:               String (extension),
  tags:               [String],
  status:             "active" | "archived",
  sharedWith:         [ObjectId → User]
}
```

### SharedLink
```js
{
  fileId:         ObjectId → File,
  fileName:       String,
  token:          String (32-byte hex, unique),
  url:            String (full share URL),
  permission:     "view" | "download" | "comment",
  expiresAt:      Date,
  createdBy:      ObjectId → User,
  status:         "active" | "expired" | "revoked",
  views:          Number,
  password:       String (optional),
  recipientEmail: String (optional — locks link to one email)
}
```

### AuditLog
```js
{
  user:      String,
  fileId:    ObjectId → File,
  fileName:  String,
  action:    String,
  ip:        String,
  timestamp: Date
}
```

---

## Role & Permission Matrix

| Action | Administrator | Partner | Client |
|--------|:---:|:---:|:---:|
| Register / Login | ✅ | ✅ | ✅ |
| Upload files | ✅ | ✅ | ❌ |
| View own files | ✅ | ✅ | ❌ |
| View all files | ✅ | ❌ | ❌ |
| Delete own files | ✅ | ✅ | ❌ |
| Delete any file | ✅ | ❌ | ❌ |
| Create share links | ✅ | ✅ | ❌ |
| Revoke share links | ✅ | ✅ (own) | ❌ |
| View shared-with-me | ✅ | ✅ | ✅ |
| View audit logs | ✅ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ |

---

## Demo

> 🎬 **[Watch Demo Video](#)**  
> *(Add your demo video link here — YouTube / Loom / Google Drive)*

### Screenshots

| Page | Description |
|------|-------------|
| Landing Page | Public marketing page with feature highlights |
| Dashboard | Role-aware overview — files, links, activity |
| Upload Page | 3-step upload → configure permissions → generate link |
| Shared File | Email-gate verification + secure file viewer |
| Admin Panel | User management, status control, file overview |
| Audit Log | Complete activity trail with timestamps and IPs |

---

## License

```
MIT License

Copyright (c) 2026 Shubham Modi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">
  <p>Built with ❤️ for the legal community</p>
  <p>
    <a href="https://github.com/ShubhamModi032006/DocShare-Doppelganger">GitHub</a> ·
    <a href="https://github.com/ShubhamModi032006/DocShare-Doppelganger/issues">Issues</a> ·
    <a href="#demo">Demo</a>
  </p>
</div>
