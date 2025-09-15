"use client";

import { useStore } from "@/store/useStore";
import { Clock, CheckCircle, XCircle, AlertCircle, Loader } from "lucide-react";
import { useEffect } from "react";
import { submissionApi } from "@/services/api";

const statusConfig = {
  PENDING: {
    icon: Loader,
    color: "text-yellow-600",
    bg: "bg-yellow-50 border-yellow-200",
    label: "Pending",
  },
  RUNNING: {
    icon: Loader,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    label: "Running",
  },
  ACCEPTED: {
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
    label: "Accepted",
  },
  WRONG_ANSWER: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    label: "Wrong Answer",
  },
  TIME_LIMIT_EXCEEDED: {
    icon: Clock,
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-200",
    label: "Time Limit Exceeded",
  },
  MEMORY_LIMIT_EXCEEDED: {
    icon: AlertCircle,
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200",
    label: "Memory Limit Exceeded",
  },
  RUNTIME_ERROR: {
    icon: AlertCircle,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    label: "Runtime Error",
  },
  COMPILATION_ERROR: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    label: "Compilation Error",
  },
  SYSTEM_ERROR: {
    icon: AlertCircle,
    color: "text-gray-600",
    bg: "bg-gray-50 border-gray-200",
    label: "System Error",
  },
};

export default function SubmissionHistory() {
  const { user, contest, submissions, updateSubmission } = useStore();

  // Poll pending/running submissions
  useEffect(() => {
    if (!submissions.length) return;

    const pendingSubmissions = submissions.filter(
      (sub) => sub.status === "PENDING" || sub.status === "RUNNING"
    );

    if (pendingSubmissions.length === 0) return;

    const pollSubmissions = async () => {
      try {
        await Promise.all(
          pendingSubmissions.map(async (sub) => {
            const updated = await submissionApi.getSubmission(sub.id);
            updateSubmission(updated);
          })
        );
      } catch (error) {
        console.error("Failed to poll submissions:", error);
      }
    };

    const interval = setInterval(pollSubmissions, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [submissions, updateSubmission]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatExecutionTime = (ms: number | null) => {
    if (ms === null) return "N/A";
    return `${ms}ms`;
  };

  return (
    <div className="card h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <h3 className="font-semibold text-gray-900">My Submissions</h3>
        {user && contest && (
          <p className="text-sm text-gray-600 mt-1">
            {submissions.length} submission{submissions.length !== 1 ? "s" : ""}{" "}
            for {contest.name}
          </p>
        )}
      </div>

      {/* Submissions List */}
      <div className="flex-1 overflow-y-auto p-4">
        {submissions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No submissions yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Submit your first solution to see it here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((submission) => {
              const config = statusConfig[submission.status];
              const StatusIcon = config.icon;

              return (
                <div
                  key={submission.id}
                  className={`border rounded-lg p-4 ${config.bg}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {submission.problemTitle}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {/* {submission.language.toUpperCase()} •{" "} */}
                        {formatTime(submission.submittedAt)}
                      </p>
                    </div>
                    <div className={`flex items-center ${config.color}`}>
                      <StatusIcon
                        className={`h-4 w-4 mr-1 ${
                          submission.status === "PENDING" ||
                          submission.status === "RUNNING"
                            ? "animate-spin"
                            : ""
                        }`}
                      />
                      <span className="text-sm font-medium">
                        {config.label}
                      </span>
                    </div>
                  </div>

                  {/* Test Cases Progress */}
                  {submission.totalTestCases > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Test Cases</span>
                        <span className="font-medium">
                          {submission.testCasesPassed}/
                          {submission.totalTestCases}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            submission.status === "ACCEPTED"
                              ? "bg-green-500"
                              : submission.testCasesPassed > 0
                              ? "bg-yellow-500"
                              : "bg-gray-300"
                          }`}
                          style={{
                            width: `${
                              (submission.testCasesPassed /
                                submission.totalTestCases) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Execution Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Execution Time:</span>
                      <span className="ml-2 font-mono">
                        {formatExecutionTime(submission.executionTime)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Memory:</span>
                      <span className="ml-2 font-mono">
                        {submission.memoryUsed
                          ? `${Math.round(submission.memoryUsed / 1024)}KB`
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Result Message */}
                  {submission.result && (
                    <div className="mt-3 text-sm">
                      <span className="text-gray-600">Result:</span>
                      <p className="mt-1 text-gray-700 bg-white p-2 rounded border">
                        {submission.result}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
