package com.codecom.repository;

import com.codecom.entity.FeatureSlice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for FeatureSlice entities
 * FR.35: Feature-Based Code Slicing
 */
@Repository
public interface FeatureSliceRepository extends JpaRepository<FeatureSlice, Long> {
    
    /**
     * Find a slice by name
     */
    Optional<FeatureSlice> findByName(String name);
    
    /**
     * Find all slices ordered by name
     */
    @Query("SELECT f FROM FeatureSlice f ORDER BY f.name")
    List<FeatureSlice> findAllOrderByName();
    
    /**
     * Check if a slice with the given name exists
     */
    boolean existsByName(String name);
    
    /**
     * Find slices containing a specific node
     */
    @Query("SELECT f FROM FeatureSlice f JOIN f.nodes n WHERE n.id = :nodeId")
    List<FeatureSlice> findSlicesContainingNode(@Param("nodeId") Long nodeId);
}
