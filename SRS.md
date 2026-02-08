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

### 5.3. Use Case Dependencies

```
UC-01 (File Navigation) ──┬──> UC-02 (Statistics)
                          │
                          ├──> UC-03 (Detail Control)
                          │
                          └──> UC-04 (Symbol Search)
                                   │
                                   └──> UC-06 (Advanced Navigation)

UC-05 (Tab Management) ──────────────> UC-01 (File Navigation)

UC-07 (Export) ──────────────────────> UC-03 (Detail Control)
```

All use cases depend on the system being initialized with a valid project directory.

## 6. Technical Constraints
- Built using **Vue 3** (Composition API) and **Vite**.
- Backend: **Spring Boot 4.0.0** (Java-based REST API).
- Database: **H2 (File-based)** – Chosen for its seamless Spring Boot integration and built-in inspection tools.
- UI Library: **BootstrapVueNext** (to be used for standard components).
- Theme Management: Integrated theme switch (Light/Dark).
