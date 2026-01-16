<script lang="ts">
	let {
		variant = 'text',
		width = '100%',
		height,
		rounded = 'lg',
		animate = true,
		class: className = ''
	}: {
		variant?: 'text' | 'circular' | 'rectangular' | 'card';
		width?: string;
		height?: string;
		rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
		animate?: boolean;
		class?: string;
	} = $props();

	const variantStyles = {
		text: 'h-4',
		circular: 'rounded-full aspect-square',
		rectangular: 'h-32',
		card: 'h-48'
	};

	const roundedStyles = {
		none: 'rounded-none',
		sm: 'rounded-sm',
		md: 'rounded-md',
		lg: 'rounded-lg',
		xl: 'rounded-xl',
		'2xl': 'rounded-2xl',
		full: 'rounded-full'
	};
</script>

<div
	class="skeleton {variantStyles[variant]} {variant !== 'circular' ? roundedStyles[rounded] : ''} {animate ? 'animate-skeleton' : ''} {className}"
	style="width: {width}; {height ? `height: ${height};` : ''}"
></div>

<style>
	.skeleton {
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.03) 0%,
			rgba(255, 255, 255, 0.08) 50%,
			rgba(255, 255, 255, 0.03) 100%
		);
		background-size: 200% 100%;
	}

	.animate-skeleton {
		animation: skeleton-shimmer 1.5s ease-in-out infinite;
	}

	@keyframes skeleton-shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}
</style>
