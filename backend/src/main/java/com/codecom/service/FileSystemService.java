package com.codecom.service;

import com.codecom.dto.FileNode;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class FileSystemService {

    public FileNode getFileTree(String rootPath) {
        File root = new File(rootPath);
        if (!root.exists()) {
            throw new IllegalArgumentException("Path does not exist: " + rootPath);
        }
        return buildNode(root);
    }

    private FileNode buildNode(File file) {
        boolean isDirectory = file.isDirectory();
        List<FileNode> children = isDirectory ? scanDirectory(file) : null;
        String name = resolveNodeName(file);

        return new FileNode(
            name,
            file.getAbsolutePath(),
            isDirectory,
            children
        );
    }

    private List<FileNode> scanDirectory(File file) {
        File[] files = file.listFiles();
        if (files == null) return new ArrayList<>();

        return Arrays.stream(files)
                .filter(f -> !f.getName().startsWith(".")) 
                .filter(f -> !f.getName().equals("node_modules"))
                .filter(f -> !f.getName().equals("target"))
                .map(this::buildNode)
                .sorted((n1, n2) -> {
                    if (n1.isDirectory() && !n2.isDirectory()) return -1;
                    if (!n1.isDirectory() && n2.isDirectory()) return 1;
                    return n1.name().compareToIgnoreCase(n2.name());
                })
                .toList();
    }

    private String resolveNodeName(File file) {
        String name = file.getName();
        if (!name.isEmpty() && !name.equals(".") && !name.equals("..")) {
            return name;
        }
        try {
            return file.getCanonicalFile().getName();
        } catch (IOException _) {
            return file.getAbsoluteFile().getName();
        }
    }

    public String getFileContent(String path) throws IOException {
        return Files.readString(Path.of(path));
    }
}
