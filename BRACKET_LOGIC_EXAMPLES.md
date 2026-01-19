# Tournament Bracket Logic - Visual Examples

## Bye Allocation Strategy

### Priority Order
1. **Highest Seed First** → Seed 1, 2, 3... get byes in seed order
2. **Random Unseeded** → Remaining byes go to randomly selected unseeded players (NOT sequential)

### Seeded Bye Positioning
- Seeded bye players are placed at **maximally spaced match numbers**
- Formula: `position = floor(i * (totalMatches - 1) / (seededByeCount - 1))`
- Example with 8 matches and 3 seeded byes: matches **1, 4, 8** (not 1, 2, 3)

### Winner Recording Flow
1. Coordinators record winners via **"Today's Matches"** page only
2. Confirmation popup prevents accidental selection
3. **Finish Round** button on brackets page creates next round
4. Future rounds only visible after previous round completion

---

## Example 1: 11 Participants (3 Seeded, 8 Unseeded)

### Participants
```
1. Rahul Sharma (Seed: 1)
2. Priya Singh (Seed: 2)
3. Amit Kumar (Seed: 3)
4. Sneha Patel (Seed: 0 - unseeded)
5. Vikas Gupta (Seed: 0 - unseeded)
```

### Bracket Size Calculation
```
5 participants
nextPowerOf2(5) = 8
Byes = 8 - 5 = 3
```

### Seeding Positions (8-bracket)
```
Seed positions: [0, 7, 3, 4]
0 → Seed 1 (Rahul) at position 0
7 → Seed 2 (Priya) at position 7
3 → Seed 3 (Amit) at position 3
4 → Unseeded filled at position 4
```

### Initial Bracket
```
Round 1:
Match 1: Rahul (Seed 1)    vs  [BYE]        → Rahul auto-advances
Match 2: [BYE]             vs  Sneha        → Sneha auto-advances
Match 3: Amit (Seed 3)     vs  [BYE]        → Amit auto-advances
Match 4: Vikas             vs  Priya (Seed 2)

Round 2:
Match 1: Rahul             vs  Sneha
Match 2: Amit              vs  [winner of Match 4]

Round 3:
Match 1: [winner M1]       vs  [winner M2]  → CHAMPION
```

### Match Status
```
Match 1: COMPLETED (bye auto-advance)
Match 2: COMPLETED (bye auto-advance)
Match 3: COMPLETED (bye auto-advance)
Match 4: PENDING (awaiting winner)

Round 2 matches created only after Round 1 winners determined
```

## Example 2: 7 Participants → 8 Bracket Size

### Participants
```
1. Player A (Seed: 1)
2. Player B (Seed: 2)
3. Player C (Seed: 0)
4. Player D (Seed: 0)
5. Player E (Seed: 0)
6. Player F (Seed: 0)
7. Player G (Seed: 0)
```

### Seeding
```
Seeded: [A, B] at positions [0, 7]
Unseeded: [C, D, E, F, G]
Byes: 1 (one position doesn't get filled)

Slot placement:
0: A (Seed 1)
1: C (Unseeded)
2: D (Unseeded)
3: E (Unseeded)
4: BYE
5: F (Unseeded)
6: G (Unseeded)
7: B (Seed 2)
```

### Bracket
```
Match 1: A      vs  C       (A likely wins)
Match 2: D      vs  E       (Competitive)
Match 3: F      vs  G       (Competitive)
Match 4: [BYE]  vs  B       → B advances (bye on left)
```

## Example 3: 16 Participants → 16 Bracket (Power of 2)

### Perfect Bracket
```
If you have exactly 16 participants:
- No byes needed
- All 8 first round matches are contested
- All 4 second round matches are contested
- All 2 semi-finals are contested
- 1 final match

Rounds: 4 total
First Round: 16 → 8 winners
Second Round: 8 → 4 winners
Semi-Finals: 4 → 2 winners
Finals: 2 → 1 winner
```

## Bye Assignment Logic

### Rule
Byes are given to **unseeded players** to fill bracket to power of 2.

### Why Unseeded Get Byes?
- Top seeds (seeded players) get direct matches
- Lower seeds/unseeded get advantage of bye
- Balances bracket disadvantage for lower-ranked players

### Automatic Advancement
```javascript
if (slot1 === "BYE" && slot2 !== "BYE") {
  winner = slot2;
  status = "COMPLETED";
}
// Match auto-completes without coordinator action
```

## Seed Position Strategy

### For 8-bracket Seeding Positions
```
[0, 7, 3, 4]

Position 0: Seed 1 (strongest)
Position 7: Seed 2 (2nd strongest)
Position 3: Seed 3 (3rd strongest)
Position 4: Seed 4 (4th strongest)

Reasoning:
- Seeds 1 & 2 at opposite ends
- Ensures they don't meet until finals (if both win)
- Seeds 3 & 4 also separated
- Unseeded fill middle positions
```

### For 16-bracket Seeding Positions
```
[0, 15, 7, 8, 3, 12, 4, 11]

Seed 1: Position 0
Seed 2: Position 15
Seed 3: Position 7
Seed 4: Position 8
Seed 5: Position 3
Seed 6: Position 12
Seed 7: Position 4
Seed 8: Position 11
```

