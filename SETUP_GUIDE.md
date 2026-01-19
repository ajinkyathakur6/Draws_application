# Tournament Draw App - Setup & Running Guide

## Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

## Project Structure
```
tournament-backend/     # Express.js API server
tournament-frontend/    # React + Vite frontend
```

## Backend Setup

### 1. Install Dependencies
```bash
cd tournament-backend
npm install
```

### 2. Configure Environment
Create `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tournament
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### 3. Run Backend Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

Server will run on `http://localhost:5000`

## Frontend Setup

### 1. Install Dependencies
```bash
cd tournament-frontend
npm install
```

### 2. Configure API Base URL
Edit `src/api/api.js`:
```javascript
const api = axios.create({
  baseURL: "http://localhost:5000/api"
});
```

### 3. Run Frontend Development Server
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Database Setup (MongoDB)

### Option 1: Local MongoDB
```bash
# Start MongoDB service
mongod

# Or on macOS with Homebrew:
brew services start mongodb-community
```

### Option 2: MongoDB Atlas (Cloud)
1. Create cluster at mongodb.com
2. Get connection string
3. Update `MONGODB_URI` in `.env`

## Sample CSV File Format

Create `sample_students.csv` for bulk upload:
```csv
rollNo,name,department,year
A001,Rahul Sharma,CSE,3
A002,Priya Singh,CSE,3
A003,Amit Kumar,ECE,3
A004,Sneha Patel,IT,2
A005,Vikas Gupta,CSE,4
A006,Neha Verma,ECE,3
```

## Testing the Application

### 1. First, seed some data

**Create test users** (requires login endpoint):
- Admin account for testing
- Coordinator account for testing

### 2. Follow Complete Workflow

#### Step 1: Admin - Upload Students
1. Login as ADMIN
2. Go to `http://localhost:5173/admin/students`
3. Click "Upload CSV"
4. Select `sample_students.csv`
5. Verify students appear in table

#### Step 2: Admin - Create Event
1. Go to `http://localhost:5173/admin/events`
2. Select: Sport="Badminton", Category="MENS", Format="SINGLES"
3. Click "Create"
4. Event appears in list

#### Step 3: Coordinator - Add Participants
1. Logout and login as COORDINATOR
2. Go to `http://localhost:5173/coordinator`
3. Select the event you created
4. Click "Add Participants"
5. Search and add 5 students

#### Step 4: Admin - Set Seeds & Generate Draws
1. Logout and login as ADMIN
2. Go to Admin Events → click Participants
3. Click on seed numbers to edit (1=best, 2=2nd, etc.)
4. Set seeds for at least some players
5. Click "Generate Draws"
6. Verify bracket is generated with proper bracket size

#### Step 5: Coordinator - Record Winners
1. Logout and login as COORDINATOR
2. Go to Coordinator Dashboard
3. View the bracket
4. Click on pending match (yellow border)
5. Select winner
6. Verify winner advances to next round

#### Step 6: View Public Bracket
1. Go to `http://localhost:5173/bracket/{eventId}`
2. See the tournament bracket
3. View winner progression

## API Testing with cURL

### Upload Students
```bash
curl -X POST http://localhost:5000/api/students/bulk-upload \
  -H "Authorization: Bearer {admin_token}" \
  -F "file=@sample_students.csv"
```

### Create Event
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "sport": "Badminton",
    "category": "MENS",
    "format": "SINGLES"
  }'
```

### Add Participant
```bash
curl -X POST http://localhost:5000/api/participation \
  -H "Authorization: Bearer {coordinator_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "{eventId}",
    "rollNo": "A001"
  }'
```

### Generate Draws
```bash
curl -X POST http://localhost:5000/api/draws/{eventId}/generate \
  -H "Authorization: Bearer {admin_token}"
```

### Get Bracket
```bash
curl http://localhost:5000/api/draws/{eventId}/bracket
```

### Record Winner
```bash
curl -X POST http://localhost:5000/api/draws/match/{matchId}/winner \
  -H "Authorization: Bearer {coordinator_token}" \
  -H "Content-Type: application/json" \
  -d '{"winner": "A001"}'
```

## Troubleshooting

### "Cannot find module" errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database connection error
- Verify MongoDB is running: `mongosh` or `mongo`
- Check MONGODB_URI in `.env`
- For Atlas: ensure IP whitelist includes your IP

### CORS errors
- Backend should have CORS enabled: `app.use(cors())`
- Check backend URL in frontend `api.js`

### Port already in use
```bash
# Change PORT in .env to different port (e.g., 5001)
# Or kill process using port:
# macOS/Linux:
lsof -i :5000
kill -9 <PID>
```

### JWT token errors
- Ensure JWT_SECRET is set in `.env`
- Token should be in header: `Authorization: Bearer {token}`
- Token includes role (ADMIN, COORDINATOR)

## Development Tips

### Hot Reload
- Frontend: Automatically reloads on file changes
- Backend: Use `nodemon` (included in dev setup)
  ```bash
  npx nodemon server.js
  ```

### Database Inspection
```bash
# Connect to MongoDB
mongosh

# List databases
show databases

# Use tournament database
use tournament

# View collections
show collections

# View documents
db.students.find()
db.events.find()
db.participations.find()
db.matches.find()
```

### API Documentation
All endpoints documented in `IMPLEMENTATION_GUIDE.md`

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Event has 0 participants | Add students via CoordinatorParticipants page |
| "Not enough players" error | Need minimum 2 participants to generate draws |
| Byes appearing | Normal! If participants not power of 2, remainder get byes |
| Winner won't advance | Check match status is PENDING (not COMPLETED) |
| Seeds not working | Must assign seeds before generating draws |
| Can't add participant | Student must exist in database first (use CSV upload) |

## Performance Tips

- Use indexes on frequently queried fields (rollNo, eventId)
- Limit bracket operations to power-of-2 sizes
- Archive old tournaments to separate collection
- Cache bracket data if many concurrent viewers

## Security Notes

- Always use JWT tokens for API authentication
- Validate all inputs on backend
- Use HTTPS in production
- Never expose JWT_SECRET in code
- Rate limit API endpoints in production

## Next Steps

1. ✅ Setup backend and frontend
2. ✅ Create admin and coordinator test accounts
3. ✅ Test complete workflow with sample data
4. ✅ Verify CSV upload works
5. ✅ Test bracket generation with 3, 5, 7, 9 participants
6. ✅ Verify winner advancement logic
7. ✅ Deploy to production (Heroku/DigitalOcean for backend, Vercel for frontend)
