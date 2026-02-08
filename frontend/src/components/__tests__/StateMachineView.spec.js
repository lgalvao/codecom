import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import StateMachineView from '../StateMachineView.vue';
import { StateMachineService } from '../../services/StateMachineService';

vi.mock('../../services/StateMachineService', () => ({
  StateMachineService: {
    getStateMachines: vi.fn()
  }
}));

describe('StateMachineView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    StateMachineService.getStateMachines.mockResolvedValue([]);
    const wrapper = mount(StateMachineView, {
      props: { filePath: '/test/File.java' }
    });
    
    expect(wrapper.find('.spinner-border').exists()).toBe(true);
  });

  it('renders empty state when no state machines found', async () => {
    StateMachineService.getStateMachines.mockResolvedValue([]);
    
    const wrapper = mount(StateMachineView, {
      props: { filePath: '/test/File.java' }
    });
    
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(wrapper.text()).toContain('No state machines detected');
  });

  it('renders state machine info when data is available', async () => {
    const mockData = [
      {
        variableName: 'status',
        variableType: 'Status',
        states: [
          { id: 'PENDING', label: 'PENDING', line: 2, sourceType: 'ENUM' },
          { id: 'ACTIVE', label: 'ACTIVE', line: 3, sourceType: 'ENUM' }
        ],
        transitions: [
          { id: 't1', from: 'PENDING', to: 'ACTIVE', trigger: 'activate', line: 10 }
        ],
        filePath: '/test/File.java',
        declarationLine: 5
      }
    ];
    
    StateMachineService.getStateMachines.mockResolvedValue(mockData);
    
    const wrapper = mount(StateMachineView, {
      props: { filePath: '/test/File.java' }
    });
    
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(wrapper.text()).toContain('status');
    expect(wrapper.text()).toContain('Status');
    expect(wrapper.text()).toContain('2 states, 1 transitions');
  });

  it('displays multiple state machines', async () => {
    const mockData = [
      {
        variableName: 'status',
        variableType: 'Status',
        states: [],
        transitions: [],
        filePath: '/test/File.java',
        declarationLine: 5
      },
      {
        variableName: 'phase',
        variableType: 'Phase',
        states: [],
        transitions: [],
        filePath: '/test/File.java',
        declarationLine: 10
      }
    ];
    
    StateMachineService.getStateMachines.mockResolvedValue(mockData);
    
    const wrapper = mount(StateMachineView, {
      props: { filePath: '/test/File.java' }
    });
    
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(wrapper.text()).toContain('status');
    expect(wrapper.text()).toContain('phase');
  });

  it('calculates height correctly based on state count', async () => {
    const wrapper = mount(StateMachineView, {
      props: { filePath: '/test/File.java' }
    });
    
    const machine1 = {
      states: [{ id: 'A', label: 'A', line: 1, sourceType: 'ENUM' }]
    };
    const height1 = wrapper.vm.calculateHeight(machine1);
    expect(height1).toBeGreaterThanOrEqual(200);
    
    const machine2 = {
      states: Array(5).fill({ id: 'X', label: 'X', line: 1, sourceType: 'ENUM' })
    };
    const height2 = wrapper.vm.calculateHeight(machine2);
    expect(height2).toBeGreaterThan(height1);
  });

  it('handles service error gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    StateMachineService.getStateMachines.mockRejectedValue(new Error('Network error'));
    
    const wrapper = mount(StateMachineView, {
      props: { filePath: '/test/File.java' }
    });
    
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(wrapper.vm.stateMachines).toEqual([]);
    expect(consoleError).toHaveBeenCalled();
    
    consoleError.mockRestore();
  });

  it('does not load state machines when no file path provided', async () => {
    const wrapper = mount(StateMachineView, {
      props: { filePath: undefined }
    });
    
    await wrapper.vm.$nextTick();
    
    expect(StateMachineService.getStateMachines).not.toHaveBeenCalled();
  });

  it('reloads state machines when file path changes', async () => {
    StateMachineService.getStateMachines.mockResolvedValue([]);
    
    const wrapper = mount(StateMachineView, {
      props: { filePath: '/test/File1.java' }
    });
    
    await wrapper.vm.$nextTick();
    expect(StateMachineService.getStateMachines).toHaveBeenCalledWith('/test/File1.java');
    
    await wrapper.setProps({ filePath: '/test/File2.java' });
    await wrapper.vm.$nextTick();
    
    expect(StateMachineService.getStateMachines).toHaveBeenCalledWith('/test/File2.java');
  });

  it('shows badge with state and transition counts', async () => {
    const mockData = [
      {
        variableName: 'status',
        variableType: 'Status',
        states: [
          { id: 'A', label: 'A', line: 1, sourceType: 'ENUM' },
          { id: 'B', label: 'B', line: 2, sourceType: 'ENUM' },
          { id: 'C', label: 'C', line: 3, sourceType: 'ENUM' }
        ],
        transitions: [
          { id: 't1', from: 'A', to: 'B', trigger: 'next', line: 10 },
          { id: 't2', from: 'B', to: 'C', trigger: 'complete', line: 15 }
        ],
        filePath: '/test/File.java',
        declarationLine: 5
      }
    ];
    
    StateMachineService.getStateMachines.mockResolvedValue(mockData);
    
    const wrapper = mount(StateMachineView, {
      props: { filePath: '/test/File.java' }
    });
    
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(wrapper.text()).toContain('3 states, 2 transitions');
  });

  it('renders SVG diagram for each state machine', async () => {
    const mockData = [
      {
        variableName: 'status',
        variableType: 'Status',
        states: [
          { id: 'A', label: 'A', line: 1, sourceType: 'ENUM' }
        ],
        transitions: [],
        filePath: '/test/File.java',
        declarationLine: 5
      }
    ];
    
    StateMachineService.getStateMachines.mockResolvedValue(mockData);
    
    const wrapper = mount(StateMachineView, {
      props: { filePath: '/test/File.java' }
    });
    
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(wrapper.find('svg.state-diagram').exists()).toBe(true);
  });

  it('displays variable type in header', async () => {
    const mockData = [
      {
        variableName: 'orderState',
        variableType: 'OrderStatus',
        states: [],
        transitions: [],
        filePath: '/test/File.java',
        declarationLine: 5
      }
    ];
    
    StateMachineService.getStateMachines.mockResolvedValue(mockData);
    
    const wrapper = mount(StateMachineView, {
      props: { filePath: '/test/File.java' }
    });
    
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(wrapper.text()).toContain('orderState');
    expect(wrapper.text()).toContain('OrderStatus');
  });

  it('handles empty states array', async () => {
    const mockData = [
      {
        variableName: 'status',
        variableType: 'Status',
        states: [],
        transitions: [],
        filePath: '/test/File.java',
        declarationLine: 5
      }
    ];
    
    StateMachineService.getStateMachines.mockResolvedValue(mockData);
    
    const wrapper = mount(StateMachineView, {
      props: { filePath: '/test/File.java' }
    });
    
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(wrapper.text()).toContain('0 states, 0 transitions');
  });

  it('has correct CSS classes for styling', () => {
    const wrapper = mount(StateMachineView, {
      props: { filePath: '/test/File.java' }
    });
    
    expect(wrapper.find('.state-machine-view').exists()).toBe(true);
  });
});
