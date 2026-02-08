package com.codecom.service;

import com.codecom.dto.CallerInfo;
import com.codecom.dto.CallerStatistics;
import com.codecom.dto.DeadCodeInfo;
import com.codecom.dto.SymbolDefinition;
import com.codecom.dto.SymbolInfo;
import com.codecom.dto.SymbolSearchResult;
import com.codecom.dto.TestReference;
import com.github.javaparser.JavaParser;
import com.github.javaparser.ParseResult;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.Node;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.ConstructorDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.body.Parameter;
import com.github.javaparser.ast.comments.JavadocComment;
import com.github.javaparser.ast.expr.MethodCallExpr;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Stream;

@Service
public class AnalysisService {

    private static final String TYPE_CLASS = "CLASS";
    private static final String TYPE_METHOD = "METHOD";

    private static final String CAT_CORE = "CORE";
    private static final String CAT_BOILERPLATE = "BOILERPLATE";
    private static final String CAT_ARCHITECTURE = "ARCHITECTURE";

    private final JavaParser javaParser = new JavaParser();

    public List<SymbolInfo> getOutline(String path) throws IOException {
        String content = Files.readString(Path.of(path));
        String extension = getExtension(path);

        return switch (extension) {
            case "java" -> extractJavaSymbols(content);
            default -> new ArrayList<>();
        };
    }

    private String getExtension(String path) {
        int lastDot = path.lastIndexOf('.');
        return lastDot == -1 ? "" : path.substring(lastDot + 1).toLowerCase();
    }

    private List<SymbolInfo> extractJavaSymbols(String content) {
        List<SymbolInfo> symbols = new ArrayList<>();
        ParseResult<CompilationUnit> result = javaParser.parse(content);

        java.util.Optional<CompilationUnit> cuOpt = result.getResult();
        if (result.isSuccessful() && cuOpt.isPresent()) {
            CompilationUnit cu = cuOpt.get();
            cu.accept(new VoidVisitorAdapter<List<SymbolInfo>>() {
                @Override
                public void visit(ClassOrInterfaceDeclaration n, List<SymbolInfo> arg) {
                    String category = (n.isInterface() || n.isAbstract()) ? CAT_ARCHITECTURE : CAT_CORE;
                    n.getNameAsString();
                    n.getRange().ifPresent(range -> 
                        arg.add(new SymbolInfo(n.getNameAsString(), TYPE_CLASS, range.begin.line, range.begin.column, category))
                    );
                    super.visit(n, arg);
                }

                @Override
                public void visit(MethodDeclaration n, List<SymbolInfo> arg) {
                    String name = n.getNameAsString();
                    final String category = (name.startsWith("get") || name.startsWith("set") || name.startsWith("is")) 
                        ? CAT_BOILERPLATE : CAT_CORE;

                    n.getRange().ifPresent(range -> 
                        arg.add(new SymbolInfo(name, TYPE_METHOD, range.begin.line, range.begin.column, category))
                    );
                    super.visit(n, arg);
                }

                @Override
                public void visit(ConstructorDeclaration n, List<SymbolInfo> arg) {
                    n.getRange().ifPresent(range -> 
                        arg.add(new SymbolInfo(n.getNameAsString(), TYPE_METHOD, range.begin.line, range.begin.column, CAT_BOILERPLATE))
                    );
                    super.visit(n, arg);
                }
            }, symbols);
            
            // Final sort by line and column to be extra sure
            symbols.sort((a, b) -> {
                if (a.line() != b.line()) return Integer.compare(a.line(), b.line());
                return Integer.compare(a.column(), b.column());
            });
        }
        return symbols;
    }

    /**
     * Search for symbols across all Java files in the project
     * @param rootPath The root directory to search
     * @param query The search query (case-insensitive)
     * @return List of matching symbols with file information
     */
    public List<SymbolSearchResult> searchSymbols(String rootPath, String query) throws IOException {
        List<SymbolSearchResult> results = new ArrayList<>();
        String lowerQuery = query.toLowerCase();
        
        // Walk the file tree and search Java files
        try (Stream<Path> paths = Files.walk(Path.of(rootPath))) {
            paths
                .filter(Files::isRegularFile)
                .filter(p -> p.toString().endsWith(".java"))
                .filter(p -> !p.toString().contains("node_modules"))
                .filter(p -> !p.toString().contains("target"))
                .filter(p -> !p.toString().contains(".git"))
                .forEach(path -> {
                    try {
                        List<SymbolInfo> symbols = getOutline(path.toString());
                        String fileName = path.getFileName().toString();
                        String filePath = path.toString();
                        
                        symbols.stream()
                            .filter(s -> s.name().toLowerCase().contains(lowerQuery))
                            .map(s -> SymbolSearchResult.fromSymbolInfo(s, filePath, fileName))
                            .forEach(results::add);
                    } catch (IOException e) {
                        // Log and skip files that can't be parsed
                        System.err.println("Warning: Could not parse file " + path + ": " + e.getMessage());
                    }
                });
        }
        
        // Sort results by relevance (exact matches first, then alphabetically)
        results.sort((a, b) -> {
            boolean aExact = a.name().equalsIgnoreCase(query);
            boolean bExact = b.name().equalsIgnoreCase(query);
            
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            
            return a.name().compareToIgnoreCase(b.name());
        });
        
        return results;
    }

