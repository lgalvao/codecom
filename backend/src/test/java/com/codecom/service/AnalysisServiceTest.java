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

    @Test
    void searchSymbols_ShouldFindMatchingSymbols() throws IOException {
        // Create directory with multiple Java files
        Path file1 = tempDir.resolve("UserService.java");
        Path file2 = tempDir.resolve("UserController.java");
        Path file3 = tempDir.resolve("ProductService.java");
        
        Files.writeString(file1, "public class UserService { public void findUser() {} }");
        Files.writeString(file2, "public class UserController { public void getUser() {} }");
        Files.writeString(file3, "public class ProductService { public void findProduct() {} }");

        var results = service.searchSymbols(tempDir.toString(), "User");

        assertThat(results).hasSize(4); // UserService, UserController, findUser, getUser
        assertThat(results).extracting("name")
                .contains("UserService", "UserController", "findUser", "getUser");
    }

    @Test
    void searchSymbols_ShouldBeCaseInsensitive() throws IOException {
        Path file = tempDir.resolve("TestClass.java");
        Files.writeString(file, "public class TestClass { public void testMethod() {} }");

        var results = service.searchSymbols(tempDir.toString(), "test");

        assertThat(results).hasSize(2); // TestClass and testMethod
        assertThat(results).extracting("name").contains("TestClass", "testMethod");
    }

    @Test
    void searchSymbols_ShouldReturnEmpty_WhenNoMatches() throws IOException {
        Path file = tempDir.resolve("Sample.java");
        Files.writeString(file, "public class Sample { public void doSomething() {} }");

        var results = service.searchSymbols(tempDir.toString(), "NonExistent");

        assertThat(results).isEmpty();
    }

    @Test
    void searchSymbols_ShouldExcludeFilteredDirectories() throws IOException {
        // Create files in filtered directories
        Path nodeModules = tempDir.resolve("node_modules");
        Path target = tempDir.resolve("target");
        Path git = tempDir.resolve(".git");
        
        Files.createDirectory(nodeModules);
        Files.createDirectory(target);
        Files.createDirectory(git);
        
        Files.writeString(nodeModules.resolve("Test.java"), "public class Test {}");
        Files.writeString(target.resolve("Build.java"), "public class Build {}");
        Files.writeString(git.resolve("Config.java"), "public class Config {}");
        
        // Create valid file in root
        Files.writeString(tempDir.resolve("Valid.java"), "public class Valid {}");

        var results = service.searchSymbols(tempDir.toString(), "");

        assertThat(results).hasSize(1); // Only Valid class
        assertThat(results).extracting("name").containsExactly("Valid");
    }

    @Test
    void searchSymbols_ShouldOnlyProcessJavaFiles() throws IOException {
        Files.writeString(tempDir.resolve("Test.java"), "public class Test {}");
        Files.writeString(tempDir.resolve("script.js"), "function test() {}");
        Files.writeString(tempDir.resolve("README.md"), "# Test");

        var results = service.searchSymbols(tempDir.toString(), "");

        // Should only find symbols from Java file
        assertThat(results).hasSize(1);
        assertThat(results.get(0).name()).isEqualTo("Test");
    }

    @Test
    void searchSymbols_ShouldIncludeFilePathAndName() throws IOException {
        Path file = tempDir.resolve("UserService.java");
        Files.writeString(file, "public class UserService { public void findUser() {} }");

        var results = service.searchSymbols(tempDir.toString(), "User");

        assertThat(results.get(0).filePath()).contains("UserService.java");
        assertThat(results.get(0).fileName()).isEqualTo("UserService.java");
    }

    @Test
    void searchSymbols_ShouldHandleNestedDirectories() throws IOException {
        Path subDir = tempDir.resolve("com/example");
        Files.createDirectories(subDir);
        Files.writeString(subDir.resolve("Service.java"), "public class Service {}");

        var results = service.searchSymbols(tempDir.toString(), "Service");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).name()).isEqualTo("Service");
    }

    @Test
    void searchSymbols_ShouldHandleEmptyDirectory() throws IOException {
        Path emptyDir = tempDir.resolve("empty");
        Files.createDirectory(emptyDir);

        var results = service.searchSymbols(emptyDir.toString(), "Test");

        assertThat(results).isEmpty();
    }

    @Test
    void searchSymbols_ShouldHandleMalformedJavaFile() throws IOException {
        Path file = tempDir.resolve("Broken.java");
        Files.writeString(file, "this is not valid java code {{{");

        // Should not throw exception, just skip the file
        var results = service.searchSymbols(tempDir.toString(), "Broken");

        assertThat(results).isEmpty();
    }

    @Test
    void searchSymbols_ShouldSortExactMatchesFirst() throws IOException {
        Files.writeString(tempDir.resolve("UserService.java"), 
            "public class UserService { public void userMethod() {} }");
        Files.writeString(tempDir.resolve("User.java"), 
            "public class User {}");

        var results = service.searchSymbols(tempDir.toString(), "User");

        // Exact match "User" should come before "UserService" and "userMethod"
        assertThat(results.get(0).name()).isEqualTo("User");
    }

    @Test
    void detectDeadCode_ShouldIdentifyMethodsWithNoCallers() throws IOException {
        // Create a file with used and unused methods
        String code = """
            public class Service {
                public void usedMethod() {
                    helperMethod();
                }
                
                private void helperMethod() {
                    // Called by usedMethod
                }
                
                private void unusedMethod() {
                    // Never called
                }
            }
            """;
        Files.writeString(tempDir.resolve("Service.java"), code);

        var deadCode = service.detectDeadCode(tempDir.toString());

        // unusedMethod should be detected as potentially dead
        assertThat(deadCode)
            .anyMatch(d -> d.name().equals("unusedMethod") && d.callerCount() == 0);
        
        // helperMethod should have at least 1 caller
        assertThat(deadCode)
            .noneMatch(d -> d.name().equals("helperMethod") && d.callerCount() == 0)
            .describedAs("helperMethod should be detected as used");
    }

    @Test
    void detectDeadCode_ShouldMarkPublicMethodsCorrectly() throws IOException {
        String code = """
            public class API {
                public void publicAPI() {
                    // No internal callers, but public
                }
                
                private void privateUnused() {
                    // No callers and private
                }
            }
            """;
        Files.writeString(tempDir.resolve("API.java"), code);

        var deadCode = service.detectDeadCode(tempDir.toString());

        // Both should be detected, but with different isPublic flags
        var publicMethod = deadCode.stream()
            .filter(d -> d.name().equals("publicAPI"))
            .findFirst();
        assertThat(publicMethod).isPresent();
        assertThat(publicMethod.get().isPublic()).isTrue();
        assertThat(publicMethod.get().isPotentiallyDead()).isFalse(); // Public APIs are not marked as dead

        var privateMethod = deadCode.stream()
            .filter(d -> d.name().equals("privateUnused"))
            .findFirst();
        assertThat(privateMethod).isPresent();
        assertThat(privateMethod.get().isPublic()).isFalse();
        assertThat(privateMethod.get().isPotentiallyDead()).isTrue(); // Private unused is dead
    }

    @Test
    void detectDeadCode_ShouldHandleTestFiles() throws IOException {
        String testCode = """
            public class MyTest {
                public void testSomething() {
                    // Test method with no internal callers
                }
            }
            """;
        Files.writeString(tempDir.resolve("MyTest.java"), testCode);

        var deadCode = service.detectDeadCode(tempDir.toString());

        // Test method should be detected but marked as test
        var testMethod = deadCode.stream()
            .filter(d -> d.name().equals("testSomething"))
            .findFirst();
        assertThat(testMethod).isPresent();
        assertThat(testMethod.get().isTest()).isTrue();
        assertThat(testMethod.get().isPotentiallyDead()).isFalse(); // Tests are not marked as dead
    }

    @Test
    void detectDeadCode_ShouldHandleMultipleFiles() throws IOException {
        // File 1: Service with methods
        String serviceCode = """
            public class UserService {
                public void save() {
                    validate();
                }
                
                private void validate() {
                    // Called by save
                }
                
                private void orphanMethod() {
                    // Never called
                }
            }
            """;
        Files.writeString(tempDir.resolve("UserService.java"), serviceCode);

        // File 2: Controller that calls the service
        String controller = """
            public class UserController {
                public void handleRequest() {
                    UserService service = new UserService();
                    service.save();
                }
            }
            """;
        Files.writeString(tempDir.resolve("UserController.java"), controller);

        var deadCode = service.detectDeadCode(tempDir.toString());

        // orphanMethod should be dead
        assertThat(deadCode)
            .anyMatch(d -> d.name().equals("orphanMethod") && d.isPotentiallyDead());
        
        // save should have callers
        assertThat(deadCode)
            .noneMatch(d -> d.name().equals("save") && d.callerCount() == 0);
    }
}
