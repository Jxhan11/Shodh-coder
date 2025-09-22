# Shodh-a-Code Contest Platform

A comprehensive full-stack web application that enables real-time coding contests with live code judging, leaderboards, and submission tracking. Built with Spring Boot backend and Next.js frontend, featuring containerized code execution for secure and isolated code evaluation.

## Note
- Leaderboard results are based on polling not webSockets.
- Currently no option to create contests on the site. I did not implement any auth system. 
- Only contest 1 exists with 2 problems . 3 language options available (python,java and C++).
- How contest 1 is made: Once ```./gradlew bootRun``` is executed it fills in the Sample data (contest and problems)

# BUGS
- Memory usage is not being tracked properly. Shows 0 bytes even when running a memory heavy python code

## Test code for both problems in python:
- **Two sum**:
```python
# Read the first line: n and target
line1 = input().split()
n = int(line1[0])
target = int(line1[1])

# Read the second line: array elements
arr = list(map(int, input().split()))

# Two Sum algorithm
for i in range(n):
    for j in range(i + 1, n):
        if arr[i] + arr[j] == target:
            print(i, j)
            break
    else:
        continue
    break
```
- **Factorial**:
```python
import math

# Read input
n = int(input())

# Calculate factorial using math.factorial
print(math.factorial(n))
```

## 🏗️ Architecture Overview
| Component | Description    | Features                                  |
|-----------|----------------|-------------------------------------------|
| Frontend  | (Next.js)      | - React/TSX                               |
|           |                | - Zustand Store                           |
|           |                | - Monaco Editor                           |
|           |                | - Tailwind CSS                            |
| Backend   | (Spring Boot)  | - REST API                                |
|           |                | - JPA/H2 DB                               |
|           |                | - Async Proc.                             |
|           |                | - Docker Orch.                            |
| Docker    | Code Runner    | - Java/Python                             |
|           |                | - C++ Runtime                             |
|           |                | - Isolated Exec                           |
|           |                | - Resource Limits                         |


## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (required for containerized execution)
- **Java 17+** (for backend development)
- **Node.js 18+** (for frontend development)
- **Git** (for cloning the repository)

### Running the Application

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Jxhan11/Shodh-coder.git
   cd Shodh-coder
   ```

2. **Start the backend with Docker:**

   ```bash
   cd backend
   ./build.sh  # Builds the backend JAR
   docker build -t shodh-code-runner ./docker/code-runner #Build docker image to run code
   ./gradlew bootRun #Start the spring boot server                    
   ```

   The backend will be available at: `http://localhost:8080`

3. **Start the frontend (in a separate terminal):**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   The frontend will be available at: `http://localhost:3000`

4. **Access the application:**
   - Navigate to `http://localhost:3000`
   - Use Contest ID: `1` and any username to join the sample contest
   - Try solving the pre-loaded problems: "Two Sum" and "Factorial"

### Alternative: Full Docker Setup (Optional)

```bash
# Run everything with Docker Compose
docker-compose up --build
```

## 📡 API Design

### Core Endpoints

| Method | Endpoint                                | Description                         | Request Body           | Response                    |
| ------ | --------------------------------------- | ----------------------------------- | ---------------------- | --------------------------- |
| `GET`  | `/api/contests/{contestId}`             | Fetch contest details with problems | -                      | `ContestResponseDto`        |
| `POST` | `/api/submissions`                      | Submit code for judging             | `SubmissionRequestDto` | `SubmissionResponseDto`     |
| `GET`  | `/api/submissions/{submissionId}`       | Get submission status & results     | -                      | `SubmissionResponseDto`     |
| `GET`  | `/api/contests/{contestId}/leaderboard` | Live contest leaderboard            | -                      | `List<LeaderboardEntryDto>` |
| `GET`  | `/api/problems/{problemId}`             | Get problem details & test cases    | -                      | `ProblemDetailDto`          |
| `POST` | `/api/users`                            | Create a new user                   | `{username, email}`    | `UserResponseDto`           |

### Request/Response Examples

**Submit Code:**

```json
POST /api/submissions
{
  "userId": 1,
  "problemId": 1,
  "contestId": 1,
  "code": "public class Solution { ... }",
  "language": "java"
}
```

**Submission Response:**

