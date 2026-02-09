package com.codecom.controller;

import com.codecom.dto.ExportRequest;
import com.codecom.dto.ExportResult;
import com.codecom.service.ExportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ExportControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ExportService exportService;

    @InjectMocks
    private ExportController exportController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(exportController).build();
    }

    @Test
    void testExportEndpoint() throws Exception {
        ExportResult mockResult = new ExportResult(
            "# Test Content",
            "export.md",
            "text/markdown",
            1,
            10
        );

        when(exportService.exportFiles(any(ExportRequest.class))).thenReturn(mockResult);

        String requestJson = """
            {
                "filePaths": ["/path/to/file.java"],
                "format": "markdown",
                "detailLevel": "full",
                "includeLineNumbers": true,
                "title": "Test Export"
            }
            """;

        mockMvc.perform(post("/api/export")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(header().exists("Content-Disposition"))
                .andExpect(content().string("# Test Content"));
    }

    @Test
    void exportFiles_ShouldIncludeCustomHeaders() throws Exception {
        // Given
        ExportResult result = new ExportResult(
            "content",
            "export.html",
            "text/html",
            3,
            150
        );
        when(exportService.exportFiles(any(ExportRequest.class))).thenReturn(result);

        String requestJson = """
            {
                "filePaths": ["/path/file1.java", "/path/file2.java", "/path/file3.java"],
                "format": "html",
                "detailLevel": "signatures",
                "includeLineNumbers": false,
                "title": "Multi-file Export"
            }
            """;

        // When/Then
        mockMvc.perform(post("/api/export")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Total-Files", "3"))
                .andExpect(header().string("X-Total-Lines", "150"))
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"export.html\""));
    }

    @Test
    void exportFiles_ShouldHandleIOException() throws Exception {
        // Given
        when(exportService.exportFiles(any(ExportRequest.class)))
            .thenThrow(new java.io.IOException("File not found"));

        String requestJson = """
            {
                "filePaths": ["/invalid/path.java"],
                "format": "markdown",
                "detailLevel": "full",
                "includeLineNumbers": false,
                "title": "Test Export"
            }
            """;

        // When/Then
        mockMvc.perform(post("/api/export")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Error exporting files")));
    }
}
