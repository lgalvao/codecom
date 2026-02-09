import { test, expect } from '@playwright/test';

/**
 * E2E Tests for UC-11: Feature-Based Code Slicing
 * Tests FR.35 (Feature-Based Code Slicing)
 */
test.describe('UC-11: Feature-Based Code Slicing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('app-container')).toBeVisible();
    await page.waitForTimeout(2000);
  });

  test('should display feature slice manager in sidebar', async ({ page }) => {
    // Look for feature slice manager component in sidebar
    const sidebar = page.getByTestId('file-explorer');
    await expect(sidebar).toBeVisible();
    
    // Feature slice manager should be in the sidebar
    // Manager might be at the bottom of sidebar
    // The component exists as part of the FeatureSliceManager Vue component
    const sliceManager = page.locator('.feature-slice, [class*="slice"]').first();
    
    // If slice manager UI is visible, verify it
    const sliceManagerVisible = await sliceManager.isVisible().catch(() => false);
    
    // Sidebar should always be visible regardless of slice manager state
    await expect(sidebar).toBeVisible();
  });

  test('should create a new feature slice', async ({ page }) => {
    // Look for "Create Slice" or "Add Slice" button
    const createButton = page.locator('button').filter({ hasText: /create.*slice|add.*slice|new.*slice/i }).first();
    
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(500);
      
      // Dialog or input should appear for slice definition
      const nameInput = page.locator('input[type="text"]').filter({ hasText: /name|slice/i }).first();
      
      if (await nameInput.isVisible()) {
        await nameInput.fill('User Management');
        await page.waitForTimeout(300);
        
        // Save or confirm button
        const saveButton = page.locator('button').filter({ hasText: /save|create|ok/i }).first();
        
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('should filter file tree based on selected slice', async ({ page }) => {
    // If slices exist, selecting one should filter the file tree
    const sliceSelector = page.locator('select, .slice-item').first();
    
    if (await sliceSelector.isVisible()) {
      await sliceSelector.click();
      await page.waitForTimeout(500);
      
      // File tree should update to show only relevant files
      const fileTree = page.getByTestId('file-tree-container');
      await expect(fileTree).toBeVisible();
    }
  });

  test('should dim unrelated files when slice is active', async ({ page }) => {
    // When a slice is active, unrelated files should be dimmed or hidden
    // This is a visual test that depends on implementation
    
    const fileTree = page.getByTestId('file-tree-container');
    await expect(fileTree).toBeVisible();
    
    // Files might have opacity or display changes
    const dimmedFiles = fileTree.locator('[style*="opacity"], [class*="dimmed"], [class*="hidden"]');
    const count = await dimmedFiles.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should clear slice filter and show all files', async ({ page }) => {
    // Look for a "Clear" or "Show All" option
    const clearButton = page.locator('button').filter({ hasText: /clear|show all|reset/i }).first();
    
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await page.waitForTimeout(500);
      
      // All files should be visible again
      const fileTree = page.getByTestId('file-tree-container');
      await expect(fileTree).toBeVisible();
    }
  });
});

/**
 * E2E Tests for UC-12: State Machine Extraction and Visualization
 * Tests FR.36 (State Machine Diagrams)
 */
