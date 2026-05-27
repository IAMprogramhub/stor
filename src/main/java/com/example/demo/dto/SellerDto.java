package com.example.demo.dto;

import com.example.demo.model.Seller;

public class SellerDto {
    private Long id;
    private String name;
    private boolean hasPassword;

    public SellerDto() {}

    public SellerDto(Long id, String name, boolean hasPassword) {
        this.id = id;
        this.name = name;
        this.hasPassword = hasPassword;
    }

    public static SellerDto from(Seller s) {
        boolean has = s.getPassword() != null && !s.getPassword().isBlank();
        return new SellerDto(s.getId(), s.getName(), has);
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public boolean isHasPassword() { return hasPassword; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setHasPassword(boolean hasPassword) { this.hasPassword = hasPassword; }
}
