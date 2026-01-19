const express = require("express");
const router = express.Router();
const Participation = require("../models/Participation");
const Team = require("../models/Team");
const Event = require("../models/Event");
const Match = require("../models/Match");
const { nextPowerOf2, seedMaps } = require("../utils/bracket");

const auth = require("../middleware/auth");

router.post("/:eventId/generate", auth("ADMIN"), async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    let participants = [];

    // Get participants based on format
    if (event.format === "SINGLES") {
      const list = await Participation.find({ eventId });
      participants = list.map(p => ({ id: p.rollNo, seed: p.seed }));
    } else {
      // For DOUBLES and MIXED - use participation as teams
      const list = await Participation.find({ eventId });
      participants = list.map(p => ({ id: p._id.toString(), seed: p.seed, rollNo: p.rollNo }));
    }

    const n = participants.length;
    if (n < 2) return res.status(400).json({ error: "Not enough players/teams" });

    const bracketSize = nextPowerOf2(n);
    const byes = bracketSize - n;

    // Separate seeded and unseeded
    const seeded = participants.filter(p => p.seed > 0).sort((a, b) => a.seed - b.seed); // Sort by seed ascending (1 first = strongest)
    const unseeded = participants.filter(p => p.seed === 0).sort(() => Math.random() - 0.5); // Shuffle unseeded

    // Allocate BYEs with correct preference order:
    // Priority 1: Seeded players (lower seed number first = stronger = gets BYE preference)
    // Priority 2: Unseeded players (random selection)
    const byeParticipants = [];
    const playParticipants = [];

    let byesNeeded = byes;

    // First, allocate BYEs to seeded players (in seed order: 1, 2, 3... = strongest first)
    for (let i = 0; i < seeded.length && byesNeeded > 0; i++) {
      byeParticipants.push(seeded[i]);
      byesNeeded--;
    }

    // Add remaining seeded players to play list
    for (let i = byeParticipants.filter(p => p.seed > 0).length; i < seeded.length; i++) {
      playParticipants.push(seeded[i]);
    }

    // If still need BYEs, allocate to unseeded players (randomly shuffled)
    for (let i = 0; i < unseeded.length && byesNeeded > 0; i++) {
      byeParticipants.push(unseeded[i]);
      byesNeeded--;
    }

    // Add remaining unseeded players to play list
    const byeIds = byeParticipants.map(p => p.id);
    for (let i = 0; i < unseeded.length; i++) {
      if (!byeIds.includes(unseeded[i].id)) {
        playParticipants.push(unseeded[i]);
      }
    }

    // Clear old matches
    await Match.deleteMany({ eventId });

    // Create Round 1 matches (only for players who don't have BYE)
    let matchNo = 1;
    for (let i = 0; i < playParticipants.length; i += 2) {
      const p1 = playParticipants[i];
      const p2 = playParticipants[i + 1];

      await Match.create({
        eventId,
        round: 1,
        matchNo: matchNo++,
        slot1: p1.id,
        slot2: p2?.id || "BYE",
        status: "PENDING"
      });
    }

    // Create auto-completed BYE matches for BYE participants
    // These matches have only the bye player vs blank opponent and are auto-completed
    for (let i = 0; i < byeParticipants.length; i++) {
      const byePlayer = byeParticipants[i];
      
      await Match.create({
        eventId,
        round: 1,
        matchNo: matchNo++,
        slot1: byePlayer.id,
        slot2: "BYE",
        winner: byePlayer.id,  // BYE player automatically wins
        status: "COMPLETED"     // Match is auto-completed
      });
    }

    event.status = "DRAWN";
    await event.save();

    res.json({ 
      message: "Draws generated", 
      bracketSize, 
      byes,
      byeCount: byeParticipants.length,
      playingCount: playParticipants.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Finish a round - advance BYE players and create next round
router.post("/:eventId/finish-round/:round", auth("COORDINATOR"), async (req, res) => {
  try {
    const { eventId, round } = req.params;
    const roundNum = parseInt(round);

    // Get all matches from this round
    const roundMatches = await Match.find({ eventId, round: roundNum });
    
    console.log(`Finishing Round ${roundNum} for event ${eventId}`);
    console.log("Total Round Matches:", roundMatches.length);
    
    // Check if all non-bye matches are completed
    const nonByeMatches = roundMatches.filter(m => m.slot2 !== "BYE" && m.slot2 !== "BYE_PARTICIPANTS");
    const allCompleted = nonByeMatches.every(m => m.status === "COMPLETED");

    console.log("Non-BYE Matches:", nonByeMatches.length);
    console.log("All Completed:", allCompleted);

    if (!allCompleted) {
      return res.status(400).json({ error: "Not all matches in this round are completed" });
    }

    // Get bye marker to find BYE participants
    const byeMarker = await Match.findOne({ eventId, isByeMarker: true });
    const byePlayerIds = byeMarker ? byeMarker.slot1.split(",").filter(id => id.trim()) : [];

    console.log("Bye Marker Found:", !!byeMarker);
    console.log("BYE Player IDs:", byePlayerIds);

    // Get winners from this round and bye players
    const winners = nonByeMatches
      .filter(m => m.winner)
      .map(m => m.winner);

    console.log("Winners from Round:", winners);

    const nextRoundParticipants = [...new Set([...winners, ...byePlayerIds])]; // Combine and deduplicate

    console.log("Next Round Participants Count:", nextRoundParticipants.length);
    console.log("Next Round Participants:", nextRoundParticipants);

    // Create matches for next round
    let nextMatchNo = 1;
    for (let i = 0; i < nextRoundParticipants.length; i += 2) {
      const p1 = nextRoundParticipants[i];
      const p2 = nextRoundParticipants[i + 1];

      await Match.create({
        eventId,
        round: roundNum + 1,
        matchNo: nextMatchNo++,
        slot1: p1,
        slot2: p2 || "BYE",
        status: "PENDING"
      });
    }

    res.json({ 
      message: `Round ${roundNum} finished. Round ${roundNum + 1} created with ${nextRoundParticipants.length} participants`,
      participantCount: nextRoundParticipants.length,
      byeCount: byePlayerIds.length,
      winnerCount: winners.length
    });
  } catch (error) {
    console.error("Error finishing round:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/match/:matchId/winner", auth("COORDINATOR"), async (req, res) => {
  try {
    const { matchId } = req.params;
    const { winner } = req.body;

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ error: "Match not found" });

    if (match.status === "COMPLETED")
      return res.status(400).json({ error: "Winner already set" });

    match.winner = winner;
    match.status = "COMPLETED";
    await match.save();

    // Don't auto-advance winners - wait for finish-round button
    // This ensures BYE players are included when all matches in a round are complete

    res.json({ message: "Winner recorded. Click 'Finish Round' to advance to next round" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function advanceWinner(match) {
  const nextRound = match.round + 1;
  const nextMatchNo = Math.ceil(match.matchNo / 2);

  const isSlot1 = match.matchNo % 2 === 1;

  let nextMatch = await Match.findOne({
    eventId: match.eventId,
    round: nextRound,
    matchNo: nextMatchNo
  });

  if (!nextMatch) {
    nextMatch = await Match.create({
      eventId: match.eventId,
      round: nextRound,
      matchNo: nextMatchNo,
      slot1: null,
      slot2: null,
      status: "PENDING"
    });
  }

  if (isSlot1) {
    nextMatch.slot1 = match.winner;
  } else {
    nextMatch.slot2 = match.winner;
  }

  // If both slots filled, keep it ready
  if (nextMatch.slot1 && nextMatch.slot2) {
    nextMatch.status = "PENDING";
  }

  await nextMatch.save();
}

router.get("/:eventId/bracket", async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const matches = await Match.find({ eventId }).sort({ round: 1, matchNo: 1 });

    // Resolve slot IDs to names
    const resolvedMatches = await Promise.all(matches.map(async (m) => {
      const match = m.toObject();

      // Helper to resolve slot to name
      const resolveName = async (slot) => {
        if (!slot || slot === "BYE") return slot;

        if (event.format === "SINGLES") {
          // slot is rollNo, find student name
          const part = await Participation.findOne({ eventId, rollNo: slot });
          return part ? `${part.studentName} (${part.rollNo})` : slot;
        } else {
          // slot is participation._id, get team members
          const part = await Participation.findById(slot);
          if (!part) return slot;
          
          if (part.members && part.members.length > 0) {
            return part.members.map(m => `${m.name} (${m.rollNo})`).join(" + ");
          }
          return part.studentName || slot;
        }
      };

      match.slot1Name = await resolveName(match.slot1);
      match.slot2Name = await resolveName(match.slot2);
      match.winnerName = match.winner ? await resolveName(match.winner) : null;

      return match;
    }));

    const bracket = {};

    resolvedMatches.forEach(m => {
      if (!bracket[m.round]) bracket[m.round] = [];
      bracket[m.round].push(m);
    });

    res.json(bracket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
