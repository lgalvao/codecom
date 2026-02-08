package com.codecom.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entity representing a feature slice - a logical grouping of related code nodes
 * FR.35: Feature-Based Code Slicing
 */
@Entity
@Table(name = "feature_slices")
public class FeatureSlice {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    @Column(length = 1000)
    private String description;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdDate;
    
    @Column(nullable = false)
    private LocalDateTime updatedDate;
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "feature_slice_nodes",
        joinColumns = @JoinColumn(name = "slice_id"),
        inverseJoinColumns = @JoinColumn(name = "node_id")
    )
    private Set<CodeNode> nodes = new HashSet<>();
    
    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        updatedDate = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }
    
    public FeatureSlice() {
    }
    
    public FeatureSlice(String name, String description) {
        this.name = name;
        this.description = description;
    }
    
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
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public LocalDateTime getCreatedDate() {
        return createdDate;
    }
    
    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }
    
    public LocalDateTime getUpdatedDate() {
        return updatedDate;
    }
    
    public void setUpdatedDate(LocalDateTime updatedDate) {
        this.updatedDate = updatedDate;
    }
    
    public Set<CodeNode> getNodes() {
        return nodes;
    }
    
    public void setNodes(Set<CodeNode> nodes) {
        this.nodes = nodes;
    }
    
    public void addNode(CodeNode node) {
        this.nodes.add(node);
    }
    
    public void removeNode(CodeNode node) {
        this.nodes.remove(node);
    }
    
    public void clearNodes() {
        this.nodes.clear();
    }
}
