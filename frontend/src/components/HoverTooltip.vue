<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

interface TooltipData {
  signature: string;
  documentation?: string;
  returnType?: string;
  parameters?: Array<{ name: string; type: string; }>;
  codePreview?: string;  // FR.40: Code bubble showing first 10 lines
  filePath?: string;
  line?: number;
}

const props = defineProps<{
  enabled: boolean;
  currentFile?: { name: string; path: string } | null;
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

const fetchSymbolDefinition = async (line: number): Promise<TooltipData | null> => {
  if (!props.currentFile) return null;

  try {
    const response = await axios.get('http://localhost:8080/api/analysis/definition', {
      params: {
        path: props.currentFile.path,
        line: line,
        column: 0
      }
    });

    if (response.data) {
      return {
        signature: response.data.signature,
        documentation: response.data.documentation,
        returnType: response.data.returnType,
        parameters: response.data.parameters,
        codePreview: response.data.codePreview,
        filePath: response.data.filePath,
        line: response.data.line,
      };
    }
  } catch (error) {
    // Symbol not found or error - silently fail
    console.debug('Symbol definition not found:', error);
  }

  return null;
};

const handleMouseMove = (event: MouseEvent) => {
  if (!props.enabled || !props.currentFile) return;
  
  const target = event.target as HTMLElement;
  
  // Check if hovering over a code line
  const lineElement = target.closest('.line');
  
  if (!lineElement) {
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
  
  hoverTimeout = window.setTimeout(async () => {
    // Get line number from the line element
    const lines = document.querySelectorAll('.line');
    const lineIndex = Array.from(lines).indexOf(lineElement as Element);
    
    if (lineIndex >= 0) {
      const lineNumber = lineIndex + 1;
      hoveredElement.value = lineElement as HTMLElement;
      emit('hover', lineElement as HTMLElement, { x: event.clientX, y: event.clientY });
      
      // Fetch symbol definition from backend
      const definition = await fetchSymbolDefinition(lineNumber);
      
      if (definition) {
        showTooltip(definition, event.clientX, event.clientY);
      }
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
      
      <div v-if="tooltipContent.codePreview" class="tooltip-section code-preview">
        <div class="label">Preview:</div>
        <pre class="code-bubble"><code>{{ tooltipContent.codePreview }}</code></pre>
        <div class="preview-info text-muted">
          Showing first 10 lines • Click to view full definition
        </div>
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
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
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

.code-preview {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--bs-border-color);
}

.code-bubble {
  background: rgba(128, 128, 128, 0.05);
  border: 1px solid var(--bs-border-color);
  border-radius: 4px;
  padding: 8px;
  margin: 8px 0;
  font-size: 0.75rem;
  line-height: 1.4;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
}

.code-bubble code {
  background: transparent;
  padding: 0;
  font-family: 'Fira Code', 'Cascadia Code', monospace;
  white-space: pre;
}

.preview-info {
  font-size: 0.7rem;
  font-style: italic;
  margin-top: 4px;
}
</style>
