import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, shallowMount } from '@vue/test-utils';
import App from '../App.vue';
import axios from 'axios';

// Mock axios
vi.mock('axios');

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
    
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/files/content')) return Promise.resolve({ data: 'const x = 1;' });
      if (url.includes('/api/analysis/outline')) return Promise.resolve({ data: [{ name: 'x', type: 'VAR', line: 1 }] });
      return Promise.resolve({ data: {} });
    });

    await wrapper.vm.handleFileSelect(mockFile);
    
    expect(wrapper.vm.selectedFile).toEqual(mockFile);
    expect(wrapper.vm.fileContent).toBe('const x = 1;');
    expect(wrapper.vm.symbols).toHaveLength(1);
  });
});
