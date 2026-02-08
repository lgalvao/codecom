<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { BButton, BNavbar, BNavbarBrand, BFormSelect, BOffcanvas } from 'bootstrap-vue-next';
import { Sun, Moon, FolderOpen, Code, BarChart3, Sliders } from 'lucide-vue-next';
import FileTreeNode from './components/FileTreeNode.vue';
import CodeHighlighter from './components/CodeHighlighter.vue';
import OutlineView from './components/OutlineView.vue';
import CodeStatistics from './components/CodeStatistics.vue';
import DetailControlPanel from './components/DetailControlPanel.vue';
import { getOutline as getFrontendOutline } from './services/AnalysisService';

const theme = ref('dark');
const fileTree = ref(null);
const selectedFile = ref(null);
const fileContent = ref('');
const symbols = ref([]);
const isLoading = ref(false);
const complexity = ref('standard');
const showStatsPanel = ref(false);
const showDetailPanel = ref(false);
const statsComponent = ref(null);
const detailOptions = ref({
  showComments: true,
  showImports: true,
  showPrivateMembers: true,
  showMethodBodies: true,
  showParameterTypes: true,
  showParameters: true,
  abbreviateTypes: false,
  onlyPublic: false,
});

const complexityOptions = [
  { text: 'Simplified', value: 'simplified' },
  { text: 'Standard', value: 'standard' },
  { text: 'Architectural', value: 'architectural' }
];

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
    const contentRes = await axios.get(`http://localhost:8080/api/files/content?path=${encodeURIComponent(node.path)}`, { responseType: 'text' });
    fileContent.value = contentRes.data;

    const extension = node.name.split('.').pop().toLowerCase();
    if (['js', 'ts', 'tsx'].includes(extension)) {
      symbols.value = await getFrontendOutline(fileContent.value, node.path);
    } else {
      const outlineRes = await axios.get(`http://localhost:8080/api/analysis/outline?path=${encodeURIComponent(node.path)}`);
      symbols.value = outlineRes.data;
    }

    // Load statistics for the selected file
    if (statsComponent.value) {
      statsComponent.value.loadStatistics();
    }
  } catch (error) {
    fileContent.value = 'Error loading file content: ' + error.message;
  } finally {
    isLoading.value = false;
  }
};

const handleDetailChange = (options) => {
  detailOptions.value = options;
  // In a future implementation, this would filter the code display
  console.log('Detail options changed:', options);
};

const toggleStatsPanel = () => {
  showStatsPanel.value = !showStatsPanel.value;
  if (showDetailPanel.value) showDetailPanel.value = false;
};

const toggleDetailPanel = () => {
  showDetailPanel.value = !showDetailPanel.value;
  if (showStatsPanel.value) showStatsPanel.value = false;
};

const filteredSymbols = computed(() => {
  if (complexity.value === 'standard') return symbols.value;
  
  if (complexity.value === 'simplified') {
    return symbols.value.filter(s => s.category !== 'BOILERPLATE');
  }
  
  if (complexity.value === 'architectural') {
    return symbols.value.filter(s => s.category === 'ARCHITECTURE' || s.type === 'CLASS');
  }
  
  return symbols.value;
});

const hiddenLines = computed(() => {
  if (complexity.value === 'standard') return new Set();
  
  const lines = new Set();
  symbols.value.forEach(s => {
    const isSimplifiedBoilerplate = complexity.value === 'simplified' && s.category === 'BOILERPLATE';
    const isArchitecturalDetail = complexity.value === 'architectural' && s.category !== 'ARCHITECTURE' && (s.type === 'CLASS' || s.type === 'INTERFACE');
    
    if (isSimplifiedBoilerplate || isArchitecturalDetail) {
      lines.add(s.line);
    }
  });
  return lines;
});

