"use client";

import { useStore } from "@/store/useStore";
import { submissionApi } from "@/services/api";
import { Monaco } from "@monaco-editor/react";
import dynamic from "next/dynamic";
import { Play, Code, Clock } from "lucide-react";
import { useState } from "react";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading editor...</p>
      </div>
    </div>
  ),
});

const languages = [
  { id: "java", name: "Java", extension: "java" },
  { id: "python", name: "Python", extension: "py" },
  { id: "cpp", name: "C++", extension: "cpp" },
];

export default function CodeEditor() {
  const {
    user,
    contest,
    currentProblem,
    selectedLanguage,
    code,
    isSubmitting,
    setSelectedLanguage,
    setCode,
    setIsSubmitting,
    addSubmission,
  } = useStore();

  const [submitError, setSubmitError] = useState("");

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    // Configure editor
    monaco.editor.defineTheme("contest-theme", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#ffffff",
        "editor.lineHighlightBackground": "#f8fafc",
      },
    });
    monaco.editor.setTheme("contest-theme");

    // Set editor options
    editor.updateOptions({
      fontSize: 14,
      lineNumbers: "on",
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 4,
      insertSpaces: true,
    });
  };

  const handleSubmit = async () => {
    if (!user || !contest || !currentProblem || !code.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const submission = await submissionApi.createSubmission({
        userId: user.id,
        problemId: currentProblem.id,
        contestId: contest.id,
        code: code,
        language: selectedLanguage,
      });

      addSubmission(submission);

      // Start polling for submission status
      pollSubmissionStatus(submission.id);
    } catch (error: any) {
      setSubmitError(
        error.response?.data?.message || "Failed to submit code. Please try again."
      );
      console.error("Failed to submit code:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pollSubmissionStatus = async (submissionId: number) => {
    const maxAttempts = 30; // 30 attempts = 30 seconds max
    let attempts = 0;

    const poll = async () => {
      try {
        const submission = await submissionApi.getSubmission(submissionId);
        
        // Update the submission in store
        const { updateSubmission } = useStore.getState();
        updateSubmission(submission);

        // Check if submission is complete
        const isComplete = [
          "ACCEPTED",
          "WRONG_ANSWER",
          "TIME_LIMIT_EXCEEDED",
          "MEMORY_LIMIT_EXCEEDED",
          "RUNTIME_ERROR",
          "COMPILATION_ERROR",
          "SYSTEM_ERROR",
        ].includes(submission.status);

        if (!isComplete && attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 1000); // Poll every 1 second
        }
      } catch (error) {
        console.error("Failed to poll submission status:", error);
      }
    };

    setTimeout(poll, 1000); // Start polling after 1 second
  };

  const getLanguageMode = (language: string) => {
    switch (language) {
      case "java":
        return "java";
      case "python":
        return "python";
      case "cpp":
        return "cpp";
      default:
        return "java";
    }
  };

  const isSubmitDisabled = !user || !contest || !currentProblem || !code.trim() || isSubmitting;

  return (
    <div className="card h-[65%] flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Code className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Code Editor</h3>
          </div>
          {currentProblem && (
            <div className="text-sm text-gray-600 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {currentProblem.timeLimit}s limit
            </div>
          )}
        </div>

        {/* Language Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Language:</label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4">
        <div className="h-full border rounded-lg overflow-hidden">
          <MonacoEditor
            height="100%"
            language={getLanguageMode(selectedLanguage)}
            value={code}
            onChange={(value) => setCode(value || "")}
            onMount={handleEditorDidMount}
            options={{
              readOnly: isSubmitting,
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t p-4">
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-3 text-sm">
            {submitError}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {currentProblem ? (
              <span>Problem: {currentProblem.title}</span>
            ) : (
              <span>Select a problem to start coding</span>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="btn btn-primary flex items-center"
          >
            <Play className="h-4 w-4 mr-2" />
            {isSubmitting ? "Submitting..." : "Submit Code"}
          </button>
        </div>
      </div>
    </div>
  );
}
