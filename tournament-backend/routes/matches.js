const express = require("express");
const router = express.Router();
const Match = require("../models/Match");
const Participation = require("../models/Participation");
const Event = require("../models/Event");
const auth = require("../middleware/auth");

// Debug endpoint - check raw matches
router.get("/debug/all", async (req, res) => {
  try {
    const matches = await Match.find({}).populate("eventId").limit(10);
    res.json(matches.map(m => ({
      _id: m._id,
      round: m.round,
      matchNo: m.matchNo,
      slot1: m.slot1,
      slot2: m.slot2,
      winner: m.winner,
      status: m.status,
      eventFormat: m.eventId?.format,
      eventStatus: m.eventId?.status
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Coordinator: get all PENDING matches from current round only
router.get("/today", auth("COORDINATOR"), async (req, res) => {
  try {
    // Get all LIVE events
    const liveEvents = await Event.find({ status: "LIVE" });
    const liveEventIds = liveEvents.map(e => e._id);

    if (liveEventIds.length === 0) {
      return res.json([]);
    }

    // Get all matches from LIVE events
    const matches = await Match.find({
      eventId: { $in: liveEventIds },
      status: "PENDING"  // Only show pending matches
    }).populate("eventId").sort({ round: 1, matchNo: 1 });

    // Filter out bye tracking matches (round 0) and BYE-only matches
    const filteredMatches = matches.filter(m => 
      m.round > 0 && 
      !(m.slot1 === "BYE" && m.slot2 === "BYE") &&
      !m.isByeMarker
    );

    // Resolve slot IDs to names
    const resolvedMatches = await Promise.all(filteredMatches.map(async (m) => {
      const match = m.toObject();
      const event = match.eventId;

      // Helper to resolve slot to name
      const resolveName = async (slot) => {
        if (!slot || slot === "BYE") return slot;

        try {
          if (event.format === "SINGLES") {
            // slot is rollNo, find student name
            const part = await Participation.findOne({ eventId: event._id, rollNo: slot });
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
        } catch (e) {
          console.error("Error resolving name for slot", slot, ":", e.message);
          return slot;
        }
      };

      match.slot1Name = await resolveName(match.slot1);
      match.slot2Name = await resolveName(match.slot2);
      match.winnerName = match.winner ? await resolveName(match.winner) : null;

      return match;
    }));

    console.log("Resolved matches count:", resolvedMatches.length);
    res.json(resolvedMatches);
  } catch (error) {
    console.error("Error in /matches/today:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/:matchId/winner", auth("COORDINATOR"), async (req, res) => {
  try {
    const { winner } = req.body;

    const match = await Match.findById(req.params.matchId);
    if (!match || match.status === "COMPLETED") {
      return res.status(400).json({ error: "Match already completed" });
    }

    match.winner = winner;
    match.status = "COMPLETED";
    await match.save();

    // move winner to next round
    await advanceWinner(match);

    res.json({ message: "Winner updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function advanceWinner(match) {
  try {
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
  } catch (error) {
    console.error("Error advancing winner:", error);
  }
}

module.exports = router;
