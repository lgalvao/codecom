package com.codecom.dto;

import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Comprehensive DTO tests to increase coverage
 */
class DtoTest {
    
    // Record DTOs - Test constructor and field access
    
    @Test
    void testExportRequest() {
        List<String> filePaths = List.of("file1.java", "file2.java");
        ExportRequest request = new ExportRequest(filePaths, "markdown", "full", true, "Test Title");
        
        assertEquals(filePaths, request.filePaths());
        assertEquals("markdown", request.format());
        assertEquals("full", request.detailLevel());
        assertTrue(request.includeLineNumbers());
        assertEquals("Test Title", request.title());
    }
    
    @Test
    void testExportResult() {
        ExportResult result = new ExportResult("content", "file.md", "text/markdown", 2, 1000);
        
        assertEquals("content", result.content());
        assertEquals("file.md", result.filename());
        assertEquals("text/markdown", result.mimeType());
        assertEquals(2, result.totalFiles());
        assertEquals(1000, result.totalLines());
    }
    
    @Test
    void testCallerInfo() {
        CallerInfo caller = new CallerInfo("testMethod", "TestClass", "/path/to/file.java", 42, 5);
        
        assertEquals("testMethod", caller.methodName());
        assertEquals("TestClass", caller.className());
        assertEquals("/path/to/file.java", caller.filePath());
        assertEquals(42, caller.line());
        assertEquals(5, caller.callCount());
    }
    
    @Test
    void testStateNode() {
        StateNode node = new StateNode("ACTIVE", "Active State", 10, "ENUM");
        
        assertEquals("ACTIVE", node.id());
        assertEquals("Active State", node.label());
        assertEquals(10, node.line());
        assertEquals("ENUM", node.sourceType());
    }
    
    @Test
    void testFeatureSliceNode() {
        FeatureSliceNode node = new FeatureSliceNode(1L, "TestNode", "METHOD", 
            "/path/file.java", 100, "com.test");
        
        assertEquals(1L, node.id());
        assertEquals("TestNode", node.name());
        assertEquals("METHOD", node.nodeType());
        assertEquals("/path/file.java", node.filePath());
        assertEquals(100, node.lineNumber());
        assertEquals("com.test", node.packageName());
    }
    
    @Test
    void testCodeStatistics() {
        CodeStatistics stats = new CodeStatistics(1000, 800, 150, 50, 50, 10, 5, 2, 3);
        
        assertEquals(1000, stats.totalLines());
        assertEquals(800, stats.codeLines());
        assertEquals(150, stats.commentLines());
        assertEquals(50, stats.blankLines());
        assertEquals(50, stats.methodCount());
        assertEquals(10, stats.classCount());
        assertEquals(5, stats.interfaceCount());
        assertEquals(2, stats.recordCount());
        assertEquals(3, stats.packageCount());
    }
    
    @Test
    void testDeadCodeInfo() {
        DeadCodeInfo info = new DeadCodeInfo("testMethod", "METHOD", "TestClass", 
            "/path/file.java", 50, 0, false, false, "No internal callers");
        
        assertEquals("testMethod", info.name());
        assertEquals("METHOD", info.type());
        assertEquals("TestClass", info.className());
        assertEquals("/path/file.java", info.filePath());
        assertEquals(50, info.line());
        assertEquals(0, info.callerCount());
        assertFalse(info.isPublic());
        assertFalse(info.isTest());
        assertEquals("No internal callers", info.reason());
        assertTrue(info.isPotentiallyDead());
    }
    
    @Test
    void testDeadCodeInfoNotDead() {
        DeadCodeInfo info = new DeadCodeInfo("testMethod", "METHOD", "TestClass",
            "/path/file.java", 50, 5, false, false, "Has callers");
        assertFalse(info.isPotentiallyDead());
    }
    
