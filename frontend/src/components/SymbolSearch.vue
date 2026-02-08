<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { BFormInput, BListGroup, BListGroupItem, BBadge } from 'bootstrap-vue-next';
import { Search, FileCode, Circle } from 'lucide-vue-next';
import { searchSymbols, type SymbolSearchResult } from '../services/AnalysisService';

const props = defineProps<{
  rootPath: string;
  visible: boolean;
}>();

const emit = defineEmits<{
  select: [result: SymbolSearchResult];
  close: [];
}>();

const searchQuery = ref('');
const searchResults = ref<SymbolSearchResult[]>([]);
const isSearching = ref(false);
const selectedIndex = ref(0);

// Debounce search
let searchTimeout: number | null = null;

const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  isSearching.value = true;
  try {
    searchResults.value = await searchSymbols(props.rootPath, searchQuery.value);
    selectedIndex.value = 0;
  } catch (error) {
    console.error('Search error:', error);
  } finally {
    isSearching.value = false;
  }
};

watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = window.setTimeout(performSearch, 300);
});

watch(() => props.visible, (visible) => {
  if (visible) {
    searchQuery.value = '';
    searchResults.value = [];
    selectedIndex.value = 0;
    // Focus the input when panel becomes visible
    setTimeout(() => {
      const input = document.querySelector('.symbol-search-input') as HTMLInputElement;
      if (input) input.focus();
    }, 100);
  }
});

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    selectedIndex.value = Math.min(selectedIndex.value + 1, searchResults.value.length - 1);
    scrollToSelected();
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
    scrollToSelected();
  } else if (event.key === 'Enter' && searchResults.value[selectedIndex.value]) {
    event.preventDefault();
    selectResult(searchResults.value[selectedIndex.value]);
  } else if (event.key === 'Escape') {
    event.preventDefault();
    emit('close');
  }
};

const scrollToSelected = () => {
  setTimeout(() => {
    const selected = document.querySelector('.symbol-result-selected');
    if (selected) {
      selected.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 50);
};

const selectResult = (result: SymbolSearchResult) => {
  emit('select', result);
  emit('close');
};

const getTypeIcon = (type: string) => {
  return Circle;
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'CLASS': return 'primary';
    case 'METHOD': return 'success';
    case 'FUNCTION': return 'info';
    case 'INTERFACE': return 'warning';
    default: return 'secondary';
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'CORE': return 'primary';
    case 'BOILERPLATE': return 'secondary';
    case 'ARCHITECTURE': return 'warning';
    default: return 'dark';
  }
};

const truncatePath = (path: string) => {
  const parts = path.split('/');
  if (parts.length > 3) {
    return '.../' + parts.slice(-3).join('/');
  }
  return path;
};
</script>

<template>
  <div class="symbol-search">
    <div class="search-header p-3 border-bottom">
      <div class="d-flex align-items-center mb-2">
        <Search :size="18" class="me-2 text-muted" />
        <h6 class="mb-0 fw-bold">Symbol Search</h6>
      </div>
      <BFormInput
        v-model="searchQuery"
        class="symbol-search-input"
        placeholder="Search for classes, methods, functions..."
        @keydown="handleKeyDown"
      />
    </div>

    <div class="search-results flex-grow-1 overflow-auto">
      <div v-if="isSearching" class="text-center p-4 text-muted">
        <div class="spinner-border spinner-border-sm mb-2" role="status"></div>
        <div class="small">Searching...</div>
      </div>

      <div v-else-if="!searchQuery.trim()" class="text-center p-4 text-muted">
        <FileCode :size="48" class="mb-3 opacity-25" />
        <p class="small mb-0">Type to search for symbols</p>
      </div>

      <div v-else-if="searchResults.length === 0" class="text-center p-4 text-muted">
        <p class="small mb-0">No results found for "{{ searchQuery }}"</p>
      </div>

      <BListGroup v-else flush>
        <BListGroupItem
          v-for="(result, index) in searchResults"
          :key="`${result.filePath}-${result.line}`"
          :class="{ 'symbol-result-selected': index === selectedIndex }"
          class="symbol-result border-0 cursor-pointer"
          @click="selectResult(result)"
          @mouseenter="selectedIndex = index"
        >
          <div class="d-flex align-items-start">
            <component
              :is="getTypeIcon(result.type)"
              :size="14"
              class="mt-1 me-2 flex-shrink-0"
              :class="`text-${getTypeColor(result.type)}`"
            />
            <div class="flex-grow-1 min-w-0">
              <div class="d-flex align-items-center gap-2 mb-1">
                <span class="fw-semibold text-truncate">{{ result.name }}</span>
                <BBadge :variant="getTypeColor(result.type)" class="small">
                  {{ result.type }}
                </BBadge>
              </div>
              <div class="small text-muted d-flex align-items-center gap-2">
                <span class="text-truncate">{{ result.fileName }}</span>
                <span class="text-muted">:</span>
                <span>Line {{ result.line }}</span>
              </div>
              <div class="xx-small text-muted text-truncate" :title="result.filePath">
                {{ truncatePath(result.filePath) }}
              </div>
            </div>
          </div>
        </BListGroupItem>
      </BListGroup>
    </div>

    <div class="search-footer p-2 border-top bg-light small text-muted">
      <div class="d-flex justify-content-between">
        <span>
          <kbd>↑</kbd> <kbd>↓</kbd> Navigate
        </span>
        <span>
          <kbd>Enter</kbd> Select
        </span>
        <span>
          <kbd>Esc</kbd> Close
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.symbol-search {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-results {
  max-height: calc(100vh - 200px);
}

.symbol-result {
  transition: background-color 0.15s ease;
  padding: 0.75rem;
}

.symbol-result:hover,
.symbol-result-selected {
  background-color: var(--bs-primary-bg-subtle);
}

.cursor-pointer {
  cursor: pointer;
}

.min-w-0 {
  min-width: 0;
}

.xx-small {
  font-size: 0.7rem;
}

kbd {
  background-color: var(--bs-secondary-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 3px;
  padding: 0.1rem 0.3rem;
  font-size: 0.75rem;
  font-family: monospace;
}
</style>
