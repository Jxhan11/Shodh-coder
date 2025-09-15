package com.shodh.coder.service;

import java.time.LocalDateTime;
import java.util.Arrays;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shodh.coder.entity.Contest;
import com.shodh.coder.entity.Problem;
import com.shodh.coder.entity.TestCase;
import com.shodh.coder.entity.User;
import com.shodh.coder.repository.ContestRepository;
import com.shodh.coder.repository.ProblemRepository;
import com.shodh.coder.repository.TestCaseRepository;
import com.shodh.coder.repository.UserRepository;

@Service
public class DataInitializationService implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializationService.class);

    @Autowired
    private ContestRepository contestRepository;

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private TestCaseRepository testCaseRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (contestRepository.count() == 0) {
            logger.info("Initializing sample data...");
            initializeSampleData();
            logger.info("Sample data initialized successfully!");
        } else {
            logger.info("Sample data already exists, skipping initialization.");
        }
    }

    private void initializeSampleData() {
        // Create a sample contest
        Contest contest = new Contest();
        contest.setName("Sample Programming Contest");
        contest.setDescription("A sample contest to test the platform with basic programming problems.");
        contest.setStartTime(LocalDateTime.now().minusHours(1)); // Started 1 hour ago
        contest.setEndTime(LocalDateTime.now().plusHours(20)); // Ends in 2 hours
        contest = contestRepository.save(contest);

        // Create sample users
        User user1 = new User("alice");
        User user2 = new User("bob");
        User user3 = new User("charlie");
        userRepository.saveAll(Arrays.asList(user1, user2, user3));

        // Create Problem 1: Two Sum
        Problem problem1 = createTwoSumProblem(contest);
        problemRepository.save(problem1);

        // Create Problem 2: Factorial
        Problem problem2 = createFactorialProblem(contest);
        problemRepository.save(problem2);

        logger.info("Created contest: {} with {} problems", contest.getName(), contest.getProblems().size());
    }

    private Problem createTwoSumProblem(Contest contest) {
        Problem problem = new Problem();
        problem.setTitle("Two Sum");
        problem.setDescription(
            "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\n" +
            "You may assume that each input would have exactly one solution, and you may not use the same element twice.\n\n" +
            "You can return the answer in any order.\n\n" +
            "Example:\n" +
            "Input: nums = [2,7,11,15], target = 9\n" +
            "Output: [0,1]\n" +
            "Explanation: Because nums[0] + nums[1] == 9, we return [0, 1]."
        );
        problem.setInputFormat(
            "First line contains two integers n and target.\n" +
            "Second line contains n space-separated integers representing the array."
        );
        problem.setOutputFormat("Two space-separated integers representing the indices.");
        problem.setConstraints("2 <= n <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9");
        problem.setTimeLimit(2); // 2 seconds
        problem.setMemoryLimit(256); // 256 MB
        problem.setPoints(100);
        problem.setContest(contest);

        // Add test cases
        TestCase testCase1 = new TestCase();
        testCase1.setInput("4 9\n2 7 11 15");
        testCase1.setExpectedOutput("0 1");
        testCase1.setIsSample(true);
        testCase1.setProblem(problem);

        TestCase testCase2 = new TestCase();
        testCase2.setInput("3 6\n3 2 4");
        testCase2.setExpectedOutput("1 2");
        testCase2.setIsSample(false);
        testCase2.setProblem(problem);

        TestCase testCase3 = new TestCase();
        testCase3.setInput("2 6\n3 3");
        testCase3.setExpectedOutput("0 1");
        testCase3.setIsSample(false);
        testCase3.setProblem(problem);

        problem.setTestCases(Arrays.asList(testCase1, testCase2, testCase3));
        return problem;
    }

    private Problem createFactorialProblem(Contest contest) {
        Problem problem = new Problem();
        problem.setTitle("Factorial");
        problem.setDescription(
            "Calculate the factorial of a given non-negative integer n.\n\n" +
            "The factorial of n (denoted as n!) is the product of all positive integers less than or equal to n.\n\n" +
            "For example:\n" +
            "5! = 5 × 4 × 3 × 2 × 1 = 120\n" +
            "0! = 1 (by definition)\n\n" +
            "Example:\n" +
            "Input: 5\n" +
            "Output: 120"
        );
        problem.setInputFormat("A single integer n (0 <= n <= 20)");
        problem.setOutputFormat("The factorial of n");
        problem.setConstraints("0 <= n <= 20");
        problem.setTimeLimit(1); // 1 second
        problem.setMemoryLimit(128); // 128 MB
        problem.setPoints(50);
        problem.setContest(contest);

        // Add test cases
        TestCase testCase1 = new TestCase();
        testCase1.setInput("5");
        testCase1.setExpectedOutput("120");
        testCase1.setIsSample(true);
        testCase1.setProblem(problem);

        TestCase testCase2 = new TestCase();
        testCase2.setInput("0");
        testCase2.setExpectedOutput("1");
        testCase2.setIsSample(false);
        testCase2.setProblem(problem);

        TestCase testCase3 = new TestCase();
        testCase3.setInput("7");
        testCase3.setExpectedOutput("5040");
        testCase3.setIsSample(false);
        testCase3.setProblem(problem);

        TestCase testCase4 = new TestCase();
        testCase4.setInput("10");
        testCase4.setExpectedOutput("3628800");
        testCase4.setIsSample(false);
        testCase4.setProblem(problem);

        problem.setTestCases(Arrays.asList(testCase1, testCase2, testCase3, testCase4));
        return problem;
    }
} 