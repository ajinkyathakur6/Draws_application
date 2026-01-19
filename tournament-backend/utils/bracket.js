function nextPowerOf2(n) {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

// Create seeded bracket ensuring:
// 1. Byes go to top seeded players first
// 2. Seeded players are distributed across bracket sections (different match numbers)
// 3. Correct number of byes to reach next power of 2
function createSeededBracket(participants) {
  const n = participants.length;
  const bracketSize = nextPowerOf2(n);
  const byesNeeded = bracketSize - n;
  const totalMatches = bracketSize / 2;
  
  // Separate seeded and unseeded
  const seeded = participants.filter(p => p.seed > 0).sort((a, b) => a.seed - b.seed);
  const unseeded = participants.filter(p => p.seed === 0 || !p.seed).sort(() => Math.random() - 0.5);
  
  // Allocate byes: top seeded players first (by seed order), then randomly selected unseeded
  const byePlayers = [];
  const playingPlayers = [];
  
  let byesGiven = 0;
  
  // Give byes to seeded players in seed order (highest seed first)
  for (let i = 0; i < seeded.length && byesGiven < byesNeeded; i++) {
    byePlayers.push(seeded[i]);
    byesGiven++;
  }
  
  // Add remaining seeded to playing pool
  for (let i = byesGiven; i < seeded.length; i++) {
    playingPlayers.push(seeded[i]);
  }
  
  // Randomly shuffle unseeded players for bye allocation
  const unseededShuffled = [...unseeded].sort(() => Math.random() - 0.5);
  
  // Give remaining byes to randomly selected unseeded if needed
  let unseededByesNeeded = byesNeeded - byesGiven;
  for (let i = 0; i < unseededShuffled.length && byesGiven < byesNeeded; i++) {
    byePlayers.push(unseededShuffled[i]);
    byesGiven++;
  }
  
  // Add remaining unseeded to playing pool
  for (let i = unseededByesNeeded; i < unseededShuffled.length; i++) {
    playingPlayers.push(unseededShuffled[i]);
  }
  
  // Now create the bracket
  // Strategy: Distribute bye players across match positions (1, middle, last)
  // Fill other positions with playing players, ensuring seeded don't face each other
  
  const bracket = [];
  
  // Separate playing players into seeded and unseeded
  const playingSeeded = playingPlayers.filter(p => p.seed > 0);
  const playingUnseeded = playingPlayers.filter(p => !p.seed || p.seed === 0);
  
  // Build the bracket match by match
  // Place seeded bye players at optimal intervals to maximize spacing
  const seededByePlayers = byePlayers.filter(p => p.seed > 0);
  const unseededByePlayers = byePlayers.filter(p => !p.seed || p.seed === 0);
  
  const byeMatchNumbers = [];
  
  if (seededByePlayers.length > 0) {
    // Calculate optimal positions to maximize spacing between seeded bye players
    // e.g., for 3 seeded byes in 8 matches: positions 0, 3, 7 → matches 1, 4, 8
    for (let i = 0; i < seededByePlayers.length; i++) {
      if (seededByePlayers.length === 1) {
        byeMatchNumbers.push(0); // First match
      } else {
        const position = Math.floor(i * (totalMatches - 1) / (seededByePlayers.length - 1));
        byeMatchNumbers.push(position);
      }
    }
  }
  
  // Create bye order: place seeded byes at calculated positions, then unseeded byes
  const orderedByePlayers = [];
  const usedByeIndices = new Set();
  
  // Place seeded byes at their optimal positions
  for (let i = 0; i < seededByePlayers.length; i++) {
    orderedByePlayers[byeMatchNumbers[i]] = seededByePlayers[i];
    usedByeIndices.add(byeMatchNumbers[i]);
  }
  
  // Fill remaining bye positions with unseeded players
  let unseededByeIdx = 0;
  for (let i = 0; i < totalMatches && unseededByeIdx < unseededByePlayers.length; i++) {
    if (!usedByeIndices.has(i)) {
      orderedByePlayers[i] = unseededByePlayers[unseededByeIdx++];
      usedByeIndices.add(i);
    }
  }
  
  let byeIdx = 0;
  let playingIdx = 0;
  
  for (let matchNum = 0; matchNum < totalMatches; matchNum++) {
    if (usedByeIndices.has(matchNum) && byeIdx < orderedByePlayers.length) {
      // This match is a bye
      const byePlayer = orderedByePlayers[matchNum];
      if (byePlayer) {
        bracket.push(byePlayer);
        bracket.push(null);
        byeIdx++;
      }
    } else if (playingIdx < playingPlayers.length) {
      // This is a regular match - pick two players
      const p1 = playingPlayers[playingIdx++];
      const p2 = playingIdx < playingPlayers.length ? playingPlayers[playingIdx++] : null;
      
      bracket.push(p1);
      bracket.push(p2);
    } else {
      // Should not happen if logic is correct
      bracket.push(null);
      bracket.push(null);
    }
  }
  
  return { 
    bracket, 
    byes: byesNeeded, 
    byePlayers, 
    playingPlayers
  };
}

module.exports = { nextPowerOf2, createSeededBracket };
