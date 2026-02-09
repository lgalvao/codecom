import { test, expect } from '@playwright/test';

/**
 * UC-05: Tab Management and Multi-File Workflow
 * 
 * This test validates:
 * - Tab creation
 * - Tab switching
 * - Tab closing
 * - Tab state persistence
 */

test.describe('UC-05: Tab Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
  });

  test('should create a tab when file is opened', async ({ page }) => {
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
    
    // Tab should be created
    const tabs = page.locator('[data-tab-name]');
    await expect(tabs).toHaveCount(1);
  });

  test('should create multiple tabs for multiple files', async ({ page }) => {
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
    
    // Open second file
    const secondJavaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).nth(1);
    await secondJavaFile.click();
    await page.waitForTimeout(500);
    
    // Should have 2 tabs
    const tabs = page.locator('[data-tab-name]');
    await expect(tabs).toHaveCount(2);
  });

  test('should switch between tabs by clicking', async ({ page }) => {
    // Open two files to create two tabs
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
    
    const secondJavaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).nth(1);
    await secondJavaFile.click();
    await page.waitForTimeout(500);
    
    // Get tabs
    const tabs = page.locator('[data-tab-name]');
    await expect(tabs).toHaveCount(2);
    
    // Click first tab to switch back
    const firstTab = tabs.first();
    await firstTab.click();
    await page.waitForTimeout(500);
    
    // First tab should be active (has 'active' class)
    await expect(firstTab).toHaveClass(/active/);
  });

  test('should close a tab using close button', async ({ page }) => {
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
    
    // Get the tab
    const tab = page.locator('[data-tab-name]').first();
    await expect(tab).toBeVisible();
    
    // Find and click close button
    const closeButton = tab.locator('button').first();
    await closeButton.click();
    await page.waitForTimeout(500);
    
    // Tab should be closed
    const tabs = page.locator('[data-tab-name]');
    await expect(tabs).toHaveCount(0);
    
    // Welcome screen should appear
    await expect(page.getByTestId('welcome-screen')).toBeVisible();
  });

  test('should close individual tabs while keeping others open', async ({ page }) => {
    // Open three files
    await page.waitForSelector('[data-testid="folder-node"]');
    const backendFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'backend' }).first();
    await backendFolder.click();
    await page.waitForTimeout(300);
    
    const srcFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'src' }).first();
    await srcFolder.click();
    await page.waitForTimeout(300);
    
    // Open 3 files
    const firstJavaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).first();
    await firstJavaFile.click();
    await page.waitForTimeout(500);
    
    const secondJavaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).nth(1);
    await secondJavaFile.click();
    await page.waitForTimeout(500);
    
    const thirdJavaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).nth(2);
    await thirdJavaFile.click();
    await page.waitForTimeout(500);
    
    // Should have 3 tabs
    let tabs = page.locator('[data-tab-name]');
    await expect(tabs).toHaveCount(3);
    
    // Close the second tab
    const secondTab = tabs.nth(1);
    const closeButton = secondTab.locator('button').first();
    await closeButton.click();
    await page.waitForTimeout(500);
    
    // Should have 2 tabs remaining
    tabs = page.locator('[data-tab-name]');
    await expect(tabs).toHaveCount(2);
  });

  test('should maintain tab state across panel toggles', async ({ page }) => {
    // Open a file to create a tab
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
    
    // Verify tab exists
    let tabs = page.locator('[data-tab-name]');
    await expect(tabs).toHaveCount(1);
    
    // Toggle statistics panel open and closed
    await page.getByTestId('stats-button').click();
    await page.waitForTimeout(500);
    await page.getByTestId('stats-button').click();
    await page.waitForTimeout(500);
    
    // Tab should still exist
    tabs = page.locator('[data-tab-name]');
    await expect(tabs).toHaveCount(1);
  });

  test('should activate tab when same file is opened again', async ({ page }) => {
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
    
    // Open another file
    const secondJavaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).nth(1);
    await secondJavaFile.click();
    await page.waitForTimeout(500);
    
    // Should have 2 tabs
    let tabs = page.locator('[data-tab-name]');
    await expect(tabs).toHaveCount(2);
    
    // Click first file again
    await javaFile.click();
    await page.waitForTimeout(500);
    
    // Should still have 2 tabs (not 3)
    tabs = page.locator('[data-tab-name]');
    await expect(tabs).toHaveCount(2);
    
    // First tab should be active
    const firstTab = tabs.first();
    await expect(firstTab).toHaveClass(/active/);
  });
});
