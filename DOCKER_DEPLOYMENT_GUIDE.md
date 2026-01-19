# Docker Deployment Guide - Tournament Draw Application

## ✅ Docker Configuration Review

### Files Checked & Fixed

#### 1. **Backend Dockerfile** ✅ CORRECT
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```
**Status:** ✅ Good - Uses lightweight Alpine image, production dependencies only

#### 2. **Frontend Dockerfile** ✅ FIXED
```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage (Nginx)
FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html  # ✅ FIXED: was /app/build
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
**Changes Made:** Fixed build output path from `/app/build` to `/app/dist` (Vite default)

#### 3. **Nginx Configuration** ✅ ENHANCED
**Added:**
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- API proxy configuration (`/api` → `http://backend:5000`)
- React Router support (SPA routing)
- Cache headers for static assets
- Proper proxy headers forwarding

#### 4. **Docker Compose** ✅ ENHANCED
**Added:**
- Custom bridge network (`tournament-network`)
- Health checks for backend service
- Proper service dependency ordering
- Environment variables for production
- Container name configuration

---

## 🐳 Docker Setup Instructions

### Prerequisites
```bash
# Install Docker
# https://docs.docker.com/get-docker/

# Verify installation
docker --version
docker-compose --version
```

### Step 1: Prepare Environment Files

**Create backend/.env**
```bash
cd tournament-backend
cat > .env << 'EOF'
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_generated_secure_key>
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
EOF
```

**Frontend uses nginx (no .env needed)**

### Step 2: Build Docker Images

```bash
# Navigate to project root
cd /path/to/Draws\ Application

# Build both images
docker-compose build

# Optional: Build individual images
docker-compose build backend
docker-compose build frontend
```

### Step 3: Run Docker Containers

```bash
# Start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Step 4: Access Application

```bash
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000

# Test backend health
curl http://localhost:5000

# Test frontend
open http://localhost:3000
```

---

## 📋 Docker Commands Reference

### Container Management
```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View running containers
docker-compose ps

# View all containers (including stopped)
docker-compose ps -a
```

### Logs & Debugging
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# View logs with timestamps
docker-compose logs -f --timestamps

# View last 100 lines
docker-compose logs backend --tail 100
```

### Rebuild & Restart
```bash
# Rebuild images
docker-compose build

# Rebuild specific service
docker-compose build backend

# Rebuild and restart containers
docker-compose up -d --build

# Restart specific service
docker-compose restart backend
```

### Execute Commands in Container
```bash
# Execute command in running container
docker-compose exec backend npm start

# Get shell access to container
docker-compose exec backend sh
docker-compose exec frontend sh

# List files in container
docker-compose exec backend ls -la /app
```

### Clean Up
```bash
# Remove stopped containers
docker-compose down

# Remove dangling images
docker image prune

# Remove unused volumes
docker volume prune

# Full cleanup (be careful!)
docker-compose down -v
docker system prune -a
```

---

## 🔧 Troubleshooting

### Issue: Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000
kill -9 <PID>

# Or use different port in docker-compose.yml
# Change: "3000:80" to "8080:80"
```

### Issue: Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Verify .env file exists
ls -la tournament-backend/.env

# Check file permissions
chmod 644 tournament-backend/.env
```

### Issue: API Connection Failed
```bash
# Verify backend is running
docker-compose ps

# Check network connectivity
docker-compose exec frontend ping backend

# View backend logs
docker-compose logs -f backend
```

### Issue: MongoDB Connection Error
```bash
# Verify MONGO_URI in .env
grep MONGO_URI tournament-backend/.env

# Test connection manually
docker-compose exec backend curl -f http://localhost:5000

# Check Docker network
docker network ls
docker network inspect tournament-network
```

