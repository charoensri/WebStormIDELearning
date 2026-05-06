import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/AgentClinic/);
});

test('navigation works', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Patients');
  await expect(page).toHaveURL(/\/patients/);
  await expect(page.locator('h1')).toContainText('Patients');
});

test('mobile menu works', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  
  const menuToggle = page.locator('#menuToggle');
  await expect(menuToggle).toBeVisible();
  
  const nav = page.locator('#mainNav');
  await expect(nav).not.toHaveClass(/active/);
  
  await menuToggle.click();
  await expect(nav).toHaveClass(/active/);
});
