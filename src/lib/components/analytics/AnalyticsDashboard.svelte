<script lang="ts">
	import { onMount } from 'svelte';

	interface AnalyticsSummary {
		total_events: number;
		unique_sessions: number;
		unique_users: number;
		labs_started: number;
		labs_completed: number;
		page_views: number;
		ai_interactions: number;
		achievements_unlocked: number;
	}

	interface PageStat {
		page_url: string;
		views: number;
	}

	interface LabStat {
		lab_name: string;
		starts: number;
		completions: number;
	}

	interface CategoryStat {
		category: string;
		count: number;
	}

	let period = $state<'24h' | '7d' | '30d'>('7d');
	let loading = $state(true);
	let error = $state<string | null>(null);
	let summary = $state<AnalyticsSummary | null>(null);
	let topPages = $state<PageStat[]>([]);
	let labStats = $state<LabStat[]>([]);
	let categoryStats = $state<CategoryStat[]>([]);

	async function fetchAnalytics() {
		loading = true;
		error = null;

		try {
			const response = await fetch(`/api/analytics?period=${period}`);
			const data = await response.json();

			if (data.success) {
				summary = data.summary;
				topPages = data.topPages;
				labStats = data.labStats;
				categoryStats = data.categoryStats;
			} else {
				error = data.error || 'Failed to load analytics';
			}
		} catch (err) {
			error = 'Failed to connect to analytics service';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		fetchAnalytics();
	});

	$effect(() => {
		period;
		fetchAnalytics();
	});

	function getCompletionRate(starts: number, completions: number): number {
		if (starts === 0) return 0;
		return Math.round((completions / starts) * 100);
	}

	function getCategoryIcon(category: string): string {
		const icons: Record<string, string> = {
			navigation: '🧭',
			lab: '🔬',
			experiment: '🧪',
			achievement: '🏆',
			ai_assistant: '🤖',
			collaboration: '👥',
			report: '📄',
			settings: '⚙️',
			error: '⚠️'
		};
		return icons[category] || '📊';
	}

	function formatPageUrl(url: string): string {
		if (url === '/') return 'Home';
		return url.replace(/^\//, '').replace(/\//g, ' > ').replace(/-/g, ' ');
	}
</script>

<div class="space-y-6">
	<!-- Period Selector -->
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-display font-semibold text-white">Usage Analytics</h3>
		<div class="flex items-center gap-2">
			{#each ['24h', '7d', '30d'] as p}
				<button
					onclick={() => period = p as '24h' | '7d' | '30d'}
					class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all
						{period === p
							? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
							: 'glass border border-white/10 text-gray-400 hover:text-white hover:border-white/20'}"
				>
					{p === '24h' ? 'Last 24h' : p === '7d' ? 'Last 7 days' : 'Last 30 days'}
				</button>
			{/each}
		</div>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
		</div>
	{:else if error}
		<div class="glass rounded-xl p-6 border border-rose-500/30 text-center">
			<p class="text-rose-400">{error}</p>
			<button onclick={fetchAnalytics} class="mt-4 px-4 py-2 rounded-lg glass border border-white/10 text-sm hover:border-white/20 transition-all">
				Retry
			</button>
		</div>
	{:else if summary}
		<!-- Summary Cards -->
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
			<div class="glass rounded-xl p-4 border border-white/10">
				<div class="text-2xl mb-1">👁️</div>
				<div class="text-2xl font-bold text-white">{summary.page_views?.toLocaleString() || 0}</div>
				<div class="text-sm text-gray-400">Page Views</div>
			</div>
			<div class="glass rounded-xl p-4 border border-white/10">
				<div class="text-2xl mb-1">👤</div>
				<div class="text-2xl font-bold text-white">{summary.unique_users?.toLocaleString() || 0}</div>
				<div class="text-sm text-gray-400">Unique Users</div>
			</div>
			<div class="glass rounded-xl p-4 border border-white/10">
				<div class="text-2xl mb-1">🔬</div>
				<div class="text-2xl font-bold text-white">{summary.labs_started?.toLocaleString() || 0}</div>
				<div class="text-sm text-gray-400">Labs Started</div>
			</div>
			<div class="glass rounded-xl p-4 border border-white/10">
				<div class="text-2xl mb-1">✅</div>
				<div class="text-2xl font-bold text-white">{summary.labs_completed?.toLocaleString() || 0}</div>
				<div class="text-sm text-gray-400">Labs Completed</div>
			</div>
		</div>

		<!-- Lab Performance -->
		{#if labStats.length > 0}
			<div class="glass rounded-xl p-5 border border-white/10">
				<h4 class="text-base font-medium text-white mb-4 flex items-center gap-2">
					<span>🧪</span> Lab Performance
				</h4>
				<div class="space-y-3">
					{#each labStats as lab}
						<div class="flex items-center justify-between">
							<span class="text-sm text-gray-300 capitalize">{lab.lab_name || 'Unknown Lab'}</span>
							<div class="flex items-center gap-4">
								<span class="text-xs text-gray-500">{lab.starts} started</span>
								<div class="flex items-center gap-2">
									<div class="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
										<div
											class="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all"
											style="width: {getCompletionRate(lab.starts, lab.completions)}%"
										></div>
									</div>
									<span class="text-xs font-medium text-emerald-400">
										{getCompletionRate(lab.starts, lab.completions)}%
									</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<!-- Top Pages -->
			{#if topPages.length > 0}
				<div class="glass rounded-xl p-5 border border-white/10">
					<h4 class="text-base font-medium text-white mb-4 flex items-center gap-2">
						<span>📄</span> Top Pages
					</h4>
					<div class="space-y-2">
						{#each topPages.slice(0, 5) as page}
							<div class="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
								<span class="text-sm text-gray-300 capitalize truncate max-w-[180px]">{formatPageUrl(page.page_url)}</span>
								<span class="text-sm font-medium text-emerald-400">{page.views}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Activity by Category -->
			{#if categoryStats.length > 0}
				<div class="glass rounded-xl p-5 border border-white/10">
					<h4 class="text-base font-medium text-white mb-4 flex items-center gap-2">
						<span>📊</span> Activity by Category
					</h4>
					<div class="space-y-2">
						{#each categoryStats.slice(0, 6) as stat}
							<div class="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
								<div class="flex items-center gap-2">
									<span>{getCategoryIcon(stat.category)}</span>
									<span class="text-sm text-gray-300 capitalize">{stat.category.replace('_', ' ')}</span>
								</div>
								<span class="text-sm font-medium text-cyan-400">{stat.count}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Additional Metrics -->
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
			<div class="glass rounded-xl p-4 border border-white/10">
				<div class="text-lg mb-1">💬</div>
				<div class="text-xl font-bold text-white">{summary.unique_sessions?.toLocaleString() || 0}</div>
				<div class="text-xs text-gray-400">Sessions</div>
			</div>
			<div class="glass rounded-xl p-4 border border-white/10">
				<div class="text-lg mb-1">🤖</div>
				<div class="text-xl font-bold text-white">{summary.ai_interactions?.toLocaleString() || 0}</div>
				<div class="text-xs text-gray-400">AI Interactions</div>
			</div>
			<div class="glass rounded-xl p-4 border border-white/10">
				<div class="text-lg mb-1">🏆</div>
				<div class="text-xl font-bold text-white">{summary.achievements_unlocked?.toLocaleString() || 0}</div>
				<div class="text-xs text-gray-400">Achievements</div>
			</div>
			<div class="glass rounded-xl p-4 border border-white/10">
				<div class="text-lg mb-1">📈</div>
				<div class="text-xl font-bold text-white">{summary.total_events?.toLocaleString() || 0}</div>
				<div class="text-xs text-gray-400">Total Events</div>
			</div>
		</div>
	{:else}
		<div class="glass rounded-xl p-8 border border-white/10 text-center">
			<div class="text-4xl mb-4">📊</div>
			<p class="text-gray-400">No analytics data available for this period</p>
		</div>
	{/if}
</div>
