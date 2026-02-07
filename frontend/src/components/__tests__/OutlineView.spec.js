import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import OutlineView from '../OutlineView.vue';

describe('OutlineView.vue', () => {
  const symbols = [
    { name: 'MyClass', type: 'CLASS', line: 5 },
    { name: 'myMethod', type: 'METHOD', line: 10 }
  ];

  it('renders list of symbols', () => {
    const wrapper = mount(OutlineView, {
      props: { symbols }
    });
    expect(wrapper.text()).toContain('MyClass');
    expect(wrapper.text()).toContain('myMethod');
  });

  it('emits select when a symbol is clicked', async () => {
    const wrapper = mount(OutlineView, {
      props: { symbols }
    });
    await wrapper.find('.list-group-item').trigger('click');
    expect(wrapper.emitted('select')).toBeTruthy();
    expect(wrapper.emitted('select')[0]).toEqual([symbols[0]]);
  });

  it('displays placeholder when no symbols', () => {
    const wrapper = mount(OutlineView, {
      props: { symbols: [] }
    });
    expect(wrapper.text()).toContain('No symbols detected in this file.');
  });
});
