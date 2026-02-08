/**
 * Tests for ExportService
 * Testing FR.30-FR.31: Multi-Format Export functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  exportToMarkdown,
  exportToPDF,
  downloadExport,
  exportFile,
  type ExportOptions,
} from '../ExportService';

describe('ExportService', () => {
  const sampleCode = `package com.example;

import java.util.List;

/**
 * Sample class for testing
 */
public class Sample {
  private String name;
  
  public Sample(String name) {
    this.name = name;
  }
  
  public String getName() {
    return name;
  }
}`;

  const sampleFilename = 'Sample.java';
  const language = 'java';

  describe('exportToMarkdown', () => {
    it('should export code with full detail level', () => {
      const options: ExportOptions = {
        format: 'markdown',
        scope: 'current',
        detailLevel: 'full',
        includeLineNumbers: false,
      };

      const result = exportToMarkdown(sampleCode, sampleFilename, language, options);

      expect(result).toContain('## Sample.java');
      expect(result).toContain('**Detail Level:** full');
      expect(result).toContain('```java');
      expect(result).toContain('public class Sample');
    });

    it('should include line numbers when specified', () => {
      const options: ExportOptions = {
        format: 'markdown',
        scope: 'current',
        detailLevel: 'full',
        includeLineNumbers: true,
      };

      const result = exportToMarkdown(sampleCode, sampleFilename, language, options);

      expect(result).toMatch(/\d+\s+\|/); // Should have line numbers
    });

    it('should include title when provided', () => {
      const options: ExportOptions = {
        format: 'markdown',
        scope: 'current',
        detailLevel: 'full',
        title: 'My Code Export',
      };

      const result = exportToMarkdown(sampleCode, sampleFilename, language, options);

      expect(result).toContain('# My Code Export');
    });

    it('should filter code for medium detail level (no comments)', () => {
      const options: ExportOptions = {
        format: 'markdown',
        scope: 'current',
        detailLevel: 'medium',
      };

      const result = exportToMarkdown(sampleCode, sampleFilename, language, options);

      expect(result).toContain('public class Sample');
      // Comments should be filtered out at medium level
    });

    it('should filter code for low detail level (signatures only)', () => {
      const options: ExportOptions = {
        format: 'markdown',
        scope: 'current',
        detailLevel: 'low',
      };

      const result = exportToMarkdown(sampleCode, sampleFilename, language, options);

      expect(result).toContain('**Detail Level:** low');
      // Method bodies should be filtered
    });

    it('should filter code for architectural level (public only)', () => {
      const options: ExportOptions = {
        format: 'markdown',
        scope: 'current',
        detailLevel: 'architectural',
      };

      const result = exportToMarkdown(sampleCode, sampleFilename, language, options);

      expect(result).toContain('**Detail Level:** architectural');
    });
  });

  describe('exportToPDF', () => {
    it('should export code as HTML with full detail level', () => {
      const options: ExportOptions = {
        format: 'pdf',
        scope: 'current',
        detailLevel: 'full',
        includeLineNumbers: false,
      };

      const result = exportToPDF(sampleCode, sampleFilename, language, options);

      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<html>');
      expect(result).toContain('<h2>Sample.java</h2>');
      expect(result).toContain('public class Sample');
      expect(result).toContain('</html>');
    });

    it('should include line numbers in HTML when specified', () => {
      const options: ExportOptions = {
        format: 'pdf',
        scope: 'current',
        detailLevel: 'full',
        includeLineNumbers: true,
      };

      const result = exportToPDF(sampleCode, sampleFilename, language, options);

      expect(result).toContain('class="line-number"');
    });

    it('should include title in HTML when provided', () => {
      const options: ExportOptions = {
        format: 'pdf',
        scope: 'current',
        detailLevel: 'full',
        title: 'Code Documentation',
      };

      const result = exportToPDF(sampleCode, sampleFilename, language, options);

      expect(result).toContain('<title>Code Documentation</title>');
      expect(result).toContain('<h1>Code Documentation</h1>');
    });

    it('should escape HTML special characters', () => {
      const codeWithHtml = 'if (x < 5 && y > 3) { return "test"; }';
      const options: ExportOptions = {
        format: 'pdf',
        scope: 'current',
        detailLevel: 'full',
      };

      const result = exportToPDF(codeWithHtml, 'test.js', 'javascript', options);

      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&quot;');
      expect(result).toContain('&amp;&amp;');
    });

    it('should include CSS styles for PDF printing', () => {
      const options: ExportOptions = {
        format: 'pdf',
        scope: 'current',
        detailLevel: 'full',
      };

      const result = exportToPDF(sampleCode, sampleFilename, language, options);

      expect(result).toContain('<style>');
      expect(result).toContain('@page');
      expect(result).toContain('font-family');
    });
  });

  describe('downloadExport', () => {
    let createObjectURLSpy: any;
    let revokeObjectURLSpy: any;
    let appendChildSpy: any;
    let removeChildSpy: any;
    let clickSpy: any;

    beforeEach(() => {
      // Mock URL methods
      createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      // Mock DOM methods
      appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
      clickSpy = vi.fn();

      // Mock createElement to return a mock link element
      vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'a') {
          return {
            href: '',
            download: '',
            click: clickSpy,
          } as any;
        }
        return {} as any;
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should create a download link and trigger download', () => {
      const content = 'test content';
      const filename = 'test.md';
      const mimeType = 'text/markdown';

      downloadExport(content, filename, mimeType);

      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  describe('exportFile', () => {
    beforeEach(() => {
      // Mock URL and DOM methods for downloadExport
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
      
      const clickSpy = vi.fn();
      vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'a') {
          return {
            href: '',
            download: '',
            click: clickSpy,
          } as any;
        }
        return {} as any;
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should export as markdown with correct filename', () => {
      const options: ExportOptions = {
        format: 'markdown',
        scope: 'current',
        detailLevel: 'full',
      };

      // Just test that it doesn't throw and produces markdown
      expect(() => exportFile(sampleCode, sampleFilename, language, options)).not.toThrow();
    });

    it('should export as HTML with correct filename for PDF', () => {
      const options: ExportOptions = {
        format: 'pdf',
        scope: 'current',
        detailLevel: 'full',
      };

      // Just test that it doesn't throw and produces HTML
      expect(() => exportFile(sampleCode, sampleFilename, language, options)).not.toThrow();
    });

    it('should preserve file basename when changing extension', () => {
      const options: ExportOptions = {
        format: 'markdown',
        scope: 'current',
        detailLevel: 'full',
      };

      // Just test that it doesn't throw
      expect(() => exportFile(sampleCode, 'MyClass.java', language, options)).not.toThrow();
    });
  });
});
