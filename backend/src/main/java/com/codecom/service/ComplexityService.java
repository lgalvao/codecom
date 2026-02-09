package com.codecom.service;

import com.codecom.dto.FileComplexity;
import com.github.javaparser.JavaParser;
import com.github.javaparser.ParseResult;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.expr.ConditionalExpr;
import com.github.javaparser.ast.stmt.*;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

/**
 * Service for calculating code complexity metrics
 * FR.32: Complexity Heatmap
 */
@Service
public class ComplexityService {
    
    private static final Logger logger = LoggerFactory.getLogger(ComplexityService.class);
    private final JavaParser javaParser = new JavaParser();
    
    /**
     * Calculate complexity for all files in a directory
     */
    public List<FileComplexity> calculateProjectComplexity(String rootPath) throws IOException {
        List<FileComplexity> complexities = new ArrayList<>();
        
        try (Stream<Path> paths = Files.walk(Path.of(rootPath))) {
            paths
                .filter(Files::isRegularFile)
                .filter(p -> p.toString().endsWith(".java"))
                .filter(p -> !p.toString().contains("node_modules"))
                .filter(p -> !p.toString().contains("target"))
                .filter(p -> !p.toString().contains(".git"))
                .forEach(path -> {
                    try {
                        FileComplexity complexity = calculateFileComplexity(path.toString());
                        if (complexity != null) {
                            complexities.add(complexity);
                        }
                    } catch (IOException e) {
                        logger.error("Error calculating complexity for {}: {}", path, e.getMessage());
                    }
                });
        }
        
        return complexities;
    }
    
    /**
     * Calculate complexity for a single file
     */
    public FileComplexity calculateFileComplexity(String filePath) throws IOException {
        String content = Files.readString(Path.of(filePath));
        ParseResult<CompilationUnit> result = javaParser.parse(content);
        
        if (!result.isSuccessful()) {
            return null;
        }
        
        return result.getResult().map(cu -> {
            // Calculate metrics
            int cyclomaticComplexity = calculateCyclomaticComplexity(cu);
            int linesOfCode = countLinesOfCode(content);
            int numberOfMethods = countMethods(cu);
            
            return new FileComplexity(filePath, cyclomaticComplexity, linesOfCode, numberOfMethods);
        }).orElse(null);
    }
    
    /**
     * Calculate cyclomatic complexity for a compilation unit
     * CC = E - N + 2P where:
     * E = number of edges in control flow graph
     * N = number of nodes
     * P = number of connected components (methods)
     * 
     * Simplified: count decision points + 1 per method
     */
    private int calculateCyclomaticComplexity(CompilationUnit cu) {
        ComplexityVisitor visitor = new ComplexityVisitor();
        cu.accept(visitor, null);
        return visitor.getComplexity();
    }
    
    /**
     * Count non-blank, non-comment lines of code
     */
    private int countLinesOfCode(String content) {
        String[] lines = content.split("\n");
        int count = 0;
        boolean inBlockComment = false;
        
        for (String line : lines) {
            String trimmed = line.trim();
            
            if (!trimmed.isEmpty()) {
                if (trimmed.startsWith("/*")) {
                    inBlockComment = true;
                }
                
                if (inBlockComment) {
                    if (trimmed.endsWith("*/") || trimmed.contains("*/")) {
                        inBlockComment = false;
                    }
                } else if (!trimmed.startsWith("//")) {
                    count++;
                }
            }
        }
        
        return count;
    }
    
    /**
     * Count methods in a compilation unit
     */
    private int countMethods(CompilationUnit cu) {
        MethodCountVisitor visitor = new MethodCountVisitor();
        cu.accept(visitor, null);
        return visitor.getMethodCount();
    }
    
    /**
     * Visitor to calculate cyclomatic complexity
     */
    private static class ComplexityVisitor extends VoidVisitorAdapter<Void> {
        private int complexity = 0;
        
        @Override
        public void visit(MethodDeclaration n, Void arg) {
            // Start with 1 for each method
            complexity += 1;
            super.visit(n, arg);
        }
        
        @Override
        public void visit(IfStmt n, Void arg) {
            complexity += 1; // Each if adds complexity
            super.visit(n, arg);
        }
        
        @Override
        public void visit(ForStmt n, Void arg) {
            complexity += 1;
            super.visit(n, arg);
        }
        
        @Override
        public void visit(ForEachStmt n, Void arg) {
            complexity += 1;
            super.visit(n, arg);
        }
        
        @Override
        public void visit(WhileStmt n, Void arg) {
            complexity += 1;
            super.visit(n, arg);
        }
        
        @Override
        public void visit(DoStmt n, Void arg) {
            complexity += 1;
            super.visit(n, arg);
        }
        
        @Override
        public void visit(SwitchEntry n, Void arg) {
            if (!n.getLabels().isEmpty()) {
                complexity += 1; // Each case adds complexity
            }
            super.visit(n, arg);
        }
        
        @Override
        public void visit(CatchClause n, Void arg) {
            complexity += 1;
            super.visit(n, arg);
        }
        
        @Override
        public void visit(ConditionalExpr n, Void arg) {
            complexity += 1; // Ternary operator
            super.visit(n, arg);
        }
        
        public int getComplexity() {
            return complexity;
        }
    }
    
    /**
     * Visitor to count methods
     */
    private static class MethodCountVisitor extends VoidVisitorAdapter<Void> {
        private int methodCount = 0;
        
        @Override
        public void visit(MethodDeclaration n, Void arg) {
            methodCount++;
            super.visit(n, arg);
        }
        
        public int getMethodCount() {
            return methodCount;
        }
    }
}
