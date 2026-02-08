import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import CodeStatistics from '../CodeStatistics.vue';
import * as StatisticsService from '../../services/StatisticsService';

// Mock the statistics service
vi.mock('../../services/StatisticsService', () => ({
  getFileStatistics: vi.fn(),
  getDirectoryStatistics: vi.fn()
}));

describe('CodeStatistics.vue', () => {
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

  it('renders component with no statistics initially', () => {
    const wrapper = mount(CodeStatistics, {
      props: {
        path: '/test/file.java'
      }
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('loads file statistics when path is provided', async () => {
    vi.mocked(StatisticsService.getFileStatistics).mockResolvedValue(mockFileStats);

    const wrapper = mount(CodeStatistics, {
      props: {
        path: '/test/Sample.java',
        isDirectory: false
      }
    });

    await wrapper.vm.loadStatistics();
    await wrapper.vm.$nextTick();

    expect(StatisticsService.getFileStatistics).toHaveBeenCalledWith('/test/Sample.java');
    expect(wrapper.vm.statistics).toEqual(mockFileStats);
  });

  it('loads directory statistics when isDirectory is true', async () => {
    vi.mocked(StatisticsService.getDirectoryStatistics).mockResolvedValue(mockDirStats);

    const wrapper = mount(CodeStatistics, {
      props: {
        path: '/test/project',
        isDirectory: true
      }
    });

    await wrapper.vm.loadStatistics();
    await wrapper.vm.$nextTick();

    expect(StatisticsService.getDirectoryStatistics).toHaveBeenCalledWith('/test/project');
    expect(wrapper.vm.statistics).toEqual(mockDirStats);
  });

  it('displays loading state while fetching statistics', async () => {
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(StatisticsService.getFileStatistics).mockReturnValue(promise);

    const wrapper = mount(CodeStatistics, {
      props: {
        path: '/test/file.java'
      }
    });

    wrapper.vm.loadStatistics();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.loading).toBe(true);
    expect(wrapper.find('.spinner-border').exists()).toBe(true);

    resolvePromise(mockFileStats);
    await wrapper.vm.$nextTick();
    await promise;

    expect(wrapper.vm.loading).toBe(false);
  });

  it('handles error when loading statistics fails', async () => {
    const error = new Error('Failed to fetch');
    vi.mocked(StatisticsService.getFileStatistics).mockRejectedValue(error);

    const wrapper = mount(CodeStatistics, {
      props: {
        path: '/test/file.java'
      }
    });

    await wrapper.vm.loadStatistics();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.error).toBe('Failed to fetch');
  });

  it('calculates totalStructures correctly', async () => {
    vi.mocked(StatisticsService.getFileStatistics).mockResolvedValue(mockFileStats);

    const wrapper = mount(CodeStatistics, {
      props: {
        path: '/test/file.java'
      }
    });

    await wrapper.vm.loadStatistics();
    await wrapper.vm.$nextTick();

    // classCount=2 + interfaceCount=1 + recordCount=0 = 3
    expect(wrapper.vm.totalStructures).toBe(3);
  });

  it('calculates code percentage correctly', async () => {
    vi.mocked(StatisticsService.getFileStatistics).mockResolvedValue(mockFileStats);

    const wrapper = mount(CodeStatistics, {
      props: {
        path: '/test/file.java'
      }
    });

    await wrapper.vm.loadStatistics();
    await wrapper.vm.$nextTick();

    // 75 code lines / 100 total lines = 75%
    expect(wrapper.vm.codePercentage).toBe(75);
  });

  it('calculates comment percentage correctly', async () => {
    vi.mocked(StatisticsService.getFileStatistics).mockResolvedValue(mockFileStats);

    const wrapper = mount(CodeStatistics, {
      props: {
        path: '/test/file.java'
      }
    });

    await wrapper.vm.loadStatistics();
    await wrapper.vm.$nextTick();

    // 15 comment lines / 100 total lines = 15%
    expect(wrapper.vm.commentPercentage).toBe(15);
  });

  it('handles zero totalLines for percentage calculations', async () => {
    const emptyStats = { ...mockFileStats, totalLines: 0, codeLines: 0, commentLines: 0 };
    vi.mocked(StatisticsService.getFileStatistics).mockResolvedValue(emptyStats);

    const wrapper = mount(CodeStatistics, {
      props: {
        path: '/test/empty.java'
      }
    });

    await wrapper.vm.loadStatistics();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.codePercentage).toBe(0);
    expect(wrapper.vm.commentPercentage).toBe(0);
  });

  it('does not load statistics if path is not provided', async () => {
    const wrapper = mount(CodeStatistics, {
      props: {
        path: ''
      }
    });

    await wrapper.vm.loadStatistics();

    expect(StatisticsService.getFileStatistics).not.toHaveBeenCalled();
    expect(StatisticsService.getDirectoryStatistics).not.toHaveBeenCalled();
  });

  it('exposes loadStatistics method', () => {
    const wrapper = mount(CodeStatistics, {
      props: {
        path: '/test/file.java'
      }
    });

    expect(wrapper.vm.loadStatistics).toBeDefined();
    expect(typeof wrapper.vm.loadStatistics).toBe('function');
  });
});
