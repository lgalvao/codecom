# CodeCom SRS - Visual Requirements Map

## New Requirements Integration Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CodeCom Enhanced Requirements                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  EXISTING (FR.1-31, NFR.1-3, UC-01 to UC-07)                        │
│  ├── Complexity-Controlled View                                      │
│  ├── Advanced Code Viewer                                            │
│  ├── Navigation & Symbol Search                                      │
│  ├── Statistics & Analysis                                           │
│  └── Export Functionality                                            │
│                                                                       │
│  NEW ADDITIONS (FR.32-41, NFR.4-9, UC-08 to UC-14)                  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Visual Perspective & Code Quality (Section 3.9)               │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │ FR.32: Complexity Heatmap (Lava Lamp)                         │   │
│  │   • File tree overlay with color-coded complexity             │   │
│  │   • Red/Orange: High complexity or frequent changes           │   │
│  │   • Green/Blue: Simple, stable code                           │   │
│  │                                                                │   │
│  │ FR.33: Interactive Architecture Flow Graph                    │   │
│  │   • 2D visualization of full request lifecycle                │   │
│  │   • Vue → TS Services → Controllers → DB                      │   │
│  │   • Uses D3.js/Cytoscape.js                                   │   │
│  │                                                                │   │
│  │ FR.34: Code Structure Mini-Map                                │   │
│  │   • Vertical "DNA strip" next to scrollbar                    │   │
│  │   • Color-coded: Public (Green), Private (Blue), Errors (Red) │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Advanced Structural Analysis (Section 3.10)                   │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │ FR.35: Feature-Based Code Slicing                             │   │
│  │   • Define logical domains (e.g., "User Management")          │   │
│  │   • Filter to show only relevant code                         │   │
│  │   • Dim 90% of irrelevant codebase                            │   │
│  │                                                                │   │
│  │ FR.36: State Machine Extraction                               │   │
│  │   • Auto-generate state diagrams from Enums/Union types       │   │
│  │   • Analyze switch/if-else for transitions                    │   │
│  │   • Visual state flow charts                                  │   │
│  │                                                                │   │
│  │ FR.37: Dead Code Detection & Visualization                    │   │
│  │   • Ghost mode (40% opacity) for unused code                  │   │
│  │   • Based on call graph analysis                              │   │
│  │   • Prevents wasted analysis time                             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Cross-Language Knowledge Graph (Section 3.11)                 │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │ FR.38: Relationship Graph Database                            │   │
│  │   • Edge-list format in H2                                    │   │
│  │   • Relationships: CALLS, INHERITS, INJECTS, MAPS_TO_URL      │   │
│  │   • Backend uses JGraphT for graph operations                 │   │
│  │                                                                │   │
│  │ FR.39: Cross-Language Query Support                           │   │
│  │   • "Show Vue components writing to ORDERS table"             │   │
│  │   • "Find services called by UserManagement component"        │   │
│  │   • Trace from UI to database across languages                │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Enhanced Interaction Model (Section 3.12)                     │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │ FR.40: Definition Peek (Code Bubble)                          │   │
│  │   • Hover shows first 10 lines of implementation              │   │
│  │   • Maintains context without navigation                      │   │
│  │   • Prevents "navigation whiplash"                            │   │
│  │                                                                │   │
│  │ FR.41: Interactive Breadcrumb Navigation                      │   │
│  │   • Clickable dropdowns at every hierarchy level              │   │
│  │   • Show sibling methods/classes                              │   │
│  │   • Quick navigation within packages                          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Performance & Quality Requirements

### New NFRs Added

```
┌────────────────────────────────────────────────────────────────────┐
│ Performance Requirements (NFR.1-4)                                  │
├────────────────────────────────────────────────────────────────────┤
│ NFR.1: Rendering Performance     │ <200ms for files >2000 lines    │
│ NFR.2: Graph Rendering (NEW)     │ <500ms for 100 nodes, 60 FPS    │
│ NFR.3: Heatmap Calculation (NEW) │ <2s for 1000 files              │
│ NFR.4: Knowledge Graph (NEW)     │ <1s for typical queries         │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ Scalability Requirements (NFR.8-9)                                  │
├────────────────────────────────────────────────────────────────────┤
│ NFR.8: Large Codebase (NEW)      │ 10,000 files, 100,000 symbols   │
│ NFR.9: Incremental Indexing (NEW)│ Only re-index changed files     │
└────────────────────────────────────────────────────────────────────┘
```

