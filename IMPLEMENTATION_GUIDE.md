# Tournament Draw App - Implementation Guide

## Overview
This application manages a complete tournament bracket system with:
- **Admin**: Uploads students via CSV, sets up events, manages seeding, and generates draws
- **Coordinator**: Adds participants to events and records match winners
- **Public**: View tournament brackets

## Complete Workflow

### 1. Admin - Student Management
**Route**: `POST /api/students/bulk-upload`
**File**: `tournament-backend/routes/students.js`
- Upload CSV with columns: `rollNo`, `name`, `department`, `year`
- Admin sees all uploaded students in the Students Master page

### 2. Admin - Event Creation
**Route**: `POST /api/events`
**File**: `tournament-backend/routes/events.js`
- Create event with:
  - Sport: Badminton, Table Tennis, Carrom, etc.
  - Category: MENS, WOMENS, MIXED
  - Format: SINGLES (MIXED forces DOUBLES)
- Event status starts as: REGISTRATION

### 3. Coordinator - Add Participants
**Route**: `POST /api/participation`
**File**: `tournament-backend/routes/participation.js`
- Coordinator selects event
- Searches and adds students by roll number
- Participants are now registered for the event
- No seeding yet (seed defaults to 0)

### 4. Admin - Set Seeds (Optional)
**Route**: `PUT /api/participation/:id/seed`
- Admin assigns seed numbers (1 = best, 2 = second best, etc.)
- Seeds are used when generating brackets
- Seeded players placed at strategic positions
- Unseeded players fill remaining slots or get byes

### 5. Admin - Generate Draws
**Route**: `POST /api/draws/:eventId/generate`
**File**: `tournament-backend/routes/draws.js`
- **Bracket Size**: Rounds up to next power of 2 (2, 4, 8, 16, 32, 64)
- **Byes**: If participants < power of 2, unseeded players get byes
- **Seeding Logic**:
  - Uses seed maps from `utils/bracket.js`
  - Seeded players placed at seed positions
  - Unseeded fill remaining slots
- **Auto-Advance**: Players with bye match auto-advance
- Event status changes to: DRAWN

### 6. Coordinator - Record Winners
**Route**: `POST /api/draws/match/:matchId/winner`
**File**: `tournament-backend/routes/draws.js`
- Coordinator selects pending match
- Chooses winner (slot1 or slot2)
- Winner automatically advances to next round
- System creates next round match automatically

### 7. View Bracket
**Route**: `GET /api/draws/:eventId/bracket`
- Returns bracket structure: `{ round: [matches] }`
- Shows all rounds, slots, and winners
- Public and coordinators can view

## Database Models

### Student
```javascript
{
  rollNo: String (unique),
  name: String,
  gender: String,
  department: String,
  year: String
}
```

### Event
```javascript
{
  sport: String,
  category: "MENS" | "WOMENS" | "MIXED",
  format: "SINGLES" | "DOUBLES",
  status: "REGISTRATION" | "DRAWN" | "LIVE" | "COMPLETED"
}
```

### Participation
```javascript
{
  eventId: ObjectId,
  studentId: ObjectId,
  rollNo: String,
  studentName: String,
  seed: Number (0 = unseeded)
}
```

### Match
```javascript
{
  eventId: ObjectId,
  round: Number,
  matchNo: Number,
  slot1: String (rollNo or BYE),
  slot2: String (rollNo or BYE),
  winner: String (rollNo),
  status: "PENDING" | "COMPLETED"
}
```

## Frontend Components

### Admin Pages
- **AdminStudents**: CSV upload for bulk student import
- **AdminEvents**: Create and manage events
- **AdminEventParticipants**: View participants, set seeds, generate draws

### Coordinator Pages
- **CoordinatorDashboard**: View events, select participants, record winners
- **CoordinatorParticipants**: Add students to specific event

### Public Pages
- **EventBracketPage**: View tournament bracket (all)
- **PublicBracket**: List all events (home page)

## Key Features

### Bye Logic
- If 5 participants in singles: bracket size = 8
  - 3 participants get byes (marked as "BYE" in slot)
  - Match auto-completes when one side is BYE
  - Winner advances automatically

### Seeding Strategy
- **Top seeds** (1, 2, 3, 4...): Placed at positions 0, 31, 15, 16... (for 32)
- **Unseeded**: Fill remaining slots
- Ensures top seeds don't meet until later rounds

### Match Advancement
- When winner recorded: automatically creates next round match
- Correctly places winner in slot1 or slot2 of next match
- Both slots must be filled before match is marked PENDING

## API Endpoints Reference

### Students
- `POST /api/students/bulk-upload` - CSV upload (ADMIN)
- `GET /api/students` - List all (ADMIN)
- `GET /api/students/search/:roll` - Search by roll no

### Events
- `POST /api/events` - Create (ADMIN)
- `GET /api/events` - List all
- `GET /api/events/:id` - Get one
- `PUT /api/events/:id/status` - Update status (ADMIN)

### Participation
- `POST /api/participation` - Add participant (COORDINATOR)
- `GET /api/participation/:eventId` - List event participants
- `PUT /api/participation/:id/seed` - Set seed (ADMIN)
- `DELETE /api/participation/:id` - Remove participant (COORDINATOR)

### Draws
- `POST /api/draws/:eventId/generate` - Generate bracket (ADMIN)
- `GET /api/draws/:eventId/bracket` - Get bracket structure
- `POST /api/draws/match/:matchId/winner` - Record winner (COORDINATOR)

### Matches
- `GET /api/matches/today` - Pending matches (COORDINATOR)
- `PUT /api/matches/:matchId/winner` - Record winner (COORDINATOR)

## Troubleshooting

### "Not enough players" error
- At least 2 participants required to generate draws
- Add more participants via CoordinatorParticipants

### Byes appearing unexpectedly
- This is correct! If you have 5 players, bracket needs 8 slots = 3 byes
- Byes are given to unseeded players
- See bye logic above

### Winner doesn't advance
- Check that match status is "PENDING" (not already "COMPLETED")
- Verify both slots are filled
- Wait for page refresh to see next round

### Seeds not affecting bracket
- Only assigned seeds (1, 2, 3...) are used, not 0
- Use AdminEventParticipants to assign seeds before generating draws
- Cannot change seeds after draws are generated

## Testing the Flow

1. Login as ADMIN
2. Go to Students → Upload CSV with sample students
3. Go to Events → Create "Badminton Mens Singles"
4. Go to Admin/events → Click "Participants"
5. Logout, login as COORDINATOR
6. Go to Coordinator Dashboard
7. Select event → Click "Add Participants"
8. Add 5 students (will get 3 byes)
9. Login as ADMIN again
10. AdminEventParticipants → Assign seeds → Generate Draws
11. Login as COORDINATOR
12. CoordinatorDashboard → View bracket → Select match → Choose winner
13. See winner advance to next round
14. View as public to see bracket
