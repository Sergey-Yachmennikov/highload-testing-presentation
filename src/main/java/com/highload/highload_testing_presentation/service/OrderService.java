package com.highload.highload_testing_presentation.service;

import com.highload.highload_testing_presentation.entity.Order;
import com.highload.highload_testing_presentation.entity.OrderItem;
import com.highload.highload_testing_presentation.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.CompletableFuture;

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

    // GOOD: async version - does NOT hold a DB connection during sleep
    // The heavy work runs in a separate thread pool, freeing the connection pool
    @Async("asyncExecutor")
    public CompletableFuture<String> asyncOperation() {
        try {
            Thread.sleep(5000); // simulates long computation WITHOUT holding DB connection
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return CompletableFuture.completedFuture("Done after 5 seconds of async processing");
    }
}
