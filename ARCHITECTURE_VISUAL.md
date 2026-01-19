# Tournament Draw App - Visual Architecture & Flow

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     TOURNAMENT DRAW APP                     │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
          ┌─────────▼────────┐  ┌──────▼──────────┐
          │  FRONTEND (React)│  │ BACKEND (Node)  │
          │   + Vite + TW    │  │  + Express + DB │
          └─────────┬────────┘  └──────┬──────────┘
                    │                   │
        ┌───────────┼───────────┐       │
        │           │           │       │
    ┌───▼──┐    ┌──▼───┐  ┌───▼──┐   │
    │ Admin│    │Coord │  │Public │   │
    │Pages │    │Pages │  │Pages  │   │
    └───┬──┘    └──┬───┘  └───┬──┘   │
        │          │          │       │
        │          │          │       │
        └──────────┼──────────┘       │
                   │                  │
                   │  HTTP/REST       │
                   └──────────────────┤
                                      │
                        ┌─────────────▼────────────┐
                        │    API ENDPOINTS         │
                        │  (/api/students, etc)   │
                        └─────────────┬────────────┘
                                      │
                        ┌─────────────▼────────────┐
                        │    MONGODB DATABASE      │
                        │  (Students, Events,      │
                        │   Participation, Matches)│
                        └──────────────────────────┘
```

## 📊 Database Schema Relationships

```
┌──────────────────┐
│     STUDENT      │
├──────────────────┤
│ _id (Primary)    │
│ rollNo (Unique)  │ ◄──┐
│ name             │    │
│ department       │    │
│ year             │    │
└──────────────────┘    │
                        │
                        │
┌──────────────────────────────────────┐
│        PARTICIPATION                 │
├──────────────────────────────────────┤
│ _id (Primary)                        │
│ eventId (ref: Event)                 │
│ studentId (ref: Student) ────────────┤
│ rollNo                               │  ◄── Denormalized
│ studentName                          │
│ seed (0 = unseeded)                  │
└──────────────┬───────────────────────┘
               │
               │
┌──────────────▼──────────┐         ┌──────────────────┐
│        EVENT            │         │  MATCH           │
├─────────────────────────┤         ├──────────────────┤
│ _id (Primary)           │         │ _id (Primary)    │
│ sport                   │◄────────│ eventId (ref)    │
│ category                │         │ round            │
│ format                  │         │ matchNo          │
│ status                  │         │ slot1 (rollNo)   │
│ (REGISTRATION,          │         │ slot2 (rollNo)   │
│  DRAWN,                 │         │ winner (rollNo)  │
│  LIVE,                  │         │ status           │
│  COMPLETED)             │         │ (PENDING,        │
└─────────────────────────┘         │  COMPLETED)      │
                                    └──────────────────┘
```

## 🔄 Data Flow Diagram

```
CSV FILE (students)
    │
    ▼
[Admin CSV Upload]
    │
    ▼
DATABASE STUDENTS
    │
    ├─────────────────────────┐
    │                         │
    ▼                         ▼
[Create Event]         [Coordinator adds]
    │                  [to event]
    ▼                         │
DATABASE EVENTS               ▼
    │                  DATABASE PARTICIPATION
    ├─────────────────────────┤
    │                         │
    ▼                         │
[Admin sets seeds]◄──────────┘
    │
    ▼
[Admin generates draws]
    │
    ├──────────────┬─────────────┐
    │              │             │
    ▼              ▼             ▼
[Calculate]  [Assign byes] [Place seeds]
  bracket
    │
    ▼
DATABASE MATCHES (Round 1)
    │
    ├──────────────────────────────────┐
    │                                  │
    ▼                                  ▼
[Auto-complete]              [Coordinator]
[BYE matches]                [records winners]
    │                              │
    ▼                              ▼
