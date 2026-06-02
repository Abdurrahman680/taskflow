import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function TaskModal({ task, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Pending',
    priority: 'Medium',
    teamId: '',
    assignedTo: '',
    dueDate: ''
  });
  const [teams, setTeams] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  
  useEffect(() => {
    api.get('/teams').then(res => setTeams(res.data));
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'Pending',
        priority: task.priority || 'Medium',
        teamId: task.teamId || '',
        assignedTo: task.assignedTo || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      });
    }
  }, [task]);

  useEffect(() => {
    if (formData.teamId) {
      api.get(`/teams/${formData.teamId}/members`)
        .then(res => setTeamMembers(res.data))
        .catch(() => setTeamMembers([]));
    } else {
      setTeamMembers([]);
    }
  }, [formData.teamId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.teamId) return alert('Please select a team');
    try {
      if (task) {
        await api.put(`/tasks/${task.id}`, formData);
      } else {
        await api.post('/tasks', formData);
      }
      onSave();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save task');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">{task ? 'Edit Task' : 'Create Task'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
            <input type="text" required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
              <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Team</label>
            <select required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" value={formData.teamId} onChange={e => setFormData({...formData, teamId: e.target.value, assignedTo: ''})}>
              <option value="">Select Team</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Assign To</label>
              <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})} disabled={!formData.teamId}>
                <option value="">Unassigned</option>
                {teamMembers.map(m => <option key={m.userId} value={m.userId}>{m.user?.name || m.userId}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
              <input type="date" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition">Save Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}
