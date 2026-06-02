import React from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import api from '../services/api';
import { LayoutDashboard, Users, CheckSquare, LogOut } from 'lucide-react';

export default function Layout({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent tracking-tight">TaskFlow</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/teams" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors">
            <Users size={20} /> Teams
          </Link>
          <Link to="/tasks" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors">
            <CheckSquare size={20} /> Tasks
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-sm">
              <p className="font-medium">{user?.name}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-900 p-8">
        <Outlet />
      </main>
    </div>
  );
}
