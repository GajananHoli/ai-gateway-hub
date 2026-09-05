FROM eclipse-temurin:17-jre

WORKDIR /app

# Copies the JAR already built by your host runner during the test/sonar steps
COPY gateway-service/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
