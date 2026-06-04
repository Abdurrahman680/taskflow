import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard({ user }) {
  const [tasks, setTasks] = useState([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [dueSoonTasks, setDueSoonTasks] = useState([]);

  useEffect(() => {
    api.get('/tasks').then(res => {
      setTasks(res.data);
      
      const alreadyNotified = sessionStorage.getItem('notified_due_tasks');
      if (!alreadyNotified) {
        const today = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);

        const urgent = res.data.filter(t => {
          if (t.status === 'Completed' || !t.dueDate) return false;
          const dDate = new Date(t.dueDate);
          return dDate < threeDaysFromNow;
        });

        if (urgent.length > 0) {
          setDueSoonTasks(urgent);
          setShowReminderModal(true);
        }
        sessionStorage.setItem('notified_due_tasks', 'true');
      }
    });
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

      {/* Due Date Reminders Modal (Login Only) */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-gray-800 border border-red-500/30 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
            <div className="p-6 bg-gradient-to-r from-red-600/20 to-yellow-600/10 border-b border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 text-red-400 rounded-lg animate-pulse">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Upcoming Deadlines!</h2>
                  <p className="text-xs text-gray-400">Tasks requiring your immediate attention</p>
                </div>
              </div>
              <button 
                onClick={() => setShowReminderModal(false)}
                className="text-gray-400 hover:text-white transition text-2xl"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              <p className="text-gray-300 text-sm">
                Hello {user?.name}! The following tasks are overdue or due within the next 3 days:
              </p>
              <ul className="space-y-3">
                {dueSoonTasks.map(t => {
                  const isOverdue = new Date(t.dueDate) < new Date();
                  return (
                    <li key={t.id} className="p-4 bg-gray-700/40 border border-gray-600/60 hover:border-gray-500 rounded-lg transition-colors flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-white">{t.title}</h4>
                        <div className="flex gap-2 items-center mt-1">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            t.priority === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            t.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {t.priority}
                          </span>
                          <span className="text-xs text-gray-400">Team: {t.team?.name || 'Personal'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          isOverdue ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {isOverdue ? 'Overdue' : new Date(t.dueDate).toLocaleDateString()}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1.5">Status: {t.status}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            
            <div className="p-6 bg-gray-900/50 border-t border-gray-700 flex justify-end">
              <button 
                onClick={() => setShowReminderModal(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200"
              >
                Acknowledge & Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
