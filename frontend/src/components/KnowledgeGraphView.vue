<template>
  <div class="knowledge-graph-view">
    <div class="query-panel">
      <h4>Knowledge Graph Query</h4>
      <div class="query-builder">
        <BFormSelect 
          v-model="queryType" 
          :options="queryTypeOptions"
          class="mb-2"
        />
        
        <BFormInput
          v-model="queryValue"
          :placeholder="getPlaceholder()"
          class="mb-2"
          @keyup.enter="executeQuery"
        />
        
        <BButton variant="primary" @click="executeQuery" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          Execute Query
        </BButton>
      </div>
    </div>
    
    <div v-if="error" class="alert alert-danger mt-3">
      {{ error }}
    </div>
    
    <div v-if="results" class="results-panel mt-3">
      <h5>Results ({{ results.totalResults }})</h5>
      
      <div v-if="results.nodes.length === 0" class="text-muted">
        No results found
      </div>
      
      <div v-else class="results-list">
        <div 
          v-for="node in results.nodes" 
          :key="node.id"
          class="result-item card mb-2"
        >
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="mb-1">
                  <span :class="getNodeTypeClass(node.nodeType)">
                    {{ node.nodeType }}
                  </span>
                  {{ node.name }}
                </h6>
                <div class="text-muted small">
                  {{ node.filePath }}:{{ node.lineNumber }}
                </div>
                <div v-if="node.packageName" class="text-muted small">
                  Package: {{ node.packageName }}
                </div>
                <div v-if="node.signature" class="code-signature small mt-1">
                  {{ node.signature }}
                </div>
              </div>
              <BButton 
                size="sm" 
                variant="outline-primary"
                @click="viewNodeDetails(node.id)"
              >
                Details
              </BButton>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Node Details Modal -->
    <BModal 
      v-model="showDetailsModal" 
      title="Node Details"
      size="lg"
      hide-footer
    >
      <div v-if="selectedNode">
        <h5>{{ selectedNode.name }}</h5>
        <p class="text-muted">
          {{ selectedNode.nodeType }} - {{ selectedNode.filePath }}:{{ selectedNode.lineNumber }}
        </p>
        
        <div v-if="selectedNode.documentation" class="mb-3">
          <h6>Documentation</h6>
          <pre class="documentation">{{ selectedNode.documentation }}</pre>
        </div>
        
        <div class="mb-3">
          <h6>Outgoing Relationships ({{ selectedNode.outgoingRelationships.length }})</h6>
          <div v-if="selectedNode.outgoingRelationships.length === 0" class="text-muted">
            None
          </div>
          <ul v-else class="list-unstyled">
            <li 
              v-for="rel in selectedNode.outgoingRelationships" 
              :key="rel.relationshipId"
              class="mb-1"
            >
              <span class="badge bg-primary">{{ rel.relationshipType }}</span>
              <span class="ms-2">{{ rel.relatedNodeName }}</span>
              <span class="text-muted ms-2">({{ rel.relatedNodeType }})</span>
            </li>
          </ul>
        </div>
        
        <div>
          <h6>Incoming Relationships ({{ selectedNode.incomingRelationships.length }})</h6>
          <div v-if="selectedNode.incomingRelationships.length === 0" class="text-muted">
            None
          </div>
          <ul v-else class="list-unstyled">
            <li 
              v-for="rel in selectedNode.incomingRelationships" 
              :key="rel.relationshipId"
              class="mb-1"
            >
              <span class="badge bg-success">{{ rel.relationshipType }}</span>
              <span class="ms-2">{{ rel.relatedNodeName }}</span>
              <span class="text-muted ms-2">({{ rel.relatedNodeType }})</span>
            </li>
          </ul>
        </div>
      </div>
    </BModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BFormSelect, BFormInput, BButton, BModal } from 'bootstrap-vue-next';
import KnowledgeGraphService, { 
  type KnowledgeGraphQueryResult, 
  type NodeWithRelationships 
} from '../services/KnowledgeGraphService';

const queryType = ref('name');
const queryValue = ref('');
const loading = ref(false);
const error = ref('');
const results = ref<KnowledgeGraphQueryResult | null>(null);
const showDetailsModal = ref(false);
const selectedNode = ref<NodeWithRelationships | null>(null);

const queryTypeOptions = [
  { value: 'name', text: 'Search by Name' },
  { value: 'calls', text: 'Find Callers' },
  { value: 'inherits', text: 'Find Subclasses' },
  { value: 'type', text: 'Find by Type' }
];

function getPlaceholder(): string {
  switch (queryType.value) {
    case 'name':
      return 'Enter name to search...';
    case 'calls':
      return 'Enter method name...';
    case 'inherits':
      return 'Enter class name...';
    case 'type':
      return 'Enter type (CLASS, METHOD, INTERFACE)...';
    default:
      return 'Enter query...';
  }
}

async function executeQuery() {
  if (!queryValue.value.trim()) {
    error.value = 'Please enter a query value';
    return;
  }
  
  loading.value = true;
  error.value = '';
  results.value = null;
  
  try {
    const query = `${queryType.value}:${queryValue.value}`;
    results.value = await KnowledgeGraphService.executeQuery(query);
  } catch (e) {
    error.value = `Query failed: ${e instanceof Error ? e.message : String(e)}`;
  } finally {
    loading.value = false;
  }
}

async function viewNodeDetails(nodeId: number) {
  try {
    selectedNode.value = await KnowledgeGraphService.getNode(nodeId);
    showDetailsModal.value = true;
  } catch (e) {
    error.value = `Failed to load node details: ${e instanceof Error ? e.message : String(e)}`;
  }
}

function getNodeTypeClass(nodeType: string): string {
  const classes: Record<string, string> = {
    'CLASS': 'badge bg-info',
    'INTERFACE': 'badge bg-warning',
    'METHOD': 'badge bg-success',
    'FIELD': 'badge bg-secondary'
  };
  return classes[nodeType] || 'badge bg-secondary';
}
</script>

<style scoped>
.knowledge-graph-view {
  padding: 1rem;
}

.query-panel {
  background: var(--bs-light);
  padding: 1rem;
  border-radius: 0.25rem;
}

.query-builder {
  max-width: 600px;
}

.results-list {
  max-height: 600px;
  overflow-y: auto;
}

.result-item {
  transition: box-shadow 0.2s;
}

.result-item:hover {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.code-signature {
  font-family: 'Courier New', monospace;
  background: var(--bs-light);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.documentation {
  background: var(--bs-light);
  padding: 0.5rem;
  border-radius: 0.25rem;
  white-space: pre-wrap;
  font-size: 0.875rem;
}
</style>
