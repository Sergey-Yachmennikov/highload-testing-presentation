package com.highload.highload_testing_perentation.controller;

import com.highload.highload_testing_perentation.entity.Product;
import com.highload.highload_testing_perentation.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // GOOD: paginated, fast even with 50k products
    @GetMapping
    public Page<Product> getProducts(Pageable pageable) {
        return productService.getProducts(pageable);
    }

    // BAD: loads ALL products into memory, serializes huge JSON
    @GetMapping("/slow")
    public List<Product> getAllProductsSlow() {
        return productService.getAllProductsSlow();
    }

    // Search by name - performance depends on index (V3 migration)
    @GetMapping("/search")
    public List<Product> searchByName(@RequestParam String name) {
        return productService.searchByName(name);
    }

    // Without cache - always hits DB
    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    // With cache - first call hits DB, subsequent calls served from cache
    @GetMapping("/{id}/cached")
    public Product getProductByIdCached(@PathVariable Long id) {
        return productService.getProductByIdCached(id);
    }

    // By category, paginated
    @GetMapping("/category/{category}")
    public Page<Product> getProductsByCategory(@PathVariable String category, Pageable pageable) {
        return productService.getProductsByCategory(category, pageable);
    }
}
