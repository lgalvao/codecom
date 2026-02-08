<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { BButton, BNavbar, BNavbarBrand, BFormSelect, BOffcanvas } from 'bootstrap-vue-next';
import { Sun, Moon, FolderOpen, Code, BarChart3, Sliders, Search as SearchIcon, Settings, Focus, Download, MousePointer2 } from 'lucide-vue-next';
import FileTreeNode from './components/FileTreeNode.vue';
import CodeHighlighter from './components/CodeHighlighter.vue';
import OutlineView from './components/OutlineView.vue';
import CodeStatistics from './components/CodeStatistics.vue';
import DetailControlPanel from './components/DetailControlPanel.vue';
import SymbolSearch from './components/SymbolSearch.vue';
import TabManager from './components/TabManager.vue';
import HoverTooltip from './components/HoverTooltip.vue';
import ScopeIsolation from './components/ScopeIsolation.vue';
import PackageNavigation from './components/PackageNavigation.vue';
import ExportDialog from './components/ExportDialog.vue';
import CallerList from './components/CallerList.vue';
import { getOutline as getFrontendOutline } from './services/AnalysisService';
import { applyFilters } from './services/CodeFilterService';

const theme = ref('dark');
const fileTree = ref(null);
const selectedFile = ref(null);
const fileContent = ref('');
const symbols = ref([]);
const isLoading = ref(false);
const complexity = ref('standard');
const showStatsPanel = ref(false);
const showDetailPanel = ref(false);
const showSearchPanel = ref(false);
const showScopePanel = ref(false);
const showExportPanel = ref(false);
const showCallerPanel = ref(false);
const statsComponent = ref(null);
const projectRootPath = ref('..');
const tabManager = ref(null);
const openTabs = ref([]);
const hoverTooltipEnabled = ref(true);
const isolatedSymbol = ref(null);
const clickNavigationMode = ref(false);
const selectedMethodForCallers = ref(null);
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

