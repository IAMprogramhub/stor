package com.example.demo.controller;

import com.example.demo.dto.ProductDto;
import com.example.demo.model.Product;
import com.example.demo.model.QuantityHistory;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.QuantityHistoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/history")
public class QuantityHistoryController {

    private final QuantityHistoryRepository historyRepository;
    private final ProductRepository productRepository;

    public QuantityHistoryController(QuantityHistoryRepository historyRepository,
                                     ProductRepository productRepository) {
        this.historyRepository = historyRepository;
        this.productRepository = productRepository;
    }

    @GetMapping("/all")
    public List<QuantityHistory> getAllHistory() {
        return historyRepository.findAll();
    }

    @GetMapping("/recent")
    public List<QuantityHistory> getRecentHistory() {
        LocalDateTime tenMinutesAgo = LocalDateTime.now().minusMinutes(10);
        return historyRepository.findAll()
                .stream()
                .filter(h -> h.getTimestamp().isAfter(tenMinutesAgo))
                .collect(Collectors.toList());
    }

    @PutMapping("/{id}/rollback")
    public ResponseEntity<ProductDto> rollbackQuantity(@PathVariable Long id) {
        Optional<QuantityHistory> optHistory = historyRepository.findById(id);
        if (optHistory.isEmpty()) return ResponseEntity.notFound().build();

        QuantityHistory history = optHistory.get();
        Optional<Product> optProduct = productRepository.findById(history.getProductId());

        Product product;
        if (optProduct.isPresent()) {
            product = optProduct.get();
            product.setQuantity(history.getOldQuantity());
        } else {
            product = new Product();
            product.setId(history.getProductId());
            product.setName("Restored Product");
            product.setPurchasePrice(0);
            product.setSalePrice(0);
            product.setQuantity(history.getOldQuantity());
            product.setUnit("шт");
        }
        productRepository.save(product);
        historyRepository.deleteById(id);

        return ResponseEntity.ok(new ProductDto(
                product.getId(),
                product.getName(),
                product.getPurchasePrice(),
                product.getSalePrice(),
                product.getQuantity(),
                product.getUnit()
        ));
    }
}
