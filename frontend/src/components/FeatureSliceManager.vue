<template>
  <div class="feature-slice-manager">
    <!-- Slice Selector Dropdown -->
    <div class="slice-selector mb-3">
      <label class="form-label">Active Slice</label>
      <div class="input-group">
        <BFormSelect
          v-model="activeSliceId"
          :options="sliceOptions"
          @change="onSliceChange"
        >
          <template #first>
            <option :value="null">No slice (show all)</option>
          </template>
        </BFormSelect>
        <BButton variant="outline-secondary" @click="showManager = true">
          <LayersIcon :size="18" />
        </BButton>
      </div>
      <div v-if="activeSlice" class="slice-info mt-2 small text-muted">
        {{ activeSlice.nodeCount }} nodes, {{ activeSlice.fileCount }} files
      </div>
    </div>

    <!-- Slice Manager Offcanvas -->
    <BOffcanvas
      v-model="showManager"
      title="Feature Slice Manager"
      placement="end"
      :style="{ width: '500px' }"
    >
      <div class="manager-content">
        <!-- Create New Slice Button -->
        <BButton
          variant="primary"
          class="w-100 mb-3"
          @click="showCreateDialog = true"
        >
          <PlusIcon :size="18" class="me-2" />
          Create New Slice
        </BButton>

        <!-- Slice List -->
        <div v-if="loading" class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="slices.length === 0" class="text-muted text-center">
          No slices yet. Create one to get started.
        </div>

        <div v-else class="slice-list">
          <div
            v-for="slice in slices"
            :key="slice.id"
            class="slice-card card mb-2"
            :class="{ active: activeSliceId === slice.id }"
          >
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                  <h6 class="mb-1">{{ slice.name }}</h6>
                  <p class="text-muted small mb-2">{{ slice.description }}</p>
                  <div class="stats small">
                    <span class="badge bg-secondary me-2">
                      {{ slice.nodeCount }} nodes
                    </span>
                    <span class="badge bg-secondary">
                      {{ slice.fileCount }} files
                    </span>
                  </div>
                </div>
                <BDropdown variant="link" no-caret size="sm">
                  <template #button-content>
                    <MoreVerticalIcon :size="18" />
                  </template>
                  <BDropdownItem @click="activateSlice(slice.id)">
                    <CheckIcon :size="16" class="me-2" />
                    Activate
                  </BDropdownItem>
                  <BDropdownItem @click="viewSliceDetails(slice.id)">
                    <EyeIcon :size="16" class="me-2" />
                    View Details
                  </BDropdownItem>
                  <BDropdownItem @click="expandSliceDialog(slice.id)">
                    <ZoomInIcon :size="16" class="me-2" />
                    Expand
                  </BDropdownItem>
                  <BDropdownItem @click="editSlice(slice)">
                    <EditIcon :size="16" class="me-2" />
                    Edit
                  </BDropdownItem>
                  <BDropdownDivider />
                  <BDropdownItem @click="confirmDelete(slice.id)" variant="danger">
                    <TrashIcon :size="16" class="me-2" />
                    Delete
                  </BDropdownItem>
                </BDropdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BOffcanvas>

    <!-- Create Slice Dialog -->
    <BModal
      v-model="showCreateDialog"
      title="Create Feature Slice"
      size="lg"
      @ok="createSlice"
    >
      <BFormGroup label="Slice Name" label-for="slice-name">
        <BFormInput
          id="slice-name"
          v-model="newSlice.name"
          placeholder="e.g., User Management"
          required
        />
      </BFormGroup>

      <BFormGroup label="Description" label-for="slice-description">
        <BFormTextarea
          id="slice-description"
          v-model="newSlice.description"
          placeholder="Describe what this slice represents"
          rows="3"
        />
      </BFormGroup>

      <BFormGroup label="Seed Nodes (Search by name)" label-for="seed-nodes">
        <BFormInput
          v-model="nodeSearchQuery"
          placeholder="Search for classes, methods, etc."
          @input="searchNodes"
        />
        <div v-if="searchResults.length > 0" class="search-results mt-2">
          <div
            v-for="node in searchResults"
            :key="node.id"
            class="search-result-item p-2 border-bottom"
            @click="toggleSeedNode(node.id)"
          >
            <BFormCheckbox
              :model-value="newSlice.seedNodeIds.includes(node.id)"
              @click.prevent
            >
              <span class="badge bg-info me-2">{{ node.nodeType }}</span>
              {{ node.name }}
              <span class="text-muted small">- {{ node.filePath }}</span>
            </BFormCheckbox>
          </div>
        </div>
        <div v-if="newSlice.seedNodeIds.length > 0" class="selected-seeds mt-2">
          <small class="text-muted">Selected: {{ newSlice.seedNodeIds.length }} nodes</small>
        </div>
      </BFormGroup>

      <BFormGroup label="Auto-expand Depth (optional)" label-for="expansion-depth">
        <BFormSelect v-model="newSlice.expansionDepth" :options="depthOptions" />
        <small class="text-muted">
          Automatically traverse relationships from seed nodes
        </small>
      </BFormGroup>
    </BModal>

    <!-- Edit Slice Dialog -->
    <BModal
      v-model="showEditDialog"
      title="Edit Slice"
      @ok="updateSlice"
    >
      <BFormGroup label="Slice Name" label-for="edit-name">
        <BFormInput
          id="edit-name"
          v-model="editingSlice.name"
          required
        />
      </BFormGroup>

      <BFormGroup label="Description" label-for="edit-description">
        <BFormTextarea
          id="edit-description"
          v-model="editingSlice.description"
          rows="3"
        />
      </BFormGroup>
    </BModal>

    <!-- Expand Slice Dialog -->
    <BModal
      v-model="showExpandDialog"
      title="Expand Slice"
      @ok="expandSlice"
    >
      <BFormGroup label="Expansion Depth" label-for="expand-depth">
        <BFormSelect v-model="expandParams.depth" :options="depthOptions" />
      </BFormGroup>

      <BFormGroup>
        <BFormCheckbox v-model="expandParams.includeCallers">
          Include nodes that call current nodes
        </BFormCheckbox>
      </BFormGroup>

      <BFormGroup>
        <BFormCheckbox v-model="expandParams.includeCallees">
          Include nodes called by current nodes
        </BFormCheckbox>
      </BFormGroup>

      <BFormGroup>
        <BFormCheckbox v-model="expandParams.includeInheritance">
          Include inheritance relationships
        </BFormCheckbox>
      </BFormGroup>
    </BModal>

    <!-- Slice Details Modal -->
    <BModal
      v-model="showDetailsModal"
      title="Slice Details"
      size="xl"
      hide-footer
    >
      <div v-if="selectedSliceDetail">
        <h5>{{ selectedSliceDetail.name }}</h5>
        <p class="text-muted">{{ selectedSliceDetail.description }}</p>

        <div class="mb-3">
          <h6>Statistics</h6>
          <div class="row">
            <div class="col-md-6">
              <strong>Total Nodes:</strong> {{ selectedSliceDetail.nodes.length }}
            </div>
            <div class="col-md-6">
              <strong>Total Files:</strong> {{ uniqueFiles(selectedSliceDetail.nodes).length }}
            </div>
          </div>
        </div>

        <div class="mb-3">
          <h6>Nodes ({{ selectedSliceDetail.nodes.length }})</h6>
          <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
            <table class="table table-sm table-hover">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Name</th>
                  <th>File</th>
                  <th>Line</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="node in selectedSliceDetail.nodes" :key="node.id">
                  <td><span class="badge bg-info">{{ node.nodeType }}</span></td>
                  <td>{{ node.name }}</td>
                  <td class="small text-muted">{{ node.filePath }}</td>
                  <td>{{ node.lineNumber }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  LayersIcon, PlusIcon, MoreVerticalIcon, CheckIcon, 
  EyeIcon, ZoomInIcon, EditIcon, TrashIcon 
} from 'lucide-vue-next';
import featureSliceService, { 
  FeatureSliceResponse, FeatureSliceDetail, FeatureSliceNode 
} from '../services/FeatureSliceService';
import knowledgeGraphService, { CodeNode } from '../services/KnowledgeGraphService';

