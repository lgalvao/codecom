package com.codecom.controller;

import com.codecom.dto.SymbolInfo;
import com.codecom.dto.SymbolSearchResult;
import com.codecom.service.AnalysisService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AnalysisControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AnalysisService analysisService;

    @InjectMocks
    private AnalysisController analysisController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(analysisController).build();
    }

    @Test
    void getOutline_ShouldReturnSymbolList() throws Exception {
        // Given
        List<SymbolInfo> symbols = Arrays.asList(
            new SymbolInfo("TestClass", "CLASS", 1, 0, "CORE"),
            new SymbolInfo("testMethod", "METHOD", 5, 4, "CORE")
        );
        when(analysisService.getOutline(anyString())).thenReturn(symbols);

        // When/Then
        mockMvc.perform(get("/api/analysis/outline")
                .param("path", "/test/Sample.java"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("TestClass"))
                .andExpect(jsonPath("$[0].type").value("CLASS"))
                .andExpect(jsonPath("$[1].name").value("testMethod"))
                .andExpect(jsonPath("$[1].type").value("METHOD"));
    }

    @Test
    void getOutline_ShouldReturnEmptyList_WhenNoSymbolsFound() throws Exception {
        // Given
        when(analysisService.getOutline(anyString())).thenReturn(Collections.emptyList());

        // When/Then
        mockMvc.perform(get("/api/analysis/outline")
                .param("path", "/test/Empty.txt"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void searchSymbols_ShouldReturnSearchResults() throws Exception {
        // Given
        List<SymbolSearchResult> results = Arrays.asList(
            new SymbolSearchResult("UserService", "CLASS", 1, 0, "CORE", "/src/UserService.java", "UserService.java"),
            new SymbolSearchResult("UserController", "CLASS", 1, 0, "CORE", "/src/UserController.java", "UserController.java")
        );
        when(analysisService.searchSymbols(anyString(), anyString())).thenReturn(results);

        // When/Then
        mockMvc.perform(get("/api/analysis/search")
                .param("path", "/project/src")
                .param("query", "User"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("UserService"))
                .andExpect(jsonPath("$[0].type").value("CLASS"))
                .andExpect(jsonPath("$[0].filePath").value("/src/UserService.java"))
                .andExpect(jsonPath("$[1].name").value("UserController"));
    }

    @Test
    void searchSymbols_ShouldReturnEmptyList_WhenNoMatches() throws Exception {
        // Given
        when(analysisService.searchSymbols(anyString(), anyString()))
            .thenReturn(Collections.emptyList());

        // When/Then
        mockMvc.perform(get("/api/analysis/search")
                .param("path", "/project/src")
                .param("query", "NonExistent"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void searchSymbols_ShouldRequirePathParameter() throws Exception {
        // When/Then - missing path parameter
        mockMvc.perform(get("/api/analysis/search")
                .param("query", "test"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void searchSymbols_ShouldRequireQueryParameter() throws Exception {
        // When/Then - missing query parameter
        mockMvc.perform(get("/api/analysis/search")
                .param("path", "/test"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void getOutline_ShouldRequirePathParameter() throws Exception {
        // When/Then - missing path parameter
        mockMvc.perform(get("/api/analysis/outline"))
                .andExpect(status().is4xxClientError());
    }
}
