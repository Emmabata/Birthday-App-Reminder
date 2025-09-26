const express = require("express");
const { body, validationResult } = require("express-validator");
const Celebrant = require("../models/Celebrant");

const router = express.Router();

router.get("/", async (req, res) => {
    const celebrants = await Celebrant.find().sort({
        dobMonth: 1,
        dobDay: 1,
        username: 1,
    });
    res.render("index", { celebrants, errors: [], values: {} });
});

router.post(
    "/celebrants",
    [
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLength({ max: 80 }),
        body("email")
            .trim()
            .isEmail()
            .withMessage("Valid email required")
            .normalizeEmail(),
        body("dob")
            .notEmpty()
            .withMessage("Date of birth required")
            .isISO8601()
            .toDate(),
    ],
    async (req, res) => {
        const result = validationResult(req);
        const values = req.body;

        if (!result.isEmpty()) {
            const celebrants = await Celebrant.find().sort({
                dobMonth: 1,
                dobDay: 1,
                username: 1,
            });
            return res
                .status(400)
                .render("index", { celebrants, errors: result.array(), values });
        }

        try {
            const doc = new Celebrant({
                username: req.body.username,
                email: req.body.email,
                dob: req.body.dob,
            });
            await doc.save();
            res.redirect("/");
        } catch (err) {
            const celebrants = await Celebrant.find().sort({
                dobMonth: 1,
                dobDay: 1,
                username: 1,
            });
            const errors = [
                {
                    msg:
                        err.code === 11000
                            ? "Email already exists. Use a unique email."
                            : err.message,
                },
            ];
            res.status(400).render("index", { celebrants, errors, values });
        }
    }
);

router.post("/celebrants/:id/delete", async (req, res) => {
    await Celebrant.findByIdAndDelete(req.params.id);
    res.redirect("/");
});

module.exports = router;
