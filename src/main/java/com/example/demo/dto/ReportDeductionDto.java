package com.example.demo.dto;

import com.example.demo.model.DeductionType;
import com.example.demo.model.ReportDeduction;

import java.time.LocalDateTime;

public class ReportDeductionDto {
    private Long id;
    private String comment;
    private DeductionType type;
    private double value;
    private LocalDateTime createdAt;

    public ReportDeductionDto() {}

    public ReportDeductionDto(Long id, String comment, DeductionType type, double value, LocalDateTime createdAt) {
        this.id = id;
        this.comment = comment;
        this.type = type;
        this.value = value;
        this.createdAt = createdAt;
    }

    public static ReportDeductionDto from(ReportDeduction d) {
        return new ReportDeductionDto(
                d.getId(),
                d.getComment(),
                d.getType(),
                d.getValue(),
                d.getCreatedAt()
        );
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
