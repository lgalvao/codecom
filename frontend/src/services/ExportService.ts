/**
 * Service for exporting code with different detail levels
 * Implements FR.30-FR.31
 */

import type { DetailControlOptions } from '../components/DetailControlPanel.vue';
import { applyFilters } from './CodeFilterService';

export type ExportFormat = 'markdown' | 'pdf';
export type ExportScope = 'current' | 'package' | 'project';
export type DetailLevel = 'full' | 'medium' | 'low' | 'architectural';

export interface ExportOptions {
  format: ExportFormat;
  scope: ExportScope;
  detailLevel: DetailLevel;
  includeLineNumbers?: boolean;
  includeSyntaxHighlighting?: boolean;
  title?: string;
}

/**
 * Convert detail level to DetailControlOptions
 */
function getDetailOptionsForLevel(level: DetailLevel): DetailControlOptions {
  switch (level) {
    case 'full':
      return {
        showComments: true,
        showImports: true,
        showPrivateMembers: true,
        showMethodBodies: true,
        showParameterTypes: true,
        showParameters: true,
        abbreviateTypes: false,
        onlyPublic: false,
      };
    case 'medium':
      return {
        showComments: false,
        showImports: true,
        showPrivateMembers: true,
        showMethodBodies: true,
        showParameterTypes: true,
        showParameters: true,
        abbreviateTypes: false,
        onlyPublic: false,
      };
    case 'low':
      return {
        showComments: false,
        showImports: false,
        showPrivateMembers: true,
        showMethodBodies: false,
        showParameterTypes: true,
        showParameters: true,
        abbreviateTypes: false,
        onlyPublic: false,
      };
    case 'architectural':
      return {
        showComments: false,
        showImports: false,
        showPrivateMembers: false,
        showMethodBodies: false,
        showParameterTypes: false,
        showParameters: false,
        abbreviateTypes: false,
        onlyPublic: true,
      };
  }
}

/**
 * Export code to Markdown format
 */
export function exportToMarkdown(
  code: string,
  filename: string,
  language: string,
  options: ExportOptions
): string {
  const detailOptions = getDetailOptionsForLevel(options.detailLevel);
  const { hiddenLines } = applyFilters(code, detailOptions, language);
  
  // Split code into lines
  const lines = code.split('\n');
  const visibleLines = lines
    .map((line, index) => ({ line, number: index + 1 }))
    .filter(({ number }) => !hiddenLines.has(number));
  
  let markdown = '';
  
  // Add title
  if (options.title) {
    markdown += `# ${options.title}\n\n`;
  }
  
  // Add file header
  markdown += `## ${filename}\n\n`;
  
  // Add metadata
  markdown += `**Detail Level:** ${options.detailLevel}\n`;
  markdown += `**Lines:** ${visibleLines.length} / ${lines.length}\n\n`;
  
  // Add code block
  markdown += `\`\`\`${language}\n`;
  
  if (options.includeLineNumbers) {
    visibleLines.forEach(({ line, number }) => {
      markdown += `${number.toString().padStart(4, ' ')} | ${line}\n`;
    });
  } else {
    visibleLines.forEach(({ line }) => {
      markdown += `${line}\n`;
    });
  }
  
  markdown += '```\n\n';
  
  return markdown;
}

/**
 * Export code to PDF format (generates HTML that can be printed to PDF)
 */
export function exportToPDF(
  code: string,
  filename: string,
  language: string,
  options: ExportOptions
): string {
  const detailOptions = getDetailOptionsForLevel(options.detailLevel);
  const { hiddenLines } = applyFilters(code, detailOptions, language);
  
  // Split code into lines
  const lines = code.split('\n');
  const visibleLines = lines
    .map((line, index) => ({ line, number: index + 1 }))
    .filter(({ number }) => !hiddenLines.has(number));
  
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${options.title || filename}</title>
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
      margin-top: 20px;
      margin-bottom: 10px;
    }
    .metadata {
      font-size: 9pt;
      color: #666;
      margin-bottom: 20px;
    }
    .code-container {
      background: #f5f5f5;
      border: 1px solid #ddd;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
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
  </style>
</head>
<body>
`;
  
  if (options.title) {
    html += `  <h1>${options.title}</h1>\n`;
  }
  
  html += `  <h2>${filename}</h2>\n`;
  html += `  <div class="metadata">
    <p><strong>Detail Level:</strong> ${options.detailLevel}</p>
    <p><strong>Lines:</strong> ${visibleLines.length} / ${lines.length}</p>
    <p><strong>Language:</strong> ${language}</p>
  </div>\n`;
  
  html += `  <div class="code-container">\n`;
  
  visibleLines.forEach(({ line, number }) => {
    const escapedLine = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    
    if (options.includeLineNumbers) {
      html += `    <div class="code-line"><span class="line-number">${number}</span>${escapedLine}</div>\n`;
    } else {
      html += `    <div class="code-line">${escapedLine}</div>\n`;
    }
  });
  
  html += `  </div>\n`;
  html += `</body>\n</html>`;
  
  return html;
}

/**
 * Trigger download of exported content
 */
export function downloadExport(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export current file
 */
export function exportFile(
  code: string,
  filename: string,
  language: string,
  options: ExportOptions
) {
  let content: string;
  let exportFilename: string;
  let mimeType: string;
  
  if (options.format === 'markdown') {
    content = exportToMarkdown(code, filename, language, options);
    exportFilename = filename.replace(/\.[^.]+$/, '.md');
    mimeType = 'text/markdown';
  } else {
    content = exportToPDF(code, filename, language, options);
    exportFilename = filename.replace(/\.[^.]+$/, '.html');
    mimeType = 'text/html';
  }
  
  downloadExport(content, exportFilename, mimeType);
}

/**
 * Export multiple files using backend API
 */
export async function exportFiles(
  filePaths: string[],
  options: ExportOptions
): Promise<void> {
  try {
    const response = await fetch('http://localhost:8080/api/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filePaths,
        format: options.format,
        detailLevel: options.detailLevel,
        includeLineNumbers: options.includeLineNumbers ?? true,
        title: options.title,
      }),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    // Get metadata from headers
    const totalFiles = response.headers.get('X-Total-Files');
    const totalLines = response.headers.get('X-Total-Lines');

    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'export';
    if (contentDisposition) {
      const matches = /filename="(.+)"/.exec(contentDisposition);
      if (matches && matches[1]) {
        filename = matches[1];
      }
    }

    // Get the content
    const content = await response.text();
    const mimeType = response.headers.get('Content-Type') || 'text/plain';

    // Trigger download
    downloadExport(content, filename, mimeType);

    console.log(`Exported ${totalFiles} files with ${totalLines} lines`);
  } catch (error) {
    console.error('Error exporting files:', error);
    throw error;
  }
}
