# FR.33: Interactive Architecture Flow Graph - Implementation Guide

## Overview

The Interactive Architecture Flow Graph provides a visual representation of the complete request lifecycle from frontend Vue components through TypeScript services, Spring controllers, services, repositories, and database entities.

## Features

### 1. Complete Project Analysis
- Analyzes entire codebase using the Knowledge Graph (FR.38)
- Automatically detects architectural layers based on file paths
- Visualizes relationships (CALLS, INHERITS, USES)

### 2. Interactive Visualization
- **D3.js force-directed graph** with smooth animations
- **Color-coded nodes** by architectural layer:
  - 🟢 COMPONENT (Vue components) - Green
  - 🔵 SERVICE_TS (TypeScript services) - Blue
  - 🟠 CONTROLLER (Spring controllers) - Orange
  - 🟣 SERVICE_JAVA (Spring services) - Purple
  - 🔴 REPOSITORY (Spring repositories) - Pink
  - ⚫ ENTITY (JPA entities) - Red
- **Pan and zoom** support for large graphs
- **Click nodes** to view details and connections
- **Search** to highlight specific nodes
- **Layer filtering** to focus on specific parts of the architecture

### 3. Multiple Layouts
- **Force-Directed**: Natural clustering based on relationships
- **Hierarchical**: Top-down layered view (planned)
- **Layered**: Grouped by architectural layer (planned)

## Usage

### Opening the Flow Graph

1. Click the **Network icon** (⚡) in the top navigation bar
2. The flow graph will open in a full-screen modal
3. Wait for the project analysis to complete

### Navigating the Graph

- **Pan**: Click and drag on empty space
- **Zoom**: Use mouse wheel or pinch gesture
- **Move nodes**: Click and drag individual nodes
- **View details**: Click on a node to see:
  - Node name and type
  - File path and line number
  - Package information
  - Incoming and outgoing connections

### Filtering

**Layer Filters**: Click layer buttons in the toolbar to show/hide specific layers

**Search**: Type in the search box to highlight matching nodes

### Closing the Graph

Click the **Close** button in the top-right corner or press **ESC**

## API Endpoints

### GET /api/flow-graph/analyze
Returns the complete architecture flow graph for the project.

**Response:**
```json
{
  "nodes": [
    {
      "id": "node-1",
      "name": "UserList",
      "nodeType": "CLASS",
      "layer": "COMPONENT",
      "filePath": "/frontend/components/UserList.vue",
      "lineNumber": 10,
      "packageName": "components"
    }
  ],
  "edges": [
    {
      "sourceId": "node-1",
      "targetId": "node-2",
      "edgeType": "CALLS",
      "label": "calls",
      "lineNumber": 25
    }
  ],
  "metadata": {
    "nodeCount": 100,
    "edgeCount": 150,
    "layers": ["COMPONENT", "SERVICE_TS", "CONTROLLER"],
    "layerCounts": { "COMPONENT": 20, "CONTROLLER": 15 },
    "edgeTypeCounts": { "CALLS": 120, "INHERITS": 30 }
  }
}
```

### GET /api/flow-graph/trace?from={nodeId}&depth={maxDepth}
Traces the flow graph from a specific node.

**Parameters:**
- `from` (required): Node ID to start from
- `depth` (optional): Maximum depth to trace (default: 5)

### GET /api/flow-graph/component/{name}
Gets the flow graph starting from a specific component.

**Parameters:**
- `name` (required): Component name to search for

## Implementation Details

### Architecture

**Backend (Java/Spring Boot):**
- `FlowGraphService`: Builds flow graphs from the Knowledge Graph
- `FlowGraphController`: REST API endpoints
- Layer detection via file path pattern matching

**Frontend (Vue 3/TypeScript):**
- `FlowGraphService.ts`: API client
- `FlowGraphView.vue`: D3.js visualization component

### Layer Detection Rules

```java
COMPONENT:     /frontend/src/components/*.vue
SERVICE_TS:    /frontend/src/services/*.ts
CONTROLLER:    /backend/**/controller/** OR package contains .controller
SERVICE_JAVA:  /backend/**/service/** OR package contains .service
REPOSITORY:    /backend/**/repository/** OR package contains .repository
ENTITY:        /backend/**/entity/** OR package contains .entity
```

### Performance (NFR.2)

- **Target**: <500ms render time for graphs with up to 100 nodes
- **Target**: 60 FPS during pan/zoom operations
- **Optimization**: D3.js force simulation with configurable parameters
- **Optimization**: Efficient update strategy (enter/update/exit pattern)
- **Scalability**: Ready for virtual rendering with >100 nodes

## Testing

**Backend Tests**: 23 tests covering:
- Complete graph building
- Layer detection
- Node tracing with depth control
- Component flow analysis
- Edge type preservation
- Metadata generation
- Error handling
- Circular reference handling

**Frontend Tests**: 11 tests covering:
- API integration
- Loading and error states
- Parameter handling
- State management

## Troubleshooting

### Graph not loading
- Ensure backend is running on `http://localhost:8080`
- Check browser console for errors
- Verify Knowledge Graph has been indexed (FR.38)

### Performance issues
- Reduce depth parameter when tracing
- Use layer filtering to reduce visible nodes
- Consider indexing a smaller subset of the project

### Nodes not showing relationships
- Ensure Knowledge Graph has been properly indexed
- Check that file paths follow expected patterns
- Verify relationship types in the database

## Future Enhancements

1. **Additional Layouts**: Hierarchical and layered layouts
2. **HTTP Call Detection**: Parse axios calls to match endpoints
3. **Dependency Injection Visualization**: Highlight @Autowired relationships
4. **Database Query Tracing**: Show repository → entity → table relationships
5. **Performance Profiling**: Add metrics dashboard
6. **Export**: Save graph as SVG/PNG
7. **Deep Linking**: Share specific views via URL

## Related Features

- **FR.38**: Relationship Graph Database - Powers the flow graph
- **FR.39**: Cross-Language Query Support - Enables relationship queries
- **NFR.2**: Graph Rendering Performance Requirements
