package com.codecom.controller;

import com.codecom.dto.*;
import com.codecom.service.AnalysisService;
import com.codecom.service.ComplexityService;
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
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AnalysisControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AnalysisService analysisService;

    @Mock
    private ComplexityService complexityService;

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

    @Test
    void getSymbolDefinition_ShouldReturnDefinition() throws Exception {
        // Given
        SymbolDefinition.Parameter param = new SymbolDefinition.Parameter("name", "String");
        List<SymbolDefinition.Parameter> params = List.of(param);
        SymbolDefinition definition = new SymbolDefinition("TestClass", "public class TestClass", 
            "CLASS", null, params, "Test class documentation", "/path/TestClass.java", 1, 
            "public class TestClass");
        when(analysisService.getSymbolDefinition(anyString(), anyInt(), anyInt()))
            .thenReturn(Optional.of(definition));

        // When/Then
        mockMvc.perform(get("/api/analysis/definition")
                .param("path", "/test/TestClass.java")
                .param("line", "10")
                .param("column", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("TestClass"))
                .andExpect(jsonPath("$.type").value("CLASS"))
                .andExpect(jsonPath("$.signature").value("public class TestClass"));
    }

    @Test
    void getSymbolDefinition_ShouldReturnNotFound_WhenNoDefinition() throws Exception {
        // Given
        when(analysisService.getSymbolDefinition(anyString(), anyInt(), anyInt()))
            .thenReturn(Optional.empty());

        // When/Then
        mockMvc.perform(get("/api/analysis/definition")
                .param("path", "/test/TestClass.java")
                .param("line", "10"))
                .andExpect(status().isNotFound());
    }

    @Test
    void findCallers_ShouldReturnCallerStatistics() throws Exception {
        // Given
        CallerInfo caller1 = new CallerInfo("processData", "ServiceClass", "Service.java", 15, 1);
        CallerInfo caller2 = new CallerInfo("handleRequest", "ControllerClass", "Controller.java", 20, 1);
        CallerStatistics stats = new CallerStatistics("testMethod", "TestClass", 2, 2, 
            Arrays.asList(caller1, caller2));
        when(analysisService.findCallers(anyString(), anyString(), anyString()))
            .thenReturn(stats);

        // When/Then
        mockMvc.perform(get("/api/analysis/callers")
                .param("path", "/test/TestClass.java")
                .param("methodName", "testMethod")
                .param("className", "TestClass"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.targetMethod").value("testMethod"))
                .andExpect(jsonPath("$.targetClass").value("TestClass"))
                .andExpect(jsonPath("$.totalCallers").value(2))
                .andExpect(jsonPath("$.callers.length()").value(2));
    }

    @Test
    void findTestReferences_ShouldReturnTestReferenceList() throws Exception {
        // Given
        TestReference ref1 = new TestReference("TestClassTest", "TestClassTest.java", 1, List.of(10));
        TestReference ref2 = new TestReference("TestClassTest", "TestClassTest.java", 1, List.of(20));
        when(analysisService.findTestReferences(anyString(), anyString()))
            .thenReturn(Arrays.asList(ref1, ref2));

        // When/Then
        mockMvc.perform(get("/api/analysis/test-references")
                .param("path", "/test/TestClass.java")
                .param("className", "TestClass"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].testClassName").value("TestClassTest"));
    }

    @Test
    void detectDeadCode_ShouldReturnDeadCodeList() throws Exception {
        // Given
        DeadCodeInfo dead1 = new DeadCodeInfo("unusedMethod", "METHOD", "TestClass", 
            "/test/TestClass.java", 50, 0, false, false, "No internal callers");
        DeadCodeInfo dead2 = new DeadCodeInfo("obsoleteMethod", "METHOD", "TestClass",
            "/test/TestClass.java", 100, 0, true, false, "No internal callers");
        when(analysisService.detectDeadCode(anyString()))
            .thenReturn(Arrays.asList(dead1, dead2));

        // When/Then
        mockMvc.perform(get("/api/analysis/dead-code")
                .param("path", "/test/TestClass.java"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("unusedMethod"))
                .andExpect(jsonPath("$[0].callerCount").value(0));
    }

    @Test
    void getProjectComplexity_ShouldReturnComplexityList() throws Exception {
        // Given
        FileComplexity fc1 = new FileComplexity("/test/TestClass.java", 15, 100, 8);
        FileComplexity fc2 = new FileComplexity("/test/Service.java", 25, 200, 12);
        when(complexityService.calculateProjectComplexity(anyString()))
            .thenReturn(Arrays.asList(fc1, fc2));

        // When/Then
        mockMvc.perform(get("/api/analysis/complexity")
                .param("path", "/test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].filePath").value("/test/TestClass.java"))
                .andExpect(jsonPath("$[0].cyclomaticComplexity").value(15));
    }

    @Test
    void getFileComplexity_ShouldReturnComplexity() throws Exception {
        // Given
        FileComplexity fc = new FileComplexity("/test/TestClass.java", 15, 100, 8);
        when(complexityService.calculateFileComplexity(anyString()))
            .thenReturn(fc);

        // When/Then
        mockMvc.perform(get("/api/analysis/complexity/file")
                .param("path", "/test/TestClass.java"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.filePath").value("/test/TestClass.java"))
                .andExpect(jsonPath("$.cyclomaticComplexity").value(15))
                .andExpect(jsonPath("$.linesOfCode").value(100));
    }

    @Test
    void getFileComplexity_ShouldReturnNotFound_WhenNoComplexity() throws Exception {
        // Given
        when(complexityService.calculateFileComplexity(anyString()))
            .thenReturn(null);

        // When/Then
        mockMvc.perform(get("/api/analysis/complexity/file")
                .param("path", "/test/NonExistent.java"))
                .andExpect(status().isNotFound());
    }
}
