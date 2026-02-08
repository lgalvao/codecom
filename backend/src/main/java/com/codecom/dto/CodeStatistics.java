package com.codecom.dto;

/**
 * DTO for code statistics including line counts, method counts, and structure counts.
 */
public record CodeStatistics(
    int totalLines,
    int codeLines,              // Lines without comments and blank lines
    int commentLines,
    int blankLines,
    int methodCount,
    int classCount,
    int interfaceCount,
    int recordCount,
    int packageCount
) {}
