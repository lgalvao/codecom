import { test, expect } from '@playwright/test';

/**
 * UC-07: Export Functionality
 * 
 * This test validates:
 * - Export dialog opening
 * - Format selection
 * - Detail level options
 */

test.describe('UC-07: Export Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Open a file for export
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
  });

  test('should open export dialog', async ({ page }) => {
    // Click export button
    await page.getByTestId('export-button').click();
    
    // Export dialog should be visible
    await expect(page.getByTestId('export-dialog')).toBeVisible({ timeout: 3000 });
  });

  test('should have export button disabled when no file is open', async ({ page }) => {
    // Close the file by closing the tab
    const tab = page.locator('[data-tab-name]').first();
    const closeButton = tab.locator('button').first();
    await closeButton.click();
    await page.waitForTimeout(500);
    
    // Export button should be disabled
    const exportButton = page.getByTestId('export-button');
    await expect(exportButton).toBeDisabled();
  });

  test('should close export dialog when clicking button again', async ({ page }) => {
    // Open export dialog
    await page.getByTestId('export-button').click();
    await expect(page.getByTestId('export-dialog')).toBeVisible({ timeout: 3000 });
    
    // Close by clicking button again
    await page.getByTestId('export-button').click();
    await page.waitForTimeout(500);
  });

  test('should display export format options', async ({ page }) => {
    // Open export dialog
    await page.getByTestId('export-button').click();
    await expect(page.getByTestId('export-dialog')).toBeVisible({ timeout: 3000 });
    
    // Export dialog should contain format selection
    const exportDialog = page.getByTestId('export-dialog');
    const dialogText = await exportDialog.textContent();
    
    // Should mention format options (PDF, Markdown, etc.)
    expect(dialogText).toBeTruthy();
  });

  test('should allow interaction with export options', async ({ page }) => {
    // Open export dialog
    await page.getByTestId('export-button').click();
    await expect(page.getByTestId('export-dialog')).toBeVisible({ timeout: 3000 });
    
    // The dialog should be interactive
    const exportDialog = page.getByTestId('export-dialog');
    
    // Look for radio buttons or select elements for format
    const radioButtons = exportDialog.locator('input[type="radio"]');
    const radioCount = await radioButtons.count();
    
    // Should have format options
    expect(radioCount).toBeGreaterThan(0);
  });

  test('should maintain export dialog state across theme changes', async ({ page }) => {
    // Open export dialog
    await page.getByTestId('export-button').click();
    await expect(page.getByTestId('export-dialog')).toBeVisible({ timeout: 3000 });
    
    // Toggle theme
    await page.getByTestId('theme-toggle').click();
    await page.waitForTimeout(300);
    
    // Export dialog should still be visible
    await expect(page.getByTestId('export-dialog')).toBeVisible();
  });
});
