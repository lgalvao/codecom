<script setup>
import { Box, Code2, FunctionSquare } from 'lucide-vue-next';

const props = defineProps({
  symbols: {
    type: Array,
    default: () => []
  }
});

const emits = defineEmits(['select', 'show-callers']);

const getIcon = (type) => {
  switch (type) {
    case 'CLASS': return Box;
    case 'METHOD': return Code2;
    case 'FUNCTION': return FunctionSquare;
    default: return Code2;
  }
};

const getIconClass = (type) => {
  switch (type) {
    case 'CLASS': return 'text-primary';
    case 'METHOD': return 'text-success';
    case 'FUNCTION': return 'text-info';
    default: return 'text-secondary';
  }
};
</script>

<template>
  <div class="outline-view">
    <div v-if="symbols.length === 0" class="p-3 text-muted small text-center">
      No symbols detected in this file.
    </div>
    <div v-else class="list-group list-group-flush">
      <div 
        v-for="symbol in symbols" 
        :key="symbol.name + symbol.line"
        class="list-group-item list-group-item-action border-0 py-1 px-3 d-flex align-items-center cursor-pointer small"
        @click="emits('select', symbol)"
        @contextmenu.prevent="symbol.type === 'METHOD' && emits('show-callers', symbol)"
        :title="symbol.type === 'METHOD' ? 'Right-click to show callers' : ''"
      >
        <component :is="getIcon(symbol.type)" :size="14" class="me-2" :class="getIconClass(symbol.type)" />
        <span class="truncate text-truncate">{{ symbol.name }}</span>
        <span class="ms-auto text-muted xx-small">L{{ symbol.line }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.xx-small {
  font-size: 0.65rem;
}
.list-group-item {
  background-color: transparent;
  color: inherit;
}
.list-group-item:hover {
  background-color: rgba(0,0,0,0.05);
}
[data-bs-theme='dark'] .list-group-item:hover {
  background-color: rgba(255,255,255,0.05);
}
</style>
