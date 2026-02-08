package com.codecom.controller;

import com.codecom.dto.KnowledgeGraphQuery;
import com.codecom.dto.NodeWithRelationships;
import com.codecom.entity.CodeNode;
import com.codecom.entity.CodeRelationship;
import com.codecom.service.KnowledgeGraphService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * Tests for KnowledgeGraphController
 * FR.38: Relationship Graph Database
 * FR.39: Cross-Language Query Support
 */
class KnowledgeGraphControllerTest {
    
    private KnowledgeGraphController controller;
    private KnowledgeGraphService service;
    
    @BeforeEach
    void setUp() {
        service = mock(KnowledgeGraphService.class);
        controller = new KnowledgeGraphController(service);
    }
    
    @Test
    void getNode_ExistingNode_ShouldReturnNodeWithRelationships() {
        // Given
        CodeNode node = new CodeNode("TestClass", "CLASS", "/test.java", 1);
        node.setId(1L);
        node.setPackageName("com.test");
        node.setIsPublic(true);
        
        CodeRelationship outgoing = new CodeRelationship(1L, 2L, "CALLS");
        outgoing.setId(10L);
        outgoing.setLineNumber(5);
        
        CodeRelationship incoming = new CodeRelationship(3L, 1L, "INHERITS");
        incoming.setId(11L);
        incoming.setLineNumber(10);
        
        CodeNode target = new CodeNode("TargetMethod", "METHOD", "/target.java", 1);
        target.setId(2L);
        
        CodeNode source = new CodeNode("SourceClass", "CLASS", "/source.java", 1);
        source.setId(3L);
        
        when(service.getNodeById(1L)).thenReturn(Optional.of(node));
        when(service.getNodeRelationships(1L)).thenReturn(Map.of(
            "outgoing", List.of(outgoing),
            "incoming", List.of(incoming)
        ));
        when(service.getNodeById(2L)).thenReturn(Optional.of(target));
        when(service.getNodeById(3L)).thenReturn(Optional.of(source));
        
        // When
        ResponseEntity<NodeWithRelationships> response = controller.getNode(1L);
        
        // Then
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        NodeWithRelationships result = response.getBody();
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("TestClass");
        assertThat(result.getOutgoingRelationships()).hasSize(1);
        assertThat(result.getIncomingRelationships()).hasSize(1);
        assertThat(result.getOutgoingRelationships().get(0).getRelatedNodeName()).isEqualTo("TargetMethod");
        assertThat(result.getIncomingRelationships().get(0).getRelatedNodeName()).isEqualTo("SourceClass");
    }
    
    @Test
    void getNode_NonExistingNode_ShouldReturnNotFound() {
        // Given
        when(service.getNodeById(999L)).thenReturn(Optional.empty());
        
        // When
        ResponseEntity<NodeWithRelationships> response = controller.getNode(999L);
        
        // Then
        assertThat(response.getStatusCode().is4xxClientError()).isTrue();
    }
    
