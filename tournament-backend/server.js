require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Tournament API Running");
});

// ROUTES
app.use("/api/auth", require("./routes/auth"));
app.use("/api/events", require("./routes/events"));
app.use("/api/participation", require("./routes/participation"));
app.use("/api/draws", require("./routes/draws"));
app.use("/api/students", require("./routes/students"));
app.use("/api/matches", require("./routes/matches"));


app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});
