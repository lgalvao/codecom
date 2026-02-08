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
    expect(options[1].text()).toContain('Not implemented');
    expect(options[2].text()).toContain('Not implemented');
  });
});
