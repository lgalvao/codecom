<script setup lang="ts">
import { ref, computed } from 'vue';
import { ChevronLeft, ChevronRight, List } from 'lucide-vue-next';
import { navigateToNextFile, navigateToPreviousFile, getPackageFiles, type FileInfo } from '../services/NavigationService';

const props = defineProps<{
  currentFile?: { name: string; path: string } | null;
}>();

const emit = defineEmits<{
  navigate: [file: FileInfo];
}>();

const packageFiles = ref<FileInfo[]>([]);
const isLoading = ref(false);
const showFileList = ref(false);

const currentIndex = computed(() => {
  if (!props.currentFile) return -1;
  return packageFiles.value.findIndex(f => f.path === props.currentFile.path);
});

const hasNext = computed(() => {
  return currentIndex.value >= 0 && currentIndex.value < packageFiles.value.length - 1;
});

const hasPrevious = computed(() => {
  return currentIndex.value > 0;
});

const loadPackageFiles = async () => {
  if (!props.currentFile) return;
  
  isLoading.value = true;
  try {
    packageFiles.value = await getPackageFiles(props.currentFile.path);
  } catch (error) {
    console.error('Error loading package files:', error);
  } finally {
    isLoading.value = false;
  }
};

const navigateNext = async () => {
  if (!props.currentFile || !hasNext.value) return;
  
  const nextFile = await navigateToNextFile(props.currentFile.path);
  if (nextFile) {
    emit('navigate', nextFile);
  }
};

const navigatePrevious = async () => {
  if (!props.currentFile || !hasPrevious.value) return;
  
  const prevFile = await navigateToPreviousFile(props.currentFile.path);
  if (prevFile) {
    emit('navigate', prevFile);
  }
};

const selectFile = (file: FileInfo) => {
  emit('navigate', file);
  showFileList.value = false;
};

const toggleFileList = () => {
  if (!showFileList.value) {
    loadPackageFiles();
  }
  showFileList.value = !showFileList.value;
};

// Load package files when current file changes
const watchCurrentFile = () => {
  if (props.currentFile) {
    loadPackageFiles();
  }
};

// Watch for file changes
watchCurrentFile();
</script>

<template>
  <div class="package-navigation">
    <div class="nav-controls d-flex align-items-center gap-1">
      <button
        class="btn btn-sm btn-outline-secondary"
        :disabled="!hasPrevious || isLoading"
        @click="navigatePrevious"
        title="Previous file in package"
      >
        <ChevronLeft :size="16" />
      </button>
      
      <div class="package-info position-relative">
        <button
          class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
          @click="toggleFileList"
          :disabled="isLoading"
          title="Show files in package"
        >
          <List :size="16" />
          <span v-if="currentIndex >= 0" class="small">
            {{ currentIndex + 1 }}/{{ packageFiles.length }}
          </span>
        </button>
        
        <!-- File list dropdown -->
        <div v-if="showFileList" class="file-list-dropdown">
          <div class="dropdown-header small fw-semibold">
            Files in Package
          </div>
          <div class="file-list">
            <button
              v-for="(file, index) in packageFiles"
              :key="file.path"
              class="file-item"
              :class="{ active: index === currentIndex }"
              @click="selectFile(file)"
            >
              <span class="file-name">{{ file.name }}</span>
            </button>
          </div>
        </div>
      </div>
      
      <button
        class="btn btn-sm btn-outline-secondary"
        :disabled="!hasNext || isLoading"
        @click="navigateNext"
        title="Next file in package"
      >
        <ChevronRight :size="16" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.package-navigation {
  display: flex;
  align-items: center;
}

.nav-controls {
  flex-shrink: 0;
}

.package-info {
  position: relative;
}

.file-list-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 250px;
  max-height: 400px;
  overflow: hidden;
  z-index: 1000;
}

.dropdown-header {
  padding: 8px 12px;
  border-bottom: 1px solid var(--bs-border-color);
  background: rgba(128, 128, 128, 0.05);
}

.file-list {
  max-height: 350px;
  overflow-y: auto;
}

.file-item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease;
  font-size: 0.875rem;
}

.file-item:hover {
  background: rgba(128, 128, 128, 0.1);
}

.file-item.active {
  background: var(--bs-primary);
  color: white;
}

.file-name {
  font-family: 'Fira Code', monospace;
  font-size: 0.85rem;
}
</style>
