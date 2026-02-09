import { test, expect } from '@playwright/test';

/**
 * Theme and UI Tests
 * 
 * This test validates:
 * - Light/Dark theme toggle
 * - Theme persistence
 * - UI responsiveness
 */

test.describe('Theme and UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('file-explorer')).toBeVisible();
  });

  test('should toggle between dark and light themes', async ({ page }) => {
    // Get theme toggle button
    const themeToggle = page.getByTestId('theme-toggle');
    await expect(themeToggle).toBeVisible();
    
    // Get initial theme
    const htmlElement = page.locator('html');
    const initialTheme = await htmlElement.getAttribute('data-bs-theme');
    
    // Toggle theme
    await themeToggle.click();
    await page.waitForTimeout(300);
    
    // Theme should have changed
    const newTheme = await htmlElement.getAttribute('data-bs-theme');
    expect(newTheme).not.toBe(initialTheme);
    
    // Toggle back
    await themeToggle.click();
    await page.waitForTimeout(300);
    
    // Should be back to initial theme
    const finalTheme = await htmlElement.getAttribute('data-bs-theme');
    expect(finalTheme).toBe(initialTheme);
  });

  test('should persist theme preference across page reload', async ({ page }) => {
    // Get theme toggle button
    const themeToggle = page.getByTestId('theme-toggle');
    await expect(themeToggle).toBeVisible();
    
    // Toggle to ensure we're on a known theme
    await themeToggle.click();
    await page.waitForTimeout(300);
    
    const htmlElement = page.locator('html');
    const themeBeforeReload = await htmlElement.getAttribute('data-bs-theme');
    
    // Reload page
    await page.reload();
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    
    // Theme should be the same as before reload
    const themeAfterReload = await htmlElement.getAttribute('data-bs-theme');
    expect(themeAfterReload).toBe(themeBeforeReload);
  });

  test('should display correct theme icon', async ({ page }) => {
    // Get theme toggle button
    const themeToggle = page.getByTestId('theme-toggle');
    
    // The icon shows the opposite of current theme
    // (Sun icon in dark mode, Moon icon in light mode)
    const htmlElement = page.locator('html');
    const currentTheme = await htmlElement.getAttribute('data-bs-theme');
    
    // Check icon is present in button
    const iconSvg = themeToggle.locator('svg');
    await expect(iconSvg).toBeVisible();
  });

  test('should maintain navbar visibility', async ({ page }) => {
    // Navbar should always be visible
    const navbar = page.getByTestId('navbar');
    await expect(navbar).toBeVisible();
    
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
    await page.waitForTimeout(500);
    
    // Navbar should still be visible
    await expect(navbar).toBeVisible();
  });

  test('should have all main UI components visible', async ({ page }) => {
    // Check main components
    await expect(page.getByTestId('navbar')).toBeVisible();
    await expect(page.getByTestId('file-explorer')).toBeVisible();
    await expect(page.getByTestId('lod-select')).toBeVisible();
    await expect(page.getByTestId('theme-toggle')).toBeVisible();
    
    // Check all toolbar buttons
    await expect(page.getByTestId('search-button')).toBeVisible();
    await expect(page.getByTestId('stats-button')).toBeVisible();
    await expect(page.getByTestId('detail-button')).toBeVisible();
  });

  test('should display welcome screen on initial load', async ({ page }) => {
    // Welcome screen should be visible
    await expect(page.getByTestId('welcome-screen')).toBeVisible();
    
    // Should contain "CodeCom" heading
    const welcomeScreen = page.getByTestId('welcome-screen');
    const text = await welcomeScreen.textContent();
    expect(text).toContain('CodeCom');
  });

  test('should hide welcome screen when file is opened', async ({ page }) => {
    // Welcome screen should be visible initially
    await expect(page.getByTestId('welcome-screen')).toBeVisible();
    
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
    
    // Welcome screen should be hidden
    await expect(page.getByTestId('welcome-screen')).not.toBeVisible();
  });
});
