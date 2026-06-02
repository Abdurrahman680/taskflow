import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Users, Plus, Trash2, Edit, Mail, UserPlus } from 'lucide-react';

export default function Teams({ user }) {
  const [teams, setTeams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeTeamId, setActiveTeamId] = useState(null);
  
  const [teamForm, setTeamForm] = useState({ id: null, name: '', description: '' });
  const [selectedUserId, setSelectedUserId] = useState('');
  const [allUsers, setAllUsers] = useState([]);

  const fetchTeams = () => {
    api.get('/teams').then(res => setTeams(res.data));
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleSaveTeam = async (e) => {
    e.preventDefault();
    if (teamForm.id) {
      await api.put(`/teams/${teamForm.id}`, { name: teamForm.name, description: teamForm.description });
    } else {
      await api.post('/teams', { name: teamForm.name, description: teamForm.description });
    }
    setShowModal(false);
    fetchTeams();
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this team? Only the creator can do this.')) {
      try {
        await api.delete(`/teams/${id}`);
        fetchTeams();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete team');
      }
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return alert('Please select a user');
    try {
      await api.post(`/teams/${activeTeamId}/members`, { userId: selectedUserId });
      setShowInviteModal(false);
      setSelectedUserId('');
      fetchTeams();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add member');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Teams</h1>
          <p className="text-gray-400">Manage your collaborative workspaces and members</p>
        </div>
        <button 
          onClick={() => { setTeamForm({ id: null, name: '', description: '' }); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <Plus size={20} /> Create Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map(team => (
          <div key={team.id} className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg hover:border-gray-600 transition flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{team.name}</h3>
                  <p className="text-sm text-gray-400">{team.members?.length || 0} members</p>
                </div>
              </div>
              <div className="flex gap-2">
                {team.createdBy === user.id && (
                  <>
                    <button onClick={() => { setTeamForm(team); setShowModal(true); }} className="text-gray-400 hover:text-blue-400 transition">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(team.id)} className="text-gray-400 hover:text-red-400 transition">
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
            <p className="text-gray-300 text-sm flex-1">{team.description || 'No description provided.'}</p>
            
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Members</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {team.members?.slice(0, 5).map(m => (
                  <span key={m.id} className="text-xs bg-gray-700 px-2 py-1 rounded-full text-gray-300" title={m.user?.email}>
                    {m.user?.name || m.userId}
                  </span>
                ))}
                {team.members?.length > 5 && <span className="text-xs text-gray-500">+{team.members.length - 5} more</span>}
              </div>
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => { 
                    setActiveTeamId(team.id); 
                    setShowInviteModal(true);
                    api.get('/auth/users')
                      .then(res => setAllUsers(Array.isArray(res.data) ? res.data : []))
                      .catch(() => alert('Failed to fetch users'));
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-200 transition"
                >
                  <UserPlus size={16} /> Add Member
                </button>
                <Link
                  to={`/teams/${team.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white transition"
                >
                  View Tasks
                </Link>
              </div>
            </div>
          </div>
        ))}
        {teams.length === 0 && (
          <div className="col-span-full p-12 text-center border-2 border-dashed border-gray-700 rounded-xl">
            <Users size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">No teams yet</h3>
            <p className="text-gray-500">Create a team to start collaborating with others.</p>
          </div>
        )}
      </div>

      {/* Team Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{teamForm.id ? 'Edit Team' : 'Create New Team'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleSaveTeam} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Team Name</label>
                <input 
                  type="text" required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={teamForm.name} onChange={e => setTeamForm({...teamForm, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea 
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  value={teamForm.description} onChange={e => setTeamForm({...teamForm, description: e.target.value})}
                ></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition">{teamForm.id ? 'Save Changes' : 'Create Team'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><UserPlus size={20} /> Add Member</h2>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Select User</label>
                <select 
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}
                >
                  <option value="">Choose a user...</option>
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowInviteModal(false)} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition">Add to Team</button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <label className="block text-sm font-medium text-gray-300 mb-2">Or Invite by Email</label>
                <div className="flex gap-2">
                  <input type="email" placeholder="colleague@example.com" className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button type="button" onClick={() => { alert('Invite sent! (Stubbed)'); setShowInviteModal(false); }} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white text-sm transition whitespace-nowrap">Send Invite</button>
                </div>
                <p className="text-xs text-gray-500 mt-2">This will send an email invitation. (Stubbed for demo)</p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
