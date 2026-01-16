<script lang="ts">
	import {
		printCertificate,
		downloadCertificateHTML,
		type CertificateData
	} from '$lib/utils/certificate';

	let {
		certificateData,
		onClose
	}: {
		certificateData: CertificateData;
		onClose: () => void;
	} = $props();

	let isExporting = $state(false);

	function handlePrint() {
		isExporting = true;
		printCertificate(certificateData);
		setTimeout(() => {
			isExporting = false;
		}, 1000);
	}

	function handleDownload() {
		isExporting = true;
		downloadCertificateHTML(certificateData);
		setTimeout(() => {
			isExporting = false;
		}, 500);
	}

	function getGradeStyle(grade: string): string {
		switch (grade) {
			case 'A':
				return 'from-emerald-400 to-cyan-400 shadow-emerald-500/50';
			case 'B':
				return 'from-cyan-400 to-blue-400 shadow-cyan-500/50';
			case 'C':
				return 'from-amber-400 to-orange-400 shadow-amber-500/50';
			case 'D':
				return 'from-orange-400 to-rose-400 shadow-orange-500/50';
			default:
				return 'from-rose-400 to-red-400 shadow-rose-500/50';
		}
	}

	function getDisciplineColor(discipline: string): string {
		const colors: Record<string, string> = {
			Chemistry: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
			Biology: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
			Physics: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
			Pharmacy: 'text-pink-400 bg-pink-500/20 border-pink-500/30',
			Medical: 'text-rose-400 bg-rose-500/20 border-rose-500/30'
		};
		return colors[discipline] || colors.Chemistry;
	}

	let gradeEmoji = $derived(
		certificateData.grade === 'A'
			? '🏆'
			: certificateData.grade === 'B'
				? '🥈'
				: certificateData.grade === 'C'
					? '🥉'
					: '📜'
	);
</script>

<!-- Modal backdrop -->
<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
	<!-- Backdrop with celebratory effect -->
	<div
		class="absolute inset-0 bg-black/80 backdrop-blur-sm"
		onclick={onClose}
		role="button"
		tabindex="-1"
	></div>

	<!-- Confetti effect (subtle particles) -->
	<div class="absolute inset-0 pointer-events-none overflow-hidden">
		{#each Array(20) as _, i}
			<div
				class="absolute w-2 h-2 rounded-full animate-confetti"
				style="
					left: {Math.random() * 100}%;
					animation-delay: {Math.random() * 2}s;
					background: hsl({Math.random() * 360}, 70%, 60%);
				"
			></div>
		{/each}
	</div>

	<!-- Modal content -->
	<div class="relative w-full max-w-lg overflow-hidden rounded-2xl glass-strong border border-white/10 animate-certificate-reveal">
		<!-- Glowing top accent -->
		<div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500"></div>

		<!-- Header -->
		<div class="relative p-6 text-center border-b border-white/10">
			<div class="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent"></div>
			<button
				onclick={onClose}
				class="absolute top-4 right-4 p-2 rounded-lg glass border border-white/10 hover:border-white/20 transition-colors"
				aria-label="Close"
			>
				<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>

			<div class="relative">
				<span class="text-5xl mb-3 block">{gradeEmoji}</span>
				<h2 class="text-2xl font-display font-bold text-white mb-1">Congratulations!</h2>
				<p class="text-gray-400">You've earned a certificate</p>
			</div>
		</div>

		<!-- Certificate Preview -->
		<div class="p-6">
			<!-- Mini certificate card -->
			<div class="relative glass rounded-xl p-6 border border-white/10 mb-6 overflow-hidden">
				<!-- Decorative corner accents -->
				<div class="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-emerald-500/50 rounded-tl-lg"></div>
				<div class="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-emerald-500/50 rounded-tr-lg"></div>
				<div class="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-emerald-500/50 rounded-bl-lg"></div>
				<div class="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-emerald-500/50 rounded-br-lg"></div>

				<div class="text-center">
					<div class="text-xs text-gray-500 uppercase tracking-widest mb-2">Certificate of Completion</div>
					<h3 class="text-lg font-display font-bold text-white mb-1">{certificateData.labTitle}</h3>
					<span class="inline-block px-3 py-1 text-xs rounded-full border {getDisciplineColor(certificateData.labDiscipline)}">
						{certificateData.labDiscipline}
					</span>

					<div class="mt-4 pt-4 border-t border-white/10">
						<p class="text-sm text-gray-400 mb-1">Awarded to</p>
						<p class="text-xl font-display text-white italic">{certificateData.studentName}</p>
					</div>
				</div>
			</div>

			<!-- Achievement stats -->
			<div class="grid grid-cols-4 gap-3 mb-6">
				<div class="text-center p-3 glass rounded-xl border border-white/10">
					<div class="text-2xl font-display font-bold bg-gradient-to-r {getGradeStyle(certificateData.grade)} bg-clip-text text-transparent">
						{certificateData.score}%
					</div>
					<div class="text-xs text-gray-500">Score</div>
				</div>
				<div class="text-center p-3 glass rounded-xl border border-white/10">
					<div class="text-2xl font-display font-bold bg-gradient-to-r {getGradeStyle(certificateData.grade)} bg-clip-text text-transparent">
						{certificateData.grade}
					</div>
					<div class="text-xs text-gray-500">Grade</div>
				</div>
				<div class="text-center p-3 glass rounded-xl border border-white/10">
					<div class="text-2xl font-display font-bold text-emerald-400">+{certificateData.xpEarned}</div>
					<div class="text-xs text-gray-500">XP</div>
				</div>
				<div class="text-center p-3 glass rounded-xl border border-white/10">
					<div class="text-2xl font-display font-bold text-cyan-400">{certificateData.duration}m</div>
					<div class="text-xs text-gray-500">Time</div>
				</div>
			</div>

			<!-- Certificate ID -->
			<div class="text-center mb-6">
				<p class="text-xs text-gray-500 mb-1">Certificate ID</p>
				<code class="text-sm text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg">
					{certificateData.certificateId}
				</code>
			</div>

			<!-- Actions -->
			<div class="flex gap-3">
				<button
					onclick={handleDownload}
					disabled={isExporting}
					class="flex-1 px-4 py-3 rounded-xl glass border border-white/10 hover:border-white/20 text-white font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
					</svg>
					Download
				</button>
				<button
					onclick={handlePrint}
					disabled={isExporting}
					class="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
					</svg>
					Print Certificate
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	@keyframes certificate-reveal {
		from {
			opacity: 0;
			transform: scale(0.9) translateY(20px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.animate-certificate-reveal {
		animation: certificate-reveal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes confetti {
		0% {
			transform: translateY(-100vh) rotate(0deg);
			opacity: 1;
		}
		100% {
			transform: translateY(100vh) rotate(720deg);
			opacity: 0;
		}
	}

	.animate-confetti {
		animation: confetti 4s linear infinite;
	}
</style>
