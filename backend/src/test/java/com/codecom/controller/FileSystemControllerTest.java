package com.codecom.controller;

import com.codecom.service.FileSystemService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
}
