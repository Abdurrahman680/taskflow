const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

dotenv.config();

const app = express();

// ======================
// PORT (Railway safe)
// ======================
const PORT = process.env.PORT || 8080;

// ======================
// CORS CONFIG (FIXED)
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
// SESSION CONFIG (FIXED)
// ======================
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// ======================
// PASSPORT SETUP
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
// START SERVER (RAILWAY SAFE)
// ======================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});