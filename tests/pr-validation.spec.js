import { test, expect } from '@playwright/test';

test.describe('PR Validation Tests', () => {
  test('Homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/.*Home.*|.*Welcome.*/);
    
    // Check main navigation
    const nav = page.locator('nav, header');
    await expect(nav).toBeVisible();
    
    // Check main content
    const main = page.locator('main, #main, .main-content');
    await expect(main).toBeVisible();
  });

  test('Navigation works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation links
    const links = page.locator('a[href]');
    const linkCount = await links.count();
    
    for (let i = 0; i < Math.min(linkCount, 5); i++) {
      const link = links.nth(i);
      const href = await link.getAttribute('href');
      
      if (href && href.startsWith('/') && !href.includes('#')) {
        await link.click();
        await page.waitForLoadState('networkidle');
        
        // Verify page changed
        const currentUrl = page.url();
        expect(currentUrl).toContain(href);
        
        // Go back for next test
        await page.goBack();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('Forms validation', async ({ page }) => {
    await page.goto('/');
    
    // Find forms on the page
    const forms = page.locator('form');
    const formCount = await forms.count();
    
    if (formCount > 0) {
      for (let i = 0; i < formCount; i++) {
        const form = forms.nth(i);
        
        // Find text inputs
        const inputs = form.locator('input[type="text"], input[type="email"], textarea');
        const inputCount = await inputs.count();
        
        for (let j = 0; j < inputCount; j++) {
          const input = inputs.nth(j);
          
          // Test empty validation
          await input.fill('');
          await input.blur();
          
          // Test with valid data
          await input.fill('test@example.com');
          
          // Verify input accepted
          const value = await input.inputValue();
          expect(value).toBe('test@example.com');
        }
      }
    }
  });

  test('Responsive design check', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check if content is visible
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Check for horizontal scroll
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth = await page.evaluate(() => document.body.clientWidth);
      
      // Allow small differences
      expect(scrollWidth - clientWidth).toBeLessThan(50);
    }
  });

  test('Performance check', async ({ page }) => {
    // Start measuring performance
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Check load time (should be reasonable)
    const navigationTiming = await page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
        loadComplete: timing.loadEventEnd - timing.loadEventStart
      };
    });
    
    // Verify reasonable load times (adjust thresholds as needed)
    expect(navigationTiming.domContentLoaded).toBeLessThan(3000);
    expect(navigationTiming.loadComplete).toBeLessThan(5000);
  });

  test('Accessibility basics', async ({ page }) => {
    await page.goto('/');
    
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const src = await img.getAttribute('src');
      
      if (src && !src.includes('data:image')) {
        expect(alt).toBeTruthy();
      }
    }
    
    // Check for proper heading structure
    const h1s = page.locator('h1');
    const h1Count = await h1s.count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    expect(h1Count).toBeLessThanOrEqual(1); // Should only have one h1
    
    // Check for form labels
    const inputs = page.locator('input[type="text"], input[type="email"], input[type="password"]');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const placeholder = await input.getAttribute('placeholder');
      
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        expect(hasLabel || ariaLabel || placeholder).toBeTruthy();
      }
    }
  });
});