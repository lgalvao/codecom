import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import PackageNavigation from '../PackageNavigation.vue';
import { ChevronLeft, ChevronRight, List } from 'lucide-vue-next';
import * as NavigationService from '../../services/NavigationService';

vi.mock('../../services/NavigationService');

describe('PackageNavigation.vue', () => {
  const mockFiles = [
    { name: 'FileA.java', path: '/src/FileA.java', directory: '/src' },
    { name: 'FileB.java', path: '/src/FileB.java', directory: '/src' },
    { name: 'FileC.java', path: '/src/FileC.java', directory: '/src' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('renders navigation controls', () => {
      const wrapper = mount(PackageNavigation, {
        props: { currentFile: null }
      });

      expect(wrapper.findComponent(ChevronLeft).exists()).toBe(true);
      expect(wrapper.findComponent(ChevronRight).exists()).toBe(true);
      expect(wrapper.findComponent(List).exists()).toBe(true);
    });

    it('loads package files when currentFile is set', async () => {
      vi.mocked(NavigationService.getPackageFiles).mockResolvedValue(mockFiles);

      const wrapper = mount(PackageNavigation, {
        props: { currentFile: { name: 'FileB.java', path: '/src/FileB.java' } }
      });

      await vi.waitFor(() => {
        expect(NavigationService.getPackageFiles).toHaveBeenCalledWith('/src/FileB.java');
      });
    });

    it('does not load package files when currentFile is null', () => {
      const wrapper = mount(PackageNavigation, {
        props: { currentFile: null }
      });

      expect(NavigationService.getPackageFiles).not.toHaveBeenCalled();
    });
  });

  describe('Navigation State', () => {
    it('computes hasNext correctly when not at last file', async () => {
      vi.mocked(NavigationService.getPackageFiles).mockResolvedValue(mockFiles);

      const wrapper = mount(PackageNavigation, {
        props: { currentFile: { name: 'FileA.java', path: '/src/FileA.java' } }
      });

      await vi.waitFor(() => {
        expect(wrapper.vm.packageFiles).toHaveLength(3);
      });

      expect(wrapper.vm.hasNext).toBe(true);
    });

    it('computes hasNext correctly when at last file', async () => {
      vi.mocked(NavigationService.getPackageFiles).mockResolvedValue(mockFiles);

      const wrapper = mount(PackageNavigation, {
        props: { currentFile: { name: 'FileC.java', path: '/src/FileC.java' } }
      });

      await vi.waitFor(() => {
        expect(wrapper.vm.packageFiles).toHaveLength(3);
      });

      expect(wrapper.vm.hasNext).toBe(false);
    });

    it('computes hasPrevious correctly when not at first file', async () => {
      vi.mocked(NavigationService.getPackageFiles).mockResolvedValue(mockFiles);

      const wrapper = mount(PackageNavigation, {
        props: { currentFile: { name: 'FileB.java', path: '/src/FileB.java' } }
      });

      await vi.waitFor(() => {
        expect(wrapper.vm.packageFiles).toHaveLength(3);
      });

      expect(wrapper.vm.hasPrevious).toBe(true);
    });

    it('computes hasPrevious correctly when at first file', async () => {
      vi.mocked(NavigationService.getPackageFiles).mockResolvedValue(mockFiles);

      const wrapper = mount(PackageNavigation, {
        props: { currentFile: { name: 'FileA.java', path: '/src/FileA.java' } }
      });

      await vi.waitFor(() => {
        expect(wrapper.vm.packageFiles).toHaveLength(3);
      });

      expect(wrapper.vm.hasPrevious).toBe(false);
    });

    it('computes currentIndex correctly', async () => {
      vi.mocked(NavigationService.getPackageFiles).mockResolvedValue(mockFiles);

      const wrapper = mount(PackageNavigation, {
        props: { currentFile: { name: 'FileB.java', path: '/src/FileB.java' } }
      });

      await vi.waitFor(() => {
        expect(wrapper.vm.packageFiles).toHaveLength(3);
      });

      expect(wrapper.vm.currentIndex).toBe(1);
    });
  });

  describe('Navigation Actions', () => {
    it('navigates to next file', async () => {
      vi.mocked(NavigationService.getPackageFiles).mockResolvedValue(mockFiles);
      vi.mocked(NavigationService.navigateToNextFile).mockResolvedValue(mockFiles[1]);

      const wrapper = mount(PackageNavigation, {
        props: { currentFile: { name: 'FileA.java', path: '/src/FileA.java' } }
      });

      await vi.waitFor(() => {
        expect(wrapper.vm.packageFiles).toHaveLength(3);
      });

      await wrapper.vm.navigateNext();

      expect(NavigationService.navigateToNextFile).toHaveBeenCalledWith('/src/FileA.java');
      expect(wrapper.emitted('navigate')).toBeTruthy();
      expect(wrapper.emitted('navigate')[0][0]).toEqual(mockFiles[1]);
    });

    it('navigates to previous file', async () => {
      vi.mocked(NavigationService.getPackageFiles).mockResolvedValue(mockFiles);
      vi.mocked(NavigationService.navigateToPreviousFile).mockResolvedValue(mockFiles[0]);

      const wrapper = mount(PackageNavigation, {
        props: { currentFile: { name: 'FileB.java', path: '/src/FileB.java' } }
      });

      await vi.waitFor(() => {
        expect(wrapper.vm.packageFiles).toHaveLength(3);
      });

      await wrapper.vm.navigatePrevious();

      expect(NavigationService.navigateToPreviousFile).toHaveBeenCalledWith('/src/FileB.java');
      expect(wrapper.emitted('navigate')).toBeTruthy();
      expect(wrapper.emitted('navigate')[0][0]).toEqual(mockFiles[0]);
    });

    it('does not navigate when at last file', async () => {
      vi.mocked(NavigationService.getPackageFiles).mockResolvedValue(mockFiles);

      const wrapper = mount(PackageNavigation, {
        props: { currentFile: { name: 'FileC.java', path: '/src/FileC.java' } }
      });

      await vi.waitFor(() => {
        expect(wrapper.vm.packageFiles).toHaveLength(3);
      });

      await wrapper.vm.navigateNext();

      expect(NavigationService.navigateToNextFile).not.toHaveBeenCalled();
      expect(wrapper.emitted('navigate')).toBeFalsy();
    });

    it('does not navigate when at first file', async () => {
      vi.mocked(NavigationService.getPackageFiles).mockResolvedValue(mockFiles);

      const wrapper = mount(PackageNavigation, {
        props: { currentFile: { name: 'FileA.java', path: '/src/FileA.java' } }
      });

      await vi.waitFor(() => {
        expect(wrapper.vm.packageFiles).toHaveLength(3);
      });

      await wrapper.vm.navigatePrevious();

      expect(NavigationService.navigateToPreviousFile).not.toHaveBeenCalled();
      expect(wrapper.emitted('navigate')).toBeFalsy();
    });

    it('handles null result from navigateToNextFile', async () => {
      vi.mocked(NavigationService.getPackageFiles).mockResolvedValue(mockFiles);
      vi.mocked(NavigationService.navigateToNextFile).mockResolvedValue(null);

      const wrapper = mount(PackageNavigation, {
        props: { currentFile: { name: 'FileA.java', path: '/src/FileA.java' } }
      });

      await vi.waitFor(() => {
        expect(wrapper.vm.packageFiles).toHaveLength(3);
      });

      await wrapper.vm.navigateNext();

      expect(wrapper.emitted('navigate')).toBeFalsy();
    });
  });

  describe('File List Display', () => {
    it('toggles file list visibility', async () => {
      vi.mocked(NavigationService.getPackageFiles).mockResolvedValue(mockFiles);

      const wrapper = mount(PackageNavigation, {
        props: { currentFile: { name: 'FileB.java', path: '/src/FileB.java' } }
      });

      await vi.waitFor(() => {
        expect(wrapper.vm.packageFiles).toHaveLength(3);
      });

      expect(wrapper.vm.showFileList).toBe(false);

      wrapper.vm.toggleFileList();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.showFileList).toBe(true);

      wrapper.vm.toggleFileList();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.showFileList).toBe(false);
    });

    it('displays file list when opened', async () => {
      vi.mocked(NavigationService.getPackageFiles).mockResolvedValue(mockFiles);

      const wrapper = mount(PackageNavigation, {
        props: { currentFile: { name: 'FileB.java', path: '/src/FileB.java' } }
      });

      await vi.waitFor(() => {
        expect(wrapper.vm.packageFiles).toHaveLength(3);
      });

      wrapper.vm.showFileList = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.file-list-dropdown').exists()).toBe(true);
      expect(wrapper.findAll('.file-item')).toHaveLength(3);
    });

    it('displays current file index', async () => {
      vi.mocked(NavigationService.getPackageFiles).mockResolvedValue(mockFiles);

      const wrapper = mount(PackageNavigation, {
        props: { currentFile: { name: 'FileB.java', path: '/src/FileB.java' } }
      });

      await vi.waitFor(() => {
        expect(wrapper.vm.packageFiles).toHaveLength(3);
      });

      expect(wrapper.text()).toContain('2/3');
    });

    it('highlights active file in list', async () => {
      vi.mocked(NavigationService.getPackageFiles).mockResolvedValue(mockFiles);

      const wrapper = mount(PackageNavigation, {
        props: { currentFile: { name: 'FileB.java', path: '/src/FileB.java' } }
      });

      await vi.waitFor(() => {
        expect(wrapper.vm.packageFiles).toHaveLength(3);
      });

      wrapper.vm.showFileList = true;
      await wrapper.vm.$nextTick();

      const fileItems = wrapper.findAll('.file-item');
      expect(fileItems[1].classes()).toContain('active');
    });

    it('selects file from list', async () => {
      vi.mocked(NavigationService.getPackageFiles).mockResolvedValue(mockFiles);

      const wrapper = mount(PackageNavigation, {
        props: { currentFile: { name: 'FileB.java', path: '/src/FileB.java' } }
      });

      await vi.waitFor(() => {
        expect(wrapper.vm.packageFiles).toHaveLength(3);
      });

      wrapper.vm.showFileList = true;
      await wrapper.vm.$nextTick();

      await wrapper.vm.selectFile(mockFiles[2]);

      expect(wrapper.emitted('navigate')).toBeTruthy();
      expect(wrapper.emitted('navigate')[0][0]).toEqual(mockFiles[2]);
      expect(wrapper.vm.showFileList).toBe(false);
    });
  });

  describe('Button States', () => {
    it('disables previous button when at first file', async () => {
      vi.mocked(NavigationService.getPackageFiles).mockResolvedValue(mockFiles);

      const wrapper = mount(PackageNavigation, {
        props: { currentFile: { name: 'FileA.java', path: '/src/FileA.java' } }
      });

      await vi.waitFor(() => {
        expect(wrapper.vm.packageFiles).toHaveLength(3);
      });

      const prevButton = wrapper.findAll('button')[0];
      expect(prevButton.attributes('disabled')).toBeDefined();
    });

    it('disables next button when at last file', async () => {
      vi.mocked(NavigationService.getPackageFiles).mockResolvedValue(mockFiles);

      const wrapper = mount(PackageNavigation, {
        props: { currentFile: { name: 'FileC.java', path: '/src/FileC.java' } }
      });

      await vi.waitFor(() => {
        expect(wrapper.vm.packageFiles).toHaveLength(3);
      });

      const nextButton = wrapper.findAll('button')[2];
      expect(nextButton.attributes('disabled')).toBeDefined();
    });

    it('enables both buttons when in middle of file list', async () => {
      vi.mocked(NavigationService.getPackageFiles).mockResolvedValue(mockFiles);

      const wrapper = mount(PackageNavigation, {
        props: { currentFile: { name: 'FileB.java', path: '/src/FileB.java' } }
      });

      await vi.waitFor(() => {
        expect(wrapper.vm.packageFiles).toHaveLength(3);
      });

      const buttons = wrapper.findAll('button');
      expect(buttons[0].attributes('disabled')).toBeUndefined();
      expect(buttons[2].attributes('disabled')).toBeUndefined();
    });

    it('disables buttons when loading', async () => {
      vi.mocked(NavigationService.getPackageFiles).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockFiles), 1000))
      );

      const wrapper = mount(PackageNavigation, {
        props: { currentFile: { name: 'FileB.java', path: '/src/FileB.java' } }
      });

      expect(wrapper.vm.isLoading).toBe(true);

      const buttons = wrapper.findAll('button');
      buttons.forEach(button => {
        expect(button.attributes('disabled')).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles errors when loading package files', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(NavigationService.getPackageFiles).mockRejectedValue(new Error('Load error'));

      const wrapper = mount(PackageNavigation, {
        props: { currentFile: { name: 'FileB.java', path: '/src/FileB.java' } }
      });

      await vi.waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error loading package files:', expect.any(Error));
      });

      expect(wrapper.vm.isLoading).toBe(false);
      
      consoleSpy.mockRestore();
    });
  });
});
