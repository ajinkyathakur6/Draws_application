# Production Deployment Guide - Tournament Draw Application

## 🎯 Application Status: ✅ DEPLOYMENT READY

All necessary changes have been implemented. The application is now configured for production deployment.

---

## 📋 What's Been Fixed

### ✅ Backend (tournament-backend/)
- [x] CORS configured with allowed origins
- [x] Error handling middleware added
- [x] Environment variables for production
- [x] Start script added to package.json
- [x] Logging improved for deployment monitoring
- [x] Connection fallback for PORT

### ✅ Frontend (tournament-frontend/)
- [x] API configuration supports production environments
- [x] Environment-based URL selection
- [x] Response interceptor for 401 error handling
- [x] .env.production file created
- [x] Token management improved

### ✅ Configuration Files
- [x] .env.example templates created (both frontend & backend)
- [x] .env.production created for frontend
- [x] package.json scripts updated

---

## 🚀 QUICK DEPLOYMENT GUIDE

### Prerequisites
- Node.js v14+
- npm or yarn
- MongoDB Atlas account (already using)
- Hosting platform (Heroku, DigitalOcean, AWS, etc.)

---

## 📖 Step-by-Step Deployment

### Step 1: Prepare Environment Files

**Backend (.env for production server)**
```bash
# On your production server, create .env with:
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<generate_new_secure_key>
PORT=5000
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
NODE_ENV=production
```

**Generate secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Frontend (.env.production - already created)**
```
VITE_API_URL=/api
```
*(This assumes backend serves at same domain)*

**For separate domains, modify frontend .env.production:**
```
VITE_API_URL=https://api.yourdomain.com/api
```

---

### Step 2: Build Frontend

```bash
cd tournament-frontend

# Install dependencies
npm install

# Build for production
npm run build

# Output location: tournament-frontend/dist/
# Files ready for deployment to web server/CDN
```

---

### Step 3: Deploy Backend

#### Option A: Using Heroku
```bash
cd tournament-backend

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGO_URI="mongodb+srv://..."
heroku config:set JWT_SECRET="<your_secure_key>"
heroku config:set ALLOWED_ORIGINS="https://yourdomain.com"
heroku config:set NODE_ENV="production"

# Deploy
git push heroku main
```

#### Option B: Using DigitalOcean App Platform
```bash
# 1. Connect GitHub repo
# 2. Set environment variables in dashboard
# 3. Set startup command: npm start
# 4. Set port: 5000
```

#### Option C: Self-Hosted (VPS/EC2)
```bash
# On your server
git clone <your-repo>
cd tournament-backend

npm install
npm start

# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name "tournament-api"
pm2 save
pm2 startup
pm2 logs tournament-api  # Monitor logs
```

---

### Step 4: Deploy Frontend

#### Option A: Netlify
```bash
cd tournament-frontend

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist/

# Or connect to GitHub for auto-deploy
```

#### Option B: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

cd tournament-frontend
vercel --prod
```

#### Option C: AWS S3 + CloudFront
```bash
# 1. Build: npm run build
# 2. Upload dist/ to S3
# 3. Configure CloudFront CDN
# 4. Point domain to CloudFront
```

#### Option D: Same Server as Backend
```bash
# If backend and frontend on same server:
cd /var/www/tournament-app

npm run build

# Serve static files from backend
# Add to server.js:
app.use(express.static('dist'));
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html');
});
```

---

## 🔗 Deployment Scenarios

### Scenario 1: Same Domain (Recommended for simplicity)
```
Frontend → https://yourdomain.com
Backend  → https://yourdomain.com/api

Setup:
1. Deploy backend to yourdomain.com:5000
2. Build frontend with VITE_API_URL=/api
3. Serve frontend from same server (nginx reverse proxy)
4. nginx proxies /api requests to backend:5000
```

**nginx.conf example:**
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/tournament-app/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    ssl_certificate /path/to/cert;
    ssl_certificate_key /path/to/key;
}
```

### Scenario 2: Separate Domains
```
Frontend → https://app.yourdomain.com
Backend  → https://api.yourdomain.com

Setup:
1. Deploy backend to api.yourdomain.com
2. Build frontend with VITE_API_URL=https://api.yourdomain.com/api
3. Deploy frontend to app.yourdomain.com
4. CORS handles cross-domain communication
```

**Backend .env:**
```
ALLOWED_ORIGINS=https://app.yourdomain.com
```

### Scenario 3: Heroku Deployment
```
Backend → https://your-app-backend.herokuapp.com
Frontend → https://your-app-frontend.herokuapp.com

Setup:
1. Deploy backend to Heroku
2. Update frontend .env.production:
   VITE_API_URL=https://your-app-backend.herokuapp.com/api
3. Deploy frontend to Heroku (or Netlify/Vercel)
```

