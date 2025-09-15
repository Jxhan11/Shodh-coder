package com.shodh.coder.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shodh.coder.dto.SubmissionRequestDto;
import com.shodh.coder.dto.SubmissionResponseDto;
import com.shodh.coder.entity.Problem;
import com.shodh.coder.entity.Submission;
import com.shodh.coder.entity.SubmissionStatus;
import com.shodh.coder.entity.TestCase;
import com.shodh.coder.entity.User;
import com.shodh.coder.repository.SubmissionRepository;

@Service
public class SubmissionService {

    private static final Logger logger = LoggerFactory.getLogger(SubmissionService.class);

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private ProblemService problemService;

    @Autowired
    private ContestService contestService;

    @Autowired
    private CodeJudgeService codeJudgeService;

    @Transactional
    public SubmissionResponseDto createSubmission(SubmissionRequestDto request) {
        // Validate entities exist
        User user = userService.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Problem problem = problemService.findById(request.getProblemId())
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        if (!contestService.contestExists(request.getContestId())) {
            throw new RuntimeException("Contest not found");
        }

        if (!problemService.problemBelongsToContest(request.getProblemId(), request.getContestId())) {
            throw new RuntimeException("Problem does not belong to the specified contest");
        }

        // Check if contest is active
        if (!contestService.isContestActive(request.getContestId())) {
            // throw new RuntimeException("Contest is not active");
        }

        // Create submission entity
        Submission submission = new Submission();
        submission.setUser(user);
        submission.setProblem(problem);
        submission.setContest(problem.getContest());
        submission.setCode(request.getCode());
        submission.setLanguage(request.getLanguage());
        submission.setStatus(SubmissionStatus.PENDING);

        // Save submission
        submission = submissionRepository.save(submission);

        // Process submission asynchronously
        processSubmissionAsync(submission.getId());

        return new SubmissionResponseDto(submission);
    }

    public Optional<SubmissionResponseDto> getSubmissionById(Long submissionId) {
        return submissionRepository.findById(submissionId)
                .map(SubmissionResponseDto::new);
    }

    public List<SubmissionResponseDto> getSubmissionsByUser(Long userId, Long contestId) {
        return submissionRepository.findByUserIdAndContestId(userId, contestId)
                .stream()
                .map(SubmissionResponseDto::new)
                .toList();
    }

    @Async
    @Transactional
    public CompletableFuture<Void> processSubmissionAsync(Long submissionId) {
        logger.info("Starting async processing for submission ID: {}", submissionId);

        try {
            Optional<Submission> submissionOpt = submissionRepository.findById(submissionId);
            if (submissionOpt.isEmpty()) {
                logger.error("Submission not found: {}", submissionId);
                return CompletableFuture.completedFuture(null);
            }

            Submission submission = submissionOpt.get();
            
            // Update status to RUNNING
            submission.setStatus(SubmissionStatus.RUNNING);
            submissionRepository.save(submission);

            // Get test cases
            List<TestCase> testCases = problemService.getTestCases(submission.getProblem().getId());
            if (testCases.isEmpty()) {
                logger.warn("No test cases found for problem ID: {}", submission.getProblem().getId());
                submission.setStatus(SubmissionStatus.SYSTEM_ERROR);
                submission.setResult("No test cases available");
                submission.setCompletedAt(LocalDateTime.now());
                submissionRepository.save(submission);
                return CompletableFuture.completedFuture(null);
            }

            // Execute code
            CodeJudgeService.ExecutionResult result = codeJudgeService.executeCode(submission, testCases);
            logger.info("Execution result: {}", result.getStatus());
            // Update submission with results
            submission.setStatus(result.getStatus());
            submission.setTestCasesPassed(result.getTestCasesPassed());
            submission.setTotalTestCases(result.getTotalTestCases());
            submission.setExecutionTime(result.getExecutionTime());
            submission.setCompletedAt(LocalDateTime.now());

            if (result.getErrorMessage() != null) {
                submission.setResult(result.getErrorMessage());
            } else {
                submission.setResult(String.format("Passed %d/%d test cases", 
                    result.getTestCasesPassed(), result.getTotalTestCases()));
            }

            submissionRepository.save(submission);

            logger.info("Completed processing submission ID: {} with status: {}", 
                submissionId, result.getStatus());

        } catch (Exception e) {
            logger.error("Error processing submission {}: {}", submissionId, e.getMessage(), e);
            
            // Update submission with error status
            submissionRepository.findById(submissionId).ifPresent(submission -> {
                submission.setStatus(SubmissionStatus.SYSTEM_ERROR);
                submission.setResult("System error during processing");
                submission.setCompletedAt(LocalDateTime.now());
                submissionRepository.save(submission);
            });
        }

        return CompletableFuture.completedFuture(null);
    }
} 