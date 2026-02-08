<template>
  <div class="state-machine-view">
    <h4 class="mb-3">State Machine Diagrams</h4>
    
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div v-else-if="stateMachines.length === 0" class="alert alert-info">
      No state machines detected in this file.
    </div>
    
    <div v-else>
      <div v-for="machine in stateMachines" :key="machine.variableName" class="mb-4">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              {{ machine.variableName }} 
              <small class="text-muted">({{ machine.variableType }})</small>
            </h5>
            <span class="badge bg-primary">
              {{ machine.states.length }} states, {{ machine.transitions.length }} transitions
            </span>
          </div>
          <div class="card-body">
            <svg 
              :ref="el => setDiagramRef(machine.variableName, el as SVGSVGElement)"
              class="state-diagram"
              :style="{ width: '100%', height: calculateHeight(machine) + 'px' }"
            ></svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { StateMachineService, type StateMachineInfo } from '../services/StateMachineService';
import * as d3 from 'd3';

interface Props {
  filePath?: string;
}

const props = defineProps<Props>();

const stateMachines = ref<StateMachineInfo[]>([]);
const loading = ref(false);
const diagramRefs = ref<Map<string, SVGSVGElement>>(new Map());

function setDiagramRef(key: string, el: SVGSVGElement | null) {
  if (el) {
    diagramRefs.value.set(key, el);
  }
}

function calculateHeight(machine: StateMachineInfo): number {
  const stateCount = machine.states.length;
  const minHeight = 200;
  const heightPerState = 100;
  return Math.max(minHeight, stateCount * heightPerState);
}

async function loadStateMachines() {
  if (!props.filePath) return;
  
  loading.value = true;
  try {
    stateMachines.value = await StateMachineService.getStateMachines(props.filePath);
    // Wait for DOM update before rendering
    setTimeout(() => renderAllDiagrams(), 100);
  } catch (error) {
    console.error('Failed to load state machines:', error);
    stateMachines.value = [];
  } finally {
    loading.value = false;
  }
}

function renderAllDiagrams() {
  stateMachines.value.forEach(machine => {
    const svg = diagramRefs.value.get(machine.variableName);
    if (svg) {
      renderDiagram(svg, machine);
    }
  });
}

function renderDiagram(svg: SVGSVGElement, machine: StateMachineInfo) {
  // Clear existing content
  d3.select(svg).selectAll('*').remove();
  
  const width = svg.clientWidth;
  const height = calculateHeight(machine);
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  
  const g = d3.select(svg)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  // Calculate positions for states (circular layout)
  const states = machine.states;
  const centerX = (width - margin.left - margin.right) / 2;
  const centerY = (height - margin.top - margin.bottom) / 2;
  const radius = Math.min(centerX, centerY) * 0.7;
  
  const statePositions = new Map<string, { x: number; y: number }>();
  states.forEach((state, i) => {
    const angle = (i / states.length) * 2 * Math.PI - Math.PI / 2;
    statePositions.set(state.id, {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    });
  });
  
  // Draw transitions (arrows)
  const transitions = machine.transitions;
  transitions.forEach(transition => {
    const fromPos = statePositions.get(transition.from);
    const toPos = statePositions.get(transition.to);
    
    if (fromPos && toPos) {
      // Calculate arrow path
      const dx = toPos.x - fromPos.x;
      const dy = toPos.y - fromPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Offset to avoid overlapping with circles
      const nodeRadius = 40;
      const startX = fromPos.x + (dx / dist) * nodeRadius;
      const startY = fromPos.y + (dy / dist) * nodeRadius;
      const endX = toPos.x - (dx / dist) * nodeRadius;
      const endY = toPos.y - (dy / dist) * nodeRadius;
      
      // Draw arrow
      g.append('line')
        .attr('x1', startX)
        .attr('y1', startY)
        .attr('x2', endX)
        .attr('y2', endY)
        .attr('stroke', '#6c757d')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrowhead)');
      
      // Add label
      const labelX = (startX + endX) / 2;
      const labelY = (startY + endY) / 2;
      
      g.append('text')
        .attr('x', labelX)
        .attr('y', labelY - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('fill', '#495057')
        .text(transition.trigger.substring(0, 20));
    }
  });
  
  // Define arrowhead marker
  svg.insertBefore(
    d3.create('svg:defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('refX', 9)
      .attr('refY', 3)
      .attr('orient', 'auto')
      .append('polygon')
      .attr('points', '0 0, 10 3, 0 6')
      .attr('fill', '#6c757d')
      .node()!.parentNode!,
    svg.firstChild
  );
  
  // Draw states (circles)
  states.forEach(state => {
    const pos = statePositions.get(state.id);
    if (!pos) return;
    
    const stateGroup = g.append('g')
      .attr('transform', `translate(${pos.x},${pos.y})`);
    
    // Circle
    stateGroup.append('circle')
      .attr('r', 40)
      .attr('fill', '#007bff')
      .attr('stroke', '#0056b3')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function() {
        d3.select(this).attr('fill', '#0056b3');
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill', '#007bff');
      });
    
    // Label
    stateGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none')
      .text(state.label.substring(0, 10));
    
    // Line number
    stateGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.5em')
      .attr('fill', 'white')
      .attr('font-size', '9px')
      .style('pointer-events', 'none')
      .text(`L${state.line}`);
  });
}

watch(() => props.filePath, () => {
  loadStateMachines();
}, { immediate: true });
</script>

<style scoped>
.state-machine-view {
  padding: 1rem;
}

.state-diagram {
  background: #f8f9fa;
  border-radius: 4px;
}

.card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card-header {
  background: linear-gradient(to right, #f8f9fa, #e9ecef);
}
</style>
