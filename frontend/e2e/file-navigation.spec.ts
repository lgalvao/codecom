import { test, expect } from '@playwright/test';

/**
 * UC-01: File Navigation and Viewing
 * 
 * This test validates:
 * - File tree display
 * - File selection
 * - Syntax highlighting
 * - File content display
 */

test.describe('UC-01: File Navigation and Viewing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to load - file tree should be visible
    await expect(page.getByTestId('file-explorer')).toBeVisible();
  });

  test('should display the CodeCom application with file tree', async ({ page }) => {
    // Check app title
    await expect(page.getByTestId('app-title')).toContainText('CodeCom');
    
    // Check welcome screen is displayed
    await expect(page.getByTestId('welcome-screen')).toBeVisible();
    
    // File explorer should be visible
    await expect(page.getByTestId('file-explorer')).toBeVisible();
  });

  test('should browse file tree and select a Java file', async ({ page }) => {
    // Wait for file tree to load
    await page.waitForSelector('[data-testid="folder-node"]');
    
    // Find and expand backend folder
    const backendFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'backend' }).first();
    await backendFolder.click();
    
    // Wait a bit for expansion
    await page.waitForTimeout(500);
    
    // Expand src folder
    const srcFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'src' }).first();
    await srcFolder.click();
    await page.waitForTimeout(500);
    
    // Expand main folder
    const mainFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'main' }).first();
    await mainFolder.click();
    await page.waitForTimeout(500);
    
    // Expand java folder
    const javaFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'java' }).first();
    await javaFolder.click();
    await page.waitForTimeout(500);
    
    // Expand com folder
    const comFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'com' }).first();
    await comFolder.click();
    await page.waitForTimeout(500);
    
    // Expand codecom folder
    const codecomFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'codecom' }).first();
    await codecomFolder.click();
    await page.waitForTimeout(500);
    
    // Find and click a Java file
    const javaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).first();
    await javaFile.click();
    
    // Verify code highlighter appears
    await expect(page.getByTestId('code-highlighter')).toBeVisible({ timeout: 5000 });
    
    // Welcome screen should be hidden
    await expect(page.getByTestId('welcome-screen')).not.toBeVisible();
  });

  test('should display file in code viewer with syntax highlighting', async ({ page }) => {
    // Navigate to a specific file (use first available Java file)
    await page.waitForSelector('[data-testid="folder-node"]');
    
    // Open folders to find a Java file
    const backendFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'backend' }).first();
    await backendFolder.click();
    await page.waitForTimeout(300);
    
    const srcFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'src' }).first();
    await srcFolder.click();
    await page.waitForTimeout(300);
    
    // Click on first available Java file
    const javaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).first();
    await javaFile.click();
    
    // Wait for code to load
    await expect(page.getByTestId('code-highlighter')).toBeVisible({ timeout: 5000 });
    
    // Verify syntax highlighting is applied (Shiki adds specific classes)
    const codeContainer = page.locator('.shiki-container');
    await expect(codeContainer).toBeVisible();
    
    // Check that code content exists
    const preElement = codeContainer.locator('pre');
    await expect(preElement).toBeVisible();
    
    // Verify code has content
    const codeContent = await preElement.textContent();
    expect(codeContent).toBeTruthy();
    expect(codeContent!.length).toBeGreaterThan(0);
  });

  test('should allow scrolling through file content', async ({ page }) => {
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
    
    // Get the scrollable container
    const codeContainer = page.locator('.shiki-container pre').first();
    
    // Check initial scroll position
    const initialScrollTop = await codeContainer.evaluate(el => el.scrollTop);
    expect(initialScrollTop).toBe(0);
    
    // Scroll down
    await codeContainer.evaluate(el => el.scrollTop = 100);
    
    // Verify scroll happened
    const newScrollTop = await codeContainer.evaluate(el => el.scrollTop);
    expect(newScrollTop).toBeGreaterThan(0);
  });

  test('should switch between different files', async ({ page }) => {
    // Open first file
    await page.waitForSelector('[data-testid="folder-node"]');
    const backendFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'backend' }).first();
    await backendFolder.click();
    await page.waitForTimeout(300);
    
    const srcFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'src' }).first();
    await srcFolder.click();
    await page.waitForTimeout(300);
    
    const firstJavaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).first();
    const firstFileName = await firstJavaFile.textContent();
    await firstJavaFile.click();
    
    await expect(page.getByTestId('code-highlighter')).toBeVisible({ timeout: 5000 });
    
    // Verify tab was created
    const firstTab = page.locator('[data-tab-name]').first();
    await expect(firstTab).toBeVisible();
    
    // Open second file
    const secondJavaFile = page.locator('[data-testid="file-node"]').filter({ hasText: '.java' }).nth(1);
    await secondJavaFile.click();
    
    // Wait for content to load
    await page.waitForTimeout(500);
    
    // Verify second tab was created
    const tabs = page.locator('[data-tab-name]');
    await expect(tabs).toHaveCount(2);
  });

  test('should maintain file tree interactivity while viewing file', async ({ page }) => {
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
    
    // File explorer should still be visible and interactive
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Should be able to expand/collapse folders
    const anotherFolder = page.locator('[data-testid="folder-node"]').filter({ hasText: 'frontend' }).first();
    await anotherFolder.click();
    
    // Frontend folder should expand (indicated by children becoming visible)
    await page.waitForTimeout(300);
  });
});
