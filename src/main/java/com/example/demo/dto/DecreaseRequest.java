package com.example.demo.dto;

public class DecreaseRequest {
    private double amount;
    /** true = продажа продавца (отчёт и история); false = корректировка админа */
    private Boolean recordSale;

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public Boolean getRecordSale() {
        return recordSale;
    }

    public void setRecordSale(Boolean recordSale) {
        this.recordSale = recordSale;
    }

    public boolean shouldRecordSale() {
        return recordSale == null || recordSale;
    }
}