const emit = defineEmits<{
  sliceChange: [sliceId: number | null]
  filesChange: [files: string[]]
}>();

// State
const slices = ref<FeatureSliceResponse[]>([]);
const activeSliceId = ref<number | null>(null);
const loading = ref(false);
const showManager = ref(false);
const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const showExpandDialog = ref(false);
const showDetailsModal = ref(false);

// Create slice form
const newSlice = ref({
  name: '',
  description: '',
  seedNodeIds: [] as number[],
  expansionDepth: null as number | null
});

const nodeSearchQuery = ref('');
const searchResults = ref<CodeNode[]>([]);

// Edit slice form
const editingSlice = ref({
  id: null as number | null,
  name: '',
  description: ''
});

// Expand slice params
const expandParams = ref({
  sliceId: null as number | null,
  depth: 1,
  includeCallers: true,
  includeCallees: true,
  includeInheritance: true
});

const selectedSliceDetail = ref<FeatureSliceDetail | null>(null);

// Computed
const activeSlice = computed(() => {
  return slices.value.find(s => s.id === activeSliceId.value) || null;
});

const sliceOptions = computed(() => {
  if (!slices.value || !Array.isArray(slices.value)) {
    return [];
  }
  return slices.value.map(s => ({
    value: s.id,
    text: s.name
  }));
});

const depthOptions = [
  { value: null, text: 'None (seed nodes only)' },
  { value: 1, text: '1 level' },
  { value: 2, text: '2 levels' },
  { value: 3, text: '3 levels' },
  { value: 4, text: '4 levels' },
  { value: 5, text: '5 levels' }
];

