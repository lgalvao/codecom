# Playwright E2E Tests for CodeCom

This directory contains end-to-end tests for the CodeCom application, based on the requirements specified in `SRS.md`.

## Test Structure

The tests are organized by use cases as defined in the Software Requirements Specification:

### 01-project-navigation.spec.ts
- **UC-01**: Project Loading and File Navigation (FR.7)
- **UC-02**: Level of Detail Toggle (FR.1-3)

### 02-detail-control-search.spec.ts
- **UC-03**: Detail Level Control (FR.15-22)
- **UC-04**: Symbol Search and Navigation (FR.5, FR.24-25)

### 03-tabs-navigation.spec.ts
- **UC-05**: Tab Management and Multi-File Workflow (FR.8)
- **UC-06**: Advanced Navigation and Cross-References (FR.23, FR.26, FR.28)

### 04-visualization-features.spec.ts
- **UC-07**: Export Functionality (FR.30-31)
- **UC-08**: Complexity Heatmap Visualization (FR.32)
- **UC-09**: Interactive Architecture Flow Visualization (FR.33)
- **UC-10**: Code Structure Mini-Map Navigation (FR.34)

### 05-advanced-features.spec.ts
- **UC-11**: Feature-Based Code Slicing (FR.35)
- **UC-12**: State Machine Extraction and Visualization (FR.36)
- **UC-13**: Dead Code Detection and Ghost Mode (FR.37)
- **Additional Features**: Theme toggle, Statistics, Scope Isolation

## Running the Tests

### Prerequisites
1. Ensure the backend server is running on `http://localhost:8080`
2. Install dependencies: `npm install`
3. Install Playwright browsers: `npx playwright install`

### Run Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/01-project-navigation.spec.ts

# Run tests with specific browser
npx playwright test --project=chromium
```

## Test Design Principles

### Realistic User Scenarios
All tests simulate actual user behavior:
- No branching logic in tests
- No exception handling shortcuts
- No fallbacks or workarounds
- Sequential, linear test flows

### Data-Testid Strategy
Tests use `data-testid` attributes for reliable element selection:
- `app-container`: Main application container
- `main-navbar`: Top navigation bar
- `lod-selector`: Level of Detail dropdown
- `btn-*`: Action buttons (search, statistics, detail control, etc.)
- `file-explorer`: File tree sidebar
- `outline-panel`: Code outline sidebar
- `welcome-screen`: Initial welcome view

### Test Coverage
Tests cover all major functional requirements (FR.1-41) and use cases (UC-01 to UC-13):
- ✅ File navigation and loading
- ✅ Level of Detail toggles
- ✅ Detail control filters
- ✅ Symbol search
- ✅ Tab management
- ✅ Advanced navigation (package nav, caller list)
- ✅ Export functionality
- ✅ Complexity heatmap
- ✅ Flow graph visualization
- ✅ Code mini-map
- ✅ Feature slicing
- ✅ State machine diagrams
- ✅ Dead code detection
- ✅ Theme switching
- ✅ Statistics panel
- ✅ Scope isolation

## Test Environment

- **Base URL**: `http://localhost:5173` (Vite dev server)
- **Backend**: Expected at `http://localhost:8080`
- **Browser**: Chromium (default)
- **Workers**: 1 (sequential execution for realistic scenarios)

## Viewing Test Results

After running tests, view the HTML report:

```bash
npx playwright show-report
```

## Debugging Failed Tests

1. **Screenshots**: Automatically captured on failure
2. **Videos**: Recorded for failed tests
3. **Traces**: Available on first retry
4. **Debug Mode**: Use `npm run test:e2e:debug` to step through tests

## Notes

- Tests wait for the backend to be available before proceeding
- File tree structure depends on the project being indexed
- Some tests may be skipped if required files are not present
- Tests are designed to be idempotent and can run multiple times

## Future Enhancements

- Cross-browser testing (Firefox, WebKit)
- Visual regression testing
- Performance testing with Lighthouse
- Accessibility testing with axe-core
- API mocking for isolated frontend testing
