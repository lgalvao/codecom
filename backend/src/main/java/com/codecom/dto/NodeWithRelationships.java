package com.codecom.dto;

import java.util.List;

/**
 * DTO for a code node with its relationships
 * FR.38: Relationship Graph Database
 */
public class NodeWithRelationships {
    private Long id;
    private String name;
    private String nodeType;
    private String filePath;
    private Integer lineNumber;
    private String packageName;
    private String signature;
    private Boolean isPublic;
    private Boolean isStatic;
    private Boolean isAbstract;
    private String documentation;
    private List<RelationshipInfo> outgoingRelationships;
    private List<RelationshipInfo> incomingRelationships;
    
    public NodeWithRelationships(Long id, String name, String nodeType, String filePath, 
                                 Integer lineNumber, String packageName, String signature,
                                 Boolean isPublic, Boolean isStatic, Boolean isAbstract,
                                 String documentation,
                                 List<RelationshipInfo> outgoingRelationships,
                                 List<RelationshipInfo> incomingRelationships) {
        this.id = id;
        this.name = name;
        this.nodeType = nodeType;
        this.filePath = filePath;
        this.lineNumber = lineNumber;
        this.packageName = packageName;
        this.signature = signature;
        this.isPublic = isPublic;
        this.isStatic = isStatic;
        this.isAbstract = isAbstract;
        this.documentation = documentation;
        this.outgoingRelationships = outgoingRelationships;
        this.incomingRelationships = incomingRelationships;
    }
    
    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getNodeType() { return nodeType; }
    public void setNodeType(String nodeType) { this.nodeType = nodeType; }
    
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    
    public Integer getLineNumber() { return lineNumber; }
    public void setLineNumber(Integer lineNumber) { this.lineNumber = lineNumber; }
    
    public String getPackageName() { return packageName; }
    public void setPackageName(String packageName) { this.packageName = packageName; }
    
    public String getSignature() { return signature; }
    public void setSignature(String signature) { this.signature = signature; }
    
    public Boolean getIsPublic() { return isPublic; }
    public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }
    
    public Boolean getIsStatic() { return isStatic; }
    public void setIsStatic(Boolean isStatic) { this.isStatic = isStatic; }
    
    public Boolean getIsAbstract() { return isAbstract; }
    public void setIsAbstract(Boolean isAbstract) { this.isAbstract = isAbstract; }
    
    public String getDocumentation() { return documentation; }
    public void setDocumentation(String documentation) { this.documentation = documentation; }
    
    public List<RelationshipInfo> getOutgoingRelationships() { return outgoingRelationships; }
    public void setOutgoingRelationships(List<RelationshipInfo> outgoingRelationships) { 
        this.outgoingRelationships = outgoingRelationships; 
    }
    
    public List<RelationshipInfo> getIncomingRelationships() { return incomingRelationships; }
    public void setIncomingRelationships(List<RelationshipInfo> incomingRelationships) { 
        this.incomingRelationships = incomingRelationships; 
    }
}
