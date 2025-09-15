"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { problemApi } from "@/services/api";
import { Clock, Database, Trophy, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function ProblemPanel() {
  const { contest, currentProblem, setCurrentProblem } = useStore();
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);
  const [showSamples, setShowSamples] = useState(true);

  useEffect(() => {
    if (currentProblem) {
      setSelectedProblemId(currentProblem.id);
    }
  }, [currentProblem]);

  const handleProblemSelect = async (problemId: number) => {
    try {
      const problemDetail = await problemApi.getProblem(problemId);
      setCurrentProblem(problemDetail);
      setSelectedProblemId(problemId);
    } catch (error) {
      console.error("Failed to load problem:", error);
    }
  };

  if (!contest) {
    return (
      <div className="card p-6 h-full">
        <p className="text-gray-500">Loading problems...</p>
      </div>
    );
  }

  return (
    <div className="card h-full flex flex-col">
      {/* Problem Selector */}
      <div className="border-b p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Problems</h3>
        <div className="space-y-2">
          {contest.problems.map((problem) => (
            <button
              key={problem.id}
              onClick={() => handleProblemSelect(problem.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedProblemId === problem.id
                  ? "bg-blue-50 border-2 border-blue-200"
                  : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{problem.title}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <div className="flex items-center">
                      <Trophy className="h-3 w-3 mr-1" />
                      {problem.points} pts
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {problem.timeLimit}s
                    </div>
                    <div className="flex items-center">
                      <Database className="h-3 w-3 mr-1" />
                      {problem.memoryLimit}MB
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Problem Details */}
      {currentProblem ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {currentProblem.title}
            </h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
              <span className="flex items-center">
                <Trophy className="h-4 w-4 mr-1" />
                {currentProblem.points} points
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {currentProblem.timeLimit} seconds
              </span>
              <span className="flex items-center">
                <Database className="h-4 w-4 mr-1" />
                {currentProblem.memoryLimit} MB
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Problem Statement</h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">
                {currentProblem.description}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Input Format</h3>
            <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
              {currentProblem.inputFormat}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Output Format</h3>
            <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
              {currentProblem.outputFormat}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Constraints</h3>
            <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg font-mono text-sm">
              {currentProblem.constraints}
            </p>
          </div>

          {/* Sample Test Cases */}
          {currentProblem.sampleTestCases.length > 0 && (
            <div>
              <button
                onClick={() => setShowSamples(!showSamples)}
                className="flex items-center font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors"
              >
                {showSamples ? (
                  <ChevronDown className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1" />
                )}
                Sample Test Cases ({currentProblem.sampleTestCases.length})
              </button>

              {showSamples && (
                <div className="space-y-4">
                  {currentProblem.sampleTestCases.map((testCase, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">
                            Sample Input {index + 1}
                          </h5>
                          <pre className="bg-white p-3 rounded border text-sm font-mono overflow-x-auto">
                            {testCase.input}
                          </pre>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">
                            Sample Output {index + 1}
                          </h5>
                          <pre className="bg-white p-3 rounded border text-sm font-mono overflow-x-auto">
                            {testCase.expectedOutput}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Select a problem to view details</p>
        </div>
      )}
    </div>
  );
}
