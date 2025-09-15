package com.shodh.coder.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.shodh.coder.entity.User;
import com.shodh.coder.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public User createUser(String username) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists: " + username);
        }
        
        User user = new User(username);
        return userRepository.save(user);
    }

    public User findOrCreateUser(String username) {
        return userRepository.findByUsername(username)
                .orElseGet(() -> createUser(username));
    }

    public boolean userExists(Long userId) {
        return userRepository.existsById(userId);
    }
} 