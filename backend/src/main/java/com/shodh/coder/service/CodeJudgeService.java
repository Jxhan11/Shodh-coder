package com.shodh.coder.service;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.shodh.coder.entity.Submission;
import com.shodh.coder.entity.SubmissionStatus;
import com.shodh.coder.entity.TestCase;

@Service
public class CodeJudgeService {
    
    private static final Logger logger = LoggerFactory.getLogger(CodeJudgeService.class);
    
    @Value("${app.docker.timeout:30}")
    private int dockerTimeoutSeconds;
    
    @Value("${app.docker.memory-limit:128m}")
    private String memoryLimit;
    
    @Value("${app.docker.image-name:shodh-code-runner}")
    private String dockerImageName;
    
    public ExecutionResult executeCode(Submission submission, List<TestCase> testCases) {
        logger.info("Starting code execution for submission ID: {}", submission.getId());
        
        ExecutionResult result = new ExecutionResult();
        result.setStatus(SubmissionStatus.RUNNING);
        
        try {
            // Create temporary directory for this submission
            Path tempDir = createTempDirectory(submission.getId());
            
            // Write code to file
            Path codeFile = writeCodeToFile(tempDir, submission.getCode(), submission.getLanguage());
            logger.info("Code file written: {}", codeFile);
            
            // Compile if necessary
            if ("java".equalsIgnoreCase(submission.getLanguage())) {
                boolean compiled = compileJavaCode(tempDir, codeFile);
                if (!compiled) {
                    result.setStatus(SubmissionStatus.COMPILATION_ERROR);
                    result.setErrorMessage("Compilation failed");
                    logger.info("Compilation failed: {}", result.getErrorMessage());
                    return result;
                }
            }
            
            // Run test cases
            int passedTests = 0;
            long totalExecutionTime = 0;
            StringBuilder allConsoleOutput = new StringBuilder();
            
            for (TestCase testCase : testCases) {
                TestCaseResult testResult = runSingleTestCase(tempDir, submission, testCase);
                
                // Collect console output from each test case
                if (testResult.getConsoleOutput() != null && !testResult.getConsoleOutput().trim().isEmpty()) {
                    if (allConsoleOutput.length() > 0) {
                        allConsoleOutput.append("\n--- Test Case ").append(passedTests + 1).append(" ---\n");
                    }
                    allConsoleOutput.append(testResult.getConsoleOutput());
                }
                
                if (testResult.isPassed()) {
                    passedTests++;
                }
                
                totalExecutionTime += testResult.getExecutionTime();
                
                // If any test case fails, we can stop early for some verdicts
                if (!testResult.isPassed() && testResult.getStatus() != SubmissionStatus.WRONG_ANSWER) {
                    result.setStatus(testResult.getStatus());
                    result.setErrorMessage(testResult.getErrorMessage());
                    logger.info("Test case failed: {}", testResult.getErrorMessage());
                    break;
                }
            }
            
            // Determine final status
            if (result.getStatus() == SubmissionStatus.RUNNING) {
                if (passedTests == testCases.size()) {
                    result.setStatus(SubmissionStatus.ACCEPTED);
                } else {
                    result.setStatus(SubmissionStatus.WRONG_ANSWER);
                }
            }
            
            result.setTestCasesPassed(passedTests);
            result.setTotalTestCases(testCases.size());
            result.setExecutionTime(totalExecutionTime);
            
            // Set console output
            System.out.println("DEBUG: Final console output length: " + allConsoleOutput.length());
            System.out.println("DEBUG: Final console output content: '" + allConsoleOutput.toString() + "'");
            result.setConsoleOutput(allConsoleOutput.toString());

            // Cleanup
            cleanupTempDirectory(tempDir);
            
        } catch (Exception e) {
            logger.error("Error executing code for submission {}: {}", submission.getId(), e.getMessage());
            result.setStatus(SubmissionStatus.SYSTEM_ERROR);
            result.setErrorMessage("System error during execution");
        }
        
        return result;
    }
    
    private Path createTempDirectory(Long submissionId) throws IOException {
        String tempDirName = "submission_" + submissionId + "_" + System.currentTimeMillis();
        Path tempDir = Paths.get(System.getProperty("java.io.tmpdir"), tempDirName);
        Files.createDirectories(tempDir);
        return tempDir;
    }
    
    private Path writeCodeToFile(Path tempDir, String code, String language) throws IOException {
        String fileName = getFileName(language);
        Path codeFile = tempDir.resolve(fileName);
        Files.write(codeFile, code.getBytes());
        return codeFile;
    }
    
    private String getFileName(String language) {
        switch (language.toLowerCase()) {
            case "java":
                return "Solution.java";
            case "python":
                return "solution.py";
            case "cpp":
                return "solution.cpp";
            default:
                return "solution.txt";
        }
    }
    
    private boolean compileJavaCode(Path tempDir, Path codeFile) {
        try {
            ProcessBuilder pb = new ProcessBuilder();
            pb.command("docker", "run", "--rm",
                    "-v", tempDir.toString() + ":/workspace",
                    "-w", "/workspace",
                    "--memory=" + memoryLimit,
                    dockerImageName,
                    "javac", "Solution.java");
            
            Process process = pb.start();
            boolean finished = process.waitFor(dockerTimeoutSeconds, TimeUnit.SECONDS);
            
            if (!finished) {
                process.destroyForcibly();
                return false;
            }
            
            return process.exitValue() == 0;
            
        } catch (Exception e) {
            logger.error("Compilation error: {}", e.getMessage());
            return false;
        }
    }
    
