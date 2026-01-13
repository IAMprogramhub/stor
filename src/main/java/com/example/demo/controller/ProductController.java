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
        return productRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // ---------------- POST ----------------
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
    @GetMapping("/history/all")
    public List<QuantityHistory> getAllHistory() {
        return historyRepository.findAll();
    }
    @GetMapping("/history/recent")
    public List<QuantityHistory> getRecentHistory() {
        LocalDateTime tenMinutesAgo = LocalDateTime.now().minusMinutes(10);
        return historyRepository.findAll()
                .stream()
                .filter(h -> h.getTimestamp().isAfter(tenMinutesAgo))
                .collect(Collectors.toList());
    }
    @PutMapping("/history/{id}/rollback")
    public ResponseEntity<ProductDto> rollbackQuantity(@PathVariable Long id) {
        Optional<QuantityHistory> optHistory = historyRepository.findById(id);
        if (optHistory.isEmpty()) return ResponseEntity.notFound().build();

        QuantityHistory history = optHistory.get();
        Optional<Product> optProduct = productRepository.findById(history.getProductId());

        // Если продукт уже удалён (quantity = 0), нужно заново создать
        Product product;
        if (optProduct.isPresent()) {
            product = optProduct.get();
            product.setQuantity(history.getOldQuantity());
        } else {
            product = new Product();
            product.setId(history.getProductId());
            product.setName("Restored Product"); // или можно хранить имя в истории
            product.setPurchasePrice(0);
            product.setSalePrice(0);
            product.setQuantity(history.getOldQuantity());
            product.setUnit("шт");
        }
        productRepository.save(product);

        // Можно удалить запись истории или пометить как отменённую
        historyRepository.deleteById(id);

        return ResponseEntity.ok(convertToDto(product));
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

        if (amount > oldQty) {
            return ResponseEntity.badRequest().build();
        }


        int newQty = oldQty - amount;

        historyRepository.save(
                new QuantityHistory(product.getId(), oldQty, newQty, LocalDateTime.now())
        );

        if (newQty == 0) {
            productRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }

        product.setQuantity(newQty);
        return ResponseEntity.ok(convertToDto(productRepository.save(product)));
    }

    // ---------------- DTO ----------------
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
