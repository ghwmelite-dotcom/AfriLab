/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				// AfriLab brand colors
				primary: {
					50: '#f0fdf4',
					100: '#dcfce7',
					200: '#bbf7d0',
					300: '#86efac',
					400: '#4ade80',
					500: '#22c55e',
					600: '#16a34a',
					700: '#15803d',
					800: '#166534',
					900: '#14532d',
					950: '#052e16'
				},
				secondary: {
					50: '#fefce8',
					100: '#fef9c3',
					200: '#fef08a',
					300: '#fde047',
					400: '#facc15',
					500: '#eab308',
					600: '#ca8a04',
					700: '#a16207',
					800: '#854d0e',
					900: '#713f12',
					950: '#422006'
				},
				lab: {
					// Chemistry colors
					acid: '#ef4444',
					base: '#3b82f6',
					neutral: '#a855f7',
					indicator: '#f97316',
					// Safety colors
					danger: '#dc2626',
					warning: '#f59e0b',
					safe: '#22c55e'
				}
			},
			fontFamily: {
				sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
				display: ['Outfit', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
				mono: ['JetBrains Mono', 'monospace']
			},
			animation: {
				'bubble': 'bubble 2s ease-in-out infinite',
				'pour': 'pour 0.5s ease-out',
				'glow': 'glow 2s ease-in-out infinite alternate'
			},
			keyframes: {
				bubble: {
					'0%, 100%': { transform: 'translateY(0) scale(1)' },
					'50%': { transform: 'translateY(-10px) scale(1.1)' }
				},
				pour: {
					'0%': { height: '0%' },
					'100%': { height: '100%' }
				},
				glow: {
					'0%': { boxShadow: '0 0 5px currentColor' },
					'100%': { boxShadow: '0 0 20px currentColor' }
				}
			}
		}
	},
	plugins: [
		require('@tailwindcss/forms'),
		require('@tailwindcss/typography')
	]
};