[Set COMPLETED]         [Auto advance to next round]
[Set winner]                    │
    │                          ▼
    │                  DATABASE MATCHES (Round 2)
    │                          │
    └──────────────┬───────────┘
                   │
                   ▼
            [Repeat for each round]
                   │
                   ▼
          [CHAMPION DETERMINED]
                   │
                   ▼
         [PUBLIC VIEWS BRACKET]
```

## 👥 User Role Flow

```
┌──────────────────────────────────────────────────────┐
│                    THREE ROLES                       │
└──────────────────────────────────────────────────────┘
         │                  │                  │
    ┌────▼────┐        ┌───▼────┐        ┌───▼────┐
    │  ADMIN  │        │COORD   │        │ PUBLIC │
    └────┬────┘        └───┬────┘        └───┬────┘
         │                 │                 │
    1. Upload CSV     1. Add students    1. View bracket
    2. Create event   2. Remove students 2. See winners
    3. Set seeds      3. View bracket    3. Watch progress
    4. Generate       4. Record winners
       draws          5. Auto advance
    5. Update status
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                    SHARED DATABASE
```

## 🎮 UI Navigation Map

```
LOGIN PAGE
    │
    ├─────────────────┬──────────────────┬─────────────────┐
    │                 │                  │                 │
    ▼                 ▼                  ▼                 ▼
[ADMIN]          [COORDINATOR]      [PUBLIC]      [HOME (Bracket List)]
    │                 │                 │                 │
    ├─Students        ├─Dashboard       │                 │
    │ ├─Upload CSV    │ ├─Select Event  │                 │
    │ └─List          │ ├─View Bracket  │                 │
    │                 │ └─Record Winner │                 │
    ├─Events          │                 │                 │
    │ ├─Create        ├─Add Participants├─View Bracket───┘
    │ └─List          │ ├─Search        │
    │                 │ └─Add/Remove    │
    ├─Participants    │                 │
    │ ├─Manage        └─Matches         │
    │ ├─Set Seeds       └─(Future)      │
    │ └─Generate Draws                  │
    │                                   │
    └─Brackets                          │
      └─View Brackets                   │
         └─Select Event──────────────────┘
```

## 🎯 Tournament Round Generation

```
COORDINATOR ADDS 5 STUDENTS
            │
            ▼
┌─────────────────────────┐
│   BRACKET GENERATION    │
├─────────────────────────┤
│ Input: 5 participants   │
│ • Seed 1: Player A      │
│ • Seed 2: Player B      │
│ • Seed 3: Player C      │
│ • No seed: Player D     │
│ • No seed: Player E     │
└────────┬────────────────┘
         │
    ┌────▼────────────────────┐
    │ Calculate bracket size  │
    │ nextPowerOf2(5) = 8     │
    │ Byes = 8 - 5 = 3        │
    └────┬───────────────────┘
         │
    ┌────▼────────────────────────┐
    │ Place seeded players        │
    │ • A at position 0           │
    │ • B at position 7           │
    │ • C at position 3           │
    └────┬───────────────────────┘
         │
    ┌────▼────────────────────────┐
    │ Place unseeded players      │
    │ • D at position 1           │
    │ • E at position 6           │
    │ • Others get BYE            │
    └────┬───────────────────────┘
         │
         ▼
    ROUND 1 CREATED
    ┌─────────────────────────────────┐
    │ M1: A vs BYE → Auto-advance A   │
    │ M2: D vs [BYE] → Auto-advance D │
    │ M3: C vs BYE → Auto-advance C   │
    │ M4: E vs B → PENDING            │
    └────┬────────────────────────────┘
         │
    [COORDINATOR SELECTS WINNER FOR M4]
         │ B wins
    [B ADVANCES]
         │
         ▼
    ROUND 2 CREATED (AUTOMATIC)
    ┌──────────────────────┐
    │ M1: A vs D → PENDING │
    │ M2: C vs B → PENDING │
    └────┬─────────────────┘
         │
         ▼
    [REPEAT PROCESS]
         │
         ▼
    CHAMPION DETERMINED
