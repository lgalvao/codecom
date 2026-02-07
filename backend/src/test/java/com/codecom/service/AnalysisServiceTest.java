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
    }

    @Test
    void getOutline_ShouldDetectJsFunctions() throws IOException {
        String code = """
            function classic() {}
            const arrow = () => {};
            const asyncFunc = async function() {};
            class User {}
            """;
        Path file = tempDir.resolve("test.js");
        Files.writeString(file, code);

        List<SymbolInfo> symbols = service.getOutline(file.toString());

        assertThat(symbols).extracting(SymbolInfo::name)
                .contains("classic", "arrow", "asyncFunc", "User");
    }

    @Test
    void getOutline_ShouldReturnEmpty_ForUnsupportedFiles() throws IOException {
        Path file = tempDir.resolve("test.txt");
        Files.writeString(file, "just text");

        List<SymbolInfo> symbols = service.getOutline(file.toString());

        assertThat(symbols).isEmpty();
    }
}
