<template>
  <div class="flow-graph-view">
    <!-- Header and controls -->
    <div class="graph-header">
      <h4><Network :size="20" class="me-2" />Architecture Flow Graph</h4>
      <button class="btn btn-sm btn-outline-secondary" @click="$emit('close')">
        <X :size="16" /> Close
      </button>
    </div>

    <!-- Toolbar -->
    <div class="graph-toolbar">
      <div class="toolbar-section">
        <label>Layout:</label>
        <select v-model="selectedLayout" class="form-select form-select-sm" @change="applyLayout">
          <option value="force">Force-Directed</option>
          <option value="hierarchical">Hierarchical</option>
          <option value="layered">Layered</option>
        </select>
      </div>

      <div class="toolbar-section">
        <label>Filter Layers:</label>
        <div class="layer-filters">
          <button
            v-for="layer in availableLayers"
            :key="layer"
            :class="['btn btn-sm', hiddenLayers.has(layer) ? 'btn-outline-secondary' : layerButtonClass(layer)]"
            @click="toggleLayer(layer)"
          >
            {{ layer }}
          </button>
        </div>
      </div>

      <div class="toolbar-section">
        <label>Search:</label>
        <input
          v-model="searchTerm"
          type="text"
          class="form-control form-control-sm"
          placeholder="Search nodes..."
          @input="highlightSearchResults"
        />
      </div>

      <div class="toolbar-section ms-auto">
        <span class="text-muted">{{ filteredNodes.length }} nodes, {{ filteredEdges.length }} edges</span>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Analyzing project structure...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="alert alert-danger m-3">
      <strong>Error:</strong> {{ error }}
    </div>

    <!-- Graph visualization -->
    <div v-else class="graph-container">
      <svg ref="svgContainer" class="flow-graph-svg"></svg>
      
      <!-- Legend -->
      <div class="graph-legend">
        <h6>Layers</h6>
        <div class="legend-item" v-for="layer in availableLayers" :key="layer">
          <div class="legend-color" :style="{ backgroundColor: getLayerColor(layer) }"></div>
          <span>{{ layer }}</span>
        </div>
        
        <h6 class="mt-3">Edge Types</h6>
        <div class="legend-item">
          <div class="legend-line"></div>
          <span>CALLS</span>
        </div>
        <div class="legend-item">
          <div class="legend-line dashed"></div>
          <span>INHERITS</span>
        </div>
      </div>

      <!-- Node details panel -->
      <div v-if="selectedNode" class="node-details">
        <div class="details-header">
          <h6>{{ selectedNode.name }}</h6>
          <button class="btn btn-sm btn-close" @click="selectedNode = null"></button>
        </div>
        <div class="details-body">
          <p><strong>Type:</strong> {{ selectedNode.nodeType }}</p>
          <p><strong>Layer:</strong> {{ selectedNode.layer }}</p>
          <p><strong>File:</strong> <code>{{ selectedNode.filePath }}</code></p>
          <p v-if="selectedNode.lineNumber"><strong>Line:</strong> {{ selectedNode.lineNumber }}</p>
          <p v-if="selectedNode.packageName"><strong>Package:</strong> {{ selectedNode.packageName }}</p>
          
          <div class="mt-3">
            <strong>Connections:</strong>
            <ul class="connection-list">
              <li v-for="conn in getConnections(selectedNode.id)" :key="conn.id">
                {{ conn.direction === 'out' ? '→' : '←' }} {{ conn.label }} {{ conn.targetName }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Network, X } from 'lucide-vue-next'
import * as d3 from 'd3'
import type { Selection, Simulation, SimulationNodeDatum, SimulationLinkDatum } from 'd3'
import FlowGraphService, { type FlowGraphNode, type FlowGraphEdge, type FlowGraphResponse } from '../services/FlowGraphService'

// D3-compatible node and link types
interface D3Node extends SimulationNodeDatum, FlowGraphNode {}
interface D3Link extends SimulationLinkDatum<D3Node> {
  sourceId: string
  targetId: string
  edgeType: string
  label: string
  lineNumber?: number
}

// Emits
defineEmits<{
  close: []
}>()

// State
const loading = ref(true)
const error = ref<string | null>(null)
const flowGraphData = ref<FlowGraphResponse | null>(null)
const svgContainer = ref<SVGSVGElement | null>(null)
const selectedLayout = ref('force')
const hiddenLayers = ref(new Set<string>())
const searchTerm = ref('')
const selectedNode = ref<FlowGraphNode | null>(null)

// D3 simulation and elements
let simulation: Simulation<D3Node, D3Link> | null = null
let svg: Selection<SVGSVGElement, unknown, null, undefined> | null = null
let g: Selection<SVGGElement, unknown, null, undefined> | null = null

// Computed
const availableLayers = computed(() => {
  if (!flowGraphData.value) return []
  return flowGraphData.value.metadata.layers || []
})

