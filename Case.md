# The "Shodh-a-Code" Contest Platform

**Objective:**
This project is designed to be a comprehensive assessment of your end-to-end full-stack and
systems engineering capabilities. You will build a complete web application from the ground up,
featuring a live, containerized code judging backend using our core technology stack. The goal
is to see how you approach building a complex, real-world product feature that requires
integrating multiple system components.
This task will test your end-to-end skills in:
● **Backend Development (Spring Boot):** Designing a robust RESTful API, data
modeling, and orchestrating external processes.
● **Frontend Development (React/Next.js):** Building a functional, real-time UI and
managing asynchronous client-side state.
● **DevOps & Systems Integration:** Creating a Dockerized execution environment and
programmatically controlling it from a Java application.
● **Synthesizing a complete product** and communicating your architectural decisions.
**The Business Context:**
Imagine you are a Full Stack Engineer at Shodh AI. To increase engagement on our AI
Education platform, the product team wants to introduce a new feature: lightweight, real-time
coding contests. Students should be able to join a specific contest using an ID, solve a few
problems, and see their rankings on a live leaderboard. Your task is to build a functional
prototype of this feature, **including the backend service that securely runs and validates
the submitted code.**

# The Core Tasks

**Task 1: The Backend - Contest API & Live Judge (Spring Boot)**
You will build the complete REST API and the code judging engine that will power the platform.
● **Data Modeling:** Design and implement the data models for the following entities:
Contest, Problem (including a set of input/output test cases), Submission, and User.
● **API Endpoints:** Implement the following REST endpoints:

1. GET /api/contests/{contestId}: Fetches contest details.
2. POST /api/submissions: Accepts a submission, adds it to a queue for
    asynchronous processing, and returns a unique submissionId.
3. GET /api/submissions/{submissionId}: Fetches the latest status and result of a
    specific submission (e.g., "Pending", "Running", "Accepted").


4. GET /api/contests/{contestId}/leaderboard: Returns the live leaderboard.
● **Business Logic - The Live "Code Judge" Engine:** Build a service that can run
user-submitted code inside a Docker container.
1. **Create a Docker Image:** Write a Dockerfile for a custom execution environment
containing the necessary runtimes (e.g., a JDK).
2. **Orchestrate Execution:** When a submission is processed, your Spring Boot
service must programmatically execute a docker run command (e.g., via Java's
ProcessBuilder).
3. **Manage the Process:** The command must mount the user's code into the
container, pass the problem's input test case via stdin, impose strict resource
limits (time and memory), and capture the resulting stdout.
4. **Validate & Update:** Compare the captured output with the expected output to
determine the result ("Accepted", "Wrong Answer", etc.) and update the
submission's status in the database. Ensure the container and any temporary
files are cleaned up after each run.
**(Note: Please pre-populate your database with at least one sample contest and 2-
problems to ensure the application is testable.)
Task 2: The Frontend - Contest UI (React/Next.js & Tailwind CSS)**
You will build the user interface that provides a real-time experience by consuming the API you
created.
● **The "Join" Page:** Create a simple form to accept a Contest ID and a Username.
● **The Main Contest Page:** This page should be the central hub, displaying a problem
view, a code editor, and the leaderboard.
● **Asynchronous Submission Flow:**
1. When a user submits code, call the POST /api/submissions endpoint.
2. Upon receiving a submissionId, the frontend must **poll** the GET
/api/submissions/{submissionId} endpoint every 2-3 seconds.
3. Display the live status ("Running", "Accepted", etc.) to the user as it's updated.
● **Live Leaderboard:** The leaderboard component should poll GET
/api/contests/{contestId}/leaderboard periodically (e.g., every 15-30 seconds) to keep the
rankings fresh and simulate a live event.

# How to Submit

You will be asked to provide the following item:
● **Link to your GitHub Repository**
○ Your repository must be public and well-organized, with separate, clearly-marked
folders for the frontend and backend.


○ It must include a single, top-level **README.md** file. This document is the primary
artifact we will evaluate to understand your thinking.
Your **README.md** file must include:
● **Setup Instructions:** Clear, step-by-step instructions on how to set up the environment
and run the entire application locally. Using a single docker-compose.yml file is highly
encouraged for simplicity.
● **API Design:** A brief but clear overview of the API endpoints you created and their
expected request/response formats.
● **Design Choices & Justification:** A concise section explaining the key architectural
decisions you made. For example:
○ How did you structure your services on the backend?
○ Why did you choose your specific state management approach on the frontend?
○ What were the biggest challenges with the Docker orchestration, and what
trade-offs did you make?

# Evaluation Criteria

You will be evaluated on:
● **Technical Execution:** The correctness and robustness of your end-to-end
implementation. Does the application work as specified?
● **Backend Quality:** The clarity of your API design, the logic of your data models, and the
structure of your Spring Boot application, especially the Docker integration.
● **Frontend Quality:** Your ability to build a functional and intuitive UI with React, including
your component structure, state management, and handling of asynchronous events.
● **DevOps & Systems Proficiency:** The quality of your Dockerfile and the reliability of the
code execution engine you built.
● **Communication:** The overall clarity, thoroughness, and professionalism of your
README.md file.


