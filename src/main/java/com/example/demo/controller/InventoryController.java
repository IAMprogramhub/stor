package com.example.demo.controller;

import com.example.demo.dto.DecreaseRequest;
import com.example.demo.dto.ProductDto;
import com.example.demo.model.Product;
import com.example.demo.model.QuantityHistory;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.QuantityHistoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/inventory")
public class InventoryController {

    private static final double EPS = 1e-9;

    private final ProductRepository productRepository;
    private final QuantityHistoryRepository historyRepository;

    public InventoryController(ProductRepository productRepository,
                               QuantityHistoryRepository historyRepository) {
        this.productRepository = productRepository;
        this.historyRepository = historyRepository;
    }

    @PutMapping("/{id}/decrease")
    public ResponseEntity<ProductDto> decreaseQuantity(
            @PathVariable Long id,
            @RequestBody DecreaseRequest request
    ) {
        Optional<Product> opt = productRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        double amount = request.getAmount();
        if (amount <= EPS) return ResponseEntity.badRequest().build();

        Product product = opt.get();
        double oldQty = product.getQuantity();

        if (amount > oldQty + EPS) return ResponseEntity.badRequest().build();

        double newQty = roundQty(oldQty - amount);

        if (request.shouldRecordSale()) {
            historyRepository.save(
                    new QuantityHistory(product.getId(), oldQty, newQty, LocalDateTime.now())
            );
        }

        product.setQuantity(newQty);
        productRepository.save(product);

        return ResponseEntity.ok(toDto(product));
    }

    @PutMapping("/{id}/increase")
    public ResponseEntity<ProductDto> increaseQuantity(
            @PathVariable Long id,
            @RequestBody DecreaseRequest request
    ) {
        Optional<Product> opt = productRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        double amount = request.getAmount();
        if (amount <= EPS) return ResponseEntity.badRequest().build();

        Product product = opt.get();
        double oldQty = product.getQuantity();
        double newQty = roundQty(oldQty + amount);

        product.setQuantity(newQty);
        productRepository.save(product);

        return ResponseEntity.ok(toDto(product));
    }

    private static double roundQty(double value) {
        return Math.round(value * 1000.0) / 1000.0;
    }

    private ProductDto toDto(Product product) {
        Long sellerId = null;
        String sellerName = null;
        if (product.getSeller() != null) {
            sellerId = product.getSeller().getId();
            sellerName = product.getSeller().getName();
        }
        return new ProductDto(
                product.getId(),
                product.getName(),
                product.getPurchasePrice(),
                product.getSalePrice(),
                product.getQuantity(),
                product.getUnit(),
                sellerId,
                sellerName
        );
    }
}
