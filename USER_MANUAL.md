# CodeCom User Manual

**Version 1.0** | **February 2026**

---

## Table of Contents

1. [Introduction](#1-introduction)
   - [What is CodeCom?](#what-is-codecom)
   - [Key Features](#key-features)
   - [Supported Languages](#supported-languages)
2. [Getting Started](#2-getting-started)
   - [System Requirements](#system-requirements)
   - [Installation](#installation)
   - [First Launch](#first-launch)
3. [User Interface Overview](#3-user-interface-overview)
   - [Main Layout](#main-layout)
   - [Navigation Bar](#navigation-bar)
   - [File Explorer](#file-explorer)
   - [Code Viewer](#code-viewer)
4. [Core Navigation Features](#4-core-navigation-features)
   - [File Explorer](#41-file-explorer)
   - [Tab Management](#42-tab-management)
   - [Symbol Search](#43-symbol-search)
   - [Breadcrumb Navigation](#44-breadcrumb-navigation)
   - [Package Navigation](#45-package-navigation)
5. [Code Viewing Controls](#5-code-viewing-controls)
   - [Level of Detail (LoD)](#51-level-of-detail-lod)
   - [Detail Control Panel](#52-detail-control-panel)
   - [Scope Isolation](#53-scope-isolation)
   - [Code Minimap](#54-code-minimap)
   - [Theme Switching](#55-theme-switching)
6. [Code Analysis Features](#6-code-analysis-features)
   - [Code Statistics](#61-code-statistics)
   - [Complexity Heatmap](#62-complexity-heatmap)
   - [Dead Code Detection](#63-dead-code-detection)
   - [Contextual Metadata](#64-contextual-metadata)
7. [Advanced Visualizations](#7-advanced-visualizations)
   - [Architecture Flow Graph](#71-architecture-flow-graph)
   - [State Machine Extraction](#72-state-machine-extraction)
   - [Knowledge Graph](#73-knowledge-graph)
   - [Feature-Based Code Slicing](#74-feature-based-code-slicing)
8. [Navigation & Analysis Tools](#8-navigation--analysis-tools)
   - [Control-Click Navigation](#81-control-click-navigation)
   - [Caller List & Analysis](#82-caller-list--analysis)
   - [Test References](#83-test-references)
   - [Cross-Reference Navigation](#84-cross-reference-navigation)
9. [Export Functionality](#9-export-functionality)
   - [Export Formats](#91-export-formats)
   - [Detail Levels](#92-detail-levels)
   - [Project-Wide Export](#93-project-wide-export)
10. [Keyboard Shortcuts](#10-keyboard-shortcuts)
11. [Troubleshooting](#11-troubleshooting)
12. [Frequently Asked Questions](#12-frequently-asked-questions)

---

## 1. Introduction

### What is CodeCom?

**CodeCom** is a high-performance, web-based code comprehension and visualization tool designed to reduce cognitive load when exploring large, multi-language codebases. It provides intelligent views, smart filtering, and advanced visualizations to help developers understand complex software systems quickly and efficiently.

Unlike traditional IDEs that show raw code, CodeCom focuses on:
- **Reducing noise**: Hide boilerplate, comments, and implementation details
- **Visual insights**: Complexity heatmaps, architecture flow graphs, and mini-maps
- **Smart navigation**: Jump to definitions, find callers, and trace execution paths
- **Cross-language support**: Understand relationships between frontend and backend code

### Key Features

- 🔍 **Intelligent Code Filtering** - Hide comments, imports, parameters, and implementation details
- 📊 **Complexity Visualization** - Color-coded heatmap showing file complexity
- 🌐 **Architecture Flow Graph** - Interactive visualization of request lifecycle from frontend to database
- 🎯 **Scope Isolation** - Focus on specific methods/classes while dimming surrounding code
- 🔎 **Symbol Search** - Instant project-wide search for classes and methods
- 📈 **Code Statistics** - Line counts, method counts, and structure analysis
- 🎨 **State Machine Diagrams** - Automatic extraction of state transitions from enums
- 🧩 **Feature Slicing** - Filter codebase by logical feature domains
- 📚 **Knowledge Graph** - Cross-language relationship database (CALLS, INHERITS, INJECTS)
- 📤 **Multi-Format Export** - Export to PDF, Markdown, or HTML with configurable detail levels
- 🌓 **Light & Dark Themes** - Modern UI with full theme support

### Supported Languages

CodeCom provides syntax highlighting and structural awareness for:

**Programming Languages:**
- Java
- JavaScript
- TypeScript

**Database/Scripting:**
- SQL
- PL/SQL

**Markup & Styling:**
- HTML
- CSS
- XML
- JSF (JavaServer Faces)

**Configuration:**
- YAML
- Log Files (.log)

The architecture is extensible to support additional language grammars without modifying core logic.

---

## 2. Getting Started

### System Requirements

**Backend Requirements:**
- Java 25 or higher
- Gradle 8.x

**Frontend Requirements:**
- Node.js 18.x or higher
- npm 9.x or higher
- Modern web browser (Chrome, Firefox, Edge, or Safari)

**Hardware Recommendations:**
- 4GB RAM minimum (8GB recommended for large projects)
- 1GB free disk space

### Installation

#### Option 1: Quick Start (Both Frontend & Backend)

```bash
# Clone the repository
git clone https://github.com/lgalvao/codecom.git
cd codecom

# Run the development script (starts both backend and frontend)
./dev.sh
```

The application will be available at `http://localhost:5173` (frontend) with backend running on `http://localhost:8080`.

#### Option 2: Separate Installation

**Backend:**
```bash
cd backend
./gradlew bootRun
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### First Launch

When you first launch CodeCom, you'll see the welcome screen:

![Welcome Screen - Light Theme](frontend/test-results/screenshots/01-welcome-light.png)

**Figure 1: Welcome screen in light theme**

![Welcome Screen - Dark Theme](frontend/test-results/screenshots/02-welcome-dark.png)

**Figure 2: Welcome screen in dark theme**

The welcome screen provides quick access to:
- Getting started documentation
- Recent projects
- Quick actions for opening or creating projects

---

## 3. User Interface Overview

### Main Layout

The CodeCom interface consists of four primary areas:

![Main Application Layout](frontend/test-results/screenshots/03-main-layout.png)

**Figure 3: Main application layout**

1. **Navigation Bar** (top) - Controls, search, and settings
2. **File Explorer** (left) - Virtual file tree for browsing project files
3. **Code Viewer** (center) - Main code display area with tabs
4. **Code Minimap** (right) - Visual overview of file structure

### Navigation Bar

The navigation bar contains all primary controls:

![Navigation Bar](frontend/test-results/screenshots/18-navbar-complete.png)

**Figure 4: Complete navigation bar with all controls**

![Application Title](frontend/test-results/screenshots/19-app-title.png)

**Figure 5: Application title and branding**

**From left to right:**
- **CodeCom Logo** - Application branding
- **Search Button** (🔍) - Open symbol search dialog
- **Statistics Button** (📊) - View code statistics
- **Detail Button** (⚙️) - Open detail control panel
- **Export Button** (📤) - Export code in various formats
- **Heatmap Button** (🌡️) - View complexity heatmap
- **Flow Graph Button** (⚡) - Open architecture flow graph
- **State Machine Button** (🔄) - Extract state machine diagrams
- **Feature Slice Button** (🧩) - Filter by feature domains
- **Knowledge Graph Button** (🕸️) - Open relationship graph
- **Level of Detail** (dropdown) - Select view complexity
- **Theme Toggle** (🌓) - Switch between light/dark themes

### File Explorer

The file explorer provides a tree view of your project:

![File Explorer](frontend/test-results/screenshots/09-file-explorer-expanded.png)

**Figure 6: File explorer with expanded folders**

**Features:**
- **Hierarchical view** - Folders can be expanded/collapsed
- **Color coding** - Different icons for files and folders
- **Complexity indicators** - When heatmap is enabled, files are color-coded
- **Search filtering** - Filter visible files
- **Context menu** - Right-click for file operations

### Code Viewer

The central area displays opened files with:
- **Syntax highlighting** - Language-aware color coding
- **Line numbers** - Easy reference
- **Tab navigation** - Multiple files can be open simultaneously
- **Breadcrumb trail** - Shows current file location
- **Hover tooltips** - Metadata on symbols

---

## 4. Core Navigation Features

### 4.1 File Explorer

The file explorer is your primary navigation tool for browsing the project structure.

**Opening Files:**
1. Navigate the tree structure by clicking on folder icons to expand/collapse
2. Click on any file name to open it in the code viewer
3. The file will open in a new tab or focus an existing tab if already open

**Features:**
- **Deep folder support** - Handles complex nested structures
- **Virtual scrolling** - Efficient rendering of large file trees
- **Search filtering** - Filter files by name
- **Persistent state** - Remembers which folders are expanded

### 4.2 Tab Management

CodeCom provides robust tab management for working with multiple files:

![Multiple Tabs](frontend/test-results/screenshots/34-multiple-tabs.png)

**Figure 7: Multiple files opened in tabs**

**Features:**
- **Persistent tabs** - Tab state is saved across sessions
- **Tab switching** - Click on tabs to switch between files
- **Close tabs** - Click the X button to close individual tabs
- **Reordering** - Drag tabs to rearrange order
- **Tab overflow** - Scrollable tab bar for many open files

**Keyboard Navigation:**
- `Ctrl + Tab` - Next tab
- `Ctrl + Shift + Tab` - Previous tab
- `Ctrl + W` - Close current tab

### 4.3 Symbol Search

The symbol search feature enables instant project-wide search for classes, methods, and functions.

**Opening Symbol Search:**

![Toolbar Controls](frontend/test-results/screenshots/04-toolbar-controls.png)

**Figure 8: Toolbar with search button highlighted**

Click the **Search** button (🔍) in the navigation bar, or press `Ctrl + Shift + F`.

![Symbol Search Dialog](frontend/test-results/screenshots/05-symbol-search-dialog.png)

**Figure 9: Symbol search dialog opened**

**Using Symbol Search:**

![Symbol Search with Query](frontend/test-results/screenshots/06-symbol-search-with-query.png)

**Figure 10: Symbol search with query "Service"**

1. Type your search query (e.g., "Service", "UserController")
2. Results appear instantly as you type
3. Results show:
   - Symbol name
   - Symbol type (class, method, interface, etc.)
   - File path
   - Line number
4. Click on any result to navigate to that symbol

**Search Tips:**
- Search is **case-insensitive**
- Supports **partial matches** (searching "User" finds "UserService", "UserController", etc.)
- **Fast indexing** - Searches are nearly instantaneous
- Shows symbols from **all supported languages**

### 4.4 Breadcrumb Navigation

Breadcrumbs show your current location in the project hierarchy and provide quick navigation to sibling files:

![Breadcrumb Navigation](frontend/test-results/screenshots/31-breadcrumb-navigation.png)

**Figure 11: Interactive breadcrumb navigation**

**Features:**
- **Path display** - Shows full path from project root to current file
- **Clickable segments** - Click any segment to navigate up the hierarchy
- **Dropdown menus** - Each breadcrumb shows siblings at that level
- **Quick navigation** - Jump to related files in the same package/directory

**Example:**
```
Project > src > main > java > com > codecom > controller > UserController.java
```

Clicking on "controller" shows a dropdown with all files in that directory.

### 4.5 Package Navigation

Navigate between files in the same package/directory using next/previous controls:

**Usage:**
- **Next File** - `Alt + →` or click the next button
- **Previous File** - `Alt + ←` or click the previous button

This is particularly useful when reviewing related files in sequence, such as:
- All controllers in a package
- All models in a module
- All components in a directory

---

## 5. Code Viewing Controls

### 5.1 Level of Detail (LoD)

The Level of Detail selector controls the complexity of code displayed:

![Level of Detail Selector](frontend/test-results/screenshots/07-lod-selector.png)

**Figure 12: Level of Detail selector in navigation bar**

![LoD Dropdown](frontend/test-results/screenshots/30-lod-dropdown.png)

**Figure 13: Level of Detail dropdown expanded**

**Three Levels Available:**

1. **Standard View** (Full Detail)
   - Shows complete code with all elements
   - Includes implementation details, comments, and imports
   - Default view for comprehensive code review

2. **Simplified View**
   - Hides implementation details
   - Shows method signatures but collapses method bodies
   - Reduces boilerplate code
   - Ideal for understanding class structure and APIs

3. **Architectural View**
   - Shows only public interfaces and dependencies
   - Focuses on the public API surface
   - Hides private implementation
   - Perfect for architecture documentation

**When to Use Each Level:**
- **Standard**: Debugging, detailed code review, understanding implementation
- **Simplified**: Quick overview, API exploration, method discovery
- **Architectural**: System design, documentation, public API review

### 5.2 Detail Control Panel

The detail control panel provides 8 independent filters for fine-grained control over what code elements are displayed:

![Detail Button](frontend/test-results/screenshots/11-detail-button.png)

**Figure 14: Detail button in navigation bar**

![Detail Controls Panel](frontend/test-results/screenshots/23-detail-controls-panel.png)

**Figure 15: Detail controls panel opened**

**Available Filters:**

1. **Hide Comments** (FR.16)
   - Removes all comment lines
   - Preserves code structure
   - Useful for focusing on executable code

2. **Hide Imports** (FR.22)
   - Collapses or hides import statements
   - Reduces visual clutter at the top of files
   - Can still be expanded when needed

3. **Signatures Only** (FR.17)
   - Shows method and class signatures
   - Hides implementation details
   - Similar to header files in C/C++

4. **Abbreviated Types** (FR.18)
   - Shortens type names (e.g., "String" instead of "java.lang.String")
   - Reduces horizontal scrolling
   - Maintains readability

5. **No Parameter Types** (FR.19)
   - Shows parameter names only
   - Omits type information
   - Useful for quick method signature scanning

6. **No Parameters** (FR.20)
   - Hides all parameter details
   - Shows only method names
   - Maximum simplification of signatures

7. **Public Only** (FR.21)
   - Filters to display only public members
   - Hides private/protected/package-private elements
   - Focus on the public API

8. **Full Detail** (FR.15)
   - Disables all filters
   - Shows complete code
   - Default state

**Usage Tips:**
- **Combine filters** - Multiple filters can be enabled simultaneously
- **Context-dependent** - Different filters are useful for different tasks
- **Quick toggle** - Filters apply instantly without page reload
- **Persistent** - Filter preferences are saved in user settings

### 5.3 Scope Isolation

Scope isolation allows you to focus on a specific method or class while dimming the surrounding code:

![Scope Isolation](frontend/test-results/screenshots/35-scope-isolation.png)

**Figure 16: Scope isolation focusing on a single method**

**Features:**
- **Click to isolate** - Click on any method/class to focus on it
- **Visual dimming** - Surrounding code is displayed with reduced opacity (40%)
- **Context preservation** - Dimmed code remains visible for reference
- **Easy exit** - Click outside the focused area to restore full view

**Use Cases:**
- **Code review** - Focus reviewers on specific changes
- **Debugging** - Isolate problematic methods
- **Documentation** - Highlight specific functionality
- **Teaching** - Direct attention to particular code sections

**How to Use:**
1. Open a file in the code viewer
2. Click on a method name, class name, or code block
3. The selected scope becomes highlighted while other code dims
4. Click the background or press `Esc` to restore normal view

### 5.4 Code Minimap

The code minimap provides a bird's-eye view of file structure:

![Code Minimap](frontend/test-results/screenshots/33-code-minimap.png)

**Figure 17: Code minimap showing file structure**

**Visual Encoding:**
- **🟢 Green blocks** - Public methods and classes
- **🔵 Blue blocks** - Private/protected members
- **🔴 Red blocks** - Error handling or exception-related code
- **Gray blocks** - Comments and whitespace

**Features:**
- **Spatial orientation** - See where you are in large files
- **Quick navigation** - Click on the minimap to jump to that section
- **Structure overview** - Understand file organization at a glance
- **Scroll indicator** - Shows current viewport position

**Particularly Useful For:**
- Files over 500 lines
- Understanding code structure before diving in
- Finding specific methods in long files
- Identifying areas with heavy error handling

### 5.5 Theme Switching

CodeCom supports both light and dark themes:

**Switching Themes:**

Click the **Theme Toggle** button (🌓) in the top-right corner of the navigation bar.

![Theme Toggled](frontend/test-results/screenshots/08-theme-toggled.png)

**Figure 18: Application with dark theme active**

**Theme Features:**
- **Instant switching** - No page reload required
- **Persistent preference** - Theme choice is saved across sessions
- **Consistent styling** - All visualizations adapt to the active theme
- **High contrast** - Both themes designed for readability
- **Reduced eye strain** - Dark theme for low-light environments

**Color Schemes:**
- **Light Theme** - Clean, bright interface for well-lit environments
- **Dark Theme** - Reduced blue light, easier on eyes in dim lighting

All screenshots in this manual show both light and dark theme versions where applicable.

---

## 6. Code Analysis Features

### 6.1 Code Statistics

View comprehensive statistics about your codebase:

![Statistics Button](frontend/test-results/screenshots/10-stats-button.png)

**Figure 19: Statistics button in navigation bar**

![Statistics Modal](frontend/test-results/screenshots/22-statistics-modal.png)

**Figure 20: Code statistics modal**

**Metrics Provided:**

**Line Counts:**
- **Total Lines** (FR.11) - All lines in the file/project
- **Code Lines** (FR.12) - Non-comment, non-blank lines
- **Comment Lines** - Documentation and comments
- **Blank Lines** - Empty lines
- **Code Density** - Ratio of code to total lines

**Structure Counts:**
- **Method Count** (FR.13) - Total methods/functions
- **Class Count** (FR.14) - Total classes
- **Interface Count** (FR.14) - Total interfaces
- **Record Count** (FR.14) - Total record types (Java 14+)
- **Package Count** (FR.14) - Total packages/modules

**Additional Metrics:**
- **Average Method Length** - Lines per method
- **Complexity Indicators** - Cyclomatic complexity scores
- **File Size** - Disk size in KB/MB

**Viewing Statistics:**
1. Click the **Statistics** button (📊) in the navigation bar
2. Statistics are shown for:
   - **Current File** - When a file is open
   - **Current Package** - When a folder is selected
   - **Entire Project** - When viewing the root
3. Export statistics as CSV or JSON for reporting

**Use Cases:**
- **Code review** - Identify overly complex files
- **Documentation** - Generate project metrics
- **Refactoring** - Find candidates for splitting
- **Project health** - Track code growth over time

### 6.2 Complexity Heatmap

The complexity heatmap visualizes code complexity across your project using a color-coded overlay:

![Heatmap Button](frontend/test-results/screenshots/13-heatmap-button.png)

**Figure 21: Complexity heatmap button in navigation bar**

![Complexity Heatmap](frontend/test-results/screenshots/24-complexity-heatmap.png)

**Figure 22: Complexity heatmap visualization**

**Color Coding (FR.32):**
- 🟢 **Green/Blue** - Low complexity, simple files (cyclomatic complexity < 10)
- 🟡 **Yellow** - Moderate complexity (complexity 10-20)
- 🟠 **Orange** - High complexity (complexity 20-30)
- 🔴 **Red** - Very high complexity (complexity > 30)

**What is Measured:**
- **Cyclomatic Complexity** - Number of independent paths through code
- **Method Complexity** - Complexity per method
- **File Complexity** - Aggregate complexity of all methods in a file
- **Change Frequency** - How often the file is modified (optional)

**Features:**
- **Real-time calculation** - Updates as code changes
- **File tree overlay** - Colors applied directly to file explorer
- **Tooltip details** - Hover over files to see exact complexity scores
- **Filtering** - Filter file list by complexity range
- **Threshold configuration** - Customize color thresholds

**How to Use:**
1. Click the **Heatmap** button (🌡️) in the navigation bar
2. The file explorer updates with color-coded files
3. Hover over any file to see detailed complexity metrics
4. Click on high-complexity files to review and potentially refactor

**Interpretation:**
- **Green files** - Well-structured, easy to maintain
- **Yellow files** - Acceptable complexity, monitor for growth
- **Orange files** - Consider refactoring
- **Red files** - High priority for refactoring, likely hard to test and maintain

**Performance:**
- Calculates complexity for up to 1,000 files within 2 seconds (NFR.3)
- Incremental updates for modified files
- Cached results for unchanged files

### 6.3 Dead Code Detection

CodeCom automatically identifies methods with zero internal callers:

**Visual Indicators (FR.37):**
- **Ghost Mode** - Methods with no callers are displayed with 40% opacity
- **Tooltip Warning** - Hover shows "No callers found - potential dead code"
- **Statistics** - Dead code percentage shown in statistics modal

**Features:**
- **Automatic detection** - No configuration required
- **Real-time updates** - Updates as code changes
- **Scope-aware** - Only considers internal project callers
- **False positive handling** - Excludes entry points (main methods, controllers, event handlers)

**Use Cases:**
- **Code cleanup** - Identify unused methods for removal
- **Refactoring** - Find legacy code that can be deleted
- **Optimization** - Remove unnecessary code to reduce complexity

**Limitations:**
- Does not detect reflection-based calls
- External library callers are not tracked
- Entry points may be marked (but are explicitly excluded)

### 6.4 Contextual Metadata

Hovering over symbols displays rich contextual information:

**Information Shown (FR.6 & FR.40):**
- **Method Signature** - Full signature with return type and parameters
- **JavaDoc/TSDoc** - Documentation if available
- **Code Preview** - First 10 lines of implementation (Definition Peek)
- **File Location** - File path and line number
- **Caller Count** - Number of methods calling this symbol
- **Complexity** - Cyclomatic complexity score

**Definition Peek (Code Bubble):**
- Shows implementation preview without navigation
- Maintains current context
- Useful for quick reference
- Automatically formatted and syntax-highlighted

**How to Use:**
1. Hover mouse over any method name, class name, or variable
2. Wait 300ms for the tooltip to appear
3. Read the information or click to navigate to the definition

---

## 7. Advanced Visualizations

### 7.1 Architecture Flow Graph

The Architecture Flow Graph provides an interactive visualization of the complete request lifecycle from frontend to backend:

![Flow Graph Button](frontend/test-results/screenshots/14-flow-graph-button.png)

**Figure 23: Architecture flow graph button in navigation bar**

![Flow Graph](frontend/test-results/screenshots/25-flow-graph.png)

**Figure 24: Interactive architecture flow graph**

**Features (FR.33):**

**Complete Request Lifecycle:**
- Vue Components → TypeScript Services → Spring Controllers → Service Layer → Repositories → Database Tables
- Dependency injection (@Autowired)
- API calls (HTTP requests)
- Database queries

**Interactive Visualization:**
- **D3.js force-directed graph** - Smooth animations
- **Pan and zoom** - Navigate large graphs
- **Click nodes** - View details and connections
- **Search** - Highlight specific nodes
- **Layer filtering** - Focus on specific architectural layers

**Color Coding:**
- 🟢 **Green** - COMPONENT (Vue components)
- 🔵 **Blue** - SERVICE_TS (TypeScript services)
- 🟠 **Orange** - CONTROLLER (Spring controllers)
- 🟣 **Purple** - SERVICE_JAVA (Spring services)
- 🌸 **Pink** - REPOSITORY (Spring repositories)
- 🔴 **Red** - ENTITY (JPA entities)

**How to Use:**

1. **Open the Graph:**
   - Click the **Flow Graph** button (⚡) in the navigation bar
   - The graph opens in a full-screen modal
   - Wait for project analysis to complete

2. **Navigate the Graph:**
   - **Pan**: Click and drag on empty space
   - **Zoom**: Mouse wheel or pinch gesture
   - **Move nodes**: Click and drag individual nodes
   - **View details**: Click on a node to see:
     - Node name and type
     - File path and line number
     - Package information
     - Incoming and outgoing connections

3. **Filter the Graph:**
   - **Layer Filters**: Click layer buttons in toolbar to show/hide layers
   - **Search**: Type in search box to highlight matching nodes
   - **Connection Types**: Filter by CALLS, INHERITS, INJECTS relationships

4. **Close the Graph:**
   - Click **Close** button in top-right corner
   - Press **ESC** key

**Use Cases:**
- **Understanding Architecture** - See how components connect
- **Tracing Requests** - Follow a request from UI to database
- **Identifying Dependencies** - Find tightly coupled components
- **Onboarding** - Help new developers understand the system
- **Documentation** - Generate architecture diagrams

**Performance:**
- Renders up to 100 nodes within 500ms (NFR.2)
- Maintains 60 FPS during interaction
- Incremental loading for very large graphs

### 7.2 State Machine Extraction

Automatically generates visual state transition diagrams from Java Enums or TypeScript Union types:

![State Machine Button](frontend/test-results/screenshots/15-state-machine-button.png)

**Figure 25: State machine button in navigation bar**

![State Machine](frontend/test-results/screenshots/26-state-machine.png)

**Figure 26: Extracted state machine diagram**

**Features (FR.36):**

**Automatic Detection:**
- Identifies enums/types used as state variables
- Analyzes switch statements and conditionals
- Extracts state transitions
- Generates visual diagrams

**Diagram Elements:**
- **States** - Represented as nodes (enum values)
- **Transitions** - Directed edges showing state changes
- **Conditions** - Labels on transitions showing trigger conditions
- **Initial State** - Marked with special styling
- **Final States** - Indicated if applicable

**Supported Patterns:**
- Java Enum state machines
- TypeScript Union type states
- Switch statement analysis
- If/else conditional analysis

**How to Use:**

1. **Open State Machine Viewer:**
   - Click the **State Machine** button (🔄) in the navigation bar
   - Opens in a modal dialog

2. **Select State Variable:**
   - Choose from detected state enums/types
   - Or specify a custom variable to analyze

3. **View Diagram:**
   - States shown as nodes
   - Transitions shown as arrows
   - Click nodes/edges for details
   - Pan and zoom to navigate

4. **Export Diagram:**
   - Save as PNG image
   - Export as DOT (Graphviz) format
   - Generate PlantUML code

**Use Cases:**
- **Understanding Complex State Logic** - Visualize state machines
- **Documentation** - Generate state diagrams automatically
- **Code Review** - Verify state transition correctness
- **Testing** - Identify missing state transitions
- **Refactoring** - Find redundant or unreachable states

**Example State Machine:**
```java
enum OrderStatus {
    CREATED, PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
}
```

The tool analyzes code that uses this enum and generates a diagram showing:
- CREATED → PENDING → CONFIRMED → SHIPPED → DELIVERED
- CREATED → CANCELLED
- PENDING → CANCELLED
- CONFIRMED → CANCELLED

### 7.3 Knowledge Graph

The Knowledge Graph provides a comprehensive relationship database across all project code:

![Knowledge Graph Button](frontend/test-results/screenshots/17-knowledge-graph-button.png)

**Figure 27: Knowledge graph button in navigation bar**

![Knowledge Graph](frontend/test-results/screenshots/28-knowledge-graph.png)

**Figure 28: Knowledge graph visualization**

**Relationship Types (FR.38):**

1. **CALLS** - Method/function invocation
   - Shows which methods call which other methods
   - Tracks call frequency and location
   
2. **INHERITS** - Class inheritance and interface implementation
   - Parent-child relationships
   - Interface implementations
   
3. **INJECTS** - Dependency injection
   - @Autowired fields
   - Constructor injection
   - Setter injection
   
4. **MAPS_TO_URL** - REST endpoint mappings
   - Frontend service calls to backend endpoints
   - Request/response patterns

**Cross-Language Queries (FR.39):**

Execute complex queries across language boundaries:

**Example Queries:**
- "Show all Vue components that trigger writes to the ORDERS table"
- "Find all Spring services called by the UserManagement component"
- "What database tables are accessed by the checkout flow?"
- "Which controllers are never called from the frontend?"

**Query Interface:**
1. **Visual Query Builder** - Point-and-click query construction
2. **Cypher-like Syntax** - For advanced users familiar with graph queries
3. **Saved Queries** - Store frequently used queries

**Features:**
- **Interactive Visualization** - Click nodes to explore relationships
- **Path Finding** - Find shortest path between two symbols
- **Impact Analysis** - See all downstream effects of a change
- **Dependency Analysis** - Identify circular dependencies
- **Test Coverage** - Find untested code paths

**How to Use:**

1. **Open Knowledge Graph:**
   - Click the **Knowledge Graph** button (🕸️)
   - Opens in full-screen modal

2. **Explore Relationships:**
   - Start from any node (class, method, table)
   - Click to expand relationships
   - Follow edges to related nodes

3. **Run Queries:**
   - Use the query builder for simple queries
   - Type Cypher-like syntax for advanced queries
   - Results appear in the graph visualization

4. **Analyze Results:**
   - Highlight specific paths
   - Filter by relationship type
   - Export query results

**Performance:**
- Query results returned within 1 second (NFR.4)
- Supports up to 10,000 indexed symbols
- Incremental indexing for changed files (NFR.9)

**Use Cases:**
- **Impact Analysis** - "What breaks if I change this method?"
- **Refactoring** - Find all usages before renaming
- **Testing** - Identify untested code paths
- **Documentation** - Understand system architecture
- **Onboarding** - Learn how components interact

### 7.4 Feature-Based Code Slicing

Define logical feature domains and filter the codebase to show only related code:

![Feature Slice Button](frontend/test-results/screenshots/16-feature-slice-button.png)

**Figure 29: Feature slice button in navigation bar**

![Feature Slice](frontend/test-results/screenshots/27-feature-slice.png)

**Figure 30: Feature-based code slicing interface**

**Features (FR.35):**

**Define Feature Slices:**
- Create logical groupings (e.g., "User Management", "Payment Processing")
- Assign files, classes, and packages to features
- Define cross-cutting concerns (e.g., "Security", "Logging")

**Filtering:**
- **Active Slice** - Show only code related to selected feature
- **Dim Unrelated** - Gray out code not in the slice
- **Highlight Related** - Emphasize related code

**Slice Types:**
1. **Feature Slices** - Business functionality (e.g., checkout, user registration)
2. **Layer Slices** - Architectural layers (e.g., presentation, business, data)
3. **Technology Slices** - Technology stacks (e.g., Vue components, Spring services)

**How to Use:**

1. **Create a Slice:**
   - Click **Feature Slice** button (🧩)
   - Click **New Slice**
   - Name the slice (e.g., "User Authentication")
   - Choose a color for the slice

2. **Assign Code to Slice:**
   - **Manual Assignment**: Select files/packages and assign to slice
   - **Pattern Matching**: Define regex patterns (e.g., `**/auth/**`)
   - **Smart Detection**: AI-powered feature detection based on naming

3. **Activate Slice:**
   - Click on the slice name
   - File tree filters to show only related files
   - Code viewer highlights related code

4. **Combine Slices:**
   - Select multiple slices simultaneously
   - See intersection or union of slices
   - Useful for cross-cutting concerns

**Example Slices:**

**User Management Feature:**
- `UserController.java`
- `UserService.java`
- `UserRepository.java`
- `User.java` (entity)
- `UserList.vue` (component)
- `userService.ts` (TypeScript)

**Payment Processing Feature:**
- `PaymentController.java`
- `PaymentService.java`
- `PaymentGateway.java`
- `Payment.vue`
- `paymentService.ts`

**Use Cases:**
- **Feature Development** - Focus on specific features
- **Code Review** - Review changes by feature
- **Documentation** - Document features separately
- **Testing** - Test features in isolation
- **Onboarding** - Learn one feature at a time
- **Refactoring** - Extract features into microservices

---

## 8. Navigation & Analysis Tools

### 8.1 Control-Click Navigation

Navigate to symbol definitions using control/command-click:

**How to Use (FR.24 & FR.25):**

**Standard Mode:**
- Hold `Ctrl` (Windows/Linux) or `Cmd` (Mac)
- Click on any symbol (method name, class name, variable)
- Navigate to definition

**Click Navigation Mode:**
- Toggle "Click Navigation Mode" in settings
- Regular clicks navigate to definitions (no modifier key needed)
- Useful when navigating code extensively

**Supported Symbols:**
- Method calls → Method definition
- Class references → Class declaration
- Variable references → Variable declaration
- Import statements → Imported file
- Interface implementations → Interface declaration

**Navigation History:**
- **Back**: `Alt + ←` or browser back button
- **Forward**: `Alt + →` or browser forward button
- History is preserved across tab switches

### 8.2 Caller List & Analysis

View all methods that call the currently selected method:

**Features (FR.26 & FR.27):**

**Caller List:**
- **All Callers** - List of all methods calling the current method
- **File Location** - File path and line number for each caller
- **Context Preview** - Code snippet showing the call
- **Quick Navigation** - Click to jump to caller

**Caller Statistics:**
- **Call Frequency** - How many times each caller invokes the method
- **Call Locations** - Multiple calls within same method
- **Caller Distribution** - Which packages/modules use this method most
- **Caller Types** - Production code vs. test code

**How to Use:**

1. **View Callers:**
   - Click on a method name in the code viewer
   - Right-click → "Show Callers"
   - Or press `Ctrl + Alt + C`

2. **Analyze Caller List:**
   - See all callers in a sidebar panel
   - Callers are grouped by file/package
   - Sort by:
     - File name
     - Line number
     - Call frequency

3. **Navigate to Caller:**
   - Click on any caller in the list
   - Code viewer jumps to that location
   - Caller is highlighted

**Use Cases:**
- **Impact Analysis** - Who will be affected by changes?
- **Refactoring** - Find all usages before changing signature
- **Debugging** - Trace where a method is called from
- **Understanding Flow** - See execution paths
- **Dead Code Detection** - Zero callers indicates potential dead code

### 8.3 Test References

Identify and navigate to all tests that reference the current class or method:

**Features (FR.28):**

**Test Detection:**
- Identifies test files (files with `Test`, `Spec` suffix)
- Finds test methods that reference current code
- Shows test coverage percentage
- Highlights untested methods

**Information Shown:**
- **Test File** - File path of test
- **Test Method** - Specific test method
- **Test Type** - Unit test, integration test, E2E test
- **Assertion Count** - Number of assertions
- **Last Run Status** - Pass/fail status (if available)

**How to Use:**

1. **View Test References:**
   - Click on a class or method name
   - Right-click → "Show Tests"
   - Or press `Ctrl + Alt + T`

2. **Analyze Tests:**
   - See all tests in a sidebar panel
   - Grouped by test file
   - Color-coded by status (green = passed, red = failed)

3. **Navigate to Test:**
   - Click on any test to open the test file
   - Test method is highlighted

**Test Coverage Indicators:**
- ✅ **Green checkmark** - Has tests
- ⚠️ **Yellow warning** - Limited tests
- ❌ **Red X** - No tests found

**Use Cases:**
- **Test Coverage** - Verify code is tested
- **Test Maintenance** - Update tests when changing code
- **Understanding Behavior** - Tests document expected behavior
- **Debugging** - Run specific tests to isolate issues

### 8.4 Cross-Reference Navigation

Navigate bidirectionally between callers and callees:

**Features (FR.29):**

**Bidirectional Navigation:**
- **Up**: Navigate to callers (who calls me?)
- **Down**: Navigate to callees (what do I call?)
- **Across**: Navigate to related symbols (siblings, overrides)

**Visual Indicators:**
- **Incoming arrows** - Methods that call this method
- **Outgoing arrows** - Methods called by this method
- **Override indicators** - Methods that override or are overridden

**Navigation Panel:**
- **Call Graph** - Visual tree of call relationships
- **Hierarchy View** - Class inheritance hierarchy
- **Usage View** - All usages of this symbol

**Keyboard Shortcuts:**
- `Ctrl + Alt + ↑` - Navigate to callers
- `Ctrl + Alt + ↓` - Navigate to callees
- `Ctrl + Alt + H` - Show hierarchy

---

## 9. Export Functionality

### 9.1 Export Formats

Export your code in multiple formats:

![Export Button](frontend/test-results/screenshots/12-export-button.png)

**Figure 31: Export button in navigation bar**

![Export Modal](frontend/test-results/screenshots/29-export-modal.png)

**Figure 32: Export modal with format options**

**Supported Formats (FR.30):**

1. **PDF**
   - Formatted for printing
   - Syntax highlighting preserved
   - Page breaks at logical boundaries
   - Table of contents included
   - Configurable page size and margins

2. **Markdown**
   - Plain text with markdown formatting
   - Code blocks with syntax highlighting
   - Links to symbols and files
   - Compatible with GitHub, GitLab, etc.
   - Easy to edit and version control

3. **HTML**
   - Standalone HTML file
   - Embedded CSS for syntax highlighting
   - Interactive navigation (optional)
   - Suitable for documentation websites

### 9.2 Detail Levels

Choose the level of detail to export:

**Four Detail Levels:**

1. **Full Detail**
   - Complete code with all elements
   - Includes comments, imports, implementation
   - Largest export size
   - Use for: Complete backups, comprehensive documentation

2. **Medium Detail**
   - Code without comments
   - Imports collapsed or removed
   - Implementation included
   - Use for: Code review, technical documentation

3. **Low Detail**
   - Signatures only
   - No implementation details
   - Method and class declarations only
   - Use for: API documentation, quick reference

4. **Architectural View**
   - Public interfaces only
   - No private implementation
   - Focus on public API surface
   - Use for: Architecture documentation, public API specs

**How to Choose:**
- Consider your audience (developers vs. stakeholders)
- Consider your purpose (documentation vs. review)
- Consider size constraints (email attachments, printing)

### 9.3 Project-Wide Export

Export entire projects or selected packages:

**Export Scope (FR.31):**

1. **Current File**
   - Export only the currently open file
   - Fast and simple
   
2. **Current Package**
   - Export all files in the selected package
   - Useful for module documentation
   
3. **Selected Files**
   - Choose specific files to export
   - Customized export scope
   
4. **Entire Project**
   - Export all files in the project
   - Complete project documentation
   - Can be very large

**Export Options:**

**File Organization:**
- **Single File** - Combine all code into one file
- **Multiple Files** - Preserve directory structure
- **Zipped Archive** - Compress for distribution

**Metadata:**
- **Table of Contents** - Index of all files/symbols
- **Statistics** - Project metrics and summaries
- **Timestamps** - When export was created
- **Author Information** - Who generated the export

**How to Export:**

1. **Open Export Modal:**
   - Click **Export** button (📤) in navigation bar
   - Or press `Ctrl + E`

2. **Configure Export:**
   - Select format (PDF, Markdown, HTML)
   - Choose detail level (Full, Medium, Low, Architectural)
   - Select scope (File, Package, Selected, Project)
   - Configure options (TOC, statistics, etc.)

3. **Generate Export:**
   - Click **Generate**
   - Wait for processing (progress bar shown)
   - Export appears in download folder

4. **Review Export:**
   - Open exported file
   - Verify content and formatting
   - Share or archive as needed

**Performance:**
- Small files (<100 lines) - Instant
- Medium files (100-1000 lines) - 1-2 seconds
- Large files (1000+ lines) - 3-5 seconds
- Entire projects - 10-60 seconds depending on size

**Use Cases:**
- **Documentation** - Generate project documentation
- **Code Review** - Share code for review
- **Archiving** - Backup code at specific points
- **Onboarding** - Provide project overview to new developers
- **Client Delivery** - Share code with clients in readable format
- **Audits** - Generate code for compliance audits

---

## 10. Keyboard Shortcuts

**Global Shortcuts:**
- `Ctrl + Shift + F` - Open symbol search
- `Ctrl + E` - Open export modal
- `Ctrl + ,` - Open settings
- `Ctrl + /` - Toggle comment on current line
- `F1` - Open help
- `Esc` - Close current modal/dialog

**Navigation:**
- `Ctrl + Tab` - Next tab
- `Ctrl + Shift + Tab` - Previous tab
- `Ctrl + W` - Close current tab
- `Alt + ←` - Back in navigation history
- `Alt + →` - Forward in navigation history
- `Alt + ↑` - Previous file in package
- `Alt + ↓` - Next file in package

**Code Navigation:**
- `Ctrl + Click` (or `Cmd + Click` on Mac) - Navigate to definition
- `Ctrl + Alt + ↑` - Navigate to callers
- `Ctrl + Alt + ↓` - Navigate to callees
- `Ctrl + Alt + C` - Show caller list
- `Ctrl + Alt + T` - Show test references
- `Ctrl + Alt + H` - Show hierarchy

**View Controls:**
- `Ctrl + +` - Zoom in
- `Ctrl + -` - Zoom out
- `Ctrl + 0` - Reset zoom
- `F11` - Toggle fullscreen
- `Ctrl + B` - Toggle file explorer
- `Ctrl + M` - Toggle minimap

**File Explorer:**
- `↑` / `↓` - Navigate files
- `←` - Collapse folder
- `→` - Expand folder
- `Enter` - Open file
- `Space` - Preview file (quick look)

**Code Viewer:**
- `Ctrl + F` - Find in file
- `Ctrl + H` - Find and replace
- `Ctrl + G` - Go to line
- `Ctrl + D` - Duplicate line
- `Ctrl + L` - Select line

---

## 11. Troubleshooting

### Common Issues

**Issue: Application won't start**

**Symptoms:** Error message on startup, blank screen, or connection refused

**Solutions:**
1. Verify backend is running: `curl http://localhost:8080/api/health`
2. Check frontend dev server: `curl http://localhost:5173`
3. Review console logs for errors
4. Ensure ports 8080 and 5173 are not in use
5. Try `./dev.sh` to start both services

**Issue: Files not appearing in explorer**

**Symptoms:** Empty file tree, some folders missing

**Solutions:**
1. Check project indexing status
2. Verify project directory path is correct
3. Refresh the file tree (F5)
4. Check file permissions
5. Re-index project from settings

**Issue: Syntax highlighting not working**

**Symptoms:** Code appears as plain text, no colors

**Solutions:**
1. Verify file extension is recognized
2. Check that language grammar is installed
3. Force language selection in file menu
4. Clear browser cache
5. Update to latest version

**Issue: Slow performance with large files**

**Symptoms:** Lag when scrolling, delayed typing, unresponsive UI

**Solutions:**
1. Enable virtual scrolling in settings
2. Use "Simplified" or "Architectural" LoD
3. Hide comments and imports
4. Close unused tabs
5. Increase browser memory limit

**Issue: Export fails or produces empty file**

**Symptoms:** Export button disabled, error during export, empty PDF/Markdown

**Solutions:**
1. Ensure a file is open (for file export)
2. Check available disk space
3. Verify export format is supported
4. Try a different detail level
5. Check browser console for errors

**Issue: Heatmap colors not showing**

**Symptoms:** All files appear same color, no complexity data

**Solutions:**
1. Wait for analysis to complete (check status bar)
2. Re-run complexity analysis
3. Verify project is indexed
4. Check that complexity calculations are enabled
5. Refresh heatmap view

**Issue: Symbol search returns no results**

**Symptoms:** Search returns empty, known symbols not found

**Solutions:**
1. Verify project is indexed
2. Check search query syntax
3. Try broader search terms
4. Re-index project
5. Check that file types are included in index

### Getting Help

**Documentation:**
- This user manual
- FLOW_GRAPH_GUIDE.md for detailed flow graph usage
- SRS.md for complete requirements specification

**Community:**
- GitHub Issues: Report bugs and request features
- Discussions: Ask questions and share tips

**Logs:**
- Frontend: Browser developer console (F12)
- Backend: `backend/logs/codecom.log`

---

## 12. Frequently Asked Questions

**Q: What languages does CodeCom support?**

A: CodeCom supports Java, JavaScript, TypeScript, SQL, PL/SQL, HTML, CSS, XML, JSF, and YAML. The architecture is extensible for adding new languages.

**Q: Can I use CodeCom with private/proprietary code?**

A: Yes. CodeCom runs entirely locally on your machine. No code is sent to external servers.

**Q: Does CodeCom modify my source code?**

A: No. CodeCom is a read-only tool. It analyzes and visualizes code but never modifies source files.

**Q: How large of a project can CodeCom handle?**

A: CodeCom is designed to handle projects with up to 10,000 files and 100,000 symbols without significant performance degradation (NFR.8).

**Q: Can I customize the color schemes?**

A: Yes. Both light and dark themes have customizable color schemes in settings. You can also create custom themes.

**Q: Does CodeCom require internet access?**

A: No. Once installed, CodeCom runs entirely offline. However, initial installation requires internet to download dependencies.

**Q: Can I export my visualizations?**

A: Yes. All visualizations (flow graphs, state machines, heatmaps) can be exported as PNG, SVG, or PDF.

**Q: How do I update CodeCom?**

A: Pull the latest changes from the repository and restart:
```bash
git pull origin main
./dev.sh
```

**Q: Can I integrate CodeCom with my IDE?**

A: CodeCom is a standalone web application. However, you can run it alongside your IDE and use both tools simultaneously.

**Q: Is there a mobile version?**

A: CodeCom is optimized for desktop browsers. Mobile support is limited but basic features work on tablets.

**Q: How do I contribute to CodeCom?**

A: See AGENTS.md for development guidelines. Contributions are welcome via pull requests on GitHub.

**Q: What's the difference between LoD and Detail Controls?**

A: **Level of Detail** provides three preset complexity levels (Standard, Simplified, Architectural). **Detail Controls** provide 8 independent filters for fine-grained customization (hide comments, hide imports, etc.). You can use LoD for quick switching or Detail Controls for precise control.

**Q: Why are some methods shown in "ghost mode"?**

A: Methods displayed with 40% opacity (ghost mode) have zero internal callers, indicating potential dead code. This is CodeCom's dead code detection feature (FR.37).

**Q: Can I save my current view/filters as a preset?**

A: Yes. In settings, you can save current LoD, Detail Controls, and filter states as named presets for quick switching.

**Q: How accurate is the complexity heatmap?**

A: The heatmap uses cyclomatic complexity analysis which is industry-standard. Accuracy depends on code structure, but it reliably identifies complex methods and files.

**Q: Can CodeCom analyze test coverage?**

A: CodeCom can identify which tests reference classes/methods (FR.28) but does not run tests or measure code coverage. Use JaCoCo, Istanbul, or similar tools for coverage analysis.

**Q: Why is the export button disabled?**

A: The export button requires an open file (for single file export) or selected package (for package export). Open a file or select a scope first.

**Q: Can I use CodeCom in a team environment?**

A: Yes. CodeCom is designed for individual use but can be run by multiple developers on the same codebase. Consider sharing presets and saved queries for consistency.

**Q: Does CodeCom support version control integration?**

A: CodeCom does not directly integrate with Git/SVN, but you can use it to analyze any codebase checked out from version control.

---

## Conclusion

This manual covers all major features of CodeCom. For additional information, see:

- **SRS.md** - Complete requirements specification (41 functional requirements)
- **STATUS.md** - Current implementation status (100% feature complete)
- **FLOW_GRAPH_GUIDE.md** - Detailed flow graph usage
- **AGENTS.md** - Development guidelines for contributors

For questions, issues, or feature requests, please visit the GitHub repository:
https://github.com/lgalvao/codecom

---

**CodeCom** - Making code comprehension effortless.

*Last Updated: February 16, 2026*
