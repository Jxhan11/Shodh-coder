"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useStore } from "@/store/useStore";
import { problemApi, submissionApi, contestApi } from "@/services/api";
import ProblemPanel from "@/components/ProblemPanel";
import CodeEditor from "@/components/CodeEditor";
import Leaderboard from "@/components/Leaderboard";
import SubmissionHistory from "@/components/SubmissionHistory";
import ConsoleOutput from "@/components/ConsoleOutput";

export default function ContestPage() {
  const { contestId } = useParams();
  const {
    contest,
    user,
    currentProblem,
    setContest,
    setCurrentProblem,
    setSubmissions,
    setLeaderboard,
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"problem" | "submissions">(
    "problem"
  );
  const [activeBottomTab, setActiveBottomTab] = useState<
    "console" | "submissions"
  >("console");

  // Load initial data on page load/refresh
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        // If contest is not loaded, load it first
        if (!contest && contestId) {
          const contestData = await contestApi.getContest(Number(contestId));
          setContest(contestData);

          // Load first problem by default
          if (contestData.problems.length > 0) {
            const problemDetail = await problemApi.getProblem(
              contestData.problems[0].id
            );
            setCurrentProblem(problemDetail);
          }

          // Load leaderboard
          const leaderboard = await contestApi.getLeaderboard(
            Number(contestId)
          );
          setLeaderboard(leaderboard);
        }

        // Load user submissions if user exists
        if (user && contest) {
          const submissions = await submissionApi.getUserSubmissions(
            user.id,
            contest.id
          );
          setSubmissions(submissions);
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [
    contestId,
    contest,
    user,
    setContest,
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
    }, 10000);

    return () => clearInterval(interval);
  }, [contest, setLeaderboard]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-140px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contest...</p>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-140px)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Contest not found
          </h2>
          <p className="text-gray-600">
            Please check the contest ID and try again.
          </p>
        </div>
      </div>
    );
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

         
        </div>

        {/* Right Panel - Console Output */}
        <div className="col-span-3">
          <ConsoleOutput />
        </div>
      </div>
    </div>
  );
}
