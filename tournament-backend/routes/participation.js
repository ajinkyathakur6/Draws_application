const express = require("express");
const router = express.Router();
const Participation = require("../models/Participation");
const auth = require("../middleware/auth");
const Student = require("../models/Student");
const Event = require("../models/Event");

// Coordinator: Add participant to event
router.post("/", auth("COORDINATOR"), async (req, res) => {
  try {
    const { eventId, rollNo, members, seed } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(400).json({ error: "Event not found" });
    }

    // Prevent adding participants if event is not in REGISTRATION status
    if (event.status !== "REGISTRATION") {
      return res.status(400).json({ error: "Cannot add participants after draws have been generated. Event status: " + event.status });
    }

    // For SINGLES format
    if (event.format === "SINGLES") {
      if (!rollNo) {
        return res.status(400).json({ error: "Roll number required for singles" });
      }

      const student = await Student.findOne({ rollNo });
      if (!student) {
        return res.status(400).json({ error: "Student not found" });
      }

      const exists = await Participation.findOne({ eventId, rollNo });
      if (exists) {
        return res.status(400).json({ error: "Student already added to this event" });
      }

      const p = await Participation.create({
        eventId,
        studentId: student._id,
        rollNo,
        studentName: student.name,
        members: null,
        seed: seed || 0
      });

      res.json(p);
    }
    // For DOUBLES or MIXED format (teams)
    else {
      if (!members || members.length !== 2) {
        return res.status(400).json({ error: "Team must have exactly 2 players for " + event.format });
      }

      // Fetch both students
      const student1 = await Student.findOne({ rollNo: members[0] });
      const student2 = await Student.findOne({ rollNo: members[1] });

      if (!student1 || !student2) {
        return res.status(400).json({ error: "One or both students not found" });
      }

      if (members[0] === members[1]) {
        return res.status(400).json({ error: "Team members must be different" });
      }

      // Check if either player already in this event
      const existingP1 = await Participation.findOne({ eventId, rollNo: members[0] });
      const existingP2 = await Participation.findOne({ eventId, rollNo: members[1] });

      if (existingP1 || existingP2) {
        return res.status(400).json({ error: "One or both players already in this event" });
      }

      const p = await Participation.create({
        eventId,
        studentId: student1._id,
        rollNo: members[0],
        studentName: student1.name,
        members: [
          { rollNo: members[0], name: student1.name },
          { rollNo: members[1], name: student2.name }
        ],
        seed: seed || 0
      });

      res.json(p);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single participation by ID
router.get("/id/:participationId", async (req, res) => {
  try {
    const part = await Participation.findById(req.params.participationId);
    if (!part) return res.status(404).json({ error: "Participation not found" });
    res.json(part);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get participants of an event
router.get("/:eventId", async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });
    
    const list = await Participation.find({ eventId: req.params.eventId }).populate("studentId");
    
    // Format response based on event format
    const formatted = list.map(p => ({
      ...p.toObject(),
      isSingles: event?.format === "SINGLES",
      isDoubles: event?.format === "DOUBLES" || event?.format === "MIXED"
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Update seed for seeded tournament
router.put("/:id/seed", auth("ADMIN"), async (req, res) => {
  try {
    const { seed } = req.body;
    await Participation.findByIdAndUpdate(req.params.id, { seed });
    res.json({ message: "Seed updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete participant
router.delete("/:id", auth("COORDINATOR"), async (req, res) => {
  try {
    await Participation.findByIdAndDelete(req.params.id);
    res.json({ message: "Participant removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
