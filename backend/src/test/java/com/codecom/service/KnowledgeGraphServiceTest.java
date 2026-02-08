package com.codecom.service;

import com.codecom.entity.CodeNode;
import com.codecom.entity.CodeRelationship;
import com.codecom.repository.CodeNodeRepository;
import com.codecom.repository.CodeRelationshipRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests for KnowledgeGraphService
 * FR.38: Relationship Graph Database
 * FR.39: Cross-Language Query Support
 */
class KnowledgeGraphServiceTest {
    
    private KnowledgeGraphService service;
    private CodeNodeRepository nodeRepository;
    private CodeRelationshipRepository relationshipRepository;
    
    @TempDir
    Path tempDir;
    
    @BeforeEach
    void setUp() {
        nodeRepository = mock(CodeNodeRepository.class);
        relationshipRepository = mock(CodeRelationshipRepository.class);
        service = new KnowledgeGraphService(nodeRepository, relationshipRepository);
    }
    
    @Test
    void getNodeById_ShouldReturnNode() {
        // Given
        CodeNode node = new CodeNode("TestClass", "CLASS", "/test.java", 1);
        node.setId(1L);
        when(nodeRepository.findById(1L)).thenReturn(Optional.of(node));
        
        // When
        Optional<CodeNode> result = service.getNodeById(1L);
        
        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("TestClass");
    }
    
    @Test
    void getNodeRelationships_ShouldReturnBothIncomingAndOutgoing() {
        // Given
        CodeRelationship outgoing1 = new CodeRelationship(1L, 2L, "CALLS");
        CodeRelationship incoming1 = new CodeRelationship(3L, 1L, "CALLS");
        
        when(relationshipRepository.findBySourceId(1L))
            .thenReturn(List.of(outgoing1));
        when(relationshipRepository.findByTargetId(1L))
            .thenReturn(List.of(incoming1));
        
        // When
        Map<String, List<CodeRelationship>> result = service.getNodeRelationships(1L);
        
        // Then
        assertThat(result).containsKeys("outgoing", "incoming");
        assertThat(result.get("outgoing")).hasSize(1);
        assertThat(result.get("incoming")).hasSize(1);
    }
    
    @Test
    void findInheritanceHierarchy_ShouldReturnParentClasses() {
        // Given
        CodeNode parent = new CodeNode("ParentClass", "CLASS", "/parent.java", 1);
        parent.setId(2L);
        
        CodeRelationship inherits = new CodeRelationship(1L, 2L, "INHERITS");
        when(relationshipRepository.findBySourceIdAndRelationshipType(1L, "INHERITS"))
            .thenReturn(List.of(inherits));
        when(nodeRepository.findById(2L)).thenReturn(Optional.of(parent));
        
        // When
        List<CodeNode> result = service.findInheritanceHierarchy(1L);
        
        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("ParentClass");
    }
    
    @Test
    void findSubclasses_ShouldReturnChildClasses() {
        // Given
        CodeNode child = new CodeNode("ChildClass", "CLASS", "/child.java", 1);
        child.setId(3L);
        
        CodeRelationship inherits = new CodeRelationship(3L, 1L, "INHERITS");
        when(relationshipRepository.findByTargetIdAndRelationshipType(1L, "INHERITS"))
            .thenReturn(List.of(inherits));
        when(nodeRepository.findById(3L)).thenReturn(Optional.of(child));
        
        // When
        List<CodeNode> result = service.findSubclasses(1L);
        
        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("ChildClass");
    }
    
    @Test
    void findCallChain_ShouldFindDirectCall() {
        // Given
        CodeRelationship call = new CodeRelationship(1L, 2L, "CALLS");
        when(relationshipRepository.findBySourceIdAndRelationshipType(1L, "CALLS"))
            .thenReturn(List.of(call));
        
        // When
        List<List<Long>> chains = service.findCallChain(1L, 2L, 5);
        
        // Then
        assertThat(chains).hasSize(1);
        assertThat(chains.get(0)).containsExactly(1L, 2L);
    }
    
    @Test
    void findCallChain_ShouldFindIndirectCall() {
        // Given
        CodeRelationship call1 = new CodeRelationship(1L, 2L, "CALLS");
        CodeRelationship call2 = new CodeRelationship(2L, 3L, "CALLS");
        
        when(relationshipRepository.findBySourceIdAndRelationshipType(1L, "CALLS"))
            .thenReturn(List.of(call1));
        when(relationshipRepository.findBySourceIdAndRelationshipType(2L, "CALLS"))
            .thenReturn(List.of(call2));
        
        // When
        List<List<Long>> chains = service.findCallChain(1L, 3L, 5);
        
        // Then
        assertThat(chains).hasSize(1);
        assertThat(chains.get(0)).containsExactly(1L, 2L, 3L);
    }
    
