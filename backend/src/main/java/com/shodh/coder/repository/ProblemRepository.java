package com.shodh.coder.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.shodh.coder.entity.Problem;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {
    
    List<Problem> findByContestId(Long contestId);
    
    @Query("SELECT p FROM Problem p JOIN FETCH p.testCases WHERE p.id = :problemId")
    Problem findByIdWithTestCases(Long problemId);
}