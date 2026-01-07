package com.example.demo.dto;




public class ProductDto {
    public ProductDto(){}
    public ProductDto(Long id, String name,double purchasePrice, double salePrice,int quantity,String unit) {
        this.id = id;
        this.name = name;
        this.purchasePrice=purchasePrice;
        this.salePrice=salePrice;
        this.unit=unit;
        this.quantity=quantity;

    }

    public Long id;

    public String name;
    private double purchasePrice;

    private double salePrice;
    private int quantity;
    private String unit;
    public Long getId(){return id;}
    public String getName(){return name;}
    public double getPurchasePrice(){return purchasePrice;}
    public double getSalePrice() {return salePrice;}
    public int getQuantity() {return quantity;}
    public String getUnit() {return unit;}

    public void setId(Long id){this.id=id;}
    public void setName(String name){this.name=name;}
    public void setPurchasePrice(double price){this.purchasePrice=price;}
    public void setQuantity(int quantity){this.quantity=quantity;}
    public void setSalePrice(double salePrice) {this.salePrice = salePrice;}
    public void setUnit(String unit) {this.unit = unit;}
}
