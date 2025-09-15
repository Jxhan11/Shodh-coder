FROM openjdk:17-jdk-slim

# Install additional tools and runtimes
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    g++ \
    gcc \
    make \
    && rm -rf /var/lib/apt/lists/*

# Create workspace directory
WORKDIR /workspace

# Set resource limits (these will be overridden by docker run parameters)
ENV JAVA_OPTS="-Xmx128m -Xms64m"

# Default command
CMD ["bash"] 