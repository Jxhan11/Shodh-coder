package com.shodh.coder.dto;

public class LeaderboardEntryDto {
    private String username;
    private Long score;
    private Integer problemsSolved;
    private Integer rank;

    public LeaderboardEntryDto() {}

    public LeaderboardEntryDto(String username, Long score, Integer problemsSolved) {
        this.username = username;
        this.score = score;
        this.problemsSolved = problemsSolved;
    }

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public Long getScore() { return score; }
    public void setScore(Long score) { this.score = score; }
    
    public Integer getProblemsSolved() { return problemsSolved; }
    public void setProblemsSolved(Integer problemsSolved) { this.problemsSolved = problemsSolved; }
    
    public Integer getRank() { return rank; }
    public void setRank(Integer rank) { this.rank = rank; }
} 