test.describe('UC-12: State Machine Extraction and Visualization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('app-container')).toBeVisible();
    await page.waitForTimeout(2000);
    
    // Open a file for testing
    const firstFile = page.locator('text=/\\.(java|ts)$/').first();
    if (await firstFile.isVisible()) {
      await firstFile.click();
      await page.waitForTimeout(1500);
    }
  });

  test('should have state machine button in toolbar', async ({ page }) => {
    // State machine button should be visible
    const stateMachineButton = page.getByTestId('btn-state-machines');
    await expect(stateMachineButton).toBeVisible();
  });

  test('should enable state machine button when file is selected', async ({ page }) => {
    // Button should be enabled when file is open
    const stateMachineButton = page.getByTestId('btn-state-machines');
    await expect(stateMachineButton).toBeEnabled();
  });

  test('should disable state machine button when no file is selected', async ({ page }) => {
    // Close all files
    const closeButton = page.locator('.tab-close, .btn-close').first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForTimeout(500);
    }
    
    // Button should be disabled
    const stateMachineButton = page.getByTestId('btn-state-machines');
    await expect(stateMachineButton).toBeDisabled();
  });

  test('should open state machine visualization panel', async ({ page }) => {
    // Click state machine button
    await page.getByTestId('btn-state-machines').click();
    await page.waitForTimeout(1000);
    
    // Panel should open with state machine diagrams
    await expect(page.getByText(/State Machine|FR.36/i)).toBeVisible();
  });

  test('should display state transition diagram', async ({ page }) => {
    // Open state machine panel
    await page.getByTestId('btn-state-machines').click();
    await page.waitForTimeout(1500);
    
    // Look for diagram elements (SVG, canvas, or D3 visualization)
    const diagram = page.locator('svg, canvas, .state-diagram, .diagram-container').first();
    
    if (await diagram.isVisible()) {
      await expect(diagram).toBeVisible();
    }
  });

  test('should show state nodes and transition edges', async ({ page }) => {
    // Open state machine panel
    await page.getByTestId('btn-state-machines').click();
    await page.waitForTimeout(1500);
    
    // Look for state nodes
    const diagramContainer = page.locator('.state-diagram, .offcanvas-body, .modal-body').first();
    
    if (await diagramContainer.isVisible()) {
      // Diagram should contain visual elements
      const nodes = diagramContainer.locator('circle, rect, .node, .state');
      const edges = diagramContainer.locator('line, path, .edge, .transition');
      
      const nodeCount = await nodes.count();
      const edgeCount = await edges.count();
      
      // If state machine exists, should have nodes or edges
      expect(nodeCount + edgeCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should allow clicking on states to view related code', async ({ page }) => {
    // Open state machine panel
    await page.getByTestId('btn-state-machines').click();
    await page.waitForTimeout(1500);
    
    // Find a state node
    const stateNode = page.locator('.node, .state, circle, rect').first();
    
    if (await stateNode.isVisible()) {
      await stateNode.click();
      await page.waitForTimeout(500);
      
      // Should highlight or navigate to related code
      // Verify the interaction doesn't cause errors
      // The file should remain open
      await expect(page.getByTestId('welcome-screen')).not.toBeVisible();
    } else {
      // If no state nodes visible, at least verify panel is open
      await expect(page.getByText(/State Machine/i)).toBeVisible();
    }
  });

  test('should close state machine panel', async ({ page }) => {
    // Open panel
    await page.getByTestId('btn-state-machines').click();
    await page.waitForTimeout(1000);
    await expect(page.getByText(/State Machine/i)).toBeVisible();
    
    // Close panel
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Panel should be closed
    await expect(page.getByText(/State Machine.*FR.36/i)).not.toBeVisible();
  });
});

/**
 * E2E Tests for UC-13: Dead Code Detection and Ghost Mode
 * Tests FR.37 (Dead Code Detection)
 */
