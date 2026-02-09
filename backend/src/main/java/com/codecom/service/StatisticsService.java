package com.codecom.service;

import com.codecom.dto.CodeStatistics;
import com.github.javaparser.JavaParser;
import com.github.javaparser.ParserConfiguration;
import com.github.javaparser.ParseResult;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.*;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;

@Service
public class StatisticsService {

    private final JavaParser javaParser;

    public StatisticsService() {
        ParserConfiguration config = new ParserConfiguration();
        config.setLanguageLevel(ParserConfiguration.LanguageLevel.JAVA_17_PREVIEW);
        this.javaParser = new JavaParser(config);
    }

    /**
     * Calculate statistics for a single file.
     */
    public CodeStatistics calculateFileStatistics(String path) throws IOException {
        String content = Files.readString(Path.of(path));
        String extension = getExtension(path);

        return switch (extension) {
            case "java" -> calculateJavaStatistics(content);
            default -> calculateGenericStatistics(content);
        };
    }

    /**
     * Calculate statistics for a directory (recursively).
     */
    public CodeStatistics calculateDirectoryStatistics(String directoryPath) throws IOException {
        Path dir = Path.of(directoryPath);
        
        int totalLines = 0;
        int codeLines = 0;
        int commentLines = 0;
        int blankLines = 0;
        int methodCount = 0;
        int classCount = 0;
        int interfaceCount = 0;
        int recordCount = 0;
        Set<String> packages = new HashSet<>();

        List<Path> files;
        try (Stream<Path> stream = Files.walk(dir)) {
            files = stream
                .filter(Files::isRegularFile)
                .filter(p -> isCodeFile(p.toString()))
                .toList();
        }

        for (Path file : files) {
            CodeStatistics fileStats = calculateFileStatistics(file.toString());
            totalLines += fileStats.totalLines();
            codeLines += fileStats.codeLines();
            commentLines += fileStats.commentLines();
            blankLines += fileStats.blankLines();
            methodCount += fileStats.methodCount();
            classCount += fileStats.classCount();
            interfaceCount += fileStats.interfaceCount();
            recordCount += fileStats.recordCount();
            
            if ("java".equals(getExtension(file.toString()))) {
                String pkg = extractPackageName(Files.readString(file));
                if (!pkg.isEmpty()) {
                    packages.add(pkg);
                }
            }
        }

        return new CodeStatistics(
            totalLines,
            codeLines,
            commentLines,
            blankLines,
            methodCount,
            classCount,
            interfaceCount,
            recordCount,
            packages.size()
        );
    }

    private CodeStatistics calculateJavaStatistics(String content) {
        ParseResult<CompilationUnit> result = javaParser.parse(content);
        java.util.Optional<CompilationUnit> cuOpt = result.getResult();
        
        if (!result.isSuccessful() || cuOpt.isEmpty()) {
            return calculateGenericStatistics(content);
        }

        CompilationUnit cu = cuOpt.get();
        
        // Count lines
        String[] lines = content.split("\n");
        int totalLines = lines.length;
        
        // Get all comment ranges
        Set<Integer> commentLineNumbers = new HashSet<>();
        cu.getAllComments().forEach(comment -> 
            comment.getRange().ifPresent(range -> {
                for (int i = range.begin.line; i <= range.end.line; i++) {
                    commentLineNumbers.add(i);
                }
            })
        );
        
        // Count blank and code lines
        int blankLines = 0;
        int codeLines = 0;
        for (int i = 0; i < lines.length; i++) {
            int lineNum = i + 1; // Lines are 1-indexed
            String line = lines[i].trim();
            
            if (line.isEmpty()) {
                blankLines++;
            } else if (!commentLineNumbers.contains(lineNum) && !line.startsWith("//") && !line.startsWith("/*") && !line.startsWith("*")) {
                codeLines++;
            }
        }
        
        int commentLines = commentLineNumbers.size();
        
        // Count structures using visitor
        StructureCounter counter = new StructureCounter();
        cu.accept(counter, null);
        
        return new CodeStatistics(
            totalLines,
            codeLines,
            commentLines,
            blankLines,
            counter.methodCount,
            counter.classCount,
            counter.interfaceCount,
            counter.recordCount,
            0  // Package count is calculated at directory level
        );
    }

    private CodeStatistics calculateGenericStatistics(String content) {
        String[] lines = content.split("\n");
        int totalLines = lines.length;
        int blankLines = 0;
        int codeLines = 0;
        
        for (String line : lines) {
            if (line.trim().isEmpty()) {
                blankLines++;
            } else {
                codeLines++;
            }
        }
        
        return new CodeStatistics(
            totalLines,
            codeLines,
            0,  // Can't accurately detect comments in generic files
            blankLines,
            0, 0, 0, 0, 0
        );
    }

    private String extractPackageName(String content) {
        ParseResult<CompilationUnit> result = javaParser.parse(content);
        return result.getResult()
            .flatMap(cu -> cu.getPackageDeclaration())
            .map(pd -> pd.getNameAsString())
            .orElse("");
    }

    private boolean isCodeFile(String path) {
        String ext = getExtension(path);
        Set<String> codeExtensions = Set.of(
            "java", "js", "ts", "jsx", "tsx", 
            "py", "rb", "go", "rs", "kt", "scala", 
            "cs", "cpp", "c", "h", "hpp"
        );
        return codeExtensions.contains(ext);
    }

    private String getExtension(String path) {
        int lastDot = path.lastIndexOf('.');
        return lastDot == -1 ? "" : path.substring(lastDot + 1).toLowerCase();
    }

    /**
     * Visitor to count Java structures (classes, interfaces, records, methods).
     */
    private static class StructureCounter extends VoidVisitorAdapter<Void> {
        int methodCount = 0;
        int classCount = 0;
        int interfaceCount = 0;
        int recordCount = 0;

        @Override
        public void visit(ClassOrInterfaceDeclaration n, Void arg) {
            if (n.isInterface()) {
                interfaceCount++;
            } else {
                classCount++;
            }
            super.visit(n, arg);
        }

        @Override
        public void visit(RecordDeclaration n, Void arg) {
            recordCount++;
            super.visit(n, arg);
        }

        @Override
        public void visit(MethodDeclaration n, Void arg) {
            methodCount++;
            super.visit(n, arg);
        }

        @Override
        public void visit(ConstructorDeclaration n, Void arg) {
            methodCount++;
            super.visit(n, arg);
        }
    }
}
