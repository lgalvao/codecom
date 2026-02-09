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

    @Test
    void getNextFileInPackage_ShouldReturnNextFile() throws IOException {
        Path file1 = tempDir.resolve("A.java");
        Path file2 = tempDir.resolve("B.java");
        Path file3 = tempDir.resolve("C.java");
        
        Files.writeString(file1, "class A {}");
        Files.writeString(file2, "class B {}");
        Files.writeString(file3, "class C {}");

        String next = service.getNextFileInPackage(file1.toString());

        assertThat(next).isEqualTo(file2.toString());
    }

    @Test
    void getNextFileInPackage_ShouldReturnNull_WhenLastFile() throws IOException {
        Path file = tempDir.resolve("OnlyFile.java");
        Files.writeString(file, "class OnlyFile {}");

        String next = service.getNextFileInPackage(file.toString());

        assertThat(next).isNull();
    }

    @Test
    void getNextFileInPackage_ShouldReturnNull_WhenDirectoryProvided() throws IOException {
        Path dir = tempDir.resolve("subdir");
        Files.createDirectory(dir);

        String next = service.getNextFileInPackage(dir.toString());

        assertThat(next).isNull();
    }

    @Test
    void getNextFileInPackage_ShouldReturnNull_WhenFileDoesNotExist() {
        String next = service.getNextFileInPackage(tempDir.resolve("nonexistent.java").toString());

        assertThat(next).isNull();
    }

    @Test
    void getNextFileInPackage_ShouldSkipHiddenFiles() throws IOException {
        Path file1 = tempDir.resolve("A.java");
        Path hidden = tempDir.resolve(".hidden.java");
        Path file2 = tempDir.resolve("B.java");
        
        Files.writeString(file1, "class A {}");
        Files.writeString(hidden, "class Hidden {}");
        Files.writeString(file2, "class B {}");

        String next = service.getNextFileInPackage(file1.toString());

        assertThat(next).isEqualTo(file2.toString());
    }

    @Test
    void getPreviousFileInPackage_ShouldReturnPreviousFile() throws IOException {
        Path file1 = tempDir.resolve("A.java");
        Path file2 = tempDir.resolve("B.java");
        Path file3 = tempDir.resolve("C.java");
        
        Files.writeString(file1, "class A {}");
        Files.writeString(file2, "class B {}");
        Files.writeString(file3, "class C {}");

        String prev = service.getPreviousFileInPackage(file3.toString());

        assertThat(prev).isEqualTo(file2.toString());
    }

    @Test
    void getPreviousFileInPackage_ShouldReturnNull_WhenFirstFile() throws IOException {
        Path file = tempDir.resolve("OnlyFile.java");
        Files.writeString(file, "class OnlyFile {}");

        String prev = service.getPreviousFileInPackage(file.toString());

        assertThat(prev).isNull();
    }

    @Test
    void getPreviousFileInPackage_ShouldReturnNull_WhenDirectoryProvided() throws IOException {
        Path dir = tempDir.resolve("subdir");
        Files.createDirectory(dir);

        String prev = service.getPreviousFileInPackage(dir.toString());

        assertThat(prev).isNull();
    }

    @Test
    void getPreviousFileInPackage_ShouldReturnNull_WhenFileDoesNotExist() {
        String prev = service.getPreviousFileInPackage(tempDir.resolve("nonexistent.java").toString());

        assertThat(prev).isNull();
    }

    @Test
    void getAdjacentFile_ShouldHandleSortingCorrectly() throws IOException {
        // Create files with different casing to test case-insensitive sorting
        Path file1 = tempDir.resolve("apple.java");
        Path file2 = tempDir.resolve("Banana.java");
        Path file3 = tempDir.resolve("cherry.java");
        
        Files.writeString(file1, "class Apple {}");
        Files.writeString(file2, "class Banana {}");
        Files.writeString(file3, "class Cherry {}");

        String next = service.getNextFileInPackage(file1.toString());

        assertThat(next).isEqualTo(file2.toString());
    }

    @Test
    void getAdjacentFile_ShouldOnlyReturnFiles_NotDirectories() throws IOException {
        Path file1 = tempDir.resolve("A.java");
        Path dir = tempDir.resolve("B-directory");
        Path file2 = tempDir.resolve("C.java");
        
        Files.writeString(file1, "class A {}");
        Files.createDirectory(dir);
        Files.writeString(file2, "class C {}");

        String next = service.getNextFileInPackage(file1.toString());

        assertThat(next).isEqualTo(file2.toString());
    }

    @Test
    void getNextFileInPackage_ShouldHandleMultipleFilesInSameDirectory() throws IOException {
        Path file1 = tempDir.resolve("File1.java");
        Path file2 = tempDir.resolve("File2.java");
        Path file3 = tempDir.resolve("File3.java");
        Path file4 = tempDir.resolve("File4.java");
        
        Files.writeString(file1, "class File1 {}");
        Files.writeString(file2, "class File2 {}");
        Files.writeString(file3, "class File3 {}");
        Files.writeString(file4, "class File4 {}");

        String next1 = service.getNextFileInPackage(file1.toString());
        String next2 = service.getNextFileInPackage(file2.toString());
        String next3 = service.getNextFileInPackage(file3.toString());
        String next4 = service.getNextFileInPackage(file4.toString());

        assertThat(next1).isEqualTo(file2.toString());
        assertThat(next2).isEqualTo(file3.toString());
        assertThat(next3).isEqualTo(file4.toString());
        assertThat(next4).isNull();
    }

    @Test
    void getPreviousFileInPackage_ShouldHandleMultipleFilesInSameDirectory() throws IOException {
        Path file1 = tempDir.resolve("File1.java");
        Path file2 = tempDir.resolve("File2.java");
        Path file3 = tempDir.resolve("File3.java");
        Path file4 = tempDir.resolve("File4.java");
        
        Files.writeString(file1, "class File1 {}");
        Files.writeString(file2, "class File2 {}");
        Files.writeString(file3, "class File3 {}");
        Files.writeString(file4, "class File4 {}");

        String prev1 = service.getPreviousFileInPackage(file1.toString());
        String prev2 = service.getPreviousFileInPackage(file2.toString());
        String prev3 = service.getPreviousFileInPackage(file3.toString());
        String prev4 = service.getPreviousFileInPackage(file4.toString());

        assertThat(prev1).isNull();
        assertThat(prev2).isEqualTo(file1.toString());
        assertThat(prev3).isEqualTo(file2.toString());
        assertThat(prev4).isEqualTo(file3.toString());
    }

    @Test
    void getFileTree_ShouldHandleNestedDirectories() throws IOException {
        Path subdir = tempDir.resolve("com/example");
        Files.createDirectories(subdir);
        Files.createFile(subdir.resolve("Test.java"));
        Files.createFile(tempDir.resolve("Root.java"));

        FileNode root = service.getFileTree(tempDir.toString());

        assertThat(root.children()).hasSize(2); // com and Root.java
        assertThat(root.children().get(0).isDirectory()).isTrue();
        assertThat(root.children().get(0).name()).isEqualTo("com");
    }

    @Test
    void getFileTree_ShouldFilterDatabaseFiles() throws IOException {
        Files.createFile(tempDir.resolve("data.db"));
        Files.createFile(tempDir.resolve("Valid.java"));

        FileNode root = service.getFileTree(tempDir.toString());

        assertThat(root.children()).hasSize(1);
        assertThat(root.children().get(0).name()).isEqualTo("Valid.java");
    }

    @Test
    void getFileTree_ShouldHandleEmptyDirectory() throws IOException {
        FileNode root = service.getFileTree(tempDir.toString());

        assertThat(root.children()).isEmpty();
    }
}