    /**
     * Get detailed symbol definition at a specific location
     * @param filePath The file path
     * @param line The line number
     * @param column The column number
     * @return Symbol definition with signature, parameters, and documentation
     */
    public Optional<SymbolDefinition> getSymbolDefinition(String filePath, int line, int column) throws IOException {
        String content = Files.readString(Path.of(filePath));
        String extension = getExtension(filePath);

        if (!"java".equals(extension)) {
            return Optional.empty();
        }

        ParseResult<CompilationUnit> result = javaParser.parse(content);
        if (!result.isSuccessful() || result.getResult().isEmpty()) {
            return Optional.empty();
        }

        CompilationUnit cu = result.getResult().get();
        
        // Find method at the specified location
        Optional<MethodDeclaration> method = cu.findAll(MethodDeclaration.class).stream()
            .filter(m -> m.getRange().isPresent() && 
                        m.getRange().get().begin.line == line)
            .findFirst();

        if (method.isPresent()) {
            return Optional.of(buildMethodDefinition(method.get(), filePath));
        }

        // Find class at the specified location
        Optional<ClassOrInterfaceDeclaration> classDecl = cu.findAll(ClassOrInterfaceDeclaration.class).stream()
            .filter(c -> c.getRange().isPresent() && 
                        c.getRange().get().begin.line == line)
            .findFirst();

        if (classDecl.isPresent()) {
            return Optional.of(buildClassDefinition(classDecl.get(), filePath));
        }

        return Optional.empty();
    }

    private SymbolDefinition buildMethodDefinition(MethodDeclaration method, String filePath) {
        String signature = method.getDeclarationAsString(false, false, false);
        String returnType = method.getTypeAsString();
        
        List<SymbolDefinition.Parameter> parameters = method.getParameters().stream()
            .map(p -> new SymbolDefinition.Parameter(p.getNameAsString(), p.getTypeAsString()))
            .toList();

        String documentation = extractJavadoc(method);
        String codePreview = extractCodePreview(method, filePath);

        int line = method.getRange().map(r -> r.begin.line).orElse(0);

        return new SymbolDefinition(
            method.getNameAsString(),
            signature,
            "METHOD",
            returnType,
            parameters,
            documentation,
            filePath,
            line,
            codePreview
        );
    }

    private SymbolDefinition buildClassDefinition(ClassOrInterfaceDeclaration classDecl, String filePath) {
        String type = classDecl.isInterface() ? "INTERFACE" : "CLASS";
        
        // Build signature manually
        StringBuilder signature = new StringBuilder();
        if (classDecl.isPublic()) signature.append("public ");
        if (classDecl.isPrivate()) signature.append("private ");
        if (classDecl.isProtected()) signature.append("protected ");
        if (classDecl.isAbstract() && !classDecl.isInterface()) signature.append("abstract ");
        if (classDecl.isFinal()) signature.append("final ");
        
        signature.append(classDecl.isInterface() ? "interface " : "class ");
        signature.append(classDecl.getNameAsString());
        
        String documentation = extractJavadoc(classDecl);
        String codePreview = extractCodePreview(classDecl, filePath);

        int line = classDecl.getRange().map(r -> r.begin.line).orElse(0);

        return new SymbolDefinition(
            classDecl.getNameAsString(),
            signature.toString(),
            type,
            null,
            List.of(),
            documentation,
            filePath,
            line,
            codePreview
        );
    }

