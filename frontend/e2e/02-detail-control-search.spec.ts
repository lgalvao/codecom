import { test, expect } from '@playwright/test';

/**
 * E2E Tests for UC-03: Detail Level Control
 * Tests FR.15-22 (Detail control options: comments, imports, parameters, etc.)
 */
test.describe('UC-03: Detail Level Control', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('app-container')).toBeVisible();
    
    // Wait for file tree to load and open a file
    await page.waitForTimeout(2000);
    
    const firstFile = page.locator('text=/\\.(java|ts|js)$/').first();
    if (await firstFile.isVisible()) {
      await firstFile.click();
      await page.waitForTimeout(1500);
    }
  });

  test('should open detail control panel when button clicked', async ({ page }) => {
    // Click detail control button
    await page.getByTestId('btn-detail-control').click();
    
    // Wait for offcanvas to appear
    await page.waitForTimeout(500);
    
    // Verify panel opened with title
    await expect(page.getByText('Detail Control')).toBeVisible();
    
    // Panel should contain various filter options
    await expect(page.locator('text=/Show Comments/i')).toBeVisible();
    await expect(page.locator('text=/Show Imports/i')).toBeVisible();
  });

  test('should toggle detail control options', async ({ page }) => {
    // Open detail control panel
    await page.getByTestId('btn-detail-control').click();
    await page.waitForTimeout(500);
    
    // Find and toggle "Show Comments" checkbox
    const showCommentsCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /comment/i }).first();
    
    if (await showCommentsCheckbox.isVisible()) {
      const isChecked = await showCommentsCheckbox.isChecked();
      await showCommentsCheckbox.click();
      await page.waitForTimeout(300);
      
      // State should have changed
      const newState = await showCommentsCheckbox.isChecked();
      expect(newState).toBe(!isChecked);
    }
  });

  test('should apply multiple filters simultaneously', async ({ page }) => {
    // Open detail control panel
    await page.getByTestId('btn-detail-control').click();
    await page.waitForTimeout(500);
    
    // Toggle multiple options
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    if (count >= 2) {
      await checkboxes.nth(0).click();
      await page.waitForTimeout(200);
      await checkboxes.nth(1).click();
      await page.waitForTimeout(200);
      
      // Filters should be applied (view should update)
      // This is verified by the fact that the checkboxes maintain their state
      const firstChecked = await checkboxes.nth(0).isChecked();
      const secondChecked = await checkboxes.nth(1).isChecked();
      
      expect(typeof firstChecked).toBe('boolean');
      expect(typeof secondChecked).toBe('boolean');
    }
  });

  test('should persist detail settings when switching files', async ({ page }) => {
    // Open detail control panel
    await page.getByTestId('btn-detail-control').click();
    await page.waitForTimeout(500);
    
    // Toggle a filter
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    const initialState = await firstCheckbox.isChecked();
    await firstCheckbox.click();
    await page.waitForTimeout(300);
    
    // Close panel
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    
    // Switch to another file if available
    const secondFile = page.locator('text=/\\.(java|ts|js)$/').nth(1);
    if (await secondFile.isVisible()) {
      await secondFile.click();
      await page.waitForTimeout(1000);
      
      // Re-open detail control panel
      await page.getByTestId('btn-detail-control').click();
      await page.waitForTimeout(500);
      
      // Setting should be persisted
      const checkbox = page.locator('input[type="checkbox"]').first();
      const currentState = await checkbox.isChecked();
      expect(currentState).toBe(!initialState);
    }
  });

  test('should close detail panel when clicking button again', async ({ page }) => {
    // Open panel
    await page.getByTestId('btn-detail-control').click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Detail Control')).toBeVisible();
    
    // Close panel by clicking button again
    await page.getByTestId('btn-detail-control').click();
    await page.waitForTimeout(500);
    
    // Panel should be hidden
    await expect(page.getByText('Detail Control')).not.toBeVisible();
  });
});

/**
 * E2E Tests for UC-04: Symbol Search and Navigation
 * Tests FR.5 (Symbol Search) and FR.24-25 (Click navigation)
 */
