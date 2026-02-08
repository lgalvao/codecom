package com.codecom.service;

import com.codecom.dto.FlowGraphEdge;
import com.codecom.dto.FlowGraphNode;
import com.codecom.dto.FlowGraphResponse;
import com.codecom.entity.CodeNode;
import com.codecom.entity.CodeRelationship;
import com.codecom.repository.CodeNodeRepository;
import com.codecom.repository.CodeRelationshipRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.lenient;

/**
 * Tests for FlowGraphService
 * FR.33: Interactive Architecture Flow Graph
 */
@ExtendWith(MockitoExtension.class)
class FlowGraphServiceTest {
    
    @Mock
    private CodeNodeRepository nodeRepository;
    
    @Mock
    private CodeRelationshipRepository relationshipRepository;
    
    @InjectMocks
    private FlowGraphService flowGraphService;
    
    private List<CodeNode> testNodes;
    private List<CodeRelationship> testRelationships;
    
    @BeforeEach
    void setUp() {
        // Create test nodes representing different layers
        testNodes = new ArrayList<>();
        
        // Component layer
        CodeNode component = new CodeNode("UserList", "CLASS", 
            "/project/frontend/src/components/UserList.vue", 10);
        component.setId(1L);
        component.setPackageName("components");
        testNodes.add(component);
        
        // Service TypeScript layer
        CodeNode serviceTs = new CodeNode("UserService", "CLASS", 
            "/project/frontend/src/services/UserService.ts", 5);
        serviceTs.setId(2L);
        serviceTs.setPackageName("services");
        testNodes.add(serviceTs);
        
        // Controller layer
        CodeNode controller = new CodeNode("UserController", "CLASS", 
            "/project/backend/src/main/java/com/example/controller/UserController.java", 15);
        controller.setId(3L);
        controller.setPackageName("com.example.controller");
        testNodes.add(controller);
        
        // Service Java layer
        CodeNode serviceJava = new CodeNode("UserService", "CLASS", 
            "/project/backend/src/main/java/com/example/service/UserService.java", 8);
        serviceJava.setId(4L);
        serviceJava.setPackageName("com.example.service");
        testNodes.add(serviceJava);
        
        // Repository layer
        CodeNode repository = new CodeNode("UserRepository", "INTERFACE", 
            "/project/backend/src/main/java/com/example/repository/UserRepository.java", 5);
        repository.setId(5L);
        repository.setPackageName("com.example.repository");
        testNodes.add(repository);
        
        // Entity layer
        CodeNode entity = new CodeNode("User", "CLASS", 
            "/project/backend/src/main/java/com/example/entity/User.java", 10);
        entity.setId(6L);
        entity.setPackageName("com.example.entity");
        testNodes.add(entity);
        
        // Create test relationships
        testRelationships = new ArrayList<>();
        
        // Component -> Service (HTTP call)
        CodeRelationship rel1 = new CodeRelationship(1L, 2L, "CALLS");
        rel1.setId(1L);
        rel1.setLineNumber(25);
        testRelationships.add(rel1);
        
        // Controller -> Service (DI)
        CodeRelationship rel2 = new CodeRelationship(3L, 4L, "CALLS");
        rel2.setId(2L);
        rel2.setLineNumber(20);
        testRelationships.add(rel2);
        
        // Service -> Repository (DI)
        CodeRelationship rel3 = new CodeRelationship(4L, 5L, "CALLS");
        rel3.setId(3L);
        rel3.setLineNumber(15);
        testRelationships.add(rel3);
        
        // Repository -> Entity (uses)
        CodeRelationship rel4 = new CodeRelationship(5L, 6L, "USES");
        rel4.setId(4L);
        rel4.setLineNumber(0);
        testRelationships.add(rel4);
    }
    
