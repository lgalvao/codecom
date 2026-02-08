import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/slices';

export interface FeatureSliceNode {
  id: number;
  name: string;
  nodeType: string;
  filePath: string;
  lineNumber: number;
  packageName: string;
}

export interface FeatureSliceResponse {
  id: number;
  name: string;
  description: string;
  createdDate: string;
  updatedDate: string;
  nodeCount: number;
  fileCount: number;
  filePaths: string[];
}

export interface FeatureSliceDetail {
  id: number;
  name: string;
  description: string;
  createdDate: string;
  updatedDate: string;
  nodes: FeatureSliceNode[];
}

export interface CreateSliceRequest {
  name: string;
  description: string;
  seedNodeIds: number[];
  expansionDepth?: number;
}

export interface ExpandSliceRequest {
  depth: number;
  includeCallers?: boolean;
  includeCallees?: boolean;
  includeInheritance?: boolean;
}

export interface SliceStatistics {
  nodeCount: number;
  fileCount: number;
  nodeTypeBreakdown: Record<string, number>;
}

/**
 * Service for Feature-Based Code Slicing
 * FR.35: Feature-Based Code Slicing
 */
export class FeatureSliceService {
  
  /**
   * Create a new feature slice
   */
  async createSlice(request: CreateSliceRequest): Promise<FeatureSliceResponse> {
    const response = await axios.post<FeatureSliceResponse>(API_BASE, request);
    return response.data;
  }
  
  /**
   * Get all feature slices
   */
  async getAllSlices(): Promise<FeatureSliceResponse[]> {
    const response = await axios.get<FeatureSliceResponse[]>(API_BASE);
    return response.data;
  }
  
  /**
   * Get a specific slice with all details
   */
  async getSlice(sliceId: number): Promise<FeatureSliceDetail> {
    const response = await axios.get<FeatureSliceDetail>(`${API_BASE}/${sliceId}`);
    return response.data;
  }
  
  /**
   * Update a slice
   */
  async updateSlice(sliceId: number, name?: string, description?: string): Promise<FeatureSliceResponse> {
    const updates: any = {};
    if (name) updates.name = name;
    if (description) updates.description = description;
    
    const response = await axios.put<FeatureSliceResponse>(`${API_BASE}/${sliceId}`, updates);
    return response.data;
  }
  
  /**
   * Delete a slice
   */
  async deleteSlice(sliceId: number): Promise<void> {
    await axios.delete(`${API_BASE}/${sliceId}`);
  }
  
  /**
   * Expand a slice by traversing relationships
   */
  async expandSlice(sliceId: number, params: ExpandSliceRequest): Promise<FeatureSliceResponse> {
    const response = await axios.post<FeatureSliceResponse>(`${API_BASE}/${sliceId}/expand`, params);
    return response.data;
  }
  
  /**
   * Add nodes to a slice
   */
  async addNodes(sliceId: number, nodeIds: number[]): Promise<FeatureSliceResponse> {
    const response = await axios.post<FeatureSliceResponse>(`${API_BASE}/${sliceId}/nodes`, { nodeIds });
    return response.data;
  }
  
  /**
   * Remove nodes from a slice
   */
  async removeNodes(sliceId: number, nodeIds: number[]): Promise<FeatureSliceResponse> {
    const response = await axios.delete<FeatureSliceResponse>(`${API_BASE}/${sliceId}/nodes`, { 
      data: { nodeIds } 
    });
    return response.data;
  }
  
  /**
   * Get file paths for a slice (for filtering)
   */
  async getSliceFiles(sliceId: number): Promise<string[]> {
    const response = await axios.get<string[]>(`${API_BASE}/${sliceId}/files`);
    return response.data;
  }
  
  /**
   * Get statistics for a slice
   */
  async getSliceStatistics(sliceId: number): Promise<SliceStatistics> {
    const response = await axios.get<SliceStatistics>(`${API_BASE}/${sliceId}/statistics`);
    return response.data;
  }
}

export default new FeatureSliceService();