    @Test
    void testDeadCodeInfoPublic() {
        DeadCodeInfo info = new DeadCodeInfo("testMethod", "METHOD", "TestClass",
            "/path/file.java", 50, 0, true, false, "Public API");
        assertFalse(info.isPotentiallyDead());
    }
    
    @Test
    void testDeadCodeInfoTestReference() {
        DeadCodeInfo info = new DeadCodeInfo("testMethod", "METHOD", "TestClass",
            "/path/file.java", 50, 0, false, true, "Test code");
        assertFalse(info.isPotentiallyDead());
    }
    
    @Test
    void testStateMachineInfo() {
        List<StateNode> states = List.of(new StateNode("IDLE", "Idle state", 10, "ENUM"));
        List<StateTransition> transitions = List.of(
            new StateTransition("t1", "IDLE", "ACTIVE", "start", 20)
        );
        StateMachineInfo info = new StateMachineInfo("state", "OrderState", states, transitions,
            "/path/file.java", 5);
        
        assertEquals("state", info.variableName());
        assertEquals("OrderState", info.variableType());
        assertEquals("/path/file.java", info.filePath());
        assertEquals(5, info.declarationLine());
        assertEquals(states, info.states());
        assertEquals(transitions, info.transitions());
    }
    
    @Test
    void testStateTransition() {
        StateTransition transition = new StateTransition("t1", "IDLE", "ACTIVE", "start", 20);
        
        assertEquals("t1", transition.id());
        assertEquals("IDLE", transition.from());
        assertEquals("ACTIVE", transition.to());
        assertEquals("start", transition.trigger());
        assertEquals(20, transition.line());
    }
    
    @Test
    void testSymbolInfo() {
        SymbolInfo symbol = new SymbolInfo("testMethod", "METHOD", 100, 5, "CORE");
        
        assertEquals("testMethod", symbol.name());
        assertEquals("METHOD", symbol.type());
        assertEquals(100, symbol.line());
        assertEquals(5, symbol.column());
        assertEquals("CORE", symbol.category());
    }
    
    @Test
    void testTestReference() {
        TestReference ref = new TestReference("TestClass", "/test/file.java", 3, List.of(50, 75, 100));
        
        assertEquals("TestClass", ref.testClassName());
        assertEquals("/test/file.java", ref.testFilePath());
        assertEquals(3, ref.referenceCount());
        assertEquals(List.of(50, 75, 100), ref.referenceLines());
    }
    
    @Test
    void testFeatureSliceResponse() {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        FeatureSliceResponse response = new FeatureSliceResponse(1L, "Test Slice", 
            "Description", now, now.plusDays(1), 5, 3, List.of("/path1", "/path2"));
        
        assertEquals(1L, response.id());
        assertEquals("Test Slice", response.name());
        assertEquals("Description", response.description());
        assertEquals(now, response.createdDate());
        assertEquals(now.plusDays(1), response.updatedDate());
        assertEquals(5, response.nodeCount());
        assertEquals(3, response.fileCount());
        assertEquals(List.of("/path1", "/path2"), response.filePaths());
    }
    
    @Test
    void testFileNode() {
        List<FileNode> children = List.of();
        FileNode node = new FileNode("file.java", "/path/file.java", true, children);
        
        assertEquals("file.java", node.name());
        assertEquals("/path/file.java", node.path());
        assertTrue(node.isDirectory());
        assertEquals(children, node.children());
    }
    
    @Test
    void testSymbolDefinition() {
        SymbolDefinition.Parameter param = new SymbolDefinition.Parameter("name", "String");
        List<SymbolDefinition.Parameter> params = List.of(param);
        SymbolDefinition def = new SymbolDefinition("testMethod", "void testMethod(String name)", 
            "METHOD", "void", params, "Test documentation", "/path/file.java", 100, 
            "public void testMethod(String name)");
        
        assertEquals("testMethod", def.name());
        assertEquals("void testMethod(String name)", def.signature());
        assertEquals("METHOD", def.type());
        assertEquals("void", def.returnType());
        assertEquals(params, def.parameters());
        assertEquals("Test documentation", def.documentation());
        assertEquals("/path/file.java", def.filePath());
        assertEquals(100, def.line());
        assertEquals("public void testMethod(String name)", def.codePreview());
        
        assertEquals("name", param.name());
        assertEquals("String", param.type());
    }
    
