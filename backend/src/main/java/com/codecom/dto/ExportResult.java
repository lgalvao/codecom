package com.codecom.dto;

/**
 * Response DTO for export operations
 * Contains the exported content and metadata
 */
public record ExportResult(
    String content,
    String filename,
    String mimeType,
    int totalFiles,
    int totalLines
) {}
