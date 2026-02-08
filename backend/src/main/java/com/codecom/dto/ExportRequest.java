package com.codecom.dto;

import java.util.List;

/**
 * Request DTO for exporting code with different detail levels
 * Implements FR.30-FR.31
 */
public record ExportRequest(
    List<String> filePaths,
    String format,        // "markdown" or "pdf"
    String detailLevel,   // "full", "medium", "low", "architectural"
    boolean includeLineNumbers,
    String title
) {}
