package com.codecom.controller;

import com.codecom.dto.FileNode;
import com.codecom.service.FileSystemService;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

import java.io.File;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "http://localhost:5173") // Allow frontend dev server
public class FileSystemController {

    private final FileSystemService fileSystemService;

    public FileSystemController(FileSystemService fileSystemService) {
        this.fileSystemService = fileSystemService;
    }

    @GetMapping("/tree")
    public FileNode getTree(@RequestParam(defaultValue = ".") String path) {
        // Absolute path for safety, or user-defined
        String absolutePath = new File(path).getAbsolutePath();
        return fileSystemService.getFileTree(absolutePath);
    }

    @GetMapping(value = "/content", produces = "text/plain")
    public String getContent(@RequestParam String path) throws IOException {
        return fileSystemService.getFileContent(path);
    }

    @GetMapping("/navigate/next")
    public String getNextFile(@RequestParam String path) {
        return fileSystemService.getNextFileInPackage(path);
    }

    @GetMapping("/navigate/previous")
    public String getPreviousFile(@RequestParam String path) {
        return fileSystemService.getPreviousFileInPackage(path);
    }
}
