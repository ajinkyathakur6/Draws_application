const mongoose = require("mongoose");

const participationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  rollNo: String,
  studentName: String,
  members: [
    {
      rollNo: String,
      name: String
    }
  ],
  seed: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Participation", participationSchema);