const filteredNodes = computed(() => {
  if (!flowGraphData.value) return []
  return flowGraphData.value.nodes.filter(node => !hiddenLayers.value.has(node.layer))
})

const filteredEdges = computed(() => {
  if (!flowGraphData.value) return []
  const visibleNodeIds = new Set(filteredNodes.value.map(n => n.id))
  return flowGraphData.value.edges.filter(edge => 
    visibleNodeIds.has(edge.sourceId) && visibleNodeIds.has(edge.targetId)
  )
})

// Layer color mapping
const layerColors: Record<string, string> = {
  'COMPONENT': '#10b981',      // green
  'SERVICE_TS': '#3b82f6',     // blue
  'CONTROLLER': '#f97316',     // orange
  'SERVICE_JAVA': '#8b5cf6',   // purple
  'REPOSITORY': '#ec4899',     // pink
  'ENTITY': '#ef4444',         // red
  'CLASS': '#6b7280',          // gray
  'METHOD': '#9ca3af',         // light gray
  'UNKNOWN': '#d1d5db'         // very light gray
}

// Methods
function getLayerColor(layer: string): string {
  return layerColors[layer] || '#6b7280'
}

function layerButtonClass(layer: string): string {
  const colorMap: Record<string, string> = {
    'COMPONENT': 'btn-success',
    'SERVICE_TS': 'btn-primary',
    'CONTROLLER': 'btn-warning',
    'SERVICE_JAVA': 'btn-info',
    'REPOSITORY': 'btn-danger',
    'ENTITY': 'btn-dark'
  }
  return colorMap[layer] || 'btn-secondary'
}

function toggleLayer(layer: string) {
  if (hiddenLayers.value.has(layer)) {
    hiddenLayers.value.delete(layer)
  } else {
    hiddenLayers.value.add(layer)
  }
  updateVisualization()
}

function highlightSearchResults() {
  if (!svg || !searchTerm.value) {
    svg?.selectAll('.node').classed('search-highlight', false)
    return
  }
  
  const term = searchTerm.value.toLowerCase()
  svg.selectAll('.node')
    .classed('search-highlight', (d: unknown) => {
      const node = d as D3Node
      return node.name.toLowerCase().includes(term)
    })
}

function getConnections(nodeId: string) {
  if (!flowGraphData.value) return []
  
  const connections: any[] = []
  const nodeMap = new Map(flowGraphData.value.nodes.map(n => [n.id, n]))
  
  flowGraphData.value.edges.forEach(edge => {
    if (edge.sourceId === nodeId) {
      const target = nodeMap.get(edge.targetId)
      if (target) {
        connections.push({
          id: edge.targetId,
          direction: 'out',
          label: edge.label,
          targetName: target.name
        })
      }
    } else if (edge.targetId === nodeId) {
      const source = nodeMap.get(edge.sourceId)
      if (source) {
        connections.push({
          id: edge.sourceId,
          direction: 'in',
          label: edge.label,
          targetName: source.name
        })
      }
    }
  })
  
  return connections
}

async function loadFlowGraph() {
  loading.value = true
  error.value = null
  
  try {
    const data = await FlowGraphService.analyzeProject()
    if (data) {
      flowGraphData.value = data
      await nextTick()
      initializeVisualization()
    } else {
      error.value = 'Failed to load flow graph'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

function initializeVisualization() {
  if (!svgContainer.value || !flowGraphData.value) return
  
  const width = svgContainer.value.clientWidth
  const height = svgContainer.value.clientHeight
  
  // Clear previous visualization
  d3.select(svgContainer.value).selectAll('*').remove()
  
  // Create SVG
  svg = d3.select(svgContainer.value)
    .attr('width', width)
    .attr('height', height)
  
  // Add zoom behavior
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g?.attr('transform', event.transform)
    })
  
  svg.call(zoom)
  
  // Create main group
  g = svg.append('g')
  
  // Draw the graph
  drawGraph(width, height)
}

function drawGraph(width: number, height: number) {
  if (!g || !flowGraphData.value) return
  
  const nodes: D3Node[] = filteredNodes.value.map(n => ({ ...n }))
  const edges: D3Link[] = filteredEdges.value.map(e => ({ ...e }))
  
  // Create simulation
  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(edges)
      .id((d: D3Node) => d.id)
      .distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(30))
  
  // Draw edges
  const link = g.append('g')
    .selectAll('line')
    .data(edges)
    .join('line')
    .attr('class', 'edge')
    .attr('stroke', '#999')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', (d: D3Link) => d.edgeType === 'INHERITS' ? '5,5' : '0')
    .attr('marker-end', 'url(#arrowhead)')
  
  // Draw nodes
  const node = g.append('g')
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('class', 'node')
    .attr('r', 10)
    .attr('fill', (d: D3Node) => getLayerColor(d.layer))
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .call(drag(simulation) as any)
    .on('click', (_event: unknown, d: D3Node) => {
      selectedNode.value = d
    })
    .on('mouseover', function(this: SVGCircleElement) {
      d3.select(this).attr('r', 15)
    })
    .on('mouseout', function(this: SVGCircleElement) {
      d3.select(this).attr('r', 10)
    })
  
  // Add labels
  const label = g.append('g')
    .selectAll('text')
    .data(nodes)
    .join('text')
    .attr('class', 'node-label')
    .attr('text-anchor', 'middle')
    .attr('dy', -15)
    .text((d: D3Node) => d.name)
  
  // Add arrow markers
  svg?.append('defs').append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '-0 -5 10 10')
    .attr('refX', 20)
    .attr('refY', 0)
    .attr('orient', 'auto')
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .append('path')
    .attr('d', 'M 0,-5 L 10,0 L 0,5')
    .attr('fill', '#999')
  
  // Update positions on tick
  simulation.on('tick', () => {
    link
      .attr('x1', (d: D3Link) => (d.source as D3Node).x || 0)
      .attr('y1', (d: D3Link) => (d.source as D3Node).y || 0)
      .attr('x2', (d: D3Link) => (d.target as D3Node).x || 0)
      .attr('y2', (d: D3Link) => (d.target as D3Node).y || 0)
    
    node
      .attr('cx', (d: D3Node) => d.x || 0)
      .attr('cy', (d: D3Node) => d.y || 0)
    
    label
      .attr('x', (d: D3Node) => d.x || 0)
      .attr('y', (d: D3Node) => d.y || 0)
  })
}

