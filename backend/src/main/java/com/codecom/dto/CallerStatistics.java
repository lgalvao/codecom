package com.codecom.dto;

import java.util.List;

/**
 * Statistics about callers of a method
 */
public record CallerStatistics(
    String targetMethod,
    String targetClass,
    int totalCallers,
    int totalCallSites,
    List<CallerInfo> callers
) {}
