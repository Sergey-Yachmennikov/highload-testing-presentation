package com.highload.highload_testing_perentation.service;

import com.highload.highload_testing_perentation.entity.Order;
import com.highload.highload_testing_perentation.entity.OrderItem;
import com.highload.highload_testing_perentation.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    // BAD: N+1 problem - fetches orders, then lazily loads items and products
    @Transactional(readOnly = true)
    public List<Order> getOrdersByUserIdSlow(Long userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        // Force lazy loading to trigger N+1
        for (Order order : orders) {
            order.getUser().getUsername(); // triggers lazy load for user
            for (OrderItem item : order.getItems()) {
                item.getProduct().getName(); // triggers lazy load for each product
            }
        }
        return orders;
    }

    // GOOD: single query with JOIN FETCH
    @Transactional(readOnly = true)
    public List<Order> getOrdersByUserIdOptimized(Long userId) {
        return orderRepository.findByUserIdOptimized(userId);
    }

    // BAD: simulates connection pool exhaustion by holding a connection with sleep
    @Transactional
    public String blockingOperation() {
        try {
            Thread.sleep(5000); // holds DB connection for 5 seconds
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return "Done after 5 seconds of blocking";
    }
}
