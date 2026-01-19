# Fix: `.map is not a function` Error After Deployment

## Problem
After deploying the application, users were encountering this error:
```
index-B9F7gi3N.js:16 Uncaught TypeError: f[g].map is not a function
```

## Root Cause
The backend endpoint `/draws/:eventId/bracket` returns a response with the structure:
```javascript
{
  bracket: { /* bracket data */ },
  roundStatus: { /* round status data */ }
}
```

However, three frontend components were incorrectly handling this nested response by treating the entire response object as the bracket:
```javascript
// WRONG - treating entire response as bracket
setBracket(bracketRes.data);  // bracketRes.data = { bracket: {...}, roundStatus: {...} }

// This causes bracket[round] to be undefined, and undefined.map() throws the error
```

## Affected Components
1. **PublicBracket.jsx** (Line 15)
2. **CoordinatorDashboard.jsx** (Line 37)
3. **EventBracketPage.jsx** (Already correct - handled nested response properly)

## Solution
Updated all three components to properly extract the bracket from the nested response:

### PublicBracket.jsx
```javascript
// BEFORE
const res = await api.get("/draws/" + id + "/bracket");
setBracket(res.data);

// AFTER
const res = await api.get("/draws/" + id + "/bracket");
setBracket(res.data.bracket || {});
```

### CoordinatorDashboard.jsx
```javascript
// BEFORE
const bracketRes = await api.get(`/draws/${eventId}/bracket`);
setBracket(bracketRes.data);

// AFTER
const bracketRes = await api.get(`/draws/${eventId}/bracket`);
setBracket(bracketRes.data.bracket || {});
```

### EventBracketPage.jsx (Already Correct)
```javascript
const bracketRes = await api.get(`/draws/${eventId}/bracket`);
setBracket(bracketRes.data.bracket || {});  // ✅ Already correct
setRoundStatus(bracketRes.data.roundStatus || {});
```

## Impact
- ✅ Fixes the `.map is not a function` error
- ✅ Allows tournament brackets to display correctly
- ✅ Maintains consistency across all components
- ✅ Properly extracts round status for tournament progression logic

## Files Modified
1. [tournament-frontend/src/pages/PublicBracket.jsx](tournament-frontend/src/pages/PublicBracket.jsx#L15)
2. [tournament-frontend/src/pages/CoordinatorDashboard.jsx](tournament-frontend/src/pages/CoordinatorDashboard.jsx#L37)

## Testing
After this fix:
1. Navigate to tournament bracket pages (Public, Coordinator, Event)
2. Select an event with generated draws
3. Verify brackets display without errors
4. Confirm all rounds and matches are visible