    /**
     * Extract code preview (first 10 lines of implementation) for FR.40
     * @param node The AST node (method or class)
     * @param filePath The file path
     * @return String containing up to 10 lines of code
     */
    private String extractCodePreview(Node node, String filePath) {
        try {
            if (!node.getRange().isPresent()) {
                return null;
            }
            
            String content = Files.readString(Path.of(filePath));
            String[] lines = content.split("\n");
            
            int startLine = node.getRange().get().begin.line - 1; // 0-based index
            int endLine = Math.min(startLine + 10, lines.length); // Max 10 lines
            
            StringBuilder preview = new StringBuilder();
            for (int i = startLine; i < endLine; i++) {
                preview.append(lines[i]);
                if (i < endLine - 1) {
                    preview.append("\n");
                }
            }
            
            String result = preview.toString();
            
            // If we're showing less than the full node, add an indicator
            if (node.getRange().isPresent() && 
                endLine < node.getRange().get().end.line) {
                result += "\n...";
            }
            
            return result;
        } catch (IOException e) {
            return null;
        }
    }

    private String extractJavadoc(Node node) {
        Optional<JavadocComment> javadoc = node.getComment()
            .filter(c -> c instanceof JavadocComment)
            .map(c -> (JavadocComment) c);

        if (javadoc.isPresent()) {
            String content = javadoc.get().getContent();
            // Basic cleanup: remove leading asterisks and extra whitespace
            return content.lines()
                .map(line -> line.trim().replaceFirst("^\\*\\s?", ""))
                .map(String::trim)
                .filter(line -> !line.isEmpty())
                .reduce((a, b) -> a + " " + b)
                .orElse("");
        }

        return null;
    }

    /**
     * Find all callers of a specific method
     * @param rootPath The root directory to search
     * @param targetMethodName The name of the target method
     * @param targetClassName Optional class name to narrow down the search
     * @return Caller statistics including all callers and call sites
     */
    public CallerStatistics findCallers(String rootPath, String targetMethodName, String targetClassName) throws IOException {
        List<CallerInfo> callers = new ArrayList<>();
        Map<String, Integer> callerCounts = new HashMap<>();
        
        // Walk the file tree and search Java files
        try (Stream<Path> paths = Files.walk(Path.of(rootPath))) {
            paths
                .filter(Files::isRegularFile)
                .filter(p -> p.toString().endsWith(".java"))
                .filter(p -> !p.toString().contains("node_modules"))
                .filter(p -> !p.toString().contains("target"))
                .filter(p -> !p.toString().contains(".git"))
                .forEach(path -> {
                    try {
                        String content = Files.readString(path);
                        ParseResult<CompilationUnit> result = javaParser.parse(content);
                        
                        if (result.isSuccessful() && result.getResult().isPresent()) {
                            CompilationUnit cu = result.getResult().get();
                            
                            // Find method calls in this file
                            cu.accept(new VoidVisitorAdapter<Void>() {
                                private String currentClassName = "";
                                private String currentMethodName = "";
                                private int currentMethodLine = 0;
                                
                                @Override
                                public void visit(ClassOrInterfaceDeclaration n, Void arg) {
                                    currentClassName = n.getNameAsString();
                                    super.visit(n, arg);
                                }
                                
                                @Override
                                public void visit(MethodDeclaration n, Void arg) {
                                    currentMethodName = n.getNameAsString();
                                    currentMethodLine = n.getRange().map(r -> r.begin.line).orElse(0);
                                    super.visit(n, arg);
                                }
                                
                                @Override
                                public void visit(MethodCallExpr n, Void arg) {
                                    String calledMethod = n.getNameAsString();
                                    
                                    // Check if this is the target method
                                    if (calledMethod.equals(targetMethodName)) {
                                        // If targetClassName is specified, we could do more sophisticated checking
                                        // For now, we'll match by method name only
                                        
                                        String callerKey = path.toString() + ":" + currentClassName + "." + currentMethodName;
                                        callerCounts.put(callerKey, callerCounts.getOrDefault(callerKey, 0) + 1);
                                    }
                                    
                                    super.visit(n, arg);
                                }
                            }, null);
                        }
                    } catch (IOException e) {
                        System.err.println("Warning: Could not parse file " + path + ": " + e.getMessage());
                    }
                });
        }
        
        // Convert map to CallerInfo list
        callerCounts.forEach((key, count) -> {
            String[] parts = key.split(":");
            String filePath = parts[0];
            String[] methodParts = parts[1].split("\\.");
            String className = methodParts.length > 1 ? methodParts[0] : "";
            String methodName = methodParts.length > 1 ? methodParts[1] : methodParts[0];
            
            // Get line number by re-parsing the file (could be optimized)
            try {
                String content = Files.readString(Path.of(filePath));
                ParseResult<CompilationUnit> result = javaParser.parse(content);
                if (result.isSuccessful() && result.getResult().isPresent()) {
                    CompilationUnit cu = result.getResult().get();
                    Optional<MethodDeclaration> method = cu.findAll(MethodDeclaration.class).stream()
                        .filter(m -> m.getNameAsString().equals(methodName))
                        .findFirst();
                    
                    int line = method.map(m -> m.getRange().map(r -> r.begin.line).orElse(0)).orElse(0);
                    callers.add(new CallerInfo(methodName, className, filePath, line, count));
                }
            } catch (IOException e) {
                // Skip if we can't re-parse
                callers.add(new CallerInfo(methodName, className, filePath, 0, count));
            }
        });
        
        int totalCallSites = callers.stream().mapToInt(CallerInfo::callCount).sum();
        
        return new CallerStatistics(
            targetMethodName,
            targetClassName != null ? targetClassName : "",
            callers.size(),
            totalCallSites,
            callers
        );
    }

