import React from 'react';
import { User, ShieldCheck, Key, Code, HelpCircle, HardDrive } from 'lucide-react';

interface ProfileProps {
  userEmail: string;
}

export default function ProfileView({ userEmail }: ProfileProps) {
  return (
    <div className="space-y-6 font-sans text-zinc-300 animate-fadeIn">
      {/* Visual profile header */}
      <div className="bg-gradient-to-r from-zinc-950 to-zinc-900/10 p-6 rounded-xl border border-zinc-800 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center font-mono text-emerald-400 text-lg font-bold">
          GH
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            {userEmail}
            <span className="px-2 py-0.5 bg-emerald-500/10 text-[9px] font-mono font-bold text-emerald-400 border border-emerald-500/20 rounded-full">
              CLUSTER ADMIN
            </span>
          </h2>
          <p className="text-xs text-zinc-400 font-mono">
            ID: usr_85a973c9fd2 | Group Membership: DEVSECOPS-CORE
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Role Based Access Scopes */}
        <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-5 space-y-4">
          <h3 className="text-xs font-semibold text-zinc-300 font-mono tracking-wider uppercase border-b border-zinc-800 pb-2.5 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Role Based Access Control (RBAC)
          </h3>

          <div className="space-y-3">
            <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-zinc-200">ADMINISTRATOR</span>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-[9px] font-mono text-emerald-400 rounded font-semibold">
                ACTIVE
              </span>
            </div>

            <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/40 flex justify-between items-center text-xs opacity-60">
              <span className="font-mono font-bold text-zinc-300">SEC-AUDITOR</span>
              <span className="px-2 py-0.5 bg-zinc-850 text-[9px] font-mono text-zinc-500 rounded font-semibold">
                INHERITED
              </span>
            </div>

            <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/40 flex justify-between items-center text-xs opacity-60">
              <span className="font-mono font-bold text-zinc-300">RELEASE-MANAGER</span>
              <span className="px-2 py-0.5 bg-zinc-850 text-[9px] font-mono text-zinc-500 rounded font-semibold">
                INHERITED
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Credentials overview */}
        <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-5 space-y-4">
          <h3 className="text-xs font-semibold text-zinc-300 font-mono tracking-wider uppercase border-b border-zinc-800 pb-2.5 flex items-center gap-1.5">
            <Key className="w-4 h-4 text-indigo-400" />
            System Authentication Secrets mapping
          </h3>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-zinc-800/40">
              <span className="text-zinc-500">GEMINI_API_KEY:</span>
              <span className="text-emerald-400 font-bold">configured (server-side)</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-zinc-800/40">
              <span className="text-zinc-500">JWT_HS256_SECRET:</span>
              <span className="text-indigo-400 font-bold">defined (spring-cloud)</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-zinc-800/40">
              <span className="text-zinc-500">MYSQL_ROOT_PASS:</span>
              <span className="text-zinc-300 font-semibold">****** (docker-compose)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
