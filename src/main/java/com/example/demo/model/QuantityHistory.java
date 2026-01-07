package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class QuantityHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long productId;
    private int oldQuantity;
    private int newQuantity;
    private LocalDateTime timestamp;

    public QuantityHistory() {}

    public QuantityHistory(Long productId, int oldQuantity, int newQuantity, LocalDateTime timestamp) {
        this.productId = productId;
        this.oldQuantity = oldQuantity;
        this.newQuantity = newQuantity;
        this.timestamp = timestamp;
    }

    // getters и setters
    public Long getId() { return id; }
    public Long getProductId() { return productId; }
    public int getOldQuantity() { return oldQuantity; }
    public int getNewQuantity() { return newQuantity; }
    public LocalDateTime getTimestamp() { return timestamp; }

    public void setId(Long id) { this.id = id; }
    public void setProductId(Long productId) { this.productId = productId; }
    public void setOldQuantity(int oldQuantity) { this.oldQuantity = oldQuantity; }
    public void setNewQuantity(int newQuantity) { this.newQuantity = newQuantity; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
