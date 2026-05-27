package com.example.demo.dto;

import com.example.demo.model.DeductionType;

public class CreateReportDeductionRequest {
    private String comment;
    private DeductionType type;
    private Double value;

    public String getComment() { return comment; }
    public DeductionType getType() { return type; }
    public Double getValue() { return value; }

    public void setComment(String comment) { this.comment = comment; }
    public void setType(DeductionType type) { this.type = type; }
    public void setValue(Double value) { this.value = value; }
}
