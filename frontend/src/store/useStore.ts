import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  Contest,
  User,
  ProblemDetail,
  Submission,
  LeaderboardEntry,
} from "@/types/api";

interface ContestState {
  // User data
  user: User | null;
  setUser: (user: User | null) => void;

  // Contest data
  contest: Contest | null;
  currentProblem: ProblemDetail | null;
  setContest: (contest: Contest) => void;
  setCurrentProblem: (problem: ProblemDetail) => void;

  // Submissions
  submissions: Submission[];
  currentSubmission: Submission | null;
  addSubmission: (submission: Submission) => void;
  updateSubmission: (submission: Submission) => void;
  setSubmissions: (submissions: Submission[]) => void;

  // Leaderboard
  leaderboard: LeaderboardEntry[];
  setLeaderboard: (leaderboard: LeaderboardEntry[]) => void;

  // UI State
  selectedLanguage: string;
  code: string;
  isSubmitting: boolean;
  setSelectedLanguage: (language: string) => void;
  setCode: (code: string) => void;
  setIsSubmitting: (submitting: boolean) => void;

  // Actions
  reset: () => void;
}

const initialState = {
  user: null,
  contest: null,
  currentProblem: null,
  submissions: [],
  currentSubmission: null,
  leaderboard: [],
  selectedLanguage: "java",
  code: "",
  isSubmitting: false,
};

export const useStore = create<ContestState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setUser: (user) => set({ user }),

      setContest: (contest) => set({ contest }),

      setCurrentProblem: (problem) =>
        set({ currentProblem: problem, code: getDefaultCode(problem.title) }),

      addSubmission: (submission) =>
        set((state) => ({
          submissions: [submission, ...state.submissions],
          currentSubmission: submission,
        })),

      updateSubmission: (submission) =>
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === submission.id ? submission : s
          ),
          currentSubmission:
            state.currentSubmission?.id === submission.id
              ? submission
              : state.currentSubmission,
        })),

      setSubmissions: (submissions) => set({ submissions }),

      setLeaderboard: (leaderboard) => set({ leaderboard }),

      setSelectedLanguage: (language) =>
        set((state) => ({
          selectedLanguage: language,
          code: getDefaultCode(state.currentProblem?.title || "", language),
        })),

      setCode: (code) => set({ code }),

      setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

      reset: () => set(initialState),
    }),
    {
      name: "contest-store",
    }
  )
);

// Helper function to get default code templates
function getDefaultCode(
  problemTitle: string,
  language: string = "java"
): string {
  const templates = {
    java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Read input
        
        // Solve problem
        
        // Print output
        
        sc.close();
    }
}`,
    python: `# Read input

# Solve problem

# Print output`,
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // Read input
    
    // Solve problem
    
    // Print output
    
    return 0;
}`,
  };

  return templates[language as keyof typeof templates] || templates.java;
}
