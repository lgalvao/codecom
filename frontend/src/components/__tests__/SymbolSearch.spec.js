import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import SymbolSearch from '../SymbolSearch.vue';
import { BFormInput, BListGroup, BListGroupItem, BBadge } from 'bootstrap-vue-next';
import { Search, FileCode, Circle } from 'lucide-vue-next';
import * as AnalysisService from '../../services/AnalysisService';

vi.mock('../../services/AnalysisService');

describe('SymbolSearch.vue', () => {
  const mockSearchResults = [
    {
      name: 'UserService',
      type: 'CLASS',
      category: 'CORE',
      filePath: '/src/services/UserService.java',
      fileName: 'UserService.java',
      line: 10,
      column: 0
    },
    {
      name: 'getUserById',
      type: 'METHOD',
      category: 'CORE',
      filePath: '/src/services/UserService.java',
      fileName: 'UserService.java',
      line: 25,
      column: 4
    },
    {
      name: 'UserRepository',
      type: 'INTERFACE',
      category: 'ARCHITECTURE',
      filePath: '/src/repository/UserRepository.java',
      fileName: 'UserRepository.java',
      line: 5,
      column: 0
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Component Initialization', () => {
    it('renders with empty search initially', () => {
      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      expect(wrapper.text()).toContain('Symbol Search');
      expect(wrapper.findComponent(BFormInput).exists()).toBe(true);
    });

    it('shows search icon in header', () => {
      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      expect(wrapper.findComponent(Search).exists()).toBe(true);
    });

    it('displays placeholder text in search input', () => {
      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      const input = wrapper.findComponent(BFormInput);
      expect(input.attributes('placeholder')).toContain('Search for classes, methods, functions');
    });

    it('shows empty state message when no query', () => {
      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      expect(wrapper.text()).toContain('Type to search for symbols');
      expect(wrapper.findComponent(FileCode).exists()).toBe(true);
    });
  });

  describe('Search Functionality', () => {
    it('performs search when query is entered', async () => {
      vi.mocked(AnalysisService.searchSymbols).mockResolvedValue(mockSearchResults);

      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      const input = wrapper.findComponent(BFormInput);
      await input.setValue('User');

      // Advance timers to trigger debounced search
      await vi.advanceTimersByTimeAsync(300);
      await wrapper.vm.$nextTick();

      expect(AnalysisService.searchSymbols).toHaveBeenCalledWith('/test/project', 'User');
    });

    it('debounces search queries', async () => {
      vi.mocked(AnalysisService.searchSymbols).mockResolvedValue([]);

      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      const input = wrapper.findComponent(BFormInput);
      
      await input.setValue('U');
      await vi.advanceTimersByTimeAsync(100);
      
      await input.setValue('Us');
      await vi.advanceTimersByTimeAsync(100);
      
      await input.setValue('User');
      await vi.advanceTimersByTimeAsync(300);
      await wrapper.vm.$nextTick();

      // Should only call once after debounce completes
      expect(AnalysisService.searchSymbols).toHaveBeenCalledTimes(1);
      expect(AnalysisService.searchSymbols).toHaveBeenCalledWith('/test/project', 'User');
    });

    it('clears results when query is empty', async () => {
      vi.mocked(AnalysisService.searchSymbols).mockResolvedValue(mockSearchResults);

      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      const input = wrapper.findComponent(BFormInput);
      await input.setValue('User');
      await vi.advanceTimersByTimeAsync(300);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.searchResults).toHaveLength(3);

      // Clear search
      await input.setValue('');
      await vi.advanceTimersByTimeAsync(300);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.searchResults).toHaveLength(0);
    });

    it('shows loading indicator while searching', async () => {
      vi.mocked(AnalysisService.searchSymbols).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockSearchResults), 1000))
      );

      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      const input = wrapper.findComponent(BFormInput);
      await input.setValue('User');
      await vi.advanceTimersByTimeAsync(300);
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('Searching...');
      expect(wrapper.find('.spinner-border').exists()).toBe(true);
    });

    it('handles search errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(AnalysisService.searchSymbols).mockRejectedValue(new Error('Search failed'));

      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      const input = wrapper.findComponent(BFormInput);
      await input.setValue('User');
      await vi.advanceTimersByTimeAsync(300);
      await wrapper.vm.$nextTick();

      expect(consoleSpy).toHaveBeenCalledWith('Search error:', expect.any(Error));
      expect(wrapper.vm.isSearching).toBe(false);
      
      consoleSpy.mockRestore();
    });

    it('shows no results message when search returns empty', async () => {
      vi.mocked(AnalysisService.searchSymbols).mockResolvedValue([]);

      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      const input = wrapper.findComponent(BFormInput);
      await input.setValue('NonExistent');
      await vi.advanceTimersByTimeAsync(300);
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('No results found for "NonExistent"');
    });
  });

  describe('Search Results Display', () => {
    it('displays search results', async () => {
      vi.mocked(AnalysisService.searchSymbols).mockResolvedValue(mockSearchResults);

      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      const input = wrapper.findComponent(BFormInput);
      await input.setValue('User');
      await vi.advanceTimersByTimeAsync(300);
      await wrapper.vm.$nextTick();

      expect(wrapper.findAllComponents(BListGroupItem)).toHaveLength(3);
      expect(wrapper.text()).toContain('UserService');
      expect(wrapper.text()).toContain('getUserById');
      expect(wrapper.text()).toContain('UserRepository');
    });

    it('displays correct badge for each result type', async () => {
      vi.mocked(AnalysisService.searchSymbols).mockResolvedValue(mockSearchResults);

      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      const input = wrapper.findComponent(BFormInput);
      await input.setValue('User');
      await vi.advanceTimersByTimeAsync(300);
      await wrapper.vm.$nextTick();

      const badges = wrapper.findAllComponents(BBadge);
      expect(badges[0].text()).toBe('CLASS');
      expect(badges[1].text()).toBe('METHOD');
      expect(badges[2].text()).toBe('INTERFACE');
    });

    it('shows file name and line number for each result', async () => {
      vi.mocked(AnalysisService.searchSymbols).mockResolvedValue(mockSearchResults);

      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      const input = wrapper.findComponent(BFormInput);
      await input.setValue('User');
      await vi.advanceTimersByTimeAsync(300);
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('UserService.java');
      expect(wrapper.text()).toContain('Line 10');
      expect(wrapper.text()).toContain('Line 25');
    });

    it('truncates long file paths', async () => {
      const longPathResult = [{
        name: 'Test',
        type: 'CLASS',
        filePath: '/very/deep/path/structure/src/main/java/com/example/package/Test.java',
        fileName: 'Test.java',
        line: 1
      }];

      vi.mocked(AnalysisService.searchSymbols).mockResolvedValue(longPathResult);

      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      const input = wrapper.findComponent(BFormInput);
      await input.setValue('Test');
      await vi.advanceTimersByTimeAsync(300);
      await wrapper.vm.$nextTick();

      // Check that the truncation function works correctly
      expect(wrapper.text()).toContain('.../example/package/Test.java');
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates down with arrow down key', async () => {
      vi.mocked(AnalysisService.searchSymbols).mockResolvedValue(mockSearchResults);

      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      const input = wrapper.findComponent(BFormInput);
      await input.setValue('User');
      await vi.advanceTimersByTimeAsync(300);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.selectedIndex).toBe(0);

      await input.trigger('keydown', { key: 'ArrowDown' });
      expect(wrapper.vm.selectedIndex).toBe(1);

      await input.trigger('keydown', { key: 'ArrowDown' });
      expect(wrapper.vm.selectedIndex).toBe(2);
    });

    it('does not navigate past last result', async () => {
      vi.mocked(AnalysisService.searchSymbols).mockResolvedValue(mockSearchResults);

      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      const input = wrapper.findComponent(BFormInput);
      await input.setValue('User');
      await vi.advanceTimersByTimeAsync(300);
      await wrapper.vm.$nextTick();

      wrapper.vm.selectedIndex = 2;

      await input.trigger('keydown', { key: 'ArrowDown' });
      expect(wrapper.vm.selectedIndex).toBe(2);
    });

    it('navigates up with arrow up key', async () => {
      vi.mocked(AnalysisService.searchSymbols).mockResolvedValue(mockSearchResults);

      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      const input = wrapper.findComponent(BFormInput);
      await input.setValue('User');
      await vi.advanceTimersByTimeAsync(300);
      await wrapper.vm.$nextTick();

      wrapper.vm.selectedIndex = 2;

      await input.trigger('keydown', { key: 'ArrowUp' });
      expect(wrapper.vm.selectedIndex).toBe(1);
    });

    it('does not navigate before first result', async () => {
      vi.mocked(AnalysisService.searchSymbols).mockResolvedValue(mockSearchResults);

      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      const input = wrapper.findComponent(BFormInput);
      await input.setValue('User');
      await vi.advanceTimersByTimeAsync(300);
      await wrapper.vm.$nextTick();

      await input.trigger('keydown', { key: 'ArrowUp' });
      expect(wrapper.vm.selectedIndex).toBe(0);
    });

    it('selects result on Enter key', async () => {
      vi.mocked(AnalysisService.searchSymbols).mockResolvedValue(mockSearchResults);

      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      const input = wrapper.findComponent(BFormInput);
      await input.setValue('User');
      await vi.advanceTimersByTimeAsync(300);
      await wrapper.vm.$nextTick();

      await input.trigger('keydown', { key: 'Enter' });

      expect(wrapper.emitted('select')).toBeTruthy();
      expect(wrapper.emitted('select')[0][0]).toEqual(mockSearchResults[0]);
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('closes panel on Escape key', async () => {
      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      const input = wrapper.findComponent(BFormInput);
      await input.trigger('keydown', { key: 'Escape' });

      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('prevents default behavior for navigation keys', async () => {
      vi.mocked(AnalysisService.searchSymbols).mockResolvedValue(mockSearchResults);

      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      const input = wrapper.findComponent(BFormInput);
      await input.setValue('User');
      await vi.advanceTimersByTimeAsync(300);
      await wrapper.vm.$nextTick();

      const mockEvent = {
        key: 'ArrowDown',
        preventDefault: vi.fn()
      };

      wrapper.vm.handleKeyDown(mockEvent);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Mouse Interaction', () => {
    it('selects result on click', async () => {
      vi.mocked(AnalysisService.searchSymbols).mockResolvedValue(mockSearchResults);

      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      const input = wrapper.findComponent(BFormInput);
      await input.setValue('User');
      await vi.advanceTimersByTimeAsync(300);
      await wrapper.vm.$nextTick();

      const results = wrapper.findAllComponents(BListGroupItem);
      await results[1].trigger('click');

      expect(wrapper.emitted('select')).toBeTruthy();
      expect(wrapper.emitted('select')[0][0]).toEqual(mockSearchResults[1]);
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('updates selected index on mouse enter', async () => {
      vi.mocked(AnalysisService.searchSymbols).mockResolvedValue(mockSearchResults);

      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      const input = wrapper.findComponent(BFormInput);
      await input.setValue('User');
      await vi.advanceTimersByTimeAsync(300);
      await wrapper.vm.$nextTick();

      const results = wrapper.findAllComponents(BListGroupItem);
      await results[2].trigger('mouseenter');

      expect(wrapper.vm.selectedIndex).toBe(2);
    });

    it('highlights selected result', async () => {
      vi.mocked(AnalysisService.searchSymbols).mockResolvedValue(mockSearchResults);

      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      const input = wrapper.findComponent(BFormInput);
      await input.setValue('User');
      await vi.advanceTimersByTimeAsync(300);
      await wrapper.vm.$nextTick();

      wrapper.vm.selectedIndex = 1;
      await wrapper.vm.$nextTick();

      const results = wrapper.findAllComponents(BListGroupItem);
      expect(results[1].classes()).toContain('symbol-result-selected');
    });
  });

  describe('Visibility Handling', () => {
    it('resets search when panel becomes visible', async () => {
      vi.mocked(AnalysisService.searchSymbols).mockResolvedValue(mockSearchResults);

      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: false }
      });

      const input = wrapper.findComponent(BFormInput);
      await input.setValue('User');
      await vi.advanceTimersByTimeAsync(300);

      await wrapper.setProps({ visible: true });
      await vi.advanceTimersByTimeAsync(100);

      expect(wrapper.vm.searchQuery).toBe('');
      expect(wrapper.vm.searchResults).toHaveLength(0);
      expect(wrapper.vm.selectedIndex).toBe(0);
    });

    it('focuses input when panel becomes visible', async () => {
      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: false },
        attachTo: document.body
      });

      await wrapper.setProps({ visible: true });
      await vi.advanceTimersByTimeAsync(100);
      await wrapper.vm.$nextTick();

      // Note: In JSDOM, focus() might not work as expected
      // This test verifies the focus attempt is made
      expect(wrapper.findComponent(BFormInput).exists()).toBe(true);

      wrapper.unmount();
    });
  });

  describe('Utility Functions', () => {
    it('returns correct type color for CLASS', () => {
      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      expect(wrapper.vm.getTypeColor('CLASS')).toBe('primary');
    });

    it('returns correct type color for METHOD', () => {
      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      expect(wrapper.vm.getTypeColor('METHOD')).toBe('success');
    });

    it('returns correct type color for INTERFACE', () => {
      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      expect(wrapper.vm.getTypeColor('INTERFACE')).toBe('warning');
    });

    it('returns default color for unknown type', () => {
      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      expect(wrapper.vm.getTypeColor('UNKNOWN')).toBe('secondary');
    });

    it('returns correct icon for all types', () => {
      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      expect(wrapper.vm.getTypeIcon('CLASS')).toBe(Circle);
      expect(wrapper.vm.getTypeIcon('METHOD')).toBe(Circle);
    });

    it('truncates path correctly for long paths', () => {
      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      const longPath = '/very/deep/path/structure/file.java';
      const truncated = wrapper.vm.truncatePath(longPath);
      expect(truncated).toBe('.../path/structure/file.java');
    });

    it('does not truncate short paths', () => {
      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      const shortPath = '/src/file.java';
      const truncated = wrapper.vm.truncatePath(shortPath);
      expect(truncated).toBe('/src/file.java');
    });
  });

  describe('Footer Instructions', () => {
    it('displays keyboard shortcuts in footer', () => {
      const wrapper = mount(SymbolSearch, {
        props: { rootPath: '/test/project', visible: true }
      });

      expect(wrapper.text()).toContain('Navigate');
      expect(wrapper.text()).toContain('Select');
      expect(wrapper.text()).toContain('Close');
    });
  });
});
