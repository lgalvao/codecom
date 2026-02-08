package com.codecom.dto;

import java.util.List;
import java.util.Map;

/**
 * DTO for architecture flow graph response
 * FR.33: Interactive Architecture Flow Graph
 */
public class FlowGraphResponse {
    private List<FlowGraphNode> nodes;
    private List<FlowGraphEdge> edges;
    private Map<String, Object> metadata;
    
    public FlowGraphResponse(List<FlowGraphNode> nodes, List<FlowGraphEdge> edges, 
                            Map<String, Object> metadata) {
        this.nodes = nodes;
        this.edges = edges;
        this.metadata = metadata;
    }
    
    // Getters and setters
    public List<FlowGraphNode> getNodes() { return nodes; }
    public void setNodes(List<FlowGraphNode> nodes) { this.nodes = nodes; }
    
    public List<FlowGraphEdge> getEdges() { return edges; }
    public void setEdges(List<FlowGraphEdge> edges) { this.edges = edges; }
    
    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
}
