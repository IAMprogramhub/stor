package com.example.demo.dto;

public class SellerLoginRequest {
    private Long sellerId;
    private String password;

    public Long getSellerId() { return sellerId; }
    public String getPassword() { return password; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }
    public void setPassword(String password) { this.password = password; }
}
