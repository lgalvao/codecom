<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  symbols: {
    type: Array,
    default: () => []
  },
  fileContent: {
    type: String,
    default: ''
  },
  totalLines: {
    type: Number,
    default: 0
  },
  minLinesToShow: {
    type: Number,
    default: 100
  }
});

const containerRef = ref(null);
const containerHeight = ref(500);

// Update container height based on actual rendered height
const updateContainerHeight = () => {
  const scrollContainer = document.querySelector('.shiki-container pre');
  if (scrollContainer) {
    containerHeight.value = scrollContainer.offsetHeight;
  }
};

// Detect error handling code (try/catch/throw/Exception keywords)
const detectErrorHandlingLines = (content) => {
  const errorLines = new Set();
  const lines = content.split('\n');
  // Use word boundary regex for better matching
  // Case-sensitive to reduce false positives (e.g., 'error' in variable names)
  const errorKeywords = ['try', 'catch', 'throw', 'throws', 'Exception', 'finally'];
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    // Check if line contains error handling keywords as whole words
    if (errorKeywords.some(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`);
      return regex.test(trimmedLine);
    })) {
      errorLines.add(index + 1); // Line numbers are 1-based
    }
  });
  
  return errorLines;
};

// Process symbols into blocks for visualization
const blocks = computed(() => {
  if (!props.symbols || props.symbols.length === 0 || props.totalLines < props.minLinesToShow) {
    return [];
  }
  
  const errorLines = detectErrorHandlingLines(props.fileContent);
  const processedBlocks = [];
  
  // Default fallback color and label (moved outside loop for efficiency)
  const FALLBACK_COLOR = '#6b7280'; // gray
  const FALLBACK_LABEL = 'Other';
  
  props.symbols.forEach((symbol) => {
    const startLine = symbol.line || 1;
    const endLine = symbol.endLine || startLine + 1;
    const lineSpan = Math.max(1, endLine - startLine);
    
    // Calculate block position and height
    const blockTop = (startLine / props.totalLines) * 100; // percentage
    const blockHeight = Math.max(0.2, (lineSpan / props.totalLines) * 100); // min 0.2% height
    
    // Determine color based on priority:
    // 1. Red if contains error handling (highest priority)
    // 2. Green if public
    // 3. Blue if private/protected
    let color = FALLBACK_COLOR;
    let label = FALLBACK_LABEL;
    
    // Check if this symbol overlaps with error handling lines
    const hasErrorHandling = Array.from({ length: lineSpan }, (_, i) => startLine + i)
      .some(line => errorLines.has(line));
    
    if (hasErrorHandling) {
      color = '#ef4444'; // red
      label = 'Error handling';
    } else if (symbol.visibility === 'public' || symbol.modifiers?.includes('public')) {
      color = '#22c55e'; // green
      label = 'Public';
    } else if (symbol.visibility === 'private' || symbol.visibility === 'protected' || 
               symbol.modifiers?.includes('private') || symbol.modifiers?.includes('protected')) {
      color = '#3b82f6'; // blue
      label = 'Private/Protected';
    } else if (symbol.type === 'CLASS' || symbol.type === 'INTERFACE') {
      color = '#22c55e'; // green for classes (typically public)
      label = 'Class/Interface';
    } else if (symbol.type === 'METHOD' || symbol.type === 'FUNCTION') {
      // If no visibility specified, default to blue for methods
      color = '#3b82f6';
      label = 'Method';
    }
    
    processedBlocks.push({
      id: `${symbol.name}-${startLine}`,
      name: symbol.name,
      type: symbol.type,
      line: startLine,
      endLine: endLine,
      top: blockTop,
      height: blockHeight,
      color: color,
      label: label
    });
  });
  
  return processedBlocks;
});

// Should the minimap be visible?
const isVisible = computed(() => {
  return props.totalLines >= props.minLinesToShow && blocks.value.length > 0;
});

// Handle click on block to scroll to that section
const handleBlockClick = (block) => {
  const scrollContainer = document.querySelector('.shiki-container pre');
  if (!scrollContainer) return;
  
  // Calculate the scroll position
  const scrollHeight = scrollContainer.scrollHeight;
  const targetPosition = (block.line / props.totalLines) * scrollHeight;
  
  // Smooth scroll to the target position
  scrollContainer.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });
  
  // Highlight the line
  setTimeout(() => {
    const lines = scrollContainer.querySelectorAll('.line');
    if (lines[block.line - 1]) {
      lines[block.line - 1].classList.add('highlight-line');
      setTimeout(() => {
        lines[block.line - 1].classList.remove('highlight-line');
      }, 1000);
    }
  }, 500);
};

// Tooltip management
const tooltip = ref({
  visible: false,
  content: '',
  x: 0,
  y: 0
});

const showTooltip = (event, block) => {
  const lineRange = block.line === block.endLine 
    ? `Line ${block.line}` 
    : `Lines ${block.line}-${block.endLine}`;
  
  tooltip.value = {
    visible: true,
    content: `${block.name}\n${block.label}\n${lineRange}`,
    x: event.clientX + 10,
    y: event.clientY + 10
  };
};

const hideTooltip = () => {
  tooltip.value.visible = false;
};

// Setup resize observer
onMounted(() => {
  updateContainerHeight();
  window.addEventListener('resize', updateContainerHeight);
  
  // Watch for content changes
  const observer = new MutationObserver(updateContainerHeight);
  const scrollContainer = document.querySelector('.shiki-container');
  if (scrollContainer) {
    observer.observe(scrollContainer, { childList: true, subtree: true });
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', updateContainerHeight);
});
</script>

<template>
  <div v-if="isVisible" class="code-minimap" ref="containerRef">
    <div class="minimap-container">
      <div 
        v-for="block in blocks" 
        :key="block.id"
        class="minimap-block"
        :style="{
          top: block.top + '%',
          height: block.height + '%',
          backgroundColor: block.color
        }"
        @click="handleBlockClick(block)"
        @mouseenter="(e) => showTooltip(e, block)"
        @mouseleave="hideTooltip"
        :title="`${block.name} (Line ${block.line})`"
      ></div>
    </div>
    
    <!-- Tooltip -->
    <div 
      v-if="tooltip.visible" 
      class="minimap-tooltip"
      :style="{
        left: tooltip.x + 'px',
        top: tooltip.y + 'px'
      }"
    >
      {{ tooltip.content }}
    </div>
  </div>
</template>

<style scoped>
.code-minimap {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 20px;
  background-color: rgba(0, 0, 0, 0.1);
  border-left: 1px solid rgba(128, 128, 128, 0.2);
  z-index: 10;
  overflow: hidden;
}

[data-bs-theme='dark'] .code-minimap {
  background-color: rgba(255, 255, 255, 0.05);
  border-left-color: rgba(255, 255, 255, 0.1);
}

.minimap-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.minimap-block {
  position: absolute;
  width: 100%;
  left: 0;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease, transform 0.2s ease;
  border-radius: 1px;
}

.minimap-block:hover {
  opacity: 1;
  transform: scaleX(1.2);
  z-index: 5;
}

.minimap-tooltip {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-family: monospace;
  white-space: pre-line;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  max-width: 200px;
}

[data-bs-theme='dark'] .minimap-tooltip {
  background-color: rgba(255, 255, 255, 0.95);
  color: black;
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.2);
}
</style>
