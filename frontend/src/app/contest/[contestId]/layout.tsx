"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { contestApi, problemApi } from "@/services/api";
import { Trophy, Code, Users, Clock } from "lucide-react";
import { setCookie, getCookie, deleteCookie } from "@/utils/cookies";

export default function ContestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { contestId } = useParams();
  const router = useRouter();
  const {
    contest,
    setContest,
    user, // Change from currentUser to user
    setCurrentProblem,
    leaderboard,
    setLeaderboard,
    setUser,
    setContestId,
    reset,
  } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        // Check if user exists in store, if not try cookies
        let currentUser = user;
        if (!currentUser) {
          const userCookie = getCookie("shodh-user");
          if (userCookie) {
            const userData = JSON.parse(userCookie);
            setUser(userData);
            currentUser = userData;
          }
        }

        const contestData = await contestApi.getContest(Number(contestId));
        setContest(contestData);
        
        // Save contest ID for persistence
        setContestId(Number(contestId));
        setCookie("shodh-contest-id", contestId.toString(), 1);

        // Set the first problem as current if available
        if (contestData.problems && contestData.problems.length > 0) {
          const firstProblem = await problemApi.getProblem(
            contestData.problems[0].id
          );
          setCurrentProblem(firstProblem);
        }

        // Fetch initial leaderboard
        const leaderboardData = await contestApi.getLeaderboard(
          Number(contestId)
        );
        setLeaderboard(leaderboardData);
      } catch (err) {
        setError("Failed to load contest");
        console.error("Error fetching contest:", err);
      } finally {
        setLoading(false);
      }
    };

    if (contestId) {
      fetchContest();
    }
  }, [contestId]);

  // Poll leaderboard every 30 seconds
  useEffect(() => {
    if (!contestId) return;

    const interval = setInterval(async () => {
      try {
        const leaderboardData = await contestApi.getLeaderboard(
          Number(contestId)
        );
        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error("Failed to refresh leaderboard:", error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [contestId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contest...</p>
        </div>
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Contest Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            {error || "The contest you're looking for doesn't exist."}
          </p>
          <button onClick={() => router.push("/")} className="btn btn-primary">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">
                {contest.name}
              </h1>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  contest.active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {contest.active ? "Active" : "Ended"}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Contest Stats */}
              <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Code className="w-4 h-4" />
                  <span>{contest.problems?.length || 0} Problems</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{leaderboard?.length || 0} Participants</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{contest.active ? "Live" : "Ended"}</span>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => router.push(`/contest/${contestId}`)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Code className="w-4 h-4 mr-1 inline" />
                  Problems
                </button>

                <button
                  onClick={() =>
                    router.push(`/contest/${contestId}/leaderboard`)
                  }
                  className="px-3 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 transition-colors"
                >
                  <Trophy className="w-4 h-4 mr-1 inline" />
                  Leaderboard
                </button>
              </div>

              {/* User Info */}
              {user && (
                <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {user.username}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
