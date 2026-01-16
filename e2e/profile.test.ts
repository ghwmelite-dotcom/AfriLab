import { test, expect } from '@playwright/test';

// Note: Profile and authenticated features require database (D1)
// These tests are skipped in dev mode - run with wrangler pages dev for full testing

test.describe.skip('Profile & Achievements (requires auth)', () => {
	test('profile displays user stats', async ({ page }) => {
		await page.goto('/dashboard/profile');
		const statsText = page.getByText(/XP|Level|Points|Achievement/i);
		await expect(statsText.first()).toBeVisible();
	});

	test('profile shows completed labs', async ({ page }) => {
		await page.goto('/dashboard/profile');
		await expect(page.getByText(/completed|progress/i)).toBeVisible();
	});
});

test.describe('Responsive Design - Public Pages', () => {
	test('homepage is responsive on mobile', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/');
		await expect(page.locator('h1')).toBeVisible();
	});

	test('homepage stats are visible on mobile', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/');
		await expect(page.getByText('Active Students')).toBeVisible();
	});

	test('login page is responsive on mobile', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/auth/login');
		await expect(page.getByPlaceholder('you@university.edu')).toBeVisible();
		await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
	});

	test('login page is responsive on tablet', async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 });
		await page.goto('/auth/login');
		await expect(page.getByText('Welcome to AfriLab')).toBeVisible();
	});

	test('homepage is responsive on tablet', async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 });
		await page.goto('/');
		await expect(page.locator('h1')).toBeVisible();
		await expect(page.getByText('Chemistry', { exact: true }).first()).toBeVisible();
	});
});
