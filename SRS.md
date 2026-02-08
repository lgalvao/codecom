# Software Requirements Specification (SRS) - CodeCom

**Related Documentation**: See `STATUS.md` for current implementation status and `AGENTS.md` for AI agent guidelines.

## 1. Introduction
CodeCom is a high-performance, web-based code comprehension and visualization tool. It aims to reduce cognitive load for developers when exploring large, multi-language codebases by providing intelligent views and abstraction tools.

## 2. Supported Environments & Languages
The system MUST support syntax highlighting and basic structural awareness for the following (extensible to others):
- **Programming Languages**: Java, JavaScript, TypeScript.
- **Database/Scripting**: SQL, PL/SQL.
- **Markup & Styling**: HTML, CSS, XML, JSF (JavaServer Faces).
- **Configuration/Data**: YAML, Log Files (.log).
- **Extensibility**: The system architecture shall allow adding new language grammars without core logic changes.

## 3. Key Functional Requirements

### 3.1. Complexity-Controlled View
- **FR.1: Level of Detail (LoD) Toggle**: Users shall be able to switch between "Standard", "Simplified" (hiding implementation details), and "Architectural" (focusing on interfaces and dependencies) views.
- **FR.2: Intelligent Collapsing**: The viewer should automatically collapse or fade "boilerplate" code (e.g., imports, getters/setters in Java) unless explicitly requested.
- **FR.3: Scope Isolation**: Ability to focus on a single function or class while dimming or hiding the rest of the file content.

### 3.2. Advanced Code Viewer
- **FR.4: Syntax Highlighting**: High-accuracy highlighting across all supported languages (Section 2).
- **FR.5: Symbol Search**: Instant search for classes and methods within the project.
- **FR.6: Contextual Metadata**: Hovering over symbols should show signatures and documentation (JavaDocs/TSDocs).

### 3.3. Project Navigation
- **FR.7: Virtual File Tree**: Responsive file explorer capable of handling deep structures.
- **FR.8: Tab Management**: Persistent tab state across sessions.

### 3.4. Persistence & Project Management
- **FR.9: Project Indexing**: The system shall index local directories and store metadata (file paths, symbol maps) in a local database.
- **FR.10: User Preferences**: Persistent storage for theme selection, complexity settings, and recently opened files.

### 3.5. Code Statistics
- **FR.11: Total Line Count**: The system shall calculate and display the total number of lines in each file and across the entire project.
- **FR.12: Code Line Count (Non-Comment, Non-Blank)**: Display line counts excluding comments and blank lines for accurate code density metrics.
- **FR.13: Method Statistics**: Count and display the total number of methods/functions across files and the project.
- **FR.14: Structure Statistics**: Count and display the number of classes, records, interfaces, and packages/modules in the project.

### 3.6. Detail Level Control
- **FR.15: Full Detail View**: Display complete code with all elements (default view).
- **FR.16: No Comments Mode**: Filter view to hide all comment lines while preserving code structure.
- **FR.17: Signatures Only Mode**: Display only method and class signatures, hiding implementation details.
- **FR.18: Abbreviated Parameter Types**: Show method parameters with shortened type names (e.g., "String" instead of "java.lang.String").
- **FR.19: No Parameter Types**: Display method signatures with parameter names only, omitting type information.
- **FR.20: No Parameters Mode**: Show method signatures without any parameter details.
- **FR.21: Public Members Only**: Filter to display only public methods, classes, and interfaces.
- **FR.22: Hide Imports**: Option to collapse or hide import statements to reduce visual clutter.

### 3.7. Advanced Navigation
- **FR.23: Package Navigation**: Provide next/previous navigation controls to move between files within the same package/directory.
- **FR.24: Control-Click Navigation**: Enable control/command-click on symbols to navigate to their definitions.
- **FR.25: Click Navigation Mode**: Toggle mode where regular clicks (without modifier keys) navigate to symbol definitions.
- **FR.26: Caller List**: Display a list of all methods/functions that call the currently selected method.
- **FR.27: Caller Statistics**: Show statistics about callers, including call frequency and caller locations.
- **FR.28: Test References**: Identify and list all test files that reference the current class or method.
- **FR.29: Cross-Reference Navigation**: Navigate bidirectionally between callers and callees in the codebase.

