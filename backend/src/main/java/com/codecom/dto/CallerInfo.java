package com.codecom.dto;

/**
 * Represents information about a method/function that calls another method
 */
public record CallerInfo(
    String methodName,
    String className,
    String filePath,
    int line,
    int callCount
) {}
