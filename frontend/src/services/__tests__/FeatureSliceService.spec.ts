import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import FeatureSliceService, {
  FeatureSliceResponse,
  FeatureSliceDetail,
  CreateSliceRequest,
  ExpandSliceRequest,
  SliceStatistics
} from '../FeatureSliceService';

vi.mock('axios');

describe('FeatureSliceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSlice', () => {
    it('should create a new feature slice', async () => {
      const request: CreateSliceRequest = {
        name: 'User Management',
        description: 'User authentication and authorization',
        seedNodeIds: [1, 2, 3],
        expansionDepth: 2
      };

      const mockResponse: FeatureSliceResponse = {
        id: 1,
        name: 'User Management',
        description: 'User authentication and authorization',
        createdDate: '2024-01-01T00:00:00',
        updatedDate: '2024-01-01T00:00:00',
        nodeCount: 5,
        fileCount: 3,
        filePaths: ['/file1.java', '/file2.java', '/file3.java']
      };

      vi.mocked(axios.post).mockResolvedValue({ data: mockResponse });

      const result = await FeatureSliceService.createSlice(request);

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/slices',
        request
      );
      expect(result).toEqual(mockResponse);
    });

    it('should create slice without expansion depth', async () => {
      const request: CreateSliceRequest = {
        name: 'Test Slice',
        description: 'Test',
        seedNodeIds: [1]
      };

      const mockResponse: FeatureSliceResponse = {
        id: 1,
        name: 'Test Slice',
        description: 'Test',
        createdDate: '2024-01-01T00:00:00',
        updatedDate: '2024-01-01T00:00:00',
        nodeCount: 1,
        fileCount: 1,
        filePaths: ['/test.java']
      };

      vi.mocked(axios.post).mockResolvedValue({ data: mockResponse });

      const result = await FeatureSliceService.createSlice(request);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getAllSlices', () => {
    it('should fetch all slices', async () => {
      const mockSlices: FeatureSliceResponse[] = [
        {
          id: 1,
          name: 'Slice 1',
          description: 'First slice',
          createdDate: '2024-01-01T00:00:00',
          updatedDate: '2024-01-01T00:00:00',
          nodeCount: 5,
          fileCount: 3,
          filePaths: ['/file1.java']
        },
        {
          id: 2,
          name: 'Slice 2',
          description: 'Second slice',
          createdDate: '2024-01-02T00:00:00',
          updatedDate: '2024-01-02T00:00:00',
          nodeCount: 10,
          fileCount: 5,
          filePaths: ['/file2.java']
        }
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: mockSlices });

      const result = await FeatureSliceService.getAllSlices();

      expect(axios.get).toHaveBeenCalledWith('http://localhost:8080/api/slices');
      expect(result).toEqual(mockSlices);
      expect(result).toHaveLength(2);
    });
  });

  describe('getSlice', () => {
    it('should fetch slice details', async () => {
      const mockDetail: FeatureSliceDetail = {
        id: 1,
        name: 'User Management',
        description: 'User auth',
        createdDate: '2024-01-01T00:00:00',
        updatedDate: '2024-01-01T00:00:00',
        nodes: [
          {
            id: 1,
            name: 'UserService',
            nodeType: 'CLASS',
            filePath: '/UserService.java',
            lineNumber: 1,
            packageName: 'com.example'
          },
          {
            id: 2,
            name: 'UserController',
            nodeType: 'CLASS',
            filePath: '/UserController.java',
            lineNumber: 1,
            packageName: 'com.example'
          }
        ]
      };

      vi.mocked(axios.get).mockResolvedValue({ data: mockDetail });

      const result = await FeatureSliceService.getSlice(1);

      expect(axios.get).toHaveBeenCalledWith('http://localhost:8080/api/slices/1');
      expect(result).toEqual(mockDetail);
      expect(result.nodes).toHaveLength(2);
    });
  });

  describe('updateSlice', () => {
    it('should update slice name and description', async () => {
      const mockResponse: FeatureSliceResponse = {
        id: 1,
        name: 'New Name',
        description: 'New Description',
        createdDate: '2024-01-01T00:00:00',
        updatedDate: '2024-01-02T00:00:00',
        nodeCount: 5,
        fileCount: 3,
        filePaths: []
      };

      vi.mocked(axios.put).mockResolvedValue({ data: mockResponse });

      const result = await FeatureSliceService.updateSlice(1, 'New Name', 'New Description');

      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:8080/api/slices/1',
        { name: 'New Name', description: 'New Description' }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should update only name', async () => {
      const mockResponse: FeatureSliceResponse = {
        id: 1,
        name: 'New Name',
        description: 'Old Description',
        createdDate: '2024-01-01T00:00:00',
        updatedDate: '2024-01-02T00:00:00',
        nodeCount: 5,
        fileCount: 3,
        filePaths: []
      };

      vi.mocked(axios.put).mockResolvedValue({ data: mockResponse });

      const result = await FeatureSliceService.updateSlice(1, 'New Name');

      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:8080/api/slices/1',
        { name: 'New Name' }
      );
      expect(result.name).toBe('New Name');
    });
  });

  describe('deleteSlice', () => {
    it('should delete a slice', async () => {
      vi.mocked(axios.delete).mockResolvedValue({});

      await FeatureSliceService.deleteSlice(1);

      expect(axios.delete).toHaveBeenCalledWith('http://localhost:8080/api/slices/1');
    });
  });

  describe('expandSlice', () => {
    it('should expand slice with all options enabled', async () => {
      const params: ExpandSliceRequest = {
        depth: 2,
        includeCallers: true,
        includeCallees: true,
        includeInheritance: true
      };

      const mockResponse: FeatureSliceResponse = {
        id: 1,
        name: 'Expanded Slice',
        description: 'Test',
        createdDate: '2024-01-01T00:00:00',
        updatedDate: '2024-01-01T00:00:00',
        nodeCount: 20,
        fileCount: 10,
        filePaths: []
      };

      vi.mocked(axios.post).mockResolvedValue({ data: mockResponse });

      const result = await FeatureSliceService.expandSlice(1, params);

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/slices/1/expand',
        params
      );
      expect(result.nodeCount).toBe(20);
    });

    it('should expand slice with selective options', async () => {
      const params: ExpandSliceRequest = {
        depth: 1,
        includeCallers: false,
        includeCallees: true,
        includeInheritance: false
      };

      const mockResponse: FeatureSliceResponse = {
        id: 1,
        name: 'Slice',
        description: 'Test',
        createdDate: '2024-01-01T00:00:00',
        updatedDate: '2024-01-01T00:00:00',
        nodeCount: 10,
        fileCount: 5,
        filePaths: []
      };

      vi.mocked(axios.post).mockResolvedValue({ data: mockResponse });

      const result = await FeatureSliceService.expandSlice(1, params);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('addNodes', () => {
    it('should add nodes to a slice', async () => {
      const nodeIds = [5, 6, 7];
      const mockResponse: FeatureSliceResponse = {
        id: 1,
        name: 'Slice',
        description: 'Test',
        createdDate: '2024-01-01T00:00:00',
        updatedDate: '2024-01-01T00:00:00',
        nodeCount: 8,
        fileCount: 4,
        filePaths: []
      };

      vi.mocked(axios.post).mockResolvedValue({ data: mockResponse });

      const result = await FeatureSliceService.addNodes(1, nodeIds);

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/slices/1/nodes',
        { nodeIds }
      );
      expect(result.nodeCount).toBe(8);
    });
  });

  describe('removeNodes', () => {
    it('should remove nodes from a slice', async () => {
      const nodeIds = [2, 3];
      const mockResponse: FeatureSliceResponse = {
        id: 1,
        name: 'Slice',
        description: 'Test',
        createdDate: '2024-01-01T00:00:00',
        updatedDate: '2024-01-01T00:00:00',
        nodeCount: 3,
        fileCount: 2,
        filePaths: []
      };

      vi.mocked(axios.delete).mockResolvedValue({ data: mockResponse });

      const result = await FeatureSliceService.removeNodes(1, nodeIds);

      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:8080/api/slices/1/nodes',
        { data: { nodeIds } }
      );
      expect(result.nodeCount).toBe(3);
    });
  });

  describe('getSliceFiles', () => {
    it('should fetch file paths for a slice', async () => {
      const mockFiles = [
        '/com/example/UserService.java',
        '/com/example/UserController.java',
        '/com/example/UserRepository.java'
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: mockFiles });

      const result = await FeatureSliceService.getSliceFiles(1);

      expect(axios.get).toHaveBeenCalledWith('http://localhost:8080/api/slices/1/files');
      expect(result).toEqual(mockFiles);
      expect(result).toHaveLength(3);
    });

    it('should return empty array for slice with no files', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      const result = await FeatureSliceService.getSliceFiles(1);

      expect(result).toEqual([]);
    });
  });

  describe('getSliceStatistics', () => {
    it('should fetch slice statistics', async () => {
      const mockStats: SliceStatistics = {
        nodeCount: 15,
        fileCount: 8,
        nodeTypeBreakdown: {
          CLASS: 5,
          METHOD: 8,
          INTERFACE: 2
        }
      };

      vi.mocked(axios.get).mockResolvedValue({ data: mockStats });

      const result = await FeatureSliceService.getSliceStatistics(1);

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/slices/1/statistics'
      );
      expect(result).toEqual(mockStats);
      expect(result.nodeCount).toBe(15);
      expect(result.nodeTypeBreakdown.CLASS).toBe(5);
    });
  });
});