const loadFileContent = async (node) => {
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

const handleFileSelect = async (node) => {
  // Save current tab state before switching
  if (selectedFile.value && tabManager.value) {
    const currentTabId = tabManager.value.tabs.find(t => t.path === selectedFile.value.path)?.id;
    if (currentTabId) {
      const scrollContainer = document.querySelector('.shiki-container pre');
      const scrollPosition = scrollContainer?.scrollTop || 0;
      tabManager.value.updateTabState(currentTabId, {
        scrollPosition,
        detailOptions: { ...detailOptions.value },
        isolatedSymbol: isolatedSymbol.value
      });
    }
  }
  
  selectedFile.value = node;
  // Add to tab manager
  if (tabManager.value) {
    tabManager.value.addOrActivateTab(node);
  }
  await loadFileContent(node);
};

const handleTabSelect = async (tab) => {
  // Save current tab state before switching
  if (selectedFile.value && tabManager.value) {
    const currentTabId = tabManager.value.tabs.find(t => t.path === selectedFile.value.path)?.id;
    if (currentTabId) {
      const scrollContainer = document.querySelector('.shiki-container pre');
      const scrollPosition = scrollContainer?.scrollTop || 0;
      tabManager.value.updateTabState(currentTabId, {
        scrollPosition,
        detailOptions: { ...detailOptions.value },
        isolatedSymbol: isolatedSymbol.value
      });
    }
  }
  
  // Switch to selected tab
  selectedFile.value = { name: tab.name, path: tab.path };
  await loadFileContent(selectedFile.value);
  
  // Restore tab state
  if (tab.detailOptions) {
    detailOptions.value = { ...tab.detailOptions };
  }
  if (tab.isolatedSymbol !== undefined) {
    isolatedSymbol.value = tab.isolatedSymbol;
  }
  
  // Restore scroll position after content is loaded and rendered
  setTimeout(() => {
    if (tab.scrollPosition) {
      const scrollContainer = document.querySelector('.shiki-container pre');
      if (scrollContainer) {
        scrollContainer.scrollTop = tab.scrollPosition;
      }
    }
  }, 100);
};

const handleTabClose = (tabId) => {
  // If all tabs are closed, clear the selected file
  if (tabManager.value?.tabs.length === 0) {
    selectedFile.value = null;
    fileContent.value = '';
    symbols.value = [];
  }
};

const handleDetailChange = (options) => {
  detailOptions.value = options;
};

const toggleStatsPanel = () => {
  showStatsPanel.value = !showStatsPanel.value;
  if (showDetailPanel.value) showDetailPanel.value = false;
  if (showSearchPanel.value) showSearchPanel.value = false;
};

const toggleDetailPanel = () => {
  showDetailPanel.value = !showDetailPanel.value;
  if (showStatsPanel.value) showStatsPanel.value = false;
  if (showSearchPanel.value) showSearchPanel.value = false;
  if (showScopePanel.value) showScopePanel.value = false;
};

const toggleSearchPanel = () => {
  showSearchPanel.value = !showSearchPanel.value;
  if (showStatsPanel.value) showStatsPanel.value = false;
  if (showDetailPanel.value) showDetailPanel.value = false;
  if (showScopePanel.value) showScopePanel.value = false;
};

const toggleScopePanel = () => {
  showScopePanel.value = !showScopePanel.value;
  if (showStatsPanel.value) showStatsPanel.value = false;
  if (showDetailPanel.value) showDetailPanel.value = false;
  if (showSearchPanel.value) showSearchPanel.value = false;
  if (showExportPanel.value) showExportPanel.value = false;
};

const toggleExportPanel = () => {
  showExportPanel.value = !showExportPanel.value;
  if (showStatsPanel.value) showStatsPanel.value = false;
  if (showDetailPanel.value) showDetailPanel.value = false;
  if (showSearchPanel.value) showSearchPanel.value = false;
  if (showScopePanel.value) showScopePanel.value = false;
};

const handleSearchSelect = async (result) => {
  // Close search panel
  showSearchPanel.value = false;
  
  // Open the file
  const node = { path: result.filePath, name: result.fileName };
  await handleFileSelect(node);
  
  // Scroll to the line
  setTimeout(() => {
    const lineNum = result.line;
    const editor = document.querySelector('.shiki-container pre');
    if (editor) {
      const lines = editor.querySelectorAll('.line');
      if (lines[lineNum - 1]) {
        lines[lineNum - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
        lines[lineNum - 1].classList.add('highlight-line');
        setTimeout(() => {
          lines[lineNum - 1].classList.remove('highlight-line');
        }, 1000);
      }
    }
  }, 500);
};

const handleHover = (element, position) => {
  // In future implementation, query backend for symbol information
};

const handleScopeIsolate = (symbol) => {
  isolatedSymbol.value = symbol;
};

const handleScopeClear = () => {
  isolatedSymbol.value = null;
};

const handlePackageNavigate = async (file) => {
  await handleFileSelect(file);
};

const getLanguageFromFilename = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const map = {
    'java': 'java',
    'js': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'html': 'html',
    'css': 'css',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'sql': 'sql',
  };
  return map[ext] || 'text';
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
  // First, apply complexity-based hiding
  const complexityHiddenLines = new Set();
  if (complexity.value !== 'standard') {
    symbols.value.forEach(s => {
      const isSimplifiedBoilerplate = complexity.value === 'simplified' && s.category === 'BOILERPLATE';
      const isArchitecturalDetail = complexity.value === 'architectural' && s.category !== 'ARCHITECTURE' && (s.type === 'CLASS' || s.type === 'INTERFACE');
      
      if (isSimplifiedBoilerplate || isArchitecturalDetail) {
        complexityHiddenLines.add(s.line);
      }
    });
  }
  
  // Apply scope isolation dimming
  if (isolatedSymbol.value) {
    const startLine = isolatedSymbol.value.line;
    const endLine = isolatedSymbol.value.endLine || startLine + 20; // Estimate end if not provided
    
    // Dim all lines except the isolated range
    for (let i = 1; i <= fileContent.value.split('\n').length; i++) {
      if (i < startLine || i > endLine) {
        complexityHiddenLines.add(i);
      }
    }
  }
  
  // Then, apply detail control filtering
  if (selectedFile.value && fileContent.value) {
    const extension = selectedFile.value.name.split('.').pop().toLowerCase();
    const language = extension === 'js' ? 'javascript' : 
                      extension === 'ts' || extension === 'tsx' ? 'typescript' : 
                      'java';
    
    const filterResult = applyFilters(fileContent.value, detailOptions.value, language);
    
    // Combine both sets of hidden lines (but don't hide if in isolated range)
    if (!isolatedSymbol.value) {
      filterResult.hiddenLines.forEach(line => complexityHiddenLines.add(line));
    }
  }
  
  return complexityHiddenLines;
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

const showCallersForSymbol = (symbol) => {
  if (symbol.type === 'METHOD') {
    selectedMethodForCallers.value = {
      methodName: symbol.name,
      className: '', // Could be extracted from the file context
      rootPath: projectRootPath.value
    };
    showCallerPanel.value = true;
  }
};

const handleCallerNavigate = async (location) => {
  // Navigate to the caller location
  const node = { name: location.filePath.split('/').pop(), path: location.filePath };
  await handleFileSelect(node);
  
  // Scroll to the line
  setTimeout(() => {
    const editor = document.querySelector('.shiki-container pre');
    if (editor) {
      const lines = editor.querySelectorAll('.line');
      if (lines[location.line - 1]) {
        lines[location.line - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
        lines[location.line - 1].classList.add('highlight-line');
        setTimeout(() => {
          lines[location.line - 1].classList.remove('highlight-line');
        }, 500);
      }
    }
  }, 300);
};

const toggleClickNavigationMode = () => {
  clickNavigationMode.value = !clickNavigationMode.value;
  localStorage.setItem('clickNavigationMode', clickNavigationMode.value.toString());
};

/**
 * Handle symbol navigation from CodeHighlighter
 * Implements FR.24 (Control-Click) and FR.25 (Click Navigation Mode)
 */
const handleNavigateToSymbol = async (symbolName) => {
  try {
    // Import the navigation service
    const { findSymbolDefinition } = await import('./services/NavigationService');
    
    // Find the symbol definition
    const definition = await findSymbolDefinition(symbolName, projectRootPath.value);
    
    if (definition && definition.filePath) {
      // Navigate to the file
      const fileName = definition.filePath.split('/').pop();
      const node = { name: fileName, path: definition.filePath };
      await handleFileSelect(node);
      
      // Scroll to the line after a short delay
      setTimeout(() => {
        const editor = document.querySelector('.shiki-container pre');
        if (editor) {
          const lines = editor.querySelectorAll('.line');
          if (lines[definition.line - 1]) {
            lines[definition.line - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
            lines[definition.line - 1].classList.add('highlight-line');
            setTimeout(() => {
              lines[definition.line - 1].classList.remove('highlight-line');
            }, 1000);
          }
        }
      }, 300);
    } else {
      console.warn('Symbol definition not found:', symbolName);
    }
  } catch (error) {
    console.error('Error navigating to symbol:', error);
  }
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  theme.value = savedTheme;
  document.documentElement.dataset.bsTheme = theme.value;
  
  // Load click navigation mode preference
  const savedClickNav = localStorage.getItem('clickNavigationMode');
  if (savedClickNav !== null) {
    clickNavigationMode.value = savedClickNav === 'true';
  }
  
  fetchTree();
  
  // Add keyboard shortcut for symbol search (Ctrl+Shift+F or Cmd+Shift+F)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
      e.preventDefault();
      toggleSearchPanel();
    }
  });
  
  // Auto-save scroll position while scrolling
  let scrollTimeout;
  document.addEventListener('scroll', (e) => {
    if (e.target.classList?.contains('shiki-container') || 
        e.target.tagName === 'PRE') {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (selectedFile.value && tabManager.value) {
          const currentTabId = tabManager.value.tabs.find(t => t.path === selectedFile.value.path)?.id;
          if (currentTabId) {
            const scrollContainer = document.querySelector('.shiki-container pre');
            const scrollPosition = scrollContainer?.scrollTop || 0;
            tabManager.value.updateTabState(currentTabId, { scrollPosition });
          }
        }
      }, 200);
    }
  }, true);
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
          :class="['p-1', theme === 'dark' ? 'text-white-50' : 'text-muted', { 'text-primary': showSearchPanel }]" 
          @click="toggleSearchPanel"
          title="Symbol Search (Ctrl+Shift+F)"
        >
          <SearchIcon :size="20" />
        </BButton>
        
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
        
        <BButton 
          variant="link" 
          :class="['p-1', theme === 'dark' ? 'text-white-50' : 'text-muted', { 'text-primary': showScopePanel }]" 
          @click="toggleScopePanel"
          title="Scope Isolation"
        >
          <Focus :size="20" />
        </BButton>
        
        <BButton 
          variant="link" 
          :class="['p-1', theme === 'dark' ? 'text-white-50' : 'text-muted', { 'text-primary': showExportPanel }]" 
          @click="toggleExportPanel"
          title="Export Code"
          :disabled="!selectedFile"
        >
          <Download :size="20" />
        </BButton>
        
        <BButton 
          variant="link" 
          :class="['p-1', theme === 'dark' ? 'text-white-50' : 'text-muted', { 'text-primary': clickNavigationMode }]" 
          @click="toggleClickNavigationMode"
          title="Click Navigation Mode (when enabled, click on symbols to navigate)"
        >
          <MousePointer2 :size="20" />
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
        <div class="d-flex align-items-center border-bottom" style="height: 35px; background-color: var(--sidebar-bg);">
          <TabManager 
            ref="tabManager"
            :current-file="selectedFile"
            @select="handleTabSelect"
            @close="handleTabClose"
            style="flex: 1;"
          />
          <div v-if="selectedFile" class="px-2 border-start">
            <PackageNavigation 
              :current-file="selectedFile"
              @navigate="handlePackageNavigate"
            />
          </div>
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
                 :click-navigation-mode="clickNavigationMode"
                 @navigate-to-symbol="handleNavigateToSymbol"
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
                <OutlineView 
                  :symbols="filteredSymbols" 
                  @select="handleSymbolSelect"
                  @show-callers="showCallersForSymbol"
                />
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

    <!-- Symbol Search Panel -->
    <BOffcanvas 
      v-model="showSearchPanel" 
      placement="end"
      title="Symbol Search"
      :no-header="true"
    >
      <SymbolSearch 
        :root-path="projectRootPath"
        :visible="showSearchPanel"
        @select="handleSearchSelect"
        @close="showSearchPanel = false"
      />
    </BOffcanvas>

    <!-- Scope Isolation Panel -->
    <BOffcanvas 
      v-model="showScopePanel" 
      placement="end"
      title="Scope Isolation"
    >
      <ScopeIsolation 
        :symbols="symbols"
        :current-file="selectedFile?.name"
        @isolate="handleScopeIsolate"
        @clear="handleScopeClear"
      />
    </BOffcanvas>

    <!-- Export Panel -->
    <BOffcanvas 
      v-model="showExportPanel" 
      placement="end"
      title="Export Code"
    >
      <ExportDialog 
        v-if="selectedFile && fileContent"
        :code="fileContent"
        :filename="selectedFile.name"
        :language="getLanguageFromFilename(selectedFile.name)"
        @close="showExportPanel = false"
      />
      <div v-else class="text-muted text-center p-3">
        Select a file to export
      </div>
    </BOffcanvas>

    <!-- Caller List Panel -->
    <BOffcanvas 
      v-model="showCallerPanel" 
      placement="end"
      title="Call Graph Analysis"
    >
      <CallerList
        v-if="selectedMethodForCallers"
        :root-path="selectedMethodForCallers.rootPath"
        :method-name="selectedMethodForCallers.methodName"
        :class-name="selectedMethodForCallers.className"
        @close="showCallerPanel = false"
        @navigate="handleCallerNavigate"
      />
    </BOffcanvas>

    <!-- Hover Tooltip -->
    <HoverTooltip 
      :enabled="hoverTooltipEnabled"
      :current-file="selectedFile"
      @hover="handleHover"
    />
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
