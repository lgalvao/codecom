<template>
  <div class="caller-list">
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="bi bi-diagram-3"></i> Call Graph
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
          <p class="mt-2 mb-0">Analyzing call graph...</p>
        </div>

        <div v-else-if="error" class="alert alert-warning">
          <i class="bi bi-exclamation-triangle"></i> {{ error }}
        </div>

        <div v-else-if="statistics">
          <div class="statistics-summary mb-3">
            <h6>{{ statistics.targetMethod }}</h6>
            <p class="text-muted mb-2">
              <span v-if="statistics.targetClass">in {{ statistics.targetClass }}</span>
            </p>
            <div class="d-flex gap-3">
              <div>
                <strong>{{ statistics.totalCallers }}</strong>
                <small class="text-muted d-block">Callers</small>
              </div>
              <div>
                <strong>{{ statistics.totalCallSites }}</strong>
                <small class="text-muted d-block">Call Sites</small>
              </div>
            </div>
          </div>

          <hr>

          <div v-if="statistics.callers.length === 0" class="text-muted text-center py-3">
            <i class="bi bi-info-circle"></i>
            No callers found. This method may be unused or an entry point.
          </div>

          <div v-else class="caller-list-items">
            <div
              v-for="(caller, index) in statistics.callers"
              :key="index"
              class="caller-item"
              @click="navigateToCaller(caller)"
            >
              <div class="caller-header">
                <strong>{{ caller.methodName }}</strong>
                <span v-if="caller.className" class="text-muted">
                  in {{ caller.className }}
                </span>
              </div>
              <div class="caller-details">
                <small class="text-muted">{{ getRelativePath(caller.filePath) }}</small>
                <span class="badge bg-secondary">{{ caller.callCount }} call{{ caller.callCount > 1 ? 's' : '' }}</span>
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
  methodName: {
    type: String,
    required: true
  },
  className: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'navigate']);

const loading = ref(false);
const error = ref(null);
const statistics = ref(null);

const loadCallers = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const params = new URLSearchParams({
      path: props.rootPath,
      methodName: props.methodName
    });
    
    if (props.className) {
      params.append('className', props.className);
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/analysis/callers?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load callers: ${response.statusText}`);
    }
    
    statistics.value = await response.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const navigateToCaller = (caller) => {
  emit('navigate', {
    filePath: caller.filePath,
    line: caller.line
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

// Load callers when component mounts or props change
watch(() => [props.methodName, props.className, props.rootPath], loadCallers, { immediate: true });
</script>

<style scoped>
.caller-list {
  max-height: 600px;
  overflow-y: auto;
}

.statistics-summary {
  padding: 0.5rem;
  background-color: var(--bs-light);
  border-radius: 0.25rem;
}

.caller-list-items {
  max-height: 400px;
  overflow-y: auto;
}

.caller-item {
  padding: 0.75rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.caller-item:hover {
  background-color: var(--bs-light);
  border-color: var(--bs-primary);
  transform: translateX(4px);
}

.caller-header {
  margin-bottom: 0.25rem;
}

.caller-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
