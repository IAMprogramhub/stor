package com.example.demo.controller;

import com.example.demo.dto.SellerDto;
import com.example.demo.dto.SellerLoginRequest;
import com.example.demo.dto.SetSellerPasswordRequest;
import com.example.demo.model.Seller;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.SellerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/sellers")
public class SellerController {

    private final SellerRepository sellerRepository;
    private final ProductRepository productRepository;

    public SellerController(SellerRepository sellerRepository, ProductRepository productRepository) {
        this.sellerRepository = sellerRepository;
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<SellerDto> getAllSellers() {
        return sellerRepository.findAll().stream()
                .map(SellerDto::from)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<SellerDto> createSeller(@RequestBody SellerDto dto) {
        if (dto.getName() == null || dto.getName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        Seller seller = new Seller(dto.getName().trim());
        seller = sellerRepository.save(seller);
        return ResponseEntity.ok(SellerDto.from(seller));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<?> setPassword(@PathVariable Long id, @RequestBody SetSellerPasswordRequest req) {
        if (req.getPassword() == null || req.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body("Пароль не может быть пустым");
        }
        return sellerRepository.findById(id)
                .map(seller -> {
                    seller.setPassword(req.getPassword().trim());
                    sellerRepository.save(seller);
                    return ResponseEntity.ok(SellerDto.from(seller));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody SellerLoginRequest req) {
        if (req.getSellerId() == null) {
            return ResponseEntity.badRequest().body("Выберите продавца");
        }
        if (req.getPassword() == null || req.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body("Введите пароль");
        }
        return sellerRepository.findById(req.getSellerId())
                .map(seller -> {
                    if (seller.getPassword() == null || seller.getPassword().isBlank()) {
                        return ResponseEntity.status(403).body("Пароль не назначен. Обратитесь к администратору.");
                    }
                    if (!seller.getPassword().equals(req.getPassword())) {
                        return ResponseEntity.status(401).body("Неверный пароль");
                    }
                    return ResponseEntity.ok(SellerDto.from(seller));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSeller(@PathVariable Long id) {
        if (!sellerRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        productRepository.findBySeller_Id(id).forEach(p -> {
            p.setSeller(null);
            productRepository.save(p);
        });
        sellerRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
