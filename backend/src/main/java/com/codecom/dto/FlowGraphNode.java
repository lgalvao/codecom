package com.codecom.dto;

/**
 * DTO representing a node in the architecture flow graph
 * FR.33: Interactive Architecture Flow Graph
 */
public class FlowGraphNode {
    private String id;
    private String name;
    private String nodeType;
    private String layer;
    private String filePath;
    private Integer lineNumber;
    private String packageName;
    
    public FlowGraphNode(String id, String name, String nodeType, String layer, 
                        String filePath, Integer lineNumber, String packageName) {
        this.id = id;
        this.name = name;
        this.nodeType = nodeType;
        this.layer = layer;
        this.filePath = filePath;
        this.lineNumber = lineNumber;
        this.packageName = packageName;
    }
    
    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getNodeType() { return nodeType; }
    public void setNodeType(String nodeType) { this.nodeType = nodeType; }
    
    public String getLayer() { return layer; }
    public void setLayer(String layer) { this.layer = layer; }
    
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    
    public Integer getLineNumber() { return lineNumber; }
    public void setLineNumber(Integer lineNumber) { this.lineNumber = lineNumber; }
    
    public String getPackageName() { return packageName; }
    public void setPackageName(String packageName) { this.packageName = packageName; }
}
