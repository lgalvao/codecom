package com.codecom.service;

import com.codecom.dto.ExportRequest;
import com.codecom.dto.ExportResult;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for exporting code with different detail levels
 * Implements FR.30-FR.31 (Multi-Format Export and Project-Wide Export)
 */
@Service
public class ExportService {

    /**
     * Export multiple files to a single document
     */
    public ExportResult exportFiles(ExportRequest request) throws IOException {
        List<String> fileContents = new ArrayList<>();
        int totalLines = 0;
        
        // Read all files
        for (String filePath : request.filePaths()) {
            try {
                String content = Files.readString(Path.of(filePath));
                fileContents.add(content);
                totalLines += content.split("\n").length;
            } catch (IOException e) {
                // Skip files that can't be read
                System.err.println("Error reading file: " + filePath + " - " + e.getMessage());
            }
        }
        
        // Generate export content based on format
        String content;
        String filename;
        String mimeType;
        
        if ("markdown".equals(request.format())) {
            content = exportToMarkdown(request, fileContents);
            filename = generateFilename(request, ".md");
            mimeType = "text/markdown";
        } else {
            content = exportToHTML(request, fileContents);
            filename = generateFilename(request, ".html");
            mimeType = "text/html";
        }
        
        return new ExportResult(
            content,
            filename,
            mimeType,
            fileContents.size(),
            totalLines
        );
    }
    
    /**
     * Export to Markdown format
     */
    private String exportToMarkdown(ExportRequest request, List<String> fileContents) {
        StringBuilder markdown = new StringBuilder();
        
        // Add title
        if (request.title() != null && !request.title().isEmpty()) {
            markdown.append("# ").append(request.title()).append("\n\n");
        }
        
        // Add metadata
        markdown.append("**Detail Level:** ").append(request.detailLevel()).append("\n");
        markdown.append("**Files:** ").append(fileContents.size()).append("\n\n");
        
        markdown.append("---\n\n");
        
        // Add each file
        for (int i = 0; i < request.filePaths().size(); i++) {
            String filePath = request.filePaths().get(i);
            if (i >= fileContents.size()) break;
            
            String content = fileContents.get(i);
            String filename = Path.of(filePath).getFileName().toString();
            String language = detectLanguage(filename);
            
            markdown.append("## ").append(filePath).append("\n\n");
            
            String processedContent = applyDetailLevel(content, request.detailLevel(), language);
            String[] lines = processedContent.split("\n");
            
            markdown.append("**Lines:** ").append(lines.length).append("\n\n");
            markdown.append("```").append(language).append("\n");
            
            if (request.includeLineNumbers()) {
                for (int lineNum = 0; lineNum < lines.length; lineNum++) {
                    markdown.append(String.format("%4d | %s\n", lineNum + 1, lines[lineNum]));
                }
            } else {
                markdown.append(processedContent);
                if (!processedContent.endsWith("\n")) {
                    markdown.append("\n");
                }
            }
            
            markdown.append("```\n\n");
        }
        
        return markdown.toString();
    }
    
