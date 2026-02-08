package com.codecom.dto;

/**
 * DTO for feature slice node information
 * FR.35: Feature-Based Code Slicing
 */
public record FeatureSliceNode(
    Long id,
    String name,
    String nodeType,
    String filePath,
    Integer lineNumber,
    String packageName
) {
}
