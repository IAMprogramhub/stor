package com.example.demo.dto;

public class ProductDto {
    public ProductDto() {
    }

    public ProductDto(Long id, String name, double purchasePrice, double salePrice, double quantity, String unit,
                      Long sellerId, String sellerName) {
        this.id = id;
        this.name = name;
        this.purchasePrice = purchasePrice;
        this.salePrice = salePrice;
        this.unit = unit;
        this.quantity = quantity;
        this.sellerId = sellerId;
        this.sellerName = sellerName;
    }

    public Long id;

    public String name;
    private double purchasePrice;

    private double salePrice;
    private double quantity;
    private String unit;

    private Long sellerId;
    private String sellerName;

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public double getPurchasePrice() {
        return purchasePrice;
    }

    public double getSalePrice() {
        return salePrice;
    }

    public double getQuantity() {
        return quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPurchasePrice(double price) {
        this.purchasePrice = price;
    }

    public void setQuantity(double quantity) {
        this.quantity = quantity;
    }

    public void setSalePrice(double salePrice) {
        this.salePrice = salePrice;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Long getSellerId() {
        return sellerId;
    }

    public void setSellerId(Long sellerId) {
        this.sellerId = sellerId;
    }

    public String getSellerName() {
        return sellerName;
    }

    public void setSellerName(String sellerName) {
        this.sellerName = sellerName;
    }
}
