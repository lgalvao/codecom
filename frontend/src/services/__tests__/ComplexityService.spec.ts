import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import ComplexityService, { FileComplexity } from '../ComplexityService';

vi.mock('axios');

describe('ComplexityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProjectComplexity', () => {
    it('should fetch complexity for all files', async () => {
      const mockComplexity: FileComplexity[] = [
        {
          filePath: '/test/File1.java',
          cyclomaticComplexity: 5,
          linesOfCode: 100,
          numberOfMethods: 3,
          complexityScore: 0.2,
          complexityLevel: 'LOW'
        },
        {
          filePath: '/test/File2.java',
          cyclomaticComplexity: 15,
          linesOfCode: 300,
          numberOfMethods: 10,
          complexityScore: 0.6,
          complexityLevel: 'HIGH'
        }
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: mockComplexity });

      const result = await ComplexityService.getProjectComplexity('/test');

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/analysis/complexity',
        { params: { path: '/test' } }
      );
      expect(result).toEqual(mockComplexity);
    });
  });

  describe('getFileComplexity', () => {
    it('should fetch complexity for a single file', async () => {
      const mockComplexity: FileComplexity = {
        filePath: '/test/File.java',
        cyclomaticComplexity: 10,
        linesOfCode: 200,
        numberOfMethods: 5,
        complexityScore: 0.4,
        complexityLevel: 'MEDIUM'
      };

      vi.mocked(axios.get).mockResolvedValue({ data: mockComplexity });

      const result = await ComplexityService.getFileComplexity('/test/File.java');

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/analysis/complexity/file',
        { params: { path: '/test/File.java' } }
      );
      expect(result).toEqual(mockComplexity);
    });
  });

  describe('getHeatmapColor', () => {
    it('should return green for low complexity', () => {
      const color = ComplexityService.getHeatmapColor(0.2, 'light');
      expect(color).toBe('#22c55e');
    });

    it('should return yellow for medium complexity', () => {
      const color = ComplexityService.getHeatmapColor(0.4, 'light');
      expect(color).toBe('#eab308');
    });

    it('should return orange for high complexity', () => {
      const color = ComplexityService.getHeatmapColor(0.6, 'light');
      expect(color).toBe('#f97316');
    });

    it('should return red for very high complexity', () => {
      const color = ComplexityService.getHeatmapColor(0.9, 'light');
      expect(color).toBe('#ef4444');
    });

    it('should return darker colors for dark theme', () => {
      const lightColor = ComplexityService.getHeatmapColor(0.2, 'light');
      const darkColor = ComplexityService.getHeatmapColor(0.2, 'dark');
      expect(lightColor).not.toBe(darkColor);
    });
  });

  describe('getComplexityIcon', () => {
    it('should return correct icons for complexity levels', () => {
      expect(ComplexityService.getComplexityIcon('LOW')).toBe('🟢');
      expect(ComplexityService.getComplexityIcon('MEDIUM')).toBe('🟡');
      expect(ComplexityService.getComplexityIcon('HIGH')).toBe('🟠');
      expect(ComplexityService.getComplexityIcon('VERY_HIGH')).toBe('🔴');
    });

    it('should return default icon for unknown level', () => {
      expect(ComplexityService.getComplexityIcon('UNKNOWN')).toBe('⚪');
    });
  });
});
