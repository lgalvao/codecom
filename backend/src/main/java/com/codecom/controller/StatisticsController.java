package com.codecom.controller;

import com.codecom.dto.CodeStatistics;
import com.codecom.service.StatisticsService;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/statistics")
@CrossOrigin(origins = "http://localhost:5173")
public class StatisticsController {

    private final StatisticsService statisticsService;

    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    /**
     * Get statistics for a single file.
     */
    @GetMapping("/file")
    public CodeStatistics getFileStatistics(@RequestParam String path) throws IOException {
        return statisticsService.calculateFileStatistics(path);
    }

    /**
     * Get statistics for a directory (recursive).
     */
    @GetMapping("/directory")
    public CodeStatistics getDirectoryStatistics(@RequestParam String path) throws IOException {
        return statisticsService.calculateDirectoryStatistics(path);
    }
}
