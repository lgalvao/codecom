# End-to-End (E2E) Tests

This directory contains Playwright end-to-end tests for the CodeCom application.

## Prerequisites

- Node.js and npm installed
- Backend server running on `http://localhost:8080`
- Frontend dev server will be started automatically by Playwright

## Installation

Install Playwright browsers (if not already installed):

```bash
npx playwright install
```

## Running Tests

### Run all tests in headless mode
```bash
npm run test:e2e
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run tests with UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Debug tests
```bash
npm run test:e2e:debug
```

### Run specific test file
```bash
npx playwright test e2e/file-navigation.spec.ts
```

## Test Structure

The e2e tests are organized by use case from the SRS.md:

- **file-navigation.spec.ts** - UC-01: File Navigation and Viewing
  - Tests file tree display and navigation
  - Tests file selection and content display
  - Tests syntax highlighting
  
- **code-statistics.spec.ts** - UC-02: Code Statistics and Analysis
  - Tests statistics panel display
  - Tests line count calculations
  - Tests method/class/interface statistics

- **detail-control.spec.ts** - UC-03: Detail Level Control
  - Tests detail control toggles
  - Tests comment hiding
  - Tests import hiding  
  - Tests signatures-only mode
  - Tests public members only filter

- **symbol-search.spec.ts** - UC-04: Symbol Search and Navigation
  - Tests symbol search activation
  - Tests search input and filtering
  - Tests keyboard shortcuts (Ctrl+Shift+F)
  - Tests click navigation mode

- **tab-management.spec.ts** - UC-05: Tab Management
  - Tests tab creation
  - Tests tab switching
  - Tests tab closing
  - Tests tab state persistence

- **export.spec.ts** - UC-07: Export Functionality
  - Tests export dialog opening
  - Tests format selection
  - Tests export button states

- **theme-ui.spec.ts** - Theme and UI Tests
  - Tests light/dark theme toggle
  - Tests theme persistence
  - Tests UI component visibility

## Test Data

The tests use the actual CodeCom repository structure for testing, navigating through:
- `/backend` directory for Java files
- `/frontend` directory for TypeScript/Vue files

## Test Approach

These tests follow a realistic user workflow:
- No branching or shortcuts - tests simulate actual user interactions
- Tests use data-testid attributes for stable element selection
- Tests verify visible behavior and user experience
- Tests maintain state across interactions

## Viewing Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

## CI/CD Integration

To run tests in CI:

```bash
# Ensure backend is running
cd ../backend && ./gradlew bootRun &

# Wait for backend to be ready
sleep 10

# Run tests
npm run test:e2e

# Stop backend
kill %1
```

## Debugging Tips

1. Use `--debug` flag to step through tests
2. Use `--headed` to see the browser
3. Use `--ui` for interactive test execution
4. Check screenshots in `test-results/` directory for failed tests
5. Use `page.pause()` in test code to add breakpoints

## Configuration

The Playwright configuration is in `playwright.config.ts`:
- Base URL: `http://localhost:5173`
- Browsers: Chromium, Firefox, WebKit
- Test directory: `./e2e`
- Dev server auto-start: Yes
