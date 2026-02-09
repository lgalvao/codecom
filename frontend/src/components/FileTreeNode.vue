<script setup>
import { ref } from 'vue';
import { ChevronRight, ChevronDown, FileText, Folder } from 'lucide-vue-next';

const props = defineProps({
  node: Object,
  depth: {
    type: Number,
    default: 0
  },
  sliceFiles: {
    type: Array,
    default: () => []
  }
});

const emits = defineEmits(['select']);

const isOpen = ref(false);

const toggle = () => {
  if (props.node.isDirectory) {
    isOpen.value = !isOpen.value;
  } else {
    emits('select', props.node);
  }
};

const onChildSelect = (childNode) => {
  emits('select', childNode);
};

const isDimmed = () => {
  // If no slice is active, don't dim anything
  if (!props.sliceFiles || props.sliceFiles.length === 0) {
    return false;
  }
  
  // If this is a file, check if it's in the slice
  if (!props.node.isDirectory) {
    return !props.sliceFiles.includes(props.node.path);
  }
  
  // For directories, dim if none of its descendants are in the slice
  const hasSliceFile = (node) => {
    if (!node.isDirectory) {
      return props.sliceFiles.includes(node.path);
    }
    if (node.children) {
      return node.children.some(child => hasSliceFile(child));
    }
    return false;
  };
  
  return !hasSliceFile(props.node);
};
</script>

<template>
  <div class="file-node">
    <div 
      class="node-label d-flex align-items-center py-1 px-2 cursor-pointer" 
      :style="{ paddingLeft: (depth * 18 + 8) + 'px' }"
      @click="toggle"
      :class="{ 
        'text-primary fw-bold': node.isDirectory && isOpen,
        'dimmed-node': isDimmed()
      }"
      :data-testid="node.isDirectory ? 'folder-node' : 'file-node'"
      :data-path="node.path"
    >
      <span v-if="node.isDirectory" class="me-1 d-flex align-items-center" style="width: 14px;">
        <ChevronDown v-if="isOpen" :size="12" />
        <ChevronRight v-else :size="12" />
      </span>
      <span v-else class="me-1" style="width: 14px;"></span>
      
      <Folder v-if="node.isDirectory" :size="14" class="me-2 text-warning" />
      <FileText v-else :size="14" class="me-2 text-info" />
      
      <span class="node-name small truncate flex-grow-1">{{ node.name }}</span>
    </div>

    <div v-if="node.isDirectory && isOpen" class="node-children position-relative ms-3 border-start pl-1">
      <FileTreeNode 
        v-for="child in node.children" 
        :key="child.path" 
        :node="child" 
        :depth="depth + 1"
        :slice-files="sliceFiles"
        @select="onChildSelect"
      />
    </div>
  </div>
</template>

<style scoped>
.node-children {
  border-left: 1px solid rgba(128, 128, 128, 0.2);
  margin-left: 15px !important; /* Align line with the chevron/folder area */
}
.node-label {
  user-select: none;
  border-radius: 4px;
  margin: 1px 4px;
  transition: background-color 0.1s;
  height: 24px;
}
.node-label:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
[data-bs-theme='dark'] .node-label:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
.cursor-pointer {
  cursor: pointer;
}
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dimmed-node {
  opacity: 0.4;
  transition: opacity 0.2s;
}
.dimmed-node:hover {
  opacity: 0.7;
}
</style>
