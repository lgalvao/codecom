package com.codecom.integration;

import com.codecom.dto.CodeStatistics;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.annotation.DirtiesContext;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for StatisticsController
 * Tests the full stack: Controller -> Service
 * 
 * FR.22: Code Statistics
 * 
 * Tests the statistics API endpoints:
 * - GET /api/statistics/file - Returns file statistics
 * - GET /api/statistics/directory - Returns directory statistics
 * - Statistics accuracy verification
 * - Empty project scenario
 */
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class StatisticsControllerIntegrationTest extends BaseIntegrationTest {

    @Test
    void testGetFileStatistics_ValidJavaFile_ReturnsAccurateStatistics() throws IOException {
        // Given: A Java file with known structure
        Path tempFile = Files.createTempFile("Statistics", ".java");
        String javaCode = """
            package com.example;
            
            /**
             * Test class for statistics
             */
            public class StatisticsTest {
                private String field;
                
                public void method1() {
                    System.out.println("test");
                }
                
                public void method2() {
                    // Another method
                }
            }
            """;
        Files.writeString(tempFile, javaCode);
        
        try {
            // When: Request file statistics
            ResponseEntity<CodeStatistics> response = restTemplate.getForEntity(
                apiUrl("/api/statistics/file?path=" + tempFile.toAbsolutePath()),
                CodeStatistics.class
            );

            // Then
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            CodeStatistics stats = response.getBody();
            
            // Verify statistics make sense
            assertTrue(stats.totalLines() > 0, "Should have total lines");
            assertTrue(stats.codeLines() > 0, "Should have code lines");
            assertTrue(stats.classCount() >= 1, "Should have at least 1 class");
            assertTrue(stats.methodCount() >= 2, "Should have at least 2 methods");
            
            // Verify line counts add up correctly
            assertEquals(
                stats.totalLines(),
                stats.codeLines() + stats.commentLines() + stats.blankLines(),
                "Total lines should equal sum of code, comment, and blank lines"
            );
        } finally {
            Files.deleteIfExists(tempFile);
        }
    }

    @Test
    void testGetDirectoryStatistics_DirectoryWithMultipleFiles_ReturnsAggregateStatistics() throws IOException {
        // Given: Directory with multiple Java files
        Path tempDir = Files.createTempDirectory("codecom-stats-test");
        
        // File 1: Simple class
        Path file1 = tempDir.resolve("Class1.java");
        String code1 = """
            public class Class1 {
                public void method1() {
                }
            }
            """;
        Files.writeString(file1, code1);
        
        // File 2: Interface
        Path file2 = tempDir.resolve("Interface1.java");
        String code2 = """
            public interface Interface1 {
                void method();
            }
            """;
        Files.writeString(file2, code2);
        
        try {
            // When: Request directory statistics
            ResponseEntity<CodeStatistics> response = restTemplate.getForEntity(
                apiUrl("/api/statistics/directory?path=" + tempDir.toAbsolutePath()),
                CodeStatistics.class
            );

            // Then
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            CodeStatistics stats = response.getBody();
            
            // Verify aggregate statistics
            assertTrue(stats.totalLines() > 0, "Should have total lines from both files");
            assertTrue(stats.classCount() >= 1, "Should have at least 1 class");
            assertTrue(stats.interfaceCount() >= 1, "Should have at least 1 interface");
            assertTrue(stats.methodCount() >= 1, "Should have at least 1 method");
            
            // Verify totals are aggregated
            // Note: Subtract 2 to account for potential line ending differences between written and parsed content
            assertTrue(
                stats.totalLines() >= code1.split("\n").length + code2.split("\n").length - 2,
                "Total lines should include both files"
            );
        } finally {
            Files.deleteIfExists(file1);
            Files.deleteIfExists(file2);
            Files.deleteIfExists(tempDir);
        }
    }

    @Test
    void testGetDirectoryStatistics_EmptyDirectory_ReturnsZeroStatistics() throws IOException {
        // Given: Empty directory
        Path emptyDir = Files.createTempDirectory("codecom-empty-test");
        
        try {
            // When: Request statistics for empty directory
            ResponseEntity<CodeStatistics> response = restTemplate.getForEntity(
                apiUrl("/api/statistics/directory?path=" + emptyDir.toAbsolutePath()),
                CodeStatistics.class
            );

            // Then
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            CodeStatistics stats = response.getBody();
            
            // Verify all counts are zero for empty directory
            assertEquals(0, stats.totalLines(), "Empty directory should have 0 total lines");
            assertEquals(0, stats.codeLines(), "Empty directory should have 0 code lines");
            assertEquals(0, stats.classCount(), "Empty directory should have 0 classes");
            assertEquals(0, stats.methodCount(), "Empty directory should have 0 methods");
            assertEquals(0, stats.interfaceCount(), "Empty directory should have 0 interfaces");
        } finally {
            Files.deleteIfExists(emptyDir);
        }
    }
}
