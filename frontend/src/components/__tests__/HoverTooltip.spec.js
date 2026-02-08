import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import HoverTooltip from '../HoverTooltip.vue';
import axios from 'axios';

vi.mock('axios');

describe('HoverTooltip.vue', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.useRealTimers();
  });

  describe('Component Initialization', () => {
    it('renders without visible tooltip initially', () => {
      wrapper = mount(HoverTooltip, {
        props: {
          enabled: true,
          currentFile: null
        }
      });

      expect(wrapper.vm.tooltipVisible).toBe(false);
      expect(wrapper.find('.hover-tooltip').exists()).toBe(false);
    });

    it('does not show tooltip when disabled', async () => {
      wrapper = mount(HoverTooltip, {
        props: {
          enabled: false,
          currentFile: { name: 'test.java', path: '/test.java' }
        }
      });

      const mockEvent = new MouseEvent('mousemove', {
        clientX: 100,
        clientY: 100
      });

      document.dispatchEvent(mockEvent);
      vi.advanceTimersByTime(600);

      expect(wrapper.vm.tooltipVisible).toBe(false);
    });
  });

  describe('Tooltip Display', () => {
    it('shows tooltip with symbol information', async () => {
      const mockDefinition = {
        name: 'getUserById',
        signature: 'public User getUserById(Long id)',
        type: 'METHOD',
        returnType: 'User',
        parameters: [
          { name: 'id', type: 'Long' }
        ],
        documentation: 'Retrieves a user by their ID'
      };

      axios.get.mockResolvedValue({ data: mockDefinition });

      wrapper = mount(HoverTooltip, {
        props: {
          enabled: true,
          currentFile: { name: 'test.java', path: '/test.java' }
        },
        attachTo: document.body
      });

      // Manually show tooltip
      wrapper.vm.showTooltip({
        signature: mockDefinition.signature,
        documentation: mockDefinition.documentation,
        returnType: mockDefinition.returnType,
        parameters: mockDefinition.parameters
      }, 100, 100);

      await nextTick();

      expect(wrapper.vm.tooltipVisible).toBe(true);
      
      // Tooltip is teleported to body, so check document instead
      const tooltipInBody = document.querySelector('.hover-tooltip');
      expect(tooltipInBody).toBeTruthy();
      expect(tooltipInBody.textContent).toContain('getUserById');
      expect(tooltipInBody.textContent).toContain('User');
      expect(tooltipInBody.textContent).toContain('Retrieves a user by their ID');
    });

    it('displays return type when provided', async () => {
      wrapper = mount(HoverTooltip, {
        props: {
          enabled: true,
          currentFile: { name: 'test.java', path: '/test.java' }
        },
        attachTo: document.body
      });

      wrapper.vm.showTooltip({
        signature: 'public String getName()',
        returnType: 'String'
      }, 100, 100);

      await nextTick();

      const tooltipInBody = document.querySelector('.hover-tooltip');
      expect(tooltipInBody.textContent).toContain('Returns:');
      expect(tooltipInBody.textContent).toContain('String');
    });

    it('displays parameters when provided', async () => {
      wrapper = mount(HoverTooltip, {
        props: {
          enabled: true,
          currentFile: { name: 'test.java', path: '/test.java' }
        },
        attachTo: document.body
      });

      wrapper.vm.showTooltip({
        signature: 'public void setName(String name)',
        parameters: [
          { name: 'name', type: 'String' }
        ]
      }, 100, 100);

      await nextTick();

      const tooltipInBody = document.querySelector('.hover-tooltip');
      expect(tooltipInBody.textContent).toContain('Parameters:');
      expect(tooltipInBody.textContent).toContain('name');
      expect(tooltipInBody.textContent).toContain('String');
    });

    it('hides tooltip when hideTooltip is called', async () => {
      wrapper = mount(HoverTooltip, {
        props: {
          enabled: true,
          currentFile: { name: 'test.java', path: '/test.java' }
        },
        attachTo: document.body
      });

      wrapper.vm.showTooltip({
        signature: 'test()',
      }, 100, 100);

      await nextTick();
      expect(wrapper.vm.tooltipVisible).toBe(true);

      wrapper.vm.hideTooltip();

      await nextTick();
      expect(wrapper.vm.tooltipVisible).toBe(false);
      expect(document.querySelector('.hover-tooltip')).toBeFalsy();
    });
  });

  describe('API Integration', () => {
    it('fetches symbol definition from backend', async () => {
      const mockDefinition = {
        name: 'getUserById',
        signature: 'public User getUserById(Long id)',
        type: 'METHOD',
        returnType: 'User',
        parameters: [{ name: 'id', type: 'Long' }],
        documentation: 'Gets user by ID'
      };

      axios.get.mockResolvedValue({ data: mockDefinition });

      wrapper = mount(HoverTooltip, {
        props: {
          enabled: true,
          currentFile: { name: 'test.java', path: '/test/path/test.java' }
        }
      });

      // Create a mock line element
      const lineElement = document.createElement('div');
      lineElement.className = 'line';
      document.body.appendChild(lineElement);

      const mockEvent = {
        target: lineElement,
        clientX: 100,
        clientY: 100
      };

      // Simulate mousemove
      wrapper.vm.handleMouseMove(mockEvent);

      // Advance timer to trigger tooltip
      vi.advanceTimersByTime(600);
      await nextTick();
      await nextTick(); // Wait for async API call

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/analysis/definition',
        expect.objectContaining({
          params: expect.objectContaining({
            path: '/test/path/test.java',
            line: 1
          })
        })
      );

      document.body.removeChild(lineElement);
    });

    it('handles API errors gracefully', async () => {
      axios.get.mockRejectedValue(new Error('API Error'));

      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

      wrapper = mount(HoverTooltip, {
        props: {
          enabled: true,
          currentFile: { name: 'test.java', path: '/test.java' }
        }
      });

      const lineElement = document.createElement('div');
      lineElement.className = 'line';
      document.body.appendChild(lineElement);

      const mockEvent = {
        target: lineElement,
        clientX: 100,
        clientY: 100
      };

      wrapper.vm.handleMouseMove(mockEvent);
      vi.advanceTimersByTime(600);
      await nextTick();
      await nextTick();

      // Should not show tooltip on error
      expect(wrapper.vm.tooltipVisible).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      document.body.removeChild(lineElement);
    });

    it('does not fetch when no current file', async () => {
      wrapper = mount(HoverTooltip, {
        props: {
          enabled: true,
          currentFile: null
        }
      });

      const lineElement = document.createElement('div');
      lineElement.className = 'line';
      document.body.appendChild(lineElement);

      const mockEvent = {
        target: lineElement,
        clientX: 100,
        clientY: 100
      };

      wrapper.vm.handleMouseMove(mockEvent);
      vi.advanceTimersByTime(600);
      await nextTick();

      expect(axios.get).not.toHaveBeenCalled();

      document.body.removeChild(lineElement);
    });
  });

  describe('Event Handling', () => {
    it('emits hover event when hovering over code', async () => {
      wrapper = mount(HoverTooltip, {
        props: {
          enabled: true,
          currentFile: { name: 'test.java', path: '/test.java' }
        }
      });

      const lineElement = document.createElement('div');
      lineElement.className = 'line';
      document.body.appendChild(lineElement);

      const mockEvent = {
        target: lineElement,
        clientX: 150,
        clientY: 200
      };

      wrapper.vm.handleMouseMove(mockEvent);
      vi.advanceTimersByTime(600);
      await nextTick();

      expect(wrapper.emitted('hover')).toBeTruthy();
      expect(wrapper.emitted('hover')[0][1]).toEqual({ x: 150, y: 200 });

      document.body.removeChild(lineElement);
    });

    it('clears timeout when mouse leaves', async () => {
      wrapper = mount(HoverTooltip, {
        props: {
          enabled: true,
          currentFile: { name: 'test.java', path: '/test.java' }
        }
      });

      const lineElement = document.createElement('div');
      lineElement.className = 'line';
      document.body.appendChild(lineElement);

      const mockEvent = {
        target: lineElement,
        clientX: 100,
        clientY: 100
      };

      wrapper.vm.handleMouseMove(mockEvent);
      wrapper.vm.handleMouseLeave();

      vi.advanceTimersByTime(600);
      await nextTick();

      expect(wrapper.vm.tooltipVisible).toBe(false);

      document.body.removeChild(lineElement);
    });
  });

  describe('Exposed Methods', () => {
    it('exposes showTooltip method', () => {
      wrapper = mount(HoverTooltip, {
        props: {
          enabled: true,
          currentFile: null
        }
      });

      expect(wrapper.vm.showTooltip).toBeDefined();
      expect(typeof wrapper.vm.showTooltip).toBe('function');
    });

    it('exposes hideTooltip method', () => {
      wrapper = mount(HoverTooltip, {
        props: {
          enabled: true,
          currentFile: null
        }
      });

      expect(wrapper.vm.hideTooltip).toBeDefined();
      expect(typeof wrapper.vm.hideTooltip).toBe('function');
    });
  });
});