    /**
     * Find test files that reference a specific class
     * @param rootPath The root directory to search
     * @param targetClassName The name of the class to find references for
     * @return List of test references
     */
    public List<TestReference> findTestReferences(String rootPath, String targetClassName) throws IOException {
        List<TestReference> references = new ArrayList<>();
        
        // Walk the file tree and search test files
        try (Stream<Path> paths = Files.walk(Path.of(rootPath))) {
            paths
                .filter(Files::isRegularFile)
                .filter(p -> p.toString().endsWith(".java"))
                .filter(p -> p.toString().contains("test") || p.toString().contains("Test"))
                .filter(p -> !p.toString().contains("node_modules"))
                .filter(p -> !p.toString().contains(".git"))
                .forEach(path -> {
                    try {
                        String content = Files.readString(path);
                        List<Integer> referenceLines = new ArrayList<>();
                        
                        // Simple text-based search for the class name
                        String[] lines = content.split("\n");
                        for (int i = 0; i < lines.length; i++) {
                            if (lines[i].contains(targetClassName)) {
                                referenceLines.add(i + 1); // 1-based line numbers
                            }
                        }
                        
                        if (!referenceLines.isEmpty()) {
                            // Extract test class name from file
                            ParseResult<CompilationUnit> result = javaParser.parse(content);
                            String testClassName = path.getFileName().toString().replace(".java", "");
                            
                            if (result.isSuccessful() && result.getResult().isPresent()) {
                                CompilationUnit cu = result.getResult().get();
                                Optional<ClassOrInterfaceDeclaration> classDecl = cu.findFirst(ClassOrInterfaceDeclaration.class);
                                if (classDecl.isPresent()) {
                                    testClassName = classDecl.get().getNameAsString();
                                }
                            }
                            
                            references.add(new TestReference(
                                testClassName,
                                path.toString(),
                                referenceLines.size(),
                                referenceLines
                            ));
                        }
                    } catch (IOException e) {
                        System.err.println("Warning: Could not parse file " + path + ": " + e.getMessage());
                    }
                });
        }
        
        return references;
    }

