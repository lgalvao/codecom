<script setup lang="ts">
import { ref, computed } from 'vue';
import { Download, FileText, FileCode } from 'lucide-vue-next';
import { exportFile, exportFiles, type ExportFormat, type ExportScope, type DetailLevel } from '../services/ExportService';

const props = defineProps<{
  code: string;
  filename: string;
  language: string;
  filePath?: string;
  allFiles?: Array<{ path: string; isDirectory: boolean }>;
}>();

const emit = defineEmits<{
  close: [];
}>();

const format = ref<ExportFormat>('markdown');
const scope = ref<ExportScope>('current');
const detailLevel = ref<DetailLevel>('full');
const includeLineNumbers = ref(true);
const title = ref('');
const isExporting = ref(false);
const exportError = ref<string | null>(null);

// Check if we have file path for package/project export
const canExportPackage = computed(() => !!props.filePath);
const canExportProject = computed(() => !!props.allFiles && props.allFiles.length > 0);

const handleExport = async () => {
  isExporting.value = true;
  exportError.value = null;
  
  try {
    if (scope.value === 'current') {
      // Export current file (client-side)
      exportFile(props.code, props.filename, props.language, {
        format: format.value,
        scope: scope.value,
        detailLevel: detailLevel.value,
        includeLineNumbers: includeLineNumbers.value,
        title: title.value || undefined,
      });
    } else if (scope.value === 'package' && props.filePath) {
      // Export package (all files in same directory) via backend
      const packageFiles = getPackageFiles();
      await exportFiles(packageFiles, {
        format: format.value,
        scope: scope.value,
        detailLevel: detailLevel.value,
        includeLineNumbers: includeLineNumbers.value,
        title: title.value || `Package Export - ${getPackageName()}`,
      });
    } else if (scope.value === 'project' && props.allFiles) {
      // Export entire project via backend
      const projectFiles = props.allFiles
        .filter(f => !f.isDirectory)
        .map(f => f.path);
      
      await exportFiles(projectFiles, {
        format: format.value,
        scope: scope.value,
        detailLevel: detailLevel.value,
        includeLineNumbers: includeLineNumbers.value,
        title: title.value || 'Project Export',
      });
    }
    
    emit('close');
  } catch (error) {
    exportError.value = error instanceof Error ? error.message : 'Export failed';
    console.error('Export error:', error);
  } finally {
    isExporting.value = false;
  }
};

// Get all files in the same package/directory
const getPackageFiles = (): string[] => {
  if (!props.filePath || !props.allFiles) return [props.filePath];
  
  const currentDir = props.filePath.substring(0, props.filePath.lastIndexOf('/'));
  return props.allFiles
    .filter(f => !f.isDirectory && f.path.startsWith(currentDir + '/'))
    .map(f => f.path);
};

// Get package name from file path
const getPackageName = (): string => {
  if (!props.filePath) return '';
  const parts = props.filePath.split('/');
  return parts[parts.length - 2] || 'package';
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
        <option value="package" :disabled="!canExportPackage">
          Current Package {{ canExportPackage ? '' : '(Not available)' }}
        </option>
        <option value="project" :disabled="!canExportProject">
          Entire Project {{ canExportProject ? '' : '(Not available)' }}
        </option>
      </select>
      <small class="text-muted">
        <span v-if="scope === 'current'">Export only the current file</span>
        <span v-else-if="scope === 'package'">Export all files in the same directory</span>
        <span v-else>Export all files in the project</span>
      </small>
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
      <button 
        class="btn btn-primary flex-grow-1" 
        @click="handleExport"
        :disabled="isExporting"
      >
        <Download :size="16" class="me-1" />
        {{ isExporting ? 'Exporting...' : 'Export' }}
      </button>
      <button 
        class="btn btn-secondary" 
        @click="$emit('close')"
        :disabled="isExporting"
      >
        Cancel
      </button>
    </div>

    <!-- Error Alert -->
    <div v-if="exportError" class="alert alert-danger mt-3 small mb-0">
      <strong>Error:</strong> {{ exportError }}
    </div>

    <!-- Info Box -->
    <div v-else class="alert alert-info mt-3 small mb-0">
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
