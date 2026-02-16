import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Helper function to save screenshot to both test-results and docs/images directories
 */
async function saveScreenshot(page: any, filename: string) {
  const testResultsPath = `test-results/screenshots/${filename}`;
  const docsPath = `../docs/images/screenshots/${filename}`;
  
  // Save to test-results (for test verification)
  await page.screenshot({ path: testResultsPath, fullPage: true });
  
  // Copy to docs/images (for documentation)
  const docsDir = path.dirname(docsPath);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  fs.copyFileSync(testResultsPath, docsPath);
}

/**
 * Comprehensive Screenshot Test Suite
 * 
 * This test captures screenshots of the CodeCom system at various stages and scenarios.
 * Screenshots are saved to both:
 * - test-results/screenshots/ (for test verification)
 * - docs/images/screenshots/ (for documentation in USER_MANUAL.md)
 * 
 * Coverage:
 * - Welcome screen (light and dark themes)
 * - Main UI components and layout
 * - Symbol search interface
 * - Detail control panels
 * - Various UI modals and dialogs
 * - Theme switcher
 * - File explorer UI
 * - Code viewer and advanced features
 * 
 * Note: This test suite focuses on UI component screenshots and does not require
 * full backend connectivity for all scenarios.
 */

test.describe('CodeCom Screenshots - UI Walkthrough', () => {
  
  test('01 - Welcome screen in light theme', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Ensure light theme
    const htmlElement = page.locator('html');
    let currentTheme = await htmlElement.getAttribute('data-bs-theme');
    if (currentTheme === 'dark') {
      await page.getByTestId('theme-toggle').click();
      await page.waitForTimeout(300);
    }
    
    await expect(page.getByTestId('welcome-screen')).toBeVisible();
    await saveScreenshot(page, '01-welcome-light.png');
  });

  test('02 - Welcome screen in dark theme', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Ensure dark theme
    const htmlElement = page.locator('html');
    let currentTheme = await htmlElement.getAttribute('data-bs-theme');
    if (currentTheme === 'light') {
      await page.getByTestId('theme-toggle').click();
      await page.waitForTimeout(300);
    }
    
    await expect(page.getByTestId('welcome-screen')).toBeVisible();
    await saveScreenshot(page, '02-welcome-dark.png');
  });

  test('03 - Main application layout and file explorer', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Verify main components are present
    await expect(page.getByTestId('navbar')).toBeVisible();
    await expect(page.getByTestId('lod-select')).toBeVisible();
    await expect(page.getByTestId('theme-toggle')).toBeVisible();
    
    await saveScreenshot(page, '03-main-layout.png');
  });

  test('04 - Toolbar buttons and controls', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Check all toolbar buttons are visible
    await expect(page.getByTestId('search-button')).toBeVisible();
    await expect(page.getByTestId('stats-button')).toBeVisible();
    await expect(page.getByTestId('detail-button')).toBeVisible();
    
    await saveScreenshot(page, '04-toolbar-controls.png');
  });

  test('05 - Symbol search dialog', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open symbol search
    const searchButton = page.getByTestId('search-button');
    await searchButton.click();
    await page.waitForTimeout(500);
    
    await saveScreenshot(page, '05-symbol-search-dialog.png');
  });

  test('06 - Symbol search with query', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open symbol search
    const searchButton = page.getByTestId('search-button');
    await searchButton.click();
    await page.waitForTimeout(300);
    
    // Type a search query
    const searchInput = page.locator('input[type="text"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('Service');
      await page.waitForTimeout(500);
    }
    
    await saveScreenshot(page, '06-symbol-search-with-query.png');
  });

  test('07 - Level of Detail selector', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Highlight the LoD selector
    const lodSelect = page.getByTestId('lod-select');
    await expect(lodSelect).toBeVisible();
    
    await saveScreenshot(page, '07-lod-selector.png');
  });

  test('08 - Theme toggle interaction', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Get theme toggle button
    const themeToggle = page.getByTestId('theme-toggle');
    await expect(themeToggle).toBeVisible();
    
    // Get initial theme
    const htmlElement = page.locator('html');
    const initialTheme = await htmlElement.getAttribute('data-bs-theme');
    
    // Toggle theme
    await themeToggle.click();
    await page.waitForTimeout(300);
    
    await saveScreenshot(page, '08-theme-toggled.png');
  });

  test('09 - File explorer expanded view', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Try to expand some folders if available
    try {
      await page.waitForSelector('[data-testid="folder-node"]', { timeout: 3000 });
      const folders = page.locator('[data-testid="folder-node"]');
      const count = await folders.count();
      if (count > 0) {
        // Click first folder
        await folders.first().click();
        await page.waitForTimeout(300);
        // Click second folder if available
        if (count > 1) {
          await folders.nth(1).click();
          await page.waitForTimeout(300);
        }
      }
    } catch (e) {
      // Continue even if folder expansion fails
    }
    
    await saveScreenshot(page, '09-file-explorer-expanded.png');
  });

  test('10 - Statistics button highlight', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    const statsButton = page.getByTestId('stats-button');
    await expect(statsButton).toBeVisible();
    
    await saveScreenshot(page, '10-stats-button.png');
  });

  test('11 - Detail button highlight', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    const detailButton = page.getByTestId('detail-button');
    await expect(detailButton).toBeVisible();
    
    await saveScreenshot(page, '11-detail-button.png');
  });

  test('12 - Export button if available', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    const exportButton = page.getByTestId('export-button');
    if (await exportButton.count() > 0) {
      await expect(exportButton).toBeVisible();
    }
    
    await saveScreenshot(page, '12-export-button.png');
  });

  test('13 - Complexity heatmap button if available', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    const heatmapButton = page.getByTestId('heatmap-button');
    if (await heatmapButton.count() > 0) {
      await expect(heatmapButton).toBeVisible();
    }
    
    await saveScreenshot(page, '13-heatmap-button.png');
  });

  test('14 - Flow graph button if available', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    const flowGraphButton = page.getByTestId('flow-graph-button');
    if (await flowGraphButton.count() > 0) {
      await expect(flowGraphButton).toBeVisible();
    }
    
    await saveScreenshot(page, '14-flow-graph-button.png');
  });

  test('15 - State machine button if available', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    const stateMachineButton = page.getByTestId('state-machine-button');
    if (await stateMachineButton.count() > 0) {
      await expect(stateMachineButton).toBeVisible();
    }
    
    await saveScreenshot(page, '15-state-machine-button.png');
  });

  test('16 - Feature slice button if available', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    const sliceButton = page.getByTestId('slice-button');
    if (await sliceButton.count() > 0) {
      await expect(sliceButton).toBeVisible();
    }
    
    await saveScreenshot(page, '16-feature-slice-button.png');
  });

  test('17 - Knowledge graph button if available', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    const graphButton = page.getByTestId('graph-button');
    if (await graphButton.count() > 0) {
      await expect(graphButton).toBeVisible();
    }
    
    await saveScreenshot(page, '17-knowledge-graph-button.png');
  });

  test('18 - Navbar with all controls', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    const navbar = page.getByTestId('navbar');
    await expect(navbar).toBeVisible();
    
    await saveScreenshot(page, '18-navbar-complete.png');
  });

  test('19 - Application title', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    const appTitle = page.getByTestId('app-title');
    await expect(appTitle).toBeVisible();
    await expect(appTitle).toContainText('CodeCom');
    
    await saveScreenshot(page, '19-app-title.png');
  });

  test('20 - Full page overview - light theme', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Ensure light theme
    const htmlElement = page.locator('html');
    let currentTheme = await htmlElement.getAttribute('data-bs-theme');
    if (currentTheme === 'dark') {
      await page.getByTestId('theme-toggle').click();
      await page.waitForTimeout(300);
    }
    
    await saveScreenshot(page, '20-full-page-light.png');
  });

  test('21 - Full page overview - dark theme', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Ensure dark theme
    const htmlElement = page.locator('html');
    let currentTheme = await htmlElement.getAttribute('data-bs-theme');
    if (currentTheme === 'light') {
      await page.getByTestId('theme-toggle').click();
      await page.waitForTimeout(300);
    }
    
    await saveScreenshot(page, '21-full-page-dark.png');
  });

  test('22 - Statistics modal opened', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open stats modal if button exists
    const statsButton = page.getByTestId('stats-button');
    if (await statsButton.count() > 0) {
      await statsButton.click();
      await page.waitForTimeout(500);
    }
    
    await saveScreenshot(page, '22-statistics-modal.png');
  });

  test('23 - Detail controls panel opened', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open detail controls panel if button exists
    const detailButton = page.getByTestId('detail-button');
    if (await detailButton.count() > 0) {
      await detailButton.click();
      await page.waitForTimeout(500);
    }
    
    await saveScreenshot(page, '23-detail-controls-panel.png');
  });

  test('24 - Complexity heatmap modal opened', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open heatmap modal if button exists
    const heatmapButton = page.getByTestId('heatmap-button');
    if (await heatmapButton.count() > 0) {
      await heatmapButton.click();
      await page.waitForTimeout(1000);
    }
    
    await saveScreenshot(page, '24-complexity-heatmap.png');
  });

  test('25 - Flow graph modal opened', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open flow graph modal if button exists
    const flowGraphButton = page.getByTestId('flow-graph-button');
    if (await flowGraphButton.count() > 0) {
      await flowGraphButton.click();
      await page.waitForTimeout(1500);
    }
    
    await saveScreenshot(page, '25-flow-graph.png');
  });

  test('26 - State machine modal opened', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open state machine modal if button exists
    const stateMachineButton = page.getByTestId('state-machine-button');
    if (await stateMachineButton.count() > 0) {
      await stateMachineButton.click();
      await page.waitForTimeout(1000);
    }
    
    await saveScreenshot(page, '26-state-machine.png');
  });

  test('27 - Feature slice modal opened', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open feature slice modal if button exists
    const sliceButton = page.getByTestId('slice-button');
    if (await sliceButton.count() > 0) {
      await sliceButton.click();
      await page.waitForTimeout(500);
    }
    
    await saveScreenshot(page, '27-feature-slice.png');
  });

  test('28 - Knowledge graph modal opened', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open knowledge graph modal if button exists
    const graphButton = page.getByTestId('graph-button');
    if (await graphButton.count() > 0) {
      await graphButton.click();
      await page.waitForTimeout(1000);
    }
    
    await saveScreenshot(page, '28-knowledge-graph.png');
  });

  test('29 - Export modal opened', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Try to open a file first to enable export button
    try {
      await page.waitForSelector('[data-testid="file-node"]', { timeout: 3000 });
      const files = page.locator('[data-testid="file-node"]');
      const count = await files.count();
      if (count > 0) {
        await files.first().click();
        await page.waitForTimeout(500);
      }
    } catch (e) {
      // Continue even if file opening fails
    }
    
    // Open export modal if button exists and is enabled
    const exportButton = page.getByTestId('export-button');
    if (await exportButton.count() > 0) {
      const isEnabled = await exportButton.isEnabled();
      if (isEnabled) {
        await exportButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    await saveScreenshot(page, '29-export-modal.png');
  });

  test('30 - Level of Detail dropdown expanded', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Click on LoD selector to open dropdown
    const lodSelect = page.getByTestId('lod-select');
    if (await lodSelect.count() > 0) {
      await lodSelect.click();
      await page.waitForTimeout(300);
    }
    
    await saveScreenshot(page, '30-lod-dropdown.png');
  });

  test('31 - Breadcrumb navigation example', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Try to open a file to show breadcrumbs
    try {
      await page.waitForSelector('[data-testid="file-node"]', { timeout: 3000 });
      const files = page.locator('[data-testid="file-node"]');
      const count = await files.count();
      if (count > 0) {
        await files.first().click();
        await page.waitForTimeout(500);
      }
    } catch (e) {
      // Continue even if file opening fails
    }
    
    await saveScreenshot(page, '31-breadcrumb-navigation.png');
  });

  test('32 - File opened with code viewer', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Try to open a file
    try {
      await page.waitForSelector('[data-testid="file-node"]', { timeout: 3000 });
      const files = page.locator('[data-testid="file-node"]');
      const count = await files.count();
      if (count > 0) {
        await files.first().click();
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      // Continue even if file opening fails
    }
    
    await saveScreenshot(page, '32-code-viewer.png');
  });

  test('33 - Code minimap visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Try to open a file to show minimap
    try {
      await page.waitForSelector('[data-testid="file-node"]', { timeout: 3000 });
      const files = page.locator('[data-testid="file-node"]');
      const count = await files.count();
      if (count > 0) {
        await files.first().click();
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      // Continue even if file opening fails
    }
    
    await saveScreenshot(page, '33-code-minimap.png');
  });

  test('34 - Multiple tabs opened', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Try to open multiple files
    try {
      await page.waitForSelector('[data-testid="file-node"]', { timeout: 3000 });
      const files = page.locator('[data-testid="file-node"]');
      const count = await files.count();
      if (count > 1) {
        await files.nth(0).click();
        await page.waitForTimeout(300);
        await files.nth(1).click();
        await page.waitForTimeout(300);
        if (count > 2) {
          await files.nth(2).click();
          await page.waitForTimeout(300);
        }
      }
    } catch (e) {
      // Continue even if file opening fails
    }
    
    await saveScreenshot(page, '34-multiple-tabs.png');
  });

  test('35 - Scope isolation view', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Try to open a file and activate scope isolation
    try {
      await page.waitForSelector('[data-testid="file-node"]', { timeout: 3000 });
      const files = page.locator('[data-testid="file-node"]');
      const count = await files.count();
      if (count > 0) {
        await files.first().click();
        await page.waitForTimeout(1000);
        
        // Try to click on a method/class to isolate scope
        const codeElements = page.locator('.code-element, .method-element, .class-element');
        const elemCount = await codeElements.count();
        if (elemCount > 0) {
          await codeElements.first().click();
          await page.waitForTimeout(500);
        }
      }
    } catch (e) {
      // Continue even if scope isolation fails
    }
    
    await saveScreenshot(page, '35-scope-isolation.png');
  });
});
