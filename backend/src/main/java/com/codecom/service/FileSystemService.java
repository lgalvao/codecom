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
                .filter(f -> !f.getName().endsWith(".db"))
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

    /**
     * Get the next file in the same package/directory
     * @param currentPath The current file path
     * @return Path to the next file, or null if there is no next file
     */
    public String getNextFileInPackage(String currentPath) {
        return getAdjacentFile(currentPath, true);
    }

    /**
     * Get the previous file in the same package/directory
     * @param currentPath The current file path
     * @return Path to the previous file, or null if there is no previous file
     */
    public String getPreviousFileInPackage(String currentPath) {
        return getAdjacentFile(currentPath, false);
    }

    private String getAdjacentFile(String currentPath, boolean next) {
        File currentFile = new File(currentPath);
        if (!currentFile.exists() || currentFile.isDirectory()) {
            return null;
        }

        File parentDir = currentFile.getParentFile();
        if (parentDir == null) {
            return null;
        }

        // Get all files in the same directory
        File[] files = parentDir.listFiles();
        if (files == null || files.length == 0) {
            return null;
        }

        // Filter and sort files (same logic as scanDirectory but only files)
        List<File> sortedFiles = Arrays.stream(files)
            .filter(File::isFile)
            .filter(f -> !f.getName().startsWith("."))
            .sorted((f1, f2) -> f1.getName().compareToIgnoreCase(f2.getName()))
            .toList();

        // Find current file index
        int currentIndex = -1;
        for (int i = 0; i < sortedFiles.size(); i++) {
            if (sortedFiles.get(i).getAbsolutePath().equals(currentFile.getAbsolutePath())) {
                currentIndex = i;
                break;
            }
        }

        if (currentIndex == -1) {
            return null;
        }

        // Get next or previous file
        int targetIndex = next ? currentIndex + 1 : currentIndex - 1;
        if (targetIndex < 0 || targetIndex >= sortedFiles.size()) {
            return null;
        }

        return sortedFiles.get(targetIndex).getAbsolutePath();
    }
}
