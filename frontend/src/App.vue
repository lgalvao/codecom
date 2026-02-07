<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { BButton, BNavbar, BNavbarBrand, BFormSelect } from 'bootstrap-vue-next';
import { Sun, Moon, FolderOpen, Code, Settings } from 'lucide-vue-next';
import FileTreeNode from './components/FileTreeNode.vue';
import CodeHighlighter from './components/CodeHighlighter.vue';
import OutlineView from './components/OutlineView.vue';

const theme = ref('dark');
const fileTree = ref(null);
const selectedFile = ref(null);
const fileContent = ref('');
const symbols = ref([]);
const isLoading = ref(false);

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.bsTheme = theme.value;
  localStorage.setItem('theme', theme.value);
};

const fetchTree = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/files/tree?path=..');
    fileTree.value = response.data;
  } catch (error) {
    console.error('Error fetching file tree:', error);
  }
};

const handleFileSelect = async (node) => {
  selectedFile.value = node;
  isLoading.value = true;
  symbols.value = [];
  try {
    const [contentRes, outlineRes] = await Promise.all([
      axios.get(`http://localhost:8080/api/files/content?path=${encodeURIComponent(node.path)}`, { responseType: 'text' }),
      axios.get(`http://localhost:8080/api/analysis/outline?path=${encodeURIComponent(node.path)}`)
    ]);
    fileContent.value = contentRes.data;
    symbols.value = outlineRes.data;
  } catch (error) {
    fileContent.value = 'Error loading file content: ' + error.message;
  } finally {
    isLoading.value = false;
  }
};

const handleSymbolSelect = (symbol) => {
  const editor = document.querySelector('.shiki-container pre');
  if (editor) {
    const lines = editor.querySelectorAll('.line');
    if (lines[symbol.line - 1]) {
      lines[symbol.line - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
      lines[symbol.line - 1].classList.add('highlight-line');
      setTimeout(() => {
        lines[symbol.line - 1].classList.remove('highlight-line');
      }, 2000);
    }
  }
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  theme.value = savedTheme;
  document.documentElement.dataset.bsTheme = theme.value;
  fetchTree();
});

const complexity = ref('standard');
const complexityOptions = [
  { text: 'Simplified', value: 'simplified' },
  { text: 'Standard', value: 'standard' },
  { text: 'Architectural', value: 'architectural' }
];

</script>

<template>
  <div class="h-100 d-flex flex-column">
    <BNavbar toggleable="lg" :type="theme" :variant="theme" class="px-3 border-bottom border-secondary">
      <BNavbarBrand href="#" :class="theme === 'dark' ? 'text-white' : 'text-dark'">
        <Code class="me-2" />
        CodeCom
      </BNavbarBrand>
      
      <div class="ms-auto d-flex align-items-center gap-3">
        <label for="lod-select" :class="theme === 'dark' ? 'text-white-50' : 'text-muted'" class="small mb-0">Level of Detail:</label>
        <BFormSelect 
          id="lod-select" 
          v-model="complexity" 
          :options="complexityOptions" 
          size="sm" 
          :class="theme === 'dark' ? 'bg-dark text-white border-secondary' : 'bg-light text-dark border-secondary'" 
          style="width: 150px;" 
        />
        
        <BButton variant="link" :class="theme === 'dark' ? 'text-white-50' : 'text-muted'" class="p-0" @click="toggleTheme">
          <Sun v-if="theme === 'dark'" :size="20" />
          <Moon v-else :size="20" />
        </BButton>
        <Settings variant="link" :class="theme === 'dark' ? 'text-white-50' : 'text-muted'" class="cursor-pointer" :size="20" />
      </div>
    </BNavbar>

    <div class="flex-grow-1 d-flex overflow-hidden">
      <!-- Sidebar -->
      <div class="sidebar border-end d-flex flex-column" style="width: 260px; background-color: var(--sidebar-bg);">
        <div class="p-3 border-bottom d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center">
            <FolderOpen :size="18" class="me-2" />
            <span class="fw-bold small">EXPLORER</span>
          </div>
          <BButton variant="link" size="sm" class="p-0 text-muted" @click="fetchTree">
             <Code :size="14" />
          </BButton>
        </div>
        <div class="flex-grow-1 p-0 overflow-auto">
          <output v-if="!fileTree" class="text-muted small p-3 d-block text-center">
            <div class="spinner-border spinner-border-sm me-2" role="status"></div>
            Loading...
          </output>
          <FileTreeNode v-else :node="fileTree" @select="handleFileSelect" />
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-grow-1 d-flex flex-column overflow-hidden">
        <div class="tabs-area border-bottom px-2 py-1 bg-light d-flex align-items-center" style="height: 35px; background-color: var(--sidebar-bg) !important;">
           <span v-if="selectedFile" class="badge bg-secondary rounded-pill me-2 px-3 py-1 small fw-normal">
             {{ selectedFile.name }}
           </span>
        </div>
        <div class="flex-grow-1 p-0 overflow-hidden editor-bg position-relative d-flex">
          <div v-if="!selectedFile" class="welcome-screen text-center my-5 py-5 w-100">
            <Code :size="64" class="text-muted mb-4" />
            <h2 class="display-6">Welcome to CodeCom</h2>
            <p class="text-muted lead">Smart code comprehension with Spring Boot & Vue 3</p>
            <div class="mt-4">
              <p class="small text-muted">Select a file from the explorer to begin or use the LoD controls above to adjust visibility.</p>
            </div>
          </div>
          <template v-else>
            <div class="flex-grow-1 h-100 overflow-hidden">
               <CodeHighlighter 
                 :code="fileContent" 
                 :filename="selectedFile.name" 
                 :theme="theme" 
               />
            </div>
            <!-- Outline Sidebar -->
            <div class="outline-sidebar border-start d-flex flex-column" style="width: 220px; background-color: var(--sidebar-bg);">
              <div class="p-2 border-bottom d-flex align-items-center">
                <Settings :size="14" class="me-2 text-muted" />
                <span class="fw-bold xx-small">OUTLINE</span>
              </div>
              <div class="flex-grow-1 overflow-auto">
                <OutlineView :symbols="symbols" @select="handleSymbolSelect" />
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  transition: background-color 0.3s, border-color 0.3s;
}
.cursor-pointer {
  cursor: pointer;
}
.editor-bg {
  background-color: var(--editor-bg);
}
.xx-small {
  font-size: 0.7rem;
}
@keyframes highlight {
  0% { background-color: rgba(255, 255, 0, 0.3); }
  100% { background-color: transparent; }
}
.highlight-line {
  animation: highlight 2s ease-out;
  display: block;
  width: 100%;
}
</style>
