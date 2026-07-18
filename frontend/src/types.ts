export interface GatewayLog {
  id: string;
  timestamp: string;
  correlationId: string;
  clientIp: string;
  method: string;
  path: string;
  service: string;
  status: number;
  latencyMs: number;
  userAgent: string;
  requestPayload: string;
  threatFlagged: boolean;
  threatType: string | null;
}

export interface RouteRule {
  id: string;
  path: string;
  target: string;
  active: boolean;
}

export interface GatewayConfig {
  rateLimit: number;
  burstLimit: number;
  circuitBreakerThreshold: number;
  circuitBreakerTimeout: number;
  routes: RouteRule[];
}

export interface PodStatus {
  name: string;
  status: 'Running' | 'Pending' | 'Failed' | 'Terminating';
  cpu: number;
  memory: number;
  restarts: number;
  age: string;
  ip: string;
}

export interface ContainerStatus {
  name: string;
  status: 'Up' | 'Exited' | 'Starting';
  ports: string;
  health: 'healthy' | 'unhealthy' | 'starting' | 'none';
  cpu: string;
  memory: string;
}

export interface PipelineStep {
  name: string;
  status: 'idle' | 'running' | 'success' | 'failed';
  durationSec: number;
  logs: string[];
}