const handleSymbolSelect = (symbol) => {
  const lineNum = symbol.line;
  const editor = document.querySelector('.shiki-container pre');
  if (editor) {
    const lines = editor.querySelectorAll('.line');
    if (lines[lineNum - 1]) {
      lines[lineNum - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
      lines[lineNum - 1].classList.add('highlight-line');
      setTimeout(() => {
        lines[lineNum - 1].classList.remove('highlight-line');
      }, 500);
    }
  }
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  theme.value = savedTheme;
  document.documentElement.dataset.bsTheme = theme.value;
  fetchTree();
});
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
        
        <BButton 
          variant="link" 
          :class="['p-1', theme === 'dark' ? 'text-white-50' : 'text-muted', { 'text-primary': showStatsPanel }]" 
          @click="toggleStatsPanel"
          title="Statistics"
        >
          <BarChart3 :size="20" />
        </BButton>
        
        <BButton 
          variant="link" 
          :class="['p-1', theme === 'dark' ? 'text-white-50' : 'text-muted', { 'text-primary': showDetailPanel }]" 
          @click="toggleDetailPanel"
          title="Detail Control"
        >
          <Sliders :size="20" />
        </BButton>
        
        <BButton variant="link" :class="theme === 'dark' ? 'text-white-50' : 'text-muted'" class="p-0" @click="toggleTheme">
          <Sun v-if="theme === 'dark'" :size="20" />
          <Moon v-else :size="20" />
        </BButton>
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
          <template v-if="!fileTree">
            <div class="text-muted small p-3 d-flex flex-column align-items-center">
              <div class="spinner-border spinner-border-sm mb-2" role="status"></div>
              <span>Connecting to backend...</span>
            </div>
          </template>
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
          <div v-if="!selectedFile" class="welcome-screen d-flex flex-column align-items-center justify-content-center w-100 p-5">
            <Code :size="64" class="text-muted mb-4 opacity-25" />
            <h2 class="display-6 fw-bold">CodeCom</h2>
            <p class="text-muted lead">Smart code comprehension with Level of Detail toggles</p>
            <div class="mt-4 p-4 border border-secondary rounded bg-dark bg-opacity-10" style="max-width: 500px">
              <p class="small text-muted mb-0 text-start">
                <Settings :size="14" class="me-2" /> Select a Java or JS/TS file to see it in action. <br>
                <Sun :size="14" class="me-2" /> Use the LoD selector above to filter boilerplate or focus on architecture.
              </p>
            </div>
          </div>
          <template v-else>
            <div class="flex-grow-1 h-100 overflow-hidden">
               <CodeHighlighter 
                 :code="fileContent" 
                 :filename="selectedFile.name" 
                 :theme="theme" 
                 :hidden-lines="hiddenLines"
               />
            </div>
            <!-- Outline Sidebar -->
            <div class="outline-sidebar border-start d-flex flex-column" style="width: 250px; background-color: var(--sidebar-bg);">
              <div class="p-2 border-bottom d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                  <Code :size="14" class="me-2 text-muted" />
                  <span class="fw-bold xx-small ls-1">OUTLINE</span>
                </div>
                <span class="badge bg-dark text-muted p-1 xx-small">{{ filteredSymbols.length }} symbols</span>
              </div>
              <div class="flex-grow-1 overflow-auto">
                <OutlineView :symbols="filteredSymbols" @select="handleSymbolSelect" />
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Statistics Panel -->
    <BOffcanvas 
      v-model="showStatsPanel" 
      placement="end"
      :title="'Statistics - ' + (selectedFile?.name || 'No file selected')"
    >
      <CodeStatistics 
        v-if="selectedFile"
        ref="statsComponent"
        :path="selectedFile.path"
        :is-directory="false"
      />
      <div v-else class="text-muted text-center p-3">
        Select a file to view statistics
      </div>
    </BOffcanvas>

    <!-- Detail Control Panel -->
    <BOffcanvas 
      v-model="showDetailPanel" 
      placement="end"
      title="Detail Control"
    >
      <DetailControlPanel @change="handleDetailChange" />
    </BOffcanvas>
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
.ls-1 {
  letter-spacing: 1px;
}
@keyframes highlight {
  0% { background-color: rgba(255, 255, 0, 0.3); }
  100% { background-color: transparent; }
}
.highlight-line {
  animation: highlight 0.5s ease-out;
  display: block;
  width: 100%;
  position: relative;
  z-index: 10;
}
</style>
