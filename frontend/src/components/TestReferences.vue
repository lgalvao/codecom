<template>
  <div class="test-references">
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="bi bi-file-earmark-code"></i> Test References
        </h5>
        <button class="btn btn-sm btn-outline-secondary" @click="$emit('close')">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 mb-0">Finding test references...</p>
        </div>

        <div v-else-if="error" class="alert alert-warning">
          <i class="bi bi-exclamation-triangle"></i> {{ error }}
        </div>

        <div v-else>
          <div class="mb-3">
            <h6>{{ className }}</h6>
            <p class="text-muted small">
              {{ references.length }} test file{{ references.length !== 1 ? 's' : '' }} found
            </p>
          </div>

          <div v-if="references.length === 0" class="text-muted text-center py-3">
            <i class="bi bi-info-circle"></i>
            No test files reference this class.
          </div>

          <div v-else class="test-list">
            <div
              v-for="(ref, index) in references"
              :key="index"
              class="test-item"
              @click="navigateToTest(ref)"
            >
              <div class="test-header">
                <strong>{{ ref.testClassName }}</strong>
              </div>
              <div class="test-details">
                <small class="text-muted">{{ getRelativePath(ref.testFilePath) }}</small>
                <span class="badge bg-primary">
                  {{ ref.referenceCount }} reference{{ ref.referenceCount > 1 ? 's' : '' }}
                </span>
              </div>
              <div v-if="ref.referenceLines && ref.referenceLines.length > 0" class="test-lines mt-1">
                <small class="text-muted">
                  Lines: {{ ref.referenceLines.slice(0, 5).join(', ') }}
                  <span v-if="ref.referenceLines.length > 5">...</span>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { API_CONFIG, PATH_CONFIG } from '../config/api';

const props = defineProps({
  rootPath: {
    type: String,
    required: true
  },
  className: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['close', 'navigate']);

const loading = ref(false);
const error = ref(null);
const references = ref([]);

const loadTestReferences = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const params = new URLSearchParams({
      path: props.rootPath,
      className: props.className
    });
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/analysis/test-references?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load test references: ${response.statusText}`);
    }
    
    references.value = await response.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const navigateToTest = (ref) => {
  emit('navigate', {
    filePath: ref.testFilePath,
    line: ref.referenceLines && ref.referenceLines.length > 0 ? ref.referenceLines[0] : 1
  });
};

const getRelativePath = (fullPath) => {
  if (!fullPath) return '';
  
  // Try to make path relative to rootPath
  if (fullPath.startsWith(props.rootPath)) {
    return fullPath.substring(props.rootPath.length + 1);
  }
  
  // Otherwise just show the last few parts
  const parts = fullPath.split(/[/\\]/);
  return parts.length > PATH_CONFIG.MAX_DEPTH_TO_SHOW 
    ? '.../' + parts.slice(-PATH_CONFIG.MAX_DEPTH_TO_SHOW).join('/')
    : fullPath;
};

// Load test references when component mounts or props change
watch(() => [props.className, props.rootPath], loadTestReferences, { immediate: true });
</script>

<style scoped>
.test-references {
  max-height: 600px;
  overflow-y: auto;
}

.test-list {
  max-height: 500px;
  overflow-y: auto;
}

.test-item {
  padding: 0.75rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.test-item:hover {
  background-color: var(--bs-light);
  border-color: var(--bs-primary);
  transform: translateX(4px);
}

.test-header {
  margin-bottom: 0.25rem;
}

.test-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.test-lines {
  font-family: 'Fira Code', monospace;
}
</style>