### 3.8. Export Functionality
- **FR.30: Multi-Format Export**: Export project code to PDF and Markdown formats with multiple complexity levels:
  - Full detail (all code with comments)
  - Medium detail (code without comments)
  - Low detail (signatures only)
  - Architectural view (public interfaces only)
- **FR.31: Project-Wide Export**: Support exporting entire projects or selected packages/files with configurable detail levels.

### 3.9. Visual Perspective & Code Quality Visualization
- **FR.32: Complexity Heatmap (Lava Lamp)**: The system shall provide a project-wide heatmap overlay on the file tree, highlighting files with high cyclomatic complexity or frequent change history in warmer colors (red/orange), and stable, simple files in cooler colors (green/blue).
- **FR.33: Interactive Architecture Flow Graph**: An interactive 2D node-graph visualization showing the full request lifecycle from frontend to backend, including:
  - Vue Components → TypeScript Services → Spring Controllers → Service Layer → Repositories → Database Tables
  - Visual representation of dependency injection (@Autowired), API calls (HTTP requests), and database queries
  - Ability to trace execution flow from UI interactions to data persistence
- **FR.34: Code Structure Mini-Map**: A vertical scrollbar-adjacent visualization (DNA strip) showing the file's structural layout using color-coded blocks:
  - Green blocks: Public methods and classes
  - Blue blocks: Private/protected members
  - Red blocks: Error handling or exception-related code
  - Provides spatial orientation in large files (>2000 lines)

### 3.10. Advanced Structural Analysis & Code Intelligence
- **FR.35: Feature-Based Code Slicing**: Allow users to define logical "slices" or feature domains (e.g., "User Management", "Payment Processing"), then filter the file tree to show only related classes, interfaces, and templates while dimming unrelated code.
- **FR.36: State Machine Extraction**: For Java Enums or TypeScript Union types used as state variables, automatically generate visual state transition diagrams by analyzing switch statements and conditional blocks that modify those variables.
- **FR.37: Dead Code Detection & Visualization**: Methods or variables with zero internal callers (within the indexed project scope) shall be displayed with reduced opacity (40% transparency or "ghost" mode) to indicate potential dead code.

### 3.11. Cross-Language Knowledge Graph
- **FR.38: Relationship Graph Database**: The H2 database shall store a knowledge graph using an edge-list format with the following relationship types:
  - CALLS: Method/function invocation relationships
  - INHERITS: Class inheritance and interface implementation
  - INJECTS: Dependency injection relationships (@Autowired, constructor injection)
  - MAPS_TO_URL: REST endpoint mappings from controllers to frontend service calls
- **FR.39: Cross-Language Query Support**: Enable complex queries across language boundaries, such as "Show all Vue components that eventually trigger a write to the ORDERS table" or "Find all Spring services called by the UserManagement component."

### 3.12. Enhanced Interaction Model
- **FR.40: Definition Peek (Code Bubble)**: When hovering over a symbol, display a small overlay window showing the first 10 lines of the implementation, maintaining context without full navigation.
- **FR.41: Interactive Breadcrumb Navigation**: Breadcrumbs shall be clickable dropdowns showing sibling methods/classes at every hierarchy level, enabling quick navigation between related logic within the same package or module.

## 4. Non-Functional Requirements

### 4.1. Performance Requirements
- **NFR.1: Rendering Performance**: Large files (>2000 lines) must render within 200ms without blocking the UI thread.
- **NFR.2: Graph Rendering**: Interactive flow graphs (FR.33) with up to 100 nodes must render within 500ms and remain interactive at 60 FPS during pan/zoom operations.
- **NFR.3: Heatmap Calculation**: Complexity heatmap (FR.32) must be calculated and displayed within 2 seconds for projects containing up to 1,000 files.
- **NFR.4: Knowledge Graph Queries**: Cross-language queries (FR.39) must return results within 1 second for typical project sizes (<10,000 indexed symbols).

