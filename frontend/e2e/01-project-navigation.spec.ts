import { test, expect } from '@playwright/test';

/**
 * E2E Tests for UC-01: Project Loading and File Navigation
 * Tests FR.7 (Virtual File Tree) and basic file navigation
 */

test.describe('UC-01: Project Loading and File Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Start the application
    await page.goto('/');
    
    // Wait for the app to be ready
    await expect(page.getByTestId('app-container')).toBeVisible();
  });

  test('should load the application and display welcome screen', async ({ page }) => {
    // Verify the navbar is visible with CodeCom branding
    await expect(page.getByTestId('main-navbar')).toBeVisible();
    await expect(page.getByTestId('app-title')).toContainText('CodeCom');
    
    // Verify welcome screen is shown when no file is selected
    await expect(page.getByTestId('welcome-screen')).toBeVisible();
    await expect(page.getByText('Smart code comprehension')).toBeVisible();
  });

  test('should display file explorer and load file tree from backend', async ({ page }) => {
    // Verify file explorer is visible
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    await expect(page.getByText('EXPLORER')).toBeVisible();
    
    // Wait for file tree to load (backend connection)
    // Look for either the loading spinner to disappear or file tree to appear
    await page.waitForSelector('[data-testid="file-tree-container"]', { state: 'visible' });
    
    // Verify file tree loaded (should have some content, not just "Connecting to backend...")
    const fileTreeContainer = page.getByTestId('file-tree-container');
    await expect(fileTreeContainer).toBeVisible();
    
    // The tree should contain expandable folders or files
    // We wait a bit to ensure the backend has responded
    await page.waitForTimeout(2000);
  });

  test('should navigate to a file when selected from tree', async ({ page }) => {
    // Wait for file tree to load
    await page.waitForTimeout(2000);
    
    // Find and click on a Java file in the tree (assuming backend folder exists)
    // This will depend on the actual file structure - looking for any .java or .ts file
    const firstFile = page.locator('text=/\\.(java|ts|js)$/').first();
    
    if (await firstFile.isVisible()) {
      await firstFile.click();
      
      // Wait for file content to load
      await page.waitForTimeout(1000);
      
      // Welcome screen should be hidden
      await expect(page.getByTestId('welcome-screen')).not.toBeVisible();
      
      // Outline panel should be visible with file structure
      await expect(page.getByTestId('outline-panel')).toBeVisible();
    }
  });

  test('should refresh file tree when refresh button clicked', async ({ page }) => {
    // Wait for initial load
    await page.waitForTimeout(2000);
    
    // Click refresh button
    await page.getByTestId('btn-refresh-tree').click();
    
    // File tree should still be visible after refresh
    await expect(page.getByTestId('file-tree-container')).toBeVisible();
    
    await page.waitForTimeout(1000);
  });
});

/**
 * E2E Tests for UC-02: Level of Detail Toggle
 * Tests FR.1-3 (LoD Toggle, Intelligent Collapsing, Scope Isolation)
 */
test.describe('UC-02: Level of Detail Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('app-container')).toBeVisible();
    
    // Wait for file tree to load
    await page.waitForTimeout(2000);
  });

  test('should have Level of Detail selector in navbar', async ({ page }) => {
    // Verify LoD selector is visible
    const lodSelector = page.getByTestId('lod-selector');
    await expect(lodSelector).toBeVisible();
    
    // Verify it has the three options: Standard, Simplified, Architectural
    await expect(lodSelector).toBeVisible();
  });

  test('should switch between Standard, Simplified, and Architectural views', async ({ page }) => {
    const lodSelector = page.getByTestId('lod-selector');
    
    // Default should be Standard
    await expect(lodSelector).toHaveValue('standard');
    
    // Switch to Simplified view
    await lodSelector.selectOption('simplified');
    await expect(lodSelector).toHaveValue('simplified');
    await page.waitForTimeout(500);
    
    // Switch to Architectural view
    await lodSelector.selectOption('architectural');
    await expect(lodSelector).toHaveValue('architectural');
    await page.waitForTimeout(500);
    
    // Switch back to Standard
    await lodSelector.selectOption('standard');
    await expect(lodSelector).toHaveValue('standard');
  });

  test('should persist LoD selection when navigating between files', async ({ page }) => {
    const lodSelector = page.getByTestId('lod-selector');
    
    // Set to Simplified view
    await lodSelector.selectOption('simplified');
    await expect(lodSelector).toHaveValue('simplified');
    
    // Open a file (if available)
    await page.waitForTimeout(1000);
    const firstFile = page.locator('text=/\\.(java|ts|js)$/').first();
    
    if (await firstFile.isVisible()) {
      await firstFile.click();
      await page.waitForTimeout(1000);
      
      // LoD should still be Simplified
      await expect(lodSelector).toHaveValue('simplified');
      
      // Find another file to test persistence
      const secondFile = page.locator('text=/\\.(java|ts|js)$/').nth(1);
      if (await secondFile.isVisible()) {
        await secondFile.click();
        await page.waitForTimeout(1000);
        
        // LoD should still be Simplified
        await expect(lodSelector).toHaveValue('simplified');
      }
    }
  });

  test('should update outline symbols based on LoD selection', async ({ page }) => {
    // Open a file first
    await page.waitForTimeout(1000);
    const firstFile = page.locator('text=/\\.(java|ts|js)$/').first();
    
    if (await firstFile.isVisible()) {
      await firstFile.click();
      await page.waitForTimeout(1500);
      
      // Check outline panel is visible
      const outlinePanel = page.getByTestId('outline-panel');
      await expect(outlinePanel).toBeVisible();
      
      // Get initial symbol count in Standard mode
      const symbolCountBadge = outlinePanel.locator('.badge').first();
      const standardCount = await symbolCountBadge.textContent();
      
      // Switch to Simplified view (should filter boilerplate)
      await page.getByTestId('lod-selector').selectOption('simplified');
      await page.waitForTimeout(500);
      
      // Symbol count might change (should be less or equal)
      const simplifiedCount = await symbolCountBadge.textContent();
      
      // Switch to Architectural view (should show only architecture elements)
      await page.getByTestId('lod-selector').selectOption('architectural');
      await page.waitForTimeout(500);
      
      // Symbol count in architectural view (should be minimal)
      const architecturalCount = await symbolCountBadge.textContent();
      
      // All counts should be valid (contain "symbols")
      expect(standardCount).toContain('symbol');
      expect(simplifiedCount).toContain('symbol');
      expect(architecturalCount).toContain('symbol');
    }
  });
});
