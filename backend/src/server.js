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
// IMPORTANT FOR RAILWAY
// ======================
app.set('trust proxy', 1);   // 🔥 VERY IMPORTANT FIX

// ======================
// CORS
// ======================
app.use(cors({
  origin: "https://taskflow-d44dd.web.app",
  credentials: true
}));

// ======================
// BODY PARSER
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// SESSION FIX (CRITICAL)
// ======================
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24
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
// ERROR HANDLER
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