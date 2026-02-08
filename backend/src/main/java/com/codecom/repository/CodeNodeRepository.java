package com.codecom.repository;

import com.codecom.entity.CodeNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for CodeNode entities
 * FR.38: Relationship Graph Database
 */
@Repository
public interface CodeNodeRepository extends JpaRepository<CodeNode, Long> {
    
    /**
     * Find a node by name and type
     */
    Optional<CodeNode> findByNameAndNodeType(String name, String nodeType);
    
    /**
     * Find all nodes of a specific type
     */
    List<CodeNode> findByNodeType(String nodeType);
    
    /**
     * Find all nodes in a specific file
     */
    List<CodeNode> findByFilePath(String filePath);
    
    /**
     * Find all nodes in a specific package
     */
    List<CodeNode> findByPackageName(String packageName);
    
    /**
     * Find nodes by name (case-insensitive search)
     */
    @Query("SELECT n FROM CodeNode n WHERE LOWER(n.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<CodeNode> searchByName(@Param("name") String name);
    
    /**
     * Find all public nodes
     */
    List<CodeNode> findByIsPublicTrue();
}
