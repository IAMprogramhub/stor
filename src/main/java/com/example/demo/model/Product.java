package com.example.demo.model;



import jakarta.persistence.*;




@Entity
@Table(name = "products")
public class Product {
    public Product(){}
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public String name;
    private double purchasePrice;

    private double salePrice;
    private double quantity;
    private String unit;

    public Product(String name, double purchasePrice, double salePrice, double quantity, String unit) {
        this.name = name;
        this.purchasePrice = purchasePrice;
        this.salePrice = salePrice;
        this.quantity = quantity;
        this.unit = unit;
    }
    @ManyToOne
    @JoinColumn(name = "seller_id")
    private Seller seller;

    public Seller getSeller() {
        return seller;
    }

    public void setSeller(Seller seller) {
        this.seller = seller;
    }

    public Long getId(){return id;}
    public String getName(){
        return name;
    }
    public double getPurchasePrice(){
        return purchasePrice;
    }
    public double getSalePrice(){return salePrice;}
    public double getQuantity(){return quantity;}
    public String getUnit() {return unit;}
    public void setId (Long id){this.id=id;}
    public void setName(String name){this.name = name;}
    public void setPurchasePrice(double purchasePrice){this.purchasePrice=purchasePrice;}
    public void setSalePrice(double salePrice){this.salePrice=salePrice;}
    public void setQuantity(double quantity) {this.quantity = quantity;}
    public void setUnit(String unit) {this.unit = unit;}
}

