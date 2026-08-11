import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('Home page loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/WACE/i);
    // Le composant d'accueil doit afficher "Tendances" ou "Accueil"
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('Catalogue page loads successfully', async ({ page }) => {
    await page.goto('/catalogue');
    await expect(page).toHaveURL(/\/catalogue/);
    const articlesGrid = page.locator('main'); // Main content
    await expect(articlesGrid).toBeVisible();
  });

  test('Login page loads successfully', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.getByPlaceholder(/Email/i);
    await expect(emailInput).toBeVisible();
  });
});
