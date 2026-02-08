<script setup lang="ts">
import { ref } from 'vue';
import { Download, FileText, FileCode } from 'lucide-vue-next';
import { exportFile, type ExportFormat, type ExportScope, type DetailLevel } from '../services/ExportService';

const props = defineProps<{
  code: string;
  filename: string;
  language: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const format = ref<ExportFormat>('markdown');
const scope = ref<ExportScope>('current');
const detailLevel = ref<DetailLevel>('full');
const includeLineNumbers = ref(true);
const title = ref('');

const handleExport = () => {
  exportFile(props.code, props.filename, props.language, {
    format: format.value,
    scope: scope.value,
    detailLevel: detailLevel.value,
    includeLineNumbers: includeLineNumbers.value,
    title: title.value || undefined,
  });
  
  emit('close');
};
</script>

<template>
  <div class="export-dialog p-3">
    <div class="dialog-header mb-4">
      <h5 class="mb-1">
        <Download :size="20" class="me-2" />
        Export Code
      </h5>
      <p class="text-muted small mb-0">
        Export your code in various formats and detail levels
      </p>
    </div>

    <!-- Export Format -->
    <div class="mb-3">
      <label class="form-label fw-semibold small">Export Format</label>
      <div class="btn-group w-100" role="group">
        <input type="radio" class="btn-check" id="format-md" value="markdown" v-model="format">
        <label class="btn btn-outline-primary" for="format-md">
          <FileText :size="16" class="me-1" />
          Markdown
        </label>
        
        <input type="radio" class="btn-check" id="format-pdf" value="pdf" v-model="format">
        <label class="btn btn-outline-primary" for="format-pdf">
          <FileCode :size="16" class="me-1" />
          PDF (HTML)
        </label>
      </div>
      <small class="text-muted">
        <span v-if="format === 'markdown'">Markdown format for easy sharing and documentation</span>
        <span v-else>HTML file that can be printed to PDF</span>
      </small>
    </div>

    <!-- Export Scope -->
    <div class="mb-3">
      <label class="form-label fw-semibold small">Export Scope</label>
      <select class="form-select" v-model="scope">
        <option value="current">Current File</option>
        <option value="package" disabled>Current Package (Not implemented)</option>
        <option value="project" disabled>Entire Project (Not implemented)</option>
      </select>
    </div>

    <!-- Detail Level -->
    <div class="mb-3">
      <label class="form-label fw-semibold small">Detail Level</label>
      <select class="form-select" v-model="detailLevel">
        <option value="full">Full Detail (all code with comments)</option>
        <option value="medium">Medium Detail (code without comments)</option>
        <option value="low">Low Detail (signatures only)</option>
        <option value="architectural">Architectural (public interfaces only)</option>
      </select>
    </div>

    <!-- Additional Options -->
    <div class="mb-3">
      <label class="form-label fw-semibold small">Options</label>
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          id="includeLineNumbers"
          v-model="includeLineNumbers"
        >
        <label class="form-check-label small" for="includeLineNumbers">
          Include line numbers
        </label>
      </div>
    </div>

    <!-- Title -->
    <div class="mb-4">
      <label class="form-label fw-semibold small">Document Title (Optional)</label>
      <input
        type="text"
        class="form-control"
        v-model="title"
        placeholder="e.g., Project Documentation"
      >
    </div>

    <!-- Action Buttons -->
    <div class="d-flex gap-2">
      <button class="btn btn-primary flex-grow-1" @click="handleExport">
        <Download :size="16" class="me-1" />
        Export
      </button>
      <button class="btn btn-secondary" @click="$emit('close')">
        Cancel
      </button>
    </div>

    <!-- Info Box -->
    <div class="alert alert-info mt-3 small mb-0">
      <strong>Note:</strong> 
      <span v-if="format === 'markdown'">
        The exported Markdown file can be opened in any text editor or Markdown viewer.
      </span>
      <span v-else>
        The exported HTML file can be opened in a browser and printed to PDF using the browser's print dialog (Ctrl/Cmd + P).
      </span>
    </div>
  </div>
</template>

<style scoped>
.export-dialog {
  max-width: 500px;
}

.dialog-header {
  border-bottom: 1px solid var(--bs-border-color);
  padding-bottom: 1rem;
}

.btn-group {
  display: flex;
}

.btn-group .btn {
  flex: 1;
}

.form-check {
  padding-left: 1.5rem;
}
</style>
