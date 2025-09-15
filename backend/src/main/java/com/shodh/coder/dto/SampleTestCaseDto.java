package com.shodh.coder.dto;

import com.shodh.coder.entity.TestCase;

public class SampleTestCaseDto {
    private String input;
    private String expectedOutput;

    public SampleTestCaseDto() {}

    public SampleTestCaseDto(TestCase testCase) {
        this.input = testCase.getInput();
        this.expectedOutput = testCase.getExpectedOutput();
    }

    // Getters and setters
    public String getInput() { return input; }
    public void setInput(String input) { this.input = input; }
    
    public String getExpectedOutput() { return expectedOutput; }
    public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }
} 