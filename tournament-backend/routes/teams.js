const express = require("express");
const router = express.Router();
const Team = require("../models/Team");
const Event = require("../models/Event");
const Student = require("../models/Student");

// Get teams of an event
router.get("/:eventId/teams", async (req, res) => {
  const teams = await Team.find({ eventId: req.params.eventId })
    .populate("members");
  res.json(teams);
});

// Add team
router.post("/:eventId/teams", async (req, res) => {
  const { members, seed } = req.body;

  const event = await Event.findById(req.params.eventId);
  if (!event) return res.status(404).json({ message: "Event not found" });

  // VALIDATION
  if (event.format === "SINGLES" && members.length !== 1) {
    return res.status(400).json({ message: "Singles requires 1 player" });
  }

  if (event.format === "DOUBLES" && members.length !== 2) {
    return res.status(400).json({ message: "Doubles requires 2 players" });
  }

  const team = await Team.create({
    eventId: req.params.eventId,
    members,
    seed
  });

  res.json(team);
});

module.exports = router;
