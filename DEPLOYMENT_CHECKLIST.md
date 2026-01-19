# Deployment Checklist - Tournament Draw Application

## ✅ Current Status: DEPLOYMENT READY (with minor configuration needed)

---

## 🔧 Current Configuration

### Backend (.env)
```dotenv
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_generated_secure_secret_key>
PORT=5000
```

### Frontend (.env)
```dotenv
VITE_API_URL=https://api.yourdomain.com
```

---

## ⚠️ ISSUES TO FIX BEFORE DEPLOYMENT

### 1. **Frontend API URL (CRITICAL)**
❌ **Current:** `http://localhost:5000/api` (development only)

**Fix Options:**

#### Option A: Use Environment-based URLs
Create `.env.production` in frontend:
```dotenv
VITE_API_URL=https://your-backend-domain.com/api
```

Then in `vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_URL)
  }
})
```

#### Option B: Use Relative URLs (RECOMMENDED for same domain)
Modify `src/api/api.js`:
```javascript
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? '/api'  // Same domain deployment
    : import.meta.env.VITE_API_URL  // Dev mode
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

#### Option C: Use Environment Variable (BEST for separate domains)
```javascript
// src/api/api.js
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return window.location.origin.includes('your-domain.com') 
      ? 'https://api.your-domain.com/api'
      : import.meta.env.VITE_API_URL;
  }
  return import.meta.env.VITE_API_URL;
};

const api = axios.create({
  baseURL: getBaseURL()
});
```

---

### 2. **Backend CORS Configuration (CRITICAL)**
⚠️ **Current:** `app.use(cors())` - allows all origins (security risk)

**Fix for production:**
```javascript
// server.js
const cors = require("cors");

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

**Update `.env` (backend):**
```dotenv
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_generated_secure_secret_key>
PORT=5000
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
NODE_ENV=production
```

---

### 3. **Sensitive Credentials (CRITICAL)**
❌ **JWT Secret is exposed** - Change immediately!
```
OLD: JWT_SECRET=supersecret
```

**Generate secure secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Update `.env` with secure value:**
```dotenv
JWT_SECRET=your_generated_secure_key_here
```

---

### 4. **MongoDB URI Security**
⚠️ **Credentials are in .env file** - May be exposed in repository

**Best practices:**
```bash
# 1. Make sure .env is in .gitignore
cat tournament-backend/.gitignore | grep .env

# 2. Remove .env from git history (if already committed)
git rm --cached .env
git commit -m "Remove .env from tracking"

# 3. Create .env.example for reference
# tournament-backend/.env.example:
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_secure_key_here
PORT=5000
ALLOWED_ORIGINS=https://yourdomain.com
NODE_ENV=production
```

---

## 📋 DEPLOYMENT STEPS

### Step 1: Update Backend Configuration
```bash
cd tournament-backend

# Update .env with production values
nano .env
# Set:
# - MONGO_URI (your production MongoDB)
# - JWT_SECRET (new secure key)
# - PORT (usually 5000 or 3001)
# - ALLOWED_ORIGINS (your frontend domain)
# - NODE_ENV=production

# Verify dependencies
npm install

# Test build
npm start
```

### Step 2: Update Frontend Configuration
```bash
cd tournament-frontend

# Create production environment
cat > .env.production << EOF
VITE_API_URL=https://your-backend-url/api
EOF

# Build for production
npm run build

# Test production build locally
npm run preview
```

### Step 3: Update server.js CORS
```javascript
// tournament-backend/server.js
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || 
  ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS error'));
    }
  },
  credentials: true
}));
```

### Step 4: Add Start Script to package.json (Backend)
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Step 5: Add Build Script Verification (Frontend)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "start": "vite preview --port 3000"
  }
}
```

---

## 🚀 DEPLOYMENT PLATFORMS

### Option 1: Heroku (Easiest)
```bash
# Backend
heroku create tournament-backend
git push heroku main

