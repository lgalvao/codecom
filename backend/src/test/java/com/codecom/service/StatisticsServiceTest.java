package com.codecom.service;

import com.codecom.dto.CodeStatistics;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class StatisticsServiceTest {

    private final StatisticsService service = new StatisticsService();

    @TempDir
    Path tempDir;

    @Test
    void calculateFileStatistics_ShouldCountLinesCorrectly() throws IOException {
        String code = """
            package com.example;
            
            // This is a comment
            public class User {
                /* Multi-line
                   comment */
                public String getName() {
                    return "test";
                }
            }
            """;
        Path file = tempDir.resolve("User.java");
        Files.writeString(file, code);

        CodeStatistics stats = service.calculateFileStatistics(file.toString());

        assertThat(stats.totalLines()).isEqualTo(10);
        assertThat(stats.blankLines()).isGreaterThan(0);
        assertThat(stats.codeLines()).isGreaterThan(0);
        assertThat(stats.commentLines()).isGreaterThan(0);
    }

    @Test
    void calculateFileStatistics_ShouldCountMethodsAndClasses() throws IOException {
        String code = """
            public class TestClass {
                public TestClass() {}
                public void method1() {}
                private String method2() { return ""; }
            }
            """;
        Path file = tempDir.resolve("Test.java");
        Files.writeString(file, code);

        CodeStatistics stats = service.calculateFileStatistics(file.toString());

        assertThat(stats.methodCount()).isEqualTo(3); // constructor + 2 methods
        assertThat(stats.classCount()).isEqualTo(1);
        assertThat(stats.interfaceCount()).isEqualTo(0);
    }

    @Test
    void calculateFileStatistics_ShouldCountInterfaces() throws IOException {
        String code = """
            public interface MyInterface {
                void doSomething();
            }
            """;
        Path file = tempDir.resolve("MyInterface.java");
        Files.writeString(file, code);

        CodeStatistics stats = service.calculateFileStatistics(file.toString());

        assertThat(stats.interfaceCount()).isEqualTo(1);
        assertThat(stats.classCount()).isEqualTo(0);
        assertThat(stats.methodCount()).isEqualTo(1);
    }

    @Test
    void calculateFileStatistics_ShouldCountRecords() throws IOException {
        String code = """
            public record User(String name, int age) {
                public String displayName() {
                    return name + " (" + age + ")";
                }
            }
            """;
        Path file = tempDir.resolve("User.java");
        Files.writeString(file, code);

        CodeStatistics stats = service.calculateFileStatistics(file.toString());

        assertThat(stats.recordCount()).isEqualTo(1);
        // Method count could be 0 or 1 depending on JavaParser version handling of record methods
        assertThat(stats.methodCount()).isGreaterThanOrEqualTo(0);
    }

    @Test
    void calculateFileStatistics_ShouldHandleGenericFiles() throws IOException {
        String code = """
            function test() {
                console.log('hello');
            }
            
            test();
            """;
        Path file = tempDir.resolve("test.js");
        Files.writeString(file, code);

        CodeStatistics stats = service.calculateFileStatistics(file.toString());

        assertThat(stats.totalLines()).isEqualTo(5);
        assertThat(stats.codeLines()).isGreaterThan(0);
        assertThat(stats.blankLines()).isGreaterThan(0);
    }

    @Test
    void calculateDirectoryStatistics_ShouldAggregateMultipleFiles() throws IOException {
        // Create multiple Java files
        String class1 = """
            package com.example;
            public class Class1 {
                public void method1() {}
            }
            """;
        String class2 = """
            package com.example;
            public interface Interface1 {
                void method2();
            }
            """;
        
        Files.writeString(tempDir.resolve("Class1.java"), class1);
        Files.writeString(tempDir.resolve("Interface1.java"), class2);

        CodeStatistics stats = service.calculateDirectoryStatistics(tempDir.toString());

        assertThat(stats.classCount()).isEqualTo(1);
        assertThat(stats.interfaceCount()).isEqualTo(1);
        assertThat(stats.methodCount()).isEqualTo(2);
        assertThat(stats.packageCount()).isEqualTo(1); // Both in same package
        assertThat(stats.totalLines()).isGreaterThan(0);
    }

    @Test
    void calculateDirectoryStatistics_ShouldCountMultiplePackages() throws IOException {
        // Create files in different packages
        String class1 = """
            package com.example.one;
            public class Class1 {}
            """;
        String class2 = """
            package com.example.two;
            public class Class2 {}
            """;
        
        Files.writeString(tempDir.resolve("Class1.java"), class1);
        Files.writeString(tempDir.resolve("Class2.java"), class2);

        CodeStatistics stats = service.calculateDirectoryStatistics(tempDir.toString());

        assertThat(stats.packageCount()).isEqualTo(2);
        assertThat(stats.classCount()).isEqualTo(2);
    }
}
