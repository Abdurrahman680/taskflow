import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard({ user }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    api.get('/tasks').then(res => setTasks(res.data));
  }, []);

  const pendingTasks = tasks.filter(t => t.status !== 'Completed');
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  
  // Calculate upcoming due dates
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const upcomingTasks = pendingTasks
    .filter(t => t.dueDate && new Date(t.dueDate) <= nextWeek)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const activityData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const created = tasks.filter(t => t.createdAt && t.createdAt.startsWith(dateStr)).length;
      const completed = tasks.filter(t => t.status === 'Completed' && t.updatedAt && t.updatedAt.startsWith(dateStr)).length;
      
      data.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        Created: created,
        Completed: completed,
      });
    }
    return data;
  }, [tasks]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Overview</h1>
          <p className="text-gray-400 mt-1">Here is what's happening with your projects today.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg flex items-center gap-4">
          <div className="p-4 bg-blue-500/10 text-blue-400 rounded-lg"><Clock size={24} /></div>
          <div>
            <p className="text-gray-400 text-sm">Pending Tasks</p>
            <h3 className="text-2xl font-bold text-white">{pendingTasks.length}</h3>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg flex items-center gap-4">
          <div className="p-4 bg-green-500/10 text-green-400 rounded-lg"><CheckCircle size={24} /></div>
          <div>
            <p className="text-gray-400 text-sm">Completed</p>
            <h3 className="text-2xl font-bold text-white">{completedTasks.length}</h3>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg flex items-center gap-4">
          <div className="p-4 bg-yellow-500/10 text-yellow-400 rounded-lg"><Calendar size={24} /></div>
          <div>
            <p className="text-gray-400 text-sm">Due This Week</p>
            <h3 className="text-2xl font-bold text-white">{upcomingTasks.length}</h3>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg flex items-center gap-4">
          <div className="p-4 bg-red-500/10 text-red-400 rounded-lg"><AlertTriangle size={24} /></div>
          <div>
            <p className="text-gray-400 text-sm">High Priority</p>
            <h3 className="text-2xl font-bold text-white">{pendingTasks.filter(t => t.priority === 'High').length}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg lg:col-span-2">
           <h3 className="text-xl font-semibold mb-4 text-gray-200">Recent Activity</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }} 
                    itemStyle={{ color: '#e5e7eb' }}
                  />
                  <Area type="monotone" dataKey="Created" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCreated)" />
                  <Area type="monotone" dataKey="Completed" stroke="#10b981" fillOpacity={1} fill="url(#colorCompleted)" />
                </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg flex flex-col">
          <h3 className="text-xl font-semibold mb-4 text-gray-200 flex items-center gap-2">
            <Calendar size={20} className="text-yellow-400" /> Due Date Reminders
          </h3>
          <div className="flex-1 overflow-y-auto">
            {upcomingTasks.length === 0 ? (
              <p className="text-gray-400 text-sm text-center mt-10">No tasks due in the next 7 days.</p>
            ) : (
              <ul className="space-y-3">
                {upcomingTasks.map(t => {
                  const isOverdue = new Date(t.dueDate) < today && t.status !== 'Completed';
                  return (
                    <li key={t.id} className="p-3 bg-gray-700/50 border border-gray-600 rounded-lg">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-gray-200">{t.title}</span>
                        <span className={`text-xs px-2 py-1 rounded ${isOverdue ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {isOverdue ? 'Overdue' : new Date(t.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Team: {t.team?.name || 'Personal'}</p>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