// Methods
const loadSlices = async () => {
  loading.value = true;
  try {
    slices.value = await featureSliceService.getAllSlices();
    
    // Restore active slice from localStorage
    const savedSliceId = localStorage.getItem('activeFeatureSlice');
    if (savedSliceId) {
      const sliceId = parseInt(savedSliceId);
      if (slices.value.some(s => s.id === sliceId)) {
        activeSliceId.value = sliceId;
        await onSliceChange();
      }
    }
  } catch (error) {
    console.error('Failed to load slices:', error);
  } finally {
    loading.value = false;
  }
};

const onSliceChange = async () => {
  if (activeSliceId.value === null) {
    localStorage.removeItem('activeFeatureSlice');
    emit('sliceChange', null);
    emit('filesChange', []);
  } else {
    localStorage.setItem('activeFeatureSlice', activeSliceId.value.toString());
    emit('sliceChange', activeSliceId.value);
    
    try {
      const files = await featureSliceService.getSliceFiles(activeSliceId.value);
      emit('filesChange', files);
    } catch (error) {
      console.error('Failed to load slice files:', error);
    }
  }
};

const activateSlice = async (sliceId: number) => {
  activeSliceId.value = sliceId;
  await onSliceChange();
};

const searchNodes = async () => {
  if (nodeSearchQuery.value.length < 2) {
    searchResults.value = [];
    return;
  }
  
  try {
    searchResults.value = await knowledgeGraphService.searchNodes(nodeSearchQuery.value);
  } catch (error) {
    console.error('Failed to search nodes:', error);
  }
};

const toggleSeedNode = (nodeId: number) => {
  const index = newSlice.value.seedNodeIds.indexOf(nodeId);
  if (index === -1) {
    newSlice.value.seedNodeIds.push(nodeId);
  } else {
    newSlice.value.seedNodeIds.splice(index, 1);
  }
};

const createSlice = async () => {
  try {
    await featureSliceService.createSlice({
      name: newSlice.value.name,
      description: newSlice.value.description,
      seedNodeIds: newSlice.value.seedNodeIds,
      expansionDepth: newSlice.value.expansionDepth || undefined
    });
    
    // Reset form
    newSlice.value = {
      name: '',
      description: '',
      seedNodeIds: [],
      expansionDepth: null
    };
    nodeSearchQuery.value = '';
    searchResults.value = [];
    
    await loadSlices();
    showCreateDialog.value = false;
  } catch (error: any) {
    console.error('Failed to create slice:', error);
    alert('Failed to create slice: ' + (error.response?.data?.message || error.message));
  }
};

const editSlice = (slice: FeatureSliceResponse) => {
  editingSlice.value = {
    id: slice.id,
    name: slice.name,
    description: slice.description
  };
  showEditDialog.value = true;
};

const updateSlice = async () => {
  if (!editingSlice.value.id) return;
  
  try {
    await featureSliceService.updateSlice(
      editingSlice.value.id,
      editingSlice.value.name,
      editingSlice.value.description
    );
    await loadSlices();
    showEditDialog.value = false;
  } catch (error: any) {
    console.error('Failed to update slice:', error);
    alert('Failed to update slice: ' + (error.response?.data?.message || error.message));
  }
};

const expandSliceDialog = (sliceId: number) => {
  expandParams.value.sliceId = sliceId;
  showExpandDialog.value = true;
};

const expandSlice = async () => {
  if (!expandParams.value.sliceId) return;
  
  try {
    await featureSliceService.expandSlice(expandParams.value.sliceId, {
      depth: expandParams.value.depth,
      includeCallers: expandParams.value.includeCallers,
      includeCallees: expandParams.value.includeCallees,
      includeInheritance: expandParams.value.includeInheritance
    });
    await loadSlices();
    showExpandDialog.value = false;
  } catch (error: any) {
    console.error('Failed to expand slice:', error);
    alert('Failed to expand slice: ' + (error.response?.data?.message || error.message));
  }
};

const viewSliceDetails = async (sliceId: number) => {
  try {
    selectedSliceDetail.value = await featureSliceService.getSlice(sliceId);
    showDetailsModal.value = true;
  } catch (error) {
    console.error('Failed to load slice details:', error);
  }
};

const confirmDelete = async (sliceId: number) => {
  if (!confirm('Are you sure you want to delete this slice?')) {
    return;
  }
  
  try {
    await featureSliceService.deleteSlice(sliceId);
    
    if (activeSliceId.value === sliceId) {
      activeSliceId.value = null;
      await onSliceChange();
    }
    
    await loadSlices();
  } catch (error) {
    console.error('Failed to delete slice:', error);
    alert('Failed to delete slice');
  }
};

const uniqueFiles = (nodes: FeatureSliceNode[]) => {
  return [...new Set(nodes.map(n => n.filePath))];
};

// Lifecycle
onMounted(() => {
  loadSlices();
});
</script>

<style scoped>
.slice-card {
  cursor: pointer;
  transition: all 0.2s;
}

.slice-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.slice-card.active {
  border-left: 4px solid var(--bs-primary);
  background-color: rgba(var(--bs-primary-rgb), 0.05);
}

.search-results {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
}

.search-result-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.1);
}
</style>
