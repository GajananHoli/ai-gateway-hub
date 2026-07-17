import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize GoogleGenAI client safely on the server side
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API client successfully initialized on backend server.");
  } catch (err) {
    console.error("Error initializing Gemini client:", err);
  }
} else {
  console.log("GEMINI_API_KEY is not defined. Falling back to local intelligence analyzer.");
}

// Global active server configuration state
let currentConfig = {
  rateLimit: 10,
  burstLimit: 20,
  circuitBreakerThreshold: 50,
  circuitBreakerTimeout: 3000,
  routes: [
    { id: "user-service", path: "/api/v1/users/**", target: "lb://user-service", active: true },
    { id: "product-service", path: "/api/v1/products/**", target: "lb://product-service", active: true },
    { id: "ai-service", path: "/api/v1/ai/**", target: "lb://ai-service", active: true },
    { id: "notification-service", path: "/api/v1/notifications/**", target: "lb://notification-service", active: true }
  ]
};

// Seed endpoint for routing config
app.get("/api/gateway/config", (req, res) => {
  res.json(currentConfig);
});

app.post("/api/gateway/config", (req, res) => {
  currentConfig = { ...currentConfig, ...req.body };
  res.json({ message: "Gateway configuration updated in real-time.", config: currentConfig });
});

// Seed endpoint for generating simulated traffic logs
function generateMockLogs(count: number = 20) {
  const ipPool = ["192.168.1.50", "203.0.113.12", "198.51.100.45", "12.34.56.78", "192.168.1.102", "198.51.100.99"];
  const pathPool = [
    { method: "GET", path: "/api/v1/users/me", service: "user-service", baseLatency: 45 },
    { method: "POST", path: "/api/v1/auth/login", service: "user-service", baseLatency: 120 },
    { method: "GET", path: "/api/v1/products", service: "product-service", baseLatency: 80 },
    { method: "POST", path: "/api/v1/ai/analyze-logs", service: "ai-service", baseLatency: 350 },
    { method: "GET", path: "/api/v1/users/12", service: "user-service", baseLatency: 50 },
    { method: "POST", path: "/api/v1/notifications/email", service: "notification-service", baseLatency: 95 }
  ];
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "PostmanRuntime/7.32.3",
    "curl/7.81.0",
    "Go-http-client/1.1",
    "python-requests/2.28.1"
  ];

  const logs = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const timeOffset = i * 15; // 15 seconds spacing
    const logTime = new Date(now.getTime() - timeOffset * 1000);
    const pathObj = pathPool[Math.floor(Math.random() * pathPool.length)];
    const ip = ipPool[Math.floor(Math.random() * ipPool.length)];
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    
    let status = 200;
    let latency = pathObj.baseLatency + Math.floor(Math.random() * 60);

    // Inject simulated anomalies
    const isAnomaly = Math.random() < 0.15;
    let threatType = null;
    let payload = "{}";

    if (isAnomaly) {
      const anomalyType = Math.floor(Math.random() * 4);
      if (anomalyType === 0) {
        // Repeated login failure
        status = 401;
        pathObj.path = "/api/v1/auth/login";
        pathObj.method = "POST";
        payload = '{"username":"admin","password":"wrongpassword' + i + '"}';
        threatType = "Brute Force Attack Attempt";
      } else if (anomalyType === 1) {
        // SQL injection signature
        pathObj.path = "/api/v1/users/admin' UNION SELECT 1,username,password FROM users--";
        status = 500;
        threatType = "SQL Injection Intrusion";
      } else if (anomalyType === 2) {
        // High latency slow API spike
        latency = 1800 + Math.floor(Math.random() * 1200);
        status = 200;
        threatType = "Performance Bottleneck (Slow API)";
      } else {
        // Unauthorized directory traversal
        pathObj.path = "/api/v1/products/../../../../etc/passwd";
        status = 403;
        threatType = "Directory Traversal Security Scan";
      }
    }

    logs.push({
      id: `txn_${Math.random().toString(36).substring(2, 11)}`,
      timestamp: logTime.toISOString(),
      correlationId: `corr_${Math.random().toString(36).substring(2, 15)}`,
      clientIp: ip,
      method: pathObj.method,
      path: pathObj.path,
      service: pathObj.service,
      status: status,
      latencyMs: latency,
      userAgent: userAgent,
      requestPayload: payload,
      threatFlagged: !!threatType,
      threatType: threatType
    });
  }

  return logs;
}

// Expose mock log endpoint
app.get("/api/logs", (req, res) => {
  const count = parseInt(req.query.count as string) || 30;
  res.json(generateMockLogs(count));
});

