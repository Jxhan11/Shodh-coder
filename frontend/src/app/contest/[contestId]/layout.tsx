"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { contestApi } from "@/services/api";
import { Code, Clock, Users } from "lucide-react";

export default function ContestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const { user, contest, setContest } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContest = async () => {
      try {
        if (!user) {
          router.push("/");
          return;
        }

        if (!contest || contest.id !== Number(params.contestId)) {
          const contestData = await contestApi.getContest(
            Number(params.contestId)
          );
          setContest(contestData);
        }
      } catch (error) {
        console.error("Failed to load contest:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    loadContest();
  }, [params.contestId, user, contest, setContest, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contest...</p>
        </div>
      </div>
    );
  }

  if (!contest || !user) {
    return null;
  }

  const timeRemaining =
    new Date(contest.endTime).getTime() - new Date().getTime();
  const isActive = contest.active && timeRemaining > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Code className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {contest.name}
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome, {user.username}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                <span className={isActive ? "text-green-600" : "text-red-600"}>
                  {isActive ? "Contest Active" : "Contest Ended"}
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                <span>{contest.problems.length} Problems</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
