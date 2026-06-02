const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const prisma = require('../config/db');

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already in use' });
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = await prisma.user.create({ data: { name, email, passwordHash } });
    res.status(201).json({ message: 'User registered', userId: user.id });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Logged in', user: { id: req.user.id, name: req.user.name, email: req.user.email } });
});

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ message: 'Logged out' });
  });
});

router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email } });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

router.get('/users', async (req, res) => {
  if (req.isAuthenticated()) {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true }
    });
    res.json(users);
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

module.exports = router;
