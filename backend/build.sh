#!/bin/bash

echo "Building Shodh-a-Code Backend..."

# Build the Spring Boot application
echo "Building Spring Boot application..."
./gradlew clean build -x test

# Build Docker images
echo "Building Docker images..."
docker build -t shodh-backend .
docker build -t shodh-code-runner ./docker/code-runner/

echo "Build completed successfully!"
echo ""
echo "To run the application:"
echo "1. Using Docker Compose: docker-compose up"
echo "2. Using Gradle: ./gradlew bootRun"
echo "3. Using Java: java -jar build/libs/coder-0.0.1-SNAPSHOT.jar" 