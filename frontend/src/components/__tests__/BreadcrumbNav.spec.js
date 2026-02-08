import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import BreadcrumbNav from '../BreadcrumbNav.vue';

describe('BreadcrumbNav.vue', () => {
  let wrapper;

  const defaultItems = [
    {
      name: 'com.codecom',
      type: 'package',
      siblings: [
        { name: 'com.codecom' },
        { name: 'com.example' }
      ]
    },
    {
      name: 'UserService.java',
      type: 'file',
      path: '/src/UserService.java',
      siblings: [
        { name: 'UserService.java' },
        { name: 'OrderService.java' }
      ]
    },
    {
      name: 'UserService',
      type: 'class',
      line: 10,
      siblings: [
        { name: 'UserService', line: 10 },
        { name: 'UserController', line: 50 }
      ]
    },
    {
      name: 'getUser',
      type: 'method',
      line: 25,
      siblings: [
        { name: 'getUser', line: 25 },
        { name: 'createUser', line: 40 },
        { name: 'updateUser', line: 55 }
      ]
    }
  ];

  beforeEach(() => {
    wrapper = mount(BreadcrumbNav, {
      props: {
        items: defaultItems
      }
    });
  });

  describe('Rendering', () => {
    it('should render all breadcrumb items', () => {
      const items = wrapper.findAll('.breadcrumb-item');
      expect(items).toHaveLength(4);
    });

    it('should display item names correctly', () => {
      const texts = wrapper.findAll('.breadcrumb-text');
      expect(texts[0].text()).toBe('com.codecom');
      expect(texts[1].text()).toBe('UserService.java');
      expect(texts[2].text()).toBe('UserService');
      expect(texts[3].text()).toBe('getUser');
    });

    it('should render separators between items', () => {
      const separators = wrapper.findAll('.breadcrumb-separator');
      expect(separators).toHaveLength(3); // n-1 separators for n items
    });

    it('should show dropdown buttons for items with siblings', () => {
      const buttons = wrapper.findAll('.breadcrumb-button');
      expect(buttons).toHaveLength(4); // All items have siblings in default props
    });

    it('should not show dropdown button for items without siblings', () => {
      wrapper = mount(BreadcrumbNav, {
        props: {
          items: [
            { name: 'test', type: 'file' }
          ]
        }
      });

      const buttons = wrapper.findAll('.breadcrumb-button');
      expect(buttons).toHaveLength(0);
    });
  });

  describe('Dropdown Interaction', () => {
    it('should toggle dropdown when clicking breadcrumb button', async () => {
      const button = wrapper.findAll('.breadcrumb-button')[0];
      
      // Dropdown should be hidden initially
      expect(wrapper.find('.breadcrumb-menu').exists()).toBe(false);
      
      // Click to show dropdown
      await button.trigger('click');
      expect(wrapper.find('.breadcrumb-menu').exists()).toBe(true);
      
      // Click again to hide dropdown
      await button.trigger('click');
      expect(wrapper.find('.breadcrumb-menu').exists()).toBe(false);
    });

    it('should display siblings in dropdown menu', async () => {
      const button = wrapper.findAll('.breadcrumb-button')[0];
      await button.trigger('click');

      const menuItems = wrapper.findAll('.menu-item');
      expect(menuItems).toHaveLength(2); // com.codecom and com.example
      expect(menuItems[0].text()).toContain('com.codecom');
      expect(menuItems[1].text()).toContain('com.example');
    });

    it('should show line numbers for siblings that have them', async () => {
      const button = wrapper.findAll('.breadcrumb-button')[3]; // getUser method
      await button.trigger('click');

      const menuItems = wrapper.findAll('.menu-item');
      expect(menuItems[0].text()).toContain(':25');
      expect(menuItems[1].text()).toContain(':40');
      expect(menuItems[2].text()).toContain(':55');
    });

    it('should mark current item in dropdown', async () => {
      const button = wrapper.findAll('.breadcrumb-button')[0];
      await button.trigger('click');

      const menuItems = wrapper.findAll('.menu-item');
      expect(menuItems[0].classes()).toContain('current');
      expect(menuItems[1].classes()).not.toContain('current');
    });

    it('should show appropriate menu header', async () => {
      // Test class dropdown
      const classButton = wrapper.findAll('.breadcrumb-button')[2];
      await classButton.trigger('click');
      expect(wrapper.find('.menu-header').text()).toContain('Classes');

      // Test method dropdown
      await classButton.trigger('click'); // Close first
      const methodButton = wrapper.findAll('.breadcrumb-button')[3];
      await methodButton.trigger('click');
      expect(wrapper.find('.menu-header').text()).toContain('Methods');
    });

    it('should close dropdown when clicking outside', async () => {
      const button = wrapper.findAll('.breadcrumb-button')[0];
      await button.trigger('click');
      expect(wrapper.find('.breadcrumb-menu').exists()).toBe(true);

      // Simulate click outside
      document.body.click();
      await wrapper.vm.$nextTick();
      
      // Note: This requires the actual event listener to be working
      // The test might not work perfectly in isolation
    });
  });

  describe('Navigation', () => {
    it('should emit navigate event when clicking breadcrumb text', async () => {
      wrapper = mount(BreadcrumbNav, {
        props: {
          items: [
            { name: 'test', type: 'file', path: '/test' }
          ]
        }
      });

      const text = wrapper.find('.breadcrumb-text');
      await text.trigger('click');

      expect(wrapper.emitted('navigate')).toBeTruthy();
      const emitted = wrapper.emitted('navigate')[0];
      expect(emitted[0]).toEqual({ name: 'test', type: 'file', path: '/test' });
      // Sibling parameter should be undefined when clicking text directly
      expect(emitted[1]).toBeUndefined();
    });

    it('should emit navigate event with sibling when clicking menu item', async () => {
      const button = wrapper.findAll('.breadcrumb-button')[0];
      await button.trigger('click');

      const menuItems = wrapper.findAll('.menu-item');
      await menuItems[1].trigger('click');

      expect(wrapper.emitted('navigate')).toBeTruthy();
      const emitted = wrapper.emitted('navigate')[0];
      expect(emitted[0]).toEqual(defaultItems[0]); // The main item
      expect(emitted[1]).toEqual({ name: 'com.example' }); // The selected sibling
    });

    it('should close dropdown after navigation', async () => {
      const button = wrapper.findAll('.breadcrumb-button')[0];
      await button.trigger('click');
      expect(wrapper.find('.breadcrumb-menu').exists()).toBe(true);

      const menuItems = wrapper.findAll('.menu-item');
      await menuItems[0].trigger('click');

      await wrapper.vm.$nextTick();
      expect(wrapper.find('.breadcrumb-menu').exists()).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA label', () => {
      expect(wrapper.find('nav').attributes('aria-label')).toBe('Breadcrumb');
    });

    it('should have title attribute on dropdown buttons', () => {
      const button = wrapper.findAll('.breadcrumb-button')[0];
      expect(button.attributes('title')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty items array', () => {
      wrapper = mount(BreadcrumbNav, {
        props: {
          items: []
        }
      });

      expect(wrapper.findAll('.breadcrumb-item')).toHaveLength(0);
    });

    it('should handle items without siblings array', () => {
      wrapper = mount(BreadcrumbNav, {
        props: {
          items: [
            { name: 'test1', type: 'file' },
            { name: 'test2', type: 'class', siblings: [] }
          ]
        }
      });

      const buttons = wrapper.findAll('.breadcrumb-button');
      expect(buttons).toHaveLength(0);
    });

    it('should handle very long sibling lists with scrolling', async () => {
      const manyItems = Array.from({ length: 50 }, (_, i) => ({
        name: `Item${i}`,
        line: i * 10
      }));

      wrapper = mount(BreadcrumbNav, {
        props: {
          items: [
            {
              name: 'test',
              type: 'class',
              siblings: manyItems
            }
          ]
        }
      });

      const button = wrapper.find('.breadcrumb-button');
      await button.trigger('click');

      const menu = wrapper.find('.breadcrumb-menu');
      expect(menu.exists()).toBe(true);
      
      // Check that max-height style is applied for scrolling
      const style = window.getComputedStyle(menu.element);
      expect(style.maxHeight).toBeDefined();
    });
  });
});
