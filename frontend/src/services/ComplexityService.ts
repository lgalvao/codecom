import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/analysis';

export interface FileComplexity {
  filePath: string;
  cyclomaticComplexity: number;
  linesOfCode: number;
  numberOfMethods: number;
  complexityScore: number;
  complexityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
}

/**
 * Service for code complexity analysis
 * FR.32: Complexity Heatmap
 */
export class ComplexityService {
  
  /**
   * Get complexity metrics for all files in a project
   */
  async getProjectComplexity(projectPath: string): Promise<FileComplexity[]> {
    const response = await axios.get<FileComplexity[]>(`${API_BASE}/complexity`, {
      params: { path: projectPath }
    });
    return response.data;
  }
  
  /**
   * Get complexity metrics for a single file
   */
  async getFileComplexity(filePath: string): Promise<FileComplexity> {
    const response = await axios.get<FileComplexity>(`${API_BASE}/complexity/file`, {
      params: { path: filePath }
    });
    return response.data;
  }
  
  /**
   * Get heatmap color for a complexity score
   * Returns a color string based on complexity level
   */
  getHeatmapColor(score: number, theme: 'light' | 'dark' = 'light'): string {
    // Heatmap: green (low) -> yellow (medium) -> orange (high) -> red (very high)
    if (score < 0.25) {
      return theme === 'light' ? '#22c55e' : '#16a34a'; // Green
    } else if (score < 0.5) {
      return theme === 'light' ? '#eab308' : '#ca8a04'; // Yellow
    } else if (score < 0.75) {
      return theme === 'light' ? '#f97316' : '#ea580c'; // Orange
    } else {
      return theme === 'light' ? '#ef4444' : '#dc2626'; // Red
    }
  }
  
  /**
   * Get icon for complexity level
   */
  getComplexityIcon(level: string): string {
    const icons: Record<string, string> = {
      'LOW': '🟢',
      'MEDIUM': '🟡',
      'HIGH': '🟠',
      'VERY_HIGH': '🔴'
    };
    return icons[level] || '⚪';
  }
}

export default new ComplexityService();
