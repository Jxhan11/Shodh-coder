"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { contestApi, userApi } from "@/services/api";
import { Code, Users, Trophy, Clock } from "lucide-react";
import { setCookie, getCookie, deleteCookie } from "@/utils/cookies";

export default function JoinPage() {
  const router = useRouter();
  const { setUser, setContest, setContestId, reset } = useStore();
  const [formData, setFormData] = useState({
    contestId: "1", // Default to contest 1
    username: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create/get user
      const user = await userApi.createUser(formData.username);
      setUser(user);

      // Get contest details
      const contest = await contestApi.getContest(Number(formData.contestId));
      setContest(contest);

      // Navigate to contest page
      router.push(`/contest/${formData.contestId}`);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to join contest. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleJoinContest = async () => {
    const { contestId, username } = formData;
    if (!contestId || !username) {
      alert("Please enter both Contest ID and Username");
      return;
    }

    try {
      setLoading(true);

      // Create or get user
      const userData = await userApi.createUser(username);

      // Save user and contest info to persistent storage
      setUser(userData);
      setContestId(Number(contestId));

      // Save to cookies as backup
      setCookie("shodh-user", JSON.stringify(userData), 1); // 1 day
      setCookie("shodh-contest-id", contestId, 1);

      // Navigate to contest
      router.push(`/contest/${contestId}`);
    } catch (error) {
      console.error("Failed to join contest:", error);
      alert("Failed to join contest. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear store
    reset();

    // Clear cookies
    deleteCookie("shodh-user");
    deleteCookie("shodh-contest-id");

    // Redirect to home
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Code className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Shodh-a-Code</h1>
          </div>
          <p className="text-xl text-gray-600">
            Live Programming Contest Platform
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Real-time Competition
            </h3>
            <p className="text-gray-600">
              Compete with others in live programming challenges
            </p>
          </div>
          <div className="text-center">
            <Clock className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Instant Judging</h3>
            <p className="text-gray-600">
              Get immediate feedback on your code submissions
            </p>
          </div>
          <div className="text-center">
            <Trophy className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Live Leaderboard</h3>
            <p className="text-gray-600">
              Track your progress on the real-time leaderboard
            </p>
          </div>
        </div>

        {/* Join Form */}
        <div className="max-w-md mx-auto">
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-center mb-6">
              Join Contest
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contest ID
                </label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  value={formData.contestId}
                  onChange={(e) =>
                    setFormData({ ...formData, contestId: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                  minLength={3}
                  maxLength={50}
                  // pattern="[a-zA-Z0-9_-]+"
                  title="Username can only contain letters, numbers, underscores, and hyphens"
                />
                <p className="text-sm text-gray-500 mt-1">
                  3-50 characters, letters/numbers/underscore/hyphen only
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !formData.username.trim()}
                className="btn btn-primary w-full"
              >
                {loading ? "Joining..." : "Join Contest"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
