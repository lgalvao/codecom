package com.codecom.repository;

import com.codecom.entity.CodeRelationship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for CodeRelationship entities
 * FR.38: Relationship Graph Database
 */
@Repository
public interface CodeRelationshipRepository extends JpaRepository<CodeRelationship, Long> {
    
    /**
     * Find all relationships where the given node is the source
     */
    List<CodeRelationship> findBySourceId(Long sourceId);
    
    /**
     * Find all relationships where the given node is the target
     */
    List<CodeRelationship> findByTargetId(Long targetId);
    
    /**
     * Find all relationships of a specific type
     */
    List<CodeRelationship> findByRelationshipType(String relationshipType);
    
    /**
     * Find all relationships between two nodes
     */
    List<CodeRelationship> findBySourceIdAndTargetId(Long sourceId, Long targetId);
    
    /**
     * Find all relationships from a source node of a specific type
     */
    List<CodeRelationship> findBySourceIdAndRelationshipType(Long sourceId, String relationshipType);
    
    /**
     * Find all relationships to a target node of a specific type
     */
    List<CodeRelationship> findByTargetIdAndRelationshipType(Long targetId, String relationshipType);
    
    /**
     * Find all CALLS relationships (method invocations)
     */
    @Query("SELECT r FROM CodeRelationship r WHERE r.relationshipType = 'CALLS'")
    List<CodeRelationship> findAllCallRelationships();
    
    /**
     * Find all INHERITS relationships (inheritance and implementation)
     */
    @Query("SELECT r FROM CodeRelationship r WHERE r.relationshipType = 'INHERITS'")
    List<CodeRelationship> findAllInheritanceRelationships();
}
