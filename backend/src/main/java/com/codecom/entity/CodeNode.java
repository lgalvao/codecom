package com.codecom.entity;

import jakarta.persistence.*;

/**
 * Entity representing a code symbol (class, method, interface, etc.) in the knowledge graph
 * FR.38: Relationship Graph Database
 */
@Entity
@Table(name = "code_nodes", indexes = {
    @Index(name = "idx_name_type", columnList = "name,nodeType"),
    @Index(name = "idx_file_path", columnList = "filePath")
})
public class CodeNode {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String nodeType; // CLASS, INTERFACE, METHOD, FIELD, etc.
    
    @Column(nullable = false)
    private String filePath;
    
    @Column(nullable = false)
    private Integer lineNumber;
    
    private String packageName;
    
    private String signature; // Full signature for methods
    
    private Boolean isPublic;
    
    private Boolean isStatic;
    
    private Boolean isAbstract;
    
    @Column(length = 2000)
    private String documentation; // Javadoc/TSDoc
    
    // Default constructor for JPA
    public CodeNode() {
    }
    
    public CodeNode(String name, String nodeType, String filePath, Integer lineNumber) {
        this.name = name;
        this.nodeType = nodeType;
        this.filePath = filePath;
        this.lineNumber = lineNumber;
    }
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getNodeType() {
        return nodeType;
    }
    
    public void setNodeType(String nodeType) {
        this.nodeType = nodeType;
    }
    
    public String getFilePath() {
        return filePath;
    }
    
    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
    
    public Integer getLineNumber() {
        return lineNumber;
    }
    
    public void setLineNumber(Integer lineNumber) {
        this.lineNumber = lineNumber;
    }
    
    public String getPackageName() {
        return packageName;
    }
    
    public void setPackageName(String packageName) {
        this.packageName = packageName;
    }
    
    public String getSignature() {
        return signature;
    }
    
    public void setSignature(String signature) {
        this.signature = signature;
    }
    
    public Boolean getIsPublic() {
        return isPublic;
    }
    
    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }
    
    public Boolean getIsStatic() {
        return isStatic;
    }
    
    public void setIsStatic(Boolean isStatic) {
        this.isStatic = isStatic;
    }
    
    public Boolean getIsAbstract() {
        return isAbstract;
    }
    
    public void setIsAbstract(Boolean isAbstract) {
        this.isAbstract = isAbstract;
    }
    
    public String getDocumentation() {
        return documentation;
    }
    
    public void setDocumentation(String documentation) {
        this.documentation = documentation;
    }
}
