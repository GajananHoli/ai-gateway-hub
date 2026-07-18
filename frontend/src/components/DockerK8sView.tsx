import React, { useState, useEffect } from 'react';
import { 
  HardDrive, 
  Network, 
  Terminal, 
  Play, 
  Square, 
  RotateCw, 
  Layers, 
  FileCode, 
  ShieldAlert, 
  RefreshCw, 
  ArrowUpRight, 
  Activity, 
  Cpu, 
  Sliders 
} from 'lucide-react';
import { ContainerStatus, PodStatus } from '../types';
import { devOpsData } from '../data/microservicesData';

interface DevOpsProps {
  containers: ContainerStatus[];
  setContainers: React.Dispatch<React.SetStateAction<ContainerStatus[]>>;
  pods: PodStatus[];
  setPods: React.Dispatch<React.SetStateAction<PodStatus[]>>;
  onScalePods: (count: number) => void;
  env: 'dev' | 'staging' | 'prod';
}

export default function DockerK8sView({ 
  containers, 
  setContainers, 
  pods, 
  setPods, 
  onScalePods,
  env
}: DevOpsProps) {
  const [activeEngine, setActiveEngine] = useState<'docker' | 'kubernetes'>('docker');
  const [selectedContainer, setSelectedContainer] = useState<string>('gateway-service');
  const [selectedK8sResource, setSelectedK8sResource] = useState<string>('k8s/gateway-deployment.yaml');
  const [activeNamespace, setActiveNamespace] = useState<string>('ai-gateway-hub');
  const [containerLogs, setContainerLogs] = useState<Record<string, string[]>>({});
  const [hpaConfig, setHpaConfig] = useState({ min: 3, max: 10, targetCpu: 75 });
  const [helmValuesContent, setHelmValuesContent] = useState('');

  // Set up static logs for our containers on mount
  useEffect(() => {
    const logsMap: Record<string, string[]> = {
      'eureka-server': [
        "[INFO] Starting Eureka Server Service...",
        "[INFO] Registering Metadata instance ID...",
        "[INFO] Eureka Server initialized successfully on port 8761.",
        "[INFO] Renewing leases for active microservices."
      ],
      'gateway-redis': [
        "1:M 16 Jul 2026 11:30:00.000 * Running mode=standalone, port=6379.",
        "1:M 16 Jul 2026 11:30:00.050 # Server initialized.",
        "1:M 16 Jul 2026 11:32:15.102 * DB loaded from disk: 0.000 seconds",
        "1:M 16 Jul 2026 11:32:15.150 * Ready to accept connections tcp"
      ],
      'gateway-kafka': [
        "[KafkaServer id=1] Starting Kraft Broker process...",
        "[KafkaServer id=1] Metadata loader initialized successfully.",
        "[Controller id=1] Creating new security-alerts Kafka Topic...",
        "[KafkaServer id=1] Kafka Server fully online and bound to port 9092."
      ],
      'gateway-service': [
        "  .   ____          _            __ _ _",
        " /\\\\ / ___'_ __ _ _(_)_ __  __ _ \\_\\_\\_\\",
        "( ( )\\___ | '_ | '_| | '_ \\/ _\` | \\ \\ \\ \\",
        " \\\\/  ___)| |_)| | | | | || (_| |  ) ) ) )",
        "  '  |____| .__|_| |_|_| |__\\__, | / / / /",
        " =========|_|==============|___/=/_/_/_/",
        " :: Spring Boot ::                (v3.2.4)",
        "2026-07-16 11:35:01.002  INFO 1 --- [main] c.a.GatewayApplication : Starting GatewayApplication on JDK 21",
        "2026-07-16 11:35:03.450  INFO 1 --- [main] c.a.GatewayApplication : Registering with Eureka Service Registry",
        "2026-07-16 11:35:04.992  INFO 1 --- [main] c.a.c.GatewayRoutesConfig : Initialized custom route map locator.",
        "2026-07-16 11:35:05.102  INFO 1 --- [main] o.s.b.w.embedded.netty.NettyWebServer : Netty started on port 8080",
        "2026-07-16 11:36:12.450  INFO 1 --- [reactor-http] c.a.c.JwtValidationFilter : Traced transaction X-Correlation-ID: corr_8572b"
      ],
      'user-service': [
        "2026-07-16 11:35:02.100  INFO 1 --- [main] com.userservice.UserService : Booting microservice standard user-service...",
        "2026-07-16 11:35:04.550  INFO 1 --- [main] o.s.d.j.r.s.RepositoryConfigurationDelegate : Bootstrapping Spring Data JPA repositories.",
        "2026-07-16 11:35:06.120  INFO 1 --- [main] org.hibernate.Version : HIBERNATE Version: 6.4.1.Final",
        "2026-07-16 11:35:08.300  INFO 1 --- [main] com.zaxxer.hikari.HikariDataSource : HikariPool-1 - Starting connection pool to database.",
        "2026-07-16 11:35:09.910  INFO 1 --- [main] o.s.b.w.embedded.tomcat.TomcatWebServer : Tomcat started on port 8081 (http)"
      ],
      'gateway-mysql': [
        "2026-07-16T11:30:00.123456Z 0 [System] [MY-010116] [Server] /usr/sbin/mysqld (mysqld 8.0.35) starting as process 1",
        "2026-07-16T11:30:00.450201Z 0 [Warning] [MY-010068] [Server] CA certificate ca.pem is self signed.",
        "2026-07-16T11:30:01.102395Z 0 [System] [MY-010931] [Server] /usr/sbin/mysqld: ready for connections. Version: '8.0.35' port: 3306"
      ]
    };
    setContainerLogs(logsMap);

    const helmValuesFile = devOpsData.kubernetes.find(k => k.name === 'helm/values.yaml');
    if (helmValuesFile) {
      setHelmValuesContent(helmValuesFile.content);
    }
  }, []);

  // Docker Container Control Actions
  const handleContainerAction = (name: string, action: 'start' | 'stop' | 'restart') => {
    setContainers(prev => prev.map(c => {
      if (c.name === name) {
        let newStatus = c.status;
        let newHealth = c.health;
        let newCpu = c.cpu;
        let newMem = c.memory;

        if (action === 'stop') {
          newStatus = 'Exited';
          newHealth = 'none';
          newCpu = '0%';
          newMem = '0Mi';
        } else if (action === 'start' || action === 'restart') {
          newStatus = 'Up';
          newHealth = 'healthy';
          newCpu = '2%';
          newMem = '150Mi';
        }

        return { ...c, status: newStatus, health: newHealth, cpu: newCpu, memory: newMem };
      }
      return c;
    }));

    // Append standard logs
    setContainerLogs(prev => {
      const currentLogs = prev[name] || [];
      return {
        ...prev,
        [name]: [
          ...currentLogs,
          `[USER_ACTION] [${new Date().toISOString()}] Triggered ${action.toUpperCase()} action on container '${name}'`,
          `[SYSTEM] Container '${name}' state transition: ${action === 'stop' ? 'Exited (Code 0)' : 'Up & Healthy'}`
        ]
      };
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Selector Engine tabs */}
      <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-xl border border-zinc-800">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveEngine('docker')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeEngine === 'docker'
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            Docker Compose Engine
          </button>

          <button
            onClick={() => setActiveEngine('kubernetes')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeEngine === 'kubernetes'
                ? 'bg-indigo-600 text-zinc-100 shadow-md font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Network className="w-4 h-4" />
            Kubernetes Orchestration
          </button>
        </div>

        <div className="text-[10px] font-mono text-zinc-500 tracking-wider">
          ACTIVE_PROFILE: <span className="text-emerald-400 font-bold">{env.toUpperCase()}</span>
        </div>
      </div>

      {/* -------------------- DOCKER COMPOSE VIEW -------------------- */}
      {activeEngine === 'docker' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Active containers grid */}
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-5">
            <h3 className="text-xs font-semibold text-zinc-300 font-mono tracking-wider uppercase mb-4 flex items-center justify-between">
              <span>Docker Compose Local Containers Status</span>
              <span className="text-[10px] text-zinc-500 font-mono">DOCKER_API_v1.41</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {containers.map(container => (
                <div 
                  key={container.name}
                  className={`p-4 rounded-xl border bg-zinc-900/40 flex flex-col justify-between transition ${
                    container.status === 'Up' 
                      ? 'border-zinc-850 hover:border-zinc-700' 
                      : 'border-red-950/40 opacity-70'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <span className="text-xs font-mono font-bold text-zinc-200">{container.name}</span>
                        <p className="text-[10px] text-zinc-500 font-mono">Ports: {container.ports}</p>
                      </div>

                      <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded ${
                        container.status === 'Up' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {container.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-zinc-850 text-center text-[10px] font-mono">
                      <div>
                        <span className="text-zinc-500 block">CPU</span>
                        <span className="text-zinc-300 font-bold">{container.cpu}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">RAM</span>
                        <span className="text-zinc-300 font-bold">{container.memory}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Health</span>
                        <span className={`font-semibold capitalize ${
                          container.health === 'healthy' ? 'text-emerald-400' :
                          container.health === 'starting' ? 'text-amber-400' : 'text-zinc-500'
                        }`}>{container.health}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 mt-4 justify-end border-t border-zinc-850/40 pt-3">
                    <button
                      onClick={() => handleContainerAction(container.name, 'restart')}
                      className="p-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 rounded text-zinc-450 hover:text-zinc-200 transition"
                      title="Restart container"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    {container.status === 'Up' ? (
                      <button
                        onClick={() => handleContainerAction(container.name, 'stop')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-[10px] font-semibold border border-red-500/20 transition"
                      >
                        <Square className="w-3 h-3 fill-current" />
                        <span>Stop</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleContainerAction(container.name, 'start')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-semibold border border-emerald-500/20 transition"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Start</span>
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedContainer(container.name)}
                      className={`px-3 py-1.5 rounded text-[10px] font-semibold transition ${
                        selectedContainer === container.name 
                          ? 'bg-zinc-800 text-zinc-100' 
                          : 'bg-zinc-900 text-zinc-450 hover:text-zinc-200 border border-zinc-800'
                      }`}
                    >
                      View Logs
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Container live stdout stream logs */}
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-5 flex flex-col h-[400px]">
            <div className="p-3 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between rounded-t-lg">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-zinc-300">STDOUT LOGS: {selectedContainer}</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-500 uppercase">Live polling every 5s</span>
            </div>

            <div className="flex-1 bg-zinc-950 p-4 font-mono text-[11px] text-emerald-500/90 overflow-y-auto space-y-1.5 rounded-b-lg border border-zinc-850">
              {(containerLogs[selectedContainer] || []).map((log, idx) => (
                <div key={idx} className="whitespace-pre-wrap leading-relaxed">{log}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- KUBERNETES VIEW -------------------- */}
      {activeEngine === 'kubernetes' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Replica Controls & Topology */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Active Pods List (Col 7) */}
            <div className="lg:col-span-7 bg-zinc-950 rounded-xl border border-zinc-800 p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h3 className="text-xs font-semibold text-zinc-300 font-mono tracking-wider uppercase flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  K8s Active Pods Registry
                </h3>

                {/* Namespace Selector */}
                <select
                  value={activeNamespace}
                  onChange={e => setActiveNamespace(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-mono p-1 rounded font-bold"
                >
                  <option value="ai-gateway-hub">namespace: ai-gateway-hub</option>
                  <option value="default">namespace: default</option>
                  <option value="kube-system">namespace: kube-system</option>
                </select>
              </div>

              {/* HPA manual simulation bar */}
              <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Horizontal Pod Autoscaler (HPA) Target Replicas:</span>
                <div className="flex gap-1 bg-zinc-950 p-1 rounded">
                  {[2, 3, 5, 8].map(count => (
                    <button
                      key={count}
                      onClick={() => onScalePods(count)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition ${
                        pods.length === count 
                          ? 'bg-indigo-600 text-zinc-100 shadow-sm' 
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {pods.map(pod => (
                  <div 
                    key={pod.name}
                    className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/20 flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-mono font-bold text-zinc-200">{pod.name}</span>
                      </div>
                      <div className="flex gap-3 text-[10px] font-mono text-zinc-500">
                        <span>IP: {pod.ip}</span>
                        <span>Restarts: {pod.restarts}</span>
                        <span>Age: {pod.age}</span>
                      </div>
                    </div>

                    <div className="flex gap-4 text-xs font-mono text-right shrink-0">
                      <div>
                        <span className="text-zinc-500 text-[9px] block">CPU</span>
                        <span className="text-indigo-300 font-semibold">{pod.cpu}%</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-[9px] block">MEM</span>
                        <span className="text-indigo-300 font-semibold">{pod.memory}Mi</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-[9px] block">Status</span>
                        <span className="text-emerald-400 font-bold uppercase text-[10px]">{pod.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Config & Deployment Manifests (Col 5) */}
            <div className="lg:col-span-5 bg-zinc-950 rounded-xl border border-zinc-800 p-5 flex flex-col h-[480px]">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
                <h3 className="text-xs font-semibold text-zinc-300 font-mono tracking-wider uppercase flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  YAML Manifest Explorer
                </h3>
              </div>

              {/* Selector manifest files */}
              <div className="grid grid-cols-2 gap-1.5 mb-3 bg-zinc-900/40 p-1 rounded border border-zinc-800">
                {devOpsData.kubernetes.map(k => (
                  <button
                    key={k.name}
                    onClick={() => setSelectedK8sResource(k.name)}
                    className={`px-2 py-1 rounded text-[9px] font-mono font-semibold truncate transition ${
                      selectedK8sResource === k.name
                        ? 'bg-zinc-800 text-zinc-100'
                        : 'text-zinc-450 hover:text-zinc-200'
                    }`}
                    title={k.name}
                  >
                    {k.name.split('/').pop()}
                  </button>
                ))}
              </div>

              <div className="flex-1 bg-zinc-950 p-3 rounded font-mono text-[10px] text-zinc-450 overflow-y-auto leading-relaxed border border-zinc-800">
                <pre className="whitespace-pre">
                  {devOpsData.kubernetes.find(k => k.name === selectedK8sResource)?.content || ''}
                </pre>
              </div>
            </div>
          </div>

          {/* Helm Chart Config Block */}
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-5 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-300 font-mono tracking-wider uppercase border-b border-zinc-800 pb-2">
              Helm Production Deployment Config (values.yaml)
            </h3>
            
            <p className="text-xs text-zinc-400">
              Customize values directly. These configurations govern the values variables substituted during Helm upgrades in the production environment.
            </p>

            <textarea
              className="w-full h-44 bg-zinc-900 border border-zinc-800 rounded p-3 font-mono text-[11px] text-zinc-300 focus:outline-none focus:border-indigo-500 leading-relaxed"
              value={helmValuesContent}
              onChange={e => setHelmValuesContent(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
