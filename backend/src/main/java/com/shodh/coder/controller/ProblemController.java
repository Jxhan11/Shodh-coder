package com.shodh.coder.controller;

import com.shodh.coder.dto.ProblemDetailDto;
import com.shodh.coder.entity.Problem;
import com.shodh.coder.entity.TestCase;
import com.shodh.coder.service.ProblemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/problems")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ProblemController {

    @Autowired
    private ProblemService problemService;

    @GetMapping("/{problemId}")
    public ResponseEntity<ProblemDetailDto> getProblem(@PathVariable Long problemId) {
        return problemService.findById(problemId)
                .map(problem -> {
                    List<TestCase> sampleTestCases = problemService.getSampleTestCases(problemId);
                    return ResponseEntity.ok(new ProblemDetailDto(problem, sampleTestCases));
                })
                .orElse(ResponseEntity.notFound().build());
    }
} 