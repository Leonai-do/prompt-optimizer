import { test, expect } from '@playwright/test';

test('should display the main page', async ({ page }) => {
  await page.goto('/');
  
  // Check that the page loads successfully
  await expect(page).toHaveTitle(/Prompt/);
  
  // Check for some expected content on the page
  await expect(page.getByText('Prompt Optimizer')).toBeVisible();
});