function drag(simulation: Simulation<D3Node, D3Link>) {
  function dragstarted(event: d3.D3DragEvent<SVGCircleElement, D3Node, D3Node>) {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    event.subject.fx = event.subject.x
    event.subject.fy = event.subject.y
  }
  
  function dragged(event: d3.D3DragEvent<SVGCircleElement, D3Node, D3Node>) {
    event.subject.fx = event.x
    event.subject.fy = event.y
  }
  
  function dragended(event: d3.D3DragEvent<SVGCircleElement, D3Node, D3Node>) {
    if (!event.active) simulation.alphaTarget(0)
    event.subject.fx = null
    event.subject.fy = null
  }
  
  return d3.drag<SVGCircleElement, D3Node>()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended)
}

function applyLayout() {
  // Re-initialize with different layout
  initializeVisualization()
}

function updateVisualization() {
  initializeVisualization()
}

// Lifecycle
onMounted(() => {
  loadFlowGraph()
  
  // Handle window resize
  window.addEventListener('resize', initializeVisualization)
})

// Watch for changes
watch(() => filteredNodes.value.length, () => {
  if (!loading.value && flowGraphData.value) {
    updateVisualization()
  }
})
</script>

<style scoped>
.flow-graph-view {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--bs-body-bg);
  z-index: 1050;
  display: flex;
  flex-direction: column;
}

.graph-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--bs-border-color);
}

.graph-header h4 {
  margin: 0;
  display: flex;
  align-items: center;
}

.graph-toolbar {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--bs-border-color);
  flex-wrap: wrap;
  align-items: center;
}

.toolbar-section {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.toolbar-section label {
  margin: 0;
  font-weight: 500;
  font-size: 0.875rem;
}

.layer-filters {
  display: flex;
  gap: 0.25rem;
}

.graph-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.flow-graph-svg {
  width: 100%;
  height: 100%;
}

.graph-legend {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 0.375rem;
  padding: 1rem;
  min-width: 150px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.graph-legend h6 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #fff;
}

.legend-line {
  width: 20px;
  height: 2px;
  background: #999;
}

.legend-line.dashed {
  background: repeating-linear-gradient(
    to right,
    #999 0,
    #999 4px,
    transparent 4px,
    transparent 8px
  );
}

.node-details {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 0.375rem;
  padding: 1rem;
  min-width: 300px;
  max-width: 400px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--bs-border-color);
}

.details-header h6 {
  margin: 0;
  font-weight: 600;
}

.details-body p {
  margin: 0.5rem 0;
  font-size: 0.875rem;
}

.details-body code {
  font-size: 0.75rem;
  word-break: break-all;
}

.connection-list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0 0;
  font-size: 0.75rem;
}

.connection-list li {
  padding: 0.25rem 0;
}

/* D3 node styles */
:deep(.node) {
  cursor: pointer;
  transition: all 0.2s;
}

:deep(.node.search-highlight) {
  stroke: #fbbf24 !important;
  stroke-width: 4px !important;
}

:deep(.node-label) {
  font-size: 12px;
  font-weight: 500;
  pointer-events: none;
  user-select: none;
  fill: var(--bs-body-color);
}

:deep(.edge) {
  opacity: 0.6;
}
</style>
