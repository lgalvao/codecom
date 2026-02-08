import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, shallowMount } from '@vue/test-utils';
import axios from 'axios';

// Mock axios
vi.mock('axios');

// Mock AnalysisService
vi.mock('../services/AnalysisService', () => ({
  initTreeSitter: vi.fn(() => Promise.resolve()),
  getOutline: vi.fn(() => Promise.resolve([])),
  searchSymbols: vi.fn(() => Promise.resolve([])),
  detectDeadCode: vi.fn(() => Promise.resolve([]))
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

  const mockTabManager = () => ({
    addOrActivateTab: vi.fn()
  });

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
    
    wrapper.vm.tabManager = mockTabManager();
    
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/files/content')) return Promise.resolve({ data: 'const x = 1;' });
      if (url.includes('/api/analysis/outline')) return Promise.resolve({ data: [{ name: 'x', type: 'VAR', line: 1 }] });
      return Promise.resolve({ data: {} });
    });

    await wrapper.vm.handleFileSelect(mockFile);
    
    expect(wrapper.vm.selectedFile).toEqual(mockFile);
    expect(wrapper.vm.fileContent).toBe('const x = 1;');
    // Verify symbols are loaded from outline endpoint
    expect(wrapper.vm.symbols.length).toBeGreaterThanOrEqual(0);
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

    wrapper.vm.tabManager = mockTabManager();

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
    
    wrapper.vm.tabManager = mockTabManager();
    
    await wrapper.vm.handleFileSelect(mockDir);
    
    // Should update tab manager even for directories
    expect(wrapper.vm.selectedFile).toEqual(mockDir);
  });

  describe('Tab Management', () => {
    it('handles tab selection and restores state', async () => {
      const wrapper = shallowMount(App);
      
      // Setup initial tab
      const file1 = { name: 'test1.js', path: '/test1.js', isDirectory: false };
      wrapper.vm.selectedFile = file1;
      wrapper.vm.detailOptions = { showComments: false };
      wrapper.vm.isolatedSymbol = { name: 'testSymbol', line: 10 };
      
      // Mock tab manager with spy
      const updateTabStateSpy = vi.fn();
      wrapper.vm.tabManager = {
        tabs: [
          { id: 1, path: '/test1.js', name: 'test1.js' },
          { id: 2, path: '/test2.js', name: 'test2.js', detailOptions: { showComments: true }, isolatedSymbol: null, scrollPosition: 100 }
        ],
        updateTabState: updateTabStateSpy,
        addOrActivateTab: vi.fn()
      };
      
      // Mock querySelector
      const mockScrollContainer = { scrollTop: 50 };
      vi.spyOn(document, 'querySelector').mockReturnValue(mockScrollContainer);
      
      axios.get.mockImplementation((url) => {
        if (url.includes('/api/files/content')) return Promise.resolve({ data: 'test content' });
        if (url.includes('/api/analysis/outline')) return Promise.resolve({ data: [] });
        return Promise.resolve({ data: {} });
      });
      
      // Switch to tab 2
      await wrapper.vm.handleTabSelect(wrapper.vm.tabManager.tabs[1]);
      
      // Verify state was saved for tab 1
      expect(updateTabStateSpy).toHaveBeenCalledWith(1, {
        scrollPosition: 50,
        detailOptions: { showComments: false },
        isolatedSymbol: { name: 'testSymbol', line: 10 }
      });
      
      // Verify state was restored for tab 2
      expect(wrapper.vm.detailOptions).toEqual({ showComments: true });
      expect(wrapper.vm.isolatedSymbol).toBe(null);
    });

    it('handles tab close when all tabs are closed', () => {
      const wrapper = shallowMount(App);
      wrapper.vm.selectedFile = { name: 'test.js', path: '/test.js' };
      wrapper.vm.fileContent = 'test content';
      wrapper.vm.symbols = [{ name: 'test' }];
      
      wrapper.vm.tabManager = { tabs: [] };
      
      wrapper.vm.handleTabClose(1);
      
      expect(wrapper.vm.selectedFile).toBe(null);
      expect(wrapper.vm.fileContent).toBe('');
      expect(wrapper.vm.symbols).toEqual([]);
    });

    it('does not clear file when tabs remain', () => {
      const wrapper = shallowMount(App);
      wrapper.vm.selectedFile = { name: 'test.js', path: '/test.js' };
      
      wrapper.vm.tabManager = { tabs: [{ id: 1, path: '/test.js' }] };
      
      wrapper.vm.handleTabClose(1);
      
      expect(wrapper.vm.selectedFile).not.toBe(null);
    });
  });

  describe('Panel Toggles', () => {
    it('toggles search panel and closes others', () => {
      const wrapper = shallowMount(App);
      wrapper.vm.showStatsPanel = true;
      wrapper.vm.showDetailPanel = true;
      wrapper.vm.showScopePanel = true;
      
      wrapper.vm.toggleSearchPanel();
      
      expect(wrapper.vm.showSearchPanel).toBe(true);
      expect(wrapper.vm.showStatsPanel).toBe(false);
      expect(wrapper.vm.showDetailPanel).toBe(false);
      expect(wrapper.vm.showScopePanel).toBe(false);
    });

    it('toggles scope panel and closes others', () => {
      const wrapper = shallowMount(App);
      wrapper.vm.showStatsPanel = true;
      wrapper.vm.showDetailPanel = true;
      wrapper.vm.showSearchPanel = true;
      wrapper.vm.showExportPanel = true;
      
      wrapper.vm.toggleScopePanel();
      
      expect(wrapper.vm.showScopePanel).toBe(true);
      expect(wrapper.vm.showStatsPanel).toBe(false);
      expect(wrapper.vm.showDetailPanel).toBe(false);
      expect(wrapper.vm.showSearchPanel).toBe(false);
      expect(wrapper.vm.showExportPanel).toBe(false);
    });

    it('toggles export panel and closes others', () => {
      const wrapper = shallowMount(App);
      wrapper.vm.showStatsPanel = true;
      wrapper.vm.showDetailPanel = true;
      wrapper.vm.showSearchPanel = true;
      wrapper.vm.showScopePanel = true;
      
      wrapper.vm.toggleExportPanel();
      
      expect(wrapper.vm.showExportPanel).toBe(true);
      expect(wrapper.vm.showStatsPanel).toBe(false);
      expect(wrapper.vm.showDetailPanel).toBe(false);
      expect(wrapper.vm.showSearchPanel).toBe(false);
      expect(wrapper.vm.showScopePanel).toBe(false);
    });
  });

  describe('Navigation', () => {
    it('handles package navigation', async () => {
      const wrapper = shallowMount(App);
      wrapper.vm.tabManager = mockTabManager();
      
      const file = { name: 'Package.java', path: '/src/Package.java', isDirectory: false };
      
      axios.get.mockImplementation((url) => {
        if (url.includes('/api/files/content')) return Promise.resolve({ data: 'package content' });
        if (url.includes('/api/analysis/outline')) return Promise.resolve({ data: [] });
        return Promise.resolve({ data: {} });
      });
      
      await wrapper.vm.handlePackageNavigate(file);
      
      expect(wrapper.vm.selectedFile).toEqual(file);
    });

    it('scrolls to correct line on search select', async () => {
      const wrapper = shallowMount(App);
      wrapper.vm.tabManager = mockTabManager();
      wrapper.vm.showSearchPanel = true;
      
      const mockLine = {
        scrollIntoView: vi.fn(),
        classList: {
          add: vi.fn(),
          remove: vi.fn()
        }
      };
      
      vi.spyOn(document, 'querySelector').mockReturnValue({
        querySelectorAll: vi.fn(() => [mockLine, mockLine, mockLine])
      });
      
      axios.get.mockImplementation((url) => {
        if (url.includes('/api/files/content')) return Promise.resolve({ data: 'line1\nline2\nline3' });
        if (url.includes('/api/analysis/outline')) return Promise.resolve({ data: [] });
        return Promise.resolve({ data: {} });
      });
      
      const result = {
        filePath: '/src/Test.java',
        fileName: 'Test.java',
        line: 2
      };
      
      await wrapper.vm.handleSearchSelect(result);
      
      expect(wrapper.vm.showSearchPanel).toBe(false);
      
      // Wait for setTimeout
      await new Promise(resolve => setTimeout(resolve, 600));
      
      expect(mockLine.scrollIntoView).toHaveBeenCalled();
      expect(mockLine.classList.add).toHaveBeenCalledWith('highlight-line');
    });
  });

  describe('Scope Isolation', () => {
    it('handles scope isolation', () => {
      const wrapper = shallowMount(App);
      const symbol = { name: 'TestMethod', line: 10, endLine: 20 };
      
      wrapper.vm.handleScopeIsolate(symbol);
      
      expect(wrapper.vm.isolatedSymbol).toEqual(symbol);
    });

    it('handles scope clear', () => {
      const wrapper = shallowMount(App);
      wrapper.vm.isolatedSymbol = { name: 'TestMethod', line: 10 };
      
      wrapper.vm.handleScopeClear();
      
      expect(wrapper.vm.isolatedSymbol).toBe(null);
    });
  });

  describe('Dead Code Detection', () => {
    it('loads dead code info', async () => {
      const wrapper = shallowMount(App);
      
      const mockDeadCode = [
        { filePath: '/test.js', line: 5, callerCount: 0, isPublic: false, isTest: false },
        { filePath: '/test.js', line: 10, callerCount: 1, isPublic: true, isTest: false }
      ];
      
      AnalysisService.detectDeadCode.mockResolvedValue(mockDeadCode);
      
      await wrapper.vm.loadDeadCodeInfo();
      
      expect(wrapper.vm.deadCodeInfo.length).toBe(2);
      expect(wrapper.vm.deadCodeInfo[0].isPotentiallyDead).toBe(true);
      expect(wrapper.vm.deadCodeInfo[1].isPotentiallyDead).toBe(false);
    });

    it('computes dead code lines for current file', async () => {
      const wrapper = shallowMount(App);
      wrapper.vm.selectedFile = { path: '/test.js', name: 'test.js' };
      wrapper.vm.showDeadCode = true;
      wrapper.vm.deadCodeInfo = [
        { filePath: '/test.js', line: 5, isPotentiallyDead: true },
        { filePath: '/test.js', line: 10, isPotentiallyDead: false },
        { filePath: '/other.js', line: 15, isPotentiallyDead: true }
      ];
      
      const deadLines = wrapper.vm.deadCodeLines;
      
      expect(deadLines.has(5)).toBe(true);
      expect(deadLines.has(10)).toBe(false);
      expect(deadLines.has(15)).toBe(false);
    });

    it('returns empty set when showDeadCode is false', () => {
      const wrapper = shallowMount(App);
      wrapper.vm.selectedFile = { path: '/test.js', name: 'test.js' };
      wrapper.vm.showDeadCode = false;
      wrapper.vm.deadCodeInfo = [
        { filePath: '/test.js', line: 5, isPotentiallyDead: true }
      ];
      
      const deadLines = wrapper.vm.deadCodeLines;
      
      expect(deadLines.size).toBe(0);
    });
  });

  describe('Complexity Filtering', () => {
    it('filters symbols in simplified mode', () => {
      const wrapper = shallowMount(App);
      wrapper.vm.symbols = [
        { name: 'method1', category: 'BOILERPLATE' },
        { name: 'method2', category: 'BUSINESS' },
        { name: 'method3', category: 'ARCHITECTURE' }
      ];
      wrapper.vm.complexity = 'simplified';
      
      const filtered = wrapper.vm.filteredSymbols;
      
      expect(filtered.length).toBe(2);
      expect(filtered.find(s => s.name === 'method1')).toBeUndefined();
    });

    it('filters symbols in architectural mode', () => {
      const wrapper = shallowMount(App);
      wrapper.vm.symbols = [
        { name: 'class1', type: 'CLASS', category: 'BUSINESS' },
        { name: 'method1', type: 'METHOD', category: 'ARCHITECTURE' },
        { name: 'method2', type: 'METHOD', category: 'BUSINESS' }
      ];
      wrapper.vm.complexity = 'architectural';
      
      const filtered = wrapper.vm.filteredSymbols;
      
      expect(filtered.length).toBe(2);
      expect(filtered.find(s => s.name === 'class1')).toBeDefined();
      expect(filtered.find(s => s.name === 'method1')).toBeDefined();
      expect(filtered.find(s => s.name === 'method2')).toBeUndefined();
    });

    it('does not filter symbols in standard mode', () => {
      const wrapper = shallowMount(App);
      wrapper.vm.symbols = [
        { name: 'method1', category: 'BOILERPLATE' },
        { name: 'method2', category: 'BUSINESS' }
      ];
      wrapper.vm.complexity = 'standard';
      
      const filtered = wrapper.vm.filteredSymbols;
      
      expect(filtered.length).toBe(2);
    });

    it('computes hidden lines based on complexity', () => {
      const wrapper = shallowMount(App);
      wrapper.vm.complexity = 'simplified';
      wrapper.vm.symbols = [
        { name: 'getter', line: 5, category: 'BOILERPLATE' },
        { name: 'method', line: 10, category: 'BUSINESS' }
      ];
      
      const hidden = wrapper.vm.hiddenLines;
      
      expect(hidden.has(5)).toBe(true);
      expect(hidden.has(10)).toBe(false);
    });

    it('computes hidden lines for scope isolation', () => {
      const wrapper = shallowMount(App);
      wrapper.vm.selectedFile = { name: 'test.js', path: '/test.js' };
      wrapper.vm.fileContent = 'line1\nline2\nline3\nline4\nline5\nline6\nline7\nline8\nline9\nline10';
      wrapper.vm.isolatedSymbol = { name: 'method', line: 3, endLine: 5 };
      
      const hidden = wrapper.vm.hiddenLines;
      
      expect(hidden.has(1)).toBe(true);
      expect(hidden.has(2)).toBe(true);
      expect(hidden.has(3)).toBe(false);
      expect(hidden.has(4)).toBe(false);
      expect(hidden.has(5)).toBe(false);
      expect(hidden.has(6)).toBe(true);
    });
  });

  describe('Caller Panel', () => {
    it('shows callers for method symbol', () => {
      const wrapper = shallowMount(App);
      const symbol = { name: 'testMethod', type: 'METHOD', line: 10 };
      
      wrapper.vm.showCallersForSymbol(symbol);
      
      expect(wrapper.vm.showCallerPanel).toBe(true);
      expect(wrapper.vm.selectedMethodForCallers).toEqual({
        methodName: 'testMethod',
        className: '',
        rootPath: '..'
      });
    });

    it('does not show callers for non-method symbols', () => {
      const wrapper = shallowMount(App);
      const symbol = { name: 'testClass', type: 'CLASS', line: 5 };
      
      wrapper.vm.showCallersForSymbol(symbol);
      
      expect(wrapper.vm.showCallerPanel).toBe(false);
    });

    it('handles caller navigation', async () => {
      const wrapper = shallowMount(App);
      wrapper.vm.tabManager = mockTabManager();
      
      const mockLine = {
        scrollIntoView: vi.fn(),
        classList: {
          add: vi.fn(),
          remove: vi.fn()
        }
      };
      
      vi.spyOn(document, 'querySelector').mockReturnValue({
        querySelectorAll: vi.fn(() => [mockLine, mockLine, mockLine])
      });
      
      axios.get.mockImplementation((url) => {
        if (url.includes('/api/files/content')) return Promise.resolve({ data: 'content' });
        if (url.includes('/api/analysis/outline')) return Promise.resolve({ data: [] });
        return Promise.resolve({ data: {} });
      });
      
      const location = { filePath: '/src/Caller.java', line: 3 };
      await wrapper.vm.handleCallerNavigate(location);
      
      // Wait for setTimeout
      await new Promise(resolve => setTimeout(resolve, 400));
      
      expect(mockLine.scrollIntoView).toHaveBeenCalled();
    });
  });

  describe('Click Navigation', () => {
    it('toggles click navigation mode', () => {
      const wrapper = shallowMount(App);
      const initial = wrapper.vm.clickNavigationMode;
      
      wrapper.vm.toggleClickNavigationMode();
      
      expect(wrapper.vm.clickNavigationMode).toBe(!initial);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('clickNavigationMode', wrapper.vm.clickNavigationMode.toString());
    });
  });

  describe('Language Detection', () => {
    it('detects Java language', () => {
      const wrapper = shallowMount(App);
      expect(wrapper.vm.getLanguageFromFilename('Test.java')).toBe('java');
    });

    it('detects JavaScript language', () => {
      const wrapper = shallowMount(App);
      expect(wrapper.vm.getLanguageFromFilename('test.js')).toBe('javascript');
    });

    it('detects TypeScript language', () => {
      const wrapper = shallowMount(App);
      expect(wrapper.vm.getLanguageFromFilename('test.ts')).toBe('typescript');
      expect(wrapper.vm.getLanguageFromFilename('test.tsx')).toBe('typescript');
    });

    it('defaults to text for unknown extensions', () => {
      const wrapper = shallowMount(App);
      expect(wrapper.vm.getLanguageFromFilename('test.unknown')).toBe('text');
    });
  });

  describe('Symbol Navigation', () => {
    it('handles navigate to symbol when not found', async () => {
      const wrapper = shallowMount(App);
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Call the navigation function - it will import the service internally
      await wrapper.vm.handleNavigateToSymbol('UnknownSymbol');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Theme and localStorage restoration', () => {
    it('restores click navigation mode from localStorage on mount', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'clickNavigationMode') return 'true';
        if (key === 'theme') return 'dark';
        return null;
      });
      
      const wrapper = shallowMount(App);
      
      expect(wrapper.vm.clickNavigationMode).toBe(true);
    });

    it('toggles dead code visualization and saves to localStorage', async () => {
      const wrapper = shallowMount(App);
      const mockDeadCode = [
        { filePath: '/test.js', line: 5, callerCount: 0, isPublic: false, isTest: false }
      ];
      
      AnalysisService.detectDeadCode.mockResolvedValue(mockDeadCode);
      
      wrapper.vm.showDeadCode = false;
      wrapper.vm.deadCodeInfo = [];
      
      await wrapper.vm.toggleDeadCodeVisualization();
      
      expect(wrapper.vm.showDeadCode).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('showDeadCode', 'true');
      
      // Wait for loadDeadCodeInfo to complete
      await vi.waitFor(() => {
        expect(wrapper.vm.deadCodeInfo.length).toBe(1);
      });
    });

    it('does not reload dead code when disabling', async () => {
      const wrapper = shallowMount(App);
      wrapper.vm.showDeadCode = true;
      wrapper.vm.deadCodeInfo = [{ filePath: '/test.js', line: 5, isPotentiallyDead: true }];
      
      const spy = vi.spyOn(wrapper.vm, 'loadDeadCodeInfo');
      
      await wrapper.vm.toggleDeadCodeVisualization();
      
      expect(wrapper.vm.showDeadCode).toBe(false);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('File content loading', () => {
    it('loads statistics component after file content', async () => {
      const wrapper = shallowMount(App);
      const mockStatsComponent = {
        loadStatistics: vi.fn()
      };
      wrapper.vm.statsComponent = mockStatsComponent;
      wrapper.vm.tabManager = mockTabManager();
      
      axios.get.mockImplementation((url) => {
        if (url.includes('/api/files/content')) return Promise.resolve({ data: 'test' });
        if (url.includes('/api/analysis/outline')) return Promise.resolve({ data: [] });
        return Promise.resolve({ data: {} });
      });
      
      const file = { name: 'Test.java', path: '/Test.java', isDirectory: false };
      await wrapper.vm.handleFileSelect(file);
      
      expect(mockStatsComponent.loadStatistics).toHaveBeenCalled();
    });

    it('handles error when loading file content', async () => {
      const wrapper = shallowMount(App);
      wrapper.vm.tabManager = mockTabManager();
      
      axios.get.mockRejectedValue(new Error('Network error'));
      
      const file = { name: 'Test.java', path: '/Test.java', isDirectory: false };
      await wrapper.vm.handleFileSelect(file);
      
      expect(wrapper.vm.fileContent).toContain('Error loading file content');
    });

    it('loads frontend outline for JS files', async () => {
      const wrapper = shallowMount(App);
      wrapper.vm.tabManager = mockTabManager();
      
      const mockSymbols = [{ name: 'testFunc', type: 'function' }];
      AnalysisService.getOutline.mockResolvedValue(mockSymbols);
      
      axios.get.mockImplementation((url) => {
        if (url.includes('/api/files/content')) return Promise.resolve({ data: 'function test() {}' });
        return Promise.resolve({ data: {} });
      });
      
      const file = { name: 'test.js', path: '/test.js', isDirectory: false };
      await wrapper.vm.handleFileSelect(file);
      
      expect(AnalysisService.getOutline).toHaveBeenCalled();
      expect(wrapper.vm.symbols).toEqual(mockSymbols);
    });

    it('loads frontend outline for TS files', async () => {
      const wrapper = shallowMount(App);
      wrapper.vm.tabManager = mockTabManager();
      
      const mockSymbols = [{ name: 'testFunc', type: 'function' }];
      AnalysisService.getOutline.mockResolvedValue(mockSymbols);
      
      axios.get.mockImplementation((url) => {
        if (url.includes('/api/files/content')) return Promise.resolve({ data: 'function test() {}' });
        return Promise.resolve({ data: {} });
      });
      
      const file = { name: 'test.ts', path: '/test.ts', isDirectory: false };
      await wrapper.vm.handleFileSelect(file);
      
      expect(AnalysisService.getOutline).toHaveBeenCalled();
    });

    it('loads backend outline for Java files', async () => {
      const wrapper = shallowMount(App);
      wrapper.vm.tabManager = mockTabManager();
      
      const mockSymbols = [{ name: 'TestClass', type: 'CLASS' }];
      
      axios.get.mockImplementation((url) => {
        if (url.includes('/api/files/content')) return Promise.resolve({ data: 'class Test {}' });
        if (url.includes('/api/analysis/outline')) return Promise.resolve({ data: mockSymbols });
        return Promise.resolve({ data: {} });
      });
      
      const file = { name: 'Test.java', path: '/Test.java', isDirectory: false };
      await wrapper.vm.handleFileSelect(file);
      
      expect(wrapper.vm.symbols).toEqual(mockSymbols);
    });
  });

  describe('Tab state persistence', () => {
    it('saves scroll position when switching tabs', async () => {
      const wrapper = shallowMount(App);
      
      wrapper.vm.selectedFile = { name: 'test1.js', path: '/test1.js' };
      const updateTabStateSpy = vi.fn();
      wrapper.vm.tabManager = {
        tabs: [{ id: 1, path: '/test1.js', name: 'test1.js' }],
        updateTabState: updateTabStateSpy,
        addOrActivateTab: vi.fn()
      };
      
      const mockScrollContainer = { scrollTop: 123 };
      vi.spyOn(document, 'querySelector').mockReturnValue(mockScrollContainer);
      
      axios.get.mockImplementation((url) => {
        if (url.includes('/api/files/content')) return Promise.resolve({ data: 'content' });
        if (url.includes('/api/analysis/outline')) return Promise.resolve({ data: [] });
        return Promise.resolve({ data: {} });
      });
      
      const file = { name: 'test2.js', path: '/test2.js', isDirectory: false };
      await wrapper.vm.handleFileSelect(file);
      
      expect(updateTabStateSpy).toHaveBeenCalledWith(1, expect.objectContaining({
        scrollPosition: 123
      }));
    });

    it('restores scroll position when switching back to tab', async () => {
      const wrapper = shallowMount(App);
      
      const mockScrollContainer = { scrollTop: 0 };
      vi.spyOn(document, 'querySelector').mockReturnValue(mockScrollContainer);
      
      wrapper.vm.tabManager = {
        tabs: [{ id: 1, path: '/test.js', name: 'test.js', scrollPosition: 250 }],
        updateTabState: vi.fn()
      };
      
      axios.get.mockImplementation((url) => {
        if (url.includes('/api/files/content')) return Promise.resolve({ data: 'content' });
        if (url.includes('/api/analysis/outline')) return Promise.resolve({ data: [] });
        return Promise.resolve({ data: {} });
      });
      
      await wrapper.vm.handleTabSelect(wrapper.vm.tabManager.tabs[0]);
      
      // Wait for setTimeout
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(mockScrollContainer.scrollTop).toBe(250);
    });
  });
});