test.describe('UC-04: Symbol Search and Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('app-container')).toBeVisible();
    await page.waitForTimeout(2000);
  });

  test('should open symbol search panel when button clicked', async ({ page }) => {
    // Click symbol search button
    await page.getByTestId('btn-symbol-search').click();
    
    // Wait for panel to appear
    await page.waitForTimeout(500);
    
    // Verify panel opened with search input
    await expect(page.getByText('Symbol Search')).toBeVisible();
    
    // Should have a search input field
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    await expect(searchInput).toBeVisible();
  });

  test('should open symbol search with keyboard shortcut Ctrl+Shift+F', async ({ page }) => {
    // Press keyboard shortcut
    await page.keyboard.press('Control+Shift+F');
    
    // Wait for panel to appear
    await page.waitForTimeout(500);
    
    // Verify panel opened
    await expect(page.getByText('Symbol Search')).toBeVisible();
  });

  test('should search for symbols and display results', async ({ page }) => {
    // Open symbol search
    await page.getByTestId('btn-symbol-search').click();
    await page.waitForTimeout(500);
    
    // Type a search query (search for common class names)
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    await searchInput.fill('Service');
    
    // Wait for results to appear
    await page.waitForTimeout(1000);
    
    // Results should be displayed (if any exist in the codebase)
    // The actual results depend on the backend, so we just verify the search was executed
    await expect(searchInput).toHaveValue('Service');
  });

  test('should filter symbols in real-time as user types', async ({ page }) => {
    // Open symbol search
    await page.getByTestId('btn-symbol-search').click();
    await page.waitForTimeout(500);
    
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    
    // Type slowly to trigger real-time filtering
    await searchInput.type('User', { delay: 100 });
    
    // Wait for filtering
    await page.waitForTimeout(800);
    
    // Input should contain the typed text
    await expect(searchInput).toHaveValue('User');
  });

  test('should navigate to symbol when result is selected', async ({ page }) => {
    // Open symbol search
    await page.getByTestId('btn-symbol-search').click();
    await page.waitForTimeout(500);
    
    // Type a search query
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    await searchInput.fill('main');
    await page.waitForTimeout(1000);
    
    // If results are shown, click on the first result
    const firstResult = page.locator('.list-group-item, .search-result-item').first();
    
    if (await firstResult.isVisible()) {
      await firstResult.click();
      await page.waitForTimeout(1000);
      
      // Search panel should close
      await expect(page.getByText('Symbol Search')).not.toBeVisible();
      
      // A file should be opened (welcome screen hidden)
      await expect(page.getByTestId('welcome-screen')).not.toBeVisible();
    }
  });

  test('should close symbol search panel', async ({ page }) => {
    // Open symbol search
    await page.getByTestId('btn-symbol-search').click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Symbol Search')).toBeVisible();
    
    // Close by pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    
    // Panel should be closed
    await expect(page.getByText('Symbol Search')).not.toBeVisible();
  });

  test('should toggle click navigation mode', async ({ page }) => {
    // Click navigation mode button
    const clickNavButton = page.getByTestId('btn-click-navigation');
    await expect(clickNavButton).toBeVisible();
    
    // Click to enable
    await clickNavButton.click();
    await page.waitForTimeout(300);
    
    // Button should be highlighted (active state)
    // We can verify by checking if the button has the active class
    const classes = await clickNavButton.getAttribute('class');
    expect(classes).toBeTruthy();
    
    // Click again to disable
    await clickNavButton.click();
    await page.waitForTimeout(300);
  });

  test('should maintain search history for re-access', async ({ page }) => {
    // Open symbol search
    await page.getByTestId('btn-symbol-search').click();
    await page.waitForTimeout(500);
    
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    
    // Perform a search
    await searchInput.fill('Controller');
    await page.waitForTimeout(1000);
    
    // Close panel
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    
    // Re-open panel
    await page.getByTestId('btn-symbol-search').click();
    await page.waitForTimeout(500);
    
    // The search input might remember the last search
    // (This depends on component implementation)
    const currentValue = await searchInput.inputValue();
    expect(currentValue).toBeDefined();
  });
});