### 4.2. UI/UX Requirements
- **NFR.5: Aesthetics**: Modern interface with high contrast. Support for **Light** and **Dark** themes.
- **NFR.6: Responsiveness**: Layout adjusts to different screen sizes without losing core utility.
- **NFR.7: Visual Consistency**: All visualizations (heatmaps, graphs, mini-maps) shall follow the active theme and maintain consistent color schemes.

### 4.3. Scalability Requirements
- **NFR.8: Large Codebase Support**: System shall handle projects with up to 10,000 files and 100,000 symbols without significant performance degradation.
- **NFR.9: Incremental Indexing**: Knowledge graph updates shall be incremental, re-indexing only changed files rather than the entire project.

## 5. Use Case Specifications

### 5.1. Actors
- **Developer**: Primary user who explores, analyzes, and comprehends code across multiple projects.
- **System**: The CodeCom application (backend + frontend).

### 5.2. Use Cases

#### UC-01: File Navigation and Viewing

**Actor**: Developer

**Preconditions**:
- A project directory has been loaded into the system.
- The file tree has been indexed and is available.

**Main Flow**:
1. Developer launches CodeCom application.
2. System displays the virtual file tree for the loaded project.
3. Developer browses the file tree and selects a file.
4. System retrieves file content from the backend.
5. System applies syntax highlighting based on file extension.
6. System displays the file in the code viewer with current detail level settings.
7. Developer can scroll, search within the file, or switch to another file.

**Alternative Flows**:
- **A1**: File is too large (>2000 lines)
  - System loads file in chunks or uses virtual scrolling to maintain performance.
  - File renders within 200ms without blocking UI.
- **A2**: File type is not supported
  - System displays file as plain text without syntax highlighting.
  - System logs the unsupported file type for future extension.

**Postconditions**:
- File content is displayed with appropriate syntax highlighting.
- File tree remains interactive for further navigation.

**Non-Functional Requirements**:
- Files >2000 lines must render within 200ms (NFR.1).
- Interface maintains responsiveness across different screen sizes (NFR.3).

---

#### UC-02: Code Statistics and Analysis

**Actor**: Developer

**Preconditions**:
- At least one file is open in the viewer.
- File has been parsed successfully.

**Main Flow**:
1. Developer opens a file in the viewer.
2. System parses file structure using appropriate language parser.
3. System calculates statistics:
   - Total line count
   - Code lines (excluding comments and blanks)
   - Number of methods/functions
   - Number of classes, interfaces, records
4. System displays statistics in a dedicated panel.
5. Developer can view overall project statistics or per-file statistics.

**Alternative Flows**:
- **A1**: File cannot be parsed
  - System displays only basic statistics (total lines).
  - System shows warning that detailed statistics are unavailable.
- **A2**: Multiple files selected
  - System aggregates statistics across all selected files.
  - System displays combined totals and per-file breakdowns.

**Postconditions**:
- Statistics are displayed accurately for the current file/project.
- Statistics update when files change or new files are opened.

**Business Rules**:
- Code lines exclude comment lines, blank lines, and pure whitespace.
- Method count includes constructors and static initializers.
- Package count reflects unique package/module namespaces.

---

#### UC-03: Detail Level Control

**Actor**: Developer

**Preconditions**:
- A code file is currently displayed in the viewer.
- File has been successfully parsed with symbol information available.

**Main Flow**:
1. Developer views a file with all details visible (default state).
2. Developer opens the Detail Control Panel.
3. Developer selects desired detail level:
   - **No Comments**: Hide all comment lines
   - **Signatures Only**: Show only method/class signatures
   - **Public Members Only**: Filter to public visibility
   - **Hide Imports**: Collapse import statements
   - **Parameter Options**: Choose parameter display format
4. System applies filters to the displayed code.
5. System updates the view to show only selected elements.
6. Code remains navigable and searchable even with filters applied.

**Alternative Flows**:
- **A1**: Multiple filters selected simultaneously
  - System applies filters in logical order (visibility → structure → formatting).
  - System ensures view remains coherent and useful.
