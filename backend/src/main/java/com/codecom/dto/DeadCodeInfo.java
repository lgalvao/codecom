package com.codecom.dto;

/**
 * DTO representing a potentially dead (unused) method or class
 * FR.37: Dead Code Detection & Visualization
 */
public record DeadCodeInfo(
    String name,           // Method or class name
    String type,           // "METHOD" or "CLASS"
    String className,      // Containing class name
    String filePath,       // File containing the symbol
    int line,             // Line number
    int callerCount,      // Number of internal callers (should be 0 for dead code)
    boolean isPublic,     // Whether the symbol is public (public APIs may be used externally)
    boolean isTest,       // Whether this is in a test file
    String reason         // Reason why it's considered dead (e.g., "No internal callers")
) {
    
    /**
     * Check if this is likely dead code that should be marked with ghost mode
     * @return true if this should be displayed with reduced opacity
     */
    public boolean isPotentiallyDead() {
        // Don't mark as dead if:
        // - It's public (may be part of the API)
        // - It's in a test file (tests are entry points)
        // - It has callers
        return callerCount == 0 && !isPublic && !isTest;
    }
}
