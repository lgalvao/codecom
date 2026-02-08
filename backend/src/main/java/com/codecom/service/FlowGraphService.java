package com.codecom.service;

import com.codecom.dto.FlowGraphEdge;
import com.codecom.dto.FlowGraphNode;
import com.codecom.dto.FlowGraphResponse;
import com.codecom.entity.CodeNode;
import com.codecom.entity.CodeRelationship;
import com.codecom.repository.CodeNodeRepository;
import com.codecom.repository.CodeRelationshipRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for building architecture flow graphs from the knowledge graph
 * FR.33: Interactive Architecture Flow Graph
 */
@Service
public class FlowGraphService {
    
    private final CodeNodeRepository nodeRepository;
    private final CodeRelationshipRepository relationshipRepository;
    
    public FlowGraphService(CodeNodeRepository nodeRepository, 
                           CodeRelationshipRepository relationshipRepository) {
        this.nodeRepository = nodeRepository;
        this.relationshipRepository = relationshipRepository;
    }
    
    /**
     * Build a complete flow graph from the knowledge graph
     * Maps nodes to architectural layers based on file path and annotations
     */
    public FlowGraphResponse buildFlowGraph() {
        List<CodeNode> allNodes = nodeRepository.findAll();
        List<CodeRelationship> allRelationships = relationshipRepository.findAll();
        
        List<FlowGraphNode> flowNodes = allNodes.stream()
            .map(this::convertToFlowNode)
            .collect(Collectors.toList());
        
        List<FlowGraphEdge> flowEdges = allRelationships.stream()
            .map(this::convertToFlowEdge)
            .collect(Collectors.toList());
        
        Map<String, Object> metadata = buildMetadata(flowNodes, flowEdges);
        
        return new FlowGraphResponse(flowNodes, flowEdges, metadata);
    }
    
    /**
     * Build a flow graph tracing from a specific node
     * @param nodeId Starting node ID
     * @param maxDepth Maximum depth to trace
     */
    public FlowGraphResponse buildFlowGraphFromNode(Long nodeId, int maxDepth) {
        Set<Long> visitedNodeIds = new HashSet<>();
        Set<Long> visitedRelationshipIds = new HashSet<>();
        
        // BFS traversal to find all connected nodes
        Queue<NodeDepth> queue = new LinkedList<>();
        queue.add(new NodeDepth(nodeId, 0));
        visitedNodeIds.add(nodeId);
        
        while (!queue.isEmpty()) {
            NodeDepth current = queue.poll();
            
            if (current.depth >= maxDepth) {
                continue;
            }
            
            // Get outgoing relationships
            List<CodeRelationship> outgoing = relationshipRepository.findBySourceId(current.nodeId);
            for (CodeRelationship rel : outgoing) {
                visitedRelationshipIds.add(rel.getId());
                if (!visitedNodeIds.contains(rel.getTargetId())) {
                    visitedNodeIds.add(rel.getTargetId());
                    queue.add(new NodeDepth(rel.getTargetId(), current.depth + 1));
                }
            }
            
            // Get incoming relationships
            List<CodeRelationship> incoming = relationshipRepository.findByTargetId(current.nodeId);
            for (CodeRelationship rel : incoming) {
                visitedRelationshipIds.add(rel.getId());
                if (!visitedNodeIds.contains(rel.getSourceId())) {
                    visitedNodeIds.add(rel.getSourceId());
                    queue.add(new NodeDepth(rel.getSourceId(), current.depth + 1));
                }
            }
        }
        
        // Convert visited nodes and relationships to flow graph
        List<FlowGraphNode> flowNodes = new ArrayList<>();
        for (Long id : visitedNodeIds) {
            nodeRepository.findById(id).ifPresent(node -> 
                flowNodes.add(convertToFlowNode(node))
            );
        }
        
        List<FlowGraphEdge> flowEdges = new ArrayList<>();
        for (Long id : visitedRelationshipIds) {
            relationshipRepository.findById(id).ifPresent(rel ->
                flowEdges.add(convertToFlowEdge(rel))
            );
        }
        
        Map<String, Object> metadata = buildMetadata(flowNodes, flowEdges);
        metadata.put("startNodeId", nodeId.toString());
        metadata.put("maxDepth", maxDepth);
        
        return new FlowGraphResponse(flowNodes, flowEdges, metadata);
    }
    
