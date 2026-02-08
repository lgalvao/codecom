# Project Status (STATUS.md)

This document tracks the implementation progress of **CodeCom** against the requirements defined in [SRS.md](file:///Users/leonardo/codecom/SRS.md).

## Implementation Progress

| Req ID | Requirement | Status | Comments |
| :--- | :--- | :--- | :--- |
| **FR.1** | LoD Toggle | 🟢 Partial | Toggle UI exists; filtering logic applied to Java/JS symbols. |
| **FR.2** | Intelligent Collapsing | 🟢 Done | Java boilerplate (get/set/ctors) identified and filterable. |
| **FR.3** | Scope Isolation | 🔴 Missing | Highlight logic exists, but full isolation/dimming is missing. |
| **FR.4** | Syntax Highlighting | 🟢 Done | Integrated Shiki for cross-language support. |
| **FR.5** | Symbol Search | 🔴 Missing | No dedicated symbol search bar in UI. |
| **FR.6** | Contextual Metadata | 🔴 Missing | Signatures on hover not yet implemented. |
| **FR.7** | Virtual File Tree | 🟢 Done | Interactive file explorer connected to backend API. |
| **FR.8** | Tab Management | 🔴 Missing | Currently only supports single file view. |
| **FR.9** | Project Indexing | 🟢 Partial | Backend accesses filesystem; database integration is basic. |
| **FR.10** | User Preferences | 🟢 Partial | Theme preference (Light/Dark) is persistent. |
| **FR.11** | Total Line Count | 🟢 Done | Statistics service implemented and tested. |
| **FR.12** | Code Line Count (Non-Comment, Non-Blank) | 🟢 Done | Statistics service calculates code lines accurately. |
| **FR.13** | Method Statistics | 🟢 Done | Statistics service counts methods including constructors. |
| **FR.14** | Structure Statistics | 🟢 Done | Statistics service counts classes, interfaces, records, packages. |
| **FR.15** | Full Detail View | 🟢 Done | Current default view shows all code. |
| **FR.16** | No Comments Mode | 🟢 Partial | UI toggle exists; filtering logic needs integration. |
| **FR.17** | Signatures Only Mode | 🟢 Partial | Exists via LoD toggle and detail panel; needs refinement. |
| **FR.18** | Abbreviated Parameter Types | 🟢 Partial | UI toggle exists; type abbreviation logic not implemented. |
| **FR.19** | No Parameter Types | 🟢 Partial | UI toggle exists; parameter type hiding not implemented. |
| **FR.20** | No Parameters Mode | 🟢 Partial | UI toggle exists; parameter hiding not implemented. |
| **FR.21** | Public Members Only | 🟢 Partial | UI toggle exists; filter needs backend integration. |
| **FR.22** | Hide Imports | 🟢 Partial | UI toggle exists; import filtering implemented. |
| **FR.23** | Package Navigation | 🔴 Missing | Next/previous navigation not implemented. |
| **FR.24** | Control-Click Navigation | 🔴 Missing | Symbol navigation not implemented. |
| **FR.25** | Click Navigation Mode | 🔴 Missing | Navigation mode toggle not implemented. |
| **FR.26** | Caller List | 🔴 Missing | Call graph analysis not implemented. |
| **FR.27** | Caller Statistics | 🔴 Missing | Call statistics not implemented. |
| **FR.28** | Test References | 🔴 Missing | Test reference tracking not implemented. |
| **FR.29** | Cross-Reference Navigation | 🔴 Missing | Bidirectional navigation not implemented. |
| **FR.30** | Multi-Format Export | 🔴 Missing | Export functionality not implemented. |
| **FR.31** | Project-Wide Export | 🔴 Missing | Export functionality not implemented. |

## Technical Summary
- **Backend**: Spring Boot 4 / Java 25 is operational.
- **Frontend**: Vue 3.5 / Vite is operational with BootstrapVueNext.
- **Coverage**: JaCoCo integrated; unit tests present for core services.

## Next High-Priority Gaps
1. **Statistics (FR.11-FR.14)**: Essential metrics for code comprehension and project overview.
2. **Detail Control (FR.16-FR.21)**: Multiple levels of abstraction for different use cases.
3. **Symbol Search (FR.5)**: Critical for fast navigation.
4. **Tab Management (FR.8)**: Needed for multi-file workflows.
5. **Advanced Navigation (FR.23-FR.29)**: Enhances code exploration and understanding.
6. **Export Functionality (FR.30-FR.31)**: Critical for documentation and sharing.
7. **Contextual Metadata (FR.6)**: Enhances comprehension.
