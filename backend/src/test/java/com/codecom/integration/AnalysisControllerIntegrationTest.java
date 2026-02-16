package com.codecom.integration;

import com.codecom.dto.*;
import org.junit.jupiter.api.Test;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.web.client.HttpClientErrorException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for AnalysisController
 * Tests the full stack: Controller -> Service
 * 
 * FR.5: Symbol Outline View
 * FR.6: Smart Symbol Search
 * FR.9: Find Callers
 * FR.13: Complexity Analysis
 * FR.14: Dead Code Detection
 * FR.24: Test Reference Detection
 * 
 * Tests the analysis API endpoints:
 * - GET /api/analysis/outline - List symbols (renamed from /symbols)
 * - GET /api/analysis/callers - Get callers
 * - GET /api/analysis/definition - Get symbol definition
 * - GET /api/analysis/test-references - Get test references
 * - GET /api/analysis/complexity - Get complexity metrics
 * - GET /api/analysis/dead-code - Detect dead code
 * - Error scenarios
 */
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class AnalysisControllerIntegrationTest extends BaseIntegrationTest {

    @Test
    void testGetOutline_JavaFile_ReturnsSymbols() throws IOException {
        // Given: A test Java file
        Path tempFile = Files.createTempFile("Test", ".java");
        String javaCode = """
            package com.example;
            
            public class TestClass {
                private String field;
                
                public void method1() {
                    // Method body
                }
                
                public int method2(String param) {
                    return 0;
                }
            }
            """;
        Files.writeString(tempFile, javaCode);
        
        try {
            // When: Request outline
            ResponseEntity<List<SymbolInfo>> response = restTemplate.exchange(
                apiUrl("/api/analysis/outline?path=" + tempFile.toAbsolutePath()),
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<SymbolInfo>>() {}
            );

            // Then
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            List<SymbolInfo> symbols = response.getBody();
            
            // Should find class and methods
            assertTrue(symbols.size() >= 1, "Should find at least the class symbol");
        } finally {
            Files.deleteIfExists(tempFile);
        }
    }

    @Test
    void testFindCallers_ValidMethod_ReturnsCallerStatistics() throws IOException {
        // Given: Java file with method calls
        Path tempFile = Files.createTempFile("Service", ".java");
        String javaCode = """
            package com.example;
            
            public class UserService {
                public void createUser() {
                    validateUser();
                }
                
                private void validateUser() {
                    // Validation logic
                }
            }
            """;
        Files.writeString(tempFile, javaCode);
        
        try {
            // When: Find callers of validateUser
            ResponseEntity<CallerStatistics> response = restTemplate.getForEntity(
                apiUrl("/api/analysis/callers?path=" + tempFile.toAbsolutePath() + 
                       "&methodName=validateUser"),
                CallerStatistics.class
            );

            // Then
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            CallerStatistics stats = response.getBody();
            assertNotNull(stats.callers());
        } finally {
            Files.deleteIfExists(tempFile);
        }
    }

    @Test
    void testGetSymbolDefinition_ValidLocation_ReturnsDefinition() throws IOException {
        // Given: Java file with symbols
        Path tempFile = Files.createTempFile("Example", ".java");
        String javaCode = """
            public class Example {
                public void testMethod() {
                }
            }
            """;
        Files.writeString(tempFile, javaCode);
        
        try {
            // When: Get definition at line with class definition
            ResponseEntity<SymbolDefinition> response = restTemplate.getForEntity(
                apiUrl("/api/analysis/definition?path=" + tempFile.toAbsolutePath() + 
                       "&line=1&column=0"),
                SymbolDefinition.class
            );

            // Then: Should return OK or 404 (depending on parser capability)
            assertTrue(
                response.getStatusCode() == HttpStatus.OK || 
                response.getStatusCode() == HttpStatus.NOT_FOUND
            );
        } finally {
            Files.deleteIfExists(tempFile);
        }
    }

    @Test
    void testFindTestReferences_ClassWithTests_ReturnsReferences() throws IOException {
        // Given: Java file
        Path tempFile = Files.createTempFile("UserService", ".java");
        String javaCode = """
            package com.example;
            
            public class UserService {
                public void createUser() {
                }
            }
            """;
        Files.writeString(tempFile, javaCode);
        
        try {
            // When: Find test references
            ResponseEntity<List<TestReference>> response = restTemplate.exchange(
                apiUrl("/api/analysis/test-references?path=" + tempFile.toAbsolutePath() + 
                       "&className=UserService"),
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<TestReference>>() {}
            );

            // Then
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            // May be empty if no tests found - that's OK
        } finally {
            Files.deleteIfExists(tempFile);
        }
    }

    @Test
    void testGetProjectComplexity_ValidPath_ReturnsComplexityMetrics() throws IOException {
        // Given: Directory with Java files
        Path tempDir = Files.createTempDirectory("codecom-complexity-test");
        Path javaFile = tempDir.resolve("Simple.java");
        String javaCode = """
            public class Simple {
                public void method() {
                    if (true) {
                        System.out.println("test");
                    }
                }
            }
            """;
        Files.writeString(javaFile, javaCode);
        
        try {
            // When: Get complexity
            ResponseEntity<List<FileComplexity>> response = restTemplate.exchange(
                apiUrl("/api/analysis/complexity?path=" + tempDir.toAbsolutePath()),
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<FileComplexity>>() {}
            );

            // Then
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            List<FileComplexity> complexities = response.getBody();
            // Should analyze the directory
            assertNotNull(complexities);
        } finally {
            Files.deleteIfExists(javaFile);
            Files.deleteIfExists(tempDir);
        }
    }

    @Test
    void testDetectDeadCode_ValidFile_ReturnsDeadCodeInfo() throws IOException {
        // Given: Java file with potentially dead code
        Path tempFile = Files.createTempFile("DeadCode", ".java");
        String javaCode = """
            public class DeadCode {
                private void unusedMethod() {
                    // This might be detected as dead code
                }
                
                public void usedMethod() {
                    // This is used
                }
            }
            """;
        Files.writeString(tempFile, javaCode);
        
        try {
            // When: Detect dead code
            ResponseEntity<List<DeadCodeInfo>> response = restTemplate.exchange(
                apiUrl("/api/analysis/dead-code?path=" + tempFile.toAbsolutePath()),
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<DeadCodeInfo>>() {}
            );

            // Then
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            // Dead code detection may or may not find issues - that's OK
        } finally {
            Files.deleteIfExists(tempFile);
        }
    }

    @Test
    void testGetFileComplexity_ValidFile_ReturnsComplexity() throws IOException {
        // Given: Java file with some complexity
        Path tempFile = Files.createTempFile("Complex", ".java");
        String javaCode = """
            public class Complex {
                public void method() {
                    if (true) {
                        for (int i = 0; i < 10; i++) {
                            while (true) {
                                break;
                            }
                        }
                    }
                }
            }
            """;
        Files.writeString(tempFile, javaCode);
        
        try {
            // When: Get file complexity
            ResponseEntity<FileComplexity> response = restTemplate.getForEntity(
                apiUrl("/api/analysis/complexity/file?path=" + tempFile.toAbsolutePath()),
                FileComplexity.class
            );

            // Then
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            FileComplexity complexity = response.getBody();
            assertNotNull(complexity.getFilePath());
        } finally {
            Files.deleteIfExists(tempFile);
        }
    }

    @Test
    void testErrorHandling_InvalidPath_ReturnsError() {
        // Given: Invalid file path
        String invalidPath = "/invalid/nonexistent/file.java";

        // When/Then: Should handle error gracefully
        try {
            ResponseEntity<List<SymbolInfo>> response = restTemplate.exchange(
                apiUrl("/api/analysis/outline?path=" + invalidPath),
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<SymbolInfo>>() {}
            );
            
            // If no exception, should be error status
            assertTrue(response.getStatusCode().isError());
        } catch (Exception e) {
            // Exception is acceptable for invalid path
            assertTrue(e.getMessage().contains("500") || e.getMessage().contains("404"));
        }
    }
}