### Issue: Frontend Shows Blank Page
```bash
# Check nginx logs
docker-compose logs frontend

# Verify build was successful
docker-compose exec frontend ls -la /usr/share/nginx/html

# Test API connectivity
docker-compose exec frontend curl -f http://backend:5000/events
```

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   Docker Compose                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────┐     ┌──────────────────┐  │
│  │    Frontend (port    │     │    Backend       │  │
│  │    3000)             │     │   (port 5000)    │  │
│  │                      │     │                  │  │
│  │  ┌────────────────┐  │     │  ┌──────────────┐│  │
│  │  │  Node Build    │  │     │  │  Node.js     ││  │
│  │  │  (npm run      │  │     │  │  Express     ││  │
│  │  │   build)       │  │     │  │  JWT Auth    ││  │
│  │  └────────────────┘  │     │  │  MongoDB     ││  │
│  │         ↓            │     │  │  Connect     ││  │
│  │  ┌────────────────┐  │     │  └──────────────┘│  │
│  │  │  Nginx Serve   │  │     │                  │  │
│  │  │  dist/ files   │  │     │  Health Check   │  │
│  │  │  + React SPA   │  │     │  (curl)         │  │
│  │  │  routing       │  │     │                  │  │
│  │  └────────────────┘  │     │                  │  │
│  └──────────────────────┘     └──────────────────┘  │
│           ↓                           ↑               │
│      /api proxy ──────────────────────               │
│                                                      │
└─────────────────────────────────────────────────────┘
          │
          ↓
┌─────────────────────────────────────────────────────┐
│        Tournament Network (bridge)                   │
│   - Internal DNS resolution                         │
│   - Automatic service discovery                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔒 Security Considerations

### Network Security
✅ **Custom Bridge Network:** Services communicate internally
✅ **No external exposure:** Backend only accessible through frontend proxy
✅ **Health checks:** Automatic service monitoring

### Environment Variables
✅ **Externalized secrets:** In `.env` file, not in code
✅ **Production mode:** NODE_ENV=production
✅ **Port binding:** Only necessary ports exposed

### File Permissions
```bash
# Restrict .env file access
chmod 600 tournament-backend/.env

# Restrict Docker socket
sudo chmod 666 /var/run/docker.sock
```

---

## 📈 Production Best Practices

### 1. Resource Limits
```yaml
# Add to docker-compose.yml services
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 2. Restart Policies
```yaml
# Already configured
restart: always  # Always restart on failure
```

### 3. Volume Management
```bash
# Create volume for MongoDB persistence (if self-hosted)
docker volume create mongo-data

# Use in docker-compose.yml
services:
  mongo:
    volumes:
      - mongo-data:/data/db
```

### 4. Monitoring & Logging
```bash
# View resource usage
docker stats

# Save logs
docker-compose logs > logs.txt

# Real-time monitoring
watch docker stats
```

---

## 🚀 Deployment Steps (Production)

### On Production Server

```bash
# 1. Clone repository
git clone https://github.com/yourusername/Draws-Application.git
cd "Draws Application"

# 2. Create .env file
cat > tournament-backend/.env << 'EOF'
MONGO_URI=<production_mongodb_uri>
JWT_SECRET=<secure_generated_key>
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com
EOF

# 3. Build images
docker-compose build

# 4. Start containers
docker-compose up -d

# 5. Verify services
docker-compose ps
docker-compose logs -f

# 6. Test endpoints
curl https://yourdomain.com/api/events
```

### Using Docker Registry (Optional)

```bash
# Push to Docker Hub
docker tag tournament-backend yourusername/tournament-backend:latest
docker push yourusername/tournament-backend:latest

# Pull on production
docker pull yourusername/tournament-backend:latest
```

---

## ✅ Final Docker Checklist

- [ ] Backend Dockerfile is correct (Alpine, minimal)
- [ ] Frontend Dockerfile uses multi-stage build
- [ ] Frontend copies from `/app/dist` (Vite output)
- [ ] Nginx config has security headers
- [ ] Nginx has `/api` proxy to backend
- [ ] docker-compose.yml has custom network
- [ ] docker-compose.yml has health checks
- [ ] .env file created with real values
- [ ] .env file is NOT in git (in .gitignore)
- [ ] Containers start without errors
- [ ] Frontend accessible on port 3000
- [ ] Backend accessible on port 5000
- [ ] Frontend API calls work (no 404/503 errors)

---

## 📚 Additional Resources

- Docker Docs: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Nginx: https://nginx.org/
- Node Alpine: https://hub.docker.com/_/node/

---

**Status:** ✅ Docker configuration is ready for production deployment!

