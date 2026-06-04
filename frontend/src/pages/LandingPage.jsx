import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  CheckSquare, 
  ArrowRight, 
  Activity, 
  Layers 
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: <Users className="text-purple-400" size={24} />,
      title: "Team Workspaces",
      description: "Create shared workspaces for your projects. Add members, delegate roles, and keep everyone aligned."
    },
    {
      icon: <CheckSquare className="text-blue-400" size={24} />,
      title: "Task Tracking",
      description: "Create tasks, set due dates, assign team members, and update progress from pending to completed."
    },
    {
      icon: <Activity className="text-green-400" size={24} />,
      title: "Visual Dashboard",
      description: "Get a clear overview of your team's activity with charts tracking task creation and completion rates."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d0f17] text-gray-100 font-sans flex flex-col relative overflow-hidden">
      
      {/* Subtle background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-950/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-blue-950/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="border-b border-gray-800/60 bg-[#0d0f17]/85 backdrop-blur-md relative z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center">
              <Layers size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              TaskFlow
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-sm font-medium text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-800/40 transition"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold text-white transition hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Manage your team's tasks <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              in one shared workspace.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto mt-6 leading-relaxed">
            Create teams, assign tasks, track deadlines, and view performance charts in a clean, uncluttered dashboard.
          </p>

          <div className="mt-8 flex gap-4 justify-center">
            <Link 
              to="/register" 
              className="flex items-center gap-1.5 px-6 py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-500 text-white transition hover:scale-[1.02] active:scale-[0.98]"
            >
              Create Your Account <ArrowRight size={16} />
            </Link>
          </div>

          {/* Dashboard Preview Mockup */}
          <div className="mt-14 w-full rounded-xl border border-gray-800 bg-[#161a27]/30 p-2 backdrop-blur-md shadow-2xl relative">
            <div className="relative rounded-lg border border-gray-800/80 bg-[#090b11] overflow-hidden">
              <img 
                src="/dashboard_preview.png" 
                alt="TaskFlow Dashboard Mockup" 
                className="w-full h-auto object-cover opacity-95" 
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-5xl mx-auto px-6 py-16 border-t border-gray-850">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <div 
                key={idx} 
                className="p-6 rounded-xl bg-[#131622]/20 border border-gray-800/60 transition duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-900/80 flex items-center justify-center mb-4 border border-gray-800">
                  {feat.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Simple Footer */}
      <footer className="border-t border-gray-850/60 bg-[#0a0c14]/90 py-8 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Layers size={14} className="text-gray-400" />
            <span className="font-semibold text-gray-400">TaskFlow</span>
          </div>
          <p>&copy; {new Date().getFullYear()} TaskFlow. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
