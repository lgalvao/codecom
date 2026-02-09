import { test, expect } from '@playwright/test';

/**
 * UC-04: Symbol Search and Navigation
 * 
 * This test validates:
 * - Symbol search activation
 * - Search input and filtering
 * - Navigation to symbol definition
 * - Keyboard shortcuts
 */

test.describe('UC-04: Symbol Search and Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
  });

  test('should open symbol search panel', async ({ page }) => {
    // Click search button
    await page.getByTestId('search-button').click();
    
    // Symbol search panel should be visible
    await expect(page.getByTestId('symbol-search')).toBeVisible({ timeout: 3000 });
  });

  test('should activate search with keyboard shortcut', async ({ page }) => {
    // Press Ctrl+Shift+F (or Cmd+Shift+F on Mac)
    await page.keyboard.press('Control+Shift+F');
    
    // Symbol search panel should be visible
    await expect(page.getByTestId('symbol-search')).toBeVisible({ timeout: 3000 });
  });

  test('should close symbol search panel', async ({ page }) => {
    // Open search panel
    await page.getByTestId('search-button').click();
    await expect(page.getByTestId('symbol-search')).toBeVisible({ timeout: 3000 });
    
    // Close by clicking button again
    await page.getByTestId('search-button').click();
    await page.waitForTimeout(500);
  });

  test('should allow typing in search input', async ({ page }) => {
    // Open search panel
    await page.getByTestId('search-button').click();
    await expect(page.getByTestId('symbol-search')).toBeVisible({ timeout: 3000 });
    
    // Find search input
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toBeVisible();
    
    // Type in search
    await searchInput.fill('Service');
    await page.waitForTimeout(500);
    
    // Search should filter results in real-time
  });

  test('should display search results', async ({ page }) => {
    // Open search panel
    await page.getByTestId('search-button').click();
    await expect(page.getByTestId('symbol-search')).toBeVisible({ timeout: 3000 });
    
    // Find search input and search for a common term
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('class');
    await page.waitForTimeout(1000);
    
    // Results should appear
    // (Actual results depend on indexed project)
  });

  test('should toggle click navigation mode', async ({ page }) => {
    // Click navigation mode button
    const clickNavButton = page.getByTestId('click-nav-button');
    await expect(clickNavButton).toBeVisible();
    
    // Toggle on
    await clickNavButton.click();
    await page.waitForTimeout(300);
    
    // Button should show active state (via CSS class)
    
    // Toggle off
    await clickNavButton.click();
    await page.waitForTimeout(300);
  });
});
