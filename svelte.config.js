import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			routes: {
				include: ['/*'],
				exclude: ['<all>']
			},
			platformProxy: {
				configPath: 'wrangler.toml',
				environment: undefined,
				experimentalJsonConfig: false,
				persist: true
			}
		}),
		alias: {
			$components: 'src/lib/components',
			$stores: 'src/lib/stores',
			$server: 'src/lib/server',
			$simulations: 'src/lib/simulations',
			$types: 'src/lib/types'
		}
	}
};

export default config;
