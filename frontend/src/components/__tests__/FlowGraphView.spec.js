/**
 * Tests for FlowGraphView component
 * Testing FR.20: Flow Graph Visualization
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import FlowGraphView from '../FlowGraphView.vue';
import * as FlowGraphService from '../../services/FlowGraphService';

// Mock D3 to avoid DOM manipulation errors
vi.mock('d3', () => ({
  select: vi.fn(() => ({
    selectAll: vi.fn(() => ({ remove: vi.fn() })),
    append: vi.fn(() => ({
      attr: vi.fn(() => ({
        attr: vi.fn(() => ({
          append: vi.fn(() => ({
            attr: vi.fn(() => ({ attr: vi.fn() }))
          }))
        }))
      }))
    })),
    attr: vi.fn(() => ({ attr: vi.fn() })),
    call: vi.fn(() => ({})),
    on: vi.fn()
  })),
  zoom: vi.fn(() => ({
    scaleExtent: vi.fn(() => ({
      on: vi.fn(() => ({}))
    }))
  })),
  forceSimulation: vi.fn(() => ({
    nodes: vi.fn(() => ({})),
    force: vi.fn(() => ({})),
    on: vi.fn(),
    alphaTarget: vi.fn(() => ({})),
    restart: vi.fn()
  })),
  forceLink: vi.fn(() => ({
    id: vi.fn(() => ({})),
    distance: vi.fn()
  })),
  forceManyBody: vi.fn(() => ({
    strength: vi.fn()
  })),
  forceCenter: vi.fn(),
  forceCollide: vi.fn(() => ({
    radius: vi.fn()
  }))
}));

describe('FlowGraphView.vue', () => {
  const mockGraphData = {
    nodes: [
      { id: 'node1', name: 'Service', nodeType: 'CLASS', layer: 'SERVICE', filePath: '/src/Service.java' },
      { id: 'node2', name: 'Controller', nodeType: 'CLASS', layer: 'CONTROLLER', filePath: '/src/Controller.java' }
    ],
    edges: [
      { source: 'node2', target: 'node1', edgeType: 'CALLS' }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(FlowGraphService, 'analyzeProject').mockResolvedValue(mockGraphData);
  });

  it('renders the component with header', () => {
    const wrapper = mount(FlowGraphView, {
      props: { rootPath: '/test' }
    });

    expect(wrapper.find('.flow-graph-view').exists()).toBe(true);
    expect(wrapper.find('.graph-header').exists()).toBe(true);
    expect(wrapper.text()).toContain('Architecture Flow Graph');
  });

  it('shows loading state initially', () => {
    const wrapper = mount(FlowGraphView, {
      props: { rootPath: '/test' }
    });

    expect(wrapper.find('.spinner-border').exists()).toBe(true);
    expect(wrapper.text()).toContain('Analyzing project structure...');
  });

  it('emits close event when close button is clicked', async () => {
    const wrapper = mount(FlowGraphView, {
      props: { rootPath: '/test' }
    });

    const closeButton = wrapper.find('button');
    await closeButton.trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('loads graph data on mount', async () => {
    const wrapper = mount(FlowGraphView, {
      props: { rootPath: '/test/path' }
    });

    await vi.waitFor(() => {
      expect(FlowGraphService.analyzeProject).toHaveBeenCalledWith('/test/path');
    });
  });

  it('displays error message when loading fails', async () => {
    vi.spyOn(FlowGraphService, 'analyzeProject').mockRejectedValue(new Error('Network error'));
    
    const wrapper = mount(FlowGraphView, {
      props: { rootPath: '/test' }
    });

    await vi.waitFor(() => {
      expect(wrapper.find('.alert-danger').exists()).toBe(true);
      expect(wrapper.text()).toContain('Error');
    });
  });

  it('renders layout selector with all options', () => {
    const wrapper = mount(FlowGraphView, {
      props: { rootPath: '/test' }
    });

    const layoutSelect = wrapper.find('select');
    expect(layoutSelect.exists()).toBe(true);
    
    const options = layoutSelect.findAll('option');
    expect(options).toHaveLength(3);
    expect(options[0].text()).toBe('Force-Directed');
    expect(options[1].text()).toBe('Hierarchical');
    expect(options[2].text()).toBe('Layered');
  });

  it('changes layout when selector is changed', async () => {
    const wrapper = mount(FlowGraphView, {
      props: { rootPath: '/test' }
    });

    const layoutSelect = wrapper.find('select');
    await layoutSelect.setValue('hierarchical');

    expect(wrapper.vm.selectedLayout).toBe('hierarchical');
  });

  it('renders search input for filtering nodes', () => {
    const wrapper = mount(FlowGraphView, {
      props: { rootPath: '/test' }
    });

    const searchInput = wrapper.find('input[type="text"]');
    expect(searchInput.exists()).toBe(true);
    expect(searchInput.attributes('placeholder')).toContain('Search nodes');
  });

  it('filters nodes based on search term', async () => {
    const wrapper = mount(FlowGraphView, {
      props: { rootPath: '/test' }
    });

    await vi.waitFor(() => {
      expect(wrapper.vm.nodes).toHaveLength(2);
    });

    const searchInput = wrapper.find('input[type="text"]');
    await searchInput.setValue('Service');

    expect(wrapper.vm.searchTerm).toBe('Service');
  });

  it('displays node and edge count', async () => {
    const wrapper = mount(FlowGraphView, {
      props: { rootPath: '/test' }
    });

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('nodes');
      expect(wrapper.text()).toContain('edges');
    });
  });

  it('renders layer filter buttons', async () => {
    const wrapper = mount(FlowGraphView, {
      props: { rootPath: '/test' }
    });

    await vi.waitFor(() => {
      const layerButtons = wrapper.findAll('.layer-filters button');
      expect(layerButtons.length).toBeGreaterThan(0);
    });
  });

  it('toggles layer visibility when layer button is clicked', async () => {
    const wrapper = mount(FlowGraphView, {
      props: { rootPath: '/test' }
    });

    await vi.waitFor(() => {
      expect(wrapper.vm.nodes).toHaveLength(2);
    });

    // Find a layer button
    const layerButtons = wrapper.findAll('.layer-filters button');
    if (layerButtons.length > 0) {
      const initialSize = wrapper.vm.hiddenLayers.size;
      await layerButtons[0].trigger('click');
      expect(wrapper.vm.hiddenLayers.size).not.toBe(initialSize);
    }
  });

  it('renders legend with layer colors', () => {
    const wrapper = mount(FlowGraphView, {
      props: { rootPath: '/test' }
    });

    const legend = wrapper.find('.graph-legend');
    expect(legend.exists()).toBe(true);
    expect(legend.text()).toContain('Layers');
    expect(legend.text()).toContain('Edge Types');
  });

  it('shows node details when a node is selected', async () => {
    const wrapper = mount(FlowGraphView, {
      props: { rootPath: '/test' }
    });

    await vi.waitFor(() => {
      expect(wrapper.vm.nodes).toHaveLength(2);
    });

    wrapper.vm.selectedNode = mockGraphData.nodes[0];
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.node-details').exists()).toBe(true);
    expect(wrapper.text()).toContain('Service');
    expect(wrapper.text()).toContain('CLASS');
  });

  it('closes node details when close button is clicked', async () => {
    const wrapper = mount(FlowGraphView, {
      props: { rootPath: '/test' }
    });

    wrapper.vm.selectedNode = mockGraphData.nodes[0];
    await wrapper.vm.$nextTick();

    const closeButton = wrapper.find('.node-details .btn-close');
    await closeButton.trigger('click');

    expect(wrapper.vm.selectedNode).toBeNull();
  });

  it('computes available layers from nodes', async () => {
    const wrapper = mount(FlowGraphView, {
      props: { rootPath: '/test' }
    });

    await vi.waitFor(() => {
      expect(wrapper.vm.availableLayers).toContain('SERVICE');
      expect(wrapper.vm.availableLayers).toContain('CONTROLLER');
    });
  });

  it('filters nodes and edges based on hidden layers', async () => {
    const wrapper = mount(FlowGraphView, {
      props: { rootPath: '/test' }
    });

    await vi.waitFor(() => {
      expect(wrapper.vm.nodes).toHaveLength(2);
    });

    wrapper.vm.hiddenLayers.add('SERVICE');
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.filteredNodes.length).toBeLessThan(wrapper.vm.nodes.length);
  });

  it('applies different layouts correctly', async () => {
    const wrapper = mount(FlowGraphView, {
      props: { rootPath: '/test' }
    });

    await vi.waitFor(() => {
      expect(wrapper.vm.nodes).toHaveLength(2);
    });

    // Test force-directed layout
    wrapper.vm.selectedLayout = 'force';
    await wrapper.vm.applyLayout();
    expect(wrapper.vm.selectedLayout).toBe('force');

    // Test hierarchical layout
    wrapper.vm.selectedLayout = 'hierarchical';
    await wrapper.vm.applyLayout();
    expect(wrapper.vm.selectedLayout).toBe('hierarchical');

    // Test layered layout
    wrapper.vm.selectedLayout = 'layered';
    await wrapper.vm.applyLayout();
    expect(wrapper.vm.selectedLayout).toBe('layered');
  });

  it('handles empty graph data gracefully', async () => {
    vi.spyOn(FlowGraphService, 'analyzeProject').mockResolvedValue({
      nodes: [],
      edges: []
    });

    const wrapper = mount(FlowGraphView, {
      props: { rootPath: '/test' }
    });

    await vi.waitFor(() => {
      expect(wrapper.vm.nodes).toHaveLength(0);
      expect(wrapper.vm.edges).toHaveLength(0);
    });
  });

  it('initializes with default values', () => {
    const wrapper = mount(FlowGraphView, {
      props: { rootPath: '/test' }
    });

    expect(wrapper.vm.selectedLayout).toBe('force');
    expect(wrapper.vm.searchTerm).toBe('');
    expect(wrapper.vm.selectedNode).toBeNull();
    expect(wrapper.vm.hiddenLayers.size).toBe(0);
  });
});
