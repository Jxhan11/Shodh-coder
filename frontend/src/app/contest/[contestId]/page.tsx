"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { problemApi, submissionApi, contestApi } from "@/services/api";
import ProblemPanel from "@/components/ProblemPanel";
import CodeEditor from "@/components/CodeEditor";
import Leaderboard from "@/components/Leaderboard";
import SubmissionHistory from "@/components/SubmissionHistory";
import ConsoleOutput from "@/components/ConsoleOutput";

export default function ContestPage() {
  const {
    contest,
    user,
    currentProblem,
    setCurrentProblem,
    setSubmissions,
    setLeaderboard,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"problem" | "submissions">(
    "problem"
  );
  const [activeBottomTab, setActiveBottomTab] = useState<
    "console" | "submissions"
  >("console");

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!contest || !user) return;

      try {
        // Load first problem by default
        if (contest.problems.length > 0 && !currentProblem) {
          const problemDetail = await problemApi.getProblem(
            contest.problems[0].id
          );
          setCurrentProblem(problemDetail);
        }

        // Load user submissions
        const submissions = await submissionApi.getUserSubmissions(
          user.id,
          contest.id
        );
        setSubmissions(submissions);

        // Load leaderboard
        const leaderboard = await contestApi.getLeaderboard(contest.id);
        setLeaderboard(leaderboard);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
    };

    loadInitialData();
  }, [
    contest,
    user,
    currentProblem,
    setCurrentProblem,
    setSubmissions,
    setLeaderboard,
  ]);

  // Poll for leaderboard updates
  useEffect(() => {
    if (!contest) return;

    const interval = setInterval(async () => {
      try {
        const leaderboard = await contestApi.getLeaderboard(contest.id);
        setLeaderboard(leaderboard);
      } catch (error) {
        console.error("Failed to update leaderboard:", error);
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [contest, setLeaderboard]);

  if (!contest || !user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
        {/* Left Panel - Problem/Submissions */}
        <div className="col-span-4 flex flex-col">
          {/* Tab Navigation */}
          <div className="flex mb-4">
            <button
              onClick={() => setActiveTab("problem")}
              className={`px-4 py-2 rounded-l-lg font-medium transition-colors ${
                activeTab === "problem"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Problem
            </button>
            <button
              onClick={() => setActiveTab("submissions")}
              className={`px-4 py-2 rounded-r-lg font-medium transition-colors ${
                activeTab === "submissions"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              My Submissions
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "problem" ? <ProblemPanel /> : <SubmissionHistory />}
          </div>
        </div>

        {/* Middle Panel - Code Editor */}
        <div className="col-span-5 flex flex-col">
          <div className="flex-1 mb-4">
            <CodeEditor />
          </div>

          {/* Bottom Panel - Console Output / Submission History */}
          <div className="h-64 pb-6">
            {/* Bottom Tab Navigation */}
            <div className="flex mb-2">
              <button
                onClick={() => setActiveBottomTab("console")}
                className={`px-3 py-1 rounded-l text-sm font-medium transition-colors ${
                  activeBottomTab === "console"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Console
              </button>
              <button
                onClick={() => setActiveBottomTab("submissions")}
                className={`px-3 py-1 rounded-r text-sm font-medium transition-colors ${
                  activeBottomTab === "submissions"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                History
              </button>
            </div>

            {/* Bottom Tab Content */}
            <div className="h-full">
              {activeBottomTab === "console" ? (
                <Leaderboard />
              ) : (
                <SubmissionHistory />
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Leaderboard */}
        <div className="col-span-3">
          {/* <Leaderboard /> */}
          <ConsoleOutput />
        </div>
      </div>
    </div>
  );
}
