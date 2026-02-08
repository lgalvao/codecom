package com.codecom.controller;

import com.codecom.dto.FlowGraphResponse;
import com.codecom.service.FlowGraphService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for architecture flow graph operations
 * FR.33: Interactive Architecture Flow Graph
 */
@RestController
@RequestMapping("/api/flow-graph")
@CrossOrigin(origins = "*")
public class FlowGraphController {
    
    private final FlowGraphService flowGraphService;
    
    public FlowGraphController(FlowGraphService flowGraphService) {
        this.flowGraphService = flowGraphService;
    }
    
    /**
     * Get the complete architecture flow graph
     * GET /api/flow-graph/analyze
     */
    @GetMapping("/analyze")
    public ResponseEntity<FlowGraphResponse> analyzeProject() {
        FlowGraphResponse graph = flowGraphService.buildFlowGraph();
        return ResponseEntity.ok(graph);
    }
    
    /**
     * Trace flow graph from a specific node
     * GET /api/flow-graph/trace?from={nodeId}&depth={maxDepth}
     */
    @GetMapping("/trace")
    public ResponseEntity<FlowGraphResponse> traceFromNode(
            @RequestParam Long from,
            @RequestParam(defaultValue = "5") int depth) {
        
        FlowGraphResponse graph = flowGraphService.buildFlowGraphFromNode(from, depth);
        return ResponseEntity.ok(graph);
    }
    
    /**
     * Get flow graph starting from a specific component by name
     * GET /api/flow-graph/component/{name}
     */
    @GetMapping("/component/{name}")
    public ResponseEntity<FlowGraphResponse> getComponentFlow(@PathVariable String name) {
        FlowGraphResponse graph = flowGraphService.buildFlowGraphForComponent(name);
        return ResponseEntity.ok(graph);
    }
}
