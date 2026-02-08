import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import KnowledgeGraphView from '../KnowledgeGraphView.vue';
import KnowledgeGraphService from '../../services/KnowledgeGraphService';

vi.mock('../../services/KnowledgeGraphService');

describe('KnowledgeGraphView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render query panel', () => {
    const wrapper = mount(KnowledgeGraphView);
    
    expect(wrapper.find('h4').text()).toBe('Knowledge Graph Query');
    expect(wrapper.find('select').exists()).toBe(true);
    expect(wrapper.find('input').exists()).toBe(true);
  });

  it('should display correct placeholder based on query type', async () => {
    const wrapper = mount(KnowledgeGraphView);
    
    // Default is 'name'
    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter name to search...');
    
    // Change to 'calls'
    await wrapper.find('select').setValue('calls');
    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter method name...');
    
    // Change to 'inherits'
    await wrapper.find('select').setValue('inherits');
    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter class name...');
    
    // Change to 'type'
    await wrapper.find('select').setValue('type');
    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter type (CLASS, METHOD, INTERFACE)...');
  });

  it('should show error when executing empty query', async () => {
    const wrapper = mount(KnowledgeGraphView);
    
    await wrapper.find('button').trigger('click');
    
    expect(wrapper.find('.alert-danger').exists()).toBe(true);
    expect(wrapper.find('.alert-danger').text()).toContain('Please enter a query value');
  });

  it('should execute query and display results', async () => {
    const mockResult = {
      query: 'name:Test',
      nodes: [
        {
          id: 1,
          name: 'TestClass',
          nodeType: 'CLASS',
          filePath: '/test.java',
          lineNumber: 1,
          packageName: 'com.test',
          signature: 'public class TestClass'
        }
      ],
      paths: [],
      totalResults: 1
    };

    vi.mocked(KnowledgeGraphService.executeQuery).mockResolvedValue(mockResult);

    const wrapper = mount(KnowledgeGraphView);
    
    await wrapper.find('input').setValue('Test');
    await wrapper.find('button').trigger('click');
    
    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();
    
    expect(KnowledgeGraphService.executeQuery).toHaveBeenCalledWith('name:Test');
    expect(wrapper.text()).toContain('Results (1)');
    expect(wrapper.text()).toContain('TestClass');
    expect(wrapper.text()).toContain('/test.java:1');
  });

  it('should show no results message when query returns empty', async () => {
    const mockResult = {
      query: 'name:NonExistent',
      nodes: [],
      paths: [],
      totalResults: 0
    };

    vi.mocked(KnowledgeGraphService.executeQuery).mockResolvedValue(mockResult);

    const wrapper = mount(KnowledgeGraphView);
    
    await wrapper.find('input').setValue('NonExistent');
    await wrapper.find('button').trigger('click');
    
    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();
    
    expect(wrapper.text()).toContain('Results (0)');
    expect(wrapper.text()).toContain('No results found');
  });

  it('should display error on query failure', async () => {
    vi.mocked(KnowledgeGraphService.executeQuery).mockRejectedValue(
      new Error('Network error')
    );

    const wrapper = mount(KnowledgeGraphView);
    
    await wrapper.find('input').setValue('Test');
    await wrapper.find('button').trigger('click');
    
    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('.alert-danger').exists()).toBe(true);
    expect(wrapper.find('.alert-danger').text()).toContain('Network error');
  });

  it('should open node details modal', async () => {
    const mockResult = {
      query: 'name:Test',
      nodes: [
        {
          id: 1,
          name: 'TestClass',
          nodeType: 'CLASS',
          filePath: '/test.java',
          lineNumber: 1,
          packageName: 'com.test'
        }
      ],
      paths: [],
      totalResults: 1
    };

    const mockNodeDetails = {
      id: 1,
      name: 'TestClass',
      nodeType: 'CLASS',
      filePath: '/test.java',
      lineNumber: 1,
      packageName: 'com.test',
      documentation: 'Test class documentation',
      outgoingRelationships: [
        {
          relationshipId: 1,
          relationshipType: 'CALLS',
          relatedNodeId: 2,
          relatedNodeName: 'method1',
          relatedNodeType: 'METHOD'
        }
      ],
      incomingRelationships: []
    };

    vi.mocked(KnowledgeGraphService.executeQuery).mockResolvedValue(mockResult);
    vi.mocked(KnowledgeGraphService.getNode).mockResolvedValue(mockNodeDetails);

    const wrapper = mount(KnowledgeGraphView);
    
    await wrapper.find('input').setValue('Test');
    await wrapper.find('button').trigger('click');
    
    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();
    
    // Click details button
    await wrapper.find('.btn-outline-primary').trigger('click');
    
    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();
    
    expect(KnowledgeGraphService.getNode).toHaveBeenCalledWith(1);
  });

  it('should display node type badges with correct classes', async () => {
    const mockResult = {
      query: 'type:CLASS',
      nodes: [
        {
          id: 1,
          name: 'TestClass',
          nodeType: 'CLASS',
          filePath: '/test.java',
          lineNumber: 1,
          packageName: 'com.test'
        },
        {
          id: 2,
          name: 'TestInterface',
          nodeType: 'INTERFACE',
          filePath: '/test.java',
          lineNumber: 10,
          packageName: 'com.test'
        }
      ],
      paths: [],
      totalResults: 2
    };

    vi.mocked(KnowledgeGraphService.executeQuery).mockResolvedValue(mockResult);

    const wrapper = mount(KnowledgeGraphView);
    
    await wrapper.find('input').setValue('CLASS');
    await wrapper.find('select').setValue('type');
    await wrapper.find('button').trigger('click');
    
    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();
    
    const badges = wrapper.findAll('.badge');
    expect(badges.length).toBeGreaterThanOrEqual(2);
  });

  it('should trigger query on Enter key', async () => {
    const mockResult = {
      query: 'name:Test',
      nodes: [],
      paths: [],
      totalResults: 0
    };

    vi.mocked(KnowledgeGraphService.executeQuery).mockResolvedValue(mockResult);

    const wrapper = mount(KnowledgeGraphView);
    
    const input = wrapper.find('input');
    await input.setValue('Test');
    await input.trigger('keyup.enter');
    
    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();
    
    expect(KnowledgeGraphService.executeQuery).toHaveBeenCalledWith('name:Test');
  });
});
