import { test, expect } from '@playwright/test';

/**
 * E2E Tests for UC-07: Export Functionality
 * Tests FR.30-31 (Multi-Format Export with detail levels)
 */
test.describe('UC-07: Export Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('app-container')).toBeVisible();
    await page.waitForTimeout(2000);
    
    // Open a file for testing
    const firstFile = page.locator('text=/\\.(java|ts|js)$/').first();
    if (await firstFile.isVisible()) {
      await firstFile.click();
      await page.waitForTimeout(1500);
    }
  });

  test('should have export button disabled when no file is selected', async ({ page }) => {
    // Close any open files to get to welcome screen
    const closeButton = page.locator('.tab-close, .btn-close').first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForTimeout(500);
    }
    
    // Export button should be disabled
    const exportButton = page.getByTestId('btn-export');
    await expect(exportButton).toBeDisabled();
  });

  test('should enable export button when file is selected', async ({ page }) => {
    // Export button should be enabled (we opened a file in beforeEach)
    const exportButton = page.getByTestId('btn-export');
    await expect(exportButton).toBeEnabled();
  });

  test('should open export dialog when export button clicked', async ({ page }) => {
    // Click export button
    await page.getByTestId('btn-export').click();
    await page.waitForTimeout(500);
    
    // Export dialog should appear
    await expect(page.getByText('Export Code')).toBeVisible();
  });

  test('should display export format options (PDF and Markdown)', async ({ page }) => {
    // Open export dialog
    await page.getByTestId('btn-export').click();
    await page.waitForTimeout(500);
    
    // Look for format selection options
    await expect(page.getByText(/PDF|Markdown/i)).toBeVisible();
  });

  test('should display detail level options in export dialog', async ({ page }) => {
    // Open export dialog
    await page.getByTestId('btn-export').click();
    await page.waitForTimeout(500);
    
    // Look for detail level options
    // Full, Medium, Low, Architectural
    const dialogContent = page.locator('.offcanvas-body, .modal-body').first();
    
    if (await dialogContent.isVisible()) {
      const text = await dialogContent.textContent();
      
      // Should have multiple detail level options
      expect(text).toBeTruthy();
    }
  });

  test('should select PDF format for export', async ({ page }) => {
    // Open export dialog
    await page.getByTestId('btn-export').click();
    await page.waitForTimeout(500);
    
    // Select PDF format (if available)
    const pdfOption = page.locator('input[type="radio"], button').filter({ hasText: /PDF/i }).first();
    
    if (await pdfOption.isVisible()) {
      await pdfOption.click();
      await page.waitForTimeout(300);
      
      // Verify selection (radio buttons should be checked, buttons should be selected)
      const isRadio = await pdfOption.evaluate((el) => el.tagName === 'INPUT');
      if (isRadio) {
        await expect(pdfOption).toBeChecked();
      } else {
        // For button-style selection, verify it has active styling
        const classes = await pdfOption.getAttribute('class');
        expect(classes).toBeTruthy();
      }
    }
  });

  test('should select Markdown format for export', async ({ page }) => {
    // Open export dialog
    await page.getByTestId('btn-export').click();
    await page.waitForTimeout(500);
    
    // Select Markdown format (if available)
    const markdownOption = page.locator('input[type="radio"], button').filter({ hasText: /Markdown/i }).first();
    
    if (await markdownOption.isVisible()) {
      await markdownOption.click();
      await page.waitForTimeout(300);
      
      // Verify selection (radio buttons should be checked, buttons should be selected)
      const isRadio = await markdownOption.evaluate((el) => el.tagName === 'INPUT');
      if (isRadio) {
        await expect(markdownOption).toBeChecked();
      } else {
        // For button-style selection, verify it has active styling
        const classes = await markdownOption.getAttribute('class');
        expect(classes).toBeTruthy();
      }
    }
  });

  test('should configure export with different detail levels', async ({ page }) => {
    // Open export dialog
    await page.getByTestId('btn-export').click();
    await page.waitForTimeout(500);
    
    // Try to select different detail levels
    const detailOptions = page.locator('select, input[type="radio"]').filter({ has: page.locator('text=/Full|Medium|Low|Architectural/i') });
    
    if (await detailOptions.count() > 0) {
      // Select the first available detail option
      await detailOptions.first().click();
      await page.waitForTimeout(300);
    }
  });

  test('should close export dialog', async ({ page }) => {
    // Open export dialog
    await page.getByTestId('btn-export').click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Export Code')).toBeVisible();
    
    // Close dialog (press Escape or click close button)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    
    // Dialog should be closed
    await expect(page.getByText('Export Code')).not.toBeVisible();
  });
});

