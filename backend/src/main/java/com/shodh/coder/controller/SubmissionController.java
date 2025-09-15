package com.shodh.coder.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shodh.coder.dto.SubmissionRequestDto;
import com.shodh.coder.dto.SubmissionResponseDto;
import com.shodh.coder.service.SubmissionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/submissions")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class SubmissionController {

    private static final Logger logger = LoggerFactory.getLogger(SubmissionController.class);

    @Autowired
    private SubmissionService submissionService;

    @PostMapping
    public ResponseEntity<SubmissionResponseDto> createSubmission(@Valid @RequestBody SubmissionRequestDto request) {
        try {
            SubmissionResponseDto response = submissionService.createSubmission(request);
            logger.info("Submission created: {}", response);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.info("Failed to create submission: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{submissionId}")
    public ResponseEntity<SubmissionResponseDto> getSubmission(@PathVariable Long submissionId) {
        return submissionService.getSubmissionById(submissionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<SubmissionResponseDto>> getSubmissions(
            @RequestParam Long userId,
            @RequestParam Long contestId) {
        List<SubmissionResponseDto> submissions = submissionService.getSubmissionsByUser(userId, contestId);
        return ResponseEntity.ok(submissions);
    }
}