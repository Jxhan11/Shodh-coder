"use client";

import { useStore } from "@/store/useStore";
import { Terminal, Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function ConsoleOutput() {
  const { currentSubmission } = useStore();
  const [showDetails, setShowDetails] = useState(true);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!currentSubmission) {
    return (
      <div className="card h-full">
        <div className="border-b p-4">
          <div className="flex items-center">
            <Terminal className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Console Output</h3>
          </div>
        </div>
        <div className="p-4 text-center text-gray-500">
          <Terminal className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p>Submit code to see console output</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Terminal className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Console Output</h3>
            <span
              className={`ml-3 px-2 py-1 text-xs rounded-full ${
                currentSubmission.status === "ACCEPTED"
                  ? "bg-green-100 text-green-800"
                  : currentSubmission.status === "PENDING" ||
                    currentSubmission.status === "RUNNING"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {currentSubmission.status.replace("_", " ")}
            </span>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            {showDetails ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Compilation Error */}
        {currentSubmission.compilationError && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-red-700">Compilation Error</h4>
              <button
                onClick={() =>
                  copyToClipboard(currentSubmission.compilationError || "")
                }
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <pre className="bg-red-50 border border-red-200 rounded p-3 text-sm font-mono overflow-x-auto whitespace-pre-wrap text-red-800">
              {currentSubmission.compilationError}
            </pre>
          </div>
        )}

        {/* Console Output */}
        {currentSubmission.consoleOutput && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-700">Console Output</h4>
              <button
                onClick={() =>
                  copyToClipboard(currentSubmission.consoleOutput || "")
                }
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <pre className="bg-gray-900 text-green-400 rounded p-3 text-sm font-mono overflow-x-auto whitespace-pre-wrap">
              {currentSubmission.consoleOutput}
            </pre>
          </div>
        )}

        {/* Execution Details */}
        {showDetails && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2">
              Execution Details
            </h4>
            <div className="bg-gray-50 rounded p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-mono">{currentSubmission.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Test Cases:</span>
                <span className="font-mono">
                  {currentSubmission.testCasesPassed}/
                  {currentSubmission.totalTestCases}
                </span>
              </div>
              {currentSubmission.executionTime && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Execution Time:</span>
                  <span className="font-mono">
                    {currentSubmission.executionTime}ms
                  </span>
                </div>
              )}
              {currentSubmission.memoryUsed && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Memory Used:</span>
                  <span className="font-mono">
                    {Math.round(currentSubmission.memoryUsed / 1024)}KB
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Language:</span>
                <span className="font-mono uppercase">
                  {currentSubmission.problemTitle}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Result Message */}
        {currentSubmission.result && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Result</h4>
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
              {currentSubmission.result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