    // Traditional class DTOs - Test constructors, getters, and setters
    
    @Test
    void testFlowGraphNode() {
        FlowGraphNode node = new FlowGraphNode("id1", "TestClass", "CLASS", 
            "DOMAIN", "/path/file.java", 10, "com.test");
        
        assertEquals("id1", node.getId());
        assertEquals("TestClass", node.getName());
        assertEquals("CLASS", node.getNodeType());
        assertEquals("DOMAIN", node.getLayer());
        assertEquals("/path/file.java", node.getFilePath());
        assertEquals(10, node.getLineNumber());
        assertEquals("com.test", node.getPackageName());
        
        node.setId("id2");
        node.setName("UpdatedClass");
        node.setNodeType("INTERFACE");
        node.setLayer("SERVICE");
        node.setFilePath("/new/path.java");
        node.setLineNumber(20);
        node.setPackageName("com.updated");
        
        assertEquals("id2", node.getId());
        assertEquals("UpdatedClass", node.getName());
        assertEquals("INTERFACE", node.getNodeType());
        assertEquals("SERVICE", node.getLayer());
        assertEquals("/new/path.java", node.getFilePath());
        assertEquals(20, node.getLineNumber());
        assertEquals("com.updated", node.getPackageName());
    }
    
    @Test
    void testFlowGraphResponse() {
        List<FlowGraphNode> nodes = new ArrayList<>();
        List<FlowGraphEdge> edges = new ArrayList<>();
        java.util.Map<String, Object> metadata = new java.util.HashMap<>();
        metadata.put("layer", "DOMAIN");
        FlowGraphResponse response = new FlowGraphResponse(nodes, edges, metadata);
        
        assertEquals(nodes, response.getNodes());
        assertEquals(edges, response.getEdges());
        assertEquals(metadata, response.getMetadata());
        
        List<FlowGraphNode> newNodes = List.of(
            new FlowGraphNode("id1", "Class1", "CLASS", "DOMAIN", "/path1", 10, "pkg1")
        );
        List<FlowGraphEdge> newEdges = List.of(
            new FlowGraphEdge("id1", "id2", "CALLS", "calls")
        );
        java.util.Map<String, Object> newMetadata = new java.util.HashMap<>();
        
        response.setNodes(newNodes);
        response.setEdges(newEdges);
        response.setMetadata(newMetadata);
        
        assertEquals(newNodes, response.getNodes());
        assertEquals(newEdges, response.getEdges());
        assertEquals(newMetadata, response.getMetadata());
    }
    
    @Test
    void testFlowGraphEdge() {
        FlowGraphEdge edge = new FlowGraphEdge("source1", "target1", "CALLS", "calls");
        
        assertEquals("source1", edge.getSourceId());
        assertEquals("target1", edge.getTargetId());
        assertEquals("CALLS", edge.getEdgeType());
        assertEquals("calls", edge.getLabel());
        
        edge.setSourceId("source2");
        edge.setTargetId("target2");
        edge.setEdgeType("INHERITS");
        edge.setLabel("inherits");
        edge.setLineNumber(50);
        
        assertEquals("source2", edge.getSourceId());
        assertEquals("target2", edge.getTargetId());
        assertEquals("INHERITS", edge.getEdgeType());
        assertEquals("inherits", edge.getLabel());
        assertEquals(50, edge.getLineNumber());
    }
    
