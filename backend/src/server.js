const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8080;

// ======================
// CORS CONFIG (FIXED STABLE)
// ======================
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://taskflow-d44dd.web.app"
  ],
  credentials: true
}));

// ======================
// BODY PARSERS
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// SESSION CONFIG (FIX LOGIN FIX)
// ======================
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,          // MUST for Railway (HTTPS)
    sameSite: "none",      // IMPORTANT for cross-domain (Firebase)
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// ======================
// PASSPORT
// ======================
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// ======================
// ROUTES
// ======================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/tasks', require('./routes/tasks'));

// ======================
// HEALTH CHECK
// ======================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ======================
// ERROR HANDLING
// ======================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// ======================
// START SERVER
// ======================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});