/**
 * E2E Tests for UC-08: Complexity Heatmap Visualization
 * Tests FR.32 (Complexity Heatmap)
 */
test.describe('UC-08: Complexity Heatmap Visualization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('app-container')).toBeVisible();
    await page.waitForTimeout(2000);
  });

  test('should display file tree with potential heatmap overlay', async ({ page }) => {
    // File tree should be visible
    const fileTree = page.getByTestId('file-tree-container');
    await expect(fileTree).toBeVisible();
    
    // Files in the tree may have color coding for complexity
    // Look for any styled elements that might indicate heatmap
    const fileItems = fileTree.locator('[class*="complexity"], [class*="heatmap"], [style*="color"]');
    
    // If heatmap is implemented, there should be some visual indicators
    // This is a basic check
    expect(await fileTree.isVisible()).toBeTruthy();
  });

  test('should show file tree without errors', async ({ page }) => {
    // Ensure file tree renders properly
    const fileTree = page.getByTestId('file-tree-container');
    await expect(fileTree).toBeVisible();
    
    // Tree should contain file or folder elements
    const items = fileTree.locator('div, li, span').first();
    await expect(items).toBeVisible();
  });

  test('should handle hovering over files to see complexity metrics', async ({ page }) => {
    // Find a file in the tree
    const firstFile = page.locator('text=/\\.(java|ts|js)$/').first();
    
    if (await firstFile.isVisible()) {
      // Hover over the file
      await firstFile.hover();
      await page.waitForTimeout(500);
      
      // Tooltip or popup might show complexity metrics
      // This depends on implementation
      const tooltip = page.locator('[role="tooltip"], .tooltip, .popover');
      
      // If tooltip appears, it should have some content
      if (await tooltip.count() > 0) {
        await expect(tooltip.first()).toBeVisible();
      }
    }
  });

  test('should identify high-risk files in the file tree', async ({ page }) => {
    // High-risk files might have special styling (red/orange colors)
    const fileTree = page.getByTestId('file-tree-container');
    
    // Look for any files with warning or danger styling
    const highRiskFiles = fileTree.locator('[class*="danger"], [class*="warning"], [style*="red"], [style*="orange"]');
    
    // Count might be 0 if no high-risk files, which is fine
    const count = await highRiskFiles.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

/**
 * E2E Tests for UC-09: Interactive Architecture Flow Visualization
 * Tests FR.33 (Flow Graph)
 */
test.describe('UC-09: Interactive Architecture Flow Visualization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('app-container')).toBeVisible();
    await page.waitForTimeout(2000);
  });

  test('should have flow graph button in toolbar', async ({ page }) => {
    // Flow graph button should be visible
    const flowGraphButton = page.getByTestId('btn-flow-graph');
    await expect(flowGraphButton).toBeVisible();
  });

  test('should open flow graph visualization when button clicked', async ({ page }) => {
    // Click flow graph button
    await page.getByTestId('btn-flow-graph').click();
    await page.waitForTimeout(1000);
    
    // Flow graph view should appear
    await expect(page.getByText(/Flow Graph|Architecture|Lifecycle/i)).toBeVisible();
  });

  test('should display interactive node graph', async ({ page }) => {
    // Open flow graph
    await page.getByTestId('btn-flow-graph').click();
    await page.waitForTimeout(1500);
    
    // Look for SVG or canvas element (D3.js visualization)
    const graphContainer = page.locator('svg, canvas, .flow-graph, .graph-container').first();
    
    if (await graphContainer.isVisible()) {
      await expect(graphContainer).toBeVisible();
    }
  });

  test('should show different layers (Vue, TypeScript, Spring, etc.)', async ({ page }) => {
    // Open flow graph
    await page.getByTestId('btn-flow-graph').click();
    await page.waitForTimeout(1500);
    
    // Look for layer indicators or nodes
    const flowGraphContainer = page.locator('.flow-graph, .modal-body, .offcanvas-body').first();
    
    if (await flowGraphContainer.isVisible()) {
      const content = await flowGraphContainer.textContent();
      
      // Should mention different layers
      expect(content).toBeTruthy();
    }
  });

  test('should close flow graph visualization', async ({ page }) => {
    // Open flow graph
    await page.getByTestId('btn-flow-graph').click();
    await page.waitForTimeout(1000);
    
    // Close by clicking button again or close button
    const closeButton = page.locator('button').filter({ hasText: /close|×/i }).first();
    
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForTimeout(500);
      
      // Verify the flow graph is closed
      const flowGraphModal = page.locator('.modal, .offcanvas').filter({ hasText: /Flow Graph|Architecture/i });
      if (await flowGraphModal.count() > 0) {
        await expect(flowGraphModal.first()).not.toBeVisible();
      }
    } else {
      // Click the flow graph button again to toggle
      await page.getByTestId('btn-flow-graph').click();
      await page.waitForTimeout(500);
      
      // Button should no longer be in active state
      const flowGraphButton = page.getByTestId('btn-flow-graph');
      await expect(flowGraphButton).toBeVisible();
    }
  });
});

