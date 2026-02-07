package com.codecom.service;

import com.codecom.dto.SymbolInfo;
import com.github.javaparser.JavaParser;
import com.github.javaparser.ParseResult;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.ConstructorDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

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
}
