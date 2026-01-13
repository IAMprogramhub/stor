package com.example.demo.controller;

import com.example.demo.dto.ProductDto;
import com.example.demo.model.Product;
import com.example.demo.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<ProductDto> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<ProductDto> createProduct(@RequestBody ProductDto dto) {
        Product product = new Product(
                dto.getName(),
                dto.getPurchasePrice(),
                dto.getSalePrice(),
                dto.getQuantity(),
                dto.getUnit()
        );
        return ResponseEntity.ok(convertToDto(productRepository.save(product)));
    }

    private ProductDto convertToDto(Product p) {
        return new ProductDto(
                p.getId(),
                p.getName(),
                p.getPurchasePrice(),
                p.getSalePrice(),
                p.getQuantity(),
                p.getUnit()
        );
    }
}