    @Test
    void testBuildFlowGraph_ReturnsCompleteGraph() {
        // Arrange
        when(nodeRepository.findAll()).thenReturn(testNodes);
        when(relationshipRepository.findAll()).thenReturn(testRelationships);
        
        // Act
        FlowGraphResponse response = flowGraphService.buildFlowGraph();
        
        // Assert
        assertNotNull(response);
        assertEquals(6, response.getNodes().size());
        assertEquals(4, response.getEdges().size());
        
        // Verify metadata
        Map<String, Object> metadata = response.getMetadata();
        assertNotNull(metadata);
        assertEquals(6, metadata.get("nodeCount"));
        assertEquals(4, metadata.get("edgeCount"));
        
        verify(nodeRepository).findAll();
        verify(relationshipRepository).findAll();
    }
    
    @Test
    void testBuildFlowGraph_CorrectLayerDetection() {
        // Arrange
        when(nodeRepository.findAll()).thenReturn(testNodes);
        when(relationshipRepository.findAll()).thenReturn(testRelationships);
        
        // Act
        FlowGraphResponse response = flowGraphService.buildFlowGraph();
        
        // Assert
        List<FlowGraphNode> nodes = response.getNodes();
        
        // Check layer assignments
        FlowGraphNode componentNode = nodes.stream()
            .filter(n -> n.getName().equals("UserList"))
            .findFirst()
            .orElse(null);
        assertNotNull(componentNode);
        assertEquals("COMPONENT", componentNode.getLayer());
        
        FlowGraphNode controllerNode = nodes.stream()
            .filter(n -> n.getName().equals("UserController"))
            .findFirst()
            .orElse(null);
        assertNotNull(controllerNode);
        assertEquals("CONTROLLER", controllerNode.getLayer());
        
        FlowGraphNode serviceNode = nodes.stream()
            .filter(n -> n.getName().equals("UserService") && 
                        n.getFilePath().contains("/service/"))
            .findFirst()
            .orElse(null);
        assertNotNull(serviceNode);
        assertEquals("SERVICE_JAVA", serviceNode.getLayer());
        
        FlowGraphNode repoNode = nodes.stream()
            .filter(n -> n.getName().equals("UserRepository"))
            .findFirst()
            .orElse(null);
        assertNotNull(repoNode);
        assertEquals("REPOSITORY", repoNode.getLayer());
        
        FlowGraphNode entityNode = nodes.stream()
            .filter(n -> n.getName().equals("User"))
            .findFirst()
            .orElse(null);
        assertNotNull(entityNode);
        assertEquals("ENTITY", entityNode.getLayer());
    }
    
    @Test
    void testBuildFlowGraph_CorrectEdgeTypes() {
        // Arrange
        when(nodeRepository.findAll()).thenReturn(testNodes);
        when(relationshipRepository.findAll()).thenReturn(testRelationships);
        
        // Act
        FlowGraphResponse response = flowGraphService.buildFlowGraph();
        
        // Assert
        List<FlowGraphEdge> edges = response.getEdges();
        
        // Verify edge types are preserved
        long callsCount = edges.stream()
            .filter(e -> "CALLS".equals(e.getEdgeType()))
            .count();
        assertEquals(3, callsCount);
        
        long usesCount = edges.stream()
            .filter(e -> "USES".equals(e.getEdgeType()))
            .count();
        assertEquals(1, usesCount);
    }
    
