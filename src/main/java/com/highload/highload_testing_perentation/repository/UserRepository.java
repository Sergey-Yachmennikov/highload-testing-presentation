package com.highload.highload_testing_perentation.repository;

import com.highload.highload_testing_perentation.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
