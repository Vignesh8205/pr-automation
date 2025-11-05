import { test, expect } from '@playwright/test';

test.describe('AI Driven Slot Booking App Tests', () => {
  test('Verify AI Driven title is present', async ({ page }) => {
    // Navigate to the slot booking app
    await page.goto('https://aidrivenslotbookingapp.netlify.app/');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Verify the "AI Driven" title exists with the correct styling
    const titleElement = page.locator('h1.text-3xl.font-bold.text-foreground');
    await expect(titleElement).toBeVisible();
    await expect(titleElement).toHaveText('AI Driven');
    
    // Alternative way to check by text content
    const aiDrivenTitle = page.locator('h1:has-text("AI Driven")');
    await expect(aiDrivenTitle).toBeVisible();
    
    // Verify the title has the correct CSS classes
    await expect(titleElement).toHaveClass(/text-3xl/);
    await expect(titleElement).toHaveClass(/font-bold/);
    await expect(titleElement).toHaveClass(/text-foreground/);
    
    console.log('✅ AI Driven title verified successfully');
  });

  test('Verify page title and meta information', async ({ page }) => {
    await page.goto('https://aidrivenslotbookingapp.netlify.app/');
    
    // Check page title
    await expect(page).toHaveTitle(/AI.*Driven|Slot.*Booking|AI/i);
    
    // Check that the main heading is present
    const mainHeading = page.locator('h1').first();
    await expect(mainHeading).toContainText('AI Driven');
  });

  test('Homepage loads without errors', async ({ page }) => {
    // Listen for console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('https://aidrivenslotbookingapp.netlify.app/');
    await page.waitForLoadState('networkidle');
    
    // Check for JavaScript errors
    expect(errors).toHaveLength(0);
    
    // Verify page loaded successfully
    const title = page.locator('h1:has-text("AI Driven")');
    await expect(title).toBeVisible({ timeout: 10000 });
  });
});