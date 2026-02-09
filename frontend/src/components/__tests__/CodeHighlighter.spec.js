import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import CodeHighlighter from '../CodeHighlighter.vue';

// Mock Shiki
vi.mock('shiki', () => ({
  createHighlighter: vi.fn(() => Promise.resolve({
    codeToHtml: vi.fn((code) => `<pre><code>${code}</code></pre>`),
  }))
}));

describe('CodeHighlighter.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    const wrapper = mount(CodeHighlighter, {
      props: { code: 'const x = 1;', filename: 'test.js' }
    });
    // It might be too fast to see isLoading as true in a test without manual control
    // But we can check if the spinner exists if highlightedCode is empty
    expect(wrapper.find('.spinner-border').exists()).toBe(true);
  });

  it('renders highlighted code after mount', async () => {
    const wrapper = mount(CodeHighlighter, {
      props: { code: 'const x = 1;', filename: 'test.js' }
    });
    
    await vi.waitFor(() => {
      expect(wrapper.find('.shiki-container').exists()).toBe(true);
      expect(wrapper.html()).toContain('const x = 1;');
    });
  });

  it('updates highlighting when code changes', async () => {
    const wrapper = mount(CodeHighlighter, {
      props: { code: 'old', filename: 'test.js' }
    });

    await vi.waitFor(() => expect(wrapper.text()).toContain('old'));

    await wrapper.setProps({ code: 'new' });
    
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('new');
    });
  });

  it('detects correct language from filename', () => {
    const wrapper = mount(CodeHighlighter);
    const vm = wrapper.vm;
    
    expect(vm.getLanguage('Test.java')).toBe('java');
    expect(vm.getLanguage('script.js')).toBe('javascript');
    expect(vm.getLanguage('style.css')).toBe('css');
    expect(vm.getLanguage('unknown.foo')).toBe('text');
    expect(vm.getLanguage('app.vue')).toBe('vue');
  });

  it('should handle empty code gracefully', async () => {
    const wrapper = mount(CodeHighlighter, {
      props: { code: '', filename: 'test.js' }
    });

    await vi.waitFor(() => {
      expect(wrapper.find('.shiki-container').exists()).toBe(true);
    });
  });

  it('should update when filename changes', async () => {
    const wrapper = mount(CodeHighlighter, {
      props: { code: 'const x = 1;', filename: 'test.js' }
    });

    await vi.waitFor(() => expect(wrapper.text()).toContain('const x = 1;'));

    await wrapper.setProps({ filename: 'test.java' });
    
    await vi.waitFor(() => {
      expect(wrapper.find('.shiki-container').exists()).toBe(true);
    });
  });

  it('should handle line numbers when provided', async () => {
    const wrapper = mount(CodeHighlighter, {
      props: { 
        code: 'line1\nline2\nline3', 
        filename: 'test.js',
        startLine: 10
      }
    });

    await vi.waitFor(() => {
      expect(wrapper.find('.shiki-container').exists()).toBe(true);
    });
  });

  it('should detect language from various file extensions', () => {
    const wrapper = mount(CodeHighlighter);
    const vm = wrapper.vm;
    
    expect(vm.getLanguage('test.ts')).toBe('typescript');
    expect(vm.getLanguage('test.html')).toBe('html');
    expect(vm.getLanguage('test.css')).toBe('css');
    expect(vm.getLanguage('test.xml')).toBe('xml');
    expect(vm.getLanguage('test.yaml')).toBe('yaml');
    expect(vm.getLanguage('test.json')).toBe('json');
    expect(vm.getLanguage('test.md')).toBe('markdown');
    expect(vm.getLanguage('test.sql')).toBe('sql');
    expect(vm.getLanguage('test.vue')).toBe('vue');
    expect(vm.getLanguage('test.sh')).toBe('bash');
  });

  it('should render multi-line code correctly', async () => {
    const multiLineCode = `function hello() {
  console.log("Hello");
  return true;
}`;
    const wrapper = mount(CodeHighlighter, {
      props: { code: multiLineCode, filename: 'test.js' }
    });

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('function hello');
      expect(wrapper.text()).toContain('console.log');
    });
  });
});
