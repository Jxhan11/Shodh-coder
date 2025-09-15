"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { contestApi } from "@/services/api";
import { Trophy, Medal, Award, ArrowLeft, RefreshCw } from "lucide-react";

export default function LeaderboardPage() {
  const { contestId } = useParams();
  const router = useRouter();
  const { contest, leaderboard, setLeaderboard } = useStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      if (refreshing) return;
      setRefreshing(true);

      const data = await contestApi.getLeaderboard(Number(contestId));
      setLeaderboard(data);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [contestId]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full text-sm font-bold text-gray-600">
            {rank}
          </div>
        );
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200";
      case 2:
        return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200";
      case 3:
        return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200";
      default:
        return "bg-white border-gray-200 hover:bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Contest</span>
              </button>

              <div className="h-6 w-px bg-gray-300" />

              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {contest?.name || "Contest"} - Leaderboard
                </h1>
                <p className="text-sm text-gray-500">
                  Live rankings and scores
                </p>
              </div>
            </div>

            <button
              onClick={fetchLeaderboard}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contest Info */}
        {contest && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {contest.name}
                </h2>
                <p className="text-gray-600 mb-4">{contest.description}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span>
                    <strong>Problems:</strong> {contest.problems?.length || 0}
                  </span>
                  <span>
                    <strong>Participants:</strong> {leaderboard?.length || 0}
                  </span>
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
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Last Updated</div>
                <div className="text-lg font-semibold text-gray-900">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
              Leaderboard
            </h3>
          </div>

          {leaderboard && leaderboard.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.username}
                  className={`p-6 transition-colors ${getRankStyle(
                    entry.rank
                  )}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getRankIcon(entry.rank)}

                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {entry.username}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>
                            <strong>Score:</strong> {entry.score}
                          </span>
                          <span>
                            <strong>Solved:</strong> {entry.problemsSolved}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        #{entry.rank}
                      </div>
                      {entry.rank <= 3 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {entry.rank === 1
                            ? "Winner!"
                            : entry.rank === 2
                            ? "Runner-up"
                            : "Third Place"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No submissions yet
              </h3>
              <p className="text-gray-500">
                Be the first to solve a problem and appear on the leaderboard!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
