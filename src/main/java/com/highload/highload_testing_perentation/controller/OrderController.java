package com.highload.highload_testing_perentation.controller;

import com.highload.highload_testing_perentation.entity.Order;
import com.highload.highload_testing_perentation.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // BAD: N+1 problem - generates many SQL queries
    @GetMapping("/user/{userId}")
    public List<Order> getOrdersByUserId(@PathVariable Long userId) {
        return orderService.getOrdersByUserIdSlow(userId);
    }

    // GOOD: single optimized query with JOIN FETCH
    @GetMapping("/user/{userId}/optimized")
    public List<Order> getOrdersByUserIdOptimized(@PathVariable Long userId) {
        return orderService.getOrdersByUserIdOptimized(userId);
    }

    // BAD: holds DB connection for 5 seconds - demonstrates connection pool exhaustion
    // With pool size 10, sending 15+ concurrent requests will cause timeouts
    @GetMapping("/blocking")
    public String blockingOperation() {
        return orderService.blockingOperation();
    }
}