    @Test
    void getCallees_ShouldReturnNodesCalledByGivenNode() {
        // Given
        CodeNode callee1 = new CodeNode("method1", "METHOD", "/test.java", 5);
        CodeNode callee2 = new CodeNode("method2", "METHOD", "/test.java", 10);
        
        when(service.findCallees(1L)).thenReturn(List.of(callee1, callee2));
        
        // When
        ResponseEntity<List<CodeNode>> response = controller.getCallees(1L);
        
        // Then
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).hasSize(2);
    }
    
    @Test
    void getCallers_ShouldReturnNodesThatCallGivenNode() {
        // Given
        CodeNode caller1 = new CodeNode("callerMethod", "METHOD", "/caller.java", 3);
        
        when(service.findCallers(1L)).thenReturn(List.of(caller1));
        
        // When
        ResponseEntity<List<CodeNode>> response = controller.getCallers(1L);
        
        // Then
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody().get(0).getName()).isEqualTo("callerMethod");
    }
    
    @Test
    void getInheritanceHierarchy_ShouldReturnParentClasses() {
        // Given
        CodeNode parent = new CodeNode("BaseClass", "CLASS", "/base.java", 1);
        
        when(service.findInheritanceHierarchy(1L)).thenReturn(List.of(parent));
        
        // When
        ResponseEntity<List<CodeNode>> response = controller.getInheritanceHierarchy(1L);
        
        // Then
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody().get(0).getName()).isEqualTo("BaseClass");
    }
    
    @Test
    void getSubclasses_ShouldReturnChildClasses() {
        // Given
        CodeNode child = new CodeNode("DerivedClass", "CLASS", "/derived.java", 1);
        
        when(service.findSubclasses(1L)).thenReturn(List.of(child));
        
        // When
        ResponseEntity<List<CodeNode>> response = controller.getSubclasses(1L);
        
        // Then
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody().get(0).getName()).isEqualTo("DerivedClass");
    }
    
    @Test
    void findCallChain_ShouldReturnPathsBetweenNodes() {
        // Given
        List<List<Long>> chains = List.of(
            List.of(1L, 2L, 3L),
            List.of(1L, 4L, 3L)
        );
        
        when(service.findCallChain(1L, 3L, 5)).thenReturn(chains);
        
        // When
        ResponseEntity<List<List<Long>>> response = controller.findCallChain(1L, 3L, 5);
        
        // Then
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).hasSize(2);
        assertThat(response.getBody().get(0)).containsExactly(1L, 2L, 3L);
    }
    
    @Test
    void executeQuery_CallsQuery_ShouldReturnCallers() {
        // Given
        CodeNode caller = new CodeNode("callerMethod", "METHOD", "/caller.java", 5);
        caller.setId(1L);
        caller.setPackageName("com.test");
        caller.setSignature("void callerMethod()");
        
        when(service.executeQuery("calls:testMethod")).thenReturn(List.of(caller));
        
        // When
        ResponseEntity<KnowledgeGraphQuery> response = controller.executeQuery("calls:testMethod");
        
        // Then
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        KnowledgeGraphQuery result = response.getBody();
        assertThat(result).isNotNull();
        assertThat(result.getQuery()).isEqualTo("calls:testMethod");
        assertThat(result.getNodes()).hasSize(1);
        assertThat(result.getNodes().get(0).getName()).isEqualTo("callerMethod");
        assertThat(result.getTotalResults()).isEqualTo(1);
    }
    
    @Test
    void executeQuery_TypeQuery_ShouldReturnNodesByType() {
        // Given
        CodeNode class1 = new CodeNode("Class1", "CLASS", "/class1.java", 1);
        class1.setId(1L);
        CodeNode class2 = new CodeNode("Class2", "CLASS", "/class2.java", 1);
        class2.setId(2L);
        
        when(service.executeQuery("type:CLASS")).thenReturn(List.of(class1, class2));
        
        // When
        ResponseEntity<KnowledgeGraphQuery> response = controller.executeQuery("type:CLASS");
        
        // Then
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody().getNodes()).hasSize(2);
    }
    
    @Test
    void searchNodes_ShouldReturnMatchingNodes() {
        // Given
        CodeNode node = new CodeNode("TestClass", "CLASS", "/test.java", 1);
        
        when(service.findNodesByName("Test")).thenReturn(List.of(node));
        
        // When
        ResponseEntity<List<CodeNode>> response = controller.searchNodes("Test");
        
        // Then
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody().get(0).getName()).isEqualTo("TestClass");
    }
    
    @Test
    void searchNodes_NoMatches_ShouldReturnEmptyList() {
        // Given
        when(service.findNodesByName("NonExistent")).thenReturn(new ArrayList<>());
        
        // When
        ResponseEntity<List<CodeNode>> response = controller.searchNodes("NonExistent");
        
        // Then
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isEmpty();
    }
}
