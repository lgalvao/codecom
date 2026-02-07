package com.codecom.service;

import com.codecom.dto.FileNode;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FileSystemServiceTest {

    private final FileSystemService service = new FileSystemService();

    @TempDir
    Path tempDir;

    @Test
    void getFileTree_ShouldThrowException_WhenPathDoesNotExist() {
        assertThatThrownBy(() -> service.getFileTree("non-existent-path"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void getFileTree_ShouldBuildCorrectTree() throws IOException {
        // Setup
        Files.createDirectory(tempDir.resolve("folder1"));
        Files.createFile(tempDir.resolve("file1.java"));
        Files.createFile(tempDir.resolve("folder1/file2.js"));
        Files.createFile(tempDir.resolve(".hidden"));
        Files.createDirectory(tempDir.resolve("node_modules"));
        Files.createFile(tempDir.resolve("database.db"));

        // Execute
        FileNode root = service.getFileTree(tempDir.toString());

        // Verify
        assertThat(root.name()).isEqualTo(tempDir.getFileName().toString());
        assertThat(root.isDirectory()).isTrue();
        
        List<FileNode> children = root.children();
        // folder1 and file1.java (hidden, node_modules, target, and .db should be filtered)
        assertThat(children).hasSize(2);
        
        // Sorting: folder1 first, then file1.java
        assertThat(children.get(0).isDirectory()).isTrue();
        assertThat(children.get(0).name()).isEqualTo("folder1");
        assertThat(children.get(1).isDirectory()).isFalse();
        assertThat(children.get(1).name()).isEqualTo("file1.java");
    }

    @Test
    void getFileContent_ShouldReturnRawContent() throws IOException {
        Path file = tempDir.resolve("test.txt");
        String content = "Hello CodeCom";
        Files.writeString(file, content);

        String result = service.getFileContent(file.toString());

        assertThat(result).isEqualTo(content);
    }
}
