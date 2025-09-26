const mongoose = require('mongoose');

const CelebrantSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        maxlength: 80
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email']
    },
    dob: {
        type: Date,
        required: true
    },
    dobMonth: { type: Number, index: true },
    dobDay:   { type: Number, index: true },
    lastSentOn: { type: Date, default: null }
}, { timestamps: true });

CelebrantSchema.pre('save', function(next) {
    const d = new Date(this.dob);
    this.dobMonth = d.getUTCMonth() + 1;
    this.dobDay = d.getUTCDate();
    next();
});

CelebrantSchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate();
    if (update && update.dob) {
        const d = new Date(update.dob);
        update.dobMonth = d.getUTCMonth() + 1;
        update.dobDay = d.getUTCDate();
        this.setUpdate(update);
    }
    next();
});

module.exports = mongoose.model('Celebrant', CelebrantSchema);
