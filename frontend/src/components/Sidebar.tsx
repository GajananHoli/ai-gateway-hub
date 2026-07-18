import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Code, 
  HardDrive, 
  Network, 
  GitBranch, 
  Shield, 
  BrainCircuit, 
  Activity, 
  Settings, 
  User, 
  LogOut,
  Radio
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userEmail: string;
  onLogout: () => void;
  apiHealth: 'healthy' | 'warning' | 'critical';
}

export default function Sidebar({ activeTab, setActiveTab, userEmail, onLogout, apiHealth }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', name: 'System Dashboard', icon: LayoutDashboard, category: 'Observe' },
    { id: 'gateway', name: 'API Gateway Console', icon: Radio, category: 'Observe' },
    { id: 'monitoring', name: 'Actuator & Metrics', icon: Activity, category: 'Observe' },
    
    { id: 'services', name: 'Java Microservices', icon: Code, category: 'Core Dev' },
    
    { id: 'docker', name: 'Docker Containers', icon: HardDrive, category: 'Ops & Deploy' },
    { id: 'kubernetes', name: 'Kubernetes Cluster', icon: Network, category: 'Ops & Deploy' },
    { id: 'cicd', name: 'CI/CD Pipeline', icon: GitBranch, category: 'Ops & Deploy' },
    
    { id: 'security', name: 'Threat Alerts', icon: Shield, category: 'Security & AI' },
    { id: 'ai-insights', name: 'Gemini AI Insights', icon: BrainCircuit, category: 'Security & AI' },
    
    { id: 'settings', name: 'System Settings', icon: Settings, category: 'Preferences' },
    { id: 'profile', name: 'Developer Profile', icon: User, category: 'Preferences' },
  ];

  const categories = ['Observe', 'Core Dev', 'Ops & Deploy', 'Security & AI', 'Preferences'];

  return (
    <aside className="w-64 bg-[#09090b] border-r border-zinc-800 flex flex-col justify-between h-screen sticky top-0 font-sans text-zinc-300">
      {/* Branding and Health Overview */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <BrainCircuit className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100 tracking-tight">AI Gateway Hub</h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-wider">ENTERPRISE CLUSTER</p>
          </div>
        </div>

        {/* Global Cluster Status bar */}
        <div className="mt-4 p-2 bg-zinc-950 rounded-md border border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-500">GATEWAY_HEARTBEAT</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${
              apiHealth === 'healthy' ? 'bg-emerald-500 animate-pulse' :
              apiHealth === 'warning' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className="text-[10px] font-semibold text-zinc-300 uppercase">{apiHealth}</span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
        {categories.map(cat => {
          const items = menuItems.filter(item => item.category === cat);
          return (
            <div key={cat} className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-3 block">
                {cat}
              </span>
              <nav className="space-y-0.5">
                {items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                        isActive 
                          ? 'bg-zinc-900 text-zinc-100 shadow-sm border-l-2 border-emerald-400 pl-2.5' 
                          : 'hover:bg-zinc-900/50 hover:text-zinc-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                      <span>{item.name}</span>
                      {item.id === 'security' && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          );
        })}
      </div>

      {/* User Section / Logout */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-mono font-bold text-emerald-400">
            GH
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-zinc-200 truncate">{userEmail}</p>
            <p className="text-[9px] text-zinc-500 font-mono tracking-tight uppercase">Admin Operator</p>
          </div>
          <button 
            onClick={onLogout}
            title="Log out of cluster"
            className="text-zinc-400 hover:text-red-400 transition-colors p-1 hover:bg-zinc-900 rounded"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
