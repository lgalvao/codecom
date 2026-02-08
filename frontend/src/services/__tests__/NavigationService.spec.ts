import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  getPackageFiles,
  navigateToNextFile,
  navigateToPreviousFile,
  findSymbolDefinition,
  getCallers,
  getTestReferences
} from '../NavigationService';

vi.mock('axios');

describe('NavigationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPackageFiles', () => {
    it('should fetch files in the same directory', async () => {
      const mockTreeResponse = {
        data: {
          name: 'services',
          type: 'DIRECTORY',
          path: '/src/services',
          children: [
            { name: 'UserService.java', type: 'FILE', path: '/src/services/UserService.java' },
            { name: 'OrderService.java', type: 'FILE', path: '/src/services/OrderService.java' }
          ]
        }
      };

      vi.mocked(axios.get).mockResolvedValue(mockTreeResponse);

      const files = await getPackageFiles('/src/services/UserService.java');

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/files/tree',
        { params: { path: '/src/services' } }
      );

      expect(files).toHaveLength(2);
      expect(files[0].name).toBe('OrderService.java');
      expect(files[1].name).toBe('UserService.java');
    });

    it('should extract files from nested tree structure', async () => {
      const mockTreeResponse = {
        data: {
          name: 'src',
          type: 'DIRECTORY',
          path: '/src',
          children: [
            {
              name: 'controllers',
              type: 'DIRECTORY',
              path: '/src/controllers',
              children: [
                { name: 'UserController.java', type: 'FILE', path: '/src/controllers/UserController.java' }
              ]
            },
            { name: 'Main.java', type: 'FILE', path: '/src/Main.java' }
          ]
        }
      };

      vi.mocked(axios.get).mockResolvedValue(mockTreeResponse);

      const files = await getPackageFiles('/src/Main.java');

      expect(files).toHaveLength(2);
      expect(files.find(f => f.name === 'Main.java')).toBeDefined();
      expect(files.find(f => f.name === 'UserController.java')).toBeDefined();
    });

    it('should sort files alphabetically', async () => {
      const mockTreeResponse = {
        data: {
          name: 'services',
          type: 'DIRECTORY',
          path: '/src/services',
          children: [
            { name: 'ZService.java', type: 'FILE', path: '/src/services/ZService.java' },
            { name: 'AService.java', type: 'FILE', path: '/src/services/AService.java' },
            { name: 'MService.java', type: 'FILE', path: '/src/services/MService.java' }
          ]
        }
      };

      vi.mocked(axios.get).mockResolvedValue(mockTreeResponse);

      const files = await getPackageFiles('/src/services/MService.java');

      expect(files[0].name).toBe('AService.java');
      expect(files[1].name).toBe('MService.java');
      expect(files[2].name).toBe('ZService.java');
    });

    it('should return empty array on error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(axios.get).mockRejectedValue(new Error('Network error'));

      const files = await getPackageFiles('/src/services/UserService.java');

      expect(files).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching package files:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle empty tree response', async () => {
      const mockTreeResponse = {
        data: {
          name: 'empty',
          type: 'DIRECTORY',
          path: '/empty',
          children: []
        }
      };

      vi.mocked(axios.get).mockResolvedValue(mockTreeResponse);

      const files = await getPackageFiles('/empty/test.java');

      expect(files).toEqual([]);
    });

    it('should include directory information in file objects', async () => {
      const mockTreeResponse = {
        data: {
          name: 'services',
          type: 'DIRECTORY',
          path: '/src/services',
          children: [
            { name: 'UserService.java', type: 'FILE', path: '/src/services/UserService.java' }
          ]
        }
      };

      vi.mocked(axios.get).mockResolvedValue(mockTreeResponse);

      const files = await getPackageFiles('/src/services/UserService.java');

      expect(files[0].directory).toBe('/src/services');
    });
  });

  describe('navigateToNextFile', () => {
    it('should return next file in the same directory', async () => {
      const mockTreeResponse = {
        data: {
          name: 'services',
          type: 'DIRECTORY',
          path: '/src/services',
          children: [
            { name: 'AService.java', type: 'FILE', path: '/src/services/AService.java' },
            { name: 'BService.java', type: 'FILE', path: '/src/services/BService.java' },
            { name: 'CService.java', type: 'FILE', path: '/src/services/CService.java' }
          ]
        }
      };

      vi.mocked(axios.get).mockResolvedValue(mockTreeResponse);

      const nextFile = await navigateToNextFile('/src/services/AService.java');

      expect(nextFile).not.toBeNull();
      expect(nextFile.name).toBe('BService.java');
      expect(nextFile.path).toBe('/src/services/BService.java');
    });

    it('should return null when at last file', async () => {
      const mockTreeResponse = {
        data: {
          name: 'services',
          type: 'DIRECTORY',
          path: '/src/services',
          children: [
            { name: 'AService.java', type: 'FILE', path: '/src/services/AService.java' },
            { name: 'BService.java', type: 'FILE', path: '/src/services/BService.java' }
          ]
        }
      };

      vi.mocked(axios.get).mockResolvedValue(mockTreeResponse);

      const nextFile = await navigateToNextFile('/src/services/BService.java');

      expect(nextFile).toBeNull();
    });

    it('should return null when current file not found', async () => {
      const mockTreeResponse = {
        data: {
          name: 'services',
          type: 'DIRECTORY',
          path: '/src/services',
          children: [
            { name: 'AService.java', type: 'FILE', path: '/src/services/AService.java' }
          ]
        }
      };

      vi.mocked(axios.get).mockResolvedValue(mockTreeResponse);

      const nextFile = await navigateToNextFile('/src/services/NonExistent.java');

      expect(nextFile).toBeNull();
    });

    it('should return null when directory has single file', async () => {
      const mockTreeResponse = {
        data: {
          name: 'services',
          type: 'DIRECTORY',
          path: '/src/services',
          children: [
            { name: 'OnlyService.java', type: 'FILE', path: '/src/services/OnlyService.java' }
          ]
        }
      };

      vi.mocked(axios.get).mockResolvedValue(mockTreeResponse);

      const nextFile = await navigateToNextFile('/src/services/OnlyService.java');

      expect(nextFile).toBeNull();
    });
  });

  describe('navigateToPreviousFile', () => {
    it('should return previous file in the same directory', async () => {
      const mockTreeResponse = {
        data: {
          name: 'services',
          type: 'DIRECTORY',
          path: '/src/services',
          children: [
            { name: 'AService.java', type: 'FILE', path: '/src/services/AService.java' },
            { name: 'BService.java', type: 'FILE', path: '/src/services/BService.java' },
            { name: 'CService.java', type: 'FILE', path: '/src/services/CService.java' }
          ]
        }
      };

      vi.mocked(axios.get).mockResolvedValue(mockTreeResponse);

      const prevFile = await navigateToPreviousFile('/src/services/CService.java');

      expect(prevFile).not.toBeNull();
      expect(prevFile.name).toBe('BService.java');
      expect(prevFile.path).toBe('/src/services/BService.java');
    });

    it('should return null when at first file', async () => {
      const mockTreeResponse = {
        data: {
          name: 'services',
          type: 'DIRECTORY',
          path: '/src/services',
          children: [
            { name: 'AService.java', type: 'FILE', path: '/src/services/AService.java' },
            { name: 'BService.java', type: 'FILE', path: '/src/services/BService.java' }
          ]
        }
      };

      vi.mocked(axios.get).mockResolvedValue(mockTreeResponse);

      const prevFile = await navigateToPreviousFile('/src/services/AService.java');

      expect(prevFile).toBeNull();
    });

    it('should return null when current file not found', async () => {
      const mockTreeResponse = {
        data: {
          name: 'services',
          type: 'DIRECTORY',
          path: '/src/services',
          children: [
            { name: 'AService.java', type: 'FILE', path: '/src/services/AService.java' }
          ]
        }
      };

      vi.mocked(axios.get).mockResolvedValue(mockTreeResponse);

      const prevFile = await navigateToPreviousFile('/src/services/NonExistent.java');

      expect(prevFile).toBeNull();
    });
  });

  describe('findSymbolDefinition', () => {
    it('should find symbol definition', async () => {
      const mockResponse = {
        data: {
          filePath: '/src/services/UserService.java',
          line: 25,
          column: 4
        }
      };

      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const definition = await findSymbolDefinition('UserService', '/project');

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/analysis/definition',
        { params: { symbol: 'UserService', path: '/project' } }
      );

      expect(definition).toEqual({
        filePath: '/src/services/UserService.java',
        line: 25,
        column: 4
      });
    });

    it('should use default root path when not provided', async () => {
      const mockResponse = {
        data: {
          filePath: '/src/services/UserService.java',
          line: 25,
          column: 4
        }
      };

      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      await findSymbolDefinition('UserService');

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/analysis/definition',
        { params: { symbol: 'UserService', path: '..' } }
      );
    });

    it('should return null when symbol not found', async () => {
      const mockResponse = {
        data: {}
      };

      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const definition = await findSymbolDefinition('NonExistent', '/project');

      expect(definition).toBeNull();
    });

    it('should return null on error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(axios.get).mockRejectedValue(new Error('API error'));

      const definition = await findSymbolDefinition('UserService', '/project');

      expect(definition).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Error finding symbol definition:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should use default values for missing line and column', async () => {
      const mockResponse = {
        data: {
          filePath: '/src/services/UserService.java'
        }
      };

      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const definition = await findSymbolDefinition('UserService', '/project');

      expect(definition).toEqual({
        filePath: '/src/services/UserService.java',
        line: 1,
        column: 0
      });
    });
  });

  describe('getCallers', () => {
    it('should fetch caller information', async () => {
      const mockCallers = [
        {
          methodName: 'createUser',
          className: 'UserController',
          filePath: '/src/controllers/UserController.java',
          line: 30,
          callCount: 1
        },
        {
          methodName: 'updateUser',
          className: 'UserController',
          filePath: '/src/controllers/UserController.java',
          line: 45,
          callCount: 2
        }
      ];

      const mockResponse = {
        data: mockCallers
      };

      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const callers = await getCallers('getUserById', 'UserService', '/src/services/UserService.java');

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/analysis/callers',
        {
          params: {
            method: 'getUserById',
            class: 'UserService',
            file: '/src/services/UserService.java'
          }
        }
      );

      expect(callers).toHaveLength(2);
      expect(callers[0].methodName).toBe('createUser');
      expect(callers[1].callCount).toBe(2);
    });

    it('should return empty array when no callers found', async () => {
      const mockResponse = {
        data: []
      };

      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const callers = await getCallers('unusedMethod', 'SomeClass', '/src/SomeClass.java');

      expect(callers).toEqual([]);
    });

    it('should return empty array on error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(axios.get).mockRejectedValue(new Error('API error'));

      const callers = await getCallers('getUserById', 'UserService', '/src/services/UserService.java');

      expect(callers).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching callers:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle null response data', async () => {
      const mockResponse = {
        data: null
      };

      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const callers = await getCallers('someMethod', 'SomeClass', '/src/SomeClass.java');

      expect(callers).toEqual([]);
    });
  });

  describe('getTestReferences', () => {
    it('should fetch test references for a class', async () => {
      const mockTestRefs = [
        {
          testName: 'testCreateUser',
          testClass: 'UserServiceTest',
          filePath: '/test/services/UserServiceTest.java',
          line: 15
        },
        {
          testName: 'testUpdateUser',
          testClass: 'UserServiceTest',
          filePath: '/test/services/UserServiceTest.java',
          line: 30
        }
      ];

      const mockResponse = {
        data: mockTestRefs
      };

      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const testRefs = await getTestReferences('UserService');

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/analysis/test-references',
        {
          params: {
            class: 'UserService',
            method: undefined
          }
        }
      );

      expect(testRefs).toHaveLength(2);
      expect(testRefs[0].testName).toBe('testCreateUser');
    });

    it('should fetch test references for a specific method', async () => {
      const mockTestRefs = [
        {
          testName: 'testGetUserById',
          testClass: 'UserServiceTest',
          filePath: '/test/services/UserServiceTest.java',
          line: 20
        }
      ];

      const mockResponse = {
        data: mockTestRefs
      };

      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const testRefs = await getTestReferences('UserService', 'getUserById');

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/analysis/test-references',
        {
          params: {
            class: 'UserService',
            method: 'getUserById'
          }
        }
      );

      expect(testRefs).toHaveLength(1);
      expect(testRefs[0].testName).toBe('testGetUserById');
    });

    it('should return empty array when no test references found', async () => {
      const mockResponse = {
        data: []
      };

      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const testRefs = await getTestReferences('UntestedClass');

      expect(testRefs).toEqual([]);
    });

    it('should return empty array on error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(axios.get).mockRejectedValue(new Error('API error'));

      const testRefs = await getTestReferences('UserService');

      expect(testRefs).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching test references:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle null response data', async () => {
      const mockResponse = {
        data: null
      };

      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const testRefs = await getTestReferences('SomeClass');

      expect(testRefs).toEqual([]);
    });
  });
});