- **A2**: All code filtered out
  - System displays message indicating no code matches current filters.
  - System offers to reset filters or adjust criteria.

**Postconditions**:
- Code view reflects selected detail level.
- Filter settings persist for the current session.
- Original file content remains unchanged.

**Business Rules**:
- Filters are non-destructive and reversible.
- Multiple filters can be combined.
- Signature-only view preserves method ordering and class structure.

---

#### UC-04: Symbol Search and Navigation

**Actor**: Developer

**Preconditions**:
- Project has been indexed with symbol information.
- At least one file contains searchable symbols (classes, methods, variables).

**Main Flow**:
1. Developer activates symbol search (keyboard shortcut or UI button).
2. System displays symbol search input field.
3. Developer types search query (e.g., "UserService", "handleClick").
4. System filters symbols in real-time as developer types.
5. System displays matching symbols with context (file path, line number).
6. Developer selects a symbol from results.
7. System navigates to the symbol definition.
8. System highlights the selected symbol in the code viewer.

**Alternative Flows**:
- **A1**: No symbols match the search query
  - System displays "No results found" message.
  - System suggests similar symbols if available.
- **A2**: Control-click navigation (FR.24)
  - Developer holds Control/Command and clicks on a symbol.
  - System navigates directly to symbol definition without search.
- **A3**: Click navigation mode enabled (FR.25)
  - Developer toggles click navigation mode.
  - Regular clicks on symbols navigate to definitions.
  - No modifier key required.

**Postconditions**:
- Developer is viewing the definition of the selected symbol.
- Search history is maintained for quick re-access.
- Previous view can be restored via back navigation.

**Performance Requirements**:
- Search results must update within 50ms of keystroke.
- Symbol index must be built within 5 seconds for typical projects (<10,000 files).

---

#### UC-05: Tab Management and Multi-File Workflow

**Actor**: Developer

**Preconditions**:
- CodeCom application is running.
- Project has been loaded.

**Main Flow**:
1. Developer opens first file in the viewer.
2. System creates a new tab for the file.
3. Developer opens additional files.
4. System creates new tabs for each file.
5. Developer can:
   - Switch between tabs by clicking tab headers.
   - Close tabs individually via close button.
   - Reorder tabs by dragging.
6. System maintains tab state (scroll position, filters, cursor location).
7. Developer closes application.
8. System persists tab state to local storage.
9. Developer reopens application.
10. System restores previously open tabs.

**Alternative Flows**:
- **A1**: Maximum tabs reached (configurable limit)
  - System displays warning about too many open tabs.
  - System offers to close least recently used tabs.
- **A2**: Tab reordering
  - Developer drags tab to new position.
  - System updates tab order and persists preference.
- **A3**: Split view requested
  - Developer requests side-by-side view of two tabs.
  - System displays two panes with independent scrolling.

**Postconditions**:
- All open tabs are accessible and maintain their state.
- Tab configuration persists across sessions.
- Each tab independently maintains filters, scroll position, and selections.

---

#### UC-06: Advanced Navigation and Cross-References

**Actor**: Developer

**Preconditions**:
- Project has been fully indexed with call graph information.
- Developer is viewing a method or class.

**Main Flow**:
1. Developer selects a method in the code viewer.
2. Developer requests caller information.
3. System analyzes call graph and identifies all callers.
4. System displays caller list with:
   - Caller method name and containing class
   - File path and line number
   - Call frequency (number of call sites)
5. Developer selects a caller from the list.
6. System navigates to the caller location.
7. System highlights the call site.
8. Developer can navigate back to original method or continue to other callers.

**Alternative Flows**:
- **A1**: Package navigation (FR.23)
  - Developer uses next/previous buttons.
  - System navigates to next/previous file in the same package.
  - System maintains alphabetical or custom ordering.
- **A2**: Test reference tracking (FR.28)
  - Developer requests test references for current class.
  - System identifies test files that reference the class.
  - System displays test list with coverage information.
- **A3**: No callers found
  - System displays message indicating method is not called.
  - System suggests that method might be dead code or entry point.

**Postconditions**:
- Developer understands the usage context of the selected method/class.
- Navigation history is maintained for back/forward traversal.
- Call graph data is cached for performance.

