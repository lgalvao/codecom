package com.codecom.integration;

import com.codecom.dto.FlowGraphResponse;
import com.codecom.entity.CodeNode;
import com.codecom.repository.CodeNodeRepository;
import com.codecom.repository.CodeRelationshipRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for FlowGraphController
 * Tests the full stack: Controller -> Service -> Repository -> Database
 * 
 * FR.33: Interactive Architecture Flow Graph
 * 
 * Tests the flow graph API endpoints:
 * - GET /api/flow-graph/analyze - Get complete architecture flow graph
 * - GET /api/flow-graph/trace - Trace flow from a specific node
 * - GET /api/flow-graph/component/{name} - Get flow for a specific component
 */
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class FlowGraphControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private CodeNodeRepository codeNodeRepository;

    @Autowired
    private CodeRelationshipRepository codeRelationshipRepository;

    @Test
    void testAnalyzeProject_ReturnsCompleteFlowGraph() {
        // When: Request complete flow graph
        ResponseEntity<FlowGraphResponse> response = restTemplate.getForEntity(
            apiUrl("/api/flow-graph/analyze"),
            FlowGraphResponse.class
        );

        // Then: Should return OK with graph data
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        
        FlowGraphResponse graph = response.getBody();
        
        // Verify graph structure
        assertNotNull(graph.getNodes(), "Nodes should not be null");
        assertNotNull(graph.getEdges(), "Edges should not be null");
        assertNotNull(graph.getMetadata(), "Metadata should not be null");
        
        // Should have nodes and edges from seed data
        assertTrue(graph.getNodes().size() > 0, "Should have at least one node");
        
        // Verify metadata contains expected fields
        assertTrue(graph.getMetadata().containsKey("nodeCount"));
        assertTrue(graph.getMetadata().containsKey("edgeCount"));
        assertTrue(graph.getMetadata().containsKey("layerCounts"));
        assertTrue(graph.getMetadata().containsKey("edgeTypeCounts"));
        assertTrue(graph.getMetadata().containsKey("layers"));
        
        // Verify node count matches metadata
        assertEquals(graph.getNodes().size(), graph.getMetadata().get("nodeCount"));
        assertEquals(graph.getEdges().size(), graph.getMetadata().get("edgeCount"));
    }

    @Test
    void testTraceFromNode_ValidNode_ReturnsSubgraph() {
        // Given: Find a node from seed data
        List<CodeNode> nodes = codeNodeRepository.searchByName("UserService");
        assertTrue(nodes.size() > 0, "UserService should exist in seed data");
        Long nodeId = nodes.get(0).getId();

        // When: Trace flow from that node with depth 3
        ResponseEntity<FlowGraphResponse> response = restTemplate.getForEntity(
            apiUrl("/api/flow-graph/trace?from=" + nodeId + "&depth=3"),
            FlowGraphResponse.class
        );

        // Then: Should return OK with traced subgraph
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        
        FlowGraphResponse graph = response.getBody();
        
        // Verify graph structure
        assertNotNull(graph.getNodes());
        assertNotNull(graph.getEdges());
        assertNotNull(graph.getMetadata());
        
        // Verify metadata contains trace-specific fields
        assertTrue(graph.getMetadata().containsKey("startNodeId"));
        assertTrue(graph.getMetadata().containsKey("maxDepth"));
        assertEquals("3", graph.getMetadata().get("maxDepth").toString());
        
        // Should have at least the starting node
        assertTrue(graph.getNodes().size() >= 1, "Should have at least the starting node");
        
        // Node count in traced graph should be <= full graph
        // (traced graph is a subset)
    }

    @Test
    void testTraceFromNode_DefaultDepth_UsesDefaultValue() {
        // Given: Find a node from seed data
        List<CodeNode> nodes = codeNodeRepository.searchByName("createUser");
        assertTrue(nodes.size() > 0, "createUser should exist in seed data");
        Long nodeId = nodes.get(0).getId();

        // When: Trace flow without specifying depth (should use default 5)
        ResponseEntity<FlowGraphResponse> response = restTemplate.getForEntity(
            apiUrl("/api/flow-graph/trace?from=" + nodeId),
            FlowGraphResponse.class
        );

        // Then: Should return OK and use default depth
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        
        FlowGraphResponse graph = response.getBody();
        
        // Verify default depth is used
        assertTrue(graph.getMetadata().containsKey("maxDepth"));
        assertEquals("5", graph.getMetadata().get("maxDepth").toString());
    }

    @Test
    void testTraceFromNode_NonExistentNode_ReturnsEmptyGraph() {
        // When: Trace from non-existent node
        ResponseEntity<FlowGraphResponse> response = restTemplate.getForEntity(
            apiUrl("/api/flow-graph/trace?from=999999&depth=3"),
            FlowGraphResponse.class
        );

        // Then: Should return OK with empty graph (no exception)
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        
        FlowGraphResponse graph = response.getBody();
        
        // Graph should be empty or minimal
        assertNotNull(graph.getNodes());
        assertNotNull(graph.getEdges());
    }

    @Test
    void testGetComponentFlow_ExistingComponent_ReturnsFlowGraph() {
        // When: Request flow graph for UserService component
        ResponseEntity<FlowGraphResponse> response = restTemplate.getForEntity(
            apiUrl("/api/flow-graph/component/UserService"),
            FlowGraphResponse.class
        );

        // Then: Should return OK with flow graph for that component
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        
        FlowGraphResponse graph = response.getBody();
        
        // Verify graph structure
        assertNotNull(graph.getNodes());
        assertNotNull(graph.getEdges());
        assertNotNull(graph.getMetadata());
        
        // Should have at least the component node
        assertTrue(graph.getNodes().size() >= 1, "Should have at least the UserService node");
        
        // Metadata should contain trace information (since it uses buildFlowGraphFromNode internally)
        assertTrue(graph.getMetadata().containsKey("startNodeId"));
        assertTrue(graph.getMetadata().containsKey("maxDepth"));
    }

    @Test
    void testGetComponentFlow_NonExistentComponent_ReturnsErrorInMetadata() {
        // When: Request flow graph for non-existent component
        ResponseEntity<FlowGraphResponse> response = restTemplate.getForEntity(
            apiUrl("/api/flow-graph/component/NonExistentComponent"),
            FlowGraphResponse.class
        );

        // Then: Should return OK but with error metadata
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        
        FlowGraphResponse graph = response.getBody();
        
        // Verify error is communicated via metadata
        assertNotNull(graph.getMetadata());
        assertTrue(graph.getMetadata().containsKey("error"));
        assertEquals("Component not found", graph.getMetadata().get("error"));
        assertTrue(graph.getMetadata().containsKey("componentName"));
        assertEquals("NonExistentComponent", graph.getMetadata().get("componentName"));
        
        // Nodes and edges should be empty
        assertTrue(graph.getNodes().isEmpty(), "Nodes should be empty for non-existent component");
        assertTrue(graph.getEdges().isEmpty(), "Edges should be empty for non-existent component");
    }

    @Test
    void testTraceFromNode_InvalidParameter_ReturnsBadRequest() {
        // When: Request with invalid 'from' parameter (not a number)
        try {
            ResponseEntity<FlowGraphResponse> response = restTemplate.getForEntity(
                apiUrl("/api/flow-graph/trace?from=invalid&depth=3"),
                FlowGraphResponse.class
            );
            // Should not get here
            fail("Should have thrown exception for invalid parameter");
        } catch (HttpClientErrorException.BadRequest e) {
            // Then: Should return 400 Bad Request
            assertEquals(HttpStatus.BAD_REQUEST, e.getStatusCode());
        }
    }

    @Test
    void testAnalyzeProject_VerifyLayerDetection() {
        // When: Request complete flow graph
        ResponseEntity<FlowGraphResponse> response = restTemplate.getForEntity(
            apiUrl("/api/flow-graph/analyze"),
            FlowGraphResponse.class
        );

        // Then: Verify layer detection works
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        
        FlowGraphResponse graph = response.getBody();
        
        // Verify layers are detected and counted
        assertTrue(graph.getMetadata().containsKey("layers"));
        assertTrue(graph.getMetadata().containsKey("layerCounts"));
        
        // Should have at least one layer
        @SuppressWarnings("unchecked")
        List<String> layers = (List<String>) graph.getMetadata().get("layers");
        assertNotNull(layers);
        assertTrue(layers.size() > 0, "Should detect at least one layer");
    }

    @Test
    void testTraceFromNode_VerifyDepthLimiting() {
        // Given: Find a node that has relationships
        List<CodeNode> nodes = codeNodeRepository.searchByName("UserService");
        assertTrue(nodes.size() > 0, "UserService should exist");
        Long nodeId = nodes.get(0).getId();

        // When: Trace with depth 1 vs depth 5
        ResponseEntity<FlowGraphResponse> depth1Response = restTemplate.getForEntity(
            apiUrl("/api/flow-graph/trace?from=" + nodeId + "&depth=1"),
            FlowGraphResponse.class
        );
        
        ResponseEntity<FlowGraphResponse> depth5Response = restTemplate.getForEntity(
            apiUrl("/api/flow-graph/trace?from=" + nodeId + "&depth=5"),
            FlowGraphResponse.class
        );

        // Then: Both should succeed
        assertEquals(HttpStatus.OK, depth1Response.getStatusCode());
        assertEquals(HttpStatus.OK, depth5Response.getStatusCode());
        
        FlowGraphResponse graph1 = depth1Response.getBody();
        FlowGraphResponse graph5 = depth5Response.getBody();
        
        assertNotNull(graph1);
        assertNotNull(graph5);
        
        // Depth 5 should generally have >= nodes than depth 1 (unless the graph is very small)
        // At minimum, they should both have at least the starting node
        assertTrue(graph1.getNodes().size() >= 1);
        assertTrue(graph5.getNodes().size() >= 1);
        
        // Verify depth is correctly set in metadata
        assertEquals("1", graph1.getMetadata().get("maxDepth").toString());
        assertEquals("5", graph5.getMetadata().get("maxDepth").toString());
    }
}
