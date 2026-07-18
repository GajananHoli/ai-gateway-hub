import React, { useState, useEffect } from 'react';
import { Clock, Shield, Server, RefreshCw, Layers } from 'lucide-react';

interface HeaderProps {
  env: 'dev' | 'staging' | 'prod';
  setEnv: (env: 'dev' | 'staging' | 'prod') => void;
  podCount: number;
  triggerMetricsReload: () => void;
}

export default function Header({ env, setEnv, podCount, triggerMetricsReload }: HeaderProps) {
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 py-3 px-6 sticky top-0 z-10 flex items-center justify-between font-sans text-zinc-300">
      {/* Active Cluster info */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-zinc-100">
          <Server className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold uppercase tracking-wider">Gateway Context:</span>
          <span className="text-xs font-mono px-2 py-0.5 bg-zinc-900 text-emerald-400 rounded border border-zinc-800">
            k8s-cluster.prod-east-1.aws
          </span>
        </div>

        <div className="h-4 w-px bg-zinc-800 hidden md:block" />

        {/* Real-time UTC clock */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono hidden md:flex">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          <span>{utcTime}</span>
        </div>
      </div>

      {/* Cluster Env Selector & Quick Stats */}
      <div className="flex items-center gap-4">
        {/* Environment toggle */}
        <div className="flex bg-zinc-950 p-1 rounded-md border border-zinc-800">
          {(['dev', 'staging', 'prod'] as const).map(p => (
            <button
              key={p}
              onClick={() => setEnv(p)}
              className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded transition-all ${
                env === p 
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button 
          onClick={triggerMetricsReload}
          className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-300 transition-all hover:text-zinc-100"
          title="Force telemetry flush"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Mini pods bubble */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-950 rounded-md border border-zinc-800">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] font-mono font-medium text-zinc-300">
            Pods: <span className="font-bold text-zinc-100">{podCount}</span>
          </span>
        </div>

        {/* DevSecOps badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 rounded-md border border-emerald-500/20 text-emerald-400 hidden sm:flex">
          <Shield className="w-3.5 h-3.5" />
          <span className="text-[9px] font-mono tracking-wider font-semibold uppercase">TRIVY SECURE</span>
        </div>
      </div>
    </header>
  );
}
