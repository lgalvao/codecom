<script setup lang="ts">
import { ref, computed } from 'vue';
import { ChevronRight, ChevronDown } from 'lucide-vue-next';

export interface BreadcrumbItem {
  name: string;
  type: 'package' | 'file' | 'class' | 'method';
  path?: string;
  line?: number;
  siblings?: Array<{ name: string; line?: number; }>;
}

const props = defineProps<{
  items: BreadcrumbItem[];
}>();

const emit = defineEmits<{
  navigate: [item: BreadcrumbItem, sibling?: { name: string; line?: number }];
}>();

const activeDropdown = ref<number | null>(null);

const toggleDropdown = (index: number) => {
  activeDropdown.value = activeDropdown.value === index ? null : index;
};

const closeDropdown = () => {
  activeDropdown.value = null;
};

const handleNavigate = (item: BreadcrumbItem, sibling?: { name: string; line?: number }) => {
  closeDropdown();
  emit('navigate', item, sibling);
};

const hasSiblings = (item: BreadcrumbItem) => {
  return item.siblings && item.siblings.length > 0;
};

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.breadcrumb-dropdown')) {
    closeDropdown();
  }
};

// Add click outside listener
import { onMounted, onUnmounted } from 'vue';

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <nav class="breadcrumb-nav" aria-label="Breadcrumb">
    <ol class="breadcrumb mb-0">
      <li 
        v-for="(item, index) in items" 
        :key="index" 
        class="breadcrumb-item"
        :class="{ 'has-dropdown': hasSiblings(item) }"
      >
        <div class="breadcrumb-dropdown">
          <!-- Main breadcrumb item -->
          <button
            v-if="hasSiblings(item)"
            class="breadcrumb-button"
            :class="{ active: activeDropdown === index }"
            @click.stop="toggleDropdown(index)"
            :title="`Show siblings in ${item.type}`"
          >
            <span class="breadcrumb-text">{{ item.name }}</span>
            <ChevronDown v-if="activeDropdown === index" :size="14" class="ms-1" />
            <ChevronRight v-else :size="14" class="ms-1" />
          </button>
          
          <!-- Non-interactive item (no siblings) -->
          <span v-else class="breadcrumb-text" @click="handleNavigate(item)">
            {{ item.name }}
          </span>

          <!-- Dropdown menu for siblings -->
          <div 
            v-if="hasSiblings(item) && activeDropdown === index" 
            class="breadcrumb-menu"
          >
            <div class="menu-header">
              {{ item.type === 'class' ? 'Classes' : item.type === 'method' ? 'Methods' : 'Siblings' }}
              in {{ item.type === 'file' ? 'file' : item.type === 'package' ? 'package' : 'scope' }}
            </div>
            <button
              v-for="(sibling, sibIndex) in item.siblings"
              :key="sibIndex"
              class="menu-item"
              :class="{ current: sibling.name === item.name }"
              @click="handleNavigate(item, sibling)"
            >
              <span class="sibling-name">{{ sibling.name }}</span>
              <span v-if="sibling.line" class="sibling-line">:{{ sibling.line }}</span>
            </button>
          </div>
        </div>

        <!-- Separator -->
        <ChevronRight 
          v-if="index < items.length - 1" 
          :size="14" 
          class="breadcrumb-separator"
        />
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumb-nav {
  padding: 0.75rem 1rem;
  background: var(--bs-light);
  border-bottom: 1px solid var(--bs-border-color);
  font-size: 0.875rem;
}

.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  padding: 0;
  margin: 0;
  list-style: none;
  align-items: center;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  position: relative;
}

.breadcrumb-dropdown {
  position: relative;
}

.breadcrumb-button {
  background: none;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: var(--bs-primary);
  transition: all 0.2s;
  font-size: 0.875rem;
}

.breadcrumb-button:hover {
  background: rgba(var(--bs-primary-rgb), 0.1);
}

.breadcrumb-button.active {
  background: rgba(var(--bs-primary-rgb), 0.15);
}

.breadcrumb-text {
  font-weight: 500;
  color: var(--bs-body-color);
  cursor: pointer;
}

.breadcrumb-text:hover {
  color: var(--bs-primary);
  text-decoration: underline;
}

.breadcrumb-separator {
  margin: 0 0.5rem;
  color: var(--bs-secondary);
  opacity: 0.5;
}

.breadcrumb-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  min-width: 200px;
  max-width: 400px;
  max-height: 400px;
  overflow-y: auto;
  margin-top: 0.25rem;
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.menu-header {
  padding: 0.5rem 0.75rem;
  background: var(--bs-light);
  border-bottom: 1px solid var(--bs-border-color);
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--bs-secondary);
}

.menu-item {
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  transition: background 0.2s;
  border-bottom: 1px solid transparent;
}

.menu-item:hover {
  background: var(--bs-light);
}

.menu-item.current {
  background: rgba(var(--bs-primary-rgb), 0.1);
  font-weight: 600;
  color: var(--bs-primary);
}

.sibling-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sibling-line {
  margin-left: 0.5rem;
  color: var(--bs-secondary);
  font-size: 0.75rem;
  font-family: monospace;
}

/* Dark mode support */
[data-bs-theme="dark"] .breadcrumb-nav {
  background: var(--bs-dark);
}

[data-bs-theme="dark"] .breadcrumb-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

[data-bs-theme="dark"] .breadcrumb-button.active {
  background: rgba(255, 255, 255, 0.15);
}

[data-bs-theme="dark"] .menu-header {
  background: var(--bs-gray-900);
}
</style>
