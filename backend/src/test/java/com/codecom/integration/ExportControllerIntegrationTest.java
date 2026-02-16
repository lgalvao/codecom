package com.codecom.integration;

import com.codecom.dto.ExportRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.*;
import org.springframework.test.annotation.DirtiesContext;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for ExportController
 * Tests the full stack: Controller -> Service
 * 
 * FR.30: Multi-Format Export
 * FR.31: Project-Wide Export
 * 
 * Tests the export API endpoints:
 * - POST /api/export - Markdown export
 * - POST /api/export - HTML export
 * - POST /api/export - PDF export (HTML format for PDF printing)
 * - Multi-file export
 * - Export with different detail levels
 * - Error handling
 */
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class ExportControllerIntegrationTest extends BaseIntegrationTest {

    @Test
    void testExport_MarkdownFormat_ReturnsMarkdownContent() throws IOException {
        // Given: Create a test file
        Path tempFile = Files.createTempFile("ExportTest", ".java");
        String javaContent = """
            public class HelloWorld {
                public static void main(String[] args) {
                    System.out.println("Hello, World!");
                }
            }
            """;
        Files.writeString(tempFile, javaContent);
        
        try {
            // Given: Create export request for markdown
            ExportRequest request = new ExportRequest(
                List.of(tempFile.toAbsolutePath().toString()),
                "markdown",
                "full",
                true,
                "Test Export"
            );
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<ExportRequest> entity = new HttpEntity<>(request, headers);

            // When: Request export
            ResponseEntity<String> response = restTemplate.exchange(
                apiUrl("/api/export"),
                HttpMethod.POST,
                entity,
                String.class
            );

            // Then
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            
            String content = response.getBody();
            assertTrue(content.contains("# Test Export"), "Should contain title");
            assertTrue(content.contains("**Detail Level:** full"), "Should contain detail level");
            assertTrue(content.contains("**Files:** 1"), "Should contain file count");
            assertTrue(content.contains("```java"), "Should contain code block");
            assertTrue(content.contains("HelloWorld"), "Should contain code content");
            
            // Verify response headers
            assertEquals("text/markdown", response.getHeaders().getContentType().toString());
            assertTrue(response.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION)
                .contains("attachment"));
            assertEquals("1", response.getHeaders().getFirst("X-Total-Files"));
            
        } finally {
            // Cleanup
            Files.deleteIfExists(tempFile);
        }
    }

    @Test
    void testExport_HTMLFormat_ReturnsHTMLContent() throws IOException {
        // Given: Create a test file
        Path tempFile = Files.createTempFile("ExportTest", ".java");
        String javaContent = """
            public class Calculator {
                public int add(int a, int b) {
                    return a + b;
                }
            }
            """;
        Files.writeString(tempFile, javaContent);
        
        try {
            // Given: Create export request for HTML
            ExportRequest request = new ExportRequest(
                List.of(tempFile.toAbsolutePath().toString()),
                "html",
                "full",
                false,
                "HTML Export Test"
            );
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<ExportRequest> entity = new HttpEntity<>(request, headers);

            // When: Request export
            ResponseEntity<String> response = restTemplate.exchange(
                apiUrl("/api/export"),
                HttpMethod.POST,
                entity,
                String.class
            );

            // Then
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            
            String content = response.getBody();
            assertTrue(content.contains("<!DOCTYPE html>"), "Should be HTML document");
            assertTrue(content.contains("<title>HTML Export Test</title>"), "Should contain title");
            assertTrue(content.contains("<h1>HTML Export Test</h1>"), "Should contain H1 title");
            assertTrue(content.contains("Calculator"), "Should contain code content");
            assertTrue(content.contains("class=\"code-container\""), "Should have code container");
            
            // Verify response headers
            assertEquals("text/html", response.getHeaders().getContentType().toString());
            
        } finally {
            // Cleanup
            Files.deleteIfExists(tempFile);
        }
    }

    @Test
    void testExport_PDFFormat_ReturnsHTMLForPDFPrinting() throws IOException {
        // Given: Create a test file
        Path tempFile = Files.createTempFile("ExportTest", ".java");
        String javaContent = """
            public class PDFTest {
                private String data;
            }
            """;
        Files.writeString(tempFile, javaContent);
        
        try {
            // Given: Create export request for PDF (uses HTML format)
            ExportRequest request = new ExportRequest(
                List.of(tempFile.toAbsolutePath().toString()),
                "pdf",
                "full",
                true,
                "PDF Export"
            );
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<ExportRequest> entity = new HttpEntity<>(request, headers);

            // When: Request export
            ResponseEntity<String> response = restTemplate.exchange(
                apiUrl("/api/export"),
                HttpMethod.POST,
                entity,
                String.class
            );

            // Then: PDF export returns HTML formatted for printing
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            
            String content = response.getBody();
            assertTrue(content.contains("<!DOCTYPE html>"), "Should be HTML for PDF");
            assertTrue(content.contains("@page"), "Should have print styles");
            assertTrue(content.contains("PDF Export"), "Should contain title");
            
        } finally {
            // Cleanup
            Files.deleteIfExists(tempFile);
        }
    }

    @Test
    void testExport_MultipleFiles_ExportsAll() throws IOException {
        // Given: Create multiple test files
        Path tempFile1 = Files.createTempFile("File1", ".java");
        Path tempFile2 = Files.createTempFile("File2", ".java");
        Path tempFile3 = Files.createTempFile("File3", ".java");
        
        Files.writeString(tempFile1, "public class File1 {}");
        Files.writeString(tempFile2, "public class File2 {}");
        Files.writeString(tempFile3, "public class File3 {}");
        
        try {
            // Given: Create export request for multiple files
            ExportRequest request = new ExportRequest(
                List.of(
                    tempFile1.toAbsolutePath().toString(),
                    tempFile2.toAbsolutePath().toString(),
                    tempFile3.toAbsolutePath().toString()
                ),
                "markdown",
                "full",
                false,
                "Multi-File Export"
            );
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<ExportRequest> entity = new HttpEntity<>(request, headers);

            // When: Request export
            ResponseEntity<String> response = restTemplate.exchange(
                apiUrl("/api/export"),
                HttpMethod.POST,
                entity,
                String.class
            );

            // Then
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            
            String content = response.getBody();
            assertTrue(content.contains("**Files:** 3"), "Should contain 3 files");
            assertTrue(content.contains("File1"), "Should contain File1");
            assertTrue(content.contains("File2"), "Should contain File2");
            assertTrue(content.contains("File3"), "Should contain File3");
            
            // Verify headers
            assertEquals("3", response.getHeaders().getFirst("X-Total-Files"));
            
        } finally {
            // Cleanup
            Files.deleteIfExists(tempFile1);
            Files.deleteIfExists(tempFile2);
            Files.deleteIfExists(tempFile3);
        }
    }

    @Test
    void testExport_DifferentDetailLevels_AppliesCorrectLevel() throws IOException {
        // Given: Create a test file
        Path tempFile = Files.createTempFile("DetailTest", ".java");
        String javaContent = """
            public class DetailTest {
                // This is a comment
                private String field;
                
                public void method() {
                    System.out.println("test");
                }
            }
            """;
        Files.writeString(tempFile, javaContent);
        
        try {
            // Test different detail levels
            String[] detailLevels = {"full", "medium", "low", "architectural"};
            
            for (String detailLevel : detailLevels) {
                // Given: Create export request with specific detail level
                ExportRequest request = new ExportRequest(
                    List.of(tempFile.toAbsolutePath().toString()),
                    "markdown",
                    detailLevel,
                    false,
                    "Detail Level Test"
                );
                
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<ExportRequest> entity = new HttpEntity<>(request, headers);

                // When: Request export
                ResponseEntity<String> response = restTemplate.exchange(
                    apiUrl("/api/export"),
                    HttpMethod.POST,
                    entity,
                    String.class
                );

                // Then
                assertEquals(HttpStatus.OK, response.getStatusCode());
                assertNotNull(response.getBody());
                
                String content = response.getBody();
                assertTrue(content.contains("**Detail Level:** " + detailLevel),
                    "Should contain detail level: " + detailLevel);
            }
            
        } finally {
            // Cleanup
            Files.deleteIfExists(tempFile);
        }
    }

    @Test
    void testExport_WithLineNumbers_IncludesLineNumbers() throws IOException {
        // Given: Create a test file
        Path tempFile = Files.createTempFile("LineNumberTest", ".java");
        String javaContent = """
            public class LineNumberTest {
                private int value;
                
                public int getValue() {
                    return value;
                }
            }
            """;
        Files.writeString(tempFile, javaContent);
        
        try {
            // Given: Create export request with line numbers enabled
            ExportRequest request = new ExportRequest(
                List.of(tempFile.toAbsolutePath().toString()),
                "markdown",
                "full",
                true,  // includeLineNumbers = true
                "Line Number Test"
            );
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<ExportRequest> entity = new HttpEntity<>(request, headers);

            // When: Request export
            ResponseEntity<String> response = restTemplate.exchange(
                apiUrl("/api/export"),
                HttpMethod.POST,
                entity,
                String.class
            );

            // Then
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            
            String content = response.getBody();
            assertTrue(content.contains("   1 |"), "Should contain line number 1");
            assertTrue(content.contains("   2 |"), "Should contain line number 2");
            
            // Test without line numbers
            ExportRequest requestNoLines = new ExportRequest(
                List.of(tempFile.toAbsolutePath().toString()),
                "markdown",
                "full",
                false,  // includeLineNumbers = false
                "No Line Numbers"
            );
            
            HttpEntity<ExportRequest> entityNoLines = new HttpEntity<>(requestNoLines, headers);
            ResponseEntity<String> responseNoLines = restTemplate.exchange(
                apiUrl("/api/export"),
                HttpMethod.POST,
                entityNoLines,
                String.class
            );
            
            String contentNoLines = responseNoLines.getBody();
            assertFalse(contentNoLines.contains("   1 |"), "Should not contain line numbers");
            
        } finally {
            // Cleanup
            Files.deleteIfExists(tempFile);
        }
    }
}
