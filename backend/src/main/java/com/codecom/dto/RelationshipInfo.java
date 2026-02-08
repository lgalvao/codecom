package com.codecom.dto;

/**
 * DTO for relationship information in the knowledge graph
 * FR.38: Relationship Graph Database
 */
public class RelationshipInfo {
    private Long relationshipId;
    private String relationshipType;
    private Long relatedNodeId;
    private String relatedNodeName;
    private String relatedNodeType;
    private String metadata;
    private Integer lineNumber;
    
    public RelationshipInfo(Long relationshipId, String relationshipType, Long relatedNodeId,
                           String relatedNodeName, String relatedNodeType, 
                           String metadata, Integer lineNumber) {
        this.relationshipId = relationshipId;
        this.relationshipType = relationshipType;
        this.relatedNodeId = relatedNodeId;
        this.relatedNodeName = relatedNodeName;
        this.relatedNodeType = relatedNodeType;
        this.metadata = metadata;
        this.lineNumber = lineNumber;
    }
    
    // Getters and setters
    public Long getRelationshipId() { return relationshipId; }
    public void setRelationshipId(Long relationshipId) { this.relationshipId = relationshipId; }
    
    public String getRelationshipType() { return relationshipType; }
    public void setRelationshipType(String relationshipType) { this.relationshipType = relationshipType; }
    
    public Long getRelatedNodeId() { return relatedNodeId; }
    public void setRelatedNodeId(Long relatedNodeId) { this.relatedNodeId = relatedNodeId; }
    
    public String getRelatedNodeName() { return relatedNodeName; }
    public void setRelatedNodeName(String relatedNodeName) { this.relatedNodeName = relatedNodeName; }
    
    public String getRelatedNodeType() { return relatedNodeType; }
    public void setRelatedNodeType(String relatedNodeType) { this.relatedNodeType = relatedNodeType; }
    
    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }
    
    public Integer getLineNumber() { return lineNumber; }
    public void setLineNumber(Integer lineNumber) { this.lineNumber = lineNumber; }
}
