package com.codecom.dto;

import java.util.List;

/**
 * DTO for cross-language knowledge graph query results
 * FR.39: Cross-Language Query Support
 */
public class KnowledgeGraphQuery {
    private String query;
    private List<QueryNode> nodes;
    private List<QueryPath> paths;
    private int totalResults;
    
    public KnowledgeGraphQuery(String query, List<QueryNode> nodes, List<QueryPath> paths) {
        this.query = query;
        this.nodes = nodes;
        this.paths = paths;
        this.totalResults = nodes != null ? nodes.size() : 0;
    }
    
    // Getters and setters
    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
    
    public List<QueryNode> getNodes() { return nodes; }
    public void setNodes(List<QueryNode> nodes) { 
        this.nodes = nodes; 
        this.totalResults = nodes != null ? nodes.size() : 0;
    }
    
    public List<QueryPath> getPaths() { return paths; }
    public void setPaths(List<QueryPath> paths) { this.paths = paths; }
    
    public int getTotalResults() { return totalResults; }
    public void setTotalResults(int totalResults) { this.totalResults = totalResults; }
    
    /**
     * Node in query result
     */
    public static class QueryNode {
        private Long id;
        private String name;
        private String nodeType;
        private String filePath;
        private Integer lineNumber;
        private String packageName;
        private String signature;
        
        public QueryNode(Long id, String name, String nodeType, String filePath, 
                        Integer lineNumber, String packageName, String signature) {
            this.id = id;
            this.name = name;
            this.nodeType = nodeType;
            this.filePath = filePath;
            this.lineNumber = lineNumber;
            this.packageName = packageName;
            this.signature = signature;
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
    }
    
    /**
     * Path in query result (sequence of related nodes)
     */
    public static class QueryPath {
        private List<Long> nodeIds;
        private List<String> relationshipTypes;
        private int pathLength;
        
        public QueryPath(List<Long> nodeIds, List<String> relationshipTypes) {
            this.nodeIds = nodeIds;
            this.relationshipTypes = relationshipTypes;
            this.pathLength = nodeIds != null ? nodeIds.size() - 1 : 0;
        }
        
        // Getters and setters
        public List<Long> getNodeIds() { return nodeIds; }
        public void setNodeIds(List<Long> nodeIds) { 
            this.nodeIds = nodeIds; 
            this.pathLength = nodeIds != null ? nodeIds.size() - 1 : 0;
        }
        
        public List<String> getRelationshipTypes() { return relationshipTypes; }
        public void setRelationshipTypes(List<String> relationshipTypes) { 
            this.relationshipTypes = relationshipTypes; 
        }
        
        public int getPathLength() { return pathLength; }
        public void setPathLength(int pathLength) { this.pathLength = pathLength; }
    }
}
