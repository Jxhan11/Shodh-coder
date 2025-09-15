package com.shodh.coder.dto;

import com.shodh.coder.entity.Problem;
import com.shodh.coder.entity.TestCase;
import java.util.List;
import java.util.stream.Collectors;

public class ProblemDetailDto {
    private Long id;
    private String title;
    private String description;
    private String inputFormat;
    private String outputFormat;
    private String constraints;
    private Integer timeLimit;
    private Integer memoryLimit;
    private Integer points;
    private List<SampleTestCaseDto> sampleTestCases;

    public ProblemDetailDto() {}

    public ProblemDetailDto(Problem problem, List<TestCase> sampleTestCases) {
        this.id = problem.getId();
        this.title = problem.getTitle();
        this.description = problem.getDescription();
        this.inputFormat = problem.getInputFormat();
        this.outputFormat = problem.getOutputFormat();
        this.constraints = problem.getConstraints();
        this.timeLimit = problem.getTimeLimit();
        this.memoryLimit = problem.getMemoryLimit();
        this.points = problem.getPoints();
        this.sampleTestCases = sampleTestCases.stream()
                .map(SampleTestCaseDto::new)
                .collect(Collectors.toList());
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getInputFormat() { return inputFormat; }
    public void setInputFormat(String inputFormat) { this.inputFormat = inputFormat; }
    
    public String getOutputFormat() { return outputFormat; }
    public void setOutputFormat(String outputFormat) { this.outputFormat = outputFormat; }
    
    public String getConstraints() { return constraints; }
    public void setConstraints(String constraints) { this.constraints = constraints; }
    
    public Integer getTimeLimit() { return timeLimit; }
    public void setTimeLimit(Integer timeLimit) { this.timeLimit = timeLimit; }
    
    public Integer getMemoryLimit() { return memoryLimit; }
    public void setMemoryLimit(Integer memoryLimit) { this.memoryLimit = memoryLimit; }
    
    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }
    
    public List<SampleTestCaseDto> getSampleTestCases() { return sampleTestCases; }
    public void setSampleTestCases(List<SampleTestCaseDto> sampleTestCases) { this.sampleTestCases = sampleTestCases; }
}