    @Test
    void testNodeWithRelationships() {
        List<RelationshipInfo> outgoing = List.of(
            new RelationshipInfo(1L, "CALLS", 2L, "targetMethod", "METHOD", null, 50)
        );
        List<RelationshipInfo> incoming = List.of(
            new RelationshipInfo(2L, "CALLS", 1L, "callerMethod", "METHOD", null, 60)
        );
        
        NodeWithRelationships node = new NodeWithRelationships(1L, "testMethod", "METHOD",
            "/path/file.java", 100, "com.test", "void testMethod()", 
            true, false, false, "Test doc", outgoing, incoming);
        
        assertEquals(1L, node.getId());
        assertEquals("testMethod", node.getName());
        assertEquals("METHOD", node.getNodeType());
        assertEquals("/path/file.java", node.getFilePath());
        assertEquals(100, node.getLineNumber());
        assertEquals("com.test", node.getPackageName());
        assertEquals("void testMethod()", node.getSignature());
        assertTrue(node.getIsPublic());
        assertFalse(node.getIsStatic());
        assertFalse(node.getIsAbstract());
        assertEquals("Test doc", node.getDocumentation());
        assertEquals(outgoing, node.getOutgoingRelationships());
        assertEquals(incoming, node.getIncomingRelationships());
        
        node.setId(2L);
        node.setName("updatedMethod");
        node.setNodeType("FIELD");
        node.setFilePath("/new/path.java");
        node.setLineNumber(200);
        node.setPackageName("com.updated");
        node.setSignature("String field");
        node.setIsPublic(false);
        node.setIsStatic(true);
        node.setIsAbstract(true);
        node.setDocumentation("Updated doc");
        List<RelationshipInfo> newOutgoing = new ArrayList<>();
        List<RelationshipInfo> newIncoming = new ArrayList<>();
        node.setOutgoingRelationships(newOutgoing);
        node.setIncomingRelationships(newIncoming);
        
        assertEquals(2L, node.getId());
        assertEquals("updatedMethod", node.getName());
        assertEquals("FIELD", node.getNodeType());
        assertEquals("/new/path.java", node.getFilePath());
        assertEquals(200, node.getLineNumber());
        assertEquals("com.updated", node.getPackageName());
        assertEquals("String field", node.getSignature());
        assertFalse(node.getIsPublic());
        assertTrue(node.getIsStatic());
        assertTrue(node.getIsAbstract());
        assertEquals("Updated doc", node.getDocumentation());
        assertEquals(newOutgoing, node.getOutgoingRelationships());
        assertEquals(newIncoming, node.getIncomingRelationships());
    }
    
    @Test
    void testRelationshipInfo() {
        RelationshipInfo info = new RelationshipInfo(1L, "CALLS", 2L, "targetMethod", "METHOD", "metadata", 50);
        
        assertEquals(1L, info.getRelationshipId());
        assertEquals("CALLS", info.getRelationshipType());
        assertEquals(2L, info.getRelatedNodeId());
        assertEquals("targetMethod", info.getRelatedNodeName());
        assertEquals("METHOD", info.getRelatedNodeType());
        assertEquals("metadata", info.getMetadata());
        assertEquals(50, info.getLineNumber());
        
        info.setRelationshipId(3L);
        info.setRelationshipType("INHERITS");
        info.setRelatedNodeId(4L);
        info.setRelatedNodeName("updatedTarget");
        info.setRelatedNodeType("CLASS");
        info.setMetadata("new metadata");
        info.setLineNumber(100);
        
        assertEquals(3L, info.getRelationshipId());
        assertEquals("INHERITS", info.getRelationshipType());
        assertEquals(4L, info.getRelatedNodeId());
        assertEquals("updatedTarget", info.getRelatedNodeName());
        assertEquals("CLASS", info.getRelatedNodeType());
        assertEquals("new metadata", info.getMetadata());
        assertEquals(100, info.getLineNumber());
    }
    
