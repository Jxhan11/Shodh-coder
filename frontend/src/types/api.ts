export interface Contest {
  id: number;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  active: boolean;
  problems: ProblemSummary[];
}

export interface ProblemSummary {
  id: number;
  title: string;
  points: number;
  timeLimit: number;
  memoryLimit: number;
}

export interface ProblemDetail {
  id: number;
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  timeLimit: number;
  memoryLimit: number;
  points: number;
  sampleTestCases: SampleTestCase[];
}

export interface SampleTestCase {
  input: string;
  expectedOutput: string;
}

export interface User {
  id: number;
  username: string;
  createdAt: string;
}

export interface SubmissionRequest {
  userId: number;
  problemId: number;
  contestId: number;
  code: string;
  language: string;
}

export interface Submission {
  id: number;
  status: SubmissionStatus;
  result: string | null;
  executionTime: number | null;
  memoryUsed: number | null;
  testCasesPassed: number;
  totalTestCases: number;
  submittedAt: string;
  completedAt: string | null;
  username: string;
  problemTitle: string;
  // Add console output fields
  consoleOutput?: string;
  compilationError?: string;
}

export type SubmissionStatus =
  | "PENDING"
  | "RUNNING"
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT_EXCEEDED"
  | "MEMORY_LIMIT_EXCEEDED"
  | "RUNTIME_ERROR"
  | "COMPILATION_ERROR"
  | "SYSTEM_ERROR";

export interface LeaderboardEntry {
  username: string;
  score: number;
  problemsSolved: number;
  rank: number;
}
