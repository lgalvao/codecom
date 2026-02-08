import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ComplexityHeatmap from '../ComplexityHeatmap.vue';
import ComplexityService from '../../services/ComplexityService';

vi.mock('../../services/ComplexityService');

describe('ComplexityHeatmap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render header', () => {
    vi.mocked(ComplexityService.getProjectComplexity).mockResolvedValue([]);
    
    const wrapper = mount(ComplexityHeatmap, {
      props: { projectPath: '/test' }
    });
    
    expect(wrapper.find('h5').text()).toBe('Complexity Heatmap');
    expect(wrapper.find('button').text()).toContain('Refresh');
  });

  it('should load complexity data on mount', async () => {
    const mockData = [
      {
        filePath: '/test/File1.java',
        cyclomaticComplexity: 5,
        linesOfCode: 100,
        numberOfMethods: 3,
        complexityScore: 0.2,
        complexityLevel: 'LOW' as const
      }
    ];

    vi.mocked(ComplexityService.getProjectComplexity).mockResolvedValue(mockData);

    mount(ComplexityHeatmap, {
      props: { projectPath: '/test' }
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(ComplexityService.getProjectComplexity).toHaveBeenCalledWith('/test');
  });

  it('should display complexity data', async () => {
    const mockData = [
      {
        filePath: '/test/File1.java',
        cyclomaticComplexity: 5,
        linesOfCode: 100,
        numberOfMethods: 3,
        complexityScore: 0.2,
        complexityLevel: 'LOW' as const
      },
      {
        filePath: '/test/File2.java',
        cyclomaticComplexity: 15,
        linesOfCode: 300,
        numberOfMethods: 10,
        complexityScore: 0.6,
        complexityLevel: 'HIGH' as const
      }
    ];

    vi.mocked(ComplexityService.getProjectComplexity).mockResolvedValue(mockData);

    const wrapper = mount(ComplexityHeatmap, {
      props: { projectPath: '/test' }
    });

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('File1.java');
    expect(wrapper.text()).toContain('File2.java');
    expect(wrapper.text()).toContain('CC: 5');
    expect(wrapper.text()).toContain('CC: 15');
  });

  it('should sort files by complexity score', async () => {
    const mockData = [
      {
        filePath: '/test/Low.java',
        cyclomaticComplexity: 2,
        linesOfCode: 50,
        numberOfMethods: 1,
        complexityScore: 0.1,
        complexityLevel: 'LOW' as const
      },
      {
        filePath: '/test/High.java',
        cyclomaticComplexity: 20,
        linesOfCode: 400,
        numberOfMethods: 15,
        complexityScore: 0.8,
        complexityLevel: 'VERY_HIGH' as const
      },
      {
        filePath: '/test/Medium.java',
        cyclomaticComplexity: 10,
        linesOfCode: 200,
        numberOfMethods: 5,
        complexityScore: 0.4,
        complexityLevel: 'MEDIUM' as const
      }
    ];

    vi.mocked(ComplexityService.getProjectComplexity).mockResolvedValue(mockData);

    const wrapper = mount(ComplexityHeatmap, {
      props: { projectPath: '/test' }
    });

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    const fileItems = wrapper.findAll('.file-item');
    expect(fileItems).toHaveLength(3);
    // Should be sorted: High (0.8), Medium (0.4), Low (0.1)
    expect(fileItems[0].text()).toContain('High.java');
    expect(fileItems[2].text()).toContain('Low.java');
  });

  it('should emit file-selected event when clicking file', async () => {
    const mockData = [
      {
        filePath: '/test/File.java',
        cyclomaticComplexity: 5,
        linesOfCode: 100,
        numberOfMethods: 3,
        complexityScore: 0.2,
        complexityLevel: 'LOW' as const
      }
    ];

    vi.mocked(ComplexityService.getProjectComplexity).mockResolvedValue(mockData);

    const wrapper = mount(ComplexityHeatmap, {
      props: { projectPath: '/test' }
    });

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    await wrapper.find('.file-item').trigger('click');

    expect(wrapper.emitted('file-selected')).toBeTruthy();
    expect(wrapper.emitted('file-selected')![0]).toEqual(['/test/File.java']);
  });

  it('should display summary statistics', async () => {
    const mockData = [
      {
        filePath: '/test/File1.java',
        cyclomaticComplexity: 5,
        linesOfCode: 100,
        numberOfMethods: 3,
        complexityScore: 0.2,
        complexityLevel: 'LOW' as const
      },
      {
        filePath: '/test/File2.java',
        cyclomaticComplexity: 15,
        linesOfCode: 300,
        numberOfMethods: 10,
        complexityScore: 0.8,
        complexityLevel: 'VERY_HIGH' as const
      }
    ];

    vi.mocked(ComplexityService.getProjectComplexity).mockResolvedValue(mockData);

    const wrapper = mount(ComplexityHeatmap, {
      props: { projectPath: '/test' }
    });

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Total Files:');
    expect(wrapper.text()).toContain('2');
    expect(wrapper.text()).toContain('Avg Complexity:');
    expect(wrapper.text()).toContain('High Complexity:');
    expect(wrapper.text()).toContain('1'); // One HIGH/VERY_HIGH file
  });

  it('should show error message on load failure', async () => {
    vi.mocked(ComplexityService.getProjectComplexity).mockRejectedValue(
      new Error('Network error')
    );

    const wrapper = mount(ComplexityHeatmap, {
      props: { projectPath: '/test' }
    });

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.alert-danger').exists()).toBe(true);
    expect(wrapper.text()).toContain('Network error');
  });

  it('should refresh data when clicking refresh button', async () => {
    const mockData = [
      {
        filePath: '/test/File.java',
        cyclomaticComplexity: 5,
        linesOfCode: 100,
        numberOfMethods: 3,
        complexityScore: 0.2,
        complexityLevel: 'LOW' as const
      }
    ];

    vi.mocked(ComplexityService.getProjectComplexity).mockResolvedValue(mockData);

    const wrapper = mount(ComplexityHeatmap, {
      props: { projectPath: '/test' }
    });

    await new Promise(resolve => setTimeout(resolve, 100));
    
    vi.clearAllMocks();
    await wrapper.find('button').trigger('click');

    expect(ComplexityService.getProjectComplexity).toHaveBeenCalledWith('/test');
  });

  it('should render legend with all complexity levels', async () => {
    const mockData = [
      {
        filePath: '/test/File.java',
        cyclomaticComplexity: 5,
        linesOfCode: 100,
        numberOfMethods: 3,
        complexityScore: 0.2,
        complexityLevel: 'LOW' as const
      }
    ];
    
    vi.mocked(ComplexityService.getProjectComplexity).mockResolvedValue(mockData);

    const wrapper = mount(ComplexityHeatmap, {
      props: { projectPath: '/test' }
    });

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Low (< 25%)');
    expect(wrapper.text()).toContain('Medium (25-50%)');
    expect(wrapper.text()).toContain('High (50-75%)');
    expect(wrapper.text()).toContain('Very High (> 75%)');
  });
});
