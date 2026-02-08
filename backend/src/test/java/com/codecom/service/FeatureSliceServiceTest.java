package com.codecom.service;

import com.codecom.entity.CodeNode;
import com.codecom.entity.CodeRelationship;
import com.codecom.entity.FeatureSlice;
import com.codecom.repository.CodeNodeRepository;
import com.codecom.repository.CodeRelationshipRepository;
import com.codecom.repository.FeatureSliceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests for FeatureSliceService
 * FR.35: Feature-Based Code Slicing
 */
class FeatureSliceServiceTest {
    
    private FeatureSliceService service;
    private FeatureSliceRepository sliceRepository;
    private CodeNodeRepository nodeRepository;
    private CodeRelationshipRepository relationshipRepository;
    
    @BeforeEach
    void setUp() {
        sliceRepository = mock(FeatureSliceRepository.class);
        nodeRepository = mock(CodeNodeRepository.class);
        relationshipRepository = mock(CodeRelationshipRepository.class);
        service = new FeatureSliceService(sliceRepository, nodeRepository, relationshipRepository);
    }
    
    @Test
    void createSlice_WithSeedNodes_ShouldCreateSliceSuccessfully() {
        // Given
        String name = "User Management";
        String description = "User authentication and authorization";
        List<Long> seedNodeIds = List.of(1L, 2L);
        
        CodeNode node1 = new CodeNode("UserService", "CLASS", "/UserService.java", 1);
        node1.setId(1L);
        CodeNode node2 = new CodeNode("UserController", "CLASS", "/UserController.java", 1);
        node2.setId(2L);
        
        when(sliceRepository.existsByName(name)).thenReturn(false);
        when(nodeRepository.findById(1L)).thenReturn(Optional.of(node1));
        when(nodeRepository.findById(2L)).thenReturn(Optional.of(node2));
        when(sliceRepository.save(any(FeatureSlice.class))).thenAnswer(invocation -> {
            FeatureSlice slice = invocation.getArgument(0);
            slice.setId(1L);
            return slice;
        });
        
        // When
        FeatureSlice result = service.createSlice(name, description, seedNodeIds);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo(name);
        assertThat(result.getDescription()).isEqualTo(description);
        assertThat(result.getNodes()).hasSize(2);
        verify(sliceRepository).save(any(FeatureSlice.class));
    }
    
    @Test
    void createSlice_WithDuplicateName_ShouldThrowException() {
        // Given
        String name = "Existing Slice";
        when(sliceRepository.existsByName(name)).thenReturn(true);
        
        // When & Then
        assertThatThrownBy(() -> service.createSlice(name, "desc", List.of()))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("already exists");
    }
    
    @Test
    void expandSlice_WithCallees_ShouldAddCalledMethods() {
        // Given
        CodeNode method1 = new CodeNode("method1", "METHOD", "/Test.java", 10);
        method1.setId(1L);
        CodeNode method2 = new CodeNode("method2", "METHOD", "/Test.java", 20);
        method2.setId(2L);
        
        FeatureSlice slice = new FeatureSlice("Test", "Test slice");
        slice.setId(1L);
        slice.addNode(method1);
        
        CodeRelationship callRel = new CodeRelationship(1L, 2L, "CALLS");
        
        when(sliceRepository.findById(1L)).thenReturn(Optional.of(slice));
        when(relationshipRepository.findBySourceIdAndRelationshipType(1L, "CALLS"))
            .thenReturn(List.of(callRel));
        when(nodeRepository.findById(2L)).thenReturn(Optional.of(method2));
        when(relationshipRepository.findByTargetIdAndRelationshipType(anyLong(), eq("CALLS")))
            .thenReturn(List.of());
        when(relationshipRepository.findBySourceIdAndRelationshipType(eq(2L), eq("CALLS")))
            .thenReturn(List.of());
        when(relationshipRepository.findByTargetIdAndRelationshipType(anyLong(), eq("INHERITS")))
            .thenReturn(List.of());
        when(relationshipRepository.findBySourceIdAndRelationshipType(anyLong(), eq("INHERITS")))
            .thenReturn(List.of());
        when(sliceRepository.save(any(FeatureSlice.class))).thenAnswer(i -> i.getArgument(0));
        
        // When
        FeatureSlice result = service.expandSlice(1L, 1, false, true, false);
        
        // Then
        assertThat(result.getNodes()).hasSize(2);
        assertThat(result.getNodes()).extracting(CodeNode::getName)
            .containsExactlyInAnyOrder("method1", "method2");
    }
    
