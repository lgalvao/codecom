package com.codecom.dto;

public record SymbolSearchResult(
    String name,
    String type,
    int line,
    int column,
    String category,
    String filePath,
    String fileName
) {
    public static SymbolSearchResult fromSymbolInfo(SymbolInfo symbolInfo, String filePath, String fileName) {
        return new SymbolSearchResult(
            symbolInfo.name(),
            symbolInfo.type(),
            symbolInfo.line(),
            symbolInfo.column(),
            symbolInfo.category(),
            filePath,
            fileName
        );
    }
}
