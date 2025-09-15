package com.shodh.coder.dto;

import com.shodh.coder.entity.Contest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class ContestResponseDto {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private boolean isActive;
    private List<ProblemSummaryDto> problems;

    public ContestResponseDto() {}

    public ContestResponseDto(Contest contest) {
        this.id = contest.getId();
        this.name = contest.getName();
        this.description = contest.getDescription();
        this.startTime = contest.getStartTime();
        this.endTime = contest.getEndTime();
        this.isActive = contest.isActive();
        this.problems = contest.getProblems().stream()
                .map(ProblemSummaryDto::new)
                .collect(Collectors.toList());
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    
    public List<ProblemSummaryDto> getProblems() { return problems; }
    public void setProblems(List<ProblemSummaryDto> problems) { this.problems = problems; }
}
