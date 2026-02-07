package com.codecom.service;

import com.codecom.dto.SymbolInfo;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AnalysisService {

    private static final String TYPE_CLASS = "CLASS";
    private static final String TYPE_FUNCTION = "FUNCTION";
    private static final String TYPE_METHOD = "METHOD";

    public List<SymbolInfo> getOutline(String path) throws IOException {
        String content = Files.readString(Path.of(path));
        String extension = getExtension(path);

        return switch (extension) {
            case "java" -> extractJavaSymbols(content);
            case "js", "ts", "vue" -> extractJsSymbols(content);
            default -> new ArrayList<>();
        };
    }

    private String getExtension(String path) {
        int lastDot = path.lastIndexOf('.');
        return lastDot == -1 ? "" : path.substring(lastDot + 1).toLowerCase();
    }

    private List<SymbolInfo> extractJavaSymbols(String content) {
        List<SymbolInfo> symbols = new ArrayList<>();
        String[] lines = content.split("\n");

        // Simple regex for classes and methods
        Pattern classPattern = Pattern.compile("(?:public|protected|private|static|\\s) +class +(\\w+)");
        Pattern methodPattern = Pattern.compile("(?:public|protected|private|static|\\s) +[\\w<>\\[\\]]+ +(\\w+) *\\(");

        for (int i = 0; i < lines.length; i++) {
            String line = lines[i];
            
            Matcher classMatcher = classPattern.matcher(line);
            if (classMatcher.find()) {
                symbols.add(new SymbolInfo(classMatcher.group(1), TYPE_CLASS, i + 1, classMatcher.start(1)));
                continue;
            }

            Matcher methodMatcher = methodPattern.matcher(line);
            if (methodMatcher.find()) {
                String name = methodMatcher.group(1);
                if (!name.equals("if") && !name.equals("for") && !name.equals("while") && !name.equals("switch")) {
                    symbols.add(new SymbolInfo(name, TYPE_METHOD, i + 1, methodMatcher.start(1)));
                }
            }
        }
        return symbols;
    }

    private List<SymbolInfo> extractJsSymbols(String content) {
        List<SymbolInfo> symbols = new ArrayList<>();
        String[] lines = content.split("\n");

        // Simpler patterns to reduce regex engine depth
        Pattern funcPattern1 = Pattern.compile("(?:function|const|let|var) +(\\w+) *= *(?:async *)?function");
        Pattern funcPattern2 = Pattern.compile("function +(\\w+) *\\(");
        Pattern funcPattern3 = Pattern.compile("(?:const|let|var) +(\\w+) *= *(?:async *)?\\(.*?\\) *=>");
        Pattern classPattern = Pattern.compile("class +(\\w+)");

        for (int i = 0; i < lines.length; i++) {
            String line = lines[i];
            
            checkMatch(line, classPattern, symbols, TYPE_CLASS, i + 1);
            checkMatch(line, funcPattern1, symbols, TYPE_FUNCTION, i + 1);
            checkMatch(line, funcPattern2, symbols, TYPE_FUNCTION, i + 1);
            checkMatch(line, funcPattern3, symbols, TYPE_FUNCTION, i + 1);
        }
        return symbols;
    }

    private void checkMatch(String line, Pattern p, List<SymbolInfo> symbols, String type, int lineNum) {
        Matcher m = p.matcher(line);
        if (m.find()) {
            symbols.add(new SymbolInfo(m.group(1), type, lineNum, m.start(1)));
        }
    }
}
