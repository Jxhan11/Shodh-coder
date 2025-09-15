import axios from "axios";
import {
  Contest,
  ProblemDetail,
  User,
  SubmissionRequest,
  Submission,
  LeaderboardEntry,
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const contestApi = {
  getContest: async (contestId: number): Promise<Contest> => {
    const response = await api.get(`/contests/${contestId}`);
    return response.data;
  },

  getLeaderboard: async (contestId: number): Promise<LeaderboardEntry[]> => {
    const response = await api.get(`/contests/${contestId}/leaderboard`);
    return response.data;
  },
};

export const problemApi = {
  getProblem: async (problemId: number): Promise<ProblemDetail> => {
    const response = await api.get(`/problems/${problemId}`);
    return response.data;
  },
};

export const userApi = {
  createUser: async (username: string): Promise<User> => {
    const response = await api.post(`/users?username=${username}`);
    return response.data;
  },

  getUser: async (userId: number): Promise<User> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
};

export const submissionApi = {
  createSubmission: async (
    submission: SubmissionRequest
  ): Promise<Submission> => {
    const response = await api.post("/submissions", submission);
    return response.data;
  },

  getSubmission: async (submissionId: number): Promise<Submission> => {
    const response = await api.get(`/submissions/${submissionId}`);
    return response.data;
  },

  getUserSubmissions: async (
    userId: number,
    contestId: number
  ): Promise<Submission[]> => {
    const response = await api.get(
      `/submissions?userId=${userId}&contestId=${contestId}`
    );
    return response.data;
  },
};

export default api;
