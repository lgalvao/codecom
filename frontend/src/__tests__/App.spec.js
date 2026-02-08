import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, shallowMount } from '@vue/test-utils';
import axios from 'axios';

// Mock axios
vi.mock('axios');

// Mock AnalysisService
vi.mock('../services/AnalysisService', () => ({
  initTreeSitter: vi.fn(() => Promise.resolve()),
  getOutline: vi.fn(() => Promise.resolve([])),
  searchSymbols: vi.fn(() => Promise.resolve([]))
}));

// Import after mocks are defined
import App from '../App.vue';
import * as AnalysisService from '../services/AnalysisService';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
    clear: vi.fn(() => { store = {}; })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock Shiki
vi.mock('shiki', () => ({
  createHighlighter: vi.fn(() => Promise.resolve({
    codeToHtml: vi.fn(() => '<pre>highlighted code</pre>'),
    getLoadedLanguages: vi.fn(() => []),
    loadLanguage: vi.fn(() => Promise.resolve()),
  }))
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('App.vue', () => {
  const mockTree = { 
    name: 'root', 
    isDirectory: true, 
    path: '/',
    children: [
      { name: 'src', isDirectory: true, path: '/src', children: [] }
    ] 
  };

  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/files/tree')) {
        return Promise.resolve({ data: mockTree });
      }
      return Promise.resolve({ data: {} });
    });
  });

  it('renders application title', () => {
    const wrapper = shallowMount(App);
    expect(wrapper.text()).toContain('CodeCom');
  });

  it('fetches file tree on mount', async () => {
    mount(App);
    // Wait for the next tick for axios to be called in onMounted
    await vi.waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/files/tree'));
    });
  });

  it('toggles theme correctly', async () => {
    const wrapper = mount(App);
    const initialTheme = wrapper.vm.theme;
    
    // Find theme toggle button (Sun/Moon icon wrapper)
    const themeBtn = wrapper.find('button.p-0');
    await themeBtn.trigger('click');
    
    expect(wrapper.vm.theme).not.toBe(initialTheme);
    expect(document.documentElement.dataset.bsTheme).toBe(wrapper.vm.theme);
  });

  it('handles file selection correctly', async () => {
    const wrapper = shallowMount(App);
    const mockFile = { name: 'test.js', path: '/src/test.js', isDirectory: false };
    
    wrapper.vm.tabManager = {
      addOrActivateTab: vi.fn()
    };
    
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/files/content')) return Promise.resolve({ data: 'const x = 1;' });
      if (url.includes('/api/analysis/outline')) return Promise.resolve({ data: [{ name: 'x', type: 'VAR', line: 1 }] });
      return Promise.resolve({ data: {} });
    });

    await wrapper.vm.handleFileSelect(mockFile);
    
    expect(wrapper.vm.selectedFile).toEqual(mockFile);
    expect(wrapper.vm.fileContent).toBe('const x = 1;');
  });

  it('loads theme from localStorage on mount', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    
    const wrapper = shallowMount(App);
    
    expect(wrapper.vm.theme).toBe('dark');
  });

  it('saves theme to localStorage on change', async () => {
    const wrapper = shallowMount(App);
    
    wrapper.vm.toggleTheme();
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', wrapper.vm.theme);
  });

  it('toggles stats panel', async () => {
    const wrapper = shallowMount(App);
    const initialVisibility = wrapper.vm.showStatsPanel;
    
    wrapper.vm.toggleStatsPanel();
    
    expect(wrapper.vm.showStatsPanel).toBe(!initialVisibility);
  });

  it('toggles detail panel', async () => {
    const wrapper = shallowMount(App);
    const initialVisibility = wrapper.vm.showDetailPanel;
    
    wrapper.vm.toggleDetailPanel();
    
    expect(wrapper.vm.showDetailPanel).toBe(!initialVisibility);
  });

  it('handles symbol selection from outline', async () => {
    const wrapper = shallowMount(App);
    
    const mockLine = {
      scrollIntoView: vi.fn(),
      classList: {
        add: vi.fn(),
        remove: vi.fn()
      }
    };
    
    vi.spyOn(document, 'querySelector').mockReturnValue({
      querySelectorAll: vi.fn(() => [mockLine, mockLine])
    });
    
    const mockSymbol = {
      name: 'TestClass',
      line: 2
    };

    wrapper.vm.handleSymbolSelect(mockSymbol);
    
    expect(mockLine.scrollIntoView).toHaveBeenCalled();
  });

  it('handles search result selection', async () => {
    const wrapper = shallowMount(App);
    const mockSymbol = {
      name: 'TestClass',
      filePath: '/src/TestClass.java',
      fileName: 'TestClass.java',
      line: 10
    };

    wrapper.vm.tabManager = {
      addOrActivateTab: vi.fn()
    };

    axios.get.mockImplementation((url) => {
      if (url.includes('/api/files/content')) return Promise.resolve({ data: 'class TestClass {}' });
      if (url.includes('/api/analysis/outline')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: {} });
    });

    await wrapper.vm.handleSearchSelect(mockSymbol);
    
    expect(wrapper.vm.selectedFile.path).toBe('/src/TestClass.java');
    expect(wrapper.vm.showSearchPanel).toBe(false);
  });

  it('handles detail options change', async () => {
    const wrapper = shallowMount(App);
    const newOptions = { showComments: false, publicOnly: true };
    
    wrapper.vm.handleDetailChange(newOptions);
    
    expect(wrapper.vm.detailOptions).toEqual(newOptions);
  });

  it('handles directory click', async () => {
    const wrapper = shallowMount(App);
    const mockDir = { name: 'src', path: '/src', isDirectory: true };
    
    wrapper.vm.tabManager = {
      addOrActivateTab: vi.fn()
    };
    
    await wrapper.vm.handleFileSelect(mockDir);
    
    // Should update tab manager even for directories
    expect(wrapper.vm.selectedFile).toEqual(mockDir);
  });
});
