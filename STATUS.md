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

## Technical Summary
- **Backend**: Spring Boot 4 / Java 25 is operational.
- **Frontend**: Vue 3.5 / Vite is operational with BootstrapVueNext.
- **Coverage**: JaCoCo integrated; unit tests present for core services.

## Next High-Priority Gaps
1. **Symbol Search (FR.5)**: Critical for fast navigation.
2. **Tab Management (FR.8)**: Needed for multi-file workflows.
3. **Contextual Metadata (FR.6)**: Enhances comprehension.
