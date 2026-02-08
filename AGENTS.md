# AI Agent Guidelines (AGENTS.md)

This document provides context and guidelines for AI agents working on the **CodeCom** project.

## 1. Project Context
**CodeCom** is a web-based code comprehension and visualization tool.
- **Frontend**: Vue 3 (Composition API), Vite, BootstrapVueNext, Shiki (syntax highlighting), Web-Tree-Sitter.
- **Backend**: Spring Boot 4 (Java 25), Spring Data JPA.
- **Database**: H2 (File-based).
- **Architecture**: A RESTful API serves the frontend which handles complex code visualization.

## 2. Project Structure
- `/frontend`: Vue.js application.
  - `/src/components`: UI components.
  - `/src/services`: API communication.
- `/backend`: Spring Boot application.
  - `/src/main/java/com/codecom/controller`: API Endpoints.
  - `/src/main/java/com/codecom/service`: Business Logic.

## 3. Tech Stack & Best Practices

### Frontend (Vue 3.5 / TypeScript)
- Use **Script Setup** with Composition API.
- Prefer **BootstrapVueNext** for standard UI elements.
- Ensure type safety with **TypeScript**.
- **Linting**: Run `npm run lint` periodically.

### Backend (Java 25 / Spring Boot 4)
- Follow standard Spring Boot patterns (Controller -> Service -> Repository).
- Use **Java 25** features where appropriate.
- **Testing**: Use JUnit 6 and JaCoCo for coverage.
- **Documentation**: All public API endpoints should be clear and documented via code or READMEs.

## 4. Operational Guidelines

### Build & Run
- **Everything**: `./dev.sh` starts both frontend and backend.
- **Frontend**: `cd frontend && npm run dev`.
- **Backend**: `cd backend && ./gradlew bootRun`.

### Testing
- **Frontend**: `npm run test` (Vitest).
- **Backend**: `./gradlew test`. JaCoCo reports are generated in `backend/build/reports/jacoco/test/html/index.html`.

## 5. Agent Personas & Style
- Be proactive in verifying changes using the provided test suites.
- Maintain the project's high aesthetic standards (Light/Dark mode support).
- Follow the complexity-controlled view requirements mentioned in `SRS.md`.

## 6. Project Documentation
- **SRS.md**: Software Requirements Specification - Complete list of functional and non-functional requirements (FR.1-41, NFR.1-9)
- **STATUS.md**: Current implementation status, test coverage, and development history
- **AGENTS.md**: This file - Guidelines for AI agents working on CodeCom
