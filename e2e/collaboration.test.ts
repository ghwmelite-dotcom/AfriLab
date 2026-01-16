import { test, expect } from '@playwright/test';

// Note: Collaboration and lab features require authentication which requires database (D1)
// These tests are skipped in dev mode - run with wrangler pages dev for full testing

test.describe.skip('Collaboration Features (requires auth)', () => {
	test('collaboration button is visible in labs', async ({ page }) => {
		await page.goto('/labs/chemistry/titration');
		const collabButton = page.locator('[class*="collaboration"], button[aria-label*="collaborate"]');
		await expect(collabButton.first()).toBeVisible();
	});

	test('collaboration panel can be toggled', async ({ page }) => {
		await page.goto('/labs/physics/projectile-motion');
		const collabButton = page.locator('[class*="collaboration"] button');
		if (await collabButton.count() > 0) {
			await collabButton.first().click();
			const panel = page.locator('[class*="collaboration-panel"]');
			await expect(panel.first()).toBeVisible();
		}
	});
});

test.describe.skip('Quiz Features (requires auth)', () => {
	test('cell division lab has quiz section', async ({ page }) => {
		await page.goto('/labs/biology/cell-division');
		await expect(page.getByText(/quiz|question/i)).toBeVisible();
	});

	test('projectile motion lab has quiz section', async ({ page }) => {
		await page.goto('/labs/physics/projectile-motion');
		const quizSection = page.getByText(/quiz|question/i);
		await expect(quizSection.first()).toBeVisible();
	});
});

test.describe.skip('Data Recording (requires auth)', () => {
	test('can record measurements in titration lab', async ({ page }) => {
		await page.goto('/labs/chemistry/titration');
		const recordButton = page.getByRole('button', { name: /record|save|add/i });
		await expect(recordButton.first()).toBeVisible();
	});
});