```

## 🔑 Key Algorithms Visualization

### 1. Seeding Position Placement

```
For 8-bracket:
Positions: [0, 1, 2, 3, 4, 5, 6, 7]
Seeds:     [1, -, -, 3, 4, -, -, 2]

Visual:
┌─────────────────────────────┐
│ BRACKET POSITIONS           │
├─────────────────────────────┤
│ 0: Seed 1 (strongest)       │
│ 1: Unseeded                 │
│ 2: Unseeded                 │
│ 3: Seed 3                   │
│ 4: Seed 4                   │
│ 5: Unseeded                 │
│ 6: Unseeded                 │
│ 7: Seed 2 (2nd strongest)   │
└─────────────────────────────┘

Why?
- Seed 1 & 2 at opposite ends
- Ensures they don't meet until finals
- Weakest seeds get byes
- Balanced bracket
```

### 2. Winner Advancement Algorithm

```
MATCH INFORMATION:
├─ Match No: 3 (Round 1)
├─ Slot 1: Player C
├─ Slot 2: BYE

CALCULATION:
├─ nextRound = 1 + 1 = 2
├─ nextMatchNo = ceil(3 / 2) = 2
├─ isSlot1 = (3 % 2 === 1) = true

RESULT:
└─ Round 2, Match 2, Slot 1 = Winner

NEXT MATCH CREATED:
R2 M2:
├─ Slot 1: C (from R1 M3)
├─ Slot 2: [waiting for R1 M4 winner]
└─ Status: PENDING (waiting for other slot)
```

### 3. Bye Auto-Completion

```
MATCH DETECTION:
├─ Slot 1: "BYE"
├─ Slot 2: Player X

AUTO-COMPLETE LOGIC:
├─ winner = Slot 2 (Player X)
├─ status = COMPLETED
└─ Auto-advance Player X (no coordinator needed)
```

## 📈 Scalability

```
System can handle:
├─ 2-64 participants (power of 2 brackets)
├─ Multiple concurrent tournaments
├─ Unlimited participants per event
├─ Multiple sport categories
├─ Automatic bye handling at any scale

Tournament Size Examples:
├─  5 players → 8-bracket (3 byes)
├─ 10 players → 16-bracket (6 byes)
├─ 20 players → 32-bracket (12 byes)
├─ 50 players → 64-bracket (14 byes)
└─ And beyond...
```

## 🔐 Security Flow

```
REQUEST
  │
  ▼
[JWT Authentication]
  │ Valid token?
  ├─ Yes ───────────▶ [Check Role]
  │                      │
  │                      ├─ ADMIN? ────────▶ [Admin Operations]
  │                      │
  │                      ├─ COORDINATOR? ──▶ [Coordinator Operations]
  │                      │
  │                      └─ PUBLIC? ───────▶ [View-Only Operations]
  │
  └─ No ─────────────▶ [Return 401 Unauthorized]
```

## 📊 Data Validation Flow

```
INPUT DATA
  │
  ├─ Student Upload
  │  ├─ Check: rollNo not duplicate
  │  ├─ Check: required fields present
  │  └─ Validate: CSV format
  │
  ├─ Event Creation
  │  ├─ Check: valid sport
  │  ├─ Check: valid category
  │  ├─ Check: valid format
  │  └─ Check: MIXED must be DOUBLES
  │
  ├─ Add Participant
  │  ├─ Check: student exists
  │  ├─ Check: event exists
  │  ├─ Check: not already added
  │  └─ Validate: rollNo format
  │
  ├─ Generate Draws
  │  ├─ Check: 2+ participants
  │  ├─ Check: event status = REGISTRATION
  │  └─ Calculate: bye positions
  │
  └─ Record Winner
     ├─ Check: match exists
     ├─ Check: match status = PENDING
     ├─ Check: winner in slot1 or slot2
     └─ Validate: winner exists
```

---

This visual overview helps understand the complete system architecture, data flow, and user interactions! 🎯
