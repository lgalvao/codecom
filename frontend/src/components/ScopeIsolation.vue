<script setup lang="ts">
import { ref, computed } from 'vue';
import { Focus, X } from 'lucide-vue-next';

interface Symbol {
  name: string;
  type: string;
  line: number;
  endLine?: number;
}

const props = defineProps<{
  symbols: Symbol[];
  currentFile?: string | null;
}>();

const emit = defineEmits<{
  isolate: [symbol: Symbol];
  clear: [];
}>();

const isolatedSymbol = ref<Symbol | null>(null);
const isActive = ref(false);

const activateIsolation = (symbol: Symbol) => {
  isolatedSymbol.value = symbol;
  isActive.value = true;
  emit('isolate', symbol);
};

const clearIsolation = () => {
  isolatedSymbol.value = null;
  isActive.value = false;
  emit('clear');
};

const symbolOptions = computed(() => {
  return props.symbols.filter(s => 
    s.type === 'METHOD' || 
    s.type === 'CLASS' || 
    s.type === 'FUNCTION' ||
    s.type === 'INTERFACE'
  );
});

defineExpose({
  isolatedSymbol,
  isActive,
  activateIsolation,
  clearIsolation,
});
</script>

<template>
  <div class="scope-isolation-panel">
    <div class="panel-header mb-3">
      <div class="d-flex align-items-center">
        <Focus :size="16" class="me-2" />
        <span class="fw-semibold">Scope Isolation</span>
      </div>
      <p class="text-muted small mb-0">
        Focus on a specific function or class
      </p>
    </div>

    <div v-if="!isActive" class="selection-area">
      <label class="form-label small">Select a symbol to isolate:</label>
      <div class="symbol-list">
        <button
          v-for="symbol in symbolOptions"
          :key="`${symbol.name}-${symbol.line}`"
          class="btn btn-outline-secondary btn-sm w-100 text-start mb-2"
          @click="activateIsolation(symbol)"
        >
          <span class="symbol-type badge bg-secondary me-2">{{ symbol.type }}</span>
          <span class="symbol-name">{{ symbol.name }}</span>
          <span class="text-muted small ms-auto">Line {{ symbol.line }}</span>
        </button>
      </div>
      
      <div v-if="symbolOptions.length === 0" class="alert alert-info small">
        No symbols available for isolation. Open a file with methods or classes.
      </div>
    </div>

    <div v-else class="isolation-active">
      <div class="alert alert-primary d-flex align-items-center justify-content-between">
        <div>
          <strong>Isolating:</strong> {{ isolatedSymbol?.name }}
          <div class="small text-muted">Lines {{ isolatedSymbol?.line }}-{{ isolatedSymbol?.endLine || '?' }}</div>
        </div>
        <button
          class="btn btn-sm btn-outline-primary"
          @click="clearIsolation"
          title="Clear isolation"
        >
          <X :size="16" />
        </button>
      </div>
      
      <div class="isolation-info small text-muted">
        <p class="mb-2">
          <strong>Active:</strong> Only the selected symbol is fully visible.
        </p>
        <p class="mb-0">
          Other code is dimmed for context.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scope-isolation-panel {
  padding: 1rem;
}

.panel-header {
  border-bottom: 1px solid var(--bs-border-color);
  padding-bottom: 0.75rem;
}

.symbol-list {
  max-height: 400px;
  overflow-y: auto;
}

.symbol-type {
  font-size: 0.65rem;
  min-width: 60px;
  display: inline-block;
  text-align: center;
}

.symbol-name {
  font-family: 'Fira Code', monospace;
  font-size: 0.85rem;
}

.isolation-active {
  margin-top: 1rem;
}

.isolation-info {
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(128, 128, 128, 0.1);
  border-radius: 4px;
}
</style>