    @Test
    void testBuildFlowGraphFromNode_TracesConnectedNodes() {
        // Arrange
        Long startNodeId = 3L; // Controller
        int maxDepth = 3;
        
        lenient().when(nodeRepository.findById(3L)).thenReturn(Optional.of(testNodes.get(2)));
        lenient().when(nodeRepository.findById(4L)).thenReturn(Optional.of(testNodes.get(3)));
        lenient().when(nodeRepository.findById(5L)).thenReturn(Optional.of(testNodes.get(4)));
        lenient().when(nodeRepository.findById(6L)).thenReturn(Optional.of(testNodes.get(5)));
        
        lenient().when(relationshipRepository.findBySourceId(3L)).thenReturn(
            Collections.singletonList(testRelationships.get(1)));
        lenient().when(relationshipRepository.findByTargetId(3L)).thenReturn(Collections.emptyList());
        
        lenient().when(relationshipRepository.findBySourceId(4L)).thenReturn(
            Collections.singletonList(testRelationships.get(2)));
        lenient().when(relationshipRepository.findByTargetId(4L)).thenReturn(
            Collections.singletonList(testRelationships.get(1)));
        
        lenient().when(relationshipRepository.findBySourceId(5L)).thenReturn(
            Collections.singletonList(testRelationships.get(3)));
        lenient().when(relationshipRepository.findByTargetId(5L)).thenReturn(
            Collections.singletonList(testRelationships.get(2)));
        
        lenient().when(relationshipRepository.findBySourceId(6L)).thenReturn(Collections.emptyList());
        lenient().when(relationshipRepository.findByTargetId(6L)).thenReturn(
            Collections.singletonList(testRelationships.get(3)));
        
        lenient().when(relationshipRepository.findById(2L)).thenReturn(Optional.of(testRelationships.get(1)));
        lenient().when(relationshipRepository.findById(3L)).thenReturn(Optional.of(testRelationships.get(2)));
        lenient().when(relationshipRepository.findById(4L)).thenReturn(Optional.of(testRelationships.get(3)));
        
        // Act
        FlowGraphResponse response = flowGraphService.buildFlowGraphFromNode(startNodeId, maxDepth);
        
        // Assert
        assertNotNull(response);
        assertEquals(4, response.getNodes().size()); // Controller, Service, Repository, Entity
        assertEquals(3, response.getEdges().size()); // 3 relationships
        
        Map<String, Object> metadata = response.getMetadata();
        assertEquals("3", metadata.get("startNodeId"));
        assertEquals(3, metadata.get("maxDepth"));
    }
    
    @Test
    void testBuildFlowGraphFromNode_RespectsMaxDepth() {
        // Arrange
        Long startNodeId = 3L;
        int maxDepth = 1;
        
        lenient().when(nodeRepository.findById(3L)).thenReturn(Optional.of(testNodes.get(2)));
        lenient().when(nodeRepository.findById(4L)).thenReturn(Optional.of(testNodes.get(3)));
        
        lenient().when(relationshipRepository.findBySourceId(3L)).thenReturn(
            Collections.singletonList(testRelationships.get(1)));
        lenient().when(relationshipRepository.findByTargetId(3L)).thenReturn(Collections.emptyList());
        
        lenient().when(relationshipRepository.findBySourceId(4L)).thenReturn(Collections.emptyList());
        lenient().when(relationshipRepository.findByTargetId(4L)).thenReturn(
            Collections.singletonList(testRelationships.get(1)));
        
        lenient().when(relationshipRepository.findById(2L)).thenReturn(Optional.of(testRelationships.get(1)));
        
        // Act
        FlowGraphResponse response = flowGraphService.buildFlowGraphFromNode(startNodeId, maxDepth);
        
        // Assert
        assertNotNull(response);
        assertTrue(response.getNodes().size() <= 3); // Limited by depth
    }
    
    @Test
    void testBuildFlowGraphForComponent_FindsComponent() {
        // Arrange
        String componentName = "UserList";
        CodeNode component = testNodes.get(0);
        
        when(nodeRepository.searchByName(componentName)).thenReturn(
            Collections.singletonList(component));
        when(nodeRepository.findById(1L)).thenReturn(Optional.of(component));
        when(relationshipRepository.findBySourceId(1L)).thenReturn(
            Collections.singletonList(testRelationships.get(0)));
        when(relationshipRepository.findByTargetId(1L)).thenReturn(Collections.emptyList());
        when(nodeRepository.findById(2L)).thenReturn(Optional.of(testNodes.get(1)));
        when(relationshipRepository.findBySourceId(2L)).thenReturn(Collections.emptyList());
        when(relationshipRepository.findByTargetId(2L)).thenReturn(
            Collections.singletonList(testRelationships.get(0)));
        when(relationshipRepository.findById(1L)).thenReturn(Optional.of(testRelationships.get(0)));
        
        // Act
        FlowGraphResponse response = flowGraphService.buildFlowGraphForComponent(componentName);
        
        // Assert
        assertNotNull(response);
        assertTrue(response.getNodes().size() > 0);
        
        verify(nodeRepository).searchByName(componentName);
    }
    
