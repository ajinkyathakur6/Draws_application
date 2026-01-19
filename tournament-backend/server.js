require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

connectDB();

const app = express();

// CORS Configuration - Restrict in production
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port " + (process.env.PORT || 5000));
  console.log("Environment: " + (process.env.NODE_ENV || 'development'));
  console.log("Allowed Origins: " + allowedOrigins.join(', '));
});
