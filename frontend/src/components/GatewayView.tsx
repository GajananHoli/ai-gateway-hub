import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Settings, 
  Sliders, 
  Zap, 
  RefreshCw, 
  Plus, 
  Check, 
  AlertTriangle, 
  Cpu, 
  Play, 
  Terminal,
  Server
} from 'lucide-react';
import { GatewayConfig, RouteRule } from '../types';

interface GatewayProps {
  config: GatewayConfig;
  setConfig: (config: GatewayConfig) => void;
  onUpdateConfig: (newConfig: Partial<GatewayConfig>) => void;
  onSendTestRequest: (method: string, path: string, headers: Record<string, string>) => void;
  testRequestResponse: any;
  isSendingRequest: boolean;
}

export default function GatewayView({ 
  config, 
  setConfig, 
  onUpdateConfig, 
  onSendTestRequest, 
  testRequestResponse,
  isSendingRequest 
}: GatewayProps) {
  const [localRateLimit, setLocalRateLimit] = useState(config.rateLimit);
  const [localBurstLimit, setLocalBurstLimit] = useState(config.burstLimit);
  const [localCBThreshold, setLocalCBThreshold] = useState(config.circuitBreakerThreshold);
  const [localCBTimeout, setLocalCBTimeout] = useState(config.circuitBreakerTimeout);
  const [testPath, setTestPath] = useState('/api/v1/users/me');
  const [testMethod, setTestMethod] = useState('GET');
  const [circuitStatus, setCircuitStatus] = useState<'CLOSED' | 'OPEN' | 'HALF_OPEN'>('CLOSED');
  const [customHeader, setCustomHeader] = useState('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');

  useEffect(() => {
    setLocalRateLimit(config.rateLimit);
    setLocalBurstLimit(config.burstLimit);
    setLocalCBThreshold(config.circuitBreakerThreshold);
    setLocalCBTimeout(config.circuitBreakerTimeout);
  }, [config]);

  const handleSaveConfig = () => {
    onUpdateConfig({
      rateLimit: localRateLimit,
      burstLimit: localBurstLimit,
      circuitBreakerThreshold: localCBThreshold,
      circuitBreakerTimeout: localCBTimeout
    });
  };

  const toggleRoute = (routeId: string) => {
    const updatedRoutes = config.routes.map(r => 
      r.id === routeId ? { ...r, active: !r.active } : r
    );
    setConfig({ ...config, routes: updatedRoutes });
    onUpdateConfig({ routes: updatedRoutes });
  };

  const handleTriggerTest = () => {
    const correlationId = `corr_${Math.random().toString(36).substring(2, 11)}`;
    onSendTestRequest(testMethod, testPath, {
      'Authorization': customHeader,
      'X-Correlation-ID': correlationId,
      'X-Client-Device': 'enterprise-visualizer'
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Intro Header */}
      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
          Spring Cloud Gateway Route Controller
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Dynamically monitor route definitions, configure rate limit token buckets, manage Resilience4j circuit breakers, and trace headers with automatic correlation IDs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left column: Routing & Sliders (Col 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Routes Panel */}
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-5">
            <h3 className="text-xs font-semibold text-zinc-300 font-mono tracking-wider uppercase mb-4 flex items-center justify-between">
              <span>Active Gateway Route Registry</span>
              <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-[9px] text-indigo-400 font-mono rounded">
                SPRING DISCOVERY LOCATOR
              </span>
            </h3>

            <div className="space-y-3">
              {config.routes.map(route => (
                <div 
                  key={route.id}
                  className={`p-3 rounded-lg border flex items-center justify-between transition ${
                    route.active 
                      ? 'bg-zinc-900/60 border-zinc-800' 
                      : 'bg-zinc-900/20 border-zinc-800/40 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${route.active ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                      <span className="text-xs font-mono font-bold text-zinc-200">{route.id}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400">
                      <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-indigo-300 font-bold">MATCH</span>
                      <span>{route.path}</span>
                      <span className="text-zinc-600">→</span>
                      <span className="text-emerald-400">{route.target}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Circuit state indicator on route if applicable */}
                    {route.id === 'product-service' && (
                      <span className={`px-2 py-0.5 text-[9px] font-mono font-semibold rounded border ${
                        circuitStatus === 'CLOSED' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                        CB: {circuitStatus}
                      </span>
                    )}

                    <button
                      onClick={() => toggleRoute(route.id)}
                      className={`px-3 py-1 text-[10px] font-semibold tracking-wider uppercase rounded transition ${
                        route.active 
                          ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20' 
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {route.active ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rate Limiting & CB controls */}
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-5 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-xs font-semibold text-zinc-300 font-mono tracking-wider uppercase flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Resilience & Rate Limit Configurations
              </h3>
              <button
                onClick={handleSaveConfig}
                className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold px-3 py-1.5 rounded transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Config</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rate Limiting Token Bucket */}
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-300 font-semibold">Redis Token Replenish Rate</span>
                  <span className="text-emerald-400 font-bold">{localRateLimit} req/s</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={localRateLimit}
                  onChange={e => setLocalRateLimit(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-zinc-800 h-1 rounded-lg cursor-pointer"
                />
                <p className="text-[10px] text-zinc-500">
                  How many token buckets are added back to redis rate limiter key state per second.
                </p>

                <div className="flex justify-between text-xs font-mono mt-4">
                  <span className="text-zinc-300 font-semibold">Redis Burst Capacity Limit</span>
                  <span className="text-emerald-400 font-bold">{localBurstLimit} requests</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="10"
                  value={localBurstLimit}
                  onChange={e => setLocalBurstLimit(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-zinc-800 h-1 rounded-lg cursor-pointer"
                />
                <p className="text-[10px] text-zinc-500">
                  Maximum burst rate of requests allowed in a single millisecond before HTTP 429 Too Many Requests is triggered downstream.
                </p>
              </div>

              {/* Resilience4j Circuit Breaker */}
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-300 font-semibold">Failure Rate CB Trip Threshold</span>
                  <span className="text-indigo-300 font-bold">{localCBThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  value={localCBThreshold}
                  onChange={e => setLocalCBThreshold(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 bg-zinc-800 h-1 rounded-lg cursor-pointer"
                />
                <p className="text-[10px] text-zinc-500">
                  Percentage of slow or failed calls that triggers the gateway circuit breaker to trip into OPEN state.
                </p>

                <div className="flex justify-between text-xs font-mono mt-4">
                  <span className="text-zinc-300 font-semibold">CB Fallback Timeout window</span>
                  <span className="text-indigo-300 font-bold">{localCBTimeout} ms</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="500"
                  value={localCBTimeout}
                  onChange={e => setLocalCBTimeout(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 bg-zinc-800 h-1 rounded-lg cursor-pointer"
                />
                <p className="text-[10px] text-zinc-500">
                  Time milliseconds before a tripped circuit breaker transitions back into HALF_OPEN state to test service recovery.
                </p>
              </div>
            </div>

            {/* Simulated CB Trigger */}
            <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">Manual Circuit Tripper:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCircuitStatus('CLOSED')}
                  className={`px-2 py-1 rounded text-[10px] ${circuitStatus === 'CLOSED' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400'}`}
                >
                  CLOSED
                </button>
                <button
                  onClick={() => setCircuitStatus('OPEN')}
                  className={`px-2 py-1 rounded text-[10px] ${circuitStatus === 'OPEN' ? 'bg-red-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400'}`}
                >
                  OPEN (TRIPPED)
                </button>
                <button
                  onClick={() => setCircuitStatus('HALF_OPEN')}
                  className={`px-2 py-1 rounded text-[10px] ${circuitStatus === 'HALF_OPEN' ? 'bg-amber-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400'}`}
                >
                  HALF_OPEN
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Interactive API Requestor Trace (Col 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-5 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-semibold text-zinc-300 font-mono tracking-wider uppercase mb-4 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Live Trace Request Simulator
              </h3>

              <div className="space-y-4">
                {/* Method / Path selection */}
                <div className="flex gap-2">
                  <select
                    value={testMethod}
                    onChange={e => setTestMethod(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-bold rounded p-2 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="DELETE">DELETE</option>
                  </select>

                  <select
                    value={testPath}
                    onChange={e => setTestPath(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono rounded p-2 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="/api/v1/users/me">GET /api/v1/users/me (User)</option>
                    <option value="/api/v1/users/register">POST /api/v1/users/register (Register)</option>
                    <option value="/api/v1/auth/login">POST /api/v1/auth/login (Auth)</option>
                    <option value="/api/v1/products">GET /api/v1/products (Products)</option>
                    <option value="/api/v1/ai/analyze-logs">POST /api/v1/ai/analyze-logs (AI)</option>
                  </select>
                </div>

                {/* Simulated Custom Header block */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">JWT Authentication Bearer Token</label>
                  <input
                    type="text"
                    value={customHeader}
                    onChange={e => setCustomHeader(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 rounded p-2 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  onClick={handleTriggerTest}
                  disabled={isSendingRequest}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/10"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isSendingRequest ? 'Propagating via Gateway...' : 'Inject Test Request'}</span>
                </button>
              </div>
            </div>

            {/* Traced Output */}
            <div className="mt-6 flex-1 flex flex-col justify-end">
              <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider mb-2 block">Correlation Header & Trace Response</span>
              <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4 font-mono text-[11px] text-zinc-300 overflow-y-auto max-h-[250px] min-h-[200px]">
                {testRequestResponse ? (
                  <div className="space-y-3">
                    <div className="border-b border-zinc-800 pb-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-zinc-500">CORRELATION_ID:</span>
                        <span className="text-emerald-400 font-bold">{testRequestResponse.correlationId}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] mt-1">
                        <span className="text-zinc-500">STATUS_CODE:</span>
                        <span className={`font-bold ${testRequestResponse.status < 400 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {testRequestResponse.status} {testRequestResponse.status === 200 ? 'OK' : testRequestResponse.status === 201 ? 'CREATED' : 'UNAUTHORIZED'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] mt-1">
                        <span className="text-zinc-500">TIME_LATENCY:</span>
                        <span className="text-indigo-400 font-bold">{testRequestResponse.latencyMs} ms</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-zinc-500 block mb-1">RESPONSE_PAYLOAD:</span>
                      <pre className="text-[10px] text-zinc-300 bg-zinc-950 p-2 rounded overflow-x-auto">
                        {JSON.stringify(testRequestResponse.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center py-10">
                    <Server className="w-8 h-8 mb-2 text-zinc-800" />
                    <span>No requests dispatched. Click "Inject Test Request" to see gateway request correlation tracing.</span>
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
