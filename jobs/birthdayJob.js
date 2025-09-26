const { DateTime } = require('luxon');
const Celebrant = require('../models/Celebrant');
const { renderBirthdayTemplate } = require('../views/email/birthday.template');
const { sendBirthdayEmail } = require('../utils/mailer');
const JobLog = require('../models/jobLog');

const TZ = process.env.TZ || 'Africa/Lagos';

function isSameYMDInZone(a, b, zone) {
  const A = DateTime.fromJSDate(a).setZone(zone);
  const B = DateTime.fromJSDate(b).setZone(zone);
  return A.year === B.year && A.month === B.month && A.day === B.day;
}

async function runBirthdayJob() {
  const now = DateTime.now().setZone(TZ);
  const month = now.month;
  const day = now.day;

  const celebrants = await Celebrant.find({ dobMonth: month, dobDay: day });
  const errors = [];

  for (const c of celebrants) {
    if (c.lastSentOn && isSameYMDInZone(c.lastSentOn, now.toJSDate(), TZ)) {
      continue;
    }

    const html = renderBirthdayTemplate({ username: c.username });

    try {
      await sendBirthdayEmail({
        to: c.email,
        subject: `🎉 Happy Birthday, ${c.username}!`,
        html
      });
      c.lastSentOn = now.toJSDate();
      await c.save();
      console.log(`Email sent to ${c.email}`);
    } catch (err) {
      console.error(`Email error to ${c.email}`, err.message);
      errors.push({ email: c.email, message: err.message });
    }
  }

  // Save a log entry
  await JobLog.create({
    job: 'birthday',
    ranAt: now.toJSDate(),
    processed: celebrants.length,
    errors
  });

  return { processed: celebrants.length, errors: errors.length };
}

module.exports = { runBirthdayJob };
