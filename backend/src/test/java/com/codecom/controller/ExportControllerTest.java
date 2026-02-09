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
}
