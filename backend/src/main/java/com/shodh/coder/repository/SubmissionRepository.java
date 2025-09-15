package com.shodh.coder.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.shodh.coder.entity.Submission;
import com.shodh.coder.entity.SubmissionStatus;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    
    List<Submission> findByUserIdAndContestId(Long userId, Long contestId);
    
    List<Submission> findByContestId(Long contestId);
    
    List<Submission> findByStatus(SubmissionStatus status);
    
    @Query("SELECT s FROM Submission s WHERE s.user.id = :userId AND s.problem.id = :problemId AND s.status = 'ACCEPTED' ORDER BY s.submittedAt ASC")
    List<Submission> findAcceptedSubmissionsByUserAndProblem(Long userId, Long problemId);
    
    @Query("SELECT s.user.username, " +
           "SUM(CASE WHEN s.status = 'ACCEPTED' THEN s.problem.points ELSE 0 END) as score, " +
           "COUNT(CASE WHEN s.status = 'ACCEPTED' THEN 1 END) as solved, " +
           "MIN(s.submittedAt) as firstSubmission " +
           "FROM Submission s WHERE s.contest.id = :contestId " +
           "GROUP BY s.user.id, s.user.username " +
           "ORDER BY score DESC, firstSubmission ASC")
    List<Object[]> findLeaderboardByContestId(Long contestId);
} 