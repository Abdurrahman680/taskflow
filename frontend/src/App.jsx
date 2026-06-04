import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Teams from './pages/Teams';
import Tasks from './pages/Tasks';
import TeamTasks from './pages/TeamTasks';
import LandingPage from './pages/LandingPage';
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
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <Routes>
        {user ? (
          // Protected Workspace Routes for Logged In Users
          <Route path="/" element={<Layout user={user} setUser={setUser} />}>
            <Route index element={<Dashboard user={user} />} />
            <Route path="teams" element={<Teams user={user} />} />
            <Route path="teams/:id" element={<TeamTasks user={user} />} />
            <Route path="tasks" element={<Tasks user={user} />} />
            {/* Fallback to dashboard root for logged in users */}
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        ) : (
          // Public Marketing and Authentication Routes for Guests
          <>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />
            {/* Direct guest subpaths to login screen */}
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;
