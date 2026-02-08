<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { X } from 'lucide-vue-next';

interface TabData {
  id: string;
  name: string;
  path: string;
  scrollPosition?: number;
  detailOptions?: any;
}

const props = defineProps<{
  currentFile?: { name: string; path: string } | null;
}>();

const emit = defineEmits<{
  select: [tab: TabData];
  close: [tabId: string];
}>();

const tabs = ref<TabData[]>([]);
const activeTabId = ref<string | null>(null);
const draggedTabId = ref<string | null>(null);

const STORAGE_KEY = 'codecom-tabs';
const MAX_TABS = 20;

// Load tabs from localStorage
const loadTabs = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      tabs.value = data.tabs || [];
      activeTabId.value = data.activeTabId || null;
    }
  } catch (e) {
    console.error('Failed to load tabs:', e);
  }
};

// Save tabs to localStorage
const saveTabs = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      tabs: tabs.value,
      activeTabId: activeTabId.value,
    }));
  } catch (e) {
    console.error('Failed to save tabs:', e);
  }
};

// Add or activate a tab
const addOrActivateTab = (file: { name: string; path: string }) => {
  if (!file) return;

  // Check if tab already exists
  const existing = tabs.value.find(t => t.path === file.path);
  if (existing) {
    activeTabId.value = existing.id;
    emit('select', existing);
    return;
  }

  // Check max tabs limit
  if (tabs.value.length >= MAX_TABS) {
    // Remove the least recently used tab (first non-active tab)
    const lruIndex = tabs.value.findIndex(t => t.id !== activeTabId.value);
    if (lruIndex !== -1) {
      tabs.value.splice(lruIndex, 1);
    }
  }

  // Create new tab
  const newTab: TabData = {
    id: `tab-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    name: file.name,
    path: file.path,
  };

  tabs.value.push(newTab);
  activeTabId.value = newTab.id;
  emit('select', newTab);
};

// Close a tab
const closeTab = (tabId: string, event?: Event) => {
  event?.stopPropagation();
  
  const index = tabs.value.findIndex(t => t.id === tabId);
  if (index === -1) return;

  const wasActive = activeTabId.value === tabId;
  tabs.value.splice(index, 1);

  // If closed tab was active, activate another tab
  if (wasActive && tabs.value.length > 0) {
    // Activate the tab before or after the closed one
    const newActiveTab = tabs.value[Math.max(0, index - 1)];
    activeTabId.value = newActiveTab.id;
    emit('select', newActiveTab);
  } else if (tabs.value.length === 0) {
    activeTabId.value = null;
    emit('close', tabId);
  }
};

// Select a tab
const selectTab = (tab: TabData) => {
  activeTabId.value = tab.id;
  emit('select', tab);
};

// Drag and drop for tab reordering
const handleDragStart = (tabId: string, event: DragEvent) => {
  draggedTabId.value = tabId;
  event.dataTransfer!.effectAllowed = 'move';
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.dataTransfer!.dropEffect = 'move';
};

const handleDrop = (targetTabId: string, event: DragEvent) => {
  event.preventDefault();
  
  if (!draggedTabId.value || draggedTabId.value === targetTabId) {
    return;
  }

  const draggedIndex = tabs.value.findIndex(t => t.id === draggedTabId.value);
  const targetIndex = tabs.value.findIndex(t => t.id === targetTabId);

  if (draggedIndex !== -1 && targetIndex !== -1) {
    const [draggedTab] = tabs.value.splice(draggedIndex, 1);
    tabs.value.splice(targetIndex, 0, draggedTab);
  }

  draggedTabId.value = null;
};

const handleDragEnd = () => {
  draggedTabId.value = null;
};

// Update tab state (scroll position, etc.)
const updateTabState = (tabId: string, state: Partial<TabData>) => {
  const tab = tabs.value.find(t => t.id === tabId);
  if (tab) {
    Object.assign(tab, state);
  }
};

// Watch for changes and save
watch([tabs, activeTabId], () => {
  saveTabs();
}, { deep: true });

// Watch for current file changes from parent
watch(() => props.currentFile, (newFile) => {
  if (newFile) {
    addOrActivateTab(newFile);
  }
});

// Load tabs on mount
onMounted(() => {
  loadTabs();
});

// Expose methods for parent component
defineExpose({
  addOrActivateTab,
  updateTabState,
  closeTab,
  tabs,
  activeTabId,
});
</script>

<template>
  <div class="tabs-area border-bottom px-2 py-1 d-flex align-items-center gap-1" 
       style="height: 35px; background-color: var(--sidebar-bg); overflow-x: auto; overflow-y: hidden;">
    <template v-if="tabs.length === 0">
      <span class="text-muted small">No files open</span>
    </template>
    <template v-else>
      <div
        v-for="tab in tabs"
        :key="tab.id"
        :class="[
          'tab-item',
          'd-flex',
          'align-items-center',
          'gap-1',
          'px-2',
          'py-1',
          'rounded',
          'position-relative',
          { 'active': tab.id === activeTabId }
        ]"
        :draggable="true"
        @click="selectTab(tab)"
        @dragstart="handleDragStart(tab.id, $event)"
        @dragover="handleDragOver($event)"
        @drop="handleDrop(tab.id, $event)"
        @dragend="handleDragEnd"
      >
        <span class="tab-name small text-truncate" style="max-width: 150px;">
          {{ tab.name }}
        </span>
        <button
          class="tab-close-btn btn-close btn-close-sm"
          :aria-label="`Close ${tab.name}`"
          @click="closeTab(tab.id, $event)"
        >
          <X :size="12" />
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.tabs-area {
  min-height: 35px;
  white-space: nowrap;
}

.tabs-area::-webkit-scrollbar {
  height: 4px;
}

.tabs-area::-webkit-scrollbar-track {
  background: transparent;
}

.tabs-area::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.3);
  border-radius: 2px;
}

.tab-item {
  cursor: pointer;
  user-select: none;
  background-color: rgba(128, 128, 128, 0.1);
  border: 1px solid transparent;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.tab-item:hover {
  background-color: rgba(128, 128, 128, 0.2);
}

.tab-item.active {
  background-color: var(--bs-primary);
  color: white;
  border-color: var(--bs-primary);
}

.tab-close-btn {
  opacity: 0.6;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.tab-close-btn:hover {
  opacity: 1;
}

.tab-item.active .tab-close-btn {
  opacity: 0.8;
  filter: brightness(1.2);
}

.tab-item.active .tab-close-btn:hover {
  opacity: 1;
}

.tab-name {
  pointer-events: none;
}
</style>
