<script setup>
import { ref, onMounted, watch } from 'vue';
import { createHighlighter } from 'shiki';

const props = defineProps({
  code: {
    type: String,
    default: ''
  },
  filename: {
    type: String,
    default: ''
  },
  theme: {
    type: String,
    default: 'github-dark'
  },
  hiddenLines: {
    type: Set,
    default: () => new Set()
  },
  clickNavigationMode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['navigate-to-symbol']);

const highlightedCode = ref('');
const isLoading = ref(true);
let highlighter = null;

const getLanguage = (filename) => {
  if (!filename) return 'text';
  const ext = filename.split('.').pop().toLowerCase();
  
  const map = {
    'java': 'java',
    'js': 'javascript',
    'ts': 'typescript',
    'html': 'html',
    'css': 'css',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'sql': 'sql',
    'plsql': 'plsql',
    'jsf': 'html', // JSF is often similar to HTML/XML
    'xhtml': 'html',
    'vue': 'vue',
    'json': 'json',
    'md': 'markdown',
    'sh': 'bash',
    'properties': 'properties',
    'log': 'log'
  };
  
  return map[ext] || 'text';
};

const updateHighlighting = async () => {
  if (!highlighter) return;
  
  const lang = getLanguage(props.filename);
  isLoading.value = true;
  
  try {
    highlightedCode.value = highlighter.codeToHtml(props.code, {
      lang: lang,
      theme: props.theme === 'dark' ? 'github-dark' : 'github-light',
      transformers: [
        {
          line(node, line) {
            if (props.hiddenLines.has(line)) {
              this.addClassToHast(node, 'line-faded');
            }
          }
        }
      ]
    });
  } catch (err) {
    console.error('Highlighting error:', err);
    highlightedCode.value = `<pre><code>${props.code}</code></pre>`;
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  highlighter = await createHighlighter({
    themes: ['github-dark', 'github-light'],
    langs: ['java', 'javascript', 'typescript', 'html', 'css', 'xml', 'yaml', 'sql', 'plsql', 'vue', 'json', 'markdown', 'bash', 'properties', 'log']
  });
  updateHighlighting();
});

watch([() => props.code, () => props.filename, () => props.theme, () => props.hiddenLines], () => {
  updateHighlighting();
});

/**
 * Handle clicks on code to enable symbol navigation
 * Implements FR.24 (Control-Click) and FR.25 (Click Navigation Mode)
 */
const handleCodeClick = (event) => {
  // Check if control/cmd key is pressed OR click navigation mode is enabled
  const shouldNavigate = event.ctrlKey || event.metaKey || props.clickNavigationMode;
  
  if (!shouldNavigate) return;
  
  // Get the clicked element
  let target = event.target;
  
  // Find the nearest token element
  while (target && !target.classList.contains('line')) {
    if (target.tagName === 'SPAN' && target.textContent.trim()) {
      const symbolText = target.textContent.trim();
      
      // Only navigate if it looks like a symbol (alphanumeric + underscore)
      if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(symbolText)) {
        event.preventDefault();
        emit('navigate-to-symbol', symbolText);
        return;
      }
    }
    target = target.parentElement;
  }
};
</script>

<template>
  <div class="code-viewer h-100 w-100">
    <output v-if="isLoading && !highlightedCode" class="d-flex justify-content-center align-items-center h-100">
      <div class="spinner-border text-primary" role="status"></div>
    </output>
    <div 
      v-else 
      class="shiki-container" 
      :class="{ 'click-navigation-active': clickNavigationMode }"
      v-html="highlightedCode"
      @click="handleCodeClick"
    ></div>
  </div>
</template>

<style>
.shiki-container pre {
  margin: 0;
  padding: 1rem;
  background-color: transparent !important;
  font-family: 'Fira Code', 'Cascadia Code', 'Source Code Pro', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  overflow: auto;
  height: 100%;
  white-space: pre-wrap; /* Enable soft word wrapping */
  word-wrap: break-word; /* Ensure long words break */
  overflow-wrap: break-word;
}

.shiki-container {
  height: 100%;
}

.code-viewer {
  background-color: var(--editor-bg);
}

.line {
  transition: opacity 0.3s ease;
}

.line-faded {
  opacity: 0.15;
  filter: blur(0.5px);
  pointer-events: none; /* Disable interaction with faded lines */
  user-select: none;    /* Prevent selection of faded lines */
}

/* Click navigation mode cursor */
.click-navigation-active {
  cursor: pointer;
}

.click-navigation-active .line span {
  cursor: pointer;
}

.click-navigation-active .line span:hover {
  text-decoration: underline;
  text-decoration-style: dotted;
}
</style>
