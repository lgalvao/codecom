import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import KnowledgeGraphService, { 
  CodeNode, 
  NodeWithRelationships,
  KnowledgeGraphQueryResult 
} from '../KnowledgeGraphService';

vi.mock('axios');

describe('KnowledgeGraphService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getNode', () => {
    it('should fetch node with relationships', async () => {
      const mockNode: NodeWithRelationships = {
        id: 1,
        name: 'TestClass',
        nodeType: 'CLASS',
        filePath: '/test.java',
        lineNumber: 1,
        packageName: 'com.test',
        outgoingRelationships: [],
        incomingRelationships: []
      };

      vi.mocked(axios.get).mockResolvedValue({ data: mockNode });

      const result = await KnowledgeGraphService.getNode(1);

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/knowledge-graph/node/1'
      );
      expect(result).toEqual(mockNode);
    });
  });

  describe('getCallees', () => {
    it('should fetch nodes called by a method', async () => {
      const mockCallees: CodeNode[] = [
        {
          id: 2,
          name: 'method1',
          nodeType: 'METHOD',
          filePath: '/test.java',
          lineNumber: 10,
          packageName: 'com.test'
        }
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: mockCallees });

      const result = await KnowledgeGraphService.getCallees(1);

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/knowledge-graph/calls/1'
      );
      expect(result).toEqual(mockCallees);
    });
  });

  describe('getCallers', () => {
    it('should fetch nodes that call a method', async () => {
      const mockCallers: CodeNode[] = [
        {
          id: 3,
          name: 'callerMethod',
          nodeType: 'METHOD',
          filePath: '/caller.java',
          lineNumber: 5,
          packageName: 'com.test'
        }
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: mockCallers });

      const result = await KnowledgeGraphService.getCallers(1);

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/knowledge-graph/callers/1'
      );
      expect(result).toEqual(mockCallers);
    });
  });

  describe('getInheritanceHierarchy', () => {
    it('should fetch parent classes', async () => {
      const mockParents: CodeNode[] = [
        {
          id: 2,
          name: 'BaseClass',
          nodeType: 'CLASS',
          filePath: '/base.java',
          lineNumber: 1,
          packageName: 'com.test'
        }
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: mockParents });

      const result = await KnowledgeGraphService.getInheritanceHierarchy(1);

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/knowledge-graph/inherits/1'
      );
      expect(result).toEqual(mockParents);
    });
  });

  describe('getSubclasses', () => {
    it('should fetch child classes', async () => {
      const mockChildren: CodeNode[] = [
        {
          id: 3,
          name: 'DerivedClass',
          nodeType: 'CLASS',
          filePath: '/derived.java',
          lineNumber: 1,
          packageName: 'com.test'
        }
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: mockChildren });

      const result = await KnowledgeGraphService.getSubclasses(1);

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/knowledge-graph/subclasses/1'
      );
      expect(result).toEqual(mockChildren);
    });
  });

  describe('findCallChain', () => {
    it('should find call chains between nodes', async () => {
      const mockChains: number[][] = [
        [1, 2, 3],
        [1, 4, 3]
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: mockChains });

      const result = await KnowledgeGraphService.findCallChain(1, 3);

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/knowledge-graph/call-chain',
        { params: { source: 1, target: 3, maxDepth: 5 } }
      );
      expect(result).toEqual(mockChains);
    });

    it('should use custom max depth', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      await KnowledgeGraphService.findCallChain(1, 3, 10);

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/knowledge-graph/call-chain',
        { params: { source: 1, target: 3, maxDepth: 10 } }
      );
    });
  });

  describe('executeQuery', () => {
    it('should execute cross-language query', async () => {
      const mockResult: KnowledgeGraphQueryResult = {
        query: 'calls:testMethod',
        nodes: [
          {
            id: 1,
            name: 'callerMethod',
            nodeType: 'METHOD',
            filePath: '/caller.java',
            lineNumber: 5,
            packageName: 'com.test'
          }
        ],
        paths: [],
        totalResults: 1
      };

      vi.mocked(axios.get).mockResolvedValue({ data: mockResult });

      const result = await KnowledgeGraphService.executeQuery('calls:testMethod');

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/knowledge-graph/query',
        { params: { q: 'calls:testMethod' } }
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('searchNodes', () => {
    it('should search nodes by name', async () => {
      const mockNodes: CodeNode[] = [
        {
          id: 1,
          name: 'TestClass',
          nodeType: 'CLASS',
          filePath: '/test.java',
          lineNumber: 1,
          packageName: 'com.test'
        }
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: mockNodes });

      const result = await KnowledgeGraphService.searchNodes('Test');

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/knowledge-graph/search',
        { params: { name: 'Test' } }
      );
      expect(result).toEqual(mockNodes);
    });
  });
});
