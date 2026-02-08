package com.codecom.service;

import com.codecom.entity.CodeNode;
import com.codecom.entity.CodeRelationship;
import com.codecom.entity.FeatureSlice;
import com.codecom.repository.CodeNodeRepository;
import com.codecom.repository.CodeRelationshipRepository;
import com.codecom.repository.FeatureSliceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing feature-based code slices
 * FR.35: Feature-Based Code Slicing
 */
@Service
public class FeatureSliceService {
    
    private final FeatureSliceRepository sliceRepository;
    private final CodeNodeRepository nodeRepository;
    private final CodeRelationshipRepository relationshipRepository;
    
    public FeatureSliceService(
            FeatureSliceRepository sliceRepository,
            CodeNodeRepository nodeRepository,
            CodeRelationshipRepository relationshipRepository) {
        this.sliceRepository = sliceRepository;
        this.nodeRepository = nodeRepository;
        this.relationshipRepository = relationshipRepository;
    }
    
    /**
     * Create a new feature slice with seed nodes
     */
    @Transactional
    public FeatureSlice createSlice(String name, String description, List<Long> seedNodeIds) {
        // Check if slice name already exists
        if (sliceRepository.existsByName(name)) {
            throw new IllegalArgumentException("A slice with name '" + name + "' already exists");
        }
        
        FeatureSlice slice = new FeatureSlice(name, description);
        
        // Add seed nodes
        for (Long nodeId : seedNodeIds) {
            nodeRepository.findById(nodeId).ifPresent(slice::addNode);
        }
        
        return sliceRepository.save(slice);
    }
    
    /**
     * Expand a slice by traversing relationships from existing nodes
     * @param sliceId The ID of the slice to expand
     * @param depth The depth of traversal (1-5)
     * @param includeCallers Whether to include nodes that call existing nodes
     * @param includeCallees Whether to include nodes called by existing nodes
     * @param includeInheritance Whether to include inheritance relationships
     */
    @Transactional
    public FeatureSlice expandSlice(Long sliceId, int depth, boolean includeCallers, 
                                   boolean includeCallees, boolean includeInheritance) {
        FeatureSlice slice = sliceRepository.findById(sliceId)
            .orElseThrow(() -> new IllegalArgumentException("Slice not found: " + sliceId));
        
        // Validate depth
        if (depth < 1 || depth > 5) {
            throw new IllegalArgumentException("Depth must be between 1 and 5");
        }
        
        Set<Long> visited = new HashSet<>();
        Set<CodeNode> currentLevel = new HashSet<>(slice.getNodes());
        
        // BFS traversal
        for (int i = 0; i < depth; i++) {
            Set<CodeNode> nextLevel = new HashSet<>();
            
            for (CodeNode node : currentLevel) {
                if (visited.contains(node.getId())) {
                    continue;
                }
                visited.add(node.getId());
                
                // Add callees (nodes this node calls)
                if (includeCallees) {
                    List<CodeRelationship> callRels = relationshipRepository
                        .findBySourceIdAndRelationshipType(node.getId(), "CALLS");
                    
                    for (CodeRelationship rel : callRels) {
                        nodeRepository.findById(rel.getTargetId()).ifPresent(target -> {
                            slice.addNode(target);
                            nextLevel.add(target);
                        });
                    }
                }
                
                // Add callers (nodes that call this node)
                if (includeCallers) {
                    List<CodeRelationship> callerRels = relationshipRepository
                        .findByTargetIdAndRelationshipType(node.getId(), "CALLS");
                    
                    for (CodeRelationship rel : callerRels) {
                        nodeRepository.findById(rel.getSourceId()).ifPresent(source -> {
                            slice.addNode(source);
                            nextLevel.add(source);
                        });
                    }
                }
                
                // Add inheritance relationships
                if (includeInheritance) {
                    // Parent classes/interfaces
                    List<CodeRelationship> inheritRels = relationshipRepository
                        .findBySourceIdAndRelationshipType(node.getId(), "INHERITS");
                    
                    for (CodeRelationship rel : inheritRels) {
                        nodeRepository.findById(rel.getTargetId()).ifPresent(target -> {
                            slice.addNode(target);
                            nextLevel.add(target);
                        });
                    }
                    
                    // Subclasses
                    List<CodeRelationship> subclassRels = relationshipRepository
                        .findByTargetIdAndRelationshipType(node.getId(), "INHERITS");
                    
                    for (CodeRelationship rel : subclassRels) {
                        nodeRepository.findById(rel.getSourceId()).ifPresent(source -> {
                            slice.addNode(source);
                            nextLevel.add(source);
                        });
                    }
                }
            }
            
            currentLevel = nextLevel;
        }
        
        return sliceRepository.save(slice);
    }
    
