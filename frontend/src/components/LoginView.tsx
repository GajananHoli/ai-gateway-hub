import React, { useState } from 'react';
import { BrainCircuit, ShieldAlert, Key, Sparkles, User, Info } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (email: string) => void;
}

export default function LoginView({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('GajananHoli@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess(email);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center font-sans p-6 relative overflow-hidden">
      {/* Decorative background grid glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-zinc-500/5 blur-3xl rounded-full" />

      <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 p-8 rounded-2xl shadow-xl relative z-10 space-y-6">
        
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
            <BrainCircuit className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">AI Gateway Hub</h1>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            Intelligent API Gateway Management & Observability Command Center
          </p>
        </div>

        {/* Credentials prefill tip */}
        <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center gap-2 text-[11px] font-mono text-zinc-400">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Click "Launch Dashboard" to log in as Operator.</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium text-zinc-300">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Operator Identity (Email)</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-zinc-200 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Cluster Access Passkey</label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-zinc-200 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-zinc-950 font-bold rounded-lg flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/15"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Authenticating Operator...' : 'Launch Cluster Dashboard'}</span>
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
            SPRING SECURITY v6.0 • JWT TRANSITION
          </span>
        </div>
      </div>
    </div>
  );
}
