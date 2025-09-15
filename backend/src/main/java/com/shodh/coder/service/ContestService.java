package com.shodh.coder.service;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.shodh.coder.dto.ContestResponseDto;
import com.shodh.coder.dto.LeaderboardEntryDto;
import com.shodh.coder.entity.Contest;
import com.shodh.coder.repository.ContestRepository;
import com.shodh.coder.repository.SubmissionRepository;

@Service
public class ContestService {

    @Autowired
    private ContestRepository contestRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    public Optional<ContestResponseDto> getContestById(Long contestId) {
        return contestRepository.findById(contestId)
                .map(ContestResponseDto::new);
    }

    public List<ContestResponseDto> getAllContests() {
        return contestRepository.findAll().stream()
                .map(ContestResponseDto::new)
                .collect(Collectors.toList());
    }

    public List<LeaderboardEntryDto> getLeaderboard(Long contestId) {
        List<Object[]> leaderboardData = submissionRepository.findLeaderboardByContestId(contestId);
        
        AtomicInteger rank = new AtomicInteger(1);
        return leaderboardData.stream()
                .map(row -> {
                    String username = (String) row[0];
                    // Fix: Handle both Long and BigInteger types from different databases
                    Long score = convertToLong(row[1]);
                    Integer solved = convertToInteger(row[2]);
                    // row[3] is firstSubmission - we don't need it in the DTO but it's used for ordering
                    
                    LeaderboardEntryDto entry = new LeaderboardEntryDto(username, score, solved);
                    entry.setRank(rank.getAndIncrement());
                    return entry;
                })
                .collect(Collectors.toList());
    }

    // Helper method to safely convert numeric types
    private Long convertToLong(Object value) {
        if (value == null) return 0L;
        if (value instanceof Long aLong) return aLong;
        if (value instanceof Integer integer) return integer.longValue();
        if (value instanceof java.math.BigInteger bigInteger) return bigInteger.longValue();
        if (value instanceof java.math.BigDecimal bigDecimal) return bigDecimal.longValue();
        return Long.valueOf(value.toString());
    }

    // Helper method to safely convert to Integer
    private Integer convertToInteger(Object value) {
        if (value == null) return 0;
        if (value instanceof Integer integer) return integer;
        if (value instanceof Long aLong) return aLong.intValue();
        if (value instanceof java.math.BigInteger bigInteger) return bigInteger.intValue();
        if (value instanceof java.math.BigDecimal bigDecimal) return bigDecimal.intValue();
        return Integer.valueOf(value.toString());
    }

    public boolean contestExists(Long contestId) {
        return contestRepository.existsById(contestId);
    }

    public boolean isContestActive(Long contestId) {
        return contestRepository.findById(contestId)
                .map(Contest::isActive)
                .orElse(false);
    }
} 