#!/bin/bash

echo "Building and testing Docker code runner setup..."

# Build the code runner image
echo "Building code runner image..."
cd backend
docker build -t shodh-code-runner ./docker/code-runner/

# Test the image
echo "Testing code runner image..."
docker run --rm shodh-code-runner java -version
docker run --rm shodh-code-runner python3 --version
docker run --rm shodh-code-runner g++ --version

# Test Java execution
echo "Testing Java code execution..."
docker run --rm -v $(pwd):/workspace -w /workspace shodh-code-runner bash -c "
echo 'public class Test { public static void main(String[] args) { System.out.println(\"Hello World\"); } }' > Test.java &&
javac Test.java &&
echo '42' | java Test
"

echo "Docker setup test completed!" 