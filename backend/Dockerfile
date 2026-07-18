###############################
# Stage 1 - Build
###############################

FROM eclipse-temurin:17-jdk AS builder

WORKDIR /build

COPY . .

RUN chmod +x mvnw

RUN ./mvnw clean package -DskipTests

###############################
# Stage 2 - Runtime
###############################

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=builder /build/gateway-service/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]