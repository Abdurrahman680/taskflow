import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Teams from './pages/Teams';
import Tasks from './pages/Tasks';
import TeamTasks from './pages/TeamTasks';
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
        
        {/* Protected Routes wrapped in Layout */}
        <Route path="/" element={user ? <Layout user={user} setUser={setUser} /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard user={user} />} />
          <Route path="teams" element={<Teams user={user} />} />
          <Route path="teams/:id" element={<TeamTasks user={user} />} />
          <Route path="tasks" element={<Tasks user={user} />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