## Implementation Phases

```
┌─────────────────────────────────────────────────────────────────┐
│ Phase 1: Foundation (High Priority)                             │
├─────────────────────────────────────────────────────────────────┤
│ • FR.38-39: Knowledge Graph (extends indexing)                  │
│ • FR.40: Definition Peek (enhances hover tooltips)              │
│ • FR.41: Interactive Breadcrumbs (extends navigation)           │
│ • FR.37: Dead Code Detection (uses call graph)                  │
│                                                                  │
│ Rationale: Builds on existing features, immediate value         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Phase 2: Visualization Core (Medium Priority)                   │
├─────────────────────────────────────────────────────────────────┤
│ • FR.32: Complexity Heatmap                                     │
│ • FR.34: Code Mini-Map                                          │
│ • FR.35: Code Slicing (requires FR.38)                          │
│                                                                  │
│ Rationale: High visual impact, moderate complexity              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Phase 3: Advanced Analytics (Lower Priority)                    │
├─────────────────────────────────────────────────────────────────┤
│ • FR.33: Architecture Flow Graph (requires D3.js)               │
│ • FR.36: State Machine Extraction (advanced AST)                │
│                                                                  │
│ Rationale: Complex, requires new libraries and analysis         │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack Additions

### Frontend Libraries
```
┌─────────────────────┬──────────────────────────────────────────┐
│ Library             │ Purpose                                   │
├─────────────────────┼──────────────────────────────────────────┤
│ D3.js               │ Interactive visualizations, state diagrams│
│ Cytoscape.js        │ Graph/network visualization               │
│ Force-Graph         │ 3D/2D force-directed graphs               │
│ Shiki (existing)    │ Syntax highlighting in tooltips           │
└─────────────────────┴──────────────────────────────────────────┘
```

### Backend Libraries
```
┌─────────────────────┬──────────────────────────────────────────┐
│ Library             │ Purpose                                   │
├─────────────────────┼──────────────────────────────────────────┤
│ JavaParser          │ Java AST analysis, complexity metrics     │
│ JGraphT             │ Graph algorithms and structures           │
│ Tree-sitter (JNI)   │ Multi-language parsing                    │
└─────────────────────┴──────────────────────────────────────────┘
```

## Use Case Integration

### New Use Cases Map

```
Existing Foundation
├── UC-01: File Navigation ────┬── UC-08: Heatmap Visualization (NEW)
│                              ├── UC-10: Mini-Map Navigation (NEW)
│                              └── UC-13: Dead Code Detection (NEW)
│
├── UC-04: Symbol Search ──────┬── UC-12: State Machine Extraction (NEW)
│                              └── UC-14: Definition Peek (NEW)
│
└── UC-06: Advanced Navigation ─── UC-09: Flow Graph (NEW)
                                   UC-11: Code Slicing (NEW)
```

## Key Human Values Delivered

1. **FR.32 (Heatmap)**: Instantly identify "God Objects" without reading code
2. **FR.33 (Flow Graph)**: Trace UI button click to SQL table
3. **FR.34 (Mini-Map)**: Spatial orientation in 2000+ line legacy files
4. **FR.35 (Slicing)**: Remove cognitive noise of 90% irrelevant code
5. **FR.36 (State Machine)**: Transform complex conditionals to visual flow
6. **FR.37 (Dead Code)**: Avoid wasting time on unexecuted code
7. **FR.38-39 (Knowledge Graph)**: Complex cross-language queries
8. **FR.40 (Code Bubble)**: No "navigation whiplash"
9. **FR.41 (Breadcrumbs)**: Instant navigation between related logic

## Alignment with CodeCom Philosophy

All new requirements align with CodeCom's core mission:
✓ Reduce cognitive load
✓ Provide intelligent views
✓ Offer abstraction tools
✓ Support complexity-controlled exploration
✓ Maintain high aesthetic standards
✓ Ensure high performance (NFRs)