---

## 🧪 Testing Deployment

### Test 1: Verify Backend is Running
```bash
# From your local machine
curl https://yourdomain.com/api
# Should return: "Tournament API Running"
```

### Test 2: Check CORS Headers
```bash
curl -H "Origin: https://app.yourdomain.com" \
     -H "Access-Control-Request-Method: GET" \
     -v https://yourdomain.com/api
# Should return CORS headers allowing the origin
```

### Test 3: Test API Connection
```bash
# In browser console or Postman
fetch('https://yourdomain.com/api/events')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### Test 4: Complete Workflow
1. Access application at https://yourdomain.com
2. Login with test credentials
3. Create event
4. Generate draws
5. Record winners
6. Verify round progression

---

## 📊 Monitoring & Logging

### Backend Logs
```bash
# Using PM2
pm2 logs tournament-api

# Using Docker
docker logs container-name

# SSH into server
tail -f /var/log/nodejs/tournament.log
```

### Monitor API Health
```bash
# Setup simple health check endpoint
curl https://yourdomain.com/api/health

# Response should be quick (< 100ms)
```

### Database Connection Check
```javascript
// Test in Node.js
const mongoose = require('mongoose');
console.log('Connection status:', mongoose.connection.readyState);
// 0 = disconnected
// 1 = connected
// 2 = connecting
// 3 = disconnecting
```

---

## 🔒 Security Checklist - Production

- [ ] JWT_SECRET is strong and unique
- [ ] ALLOWED_ORIGINS configured correctly
- [ ] HTTPS/SSL enabled
- [ ] .env file NOT in git repository
- [ ] Database credentials secure
- [ ] API rate limiting implemented (optional)
- [ ] CORS headers properly set
- [ ] Input validation on all endpoints
- [ ] Error messages don't expose sensitive info
- [ ] Regular backups enabled (MongoDB Atlas has this)
- [ ] Monitoring alerts configured
- [ ] Database connection strings use SSL

---

## 🚨 Troubleshooting

### Issue: "CORS error" in browser console
**Fix:** Check `ALLOWED_ORIGINS` in backend .env matches your frontend domain

### Issue: API returns 401 (Unauthorized)
**Fix:** Verify JWT_SECRET is same on backend and token is valid

### Issue: "Cannot GET /" on frontend
**Fix:** Ensure frontend dist/ is being served correctly, check web server config

### Issue: Database connection timeout
**Fix:** Verify MongoDB Atlas IP whitelist includes your server IP

### Issue: Frontend shows blank page
**Fix:** Check browser console for errors, verify VITE_API_URL is correct

### Issue: "Port already in use"
**Fix:** Change PORT in .env or kill existing process

---

## 📋 Pre-Launch Checklist

- [ ] Backend running and responding
- [ ] Frontend built and deployed
- [ ] CORS working (test with curl)
- [ ] Database connection verified
- [ ] Authentication working
- [ ] Draw generation tested
- [ ] Winner recording tested
- [ ] All pages load correctly
- [ ] Responsive design working
- [ ] No console errors
- [ ] API response times acceptable
- [ ] Database backups configured
- [ ] Error monitoring enabled
- [ ] SSL certificate valid
- [ ] Domain DNS pointing correctly

---

## 🎯 Performance Optimization (Optional)

### Frontend
```bash
# Analyze bundle size
npm install -g vite-plugin-compression
npm run build -- --analyze

# Use gzip compression
npm install compression
```

### Backend
```bash
# Use clustering for multi-core
npm install cluster

# Add caching
npm install redis
```

---

## 📞 Support & Maintenance

### Regular Tasks
- Monitor error logs
- Update dependencies monthly
- Review API metrics
- Check database size
- Test backup restoration

### Scaling (when needed)
- Add caching layer (Redis)
- Database optimization (indexing)
- Load balancing
- CDN for static files

---

## ✅ Summary

Your application is now **production-ready**! 

**Current Status:**
- ✅ Backend configured for production
- ✅ Frontend build process ready
- ✅ Environment variables documented
- ✅ CORS security implemented
- ✅ Error handling in place
- ✅ Deployment options provided

**Next Steps:**
1. Choose your deployment platform
2. Set up environment variables
3. Deploy backend
4. Build and deploy frontend
5. Test all features
6. Monitor production

**Estimated Deployment Time:** 1-2 hours
**Maintenance Effort:** Low (automated via Platform)

Happy deploying! 🚀
