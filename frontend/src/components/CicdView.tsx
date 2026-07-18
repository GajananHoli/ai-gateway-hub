import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Play, 
  Terminal, 
  Award, 
  CheckCircle2, 
  Activity, 
  AlertTriangle,
  Flame,
  FileCode,
  Shield,
  RefreshCw
} from 'lucide-react';
import { PipelineStep } from '../types';
import { devOpsData } from '../data/microservicesData';

interface CicdProps {
  onPipelineComplete: (coverage: string, sonarStatus: string, dockerTag: string) => void;
}

export default function CicdView({ onPipelineComplete }: CicdProps) {
  const [pipelineActive, setPipelineActive] = useState(false);
  const [activeStepIdx, setActiveStepIdx] = useState<number>(-1);
  const [steps, setSteps] = useState<PipelineStep[]>([]);
  const [selectedLogStep, setSelectedLogStep] = useState<number>(0);
  const [commitMessage, setCommitMessage] = useState('feat(gateway): integrate Redis-based rate limiting & JWT verification');
  const [badgeStatus, setBadgeStatus] = useState({
    build: 'passing',
    coverage: '87.5%',
    sonar: 'passed',
    imageTag: '1.4.0'
  });

  const staticSteps: PipelineStep[] = [
    {
      name: 'Checkout Code',
      status: 'idle',
      durationSec: 2,
      logs: [
        "Syncing repository 'ai-gateway-hub'...",
        "Cloning into '/home/runner/work/ai-gateway-hub'...",
        "git checkout --force refs/heads/main",
        "HEAD is now at f859a12 feat(gateway): integrate Redis rate limiting",
        "Successfully verified git workspace checksum."
      ]
    },
    {
      name: 'Set up JDK 21',
      status: 'idle',
      durationSec: 3,
      logs: [
        "Downloading eclipse-temurin JDK 21 distribution...",
        "Configuring environment variables: JAVA_HOME=/opt/hostedtoolcache/jdk21",
        "Adding Java bin path to PATH...",
        "Java version checked: openjdk 21.0.2 2024-01-16 LTS",
        "Eclipse Temurin JRE initialized successfully."
      ]
    },
    {
      name: 'Compile and Test with Maven',
      status: 'idle',
      durationSec: 8,
      logs: [
        "[INFO] Scanning for projects...",
        "[INFO] Reactor Build Order: gateway-service, user-service, product-service",
        "[INFO] ------------------------------------------------------------------------",
        "[INFO] Building gateway-service 1.4.0",
        "[INFO] ------------------------------------------------------------------------",
        "[INFO] --- maven-compiler-plugin:3.11.0:compile (default-compile) ---",
        "[INFO] Compiling 24 source files to /target/classes",
        "[INFO] --- maven-surefire-plugin:3.2.5:test (default-test) ---",
        "[INFO] Running com.aigateway.GatewayApplicationTests",
        "Tests run: 12, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 4.12s",
        "[INFO] Tests completed successfully. Quality Gates validated."
      ]
    },
    {
      name: 'Upload JaCoCo Coverage',
      status: 'idle',
      durationSec: 4,
      logs: [
        "[INFO] --- jacoco-maven-plugin:0.8.11:report (post-test) ---",
        "[INFO] Loading execution data file target/jacoco.exec",
        "[INFO] Analyzed 24 classes with coverage of 87.5% instructions covered.",
        "Uploading JaCoCo XML report to artifact manager...",
        "Artifact successfully exported: jacoco-report-html.zip",
        "Coverage metrics registered in CI platform."
      ]
    },
    {
      name: 'SonarCloud Scan',
      status: 'idle',
      durationSec: 6,
      logs: [
        "[INFO] --- sonar-maven-plugin:3.10.0:sonar (default-cli) ---",
        "[INFO] User cache: /home/runner/.sonar/cache",
        "[INFO] Load project settings for key 'ai-gateway-hub'...",
        "[INFO] Quality Gate Status: PASSED",
        "[INFO] Code Coverage: 87.5% (Target: 80.0%)",
        "[INFO] Technical Debt: 0 minutes (Grade: A)",
        "[INFO] Security Vulnerabilities: 0 (Bugs: 0, Code Smells: 4)",
        "Analysis completed. Report URL: https://sonarcloud.io/dashboard?id=ai-gateway-hub"
      ]
    },
    {
      name: 'Trivy Container Scan',
      status: 'idle',
      durationSec: 5,
      logs: [
        "Initializing Trivy vulnerability scanning engine...",
        "Updating Trivy DB credentials...",
        "Scanning image 'docker.io/aigatewayhub/gateway-service:latest'...",
        "========================================================================",
        "Vulnerability Scan Results (Severe Filters Only)",
        "========================================================================",
        "CRITICAL: 0",
        "HIGH: 0",
        "MEDIUM: 3 (ignored, unfixed: true)",
        "LOW: 12 (ignored)",
        "========================================================================",
        "Scan Complete. 0 Critical or High Vulnerabilities flagged."
      ]
    },
    {
      name: 'Docker Hub Registry Push',
      status: 'idle',
      durationSec: 7,
      logs: [
        "Building multi-stage container target...",
        "Step 1/8 FROM eclipse-temurin:21-jre-alpine",
        "Step 5/8 COPY target/*.jar gateway-service.jar",
        "Pushed image layers successfully to Docker Hub.",
        "Created image tags: ",
        "  - docker.io/aigatewayhub/gateway-service:latest",
        "  - docker.io/aigatewayhub/gateway-service:1.4.0",
        "Workflow run completed successfully. Service deployed to staging k8s cluster."
      ]
    }
  ];

  useEffect(() => {
    setSteps(staticSteps.map(s => ({ ...s, status: 'idle' })));
  }, []);

  const handleRunPipeline = () => {
    if (pipelineActive) return;
    setPipelineActive(true);
    setActiveStepIdx(0);
    setSelectedLogStep(0);

    // Reset step statuses
    setSteps(prev => prev.map(s => ({ ...s, status: 'idle' })));
  };

  useEffect(() => {
    if (activeStepIdx < 0 || activeStepIdx >= steps.length) {
      if (activeStepIdx === steps.length) {
        setPipelineActive(false);
        setActiveStepIdx(-1);
        // Randomly bump minor tag or coverage for fun
        const nextTag = `1.4.${Math.floor(Math.random() * 9) + 1}`;
        setBadgeStatus(prev => ({ ...prev, imageTag: nextTag }));
        onPipelineComplete('87.5%', 'Passed', nextTag);
      }
      return;
    }

    // Mark current step as running
    setSteps(prev => prev.map((s, idx) => 
      idx === activeStepIdx ? { ...s, status: 'running' } : s
    ));
    setSelectedLogStep(activeStepIdx);

    const step = steps[activeStepIdx];
    const timer = setTimeout(() => {
      setSteps(prev => prev.map((s, idx) => 
        idx === activeStepIdx ? { ...s, status: 'success' } : s
      ));
      setActiveStepIdx(prev => prev + 1);
    }, step.durationSec * 250); // Speed up the seconds factor slightly for snappy UI

    return () => clearTimeout(timer);
  }, [activeStepIdx, pipelineActive]);

  return (
    <div className="space-y-6 font-sans">
      {/* Intro CI/CD panel */}
      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-emerald-400" />
            GitHub Actions Enterprise CI/CD Runner
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Build, compile, test, measure code coverage, analyze with SonarCloud, scan containers using Trivy, and release packages in real-time.
          </p>
        </div>

        <button
          onClick={handleRunPipeline}
          disabled={pipelineActive}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-400 disabled:opacity-50 hover:from-emerald-400 hover:to-emerald-300 text-zinc-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/10 shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{pipelineActive ? 'Pipeline Running...' : 'Trigger Pipeline Run'}</span>
        </button>
      </div>

      {/* Badges Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-800 flex items-center justify-between font-mono text-xs">
          <span className="text-zinc-500">CI_BUILD_STATUS</span>
          <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded">
            passing
          </span>
        </div>

        <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-800 flex items-center justify-between font-mono text-xs">
          <span className="text-zinc-500">JACOCO_COVERAGE</span>
          <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold rounded">
            {badgeStatus.coverage}
          </span>
        </div>

        <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-800 flex items-center justify-between font-mono text-xs">
          <span className="text-zinc-500">SONAR_QUALITY_GATE</span>
          <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded">
            {badgeStatus.sonar.toUpperCase()}
          </span>
        </div>

        <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-800 flex items-center justify-between font-mono text-xs">
          <span className="text-zinc-500">RELEASED_IMAGE_TAG</span>
          <span className="px-2.5 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold rounded">
            v{badgeStatus.imageTag}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left column: Pipeline steps tracker (Col 5) */}
        <div className="lg:col-span-5 bg-zinc-950 rounded-xl border border-zinc-800 p-5 space-y-4">
          <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
            <h3 className="text-xs font-semibold text-zinc-300 font-mono tracking-wider uppercase">
              Pipeline Step Flow
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono">workflow: ci-cd.yml</span>
          </div>

          <div className="space-y-3">
            {steps.map((step, idx) => (
              <button
                key={step.name}
                onClick={() => setSelectedLogStep(idx)}
                className={`w-full text-left p-3 rounded-lg border flex items-center justify-between transition ${
                  selectedLogStep === idx 
                    ? 'bg-zinc-900 border-zinc-700/80' 
                    : 'bg-zinc-900/20 border-zinc-800/40 hover:border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    step.status === 'success' ? 'bg-emerald-500' :
                    step.status === 'running' ? 'bg-indigo-500 animate-pulse' :
                    step.status === 'failed' ? 'bg-red-500' : 'bg-zinc-800'
                  }`} />
                  <span className="text-xs font-semibold text-zinc-200">{step.name}</span>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                  <span>{step.durationSec}s</span>
                  {step.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right column: Interactive Console log (Col 7) */}
        <div className="lg:col-span-7 bg-zinc-950 rounded-xl border border-zinc-800 p-5 flex flex-col h-[520px]">
          <div className="p-3 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between rounded-t-lg">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-zinc-300">
                RUNNER CONSOLE: {steps[selectedLogStep]?.name || 'Logs View'}
              </span>
            </div>
            <span className="text-[9px] font-mono text-zinc-500 uppercase">Step {selectedLogStep + 1} of {steps.length}</span>
          </div>

          <div className="flex-1 bg-zinc-950 p-4 font-mono text-[11px] text-zinc-300 overflow-y-auto space-y-1.5 rounded-b-lg border border-zinc-800">
            {steps[selectedLogStep]?.status === 'idle' ? (
              <div className="h-full flex items-center justify-center text-zinc-650 text-center">
                This pipeline step is currently idle. Trigger the run to initialize.
              </div>
            ) : (
              <>
                {(steps[selectedLogStep]?.logs || []).map((log, lIdx) => (
                  <div key={lIdx} className="leading-relaxed whitespace-pre-wrap">{log}</div>
                ))}
                {steps[selectedLogStep]?.status === 'running' && (
                  <div className="text-indigo-400 animate-pulse mt-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 border border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    <span>Executing task block...</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* GitHub Workflow Code block */}
      <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-5 space-y-3">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
          <h4 className="text-xs font-semibold text-zinc-300 font-mono tracking-wider uppercase">
            GitHub Actions Configuration Code (.github/workflows/ci-cd.yml)
          </h4>
          <span className="px-2 py-0.5 bg-zinc-850 border border-zinc-800 text-[9px] font-mono text-zinc-450 rounded">
            yaml
          </span>
        </div>

        <div className="bg-zinc-900 p-4 rounded font-mono text-[11px] text-zinc-450 overflow-y-auto max-h-[300px] leading-relaxed">
          <pre className="whitespace-pre">
            {devOpsData.cicd[0].content}
          </pre>
        </div>
      </div>
    </div>
  );
}
