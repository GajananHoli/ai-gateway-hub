import React, { useState } from 'react';
import { 
  Settings, 
  Terminal, 
  Database, 
  FileCode, 
  Download, 
  Info, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';

interface SettingsProps {
  env: 'dev' | 'staging' | 'prod';
  setEnv: (env: 'dev' | 'staging' | 'prod') => void;
  apiHealth: string;
}

export default function SettingsView({ env, setEnv, apiHealth }: SettingsProps) {
  const [selectedSpec, setSelectedSpec] = useState<'gateway' | 'users' | 'products' | 'ai'>('gateway');

  const actuatorMock = {
    status: apiHealth.toUpperCase() === 'HEALTHY' ? 'UP' : 'DOWN',
    components: {
      circuitBreakers: {
        status: "UP",
        details: {
          productCircuitBreaker: {
            state: "CLOSED",
            failureRate: "0.0%",
            slowCallRate: "0.0%"
          }
        }
      },
      db: {
        status: "UP",
        details: {
          database: "MySQL 8.0.35",
          validationQuery: "isValid()"
        }
      },
      discoveryComposite: {
        status: "UP",
        details: {
          eureka: {
            status: "UP",
            applications: {
              "USER-SERVICE": 1,
              "PRODUCT-SERVICE": 1,
              "AI-SERVICE": 1,
              "NOTIFICATION-SERVICE": 1
            }
          }
        }
      },
      diskSpace: {
        status: "UP",
        details: {
          total: 104857600000,
          free: 85321520120,
          threshold: 10485760
        }
      },
      redis: {
        status: "UP",
        details: {
          version: "7.0.12"
        }
      }
    },
    groups: ["liveness", "readiness"]
  };

  const openApiSpecs = {
    gateway: {
      title: "gateway-service OpenAPI Spec",
      version: "1.4.0",
      description: "Spring Cloud Gateway routing with downstream token translation.",
      endpoints: [
        { method: "POST", path: "/api/v1/auth/login", desc: "User Authentication / Login" },
        { method: "POST", path: "/api/v1/users/register", desc: "Register a new user account" },
        { method: "GET", path: "/api/v1/users/me", desc: "Fetch profile of logged-in operator" },
        { method: "GET", path: "/api/v1/products", desc: "Retrieve licensing & catalog lists" },
        { method: "POST", path: "/api/v1/ai/analyze-logs", desc: "Proxy analytics block to AI-Service" }
      ]
    },
    users: {
      title: "user-service OpenAPI Spec",
      version: "1.0.0",
      description: "Manage system operators, login audits, and role bindings.",
      endpoints: [
        { method: "POST", path: "/users/register", desc: "Insert and encrypt new user record" },
        { method: "GET", path: "/users/{id}", desc: "Query user record by primary key id" },
        { method: "PUT", path: "/users/{id}/roles", desc: "Modify operator permissions and scopes" }
      ]
    },
    products: {
      title: "product-service OpenAPI Spec",
      version: "1.2.0",
      description: "Configure product lists and gateway licenses.",
      endpoints: [
        { method: "GET", path: "/products", desc: "Retrieve global catalog metadata list" },
        { method: "POST", path: "/products", desc: "Create new product item catalog details" }
      ]
    },
    ai: {
      title: "ai-service OpenAPI Spec",
      version: "2.1.0",
      description: "Dynamic logs review & LLM recommendation proxy.",
      endpoints: [
        { method: "POST", path: "/ai/analyze-logs", desc: "Analyze gateway stdout payloads" },
        { method: "POST", path: "/ai/scaling-hpa", desc: "Analyze telemetry logs and recommend scaling metrics" }
      ]
    }
  };

  return (
    <div className="space-y-6 font-sans text-zinc-300">
      
      {/* Intro Settings banner */}
      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          Enterprise System Settings & API Specifications
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Inspect Spring Boot Actuator endpoints, explore Swagger OpenAPI API contracts, configure pipeline triggers, and consult deployment runbooks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Spring Boot Actuator JSON (Col 5) */}
        <div className="lg:col-span-5 bg-zinc-950 rounded-xl border border-zinc-800 p-5 flex flex-col h-[520px]">
          <div className="border-b border-zinc-800 pb-3 mb-4 shrink-0 flex justify-between items-center">
            <h3 className="text-xs font-semibold text-zinc-300 font-mono tracking-wider uppercase flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Spring Actuator Endpoint (/actuator/health)
            </h3>
            <span className="px-2 py-0.5 bg-zinc-850 border border-zinc-800 text-[9px] font-mono text-zinc-450 rounded">
              HTTP GET
            </span>
          </div>

          <p className="text-xs text-zinc-400 mb-3 shrink-0">
            Real-time status of downstream databases, Redis caching pools, discovery services, and disk parameters.
          </p>

          <div className="flex-1 bg-zinc-900/50 p-4 rounded-lg font-mono text-[10px] text-emerald-400 overflow-y-auto border border-zinc-800 leading-relaxed">
            <pre>{JSON.stringify(actuatorMock, null, 2)}</pre>
          </div>
        </div>

        {/* Swagger OpenAPI contract explorer (Col 7) */}
        <div className="lg:col-span-7 bg-zinc-950 rounded-xl border border-zinc-800 p-5 flex flex-col h-[520px] justify-between">
          <div>
            <div className="border-b border-zinc-800 pb-3 mb-4 flex justify-between items-center">
              <h3 className="text-xs font-semibold text-zinc-300 font-mono tracking-wider uppercase flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-emerald-400" />
                Swagger OpenAPI Contract Visualizer
              </h3>
            </div>

            {/* Spec toggles */}
            <div className="grid grid-cols-4 gap-1.5 bg-zinc-900/40 p-1 rounded border border-zinc-800 mb-4">
              {(['gateway', 'users', 'products', 'ai'] as const).map(spec => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpec(spec)}
                  className={`py-1 rounded text-[9px] font-mono font-semibold transition ${
                    selectedSpec === spec 
                      ? 'bg-zinc-800 text-zinc-100' 
                      : 'text-zinc-550 hover:text-zinc-300'
                  }`}
                >
                  {spec.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Spec detail */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold font-mono text-zinc-200 uppercase">
                  {openApiSpecs[selectedSpec].title} (v{openApiSpecs[selectedSpec].version})
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {openApiSpecs[selectedSpec].description}
                </p>
              </div>

              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {openApiSpecs[selectedSpec].endpoints.map(ep => (
                  <div 
                    key={ep.path}
                    className="p-2.5 rounded bg-zinc-900/30 border border-zinc-850 flex items-center justify-between text-[11px] font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                        ep.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
                      }`}>
                        {ep.method}
                      </span>
                      <span className="text-zinc-300 font-semibold">{ep.path}</span>
                    </div>

                    <span className="text-zinc-550 text-[10px] text-right">{ep.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end shrink-0">
            <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              All Endpoints Secured under Spring Security 6.0 OAuth2 spec
            </span>
          </div>
        </div>
      </div>

      {/* Deployment & Download guides */}
      <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-5 space-y-4">
        <h3 className="text-xs font-semibold text-zinc-300 font-mono tracking-wider uppercase border-b border-zinc-800 pb-2">
          Enterprise Cloud Deployment Guides
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-zinc-200 font-mono block">AWS EC2 & Kubernetes</span>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Provision an EKS (Elastic Kubernetes Service) cluster on AWS EC2 nodes, install the Ingress Nginx controller, and deploy Helm values.
            </p>
            <button className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 hover:text-emerald-300 font-bold">
              <span>EKS Runbook.md</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-zinc-200 font-mono block">DevSecOps & SonarCloud</span>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Bind secrets `SONAR_TOKEN` and `DOCKER_PASSWORD` inside GitHub repository variables, setting up JaCoCo reports path filters.
            </p>
            <button className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 hover:text-emerald-300 font-bold">
              <span>SonarSetup.md</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-zinc-200 font-mono block">Full Project Package export</span>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Export the entire clean monorepo code containing both the React 19 Frontend assets and Java Spring Boot services as a compressed zip package.
            </p>
            <button className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-3 py-1.5 rounded text-[10px] font-bold font-mono transition shadow-lg shadow-emerald-500/10">
              <Download className="w-3 h-3" />
              <span>Export Source ZIP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