    /**
     * Get all slices
     */
    public List<FeatureSlice> getAllSlices() {
        return sliceRepository.findAllOrderByName();
    }
    
    /**
     * Get a slice by ID
     */
    public Optional<FeatureSlice> getSliceById(Long id) {
        return sliceRepository.findById(id);
    }
    
    /**
     * Get a slice by name
     */
    public Optional<FeatureSlice> getSliceByName(String name) {
        return sliceRepository.findByName(name);
    }
    
    /**
     * Update a slice
     */
    @Transactional
    public FeatureSlice updateSlice(Long sliceId, String name, String description) {
        FeatureSlice slice = sliceRepository.findById(sliceId)
            .orElseThrow(() -> new IllegalArgumentException("Slice not found: " + sliceId));
        
        // Check if new name conflicts with existing slice
        if (name != null && !name.equals(slice.getName())) {
            if (sliceRepository.existsByName(name)) {
                throw new IllegalArgumentException("A slice with name '" + name + "' already exists");
            }
            slice.setName(name);
        }
        
        if (description != null) {
            slice.setDescription(description);
        }
        
        return sliceRepository.save(slice);
    }
    
    /**
     * Add nodes to a slice
     */
    @Transactional
    public FeatureSlice addNodesToSlice(Long sliceId, List<Long> nodeIds) {
        FeatureSlice slice = sliceRepository.findById(sliceId)
            .orElseThrow(() -> new IllegalArgumentException("Slice not found: " + sliceId));
        
        for (Long nodeId : nodeIds) {
            nodeRepository.findById(nodeId).ifPresent(slice::addNode);
        }
        
        return sliceRepository.save(slice);
    }
    
    /**
     * Remove nodes from a slice
     */
    @Transactional
    public FeatureSlice removeNodesFromSlice(Long sliceId, List<Long> nodeIds) {
        FeatureSlice slice = sliceRepository.findById(sliceId)
            .orElseThrow(() -> new IllegalArgumentException("Slice not found: " + sliceId));
        
        for (Long nodeId : nodeIds) {
            nodeRepository.findById(nodeId).ifPresent(slice::removeNode);
        }
        
        return sliceRepository.save(slice);
    }
    
    /**
     * Delete a slice
     */
    @Transactional
    public void deleteSlice(Long sliceId) {
        sliceRepository.deleteById(sliceId);
    }
    
    /**
     * Get all file paths for nodes in a slice
     */
    public Set<String> getSliceFilePaths(Long sliceId) {
        FeatureSlice slice = sliceRepository.findById(sliceId)
            .orElseThrow(() -> new IllegalArgumentException("Slice not found: " + sliceId));
        
        return slice.getNodes().stream()
            .map(CodeNode::getFilePath)
            .collect(Collectors.toSet());
    }
    
    /**
     * Get statistics for a slice
     */
    public Map<String, Object> getSliceStatistics(Long sliceId) {
        FeatureSlice slice = sliceRepository.findById(sliceId)
            .orElseThrow(() -> new IllegalArgumentException("Slice not found: " + sliceId));
        
        Set<String> files = slice.getNodes().stream()
            .map(CodeNode::getFilePath)
            .collect(Collectors.toSet());
        
        Map<String, Long> nodeTypeCount = slice.getNodes().stream()
            .collect(Collectors.groupingBy(CodeNode::getNodeType, Collectors.counting()));
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("nodeCount", slice.getNodes().size());
        stats.put("fileCount", files.size());
        stats.put("nodeTypeBreakdown", nodeTypeCount);
        
        return stats;
    }
    
    /**
     * Find all slices containing a specific node
     */
    public List<FeatureSlice> findSlicesContainingNode(Long nodeId) {
        return sliceRepository.findSlicesContainingNode(nodeId);
    }
}