    @Test
    void testBuildFlowGraphForComponent_ComponentNotFound() {
        // Arrange
        String componentName = "NonExistent";
        
        when(nodeRepository.searchByName(componentName)).thenReturn(Collections.emptyList());
        
        // Act
        FlowGraphResponse response = flowGraphService.buildFlowGraphForComponent(componentName);
        
        // Assert
        assertNotNull(response);
        assertEquals(0, response.getNodes().size());
        assertEquals(0, response.getEdges().size());
        
        Map<String, Object> metadata = response.getMetadata();
        assertTrue(metadata.containsKey("error"));
        assertEquals("Component not found", metadata.get("error"));
        assertEquals(componentName, metadata.get("componentName"));
    }
    
    @Test
    void testBuildFlowGraph_MetadataContainsLayerCounts() {
        // Arrange
        when(nodeRepository.findAll()).thenReturn(testNodes);
        when(relationshipRepository.findAll()).thenReturn(testRelationships);
        
        // Act
        FlowGraphResponse response = flowGraphService.buildFlowGraph();
        
        // Assert
        Map<String, Object> metadata = response.getMetadata();
        
        @SuppressWarnings("unchecked")
        Map<String, Long> layerCounts = (Map<String, Long>) metadata.get("layerCounts");
        assertNotNull(layerCounts);
        assertTrue(layerCounts.size() > 0);
    }
    
    @Test
    void testBuildFlowGraph_MetadataContainsEdgeTypeCounts() {
        // Arrange
        when(nodeRepository.findAll()).thenReturn(testNodes);
        when(relationshipRepository.findAll()).thenReturn(testRelationships);
        
        // Act
        FlowGraphResponse response = flowGraphService.buildFlowGraph();
        
        // Assert
        Map<String, Object> metadata = response.getMetadata();
        
        @SuppressWarnings("unchecked")
        Map<String, Long> edgeTypeCounts = (Map<String, Long>) metadata.get("edgeTypeCounts");
        assertNotNull(edgeTypeCounts);
        assertTrue(edgeTypeCounts.containsKey("CALLS"));
    }
    
    @Test
    void testBuildFlowGraph_EmptyRepository() {
        // Arrange
        when(nodeRepository.findAll()).thenReturn(Collections.emptyList());
        when(relationshipRepository.findAll()).thenReturn(Collections.emptyList());
        
        // Act
        FlowGraphResponse response = flowGraphService.buildFlowGraph();
        
        // Assert
        assertNotNull(response);
        assertEquals(0, response.getNodes().size());
        assertEquals(0, response.getEdges().size());
        assertEquals(0, response.getMetadata().get("nodeCount"));
        assertEquals(0, response.getMetadata().get("edgeCount"));
    }
    
    @Test
    void testBuildFlowGraph_NodeIdConversion() {
        // Arrange
        when(nodeRepository.findAll()).thenReturn(Collections.singletonList(testNodes.get(0)));
        when(relationshipRepository.findAll()).thenReturn(Collections.emptyList());
        
        // Act
        FlowGraphResponse response = flowGraphService.buildFlowGraph();
        
        // Assert
        FlowGraphNode node = response.getNodes().get(0);
        assertEquals("node-1", node.getId()); // Should be prefixed
    }
    
