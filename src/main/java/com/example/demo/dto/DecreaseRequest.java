package com.example.demo.dto;


public class DecreaseRequest {
    private int amount;
    /** true = продажа продавца (отчёт и история); false = корректировка админа */
    private Boolean recordSale;

    public int getAmount() {
        return amount;
    }

    public void setAmount(int amount) {
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