    @Test
    void testKnowledgeGraphQuery() {
        List<KnowledgeGraphQuery.QueryNode> nodes = new ArrayList<>();
        List<KnowledgeGraphQuery.QueryPath> paths = new ArrayList<>();
        KnowledgeGraphQuery query = new KnowledgeGraphQuery("calls:testMethod", nodes, paths);
        
        assertEquals("calls:testMethod", query.getQuery());
        assertEquals(nodes, query.getNodes());
        assertEquals(paths, query.getPaths());
        assertEquals(0, query.getTotalResults());
        
        query.setQuery("inherits:BaseClass");
        List<KnowledgeGraphQuery.QueryNode> newNodes = new ArrayList<>();
        List<KnowledgeGraphQuery.QueryPath> newPaths = new ArrayList<>();
        query.setNodes(newNodes);
        query.setPaths(newPaths);
        query.setTotalResults(5);
        
        assertEquals("inherits:BaseClass", query.getQuery());
        assertEquals(newNodes, query.getNodes());
        assertEquals(newPaths, query.getPaths());
        assertEquals(5, query.getTotalResults());
    }
    
    @Test
    void testFeatureSliceRequest() {
        List<Long> nodeIds = List.of(1L, 2L, 3L);
        FeatureSliceRequest request = new FeatureSliceRequest("Test Slice", "Description", nodeIds, 2);
        
        assertEquals("Test Slice", request.name());
        assertEquals("Description", request.description());
        assertEquals(nodeIds, request.seedNodeIds());
        assertEquals(2, request.expansionDepth());
    }
    
    @Test
    void testFeatureSliceDetail() {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        List<FeatureSliceNode> nodes = List.of();
        FeatureSliceDetail detail = new FeatureSliceDetail(1L, "Test Slice", "Description",
            now, now.plusDays(1), nodes);
        
        assertEquals(1L, detail.id());
        assertEquals("Test Slice", detail.name());
        assertEquals("Description", detail.description());
        assertEquals(now, detail.createdDate());
        assertEquals(now.plusDays(1), detail.updatedDate());
        assertEquals(nodes, detail.nodes());
    }
    
    @Test
    void testFileComplexity() {
        FileComplexity complexity = new FileComplexity("/path/file.java", 15, 200, 5);
        
        assertEquals("/path/file.java", complexity.getFilePath());
        assertEquals(15, complexity.getCyclomaticComplexity());
        assertEquals(200, complexity.getLinesOfCode());
        assertEquals(5, complexity.getNumberOfMethods());
        
        complexity.setFilePath("/new/path.java");
        complexity.setCyclomaticComplexity(5);
        complexity.setLinesOfCode(100);
        complexity.setNumberOfMethods(3);
        complexity.setComplexityScore(0.25);
        complexity.setComplexityLevel("LOW");
        
        assertEquals("/new/path.java", complexity.getFilePath());
        assertEquals(5, complexity.getCyclomaticComplexity());
        assertEquals(100, complexity.getLinesOfCode());
        assertEquals(3, complexity.getNumberOfMethods());
        assertEquals(0.25, complexity.getComplexityScore());
        assertEquals("LOW", complexity.getComplexityLevel());
    }
    
    @Test
    void testCallerStatistics() {
        List<CallerInfo> callers = List.of(
            new CallerInfo("caller1", "Class1", "/path1", 10, 1)
        );
        CallerStatistics stats = new CallerStatistics("testMethod", "TestClass", 5, 10, callers);
        
        assertEquals("testMethod", stats.targetMethod());
        assertEquals("TestClass", stats.targetClass());
        assertEquals(5, stats.totalCallers());
        assertEquals(10, stats.totalCallSites());
        assertEquals(callers, stats.callers());
    }
    
    @Test
    void testSymbolSearchResult() {
        SymbolSearchResult result = new SymbolSearchResult("testMethod", "METHOD",
            100, 5, "CORE", "/path/file.java", "file.java");
        
        assertEquals("testMethod", result.name());
        assertEquals("METHOD", result.type());
        assertEquals(100, result.line());
        assertEquals(5, result.column());
        assertEquals("CORE", result.category());
        assertEquals("/path/file.java", result.filePath());
        assertEquals("file.java", result.fileName());
    }
}
