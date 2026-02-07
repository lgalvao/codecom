package com.codecom.controller;

import com.codecom.dto.SymbolInfo;
import com.codecom.service.AnalysisService;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

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
}
