package com.highload.highload_testing_perentation.repository;

import com.highload.highload_testing_perentation.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
