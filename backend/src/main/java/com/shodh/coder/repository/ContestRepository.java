package com.shodh.coder.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.shodh.coder.entity.Contest;

@Repository
public interface ContestRepository extends JpaRepository<Contest, Long> {
    
    @Query("SELECT c FROM Contest c WHERE c.startTime <= :now AND c.endTime >= :now")
    List<Contest> findActiveContests(LocalDateTime now);
    
    @Query("SELECT c FROM Contest c WHERE c.endTime < :now")
    List<Contest> findPastContests(LocalDateTime now);
    
    @Query("SELECT c FROM Contest c WHERE c.startTime > :now")
    List<Contest> findUpcomingContests(LocalDateTime now);
}
