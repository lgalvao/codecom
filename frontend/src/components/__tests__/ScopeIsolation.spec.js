import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ScopeIsolation from '../ScopeIsolation.vue';
import { Focus, X } from 'lucide-vue-next';

describe('ScopeIsolation.vue', () => {
  const mockSymbols = [
    { name: 'getUserById', type: 'METHOD', line: 10, endLine: 15 },
    { name: 'UserService', type: 'CLASS', line: 5, endLine: 50 },
    { name: 'updateUser', type: 'METHOD', line: 20, endLine: 30 },
    { name: 'UserRepository', type: 'INTERFACE', line: 3, endLine: 8 },
    { name: 'myFunction', type: 'FUNCTION', line: 40, endLine: 45 },
    { name: 'userId', type: 'VARIABLE', line: 12 } // Should be filtered out
  ];

  beforeEach(() => {
    // Reset any state if needed
  });

  describe('Component Rendering', () => {
    it('renders the panel with header', () => {
      const wrapper = mount(ScopeIsolation, {
        props: { symbols: [], currentFile: null }
      });

      expect(wrapper.text()).toContain('Scope Isolation');
      expect(wrapper.text()).toContain('Focus on a specific function or class');
      expect(wrapper.findComponent(Focus).exists()).toBe(true);
    });

    it('shows empty state when no symbols available', () => {
      const wrapper = mount(ScopeIsolation, {
        props: { symbols: [], currentFile: null }
      });

      expect(wrapper.text()).toContain('No symbols available for isolation');
    });

    it('displays symbol list when symbols are provided', () => {
      const wrapper = mount(ScopeIsolation, {
        props: { symbols: mockSymbols, currentFile: 'test.java' }
      });

      // Should filter and show only CLASS, METHOD, FUNCTION, INTERFACE
      const buttons = wrapper.findAll('button.btn-outline-secondary');
      expect(buttons.length).toBe(5); // Excludes VARIABLE
    });

    it('displays symbol types correctly', () => {
      const wrapper = mount(ScopeIsolation, {
        props: { symbols: mockSymbols, currentFile: 'test.java' }
      });

      expect(wrapper.text()).toContain('METHOD');
      expect(wrapper.text()).toContain('CLASS');
      expect(wrapper.text()).toContain('INTERFACE');
      expect(wrapper.text()).toContain('FUNCTION');
    });

    it('displays symbol names', () => {
      const wrapper = mount(ScopeIsolation, {
        props: { symbols: mockSymbols, currentFile: 'test.java' }
      });

      expect(wrapper.text()).toContain('getUserById');
      expect(wrapper.text()).toContain('UserService');
      expect(wrapper.text()).toContain('updateUser');
    });

    it('displays line numbers', () => {
      const wrapper = mount(ScopeIsolation, {
        props: { symbols: mockSymbols, currentFile: 'test.java' }
      });

      expect(wrapper.text()).toContain('Line 10');
      expect(wrapper.text()).toContain('Line 5');
      expect(wrapper.text()).toContain('Line 20');
    });
  });

  describe('Symbol Filtering', () => {
    it('filters symbols to show only relevant types', () => {
      const wrapper = mount(ScopeIsolation, {
        props: { symbols: mockSymbols, currentFile: 'test.java' }
      });

      const symbolOptions = wrapper.vm.symbolOptions;
      
      // Should only include METHOD, CLASS, FUNCTION, INTERFACE
      expect(symbolOptions.length).toBe(5);
      expect(symbolOptions.every(s => 
        ['METHOD', 'CLASS', 'FUNCTION', 'INTERFACE'].includes(s.type)
      )).toBe(true);
    });

    it('excludes VARIABLE type symbols', () => {
      const wrapper = mount(ScopeIsolation, {
        props: { symbols: mockSymbols, currentFile: 'test.java' }
      });

      const symbolOptions = wrapper.vm.symbolOptions;
      
      expect(symbolOptions.find(s => s.type === 'VARIABLE')).toBeUndefined();
    });

    it('handles symbols with only excluded types', () => {
      const variablesOnly = [
        { name: 'x', type: 'VARIABLE', line: 1 },
        { name: 'y', type: 'VARIABLE', line: 2 }
      ];

      const wrapper = mount(ScopeIsolation, {
        props: { symbols: variablesOnly, currentFile: 'test.java' }
      });

      expect(wrapper.vm.symbolOptions.length).toBe(0);
      expect(wrapper.text()).toContain('No symbols available for isolation');
    });
  });

  describe('Isolation Activation', () => {
    it('activates isolation when symbol is clicked', async () => {
      const wrapper = mount(ScopeIsolation, {
        props: { symbols: mockSymbols, currentFile: 'test.java' }
      });

      const buttons = wrapper.findAll('button.btn-outline-secondary');
      await buttons[0].trigger('click');

      expect(wrapper.vm.isActive).toBe(true);
      expect(wrapper.vm.isolatedSymbol).toEqual(mockSymbols[0]);
    });

    it('emits isolate event when symbol is activated', async () => {
      const wrapper = mount(ScopeIsolation, {
        props: { symbols: mockSymbols, currentFile: 'test.java' }
      });

      const buttons = wrapper.findAll('button.btn-outline-secondary');
      await buttons[0].trigger('click');

      expect(wrapper.emitted('isolate')).toBeTruthy();
      expect(wrapper.emitted('isolate')[0][0]).toEqual(mockSymbols[0]);
    });

    it('shows active isolation UI after activation', async () => {
      const wrapper = mount(ScopeIsolation, {
        props: { symbols: mockSymbols, currentFile: 'test.java' }
      });

      const buttons = wrapper.findAll('button.btn-outline-secondary');
      await buttons[0].trigger('click');

      expect(wrapper.text()).toContain('Isolating:');
      expect(wrapper.text()).toContain('getUserById');
      expect(wrapper.text()).toContain('Lines 10-15');
    });

    it('hides symbol selection list when isolation is active', async () => {
      const wrapper = mount(ScopeIsolation, {
        props: { symbols: mockSymbols, currentFile: 'test.java' }
      });

      const buttons = wrapper.findAll('button.btn-outline-secondary');
      await buttons[0].trigger('click');

      // Selection area should be hidden
      expect(wrapper.find('.selection-area').exists()).toBe(false);
      expect(wrapper.find('.isolation-active').exists()).toBe(true);
    });

    it('displays clear button when isolation is active', async () => {
      const wrapper = mount(ScopeIsolation, {
        props: { symbols: mockSymbols, currentFile: 'test.java' }
      });

      const buttons = wrapper.findAll('button.btn-outline-secondary');
      await buttons[0].trigger('click');

      expect(wrapper.findComponent(X).exists()).toBe(true);
    });
  });

  describe('Isolation Clearing', () => {
    it('clears isolation when clear button is clicked', async () => {
      const wrapper = mount(ScopeIsolation, {
        props: { symbols: mockSymbols, currentFile: 'test.java' }
      });

      // Activate isolation
      const activateButtons = wrapper.findAll('button.btn-outline-secondary');
      await activateButtons[0].trigger('click');

      // Clear isolation
      const clearButton = wrapper.find('button.btn-outline-primary');
      await clearButton.trigger('click');

      expect(wrapper.vm.isActive).toBe(false);
      expect(wrapper.vm.isolatedSymbol).toBeNull();
    });

    it('emits clear event when isolation is cleared', async () => {
      const wrapper = mount(ScopeIsolation, {
        props: { symbols: mockSymbols, currentFile: 'test.java' }
      });

      // Activate isolation
      const activateButtons = wrapper.findAll('button.btn-outline-secondary');
      await activateButtons[0].trigger('click');

      // Clear isolation
      const clearButton = wrapper.find('button.btn-outline-primary');
      await clearButton.trigger('click');

      expect(wrapper.emitted('clear')).toBeTruthy();
    });

    it('shows symbol selection list after clearing isolation', async () => {
      const wrapper = mount(ScopeIsolation, {
        props: { symbols: mockSymbols, currentFile: 'test.java' }
      });

      // Activate isolation
      const activateButtons = wrapper.findAll('button.btn-outline-secondary');
      await activateButtons[0].trigger('click');

      // Clear isolation
      const clearButton = wrapper.find('button.btn-outline-primary');
      await clearButton.trigger('click');

      expect(wrapper.find('.selection-area').exists()).toBe(true);
      expect(wrapper.find('.isolation-active').exists()).toBe(false);
    });
  });

  describe('Exposed Methods', () => {
    it('exposes isolatedSymbol ref', () => {
      const wrapper = mount(ScopeIsolation, {
        props: { symbols: mockSymbols, currentFile: 'test.java' }
      });

      expect(wrapper.vm.isolatedSymbol).toBeDefined();
    });

    it('exposes isActive ref', () => {
      const wrapper = mount(ScopeIsolation, {
        props: { symbols: mockSymbols, currentFile: 'test.java' }
      });

      expect(wrapper.vm.isActive).toBeDefined();
    });

    it('exposes activateIsolation method', () => {
      const wrapper = mount(ScopeIsolation, {
        props: { symbols: mockSymbols, currentFile: 'test.java' }
      });

      expect(wrapper.vm.activateIsolation).toBeDefined();
      expect(typeof wrapper.vm.activateIsolation).toBe('function');
    });

    it('exposes clearIsolation method', () => {
      const wrapper = mount(ScopeIsolation, {
        props: { symbols: mockSymbols, currentFile: 'test.java' }
      });

      expect(wrapper.vm.clearIsolation).toBeDefined();
      expect(typeof wrapper.vm.clearIsolation).toBe('function');
    });
  });

  describe('Symbol Display', () => {
    it('shows endLine when available', async () => {
      const wrapper = mount(ScopeIsolation, {
        props: { symbols: mockSymbols, currentFile: 'test.java' }
      });

      wrapper.vm.activateIsolation(mockSymbols[0]);
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('Lines 10-15');
    });

    it('shows question mark for unknown endLine', async () => {
      const symbolWithoutEnd = { name: 'test', type: 'METHOD', line: 10 };
      
      const wrapper = mount(ScopeIsolation, {
        props: { symbols: [symbolWithoutEnd], currentFile: 'test.java' }
      });

      wrapper.vm.activateIsolation(symbolWithoutEnd);
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('Lines 10-?');
    });
  });

  describe('Multiple Isolations', () => {
    it('switches to new symbol when activating while another is active', async () => {
      const wrapper = mount(ScopeIsolation, {
        props: { symbols: mockSymbols, currentFile: 'test.java' }
      });

      // Activate first symbol
      wrapper.vm.activateIsolation(mockSymbols[0]);
      expect(wrapper.vm.isolatedSymbol).toEqual(mockSymbols[0]);

      // Activate second symbol
      wrapper.vm.activateIsolation(mockSymbols[2]);
      expect(wrapper.vm.isolatedSymbol).toEqual(mockSymbols[2]);
      expect(wrapper.vm.isActive).toBe(true);
    });
  });
});
