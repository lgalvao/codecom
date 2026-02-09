/**
 * Tests for FeatureSliceManager component
 * Testing FR.33-FR.35: Feature Slice Management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import FeatureSliceManager from '../FeatureSliceManager.vue';
import * as FeatureSliceService from '../../services/FeatureSliceService';

// Mock BootstrapVueNext components
const BFormSelect = {
  template: '<select v-bind="$attrs" @change="$emit(\'change\', $event)"><slot /></select>',
  inheritAttrs: true
};

const BButton = {
  template: '<button v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></button>'
};

const BOffcanvas = {
  template: '<div v-if="modelValue" class="offcanvas"><slot /></div>',
  props: ['modelValue', 'title', 'placement', 'style']
};

const BDropdown = {
  template: '<div class="dropdown"><slot name="button-content" /><div class="dropdown-menu"><slot /></div></div>',
  props: ['variant', 'noCaret', 'size']
};

const BDropdownItem = {
  template: '<button class="dropdown-item" @click="$emit(\'click\', $event)"><slot /></button>',
  props: ['variant']
};

const BDropdownDivider = {
  template: '<div class="dropdown-divider"></div>'
};

// Mock icons
const mockIcon = { template: '<span></span>', props: ['size'] };

describe('FeatureSliceManager.vue', () => {
  const mockSlices = [
    {
      id: '1',
      name: 'Authentication',
      description: 'User authentication and authorization',
      nodeCount: 15,
      fileCount: 8
    },
    {
      id: '2',
      name: 'Payment',
      description: 'Payment processing',
      nodeCount: 10,
      fileCount: 5
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(FeatureSliceService, 'getSlices').mockResolvedValue(mockSlices);
    vi.spyOn(FeatureSliceService, 'createSlice').mockResolvedValue({ id: '3', name: 'New Slice' });
    vi.spyOn(FeatureSliceService, 'deleteSlice').mockResolvedValue({});
    vi.spyOn(FeatureSliceService, 'updateSlice').mockResolvedValue({});
  });

  it('renders the component', () => {
    const wrapper = mount(FeatureSliceManager, {
      props: { rootPath: '/test' },
      global: {
        components: {
          BFormSelect,
          BButton,
          BOffcanvas,
          BDropdown,
          BDropdownItem,
          BDropdownDivider,
          LayersIcon: mockIcon,
          PlusIcon: mockIcon,
          MoreVerticalIcon: mockIcon,
          CheckIcon: mockIcon,
          EyeIcon: mockIcon,
          ZoomInIcon: mockIcon,
          EditIcon: mockIcon,
          TrashIcon: mockIcon
        }
      }
    });

    expect(wrapper.find('.feature-slice-manager').exists()).toBe(true);
  });

  it('loads slices on mount', async () => {
    const wrapper = mount(FeatureSliceManager, {
      props: { rootPath: '/test' },
      global: {
        components: { BFormSelect, BButton, BOffcanvas, BDropdown, BDropdownItem, BDropdownDivider }
      }
    });

    await vi.waitFor(() => {
      expect(FeatureSliceService.getSlices).toHaveBeenCalled();
      expect(wrapper.vm.slices).toHaveLength(2);
    });
  });

  it('displays slice selector dropdown', () => {
    const wrapper = mount(FeatureSliceManager, {
      props: { rootPath: '/test' },
      global: {
        components: { BFormSelect, BButton, BOffcanvas, BDropdown, BDropdownItem, BDropdownDivider }
      }
    });

    expect(wrapper.find('.slice-selector').exists()).toBe(true);
    expect(wrapper.findComponent(BFormSelect).exists()).toBe(true);
  });

  it('opens manager when button is clicked', async () => {
    const wrapper = mount(FeatureSliceManager, {
      props: { rootPath: '/test' },
      global: {
        components: { 
          BFormSelect, 
          BButton, 
          BOffcanvas, 
          BDropdown, 
          BDropdownItem, 
          BDropdownDivider,
          LayersIcon: mockIcon
        }
      }
    });

    const managerButton = wrapper.findAll('button')[0];
    await managerButton.trigger('click');

    expect(wrapper.vm.showManager).toBe(true);
  });

  it('displays active slice info', async () => {
    const wrapper = mount(FeatureSliceManager, {
      props: { rootPath: '/test' },
      global: {
        components: { BFormSelect, BButton, BOffcanvas, BDropdown, BDropdownItem, BDropdownDivider }
      }
    });

    await vi.waitFor(() => {
      wrapper.vm.slices = mockSlices;
    });

    wrapper.vm.activeSliceId = '1';
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.slice-info').exists()).toBe(true);
    expect(wrapper.text()).toContain('15 nodes');
    expect(wrapper.text()).toContain('8 files');
  });

  it('shows create new slice button in manager', async () => {
    const wrapper = mount(FeatureSliceManager, {
      props: { rootPath: '/test' },
      global: {
        components: { 
          BFormSelect, 
          BButton, 
          BOffcanvas, 
          BDropdown, 
          BDropdownItem, 
          BDropdownDivider,
          PlusIcon: mockIcon
        }
      }
    });

    wrapper.vm.showManager = true;
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Create New Slice');
  });

  it('displays empty state when no slices exist', async () => {
    vi.spyOn(FeatureSliceService, 'getSlices').mockResolvedValue([]);
    
    const wrapper = mount(FeatureSliceManager, {
      props: { rootPath: '/test' },
      global: {
        components: { BFormSelect, BButton, BOffcanvas, BDropdown, BDropdownItem, BDropdownDivider }
      }
    });

    wrapper.vm.showManager = true;
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('No slices yet');
    });
  });

  it('displays loading state while fetching slices', () => {
    const wrapper = mount(FeatureSliceManager, {
      props: { rootPath: '/test' },
      global: {
        components: { BFormSelect, BButton, BOffcanvas, BDropdown, BDropdownItem, BDropdownDivider }
      }
    });

    wrapper.vm.showManager = true;
    wrapper.vm.loading = true;

    expect(wrapper.find('.spinner-border').exists()).toBe(true);
  });

  it('displays slice list when slices are loaded', async () => {
    const wrapper = mount(FeatureSliceManager, {
      props: { rootPath: '/test' },
      global: {
        components: { 
          BFormSelect, 
          BButton, 
          BOffcanvas, 
          BDropdown, 
          BDropdownItem, 
          BDropdownDivider,
          MoreVerticalIcon: mockIcon
        }
      }
    });

    await vi.waitFor(() => {
      wrapper.vm.slices = mockSlices;
    });

    wrapper.vm.showManager = true;
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.slice-list').exists()).toBe(true);
    expect(wrapper.text()).toContain('Authentication');
    expect(wrapper.text()).toContain('Payment');
  });

  it('shows slice details in cards', async () => {
    const wrapper = mount(FeatureSliceManager, {
      props: { rootPath: '/test' },
      global: {
        components: { 
          BFormSelect, 
          BButton, 
          BOffcanvas, 
          BDropdown, 
          BDropdownItem, 
          BDropdownDivider,
          MoreVerticalIcon: mockIcon
        }
      }
    });

    await vi.waitFor(() => {
      wrapper.vm.slices = mockSlices;
    });

    wrapper.vm.showManager = true;
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('User authentication and authorization');
    expect(wrapper.text()).toContain('15 nodes');
    expect(wrapper.text()).toContain('8 files');
  });

  it('highlights active slice in the list', async () => {
    const wrapper = mount(FeatureSliceManager, {
      props: { rootPath: '/test' },
      global: {
        components: { 
          BFormSelect, 
          BButton, 
          BOffcanvas, 
          BDropdown, 
          BDropdownItem, 
          BDropdownDivider,
          MoreVerticalIcon: mockIcon
        }
      }
    });

    await vi.waitFor(() => {
      wrapper.vm.slices = mockSlices;
    });

    wrapper.vm.activeSliceId = '1';
    wrapper.vm.showManager = true;
    await wrapper.vm.$nextTick();

    const activeCard = wrapper.find('.slice-card.active');
    expect(activeCard.exists()).toBe(true);
  });

  it('activates slice when activate option is clicked', async () => {
    const wrapper = mount(FeatureSliceManager, {
      props: { rootPath: '/test' },
      global: {
        components: { 
          BFormSelect, 
          BButton, 
          BOffcanvas, 
          BDropdown, 
          BDropdownItem, 
          BDropdownDivider,
          CheckIcon: mockIcon,
          MoreVerticalIcon: mockIcon
        }
      }
    });

    await vi.waitFor(() => {
      wrapper.vm.slices = mockSlices;
    });

    wrapper.vm.showManager = true;
    await wrapper.vm.$nextTick();

    wrapper.vm.activateSlice('2');
    expect(wrapper.vm.activeSliceId).toBe('2');
  });

  it('emits slice-change event when slice changes', async () => {
    const wrapper = mount(FeatureSliceManager, {
      props: { rootPath: '/test' },
      global: {
        components: { BFormSelect, BButton, BOffcanvas, BDropdown, BDropdownItem, BDropdownDivider }
      }
    });

    await vi.waitFor(() => {
      wrapper.vm.slices = mockSlices;
    });

    wrapper.vm.onSliceChange();

    expect(wrapper.emitted('slice-change')).toBeTruthy();
  });

  it('computes slice options correctly', async () => {
    const wrapper = mount(FeatureSliceManager, {
      props: { rootPath: '/test' },
      global: {
        components: { BFormSelect, BButton, BOffcanvas, BDropdown, BDropdownItem, BDropdownDivider }
      }
    });

    await vi.waitFor(() => {
      wrapper.vm.slices = mockSlices;
    });

    const options = wrapper.vm.sliceOptions;
    expect(options).toHaveLength(2);
    expect(options[0].value).toBe('1');
    expect(options[0].text).toBe('Authentication');
  });

  it('handles create slice action', async () => {
    const wrapper = mount(FeatureSliceManager, {
      props: { rootPath: '/test' },
      global: {
        components: { 
          BFormSelect, 
          BButton, 
          BOffcanvas, 
          BDropdown, 
          BDropdownItem, 
          BDropdownDivider,
          PlusIcon: mockIcon
        }
      }
    });

    wrapper.vm.showManager = true;
    await wrapper.vm.$nextTick();

    const createButton = wrapper.findAll('button').find(b => b.text().includes('Create New Slice'));
    await createButton.trigger('click');

    expect(wrapper.vm.showCreateDialog).toBe(true);
  });

  it('handles edit slice action', async () => {
    const wrapper = mount(FeatureSliceManager, {
      props: { rootPath: '/test' },
      global: {
        components: { 
          BFormSelect, 
          BButton, 
          BOffcanvas, 
          BDropdown, 
          BDropdownItem, 
          BDropdownDivider,
          EditIcon: mockIcon,
          MoreVerticalIcon: mockIcon
        }
      }
    });

    await vi.waitFor(() => {
      wrapper.vm.slices = mockSlices;
    });

    wrapper.vm.editSlice(mockSlices[0]);

    expect(wrapper.vm.editingSlice).toEqual(mockSlices[0]);
  });

  it('handles delete slice confirmation', async () => {
    const wrapper = mount(FeatureSliceManager, {
      props: { rootPath: '/test' },
      global: {
        components: { 
          BFormSelect, 
          BButton, 
          BOffcanvas, 
          BDropdown, 
          BDropdownItem, 
          BDropdownDivider,
          TrashIcon: mockIcon,
          MoreVerticalIcon: mockIcon
        }
      }
    });

    await vi.waitFor(() => {
      wrapper.vm.slices = mockSlices;
    });

    wrapper.vm.confirmDelete('1');

    expect(wrapper.vm.deleteSliceId).toBe('1');
  });

  it('returns active slice when one is selected', async () => {
    const wrapper = mount(FeatureSliceManager, {
      props: { rootPath: '/test' },
      global: {
        components: { BFormSelect, BButton, BOffcanvas, BDropdown, BDropdownItem, BDropdownDivider }
      }
    });

    await vi.waitFor(() => {
      wrapper.vm.slices = mockSlices;
    });

    wrapper.vm.activeSliceId = '1';
    
    expect(wrapper.vm.activeSlice).toEqual(mockSlices[0]);
  });

  it('returns null when no slice is selected', () => {
    const wrapper = mount(FeatureSliceManager, {
      props: { rootPath: '/test' },
      global: {
        components: { BFormSelect, BButton, BOffcanvas, BDropdown, BDropdownItem, BDropdownDivider }
      }
    });

    wrapper.vm.activeSliceId = null;
    
    expect(wrapper.vm.activeSlice).toBeNull();
  });
});
