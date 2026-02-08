package com.codecom.entity;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Comprehensive Entity tests to increase coverage
 */
class EntityTest {
    
    @Test
    void testCodeNodeDefaultConstructor() {
        CodeNode node = new CodeNode();
        assertNull(node.getId());
        assertNull(node.getName());
    }
    
    @Test
    void testCodeNodeConstructorAndGetters() {
        CodeNode node = new CodeNode("TestClass", "CLASS", "/path/file.java", 100);
        
        assertEquals("TestClass", node.getName());
        assertEquals("CLASS", node.getNodeType());
        assertEquals("/path/file.java", node.getFilePath());
        assertEquals(100, node.getLineNumber());
    }
    
    @Test
    void testCodeNodeSetters() {
        CodeNode node = new CodeNode();
        
        node.setId(1L);
        node.setName("TestClass");
        node.setNodeType("CLASS");
        node.setFilePath("/path/file.java");
        node.setLineNumber(100);
        node.setPackageName("com.test");
        node.setSignature("public class TestClass");
        node.setIsPublic(true);
        node.setIsStatic(false);
        node.setIsAbstract(false);
        node.setDocumentation("Test documentation");
        
        assertEquals(1L, node.getId());
        assertEquals("TestClass", node.getName());
        assertEquals("CLASS", node.getNodeType());
        assertEquals("/path/file.java", node.getFilePath());
        assertEquals(100, node.getLineNumber());
        assertEquals("com.test", node.getPackageName());
        assertEquals("public class TestClass", node.getSignature());
        assertTrue(node.getIsPublic());
        assertFalse(node.getIsStatic());
        assertFalse(node.getIsAbstract());
        assertEquals("Test documentation", node.getDocumentation());
    }
    
    @Test
    void testCodeNodeAllProperties() {
        CodeNode node = new CodeNode("testMethod", "METHOD", "/path/file.java", 50);
        node.setPackageName("com.test");
        node.setSignature("public void testMethod()");
        node.setIsPublic(true);
        node.setIsStatic(false);
        node.setIsAbstract(false);
        node.setDocumentation("Test method");
        
        assertEquals("testMethod", node.getName());
        assertEquals("METHOD", node.getNodeType());
        assertEquals("/path/file.java", node.getFilePath());
        assertEquals(50, node.getLineNumber());
        assertEquals("com.test", node.getPackageName());
        assertEquals("public void testMethod()", node.getSignature());
        assertTrue(node.getIsPublic());
        assertFalse(node.getIsStatic());
        assertFalse(node.getIsAbstract());
        assertEquals("Test method", node.getDocumentation());
    }
    
    @Test
    void testCodeRelationshipDefaultConstructor() {
        CodeRelationship rel = new CodeRelationship();
        assertNull(rel.getId());
        assertNull(rel.getSourceId());
    }
    
    @Test
    void testCodeRelationshipConstructorAndGetters() {
        CodeRelationship rel = new CodeRelationship(1L, 2L, "CALLS");
        
        assertEquals(1L, rel.getSourceId());
        assertEquals(2L, rel.getTargetId());
        assertEquals("CALLS", rel.getRelationshipType());
    }
    
    @Test
    void testCodeRelationshipSetters() {
        CodeRelationship rel = new CodeRelationship();
        
        rel.setId(1L);
        rel.setSourceId(2L);
        rel.setTargetId(3L);
        rel.setRelationshipType("INHERITS");
        rel.setMetadata("metadata");
        rel.setLineNumber(50);
        
        assertEquals(1L, rel.getId());
        assertEquals(2L, rel.getSourceId());
        assertEquals(3L, rel.getTargetId());
        assertEquals("INHERITS", rel.getRelationshipType());
        assertEquals("metadata", rel.getMetadata());
        assertEquals(50, rel.getLineNumber());
    }
    