    @Test
    void executeQuery_CallsQuery_ShouldFindCallers() {
        // Given
        CodeNode method = new CodeNode("testMethod", "METHOD", "/test.java", 10);
        method.setId(1L);
        CodeNode caller = new CodeNode("callerMethod", "METHOD", "/caller.java", 5);
        caller.setId(2L);
        
        when(nodeRepository.searchByName("testMethod")).thenReturn(List.of(method));
        CodeRelationship call = new CodeRelationship(2L, 1L, "CALLS");
        when(relationshipRepository.findByTargetIdAndRelationshipType(1L, "CALLS"))
            .thenReturn(List.of(call));
        when(nodeRepository.findById(2L)).thenReturn(Optional.of(caller));
        
        // When
        List<CodeNode> result = service.executeQuery("calls:testMethod");
        
        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("callerMethod");
    }
    
    @Test
    void executeQuery_InheritsQuery_ShouldFindSubclasses() {
        // Given
        CodeNode parent = new CodeNode("BaseClass", "CLASS", "/base.java", 1);
        parent.setId(1L);
        CodeNode child = new CodeNode("DerivedClass", "CLASS", "/derived.java", 1);
        child.setId(2L);
        
        when(nodeRepository.searchByName("BaseClass")).thenReturn(List.of(parent));
        CodeRelationship inherits = new CodeRelationship(2L, 1L, "INHERITS");
        when(relationshipRepository.findByTargetIdAndRelationshipType(1L, "INHERITS"))
            .thenReturn(List.of(inherits));
        when(nodeRepository.findById(2L)).thenReturn(Optional.of(child));
        
        // When
        List<CodeNode> result = service.executeQuery("inherits:BaseClass");
        
        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("DerivedClass");
    }
    
    @Test
    void executeQuery_TypeQuery_ShouldFindNodesByType() {
        // Given
        CodeNode class1 = new CodeNode("Class1", "CLASS", "/class1.java", 1);
        CodeNode class2 = new CodeNode("Class2", "CLASS", "/class2.java", 1);
        
        when(nodeRepository.findByNodeType("CLASS")).thenReturn(List.of(class1, class2));
        
        // When
        List<CodeNode> result = service.executeQuery("type:CLASS");
        
        // Then
        assertThat(result).hasSize(2);
    }
    
    @Test
    void executeQuery_TypeWithPublicFilter_ShouldFindOnlyPublicNodes() {
        // Given
        CodeNode publicClass = new CodeNode("PublicClass", "CLASS", "/public.java", 1);
        publicClass.setIsPublic(true);
        CodeNode privateClass = new CodeNode("PrivateClass", "CLASS", "/private.java", 1);
        privateClass.setIsPublic(false);
        
        when(nodeRepository.findByNodeType("CLASS"))
            .thenReturn(List.of(publicClass, privateClass));
        
        // When
        List<CodeNode> result = service.executeQuery("type:CLASS public:true");
        
        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("PublicClass");
    }
    
    @Test
    void executeQuery_NameQuery_ShouldSearchByName() {
        // Given
        CodeNode node = new CodeNode("TestMethod", "METHOD", "/test.java", 5);
        when(nodeRepository.searchByName("Test")).thenReturn(List.of(node));
        
        // When
        List<CodeNode> result = service.executeQuery("name:Test");
        
        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("TestMethod");
    }
    
    @Test
    void indexProject_ShouldCreateNodesAndRelationships() throws IOException {
        // Given
        String code = """
            package com.test;
            
            public class Parent {
                public void parentMethod() {}
            }
            
            public class Child extends Parent {
                public void childMethod() {
                    parentMethod();
                }
            }
            """;
        
        Path javaFile = tempDir.resolve("Test.java");
        Files.writeString(javaFile, code);
        
        CodeNode parentClass = new CodeNode("Parent", "CLASS", javaFile.toString(), 3);
        parentClass.setId(1L);
        CodeNode childClass = new CodeNode("Child", "CLASS", javaFile.toString(), 7);
        childClass.setId(2L);
        
        when(nodeRepository.save(any(CodeNode.class)))
            .thenAnswer(invocation -> {
                CodeNode n = invocation.getArgument(0);
                if (n.getName().equals("Parent")) {
                    n.setId(1L);
                } else if (n.getName().equals("Child")) {
                    n.setId(2L);
                }
                return n;
            });
        
        when(nodeRepository.findByFilePath(javaFile.toString()))
            .thenReturn(List.of(parentClass, childClass));
        
        // When
        service.indexProject(tempDir.toString());
        
        // Then
        verify(nodeRepository, atLeastOnce()).save(any(CodeNode.class));
        verify(relationshipRepository, atLeastOnce()).deleteAll();
        verify(nodeRepository, atLeastOnce()).deleteAll();
    }
}
