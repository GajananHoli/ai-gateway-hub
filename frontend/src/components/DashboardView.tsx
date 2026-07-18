import React from 'react';
import { 
  Activity, 
  Clock, 
  Layers, 
  HardDrive, 
  ShieldAlert, 
  GitBranch, 
  Award, 
  Cpu, 
  Database,
  Terminal,
  TrendingUp,
  Info
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { GatewayLog, ContainerStatus, PodStatus } from '../types';

interface DashboardProps {
  logs: GatewayLog[];
  containers: ContainerStatus[];
  pods: PodStatus[];
  sonarStatus: string;
  coverage: string;
  dockerTag: string;
}

export default function DashboardView({ 
  logs, 
  containers, 
  pods, 
  sonarStatus, 
  coverage, 
  dockerTag 
}: DashboardProps) {
  
  // Calculate stats based on real/simulated logs
  const totalRequests = logs.length;
  const avgLatency = totalRequests > 0 
    ? Math.round(logs.reduce((acc, l) => acc + l.latencyMs, 0) / totalRequests) 
    : 85;
  const errorRate = totalRequests > 0 
    ? ((logs.filter(l => l.status >= 400).length / totalRequests) * 100).toFixed(1) 
    : "0.0";
  const activeAlerts = logs.filter(l => l.threatFlagged).length;

  const runningContainers = containers.filter(c => c.status === 'Up').length;
  const activePods = pods.filter(p => p.status === 'Running').length;

  // Chart datasets
  const timeChartData = logs.map((log, index) => {
    const d = new Date(log.timestamp);
    const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
    return {
      time: timeStr,
      latency: log.latencyMs,
      status: log.status,
      requests: Math.floor(Math.random() * 40) + 10
    };
  }).reverse();

  // HTTP Status distributions
  const statusCounts = logs.reduce((acc: Record<string, number>, log) => {
    const code = log.status.toString();
    acc[code] = (acc[code] || 0) + 1;
    return acc;
  }, {});

  const barChartData = Object.keys(statusCounts).map(code => ({
    status: `HTTP ${code}`,
    count: statusCounts[code],
    fill: code.startsWith('2') ? '#10b981' : code.startsWith('3') ? '#3b82f6' : code.startsWith('4') ? '#f59e0b' : '#ef4444'
  }));

  return (
    <div className="space-y-6 font-sans text-zinc-300">
      
      {/* Obervability Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* API Gateway Health */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">Gateway Health</span>
              <p className="text-xl font-mono font-bold text-zinc-100">99.98%</p>
            </div>
            <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Proxy Routing Nodes Online</span>
          </p>
        </div>

        {/* Avg Propagation Latency */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">Avg Response Time</span>
              <p className="text-xl font-mono font-bold text-zinc-100">{avgLatency} ms</p>
            </div>
            <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 mt-2">
            Mean latency over last {totalRequests} request cycles
          </p>
        </div>

        {/* Total Requests / throughput */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">Throughput rate</span>
              <p className="text-xl font-mono font-bold text-zinc-100">{totalRequests} Requests</p>
            </div>
            <div className="p-1.5 bg-sky-500/10 border border-sky-500/20 rounded text-sky-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 mt-2">
            Error frequency rate: <span className="text-red-400 font-bold">{errorRate}%</span>
          </p>
        </div>

        {/* Active Docker / K8s */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">Ops Registry</span>
              <p className="text-xl font-mono font-bold text-zinc-100">{runningContainers}/6 Ctr</p>
            </div>
            <div className="p-1.5 bg-teal-500/10 border border-teal-500/20 rounded text-teal-400">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 mt-2">
            Kubernetes active state: <span className="text-emerald-400 font-bold">{activePods} pods</span>
          </p>
        </div>
      </div>

      {/* DevSecOps Status & Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Sonar status */}
        <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="text-zinc-500">SONAR_STATUS</span>
          </div>
          <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded">
            {sonarStatus.toUpperCase()}
          </span>
        </div>

        {/* JaCoCo coverage */}
        <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span className="text-zinc-500">CODE_COVERAGE</span>
          </div>
          <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold rounded">
            {coverage}
          </span>
        </div>

        {/* Security Alert counters */}
        <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 animate-bounce" />
            <span className="text-zinc-500">SECURITY_ALERTS</span>
          </div>
          <span className={`px-2 py-0.5 rounded font-bold ${activeAlerts > 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse' : 'bg-zinc-900 text-zinc-400'}`}>
            {activeAlerts} WARN
          </span>
        </div>

        {/* Released version */}
        <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-zinc-400" />
            <span className="text-zinc-500">IMAGE_VERSION</span>
          </div>
          <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-200 font-semibold rounded">
            v{dockerTag}
          </span>
        </div>
      </div>

      {/* Observability Charts (Tanstack / Recharts visualizer) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Latency and Throughput trends */}
        <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 space-y-4 flex flex-col h-[380px]">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2.5">
            <h3 className="text-xs font-semibold text-zinc-300 font-mono tracking-wider uppercase">
              Gateway Propagation Latency Trace (ms)
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono">Live Transaction Streams</span>
          </div>

          <div className="flex-1 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="time" stroke="#71717a" />
                <YAxis stroke="#71717a" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#f4f4f5' }}
                  labelStyle={{ fontWeight: 'bold', color: '#10b981' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="latency" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Response Delay (ms)" 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* HTTP Status counts and distribution */}
        <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 space-y-4 flex flex-col h-[380px]">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2.5">
            <h3 className="text-xs font-semibold text-zinc-300 font-mono tracking-wider uppercase">
              HTTP Response Status Codes Distribution
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono">Transaction Codes</span>
          </div>

          <div className="flex-1 w-full text-xs font-mono">
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="status" stroke="#71717a" />
                  <YAxis stroke="#71717a" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#f4f4f5' }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Transactions Count" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-600">
                No telemetry transaction logs available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cluster Node specs (Datadog style metadata list) */}
      <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 space-y-4">
        <h3 className="text-xs font-semibold text-zinc-300 font-mono tracking-wider uppercase border-b border-zinc-800 pb-2">
          System Node Hardware Allocations (AWS t3.xlarge)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-zinc-400">
          <div className="p-3 bg-zinc-900/40 rounded border border-zinc-800 flex justify-between items-center">
            <span>CPU Core Utilization:</span>
            <span className="text-zinc-200 font-bold">34.5% (4 Cores Allocated)</span>
          </div>

          <div className="p-3 bg-zinc-900/40 rounded border border-zinc-800 flex justify-between items-center">
            <span>JVM RAM Footprint:</span>
            <span className="text-zinc-200 font-bold">4.21 GB / 16.00 GB (26.3%)</span>
          </div>

          <div className="p-3 bg-zinc-900/40 rounded border border-zinc-800 flex justify-between items-center">
            <span>Elastic Database Capacity:</span>
            <span className="text-zinc-200 font-bold">MySQL Cluster Active (Master/Replica)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

