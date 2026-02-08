import { describe, it, expect, beforeEach, vi } from 'vitest'
import FlowGraphService from '../FlowGraphService'
import axios from 'axios'

vi.mock('axios', () => ({
  default: {
    get: vi.fn()
  }
}))

describe('FlowGraphService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('analyzeProject', () => {
    it('should fetch the complete flow graph', async () => {
      const mockResponse = {
        data: {
          nodes: [
            { id: 'node-1', name: 'UserList', layer: 'COMPONENT' },
            { id: 'node-2', name: 'UserController', layer: 'CONTROLLER' }
          ],
          edges: [
            { sourceId: 'node-1', targetId: 'node-2', edgeType: 'CALLS', label: 'calls' }
          ],
          metadata: {
            nodeCount: 2,
            edgeCount: 1
          }
        }
      }
      
      vi.mocked(axios.get).mockResolvedValue(mockResponse)
      
      const result = await FlowGraphService.analyzeProject()
      
      expect(axios.get).toHaveBeenCalledWith('http://localhost:8080/api/flow-graph/analyze')
      expect(result).toEqual(mockResponse.data)
      expect(result.nodes).toHaveLength(2)
      expect(result.edges).toHaveLength(1)
    })

    it('should handle errors gracefully', async () => {
      vi.mocked(axios.get).mockRejectedValue(new Error('Network error'))
      
      const result = await FlowGraphService.analyzeProject()
      
      expect(result).toBeNull()
      expect(FlowGraphService.getError().value).toBe('Network error')
    })

    it('should set loading state correctly', async () => {
      const mockResponse = { data: { nodes: [], edges: [], metadata: { nodeCount: 0, edgeCount: 0 } } }
      vi.mocked(axios.get).mockResolvedValue(mockResponse)
      
      expect(FlowGraphService.isLoading().value).toBe(false)
      
      const promise = FlowGraphService.analyzeProject()
      expect(FlowGraphService.isLoading().value).toBe(true)
      
      await promise
      expect(FlowGraphService.isLoading().value).toBe(false)
    })
  })

  describe('traceFromNode', () => {
    it('should trace from a specific node with default depth', async () => {
      const mockResponse = {
        data: {
          nodes: [{ id: 'node-1', name: 'TestNode', layer: 'CONTROLLER' }],
          edges: [],
          metadata: {
            nodeCount: 1,
            edgeCount: 0,
            startNodeId: '1',
            maxDepth: 5
          }
        }
      }
      
      vi.mocked(axios.get).mockResolvedValue(mockResponse)
      
      const result = await FlowGraphService.traceFromNode(1)
      
      expect(axios.get).toHaveBeenCalledWith('http://localhost:8080/api/flow-graph/trace', {
        params: { from: 1, depth: 5 }
      })
      expect(result).toEqual(mockResponse.data)
      expect(result.metadata.maxDepth).toBe(5)
    })

    it('should trace from a specific node with custom depth', async () => {
      const mockResponse = {
        data: {
          nodes: [],
          edges: [],
          metadata: { nodeCount: 0, edgeCount: 0 }
        }
      }
      
      vi.mocked(axios.get).mockResolvedValue(mockResponse)
      
      await FlowGraphService.traceFromNode(1, 3)
      
      expect(axios.get).toHaveBeenCalledWith('http://localhost:8080/api/flow-graph/trace', {
        params: { from: 1, depth: 3 }
      })
    })

    it('should handle errors when tracing', async () => {
      vi.mocked(axios.get).mockRejectedValue(new Error('Node not found'))
      
      const result = await FlowGraphService.traceFromNode(999)
      
      expect(result).toBeNull()
      expect(FlowGraphService.getError().value).toBe('Node not found')
    })
  })

  describe('getComponentFlow', () => {
    it('should get flow for a specific component', async () => {
      const mockResponse = {
        data: {
          nodes: [
            { id: 'node-1', name: 'UserList', layer: 'COMPONENT' },
            { id: 'node-2', name: 'UserService', layer: 'SERVICE_TS' }
          ],
          edges: [
            { sourceId: 'node-1', targetId: 'node-2', edgeType: 'CALLS', label: 'calls' }
          ],
          metadata: { nodeCount: 2, edgeCount: 1 }
        }
      }
      
      vi.mocked(axios.get).mockResolvedValue(mockResponse)
      
      const result = await FlowGraphService.getComponentFlow('UserList')
      
      expect(axios.get).toHaveBeenCalledWith('http://localhost:8080/api/flow-graph/component/UserList')
      expect(result).toEqual(mockResponse.data)
      expect(result.nodes).toHaveLength(2)
    })

    it('should handle component not found', async () => {
      const mockResponse = {
        data: {
          nodes: [],
          edges: [],
          metadata: {
            nodeCount: 0,
            edgeCount: 0,
            error: 'Component not found',
            componentName: 'NonExistent'
          }
        }
      }
      
      vi.mocked(axios.get).mockResolvedValue(mockResponse)
      
      const result = await FlowGraphService.getComponentFlow('NonExistent')
      
      expect(result).toEqual(mockResponse.data)
      expect(result.metadata.error).toBe('Component not found')
    })

    it('should URL encode component names', async () => {
      const mockResponse = {
        data: { nodes: [], edges: [], metadata: { nodeCount: 0, edgeCount: 0 } }
      }
      
      vi.mocked(axios.get).mockResolvedValue(mockResponse)
      
      await FlowGraphService.getComponentFlow('User List')
      
      expect(axios.get).toHaveBeenCalledWith('http://localhost:8080/api/flow-graph/component/User%20List')
    })
  })

  describe('state management', () => {
    it('should reset error state on new request', async () => {
      // First request fails
      vi.mocked(axios.get).mockRejectedValue(new Error('First error'))
      await FlowGraphService.analyzeProject()
      expect(FlowGraphService.getError().value).toBe('First error')
      
      // Second request succeeds
      vi.mocked(axios.get).mockResolvedValue({
        data: { nodes: [], edges: [], metadata: { nodeCount: 0, edgeCount: 0 } }
      })
      await FlowGraphService.analyzeProject()
      expect(FlowGraphService.getError().value).toBeNull()
    })

    it('should maintain loading state across multiple requests', async () => {
      const mockResponse = {
        data: { nodes: [], edges: [], metadata: { nodeCount: 0, edgeCount: 0 } }
      }
      vi.mocked(axios.get).mockResolvedValue(mockResponse)
      
      const promise1 = FlowGraphService.analyzeProject()
      expect(FlowGraphService.isLoading().value).toBe(true)
      await promise1
      expect(FlowGraphService.isLoading().value).toBe(false)
      
      const promise2 = FlowGraphService.traceFromNode(1)
      expect(FlowGraphService.isLoading().value).toBe(true)
      await promise2
      expect(FlowGraphService.isLoading().value).toBe(false)
    })
  })
})
