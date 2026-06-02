import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TaskModal from '../components/TaskModal';
import { Plus, Edit, Trash2, Filter, Search, ArrowUpDown } from 'lucide-react';

export default function Tasks({ user }) {
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  // Filters
  const [filterTeam, setFilterTeam] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // asc or desc for dueDate

  const fetchTasks = () => {
    let query = '?';
    if (filterTeam) query += `teamId=${filterTeam}&`;
    if (filterStatus) query += `status=${filterStatus}&`;
    if (filterAssignee) query += `assignedTo=${filterAssignee}&`;
    if (searchQuery) query += `search=${searchQuery}&`;
    
    api.get(`/tasks${query}`).then(res => {
      let fetchedTasks = res.data;
      // Client-side sorting by due date
      fetchedTasks.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
      setTasks(fetchedTasks);
    });
  };

  useEffect(() => {
    api.get('/teams').then(res => setTeams(res.data));
  }, []);

  useEffect(() => {
    // Debounce search query
    const timer = setTimeout(() => {
      fetchTasks();
    }, 300);
    return () => clearTimeout(timer);
  }, [filterTeam, filterStatus, filterAssignee, searchQuery, sortOrder]);

  const handleDelete = async (id) => {
    if (confirm('Delete task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        fetchTasks();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tasks</h1>
          <p className="text-gray-400">Manage, search, and track your progress</p>
        </div>
        <button 
          onClick={() => { setEditingTask(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <Plus size={20} /> Create Task
        </button>
      </div>

      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Filter size={18} />
        </div>
        <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white" value={filterTeam} onChange={e => setFilterTeam(e.target.value)}>
          <option value="">All Teams</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white" value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}>
          <option value="">All Assignees</option>
          <option value={user.id}>Assigned to Me</option>
        </select>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-700/50 border-b border-gray-700">
            <tr>
              <th className="px-6 py-4 text-gray-300 font-semibold">Task</th>
              <th className="px-6 py-4 text-gray-300 font-semibold">Status</th>
              <th className="px-6 py-4 text-gray-300 font-semibold">Priority</th>
              <th className="px-6 py-4 text-gray-300 font-semibold cursor-pointer hover:text-white flex items-center gap-2" onClick={toggleSort}>
                Due Date <ArrowUpDown size={14} />
              </th>
              <th className="px-6 py-4 text-gray-300 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {tasks.map(task => (
              <tr key={task.id} className="hover:bg-gray-700/30 transition">
                <td className="px-6 py-4">
                  <p className="font-medium text-white">{task.title}</p>
                  <p className="text-sm text-gray-400 truncate max-w-xs">{task.description}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${task.status === 'Completed' ? 'bg-green-500/20 text-green-400' : task.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {task.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm ${task.priority === 'High' ? 'text-red-400' : task.priority === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300 text-sm">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Date'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => { setEditingTask(task); setShowModal(true); }} className="text-gray-400 hover:text-blue-400 p-2 transition">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(task.id)} className="text-gray-400 hover:text-red-400 p-2 transition">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  No tasks found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <TaskModal 
          task={editingTask} 
          onClose={() => setShowModal(false)} 
          onSave={() => { setShowModal(false); fetchTasks(); }} 
        />
      )}
    </div>
  );
}
