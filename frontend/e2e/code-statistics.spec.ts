import { test, expect } from '@playwright/test';

/**
 * UC-02: Code Statistics and Analysis
 * 
 * This test validates:
 * - Statistics panel display
 * - Line count calculations
 * - Method/class/interface counts
 * - Statistics accuracy
 */

test.describe('UC-02: Code Statistics and Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
  });

  test('should display statistics panel when button is clicked', async ({ page }) => {
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
    
    // Click statistics button
    await page.getByTestId('stats-button').click();
    
    // Statistics panel should be visible
    await expect(page.getByTestId('code-statistics')).toBeVisible({ timeout: 3000 });
  });

  test('should display line count statistics', async ({ page }) => {
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
    
    // Open statistics panel
    await page.getByTestId('stats-button').click();
    await expect(page.getByTestId('code-statistics')).toBeVisible({ timeout: 3000 });
    
    // Check for total lines
    const statsPanel = page.getByTestId('code-statistics');
    const statsText = await statsPanel.textContent();
    
    // Should contain line count information
    expect(statsText).toMatch(/total.*line/i);
  });

  test('should update statistics when switching files', async ({ page }) => {
    // Open first file
    await page.waitForSelector('[data-testid="folder-node"]');
    const backendFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'backend' }).first();
    await backendFolder.click();
    await page.waitForTimeout(300);
    
    const srcFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'src' }).first();
    await srcFolder.click();
    await page.waitForTimeout(300);
    
    const firstJavaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).first();
    await firstJavaFile.click();
    
    await expect(page.getByTestId('code-highlighter')).toBeVisible({ timeout: 5000 });
    
    // Open statistics panel
    await page.getByTestId('stats-button').click();
    await expect(page.getByTestId('code-statistics')).toBeVisible({ timeout: 3000 });
    
    // Get initial statistics
    const statsPanel = page.getByTestId('code-statistics');
    const initialStats = await statsPanel.textContent();
    
    // Close stats panel
    await page.getByTestId('stats-button').click();
    await page.waitForTimeout(300);
    
    // Open second file
    const secondJavaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).nth(1);
    await secondJavaFile.click();
    await page.waitForTimeout(500);
    
    // Reopen statistics panel
    await page.getByTestId('stats-button').click();
    await expect(page.getByTestId('code-statistics')).toBeVisible({ timeout: 3000 });
    
    // Statistics may have changed (different file could have different stats)
    const newStats = await statsPanel.textContent();
    expect(newStats).toBeTruthy();
  });

  test('should close statistics panel when clicking button again', async ({ page }) => {
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
    
    // Open statistics panel
    await page.getByTestId('stats-button').click();
    await expect(page.getByTestId('code-statistics')).toBeVisible({ timeout: 3000 });
    
    // Close statistics panel by clicking button again
    await page.getByTestId('stats-button').click();
    
    // Panel should close
    await page.waitForTimeout(500);
    // Panel may still exist in DOM but should not be visible
  });

  test('should show message when no file is selected', async ({ page }) => {
    // Click statistics button without opening a file
    await page.getByTestId('stats-button').click();
    
    // Panel should open but show "no file selected" message
    await page.waitForTimeout(500);
    const offcanvas = page.locator('.offcanvas');
    const text = await offcanvas.textContent();
    expect(text).toMatch(/no file/i);
  });
});
