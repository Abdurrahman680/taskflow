$ErrorActionPreference = "Stop"

$backendDir = "e:\TaskFlow\backend"
$frontendDir = "e:\TaskFlow\frontend"

# Update Tasks Route for Filtering
Set-Content -Path "$backendDir\src\routes\tasks.js" -Value @"
const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { ensureAuth } = require('../middleware/auth');

router.get('/', ensureAuth, async (req, res) => {
  const { teamId, assignedTo, status, search } = req.query;
  const where = {
    OR: [{ assignedTo: req.user.id }, { createdBy: req.user.id }]
  };
  if (teamId) where.teamId = teamId;
  if (assignedTo) where.assignedTo = assignedTo;
  if (status) where.status = status;
  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  const tasks = await prisma.task.findMany({ where, include: { assignee: true, team: true } });
  res.json(tasks);
});

router.post('/', ensureAuth, async (req, res) => {
  const { title, description, teamId, assignedTo, priority, dueDate, status } = req.body;
  const task = await prisma.task.create({
    data: { title, description, teamId, assignedTo, priority, status: status || "Pending", dueDate: dueDate ? new Date(dueDate) : null, createdBy: req.user.id }
  });
  res.status(201).json(task);
});

router.put('/:id', ensureAuth, async (req, res) => {
  const { status, title, description, priority, assignedTo } = req.body;
  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: { status, title, description, priority, assignedTo }
  });
  res.json(task);
});

router.delete('/:id', ensureAuth, async (req, res) => {
  await prisma.task.delete({ where: { id: req.params.id } });
  res.json({ message: 'Task deleted' });
});

module.exports = router;
"@

# Update Teams Route
Set-Content -Path "$backendDir\src\routes\teams.js" -Value @"
const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { ensureAuth } = require('../middleware/auth');

router.get('/', ensureAuth, async (req, res) => {
  const teams = await prisma.team.findMany({
    where: { OR: [{ createdBy: req.user.id }, { members: { some: { userId: req.user.id } } }] },
    include: { members: { include: { user: true } } }
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

router.delete('/:id', ensureAuth, async (req, res) => {
  const team = await prisma.team.findUnique({ where: { id: req.params.id } });
  if (team.createdBy !== req.user.id) return res.status(403).json({ message: 'Only creator can delete' });
  await prisma.team.delete({ where: { id: req.params.id } });
  res.json({ message: 'Team deleted' });
});

module.exports = router;
"@

# Frontend Main App
Set-Content -Path "$frontendDir\src\App.jsx" -Value @"
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import api from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Routes>
        <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to="/" />} />
        <Route path="/*" element={user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
"@

# Frontend Login
Set-Content -Path "$frontendDir\src\pages\Login.jsx" -Value @"
import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Login({ setUser }) {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/auth/login', data);
      setUser(res.data.user);
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Welcome Back</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input {...register('email')} type="email" placeholder="Email" className="w-full p-3 bg-gray-700 rounded text-white" />
          <input {...register('password')} type="password" placeholder="Password" className="w-full p-3 bg-gray-700 rounded text-white" />
          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold transition">Login</button>
        </form>
        <p className="mt-4 text-center text-gray-400">Don't have an account? <Link to="/register" className="text-blue-400">Register</Link></p>
      </div>
    </div>
  );
}
"@

# Frontend Register
Set-Content -Path "$frontendDir\src\pages\Register.jsx" -Value @"
import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register({ setUser }) {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/register', data);
      const res = await api.post('/auth/login', { email: data.email, password: data.password });
      setUser(res.data.user);
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Join TaskFlow</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input {...register('name')} type="text" placeholder="Name" className="w-full p-3 bg-gray-700 rounded text-white" />
          <input {...register('email')} type="email" placeholder="Email" className="w-full p-3 bg-gray-700 rounded text-white" />
          <input {...register('password')} type="password" placeholder="Password" className="w-full p-3 bg-gray-700 rounded text-white" />
          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold transition">Register</button>
        </form>
        <p className="mt-4 text-center text-gray-400">Already have an account? <Link to="/login" className="text-blue-400">Login</Link></p>
      </div>
    </div>
  );
}
"@

# Frontend Dashboard
Set-Content -Path "$frontendDir\src\pages\Dashboard.jsx" -Value @"
import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Dashboard({ user, setUser }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    api.get('/tasks').then(res => setTasks(res.data));
  }, []);

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">TaskFlow Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-300">Welcome, {user.name}</span>
          <button onClick={logout} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition">Logout</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-200">Tasks Due Soon</h3>
          {tasks.length === 0 ? <p className="text-gray-400">No tasks pending</p> : (
            <ul className="space-y-3">
              {tasks.map(t => (
                <li key={t.id} className="p-3 bg-gray-700 rounded flex justify-between items-center">
                  <span>{t.title}</span>
                  <span className={`text-xs px-2 py-1 rounded \`\${t.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}\`\`}>{t.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg md:col-span-2">
           <h3 className="text-xl font-semibold mb-4 text-gray-200">Activity Overview</h3>
           <div className="flex items-center justify-center h-48 bg-gray-700 rounded text-gray-400">Activity Chart Placeholder</div>
        </div>
      </div>
    </div>
  );
}
"@

Write-Output "Setup 2 Script Completed."
