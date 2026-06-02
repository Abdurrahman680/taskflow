$ErrorActionPreference = "Stop"

$backendDir = "e:\TaskFlow\backend"
$frontendDir = "e:\TaskFlow\frontend"

# Prisma Client (db.js)
New-Item -ItemType Directory -Force -Path "$backendDir\src\config"
Set-Content -Path "$backendDir\src\config\db.js" -Value "const { PrismaClient } = require('@prisma/client');`nconst prisma = new PrismaClient();`nmodule.exports = prisma;"

# Passport Config
Set-Content -Path "$backendDir\src\config\passport.js" -Value @"
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const prisma = require('./db');

module.exports = function(passport) {
  passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return done(null, false, { message: 'Invalid credentials' });
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) return done(null, false, { message: 'Invalid credentials' });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
"@

# Backend Routes - Auth
New-Item -ItemType Directory -Force -Path "$backendDir\src\routes"
New-Item -ItemType Directory -Force -Path "$backendDir\src\middleware"
Set-Content -Path "$backendDir\src\middleware\auth.js" -Value @"
module.exports = {
  ensureAuth: (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: 'Unauthorized' });
  }
};
"@

Set-Content -Path "$backendDir\src\routes\auth.js" -Value @"
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

module.exports = router;
"@

# Backend Routes - Teams
Set-Content -Path "$backendDir\src\routes\teams.js" -Value @"
const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { ensureAuth } = require('../middleware/auth');

router.get('/', ensureAuth, async (req, res) => {
  const teams = await prisma.team.findMany({
    where: { OR: [{ createdBy: req.user.id }, { members: { some: { userId: req.user.id } } }] }
  });
  res.json(teams);
});

router.post('/', ensureAuth, async (req, res) => {
  const { name, description } = req.body;
  const team = await prisma.team.create({
    data: { name, description, createdBy: req.user.id, members: { create: { userId: req.user.id } } }
  });
  res.status(201).json(team);
});

module.exports = router;
"@

# Backend Routes - Tasks
Set-Content -Path "$backendDir\src\routes\tasks.js" -Value @"
const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { ensureAuth } = require('../middleware/auth');

router.get('/', ensureAuth, async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: { OR: [{ assignedTo: req.user.id }, { createdBy: req.user.id }] }
  });
  res.json(tasks);
});

router.post('/', ensureAuth, async (req, res) => {
  const { title, description, teamId, assignedTo, priority, dueDate } = req.body;
  const task = await prisma.task.create({
    data: { title, description, teamId, assignedTo, priority, dueDate: dueDate ? new Date(dueDate) : null, createdBy: req.user.id }
  });
  res.status(201).json(task);
});

module.exports = router;
"@

# Frontend Boilerplate Components
New-Item -ItemType Directory -Force -Path "$frontendDir\src\pages"
New-Item -ItemType Directory -Force -Path "$frontendDir\src\components"
New-Item -ItemType Directory -Force -Path "$frontendDir\src\context"
New-Item -ItemType Directory -Force -Path "$frontendDir\src\services"

Set-Content -Path "$frontendDir\src\services\api.js" -Value @"
import axios from 'axios';
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});
export default api;
"@

Set-Content -Path "$frontendDir\src\App.jsx" -Value @"
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center">
        <h1 className="text-4xl font-bold text-blue-600">TaskFlow</h1>
      </div>
    </BrowserRouter>
  );
}
export default App;
"@

Set-Content -Path "$frontendDir\src\main.jsx" -Value @"
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
"@

Set-Content -Path "$frontendDir\src\index.css" -Value @"
@tailwind base;
@tailwind components;
@tailwind utilities;
"@

Set-Content -Path "$frontendDir\tailwind.config.js" -Value @"
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
"@

Write-Output "Setup Script Completed."
