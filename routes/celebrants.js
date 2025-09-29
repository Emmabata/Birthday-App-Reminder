const express = require("express");
const { body, validationResult } = require("express-validator");
const Celebrant = require("../models/Celebrant");

const router = express.Router();

// Helper to normalize DOB for the date input value
function normalizeDOBForInput(dob) {
  if (!dob) return "";
  // If validator converted it to a Date
  if (dob instanceof Date && !isNaN(dob)) {
    return dob.toISOString().slice(0, 10); // YYYY-MM-DD
  }
  // If it's a string, try to format (handles "2025-09-29" fine)
  const d = new Date(dob);
  if (!isNaN(d)) return d.toISOString().slice(0, 10);
  return "";
}

router.get("/", async (req, res) => {
  try {
    const celebrants = await Celebrant.find().sort({
      dobMonth: 1,
      dobDay: 1,
      username: 1,
    });
    res.render("index", { celebrants, errors: [], values: {} });
  } catch (e) {
    // Fallback if DB hiccups
    res.status(500).render("index", { celebrants: [], errors: [{ msg: "Unable to load celebrants." }], values: {} });
  }
});

router.post(
  "/celebrants",
  [
    body("username")
      .trim()
      .notEmpty().withMessage("Username is required")
      .isLength({ max: 80 }).withMessage("Username must be 80 chars or less"),
    body("email")
      .trim()
      .isEmail().withMessage("Valid email required")
      .normalizeEmail(),
    body("dob")
      .notEmpty().withMessage("Date of birth required")
      .isISO8601().withMessage("Date of birth must be a valid date")
      .toDate()
  ],
  async (req, res) => {
    const result = validationResult(req);

    // Preserve user-entered values (normalize dob for date input)
    const values = {
      username: (req.body.username || "").trim(),
      email: (req.body.email || "").trim(),
      dob: normalizeDOBForInput(req.body.dob)
    };

    if (!result.isEmpty()) {
      const celebrants = await Celebrant.find().sort({
        dobMonth: 1,
        dobDay: 1,
        username: 1,
      });
      return res.status(400).render("index", { celebrants, errors: result.array(), values });
    }

    try {
      const doc = new Celebrant({
        username: values.username,
        email: values.email.toLowerCase(),
        dob: req.body.dob, // this is already a Date object from .toDate()
      });
      await doc.save();
      res.redirect("/");
    } catch (err) {
      const celebrants = await Celebrant.find().sort({
        dobMonth: 1,
        dobDay: 1,
        username: 1,
      });
      const errors = [{
        msg: err.code === 11000
          ? "Email already exists. Use a unique email."
          : err.message
      }];
      res.status(400).render("index", { celebrants, errors, values });
    }
  }
);

router.post("/celebrants/:id/delete", async (req, res) => {
  try {
    await Celebrant.findByIdAndDelete(req.params.id);
  } catch (_) {
    // ignore errors here; redirect anyway
  }
  res.redirect("/");
});

module.exports = router;
