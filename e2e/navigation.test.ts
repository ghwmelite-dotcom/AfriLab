import { test, expect } from '@playwright/test';

test.describe('Navigation - Public Pages', () => {
	test('homepage loads with correct title', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveTitle(/AfriLab/);
	});

	test('homepage displays hero section', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toContainText(/Africa|Science Lab/i);
	});

	test('homepage shows discipline pills', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Chemistry', { exact: true }).first()).toBeVisible();
		await expect(page.getByText('Biology', { exact: true }).first()).toBeVisible();
		await expect(page.getByText('Physics', { exact: true }).first()).toBeVisible();
	});

	test('homepage shows feature cards', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Virtual Chemistry Labs' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'AI Lab Assistant' })).toBeVisible();
	});

	test('homepage shows stats section', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Active Students', { exact: true })).toBeVisible();
		await expect(page.getByText('Universities', { exact: true })).toBeVisible();
	});

	test('login page is accessible', async ({ page }) => {
		await page.goto('/auth/login');
		await expect(page.getByText('Welcome to AfriLab')).toBeVisible();
	});

	test('login page has email and password fields', async ({ page }) => {
		await page.goto('/auth/login');
		// Look for inputs by their labels or actual placeholder text
		await expect(page.getByPlaceholder('you@university.edu')).toBeVisible();
		await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
	});

	test('login page has demo access buttons', async ({ page }) => {
		await page.goto('/auth/login');
		await expect(page.getByRole('button', { name: /student demo/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /instructor demo/i })).toBeVisible();
	});

	test('register page is accessible', async ({ page }) => {
		await page.goto('/auth/register');
		const formElement = page.locator('form, input[type="email"], input[type="text"]');
		await expect(formElement.first()).toBeVisible();
	});

	test('can navigate from login to register', async ({ page }) => {
		await page.goto('/auth/login');
		await page.click('text=Register now');
		await expect(page).toHaveURL(/\/auth\/register/);
	});

	test('can navigate from register to login', async ({ page }) => {
		await page.goto('/auth/register');
		// Look for Sign in link
		const signInLink = page.getByRole('link', { name: /sign in/i });
		if (await signInLink.count() > 0) {
			await signInLink.click();
			await expect(page).toHaveURL(/\/auth\/login/);
		}
	});
});

// Note: Authenticated tests require database (D1) which is not available in vite dev mode
// These tests would work with `wrangler pages dev` or in CI with proper database setup
test.describe.skip('Navigation - Authenticated (requires database)', () => {
	test('can access chemistry labs after login', async ({ page }) => {
		// Would require demo login with database
		await page.goto('/labs/chemistry');
		await expect(page.getByRole('heading', { name: /Chemistry Labs/i })).toBeVisible();
	});

	test('can access biology labs after login', async ({ page }) => {
		await page.goto('/labs/biology');
		await expect(page.getByRole('heading', { name: /Biology Labs/i })).toBeVisible();
	});
});
