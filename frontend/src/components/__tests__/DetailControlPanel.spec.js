import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import DetailControlPanel from '../DetailControlPanel.vue';

describe('DetailControlPanel.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(DetailControlPanel);
  });

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.detail-control-panel').exists()).toBe(true);
  });

  it('initializes with full detail options', () => {
    expect(wrapper.vm.options).toEqual({
      showComments: true,
      showImports: true,
      showPrivateMembers: true,
      showMethodBodies: true,
      showParameterTypes: true,
      showParameters: true,
      abbreviateTypes: false,
      onlyPublic: false,
    });
  });

  it('emits change event when options are updated', async () => {
    wrapper.vm.emitChange();
    
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')[0][0]).toEqual(wrapper.vm.options);
  });

  it('applies full detail preset', async () => {
    await wrapper.vm.applyPreset('full');
    
    expect(wrapper.vm.options.showComments).toBe(true);
    expect(wrapper.vm.options.showImports).toBe(true);
    expect(wrapper.vm.options.showMethodBodies).toBe(true);
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('applies no comments preset', async () => {
    await wrapper.vm.applyPreset('noComments');
    
    expect(wrapper.vm.options.showComments).toBe(false);
    expect(wrapper.vm.options.showImports).toBe(true);
    expect(wrapper.vm.options.showMethodBodies).toBe(true);
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('applies signatures only preset', async () => {
    await wrapper.vm.applyPreset('signaturesOnly');
    
    expect(wrapper.vm.options.showComments).toBe(false);
    expect(wrapper.vm.options.showImports).toBe(false);
    expect(wrapper.vm.options.showMethodBodies).toBe(false);
    expect(wrapper.vm.options.showParameterTypes).toBe(true);
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('applies public only preset', async () => {
    await wrapper.vm.applyPreset('publicOnly');
    
    expect(wrapper.vm.options.showComments).toBe(false);
    expect(wrapper.vm.options.showPrivateMembers).toBe(false);
    expect(wrapper.vm.options.showMethodBodies).toBe(false);
    expect(wrapper.vm.options.onlyPublic).toBe(true);
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('renders all preset buttons', () => {
    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBeGreaterThan(0);
    
    const buttonTexts = buttons.map(b => b.text());
    expect(buttonTexts).toContain('Full Detail');
    expect(buttonTexts).toContain('No Comments');
    expect(buttonTexts).toContain('Signatures Only');
    expect(buttonTexts).toContain('Public Only');
  });

  it('toggles showComments option', async () => {
    const initialValue = wrapper.vm.options.showComments;
    wrapper.vm.options.showComments = !initialValue;
    wrapper.vm.emitChange();
    
    expect(wrapper.vm.options.showComments).toBe(!initialValue);
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('toggles showImports option', async () => {
    wrapper.vm.options.showImports = false;
    wrapper.vm.emitChange();
    
    expect(wrapper.vm.options.showImports).toBe(false);
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('toggles showPrivateMembers option', async () => {
    wrapper.vm.options.showPrivateMembers = false;
    wrapper.vm.emitChange();
    
    expect(wrapper.vm.options.showPrivateMembers).toBe(false);
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('toggles showMethodBodies option', async () => {
    wrapper.vm.options.showMethodBodies = false;
    wrapper.vm.emitChange();
    
    expect(wrapper.vm.options.showMethodBodies).toBe(false);
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('toggles showParameterTypes option', async () => {
    wrapper.vm.options.showParameterTypes = false;
    wrapper.vm.emitChange();
    
    expect(wrapper.vm.options.showParameterTypes).toBe(false);
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('toggles abbreviateTypes option', async () => {
    wrapper.vm.options.abbreviateTypes = true;
    wrapper.vm.emitChange();
    
    expect(wrapper.vm.options.abbreviateTypes).toBe(true);
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('has all expected presets defined', () => {
    expect(wrapper.vm.presets).toHaveProperty('full');
    expect(wrapper.vm.presets).toHaveProperty('noComments');
    expect(wrapper.vm.presets).toHaveProperty('signaturesOnly');
    expect(wrapper.vm.presets).toHaveProperty('publicOnly');
  });

  it('preset buttons trigger applyPreset', async () => {
    const applyPresetSpy = vi.spyOn(wrapper.vm, 'applyPreset');
    
    // Find and click a preset button
    const fullDetailBtn = wrapper.findAll('button').find(b => b.text().includes('Full Detail'));
    if (fullDetailBtn) {
      await fullDetailBtn.trigger('click');
      expect(applyPresetSpy).toHaveBeenCalledWith('full');
    }
  });

  it('can chain multiple option changes', async () => {
    wrapper.vm.options.showComments = false;
    wrapper.vm.options.showImports = false;
    wrapper.vm.options.showMethodBodies = false;
    wrapper.vm.emitChange();
    
    expect(wrapper.vm.options.showComments).toBe(false);
    expect(wrapper.vm.options.showImports).toBe(false);
    expect(wrapper.vm.options.showMethodBodies).toBe(false);
    expect(wrapper.emitted('change')).toBeTruthy();
  });
});
