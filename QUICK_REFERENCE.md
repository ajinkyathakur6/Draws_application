# Quick Reference - Tournament Draw App

## 🚀 Quick Start

### Terminal 1: Backend
```bash
cd tournament-backend
npm install
npm start
# Runs on http://localhost:5000
```

### Terminal 2: Frontend
```bash
cd tournament-frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## 👥 Test Accounts

Create in your auth system:
```
Admin:
  Email: admin@tournament.com
  Password: admin123
  Role: ADMIN

Coordinator:
  Email: coord@tournament.com
  Password: coord123
  Role: COORDINATOR
```

## 📋 Admin Checklist

- [ ] Go to `/admin/students` → Upload CSV with students
- [ ] Go to `/admin/events` → Create event (Sport, Category, Format)
- [ ] Click "Participants" → View participants
- [ ] Click on seed numbers → Set seeds (1=best, 2=second, etc.)
- [ ] Click "Generate Draws" → Creates tournament bracket
- [ ] Verify bracket shows byes correctly

## 👔 Coordinator Checklist

- [ ] Go to `/coordinator` → Select event
- [ ] Click "Add Participants" → Search and add students
- [ ] Wait for admin to generate draws
- [ ] Go back to `/coordinator` → View bracket
- [ ] Click pending match (yellow border) → Select winner
- [ ] Verify winner advanced to next round

## 🎮 Test Scenario

**Setup (5 players):**
```
1. Admin: Upload CSV with 5 students (A001-A005)
2. Admin: Create "Badminton Mens Singles" event
3. Coordinator: Add all 5 students to event
4. Admin: Set seeds: A001=1, A002=2, A003=3
5. Admin: Generate Draws → 3 byes created
6. Coordinator: Record 2 winners in Round 1
7. Winners advance to Round 2 automatically
```

## 📊 Data Files

### CSV Format
```csv
rollNo,name,department,year
A001,Rahul Sharma,CSE,3
A002,Priya Singh,IT,2
A003,Amit Kumar,ECE,3
A004,Sneha Patel,CSE,4
A005,Vikas Gupta,IT,3
```

## 🔑 Key API Endpoints

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| POST | /api/students/bulk-upload | ADMIN | Import CSV |
| POST | /api/events | ADMIN | Create event |
| POST | /api/participation | COORDINATOR | Add participant |
| PUT | /api/participation/:id/seed | ADMIN | Set seed |
| POST | /api/draws/:eventId/generate | ADMIN | Generate bracket |
| GET | /api/draws/:eventId/bracket | PUBLIC | View bracket |
| POST | /api/draws/match/:matchId/winner | COORDINATOR | Record winner |

## 🧮 Bracket Math

| Players | Bracket | Byes |
|---------|---------|------|
| 2 | 2 | 0 |
| 3 | 4 | 1 |
| 4 | 4 | 0 |
| 5 | 8 | 3 |
| 6 | 8 | 2 |
| 7 | 8 | 1 |
| 8 | 8 | 0 |
| 9 | 16 | 7 |
| 16 | 16 | 0 |

## 🎯 UI Navigation

### Admin Pages
```
/admin
  ├─ /admin/dashboard (Dashboard)
  ├─ /admin/students (Upload CSV)
  ├─ /admin/events (Create Event)
  ├─ /admin/events/{id}/participants (Manage & Seed)
  └─ /admin/brackets (View Brackets)
```

### Coordinator Pages
```
/coordinator (Dashboard - View Events & Bracket)
/coordinator/participants/{eventId} (Add Students)
```

### Public Pages
```
/ (Home - Event List)
/login (Login)
/bracket/{eventId} (View Bracket)
```

## 🔍 Seeding Guide

**What is seed?**
- Number representing player strength (1=strongest)
- Used to place stronger players strategically
- Only unseeded (0) players get byes

**How to seed:**
1. Go to AdminEventParticipants
2. Click on seed number field (right of participant)
3. Enter seed number (1, 2, 3, etc.)
4. Can only seed before generating draws

**Seed placement (8-bracket):**
```
Position: 0 1 2 3 4 5 6 7
Seed 1 ─→ P0
         P1
Seed 3 ─→ P3
Seed 4 ─→ P4
         P5
         P6
Seed 2 ─→ P7
```

## ⚠️ Common Mistakes

| Issue | Fix |
|-------|-----|
| "Not enough players" | Need 2+ participants |
| Seeding not working | Must set seed before generating draws |
| Can't add participant | Student must exist (upload CSV first) |
| Bye appearing | Normal! Bracket needs power of 2 |
| Winner won't advance | Refresh page after recording |

## 💾 Database Cleanup

```bash
# Connect to MongoDB
mongosh

# Clear tournament data
use tournament
db.students.deleteMany({})
db.events.deleteMany({})
db.participations.deleteMany({})
db.matches.deleteMany({})

# Exit
exit
```

## 🐛 Debug Tips

### Check if backend running
```bash
curl http://localhost:5000
# Should show: "Tournament API Running"
```

### Check MongoDB connection
```bash
mongosh
use tournament
show collections
db.students.find().limit(1)
```

### View browser console errors
```
F12 → Console tab → Check for errors
```

### Backend logs
```
Look in terminal where you ran npm start
Should see "Server running on port 5000"
```

## 📦 File Structure

```
tournament-backend/
├─ server.js (main)
├─ routes/
│  ├─ auth.js
│  ├─ students.js ✅
│  ├─ events.js ✅
│  ├─ participation.js ✅
│  ├─ draws.js ✅
│  └─ matches.js ✅
├─ models/
│  ├─ Student.js ✅
│  ├─ Event.js ✅
│  ├─ Participation.js ✅
│  ├─ Match.js ✅
│  └─ Team.js
└─ middleware/
   └─ auth.js

tournament-frontend/
└─ src/
   ├─ pages/
   │  ├─ Admin/
   │  │  ├─ AdminStudents.jsx ✅
   │  │  ├─ AdminEvents.jsx ✅
   │  │  └─ AdminEventParticipants.jsx ✅
   │  ├─ CoordinatorDashboard.jsx ✅
   │  ├─ CoordinatorParticipants.jsx ✅
   │  ├─ EventBracketPage.jsx ✅
   │  └─ PublicBracket.jsx
   └─ App.jsx ✅
```

## 📱 Production Deployment

### Backend (Heroku)
```bash
heroku login
heroku create tournament-backend
git push heroku main
heroku config:set MONGODB_URI="..."
heroku config:set JWT_SECRET="..."
```

### Frontend (Vercel)
```bash
npm i -g vercel
vercel
# Update API base URL to production backend
```

## 🎓 Learning Resources

- **IMPLEMENTATION_GUIDE.md** - Full API documentation
- **BRACKET_LOGIC_EXAMPLES.md** - Algorithm & visual examples
- **SETUP_GUIDE.md** - Detailed installation guide
- **FEATURES_CHECKLIST.md** - All implemented features

## ✅ Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend builds successfully
- [ ] MongoDB connection works
- [ ] Admin can upload CSV
- [ ] Admin can create event
- [ ] Coordinator can add students
- [ ] Admin can generate draws
- [ ] Bye calculation is correct
- [ ] Winner recording works
- [ ] Round advancement is automatic
- [ ] Public can view bracket

---

**Ready to go!** Follow the Quick Start section and start testing. 🚀

For detailed documentation, see:
- IMPLEMENTATION_SUMMARY.md (Overview)
- SETUP_GUIDE.md (Installation)
- IMPLEMENTATION_GUIDE.md (API docs)
