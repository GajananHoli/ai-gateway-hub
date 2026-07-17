// Enterprise microservices templates and file content metadata
export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  content?: string;
  language?: string;
  children?: FileNode[];
}

export const microservicesData: Record<string, FileNode> = {
  'gateway-service': {
    name: 'gateway-service',
    type: 'directory',
    path: 'gateway-service',
    children: [
      {
        name: 'src',
        type: 'directory',
        path: 'gateway-service/src',
        children: [
          {
            name: 'main',
            type: 'directory',
            path: 'gateway-service/src/main',
            children: [
              {
                name: 'java',
                type: 'directory',
                path: 'gateway-service/src/main/java',
                children: [
                  {
                    name: 'com',
                    type: 'directory',
                    path: 'gateway-service/src/main/java/com',
                    children: [
                      {
                        name: 'aigateway',
                        type: 'directory',
                        path: 'gateway-service/src/main/java/com/aigateway',
                        children: [
                          {
                            name: 'GatewayApplication.java',
                            type: 'file',
                            path: 'gateway-service/src/main/java/com/aigateway/GatewayApplication.java',
                            language: 'java',
                            content: `package com.aigateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class GatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}`
                          },
                          {
                            name: 'config',
                            type: 'directory',
                            path: 'gateway-service/src/main/java/com/aigateway/config',
                            children: [
                              {
                                name: 'GatewayRoutesConfig.java',
                                type: 'file',
                                path: 'gateway-service/src/main/java/com/aigateway/config/GatewayRoutesConfig.java',
                                language: 'java',
                                content: `package com.aigateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRoutesConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder, JwtValidationFilter jwtFilter) {
        return builder.routes()
            .route("user-service-route", r -> r.path("/api/v1/users/**", "/api/v1/auth/**")
                .filters(f -> f.filter(jwtFilter)
                    .requestRateLimiter(config -> config.setRateLimiter(redisRateLimiter()))
                    .retry(config -> config.setRetries(3).setStatuses(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR))
                )
                .uri("lb://user-service"))
            .route("product-service-route", r -> r.path("/api/v1/products/**")
                .filters(f -> f.filter(jwtFilter)
                    .circuitBreaker(config -> config.setName("productCircuitBreaker").setFallbackUri("forward:/fallback/products"))
                )
                .uri("lb://product-service"))
            .route("ai-service-route", r -> r.path("/api/v1/ai/**")
                .filters(f -> f.filter(jwtFilter))
                .uri("lb://ai-service"))
            .build();
    }

    @Bean
    public org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter redisRateLimiter() {
        return new org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter(10, 20);
    }
}`
                              },
                              {
                                name: 'JwtValidationFilter.java',
                                type: 'file',
                                path: 'gateway-service/src/main/java/com/aigateway/config/JwtValidationFilter.java',
                                language: 'java',
                                content: `package com.aigateway.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.UUID;

@Component
public class JwtValidationFilter implements GatewayFilter {

    @Value("\${jwt.secret}")
    private String jwtSecret;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        // Generate correlation ID
        String correlationId = UUID.randomUUID().toString();
        request = request.mutate()
            .header("X-Correlation-ID", correlationId)
            .build();
        exchange = exchange.mutate().request(request).build();

        if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
            return onError(exchange, "No Authorization Header", HttpStatus.UNAUTHORIZED);
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return onError(exchange, "Invalid Authorization Header", HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);
        try {
            Claims claims = validateToken(token);
            // Propagate user claims downstream as custom headers
            request = request.mutate()
                .header("X-User-Id", claims.getSubject())
                .header("X-User-Roles", String.valueOf(claims.get("roles")))
                .build();
            return chain.filter(exchange.mutate().request(request).build());
        } catch (Exception e) {
            return onError(exchange, "JWT Token Validation Failed: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }

    private Claims validateToken(String token) {
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        return Jwts.parserBuilder()
            .setSigningKey(key)
            .build()
            .parseClaimsJws(token)
            .getBody();
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().add("Content-Type", "application/json");
        String body = String.format("{\\"error\\": \\"%s\\", \\"status\\": %d}", err, status.value());
        return response.writeWith(Mono.just(response.bufferFactory().wrap(body.getBytes())));
    }
}`
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                name: 'resources',
                type: 'directory',
                path: 'gateway-service/src/main/resources',
                children: [
                  {
                    name: 'application.yml',
                    type: 'file',
                    path: 'gateway-service/src/main/resources/application.yml',
                    language: 'yaml',
                    content: `server:
  port: 8080

spring:
  application:
    name: gateway-service
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true
          lower-case-service-id: true
  redis:
    host: localhost
    port: 6379

jwt:
  secret: "9A4f98624K3282b827a3c333f23a49f53e6b306a287332c93d937a6b2c2859c2"

management:
  endpoints:
    web:
      exposure:
        include: "health,metrics,prometheus"
  endpoint:
    health:
      show-details: always
  metrics:
    tags:
      application: \${spring.application.name}`
                  }
                ]
              }
            ]
          },
          {
            name: 'Dockerfile',
            type: 'file',
            path: 'gateway-service/Dockerfile',
            language: 'dockerfile',
            content: `FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
WORKDIR /app
COPY --from=builder /app/target/*.jar gateway-service.jar
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \\
  CMD wget --quiet --tries=1 --spider http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "gateway-service.jar"]`
          }
        ]
      }
    ]
  },
  'user-service': {
    name: 'user-service',
    type: 'directory',
    path: 'user-service',
    children: [
      {
        name: 'src',
        type: 'directory',
        path: 'user-service/src',
        children: [
          {
            name: 'main',
            type: 'directory',
            path: 'user-service/src/main',
            children: [
              {
                name: 'java',
                type: 'directory',
                path: 'user-service/src/main/java',
                children: [
                  {
                    name: 'com',
                    type: 'directory',
                    path: 'user-service/src/main/java/com',
                    children: [
                      {
                        name: 'userservice',
                        type: 'directory',
                        path: 'user-service/src/main/java/com/userservice',
                        children: [
                          {
                            name: 'controller',
                            type: 'directory',
                            path: 'user-service/src/main/java/com/userservice/controller',
                            children: [
                              {
                                name: 'UserController.java',
                                type: 'file',
                                path: 'user-service/src/main/java/com/userservice/controller/UserController.java',
                                language: 'java',
                                content: `package com.userservice.controller;

import com.userservice.dto.UserDto;
import com.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserDto> registerUser(@Valid @RequestBody UserDto userDto) {
        return new ResponseEntity<>(userService.register(userDto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(userService.findById(Long.parseLong(userId)));
    }
}`
                              }
                            ]
                          },
                          {
                            name: 'service',
                            type: 'directory',
                            path: 'user-service/src/main/java/com/userservice/service',
                            children: [
                              {
                                name: 'UserService.java',
                                type: 'file',
                                path: 'user-service/src/main/java/com/userservice/service/UserService.java',
                                language: 'java',
                                content: `package com.userservice.service;

import com.userservice.dto.UserDto;

public interface UserService {
    UserDto register(UserDto userDto);
    UserDto findById(Long id);
    UserDto findByEmail(String email);
}`
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  'product-service': {
    name: 'product-service',
    type: 'directory',
    path: 'product-service',
    children: [
      {
        name: 'src',
        type: 'directory',
        path: 'product-service/src',
        children: [
          {
            name: 'main',
            type: 'directory',
            path: 'product-service/src/main',
            children: [
              {
                name: 'java',
                type: 'directory',
                path: 'product-service/src/main/java',
                children: [
                  {
                    name: 'com',
                    type: 'directory',
                    path: 'product-service/src/main/java/com',
                    children: [
                      {
                        name: 'productservice',
                        type: 'directory',
                        path: 'product-service/src/main/java/com/productservice',
                        children: [
                          {
                            name: 'controller',
                            type: 'directory',
                            path: 'product-service/src/main/java/com/productservice/controller',
                            children: [
                              {
                                name: 'ProductController.java',
                                type: 'file',
                                path: 'product-service/src/main/java/com/productservice/controller/ProductController.java',
                                language: 'java',
                                content: `package com.productservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    @GetMapping
    public ResponseEntity<List<String>> getProducts() {
        return ResponseEntity.ok(List.of("Enterprise API Gateway License", "Log Shipper Agent Pro", "Observability Collector"));
    }
}`
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  'ai-service': {
    name: 'ai-service',
    type: 'directory',
    path: 'ai-service',
    children: [
      {
        name: 'src',
        type: 'directory',
        path: 'ai-service/src',
        children: [
          {
            name: 'main',
            type: 'directory',
            path: 'ai-service/src/main',
            children: [
              {
                name: 'java',
                type: 'directory',
                path: 'ai-service/src/main/java',
                children: [
                  {
                    name: 'com',
                    type: 'directory',
                    path: 'ai-service/src/main/java/com',
                    children: [
                      {
                        name: 'aiservice',
                        type: 'directory',
                        path: 'ai-service/src/main/java/com/aiservice',
                        children: [
                          {
                            name: 'controller',
                            type: 'directory',
                            path: 'ai-service/src/main/java/com/aiservice/controller',
                            children: [
                              {
                                name: 'AiInsightsController.java',
                                type: 'file',
                                path: 'ai-service/src/main/java/com/aiservice/controller/AiInsightsController.java',
                                language: 'java',
                                content: `package com.aiservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
public class AiInsightsController {

    @PostMapping("/analyze-logs")
    public ResponseEntity<Map<String, Object>> analyzeTraffic(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(Map.of(
            "summary", "Analyzed " + payload.getOrDefault("logCount", 0) + " log lines. Found 0 severe errors.",
            "suspiciousActivityDetected", false,
            "scalingRecommendation", "Current cluster is sized correctly at 3 replicas."
        ));
    }
}`
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  'notification-service': {
    name: 'notification-service',
    type: 'directory',
    path: 'notification-service',
    children: [
      {
        name: 'src',
        type: 'directory',
        path: 'notification-service/src',
        children: [
          {
            name: 'main',
            type: 'directory',
            path: 'notification-service/src/main',
            children: [
              {
                name: 'java',
                type: 'directory',
                path: 'notification-service/src/main/java',
                children: [
                  {
                    name: 'com',
                    type: 'directory',
                    path: 'notification-service/src/main/java/com',
                    children: [
                      {
                        name: 'notificationservice',
                        type: 'directory',
                        path: 'notification-service/src/main/java/com/notificationservice',
                        children: [
                          {
                            name: 'listener',
                            type: 'directory',
                            path: 'notification-service/src/main/java/com/notificationservice/listener',
                            children: [
                              {
                                name: 'KafkaNotificationListener.java',
                                type: 'file',
                                path: 'notification-service/src/main/java/com/notificationservice/listener/KafkaNotificationListener.java',
                                language: 'java',
                                content: `package com.notificationservice.listener;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class KafkaNotificationListener {

    @KafkaListener(topics = "security-alerts", groupId = "notification-group")
    public void listenSecurityAlerts(String message) {
        System.out.println("ALERT received via Kafka: " + message);
        // Trigger notification logic (Email, SMS, Slack webhook)
    }
}`
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
};

export const devOpsData = {
  docker: [
    {
      name: 'docker-compose.yml',
      language: 'yaml',
      content: `version: '3.8'

services:
  eureka-server:
    image: eclipse-temurin:21-jre-alpine
    container_name: eureka-server
    ports:
      - "8761:8761"
    environment:
      - SPRING_PROFILES_ACTIVE=dev

  redis:
    image: redis:7-alpine
    container_name: gateway-redis
    ports:
      - "6379:6379"

  kafka:
    image: confluentinc/cp-kafka:7.4.0
    container_name: gateway-kafka
    ports:
      - "9092:9092"
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT'
      KAFKA_ADVERTISED_LISTENERS: 'PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092'
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

  gateway-service:
    build:
      context: ./gateway-service
      dockerfile: Dockerfile
    container_name: gateway-service
    ports:
      - "8080:8080"
    depends_on:
      - redis
    environment:
      - SPRING_REDIS_HOST=redis
      - JWT_SECRET=9A4f98624K3282b827a3c333f23a49f53e6b306a287332c93d937a6b2c2859c2

  user-service:
    build:
      context: ./user-service
      dockerfile: Dockerfile
    container_name: user-service
    ports:
      - "8081:8081"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/users_db

  mysql:
    image: mysql:8
    container_name: gateway-mysql
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: users_db`
    },
    {
      name: 'gateway-service/Dockerfile',
      language: 'dockerfile',
      content: `FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
WORKDIR /app
COPY --from=builder /app/target/*.jar gateway-service.jar
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \\
  CMD wget --quiet --tries=1 --spider http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "gateway-service.jar"]`
    }
  ],
  kubernetes: [
    {
      name: 'k8s/gateway-deployment.yaml',
      language: 'yaml',
      content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: gateway-service
  namespace: ai-gateway-hub
  labels:
    app: gateway-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: gateway-service
  template:
    metadata:
      labels:
        app: gateway-service
    spec:
      containers:
      - name: gateway-service
        image: docker.io/aigatewayhub/gateway-service:1.4.0
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1024Mi"
            cpu: "500m"
        readinessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 15
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 20
          periodSeconds: 15
        env:
        - name: SPRING_REDIS_HOST
          valueFrom:
            configMapKeyRef:
              name: gateway-config
              key: redis-host
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: gateway-secrets
              key: jwt-secret`
    },
    {
      name: 'k8s/gateway-service.yaml',
      language: 'yaml',
      content: `apiVersion: v1
kind: Service
metadata:
  name: gateway-service
  namespace: ai-gateway-hub
spec:
  selector:
    app: gateway-service
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: ClusterIP`
    },
    {
      name: 'k8s/gateway-ingress.yaml',
      language: 'yaml',
      content: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ai-gateway-ingress
  namespace: ai-gateway-hub
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - gateway.enterprise.io
    secretName: gateway-tls-certs
  rules:
  - host: gateway.enterprise.io
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: gateway-service
            port:
              number: 80`
    },
    {
      name: 'k8s/gateway-hpa.yaml',
      language: 'yaml',
      content: `apiVersion: autoscaling/v2
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
        averageUtilization: 80`
    },
    {
      name: 'helm/values.yaml',
      language: 'yaml',
      content: `# Helm values for enterprise production cluster
replicaCount: 3

image:
  repository: docker.io/aigatewayhub/gateway-service
  pullPolicy: IfNotPresent
  tag: "1.4.0"

service:
  type: ClusterIP
  port: 80

resources:
  limits:
    cpu: 500m
    memory: 1024Mi
  requests:
    cpu: 250m
    memory: 512Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 75

ingress:
  enabled: true
  className: "nginx"
  hosts:
    - host: gateway.enterprise.io
      paths:
        - path: /
          pathType: Prefix`
    }
  ],
  cicd: [
    {
      name: '.github/workflows/ci-cd.yml',
      language: 'yaml',
      content: `name: CI/CD Pipeline

on:
  push:
    branches: [ main, release/* ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout Code
      uses: actions/checkout@v4

    - name: Set up JDK 21
      uses: actions/setup-java@v4
      with:
        java-version: '21'
        distribution: 'temurin'
        cache: 'maven'

    - name: Compile and Test with Maven
      run: mvn clean verify -Pcoverage

    - name: Upload JaCoCo Coverage Report
      uses: actions/upload-artifact@v4
      with:
        name: jacoco-report
        path: "**/target/site/jacoco/jacoco.xml"

  sonarcloud:
    needs: build-and-test
    runs-on: ubuntu-latest
    steps:
    - name: Checkout Code
      uses: actions/checkout@v4
    - name: SonarCloud Scan
      run: mvn sonar:sonar -Dsonar.projectKey=ai-gateway-hub -Dsonar.organization=enterprise -Dsonar.host.url=https://sonarcloud.io
      env:
        SONAR_TOKEN: \${{ secrets.SONAR_TOKEN }}
        GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}

  security-scan:
    needs: build-and-test
    runs-on: ubuntu-latest
    steps:
    - name: Checkout Code
      uses: actions/checkout@v4
    - name: Run Trivy Vulnerability Scan
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: 'docker.io/aigatewayhub/gateway-service:latest'
        format: 'table'
        exit-code: '0'
        ignore-unfixed: true
        vuln-type: 'os,library'
        severity: 'CRITICAL,HIGH'

  docker-release:
    needs: [sonarcloud, security-scan]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
    - name: Checkout Code
      uses: actions/checkout@v4
    - name: Login to DockerHub
      uses: docker/login-action@v3
      with:
        username: \${{ secrets.DOCKER_USERNAME }}
        password: \${{ secrets.DOCKER_PASSWORD }}
    - name: Build and Push Docker image
      uses: docker/build-push-action@v5
      with:
        context: ./gateway-service
        push: true
        tags: |
          docker.io/aigatewayhub/gateway-service:latest
          docker.io/aigatewayhub/gateway-service:\${{ github.sha }}`
    }
  ]
};
