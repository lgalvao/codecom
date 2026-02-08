<template>
  <div class="complexity-heatmap">
    <div class="heatmap-header">
      <h5>Complexity Heatmap</h5>
      <BButton size="sm" variant="outline-secondary" @click="loadComplexity">
        <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
        Refresh
      </BButton>
    </div>
    
    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    
    <div v-if="loading && !complexityData.length" class="text-center p-3">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div v-else-if="complexityData.length > 0" class="heatmap-content">
      <div class="legend mb-3">
        <div class="legend-title">Complexity Level:</div>
        <div class="legend-items">
          <span class="legend-item">
            <span class="legend-color" :style="{ backgroundColor: getLevelColor('LOW') }"></span>
            Low (< 25%)
          </span>
          <span class="legend-item">
            <span class="legend-color" :style="{ backgroundColor: getLevelColor('MEDIUM') }"></span>
            Medium (25-50%)
          </span>
          <span class="legend-item">
            <span class="legend-color" :style="{ backgroundColor: getLevelColor('HIGH') }"></span>
            High (50-75%)
          </span>
          <span class="legend-item">
            <span class="legend-color" :style="{ backgroundColor: getLevelColor('VERY_HIGH') }"></span>
            Very High (> 75%)
          </span>
        </div>
      </div>
      
      <div class="file-list">
        <div 
          v-for="file in sortedFiles" 
          :key="file.filePath"
          class="file-item"
          :class="'complexity-' + file.complexityLevel.toLowerCase()"
          @click="$emit('file-selected', file.filePath)"
        >
          <div class="file-indicator" :style="{ backgroundColor: getColor(file.complexityScore) }"></div>
          <div class="file-info">
            <div class="file-name">{{ getFileName(file.filePath) }}</div>
            <div class="file-metrics">
              <span class="metric">CC: {{ file.cyclomaticComplexity }}</span>
              <span class="metric">LoC: {{ file.linesOfCode }}</span>
              <span class="metric">Methods: {{ file.numberOfMethods }}</span>
            </div>
          </div>
          <div class="complexity-badge" :class="'badge-' + file.complexityLevel.toLowerCase()">
            {{ file.complexityLevel }}
          </div>
        </div>
      </div>
      
      <div class="summary mt-3">
        <h6>Summary</h6>
        <div class="summary-stats">
          <div class="stat">
            <span class="stat-label">Total Files:</span>
            <span class="stat-value">{{ complexityData.length }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Avg Complexity:</span>
            <span class="stat-value">{{ averageComplexity.toFixed(2) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">High Complexity:</span>
            <span class="stat-value">{{ highComplexityCount }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="text-muted p-3">
      No complexity data available. Click Refresh to analyze the project.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { BButton } from 'bootstrap-vue-next';
import ComplexityService, { FileComplexity } from '../services/ComplexityService';

interface Props {
  projectPath: string;
  theme?: 'light' | 'dark';
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'light'
});

defineEmits<{
  (e: 'file-selected', filePath: string): void;
}>();

const loading = ref(false);
const error = ref('');
const complexityData = ref<FileComplexity[]>([]);

const sortedFiles = computed(() => {
  return [...complexityData.value].sort((a, b) => b.complexityScore - a.complexityScore);
});

const averageComplexity = computed(() => {
  if (complexityData.value.length === 0) return 0;
  const sum = complexityData.value.reduce((acc, file) => acc + file.complexityScore, 0);
  return sum / complexityData.value.length;
});

const highComplexityCount = computed(() => {
  return complexityData.value.filter(f => 
    f.complexityLevel === 'HIGH' || f.complexityLevel === 'VERY_HIGH'
  ).length;
});

async function loadComplexity() {
  if (!props.projectPath) {
    error.value = 'No project path specified';
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    complexityData.value = await ComplexityService.getProjectComplexity(props.projectPath);
  } catch (e) {
    error.value = `Failed to load complexity data: ${e instanceof Error ? e.message : String(e)}`;
  } finally {
    loading.value = false;
  }
}

function getColor(score: number): string {
  return ComplexityService.getHeatmapColor(score, props.theme);
}

function getLevelColor(level: string): string {
  // Representative scores for each complexity level (matches backend thresholds)
  // LOW: 0-25%, MEDIUM: 25-50%, HIGH: 50-75%, VERY_HIGH: 75-100%
  const LEVEL_SCORES: Record<string, number> = {
    'LOW': 0.12,
    'MEDIUM': 0.37,
    'HIGH': 0.62,
    'VERY_HIGH': 0.87
  };
  return getColor(LEVEL_SCORES[level] || 0);
}

function getFileName(filePath: string): string {
  const parts = filePath.split('/');
  return parts[parts.length - 1];
}

// Load complexity data on mount
loadComplexity();
</script>

<style scoped>
.complexity-heatmap {
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 0.25rem;
  padding: 1rem;
}

.heatmap-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.legend {
  background: var(--bs-light);
  padding: 0.75rem;
  border-radius: 0.25rem;
}

.legend-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.legend-items {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.legend-color {
  width: 1rem;
  height: 1rem;
  border-radius: 0.125rem;
  display: inline-block;
}

.file-list {
  max-height: 500px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.file-item:hover {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  transform: translateX(4px);
}

.file-indicator {
  width: 4px;
  height: 100%;
  border-radius: 2px;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-metrics {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--bs-secondary);
  margin-top: 0.25rem;
}

.metric {
  white-space: nowrap;
}

.complexity-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-low {
  background: #d1fae5;
  color: #065f46;
}

.badge-medium {
  background: #fef3c7;
  color: #92400e;
}

.badge-high {
  background: #fed7aa;
  color: #9a3412;
}

.badge-very_high {
  background: #fecaca;
  color: #991b1b;
}

.summary {
  background: var(--bs-light);
  padding: 0.75rem;
  border-radius: 0.25rem;
}

.summary-stats {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  gap: 0.5rem;
}

.stat-label {
  font-weight: 500;
}

.stat-value {
  color: var(--bs-primary);
  font-weight: 600;
}
</style>
