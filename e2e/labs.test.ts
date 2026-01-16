import { test, expect } from '@playwright/test';

// Note: Lab simulation tests require authentication which requires database (D1)
// These tests are skipped in dev mode - run with wrangler pages dev for full testing

test.describe.skip('Chemistry - Titration Lab (requires auth)', () => {
	test('displays lab title', async ({ page }) => {
		await page.goto('/labs/chemistry/titration');
		await expect(page.getByText('Titration')).toBeVisible();
	});

	test('displays acid and base selection', async ({ page }) => {
		await page.goto('/labs/chemistry/titration');
		await expect(page.getByText('Acid', { exact: false })).toBeVisible();
		await expect(page.getByText('Base', { exact: false })).toBeVisible();
	});
});

test.describe.skip('Biology - Cell Division Lab (requires auth)', () => {
	test('displays lab title', async ({ page }) => {
		await page.goto('/labs/biology/cell-division');
		await expect(page.getByText(/Cell Division|Mitosis/i)).toBeVisible();
	});

	test('displays mitosis phases', async ({ page }) => {
		await page.goto('/labs/biology/cell-division');
		await expect(page.getByText('Interphase', { exact: false })).toBeVisible();
	});
});

test.describe.skip('Physics - Projectile Motion Lab (requires auth)', () => {
	test('displays lab title', async ({ page }) => {
		await page.goto('/labs/physics/projectile-motion');
		await expect(page.getByText(/Projectile Motion/i)).toBeVisible();
	});

	test('displays launch button', async ({ page }) => {
		await page.goto('/labs/physics/projectile-motion');
		const launchButton = page.getByRole('button', { name: /launch/i });
		await expect(launchButton).toBeVisible();
	});
});

test.describe.skip('Medical - Vital Signs Lab (requires auth)', () => {
	test('displays lab title', async ({ page }) => {
		await page.goto('/labs/medical/vital-signs');
		await expect(page.getByText(/Vital Signs/i)).toBeVisible();
	});

	test('displays patient selection', async ({ page }) => {
		await page.goto('/labs/medical/vital-signs');
		await expect(page.getByText(/patient/i)).toBeVisible();
	});
});
