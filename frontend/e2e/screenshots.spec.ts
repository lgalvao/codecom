import { test, expect } from '@playwright/test';

/**
 * Comprehensive Screenshot Test Suite
 * 
 * This test captures screenshots of the CodeCom system at various stages and scenarios.
 * All screenshots are saved to test-results/screenshots.spec.ts-chromium/
 * 
 * Coverage:
 * - Welcome screen (light and dark themes)
 * - File navigation and code viewing
 * - Code highlighting (Java, TypeScript, JavaScript)
 * - Detail control panel (various filter modes)
 * - Code statistics
 * - Symbol search
 * - Tab management
 * - Package navigation
 * - Caller list and test references
 * - Export dialog
 * - Complexity heatmap
 * - Code mini-map (DNA strip)
 * - Flow graph visualization
 * - State machine visualization
 * - Feature slice manager
 * - Knowledge graph view
 * - Breadcrumb navigation
 * - Click navigation mode
 */

test.describe('CodeCom Screenshots - Complete System Walkthrough', () => {
  
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

  test('03 - File tree navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Expand several folders to show tree structure
    await page.waitForSelector('[data-testid="folder-node"]');
    const backendFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'backend' }).first();
    await backendFolder.click();
    await page.waitForTimeout(300);
    
    const srcFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'src' }).first();
    await srcFolder.click();
    await page.waitForTimeout(300);
    
    await page.screenshot({ path: 'test-results/screenshots/03-file-tree-expanded.png', fullPage: true });
  });

  test('04 - Java file with syntax highlighting', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Navigate to and open a Java file
    await page.waitForSelector('[data-testid="folder-node"]');
    const backendFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'backend' }).first();
    await backendFolder.click();
    await page.waitForTimeout(300);
    
    const srcFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'src' }).first();
    await srcFolder.click();
    await page.waitForTimeout(300);
    
    const javaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).first();
    await javaFile.click();
    await expect(page.getByTestId('code-highlighter')).toBeVisible({ timeout: 5000 });
    
    await page.screenshot({ path: 'test-results/screenshots/04-java-file-syntax-highlighting.png', fullPage: true });
  });

  test('05 - TypeScript file with syntax highlighting', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Navigate to and open a TypeScript file
    await page.waitForSelector('[data-testid="folder-node"]');
    const frontendFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'frontend' }).first();
    await frontendFolder.click();
    await page.waitForTimeout(300);
    
    const srcFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'src' }).first();
    await srcFolder.click();
    await page.waitForTimeout(300);
    
    const tsFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.ts' }).first();
    if (await tsFile.count() > 0) {
      await tsFile.click();
      await expect(page.getByTestId('code-highlighter')).toBeVisible({ timeout: 5000 });
      await page.screenshot({ path: 'test-results/screenshots/05-typescript-file-syntax-highlighting.png', fullPage: true });
    }
  });

  test('06 - Vue file with syntax highlighting', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Navigate to and open a Vue file
    await page.waitForSelector('[data-testid="folder-node"]');
    const frontendFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'frontend' }).first();
    await frontendFolder.click();
    await page.waitForTimeout(300);
    
    const srcFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'src' }).first();
    await srcFolder.click();
    await page.waitForTimeout(300);
    
    const componentsFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'components' }).first();
    await componentsFolder.click();
    await page.waitForTimeout(300);
    
    const vueFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.vue' }).first();
    await vueFile.click();
    await expect(page.getByTestId('code-highlighter')).toBeVisible({ timeout: 5000 });
    
    await page.screenshot({ path: 'test-results/screenshots/06-vue-file-syntax-highlighting.png', fullPage: true });
  });

  test('07 - Code statistics panel', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open a Java file first
    await page.waitForSelector('[data-testid="folder-node"]');
    const backendFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'backend' }).first();
    await backendFolder.click();
    await page.waitForTimeout(300);
    
    const srcFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'src' }).first();
    await srcFolder.click();
    await page.waitForTimeout(300);
    
    const javaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).first();
    await javaFile.click();
    await expect(page.getByTestId('code-highlighter')).toBeVisible({ timeout: 5000 });
    
    // Open statistics panel
    const statsButton = page.getByTestId('stats-button');
    await statsButton.click();
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'test-results/screenshots/07-code-statistics-panel.png', fullPage: true });
  });

  test('08 - Detail control panel - all options visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open a Java file first
    await page.waitForSelector('[data-testid="folder-node"]');
    const backendFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'backend' }).first();
    await backendFolder.click();
    await page.waitForTimeout(300);
    
    const srcFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'src' }).first();
    await srcFolder.click();
    await page.waitForTimeout(300);
    
    const javaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).first();
    await javaFile.click();
    await expect(page.getByTestId('code-highlighter')).toBeVisible({ timeout: 5000 });
    
    // Open detail control panel
    const detailButton = page.getByTestId('detail-button');
    await detailButton.click();
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'test-results/screenshots/08-detail-control-panel.png', fullPage: true });
  });

  test('09 - Detail control - signatures only mode', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open a Java file
    await page.waitForSelector('[data-testid="folder-node"]');
    const backendFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'backend' }).first();
    await backendFolder.click();
    await page.waitForTimeout(300);
    
    const srcFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'src' }).first();
    await srcFolder.click();
    await page.waitForTimeout(300);
    
    const javaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).first();
    await javaFile.click();
    await expect(page.getByTestId('code-highlighter')).toBeVisible({ timeout: 5000 });
    
    // Open detail control and enable signatures only
    const detailButton = page.getByTestId('detail-button');
    await detailButton.click();
    await page.waitForTimeout(300);
    
    const signaturesToggle = page.getByTestId('toggle-method-bodies');
    await signaturesToggle.click();
    await page.waitForTimeout(300);
    
    // Close panel to see result
    await detailButton.click();
    await page.waitForTimeout(300);
    
    await page.screenshot({ path: 'test-results/screenshots/09-signatures-only-mode.png', fullPage: true });
  });

  test('10 - Detail control - no comments mode', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open a Java file
    await page.waitForSelector('[data-testid="folder-node"]');
    const backendFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'backend' }).first();
    await backendFolder.click();
    await page.waitForTimeout(300);
    
    const srcFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'src' }).first();
    await srcFolder.click();
    await page.waitForTimeout(300);
    
    const javaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).first();
    await javaFile.click();
    await expect(page.getByTestId('code-highlighter')).toBeVisible({ timeout: 5000 });
    
    // Open detail control and enable no comments
    const detailButton = page.getByTestId('detail-button');
    await detailButton.click();
    await page.waitForTimeout(300);
    
    const commentsToggle = page.getByTestId('toggle-comments');
    await commentsToggle.click();
    await page.waitForTimeout(300);
    
    // Close panel
    await detailButton.click();
    await page.waitForTimeout(300);
    
    await page.screenshot({ path: 'test-results/screenshots/10-no-comments-mode.png', fullPage: true });
  });

  test('11 - Symbol search dialog', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open symbol search
    const searchButton = page.getByTestId('search-button');
    await searchButton.click();
    await page.waitForTimeout(500);
    
    // Type a search query
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('Service');
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'test-results/screenshots/11-symbol-search.png', fullPage: true });
  });

  test('12 - Tab management with multiple tabs', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open multiple files to create tabs
    await page.waitForSelector('[data-testid="folder-node"]');
    const backendFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'backend' }).first();
    await backendFolder.click();
    await page.waitForTimeout(300);
    
    const srcFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'src' }).first();
    await srcFolder.click();
    await page.waitForTimeout(300);
    
    // Open first file
    const firstFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).first();
    await firstFile.click();
    await expect(page.getByTestId('code-highlighter')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(300);
    
    // Open second file
    const secondFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).nth(1);
    await secondFile.click();
    await page.waitForTimeout(500);
    
    // Open third file
    const thirdFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).nth(2);
    await thirdFile.click();
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'test-results/screenshots/12-multiple-tabs.png', fullPage: true });
  });

  test('13 - Package navigation controls', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open a Java file to show package navigation
    await page.waitForSelector('[data-testid="folder-node"]');
    const backendFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'backend' }).first();
    await backendFolder.click();
    await page.waitForTimeout(300);
    
    const srcFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'src' }).first();
    await srcFolder.click();
    await page.waitForTimeout(300);
    
    const javaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).first();
    await javaFile.click();
    await expect(page.getByTestId('code-highlighter')).toBeVisible({ timeout: 5000 });
    
    // Package navigation should be visible
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/screenshots/13-package-navigation.png', fullPage: true });
  });

  test('14 - Export dialog', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open a file first
    await page.waitForSelector('[data-testid="folder-node"]');
    const backendFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'backend' }).first();
    await backendFolder.click();
    await page.waitForTimeout(300);
    
    const srcFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'src' }).first();
    await srcFolder.click();
    await page.waitForTimeout(300);
    
    const javaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).first();
    await javaFile.click();
    await expect(page.getByTestId('code-highlighter')).toBeVisible({ timeout: 5000 });
    
    // Open export dialog
    const exportButton = page.getByTestId('export-button');
    if (await exportButton.count() > 0) {
      await exportButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/screenshots/14-export-dialog.png', fullPage: true });
    }
  });

  test('15 - Caller list panel', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open a Java file
    await page.waitForSelector('[data-testid="folder-node"]');
    const backendFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'backend' }).first();
    await backendFolder.click();
    await page.waitForTimeout(300);
    
    const srcFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'src' }).first();
    await srcFolder.click();
    await page.waitForTimeout(300);
    
    const javaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).first();
    await javaFile.click();
    await expect(page.getByTestId('code-highlighter')).toBeVisible({ timeout: 5000 });
    
    // Try to open caller list
    const callerButton = page.getByTestId('caller-button');
    if (await callerButton.count() > 0) {
      await callerButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/screenshots/15-caller-list.png', fullPage: true });
    }
  });

  test('16 - Test references panel', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open a Java file
    await page.waitForSelector('[data-testid="folder-node"]');
    const backendFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'backend' }).first();
    await backendFolder.click();
    await page.waitForTimeout(300);
    
    const srcFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'src' }).first();
    await srcFolder.click();
    await page.waitForTimeout(300);
    
    const javaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).first();
    await javaFile.click();
    await expect(page.getByTestId('code-highlighter')).toBeVisible({ timeout: 5000 });
    
    // Try to open test references
    const testButton = page.getByTestId('test-button');
    if (await testButton.count() > 0) {
      await testButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/screenshots/16-test-references.png', fullPage: true });
    }
  });

  test('17 - Complexity heatmap overlay', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open complexity heatmap
    const heatmapButton = page.getByTestId('heatmap-button');
    if (await heatmapButton.count() > 0) {
      await heatmapButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/screenshots/17-complexity-heatmap.png', fullPage: true });
    }
  });

  test('18 - Code mini-map (DNA strip)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open a Java file to show mini-map
    await page.waitForSelector('[data-testid="folder-node"]');
    const backendFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'backend' }).first();
    await backendFolder.click();
    await page.waitForTimeout(300);
    
    const srcFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'src' }).first();
    await srcFolder.click();
    await page.waitForTimeout(300);
    
    const javaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).first();
    await javaFile.click();
    await expect(page.getByTestId('code-highlighter')).toBeVisible({ timeout: 5000 });
    
    // Wait for mini-map to render
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/screenshots/18-code-minimap.png', fullPage: true });
  });

  test('19 - Flow graph visualization', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open flow graph
    const flowGraphButton = page.getByTestId('flow-graph-button');
    if (await flowGraphButton.count() > 0) {
      await flowGraphButton.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'test-results/screenshots/19-flow-graph.png', fullPage: true });
    }
  });

  test('20 - State machine visualization', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open a Java file with state machine
    await page.waitForSelector('[data-testid="folder-node"]');
    const backendFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'backend' }).first();
    await backendFolder.click();
    await page.waitForTimeout(300);
    
    const srcFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'src' }).first();
    await srcFolder.click();
    await page.waitForTimeout(300);
    
    const javaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).first();
    await javaFile.click();
    await expect(page.getByTestId('code-highlighter')).toBeVisible({ timeout: 5000 });
    
    // Open state machine
    const stateMachineButton = page.getByTestId('state-machine-button');
    if (await stateMachineButton.count() > 0) {
      await stateMachineButton.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'test-results/screenshots/20-state-machine.png', fullPage: true });
    }
  });

  test('21 - Feature slice manager', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open feature slice manager
    const sliceButton = page.getByTestId('slice-button');
    if (await sliceButton.count() > 0) {
      await sliceButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/screenshots/21-feature-slice-manager.png', fullPage: true });
    }
  });

  test('22 - Knowledge graph view', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open knowledge graph
    const graphButton = page.getByTestId('graph-button');
    if (await graphButton.count() > 0) {
      await graphButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/screenshots/22-knowledge-graph.png', fullPage: true });
    }
  });

  test('23 - Breadcrumb navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open a Java file to show breadcrumb
    await page.waitForSelector('[data-testid="folder-node"]');
    const backendFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'backend' }).first();
    await backendFolder.click();
    await page.waitForTimeout(300);
    
    const srcFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'src' }).first();
    await srcFolder.click();
    await page.waitForTimeout(300);
    
    const javaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).first();
    await javaFile.click();
    await expect(page.getByTestId('code-highlighter')).toBeVisible({ timeout: 5000 });
    
    // Interact with breadcrumb if available
    const breadcrumb = page.getByTestId('breadcrumb-nav');
    if (await breadcrumb.count() > 0) {
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/screenshots/23-breadcrumb-navigation.png', fullPage: true });
    }
  });

  test('24 - Click navigation mode enabled', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Enable click navigation mode
    const clickNavToggle = page.getByTestId('click-nav-toggle');
    if (await clickNavToggle.count() > 0) {
      await clickNavToggle.click();
      await page.waitForTimeout(300);
    }
    
    // Open a file
    await page.waitForSelector('[data-testid="folder-node"]');
    const backendFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'backend' }).first();
    await backendFolder.click();
    await page.waitForTimeout(300);
    
    const srcFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'src' }).first();
    await srcFolder.click();
    await page.waitForTimeout(300);
    
    const javaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).first();
    await javaFile.click();
    await expect(page.getByTestId('code-highlighter')).toBeVisible({ timeout: 5000 });
    
    await page.screenshot({ path: 'test-results/screenshots/24-click-navigation-mode.png', fullPage: true });
  });

  test('25 - Scope isolation active', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open a Java file
    await page.waitForSelector('[data-testid="folder-node"]');
    const backendFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'backend' }).first();
    await backendFolder.click();
    await page.waitForTimeout(300);
    
    const srcFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'src' }).first();
    await srcFolder.click();
    await page.waitForTimeout(300);
    
    const javaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).first();
    await javaFile.click();
    await expect(page.getByTestId('code-highlighter')).toBeVisible({ timeout: 5000 });
    
    // Try to activate scope isolation
    const isolationButton = page.getByTestId('isolation-button');
    if (await isolationButton.count() > 0) {
      await isolationButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/screenshots/25-scope-isolation.png', fullPage: true });
    }
  });

  test('26 - Hover tooltip with code preview', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open a Java file
    await page.waitForSelector('[data-testid="folder-node"]');
    const backendFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'backend' }).first();
    await backendFolder.click();
    await page.waitForTimeout(300);
    
    const srcFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'src' }).first();
    await srcFolder.click();
    await page.waitForTimeout(300);
    
    const javaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).first();
    await javaFile.click();
    await expect(page.getByTestId('code-highlighter')).toBeVisible({ timeout: 5000 });
    
    // Hover over a symbol to trigger tooltip
    const codeContainer = page.locator('.shiki-container');
    await codeContainer.hover({ position: { x: 100, y: 100 } });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'test-results/screenshots/26-hover-tooltip.png', fullPage: true });
  });

  test('27 - Level of Detail (LoD) selector', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Highlight the LoD selector
    const lodSelect = page.getByTestId('lod-select');
    await expect(lodSelect).toBeVisible();
    
    await page.screenshot({ path: 'test-results/screenshots/27-lod-selector.png', fullPage: true });
  });

  test('28 - Full application layout overview', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Expand some folders and open a file to show full layout
    await page.waitForSelector('[data-testid="folder-node"]');
    const backendFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'backend' }).first();
    await backendFolder.click();
    await page.waitForTimeout(300);
    
    const srcFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'src' }).first();
    await srcFolder.click();
    await page.waitForTimeout(300);
    
    const javaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).first();
    await javaFile.click();
    await expect(page.getByTestId('code-highlighter')).toBeVisible({ timeout: 5000 });
    
    // Open statistics panel to show full layout
    const statsButton = page.getByTestId('stats-button');
    await statsButton.click();
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'test-results/screenshots/28-full-application-layout.png', fullPage: true });
  });
});
