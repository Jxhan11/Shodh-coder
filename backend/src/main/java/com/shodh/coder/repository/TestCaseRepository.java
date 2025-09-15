package com.shodh.coder.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.shodh.coder.entity.TestCase;

@Repository
public interface TestCaseRepository extends JpaRepository<TestCase, Long> {
    List<TestCase> findByProblemId(Long problemId);
    List<TestCase> findByProblemIdAndIsSample(Long problemId, Boolean isSample);
}