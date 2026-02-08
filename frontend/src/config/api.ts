/**
 * API configuration
 * Centralized configuration for API endpoints
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  ENDPOINTS: {
    FILES: {
      TREE: '/api/files/tree',
      CONTENT: '/api/files/content',
      NAVIGATE_NEXT: '/api/files/navigate/next',
      NAVIGATE_PREVIOUS: '/api/files/navigate/previous',
    },
    ANALYSIS: {
      OUTLINE: '/api/analysis/outline',
      SEARCH: '/api/analysis/search',
      DEFINITION: '/api/analysis/definition',
      CALLERS: '/api/analysis/callers',
      TEST_REFERENCES: '/api/analysis/test-references',
    },
    STATISTICS: {
      FILE: '/api/statistics/file',
      PROJECT: '/api/statistics/project',
    },
  },
};

/**
 * Build a full API URL
 */
export function buildApiUrl(path: string, params?: Record<string, string | number>): string {
  const url = new URL(path, API_CONFIG.BASE_URL);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }
  
  return url.toString();
}

/**
 * Path display configuration
 */
export const PATH_CONFIG = {
  MAX_DEPTH_TO_SHOW: 3,
};

/**
 * Navigation history configuration
 */
export const NAVIGATION_CONFIG = {
  MAX_HISTORY_SIZE: 50,
};

/**
 * Truncate a file path for display
 */
export function truncatePath(fullPath: string, rootPath?: string, maxDepth: number = PATH_CONFIG.MAX_DEPTH_TO_SHOW): string {
  if (!fullPath) return '';
  
  // Try to make path relative to rootPath
  if (rootPath && fullPath.startsWith(rootPath)) {
    return fullPath.substring(rootPath.length + 1);
  }
  
  // Otherwise just show the last few parts
  const parts = fullPath.split(/[/\\]/);
  return parts.length > maxDepth 
    ? '.../' + parts.slice(-maxDepth).join('/')
    : fullPath;
}