    /**
     * Detect potentially dead code (methods with zero internal callers)
     * FR.37: Dead Code Detection & Visualization
     * 
     * @param rootPath The root directory to analyze
     * @return List of potentially dead methods and classes
     */
    public List<DeadCodeInfo> detectDeadCode(String rootPath) throws IOException {
        List<DeadCodeInfo> deadCode = new ArrayList<>();
        
        // Step 1: Collect all methods in the project
        Map<String, MethodInfo> allMethods = new HashMap<>();
        
        try (Stream<Path> paths = Files.walk(Path.of(rootPath))) {
            paths
                .filter(Files::isRegularFile)
                .filter(p -> p.toString().endsWith(".java"))
                .filter(p -> !p.toString().contains("node_modules"))
                .filter(p -> !p.toString().contains("target"))
                .filter(p -> !p.toString().contains(".git"))
                .forEach(path -> {
                    try {
                        String content = Files.readString(path);
                        ParseResult<CompilationUnit> result = javaParser.parse(content);
                        
                        if (result.isSuccessful() && result.getResult().isPresent()) {
                            CompilationUnit cu = result.getResult().get();
                            boolean isTestFile = path.toString().contains("test") || path.toString().contains("Test");
                            
                            // Find all methods
                            cu.accept(new VoidVisitorAdapter<Void>() {
                                private String currentClassName = "";
                                
                                @Override
                                public void visit(ClassOrInterfaceDeclaration n, Void arg) {
                                    currentClassName = n.getNameAsString();
                                    super.visit(n, arg);
                                }
                                
                                @Override
                                public void visit(MethodDeclaration n, Void arg) {
                                    String methodName = n.getNameAsString();
                                    boolean isPublic = n.isPublic();
                                    int line = n.getRange().map(r -> r.begin.line).orElse(0);
                                    
                                    String key = currentClassName + "." + methodName;
                                    allMethods.put(key, new MethodInfo(
                                        methodName,
                                        currentClassName,
                                        path.toString(),
                                        line,
                                        isPublic,
                                        isTestFile
                                    ));
                                    
                                    super.visit(n, arg);
                                }
                            }, null);
                        }
                    } catch (IOException e) {
                        System.err.println("Warning: Could not parse file " + path + ": " + e.getMessage());
                    }
                });
        }
        
        // Step 2: Find all method calls in the project
        Map<String, Integer> callCounts = new HashMap<>();
        
        try (Stream<Path> paths = Files.walk(Path.of(rootPath))) {
            paths
                .filter(Files::isRegularFile)
                .filter(p -> p.toString().endsWith(".java"))
                .filter(p -> !p.toString().contains("node_modules"))
                .filter(p -> !p.toString().contains("target"))
                .filter(p -> !p.toString().contains(".git"))
                .forEach(path -> {
                    try {
                        String content = Files.readString(path);
                        ParseResult<CompilationUnit> result = javaParser.parse(content);
                        
                        if (result.isSuccessful() && result.getResult().isPresent()) {
                            CompilationUnit cu = result.getResult().get();
                            
                            // Find all method calls
                            cu.accept(new VoidVisitorAdapter<Void>() {
                                private String currentClassName = "";
                                
                                @Override
                                public void visit(ClassOrInterfaceDeclaration n, Void arg) {
                                    currentClassName = n.getNameAsString();
                                    super.visit(n, arg);
                                }
                                
                                @Override
                                public void visit(MethodCallExpr n, Void arg) {
                                    String methodName = n.getNameAsString();
                                    
                                    // Try to match with known methods
                                    // Simple heuristic: match by method name within the same class first
                                    String sameClassKey = currentClassName + "." + methodName;
                                    if (allMethods.containsKey(sameClassKey)) {
                                        callCounts.put(sameClassKey, callCounts.getOrDefault(sameClassKey, 0) + 1);
                                    } else {
                                        // Try to match by method name across all classes
                                        for (String key : allMethods.keySet()) {
                                            if (key.endsWith("." + methodName)) {
                                                callCounts.put(key, callCounts.getOrDefault(key, 0) + 1);
                                            }
                                        }
                                    }
                                    
                                    super.visit(n, arg);
                                }
                            }, null);
                        }
                    } catch (IOException e) {
                        System.err.println("Warning: Could not parse file " + path + ": " + e.getMessage());
                    }
                });
        }
        
        // Step 3: Identify methods with zero callers
        for (Map.Entry<String, MethodInfo> entry : allMethods.entrySet()) {
            String key = entry.getKey();
            MethodInfo method = entry.getValue();
            int callerCount = callCounts.getOrDefault(key, 0);
            
            // Mark as potentially dead if it has zero callers
            if (callerCount == 0) {
                String reason = method.isPublic ? "No internal callers (may be part of public API)" :
                               method.isTest ? "No internal callers (test method)" :
                               "No internal callers detected";
                
                deadCode.add(new DeadCodeInfo(
                    method.name,
                    "METHOD",
                    method.className,
                    method.filePath,
                    method.line,
                    callerCount,
                    method.isPublic,
                    method.isTest,
                    reason
                ));
            }
        }
        
        // Sort by file path and line number
        deadCode.sort((a, b) -> {
            int fileCompare = a.filePath().compareTo(b.filePath());
            return fileCompare != 0 ? fileCompare : Integer.compare(a.line(), b.line());
        });
        
        return deadCode;
    }
    
    /**
     * Helper class to store method information during dead code analysis
     */
    private static class MethodInfo {
        final String name;
        final String className;
        final String filePath;
        final int line;
        final boolean isPublic;
        final boolean isTest;
        
        MethodInfo(String name, String className, String filePath, int line, boolean isPublic, boolean isTest) {
            this.name = name;
            this.className = className;
            this.filePath = filePath;
            this.line = line;
            this.isPublic = isPublic;
            this.isTest = isTest;
        }
    }
}
