# Software Requirements Specification (SRS) - CodeCom

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

## 4. UI/UX Requirements
- **NFR.1: Performance**: Large files (>2000 lines) must render within 200ms without blocking the UI thread.
- **NFR.2: Aesthetics**: Modern interface with high contrast. Support for **Light** and **Dark** themes.
- **NFR.3: Responsiveness**: Layout adjusts to different screen sizes without losing core utility.

## 5. Technical Constraints
- Built using **Vue 3** (Composition API) and **Vite**.
- Backend: **Spring Boot 4.0.0** (Java-based REST API).
- Database: **H2 (File-based)** – Chosen for its seamless Spring Boot integration and built-in inspection tools.
- UI Library: **BootstrapVueNext** (to be used for standard components).
- Theme Management: Integrated theme switch (Light/Dark).
