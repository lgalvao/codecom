/**
 * Service for filtering code based on detail control options
 * Implements FR.16-FR.22 requirements
 */

import type { DetailControlOptions } from '../components/DetailControlPanel.vue';

export interface FilteredLine {
  lineNumber: number;
  content: string;
  isVisible: boolean;
  isComment: boolean;
  isImport: boolean;
  isMethodSignature: boolean;
  isMethodBody: boolean;
  isPrivate: boolean;
}

/**
 * Filter code lines based on detail control options
 */
export function filterCode(code: string, options: DetailControlOptions, language: string = 'java'): FilteredLine[] {
  const lines = code.split('\n');
  const filteredLines: FilteredLine[] = [];
  
  let inBlockComment = false;
  let inMethod = false;
  let methodBraceCount = 0;
  let currentLineIsMethodSignature = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const lineNumber = i + 1;
    
    // Detect comments
    let isComment = false;
    if (language === 'java' || language === 'javascript' || language === 'typescript') {
      // Block comment detection
      if (trimmed.startsWith('/*')) {
        inBlockComment = true;
      }
      if (inBlockComment) {
        isComment = true;
      }
      if (trimmed.endsWith('*/')) {
        inBlockComment = false;
      }
      // Single line comment
      if (trimmed.startsWith('//')) {
        isComment = true;
      }
      // JavaDoc/JSDoc
      if (trimmed.startsWith('/**') || trimmed.startsWith('*')) {
        isComment = true;
      }
    }
    
    // Detect imports
    const isImport = 
      trimmed.startsWith('import ') || 
      trimmed.startsWith('require(') ||
      trimmed.startsWith('from ') ||
      (language === 'java' && trimmed.startsWith('package '));
    
    // Detect method signatures and bodies (simplified detection)
    const isMethodSignature = 
      !isComment && 
      !isImport && 
      (trimmed.includes('function ') || 
       /\w+\s*\([^)]*\)\s*[{:]/.test(trimmed) ||
       /(public|private|protected|static)\s+\w+\s+\w+\s*\(/.test(trimmed));
    
    if (isMethodSignature) {
      currentLineIsMethodSignature = true;
      inMethod = true;
      methodBraceCount = 0;
    }
    
    // Track method body braces
    const isMethodBody = inMethod && !currentLineIsMethodSignature;
    if (inMethod) {
      methodBraceCount += (line.match(/\{/g) || []).length;
      methodBraceCount -= (line.match(/\}/g) || []).length;
      if (methodBraceCount <= 0 && trimmed.includes('}')) {
        inMethod = false;
      }
    }
    
    currentLineIsMethodSignature = false;
    
    // Detect private members (simplified)
    const isPrivate = trimmed.includes('private ') || trimmed.startsWith('_');
    
    // Determine visibility based on options
    let isVisible = true;
    
    // Apply filters
    if (!options.showComments && isComment) {
      isVisible = false;
    }
    
    if (!options.showImports && isImport) {
      isVisible = false;
    }
    
    if (!options.showMethodBodies && isMethodBody) {
      isVisible = false;
    }
    
    if (!options.showPrivateMembers && isPrivate) {
      isVisible = false;
    }
    
    filteredLines.push({
      lineNumber,
      content: line,
      isVisible,
      isComment,
      isImport,
      isMethodSignature,
      isMethodBody,
      isPrivate,
    });
  }
  
  return filteredLines;
}

/**
 * Apply parameter filtering to code
 * Implements FR.18-FR.20
 */
export function filterParameters(code: string, options: DetailControlOptions): string {
  if (options.showParameters && options.showParameterTypes && !options.abbreviateTypes) {
    return code; // No parameter filtering needed
  }
  
  let result = code;
  
  // Match method signatures with parameters
  const methodPattern = /(\w+\s*\([^)]*\))/g;
  
  result = result.replace(methodPattern, (match) => {
    if (!options.showParameters) {
      // Remove all parameters, keep just ()
      return match.replace(/\([^)]*\)/, '()');
    }
    
    if (!options.showParameterTypes) {
      // Keep parameter names only
      return match.replace(/(\w+\s+)?(\w+)(?=\s*[,)])/g, '$2');
    }
    
    if (options.abbreviateTypes) {
      // Abbreviate type names (e.g., java.lang.String -> String)
      return match.replace(/([a-z0-9]+\.)+([A-Z]\w*)/g, '$2');
    }
    
    return match;
  });
  
  return result;
}

/**
 * Get hidden line numbers based on filter options
 */
export function getHiddenLines(filteredLines: FilteredLine[]): Set<number> {
  const hiddenLines = new Set<number>();
  
  filteredLines.forEach(line => {
    if (!line.isVisible) {
      hiddenLines.add(line.lineNumber);
    }
  });
  
  return hiddenLines;
}

/**
 * Apply all filters to code and return filtered content
 */
export function applyFilters(code: string, options: DetailControlOptions, language: string = 'java'): {
  filteredCode: string;
  hiddenLines: Set<number>;
  visibleLineCount: number;
} {
  // First, apply parameter filtering
  let processedCode = filterParameters(code, options);
  
  // Then apply line-based filtering
  const filteredLines = filterCode(processedCode, options, language);
  const hiddenLines = getHiddenLines(filteredLines);
  
  // Generate filtered code (for display purposes)
  const visibleLines = filteredLines.filter(l => l.isVisible);
  const filteredCode = visibleLines.map(l => l.content).join('\n');
  
  return {
    filteredCode: processedCode, // Return full code with parameter filtering
    hiddenLines,
    visibleLineCount: visibleLines.length,
  };
}
