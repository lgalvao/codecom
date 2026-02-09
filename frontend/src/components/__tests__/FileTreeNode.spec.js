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

  it('should expand directory when clicking chevron', async () => {
    const wrapper = mount(FileTreeNode, {
      props: { node: directoryNode }
    });
    
    expect(wrapper.vm.isExpanded).toBe(false);
    await wrapper.find('.node-label').trigger('click');
    expect(wrapper.vm.isExpanded).toBe(true);
  });

  it('should collapse expanded directory on second click', async () => {
    const wrapper = mount(FileTreeNode, {
      props: { node: directoryNode }
    });
    
    await wrapper.find('.node-label').trigger('click');
    expect(wrapper.vm.isExpanded).toBe(true);
    
    await wrapper.find('.node-label').trigger('click');
    expect(wrapper.vm.isExpanded).toBe(false);
  });

  it('should render nested children recursively', async () => {
    const nestedNode = {
      name: 'parent',
      isDirectory: true,
      children: [
        {
          name: 'child',
          isDirectory: true,
          children: [
            { name: 'file.txt', isDirectory: false, path: '/parent/child/file.txt' }
          ],
          path: '/parent/child'
        }
      ],
      path: '/parent'
    };

    const wrapper = mount(FileTreeNode, {
      props: { node: nestedNode }
    });
    
    await wrapper.find('.node-label').trigger('click');
    expect(wrapper.findAllComponents(FileTreeNode).length).toBeGreaterThan(1);
  });

  it('should not show chevron for files', () => {
    const wrapper = mount(FileTreeNode, {
      props: { node: fileNode }
    });
    
    expect(wrapper.findComponent(ChevronRight).exists()).toBe(false);
    expect(wrapper.findComponent(ChevronDown).exists()).toBe(false);
  });

  it('should handle directory with no children', () => {
    const emptyDir = {
      name: 'empty',
      isDirectory: true,
      children: [],
      path: '/empty'
    };

    const wrapper = mount(FileTreeNode, {
      props: { node: emptyDir }
    });
    
    expect(wrapper.findComponent(Folder).exists()).toBe(true);
  });

  it('should apply active class to selected file', () => {
    const wrapper = mount(FileTreeNode, {
      props: { 
        node: fileNode,
        selectedPath: '/README.md'
      }
    });
    
    expect(wrapper.find('.node-label').classes()).toContain('active');
  });

  it('should not apply active class to non-selected file', () => {
    const wrapper = mount(FileTreeNode, {
      props: { 
        node: fileNode,
        selectedPath: '/other.md'
      }
    });
    
    expect(wrapper.find('.node-label').classes()).not.toContain('active');
  });

  it('should handle depth prop correctly', () => {
    const wrapper = mount(FileTreeNode, {
      props: { node: fileNode, depth: 0 }
    });
    
    const label = wrapper.find('.node-label');
    expect(label.attributes('style')).toContain('padding-left: 8px');
  });

  it('should pass increased depth to child nodes', async () => {
    const wrapper = mount(FileTreeNode, {
      props: { node: directoryNode, depth: 1 }
    });
    
    await wrapper.find('.node-label').trigger('click');
    const childNode = wrapper.findComponent(FileTreeNode);
    expect(childNode.props('depth')).toBe(2);
  });
});
