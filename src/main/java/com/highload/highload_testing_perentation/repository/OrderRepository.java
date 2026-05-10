package com.highload.highload_testing_perentation.repository;

import com.highload.highload_testing_perentation.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // N+1 problem: loads orders, then lazily fetches items and products for each
    List<Order> findByUserId(Long userId);

    // Optimized: single query with JOIN FETCH
    @Query("SELECT DISTINCT o FROM Order o " +
           "JOIN FETCH o.user " +
           "JOIN FETCH o.items i " +
           "JOIN FETCH i.product " +
           "WHERE o.user.id = :userId")
    List<Order> findByUserIdOptimized(Long userId);
}
