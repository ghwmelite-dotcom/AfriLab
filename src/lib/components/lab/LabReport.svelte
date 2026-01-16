<script lang="ts">
	import { printReport, downloadReportHTML, type LabReportData } from '$lib/utils/pdfReport';

	let {
		reportData,
		onClose
	}: {
		reportData: LabReportData;
		onClose: () => void;
	} = $props();

	let isExporting = $state(false);

	function handlePrint() {
		isExporting = true;
		printReport(reportData);
		setTimeout(() => {
			isExporting = false;
		}, 1000);
	}

	function handleDownload() {
		isExporting = true;
		downloadReportHTML(reportData);
		setTimeout(() => {
			isExporting = false;
		}, 500);
	}

	function getGradeColor(grade: string): string {
		switch (grade) {
			case 'A': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
			case 'B': return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30';
			case 'C': return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
			case 'D': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
			default: return 'text-rose-400 bg-rose-500/20 border-rose-500/30';
		}
	}

	let completionRate = $derived(Math.round((reportData.completedObjectives.length / reportData.objectives.length) * 100));
</script>

<!-- Modal backdrop -->
<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
	<!-- Backdrop -->
	<div
		class="absolute inset-0 bg-black/80 backdrop-blur-sm"
		onclick={onClose}
		role="button"
		tabindex="-1"
	></div>

	<!-- Modal content -->
	<div class="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl glass-strong border border-white/10 animate-fade-in-up">
		<!-- Header -->
		<div class="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-white/10 bg-gray-900/90 backdrop-blur-xl">
			<div>
				<h2 class="text-lg font-display font-bold text-white">Lab Report</h2>
				<p class="text-sm text-gray-400">{reportData.labTitle}</p>
			</div>
			<button
				onclick={onClose}
				class="p-2 rounded-lg glass border border-white/10 hover:border-white/20 transition-colors"
				aria-label="Close"
			>
				<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Scrollable content -->
		<div class="overflow-y-auto p-6 max-h-[calc(90vh-140px)]">
			<!-- Score Summary -->
			<div class="flex items-center justify-center gap-8 mb-8 p-6 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
				<div class="text-center">
					<div class="text-4xl font-display font-bold text-white">{reportData.score}</div>
					<div class="text-sm text-gray-400">Score</div>
				</div>
				<div class="text-center">
					<div class="text-5xl font-display font-bold {getGradeColor(reportData.grade).split(' ')[0]}">{reportData.grade}</div>
					<div class="text-sm text-gray-400">Grade</div>
				</div>
				<div class="text-center">
					<div class="text-4xl font-display font-bold text-white">{completionRate}%</div>
					<div class="text-sm text-gray-400">Completion</div>
				</div>
			</div>

			<!-- Info Grid -->
			<div class="grid grid-cols-2 gap-4 mb-6">
				<div class="glass rounded-xl p-4 border border-white/10">
					<div class="text-xs text-gray-500 uppercase tracking-wider mb-1">Student</div>
					<div class="text-white font-medium">{reportData.studentName}</div>
					<div class="text-xs text-gray-400">ID: {reportData.studentId}</div>
				</div>
				<div class="glass rounded-xl p-4 border border-white/10">
					<div class="text-xs text-gray-500 uppercase tracking-wider mb-1">Institution</div>
					<div class="text-white font-medium">{reportData.institutionName}</div>
				</div>
				<div class="glass rounded-xl p-4 border border-white/10">
					<div class="text-xs text-gray-500 uppercase tracking-wider mb-1">Date Completed</div>
					<div class="text-white font-medium">{reportData.labDate}</div>
				</div>
				<div class="glass rounded-xl p-4 border border-white/10">
					<div class="text-xs text-gray-500 uppercase tracking-wider mb-1">Duration</div>
					<div class="text-white font-medium">{reportData.duration} minutes</div>
				</div>
			</div>

			<!-- Learning Objectives -->
			<div class="mb-6">
				<h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
					<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					Learning Objectives
				</h3>
				<div class="space-y-2">
					{#each reportData.objectives as obj}
						{@const completed = reportData.completedObjectives.includes(obj)}
						<div class="flex items-start gap-3 p-2 rounded-lg {completed ? 'bg-emerald-500/10' : 'bg-gray-800/50'}">
							<div class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center
								{completed ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-500'}">
								{#if completed}
									<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
									</svg>
								{:else}
									<span class="text-[10px]">-</span>
								{/if}
							</div>
							<span class="text-sm {completed ? 'text-emerald-400' : 'text-gray-400'}">{obj}</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- Measurements -->
			{#if reportData.measurements.length > 0}
				<div class="mb-6">
					<h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
						<svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
						</svg>
						Measurements & Data
					</h3>
					<div class="glass rounded-xl border border-white/10 overflow-hidden">
						<table class="w-full">
							<thead>
								<tr class="text-xs text-gray-500 uppercase tracking-wider border-b border-white/10">
									<th class="text-left p-3">Parameter</th>
									<th class="text-right p-3">Value</th>
									<th class="text-right p-3">Unit</th>
								</tr>
							</thead>
							<tbody>
								{#each reportData.measurements as m, i}
									<tr class="border-b border-white/5 last:border-0">
										<td class="p-3 text-sm text-gray-300">{m.label}</td>
										<td class="p-3 text-sm text-right font-mono text-cyan-400">{m.value}</td>
										<td class="p-3 text-sm text-right text-gray-500">{m.unit}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}

			<!-- Observations -->
			{#if reportData.observations.length > 0}
				<div class="mb-6">
					<h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
						<svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
						</svg>
						Observations
					</h3>
					<ol class="space-y-2 list-decimal list-inside">
						{#each reportData.observations as obs, i}
							<li class="text-sm text-gray-400 glass rounded-lg p-3 border border-white/5">{obs}</li>
						{/each}
					</ol>
				</div>
			{/if}

			<!-- Analysis -->
			<div class="mb-6">
				<h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
					<svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
					</svg>
					Analysis
				</h3>
				<p class="text-sm text-gray-400 leading-relaxed">{reportData.analysis}</p>
			</div>

			<!-- Feedback -->
			<div class="mb-6">
				<h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
					<svg class="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
					</svg>
					Instructor Feedback
				</h3>
				<div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
					<p class="text-sm text-amber-400/90">{reportData.feedback}</p>
				</div>
			</div>

			<!-- Techniques -->
			{#if reportData.techniques.length > 0}
				<div>
					<h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
						<svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
						</svg>
						Techniques Practiced
					</h3>
					<div class="flex flex-wrap gap-2">
						{#each reportData.techniques as technique}
							<span class="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
								{technique}
							</span>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Footer with actions -->
		<div class="sticky bottom-0 flex items-center justify-end gap-3 p-4 border-t border-white/10 bg-gray-900/90 backdrop-blur-xl">
			<button
				onclick={handleDownload}
				disabled={isExporting}
				class="px-4 py-2 rounded-xl glass border border-white/10 hover:border-white/20 text-white font-medium transition-all flex items-center gap-2 disabled:opacity-50"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
				</svg>
				Download HTML
			</button>
			<button
				onclick={handlePrint}
				disabled={isExporting}
				class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
				</svg>
				Print / Save as PDF
			</button>
		</div>
	</div>
</div>

<style>
	@keyframes fade-in-up {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in-up {
		animation: fade-in-up 0.3s ease-out;
	}
</style>
