package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class QuantityHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long productId;
    private double oldQuantity;
    private double newQuantity;
    private LocalDateTime timestamp;

    public QuantityHistory() {}

    public QuantityHistory(Long productId, double oldQuantity, double newQuantity, LocalDateTime timestamp) {
        this.productId = productId;
        this.oldQuantity = oldQuantity;
        this.newQuantity = newQuantity;
        this.timestamp = timestamp;
    }

    public Long getId() { return id; }
    public Long getProductId() { return productId; }
    public double getOldQuantity() { return oldQuantity; }
    public double getNewQuantity() { return newQuantity; }
    public LocalDateTime getTimestamp() { return timestamp; }

    public void setId(Long id) { this.id = id; }
    public void setProductId(Long productId) { this.productId = productId; }
    public void setOldQuantity(double oldQuantity) { this.oldQuantity = oldQuantity; }
    public void setNewQuantity(double newQuantity) { this.newQuantity = newQuantity; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