**Performance Requirements**:
- Caller list must be generated within 500ms for methods with <100 callers.
- Cross-reference navigation must complete within 100ms.

---

#### UC-07: Export Functionality

**Actor**: Developer

**Preconditions**:
- Project or selected files are open in the viewer.
- Export functionality is available (FR.30-31).

**Main Flow**:
1. Developer selects export option from menu.
2. System displays export configuration dialog.
3. Developer configures export:
   - Format: PDF or Markdown
   - Scope: Current file, package, or entire project
   - Detail level: Full, Medium, Low, or Architectural
4. Developer confirms export settings.
5. System processes files according to selected detail level:
   - **Full**: All code with comments
   - **Medium**: Code without comments
   - **Low**: Signatures only
   - **Architectural**: Public interfaces only
6. System generates export file.
7. System prompts developer to save or download the file.

**Alternative Flows**:
- **A1**: Export scope is too large
  - System warns about large export size.
  - System offers to split export into multiple files.
- **A2**: Custom detail level combinations
  - Developer creates custom export profile.
  - System saves profile for future reuse.

**Postconditions**:
- Export file is generated with selected detail level.
- Export retains code structure and syntax highlighting (for PDF).
- Export is saved to developer's chosen location.

**Quality Requirements**:
- Exported PDF must preserve syntax highlighting and formatting.
- Exported Markdown must be readable in standard viewers.
- Export process must not block the UI.

---

#### UC-08: Complexity Heatmap Visualization

**Actor**: Developer

**Preconditions**:
- Project has been indexed with code metrics.
- File tree is displayed in the viewer.

**Main Flow**:
1. Developer opens a project in CodeCom.
2. System calculates cyclomatic complexity for all indexed files.
3. System analyzes Git history (if available) for change frequency.
4. System generates heatmap overlay on file tree:
   - High complexity/frequent changes: Red/Orange highlighting
   - Medium complexity: Yellow highlighting
   - Low complexity/stable files: Green/Blue highlighting
5. Developer can hover over colored files to see detailed metrics.
6. Developer identifies high-risk areas at a glance.
7. Developer can click on highlighted files to investigate further.

**Alternative Flows**:
- **A1**: Git history unavailable
  - System calculates heatmap based solely on cyclomatic complexity.
  - System displays note that change frequency data is unavailable.
- **A2**: Project too large for real-time calculation
  - System displays progress indicator during heatmap generation.
  - System caches results for subsequent views.

**Postconditions**:
- Heatmap overlay is visible on file tree.
- Developer can identify "God Objects" and high-risk files visually.
- Heatmap data is cached for performance.

**Performance Requirements**:
- Heatmap must be calculated within 2 seconds for projects with <1,000 files (NFR.3).

---

#### UC-09: Interactive Architecture Flow Visualization

**Actor**: Developer

**Preconditions**:
- Project has been fully indexed with cross-language relationships.
- Knowledge graph contains CALLS, INJECTS, and MAPS_TO_URL relationships.

**Main Flow**:
1. Developer activates architecture flow visualization.
2. System displays interactive 2D node graph showing:
   - Vue Components (frontend layer)
   - TypeScript Services (API layer)
   - Spring Controllers (backend entry points)
   - Service Layer (business logic)
   - Repositories (data access)
   - Database Tables (persistence)
3. System draws edges representing:
   - API calls from frontend to backend
   - Dependency injection (@Autowired)
   - Database queries
4. Developer selects a starting point (e.g., a UI button click).
5. System highlights the execution path through all layers.
6. Developer can pan, zoom, and interact with nodes.
7. Developer clicks on a node to view code details.

**Alternative Flows**:
- **A1**: Filter by feature/domain
  - Developer applies feature filter (e.g., "User Management").
  - System dims or hides nodes not related to that feature.
- **A2**: Export graph visualization
  - Developer requests export of current graph view.
  - System generates image or interactive HTML export.

**Postconditions**:
- Developer understands full request lifecycle from UI to database.
- Execution paths are traceable across language boundaries.
- Graph state can be saved and restored.

