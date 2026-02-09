/**
 * Tests for FlowGraphView component
 * Testing graph rendering, layout changes, layer filtering, and search functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import FlowGraphView from '../FlowGraphView.vue';
import * as FlowGraphService from '../../services/FlowGraphService';

// Mock D3 module to avoid complex dependency
vi.mock('d3', () => {
  return {
    select: vi.fn(() => ({
      selectAll: vi.fn(function() { return this; }),
      attr: vi.fn(function() { return this; }),
      append: vi.fn(function() { return this; }),
      call: vi.fn(function() { return this; }),
      data: vi.fn(function() { return this; }),
      join: vi.fn(function() { return this; })
    })),
    forceSimulation: vi.fn(() => ({
      force: vi.fn(function() { return this; }),
      on: vi.fn(function() { return this; })
    })),
    forceLink: vi.fn(() => ({
      id: vi.fn(function() { return this; }),
      distance: vi.fn(function() { return this; })
    })),
    forceManyBody: vi.fn(() => ({
      strength: vi.fn(function() { return this; })
    })),
    forceCenter: vi.fn(() => ({})),
    forceCollide: vi.fn(() => ({
      radius: vi.fn(function() { return this; })
    })),
    zoom: vi.fn(() => ({
      scaleExtent: vi.fn(function() { return this; }),
      on: vi.fn(function() { return this; })
    })),
    drag: vi.fn(() => ({
      on: vi.fn(function() { return this; })
    }))
  };
});

// Mock FlowGraphService
vi.mock('../../services/FlowGraphService', () => ({
  default: {
    analyzeProject: vi.fn()
  }
}));

describe('FlowGraphView.vue', () => {
  let wrapper;
  let analyzeProjectSpy;

  const mockFlowGraphData = {
    nodes: [
      {
        id: '1',
        name: 'UserController',
        nodeType: 'CLASS',
        layer: 'CONTROLLER',
        filePath: '/src/controllers/UserController.java',
        lineNumber: 10,
        packageName: 'com.app.controllers'
      },
      {
        id: '2',
        name: 'UserService',
        nodeType: 'CLASS',
        layer: 'SERVICE_JAVA',
        filePath: '/src/services/UserService.java',
        lineNumber: 5,
        packageName: 'com.app.services'
      }
    ],
    edges: [
      {
        sourceId: '1',
        targetId: '2',
        edgeType: 'CALLS',
        label: 'calls',
        lineNumber: 20
      }
    ],
    metadata: {
      layers: ['CONTROLLER', 'SERVICE_JAVA', 'REPOSITORY'],
      nodeCount: 2,
      edgeCount: 1,
      timestamp: '2024-02-08T00:00:00Z'
    }
  };

  beforeEach(() => {
    analyzeProjectSpy = vi.spyOn(FlowGraphService.default, 'analyzeProject')
      .mockResolvedValue(mockFlowGraphData);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the component', async () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      expect(wrapper.find('.flow-graph-view').exists()).toBe(true);
    });

    it('should render the header', () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      const header = wrapper.find('.graph-header');
      expect(header.exists()).toBe(true);
    });

    it('should render close button', () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      const closeButton = wrapper.find('button.btn-outline-secondary');
      expect(closeButton.exists()).toBe(true);
    });

    it('should emit close event when close button is clicked', async () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      const closeButton = wrapper.find('button.btn-outline-secondary');
      await closeButton.trigger('click');

      expect(wrapper.emitted('close')).toBeTruthy();
    });
  });

  describe('Graph Toolbar', () => {
    it('should render layout selection dropdown', () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      const layoutSelect = wrapper.find('.graph-toolbar select');
      expect(layoutSelect.exists()).toBe(true);
    });

    it('should have Force-Directed layout selected by default', () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      expect(wrapper.vm.selectedLayout).toBe('force');
    });

    it('should allow changing layout', async () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      const select = wrapper.find('.graph-toolbar select');
      await select.setValue('hierarchical');

      expect(wrapper.vm.selectedLayout).toBe('hierarchical');
    });

    it('should render search input', () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      const searchInput = wrapper.find('.graph-toolbar input[type="text"]');
      expect(searchInput.exists()).toBe(true);
    });
  });

  describe('Layer Filtering', () => {
    it('should track hidden layers state', () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      expect(wrapper.vm.hiddenLayers).toBeInstanceOf(Set);
      expect(wrapper.vm.hiddenLayers.size).toBe(0);
    });

    it('should toggle layer visibility', async () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      expect(wrapper.vm.hiddenLayers.has('CONTROLLER')).toBe(false);
      
      wrapper.vm.toggleLayer('CONTROLLER');
      
      expect(wrapper.vm.hiddenLayers.has('CONTROLLER')).toBe(true);
    });

    it('should toggle layer back to visible', async () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      wrapper.vm.hiddenLayers.add('SERVICE_JAVA');
      expect(wrapper.vm.hiddenLayers.has('SERVICE_JAVA')).toBe(true);
      
      wrapper.vm.toggleLayer('SERVICE_JAVA');
      
      expect(wrapper.vm.hiddenLayers.has('SERVICE_JAVA')).toBe(false);
    });

    it('should filter nodes based on hidden layers', async () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(wrapper.vm.flowGraphData).not.toBeNull();
      
      const allNodesCount = wrapper.vm.flowGraphData.nodes.length;
      wrapper.vm.hiddenLayers.add('SERVICE_JAVA');
      
      const filteredNodesCount = wrapper.vm.filteredNodes.length;
      expect(filteredNodesCount).toBeLessThan(allNodesCount);
    });
  });

  describe('Search Functionality', () => {
    it('should update search term', async () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      const searchInput = wrapper.find('.graph-toolbar input[type="text"]');
      await searchInput.setValue('UserService');

      expect(wrapper.vm.searchTerm).toBe('UserService');
    });

    it('should clear search term', async () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      wrapper.vm.searchTerm = 'test';
      await wrapper.vm.$nextTick();

      const searchInput = wrapper.find('.graph-toolbar input[type="text"]');
      await searchInput.setValue('');

      expect(wrapper.vm.searchTerm).toBe('');
    });
  });

  describe('Data Loading', () => {
    it('should load flow graph data on mount', async () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(analyzeProjectSpy).toHaveBeenCalled();
    });

    it('should set loading state initially', () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      expect(wrapper.vm.loading).toBe(true);
    });

    it('should clear loading state after data loads', async () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(wrapper.vm.loading).toBe(false);
    });

    it('should display data when loaded successfully', async () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(wrapper.vm.flowGraphData).not.toBeNull();
      expect(wrapper.vm.flowGraphData.nodes.length).toBe(2);
    });

    it('should handle error when loading fails', async () => {
      analyzeProjectSpy.mockRejectedValueOnce(new Error('Network error'));

      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(wrapper.vm.error).not.toBeNull();
    });

    it('should display error message when loading fails', async () => {
      analyzeProjectSpy.mockRejectedValueOnce(new Error('Failed to load'));

      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(wrapper.find('.alert-danger').exists()).toBe(true);
    });
  });

  describe('Node Details Panel', () => {
    it('should not display details initially', () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      expect(wrapper.vm.selectedNode).toBeNull();
    });

    it('should select node when set', async () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const testNode = mockFlowGraphData.nodes[0];
      wrapper.vm.selectedNode = testNode;
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.selectedNode).toEqual(testNode);
    });

    it('should clear selected node', async () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      wrapper.vm.selectedNode = mockFlowGraphData.nodes[0];
      await wrapper.vm.$nextTick();

      wrapper.vm.selectedNode = null;
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.selectedNode).toBeNull();
    });

    it('should get connections for a node', async () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const connections = wrapper.vm.getConnections('1');
      expect(Array.isArray(connections)).toBe(true);
    });
  });

  describe('Available Layers', () => {
    it('should expose available layers from metadata', async () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(wrapper.vm.availableLayers).toEqual(mockFlowGraphData.metadata.layers);
    });

    it('should return empty array when no data', () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      // Before data loads
      expect(wrapper.vm.availableLayers).toEqual([]);
    });
  });

  describe('Layer Color Mapping', () => {
    it('should map layers to correct colors', () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      expect(wrapper.vm.getLayerColor('COMPONENT')).toBe('#10b981');
      expect(wrapper.vm.getLayerColor('SERVICE_TS')).toBe('#3b82f6');
      expect(wrapper.vm.getLayerColor('CONTROLLER')).toBe('#f97316');
    });

    it('should return default color for unknown layers', () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      const color = wrapper.vm.getLayerColor('UNKNOWN_LAYER');
      expect(color).toBe('#6b7280');
    });
  });

  describe('Filtered Nodes and Edges', () => {
    it('should compute filtered nodes', async () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(wrapper.vm.filteredNodes.length).toBeGreaterThan(0);
    });

    it('should compute filtered edges', async () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(wrapper.vm.filteredEdges.length).toBeGreaterThan(0);
    });

    it('should exclude edges when target node is hidden', async () => {
      wrapper = mount(FlowGraphView, {
        global: {
          stubs: {
            Network: true,
            X: true
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const initialEdgeCount = wrapper.vm.filteredEdges.length;
      
      // Hide a layer that has nodes
      wrapper.vm.hiddenLayers.add('SERVICE_JAVA');
      
      const newEdgeCount = wrapper.vm.filteredEdges.length;
      expect(newEdgeCount).toBeLessThanOrEqual(initialEdgeCount);
    });
  });
});