    @Test
    void expandSlice_WithInheritance_ShouldAddParentAndChildClasses() {
        // Given
        CodeNode childClass = new CodeNode("ChildClass", "CLASS", "/Child.java", 1);
        childClass.setId(1L);
        CodeNode parentClass = new CodeNode("ParentClass", "CLASS", "/Parent.java", 1);
        parentClass.setId(2L);
        CodeNode anotherChild = new CodeNode("AnotherChild", "CLASS", "/AnotherChild.java", 1);
        anotherChild.setId(3L);
        
        FeatureSlice slice = new FeatureSlice("Inheritance Test", "Test");
        slice.setId(1L);
        slice.addNode(childClass);
        
        CodeRelationship inheritsRel = new CodeRelationship(1L, 2L, "INHERITS");
        CodeRelationship subclassRel = new CodeRelationship(3L, 2L, "INHERITS");
        
        when(sliceRepository.findById(1L)).thenReturn(Optional.of(slice));
        when(relationshipRepository.findBySourceIdAndRelationshipType(1L, "INHERITS"))
            .thenReturn(List.of(inheritsRel));
        when(relationshipRepository.findByTargetIdAndRelationshipType(1L, "INHERITS"))
            .thenReturn(List.of());
        when(nodeRepository.findById(2L)).thenReturn(Optional.of(parentClass));
        when(relationshipRepository.findBySourceIdAndRelationshipType(2L, "INHERITS"))
            .thenReturn(List.of());
        when(relationshipRepository.findByTargetIdAndRelationshipType(2L, "INHERITS"))
            .thenReturn(List.of(subclassRel));
        when(nodeRepository.findById(3L)).thenReturn(Optional.of(anotherChild));
        when(relationshipRepository.findBySourceIdAndRelationshipType(3L, "INHERITS"))
            .thenReturn(List.of());
        when(relationshipRepository.findByTargetIdAndRelationshipType(3L, "INHERITS"))
            .thenReturn(List.of());
        when(relationshipRepository.findBySourceIdAndRelationshipType(anyLong(), eq("CALLS")))
            .thenReturn(List.of());
        when(relationshipRepository.findByTargetIdAndRelationshipType(anyLong(), eq("CALLS")))
            .thenReturn(List.of());
        when(sliceRepository.save(any(FeatureSlice.class))).thenAnswer(i -> i.getArgument(0));
        
        // When - depth 2 to reach AnotherChild through ParentClass
        FeatureSlice result = service.expandSlice(1L, 2, false, false, true);
        
        // Then
        assertThat(result.getNodes()).hasSize(3);
        assertThat(result.getNodes()).extracting(CodeNode::getName)
            .containsExactlyInAnyOrder("ChildClass", "ParentClass", "AnotherChild");
    }
    
    @Test
    void expandSlice_WithMultipleLevels_ShouldTraverseDepth() {
        // Given
        CodeNode method1 = new CodeNode("method1", "METHOD", "/Test.java", 10);
        method1.setId(1L);
        CodeNode method2 = new CodeNode("method2", "METHOD", "/Test.java", 20);
        method2.setId(2L);
        CodeNode method3 = new CodeNode("method3", "METHOD", "/Test.java", 30);
        method3.setId(3L);
        
        FeatureSlice slice = new FeatureSlice("Multi-level", "Test");
        slice.setId(1L);
        slice.addNode(method1);
        
        CodeRelationship call1to2 = new CodeRelationship(1L, 2L, "CALLS");
        CodeRelationship call2to3 = new CodeRelationship(2L, 3L, "CALLS");
        
        when(sliceRepository.findById(1L)).thenReturn(Optional.of(slice));
        when(relationshipRepository.findBySourceIdAndRelationshipType(1L, "CALLS"))
            .thenReturn(List.of(call1to2));
        when(relationshipRepository.findBySourceIdAndRelationshipType(2L, "CALLS"))
            .thenReturn(List.of(call2to3));
        when(relationshipRepository.findBySourceIdAndRelationshipType(3L, "CALLS"))
            .thenReturn(List.of());
        when(relationshipRepository.findByTargetIdAndRelationshipType(anyLong(), eq("CALLS")))
            .thenReturn(List.of());
        when(relationshipRepository.findBySourceIdAndRelationshipType(anyLong(), eq("INHERITS")))
            .thenReturn(List.of());
        when(relationshipRepository.findByTargetIdAndRelationshipType(anyLong(), eq("INHERITS")))
            .thenReturn(List.of());
        when(nodeRepository.findById(2L)).thenReturn(Optional.of(method2));
        when(nodeRepository.findById(3L)).thenReturn(Optional.of(method3));
        when(sliceRepository.save(any(FeatureSlice.class))).thenAnswer(i -> i.getArgument(0));
        
        // When
        FeatureSlice result = service.expandSlice(1L, 2, false, true, false);
        
        // Then
        assertThat(result.getNodes()).hasSize(3);
        assertThat(result.getNodes()).extracting(CodeNode::getName)
            .containsExactlyInAnyOrder("method1", "method2", "method3");
    }
    
