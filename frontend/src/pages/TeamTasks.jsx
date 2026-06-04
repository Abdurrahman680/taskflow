import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft } from 'lucide-react';

export default function TeamTasks({ user }) {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch team details and tasks
    const fetchData = async () => {
      try {
        const teamRes = await api.get('/teams');
        const currentTeam = teamRes.data.find(t => t.id === id);
        setTeam(currentTeam);

        const tasksRes = await api.get(`/tasks?teamId=${id}`);
        setTasks(tasksRes.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load team tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="text-gray-400 p-8">Loading tasks...</div>;
  if (error) return <div className="text-red-400 p-8">{error}</div>;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link to="/teams" className="text-gray-400 hover:text-white transition bg-gray-800 p-2 rounded-lg border border-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            {team ? `${team.name} Tasks` : 'Team Tasks'}
          </h1>
          <p className="text-gray-400">View tasks specific to this team</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-700/50 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-gray-300 font-semibold">Title</th>
                <th className="px-6 py-4 text-gray-300 font-semibold">Description</th>
                <th className="px-6 py-4 text-gray-300 font-semibold">Status</th>
                <th className="px-6 py-4 text-gray-300 font-semibold">Assigned User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {tasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-700/30 transition">
                  <td className="px-6 py-4 font-medium text-white">{task.title}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm max-w-xs truncate">{task.description || 'No description'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${task.status === 'Completed' ? 'bg-green-500/20 text-green-400' : task.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    {task.assignee ? task.assignee.name : 'Unassigned'}
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    No tasks found for this team.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
