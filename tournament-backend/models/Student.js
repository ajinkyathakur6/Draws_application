const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  rollNo: { type: String, unique: true },
  name: String,
  gender: String,
  department: String,
  year:String
});

module.exports = mongoose.model("Student", studentSchema);
