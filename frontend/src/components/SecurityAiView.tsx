import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  ShieldAlert, 
  Activity, 
  Sparkles, 
  TrendingUp, 
  RefreshCw, 
  Terminal, 
  AlertTriangle, 
  CheckCircle2, 
  Database,
  Cpu,
  Info
} from 'lucide-react';
import { GatewayLog } from '../types';

interface AiViewProps {
  logs: GatewayLog[];
  refreshLogs: () => void;
  env: 'dev' | 'staging' | 'prod';
}

export default function SecurityAiView({ logs, refreshLogs, env }: AiViewProps) {
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'summarize' | 'threats' | 'slow-apis' | 'scaling'>('summarize');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiSource, setAiSource] = useState('');
  const [logFilter, setLogFilter] = useState<'all' | 'threats' | 'slow'>('all');

  const filteredLogs = logs.filter(log => {
    if (logFilter === 'threats') return log.threatFlagged;
    if (logFilter === 'slow') return log.latencyMs > 200;
    return true;
  });

  const handleRunAiAnalysis = async (type: 'summarize' | 'threats' | 'slow-apis' | 'scaling') => {
    setLoadingAi(true);
    setAiResponse('');
    
    let endpoint = '/api/ai/summarize';
    let body: any = { logs };

    if (type === 'threats') {
      endpoint = '/api/ai/threats';
    } else if (type === 'slow-apis') {
      endpoint = '/api/ai/slow-apis';
    } else if (type === 'scaling') {
      endpoint = '/api/ai/scaling';
      body = {
        metrics: {
          activePods: logs.length > 30 ? 5 : 3,
          cpuUsagePercentage: logs.reduce((acc, l) => acc + (l.latencyMs > 300 ? 5 : 1), 0) + 35,
          memoryUsagePercentage: 68,
          activeRps: (logs.length / 5).toFixed(1),
          environment: env
        }
      };
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      setAiResponse(data.summary || data.securityInsights || data.performanceInsights || data.scalingInsights || 'No insights received.');
      setAiSource(data.source || 'AI Service');
    } catch (err: any) {
      setAiResponse(`Failed to analyze: ${err.message}`);
      setAiSource('AI Error Handler');
    } finally {
      setLoadingAi(false);
    }
  };

  // Run initial default analysis on load
  useEffect(() => {
    handleRunAiAnalysis(activeAnalysisTab);
  }, [activeAnalysisTab]);

  return (
    <div className="space-y-6 font-sans">
      {/* Intro visual banner */}
      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            AI Gateway Analytics & DevSecOps Intelligence
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Leverage server-side Google Gemini 3.5 Flash modeling to summarize transaction logs, identify threats, recommend performance updates, and configure auto-scalers.
          </p>
        </div>

        <button
          onClick={refreshLogs}
          className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-bold text-xs rounded-lg flex items-center gap-1.5 transition shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Live Logs</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Live Log Stream Terminal (Col 5) */}
        <div className="lg:col-span-5 bg-zinc-950 rounded-xl border border-zinc-800 p-5 flex flex-col h-[580px]">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4 shrink-0">
            <h3 className="text-xs font-semibold text-zinc-300 font-mono tracking-wider uppercase flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Live Gateway Traffic Trace
            </h3>

            {/* Filter tags */}
            <div className="flex bg-zinc-900 p-0.5 rounded border border-zinc-800 text-[9px] font-mono font-bold">
              <button
                onClick={() => setLogFilter('all')}
                className={`px-1.5 py-0.5 rounded ${logFilter === 'all' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                ALL
              </button>
              <button
                onClick={() => setLogFilter('threats')}
                className={`px-1.5 py-0.5 rounded ${logFilter === 'threats' ? 'bg-red-500/10 text-red-400' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                THREATS
              </button>
              <button
                onClick={() => setLogFilter('slow')}
                className={`px-1.5 py-0.5 rounded ${logFilter === 'slow' ? 'bg-amber-500/10 text-amber-400' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                SLOW
              </button>
            </div>
          </div>

          {/* Logs lists */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredLogs.length > 0 ? (
              filteredLogs.map(log => (
                <div 
                  key={log.id}
                  className={`p-2.5 rounded border text-[10px] font-mono leading-relaxed transition ${
                    log.threatFlagged 
                      ? 'bg-red-950/20 border-red-500/35 text-red-300' 
                      : log.latencyMs > 200 
                      ? 'bg-amber-950/10 border-amber-500/25 text-amber-300'
                      : 'bg-zinc-900/50 border-zinc-850 text-zinc-450'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-1 py-0.5 rounded text-[8px] font-bold ${
                        log.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
                      }`}>
                        {log.method}
                      </span>
                      <span className="text-zinc-300 font-bold max-w-[150px] truncate" title={log.path}>
                        {log.path}
                      </span>
                    </div>

                    <span className="font-semibold">{log.latencyMs}ms</span>
                  </div>

                  <div className="flex justify-between text-[9px] text-zinc-500">
                    <span>IP: {log.clientIp}</span>
                    <span>status: <span className={log.status >= 400 ? 'text-red-400' : 'text-emerald-400'}>{log.status}</span></span>
                  </div>

                  {log.threatFlagged && (
                    <div className="mt-1.5 p-1 bg-red-500/10 rounded border border-red-500/10 flex items-center gap-1 text-[9px] text-red-400 font-bold uppercase">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span>{log.threatType}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-650 text-center text-xs py-10">
                No matching traffic log transactions.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Interactive AI Summary Console (Col 7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-5 flex flex-col h-[580px] justify-between">
            <div>
              {/* Category selector */}
              <div className="flex border-b border-zinc-800 pb-2 mb-4">
                {(['summarize', 'threats', 'slow-apis', 'scaling'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveAnalysisTab(tab)}
                    className={`flex-1 text-center py-2 text-xs font-mono tracking-wide uppercase border-b-2 transition ${
                      activeAnalysisTab === tab 
                        ? 'border-indigo-500 text-zinc-100 font-bold' 
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {tab === 'summarize' ? 'Log Summarizer' :
                     tab === 'threats' ? 'Threat Detector' :
                     tab === 'slow-apis' ? 'Slow APIs' : 'Scalability'}
                  </button>
                ))}
              </div>

              {/* Quick instructions / dynamic status */}
              <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-450">
                <div className="flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-zinc-500" />
                  <span>
                    {activeAnalysisTab === 'summarize' && 'Summarizes overall REST API counts, HTTP statuses, and latencies.'}
                    {activeAnalysisTab === 'threats' && 'Analyzes payloads and paths for SQL injection and brute force.'}
                    {activeAnalysisTab === 'slow-apis' && 'Suggests circuit breaker trip latency benchmarks & Redis caching.'}
                    {activeAnalysisTab === 'scaling' && 'Suggests horizontal pod autoscaling (HPA) resource allocations.'}
                  </span>
                </div>

                <button
                  onClick={() => handleRunAiAnalysis(activeAnalysisTab)}
                  disabled={loadingAi}
                  className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-zinc-100 text-[10px] font-bold rounded transition"
                >
                  <Sparkles className="w-3 h-3 text-indigo-200" />
                  <span>Analyze</span>
                </button>
              </div>
            </div>

            {/* AI Results viewport */}
            <div className="flex-1 mt-4 flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between text-[10px] font-mono uppercase text-zinc-500 tracking-wider mb-2 shrink-0">
                <span>ANALYSIS RESULTS</span>
                <span className="text-indigo-400 font-bold">SOURCE: {aiSource}</span>
              </div>

              <div className="flex-1 bg-zinc-900/50 rounded-lg border border-zinc-800 p-4 overflow-y-auto leading-relaxed text-xs text-zinc-300 font-sans">
                {loadingAi ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-3">
                    <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-mono text-zinc-500 animate-pulse">Consulting Gemini 3.5 Flash neural models to compile DevSecOps summary report...</span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap font-sans text-zinc-200">
                    {aiResponse}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
