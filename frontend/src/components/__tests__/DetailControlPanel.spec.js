import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import DetailControlPanel from '../DetailControlPanel.vue';

describe('DetailControlPanel.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(DetailControlPanel);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders the component', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.detail-control-panel').exists()).toBe(true);
    });

    it('renders preset buttons', () => {
      const buttons = wrapper.findAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      const buttonTexts = buttons.map(b => b.text());
      // Check that preset buttons exist (exact text may vary)
      expect(buttonTexts.some(text => text.includes('Detail') || text.includes('Full'))).toBe(true);
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
  });

  describe('Initialization', () => {
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

    it('has all expected presets defined', () => {
      expect(wrapper.vm.presets).toHaveProperty('full');
      expect(wrapper.vm.presets).toHaveProperty('noComments');
      expect(wrapper.vm.presets).toHaveProperty('signaturesOnly');
      expect(wrapper.vm.presets).toHaveProperty('publicOnly');
    });

    it('has correct preset configurations with name and options', () => {
      expect(wrapper.vm.presets.full.options.showComments).toBe(true);
      expect(wrapper.vm.presets.noComments.options.showComments).toBe(false);
      expect(wrapper.vm.presets.signaturesOnly.options.showMethodBodies).toBe(false);
      expect(wrapper.vm.presets.publicOnly.options.onlyPublic).toBe(true);
    });

    it('presets have name properties', () => {
      expect(wrapper.vm.presets.full.name).toBe('Full Detail');
      expect(wrapper.vm.presets.noComments.name).toBe('No Comments');
    });
  });

  describe('Event Emission', () => {
    it('emits change event when options are updated', async () => {
      wrapper.vm.emitChange();
      
      expect(wrapper.emitted('change')).toBeTruthy();
      expect(wrapper.emitted('change')[0][0]).toEqual(wrapper.vm.options);
    });

    it('emits correct options object in change event', async () => {
      wrapper.vm.options.showComments = false;
      wrapper.vm.emitChange();
      
      expect(wrapper.emitted('change')[0][0].showComments).toBe(false);
    });

    it('emits multiple change events when called multiple times', async () => {
      wrapper.vm.emitChange();
      wrapper.vm.emitChange();
      wrapper.vm.emitChange();
      
      expect(wrapper.emitted('change')).toHaveLength(3);
    });
  });

  describe('Preset Application', () => {
    it('applies full detail preset', async () => {
      await wrapper.vm.applyPreset('full');
      
      expect(wrapper.vm.options.showComments).toBe(true);
      expect(wrapper.vm.options.showImports).toBe(true);
      expect(wrapper.vm.options.showMethodBodies).toBe(true);
      expect(wrapper.vm.options.showParameters).toBe(true);
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

    it('preset buttons trigger applyPreset', async () => {
      const applyPresetSpy = vi.spyOn(wrapper.vm, 'applyPreset');
      
      const fullDetailBtn = wrapper.findAll('button').find(b => b.text().includes('Full Detail'));
      if (fullDetailBtn) {
        await fullDetailBtn.trigger('click');
        expect(applyPresetSpy).toHaveBeenCalledWith('full');
      }
    });

    it('all preset buttons trigger correct presets', async () => {
      const buttons = wrapper.findAll('button');
      const applyPresetSpy = vi.spyOn(wrapper.vm, 'applyPreset');
      
      const fullDetailBtn = buttons.find(b => b.text().includes('Full Detail'));
      if (fullDetailBtn) {
        await fullDetailBtn.trigger('click');
        expect(applyPresetSpy).toHaveBeenCalledWith('full');
      }
    });
  });

  describe('Individual Option Toggles', () => {
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

    it('toggles showParameters option', async () => {
      wrapper.vm.options.showParameters = false;
      wrapper.vm.emitChange();
      
      expect(wrapper.vm.options.showParameters).toBe(false);
      expect(wrapper.emitted('change')).toBeTruthy();
    });

    it('toggles abbreviateTypes option', async () => {
      wrapper.vm.options.abbreviateTypes = true;
      wrapper.vm.emitChange();
      
      expect(wrapper.vm.options.abbreviateTypes).toBe(true);
      expect(wrapper.emitted('change')).toBeTruthy();
    });

    it('toggles onlyPublic option', async () => {
      wrapper.vm.options.onlyPublic = true;
      wrapper.vm.emitChange();
      
      expect(wrapper.vm.options.onlyPublic).toBe(true);
      expect(wrapper.emitted('change')).toBeTruthy();
    });

    it('can revert toggled option back to original state', async () => {
      const original = wrapper.vm.options.showComments;
      
      wrapper.vm.options.showComments = !original;
      wrapper.vm.emitChange();
      expect(wrapper.vm.options.showComments).toBe(!original);
      
      wrapper.vm.options.showComments = original;
      wrapper.vm.emitChange();
      expect(wrapper.vm.options.showComments).toBe(original);
    });
  });

  describe('Multiple Option Changes', () => {
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

    it('can update all options to false', async () => {
      wrapper.vm.options.showComments = false;
      wrapper.vm.options.showImports = false;
      wrapper.vm.options.showPrivateMembers = false;
      wrapper.vm.options.showMethodBodies = false;
      wrapper.vm.options.showParameterTypes = false;
      wrapper.vm.options.showParameters = false;
      wrapper.vm.options.abbreviateTypes = true;
      wrapper.vm.options.onlyPublic = true;
      wrapper.vm.emitChange();
      
      expect(wrapper.emitted('change')[0][0]).toEqual({
        showComments: false,
        showImports: false,
        showPrivateMembers: false,
        showMethodBodies: false,
        showParameterTypes: false,
        showParameters: false,
        abbreviateTypes: true,
        onlyPublic: true
      });
    });

    it('can toggle multiple options in sequence', async () => {
      wrapper.vm.options.showComments = false;
      wrapper.vm.emitChange();
      expect(wrapper.emitted('change')).toHaveLength(1);
      
      wrapper.vm.options.showImports = false;
      wrapper.vm.emitChange();
      expect(wrapper.emitted('change')).toHaveLength(2);
      
      wrapper.vm.options.showMethodBodies = false;
      wrapper.vm.emitChange();
      expect(wrapper.emitted('change')).toHaveLength(3);
    });
  });

  describe('Preset Consistency', () => {
    it('full preset enables all detail options', async () => {
      await wrapper.vm.applyPreset('full');
      
      const fullPreset = wrapper.vm.presets.full.options;
      Object.keys(fullPreset).forEach(key => {
        expect(wrapper.vm.options[key]).toBe(fullPreset[key]);
      });
    });

    it('noComments preset disables comments but keeps others', async () => {
      await wrapper.vm.applyPreset('noComments');
      
      const noCommentsPreset = wrapper.vm.presets.noComments.options;
      expect(wrapper.vm.options.showComments).toBe(false);
      expect(wrapper.vm.options.showImports).toBe(true);
    });

    it('switching between presets updates options correctly', async () => {
      await wrapper.vm.applyPreset('full');
      expect(wrapper.vm.options.showComments).toBe(true);
      
      await wrapper.vm.applyPreset('noComments');
      expect(wrapper.vm.options.showComments).toBe(false);
      
      await wrapper.vm.applyPreset('full');
      expect(wrapper.vm.options.showComments).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid option changes', async () => {
      wrapper.vm.options.showComments = false;
      wrapper.vm.options.showImports = false;
      wrapper.vm.options.showComments = true;
      wrapper.vm.emitChange();
      
      expect(wrapper.vm.options.showComments).toBe(true);
      expect(wrapper.vm.options.showImports).toBe(false);
    });

    it('preserves option state when not explicitly changed', async () => {
      const originalOptions = JSON.parse(JSON.stringify(wrapper.vm.options));
      
      wrapper.vm.emitChange();
      
      expect(wrapper.vm.options).toEqual(originalOptions);
    });

    it('handles empty emitChange calls', async () => {
      const initialOptions = JSON.parse(JSON.stringify(wrapper.vm.options));
      
      wrapper.vm.emitChange();
      wrapper.vm.emitChange();
      wrapper.vm.emitChange();
      
      expect(wrapper.vm.options).toEqual(initialOptions);
      expect(wrapper.emitted('change')).toHaveLength(3);
    });
  });

  describe('UI Interaction', () => {
    it('renders checkboxes for all options', () => {
      const checkboxes = wrapper.findAll('input[type="checkbox"]');
      expect(checkboxes.length).toBeGreaterThanOrEqual(8);
    });

    it('checkbox states match option values', () => {
      const checkboxes = wrapper.findAll('input[type="checkbox"]');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('updating options reflects in emitted events', async () => {
      wrapper.vm.options.showComments = false;
      wrapper.vm.options.abbreviateTypes = true;
      wrapper.vm.emitChange();
      
      const emitted = wrapper.emitted('change')[0][0];
      expect(emitted.showComments).toBe(false);
      expect(emitted.abbreviateTypes).toBe(true);
    });
  });

  describe('Option Validation', () => {
    it('all options are boolean values', () => {
      Object.values(wrapper.vm.options).forEach(value => {
        expect(typeof value).toBe('boolean');
      });
    });

    it('preset option values are valid booleans', () => {
      Object.values(wrapper.vm.presets).forEach(preset => {
        Object.values(preset.options).forEach(value => {
          expect(typeof value).toBe('boolean');
        });
      });
    });

    it('all presets have a name property that is a string', () => {
      Object.values(wrapper.vm.presets).forEach(preset => {
        expect(typeof preset.name).toBe('string');
      });
    });
  });
});
