package com.example.demo.repository;

import com.example.demo.model.QuantityHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuantityHistoryRepository extends JpaRepository<QuantityHistory, Long> {
    List<QuantityHistory> findByProductIdOrderByTimestampDesc(Long productId);
    List<QuantityHistory> findAllByOrderByTimestampDesc();

}
