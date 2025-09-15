"use client";

import { useStore } from "@/store/useStore";
import { Trophy, Medal, Award, Users } from "lucide-react";

export default function Leaderboard() {
  const { leaderboard, user } = useStore();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-gray-500 font-semibold">{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-50 border-yellow-200";
      case 2:
        return "bg-gray-50 border-gray-200";
      case 3:
        return "bg-amber-50 border-amber-200";
      default:
        return "bg-white border-gray-200";
    }
  };

  const isCurrentUser = (username: string) => {
    return user?.username === username;
  };

  return (
    <div className="card h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center">
          <Users className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="font-semibold text-gray-900">Leaderboard</h3>
          <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            Live
          </span>
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No submissions yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Be the first to submit a solution!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <div
                key={entry.username}
                className={`border rounded-lg p-3 transition-all ${getRankColor(
                  entry.rank
                )} ${
                  isCurrentUser(entry.username)
                    ? "ring-2 ring-blue-500 border-blue-300"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span
                          className={`font-medium ${
                            isCurrentUser(entry.username)
                              ? "text-blue-700"
                              : "text-gray-900"
                          }`}
                        >
                          {entry.username}
                        </span>
                        {isCurrentUser(entry.username) && (
                          <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {entry.problemsSolved} problem
                        {entry.problemsSolved !== 1 ? "s" : ""} solved
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-gray-900">
                      {entry.score}
                    </div>
                    <div className="text-sm text-gray-500">points</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t p-4">
        <div className="text-xs text-gray-500 text-center">
          <p>Updates every 10 seconds</p>
          {user && (
            <p className="mt-1">
              Your rank:{" "}
              {leaderboard.find((entry) => entry.username === user.username)
                ?.rank || "Unranked"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
