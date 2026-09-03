###############################
# Stage 1 - Build
###############################

FROM eclipse-temurin:17-jdk AS builder

WORKDIR /build

# 1. Declare a build argument for the cache location
ARG MAVEN_OPTS="-Dmaven.repo.local=/root/.m2/repository"

COPY . .

RUN chmod +x mvnw

RUN ./mvnw clean package -DskipTests ${MAVEN_OPTS}

###############################
# Stage 2 - Runtime
###############################

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=builder /build/gateway-service/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]