<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface TooltipData {
  signature: string;
  documentation?: string;
  returnType?: string;
  parameters?: Array<{ name: string; type: string; }>;
}

const props = defineProps<{
  enabled: boolean;
}>();

const emit = defineEmits<{
  hover: [element: HTMLElement, position: { x: number; y: number }];
}>();

const tooltipVisible = ref(false);
const tooltipContent = ref<TooltipData | null>(null);
const tooltipPosition = ref({ x: 0, y: 0 });
const hoveredElement = ref<HTMLElement | null>(null);

let hoverTimeout: number | null = null;

const showTooltip = (content: TooltipData, x: number, y: number) => {
  tooltipContent.value = content;
  tooltipPosition.value = { x, y };
  tooltipVisible.value = true;
};

const hideTooltip = () => {
  tooltipVisible.value = false;
  tooltipContent.value = null;
  hoveredElement.value = null;
};

const handleMouseMove = (event: MouseEvent) => {
  if (!props.enabled) return;
  
  const target = event.target as HTMLElement;
  
  // Check if hovering over a code symbol (simplified detection)
  const isCodeSymbol = 
    target.classList.contains('token') || 
    target.classList.contains('identifier') ||
    target.closest('.line');
  
  if (!isCodeSymbol) {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }
    hideTooltip();
    return;
  }
  
  // Debounce hover
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
  }
  
  hoverTimeout = window.setTimeout(() => {
    // In a real implementation, this would query the backend for symbol info
    // For now, we'll show a placeholder
    const symbolText = target.textContent || '';
    
    if (symbolText.trim().length > 0 && /^[a-zA-Z_]\w*$/.test(symbolText.trim())) {
      hoveredElement.value = target;
      emit('hover', target, { x: event.clientX, y: event.clientY });
      
      // Placeholder tooltip - in real implementation, fetch from backend
      showTooltip({
        signature: `${symbolText}()`,
        documentation: 'Hover documentation will be shown here',
      }, event.clientX, event.clientY);
    }
  }, 500); // 500ms delay before showing tooltip
};

const handleMouseLeave = () => {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }
  hideTooltip();
};

onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseleave', handleMouseLeave);
});

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseleave', handleMouseLeave);
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
  }
});

defineExpose({
  showTooltip,
  hideTooltip,
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="tooltipVisible && tooltipContent"
      class="hover-tooltip"
      :style="{
        left: `${tooltipPosition.x + 10}px`,
        top: `${tooltipPosition.y + 10}px`,
      }"
    >
      <div class="tooltip-header">
        <code class="signature">{{ tooltipContent.signature }}</code>
      </div>
      
      <div v-if="tooltipContent.returnType" class="tooltip-section">
        <span class="label">Returns:</span>
        <code>{{ tooltipContent.returnType }}</code>
      </div>
      
      <div v-if="tooltipContent.parameters && tooltipContent.parameters.length > 0" class="tooltip-section">
        <span class="label">Parameters:</span>
        <ul class="parameter-list">
          <li v-for="(param, index) in tooltipContent.parameters" :key="index">
            <code>{{ param.name }}</code>: <span class="type">{{ param.type }}</span>
          </li>
        </ul>
      </div>
      
      <div v-if="tooltipContent.documentation" class="tooltip-section documentation">
        <div class="doc-content">{{ tooltipContent.documentation }}</div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.hover-tooltip {
  position: fixed;
  z-index: 10000;
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  font-size: 0.875rem;
  pointer-events: none;
}

.tooltip-header {
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--bs-border-color);
}

.signature {
  color: var(--bs-primary);
  font-weight: 600;
  font-size: 0.9rem;
}

.tooltip-section {
  margin-top: 8px;
}

.label {
  font-weight: 600;
  color: var(--bs-secondary);
  margin-right: 6px;
  font-size: 0.8rem;
}

.parameter-list {
  list-style: none;
  padding-left: 0;
  margin: 4px 0 0 0;
}

.parameter-list li {
  margin: 2px 0;
  padding-left: 12px;
}

.parameter-list code {
  color: var(--bs-info);
}

.type {
  color: var(--bs-success);
  font-style: italic;
}

.documentation {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--bs-border-color);
}

.doc-content {
  color: var(--bs-body-color);
  line-height: 1.4;
  font-size: 0.85rem;
}

code {
  background: rgba(128, 128, 128, 0.1);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Fira Code', 'Cascadia Code', monospace;
}
</style>