    /**
     * Build a flow graph for a specific component by name
     */
    public FlowGraphResponse buildFlowGraphForComponent(String componentName) {
        List<CodeNode> matchingNodes = nodeRepository.searchByName(componentName);
        
        if (matchingNodes.isEmpty()) {
            return new FlowGraphResponse(new ArrayList<>(), new ArrayList<>(), 
                Map.of("error", "Component not found", "componentName", componentName));
        }
        
        // Use the first matching node and trace from it
        CodeNode startNode = matchingNodes.get(0);
        return buildFlowGraphFromNode(startNode.getId(), 5);
    }
    
    /**
     * Convert a CodeNode to a FlowGraphNode with layer detection
     */
    private FlowGraphNode convertToFlowNode(CodeNode node) {
        String layer = detectLayer(node);
        String id = "node-" + node.getId();
        
        return new FlowGraphNode(
            id,
            node.getName(),
            node.getNodeType(),
            layer,
            node.getFilePath(),
            node.getLineNumber(),
            node.getPackageName()
        );
    }
    
    /**
     * Detect architectural layer based on file path and node type
     */
    private String detectLayer(CodeNode node) {
        String filePath = node.getFilePath().toLowerCase(java.util.Locale.ROOT);
        String nodeType = node.getNodeType();
        
        // Frontend layers
        if (filePath.contains("/frontend/src/components/") && filePath.endsWith(".vue")) {
            return "COMPONENT";
        }
        if (filePath.contains("/frontend/src/services/") && filePath.endsWith(".ts")) {
            return "SERVICE_TS";
        }
        
        // Backend layers based on package/path patterns
        if (filePath.contains("/controller/") || node.getPackageName().contains(".controller")) {
            return "CONTROLLER";
        }
        if (filePath.contains("/service/") || node.getPackageName().contains(".service")) {
            return "SERVICE_JAVA";
        }
        if (filePath.contains("/repository/") || node.getPackageName().contains(".repository")) {
            return "REPOSITORY";
        }
        if (filePath.contains("/entity/") || node.getPackageName().contains(".entity")) {
            return "ENTITY";
        }
        
        // Fallback based on node type
        if ("CLASS".equals(nodeType) || "INTERFACE".equals(nodeType)) {
            return "CLASS";
        }
        if ("METHOD".equals(nodeType)) {
            return "METHOD";
        }
        
        return "UNKNOWN";
    }
    
    /**
     * Convert a CodeRelationship to a FlowGraphEdge
     */
    private FlowGraphEdge convertToFlowEdge(CodeRelationship rel) {
        String sourceId = "node-" + rel.getSourceId();
        String targetId = "node-" + rel.getTargetId();
        String edgeType = rel.getRelationshipType();
        String label = generateEdgeLabel(rel);
        
        return new FlowGraphEdge(sourceId, targetId, edgeType, label, rel.getLineNumber());
    }
    
    /**
     * Generate a human-readable label for an edge
     */
    private String generateEdgeLabel(CodeRelationship rel) {
        String relType = rel.getRelationshipType().toLowerCase(java.util.Locale.ROOT);
        switch (relType) {
            case "calls":
                return "calls";
            case "inherits":
                return "extends/implements";
            case "uses":
                return "uses";
            case "depends_on":
                return "depends on";
            default:
                return relType;
        }
    }
    
    /**
     * Build metadata about the graph
     */
    private Map<String, Object> buildMetadata(List<FlowGraphNode> nodes, List<FlowGraphEdge> edges) {
        Map<String, Object> metadata = new HashMap<>();
        
        metadata.put("nodeCount", nodes.size());
        metadata.put("edgeCount", edges.size());
        
        // Count nodes by layer
        Map<String, Long> layerCounts = nodes.stream()
            .collect(Collectors.groupingBy(FlowGraphNode::getLayer, Collectors.counting()));
        metadata.put("layerCounts", layerCounts);
        
        // Count edges by type
        Map<String, Long> edgeTypeCounts = edges.stream()
            .collect(Collectors.groupingBy(FlowGraphEdge::getEdgeType, Collectors.counting()));
        metadata.put("edgeTypeCounts", edgeTypeCounts);
        
        // List all unique layers
        List<String> layers = nodes.stream()
            .map(FlowGraphNode::getLayer)
            .distinct()
            .sorted()
            .collect(Collectors.toList());
        metadata.put("layers", layers);
        
        return metadata;
    }
    
    /**
     * Helper class for BFS traversal with depth tracking
     */
    private static class NodeDepth {
        Long nodeId;
        int depth;
        
        NodeDepth(Long nodeId, int depth) {
            this.nodeId = nodeId;
            this.depth = depth;
        }
    }
}
