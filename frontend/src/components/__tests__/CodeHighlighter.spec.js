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
});
