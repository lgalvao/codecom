package com.codecom.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for feature slice creation and updates
 * FR.35: Feature-Based Code Slicing
 */
public record FeatureSliceRequest(
    String name,
    String description,
    List<Long> seedNodeIds,
    Integer expansionDepth
) {
}
