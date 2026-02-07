package com.codecom.dto;

public record SymbolInfo(
    String name,
    String type, // e.g., "CLASS", "METHOD", "FUNCTION"
    int line,
    int column
) {}
