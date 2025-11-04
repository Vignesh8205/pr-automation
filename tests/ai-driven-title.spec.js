import { test, expect } from '@playwright/test';

test.describe('AI Driven Title Verification', () => {
  test('Verify AI Driven title with exact styling', async ({ page }) => {
    // Navigate to your slot booking app
    await page.goto('https://aidrivenslotbookingapp.netlify.app/');
    
    // Wait for the page to fully load
    await page.waitForLoadState('domcontentloaded');
    
    // Find the h1 element with the specific classes
    const aiDrivenTitle = page.locator('h1.text-3xl.font-bold.text-foreground');
    
    // Verify the element is visible
    await expect(aiDrivenTitle).toBeVisible();
    
    // Verify the exact text content
    await expect(aiDrivenTitle).toHaveText('AI Driven');
    
    // Verify all the CSS classes are present
    await expect(aiDrivenTitle).toHaveClass('text-3xl font-bold text-foreground');
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'screenshots/ai-driven-title-verification.png' });
    
    console.log('✅ AI Driven title verification completed successfully');
  });

  test('Check title responsiveness', async ({ page }) => {
    await page.goto('https://aidrivenslotbookingapp.netlify.app/');
    
    // Test on different screen sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      
      const title = page.locator('h1:has-text("AI Driven")');
      await expect(title).toBeVisible();
      
      // Take screenshot for each viewport
      await page.screenshot({ 
        path: `screenshots/ai-driven-title-${viewport.name.toLowerCase()}.png` 
      });
      
      console.log(`✅ Title verified on ${viewport.name} viewport`);
    }
  });
});