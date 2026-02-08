import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { getFileStatistics, getDirectoryStatistics } from '../StatisticsService';

vi.mock('axios');

describe('StatisticsService', () => {
  const mockFileStats = {
    totalLines: 100,
    codeLines: 75,
    commentLines: 15,
    blankLines: 10,
    methodCount: 5,
    classCount: 2,
    interfaceCount: 1,
    recordCount: 0,
    packageCount: 1
  };

  const mockDirStats = {
    totalLines: 500,
    codeLines: 380,
    commentLines: 75,
    blankLines: 45,
    methodCount: 25,
    classCount: 8,
    interfaceCount: 3,
    recordCount: 1,
    packageCount: 5
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFileStatistics', () => {
    it('should fetch file statistics from API', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockFileStats });

      const result = await getFileStatistics('/test/Sample.java');

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/file'),
        { params: { path: '/test/Sample.java' } }
      );
      expect(result).toEqual(mockFileStats);
    });

    it('should throw error when API call fails', async () => {
      vi.mocked(axios.get).mockRejectedValue(new Error('Network error'));

      await expect(getFileStatistics('/test/file.java')).rejects.toThrow('Network error');
    });

    it('should handle empty path', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockFileStats });

      await getFileStatistics('');

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/file'),
        { params: { path: '' } }
      );
    });
  });

  describe('getDirectoryStatistics', () => {
    it('should fetch directory statistics from API', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockDirStats });

      const result = await getDirectoryStatistics('/test/project');

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/directory'),
        { params: { path: '/test/project' } }
      );
      expect(result).toEqual(mockDirStats);
    });

    it('should throw error when API call fails', async () => {
      vi.mocked(axios.get).mockRejectedValue(new Error('Directory not found'));

      await expect(getDirectoryStatistics('/invalid/path')).rejects.toThrow('Directory not found');
    });

    it('should return statistics for root directory', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockDirStats });

      const result = await getDirectoryStatistics('/');

      expect(result).toEqual(mockDirStats);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/directory'),
        { params: { path: '/' } }
      );
    });
  });
});