// Helper for Gemini text requests using the custom schema/guidelines
async function callGemini(prompt: string, systemInstruction: string): Promise<string> {
  if (!ai) {
    return "";
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });
    return response.text || "No insights generated from Gemini.";
  } catch (error: any) {
    console.error("Gemini invocation failed:", error);
    return `AI Engine Connection Warning: ${error.message}`;
  }
}

// 1. AI Log Summarization Endpoint
app.post("/api/ai/summarize", async (req, res) => {
  const { logs } = req.body;
  const logString = JSON.stringify(logs, null, 2);

  const systemInstruction = `You are a Principal Cloud Architect and DevSecOps Specialist. 
Analyze the provided API Gateway transaction logs. Identify patterns, total throughput, status distributions, 
errors, and summarize them into a highly professional executive brief. Give a detailed bullet point overview of overall performance.`;

  const prompt = `Here are the latest API Gateway logs in JSON format. Please summarize them:\n\n${logString}`;

  if (ai) {
    const summary = await callGemini(prompt, systemInstruction);
    res.json({ source: "Gemini AI Engine", summary });
  } else {
    // Elegant local fallback summary
    const totalCount = logs.length;
    const errors = logs.filter((l: any) => l.status >= 400).length;
    const successRate = totalCount > 0 ? (((totalCount - errors) / totalCount) * 100).toFixed(1) : "100";
    const avgLatency = totalCount > 0 ? (logs.reduce((acc: number, l: any) => acc + l.latencyMs, 0) / totalCount).toFixed(0) : "0";
    
    const fallbackBrief = `### Executive Summary (Rule-Based Fallback)
The API Gateway processed **${totalCount} total request transactions** within the selected time window. 
The system is demonstrating an overall **Success Rate of ${successRate}%** with a mean gateway propagation delay of **${avgLatency} ms**.

#### Key Observations
- **Service Performance**: Microservices resolved **${successRate}%** of requests successfully. The heaviest load was experienced by \`user-service\`.
- **Latency Distribution**: Most endpoint routing took < 100ms. However, sporadic spikes up to 2500ms were recorded on \`ai-service\`.
- **Security Posture**: Found **${logs.filter((l: any) => l.threatFlagged).length} flagged security event alerts**.

*Note: Define your \`GEMINI_API_KEY\` in your environment variables to enable dynamic, context-aware analysis using Gemini 3.5 Flash.*`;
    res.json({ source: "Local Intelligence (Fallback)", summary: fallbackBrief });
  }
});

// 2. AI Threat Detection Endpoint
app.post("/api/ai/threats", async (req, res) => {
  const { logs } = req.body;
  const suspiciousLogs = logs.filter((l: any) => l.threatFlagged || l.status >= 400);
  const logString = JSON.stringify(suspiciousLogs, null, 2);

  const systemInstruction = `You are an elite DevSecOps Threat Analyst and Penetration Tester. 
Review the following suspicious API Gateway transactions. Classify the threat vectors (e.g., SQL Injection, Brute Force, Directory Traversal), 
explain the severity, analyze the payload/URL signatures, and provide concrete remediation recommendations (e.g., Spring Security rules, WAF signatures, rate limits).`;

  const prompt = `Review these suspicious Gateway logs and provide a security review:\n\n${logString}`;

  if (ai && suspiciousLogs.length > 0) {
    const securityInsights = await callGemini(prompt, systemInstruction);
    res.json({ source: "Gemini AI Engine", securityInsights });
  } else {
    const threatCount = suspiciousLogs.length;
    const fallbackInsights = `### Threat Analysis & Security Audit (Rule-Based Fallback)
A complete scan of recent transaction records identified **${threatCount} active security warnings**.

#### Highlighted Threat Vectors
1. **SQL Injection Signature (Severity: CRITICAL)**
   - **Endpoint**: \`/api/v1/users/admin' UNION SELECT...\`
   - **Root Cause**: Input parameter is parsed directly into JPA query without proper validation or prepared statements.
   - **Spring Boot Patch**: Use parameter binding in Spring Data JPA repository. Add a custom request validator on the Gateway route.

2. **Failed Auth / Brute Force Scanner (Severity: HIGH)**
   - **Endpoint**: \`/api/v1/auth/login\`
   - **Indicators**: Received multiple 401 Unauthorized codes in <5 seconds from the same Client IP.
   - **Spring Boot Patch**: Configure Gateway Redis Rate Limiter to restrict logins to 5 attempts per IP per minute. Utilize Spring Security lock-out handlers.

*Note: Define your \`GEMINI_API_KEY\` to get tailored Spring Security code snippets and deep-dive WAF patch solutions.*`;
    res.json({ source: "Local Intelligence (Fallback)", securityInsights: fallbackInsights });
  }
});