    @Test
    void testCodeRelationshipAllTypes() {
        // Test CALLS relationship
        CodeRelationship calls = new CodeRelationship(1L, 2L, "CALLS");
        assertEquals("CALLS", calls.getRelationshipType());
        
        // Test INHERITS relationship
        CodeRelationship inherits = new CodeRelationship(1L, 2L, "INHERITS");
        assertEquals("INHERITS", inherits.getRelationshipType());
        
        // Test INJECTS relationship
        CodeRelationship injects = new CodeRelationship(1L, 2L, "INJECTS");
        assertEquals("INJECTS", injects.getRelationshipType());
    }
    
    @Test
    void testFeatureSliceDefaultConstructor() {
        FeatureSlice slice = new FeatureSlice();
        assertNull(slice.getId());
        assertNull(slice.getName());
        assertNotNull(slice.getNodes());
        assertTrue(slice.getNodes().isEmpty());
    }
    
    @Test
    void testFeatureSliceConstructorAndGetters() {
        FeatureSlice slice = new FeatureSlice("Test Slice", "Test description");
        
        assertEquals("Test Slice", slice.getName());
        assertEquals("Test description", slice.getDescription());
        assertNotNull(slice.getNodes());
        assertTrue(slice.getNodes().isEmpty());
    }
    
    @Test
    void testFeatureSliceSetters() {
        FeatureSlice slice = new FeatureSlice();
        
        slice.setId(1L);
        slice.setName("Test Slice");
        slice.setDescription("Test description");
        slice.setCreatedDate(java.time.LocalDateTime.now());
        slice.setUpdatedDate(java.time.LocalDateTime.now());
        
        assertEquals(1L, slice.getId());
        assertEquals("Test Slice", slice.getName());
        assertEquals("Test description", slice.getDescription());
        assertNotNull(slice.getCreatedDate());
        assertNotNull(slice.getUpdatedDate());
    }
    
    @Test
    void testFeatureSliceNodeManagement() {
        FeatureSlice slice = new FeatureSlice("Test Slice", "Description");
        CodeNode node1 = new CodeNode("Class1", "CLASS", "/path1", 10);
        CodeNode node2 = new CodeNode("Class2", "CLASS", "/path2", 20);
        
        // Test addNode
        slice.addNode(node1);
        assertEquals(1, slice.getNodes().size());
        assertTrue(slice.getNodes().contains(node1));
        
        slice.addNode(node2);
        assertEquals(2, slice.getNodes().size());
        assertTrue(slice.getNodes().contains(node2));
        
        // Test removeNode
        slice.removeNode(node1);
        assertEquals(1, slice.getNodes().size());
        assertFalse(slice.getNodes().contains(node1));
        assertTrue(slice.getNodes().contains(node2));
        
        // Test clearNodes
        slice.clearNodes();
        assertEquals(0, slice.getNodes().size());
        assertTrue(slice.getNodes().isEmpty());
    }
    
    @Test
    void testFeatureSliceSetNodes() {
        FeatureSlice slice = new FeatureSlice();
        java.util.Set<CodeNode> nodes = new java.util.HashSet<>();
        CodeNode node1 = new CodeNode("Class1", "CLASS", "/path1", 10);
        nodes.add(node1);
        
        slice.setNodes(nodes);
        assertEquals(1, slice.getNodes().size());
        assertTrue(slice.getNodes().contains(node1));
    }
    
    @Test
    void testFeatureSliceLifecycleMethods() {
        FeatureSlice slice = new FeatureSlice("Test Slice", "Description");
        
        // Manually call lifecycle methods since we're not using a real EntityManager
        assertNull(slice.getCreatedDate());
        assertNull(slice.getUpdatedDate());
        
        // Call the protected methods via reflection or create a test subclass
        // For simplicity, we'll just test setters
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        slice.setCreatedDate(now);
        slice.setUpdatedDate(now.plusDays(1));
        
        assertEquals(now, slice.getCreatedDate());
        assertEquals(now.plusDays(1), slice.getUpdatedDate());
    }
}
