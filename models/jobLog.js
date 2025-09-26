const mongoose = require('mongoose');

const JobLogSchema = new mongoose.Schema({
  job: { type: String, required: true },           // e.g., 'birthday'
    ranAt: { type: Date, default: Date.now },
    processed: { type: Number, default: 0 },
    errors: [{ email: String, message: String }]
}, { timestamps: true });

// Prevent OverwriteModelError on hot reloads / multiple imports
module.exports = mongoose.models.JobLog || mongoose.model('JobLog', JobLogSchema);