    private TestCaseResult runSingleTestCase(Path tempDir, Submission submission, TestCase testCase) {
        TestCaseResult result = new TestCaseResult();
        
        try {
            // Write input to file
            Path inputFile = tempDir.resolve("input.txt");
            Files.write(inputFile, testCase.getInput().getBytes());
            
            // Prepare command based on language
            List<String> command = new ArrayList<>();
            command.add("docker");
            command.add("run");
            command.add("--rm");
            command.add("-v");
            command.add(tempDir.toString() + ":/workspace");
            command.add("-w");
            command.add("/workspace");
            command.add("--memory=" + memoryLimit);
            command.add("--cpus=0.5");
            command.add(dockerImageName);
            
            // Add language-specific execution command
            addLanguageCommand(command, submission.getLanguage());
            
            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectErrorStream(true); // Merge stderr with stdout for error capturing
            
            long startTime = System.currentTimeMillis();
            Process process = pb.start();
            
            // Capture any error output from stderr/stdout (like compilation errors, runtime errors)
            StringBuilder errorOutputBuilder = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    errorOutputBuilder.append(line).append("\n");
                }
            }
            
            boolean finished = process.waitFor(submission.getProblem().getTimeLimit(), TimeUnit.SECONDS);
            long executionTime = System.currentTimeMillis() - startTime;
            
            if (!finished) {
                process.destroyForcibly();
                result.setStatus(SubmissionStatus.TIME_LIMIT_EXCEEDED);
                result.setPassed(false);
                result.setConsoleOutput("Time limit exceeded");
                return result;
            }
            
            String errorOutput = errorOutputBuilder.toString().trim();
            
            if (process.exitValue() != 0) {
                result.setStatus(SubmissionStatus.RUNTIME_ERROR);
                result.setPassed(false);
                result.setErrorMessage("Runtime error");
                result.setConsoleOutput(errorOutput.isEmpty() ? "Runtime error occurred" : errorOutput);
                return result;
            }
            
            // Read the program output from output.txt file
            Path outputFile = tempDir.resolve("output.txt");
            String programOutput = "";
            if (Files.exists(outputFile)) {
                programOutput = Files.readString(outputFile).trim();
            }
            
            // Set the program output as console output
            result.setConsoleOutput(programOutput);
            
            // Compare with expected output
            String expectedOutput = testCase.getExpectedOutput().trim();
            boolean passed = programOutput.equals(expectedOutput);
            
            result.setPassed(passed);
            result.setStatus(passed ? SubmissionStatus.ACCEPTED : SubmissionStatus.WRONG_ANSWER);
            result.setExecutionTime(executionTime);
            
        } catch (Exception e) {
            logger.error("Error running test case: {}", e.getMessage());
            result.setStatus(SubmissionStatus.SYSTEM_ERROR);
            result.setPassed(false);
            result.setErrorMessage("System error: " + e.getMessage());
            result.setConsoleOutput("System error occurred");
        }
        
        return result;
    }
    
    private void addLanguageCommand(List<String> command, String language) {
        switch (language.toLowerCase()) {
            case "java":
                command.add("sh");
                command.add("-c");
                command.add("java Solution < input.txt > output.txt");
                break;
            case "python":
                command.add("sh");
                command.add("-c");
                command.add("python3 solution.py < input.txt > output.txt");
                break;
            case "cpp":
                command.add("sh");
                command.add("-c");
                command.add("g++ -o solution solution.cpp && ./solution < input.txt > output.txt");
                break;
        }
    }
    
    private void cleanupTempDirectory(Path tempDir) {
        try {
            Files.walk(tempDir)
                    .map(Path::toFile)
                    .forEach(File::delete);
            Files.deleteIfExists(tempDir);
        } catch (Exception e) {
            logger.warn("Failed to cleanup temp directory: {}", e.getMessage());
        }
    }
    
    // Inner classes for results
    public static class ExecutionResult {
        private SubmissionStatus status;
        private String errorMessage;
        private int testCasesPassed;
        private int totalTestCases;
        private long executionTime;
        private String consoleOutput;
        private String compilationError;
        
        // Getters and setters
        public SubmissionStatus getStatus() { return status; }
        public void setStatus(SubmissionStatus status) { this.status = status; }
        
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
        
        public int getTestCasesPassed() { return testCasesPassed; }
        public void setTestCasesPassed(int testCasesPassed) { this.testCasesPassed = testCasesPassed; }
        
        public int getTotalTestCases() { return totalTestCases; }
        public void setTotalTestCases(int totalTestCases) { this.totalTestCases = totalTestCases; }
        
        public long getExecutionTime() { return executionTime; }
        public void setExecutionTime(long executionTime) { this.executionTime = executionTime; }

        // New getters and setters
        public String getConsoleOutput() { return consoleOutput; }
        public void setConsoleOutput(String consoleOutput) { this.consoleOutput = consoleOutput; }

        public String getCompilationError() { return compilationError; }
        public void setCompilationError(String compilationError) { this.compilationError = compilationError; }
    }
    
    public static class TestCaseResult {
        private boolean passed;
        private SubmissionStatus status;
        private String errorMessage;
        private long executionTime;
        private String consoleOutput;
        
        // Getters and setters
        public boolean isPassed() { return passed; }
        public void setPassed(boolean passed) { this.passed = passed; }
        
        public SubmissionStatus getStatus() { return status; }
        public void setStatus(SubmissionStatus status) { this.status = status; }
        
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
        
        public long getExecutionTime() { return executionTime; }
        public void setExecutionTime(long executionTime) { this.executionTime = executionTime; }
        
        public String getConsoleOutput() { return consoleOutput; }
        public void setConsoleOutput(String consoleOutput) { this.consoleOutput = consoleOutput; }
    }
} 