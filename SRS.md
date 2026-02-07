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
### 3.4. Persistence & Project Management [NEW]
- **FR.9: Project Indexing**: The system shall index local directories and store metadata (file paths, symbol maps) in a local database.
- **FR.10: User Preferences**: Persistent storage for theme selection, complexity settings, and recently opened files.

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
