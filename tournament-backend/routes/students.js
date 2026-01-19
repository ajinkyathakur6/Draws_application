const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const auth = require("../middleware/auth");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

router.post(
  "/bulk-upload",
  auth("ADMIN"),
  upload.single("file"),
  async (req, res) => {
    const results = [];
    const errors = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        results.push(row);
      })
      .on("end", async () => {
        let inserted = 0;
        let skipped = 0;

        for (const r of results) {
          if (!r.rollNo) {
            errors.push({ row: r, error: "Missing rollNo" });
            continue;
          }

          const exists = await Student.findOne({ rollNo: r.rollNo });
          if (exists) {
            skipped++;
            continue;
          }

          await Student.create({
            rollNo: r.rollNo.trim(),
            name: r.name?.trim(),
            department: r.department?.trim(),
            year: r.year?.trim(),
          });

          inserted++;
        }

        fs.unlinkSync(req.file.path); // delete temp file

        res.json({
          message: "Bulk upload completed",
          inserted,
          skipped,
          errors,
        });
      });
  }
);


// Add student (Admin only)
router.post("/", auth("ADMIN"), async (req, res) => {
  const student = await Student.create(req.body);
  res.json(student);
});

// Bulk upload (optional)
router.post("/bulk", auth("ADMIN"), async (req, res) => {
  await Student.insertMany(req.body);
  res.json({ message: "Students imported" });
});

// Search by roll number
router.get("/search/:roll", async (req, res) => {
  const student = await Student.findOne({ rollNo: req.params.roll });
  res.json(student);
});

// Get all students (Admin only)
router.get("/", auth("ADMIN"), async (req, res) => {
  const students = await Student.find().sort({ rollNo: 1 });
  res.json(students);
});

module.exports = router;
