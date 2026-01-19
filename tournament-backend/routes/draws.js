const express = require("express");
const router = express.Router();
const Participation = require("../models/Participation");
const Team = require("../models/Team");
const Event = require("../models/Event");
const Match = require("../models/Match");
const { nextPowerOf2, createSeededBracket } = require("../utils/bracket");

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

    // Clear ALL old matches for this event (all rounds)
    const deletedCount = await Match.deleteMany({ eventId });
    console.log(`Deleted ${deletedCount.deletedCount} old matches for event ${eventId}`);

    // Use proper seeding algorithm
    const { bracket, byes, byePlayers, playingPlayers } = createSeededBracket(participants);

    console.log(`Creating draws for ${n} participants:`);
    console.log(`- Bracket size: ${nextPowerOf2(n)}`);
    console.log(`- Byes: ${byes}`);
    console.log(`- Matches to play: ${playingPlayers.length / 2}`);

    // Create ONLY Round 1 matches from the seeded bracket
    let matchNo = 1;
    let createdMatches = 0;
    let createdByes = 0;
    
    for (let i = 0; i < bracket.length; i += 2) {
      const p1 = bracket[i];
      const p2 = bracket[i + 1];

      // If both slots are filled, create a regular match
      if (p1 && p2) {
        await Match.create({
          eventId,
          round: 1,  // EXPLICITLY Round 1 only
          matchNo: matchNo++,
          slot1: p1.id,
          slot2: p2.id,
          status: "PENDING",
          isBye: false,
          roundStatus: "ACTIVE"
        });
        createdMatches++;
      }
      // If only p1 exists, they get a bye
      else if (p1 && !p2) {
        await Match.create({
          eventId,
          round: 1,  // EXPLICITLY Round 1 only
          matchNo: matchNo++,
          slot1: p1.id,
          slot2: null,  // No opponent - blank
          winner: p1.id,  // BYE player automatically wins
          status: "COMPLETED",   // Match is auto-completed
          isBye: true,           // Mark as bye match
          roundStatus: "ACTIVE"
        });
        createdByes++;
      }
      // If only p2 exists (shouldn't happen with proper seeding, but handle it)
      else if (!p1 && p2) {
        await Match.create({
          eventId,
          round: 1,  // EXPLICITLY Round 1 only
          matchNo: matchNo++,
          slot1: p2.id,
          slot2: null,
          winner: p2.id,
          status: "COMPLETED",
          isBye: true,
          roundStatus: "ACTIVE"
        });
        createdByes++;
      }
    }

    console.log(`Created ${createdMatches} regular matches and ${createdByes} bye matches for Round 1`);

    // Verify only Round 1 was created
    const allMatches = await Match.find({ eventId });
    const round2Matches = allMatches.filter(m => m.round === 2);
    if (round2Matches.length > 0) {
      console.error(`ERROR: ${round2Matches.length} Round 2 matches were created unexpectedly!`);
    }

    event.status = "DRAWN";
    await event.save();

    const numMatches = playingPlayers.length / 2;
    const numByes = byePlayers.length;

    res.json({ 
      message: "Draws generated with proper seeding", 
      totalParticipants: n,
      bracketSize: nextPowerOf2(n),
      matches: numMatches,
      byes: numByes,
      byePlayers: byePlayers.length,
      playingPlayers: playingPlayers.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Finish a round - mark round as finished and create next round
router.post("/:eventId/finish-round/:round", auth("COORDINATOR"), async (req, res) => {
  try {
    const { eventId, round } = req.params;
    const roundNum = parseInt(round);

    // Get all matches from this round
    const roundMatches = await Match.find({ eventId, round: roundNum, roundStatus: "ACTIVE" });
    
    console.log(`Finishing Round ${roundNum} for event ${eventId}`);
    console.log("Total Round Matches:", roundMatches.length);
    
    // Check if all non-bye matches are completed
    const nonByeMatches = roundMatches.filter(m => !m.isBye);
    const allCompleted = nonByeMatches.every(m => m.status === "COMPLETED");

    console.log("Non-BYE Matches:", nonByeMatches.length);
    console.log("All Completed:", allCompleted);

    if (!allCompleted) {
      return res.status(400).json({ error: "Not all matches in this round are completed" });
    }

    // Check if next round already exists
    const existingNextRound = await Match.findOne({ eventId, round: roundNum + 1 });
    if (existingNextRound) {
      return res.status(400).json({ error: `Round ${roundNum + 1} already exists` });
    }

    // Mark all matches in this round as FINISHED
    await Match.updateMany(
      { eventId, round: roundNum },
      { $set: { roundStatus: "FINISHED" } }
    );

    // Get all winners from this round (including bye winners) - use Set to ensure uniqueness
    const winners = [...new Set(
      roundMatches
        .filter(m => m.winner)
        .map(m => m.winner)
    )];

    console.log("Winners advancing to next round:", winners);

    // If only 1 winner, tournament is complete
    if (winners.length === 1) {
      const event = await Event.findById(eventId);
      event.status = "COMPLETED";
      await event.save();
      
      return res.json({ 
        message: "Tournament completed!",
        winner: winners[0],
        tournamentComplete: true
      });
    }

    // Create matches for next round
    let nextMatchNo = 1;
    for (let i = 0; i < winners.length; i += 2) {
      const p1 = winners[i];
      const p2 = winners[i + 1];

      // Check if p2 exists - if not, p1 gets a bye
      if (p2) {
        // Regular match
        await Match.create({
          eventId,
          round: roundNum + 1,
          matchNo: nextMatchNo++,
          slot1: p1,
          slot2: p2,
          status: "PENDING",
          isBye: false,
          roundStatus: "ACTIVE"
        });
      } else {
        // Bye match - auto-complete
        await Match.create({
          eventId,
          round: roundNum + 1,
          matchNo: nextMatchNo++,
          slot1: p1,
          slot2: null,
          winner: p1,
          status: "COMPLETED",
          isBye: true,
          roundStatus: "ACTIVE"
        });
      }
    }

    res.json({ 
      message: `Round ${roundNum} finished. Round ${roundNum + 1} created with ${winners.length} participants`,
      participantCount: winners.length,
      nextRound: roundNum + 1
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

router.get("/:eventId/bracket", async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    // Get all matches - both active and finished rounds
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
    const roundStatus = {};

    resolvedMatches.forEach(m => {
      if (!bracket[m.round]) {
        bracket[m.round] = [];
        roundStatus[m.round] = m.roundStatus;
      }
      bracket[m.round].push(m);
    });

    // Filter out future rounds that shouldn't be accessible
    // Only show Round 1, or rounds where previous round is FINISHED
    const filteredBracket = {};
    const filteredRoundStatus = {};
    const rounds = Object.keys(bracket).map(r => parseInt(r)).sort((a, b) => a - b);
    
    for (const round of rounds) {
      if (round === 1) {
        // Always include Round 1
        filteredBracket[round] = bracket[round];
        filteredRoundStatus[round] = roundStatus[round];
      } else {
        // Only include if previous round is FINISHED
        const prevRound = round - 1;
        if (roundStatus[prevRound] === "FINISHED") {
          filteredBracket[round] = bracket[round];
          filteredRoundStatus[round] = roundStatus[round];
        }
      }
    }

    res.json({ bracket: filteredBracket, roundStatus: filteredRoundStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
