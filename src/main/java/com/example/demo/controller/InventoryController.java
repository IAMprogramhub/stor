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

        int amount = request.getAmount();
        if (amount <= 0) return ResponseEntity.badRequest().build();

        Product product = opt.get();
        int oldQty = product.getQuantity();

        if (amount > oldQty) return ResponseEntity.badRequest().build();

        int newQty = oldQty - amount;

        if (request.shouldRecordSale()) {
            historyRepository.save(
                    new QuantityHistory(product.getId(), oldQty, newQty, LocalDateTime.now())
            );
        }

        product.setQuantity(newQty);
        productRepository.save(product);


        Long sellerId = null;
        String sellerName = null;
        if (product.getSeller() != null) {
            sellerId = product.getSeller().getId();
            sellerName = product.getSeller().getName();
        }
        return ResponseEntity.ok(new ProductDto(
                product.getId(),
                product.getName(),
                product.getPurchasePrice(),
                product.getSalePrice(),
                product.getQuantity(),
                product.getUnit(),
                sellerId,
                sellerName
        ));
    }
}
