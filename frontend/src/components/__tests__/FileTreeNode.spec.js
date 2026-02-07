import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import FileTreeNode from '../FileTreeNode.vue';
import { Folder, FileText, ChevronRight, ChevronDown } from 'lucide-vue-next';

describe('FileTreeNode.vue', () => {
  const directoryNode = {
    name: 'src',
    isDirectory: true,
    children: [
      { name: 'main.js', isDirectory: false, path: '/src/main.js' }
    ],
    path: '/src'
  };

  const fileNode = {
    name: 'README.md',
    isDirectory: false,
    path: '/README.md'
  };

  it('renders directory correctly', () => {
    const wrapper = mount(FileTreeNode, {
      props: { node: directoryNode }
    });
    expect(wrapper.text()).toContain('src');
    expect(wrapper.findComponent(Folder).exists()).toBe(true);
    expect(wrapper.findComponent(ChevronRight).exists()).toBe(true);
  });

  it('renders file correctly', () => {
    const wrapper = mount(FileTreeNode, {
      props: { node: fileNode }
    });
    expect(wrapper.text()).toContain('README.md');
    expect(wrapper.findComponent(FileText).exists()).toBe(true);
  });

  it('toggles directory on click', async () => {
    const wrapper = mount(FileTreeNode, {
      props: { node: directoryNode }
    });
    await wrapper.find('.node-label').trigger('click');
    expect(wrapper.findComponent(ChevronDown).exists()).toBe(true);
    expect(wrapper.findComponent(FileTreeNode).exists()).toBe(true);
  });

  it('emits select when file is clicked', async () => {
    const wrapper = mount(FileTreeNode, {
      props: { node: fileNode }
    });
    await wrapper.find('.node-label').trigger('click');
    expect(wrapper.emitted('select')).toBeTruthy();
    expect(wrapper.emitted('select')[0]).toEqual([fileNode]);
  });

  it('applies correct indentation based on depth', () => {
    const wrapper = mount(FileTreeNode, {
      props: { node: fileNode, depth: 2 }
    });
    const label = wrapper.find('.node-label');
    // depth * 18 + 8 = 2 * 18 + 8 = 44px
    expect(label.attributes('style')).toContain('padding-left: 44px');
  });
});
