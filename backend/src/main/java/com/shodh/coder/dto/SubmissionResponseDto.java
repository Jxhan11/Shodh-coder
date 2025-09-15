package com.shodh.coder.dto;

import java.time.LocalDateTime;

import com.shodh.coder.entity.Submission;
import com.shodh.coder.entity.SubmissionStatus;

public class SubmissionResponseDto {
    private Long id;
    private SubmissionStatus status;
    private String result;
    private Long executionTime;
    private Long memoryUsed;
    private Integer testCasesPassed;
    private Integer totalTestCases;
    private LocalDateTime submittedAt;
    private LocalDateTime completedAt;
    private String username;
    private String problemTitle;

    public SubmissionResponseDto() {}

    public SubmissionResponseDto(Submission submission) {
        this.id = submission.getId();
        this.status = submission.getStatus();
        this.result = submission.getResult();
        this.executionTime = submission.getExecutionTime();
        this.memoryUsed = submission.getMemoryUsed();
        this.testCasesPassed = submission.getTestCasesPassed();
        this.totalTestCases = submission.getTotalTestCases();
        this.submittedAt = submission.getSubmittedAt();
        this.completedAt = submission.getCompletedAt();
        this.username = submission.getUser().getUsername();
        this.problemTitle = submission.getProblem().getTitle();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public SubmissionStatus getStatus() { return status; }
    public void setStatus(SubmissionStatus status) { this.status = status; }
    
    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }
    
    public Long getExecutionTime() { return executionTime; }
    public void setExecutionTime(Long executionTime) { this.executionTime = executionTime; }
    
    public Long getMemoryUsed() { return memoryUsed; }
    public void setMemoryUsed(Long memoryUsed) { this.memoryUsed = memoryUsed; }
    
    public Integer getTestCasesPassed() { return testCasesPassed; }
    public void setTestCasesPassed(Integer testCasesPassed) { this.testCasesPassed = testCasesPassed; }
    
    public Integer getTotalTestCases() { return totalTestCases; }
    public void setTotalTestCases(Integer totalTestCases) { this.totalTestCases = totalTestCases; }
    
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getProblemTitle() { return problemTitle; }
    public void setProblemTitle(String problemTitle) { this.problemTitle = problemTitle; }
}