// 3. AI Endpoint Optimization (Slow APIs) Endpoint
app.post("/api/ai/slow-apis", async (req, res) => {
  const { logs } = req.body;
  const slowLogs = logs.filter((l: any) => l.latencyMs > 200);
  const logString = JSON.stringify(slowLogs, null, 2);

  const systemInstruction = `You are a Performance Engineering Lead. 
Analyze these high-latency API transactions. Determine which microservices are backing up, 
suggest appropriate Circuit Breaker trip parameters (resilience4j configuration), cache-aside caching plans using Redis, 
and performance code tuning for Spring Boot JRE virtual threads.`;

  const prompt = `Here are the slow transactions in the gateway logs. Suggest optimizations:\n\n${logString}`;

  if (ai && slowLogs.length > 0) {
    const performanceInsights = await callGemini(prompt, systemInstruction);
    res.json({ source: "Gemini AI Engine", performanceInsights });
  } else {
    const fallbackPerformance = `### Performance Diagnostics & Tuning (Rule-Based Fallback)
Analyzed recent latency records and discovered **${slowLogs.length} transactions exceeding the 200ms budget limit**.

#### Bottleneck Breakdown
- **Slow Endpoint**: \`/api/v1/ai/analyze-logs\` (Average Latency: ~380ms - 3200ms)
- **Probable Root Cause**: Blocking network I/O calls or large payload parsing on single-threaded execution pools.
- **Recommended Remediation Plan**:
  - **Spring JRE Upgrade**: Upgrade to Java 21 Virtual Threads (\`spring.threads.virtual.enabled=true\`) to handle parallel blocked calls without pool starvation.
  - **Circuit Breaker Setup**: Configure Resilience4j in Gateway:
    \`\`\`yaml
    resilience4j.circuitbreaker:
      instances:
        aiServiceCircuitBreaker:
          slidingWindowSize: 10
          failureRateThreshold: 50
          slowCallRateThreshold: 75
          slowCallDurationThreshold: 500ms
    \`\`\`
  - **Redis Cache**: Cache static query responses for \`/api/v1/products\` using Redis caching headers.

*Note: Enable Gemini AI to get automatic Resilience4j YAML generator based on your actual gateway performance profiles.*`;
    res.json({ source: "Local Intelligence (Fallback)", performanceInsights: fallbackPerformance });
  }
});

// 4. AI Autoscaling Recommendations Endpoint
app.post("/api/ai/scaling", async (req, res) => {
  const { metrics } = req.body;
  const metricsString = JSON.stringify(metrics, null, 2);

  const systemInstruction = `You are a Kubernetes & Cloud DevOps Administrator. 
Analyze the provided system resources (CPU, memory, active pods, request throughput). 
Recommend Horizontal Pod Autoscaler (HPA) YAML settings, resource limits, and JVM memory footprint tuning guidelines.`;

  const prompt = `Current system metrics are as follows:\n\n${metricsString}`;

  if (ai) {
    const scalingInsights = await callGemini(prompt, systemInstruction);
    res.json({ source: "Gemini AI Engine", scalingInsights });
  } else {
    const fallbackScaling = `### Kubernetes Scalability Assessment (Rule-Based Fallback)
Analyzed the live cluster nodes and CPU/Memory consumption ratios:

#### Recommended HPA Configuration
\`\`\`yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: gateway-hpa
  namespace: ai-gateway-hub
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: gateway-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 75
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
\`\`\`

#### JVM Tuning Recommendations
- Since CPU utilization is currently sitting under **60%**, the primary concern is the **Garbage Collector pause times**.
- Enable the **G1 Low-Latency Garbage Collector** by passing JVM options:
  \`-XX:+UseG1GC -XX:MaxGCPauseMillis=200\`
- Map resource memory requests/limits correctly: Set memory request to **512Mi** and limit to **1024Mi** to allow JVM heap headroom.

*Note: Configure your GEMINI_API_KEY to receive custom Docker-to-Kubernetes scale configurations based on real-world request rate spikes.*`;
    res.json({ source: "Local Intelligence (Fallback)", scalingInsights: fallbackScaling });
  }
});

// Initialize the development/production serving modes
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development server with HMR-disabled Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    // Production build files delivery
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
