import { test, expect } from '@playwright/test';

/**
 * Comprehensive Screenshot Test Suite
 * 
 * This test captures screenshots of the CodeCom system at various stages and scenarios.
 * All screenshots are saved to test-results/screenshots/
 * 
 * Coverage:
 * - Welcome screen (light and dark themes)
 * - Main UI components and layout
 * - Symbol search interface
 * - Detail control panels
 * - Various UI modals and dialogs
 * - Theme switcher
 * - File explorer UI
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
    await page.screenshot({ path: 'test-results/screenshots/01-welcome-light.png', fullPage: true });
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
    await page.screenshot({ path: 'test-results/screenshots/02-welcome-dark.png', fullPage: true });
  });

  test('03 - Main application layout and file explorer', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Verify main components are present
    await expect(page.getByTestId('navbar')).toBeVisible();
    await expect(page.getByTestId('lod-select')).toBeVisible();
    await expect(page.getByTestId('theme-toggle')).toBeVisible();
    
    await page.screenshot({ path: 'test-results/screenshots/03-main-layout.png', fullPage: true });
  });

  test('04 - Toolbar buttons and controls', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Check all toolbar buttons are visible
    await expect(page.getByTestId('search-button')).toBeVisible();
    await expect(page.getByTestId('stats-button')).toBeVisible();
    await expect(page.getByTestId('detail-button')).toBeVisible();
    
    await page.screenshot({ path: 'test-results/screenshots/04-toolbar-controls.png', fullPage: true });
  });

  test('05 - Symbol search dialog', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open symbol search
    const searchButton = page.getByTestId('search-button');
    await searchButton.click();
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'test-results/screenshots/05-symbol-search-dialog.png', fullPage: true });
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
    
    await page.screenshot({ path: 'test-results/screenshots/06-symbol-search-with-query.png', fullPage: true });
  });

  test('07 - Level of Detail selector', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Highlight the LoD selector
    const lodSelect = page.getByTestId('lod-select');
    await expect(lodSelect).toBeVisible();
    
    await page.screenshot({ path: 'test-results/screenshots/07-lod-selector.png', fullPage: true });
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
    
    await page.screenshot({ path: 'test-results/screenshots/08-theme-toggled.png', fullPage: true });
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
    
    await page.screenshot({ path: 'test-results/screenshots/09-file-explorer-expanded.png', fullPage: true });
  });

  test('10 - Statistics button highlight', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    const statsButton = page.getByTestId('stats-button');
    await expect(statsButton).toBeVisible();
    
    await page.screenshot({ path: 'test-results/screenshots/10-stats-button.png', fullPage: true });
  });

  test('11 - Detail button highlight', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    const detailButton = page.getByTestId('detail-button');
    await expect(detailButton).toBeVisible();
    
    await page.screenshot({ path: 'test-results/screenshots/11-detail-button.png', fullPage: true });
  });

  test('12 - Export button if available', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    const exportButton = page.getByTestId('export-button');
    if (await exportButton.count() > 0) {
      await expect(exportButton).toBeVisible();
    }
    
    await page.screenshot({ path: 'test-results/screenshots/12-export-button.png', fullPage: true });
  });

  test('13 - Complexity heatmap button if available', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    const heatmapButton = page.getByTestId('heatmap-button');
    if (await heatmapButton.count() > 0) {
      await expect(heatmapButton).toBeVisible();
    }
    
    await page.screenshot({ path: 'test-results/screenshots/13-heatmap-button.png', fullPage: true });
  });

  test('14 - Flow graph button if available', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    const flowGraphButton = page.getByTestId('flow-graph-button');
    if (await flowGraphButton.count() > 0) {
      await expect(flowGraphButton).toBeVisible();
    }
    
    await page.screenshot({ path: 'test-results/screenshots/14-flow-graph-button.png', fullPage: true });
  });

  test('15 - State machine button if available', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    const stateMachineButton = page.getByTestId('state-machine-button');
    if (await stateMachineButton.count() > 0) {
      await expect(stateMachineButton).toBeVisible();
    }
    
    await page.screenshot({ path: 'test-results/screenshots/15-state-machine-button.png', fullPage: true });
  });

  test('16 - Feature slice button if available', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    const sliceButton = page.getByTestId('slice-button');
    if (await sliceButton.count() > 0) {
      await expect(sliceButton).toBeVisible();
    }
    
    await page.screenshot({ path: 'test-results/screenshots/16-feature-slice-button.png', fullPage: true });
  });

  test('17 - Knowledge graph button if available', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    const graphButton = page.getByTestId('graph-button');
    if (await graphButton.count() > 0) {
      await expect(graphButton).toBeVisible();
    }
    
    await page.screenshot({ path: 'test-results/screenshots/17-knowledge-graph-button.png', fullPage: true });
  });

  test('18 - Navbar with all controls', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    const navbar = page.getByTestId('navbar');
    await expect(navbar).toBeVisible();
    
    await page.screenshot({ path: 'test-results/screenshots/18-navbar-complete.png', fullPage: true });
  });

  test('19 - Application title', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    const appTitle = page.getByTestId('app-title');
    await expect(appTitle).toBeVisible();
    await expect(appTitle).toContainText('CodeCom');
    
    await page.screenshot({ path: 'test-results/screenshots/19-app-title.png', fullPage: true });
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
    
    await page.screenshot({ path: 'test-results/screenshots/20-full-page-light.png', fullPage: true });
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
    
    await page.screenshot({ path: 'test-results/screenshots/21-full-page-dark.png', fullPage: true });
  });
});