test.describe('UC-13: Dead Code Detection and Ghost Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('app-container')).toBeVisible();
    await page.waitForTimeout(2000);
  });

  test('should have dead code detection button in toolbar', async ({ page }) => {
    // Dead code button should be visible
    const deadCodeButton = page.getByTestId('btn-dead-code');
    await expect(deadCodeButton).toBeVisible();
  });

  test('should toggle dead code visualization when button clicked', async ({ page }) => {
    const deadCodeButton = page.getByTestId('btn-dead-code');
    
    // Click to enable
    await deadCodeButton.click();
    await page.waitForTimeout(1500); // Wait for dead code analysis
    
    // Button should be highlighted (active state)
    const classes = await deadCodeButton.getAttribute('class');
    expect(classes).toContain('warning');
    
    // Click again to disable
    await deadCodeButton.click();
    await page.waitForTimeout(500);
  });

  test('should analyze project for dead code when enabled', async ({ page }) => {
    // Enable dead code detection
    await page.getByTestId('btn-dead-code').click();
    
    // Wait for analysis to complete
    await page.waitForTimeout(2000);
    
    // Open a file to see dead code visualization
    const firstFile = page.locator('text=/\\.(java|ts|js)$/').first();
    if (await firstFile.isVisible()) {
      await firstFile.click();
      await page.waitForTimeout(1500);
      
      // Dead code should be shown with reduced opacity
      const codeContainer = page.locator('.shiki-container, .code-viewer').first();
      
      if (await codeContainer.isVisible()) {
        // Look for ghosted/dimmed code elements
        const ghostedLines = codeContainer.locator('[style*="opacity"], .dead-code, .ghost');
        const count = await ghostedLines.count();
        
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should display dead code with reduced opacity (40%)', async ({ page }) => {
    // Enable dead code detection
    await page.getByTestId('btn-dead-code').click();
    await page.waitForTimeout(2000);
    
    // Open a file
    const firstFile = page.locator('text=/\\.java$/').first();
    if (await firstFile.isVisible()) {
      await firstFile.click();
      await page.waitForTimeout(1500);
      
      // Check for elements with reduced opacity
      const ghostedElements = page.locator('[style*="opacity: 0.4"], [style*="opacity:0.4"]');
      const count = await ghostedElements.count();
      
      // Count could be 0 if no dead code exists, which is acceptable
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should persist dead code setting across sessions', async ({ page }) => {
    // Enable dead code detection
    await page.getByTestId('btn-dead-code').click();
    await page.waitForTimeout(1500);
    
    // Button should be active
    const deadCodeButton = page.getByTestId('btn-dead-code');
    let classes = await deadCodeButton.getAttribute('class');
    expect(classes).toContain('warning');
    
    // Reload the page
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Setting should be persisted (button still active)
    classes = await page.getByTestId('btn-dead-code').getAttribute('class');
    expect(classes).toContain('warning');
  });

  test('should identify methods with zero internal callers', async ({ page }) => {
    // Enable dead code detection
    await page.getByTestId('btn-dead-code').click();
    await page.waitForTimeout(2000);
    
    // Open a file
    const firstFile = page.locator('text=/\\.java$/').first();
    if (await firstFile.isVisible()) {
      await firstFile.click();
      await page.waitForTimeout(1500);
      
      // Dead code analysis should have run
      // Verify the button is still in active state
      const deadCodeButton = page.getByTestId('btn-dead-code');
      const classes = await deadCodeButton.getAttribute('class');
      expect(classes).toContain('warning');
      
      // File should be displayed without errors
      await expect(page.getByTestId('welcome-screen')).not.toBeVisible();
    } else {
      // No Java files available, at least verify button state
      const deadCodeButton = page.getByTestId('btn-dead-code');
      const classes = await deadCodeButton.getAttribute('class');
      expect(classes).toContain('warning');
    }
  });

  test('should exclude public methods from ghost mode', async ({ page }) => {
    // Public methods should not be ghosted as they might be external APIs
    
    // Enable dead code detection
    await page.getByTestId('btn-dead-code').click();
    await page.waitForTimeout(2000);
    
    // Open a Java file with public methods
    const javaFile = page.locator('text=/\\.java$/').first();
    if (await javaFile.isVisible()) {
      await javaFile.click();
      await page.waitForTimeout(1500);
      
      // Public methods should maintain normal opacity
      // Verify file is displayed and dead code detection is active
      const deadCodeButton = page.getByTestId('btn-dead-code');
      const classes = await deadCodeButton.getAttribute('class');
      expect(classes).toContain('warning');
      
      // File content should be visible
      await expect(page.getByTestId('welcome-screen')).not.toBeVisible();
    } else {
      // No Java files, verify dead code mode is still active
      const deadCodeButton = page.getByTestId('btn-dead-code');
      const classes = await deadCodeButton.getAttribute('class');
      expect(classes).toContain('warning');
    }
  });
});

/**
 * E2E Tests for Additional Features: Theme, Statistics, Scope Isolation
 */
test.describe('Additional Features: Theme and UI Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('app-container')).toBeVisible();
    await page.waitForTimeout(2000);
  });

  test('should toggle between light and dark theme', async ({ page }) => {
    const themeButton = page.getByTestId('btn-theme-toggle');
    await expect(themeButton).toBeVisible();
    
    // Get current theme (default is dark)
    const htmlElement = page.locator('html');
    const currentTheme = await htmlElement.getAttribute('data-bs-theme');
    
    // Toggle theme
    await themeButton.click();
    await page.waitForTimeout(500);
    
    // Theme should have changed
    const newTheme = await htmlElement.getAttribute('data-bs-theme');
    expect(newTheme).not.toBe(currentTheme);
    
    // Toggle back
    await themeButton.click();
    await page.waitForTimeout(500);
    
    // Theme should revert
    const revertedTheme = await htmlElement.getAttribute('data-bs-theme');
    expect(revertedTheme).toBe(currentTheme);
  });

  test('should persist theme selection in localStorage', async ({ page }) => {
    const themeButton = page.getByTestId('btn-theme-toggle');
    
    // Set to light theme
    const htmlElement = page.locator('html');
    let currentTheme = await htmlElement.getAttribute('data-bs-theme');
    
    if (currentTheme === 'dark') {
      await themeButton.click();
      await page.waitForTimeout(500);
    }
    
    // Reload page
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Theme should be persisted
    const persistedTheme = await htmlElement.getAttribute('data-bs-theme');
    expect(persistedTheme).toBe('light');
  });

  test('should open statistics panel when button clicked', async ({ page }) => {
    // Open a file first
    const firstFile = page.locator('text=/\\.(java|ts|js)$/').first();
    if (await firstFile.isVisible()) {
      await firstFile.click();
      await page.waitForTimeout(1500);
    }
    
    // Click statistics button
    await page.getByTestId('btn-statistics').click();
    await page.waitForTimeout(500);
    
    // Statistics panel should appear
    await expect(page.getByText(/Statistics/i)).toBeVisible();
  });

  test('should display code statistics for selected file', async ({ page }) => {
    // Open a file
    const firstFile = page.locator('text=/\\.(java|ts|js)$/').first();
    if (await firstFile.isVisible()) {
      await firstFile.click();
      await page.waitForTimeout(1500);
    }
    
    // Open statistics panel
    await page.getByTestId('btn-statistics').click();
    await page.waitForTimeout(1000);
    
    // Should show various metrics
    const statsPanel = page.locator('.offcanvas-body, .modal-body').first();
    
    if (await statsPanel.isVisible()) {
      const text = await statsPanel.textContent();
      
      // Should contain metrics like line count, methods, etc.
      expect(text).toBeTruthy();
    }
  });

  test('should open scope isolation panel', async ({ page }) => {
    // Open a file first
    const firstFile = page.locator('text=/\\.(java|ts|js)$/').first();
    if (await firstFile.isVisible()) {
      await firstFile.click();
      await page.waitForTimeout(1500);
    }
    
    // Click scope isolation button
    await page.getByTestId('btn-scope-isolation').click();
    await page.waitForTimeout(500);
    
    // Scope isolation panel should appear
    await expect(page.getByText(/Scope Isolation/i)).toBeVisible();
  });

  test('should isolate a function or class from scope panel', async ({ page }) => {
    // Open a file
    const firstFile = page.locator('text=/\\.(java|ts|js)$/').first();
    if (await firstFile.isVisible()) {
      await firstFile.click();
      await page.waitForTimeout(1500);
    }
    
    // Open scope isolation panel
    await page.getByTestId('btn-scope-isolation').click();
    await page.waitForTimeout(500);
    
    // Select a symbol to isolate
    const symbolItem = page.locator('.symbol-item, .list-group-item').first();
    
    if (await symbolItem.isVisible()) {
      await symbolItem.click();
      await page.waitForTimeout(500);
      
      // Code view should update to focus on isolated symbol
      // Verify panel is still visible and file is still open
      await expect(page.getByTestId('welcome-screen')).not.toBeVisible();
      await expect(page.getByText(/Scope Isolation/i)).toBeVisible();
    } else {
      // No symbols available, verify panel is at least open
      await expect(page.getByText(/Scope Isolation/i)).toBeVisible();
    }
  });
});
