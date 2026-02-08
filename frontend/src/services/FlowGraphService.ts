import { ref } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'

/**
 * Flow graph node
 * FR.33: Interactive Architecture Flow Graph
 */
export interface FlowGraphNode {
  id: string
  name: string
  nodeType: string
  layer: string
  filePath: string
  lineNumber: number
  packageName: string
}

/**
 * Flow graph edge
 * FR.33: Interactive Architecture Flow Graph
 */
export interface FlowGraphEdge {
  sourceId: string
  targetId: string
  edgeType: string
  label: string
  lineNumber?: number
}

/**
 * Flow graph response
 * FR.33: Interactive Architecture Flow Graph
 */
export interface FlowGraphResponse {
  nodes: FlowGraphNode[]
  edges: FlowGraphEdge[]
  metadata: {
    nodeCount: number
    edgeCount: number
    layerCounts?: Record<string, number>
    edgeTypeCounts?: Record<string, number>
    layers?: string[]
    [key: string]: any
  }
}

/**
 * Service for flow graph operations
 * FR.33: Interactive Architecture Flow Graph
 */
class FlowGraphService {
  private baseUrl = 'http://localhost:8080/api/flow-graph'
  private loading: Ref<boolean> = ref(false)
  private error: Ref<string | null> = ref(null)

  /**
   * Get the complete architecture flow graph
   */
  async analyzeProject(): Promise<FlowGraphResponse | null> {
    this.loading.value = true
    this.error.value = null
    
    try {
      const response = await axios.get<FlowGraphResponse>(`${this.baseUrl}/analyze`)
      return response.data
    } catch (err) {
      this.error.value = err instanceof Error ? err.message : 'Failed to analyze project'
      console.error('Failed to analyze project:', err)
      return null
    } finally {
      this.loading.value = false
    }
  }

  /**
   * Trace flow graph from a specific node
   * @param nodeId Starting node ID
   * @param depth Maximum depth to trace (default: 5)
   */
  async traceFromNode(nodeId: number, depth: number = 5): Promise<FlowGraphResponse | null> {
    this.loading.value = true
    this.error.value = null
    
    try {
      const response = await axios.get<FlowGraphResponse>(`${this.baseUrl}/trace`, {
        params: { from: nodeId, depth }
      })
      return response.data
    } catch (err) {
      this.error.value = err instanceof Error ? err.message : 'Failed to trace from node'
      console.error('Failed to trace from node:', err)
      return null
    } finally {
      this.loading.value = false
    }
  }

  /**
   * Get flow graph starting from a specific component
   * @param componentName Component name to start from
   */
  async getComponentFlow(componentName: string): Promise<FlowGraphResponse | null> {
    this.loading.value = true
    this.error.value = null
    
    try {
      const response = await axios.get<FlowGraphResponse>(
        `${this.baseUrl}/component/${encodeURIComponent(componentName)}`
      )
      return response.data
    } catch (err) {
      this.error.value = err instanceof Error ? err.message : 'Failed to get component flow'
      console.error('Failed to get component flow:', err)
      return null
    } finally {
      this.loading.value = false
    }
  }

  /**
   * Get loading state
   */
  isLoading(): Ref<boolean> {
    return this.loading
  }

  /**
   * Get error state
   */
  getError(): Ref<string | null> {
    return this.error
  }
}

export default new FlowGraphService()