```json
{
  "id": 123,
  "status": "ACCEPTED",
  "result": "Passed 2/2 test cases",
  "executionTime": 145,
  "testCasesPassed": 2,
  "totalTestCases": 2,
  "consoleOutput": "Hello World\n",
  "compilationError": null,
  "submittedAt": "2024-01-15T10:30:00",
  "completedAt": "2024-01-15T10:30:02"
}
```

## 🏛️ Backend Architecture

### Technology Stack

- **Spring Boot 3.5.5** - Web framework and dependency injection
- **Spring Data JPA** - Object-relational mapping and database operations
- **H2 Database** - In-memory database for development and testing
- **Docker Integration** - Containerized code execution via ProcessBuilder
- **Gradle** - Build automation and dependency management

### Service Layer Architecture

```ascii
┌──────────────────────────── Controllers Layer ────────────────────────────┐
│                                                                           │
│          ContestController    SubmissionController    UserController      │
│                                                                           │
└──────────────────────────────────┬─────────────────────────────────────── ┘
                                   │
┌──────────────────────────── Service Layer ──────────────────────────────┐
│                                                                         │
│    ContestService    SubmissionService    CodeJudgeService              │
│    UserService       ProblemService       DataInitializationService     │
│                                                                         │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
┌──────────────────────────── Repository Layer ───────────────────────────┐
│                                                                         │
│    ContestRepo    SubmissionRepo    UserRepo    ProblemRepo             │
│                                                                         │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
┌──────────────────────────── Data Layer ─────────────────────────────────┐
│                                                                         │
│                      H2 In-Memory Database                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```


### Key Design Decisions

1. **Asynchronous Processing:**

   - Submissions are processed asynchronously using `@Async` annotation
   - Immediate response with submission ID, status polling for updates
   - Prevents blocking of API threads during long-running code execution

2. **Docker Orchestration:**

   - Custom `CodeJudgeService` manages Docker containers programmatically
   - Each submission runs in an isolated container with resource limits
   - Supports Java, Python, and C++ with secure execution environment

3. **Data Model:**

   ```
   Contest (1) ──► (n) Problem (1) ──► (n) TestCase
      │                 │
      │                 └── (n) Submission (n) ──► (1) User
      │
      └── (n) Submission
   ```

4. **Error Handling:**
   - Global exception handler for consistent API responses
   - Comprehensive validation for all input parameters
   - Graceful degradation for system failures

### Code Execution Pipeline

1. **Submission Creation:** Validate user, problem, and contest
2. **Docker Setup:** Create temporary directory with user code
3. **Compilation:** Language-specific compilation (Java/C++)
4. **Execution:** Run code against test cases with time/memory limits
5. **Validation:** Compare output with expected results
6. **Cleanup:** Remove temporary files and containers
7. **Database Update:** Store results and console output

## 🎨 Frontend Architecture

### Technology Stack & Justification

- **Next.js 14** - React framework with App Router for file-based routing
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Zustand** - Lightweight state management (chosen over Redux)
- **Monaco Editor** - VS Code-quality code editor for the browser
- **Axios** - HTTP client for API communication
- **Lucide React** - Beautiful, customizable icons

### State Management Philosophy

**Why Zustand over Redux:**

As a developer with Flutter/Provider experience, I chose **Zustand** for this project because:

1. **Simplicity:** Similar to Flutter's Provider pattern - less boilerplate than Redux
2. **Learning Curve:** Easier to implement and understand for rapid prototyping
3. **Bundle Size:** Lightweight (2kb) compared to Redux Toolkit
4. **TypeScript Support:** Excellent TypeScript integration out of the box

**For Production/User State Management:** In a larger application with complex user authentication and permissions, I would recommend **Redux Toolkit** for:

- Better DevTools debugging
- Standardized patterns for enterprise applications
- Middleware ecosystem (persistence, logging, etc.)
- Team collaboration and maintainability

# Project Structure - src/

