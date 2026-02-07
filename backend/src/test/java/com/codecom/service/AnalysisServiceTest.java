package com.codecom.service;

import com.codecom.dto.SymbolInfo;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class AnalysisServiceTest {

    private final AnalysisService service = new AnalysisService();

    @TempDir
    Path tempDir;

    @Test
    void getOutline_ShouldIdentifyBoilerplateAndArchitecture() throws IOException {
        String code = """
            public interface MyInterface {}
            public class User {
                public User() {}
                public String getName() { return ""; }
                public void process() { /* logic */ }
            }
            """;
        Path file = tempDir.resolve("User.java");
        Files.writeString(file, code);

        List<SymbolInfo> symbols = service.getOutline(file.toString());

        assertThat(symbols).extracting(SymbolInfo::name)
                .containsExactly("MyInterface", "User", "User", "getName", "process");
        
        assertThat(symbols.get(0).category()).isEqualTo("ARCHITECTURE"); // interface
        assertThat(symbols.get(1).category()).isEqualTo("CORE"); // class
        assertThat(symbols.get(2).category()).isEqualTo("BOILERPLATE"); // constructor
        assertThat(symbols.get(3).category()).isEqualTo("BOILERPLATE"); // getter
        assertThat(symbols.get(4).category()).isEqualTo("CORE"); // regular method
    }

    @Test
    void getOutline_ShouldDetectJavaClassesAndMethods() throws IOException {
        String code = """
            public class TestClass {
                public void testMethod() {}
                private static String helper(int x) { return ""; }
            }
            """;
        Path file = tempDir.resolve("Test.java");
        Files.writeString(file, code);

        List<SymbolInfo> symbols = service.getOutline(file.toString());

        assertThat(symbols).extracting(SymbolInfo::name)
                .containsExactly("TestClass", "testMethod", "helper");
        assertThat(symbols.get(0).type()).isEqualTo("CLASS");
        assertThat(symbols.get(1).type()).isEqualTo("METHOD");
        assertThat(symbols.get(0).category()).isEqualTo("CORE");
    }

    @Test
    void getOutline_ShouldReturnEmpty_ForUnsupportedFiles() throws IOException {
        Path file = tempDir.resolve("test.js"); // JS is now handled by frontend
        Files.writeString(file, "function test() {}");

        List<SymbolInfo> symbols = service.getOutline(file.toString());

        assertThat(symbols).isEmpty();
    }
}
