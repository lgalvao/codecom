package com.codecom.entity;

import jakarta.persistence.*;

/**
 * Entity representing a relationship between code symbols in the knowledge graph
 * FR.38: Relationship Graph Database
 * 
 * Relationship types:
 * - CALLS: Method/function invocation
 * - INHERITS: Class inheritance and interface implementation  
 * - INJECTS: Dependency injection (@Autowired, constructor injection)
 * - MAPS_TO_URL: REST endpoint mappings from controllers
 */
@Entity
@Table(name = "code_relationships", indexes = {
    @Index(name = "idx_source_id", columnList = "sourceId"),
    @Index(name = "idx_target_id", columnList = "targetId"),
    @Index(name = "idx_relationship_type", columnList = "relationshipType")
})
public class CodeRelationship {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long sourceId; // ID of the source CodeNode
    
    @Column(nullable = false)
    private Long targetId; // ID of the target CodeNode
    
    @Column(nullable = false)
    private String relationshipType; // CALLS, INHERITS, INJECTS, MAPS_TO_URL
    
    @Column(length = 1000)
    private String metadata; // Additional context (e.g., URL pattern for MAPS_TO_URL)
    
    private Integer lineNumber; // Line where the relationship is defined
    
    // Default constructor for JPA
    public CodeRelationship() {
    }
    
    public CodeRelationship(Long sourceId, Long targetId, String relationshipType) {
        this.sourceId = sourceId;
        this.targetId = targetId;
        this.relationshipType = relationshipType;
    }
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getSourceId() {
        return sourceId;
    }
    
    public void setSourceId(Long sourceId) {
        this.sourceId = sourceId;
    }
    
    public Long getTargetId() {
        return targetId;
    }
    
    public void setTargetId(Long targetId) {
        this.targetId = targetId;
    }
    
    public String getRelationshipType() {
        return relationshipType;
    }
    
    public void setRelationshipType(String relationshipType) {
        this.relationshipType = relationshipType;
    }
    
    public String getMetadata() {
        return metadata;
    }
    
    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }
    
    public Integer getLineNumber() {
        return lineNumber;
    }
    
    public void setLineNumber(Integer lineNumber) {
        this.lineNumber = lineNumber;
    }
}
