package com.codecom.dto;

public record StateNode(
    String id,
    String label,
    int line,
    String sourceType  // "ENUM" or "UNION"
) {}
