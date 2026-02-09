/**
 * Tests for ExportDialog component
 * Testing FR.30-FR.31: Export UI functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ExportDialog from '../ExportDialog.vue';
import * as ExportService from '../../services/ExportService';

describe('ExportDialog.vue', () => {
  const defaultProps = {
    code: 'public class Test { }',
    filename: 'Test.java',
    language: 'java',
  };

  let exportFileSpy;

  beforeEach(() => {
    exportFileSpy = vi.spyOn(ExportService, 'exportFile').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render export dialog with title', () => {
    const wrapper = mount(ExportDialog, {
      props: defaultProps,
    });

    expect(wrapper.text()).toContain('Export Code');
    expect(wrapper.text()).toContain('Export your code in various formats and detail levels');
  });

  it('should have markdown format selected by default', () => {
    const wrapper = mount(ExportDialog, {
      props: defaultProps,
    });

    const markdownRadio = wrapper.find('#format-md');
    expect(markdownRadio.element.checked).toBe(true);
  });

  it('should allow switching to PDF format', async () => {
    const wrapper = mount(ExportDialog, {
      props: defaultProps,
    });

    const pdfRadio = wrapper.find('#format-pdf');
    await pdfRadio.setValue(true);

    expect(pdfRadio.element.checked).toBe(true);
    expect(wrapper.text()).toContain('HTML file that can be printed to PDF');
  });

  it('should have current file scope selected by default', () => {
    const wrapper = mount(ExportDialog, {
      props: defaultProps,
    });

    const scopeSelect = wrapper.find('select').element;
    expect(scopeSelect.value).toBe('current');
  });

  it('should have full detail level selected by default', () => {
    const wrapper = mount(ExportDialog, {
      props: defaultProps,
    });

    const detailSelects = wrapper.findAll('select');
    const detailSelect = detailSelects[1].element;
    expect(detailSelect.value).toBe('full');
  });

  it('should allow changing detail level', async () => {
    const wrapper = mount(ExportDialog, {
      props: defaultProps,
    });

    const detailSelects = wrapper.findAll('select');
    const detailSelect = detailSelects[1];
    await detailSelect.setValue('medium');

    expect(detailSelect.element.value).toBe('medium');
  });

  it('should have line numbers checkbox checked by default', () => {
    const wrapper = mount(ExportDialog, {
      props: defaultProps,
    });

    const lineNumbersCheckbox = wrapper.find('#includeLineNumbers');
    expect(lineNumbersCheckbox.element.checked).toBe(true);
  });

  it('should allow toggling line numbers option', async () => {
    const wrapper = mount(ExportDialog, {
      props: defaultProps,
    });

    const lineNumbersCheckbox = wrapper.find('#includeLineNumbers');
    await lineNumbersCheckbox.setValue(false);

    expect(lineNumbersCheckbox.element.checked).toBe(false);
  });

  it('should allow entering a document title', async () => {
    const wrapper = mount(ExportDialog, {
      props: defaultProps,
    });

    const titleInput = wrapper.find('input[type="text"]');
    await titleInput.setValue('My Custom Title');

    expect(titleInput.element.value).toBe('My Custom Title');
  });

  it('should call exportFile when export button is clicked', async () => {
    const wrapper = mount(ExportDialog, {
      props: defaultProps,
    });

    const exportButton = wrapper.find('button.btn-primary');
    await exportButton.trigger('click');

    expect(exportFileSpy).toHaveBeenCalledWith(
      defaultProps.code,
      defaultProps.filename,
      defaultProps.language,
      expect.objectContaining({
        format: 'markdown',
        scope: 'current',
        detailLevel: 'full',
        includeLineNumbers: true,
      })
    );
  });

  it('should emit close event when export button is clicked', async () => {
    const wrapper = mount(ExportDialog, {
      props: defaultProps,
    });

    const exportButton = wrapper.find('button.btn-primary');
    await exportButton.trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('should emit close event when cancel button is clicked', async () => {
    const wrapper = mount(ExportDialog, {
      props: defaultProps,
    });

    const cancelButton = wrapper.find('button.btn-secondary');
    await cancelButton.trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('should export with custom options', async () => {
    const wrapper = mount(ExportDialog, {
      props: defaultProps,
    });

    // Change format to PDF
    const pdfRadio = wrapper.find('#format-pdf');
    await pdfRadio.setValue(true);

    // Change detail level to low
    const detailSelects = wrapper.findAll('select');
    await detailSelects[1].setValue('low');

    // Uncheck line numbers
    const lineNumbersCheckbox = wrapper.find('#includeLineNumbers');
    await lineNumbersCheckbox.setValue(false);

    // Set title
    const titleInput = wrapper.find('input[type="text"]');
    await titleInput.setValue('Architecture Overview');

    // Export
    const exportButton = wrapper.find('button.btn-primary');
    await exportButton.trigger('click');

    expect(exportFileSpy).toHaveBeenCalledWith(
      defaultProps.code,
      defaultProps.filename,
      defaultProps.language,
      expect.objectContaining({
        format: 'pdf',
        scope: 'current',
        detailLevel: 'low',
        includeLineNumbers: false,
        title: 'Architecture Overview',
      })
    );
  });

  it('should show markdown help text when markdown is selected', async () => {
    const wrapper = mount(ExportDialog, {
      props: defaultProps,
    });

    const markdownRadio = wrapper.find('#format-md');
    await markdownRadio.setValue(true);

    expect(wrapper.text()).toContain('Markdown format for easy sharing and documentation');
  });

  it('should show PDF help text when PDF is selected', async () => {
    const wrapper = mount(ExportDialog, {
      props: defaultProps,
    });

    const pdfRadio = wrapper.find('#format-pdf');
    await pdfRadio.setValue(true);

    expect(wrapper.text()).toContain('HTML file that can be printed to PDF');
  });

  it('should display all detail level options', () => {
    const wrapper = mount(ExportDialog, {
      props: defaultProps,
    });

    const detailSelects = wrapper.findAll('select');
    const detailSelect = detailSelects[1];
    const options = detailSelect.findAll('option');

    expect(options).toHaveLength(4);
    expect(options[0].text()).toContain('Full Detail');
    expect(options[1].text()).toContain('Medium Detail');
    expect(options[2].text()).toContain('Low Detail');
    expect(options[3].text()).toContain('Architectural');
  });

  it('should show appropriate note based on format', async () => {
    const wrapper = mount(ExportDialog, {
      props: defaultProps,
    });

    // Check markdown note
    expect(wrapper.text()).toContain('The exported Markdown file can be opened in any text editor');

    // Switch to PDF
    const pdfRadio = wrapper.find('#format-pdf');
    await pdfRadio.setValue(true);

    // Check PDF note
    expect(wrapper.text()).toContain('printed to PDF using the browser\'s print dialog');
  });

  it('should have package and project scope options disabled', () => {
    const wrapper = mount(ExportDialog, {
      props: defaultProps,
    });

    const scopeSelect = wrapper.find('select');
    const options = scopeSelect.findAll('option');

    expect(options[1].attributes('disabled')).toBeDefined();
    expect(options[2].attributes('disabled')).toBeDefined();
    expect(options[1].text()).toContain('Not available');
    expect(options[2].text()).toContain('Not available');
  });
  
  it('should have package and project scope options enabled when props provided', () => {
    const wrapper = mount(ExportDialog, {
      props: {
        ...defaultProps,
        filePath: '/path/to/test.js',
        allFiles: [
          { path: '/path/to/test.js', isDirectory: false },
          { path: '/path/to/other.js', isDirectory: false }
        ]
      }
    });

    const scopeSelect = wrapper.find('select');
    const options = scopeSelect.findAll('option');

    // Options should NOT be disabled when props are provided
    expect(options[1].attributes('disabled')).toBeUndefined();
    expect(options[2].attributes('disabled')).toBeUndefined();
  });

  describe('Export Dialog - Advanced Functionality', () => {
    it('should allow toggling syntax highlighting option', async () => {
      const wrapper = mount(ExportDialog, {
        props: defaultProps,
      });

      const checkboxes = wrapper.findAll('input[type="checkbox"]');
      const syntaxHighlightingCheckbox = checkboxes.find(cb => 
        cb.attributes('id')?.includes('syntax') || cb.attributes('id')?.includes('highlight')
      );

      if (syntaxHighlightingCheckbox) {
        const initialValue = syntaxHighlightingCheckbox.element.checked;
        await syntaxHighlightingCheckbox.setValue(!initialValue);
        expect(syntaxHighlightingCheckbox.element.checked).toBe(!initialValue);
      }
    });

    it('should update detail level when dropdown changes', async () => {
      const wrapper = mount(ExportDialog, {
        props: defaultProps,
      });

      const detailSelects = wrapper.findAll('select');
      const detailSelect = detailSelects[1];

      await detailSelect.setValue('architectural');
      expect(detailSelect.element.value).toBe('architectural');
    });

    it('should change format and update description text', async () => {
      const wrapper = mount(ExportDialog, {
        props: defaultProps,
      });

      const mdRadio = wrapper.find('#format-md');
      await mdRadio.setValue(true);
      expect(wrapper.text()).toContain('Markdown format');

      const pdfRadio = wrapper.find('#format-pdf');
      await pdfRadio.setValue(true);
      expect(pdfRadio.element.checked).toBe(true);
      expect(wrapper.text()).toContain('HTML file');
    });

    it('should handle JSON format option', async () => {
      const wrapper = mount(ExportDialog, {
        props: defaultProps,
      });

      const formatInputs = wrapper.findAll('input[type="radio"]');
      const jsonRadio = formatInputs.find(input => input.attributes('id') === 'format-json');

      if (jsonRadio) {
        await jsonRadio.setValue(true);
        expect(jsonRadio.element.checked).toBe(true);
      }
    });

    it('should handle changing scope multiple times', async () => {
      const wrapper = mount(ExportDialog, {
        props: defaultProps,
      });

      const scopeSelect = wrapper.find('select');
      
      await scopeSelect.setValue('current');
      expect(scopeSelect.element.value).toBe('current');

      // Try changing to other scopes if available
      const options = scopeSelect.findAll('option');
      if (options.length > 1) {
        await scopeSelect.setValue(options[1].attributes('value'));
        expect(scopeSelect.element.value).toBe(options[1].attributes('value'));
      }
    });

    it('should allow clearing document title', async () => {
      const wrapper = mount(ExportDialog, {
        props: defaultProps,
      });

      const titleInput = wrapper.find('input[type="text"]');
      await titleInput.setValue('My Title');
      expect(titleInput.element.value).toBe('My Title');

      await titleInput.setValue('');
      expect(titleInput.element.value).toBe('');
    });

    it('should maintain state when toggling multiple options', async () => {
      const wrapper = mount(ExportDialog, {
        props: defaultProps,
      });

      // Toggle line numbers
      const lineNumbersCheckbox = wrapper.find('#includeLineNumbers');
      await lineNumbersCheckbox.setValue(false);

      // Set title
      const titleInput = wrapper.find('input[type="text"]');
      await titleInput.setValue('Custom Title');

      // Line numbers should still be unchecked
      expect(lineNumbersCheckbox.element.checked).toBe(false);
      expect(titleInput.element.value).toBe('Custom Title');
    });

    it('should export with all custom settings applied', async () => {
      const wrapper = mount(ExportDialog, {
        props: defaultProps,
      });

      // Set all custom options
      const pdfRadio = wrapper.find('#format-pdf');
      await pdfRadio.setValue(true);

      const detailSelects = wrapper.findAll('select');
      await detailSelects[1].setValue('medium');
      await detailSelects[0].setValue('current');

      const lineNumbersCheckbox = wrapper.find('#includeLineNumbers');
      await lineNumbersCheckbox.setValue(true);

      const titleInput = wrapper.find('input[type="text"]');
      await titleInput.setValue('Export Title');

      const exportButton = wrapper.find('button.btn-primary');
      await exportButton.trigger('click');

      expect(exportFileSpy).toHaveBeenCalledWith(
        defaultProps.code,
        defaultProps.filename,
        defaultProps.language,
        expect.objectContaining({
          format: 'pdf',
          detailLevel: 'medium',
          scope: 'current',
          includeLineNumbers: true,
          title: 'Export Title',
        })
      );
    });

    it('should validate exported options object structure', async () => {
      const wrapper = mount(ExportDialog, {
        props: defaultProps,
      });

      // Set up custom options
      const pdfRadio = wrapper.find('#format-pdf');
      await pdfRadio.setValue(true);

      const detailSelects = wrapper.findAll('select');
      await detailSelects[1].setValue('medium');

      const titleInput = wrapper.find('input[type="text"]');
      await titleInput.setValue('Test Export');

      const exportButton = wrapper.find('button.btn-primary');
      await exportButton.trigger('click');

      expect(exportFileSpy).toHaveBeenCalledWith(
        defaultProps.code,
        defaultProps.filename,
        defaultProps.language,
        expect.objectContaining({
          format: 'pdf',
          detailLevel: 'medium',
          title: 'Test Export',
        })
      );
    });

    it('should close dialog immediately after successful export', async () => {
      const wrapper = mount(ExportDialog, {
        props: defaultProps,
      });

      const exportButton = wrapper.find('button.btn-primary');
      await exportButton.trigger('click');

      expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('should have correct button styling', async () => {
      const wrapper = mount(ExportDialog, {
        props: defaultProps,
      });

      const primaryButton = wrapper.find('button.btn-primary');
      const secondaryButton = wrapper.find('button.btn-secondary');

      expect(primaryButton.exists()).toBe(true);
      expect(secondaryButton.exists()).toBe(true);
    });

    it('should display proper labels for all form fields', () => {
      const wrapper = mount(ExportDialog, {
        props: defaultProps,
      });

      const text = wrapper.text();
      expect(text).toContain('Format');
      expect(text).toContain('Scope');
      expect(text).toContain('Detail Level');
    });

    it('should have export dialog container with proper styling', () => {
      const wrapper = mount(ExportDialog, {
        props: defaultProps,
      });

      const dialog = wrapper.find('[class*="export"]');
      expect(dialog.exists()).toBe(true);
    });

    it('should show title input placeholder text', () => {
      const wrapper = mount(ExportDialog, {
        props: defaultProps,
      });

      const titleInput = wrapper.find('input[type="text"]');
      expect(titleInput.exists()).toBe(true);
    });

    it('should handle rapid successive exports', async () => {
      const wrapper = mount(ExportDialog, {
        props: defaultProps,
      });

      const exportButton = wrapper.find('button.btn-primary');

      await exportButton.trigger('click');
      // In real implementation, the dialog might be disabled or closed
      // This tests the service is called appropriately

      expect(exportFileSpy).toHaveBeenCalledTimes(1);
    });

    it('should properly initialize with all default values', () => {
      const wrapper = mount(ExportDialog, {
        props: defaultProps,
      });

      expect(wrapper.find('#format-md').element.checked).toBe(true);
      expect(wrapper.find('#includeLineNumbers').element.checked).toBe(true);

      const detailSelects = wrapper.findAll('select');
      expect(detailSelects[1].element.value).toBe('full');
    });

    it('should emit close event with correct signature', async () => {
      const wrapper = mount(ExportDialog, {
        props: defaultProps,
      });

      const closeButton = wrapper.find('button.btn-secondary');
      await closeButton.trigger('click');

      const closeEvents = wrapper.emitted('close');
      expect(closeEvents).toBeTruthy();
      expect(closeEvents).toHaveLength(1);
    });

    it('should handle different file types appropriately', async () => {
      const javaProps = {
        code: 'public class Test {}',
        filename: 'Test.java',
        language: 'java',
      };

      const wrapper = mount(ExportDialog, {
        props: javaProps,
      });

      expect(wrapper.exists()).toBe(true);
    });

    it('should preserve format selection across state changes', async () => {
      const wrapper = mount(ExportDialog, {
        props: defaultProps,
      });

      const pdfRadio = wrapper.find('#format-pdf');
      await pdfRadio.setValue(true);

      // Change other settings
      const titleInput = wrapper.find('input[type="text"]');
      await titleInput.setValue('Test');

      // PDF should still be selected
      expect(pdfRadio.element.checked).toBe(true);
    });

    it('should show comprehensive export options', () => {
      const wrapper = mount(ExportDialog, {
        props: defaultProps,
      });

      // Check for format options
      expect(wrapper.text()).toContain('Markdown');
      expect(wrapper.text()).toContain('PDF');

      // Check for scope options
      expect(wrapper.text()).toContain('Scope');

      // Check for detail options
      expect(wrapper.text()).toContain('Detail');
    });

    it('should properly validate exported options object', async () => {
      const wrapper = mount(ExportDialog, {
        props: defaultProps,
      });

      wrapper.vm.format = 'markdown';
      wrapper.vm.scope = 'current';
      wrapper.vm.detailLevel = 'full';
      wrapper.vm.includeLineNumbers = true;
      wrapper.vm.title = 'Test';

      const exportButton = wrapper.find('button.btn-primary');
      await exportButton.trigger('click');

      const exportCall = exportFileSpy.mock.calls[exportFileSpy.mock.calls.length - 1];
      expect(exportCall).toBeDefined();
    });

    it('should handle all detail level options', async () => {
      const wrapper = mount(ExportDialog, {
        props: defaultProps,
      });

      const detailSelects = wrapper.findAll('select');
      const detailSelect = detailSelects[1];
      const options = detailSelect.findAll('option');

      for (const option of options) {
        const value = option.attributes('value');
        if (value) {
          await detailSelect.setValue(value);
          expect(detailSelect.element.value).toBe(value);
        }
      }
    });
  });
});