    @Test
    void testBuildFlowGraph_EdgeLabels() {
        // Arrange
        when(nodeRepository.findAll()).thenReturn(testNodes);
        when(relationshipRepository.findAll()).thenReturn(testRelationships);
        
        // Act
        FlowGraphResponse response = flowGraphService.buildFlowGraph();
        
        // Assert
        List<FlowGraphEdge> edges = response.getEdges();
        
        // Check that labels are generated
        for (FlowGraphEdge edge : edges) {
            assertNotNull(edge.getLabel());
            assertFalse(edge.getLabel().isEmpty());
        }
        
        // Verify specific labels
        FlowGraphEdge callsEdge = edges.stream()
            .filter(e -> "CALLS".equals(e.getEdgeType()))
            .findFirst()
            .orElse(null);
        assertNotNull(callsEdge);
        assertEquals("calls", callsEdge.getLabel());
    }
    
    @Test
    void testBuildFlowGraph_PreservesLineNumbers() {
        // Arrange
        when(nodeRepository.findAll()).thenReturn(testNodes);
        when(relationshipRepository.findAll()).thenReturn(testRelationships);
        
        // Act
        FlowGraphResponse response = flowGraphService.buildFlowGraph();
        
        // Assert
        List<FlowGraphNode> nodes = response.getNodes();
        
        // Verify nodes have line numbers
        FlowGraphNode component = nodes.stream()
            .filter(n -> n.getName().equals("UserList"))
            .findFirst()
            .orElse(null);
        assertNotNull(component);
        assertEquals(10, component.getLineNumber());
        
        // Verify edges have line numbers
        List<FlowGraphEdge> edges = response.getEdges();
        FlowGraphEdge edge = edges.get(0);
        assertNotNull(edge.getLineNumber());
    }
    
    @Test
    void testBuildFlowGraph_HandlesCircularReferences() {
        // Arrange
        CodeRelationship circular1 = new CodeRelationship(3L, 4L, "CALLS");
        circular1.setId(10L);
        CodeRelationship circular2 = new CodeRelationship(4L, 3L, "CALLS");
        circular2.setId(11L);
        
        List<CodeRelationship> circularRels = Arrays.asList(circular1, circular2);
        
        when(nodeRepository.findAll()).thenReturn(testNodes);
        when(relationshipRepository.findAll()).thenReturn(circularRels);
        
        // Act
        FlowGraphResponse response = flowGraphService.buildFlowGraph();
        
        // Assert - should handle without infinite loops
        assertNotNull(response);
        assertEquals(6, response.getNodes().size());
        assertEquals(2, response.getEdges().size());
    }
    
    @Test
    void testBuildFlowGraphFromNode_HandlesIsolatedNode() {
        // Arrange
        Long isolatedNodeId = 1L;
        
        when(nodeRepository.findById(1L)).thenReturn(Optional.of(testNodes.get(0)));
        when(relationshipRepository.findBySourceId(1L)).thenReturn(Collections.emptyList());
        when(relationshipRepository.findByTargetId(1L)).thenReturn(Collections.emptyList());
        
        // Act
        FlowGraphResponse response = flowGraphService.buildFlowGraphFromNode(isolatedNodeId, 5);
        
        // Assert
        assertNotNull(response);
        assertEquals(1, response.getNodes().size());
        assertEquals(0, response.getEdges().size());
    }
    
    @Test
    void testBuildFlowGraph_LayersList() {
        // Arrange
        when(nodeRepository.findAll()).thenReturn(testNodes);
        when(relationshipRepository.findAll()).thenReturn(testRelationships);
        
        // Act
        FlowGraphResponse response = flowGraphService.buildFlowGraph();
        
        // Assert
        Map<String, Object> metadata = response.getMetadata();
        
        @SuppressWarnings("unchecked")
        List<String> layers = (List<String>) metadata.get("layers");
        assertNotNull(layers);
        assertTrue(layers.size() > 0);
        
        // Should be sorted
        List<String> sortedLayers = new ArrayList<>(layers);
        Collections.sort(sortedLayers);
        assertEquals(sortedLayers, layers);
    }
}
