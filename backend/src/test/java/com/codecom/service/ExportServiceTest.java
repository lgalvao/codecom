package com.codecom.service;

import com.codecom.dto.ExportRequest;
import com.codecom.dto.ExportResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ExportServiceTest {

    private ExportService exportService;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        exportService = new ExportService();
    }

    @Test
    void testExportSingleFileToMarkdown() throws IOException {
        // Create a test file
        Path testFile = tempDir.resolve("Test.java");
        Files.writeString(testFile, """
            public class Test {
                public void hello() {
                    System.out.println("Hello");
                }
            }
            """);

        ExportRequest request = new ExportRequest(
            List.of(testFile.toString()),
            "markdown",
            "full",
            false,
            "Test Export"
        );

        ExportResult result = exportService.exportFiles(request);

        assertNotNull(result);
        assertEquals("text/markdown", result.mimeType());
        assertTrue(result.filename().endsWith(".md"));
        assertTrue(result.content().contains("# Test Export"));
        assertTrue(result.content().contains("public class Test"));
        assertEquals(1, result.totalFiles());
        assertTrue(result.totalLines() > 0);
    }

    @Test
    void testExportSingleFileToHTML() throws IOException {
        Path testFile = tempDir.resolve("Test.java");
        Files.writeString(testFile, """
            public class Test {
                public void hello() {
                    System.out.println("Hello");
                }
            }
            """);

        ExportRequest request = new ExportRequest(
            List.of(testFile.toString()),
            "pdf",
            "full",
            true,
            "Test Export"
        );

        ExportResult result = exportService.exportFiles(request);

        assertNotNull(result);
        assertEquals("text/html", result.mimeType());
        assertTrue(result.filename().endsWith(".html"));
        assertTrue(result.content().contains("<!DOCTYPE html>"));
        assertTrue(result.content().contains("<h1>Test Export</h1>"));
        assertTrue(result.content().contains("public class Test"));
        assertEquals(1, result.totalFiles());
    }

    @Test
    void testExportMultipleFiles() throws IOException {
        // Create multiple test files
        Path file1 = tempDir.resolve("File1.java");
        Files.writeString(file1, "public class File1 {}");

        Path file2 = tempDir.resolve("File2.java");
        Files.writeString(file2, "public class File2 {}");

        ExportRequest request = new ExportRequest(
            List.of(file1.toString(), file2.toString()),
            "markdown",
            "full",
            false,
            "Multi-File Export"
        );

        ExportResult result = exportService.exportFiles(request);

        assertNotNull(result);
        assertEquals(2, result.totalFiles());
        assertTrue(result.content().contains("File1.java"));
        assertTrue(result.content().contains("File2.java"));
        assertTrue(result.content().contains("public class File1"));
        assertTrue(result.content().contains("public class File2"));
    }

    @Test
    void testExportWithLineNumbers() throws IOException {
        Path testFile = tempDir.resolve("Test.java");
        Files.writeString(testFile, """
            line 1
            line 2
            line 3
            """);

        ExportRequest request = new ExportRequest(
            List.of(testFile.toString()),
            "markdown",
            "full",
            true,
            null
        );

        ExportResult result = exportService.exportFiles(request);

        assertTrue(result.content().contains("1 |"));
        assertTrue(result.content().contains("2 |"));
        assertTrue(result.content().contains("3 |"));
    }

    @Test
    void testExportWithDifferentDetailLevels() throws IOException {
        Path testFile = tempDir.resolve("Test.java");
        Files.writeString(testFile, """
            public class Test {
                private int value;
                public void method() {}
            }
            """);

        // Test full detail
        ExportRequest fullRequest = new ExportRequest(
            List.of(testFile.toString()),
            "markdown",
            "full",
            false,
            null
        );
        ExportResult fullResult = exportService.exportFiles(fullRequest);
        assertTrue(fullResult.content().contains("public class Test"));

        // Test medium detail
        ExportRequest mediumRequest = new ExportRequest(
            List.of(testFile.toString()),
            "markdown",
            "medium",
            false,
            null
        );
        ExportResult mediumResult = exportService.exportFiles(mediumRequest);
        assertNotNull(mediumResult);

        // Test low detail
        ExportRequest lowRequest = new ExportRequest(
            List.of(testFile.toString()),
            "markdown",
            "low",
            false,
            null
        );
        ExportResult lowResult = exportService.exportFiles(lowRequest);
        assertNotNull(lowResult);

        // Test architectural detail
        ExportRequest archRequest = new ExportRequest(
            List.of(testFile.toString()),
            "markdown",
            "architectural",
            false,
            null
        );
        ExportResult archResult = exportService.exportFiles(archRequest);
        assertNotNull(archResult);
    }

    @Test
    void testExportNonexistentFile() throws IOException {
        ExportRequest request = new ExportRequest(
            List.of("/nonexistent/file.java"),
            "markdown",
            "full",
            false,
            null
        );

        ExportResult result = exportService.exportFiles(request);
        
        // Should handle gracefully with 0 files
        assertEquals(0, result.totalFiles());
        assertEquals(0, result.totalLines());
    }

    @Test
    void testFilenameGeneration() throws IOException {
        Path testFile = tempDir.resolve("Test.java");
        Files.writeString(testFile, "public class Test {}");

        // With title
        ExportRequest requestWithTitle = new ExportRequest(
            List.of(testFile.toString()),
            "markdown",
            "full",
            false,
            "My Project"
        );
        ExportResult resultWithTitle = exportService.exportFiles(requestWithTitle);
        assertTrue(resultWithTitle.filename().contains("My_Project"));

        // Without title
        ExportRequest requestWithoutTitle = new ExportRequest(
            List.of(testFile.toString()),
            "markdown",
            "full",
            false,
            null
        );
        ExportResult resultWithoutTitle = exportService.exportFiles(requestWithoutTitle);
        assertTrue(resultWithoutTitle.filename().startsWith("export-"));
    }

    @Test
    void testLanguageDetection() throws IOException {
        // Test various file types
        String[][] testCases = {
            {"test.java", "java"},
            {"test.js", "javascript"},
            {"test.ts", "typescript"},
            {"test.py", "python"},
            {"test.sql", "sql"},
            {"test.xml", "xml"},
            {"test.html", "html"},
            {"test.css", "css"},
            {"test.yaml", "yaml"},
            {"test.yml", "yaml"},
            {"test.json", "json"}
        };

        for (String[] testCase : testCases) {
            Path testFile = tempDir.resolve(testCase[0]);
            Files.writeString(testFile, "// test content");

            ExportRequest request = new ExportRequest(
                List.of(testFile.toString()),
                "markdown",
                "full",
                false,
                null
            );

            ExportResult result = exportService.exportFiles(request);
            assertTrue(result.content().contains("```" + testCase[1]));
        }
    }
}
