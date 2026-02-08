package com.codecom.controller;

import com.codecom.dto.FlowGraphEdge;
import com.codecom.dto.FlowGraphNode;
import com.codecom.dto.FlowGraphResponse;
import com.codecom.service.FlowGraphService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * Tests for FlowGraphController
 * FR.33: Interactive Architecture Flow Graph
 */
class FlowGraphControllerTest {
    
    private FlowGraphController controller;
    private FlowGraphService flowGraphService;
    
    private FlowGraphResponse testResponse;
    
    @BeforeEach
    void setUp() {
        flowGraphService = mock(FlowGraphService.class);
        controller = new FlowGraphController(flowGraphService);
        
        List<FlowGraphNode> nodes = new ArrayList<>();
        nodes.add(new FlowGraphNode("node-1", "UserList", "CLASS", "COMPONENT", 
            "/frontend/components/UserList.vue", 10, "components"));
        nodes.add(new FlowGraphNode("node-2", "UserController", "CLASS", "CONTROLLER", 
            "/backend/controller/UserController.java", 15, "com.example.controller"));
        
        List<FlowGraphEdge> edges = new ArrayList<>();
        edges.add(new FlowGraphEdge("node-1", "node-2", "CALLS", "calls", 25));
        
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("nodeCount", 2);
        metadata.put("edgeCount", 1);
        
        testResponse = new FlowGraphResponse(nodes, edges, metadata);
    }
    
    @Test
    void testAnalyzeProject_ReturnsFlowGraph() {
        // Arrange
        when(flowGraphService.buildFlowGraph()).thenReturn(testResponse);
        
        // Act
        ResponseEntity<FlowGraphResponse> response = controller.analyzeProject();
        
        // Assert
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getNodes()).hasSize(2);
        assertThat(response.getBody().getEdges()).hasSize(1);
        assertThat(response.getBody().getMetadata().get("nodeCount")).isEqualTo(2);
        assertThat(response.getBody().getMetadata().get("edgeCount")).isEqualTo(1);
        assertThat(response.getBody().getNodes().get(0).getName()).isEqualTo("UserList");
        assertThat(response.getBody().getNodes().get(0).getLayer()).isEqualTo("COMPONENT");
        assertThat(response.getBody().getEdges().get(0).getEdgeType()).isEqualTo("CALLS");
        
        verify(flowGraphService).buildFlowGraph();
    }
    
    @Test
    void testTraceFromNode_WithDefaultDepth() {
        // Arrange
        Long nodeId = 1L;
        when(flowGraphService.buildFlowGraphFromNode(eq(nodeId), eq(5)))
            .thenReturn(testResponse);
        
        // Act
        ResponseEntity<FlowGraphResponse> response = controller.traceFromNode(nodeId, 5);
        
        // Assert
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getNodes()).hasSize(2);
        assertThat(response.getBody().getEdges()).hasSize(1);
        
        verify(flowGraphService).buildFlowGraphFromNode(1L, 5);
    }
    
    @Test
    void testTraceFromNode_WithCustomDepth() {
        // Arrange
        Long nodeId = 1L;
        int depth = 3;
        when(flowGraphService.buildFlowGraphFromNode(eq(nodeId), eq(depth)))
            .thenReturn(testResponse);
        
        // Act
        ResponseEntity<FlowGraphResponse> response = controller.traceFromNode(nodeId, depth);
        
        // Assert
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getNodes()).hasSize(2);
        
        verify(flowGraphService).buildFlowGraphFromNode(1L, 3);
    }
    
    @Test
    void testGetComponentFlow_ReturnsFlow() {
        // Arrange
        String componentName = "UserList";
        when(flowGraphService.buildFlowGraphForComponent(componentName))
            .thenReturn(testResponse);
        
        // Act
        ResponseEntity<FlowGraphResponse> response = controller.getComponentFlow(componentName);
        
        // Assert
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getNodes()).hasSize(2);
        assertThat(response.getBody().getEdges()).hasSize(1);
        
        verify(flowGraphService).buildFlowGraphForComponent(componentName);
    }
    
    @Test
    void testGetComponentFlow_ComponentNotFound() {
        // Arrange
        String componentName = "NonExistent";
        FlowGraphResponse emptyResponse = new FlowGraphResponse(
            new ArrayList<>(),
            new ArrayList<>(),
            Map.of("error", "Component not found", "componentName", componentName)
        );
        
        when(flowGraphService.buildFlowGraphForComponent(componentName))
            .thenReturn(emptyResponse);
        
        // Act
        ResponseEntity<FlowGraphResponse> response = controller.getComponentFlow(componentName);
        
        // Assert
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getNodes()).hasSize(0);
        assertThat(response.getBody().getEdges()).hasSize(0);
        assertThat(response.getBody().getMetadata().get("error")).isEqualTo("Component not found");
        
        verify(flowGraphService).buildFlowGraphForComponent(componentName);
    }
    
    @Test
    void testAnalyzeProject_HandlesEmptyGraph() {
        // Arrange
        FlowGraphResponse emptyResponse = new FlowGraphResponse(
            new ArrayList<>(),
            new ArrayList<>(),
            Map.of("nodeCount", 0, "edgeCount", 0)
        );
        
        when(flowGraphService.buildFlowGraph()).thenReturn(emptyResponse);
        
        // Act
        ResponseEntity<FlowGraphResponse> response = controller.analyzeProject();
        
        // Assert
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getNodes()).hasSize(0);
        assertThat(response.getBody().getEdges()).hasSize(0);
        assertThat(response.getBody().getMetadata().get("nodeCount")).isEqualTo(0);
        
        verify(flowGraphService).buildFlowGraph();
    }
    
    @Test
    void testTraceFromNode_LargeDepth() {
        // Arrange
        when(flowGraphService.buildFlowGraphFromNode(eq(1L), eq(10)))
            .thenReturn(testResponse);
        
        // Act
        ResponseEntity<FlowGraphResponse> response = controller.traceFromNode(1L, 10);
        
        // Assert
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        
        verify(flowGraphService).buildFlowGraphFromNode(1L, 10);
    }
}
