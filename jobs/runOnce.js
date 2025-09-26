require("dotenv").config();
const mongoose = require("mongoose");
const Celebrant = require("../models/Celebrant");
const { runBirthdayJob } = require("./birthdayJob");

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        await Celebrant.syncIndexes();
        console.log("DB connected. Running job once...");
        const result = await runBirthdayJob();
        console.log("Job result:", result);
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
})();
