package com.example.demo.controller;

import com.example.demo.dto.ProductDto;
import com.example.demo.model.Product;
import com.example.demo.model.QuantityHistory;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.QuantityHistoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final QuantityHistoryRepository historyRepository;

    public ProductController(ProductRepository productRepository,
                             QuantityHistoryRepository historyRepository) {
        this.productRepository = productRepository;
        this.historyRepository = historyRepository;
    }


    // ---------------- GET ----------------
    @GetMapping
    public List<ProductDto> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return products.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProductById(@PathVariable Long id) {
        Optional<Product> product = productRepository.findById(id);
        return product.map(p -> ResponseEntity.ok(convertToDto(p)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ---------------- DELETE ----------------
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ---------------- POST ----------------
    @PostMapping
    public ResponseEntity<ProductDto> createProduct(@RequestBody ProductDto productDto) {
        if (productDto.getQuantity() <= 0) {
            // Не добавляем товар с 0 или отрицательным количеством
            return ResponseEntity.badRequest().build();
        }

        Product product = new Product(
                productDto.getName(),
                productDto.getPurchasePrice(),
                productDto.getSalePrice(),
                productDto.getQuantity(),
                productDto.getUnit()
        );
        Product savedProduct = productRepository.save(product);
        return ResponseEntity.ok(convertToDto(savedProduct));
    }
    @GetMapping("/history/{productId}")
    public List<QuantityHistory> getHistory(@PathVariable Long productId) {
        return historyRepository.findByProductIdOrderByTimestampDesc(productId);
    }
    @GetMapping("/history/all")
    public List<QuantityHistory> getAllHistory() {
        return historyRepository.findAllByOrderByTimestampDesc();
    }



    // ---------------- PUT /update ----------------
    @PutMapping("/{id}/decrease")
    public ResponseEntity<ProductDto> decreaseQuantity(@PathVariable Long id) {
        Optional<Product> optionalProduct = productRepository.findById(id);
        if (optionalProduct.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Product product = optionalProduct.get();
        int oldQty = product.getQuantity();
        int newQty = oldQty - 1;

        // Сохраняем историю
        historyRepository.save(new QuantityHistory(
                product.getId(),
                oldQty,
                newQty,
                java.time.LocalDateTime.now()
        ));

        // Обновляем количество или удаляем
        if (newQty <= 0) {
            productRepository.deleteById(id);
            return ResponseEntity.ok().body(null);
        } else {
            product.setQuantity(newQty);
            Product saved = productRepository.save(product);
            return ResponseEntity.ok(convertToDto(saved));
        }
    }

    // ---------------- PRIVATE ----------------
    private ProductDto convertToDto(Product product) {
        return new ProductDto(
                product.getId(),
                product.getName(),
                product.getPurchasePrice(),
                product.getSalePrice(),
                product.getQuantity(),
                product.getUnit()
        );
    }
}
