package com.codecom.dto;

/**
 * DTO representing an edge in the architecture flow graph
 * FR.33: Interactive Architecture Flow Graph
 */
public class FlowGraphEdge {
    private String sourceId;
    private String targetId;
    private String edgeType;
    private String label;
    private Integer lineNumber;
    
    public FlowGraphEdge(String sourceId, String targetId, String edgeType, String label) {
        this.sourceId = sourceId;
        this.targetId = targetId;
        this.edgeType = edgeType;
        this.label = label;
    }
    
    public FlowGraphEdge(String sourceId, String targetId, String edgeType, 
                        String label, Integer lineNumber) {
        this.sourceId = sourceId;
        this.targetId = targetId;
        this.edgeType = edgeType;
        this.label = label;
        this.lineNumber = lineNumber;
    }
    
    // Getters and setters
    public String getSourceId() { return sourceId; }
    public void setSourceId(String sourceId) { this.sourceId = sourceId; }
    
    public String getTargetId() { return targetId; }
    public void setTargetId(String targetId) { this.targetId = targetId; }
    
    public String getEdgeType() { return edgeType; }
    public void setEdgeType(String edgeType) { this.edgeType = edgeType; }
    
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    
    public Integer getLineNumber() { return lineNumber; }
    public void setLineNumber(Integer lineNumber) { this.lineNumber = lineNumber; }
}
