import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import GatewayView from './components/GatewayView';
import CodeExplorer from './components/CodeExplorer';
import DockerK8sView from './components/DockerK8sView';
import CicdView from './components/CicdView';
import SecurityAiView from './components/SecurityAiView';
import SettingsView from './components/SettingsView';
import ProfileView from './components/ProfileView';

import { GatewayLog, ContainerStatus, PodStatus, GatewayConfig } from './types';

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [env, setEnv] = useState<'dev' | 'staging' | 'prod'>('prod');
  const [logs, setLogs] = useState<GatewayLog[]>([]);
  const [apiHealth, setApiHealth] = useState<'healthy' | 'warning' | 'critical'>('healthy');

  // Container states
  const [containers, setContainers] = useState<ContainerStatus[]>([
    { name: 'eureka-server', status: 'Up', ports: '8761:8761', health: 'healthy', cpu: '1.2%', memory: '190Mi' },
    { name: 'gateway-redis', status: 'Up', ports: '6379:6379', health: 'healthy', cpu: '0.5%', memory: '45Mi' },
    { name: 'gateway-kafka', status: 'Up', ports: '9092:9092', health: 'healthy', cpu: '2.4%', memory: '310Mi' },
    { name: 'gateway-service', status: 'Up', ports: '8080:8080', health: 'healthy', cpu: '4.8%', memory: '520Mi' },
    { name: 'user-service', status: 'Up', ports: '8081:8081', health: 'healthy', cpu: '3.1%', memory: '480Mi' },
    { name: 'gateway-mysql', status: 'Up', ports: '3306:3306', health: 'healthy', cpu: '1.1%', memory: '240Mi' }
  ]);

  // Pod states
  const [pods, setPods] = useState<PodStatus[]>([]);

  // Pipeline metrics
  const [pipelineMetrics, setPipelineMetrics] = useState({
    sonarStatus: 'Passed',
    coverage: '87.5%',
    dockerTag: '1.4.0'
  });

  // Gateway Config state
  const [gatewayConfig, setGatewayConfig] = useState<GatewayConfig>({
    rateLimit: 10,
    burstLimit: 20,
    circuitBreakerThreshold: 50,
    circuitBreakerTimeout: 3000,
    routes: []
  });

  // AI responses
  const [geminiExplanation, setGeminiExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);

  // Test Request tracing
  const [testResponse, setTestResponse] = useState<any>(null);
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  // TanStack Query for auto-polling logs and API Health status every 30 seconds
  const { data: fetchedLogs, refetch: refetchLogs } = useQuery<GatewayLog[]>({
    queryKey: ['logs'],
    queryFn: async () => {
      const res = await fetch('/api/logs?count=35');
      if (!res.ok) {
        throw new Error('Failed to fetch telemetry logs');
      }
      return res.json();
    },
    refetchInterval: 30000, // Auto-refresh logs and health status every 30 seconds
    refetchIntervalInBackground: true,
  });

  // Sync state and compute health when query returns or polls new logs
  useEffect(() => {
    if (fetchedLogs) {
      setLogs(fetchedLogs);

      // Evaluate general health based on status codes
      const serverErrors = fetchedLogs.filter((l: GatewayLog) => l.status >= 500).length;
      if (serverErrors > 3) {
        setApiHealth('critical');
      } else if (serverErrors > 0) {
        setApiHealth('warning');
      } else {
        setApiHealth('healthy');
      }
    }
  }, [fetchedLogs]);

  // Keep manual refresh function working
  const fetchLogs = async () => {
    await refetchLogs();
  };

  // Fetch Spring Cloud config properties
  const fetchGatewayConfig = async () => {
    try {
      const res = await fetch('/api/gateway/config');
      const data = await res.json();
      setGatewayConfig(data);
    } catch (err) {
      console.error('Error fetching gateway configs:', err);
    }
  };

  // Sync state on load
  useEffect(() => {
    fetchGatewayConfig();
  }, []);

  // Update gateway config on server
  const handleUpdateConfig = async (newConfig: Partial<GatewayConfig>) => {
    try {
      const res = await fetch('/api/gateway/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      const data = await res.json();
      setGatewayConfig(data.config);
    } catch (err) {
      console.error('Error syncing config to server:', err);
    }
  };

  // Scale pods list
  const handleScalePods = (count: number) => {
    const newPods: PodStatus[] = [];
    for (let i = 0; i < count; i++) {
      newPods.push({
        name: `gateway-service-${Math.random().toString(36).substring(2, 7)}-${i}`,
        status: 'Running',
        cpu: Math.floor(Math.random() * 25) + 5,
        memory: Math.floor(Math.random() * 80) + 400,
        restarts: 0,
        age: '2d12h',
        ip: `10.244.2.${15 + i}`
      });
    }
    setPods(newPods);
  };

  // Initial pod scale on env change
  useEffect(() => {
    const podMultiplier = env === 'prod' ? 5 : env === 'staging' ? 3 : 2;
    handleScalePods(podMultiplier);
  }, [env]);

  // Request Tracer Simulation
  const handleSendTestRequest = async (method: string, path: string, headers: Record<string, string>) => {
    setIsSendingRequest(true);
    setTestResponse(null);

    // Simulate trace duration
    setTimeout(() => {
      let mockPayload: any = { status: "success", timestamp: new Date().toISOString() };
      let status = 200;

      if (path === '/api/v1/auth/login') {
        mockPayload = { accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIs...", expiresAt: "2026-07-16T23:36:00" };
        status = 201;
      } else if (path === '/api/v1/products') {
        mockPayload = [
          { id: 101, name: "Enterprise API Gateway License", price: 1499.0 },
          { id: 102, name: "Log Shipper Agent Pro", price: 299.0 }
        ];
      } else if (path === '/api/v1/users/me') {
        mockPayload = { userId: 120, email: loggedInUser, authorities: ["ADMIN_OPERATOR"], MFA_status: "configured" };
      }

      const responseObj = {
        correlationId: headers['X-Correlation-ID'] || 'corr_generic_001',
        status,
        latencyMs: Math.floor(Math.random() * 80) + 20,
        payload: mockPayload
      };

      setTestResponse(responseObj);
      setIsSendingRequest(false);

      // Prepend to logs trace list
      const newLog: GatewayLog = {
        id: `txn_${Math.random().toString(36).substring(2, 11)}`,
        timestamp: new Date().toISOString(),
        correlationId: responseObj.correlationId,
        clientIp: '12.34.56.78',
        method,
        path,
        service: path.includes('product') ? 'product-service' : path.includes('ai') ? 'ai-service' : 'user-service',
        status,
        latencyMs: responseObj.latencyMs,
        userAgent: 'enterprise-visualizer-trace',
        requestPayload: '{}',
        threatFlagged: false,
        threatType: null
      };

      setLogs(prev => [newLog, ...prev.slice(0, 39)]);
    }, 800);
  };

  // Gemini source code explanation fetcher
  const handleExplainCode = async (prompt: string, code: string) => {
    setIsExplaining(true);
    setGeminiExplanation('');

    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logs: [
            {
              id: 'explain_code',
              timestamp: new Date().toISOString(),
              correlationId: 'explain_01',
              clientIp: 'localhost',
              method: 'EXPLAIN',
              path: prompt,
              service: 'ai-service',
              status: 200,
              latencyMs: 120,
              userAgent: 'system-agent',
              requestPayload: code,
              threatFlagged: false,
              threatType: null
            }
          ]
        })
      });
      const data = await res.json();
      setGeminiExplanation(data.summary);
    } catch (err: any) {
      setGeminiExplanation(`Error requesting AI summary: ${err.message}`);
    } finally {
      setIsExplaining(false);
    }
  };

  // Update CI/CD metrics on complete
  const handlePipelineComplete = (coverage: string, sonarStatus: string, dockerTag: string) => {
    setPipelineMetrics({
      coverage,
      sonarStatus,
      dockerTag
    });
  };

  if (!loggedInUser) {
    return <LoginView onLoginSuccess={(email) => setLoggedInUser(email)} />;
  }

  return (
    <div className="flex bg-[#09090b] text-zinc-100 min-h-screen">
      {/* Left Navigation bar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userEmail={loggedInUser} 
        onLogout={() => setLoggedInUser(null)}
        apiHealth={apiHealth}
      />

      {/* Main viewport area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          env={env} 
          setEnv={setEnv} 
          podCount={pods.length} 
          triggerMetricsReload={fetchLogs}
        />

        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardView 
              logs={logs}
              containers={containers}
              pods={pods}
              sonarStatus={pipelineMetrics.sonarStatus}
              coverage={pipelineMetrics.coverage}
              dockerTag={pipelineMetrics.dockerTag}
            />
          )}

          {activeTab === 'gateway' && (
            <GatewayView 
              config={gatewayConfig}
              setConfig={setGatewayConfig}
              onUpdateConfig={handleUpdateConfig}
              onSendTestRequest={handleSendTestRequest}
              testRequestResponse={testResponse}
              isSendingRequest={isSendingRequest}
            />
          )}

          {activeTab === 'services' && (
            <CodeExplorer 
              onAskGemini={handleExplainCode}
              geminiExplanation={geminiExplanation}
              isExplaining={isExplaining}
            />
          )}

          {activeTab === 'docker' && (
            <DockerK8sView 
              containers={containers}
              setContainers={setContainers}
              pods={pods}
              setPods={setPods}
              onScalePods={handleScalePods}
              env={env}
            />
          )}

          {activeTab === 'kubernetes' && (
            <DockerK8sView 
              containers={containers}
              setContainers={setContainers}
              pods={pods}
              setPods={setPods}
              onScalePods={handleScalePods}
              env={env}
            />
          )}

          {activeTab === 'cicd' && (
            <CicdView 
              onPipelineComplete={handlePipelineComplete}
            />
          )}

          {activeTab === 'security' && (
            <SecurityAiView 
              logs={logs}
              refreshLogs={fetchLogs}
              env={env}
            />
          )}

          {activeTab === 'ai-insights' && (
            <SecurityAiView 
              logs={logs}
              refreshLogs={fetchLogs}
              env={env}
            />
          )}

          {activeTab === 'monitoring' && (
            <SettingsView 
              env={env}
              setEnv={setEnv}
              apiHealth={apiHealth}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView 
              env={env}
              setEnv={setEnv}
              apiHealth={apiHealth}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView 
              userEmail={loggedInUser}
            />
          )}
        </main>
      </div>
    </div>
  );
}
