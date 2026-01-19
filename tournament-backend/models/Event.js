const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  sport: String,
  category: {
    type: String,
    enum: ["MENS", "WOMENS", "MIXED"]
  },
  format: {
    type: String,
    enum: ["SINGLES", "DOUBLES"]
  },
  status: {
    type: String,
    enum: ["REGISTRATION", "DRAWN", "LIVE", "COMPLETED"],
    default: "REGISTRATION"
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Event", eventSchema);
