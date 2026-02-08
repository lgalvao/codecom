package com.codecom.controller;

import com.codecom.dto.FeatureSliceDetail;
import com.codecom.dto.FeatureSliceRequest;
import com.codecom.dto.FeatureSliceResponse;
import com.codecom.entity.CodeNode;
import com.codecom.entity.FeatureSlice;
import com.codecom.service.FeatureSliceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests for FeatureSliceController
 * FR.35: Feature-Based Code Slicing
 */
class FeatureSliceControllerTest {
    
    private FeatureSliceController controller;
    private FeatureSliceService service;
    
    @BeforeEach
    void setUp() {
        service = mock(FeatureSliceService.class);
        controller = new FeatureSliceController(service);
    }
    
    @Test
    void createSlice_WithValidRequest_ShouldReturnCreated() {
        // Given
        FeatureSliceRequest request = new FeatureSliceRequest(
            "User Management",
            "User auth and authorization",
            List.of(1L, 2L),
            null
        );
        
        FeatureSlice slice = createMockSlice(1L, "User Management", "User auth and authorization");
        when(service.createSlice(anyString(), anyString(), anyList())).thenReturn(slice);
        
        // When
        ResponseEntity<FeatureSliceResponse> response = controller.createSlice(request);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().name()).isEqualTo("User Management");
        verify(service).createSlice("User Management", "User auth and authorization", List.of(1L, 2L));
    }
    
    @Test
    void createSlice_WithExpansion_ShouldExpandAfterCreation() {
        // Given
        FeatureSliceRequest request = new FeatureSliceRequest(
            "Payment Processing",
            "Payment related features",
            List.of(1L),
            2
        );
        
        FeatureSlice initialSlice = createMockSlice(1L, "Payment Processing", "Payment related features");
        FeatureSlice expandedSlice = createMockSlice(1L, "Payment Processing", "Payment related features");
        addMockNodes(expandedSlice, 5);
        
        when(service.createSlice(anyString(), anyString(), anyList())).thenReturn(initialSlice);
        when(service.expandSlice(eq(1L), eq(2), anyBoolean(), anyBoolean(), anyBoolean()))
            .thenReturn(expandedSlice);
        
        // When
        ResponseEntity<FeatureSliceResponse> response = controller.createSlice(request);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().nodeCount()).isEqualTo(5);
        verify(service).expandSlice(1L, 2, true, true, true);
    }
    
    @Test
    void createSlice_WithDuplicateName_ShouldReturnBadRequest() {
        // Given
        FeatureSliceRequest request = new FeatureSliceRequest(
            "Existing Slice",
            "Description",
            List.of(),
            null
        );
        
        when(service.createSlice(anyString(), anyString(), anyList()))
            .thenThrow(new IllegalArgumentException("already exists"));
        
        // When
        ResponseEntity<FeatureSliceResponse> response = controller.createSlice(request);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }
    
    @Test
    void getAllSlices_ShouldReturnAllSlices() {
        // Given
        FeatureSlice slice1 = createMockSlice(1L, "Slice 1", "First");
        FeatureSlice slice2 = createMockSlice(2L, "Slice 2", "Second");
        when(service.getAllSlices()).thenReturn(List.of(slice1, slice2));
        
        // When
        ResponseEntity<List<FeatureSliceResponse>> response = controller.getAllSlices();
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
        assertThat(response.getBody().get(0).name()).isEqualTo("Slice 1");
        assertThat(response.getBody().get(1).name()).isEqualTo("Slice 2");
    }
    
    @Test
    void getSlice_ExistingSlice_ShouldReturnDetail() {
        // Given
        FeatureSlice slice = createMockSlice(1L, "Test Slice", "Description");
        addMockNodes(slice, 3);
        when(service.getSliceById(1L)).thenReturn(Optional.of(slice));
        
        // When
        ResponseEntity<FeatureSliceDetail> response = controller.getSlice(1L);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().name()).isEqualTo("Test Slice");
        assertThat(response.getBody().nodes()).hasSize(3);
    }
    
    @Test
    void getSlice_NonExistingSlice_ShouldReturnNotFound() {
        // Given
        when(service.getSliceById(999L)).thenReturn(Optional.empty());
        
        // When
        ResponseEntity<FeatureSliceDetail> response = controller.getSlice(999L);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
    
    @Test
    void updateSlice_ValidUpdate_ShouldReturnUpdatedSlice() {
        // Given
        Map<String, String> updates = Map.of(
            "name", "New Name",
            "description", "New Description"
        );
        
        FeatureSlice updatedSlice = createMockSlice(1L, "New Name", "New Description");
        when(service.updateSlice(1L, "New Name", "New Description")).thenReturn(updatedSlice);
        
        // When
        ResponseEntity<FeatureSliceResponse> response = controller.updateSlice(1L, updates);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().name()).isEqualTo("New Name");
    }
    
    @Test
    void updateSlice_NonExistingSlice_ShouldReturnNotFound() {
        // Given
        Map<String, String> updates = Map.of("name", "New Name");
        when(service.updateSlice(anyLong(), anyString(), any()))
            .thenThrow(new IllegalArgumentException("not found"));
        
        // When
        ResponseEntity<FeatureSliceResponse> response = controller.updateSlice(999L, updates);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
    
    @Test
    void deleteSlice_ExistingSlice_ShouldReturnNoContent() {
        // Given
        doNothing().when(service).deleteSlice(1L);
        
        // When
        ResponseEntity<Void> response = controller.deleteSlice(1L);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(service).deleteSlice(1L);
    }
    
    @Test
    void deleteSlice_NonExistingSlice_ShouldReturnNotFound() {
        // Given
        doThrow(new RuntimeException()).when(service).deleteSlice(999L);
        
        // When
        ResponseEntity<Void> response = controller.deleteSlice(999L);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
    
    @Test
    void expandSlice_WithParameters_ShouldExpandAndReturnSlice() {
        // Given
        Map<String, Object> params = Map.of(
            "depth", 2,
            "includeCallers", true,
            "includeCallees", false,
            "includeInheritance", true
        );
        
        FeatureSlice expandedSlice = createMockSlice(1L, "Test", "Test");
        addMockNodes(expandedSlice, 10);
        when(service.expandSlice(1L, 2, true, false, true)).thenReturn(expandedSlice);
        
        // When
        ResponseEntity<FeatureSliceResponse> response = controller.expandSlice(1L, params);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().nodeCount()).isEqualTo(10);
        verify(service).expandSlice(1L, 2, true, false, true);
    }
    
    @Test
    void expandSlice_WithDefaultParameters_ShouldUseDefaults() {
        // Given
        Map<String, Object> params = new HashMap<>();
        FeatureSlice expandedSlice = createMockSlice(1L, "Test", "Test");
        when(service.expandSlice(eq(1L), anyInt(), anyBoolean(), anyBoolean(), anyBoolean()))
            .thenReturn(expandedSlice);
        
        // When
        ResponseEntity<FeatureSliceResponse> response = controller.expandSlice(1L, params);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(service).expandSlice(1L, 1, true, true, true); // defaults
    }
    
    @Test
    void expandSlice_InvalidDepth_ShouldReturnBadRequest() {
        // Given
        Map<String, Object> params = Map.of("depth", 10);
        when(service.expandSlice(anyLong(), anyInt(), anyBoolean(), anyBoolean(), anyBoolean()))
            .thenThrow(new IllegalArgumentException("Invalid depth"));
        
        // When
        ResponseEntity<FeatureSliceResponse> response = controller.expandSlice(1L, params);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }
    
    @Test
    void addNodes_ValidNodeIds_ShouldAddAndReturnSlice() {
        // Given
        Map<String, List<Long>> body = Map.of("nodeIds", List.of(5L, 6L, 7L));
        FeatureSlice updatedSlice = createMockSlice(1L, "Test", "Test");
        addMockNodes(updatedSlice, 3);
        when(service.addNodesToSlice(1L, List.of(5L, 6L, 7L))).thenReturn(updatedSlice);
        
        // When
        ResponseEntity<FeatureSliceResponse> response = controller.addNodes(1L, body);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        verify(service).addNodesToSlice(1L, List.of(5L, 6L, 7L));
    }
    
    @Test
    void removeNodes_ValidNodeIds_ShouldRemoveAndReturnSlice() {
        // Given
        Map<String, List<Long>> body = Map.of("nodeIds", List.of(2L, 3L));
        FeatureSlice updatedSlice = createMockSlice(1L, "Test", "Test");
        when(service.removeNodesFromSlice(1L, List.of(2L, 3L))).thenReturn(updatedSlice);
        
        // When
        ResponseEntity<FeatureSliceResponse> response = controller.removeNodes(1L, body);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(service).removeNodesFromSlice(1L, List.of(2L, 3L));
    }
    
    @Test
    void getSliceFiles_ShouldReturnFilePaths() {
        // Given
        Set<String> files = Set.of("/path/to/file1.java", "/path/to/file2.java");
        when(service.getSliceFilePaths(1L)).thenReturn(files);
        
        // When
        ResponseEntity<Set<String>> response = controller.getSliceFiles(1L);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
        assertThat(response.getBody()).contains("/path/to/file1.java", "/path/to/file2.java");
    }
    
    @Test
    void getSliceFiles_NonExistingSlice_ShouldReturnNotFound() {
        // Given
        when(service.getSliceFilePaths(999L))
            .thenThrow(new IllegalArgumentException("Slice not found"));
        
        // When
        ResponseEntity<Set<String>> response = controller.getSliceFiles(999L);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
    
    @Test
    void getSliceStatistics_ShouldReturnStats() {
        // Given
        Map<String, Object> stats = Map.of(
            "nodeCount", 15,
            "fileCount", 8,
            "nodeTypeBreakdown", Map.of("CLASS", 5L, "METHOD", 10L)
        );
        when(service.getSliceStatistics(1L)).thenReturn(stats);
        
        // When
        ResponseEntity<Map<String, Object>> response = controller.getSliceStatistics(1L);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("nodeCount")).isEqualTo(15);
        assertThat(response.getBody().get("fileCount")).isEqualTo(8);
    }
    
    // Helper methods
    
    private FeatureSlice createMockSlice(Long id, String name, String description) {
        FeatureSlice slice = new FeatureSlice(name, description);
        slice.setId(id);
        slice.setCreatedDate(LocalDateTime.now());
        slice.setUpdatedDate(LocalDateTime.now());
        return slice;
    }
    
    private void addMockNodes(FeatureSlice slice, int count) {
        for (int i = 1; i <= count; i++) {
            CodeNode node = new CodeNode("Node" + i, "CLASS", "/file" + i + ".java", i);
            node.setId((long) i);
            slice.addNode(node);
        }
    }
}
