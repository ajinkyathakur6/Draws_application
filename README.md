# Tournament Draw Application

A complete **tournament management system** that handles student enrollment, event creation, participant management, intelligent draw generation, and match result tracking.

## ✨ Features

### 🎯 Core Functionality
- **CSV Student Import** - Admin uploads students in bulk via CSV
- **Event Creation** - Create tournaments (sport, category, format)
- **Participant Management** - Coordinator adds/removes students to events
- **Intelligent Draw Generation** - Automatic bracket sizing and bye calculation
- **Seeding System** - Admin assigns seeds for strategic placement
- **Match Management** - Coordinator records winners, automatic round advancement
- **Public Bracket View** - Anyone can view tournament progress

### 🔧 Smart Features
- **Auto Bracket Sizing** - Rounds up to power of 2 (2, 4, 8, 16, 32, 64)
- **Bye Logic** - Automatically assigns byes to unseeded players
- **Seeding Strategy** - Top seeds placed at strategic positions
- **Auto Advancement** - Winners automatically advance to next round
- **Smart Round Creation** - Generates next round matches on-demand
- **Status Tracking** - Complete tournament state management

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Start here! Quick setup & testing guide |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | Overview of all implemented features |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Detailed installation & configuration |
| [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) | Complete API documentation |
| [BRACKET_LOGIC_EXAMPLES.md](BRACKET_LOGIC_EXAMPLES.md) | Visual examples & algorithm details |
| [FEATURES_CHECKLIST.md](FEATURES_CHECKLIST.md) | Full feature list with checkmarks |

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Setup

**Terminal 1: Backend**
```bash
cd tournament-backend
npm install
npm start
# API runs on http://localhost:5000
```

**Terminal 2: Frontend**
```bash
cd tournament-frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

## 📋 Complete Workflow

```
1. ADMIN uploads students via CSV
   ↓
2. ADMIN creates event
   ↓
3. COORDINATOR adds participants to event
   ↓
4. ADMIN assigns seeds (optional)
   ↓
5. ADMIN generates tournament draw
   ↓
6. COORDINATOR records match winners
   ↓
7. Winners automatically advance to next round
   ↓
8. Repeat until champion determined
   ↓
9. PUBLIC views complete bracket
```

## 🎯 Example: 5 Player Tournament

```
Admin uploads 5 students → Creates "Badminton Mens" event
Coordinator adds all 5 to event
Admin assigns seeds: 1st, 2nd, 3rd (unseeded get byes)
Admin generates draws:
  - Bracket size: 8 (rounded up from 5)
  - Byes: 3
  - Winners advance automatically

Round 1: 4 matches (1 bye match auto-completes)
Round 2: 2 matches (created automatically)
Round 3: 1 match (final)

Coordinator selects winners → Bracket updates → Champion!
```

## 🎮 Testing

### Sample Data
```csv
rollNo,name,department,year
A001,Rahul Sharma,CSE,3
A002,Priya Singh,IT,2
A003,Amit Kumar,ECE,3
A004,Sneha Patel,CSE,4
A005,Vikas Gupta,IT,3
```

### Test Steps
1. Admin: Upload CSV students
2. Admin: Create event
3. Coordinator: Add 5 students
4. Admin: Generate draws (observe 3 byes)
5. Coordinator: Record 2 winners
6. View: Winners advanced to Round 2
7. Public: View bracket

## 🏗️ Architecture

### Backend
```
Express.js API with MongoDB
- RESTful endpoints
- JWT authentication
- Role-based access (ADMIN, COORDINATOR)
- Intelligent bracket generation
```

### Frontend
```
React + Vite + Tailwind CSS
- Component-based UI
- Real-time bracket updates
- Responsive design
- CSV file handling
```

### Database Models
- **Student** - User data (name, roll, dept, year)
- **Event** - Tournament (sport, category, format, status)
- **Participation** - Student registration (seed tracking)
- **Match** - Individual matches (winner, round, slot)

## 📊 Bracket Sizing Reference

| Players | Bracket | Byes | Reason |
|---------|---------|------|--------|
| 2 | 2 | 0 | Perfect |
| 3-4 | 4 | 1-0 | Round up |
| 5-8 | 8 | 3-0 | Round up |
| 9-16 | 16 | 7-0 | Round up |
| 17-32 | 32 | 15-0 | Round up |
| 33-64 | 64 | 31-0 | Round up |

## 🔑 API Endpoints

### Students
- `POST /api/students/bulk-upload` - CSV import
- `GET /api/students` - List all
- `GET /api/students/search/:roll` - Search

### Events
- `POST /api/events` - Create
- `GET /api/events` - List
- `GET /api/events/:id` - Details
- `PUT /api/events/:id/status` - Update status

### Participation
- `POST /api/participation` - Add (COORDINATOR)
- `GET /api/participation/:eventId` - List
- `PUT /api/participation/:id/seed` - Set seed (ADMIN)
- `DELETE /api/participation/:id` - Remove

### Draws & Matches
- `POST /api/draws/:eventId/generate` - Generate bracket (ADMIN)
- `GET /api/draws/:eventId/bracket` - View bracket
- `POST /api/draws/match/:matchId/winner` - Record winner (COORDINATOR)

## 🎨 Frontend Routes

```
/                          → Home (public bracket list)
/login                     → Login page

