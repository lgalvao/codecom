package com.codecom.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for detailed feature slice with all nodes
 * FR.35: Feature-Based Code Slicing
 */
public record FeatureSliceDetail(
    Long id,
    String name,
    String description,
    LocalDateTime createdDate,
    LocalDateTime updatedDate,
    List<FeatureSliceNode> nodes
) {
}
