package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "report_deductions")
public class ReportDeduction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String comment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeductionType type;

    @Column(nullable = false)
    private double value;

    private LocalDateTime createdAt;

    public ReportDeduction() {}

    public ReportDeduction(String comment, DeductionType type, double value, LocalDateTime createdAt) {
        this.comment = comment;
        this.type = type;
        this.value = value;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getComment() { return comment; }
    public DeductionType getType() { return type; }
    public double getValue() { return value; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setComment(String comment) { this.comment = comment; }
    public void setType(DeductionType type) { this.type = type; }
    public void setValue(double value) { this.value = value; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