/admin                     → Admin dashboard
/admin/students            → Student management
/admin/events              → Event management
/admin/events/:id/participants → Participant management

/coordinator               → Coordinator dashboard
/coordinator/participants/:eventId → Add participants

/bracket/:eventId          → Public bracket view
```

## 👥 Role-Based Access

### ADMIN
- Upload students
- Create events
- View all participants
- Set seeds
- Generate draws
- Update event status

### COORDINATOR
- Add students to events
- Remove participants
- View brackets
- Record match winners

### PUBLIC
- View brackets
- See match results
- View event list

## ⚡ Key Algorithms

### Bracket Size Calculation
```javascript
const bracketSize = nextPowerOf2(participants);
const byes = bracketSize - participants;
```

### Seeding Placement
```javascript
seededPlayers.forEach((player, i) => {
  const position = seedPositions[i];
  bracket[position] = player;
});
```

### Winner Advancement
```javascript
const nextRound = currentRound + 1;
const nextMatch = Math.ceil(matchNo / 2);
const isSlot1 = matchNo % 2 === 1;
// Place winner in slot1 or slot2 accordingly
```

## 🔒 Security

- JWT-based authentication
- Role-based authorization
- Input validation on backend
- Protected API endpoints
- Secure token storage

## 📱 Responsive Design

- Mobile-friendly UI
- Tablet optimization
- Desktop full-featured view
- Touch-friendly buttons
- Scrollable bracket for large tournaments

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Not enough players" | Add 2+ participants |
| Seeds not working | Set before generating |
| Can't add participant | Upload CSV first |
| Bye appearing | Normal for non-power-of-2 counts |
| Winner won't advance | Refresh page after recording |

## 📦 Technologies Used

### Backend
- Node.js & Express.js
- MongoDB
- JWT (jsonwebtoken)
- Multer (file upload)
- CSV-parser

### Frontend
- React 18
- Vite
- Tailwind CSS
- Axios
- React Router

## 🚀 Production Ready

- Error handling
- Input validation
- Database indexing
- API rate limiting ready
- Scalable architecture
- Clean code structure

## 📈 Performance

- Efficient database queries
- Minimal API calls
- Cached bracket data
- Optimized round generation
- No unnecessary re-renders

## 🤝 Contributing

For improvements or bug reports, follow the existing code style and add tests.

## 📄 License

This project is provided as-is for tournament management.

## 🎓 Learning Outcomes

This application demonstrates:
- Full-stack MERN development
- Database design & relationships
- RESTful API design
- Authentication & authorization
- Tournament algorithm implementation
- Responsive UI design
- Role-based access control
- File handling (CSV)
- Real-time data updates

## 📞 Support

Refer to the documentation files:
- **Quick setup?** → [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- **How does it work?** → [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **API docs?** → [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
- **Algorithm details?** → [BRACKET_LOGIC_EXAMPLES.md](BRACKET_LOGIC_EXAMPLES.md)
- **Installation issues?** → [SETUP_GUIDE.md](SETUP_GUIDE.md)

---

## ✅ Quick Verification

```bash
# Backend running?
curl http://localhost:5000
# Should show: "Tournament API Running"

# Frontend accessible?
Open http://localhost:5173 in browser
# Should show login page

# Database connected?
mongosh → use tournament → show collections
# Should show: participations, events, matches, students
```

---

**Ready to use!** See [QUICK_REFERENCE.md](QUICK_REFERENCE.md) to get started. 🚀

Last Updated: January 2026
Version: 1.0 - Complete Implementation