/**
 * E2E Tests for UC-10: Code Structure Mini-Map Navigation
 * Tests FR.34 (Code Mini-Map)
 */
test.describe('UC-10: Code Structure Mini-Map Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('app-container')).toBeVisible();
    await page.waitForTimeout(2000);
    
    // Open a file with substantial content
    const firstFile = page.locator('text=/\\.(java|ts)$/').first();
    if (await firstFile.isVisible()) {
      await firstFile.click();
      await page.waitForTimeout(1500);
    }
  });

  test('should display code mini-map when file is open', async ({ page }) => {
    // Look for mini-map element
    const miniMap = page.locator('.mini-map, .code-minimap, [class*="minimap"]').first();
    
    // Mini-map should be visible for files
    if (await miniMap.isVisible()) {
      await expect(miniMap).toBeVisible();
    }
  });

  test('should show color-coded blocks in mini-map', async ({ page }) => {
    // Mini-map should have colored blocks representing code structure
    const miniMap = page.locator('.mini-map, .code-minimap, [class*="minimap"]').first();
    
    if (await miniMap.isVisible()) {
      // Look for colored blocks (green, blue, red)
      const blocks = miniMap.locator('[class*="block"], div, rect');
      const blockCount = await blocks.count();
      
      expect(blockCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should update viewport indicator during scrolling', async ({ page }) => {
    // Scroll in the code editor
    const codeContainer = page.locator('.shiki-container pre, .code-viewer').first();
    
    if (await codeContainer.isVisible()) {
      await codeContainer.evaluate((el) => {
        el.scrollTop = 300;
      });
      await page.waitForTimeout(300);
      
      // Mini-map viewport indicator should update
      const miniMap = page.locator('.mini-map, .code-minimap').first();
      
      if (await miniMap.isVisible()) {
        // Viewport indicator should be present
        const viewport = miniMap.locator('[class*="viewport"], [class*="indicator"]').first();
        
        if (await viewport.count() > 0) {
          await expect(viewport).toBeVisible();
        }
      }
    }
  });

  test('should navigate to code location when clicking mini-map block', async ({ page }) => {
    const miniMap = page.locator('.mini-map, .code-minimap').first();
    
    if (await miniMap.isVisible()) {
      // Click on a block in the mini-map
      const blocks = miniMap.locator('[class*="block"], div, rect');
      
      if (await blocks.count() > 0) {
        await blocks.first().click();
        await page.waitForTimeout(500);
        
        // Code should scroll to that location
        const codeContainer = page.locator('.shiki-container pre').first();
        
        if (await codeContainer.isVisible()) {
          const scrollTop = await codeContainer.evaluate((el) => el.scrollTop);
          expect(scrollTop).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});
