package com.codecom.dto;

import java.util.List;

/**
 * Represents test files that reference a class or method
 */
public record TestReference(
    String testClassName,
    String testFilePath,
    int referenceCount,
    List<Integer> referenceLines
) {}