**Performance Requirements**:
- Graph with <100 nodes must render within 500ms (NFR.2).
- Interactions must maintain 60 FPS during pan/zoom (NFR.2).

---

#### UC-10: Code Structure Mini-Map Navigation

**Actor**: Developer

**Preconditions**:
- A code file is open in the viewer.
- File has been parsed with symbol information.

**Main Flow**:
1. Developer opens a large file (>500 lines).
2. System displays mini-map adjacent to scrollbar showing:
   - Green blocks: Public methods/classes
   - Blue blocks: Private/protected members
   - Red blocks: Error handling code
3. Developer scrolls through file.
4. System updates viewport indicator on mini-map.
5. Developer clicks on a specific block in mini-map.
6. System jumps to that code location.
7. Developer can quickly orient within large files.

**Alternative Flows**:
- **A1**: Small files (<500 lines)
  - System optionally hides mini-map to save screen space.
  - Developer can toggle mini-map visibility via settings.

**Postconditions**:
- Mini-map provides spatial awareness in large files.
- Navigation via mini-map is instantaneous.
- Mini-map colors match active theme.

**Quality Requirements**:
- Mini-map must update within 50ms during scrolling.
- Color coding must be consistent with theme (NFR.7).

---

#### UC-11: Feature-Based Code Slicing

**Actor**: Developer

**Preconditions**:
- Project has been indexed with relationship data.
- Developer wants to focus on a specific feature or domain.

**Main Flow**:
1. Developer activates "Create Slice" function.
2. System prompts for slice definition:
   - Name (e.g., "User Management")
   - Starting points (key classes, components, or packages)
3. Developer provides slice criteria.
4. System analyzes knowledge graph to identify related code:
   - Direct dependencies
   - Indirect dependencies (up to configurable depth)
   - Related test files
5. System filters file tree to show only slice-relevant files.
6. System dims or hides unrelated code (90% of codebase).
7. Developer works within focused context.
8. Developer can save slice definitions for reuse.

**Alternative Flows**:
- **A1**: Modify existing slice
  - Developer edits slice criteria.
  - System recalculates affected files.
  - System updates filtered view.
- **A2**: Multiple concurrent slices
  - Developer creates overlapping slices.
  - System allows switching between slice views.

**Postconditions**:
- File tree shows only relevant code for the feature.
- Cognitive load is reduced by hiding irrelevant code.
- Slice definitions are persisted for future sessions.

**Business Rules**:
- Slices are saved per-project in the H2 database.
- Slice definitions can be exported/imported as JSON.

---

#### UC-12: State Machine Extraction and Visualization

**Actor**: Developer

**Preconditions**:
- Project contains Java Enums or TypeScript Union types used as state variables.
- Code includes switch statements or conditionals that modify state.

**Main Flow**:
1. Developer selects a state variable (Enum or Union type).
2. Developer requests state machine extraction.
3. System analyzes code to identify:
   - All possible state values
   - State transition logic (switch/if-else blocks)
   - Valid transitions between states
4. System generates visual state transition diagram:
   - Nodes represent states
   - Edges represent valid transitions
   - Labels show transition conditions/triggers
5. Developer reviews diagram to understand state flow.
6. Developer can click on states to view related code.

**Alternative Flows**:
- **A1**: Complex state logic detected
  - System identifies ambiguous or unreachable states.
  - System highlights potential issues in the diagram.
- **A2**: Export state diagram
  - Developer exports diagram as image or Mermaid format.

**Postconditions**:
- State machine is visualized as a clear diagram.
- Developer understands valid state transitions.
- Complex conditional logic is transformed into visual flow.

**Quality Requirements**:
- Diagram generation must complete within 3 seconds for enums with <20 states.
- Diagram must be interactive (clickable states).

---

#### UC-13: Dead Code Detection and Ghost Mode

**Actor**: Developer

**Preconditions**:
- Project has been fully indexed with call graph data.
- Symbol usage analysis is complete.

