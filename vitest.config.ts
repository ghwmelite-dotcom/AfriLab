import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [svelte({ hot: !process.env.VITEST })],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/tests/setup.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'src/tests/',
				'**/*.d.ts',
				'**/*.config.*',
				'**/types.ts'
			]
		},
		alias: {
			$lib: '/src/lib',
			$stores: '/src/lib/stores',
			$components: '/src/lib/components'
		}
	},
	resolve: {
		alias: {
			$lib: '/src/lib',
			$stores: '/src/lib/stores',
			$components: '/src/lib/components',
			'$app/environment': '/src/tests/mocks/app-environment.ts',
			'$app/stores': '/src/tests/mocks/app-stores.ts'
		}
	}
});
