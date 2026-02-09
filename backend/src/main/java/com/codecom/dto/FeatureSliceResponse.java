package com.codecom.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for feature slice responses
 * FR.35: Feature-Based Code Slicing
 */
public record FeatureSliceResponse(
    Long id,
    String name,
    String description,
    LocalDateTime createdDate,
    LocalDateTime updatedDate,
    Integer nodeCount,
    Integer fileCount,
    List<String> filePaths
) {
}
