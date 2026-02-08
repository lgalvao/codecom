package com.codecom.controller;

import com.codecom.dto.CallerStatistics;
import com.codecom.dto.DeadCodeInfo;
import com.codecom.dto.SymbolDefinition;
import com.codecom.dto.SymbolInfo;
import com.codecom.dto.SymbolSearchResult;
import com.codecom.dto.TestReference;
import com.codecom.service.AnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/analysis")
@CrossOrigin(origins = "http://localhost:5173")
public class AnalysisController {

    private final AnalysisService analysisService;

    public AnalysisController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @GetMapping("/outline")
    public List<SymbolInfo> getOutline(@RequestParam String path) throws IOException {
        return analysisService.getOutline(path);
    }

    @GetMapping("/search")
    public List<SymbolSearchResult> searchSymbols(
        @RequestParam String path,
        @RequestParam String query
    ) throws IOException {
        return analysisService.searchSymbols(path, query);
    }

    @GetMapping("/definition")
    public ResponseEntity<SymbolDefinition> getSymbolDefinition(
        @RequestParam String path,
        @RequestParam int line,
        @RequestParam(required = false, defaultValue = "0") int column
    ) throws IOException {
        Optional<SymbolDefinition> definition = analysisService.getSymbolDefinition(path, line, column);
        return definition.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/callers")
    public CallerStatistics findCallers(
        @RequestParam String path,
        @RequestParam String methodName,
        @RequestParam(required = false) String className
    ) throws IOException {
        return analysisService.findCallers(path, methodName, className);
    }

    @GetMapping("/test-references")
    public List<TestReference> findTestReferences(
        @RequestParam String path,
        @RequestParam String className
    ) throws IOException {
        return analysisService.findTestReferences(path, className);
    }

    @GetMapping("/dead-code")
    public List<DeadCodeInfo> detectDeadCode(
        @RequestParam String path
    ) throws IOException {
        return analysisService.detectDeadCode(path);
    }
}
