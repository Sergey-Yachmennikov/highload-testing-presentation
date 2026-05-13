package com.highload.highload_testing_presentation.service;

import com.highload.highload_testing_presentation.entity.Product;
import com.highload.highload_testing_presentation.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    // GOOD: paginated query
    public Page<Product> getProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    // BAD: loads ALL 50k products into memory
    public List<Product> getAllProductsSlow() {
        return productRepository.findAll();
    }

    // Search by name (uses index after V3 migration)
    public List<Product> searchByName(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    // GOOD: product by ID without cache
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
    }

    // GOOD: product by ID with cache
    @Cacheable(value = "products", key = "#id")
    public Product getProductByIdCached(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
    }

    public Page<Product> getProductsByCategory(String category, Pageable pageable) {
        return productRepository.findByCategory(category, pageable);
    }
}
