package com.highload.highload_testing_presentation.repository;

import com.highload.highload_testing_presentation.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
