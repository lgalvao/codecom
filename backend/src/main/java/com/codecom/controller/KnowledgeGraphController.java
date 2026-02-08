package com.codecom.controller;

import com.codecom.dto.KnowledgeGraphQuery;
import com.codecom.dto.NodeWithRelationships;
import com.codecom.dto.RelationshipInfo;
import com.codecom.entity.CodeNode;
import com.codecom.entity.CodeRelationship;
import com.codecom.service.KnowledgeGraphService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST controller for knowledge graph operations
 * FR.38: Relationship Graph Database
 * FR.39: Cross-Language Query Support
 */
@RestController
@RequestMapping("/api/knowledge-graph")
@CrossOrigin(origins = "*")
public class KnowledgeGraphController {
    
    private final KnowledgeGraphService knowledgeGraphService;
    
    public KnowledgeGraphController(KnowledgeGraphService knowledgeGraphService) {
        this.knowledgeGraphService = knowledgeGraphService;
    }
    
    /**
     * Get a specific node with all its relationships
     * GET /api/knowledge-graph/node/{id}
     */
    @GetMapping("/node/{id}")
    public ResponseEntity<NodeWithRelationships> getNode(@PathVariable Long id) {
        Optional<CodeNode> nodeOpt = knowledgeGraphService.getNodeById(id);
        
        if (nodeOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        CodeNode node = nodeOpt.get();
        Map<String, List<CodeRelationship>> relationships = 
            knowledgeGraphService.getNodeRelationships(id);
        
        List<RelationshipInfo> outgoing = relationships.get("outgoing").stream()
            .map(r -> {
                Optional<CodeNode> target = knowledgeGraphService.getNodeById(r.getTargetId());
                return new RelationshipInfo(
                    r.getId(),
                    r.getRelationshipType(),
                    r.getTargetId(),
                    target.map(CodeNode::getName).orElse("Unknown"),
                    target.map(CodeNode::getNodeType).orElse("UNKNOWN"),
                    r.getMetadata(),
                    r.getLineNumber()
                );
            })
            .collect(Collectors.toList());
        
        List<RelationshipInfo> incoming = relationships.get("incoming").stream()
            .map(r -> {
                Optional<CodeNode> source = knowledgeGraphService.getNodeById(r.getSourceId());
                return new RelationshipInfo(
                    r.getId(),
                    r.getRelationshipType(),
                    r.getSourceId(),
                    source.map(CodeNode::getName).orElse("Unknown"),
                    source.map(CodeNode::getNodeType).orElse("UNKNOWN"),
                    r.getMetadata(),
                    r.getLineNumber()
                );
            })
            .collect(Collectors.toList());
        
        NodeWithRelationships result = new NodeWithRelationships(
            node.getId(),
            node.getName(),
            node.getNodeType(),
            node.getFilePath(),
            node.getLineNumber(),
            node.getPackageName(),
            node.getSignature(),
            node.getIsPublic(),
            node.getIsStatic(),
            node.getIsAbstract(),
            node.getDocumentation(),
            outgoing,
            incoming
        );
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * Get all nodes that a specific node calls
     * GET /api/knowledge-graph/calls/{nodeId}
     */
    @GetMapping("/calls/{nodeId}")
    public ResponseEntity<List<CodeNode>> getCallees(@PathVariable Long nodeId) {
        List<CodeNode> callees = knowledgeGraphService.findCallees(nodeId);
        return ResponseEntity.ok(callees);
    }
    
    /**
     * Get all nodes that call a specific node
     * GET /api/knowledge-graph/callers/{nodeId}
     */
    @GetMapping("/callers/{nodeId}")
    public ResponseEntity<List<CodeNode>> getCallers(@PathVariable Long nodeId) {
        List<CodeNode> callers = knowledgeGraphService.findCallers(nodeId);
        return ResponseEntity.ok(callers);
    }
    
    /**
     * Get inheritance hierarchy for a class
     * GET /api/knowledge-graph/inherits/{nodeId}
     */
    @GetMapping("/inherits/{nodeId}")
    public ResponseEntity<List<CodeNode>> getInheritanceHierarchy(@PathVariable Long nodeId) {
        List<CodeNode> hierarchy = knowledgeGraphService.findInheritanceHierarchy(nodeId);
        return ResponseEntity.ok(hierarchy);
    }
    
    /**
     * Get all classes that inherit from a specific class
     * GET /api/knowledge-graph/subclasses/{nodeId}
     */
    @GetMapping("/subclasses/{nodeId}")
    public ResponseEntity<List<CodeNode>> getSubclasses(@PathVariable Long nodeId) {
        List<CodeNode> subclasses = knowledgeGraphService.findSubclasses(nodeId);
        return ResponseEntity.ok(subclasses);
    }
    
    /**
     * Find call chains between two nodes
     * GET /api/knowledge-graph/call-chain?source={sourceId}&target={targetId}&maxDepth={depth}
     */
    @GetMapping("/call-chain")
    public ResponseEntity<List<List<Long>>> findCallChain(
            @RequestParam Long source,
            @RequestParam Long target,
            @RequestParam(defaultValue = "5") int maxDepth) {
        
        List<List<Long>> chains = knowledgeGraphService.findCallChain(source, target, maxDepth);
        return ResponseEntity.ok(chains);
    }
    
    /**
     * Execute a cross-language query
     * GET /api/knowledge-graph/query?q={query}
     * 
     * Example queries:
     * - calls:MethodName - Find all nodes that call MethodName
     * - inherits:ClassName - Find all classes that inherit from ClassName
     * - type:CLASS public:true - Find all public classes
     * - name:search - Search nodes by name
     */
    @GetMapping("/query")
    public ResponseEntity<KnowledgeGraphQuery> executeQuery(@RequestParam String q) {
        List<CodeNode> nodes = knowledgeGraphService.executeQuery(q);
        
        List<KnowledgeGraphQuery.QueryNode> queryNodes = nodes.stream()
            .map(n -> new KnowledgeGraphQuery.QueryNode(
                n.getId(),
                n.getName(),
                n.getNodeType(),
                n.getFilePath(),
                n.getLineNumber(),
                n.getPackageName(),
                n.getSignature()
            ))
            .collect(Collectors.toList());
        
        KnowledgeGraphQuery result = new KnowledgeGraphQuery(q, queryNodes, new ArrayList<>());
        return ResponseEntity.ok(result);
    }
    
    /**
     * Search nodes by name
     * GET /api/knowledge-graph/search?name={name}
     */
    @GetMapping("/search")
    public ResponseEntity<List<CodeNode>> searchNodes(@RequestParam String name) {
        List<CodeNode> results = knowledgeGraphService.findNodesByName(name);
        return ResponseEntity.ok(results);
    }
}
