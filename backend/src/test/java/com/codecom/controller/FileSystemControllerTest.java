package com.codecom.controller;

import com.codecom.dto.FileNode;
import com.codecom.service.FileSystemService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class FileSystemControllerTest {

    private MockMvc mockMvc;

    @Mock
    private FileSystemService fileSystemService;

    @InjectMocks
    private FileSystemController fileSystemController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(fileSystemController).build();
    }

    @Test
    void getContent_ShouldReturnRawText() throws Exception {
        when(fileSystemService.getFileContent(anyString())).thenReturn("test content");

        mockMvc.perform(get("/api/files/content").param("path", "some/path"))
                .andExpect(status().isOk())
                .andExpect(content().string("test content"));
    }

    @Test
    void getTree_ShouldReturnFileTree() throws Exception {
        // Given
        FileNode fileNode = new FileNode("root", "/root", true, Collections.emptyList());
        when(fileSystemService.getFileTree(anyString())).thenReturn(fileNode);

        // When/Then
        mockMvc.perform(get("/api/files/tree").param("path", "/root"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("root"))
                .andExpect(jsonPath("$.path").value("/root"))
                .andExpect(jsonPath("$.isDirectory").value(true));
    }

    @Test
    void getTree_ShouldUseDefaultPath() throws Exception {
        // Given
        FileNode fileNode = new FileNode("current", "/current", true, Collections.emptyList());
        when(fileSystemService.getFileTree(anyString())).thenReturn(fileNode);

        // When/Then - no path param, should use default "."
        mockMvc.perform(get("/api/files/tree"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("current"));
    }

    @Test
    void getNextFile_ShouldReturnNextFilePath() throws Exception {
        // Given
        when(fileSystemService.getNextFileInPackage(anyString()))
            .thenReturn("/path/to/NextFile.java");

        // When/Then
        mockMvc.perform(get("/api/files/navigate/next")
                .param("path", "/path/to/CurrentFile.java"))
                .andExpect(status().isOk())
                .andExpect(content().string("/path/to/NextFile.java"));
    }

    @Test
    void getPreviousFile_ShouldReturnPreviousFilePath() throws Exception {
        // Given
        when(fileSystemService.getPreviousFileInPackage(anyString()))
            .thenReturn("/path/to/PreviousFile.java");

        // When/Then
        mockMvc.perform(get("/api/files/navigate/previous")
                .param("path", "/path/to/CurrentFile.java"))
                .andExpect(status().isOk())
                .andExpect(content().string("/path/to/PreviousFile.java"));
    }
}
