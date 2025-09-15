package com.shodh.coder.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shodh.coder.dto.ContestResponseDto;
import com.shodh.coder.dto.LeaderboardEntryDto;
import com.shodh.coder.service.ContestService;

@RestController
@RequestMapping("/api/contests")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ContestController {

    @Autowired
    private ContestService contestService;

    @GetMapping("/{contestId}")
    public ResponseEntity<ContestResponseDto> getContest(@PathVariable Long contestId) {
        return contestService.getContestById(contestId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<ContestResponseDto>> getAllContests() {
        List<ContestResponseDto> contests = contestService.getAllContests();
        return ResponseEntity.ok(contests);
    }

    @GetMapping("/{contestId}/leaderboard")
    public ResponseEntity<List<LeaderboardEntryDto>> getLeaderboard(@PathVariable Long contestId) {
        if (!contestService.contestExists(contestId)) {
            return ResponseEntity.notFound().build();
        }

        List<LeaderboardEntryDto> leaderboard = contestService.getLeaderboard(contestId);
        return ResponseEntity.ok(leaderboard);
    }
}
