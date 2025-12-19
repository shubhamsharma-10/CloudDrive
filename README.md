# CloudDrive - Google Drive Clone

A full-stack cloud storage application with file upload, download, sharing, and Google OAuth authentication.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## ✨ Features

- **User Authentication**
  - Email/Password registration & login
  - Google OAuth 2.0 integration
  - JWT-based session management

- **File Management**
  - Upload files to AWS S3
  - Download files via signed URLs
  - Rename and delete files
  - Search files by name

- **File Sharing**
  - Generate shareable public links
  - Revoke shared access anytime
  - Public file access without login

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Shadcn UI |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB (Mongoose ODM) |
| Storage | AWS S3 |
| Auth | JWT, Passport.js (Google OAuth) |

## 📁 Project Structure

```
google-drive/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration (DB, S3, Passport)
│   │   ├── controllers/    # Route handlers
│   │   ├── middlewares/    # Auth middleware
│   │   ├── model/          # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   └── index.ts        # Express app
│   ├── .env                # Environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/            # API client functions
    │   ├── components/     # UI components (Shadcn)
    │   ├── context/        # Auth context
    │   ├── page/           # Page components
    │   └── App.tsx         # Main app with routing
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- AWS Account with S3 bucket
- Google Cloud Console project (for OAuth)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd google-drive
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
# Server
PORT=3000

# Database
MONGODB_URL=mongodb://localhost:27017/google_drive

# JWT
JWT_SECRET=your-jwt-secret-key

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-secret

# Session
SESSION_SECRET=your-session-secret

# Frontend URL (for OAuth redirect)
CLIENT_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Run the Application

**Start Backend:**
```bash
cd backend
npm run dev
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

**Access the app at:** `http://localhost:5173`

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth Client ID**
5. Add authorized redirect URI:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
6. Copy Client ID and Secret to `.env`

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/google` | Google OAuth login |
| GET | `/api/auth/google/callback` | OAuth callback |

### Files
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/files` | Get all user files |
| POST | `/api/files/upload` | Upload a file |
| GET | `/api/files/search?query=` | Search files |
| PUT | `/api/files/:id/rename` | Rename file |
| DELETE | `/api/files/:id` | Delete file |
| GET | `/api/files/:id/download` | Get download URL |
| POST | `/api/files/:id/share` | Enable sharing |
| POST | `/api/files/:id/unshare` | Disable sharing |
| GET | `/api/files/shared/:token` | Get shared file |

## 🧪 Testing the Application

1. **Register/Login** with email or Google
2. **Upload** a file using drag-and-drop or click
3. **Search** files using the search bar
4. **Rename** a file from the dropdown menu
5. **Share** a file and copy the public link
6. **Access** shared file (works without login)
7. **Download** files directly
8. **Delete** files from the dropdown menu

## 📝 License

MIT License

## 👤 Author

Shubham Sharma
