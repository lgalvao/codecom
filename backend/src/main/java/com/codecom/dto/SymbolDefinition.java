package com.codecom.dto;

import java.util.List;

/**
 * Represents detailed information about a symbol (method, class, etc.)
 * for hover tooltips and contextual metadata (FR.6 and FR.40)
 */
public record SymbolDefinition(
    String name,
    String signature,
    String type,
    String returnType,
    List<Parameter> parameters,
    String documentation,
    String filePath,
    int line,
    String codePreview  // FR.40: First 10 lines of implementation for code bubble
) {
    public record Parameter(String name, String type) {}
}
