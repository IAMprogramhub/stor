package com.example.demo.controller;

import com.example.demo.dto.CreateReportDeductionRequest;
import com.example.demo.dto.ReportDeductionDto;
import com.example.demo.model.DeductionType;
import com.example.demo.model.ReportDeduction;
import com.example.demo.repository.ReportDeductionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/deductions")
public class ReportDeductionController {

    private final ReportDeductionRepository deductionRepository;

    public ReportDeductionController(ReportDeductionRepository deductionRepository) {
        this.deductionRepository = deductionRepository;
    }

    @GetMapping
    public List<ReportDeductionDto> getAll() {
        return deductionRepository.findAll().stream()
                .map(ReportDeductionDto::from)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateReportDeductionRequest req) {
        if (req.getComment() == null || req.getComment().isBlank()) {
            return ResponseEntity.badRequest().body("Комментарий обязателен");
        }
        if (req.getType() == null || (req.getType() != DeductionType.FIXED && req.getType() != DeductionType.PERCENT)) {
            return ResponseEntity.badRequest().body("Укажите тип: FIXED или PERCENT");
        }
        if (req.getValue() == null || req.getValue() <= 0) {
            return ResponseEntity.badRequest().body("Значение должно быть больше 0");
        }
        if (req.getType() == DeductionType.PERCENT && req.getValue() > 100) {
            return ResponseEntity.badRequest().body("Процент не может быть больше 100");
        }

        ReportDeduction d = new ReportDeduction(
                req.getComment().trim(),
                req.getType(),
                req.getValue(),
                LocalDateTime.now()
        );
        d = deductionRepository.save(d);
        return ResponseEntity.ok(ReportDeductionDto.from(d));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!deductionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        deductionRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