    /**
     * Export to HTML format (for PDF printing)
     */
    private String exportToHTML(ExportRequest request, List<String> fileContents) {
        StringBuilder html = new StringBuilder();
        
        html.append("""
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <title>""").append(request.title() != null ? request.title() : "Code Export").append("""
            </title>
              <style>
                @page {
                  margin: 2cm;
                }
                body {
                  font-family: 'Courier New', monospace;
                  font-size: 10pt;
                  line-height: 1.4;
                  margin: 0;
                  padding: 20px;
                }
                h1 {
                  font-size: 18pt;
                  margin-bottom: 10px;
                  border-bottom: 2px solid #333;
                  padding-bottom: 5px;
                }
                h2 {
                  font-size: 14pt;
                  margin-top: 30px;
                  margin-bottom: 10px;
                  page-break-before: auto;
                }
                .metadata {
                  font-size: 9pt;
                  color: #666;
                  margin-bottom: 20px;
                }
                .file-metadata {
                  font-size: 8pt;
                  color: #666;
                  margin-bottom: 10px;
                }
                .code-container {
                  background: #f5f5f5;
                  border: 1px solid #ddd;
                  padding: 15px;
                  border-radius: 4px;
                  overflow-x: auto;
                  margin-bottom: 30px;
                  page-break-inside: avoid;
                }
                .code-line {
                  white-space: pre;
                  font-family: 'Fira Code', 'Courier New', monospace;
                  font-size: 9pt;
                }
                .line-number {
                  color: #999;
                  margin-right: 15px;
                  user-select: none;
                  min-width: 40px;
                  display: inline-block;
                  text-align: right;
                }
                .page-break {
                  page-break-after: always;
                }
              </style>
            </head>
            <body>
            """);
        
        if (request.title() != null && !request.title().isEmpty()) {
            html.append("  <h1>").append(escapeHtml(request.title())).append("</h1>\n");
        }
        
        html.append("  <div class=\"metadata\">\n");
        html.append("    <p><strong>Detail Level:</strong> ").append(request.detailLevel()).append("</p>\n");
        html.append("    <p><strong>Files:</strong> ").append(fileContents.size()).append("</p>\n");
        html.append("  </div>\n");
        
        // Add each file
        for (int i = 0; i < request.filePaths().size(); i++) {
            String filePath = request.filePaths().get(i);
            if (i >= fileContents.size()) break;
            
            String content = fileContents.get(i);
            String filename = Path.of(filePath).getFileName().toString();
            String language = detectLanguage(filename);
            
            html.append("  <h2>").append(escapeHtml(filePath)).append("</h2>\n");
            
            String processedContent = applyDetailLevel(content, request.detailLevel(), language);
            String[] lines = processedContent.split("\n");
            
            html.append("  <div class=\"file-metadata\">\n");
            html.append("    <strong>Lines:</strong> ").append(lines.length).append(" | ");
            html.append("    <strong>Language:</strong> ").append(language).append("\n");
            html.append("  </div>\n");
            
            html.append("  <div class=\"code-container\">\n");
            
            for (int lineNum = 0; lineNum < lines.length; lineNum++) {
                String line = escapeHtml(lines[lineNum]);
                if (request.includeLineNumbers()) {
                    html.append("    <div class=\"code-line\"><span class=\"line-number\">")
                        .append(lineNum + 1)
                        .append("</span>")
                        .append(line)
                        .append("</div>\n");
                } else {
                    html.append("    <div class=\"code-line\">")
                        .append(line)
                        .append("</div>\n");
                }
            }
            
            html.append("  </div>\n");
        }
        
        html.append("</body>\n</html>");
        
        return html.toString();
    }
    
    /**
     * Apply detail level filtering to code
     * This is a simplified version - the frontend has more sophisticated filtering
     */
    private String applyDetailLevel(String content, String detailLevel, String language) {
        switch (detailLevel) {
            case "medium":
                return removeComments(content, language);
            case "low":
                return extractSignatures(content, language);
            case "architectural":
                return extractPublicSignatures(content, language);
            default:
                return content;
        }
    }
    
    /**
     * Simple comment removal (basic implementation)
     */
    private String removeComments(String content, String language) {
        // For now, return content as-is
        // A more sophisticated implementation would use a proper parser
        return content;
    }
    
    /**
     * Extract method signatures (basic implementation)
     */
    private String extractSignatures(String content, String language) {
        // For now, return content as-is
        // This would require proper AST parsing to implement correctly
        return content;
    }
    
    /**
     * Extract public method signatures only (basic implementation)
     */
    private String extractPublicSignatures(String content, String language) {
        // For now, return content as-is
        // This would require proper AST parsing to implement correctly
        return content;
    }
    
    /**
     * Detect programming language from filename
     */
    private String detectLanguage(String filename) {
        String extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        return switch (extension) {
            case "java" -> "java";
            case "js" -> "javascript";
            case "ts" -> "typescript";
            case "py" -> "python";
            case "sql" -> "sql";
            case "xml" -> "xml";
            case "html" -> "html";
            case "css" -> "css";
            case "yaml", "yml" -> "yaml";
            case "json" -> "json";
            default -> "text";
        };
    }
    
    /**
     * Generate filename for export
     */
    private String generateFilename(ExportRequest request, String extension) {
        if (request.title() != null && !request.title().isEmpty()) {
            return sanitizeFilename(request.title()) + extension;
        }
        return "export-" + System.currentTimeMillis() + extension;
    }
    
    /**
     * Sanitize filename to remove invalid characters
     */
    private String sanitizeFilename(String filename) {
        return filename.replaceAll("[^a-zA-Z0-9-_]", "_");
    }
    
    /**
     * Escape HTML special characters
     */
    private String escapeHtml(String text) {
        return text
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#039;");
    }
}
