package com.example.demo.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "seller")
public class Seller {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String password;

    @OneToMany(mappedBy = "seller")
    private List<Product> products;

    public Seller() {}
    public Seller(String name) { this.name = name; }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getPassword() { return password; }
    public void setName(String name) { this.name = name; }
    public void setPassword(String password) { this.password = password; }
    public List<Product> getProducts() { return products; }
    public void setProducts(List<Product> products) { this.products = products; }
}