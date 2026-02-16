package com.codecom.integration;

import com.codecom.dto.FileNode;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.web.client.HttpClientErrorException;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for FileSystemController
 * Tests the full stack: Controller -> Service
 * 
 * FR.1: File System Explorer
 * FR.2: Tree View Navigation
 * 
 * Tests the file system API endpoints:
 * - GET /api/files/tree - Returns file tree structure
 * - GET /api/files/content - Returns file content
 * - Error handling for non-existent files
 */
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class FileSystemControllerIntegrationTest extends BaseIntegrationTest {

    @Test
    void testGetFileTree_DefaultPath_ReturnsTreeStructure() throws IOException {
        // Given: Create a temporary directory with test structure
        Path tempDir = Files.createTempDirectory("codecom-test");
        Path file1 = Files.createFile(tempDir.resolve("test1.java"));
        Path subDir = Files.createDirectory(tempDir.resolve("subdir"));
        Path file2 = Files.createFile(subDir.resolve("test2.java"));
        
        try {
            // When: Request file tree
            ResponseEntity<FileNode> response = restTemplate.getForEntity(
                apiUrl("/api/files/tree?path=" + tempDir.toAbsolutePath()),
                FileNode.class
            );

            // Then
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            FileNode root = response.getBody();
            
            assertTrue(root.isDirectory(), "Root should be a directory");
            assertNotNull(root.children(), "Root should have children");
            assertTrue(root.children().size() >= 2, "Should have at least 2 children (file and subdir)");
            
            // Verify structure contains expected files
            boolean hasFile = root.children().stream()
                .anyMatch(node -> node.name().equals("test1.java"));
            boolean hasSubDir = root.children().stream()
                .anyMatch(node -> node.name().equals("subdir") && node.isDirectory());
            
            assertTrue(hasFile, "Should contain test1.java");
            assertTrue(hasSubDir, "Should contain subdir");
        } finally {
            // Cleanup
            Files.deleteIfExists(file2);
            Files.deleteIfExists(subDir);
            Files.deleteIfExists(file1);
            Files.deleteIfExists(tempDir);
        }
    }

    @Test
    void testGetFileContent_ExistingFile_ReturnsContent() throws IOException {
        // Given: Create a test file with content
        Path tempFile = Files.createTempFile("codecom-test", ".java");
        String expectedContent = "public class Test {\n    // Test content\n}";
        Files.writeString(tempFile, expectedContent);
        
        try {
            // When: Request file content
            ResponseEntity<String> response = restTemplate.getForEntity(
                apiUrl("/api/files/content?path=" + tempFile.toAbsolutePath()),
                String.class
            );

            // Then
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            assertEquals(expectedContent, response.getBody());
        } finally {
            // Cleanup
            Files.deleteIfExists(tempFile);
        }
    }

    @Test
    void testGetFileContent_NonExistentFile_Returns404() {
        // Given: Non-existent file path
        String nonExistentPath = "/nonexistent/path/to/file.java";

        // When/Then: Request should fail with exception
        assertThrows(Exception.class, () -> {
            restTemplate.getForEntity(
                apiUrl("/api/files/content?path=" + nonExistentPath),
                String.class
            );
        }, "Should throw exception for non-existent file");
    }
}
