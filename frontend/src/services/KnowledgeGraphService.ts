import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/knowledge-graph';

export interface CodeNode {
  id: number;
  name: string;
  nodeType: string;
  filePath: string;
  lineNumber: number;
  packageName: string;
  signature?: string;
  isPublic?: boolean;
  isStatic?: boolean;
  isAbstract?: boolean;
  documentation?: string;
}

export interface RelationshipInfo {
  relationshipId: number;
  relationshipType: string;
  relatedNodeId: number;
  relatedNodeName: string;
  relatedNodeType: string;
  metadata?: string;
  lineNumber?: number;
}

export interface NodeWithRelationships extends CodeNode {
  outgoingRelationships: RelationshipInfo[];
  incomingRelationships: RelationshipInfo[];
}

export interface QueryNode {
  id: number;
  name: string;
  nodeType: string;
  filePath: string;
  lineNumber: number;
  packageName: string;
  signature?: string;
}

export interface QueryPath {
  nodeIds: number[];
  relationshipTypes: string[];
  pathLength: number;
}

export interface KnowledgeGraphQueryResult {
  query: string;
  nodes: QueryNode[];
  paths: QueryPath[];
  totalResults: number;
}

/**
 * Service for Knowledge Graph operations
 * FR.38: Relationship Graph Database
 * FR.39: Cross-Language Query Support
 */
export class KnowledgeGraphService {
  
  /**
   * Get a node with all its relationships
   */
  async getNode(nodeId: number): Promise<NodeWithRelationships> {
    const response = await axios.get<NodeWithRelationships>(`${API_BASE}/node/${nodeId}`);
    return response.data;
  }
  
  /**
   * Get all nodes that a specific node calls
   */
  async getCallees(nodeId: number): Promise<CodeNode[]> {
    const response = await axios.get<CodeNode[]>(`${API_BASE}/calls/${nodeId}`);
    return response.data;
  }
  
  /**
   * Get all nodes that call a specific node
   */
  async getCallers(nodeId: number): Promise<CodeNode[]> {
    const response = await axios.get<CodeNode[]>(`${API_BASE}/callers/${nodeId}`);
    return response.data;
  }
  
  /**
   * Get inheritance hierarchy for a class
   */
  async getInheritanceHierarchy(nodeId: number): Promise<CodeNode[]> {
    const response = await axios.get<CodeNode[]>(`${API_BASE}/inherits/${nodeId}`);
    return response.data;
  }
  
  /**
   * Get all classes that inherit from a specific class
   */
  async getSubclasses(nodeId: number): Promise<CodeNode[]> {
    const response = await axios.get<CodeNode[]>(`${API_BASE}/subclasses/${nodeId}`);
    return response.data;
  }
  
  /**
   * Find call chains between two nodes
   */
  async findCallChain(sourceId: number, targetId: number, maxDepth: number = 5): Promise<number[][]> {
    const response = await axios.get<number[][]>(`${API_BASE}/call-chain`, {
      params: { source: sourceId, target: targetId, maxDepth }
    });
    return response.data;
  }
  
  /**
   * Execute a cross-language query
   * 
   * Example queries:
   * - "calls:MethodName" - Find all nodes that call MethodName
   * - "inherits:ClassName" - Find all classes that inherit from ClassName
   * - "type:CLASS public:true" - Find all public classes
   * - "name:search" - Search nodes by name
   */
  async executeQuery(query: string): Promise<KnowledgeGraphQueryResult> {
    const response = await axios.get<KnowledgeGraphQueryResult>(`${API_BASE}/query`, {
      params: { q: query }
    });
    return response.data;
  }
  
  /**
   * Search nodes by name
   */
  async searchNodes(name: string): Promise<CodeNode[]> {
    const response = await axios.get<CodeNode[]>(`${API_BASE}/search`, {
      params: { name }
    });
    return response.data;
  }
}

export default new KnowledgeGraphService();
