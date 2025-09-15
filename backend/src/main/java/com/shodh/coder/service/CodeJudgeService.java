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
    
    @Value("${code.execution.timeout:5}")
    private int executionTimeoutSeconds;
    
    @Value("${app.docker.memory-limit:128m}")
    private String memoryLimit;
    
    @Value("${app.docker.image-name:shodh-code-runner}")
    private String dockerImageName;
    
    public ExecutionResult executeCode(Submission submission, List<TestCase> testCases) {
        logger.info("Starting code execution for submission ID: {}", submission.getId());
        logger.info("Execution timeout: {}", executionTimeoutSeconds);
        logger.info("Memory limit: {}", memoryLimit);
        logger.info("Docker image name: {}", dockerImageName);
        
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
            boolean finished = process.waitFor(executionTimeoutSeconds, TimeUnit.SECONDS);
            
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
        Process process = null;
        try {
            // First write the test input to a file
            Files.write(tempDir.resolve("input.txt"), testCase.getInput().getBytes());
            
            // Debug: Log what we wrote to input.txt
            logger.info("Test case input: '{}'", testCase.getInput());
            logger.info("Input file created at: {}", tempDir.resolve("input.txt"));
            
            // Verify the file was created
            if (Files.exists(tempDir.resolve("input.txt"))) {
                String fileContent = new String(Files.readAllBytes(tempDir.resolve("input.txt")));
                logger.info("Input file content: '{}'", fileContent);
            } else {
                logger.error("Input file was not created!");
            }

            // Prepare docker command with proper resource limits
            List<String> command = new ArrayList<>();
            command.add("docker");
            command.add("run");
            command.add("--rm");
            command.add("--memory=" + memoryLimit);
            command.add("--cpus=0.5");
            command.add("--ulimit");
            command.add("nproc=16:32");
            command.add("-v");
            command.add(tempDir.toString() + ":/workspace");
            command.add("-w");
            command.add("/workspace");
            command.add(dockerImageName);
            
            // Add language specific command with timeout and input redirection
            switch (submission.getLanguage().toLowerCase()) {
                case "java":
                    command.add("sh");
                    command.add("-c");
                    command.add("timeout " + executionTimeoutSeconds + "s java Solution < input.txt");
                    break;
                case "python":
                    command.add("sh");
                    command.add("-c");
                    command.add("timeout " + executionTimeoutSeconds + "s python3 solution.py < input.txt");
                    break;
                case "cpp":
                    command.add("sh");
                    command.add("-c");
                    command.add("timeout " + executionTimeoutSeconds + "s ./solution < input.txt");
                    break;
            }

            // Debug: Log the full command
            logger.info("Docker command: {}", String.join(" ", command));

            ProcessBuilder pb = new ProcessBuilder(command);
            // Remove this line since we're doing input redirection inside the container
            // pb.redirectInput(tempDir.resolve("input.txt").toFile());
            pb.redirectErrorStream(true);
            
            // Start the process
            long startTime = System.currentTimeMillis();
            process = pb.start();
            
            // Wait for completion with timeout
            boolean completed = process.waitFor(executionTimeoutSeconds + 2, TimeUnit.SECONDS);
            long executionTime = System.currentTimeMillis() - startTime;
            
            if (!completed) {
                killProcessAndContainer(process);
                return new TestCaseResult(false, SubmissionStatus.TIME_LIMIT_EXCEEDED, 
                    "Time Limit Exceeded", executionTime, "Program exceeded time limit of " + executionTimeoutSeconds + " seconds");
            }

            int exitCode = process.exitValue();
            String output = readProcessOutput(process);
            
            // Debug: Log the output and exit code
            logger.info("Process exit code: {}", exitCode);
            logger.info("Process output: '{}'", output);
            
            // Handle timeout exit code (124 from timeout command)
            if (exitCode == 124) {
                return new TestCaseResult(false, SubmissionStatus.TIME_LIMIT_EXCEEDED,
                    "Time Limit Exceeded", executionTime, "Program exceeded time limit of " + executionTimeoutSeconds + " seconds");
            }
            
            if (exitCode != 0) {
                return new TestCaseResult(false, SubmissionStatus.RUNTIME_ERROR,
                    "Runtime Error", executionTime, output);
            }
            
            // Compare output
            boolean matched = output.trim().equals(testCase.getExpectedOutput().trim());
            return new TestCaseResult(matched, matched ? SubmissionStatus.ACCEPTED : SubmissionStatus.WRONG_ANSWER,
                matched ? "Accepted" : "Wrong Answer", executionTime, output);
            
        } catch (Exception e) {
            logger.error("Error running test case", e);
            return new TestCaseResult(false, SubmissionStatus.SYSTEM_ERROR,
                "System Error: " + e.getMessage(), 0, e.getMessage());
        } finally {
            if (process != null) {
                process.destroyForcibly();
            }
        }
    }

    private void killProcessAndContainer(Process process) {
        try {
            // Kill the process tree
            process.destroyForcibly();
            
            // Find and kill any running containers
            ProcessBuilder pb = new ProcessBuilder(
                "docker", "ps", "-q", "--filter", "ancestor=" + dockerImageName
            );
            Process listProcess = pb.start();
            String containerId = new String(listProcess.getInputStream().readAllBytes()).trim();
            
            if (!containerId.isEmpty()) {
                new ProcessBuilder("docker", "rm", "-f", containerId)
                    .start()
                    .waitFor(5, TimeUnit.SECONDS);
            }
        } catch (Exception e) {
            logger.error("Error killing process/container", e);
        }
    }

    private String readProcessOutput(Process process) throws IOException {
        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }
        return output.toString();
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

        // Add this constructor
        public TestCaseResult(boolean passed, SubmissionStatus status, String errorMessage, long executionTime, String consoleOutput) {
            this.passed = passed;
            this.status = status;
            this.errorMessage = errorMessage;
            this.executionTime = executionTime;
            this.consoleOutput = consoleOutput;
        }
        
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