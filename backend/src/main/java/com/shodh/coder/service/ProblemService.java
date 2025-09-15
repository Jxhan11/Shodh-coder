package com.shodh.coder.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.shodh.coder.entity.Problem;
import com.shodh.coder.entity.TestCase;
import com.shodh.coder.repository.ProblemRepository;
import com.shodh.coder.repository.TestCaseRepository;

@Service
public class ProblemService {

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private TestCaseRepository testCaseRepository;

    public Optional<Problem> findById(Long problemId) {
        return problemRepository.findById(problemId);
    }

    public Optional<Problem> findByIdWithTestCases(Long problemId) {
        return Optional.ofNullable(problemRepository.findByIdWithTestCases(problemId));
    }

    public List<Problem> findByContestId(Long contestId) {
        return problemRepository.findByContestId(contestId);
    }

    public List<TestCase> getTestCases(Long problemId) {
        return testCaseRepository.findByProblemId(problemId);
    }

    public List<TestCase> getSampleTestCases(Long problemId) {
        return testCaseRepository.findByProblemIdAndIsSample(problemId, true);
    }

    public boolean problemExists(Long problemId) {
        return problemRepository.existsById(problemId);
    }

    public boolean problemBelongsToContest(Long problemId, Long contestId) {
        return problemRepository.findById(problemId)
                .map(problem -> problem.getContest().getId().equals(contestId))
                .orElse(false);
    }
} 