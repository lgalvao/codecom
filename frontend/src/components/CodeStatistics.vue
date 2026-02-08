<script setup lang="ts">
import { ref, computed } from 'vue';
import { getFileStatistics, getDirectoryStatistics, type CodeStatistics } from '../services/StatisticsService';

const props = defineProps<{
  path: string;
  isDirectory?: boolean;
}>();

const statistics = ref<CodeStatistics | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const loadStatistics = async () => {
  if (!props.path) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    if (props.isDirectory) {
      statistics.value = await getDirectoryStatistics(props.path);
    } else {
      statistics.value = await getFileStatistics(props.path);
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to load statistics';
    console.error('Error loading statistics:', e);
  } finally {
    loading.value = false;
  }
};

const totalStructures = computed(() => {
  if (!statistics.value) return 0;
  return statistics.value.classCount + 
         statistics.value.interfaceCount + 
         statistics.value.recordCount;
});

const codePercentage = computed(() => {
  if (!statistics.value || statistics.value.totalLines === 0) return 0;
  return Math.round((statistics.value.codeLines / statistics.value.totalLines) * 100);
});

const commentPercentage = computed(() => {
  if (!statistics.value || statistics.value.totalLines === 0) return 0;
  return Math.round((statistics.value.commentLines / statistics.value.totalLines) * 100);
});

defineExpose({
  loadStatistics
});
</script>

<template>
  <div class="statistics-panel">
    <div v-if="loading" class="text-center py-3">
      <div class="spinner-border spinner-border-sm" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="statistics" class="stats-content">
      <h6 class="mb-3">
        <i class="bi bi-graph-up me-2"></i>
        Statistics
      </h6>

      <!-- Line Counts -->
      <div class="stat-section mb-3">
        <div class="stat-header">Lines</div>
        <div class="stat-item">
          <span class="stat-label">Total:</span>
          <span class="stat-value">{{ statistics.totalLines.toLocaleString() }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Code:</span>
          <span class="stat-value">
            {{ statistics.codeLines.toLocaleString() }}
            <span class="text-muted small">({{ codePercentage }}%)</span>
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Comments:</span>
          <span class="stat-value">
            {{ statistics.commentLines.toLocaleString() }}
            <span class="text-muted small">({{ commentPercentage }}%)</span>
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Blank:</span>
          <span class="stat-value">{{ statistics.blankLines.toLocaleString() }}</span>
        </div>
      </div>

      <!-- Structure Counts -->
      <div class="stat-section mb-3">
        <div class="stat-header">Structures</div>
        <div class="stat-item">
          <span class="stat-label">Classes:</span>
          <span class="stat-value">{{ statistics.classCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Interfaces:</span>
          <span class="stat-value">{{ statistics.interfaceCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Records:</span>
          <span class="stat-value">{{ statistics.recordCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Methods:</span>
          <span class="stat-value">{{ statistics.methodCount }}</span>
        </div>
      </div>

      <!-- Package Count (for directories) -->
      <div v-if="isDirectory && statistics.packageCount > 0" class="stat-section">
        <div class="stat-header">Packages</div>
        <div class="stat-item">
          <span class="stat-label">Total:</span>
          <span class="stat-value">{{ statistics.packageCount }}</span>
        </div>
      </div>

      <!-- Summary Metrics -->
      <div class="stat-section mt-3 pt-2 border-top">
        <div class="stat-item">
          <span class="stat-label">Total Structures:</span>
          <span class="stat-value fw-bold">{{ totalStructures }}</span>
        </div>
        <div v-if="statistics.methodCount > 0 && totalStructures > 0" class="stat-item">
          <span class="stat-label">Avg Methods/Structure:</span>
          <span class="stat-value">{{ (statistics.methodCount / totalStructures).toFixed(1) }}</span>
        </div>
      </div>
    </div>

    <div v-else class="text-muted text-center py-3 small">
      No statistics available
    </div>
  </div>
</template>

<style scoped>
.statistics-panel {
  font-size: 0.875rem;
  padding: 0.5rem;
}

.stats-content {
  padding: 0.5rem;
}

.stat-section {
  border-left: 3px solid var(--bs-primary);
  padding-left: 0.75rem;
}

.stat-header {
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--bs-secondary);
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  font-size: 0.85rem;
}

.stat-label {
  color: var(--bs-body-color);
  opacity: 0.8;
}

.stat-value {
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .stat-section {
    border-left-color: var(--bs-info);
  }
  
  .stat-header {
    color: var(--bs-info);
  }
}
</style>
