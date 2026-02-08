import { describe, it, expect, beforeEach } from 'vitest'
import { API_CONFIG, buildApiUrl, PATH_CONFIG, NAVIGATION_CONFIG, truncatePath } from '../api'

describe('api.ts', () => {
  describe('API_CONFIG', () => {
    it('has BASE_URL', () => {
      expect(API_CONFIG.BASE_URL).toBeDefined()
      expect(typeof API_CONFIG.BASE_URL).toBe('string')
    })

    it('has ENDPOINTS object', () => {
      expect(API_CONFIG.ENDPOINTS).toBeDefined()
      expect(API_CONFIG.ENDPOINTS.FILES).toBeDefined()
      expect(API_CONFIG.ENDPOINTS.ANALYSIS).toBeDefined()
      expect(API_CONFIG.ENDPOINTS.STATISTICS).toBeDefined()
    })

    it('has file endpoints', () => {
      expect(API_CONFIG.ENDPOINTS.FILES.TREE).toBe('/api/files/tree')
      expect(API_CONFIG.ENDPOINTS.FILES.CONTENT).toBe('/api/files/content')
      expect(API_CONFIG.ENDPOINTS.FILES.NAVIGATE_NEXT).toBe('/api/files/navigate/next')
      expect(API_CONFIG.ENDPOINTS.FILES.NAVIGATE_PREVIOUS).toBe('/api/files/navigate/previous')
    })

    it('has analysis endpoints', () => {
      expect(API_CONFIG.ENDPOINTS.ANALYSIS.OUTLINE).toBe('/api/analysis/outline')
      expect(API_CONFIG.ENDPOINTS.ANALYSIS.SEARCH).toBe('/api/analysis/search')
      expect(API_CONFIG.ENDPOINTS.ANALYSIS.DEFINITION).toBe('/api/analysis/definition')
      expect(API_CONFIG.ENDPOINTS.ANALYSIS.CALLERS).toBe('/api/analysis/callers')
      expect(API_CONFIG.ENDPOINTS.ANALYSIS.TEST_REFERENCES).toBe('/api/analysis/test-references')
    })

    it('has statistics endpoints', () => {
      expect(API_CONFIG.ENDPOINTS.STATISTICS.FILE).toBe('/api/statistics/file')
      expect(API_CONFIG.ENDPOINTS.STATISTICS.PROJECT).toBe('/api/statistics/project')
    })
  })

  describe('buildApiUrl', () => {
    it('builds URL without params', () => {
      const url = buildApiUrl('/api/test')
      expect(url).toContain('/api/test')
    })

    it('builds URL with params', () => {
      const url = buildApiUrl('/api/test', { foo: 'bar', count: 42 })
      expect(url).toContain('/api/test')
      expect(url).toContain('foo=bar')
      expect(url).toContain('count=42')
    })

    it('builds URL with string params', () => {
      const url = buildApiUrl('/api/files', { path: '/src/test.java' })
      expect(url).toContain('path')
    })

    it('builds URL with number params', () => {
      const url = buildApiUrl('/api/analysis', { line: 100 })
      expect(url).toContain('line=100')
    })

    it('handles empty params object', () => {
      const url = buildApiUrl('/api/test', {})
      expect(url).toContain('/api/test')
    })
  })

  describe('PATH_CONFIG', () => {
    it('has MAX_DEPTH_TO_SHOW', () => {
      expect(PATH_CONFIG.MAX_DEPTH_TO_SHOW).toBe(3)
    })
  })

  describe('NAVIGATION_CONFIG', () => {
    it('has MAX_HISTORY_SIZE', () => {
      expect(NAVIGATION_CONFIG.MAX_HISTORY_SIZE).toBe(50)
    })
  })

  describe('truncatePath', () => {
    it('returns empty string for empty path', () => {
      expect(truncatePath('')).toBe('')
    })

    it('returns full path when shorter than max depth', () => {
      expect(truncatePath('/a/b')).toBe('/a/b')
    })

    it('truncates long paths', () => {
      const result = truncatePath('/very/long/path/to/file.java')
      expect(result).toContain('...')
      expect(result).toContain('file.java')
    })

    it('makes path relative to rootPath', () => {
      const result = truncatePath('/project/src/main/file.java', '/project')
      expect(result).toBe('src/main/file.java')
    })

    it('returns full path if rootPath not in path', () => {
      const result = truncatePath('/other/path/file.java', '/project')
      expect(result).not.toContain('/project')
    })

    it('respects custom maxDepth', () => {
      const result = truncatePath('/a/b/c/d/e/f.java', undefined, 2)
      expect(result).toContain('...')
      expect(result).toContain('e/f.java')
    })

    it('handles Windows-style paths', () => {
      const result = truncatePath('C:\\Users\\test\\project\\file.java')
      expect(result).toBeTruthy()
    })

    it('handles paths at exact maxDepth', () => {
      const result = truncatePath('/a/b')
      // Should not add ... if exactly at max depth (3 parts including root)
      expect(result).toBe('/a/b')
    })

    it('truncates paths longer than maxDepth', () => {
      const result = truncatePath('/a/b/c/d')
      expect(result).toContain('...')
      expect(result).toContain('b/c/d')
    })
  })
})
