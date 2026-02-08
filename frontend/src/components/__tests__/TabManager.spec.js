import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import TabManager from '../TabManager.vue';
import { X } from 'lucide-vue-next';

describe('TabManager.vue', () => {
  let localStorageMock;

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };
    global.localStorage = localStorageMock;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const createFile = (name, path) => ({ name, path });

  describe('Tab Creation and Activation', () => {
    it('renders with no tabs initially', () => {
      const wrapper = mount(TabManager);
      expect(wrapper.text()).toContain('No files open');
    });

    it('creates a new tab when currentFile prop changes', async () => {
      const wrapper = mount(TabManager, {
        props: { currentFile: null }
      });

      await wrapper.setProps({ currentFile: createFile('test.js', '/src/test.js') });

      const tabs = wrapper.vm.tabs;
      expect(tabs).toHaveLength(1);
      expect(tabs[0].name).toBe('test.js');
      expect(tabs[0].path).toBe('/src/test.js');
    });

    it('activates existing tab instead of creating duplicate', async () => {
      const wrapper = mount(TabManager);
      const file = createFile('test.js', '/src/test.js');

      await wrapper.setProps({ currentFile: file });
      const firstTabId = wrapper.vm.activeTabId;

      await wrapper.setProps({ currentFile: createFile('other.js', '/src/other.js') });
      expect(wrapper.vm.tabs).toHaveLength(2);

      // Try to open first file again
      await wrapper.setProps({ currentFile: file });
      expect(wrapper.vm.tabs).toHaveLength(2); // Still 2 tabs
      expect(wrapper.vm.activeTabId).toBe(firstTabId); // First tab is active
    });

    it('emits select event when tab is created', async () => {
      const wrapper = mount(TabManager);
      await wrapper.setProps({ currentFile: createFile('test.js', '/src/test.js') });

      expect(wrapper.emitted('select')).toBeTruthy();
      expect(wrapper.emitted('select')[0][0].name).toBe('test.js');
    });

    it('enforces MAX_TABS limit', async () => {
      const wrapper = mount(TabManager);
      
      // Open 20 tabs (MAX_TABS)
      for (let i = 0; i < 20; i++) {
        await wrapper.setProps({ currentFile: createFile(`file${i}.js`, `/src/file${i}.js`) });
      }

      expect(wrapper.vm.tabs).toHaveLength(20);

      // Try to open one more tab
      await wrapper.setProps({ currentFile: createFile('file21.js', '/src/file21.js') });

      // Should still have 20 tabs, with LRU tab removed
      expect(wrapper.vm.tabs).toHaveLength(20);
      expect(wrapper.vm.tabs[wrapper.vm.tabs.length - 1].name).toBe('file21.js');
    });
  });

  describe('Tab Selection', () => {
    it('marks active tab with active class', async () => {
      const wrapper = mount(TabManager);
      await wrapper.setProps({ currentFile: createFile('test.js', '/src/test.js') });

      const tabElement = wrapper.find('.tab-item');
      expect(tabElement.classes()).toContain('active');
    });

    it('switches active tab when clicking another tab', async () => {
      const wrapper = mount(TabManager);
      await wrapper.setProps({ currentFile: createFile('file1.js', '/src/file1.js') });
      await wrapper.setProps({ currentFile: createFile('file2.js', '/src/file2.js') });

      const tabs = wrapper.findAll('.tab-item');
      expect(tabs).toHaveLength(2);

      // Click first tab
      await tabs[0].trigger('click');

      expect(wrapper.emitted('select')).toBeTruthy();
      expect(wrapper.vm.activeTabId).toBe(wrapper.vm.tabs[0].id);
      expect(tabs[0].classes()).toContain('active');
    });

    it('emits select event when switching tabs', async () => {
      const wrapper = mount(TabManager);
      await wrapper.setProps({ currentFile: createFile('file1.js', '/src/file1.js') });
      await wrapper.setProps({ currentFile: createFile('file2.js', '/src/file2.js') });

      wrapper.vm.selectTab(wrapper.vm.tabs[0]);

      const selectEvents = wrapper.emitted('select');
      expect(selectEvents.length).toBeGreaterThan(2);
    });
  });

  describe('Tab Closing', () => {
    it('closes tab when close button is clicked', async () => {
      const wrapper = mount(TabManager);
      await wrapper.setProps({ currentFile: createFile('test.js', '/src/test.js') });

      const closeButton = wrapper.findComponent(X).element.parentElement;
      await closeButton.click();

      expect(wrapper.vm.tabs).toHaveLength(0);
      expect(wrapper.text()).toContain('No files open');
    });

    it('activates previous tab when closing active tab', async () => {
      const wrapper = mount(TabManager);
      await wrapper.setProps({ currentFile: createFile('file1.js', '/src/file1.js') });
      await wrapper.setProps({ currentFile: createFile('file2.js', '/src/file2.js') });
      await wrapper.setProps({ currentFile: createFile('file3.js', '/src/file3.js') });

      const secondTabId = wrapper.vm.tabs[1].id;
      
      // Close the active (third) tab
      wrapper.vm.closeTab(wrapper.vm.tabs[2].id);

      // Second tab should now be active
      expect(wrapper.vm.activeTabId).toBe(secondTabId);
    });

    it('emits close event when last tab is closed', async () => {
      const wrapper = mount(TabManager);
      await wrapper.setProps({ currentFile: createFile('test.js', '/src/test.js') });

      const tabId = wrapper.vm.tabs[0].id;
      wrapper.vm.closeTab(tabId);

      expect(wrapper.emitted('close')).toBeTruthy();
      expect(wrapper.emitted('close')[0][0]).toBe(tabId);
    });

    it('stops event propagation when closing tab', async () => {
      const wrapper = mount(TabManager);
      await wrapper.setProps({ currentFile: createFile('test.js', '/src/test.js') });

      const mockEvent = { stopPropagation: vi.fn() };
      wrapper.vm.closeTab(wrapper.vm.tabs[0].id, mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('handles closing non-existent tab gracefully', () => {
      const wrapper = mount(TabManager);
      
      expect(() => {
        wrapper.vm.closeTab('non-existent-id');
      }).not.toThrow();
      
      expect(wrapper.vm.tabs).toHaveLength(0);
    });
  });

  describe('Drag and Drop', () => {
    it('handles drag start', async () => {
      const wrapper = mount(TabManager);
      await wrapper.setProps({ currentFile: createFile('file1.js', '/src/file1.js') });
      await wrapper.setProps({ currentFile: createFile('file2.js', '/src/file2.js') });

      const mockEvent = {
        dataTransfer: {
          effectAllowed: null
        }
      };

      wrapper.vm.handleDragStart(wrapper.vm.tabs[0].id, mockEvent);

      expect(wrapper.vm.draggedTabId).toBe(wrapper.vm.tabs[0].id);
      expect(mockEvent.dataTransfer.effectAllowed).toBe('move');
    });

    it('handles drag over with preventDefault', () => {
      const wrapper = mount(TabManager);
      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: { dropEffect: null }
      };

      wrapper.vm.handleDragOver(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.dataTransfer.dropEffect).toBe('move');
    });

    it('reorders tabs on drop', async () => {
      const wrapper = mount(TabManager);
      await wrapper.setProps({ currentFile: createFile('file1.js', '/src/file1.js') });
      await wrapper.setProps({ currentFile: createFile('file2.js', '/src/file2.js') });
      await wrapper.setProps({ currentFile: createFile('file3.js', '/src/file3.js') });

      const firstTabId = wrapper.vm.tabs[0].id;
      const secondTabId = wrapper.vm.tabs[1].id;
      const thirdTabId = wrapper.vm.tabs[2].id;

      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {}
      };

      // Simulate dragging first tab to third position
      wrapper.vm.handleDragStart(firstTabId, { dataTransfer: { effectAllowed: null } });
      wrapper.vm.handleDrop(thirdTabId, mockEvent);

      // First tab should now be at index 2, third tab at index 1
      expect(wrapper.vm.tabs[2].id).toBe(firstTabId);
      expect(wrapper.vm.tabs[0].id).toBe(secondTabId);
    });

    it('ignores drop on same tab', async () => {
      const wrapper = mount(TabManager);
      await wrapper.setProps({ currentFile: createFile('file1.js', '/src/file1.js') });

      const tabId = wrapper.vm.tabs[0].id;
      const mockEvent = {
        preventDefault: vi.fn()
      };

      wrapper.vm.handleDragStart(tabId, { dataTransfer: { effectAllowed: null } });
      wrapper.vm.handleDrop(tabId, mockEvent);

      // Tab order should not change
      expect(wrapper.vm.tabs).toHaveLength(1);
    });

    it('clears dragged tab on drag end', () => {
      const wrapper = mount(TabManager);
      wrapper.vm.draggedTabId = 'some-id';

      wrapper.vm.handleDragEnd();

      expect(wrapper.vm.draggedTabId).toBeNull();
    });
  });

  describe('Tab State Management', () => {
    it('updates tab state', async () => {
      const wrapper = mount(TabManager);
      await wrapper.setProps({ currentFile: createFile('test.js', '/src/test.js') });

      const tabId = wrapper.vm.tabs[0].id;
      wrapper.vm.updateTabState(tabId, { scrollPosition: 100 });

      expect(wrapper.vm.tabs[0].scrollPosition).toBe(100);
    });

    it('updates tab state with multiple properties', async () => {
      const wrapper = mount(TabManager);
      await wrapper.setProps({ currentFile: createFile('test.js', '/src/test.js') });

      const tabId = wrapper.vm.tabs[0].id;
      wrapper.vm.updateTabState(tabId, {
        scrollPosition: 200,
        detailOptions: { showComments: false }
      });

      expect(wrapper.vm.tabs[0].scrollPosition).toBe(200);
      expect(wrapper.vm.tabs[0].detailOptions).toEqual({ showComments: false });
    });

    it('handles updateTabState for non-existent tab', () => {
      const wrapper = mount(TabManager);
      
      expect(() => {
        wrapper.vm.updateTabState('non-existent', { scrollPosition: 100 });
      }).not.toThrow();
    });

    it('persists tab state with scroll position and detail options', async () => {
      const wrapper = mount(TabManager);
      await wrapper.setProps({ currentFile: createFile('test.js', '/src/test.js') });

      const tabId = wrapper.vm.tabs[0].id;
      const state = {
        scrollPosition: 500,
        detailOptions: {
          showComments: false,
          showImports: true,
          showPrivateMembers: false
        },
        isolatedSymbol: { name: 'myFunction', line: 42 }
      };
      
      wrapper.vm.updateTabState(tabId, state);
      await wrapper.vm.$nextTick();

      // Verify state is updated
      expect(wrapper.vm.tabs[0].scrollPosition).toBe(500);
      expect(wrapper.vm.tabs[0].detailOptions).toEqual(state.detailOptions);
      expect(wrapper.vm.tabs[0].isolatedSymbol).toEqual(state.isolatedSymbol);

      // Verify state is saved to localStorage
      const calls = localStorageMock.setItem.mock.calls;
      const lastCall = calls[calls.length - 1];
      const savedData = JSON.parse(lastCall[1]);
      expect(savedData.tabs[0].scrollPosition).toBe(500);
      expect(savedData.tabs[0].detailOptions).toEqual(state.detailOptions);
      expect(savedData.tabs[0].isolatedSymbol).toEqual(state.isolatedSymbol);
    });

    it('restores tab state from localStorage including scroll and detail options', () => {
      const savedTabs = {
        tabs: [
          {
            id: 'tab-1',
            name: 'file1.js',
            path: '/src/file1.js',
            scrollPosition: 350,
            detailOptions: {
              showComments: true,
              showImports: false
            },
            isolatedSymbol: null
          }
        ],
        activeTabId: 'tab-1'
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedTabs));

      const wrapper = mount(TabManager);

      expect(wrapper.vm.tabs[0].scrollPosition).toBe(350);
      expect(wrapper.vm.tabs[0].detailOptions).toEqual({
        showComments: true,
        showImports: false
      });
      expect(wrapper.vm.tabs[0].isolatedSymbol).toBeNull();
    });
  });

  describe('LocalStorage Persistence', () => {
    it('saves tabs to localStorage on changes', async () => {
      const wrapper = mount(TabManager);
      await wrapper.setProps({ currentFile: createFile('test.js', '/src/test.js') });

      // Wait for reactivity
      await wrapper.vm.$nextTick();

      expect(localStorageMock.setItem).toHaveBeenCalled();
      const calls = localStorageMock.setItem.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toBe('codecom-tabs');
      
      const savedData = JSON.parse(lastCall[1]);
      expect(savedData.tabs).toHaveLength(1);
      expect(savedData.tabs[0].name).toBe('test.js');
    });

    it('loads tabs from localStorage on mount', () => {
      const savedTabs = {
        tabs: [
          { id: 'tab-1', name: 'file1.js', path: '/src/file1.js' },
          { id: 'tab-2', name: 'file2.js', path: '/src/file2.js' }
        ],
        activeTabId: 'tab-1'
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedTabs));

      const wrapper = mount(TabManager);

      expect(wrapper.vm.tabs).toHaveLength(2);
      expect(wrapper.vm.tabs[0].name).toBe('file1.js');
      expect(wrapper.vm.activeTabId).toBe('tab-1');
    });

    it('handles corrupted localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const wrapper = mount(TabManager);

      expect(wrapper.vm.tabs).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load tabs:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('handles localStorage.setItem errors gracefully', async () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const wrapper = mount(TabManager);
      await wrapper.setProps({ currentFile: createFile('test.js', '/src/test.js') });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to save tabs:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Exposed Methods', () => {
    it('exposes addOrActivateTab method', async () => {
      const wrapper = mount(TabManager);
      
      expect(wrapper.vm.addOrActivateTab).toBeDefined();
      
      wrapper.vm.addOrActivateTab(createFile('test.js', '/src/test.js'));
      
      expect(wrapper.vm.tabs).toHaveLength(1);
    });

    it('exposes updateTabState method', () => {
      const wrapper = mount(TabManager);
      expect(wrapper.vm.updateTabState).toBeDefined();
    });

    it('exposes closeTab method', () => {
      const wrapper = mount(TabManager);
      expect(wrapper.vm.closeTab).toBeDefined();
    });

    it('exposes tabs reactive reference', () => {
      const wrapper = mount(TabManager);
      expect(wrapper.vm.tabs).toBeDefined();
      expect(Array.isArray(wrapper.vm.tabs)).toBe(true);
    });

    it('exposes activeTabId reactive reference', () => {
      const wrapper = mount(TabManager);
      expect(wrapper.vm.activeTabId).toBeDefined();
    });
  });

  describe('UI Rendering', () => {
    it('displays tab name', async () => {
      const wrapper = mount(TabManager);
      await wrapper.setProps({ currentFile: createFile('MyComponent.vue', '/src/MyComponent.vue') });

      expect(wrapper.text()).toContain('MyComponent.vue');
    });

    it('renders close button for each tab', async () => {
      const wrapper = mount(TabManager);
      await wrapper.setProps({ currentFile: createFile('file1.js', '/src/file1.js') });
      await wrapper.setProps({ currentFile: createFile('file2.js', '/src/file2.js') });

      const closeButtons = wrapper.findAllComponents(X);
      expect(closeButtons).toHaveLength(2);
    });

    it('truncates long file names', async () => {
      const wrapper = mount(TabManager);
      await wrapper.setProps({ 
        currentFile: createFile('VeryLongFileNameThatShouldBeTruncated.js', '/src/VeryLongFileNameThatShouldBeTruncated.js') 
      });

      const tabName = wrapper.find('.tab-name');
      expect(tabName.attributes('style')).toContain('max-width: 150px');
    });
  });
});
