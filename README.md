## 🎂 Birthday Reminder App

A full-stack Node.js application that automates customer birthday reminders.  
Instead of checking Excel sheets manually, this app stores celebrants in MongoDB and automatically sends personalized birthday emails every day at **07:00 Africa/Lagos**.

---

## ✨ Features

- 📋 **Add Celebrants**  
  Collect **username, email (unique), and date of birth** via a responsive form.

- 📦 **MongoDB Integration**  
  Stores celebrants with pre-computed `dobMonth` and `dobDay` for fast queries.

- ⏰ **Automated Cron Job**  
  Runs daily at 07:00 (Africa/Lagos) using [node-cron](https://www.npmjs.com/package/node-cron).

- 📧 **Email Notifications**  
  Uses [Nodemailer](https://nodemailer.com/) to send personalized HTML emails.  
  - Development: [Ethereal](https://ethereal.email/) test inbox.  
  - Production: Gmail (via App Password).

- 🛡 **Unique Email Validation**  
  Duplicate emails are rejected both in Mongoose schema and with server validation.

- 📊 **Job Logging**  
  Every cron run logs processed count, errors, and last run time to MongoDB.

- 🌐 **Status Endpoint**  
  `GET /cron/status` → returns JSON with last run info (for health monitoring).

- 🎨 **Responsive UI**  
  Built with [Tailwind CSS](https://tailwindcss.com/) + custom CSS theme (mature banking look).

---

## 🗂 Project Structure


