# Security Checklist - Before Deployment

## ✅ Credentials Protection

### 1. **Environment Variables (.gitignore)**
✅ **Status: CONFIGURED**

The following are protected in `.gitignore`:
```
.env                    # Main environment file
.env.local             # Local overrides
.env.*.local           # Environment-specific
.env.development.local
.env.test.local
.env.production.local
!.env.example          # This IS committed (reference only)
```

**Verify:**
```bash
# Check .env files are ignored
cat .gitignore | grep -E "^\.env"
```

### 2. **Credentials Removed from Documentation**
✅ **Status: CLEANED**

All real credentials have been replaced with placeholders:

**Before (EXPOSED):**
```
MONGO_URI=mongodb+srv://ajinkya:Canon1300d@draws-application.pn8qkxc.mongodb.net/
JWT_SECRET=supersecret
```

**After (SAFE):**
```
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_generated_secure_key>
```

**Files Updated:**
- ✅ DEPLOYMENT_CHECKLIST.md
- ✅ DEPLOYMENT_READY.md
- ✅ SETUP_GUIDE.md

### 3. **Never Commit Sensitive Files**
✅ **Files Protected in .gitignore:**
```
.env*                  # All environment files
*.pem, *.key           # SSH/SSL certificates
*.p12, *.pfx           # Certificate archives
uploads/               # User uploaded files
*.csv                  # May contain PII
```

---

## 🔐 Before Deployment Checklist

### Backend Environment Setup
- [ ] Generate new JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Set MONGO_URI from MongoDB Atlas connection string
- [ ] Set NODE_ENV=production
- [ ] Set ALLOWED_ORIGINS to your frontend domain(s)
- [ ] Create `.env` file in `tournament-backend/` (NOT committed)
- [ ] Verify `.env` is in `.gitignore`

### Frontend Environment Setup
- [ ] Create `.env.production` in `tournament-frontend/`
- [ ] Set VITE_API_URL to your production backend URL
- [ ] Verify `.env.production` follows .gitignore rules

### GitHub/Repository Security
- [ ] Verify no `.env` files are committed: `git log --name-status -- ".env*" | head`
- [ ] If accidentally committed, remove: 
  ```bash
  git rm --cached .env
  git commit -m "Remove .env from git history"
  ```
- [ ] Use GitHub Secrets for CI/CD deployments (if applicable)

### MongoDB Security
- [ ] Use strong MongoDB password (min 16 characters)
- [ ] Enable IP Whitelist in MongoDB Atlas
- [ ] Use Network Access rules
- [ ] Enable authentication for all users

### JWT Security
- [ ] Generate cryptographically secure JWT_SECRET
- [ ] Never hardcode JWT_SECRET in code
- [ ] Rotate JWT_SECRET periodically (after changing, users must log in again)
- [ ] Use JWT exiration times (recommend: 7 days for tokens)

---

## 📋 Reference: Environment Variables

### Backend (.env)
```bash
# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/drawsapp

# Authentication
JWT_SECRET=<generate-with-crypto>

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Optional: Email Configuration (for future features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Frontend (.env.production)
```bash
# API Endpoint
VITE_API_URL=https://api.yourdomain.com

# Optional: Analytics
VITE_GA_ID=your-google-analytics-id
```

---

## 🛡️ Deployment Security Best Practices

### 1. **HTTPS Only**
- [ ] Use SSL/TLS certificates
- [ ] Redirect HTTP to HTTPS
- [ ] Set secure headers (HSTS, CSP, etc.)

### 2. **CORS Configuration**
- [ ] Set ALLOWED_ORIGINS to specific domains only
- [ ] Never use `*` in production
- [ ] Frontend URL must match CORS origin

### 3. **Database Security**
- [ ] Use connection pooling
- [ ] Enable encryption at rest
- [ ] Regular backups (daily minimum)
- [ ] Database access from backend IP only

### 4. **API Security**
- [ ] Rate limiting on auth endpoints
- [ ] Input validation on all requests
- [ ] SQL injection protection (Mongoose handles this)
- [ ] XSS protection headers

### 5. **Monitoring & Logging**
- [ ] Enable application logging
- [ ] Monitor error rates
- [ ] Track authentication failures
- [ ] Set up alerts for suspicious activity

---

## 🚀 Post-Deployment

### Verify Security
```bash
# 1. Check that .env is NOT exposed
curl https://yourdomain.com/.env  # Should return 404

# 2. Verify HTTPS is working
curl -I https://yourdomain.com    # Should show 200 with HTTPS

# 3. Check CORS headers
curl -H "Origin: https://frontend.com" https://api.yourdomain.com

# 4. Verify JWT is required
curl https://api.yourdomain.com/api/events  # Should return 401
```

### Monitor Logs
- Monitor for failed login attempts
- Watch for unusual API usage
- Check for database errors
- Track application performance

---

## ⚠️ Critical: If Credentials Were Exposed

If real credentials were ever committed to git:

1. **Rotate all credentials immediately:**
   ```bash
   # Generate new JWT_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Change MongoDB password in Atlas
   # Create new API keys if applicable
   ```

2. **Remove from Git History:**
   ```bash
   git rm --cached .env
   git commit -m "Remove .env from tracking"
   git push origin main
   ```

3. **Scan for exposure:**
   ```bash
   # Check if credentials appear in any branch
   git log -p --all -- ".env" | grep -E "password|secret|key"
   ```

---

## 📞 Security Support

For security issues:
- Do NOT commit credentials
- Use environment variables for all secrets
- Keep dependencies updated
- Report vulnerabilities privately (not in issues)

---

**Status:** ✅ Application is security-ready for deployment
**Last Updated:** January 19, 2026
