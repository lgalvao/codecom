package com.codecom.controller;

import com.codecom.dto.FeatureSliceDetail;
import com.codecom.dto.FeatureSliceNode;
import com.codecom.dto.FeatureSliceRequest;
import com.codecom.dto.FeatureSliceResponse;
import com.codecom.entity.CodeNode;
import com.codecom.entity.FeatureSlice;
import com.codecom.service.FeatureSliceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * REST controller for feature slice operations
 * FR.35: Feature-Based Code Slicing
 */
@RestController
@RequestMapping("/api/slices")
@CrossOrigin(origins = "*")
public class FeatureSliceController {
    
    private final FeatureSliceService sliceService;
    
    public FeatureSliceController(FeatureSliceService sliceService) {
        this.sliceService = sliceService;
    }
    
    /**
     * Create a new feature slice
     * POST /api/slices
     */
    @PostMapping
    public ResponseEntity<FeatureSliceResponse> createSlice(@RequestBody FeatureSliceRequest request) {
        try {
            List<Long> seedNodeIds = request.seedNodeIds() != null ? request.seedNodeIds() : new ArrayList<>();
            
            FeatureSlice slice = sliceService.createSlice(
                request.name(),
                request.description(),
                seedNodeIds
            );
            
            // Expand if depth is specified
            if (request.expansionDepth() != null && request.expansionDepth() > 0) {
                slice = sliceService.expandSlice(
                    slice.getId(), 
                    request.expansionDepth(), 
                    true,  // includeCallers
                    true,  // includeCallees
                    true   // includeInheritance
                );
            }
            
            FeatureSliceResponse response = toResponse(slice);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get all feature slices
     * GET /api/slices
     */
    @GetMapping
    public ResponseEntity<List<FeatureSliceResponse>> getAllSlices() {
        List<FeatureSlice> slices = sliceService.getAllSlices();
        List<FeatureSliceResponse> responses = slices.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    /**
     * Get a specific slice with all details
     * GET /api/slices/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<FeatureSliceDetail> getSlice(@PathVariable Long id) {
        Optional<FeatureSlice> sliceOpt = sliceService.getSliceById(id);
        
        if (sliceOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        FeatureSlice slice = sliceOpt.get();
        FeatureSliceDetail detail = toDetail(slice);
        return ResponseEntity.ok(detail);
    }
    
    /**
     * Update a slice
     * PUT /api/slices/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<FeatureSliceResponse> updateSlice(
            @PathVariable Long id,
            @RequestBody Map<String, String> updates) {
        try {
            FeatureSlice slice = sliceService.updateSlice(
                id,
                updates.get("name"),
                updates.get("description")
            );
            
            FeatureSliceResponse response = toResponse(slice);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Delete a slice
     * DELETE /api/slices/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSlice(@PathVariable Long id) {
        try {
            sliceService.deleteSlice(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Expand a slice by traversing relationships
     * POST /api/slices/{id}/expand
     */
    @PostMapping("/{id}/expand")
    public ResponseEntity<FeatureSliceResponse> expandSlice(
            @PathVariable Long id,
            @RequestBody Map<String, Object> params) {
        try {
            int depth = params.containsKey("depth") ? (Integer) params.get("depth") : 1;
            boolean includeCallers = params.containsKey("includeCallers") ? 
                (Boolean) params.get("includeCallers") : true;
            boolean includeCallees = params.containsKey("includeCallees") ? 
                (Boolean) params.get("includeCallees") : true;
            boolean includeInheritance = params.containsKey("includeInheritance") ? 
                (Boolean) params.get("includeInheritance") : true;
            
            FeatureSlice slice = sliceService.expandSlice(
                id, depth, includeCallers, includeCallees, includeInheritance
            );
            
            FeatureSliceResponse response = toResponse(slice);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Add nodes to a slice
     * POST /api/slices/{id}/nodes
     */
    @PostMapping("/{id}/nodes")
    public ResponseEntity<FeatureSliceResponse> addNodes(
            @PathVariable Long id,
            @RequestBody Map<String, List<Long>> body) {
        try {
            List<Long> nodeIds = body.get("nodeIds");
            FeatureSlice slice = sliceService.addNodesToSlice(id, nodeIds);
            
            FeatureSliceResponse response = toResponse(slice);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Remove nodes from a slice
     * DELETE /api/slices/{id}/nodes
     */
    @DeleteMapping("/{id}/nodes")
    public ResponseEntity<FeatureSliceResponse> removeNodes(
            @PathVariable Long id,
            @RequestBody Map<String, List<Long>> body) {
        try {
            List<Long> nodeIds = body.get("nodeIds");
            FeatureSlice slice = sliceService.removeNodesFromSlice(id, nodeIds);
            
            FeatureSliceResponse response = toResponse(slice);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get file paths for a slice (for filtering)
     * GET /api/slices/{id}/files
     */
    @GetMapping("/{id}/files")
    public ResponseEntity<Set<String>> getSliceFiles(@PathVariable Long id) {
        try {
            Set<String> files = sliceService.getSliceFilePaths(id);
            return ResponseEntity.ok(files);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get statistics for a slice
     * GET /api/slices/{id}/statistics
     */
    @GetMapping("/{id}/statistics")
    public ResponseEntity<Map<String, Object>> getSliceStatistics(@PathVariable Long id) {
        try {
            Map<String, Object> stats = sliceService.getSliceStatistics(id);
            return ResponseEntity.ok(stats);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Convert FeatureSlice entity to response DTO
     */
    private FeatureSliceResponse toResponse(FeatureSlice slice) {
        Set<String> files = slice.getNodes().stream()
            .map(CodeNode::getFilePath)
            .collect(Collectors.toSet());
        
        return new FeatureSliceResponse(
            slice.getId(),
            slice.getName(),
            slice.getDescription(),
            slice.getCreatedDate(),
            slice.getUpdatedDate(),
            slice.getNodes().size(),
            files.size(),
            new ArrayList<>(files)
        );
    }
    
    /**
     * Convert FeatureSlice entity to detail DTO
     */
    private FeatureSliceDetail toDetail(FeatureSlice slice) {
        List<FeatureSliceNode> nodes = slice.getNodes().stream()
            .map(node -> new FeatureSliceNode(
                node.getId(),
                node.getName(),
                node.getNodeType(),
                node.getFilePath(),
                node.getLineNumber(),
                node.getPackageName()
            ))
            .sorted(Comparator.comparing(FeatureSliceNode::name))
            .collect(Collectors.toList());
        
        return new FeatureSliceDetail(
            slice.getId(),
            slice.getName(),
            slice.getDescription(),
            slice.getCreatedDate(),
            slice.getUpdatedDate(),
            nodes
        );
    }
}
