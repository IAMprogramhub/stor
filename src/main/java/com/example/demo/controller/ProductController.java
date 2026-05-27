package com.example.demo.controller;

import com.example.demo.dto.ProductDto;
import com.example.demo.model.Product;
import com.example.demo.model.Seller;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.SellerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final SellerRepository sellerRepository;

    public ProductController(ProductRepository productRepository, SellerRepository sellerRepository) {
        this.productRepository = productRepository;
        this.sellerRepository = sellerRepository;
    }

    @GetMapping
    public List<ProductDto> getAllProducts(@RequestParam(required = false) Long sellerId) {
        List<Product> list = sellerId != null
                ? productRepository.findBySeller_Id(sellerId)
                : productRepository.findAll();
        return list.stream()
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
        if (dto.getSellerId() != null) {
            Seller seller = sellerRepository.findById(dto.getSellerId()).orElseThrow();
            product.setSeller(seller);
        }
        return ResponseEntity.ok(convertToDto(productRepository.save(product)));
    }

    @PutMapping("/{id}/update")
    public ResponseEntity<ProductDto> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductDto dto
    ) {
        Product product = productRepository.findById(id)
                .orElseThrow();

        product.setSalePrice(dto.getSalePrice());
        product.setQuantity(dto.getQuantity());
        if (dto.getSellerId() != null) {
            Seller seller = sellerRepository.findById(dto.getSellerId()).orElseThrow();
            product.setSeller(seller);
        } else {
            product.setSeller(null);
        }

        productRepository.save(product);

        return ResponseEntity.ok(convertToDto(product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    private ProductDto convertToDto(Product p) {
        Long sellerId = null;
        String sellerName = null;
        if (p.getSeller() != null) {
            sellerId = p.getSeller().getId();
            sellerName = p.getSeller().getName();
        }
        return new ProductDto(
                p.getId(),
                p.getName(),
                p.getPurchasePrice(),
                p.getSalePrice(),
                p.getQuantity(),
                p.getUnit(),
                sellerId,
                sellerName
        );
    }
}
