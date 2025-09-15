# Shodh-a-Code Backend

This is the backend service for the Shodh-a-Code contest platform, built with Spring Boot.

## Features

- **Contest Management**: Create and manage programming contests
- **Problem Management**: Define problems with test cases
- **Code Execution**: Secure Docker-based code execution engine
- **Real-time Judging**: Asynchronous code evaluation with multiple test cases
- **Leaderboard**: Live ranking system
- **Multi-language Support**: Java, Python, C++ code execution

## Technology Stack

- **Framework**: Spring Boot 3.5.5
- **Database**: H2 (development), configurable for production
- **Code Execution**: Docker containers
- **Async Processing**: Spring @Async
- **Build Tool**: Gradle

## API Endpoints

### Contest Endpoints

- `GET /api/contests/{contestId}` - Get contest details
- `GET /api/contests` - Get all contests
- `GET /api/contests/{contestId}/leaderboard` - Get contest leaderboard

### Submission Endpoints

- `POST /api/submissions` - Submit code for evaluation
- `GET /api/submissions/{submissionId}` - Get submission status
- `GET /api/submissions?userId={userId}&contestId={contestId}` - Get user submissions

### User Endpoints

- `POST /api/users` - Create/get user by username
- `GET /api/users/{userId}` - Get user by ID
- `GET /api/users/by-username/{username}` - Get user by username

## Quick Start

### Prerequisites

- Java 17+
- Docker
- Gradle (or use included wrapper)

### Running Locally

1. **Clone and build:**

   ```bash
   ./gradlew bootRun
   ```

2. **Using Docker Compose:**

   ```bash
   docker-compose up
   ```

3. **Access the application:**
   - API: http://localhost:8080
   - H2 Console: http://localhost:8080/h2-console

### Sample Data

The application automatically creates sample data on startup:

- 1 Contest: "Sample Programming Contest"
- 2 Problems: "Two Sum" and "Factorial"
- 3 Users: alice, bob, charlie

## Architecture

### Code Execution Flow

1. User submits code via API
2. Submission stored in database with PENDING status
3. Async processor picks up submission
4. Code executed in isolated Docker container
5. Results compared against test cases
6. Database updated with final status

### Security

- Docker containers run with resource limits
- Temporary files cleaned up after execution
- Code execution timeouts enforced
- Memory limits applied

## Configuration

Key configuration properties:

```properties
# Docker settings
app.docker.timeout=30
app.docker.memory-limit=128m
app.docker.image-name=shodh-code-runner

# Database
spring.datasource.url=jdbc:h2:mem:testdb

# Async processing
spring.task.execution.pool.core-size=4
```

## Development

### Adding New Languages

1. Update `CodeJudgeService.addLanguageCommand()`
2. Ensure runtime is available in code-runner Docker image
3. Add language-specific compilation logic if needed

### Database Schema

- **Users**: User accounts and authentication
- **Contests**: Contest definitions and timing
- **Problems**: Problem statements and constraints
- **TestCases**: Input/output test data
- **Submissions**: Code submissions and results