# Frontend
heroku create tournament-frontend
git push heroku main
# Or use Heroku's buildpack for React
```

### Option 2: AWS/Azure/GCP
- Backend: EC2/App Service/Compute Engine
- Frontend: S3/Blob Storage/Cloud Storage + CloudFront/CDN
- Database: Already using MongoDB Atlas (good!)

### Option 3: DigitalOcean/Render/Fly.io
```bash
# Simple deployment with environment variables
# Set MONGO_URI, JWT_SECRET, ALLOWED_ORIGINS in platform UI
```

### Option 4: Self-hosted (VPS)
```bash
# On your server:
git clone your-repo
cd tournament-backend
npm install
export NODE_ENV=production
export PORT=5000
export MONGO_URI=your_uri
export JWT_SECRET=your_secret
npm start

# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name "tournament-api"
pm2 save
pm2 startup
```

---

## 📦 BUILD & DEPLOYMENT VERIFICATION

### Backend Ready Check
- [x] Express server configured
- [x] MongoDB connected (using Atlas - good!)
- [x] JWT auth middleware ready
- [x] All routes implemented
- [x] CORS middleware present
- [x] Error handling included
- [ ] **CORS configured for production (needs fixing)**
- [ ] **JWT_SECRET changed to secure value (needs fixing)**
- [ ] **Environment variables documented (needs creating .env.example)**

### Frontend Ready Check
- [x] React + Vite configured
- [x] Tailwind CSS working
- [x] API client configured with axios
- [x] Token storage in localStorage
- [x] React Router implemented
- [x] All pages created
- [ ] **API URL pointing to production backend (needs fixing)**
- [ ] **Build script generates dist/ folder**
- [ ] **Environment variables set for production (needs .env.production)**

---

## 🔐 Security Checklist

- [ ] Change JWT_SECRET to strong random key
- [ ] Set ALLOWED_ORIGINS in CORS
- [ ] Remove hardcoded credentials
- [ ] Add .env to .gitignore
- [ ] Use HTTPS only in production
- [ ] Set secure CORS headers
- [ ] Validate all user inputs
- [ ] Use environment variables for all secrets
- [ ] Review API authentication middleware
- [ ] Set proper HTTP headers (helmet.js recommended)

---

## 📝 Pre-Deployment Configuration Template

### Backend .env (Production)
```dotenv
# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tournament_db

# Security
JWT_SECRET=a_very_long_random_secure_key_generated_by_crypto
NODE_ENV=production

# Server
PORT=5000

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://app.yourdomain.com
```

### Frontend .env.production
```dotenv
# Backend API URL (change based on your deployment)
VITE_API_URL=https://api.yourdomain.com/api
# OR for same domain:
VITE_API_URL=/api
```

---

## ✅ FINAL DEPLOYMENT CHECKLIST

- [ ] Backend CORS configured for production domains
- [ ] Frontend API URL set to production backend
- [ ] JWT_SECRET changed to secure value
- [ ] .env files in .gitignore
- [ ] .env.example created with template
- [ ] Package.json scripts verified
- [ ] Frontend build successful (`npm run build`)
- [ ] Backend start script working (`npm start`)
- [ ] MongoDB Atlas connection working
- [ ] All environment variables set on hosting platform
- [ ] HTTPS enabled (required for authentication)
- [ ] Test login flow before going live
- [ ] Test draw generation before going live
- [ ] Monitor logs on hosting platform

---

## 🎯 Summary

**Status:** ✅ **Ready to Deploy with Fixes**

**Critical Issues (Must Fix):**
1. ❌ Frontend API URL hardcoded to localhost
2. ❌ Backend CORS allows all origins
3. ❌ JWT_SECRET is weak and exposed

**Deployment Path:**
1. Make the 3 critical fixes above
2. Create `.env.example` files
3. Build frontend: `npm run build`
4. Deploy backend to your server/platform
5. Deploy frontend build to CDN/hosting
6. Set environment variables on hosting platform
7. Test all features in production

**Estimated Time to Deploy:** 30-60 minutes (with fixes)

**Is it deployment ready?** 
✅ **YES** - with the above fixes applied. The application architecture is solid and ready for production!
