package com.shodh.coder.dto;

import com.shodh.coder.entity.Problem;

public class ProblemSummaryDto {
    private Long id;
    private String title;
    private Integer points;
    private Integer timeLimit;
    private Integer memoryLimit;

    public ProblemSummaryDto() {}

    public ProblemSummaryDto(Problem problem) {
        this.id = problem.getId();
        this.title = problem.getTitle();
        this.points = problem.getPoints();
        this.timeLimit = problem.getTimeLimit();
        this.memoryLimit = problem.getMemoryLimit();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }
    
    public Integer getTimeLimit() { return timeLimit; }
    public void setTimeLimit(Integer timeLimit) { this.timeLimit = timeLimit; }
    
    public Integer getMemoryLimit() { return memoryLimit; }
    public void setMemoryLimit(Integer memoryLimit) { this.memoryLimit = memoryLimit; }
}