## Round Advancement Algorithm

### Match Win Flow
```
Coordinator records winner for Match 1 (Round 1, MatchNo 1)
↓
System calculates:
  - nextRound = 1 + 1 = 2
  - nextMatchNo = ceil(1 / 2) = 1
  - isSlot1 = (1 % 2 === 1) = true
↓
Create/Find Round 2, Match 1
↓
Place winner in slot1 (because isSlot1 = true)
↓
If both slots filled → Mark PENDING (ready to play)
If one slot empty → Keep status as is (waiting for other winner)
```

### Match Numbering
```
Round 1: 8 matches (1-8)
Round 2: 4 matches (1-4)
Round 3: 2 matches (1-2)
Round 4: 1 match (1) - FINAL

Example progression:
R1 M1 → R2 M1 (winner of R1 M1 goes to slot1)
R1 M2 → R2 M1 (winner of R1 M2 goes to slot2)
R2 M1 → R3 M1 (winner of R2 M1 goes to slot1)
R2 M2 → R3 M1 (winner of R2 M2 goes to slot2)
R3 M1 → R4 M1 (winner of R3 M1 goes to slot1)
R3 M2 → R4 M1 (winner of R3 M2 goes to slot2)
```

## Data Flow Example

### Initial State (5 participants)
```json
Participants:
[
  { rollNo: "A001", seed: 1 },
  { rollNo: "A002", seed: 2 },
  { rollNo: "A003", seed: 3 },
  { rollNo: "A004", seed: 0 },
  { rollNo: "A005", seed: 0 }
]
```

### After Draw Generation
```json
Matches Created:

// Round 1
{
  eventId: "...",
  round: 1,
  matchNo: 1,
  slot1: "A001",
  slot2: "BYE",
  winner: "A001",
  status: "COMPLETED"
}

{
  eventId: "...",
  round: 1,
  matchNo: 2,
  slot1: "BYE",
  slot2: "A004",
  winner: "A004",
  status: "COMPLETED"
}

{
  eventId: "...",
  round: 1,
  matchNo: 3,
  slot1: "A003",
  slot2: "BYE",
  winner: "A003",
  status: "COMPLETED"
}

{
  eventId: "...",
  round: 1,
  matchNo: 4,
  slot1: "A005",
  slot2: "A002",
  winner: null,
  status: "PENDING"
}
```

### After First Winner Recorded (A002 beats A005)
```json
Matches Created:

// Round 1 - Match 4 COMPLETED
{
  round: 1,
  matchNo: 4,
  slot1: "A005",
  slot2: "A002",
  winner: "A002",
  status: "COMPLETED"
}

// Round 2 - Match 2 Created (winner of M3 & M4)
{
  round: 2,
  matchNo: 2,
  slot1: "A003",
  slot2: "A002",
  winner: null,
  status: "PENDING"
}
```

### Final (All Winners Through)
```
Winner of (A001 vs A004) = A001
Winner of (A003 vs A002) = A003

Final Round:
A001 vs A003

Championship to the winner!
```

## Bracket Size Reference

| Participants | Bracket Size | Byes | Round 1 Matches |
|---|---|---|---|
| 2 | 2 | 0 | 1 |
| 3 | 4 | 1 | 2 |
| 4 | 4 | 0 | 2 |
| 5 | 8 | 3 | 4 |
| 6 | 8 | 2 | 4 |
| 7 | 8 | 1 | 4 |
| 8 | 8 | 0 | 4 |
| 9 | 16 | 7 | 8 |
| 16 | 16 | 0 | 8 |
| 17 | 32 | 15 | 16 |
| 32 | 32 | 0 | 16 |
| 33 | 64 | 31 | 32 |
| 64 | 64 | 0 | 32 |

## Visual Tournament Tree (5 Participants Example)

```
                          CHAMPION
                              ↑
                    ┌─────────┴─────────┐
                    ↑                   ↑
                R3 M1: A001 vs A003   (creates Round 3)
              
        ┌─────────┴─────────┐         ┌─────────┴─────────┐
        ↑                   ↑         ↑                   ↑
   R2 M1           R2 M2      (Round 2 matches)
   A001 vs A004    A003 vs A002
   
   ↓                ↓          ↓                ↓
┌──┴──┐           ┌──┴──┐   ┌──┴──┐           ┌──┴──┐
A001  BYE    BYE  A004  A003 BYE   A005       A002
(R1)  (R1)   (R1) (R1)  (R1) (R1)  (R1)       (R1)

Round 1 Matches:
1. A001 vs BYE     → Auto-advance A001
2. BYE vs A004     → Auto-advance A004
3. A003 vs BYE     → Auto-advance A003
4. A005 vs A002    → Manual winner selection
```

## Key Takeaways

1. **Bracket Sizing**: Always rounds up to next power of 2
2. **Bye Placement**: Unseeded players get byes, top seeds get matches
3. **Seeding Strategy**: Top seeds placed opposite ends to avoid early meetings
4. **Auto-Advancement**: BYE matches complete automatically
5. **Round Creation**: Next round matches created on-demand
6. **Winner Placement**: Calculated based on original match number
7. **Status Tracking**: PENDING until both slots filled, then ready to play

This ensures fair and strategic tournament bracket generation!
