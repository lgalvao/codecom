package com.codecom.dto;

/**
 * DTO for file complexity metrics
 * FR.32: Complexity Heatmap
 */
public class FileComplexity {
    private String filePath;
    private Integer cyclomaticComplexity;
    private Integer linesOfCode;
    private Integer numberOfMethods;
    private Double complexityScore; // Normalized 0-1 score for heatmap
    private String complexityLevel; // LOW, MEDIUM, HIGH, VERY_HIGH
    
    public FileComplexity(String filePath, Integer cyclomaticComplexity, 
                         Integer linesOfCode, Integer numberOfMethods) {
        this.filePath = filePath;
        this.cyclomaticComplexity = cyclomaticComplexity;
        this.linesOfCode = linesOfCode;
        this.numberOfMethods = numberOfMethods;
        this.complexityScore = calculateScore();
        this.complexityLevel = determineLevel();
    }
    
    // Normalization thresholds for complexity scoring
    // These values represent typical ranges for well-structured code:
    // - CC: 100+ indicates very complex methods that should be refactored
    // - LoC: 500+ lines suggest a file that's too large
    // - Methods: 50+ methods in one file indicates poor cohesion
    private static final int CC_NORMALIZATION_THRESHOLD = 100;
    private static final int LOC_NORMALIZATION_THRESHOLD = 500;
    private static final int METHOD_NORMALIZATION_THRESHOLD = 50;
    
    private Double calculateScore() {
        // Normalize complexity score based on multiple factors
        // Weight: 50% cyclomatic complexity, 30% LoC, 20% methods
        double ccScore = Math.min(cyclomaticComplexity / (double) CC_NORMALIZATION_THRESHOLD, 1.0);
        double locScore = Math.min(linesOfCode / (double) LOC_NORMALIZATION_THRESHOLD, 1.0);
        double methodScore = Math.min(numberOfMethods / (double) METHOD_NORMALIZATION_THRESHOLD, 1.0);
        
        return (ccScore * 0.5) + (locScore * 0.3) + (methodScore * 0.2);
    }
    
    private String determineLevel() {
        if (complexityScore < 0.25) return "LOW";
        if (complexityScore < 0.5) return "MEDIUM";
        if (complexityScore < 0.75) return "HIGH";
        return "VERY_HIGH";
    }
    
    // Getters and setters
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    
    public Integer getCyclomaticComplexity() { return cyclomaticComplexity; }
    public void setCyclomaticComplexity(Integer cyclomaticComplexity) { 
        this.cyclomaticComplexity = cyclomaticComplexity;
        this.complexityScore = calculateScore();
        this.complexityLevel = determineLevel();
    }
    
    public Integer getLinesOfCode() { return linesOfCode; }
    public void setLinesOfCode(Integer linesOfCode) { 
        this.linesOfCode = linesOfCode;
        this.complexityScore = calculateScore();
        this.complexityLevel = determineLevel();
    }
    
    public Integer getNumberOfMethods() { return numberOfMethods; }
    public void setNumberOfMethods(Integer numberOfMethods) { 
        this.numberOfMethods = numberOfMethods;
        this.complexityScore = calculateScore();
        this.complexityLevel = determineLevel();
    }
    
    public Double getComplexityScore() { return complexityScore; }
    public void setComplexityScore(Double complexityScore) { this.complexityScore = complexityScore; }
    
    public String getComplexityLevel() { return complexityLevel; }
    public void setComplexityLevel(String complexityLevel) { this.complexityLevel = complexityLevel; }
}
