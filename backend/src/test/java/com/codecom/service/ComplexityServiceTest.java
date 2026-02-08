package com.codecom.service;

import com.codecom.dto.FileComplexity;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests for ComplexityService
 * FR.32: Complexity Heatmap
 */
class ComplexityServiceTest {
    
    private final ComplexityService service = new ComplexityService();
    
    @TempDir
    Path tempDir;
    
    @Test
    void calculateFileComplexity_SimpleClass_ShouldReturnLowComplexity() throws IOException {
        String code = """
            public class Simple {
                public void hello() {
                    System.out.println("Hello");
                }
            }
            """;
        
        Path file = tempDir.resolve("Simple.java");
        Files.writeString(file, code);
        
        FileComplexity result = service.calculateFileComplexity(file.toString());
        
        assertThat(result).isNotNull();
        assertThat(result.getFilePath()).isEqualTo(file.toString());
        assertThat(result.getCyclomaticComplexity()).isEqualTo(1); // 1 method
        assertThat(result.getNumberOfMethods()).isEqualTo(1);
        assertThat(result.getComplexityLevel()).isEqualTo("LOW");
    }
    
    @Test
    void calculateFileComplexity_ComplexClass_ShouldReturnHighComplexity() throws IOException {
        String code = """
            public class Complex {
                public void process(int value) {
                    if (value > 0) {
                        for (int i = 0; i < value; i++) {
                            if (i % 2 == 0) {
                                System.out.println("Even");
                            } else {
                                System.out.println("Odd");
                            }
                        }
                    } else if (value < 0) {
                        while (value < 0) {
                            value++;
                        }
                    } else {
                        switch (value) {
                            case 0:
                                System.out.println("Zero");
                                break;
                            case 1:
                                System.out.println("One");
                                break;
                        }
                    }
                }
                
                public void method2() {
                    try {
                        riskyOperation();
                    } catch (Exception e) {
                        handleError();
                    }
                }
                
                public void riskyOperation() {}
                public void handleError() {}
            }
            """;
        
        Path file = tempDir.resolve("Complex.java");
        Files.writeString(file, code);
        
        FileComplexity result = service.calculateFileComplexity(file.toString());
        
        assertThat(result).isNotNull();
        assertThat(result.getCyclomaticComplexity()).isGreaterThan(10);
        assertThat(result.getNumberOfMethods()).isEqualTo(4);
    }
    
    @Test
    void calculateFileComplexity_MultipleControlFlows_ShouldCountCorrectly() throws IOException {
        String code = """
            public class Test {
                public void test() {
                    if (condition1()) {
                        for (int i = 0; i < 10; i++) {
                            doSomething();
                        }
                    } else if (condition2()) {
                        while (running) {
                            process();
                        }
                    }
                    
                    String result = ready ? "yes" : "no";
                }
                
                boolean condition1() { return true; }
                boolean condition2() { return false; }
                void doSomething() {}
                void process() {}
            }
            """;
        
        Path file = tempDir.resolve("Test.java");
        Files.writeString(file, code);
        
        FileComplexity result = service.calculateFileComplexity(file.toString());
        
        assertThat(result).isNotNull();
        // test() has: 1(base) + 2(if/else if) + 1(for) + 1(while) + 1(ternary) = 6
        // Plus 4 simple methods = 10 total
        assertThat(result.getCyclomaticComplexity()).isEqualTo(10);
        assertThat(result.getNumberOfMethods()).isEqualTo(5);
    }
    
    @Test
    void calculateFileComplexity_CountsLinesOfCode() throws IOException {
        String code = """
            public class Counter {
                // This is a comment
                public void method1() {
                    int x = 1;
                    int y = 2;
                }
                
                /* Multi-line
                   comment */
                public void method2() {
                    int z = 3;
                }
            }
            """;
        
        Path file = tempDir.resolve("Counter.java");
        Files.writeString(file, code);
        
        FileComplexity result = service.calculateFileComplexity(file.toString());
        
        assertThat(result).isNotNull();
        // Should count only non-comment, non-blank lines
        assertThat(result.getLinesOfCode()).isLessThan(15);
        assertThat(result.getLinesOfCode()).isGreaterThan(5);
    }
    
    @Test
    void calculateProjectComplexity_MultipleFiles_ShouldReturnAll() throws IOException {
        String code1 = """
            public class File1 {
                public void method1() {
                    if (true) { }
                }
            }
            """;
        
        String code2 = """
            public class File2 {
                public void method2() {
                    for (int i = 0; i < 10; i++) { }
                }
            }
            """;
        
        Path file1 = tempDir.resolve("File1.java");
        Path file2 = tempDir.resolve("File2.java");
        Files.writeString(file1, code1);
        Files.writeString(file2, code2);
        
        List<FileComplexity> results = service.calculateProjectComplexity(tempDir.toString());
        
        assertThat(results).hasSize(2);
        assertThat(results).extracting(FileComplexity::getFilePath)
            .containsExactlyInAnyOrder(file1.toString(), file2.toString());
    }
    
    @Test
    void calculateFileComplexity_SwitchStatement_ShouldCountCases() throws IOException {
        String code = """
            public class Switch {
                public void process(int value) {
                    switch (value) {
                        case 1:
                            doOne();
                            break;
                        case 2:
                            doTwo();
                            break;
                        case 3:
                            doThree();
                            break;
                        default:
                            doDefault();
                    }
                }
                
                void doOne() {}
                void doTwo() {}
                void doThree() {}
                void doDefault() {}
            }
            """;
        
        Path file = tempDir.resolve("Switch.java");
        Files.writeString(file, code);
        
        FileComplexity result = service.calculateFileComplexity(file.toString());
        
        assertThat(result).isNotNull();
        // process() has: 1(base) + 3(switch cases, default doesn't count as separate) = 4
        // Plus 4 simple methods = 8 total
        assertThat(result.getCyclomaticComplexity()).isEqualTo(8);
    }
    
    @Test
    void calculateFileComplexity_ComplexityScore_ShouldBeNormalized() throws IOException {
        String code = """
            public class Test {
                public void simple() {}
            }
            """;
        
        Path file = tempDir.resolve("Test.java");
        Files.writeString(file, code);
        
        FileComplexity result = service.calculateFileComplexity(file.toString());
        
        assertThat(result).isNotNull();
        assertThat(result.getComplexityScore()).isBetween(0.0, 1.0);
    }
    
    @Test
    void calculateFileComplexity_ComplexityLevel_ShouldBeCorrect() throws IOException {
        String simpleCode = """
            public class Simple {
                public void method() {}
            }
            """;
        
        Path simpleFile = tempDir.resolve("Simple.java");
        Files.writeString(simpleFile, simpleCode);
        
        FileComplexity simpleResult = service.calculateFileComplexity(simpleFile.toString());
        
        assertThat(simpleResult.getComplexityLevel()).isEqualTo("LOW");
    }
    
    @Test
    void calculateFileComplexity_InvalidJava_ShouldReturnNull() throws IOException {
        String invalidCode = "This is not valid Java code!!!";
        
        Path file = tempDir.resolve("Invalid.java");
        Files.writeString(file, invalidCode);
        
        FileComplexity result = service.calculateFileComplexity(file.toString());
        
        assertThat(result).isNull();
    }
}
