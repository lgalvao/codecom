package com.codecom.controller;

import com.codecom.dto.ExportRequest;
import com.codecom.dto.ExportResult;
import com.codecom.service.ExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

/**
 * Controller for code export functionality
 * Implements FR.30-FR.31 (Multi-Format Export and Project-Wide Export)
 */
@RestController
@RequestMapping("/api/export")
@CrossOrigin(origins = "http://localhost:5173")
public class ExportController {

    private final ExportService exportService;

    public ExportController(ExportService exportService) {
        this.exportService = exportService;
    }

    @PostMapping
    public ResponseEntity<String> exportFiles(@RequestBody ExportRequest request) {
        try {
            ExportResult result = exportService.exportFiles(request);
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                    "attachment; filename=\"" + result.filename() + "\"")
                .header("X-Total-Files", String.valueOf(result.totalFiles()))
                .header("X-Total-Lines", String.valueOf(result.totalLines()))
                .contentType(MediaType.parseMediaType(result.mimeType()))
                .body(result.content());
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                .body("Error exporting files: " + e.getMessage());
        }
    }
}
