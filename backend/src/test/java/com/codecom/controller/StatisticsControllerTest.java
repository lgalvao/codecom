package com.codecom.controller;

import com.codecom.dto.CodeStatistics;
import com.codecom.service.StatisticsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.io.IOException;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class StatisticsControllerTest {

    private MockMvc mockMvc;

    @Mock
    private StatisticsService statisticsService;

    @InjectMocks
    private StatisticsController statisticsController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(statisticsController).build();
    }

    @Test
    void getFileStatistics_ShouldReturnStatistics() throws Exception {
        // Given
        CodeStatistics stats = new CodeStatistics(100, 75, 15, 10, 5, 2, 1, 0, 1);
        when(statisticsService.calculateFileStatistics(anyString())).thenReturn(stats);

        // When/Then
        mockMvc.perform(get("/api/statistics/file")
                .param("path", "/test/Sample.java"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalLines").value(100))
                .andExpect(jsonPath("$.codeLines").value(75))
                .andExpect(jsonPath("$.commentLines").value(15))
                .andExpect(jsonPath("$.blankLines").value(10))
                .andExpect(jsonPath("$.methodCount").value(5))
                .andExpect(jsonPath("$.classCount").value(2))
                .andExpect(jsonPath("$.interfaceCount").value(1))
                .andExpect(jsonPath("$.recordCount").value(0))
                .andExpect(jsonPath("$.packageCount").value(1));
    }

    @Test
    void getFileStatistics_ShouldReturnZeroStats_ForEmptyFile() throws Exception {
        // Given
        CodeStatistics stats = new CodeStatistics(0, 0, 0, 0, 0, 0, 0, 0, 0);
        when(statisticsService.calculateFileStatistics(anyString())).thenReturn(stats);

        // When/Then
        mockMvc.perform(get("/api/statistics/file")
                .param("path", "/test/Empty.java"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalLines").value(0))
                .andExpect(jsonPath("$.codeLines").value(0))
                .andExpect(jsonPath("$.methodCount").value(0));
    }

    @Test
    void getFileStatistics_ShouldRequirePathParameter() throws Exception {
        // When/Then - missing path parameter
        mockMvc.perform(get("/api/statistics/file"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void getDirectoryStatistics_ShouldReturnAggregatedStatistics() throws Exception {
        // Given
        CodeStatistics stats = new CodeStatistics(500, 380, 75, 45, 25, 8, 3, 1, 5);
        when(statisticsService.calculateDirectoryStatistics(anyString())).thenReturn(stats);

        // When/Then
        mockMvc.perform(get("/api/statistics/directory")
                .param("path", "/test/project"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalLines").value(500))
                .andExpect(jsonPath("$.codeLines").value(380))
                .andExpect(jsonPath("$.commentLines").value(75))
                .andExpect(jsonPath("$.blankLines").value(45))
                .andExpect(jsonPath("$.methodCount").value(25))
                .andExpect(jsonPath("$.classCount").value(8))
                .andExpect(jsonPath("$.interfaceCount").value(3))
                .andExpect(jsonPath("$.recordCount").value(1))
                .andExpect(jsonPath("$.packageCount").value(5));
    }

    @Test
    void getDirectoryStatistics_ShouldReturnZeroStats_ForEmptyDirectory() throws Exception {
        // Given
        CodeStatistics stats = new CodeStatistics(0, 0, 0, 0, 0, 0, 0, 0, 0);
        when(statisticsService.calculateDirectoryStatistics(anyString())).thenReturn(stats);

        // When/Then
        mockMvc.perform(get("/api/statistics/directory")
                .param("path", "/test/empty"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalLines").value(0));
    }

    @Test
    void getDirectoryStatistics_ShouldRequirePathParameter() throws Exception {
        // When/Then - missing path parameter
        mockMvc.perform(get("/api/statistics/directory"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void getFileStatistics_ShouldHandleNonJavaFiles() throws Exception {
        // Given - generic file statistics (no structure counts)
        CodeStatistics stats = new CodeStatistics(50, 42, 3, 5, 0, 0, 0, 0, 0);
        when(statisticsService.calculateFileStatistics(anyString())).thenReturn(stats);

        // When/Then
        mockMvc.perform(get("/api/statistics/file")
                .param("path", "/test/script.js"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalLines").value(50))
                .andExpect(jsonPath("$.codeLines").value(42))
                .andExpect(jsonPath("$.methodCount").value(0))
                .andExpect(jsonPath("$.classCount").value(0));
    }
}