    @Test
    void expandSlice_WithInvalidDepth_ShouldThrowException() {
        // Given
        FeatureSlice slice = new FeatureSlice("Test", "Test");
        slice.setId(1L);
        when(sliceRepository.findById(1L)).thenReturn(Optional.of(slice));
        
        // When & Then
        assertThatThrownBy(() -> service.expandSlice(1L, 0, true, true, true))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Depth must be between 1 and 5");
        
        assertThatThrownBy(() -> service.expandSlice(1L, 6, true, true, true))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Depth must be between 1 and 5");
    }
    
    @Test
    void getAllSlices_ShouldReturnOrderedList() {
        // Given
        FeatureSlice slice1 = new FeatureSlice("A Slice", "First");
        FeatureSlice slice2 = new FeatureSlice("Z Slice", "Last");
        when(sliceRepository.findAllOrderByName()).thenReturn(List.of(slice1, slice2));
        
        // When
        List<FeatureSlice> result = service.getAllSlices();
        
        // Then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("A Slice");
    }
    
    @Test
    void getSliceById_ShouldReturnSlice() {
        // Given
        FeatureSlice slice = new FeatureSlice("Test", "Test");
        slice.setId(1L);
        when(sliceRepository.findById(1L)).thenReturn(Optional.of(slice));
        
        // When
        Optional<FeatureSlice> result = service.getSliceById(1L);
        
        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("Test");
    }
    
    @Test
    void updateSlice_WithNewName_ShouldUpdateSuccessfully() {
        // Given
        FeatureSlice slice = new FeatureSlice("Old Name", "Description");
        slice.setId(1L);
        when(sliceRepository.findById(1L)).thenReturn(Optional.of(slice));
        when(sliceRepository.existsByName("New Name")).thenReturn(false);
        when(sliceRepository.save(any(FeatureSlice.class))).thenAnswer(i -> i.getArgument(0));
        
        // When
        FeatureSlice result = service.updateSlice(1L, "New Name", "New Description");
        
        // Then
        assertThat(result.getName()).isEqualTo("New Name");
        assertThat(result.getDescription()).isEqualTo("New Description");
    }
    
