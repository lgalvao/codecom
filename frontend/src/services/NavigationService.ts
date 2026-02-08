/**
 * Service for advanced navigation features
 * Implements FR.23-FR.29
 */

import axios from 'axios';
import { API_CONFIG } from '../config/api';

export interface FileInfo {
  name: string;
  path: string;
  directory?: string;
}

/**
 * Get files in the same package/directory
 */
export async function getPackageFiles(currentFilePath: string): Promise<FileInfo[]> {
  try {
    const directory = currentFilePath.substring(0, currentFilePath.lastIndexOf('/'));
    const response = await axios.get('http://localhost:8080/api/files/tree', {
      params: { path: directory }
    });
    
    // Extract files from the tree response
    const files: FileInfo[] = [];
    const extractFiles = (node: any) => {
      if (node.type === 'FILE') {
        files.push({
          name: node.name,
          path: node.path,
          directory: directory
        });
      }
      if (node.children) {
        node.children.forEach(extractFiles);
      }
    };
    extractFiles(response.data);
    
    return files.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching package files:', error);
    return [];
  }
}

/**
 * Navigate to next file in the same package
 */
export async function navigateToNextFile(currentFilePath: string): Promise<FileInfo | null> {
  try {
    const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FILES.NAVIGATE_NEXT}`, {
      params: { path: currentFilePath }
    });
    
    if (response.data) {
      const path = response.data;
      const name = path.substring(path.lastIndexOf('/') + 1);
      return { name, path };
    }
    
    return null;
  } catch (error) {
    console.error('Error navigating to next file:', error);
    return null;
  }
}

/**
 * Navigate to previous file in the same package
 */
export async function navigateToPreviousFile(currentFilePath: string): Promise<FileInfo | null> {
  try {
    const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FILES.NAVIGATE_PREVIOUS}`, {
      params: { path: currentFilePath }
    });
    
    if (response.data) {
      const path = response.data;
      const name = path.substring(path.lastIndexOf('/') + 1);
      return { name, path };
    }
    
    return null;
  } catch (error) {
    console.error('Error navigating to previous file:', error);
    return null;
  }
}

/**
 * Find symbol definition in the codebase
 * Used for control-click navigation
 */
export async function findSymbolDefinition(symbolName: string, rootPath: string = '..'): Promise<{
  filePath: string;
  line: number;
  column: number;
} | null> {
  try {
    const response = await axios.get('http://localhost:8080/api/analysis/definition', {
      params: { symbol: symbolName, path: rootPath }
    });
    
    if (response.data && response.data.filePath) {
      return {
        filePath: response.data.filePath,
        line: response.data.line || 1,
        column: response.data.column || 0
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error finding symbol definition:', error);
    return null;
  }
}

/**
 * Get caller information for a method
 * Implements FR.26-FR.27
 */
export interface CallerInfo {
  methodName: string;
  className: string;
  filePath: string;
  line: number;
  callCount: number;
}

export async function getCallers(methodName: string, className: string, filePath: string): Promise<CallerInfo[]> {
  try {
    const response = await axios.get('http://localhost:8080/api/analysis/callers', {
      params: { method: methodName, class: className, file: filePath }
    });
    
    return response.data || [];
  } catch (error) {
    console.error('Error fetching callers:', error);
    return [];
  }
}

/**
 * Get test references for a class or method
 * Implements FR.28
 */
export interface TestReference {
  testName: string;
  testClass: string;
  filePath: string;
  line: number;
}

export async function getTestReferences(className: string, methodName?: string): Promise<TestReference[]> {
  try {
    const response = await axios.get('http://localhost:8080/api/analysis/test-references', {
      params: { class: className, method: methodName }
    });
    
    return response.data || [];
  } catch (error) {
    console.error('Error fetching test references:', error);
    return [];
  }
}
