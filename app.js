// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cron = require('node-cron');
const helmet = require('helmet');

const Celebrant = require('./models/Celebrant');
const celebrantsRouter = require('./routes/celebrants');
const { runBirthdayJob } = require('./jobs/birthdayJob');
const JobLog = require('./models/JobLog');

const app = express();

/* ---- Security headers ---- */
app.use(helmet()); // base headers
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
        "script-src": ["'self'", "https://cdn.tailwindcss.com"], // allow Tailwind CDN + /public/app.js
        "style-src": ["'self'", "'unsafe-inline'"],              // allow inline styles + Tailwind injected CSS
        "img-src": ["'self'", "data:"],
        "connect-src": ["'self'"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "frame-ancestors": ["'self'"]
    }
  })
);

// View engine & static
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

// DB connect (with longer server selection timeout for Atlas)
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  family : 4, // Use IPv4, skip IPv6
})
  .then(async () => {
    console.log('MongoDB connected');
    await Celebrant.syncIndexes();
  })
  .catch(err => console.error('Mongo connect error:', err));

// Routes
app.use('/', celebrantsRouter);

// Health
app.get('/healthz', (_, res) => res.json({ ok: true }));

// Cron status endpoint
app.get('/cron/status', async (req, res) => {
  const last = await JobLog.findOne({ job: 'birthday' }).sort({ ranAt: -1 }).lean();
  res.json({
    ok: true,
    timezone: process.env.TZ || 'Africa/Lagos',
    lastRunAt: last?.ranAt || null,
    lastProcessed: last?.processed || 0,
    lastErrors: Array.isArray(last?.failures) ? last.failures.length : 0
  });
});

// CRON: 07:00 Africa/Lagos daily
cron.schedule('0 7 * * *', async () => {
  console.log('Cron: running birthday job (07:00 Africa/Lagos)');
  await runBirthdayJob();
}, { timezone: 'Africa/Lagos' });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server up on http://localhost:${PORT}`);
});