    @Test
    void updateSlice_WithDuplicateName_ShouldThrowException() {
        // Given
        FeatureSlice slice = new FeatureSlice("Old Name", "Description");
        slice.setId(1L);
        when(sliceRepository.findById(1L)).thenReturn(Optional.of(slice));
        when(sliceRepository.existsByName("Existing")).thenReturn(true);
        
        // When & Then
        assertThatThrownBy(() -> service.updateSlice(1L, "Existing", "Desc"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("already exists");
    }
    
    @Test
    void addNodesToSlice_ShouldAddNodesSuccessfully() {
        // Given
        FeatureSlice slice = new FeatureSlice("Test", "Test");
        slice.setId(1L);
        
        CodeNode node = new CodeNode("TestNode", "CLASS", "/Test.java", 1);
        node.setId(2L);
        
        when(sliceRepository.findById(1L)).thenReturn(Optional.of(slice));
        when(nodeRepository.findById(2L)).thenReturn(Optional.of(node));
        when(sliceRepository.save(any(FeatureSlice.class))).thenAnswer(i -> i.getArgument(0));
        
        // When
        FeatureSlice result = service.addNodesToSlice(1L, List.of(2L));
        
        // Then
        assertThat(result.getNodes()).hasSize(1);
        assertThat(result.getNodes()).contains(node);
    }
    
    @Test
    void removeNodesFromSlice_ShouldRemoveNodesSuccessfully() {
        // Given
        CodeNode node = new CodeNode("TestNode", "CLASS", "/Test.java", 1);
        node.setId(2L);
        
        FeatureSlice slice = new FeatureSlice("Test", "Test");
        slice.setId(1L);
        slice.addNode(node);
        
        when(sliceRepository.findById(1L)).thenReturn(Optional.of(slice));
        when(nodeRepository.findById(2L)).thenReturn(Optional.of(node));
        when(sliceRepository.save(any(FeatureSlice.class))).thenAnswer(i -> i.getArgument(0));
        
        // When
        FeatureSlice result = service.removeNodesFromSlice(1L, List.of(2L));
        
        // Then
        assertThat(result.getNodes()).isEmpty();
    }
    
    @Test
    void deleteSlice_ShouldDeleteSuccessfully() {
        // When
        service.deleteSlice(1L);
        
        // Then
        verify(sliceRepository).deleteById(1L);
    }
    
    @Test
    void getSliceFilePaths_ShouldReturnUniqueFilePaths() {
        // Given
        CodeNode node1 = new CodeNode("Class1", "CLASS", "/file1.java", 1);
        node1.setId(1L);
        CodeNode node2 = new CodeNode("Method1", "METHOD", "/file1.java", 10);
        node2.setId(2L);
        CodeNode node3 = new CodeNode("Class2", "CLASS", "/file2.java", 1);
        node3.setId(3L);
        
        FeatureSlice slice = new FeatureSlice("Test", "Test");
        slice.setId(1L);
        slice.addNode(node1);
        slice.addNode(node2);
        slice.addNode(node3);
        
        when(sliceRepository.findById(1L)).thenReturn(Optional.of(slice));
        
        // When
        Set<String> result = service.getSliceFilePaths(1L);
        
        // Then
        assertThat(result).hasSize(2);
        assertThat(result).containsExactlyInAnyOrder("/file1.java", "/file2.java");
    }
    
    @Test
    void getSliceStatistics_ShouldReturnCorrectStats() {
        // Given
        CodeNode class1 = new CodeNode("Class1", "CLASS", "/file1.java", 1);
        class1.setId(1L);
        CodeNode method1 = new CodeNode("Method1", "METHOD", "/file1.java", 10);
        method1.setId(2L);
        CodeNode method2 = new CodeNode("Method2", "METHOD", "/file2.java", 10);
        method2.setId(3L);
        
        FeatureSlice slice = new FeatureSlice("Test", "Test");
        slice.setId(1L);
        slice.addNode(class1);
        slice.addNode(method1);
        slice.addNode(method2);
        
        when(sliceRepository.findById(1L)).thenReturn(Optional.of(slice));
        
        // When
        Map<String, Object> result = service.getSliceStatistics(1L);
        
        // Then
        assertThat(result).containsKey("nodeCount");
        assertThat(result).containsKey("fileCount");
        assertThat(result).containsKey("nodeTypeBreakdown");
        assertThat(result.get("nodeCount")).isEqualTo(3);
        assertThat(result.get("fileCount")).isEqualTo(2);
        
        @SuppressWarnings("unchecked")
        Map<String, Long> breakdown = (Map<String, Long>) result.get("nodeTypeBreakdown");
        assertThat(breakdown).containsEntry("CLASS", 1L);
        assertThat(breakdown).containsEntry("METHOD", 2L);
    }
    
    @Test
    void findSlicesContainingNode_ShouldReturnSlices() {
        // Given
        FeatureSlice slice1 = new FeatureSlice("Slice1", "Test");
        FeatureSlice slice2 = new FeatureSlice("Slice2", "Test");
        when(sliceRepository.findSlicesContainingNode(1L)).thenReturn(List.of(slice1, slice2));
        
        // When
        List<FeatureSlice> result = service.findSlicesContainingNode(1L);
        
        // Then
        assertThat(result).hasSize(2);
    }
    
    @Test
    void expandSlice_WithCallers_ShouldAddCallingMethods() {
        // Given
        CodeNode method1 = new CodeNode("method1", "METHOD", "/Test.java", 10);
        method1.setId(1L);
        CodeNode caller = new CodeNode("caller", "METHOD", "/Test.java", 5);
        caller.setId(2L);
        
        FeatureSlice slice = new FeatureSlice("Test", "Test slice");
        slice.setId(1L);
        slice.addNode(method1);
        
        CodeRelationship callerRel = new CodeRelationship(2L, 1L, "CALLS");
        
        when(sliceRepository.findById(1L)).thenReturn(Optional.of(slice));
        when(relationshipRepository.findByTargetIdAndRelationshipType(1L, "CALLS"))
            .thenReturn(List.of(callerRel));
        when(nodeRepository.findById(2L)).thenReturn(Optional.of(caller));
        when(relationshipRepository.findBySourceIdAndRelationshipType(anyLong(), eq("CALLS")))
            .thenReturn(List.of());
        when(relationshipRepository.findByTargetIdAndRelationshipType(eq(2L), eq("CALLS")))
            .thenReturn(List.of());
        when(relationshipRepository.findBySourceIdAndRelationshipType(anyLong(), eq("INHERITS")))
            .thenReturn(List.of());
        when(relationshipRepository.findByTargetIdAndRelationshipType(anyLong(), eq("INHERITS")))
            .thenReturn(List.of());
        when(sliceRepository.save(any(FeatureSlice.class))).thenAnswer(i -> i.getArgument(0));
        
        // When
        FeatureSlice result = service.expandSlice(1L, 1, true, false, false);
        
        // Then
        assertThat(result.getNodes()).hasSize(2);
        assertThat(result.getNodes()).extracting(CodeNode::getName)
            .containsExactlyInAnyOrder("method1", "caller");
    }
}
