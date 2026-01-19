const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const Team = require("../models/Team");
const auth = require("../middleware/auth");

/* CREATE EVENT */
router.post("/", auth("ADMIN"), async (req, res) => {
  const { sport, category, format } = req.body;

  if (category === "MIXED" && format !== "DOUBLES") {
    return res.status(400).json({
      message: "Mixed category must be doubles"
    });
  }

  const event = await Event.create({ sport, category, format });
  res.json(event);
});

/* GET ALL EVENTS */
router.get("/", async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

/* GET EVENT */
router.get("/:id", async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });
  res.json(event);
});

/* UPDATE EVENT STATUS */
router.put("/:id/status", auth("ADMIN"), async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["REGISTRATION", "DRAWN", "LIVE", "COMPLETED"];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const event = await Event.findByIdAndUpdate(req.params.id, { status }, { new: true });
  res.json(event);
});

/* GET TEAMS OF EVENT */
router.get("/:id/teams", async (req, res) => {
  const teams = await Team.find({ eventId: req.params.id })
    .populate("members");
  res.json(teams);
});

/* ADD TEAM */
router.post("/:id/teams", auth("ADMIN"), async (req, res) => {
  const { members, seed } = req.body;

  if (!members || members.length === 0) {
    return res.status(400).json({ message: "Members required" });
  }

  const team = await Team.create({
    eventId: req.params.id,
    members,
    seed
  });

  res.json(team);
});

module.exports = router;
