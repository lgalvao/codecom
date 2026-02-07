import { test, expect } from '@playwright/test';

test('verify tree-sitter js grammar loading', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  // Wait for explorer
  await page.waitForSelector('.sidebar');
  
  // Expand folders
  await page.click('.node-label:has-text("codecom")');
  await page.waitForTimeout(1000); // Wait for animation/render
  await page.click('.node-label:has-text("frontend")');
  await page.waitForTimeout(1000);
  
  // Find a JS file (e.g. vite.config.js) and click it
  await page.click('text=vite.config.js');
  
  // Watch for the error message in the UI
  await page.waitForTimeout(2000);
  
  // If we want to catch the exact console error
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER CONSOLE ERROR:', msg.text());
    }
  });

  // Wait a bit for analysis to run
  await page.waitForTimeout(2000);
  
  const content = await page.textContent('body');
  if (content.includes('need dylink section')) {
    console.log('REPRODUCED: need dylink section error found in UI');
  } else {
    console.log('NOT REPRODUCED in UI');
  }
});