- **app/** (Next.js App Router)  
  - `page.tsx` - Landing page (Contest join)  
  - `layout.tsx` - Root layout with error boundary  
  - **contest/[contestId]/**  
    - `page.tsx` - Main contest interface  
    - `layout.tsx` - Contest-specific layout  

- **components/** (Reusable UI components)  
  - `CodeEditor.tsx` - Monaco editor with language support  
  - `ConsoleOutput.tsx` - Real-time execution output display  
  - `Leaderboard.tsx` - Live rankings with auto-refresh  
  - `ProblemPanel.tsx` - Problem description and test cases  
  - `SubmissionHistory.tsx` - User's submission timeline  

- **store/**  
  - `useStore.ts` - Zustand global state management  

- **services/**  
  - `api.ts` - Axios HTTP client configuration  

- **types/**  
  - `api.ts` - TypeScript interface definitions  


### Key Frontend Features

1. **Real-time Updates:**

   - Polling every 1-2 seconds for submission status
   - Live leaderboard updates every 15 seconds
   - Optimistic UI updates for better user experience

2. **Code Editor Integration:**

   - Monaco Editor with syntax highlighting
   - Language-specific templates (Java, Python, C++)
   - Auto-completion and error detection

3. **Responsive Design:**

   - Three-panel layout: Problems | Editor | Leaderboard
   - Mobile-responsive with collapsible panels
   - Console output panel for debugging

4. **Error Handling:**
   - React Error Boundary for crash protection
   - User-friendly error messages
   - Graceful API failure handling

## 🐳 Docker Integration & Challenges

### Code Execution Environment

**Custom Docker Image (`shodh-code-runner`):**

```dockerfile
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    python3 \
    python3-pip \
    g++ \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /workspace
```

### Orchestration Challenges & Solutions

1. **Security Isolation:**

   - **Challenge:** User code could be malicious or resource-intensive
   - **Solution:** Docker containers with strict memory/CPU limits, read-only mounts

2. **File System Management:**

   - **Challenge:** Temporary file cleanup and concurrent access
   - **Solution:** UUID-based temporary directories with automatic cleanup

3. **Process Communication:**

   - **Challenge:** Capturing stdout/stderr from Docker containers
   - **Solution:** ProcessBuilder with stream redirection and BufferedReader

4. **Resource Limits:**
   - **Challenge:** Preventing infinite loops and memory bombs
   - **Solution:** Docker `--memory` and `--cpus` flags with timeout handling

### Trade-offs Made

1. **Performance vs. Security:** Chose container isolation over native execution for security
2. **Complexity vs. Reliability:** Added comprehensive error handling at the cost of code complexity
3. **Real-time vs. Efficiency:** Polling-based updates instead of WebSockets for simplicity

## 🧪 Testing & Development

### Sample Data

The application comes pre-populated with:

- **Contest:** "Sample Contest" (ID: 1)
- **Problems:**
  - Two Sum (Array problem)
  - Factorial (Mathematical problem)
- **Test Cases:** Multiple input/output pairs for validation

### Development Workflow

```bash
# Backend development
cd backend
./gradlew bootRun

# Frontend development
cd frontend
npm run dev

# Test Docker execution
docker run --rm -v $(pwd):/workspace -w /workspace shodh-code-runner java Solution
```

### Manual Testing

1. Join contest with any username
2. Select a problem from the left panel
3. Write code in the editor (templates provided)
4. Submit and watch real-time status updates
5. Check console output for debugging
6. View leaderboard for rankings

## 🚀 Production Considerations

### Scalability Improvements

- Replace H2 with PostgreSQL for persistence
- Implement Redis for caching and session management
- Add rate limiting and authentication
- Use WebSockets for real-time updates
- Container orchestration with Kubernetes

### Security Enhancements

- JWT-based authentication
- Input sanitization and validation
- Container image scanning
- Network isolation between containers
- Audit logging for submissions

### Monitoring & Observability

- Application metrics with Micrometer
- Distributed tracing with Zipkin
- Error tracking with Sentry
- Performance monitoring with APM tools

---

## 📝 Additional Notes

This implementation demonstrates a complete full-stack application with:

- ✅ RESTful API design and implementation
- ✅ Real-time web interface with live updates
- ✅ Secure containerized code execution
- ✅ Comprehensive error handling and validation
- ✅ Modern frontend with TypeScript and component architecture
- ✅ Docker orchestration and resource management

The platform successfully handles code submission, compilation, execution, and result validation for multiple programming languages while maintaining security and performance standards required for a production coding contest platform.
