/**
 * Tests for FeatureSliceManager component
 * Testing slice management CRUD operations and state management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import FeatureSliceManager from '../FeatureSliceManager.vue';
import * as featureSliceService from '../../services/FeatureSliceService';
import * as knowledgeGraphService from '../../services/KnowledgeGraphService';

// Mock services
vi.mock('../../services/FeatureSliceService', () => ({
  default: {
    getAllSlices: vi.fn(),
    getSlice: vi.fn(),
    createSlice: vi.fn(),
    updateSlice: vi.fn(),
    deleteSlice: vi.fn(),
    expandSlice: vi.fn(),
    getSliceFiles: vi.fn()
  }
}));

vi.mock('../../services/KnowledgeGraphService', () => ({
  default: {
    searchNodes: vi.fn()
  }
}));

describe('FeatureSliceManager.vue', () => {
  let wrapper;
  let getAllSlicesSpy;
  let getSliceSpy;
  let createSliceSpy;
  let updateSliceSpy;
  let deleteSliceSpy;
  let expandSliceSpy;
  let getSliceFilesSpy;
  let searchNodesSpy;

  const mockSlices = [
    {
      id: 1,
      name: 'User Management',
      description: 'User CRUD operations',
      nodeCount: 15,
      fileCount: 4
    },
    {
      id: 2,
      name: 'Authentication',
      description: 'Auth and login flows',
      nodeCount: 8,
      fileCount: 3
    }
  ];

  const mockSliceDetail = {
    id: 1,
    name: 'User Management',
    description: 'User CRUD operations',
    nodes: [
      {
        id: 1,
        name: 'UserController',
        nodeType: 'CLASS',
        filePath: '/src/controllers/UserController.java',
        lineNumber: 10
      },
      {
        id: 2,
        name: 'UserService',
        nodeType: 'CLASS',
        filePath: '/src/services/UserService.java',
        lineNumber: 5
      }
    ]
  };

  const mockSearchResults = [
    {
      id: 1,
      name: 'UserController',
      nodeType: 'CLASS',
      filePath: '/src/controllers/UserController.java'
    },
    {
      id: 2,
      name: 'UserService',
      nodeType: 'CLASS',
      filePath: '/src/services/UserService.java'
    }
  ];

  beforeEach(() => {
    getAllSlicesSpy = vi.spyOn(featureSliceService.default, 'getAllSlices')
      .mockResolvedValue(mockSlices);
    getSliceSpy = vi.spyOn(featureSliceService.default, 'getSlice')
      .mockResolvedValue(mockSliceDetail);
    createSliceSpy = vi.spyOn(featureSliceService.default, 'createSlice')
      .mockResolvedValue({ id: 3, ...mockSlices[0] });
    updateSliceSpy = vi.spyOn(featureSliceService.default, 'updateSlice')
      .mockResolvedValue(mockSlices[0]);
    deleteSliceSpy = vi.spyOn(featureSliceService.default, 'deleteSlice')
      .mockResolvedValue({ success: true });
    expandSliceSpy = vi.spyOn(featureSliceService.default, 'expandSlice')
      .mockResolvedValue(mockSliceDetail);
    getSliceFilesSpy = vi.spyOn(featureSliceService.default, 'getSliceFiles')
      .mockResolvedValue(['/path/to/file1.java', '/path/to/file2.java']);
    searchNodesSpy = vi.spyOn(knowledgeGraphService.default, 'searchNodes')
      .mockResolvedValue(mockSearchResults);

    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn()
    };

    // Mock window.confirm
    global.confirm = vi.fn(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the component', async () => {
      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      expect(wrapper.find('.feature-slice-manager').exists()).toBe(true);
    });

    it('should render slice selector dropdown', async () => {
      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: { template: '<select></select>' },
            BButton: { template: '<button><slot /></button>' },
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      const selector = wrapper.find('.slice-selector');
      expect(selector.exists()).toBe(true);
    });
  });

  describe('Slice Loading', () => {
    it('should load slices on mount', async () => {
      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      expect(getAllSlicesSpy).toHaveBeenCalled();
      expect(wrapper.vm.slices).toEqual(mockSlices);
    });

    it('should set loading state while fetching slices', async () => {
      getAllSlicesSpy.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve(mockSlices), 200))
      );

      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      expect(wrapper.vm.loading).toBe(true);
      await new Promise(resolve => setTimeout(resolve, 250));
      expect(wrapper.vm.loading).toBe(false);
    });

    it('should handle error when loading slices', async () => {
      getAllSlicesSpy.mockRejectedValueOnce(new Error('Network error'));

      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      expect(wrapper.vm.slices).toEqual([]);
    });

    it('should restore active slice from localStorage on mount', async () => {
      global.localStorage.getItem = vi.fn(() => '1');

      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      expect(wrapper.vm.activeSliceId).toBe(1);
    });
  });

  describe('Active Slice Selection', () => {
    it('should compute active slice from activeSliceId', async () => {
      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      wrapper.vm.activeSliceId = 1;
      expect(wrapper.vm.activeSlice).toEqual(mockSlices[0]);
    });

    it('should return null when no active slice', async () => {
      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      wrapper.vm.activeSliceId = null;
      expect(wrapper.vm.activeSlice).toBeNull();
    });

    it('should activate slice and emit sliceChange event', async () => {
      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      await wrapper.vm.activateSlice(1);
      await flushPromises();

      expect(wrapper.vm.activeSliceId).toBe(1);
      expect(wrapper.emitted('sliceChange')).toBeTruthy();
      expect(wrapper.emitted('sliceChange')[0][0]).toBe(1);
    });

    it('should clear active slice and save to localStorage', async () => {
      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      wrapper.vm.activeSliceId = 1;
      await wrapper.vm.onSliceChange();
      await flushPromises();

      wrapper.vm.activeSliceId = null;
      await wrapper.vm.onSliceChange();

      expect(global.localStorage.removeItem).toHaveBeenCalledWith('activeFeatureSlice');
      expect(wrapper.emitted('sliceChange')[1][0]).toBeNull();
    });
  });

  describe('Slice Options', () => {
    it('should compute slice options from slices', async () => {
      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      expect(wrapper.vm.sliceOptions).toEqual([
        { value: 1, text: 'User Management' },
        { value: 2, text: 'Authentication' }
      ]);
    });
  });

  describe('Create Slice', () => {
    it('should show create dialog when button clicked', async () => {
      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: { template: '<div><slot /></div>' },
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      wrapper.vm.showCreateDialog = true;
      expect(wrapper.vm.showCreateDialog).toBe(true);
    });

    it('should create a new slice with valid data', async () => {
      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      wrapper.vm.newSlice = {
        name: 'New Feature',
        description: 'A new feature',
        seedNodeIds: [1, 2],
        expansionDepth: 2
      };

      await wrapper.vm.createSlice();
      await flushPromises();

      expect(createSliceSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Feature',
          description: 'A new feature',
          seedNodeIds: [1, 2],
          expansionDepth: 2
        })
      );
      expect(wrapper.vm.showCreateDialog).toBe(false);
    });

    it('should reset form after creating slice', async () => {
      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      wrapper.vm.newSlice = {
        name: 'Test',
        description: 'Test',
        seedNodeIds: [1],
        expansionDepth: 1
      };
      wrapper.vm.nodeSearchQuery = 'test';

      await wrapper.vm.createSlice();
      await flushPromises();

      expect(wrapper.vm.newSlice.name).toBe('');
      expect(wrapper.vm.nodeSearchQuery).toBe('');
    });

    it('should handle errors when creating slice', async () => {
      createSliceSpy.mockRejectedValueOnce({
        response: { data: { message: 'Invalid slice data' } }
      });

      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      wrapper.vm.newSlice = {
        name: 'Invalid',
        description: 'Invalid',
        seedNodeIds: [],
        expansionDepth: null
      };

      await wrapper.vm.createSlice();
      await flushPromises();

      expect(createSliceSpy).toHaveBeenCalled();
    });
  });

  describe('Edit Slice', () => {
    it('should open edit dialog with slice data', async () => {
      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      wrapper.vm.editSlice(mockSlices[0]);

      expect(wrapper.vm.editingSlice.id).toBe(1);
      expect(wrapper.vm.editingSlice.name).toBe('User Management');
      expect(wrapper.vm.editingSlice.description).toBe('User CRUD operations');
      expect(wrapper.vm.showEditDialog).toBe(true);
    });

    it('should update slice with new data', async () => {
      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      wrapper.vm.editingSlice = {
        id: 1,
        name: 'Updated User Management',
        description: 'Updated description'
      };

      await wrapper.vm.updateSlice();
      await flushPromises();

      expect(updateSliceSpy).toHaveBeenCalledWith(
        1,
        'Updated User Management',
        'Updated description'
      );
      expect(wrapper.vm.showEditDialog).toBe(false);
    });
  });

  describe('Delete Slice', () => {
    it('should confirm before deleting slice', async () => {
      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      await wrapper.vm.confirmDelete(1);
      await flushPromises();

      expect(global.confirm).toHaveBeenCalled();
      expect(deleteSliceSpy).toHaveBeenCalledWith(1);
    });

    it('should not delete slice when user cancels confirmation', async () => {
      global.confirm = vi.fn(() => false);

      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      await wrapper.vm.confirmDelete(1);

      expect(deleteSliceSpy).not.toHaveBeenCalled();
    });

    it('should clear active slice when deleted slice was active', async () => {
      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      wrapper.vm.activeSliceId = 1;
      await wrapper.vm.confirmDelete(1);
      await flushPromises();

      expect(wrapper.vm.activeSliceId).toBeNull();
    });
  });

  describe('Search Nodes', () => {
    it('should not search when query is too short', async () => {
      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      wrapper.vm.nodeSearchQuery = 'a';
      await wrapper.vm.searchNodes();

      expect(searchNodesSpy).not.toHaveBeenCalled();
      expect(wrapper.vm.searchResults).toEqual([]);
    });

    it('should search nodes when query is valid', async () => {
      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      wrapper.vm.nodeSearchQuery = 'User';
      await wrapper.vm.searchNodes();

      expect(searchNodesSpy).toHaveBeenCalledWith('User');
      expect(wrapper.vm.searchResults).toEqual(mockSearchResults);
    });
  });

  describe('Toggle Seed Nodes', () => {
    it('should add node to seed nodes', async () => {
      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      wrapper.vm.toggleSeedNode(1);

      expect(wrapper.vm.newSlice.seedNodeIds).toContain(1);
    });

    it('should remove node from seed nodes when already added', async () => {
      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      wrapper.vm.newSlice.seedNodeIds = [1];
      wrapper.vm.toggleSeedNode(1);

      expect(wrapper.vm.newSlice.seedNodeIds).not.toContain(1);
    });
  });

  describe('Expand Slice', () => {
    it('should open expand dialog with slice ID', async () => {
      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      wrapper.vm.expandSliceDialog(1);

      expect(wrapper.vm.expandParams.sliceId).toBe(1);
      expect(wrapper.vm.showExpandDialog).toBe(true);
    });

    it('should expand slice with correct parameters', async () => {
      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      wrapper.vm.expandParams = {
        sliceId: 1,
        depth: 2,
        includeCallers: true,
        includeCallees: false,
        includeInheritance: true
      };

      await wrapper.vm.expandSlice();
      await flushPromises();

      expect(expandSliceSpy).toHaveBeenCalledWith(1, {
        depth: 2,
        includeCallers: true,
        includeCallees: false,
        includeInheritance: true
      });
      expect(wrapper.vm.showExpandDialog).toBe(false);
    });
  });

  describe('View Slice Details', () => {
    it('should load and display slice details', async () => {
      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      await wrapper.vm.viewSliceDetails(1);
      await flushPromises();

      expect(getSliceSpy).toHaveBeenCalledWith(1);
      expect(wrapper.vm.selectedSliceDetail).toEqual(mockSliceDetail);
      expect(wrapper.vm.showDetailsModal).toBe(true);
    });

    it('should compute unique files from nodes', async () => {
      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      const uniqueFiles = wrapper.vm.uniqueFiles(mockSliceDetail.nodes);

      expect(uniqueFiles.length).toBe(2);
      expect(uniqueFiles).toContain('/src/controllers/UserController.java');
      expect(uniqueFiles).toContain('/src/services/UserService.java');
    });
  });

  describe('Slice Files', () => {
    it('should fetch slice files when slice is activated', async () => {
      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      await wrapper.vm.activateSlice(1);
      await flushPromises();

      expect(getSliceFilesSpy).toHaveBeenCalledWith(1);
      expect(wrapper.emitted('filesChange')).toBeTruthy();
    });

    it('should emit empty files when slice is cleared', async () => {
      wrapper = mount(FeatureSliceManager, {
        global: {
          stubs: {
            BFormSelect: true,
            BButton: true,
            BOffcanvas: true,
            BModal: true,
            BFormGroup: true,
            BFormInput: true,
            BFormTextarea: true,
            BFormCheckbox: true,
            BDropdown: true,
            BDropdownItem: true,
            BDropdownDivider: true,
            LayersIcon: true,
            PlusIcon: true,
            MoreVerticalIcon: true,
            CheckIcon: true,
            EyeIcon: true,
            ZoomInIcon: true,
            EditIcon: true,
            TrashIcon: true
          }
        }
      });

      await flushPromises();

      wrapper.vm.activeSliceId = null;
      await wrapper.vm.onSliceChange();

      expect(wrapper.emitted('filesChange')[0][0]).toEqual([]);
    });
  });
});