**Main Flow**:
1. System analyzes all methods and variables for internal callers.
2. System identifies symbols with zero callers within the project scope.
3. System displays dead code candidates with 40% opacity ("ghost mode").
4. Developer reviews ghosted code.
5. Developer can:
   - Verify it's truly unused
   - Check for external callers (libraries, reflection)
   - Mark as intentional (API endpoints, public interfaces)
   - Remove dead code safely
6. System updates ghost status as code changes.

**Alternative Flows**:
- **A1**: False positive detection
  - Developer marks method as "intentionally unused" (e.g., public API).
  - System excludes marked methods from ghost mode.
  - System persists exclusions in project configuration.
- **A2**: Entry points and reflection
  - System identifies potential entry points (main methods, @RestController).
  - System treats these as having external callers.

**Postconditions**:
- Dead code is visually distinguished from active code.
- Developer can confidently identify removal candidates.
- Ghost mode settings persist across sessions.

**Business Rules**:
- Public methods in library projects are never ghosted by default.
- Methods annotated as entry points (@RestController, @Scheduled) are excluded.
- Ghost mode can be toggled on/off in settings.

---

#### UC-14: Enhanced Definition Peek (Code Bubble)

**Actor**: Developer

**Preconditions**:
- Developer is viewing code with symbol information available.
- Hover tooltips are enabled (existing FR.6).

**Main Flow**:
1. Developer hovers cursor over a symbol (method, class, variable).
2. System displays enhanced tooltip showing:
   - Symbol signature
   - First 10 lines of implementation
   - File path and line number
   - Brief documentation (if available)
3. Developer can:
   - Read implementation without navigating away
   - Click to navigate to full definition
   - Dismiss tooltip by moving cursor
4. Developer maintains context in current file.

**Alternative Flows**:
- **A1**: Implementation too long
  - System shows first 10 lines with "..." indicator.
  - System includes "View Full Definition" link.
- **A2**: External symbol (library)
  - System shows signature and documentation only.
  - System indicates symbol is external.

**Postconditions**:
- Developer gains context without "navigation whiplash."
- Current file and scroll position remain unchanged.
- Quick understanding of referenced code is achieved.

**Performance Requirements**:
- Tooltip must appear within 100ms of hover.
- Code preview must be syntax-highlighted.

---

### 5.3. Use Case Dependencies

```
UC-01 (File Navigation) ──┬──> UC-02 (Statistics)
                          │
                          ├──> UC-03 (Detail Control)
                          │
                          ├──> UC-04 (Symbol Search)
                          │     │
                          │     └──> UC-06 (Advanced Navigation)
                          │
                          ├──> UC-08 (Heatmap)
                          │
                          ├──> UC-10 (Mini-Map)
                          │
                          └──> UC-13 (Dead Code Detection)

UC-05 (Tab Management) ──────────────> UC-01 (File Navigation)

UC-07 (Export) ──────────────────────> UC-03 (Detail Control)

UC-09 (Flow Graph) ───────────┬──────> UC-11 (Code Slicing)
                              │
                              └──────> UC-06 (Advanced Navigation)

UC-11 (Code Slicing) ─────────────────> UC-01 (File Navigation)

UC-12 (State Machine) ────────────────> UC-04 (Symbol Search)

UC-14 (Definition Peek) ──────────────> UC-06 (Advanced Navigation)
```

All use cases depend on the system being initialized with a valid project directory.

## 6. Technical Constraints

### 6.1. Core Technology Stack
- Built using **Vue 3** (Composition API) and **Vite**.
- Backend: **Spring Boot 4.0.0** (Java-based REST API).
- Database: **H2 (File-based)** – Chosen for its seamless Spring Boot integration and built-in inspection tools.
- UI Library: **BootstrapVueNext** (to be used for standard components).
- Theme Management: Integrated theme switch (Light/Dark).

### 6.2. Visualization & Analysis Libraries
The following libraries are recommended for implementing advanced visualization requirements:

| Library | Purpose | Requirements Supported |
|---------|---------|----------------------|
| **D3.js** | Interactive data-driven visualizations | FR.33 (Flow Graph), FR.36 (State Diagrams) |
| **Cytoscape.js** | Graph theory and network visualization | FR.33 (Architecture Flow Graph) |
| **Force-Graph** | 3D/2D force-directed graphs | FR.33 (Interactive node layouts) |
| **Shiki** (existing) | Syntax highlighting in tooltips | FR.40 (Definition Peek) |

