import { describe, it, expect } from 'vitest';
import { filterCode } from '../CodeFilterService';
import type { DetailControlOptions } from '../../components/DetailControlPanel.vue';

describe('CodeFilterService', () => {
  const defaultOptions: DetailControlOptions = {
    showComments: true,
    showImports: true,
    showPrivateMembers: true,
    showMethodBodies: true,
    showParameterTypes: true,
    showParameters: true,
    abbreviateTypes: false,
    onlyPublic: false,
  };

  describe('filterCode', () => {
    it('should return all lines when all options are enabled', () => {
      const code = `import java.util.*;
// Comment
public class Test {
  public void method() {
    System.out.println("test");
  }
}`;

      const result = filterCode(code, defaultOptions);
      
      expect(result).toHaveLength(7);
      expect(result.every(line => line.isVisible)).toBe(true);
    });

    it('should detect and filter comments when showComments is false', () => {
      const code = `public class Test {
  // This is a comment
  public void method() {}
}`;

      const options = { ...defaultOptions, showComments: false };
      const result = filterCode(code, options);
      
      const commentLine = result.find(line => line.isComment);
      expect(commentLine).toBeDefined();
      expect(commentLine?.isVisible).toBe(false);
    });

    it('should detect and filter imports when showImports is false', () => {
      const code = `import java.util.List;
import java.io.*;
public class Test {}`;

      const options = { ...defaultOptions, showImports: false };
      const result = filterCode(code, options);
      
      const importLines = result.filter(line => line.isImport);
      expect(importLines).toHaveLength(2);
      expect(importLines.every(line => !line.isVisible)).toBe(true);
    });

    it('should detect JavaScript imports', () => {
      const code = `import { useState } from 'react';
const test = require('lodash');
export default Component;`;

      const options = { ...defaultOptions, showImports: false };
      const result = filterCode(code, options, 'javascript');
      
      const importLines = result.filter(line => line.isImport);
      expect(importLines.length).toBeGreaterThan(0);
    });

    it('should detect block comments', () => {
      const code = `/* Block comment
   continues here
   and here */
public class Test {}`;

      const options = { ...defaultOptions, showComments: false };
      const result = filterCode(code, options);
      
      const commentLines = result.filter(line => line.isComment);
      expect(commentLines).toHaveLength(3);
      expect(commentLines.every(line => !line.isVisible)).toBe(true);
    });

    it('should detect JavaDoc comments', () => {
      const code = `/**
 * JavaDoc comment
 * @param x parameter
 */
public void method(int x) {}`;

      const options = { ...defaultOptions, showComments: false };
      const result = filterCode(code, options);
      
      const commentLines = result.filter(line => line.isComment);
      expect(commentLines.length).toBeGreaterThan(0);
    });

    it('should detect method signatures', () => {
      const code = `public class Test {
  public void testMethod() {}
  private String helper(int x) {}
}`;

      const result = filterCode(code, defaultOptions);
      
      const methodSigs = result.filter(line => line.isMethodSignature);
      expect(methodSigs.length).toBeGreaterThan(0);
    });

    it('should filter method bodies when showMethodBodies is false', () => {
      const code = `public void method() {
  System.out.println("body");
  int x = 5;
}`;

      const options = { ...defaultOptions, showMethodBodies: false };
      const result = filterCode(code, options);
      
      const bodyLines = result.filter(line => line.isMethodBody && line.content.trim() !== '');
      expect(bodyLines.some(line => !line.isVisible)).toBe(true);
    });

    it('should detect private members', () => {
      const code = `public class Test {
  private int field;
  private void privateMethod() {}
  public void publicMethod() {}
}`;

      const result = filterCode(code, defaultOptions);
      
      const privateLines = result.filter(line => line.isPrivate);
      expect(privateLines.length).toBeGreaterThan(0);
    });

    it('should filter private members when showPrivateMembers is false', () => {
      const code = `public class Test {
  private int field;
  public int publicField;
}`;

      const options = { ...defaultOptions, showPrivateMembers: false };
      const result = filterCode(code, options);
      
      const privateLine = result.find(line => line.isPrivate);
      expect(privateLine?.isVisible).toBe(false);
    });

    it('should filter private members when showPrivateMembers is false and onlyPublic is true', () => {
      const code = `public class Test {
  private void privateMethod() {}
  public void publicMethod() {}
  protected void protectedMethod() {}
}`;

      const options = { ...defaultOptions, showPrivateMembers: false, onlyPublic: true };
      const result = filterCode(code, options);
      
      const privateLine = result.find(line => line.isPrivate);
      if (privateLine) {
        expect(privateLine.isVisible).toBe(false);
      }
    });

    it('should handle package declarations as imports in Java', () => {
      const code = `package com.example;
import java.util.*;
public class Test {}`;

      const options = { ...defaultOptions, showImports: false };
      const result = filterCode(code, options, 'java');
      
      const packageLine = result[0];
      expect(packageLine.isImport).toBe(true);
      expect(packageLine.isVisible).toBe(false);
    });

    it('should handle single-line comments', () => {
      const code = `public class Test {
  // Single line comment
  public void method() {}
}`;

      const options = { ...defaultOptions, showComments: false };
      const result = filterCode(code, options);
      
      const commentLine = result.find(line => line.content.includes('//'));
      expect(commentLine?.isComment).toBe(true);
      expect(commentLine?.isVisible).toBe(false);
    });

    it('should support TypeScript syntax', () => {
      const code = `import { Component } from 'vue';
// TypeScript comment
export default function MyComponent() {}`;

      const result = filterCode(code, defaultOptions, 'typescript');
      
      expect(result.length).toBeGreaterThan(0);
      const importLine = result.find(line => line.isImport);
      expect(importLine).toBeDefined();
    });

    it('should maintain line numbers correctly', () => {
      const code = `line 1
line 2
line 3`;

      const result = filterCode(code, defaultOptions);
      
      expect(result[0].lineNumber).toBe(1);
      expect(result[1].lineNumber).toBe(2);
      expect(result[2].lineNumber).toBe(3);
    });

    it('should handle empty code', () => {
      const result = filterCode('', defaultOptions);
      
      expect(result).toHaveLength(1);
      expect(result[0].content).toBe('');
    });

    it('should handle code with only whitespace', () => {
      const code = `   
  
     `;

      const result = filterCode(code, defaultOptions);
      
      expect(result).toHaveLength(3);
    });
  });
});
