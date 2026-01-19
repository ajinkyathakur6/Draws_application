const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  round: Number,
  matchNo: Number,
  slot1: String,
  slot2: String,
  winner: String,
  status: {
    type: String,
    enum: ["PENDING", "COMPLETED"],
    default: "PENDING"
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Match", matchSchema);