### 6.3. Backend Analysis Tools
For advanced code analysis and graph processing on the Java backend:

| Library | Purpose | Requirements Supported |
|---------|---------|----------------------|
| **JavaParser** (recommended) | Java code parsing and AST analysis | FR.32 (Complexity metrics), FR.36 (State extraction) |
| **JGraphT** | Graph algorithms and structures | FR.38-39 (Knowledge Graph), FR.35 (Code slicing) |
| **Tree-sitter** (via JNI) | Multi-language parsing | FR.32 (TypeScript/JavaScript complexity) |

### 6.4. Database Extensions
- **H2 Database**: Continue using file-based H2 for primary storage.
- **Edge-List Schema**: Implement knowledge graph using edge-list format for relationship storage (FR.38).
- **Future Consideration**: H2 GIS Extension for spatial indexing if project scales to enterprise size (>100,000 symbols).

### 6.5. Performance Optimization
- **Incremental Parsing**: Update only changed files rather than re-parsing entire project.
- **Caching Strategy**: Cache heatmap data, complexity metrics, and graph structures.
- **Lazy Loading**: Load visualization data on-demand to maintain responsive UI.
- **Web Workers**: Offload heavy computations (complexity calculation, graph analysis) to background threads.

## 7. Implementation Priorities & Phases

The new visualization and analysis requirements are organized into implementation phases based on complexity and dependencies:

### Phase 1: Foundation (High Priority)
These requirements build on existing functionality and provide immediate value:
- **FR.38-39**: Cross-Language Knowledge Graph - Extends existing symbol indexing
- **FR.40**: Definition Peek - Enhances existing hover tooltips (FR.6)
- **FR.41**: Interactive Breadcrumb Navigation - Extends existing navigation
- **FR.37**: Dead Code Detection - Uses existing call graph analysis (FR.26-27)

### Phase 2: Visualization Core (Medium Priority)
Visual enhancements that improve code comprehension:
- **FR.32**: Complexity Heatmap - Requires complexity analysis implementation
- **FR.34**: Code Structure Mini-Map - Requires parser integration for symbol extraction
- **FR.35**: Feature-Based Code Slicing - Builds on Knowledge Graph (FR.38)

### Phase 3: Advanced Analytics (Lower Priority)
Complex features requiring significant analysis infrastructure:
- **FR.33**: Interactive Architecture Flow Graph - Requires D3.js/Cytoscape.js integration
- **FR.36**: State Machine Extraction - Requires advanced AST analysis

### Phase 4: Future Enhancements
Optional features for enterprise-scale deployments:
- GIS Extension for spatial indexing (mentioned in Section 6.4)
- 3D visualization options for large-scale architecture graphs
- Real-time collaboration features for shared code exploration

## 8. Acceptance Criteria

For each new functional requirement, the following acceptance criteria apply:

### Visualization Requirements (FR.32-34, FR.40)
- **Accuracy**: Visualizations must accurately reflect the underlying code structure and metrics.
- **Performance**: Must meet or exceed performance requirements specified in NFR.2-4.
- **Theme Support**: All visualizations must support both Light and Dark themes (NFR.7).
- **Interactivity**: User interactions (hover, click, zoom) must be responsive (<100ms response time).

### Analysis Requirements (FR.35-37)
- **Precision**: Analysis must correctly identify relationships across language boundaries.
- **Recall**: Analysis should identify at least 95% of valid relationships (may miss dynamic/reflection-based calls).
- **False Positives**: Dead code detection (FR.37) should have <5% false positive rate for typical codebases.

### Knowledge Graph Requirements (FR.38-39)
- **Data Integrity**: Relationship data must remain consistent during incremental updates.
- **Query Performance**: Cross-language queries must return results within 1 second (NFR.4).
- **Scalability**: Graph structure must support projects with up to 100,000 symbols (NFR.8).
