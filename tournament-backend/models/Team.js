const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    }
  ],
  seed: {
    type: Number,
    default: null
  }
});

module.exports = mongoose.model("Team", teamSchema);
