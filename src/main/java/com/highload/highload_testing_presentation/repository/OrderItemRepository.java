package com.highload.highload_testing_presentation.repository;

import com.highload.highload_testing_presentation.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
