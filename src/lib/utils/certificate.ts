/**
 * Lab Completion Certificate Generation Utility
 * Generates beautiful, printable certificates for completed labs
 */

export interface CertificateData {
	// Student info
	studentName: string;
	studentId: string;

	// Lab info
	labTitle: string;
	labDiscipline: string;
	completionDate: string;
	duration: number; // minutes

	// Achievement
	score: number;
	grade: string;
	xpEarned: number;

	// Certificate
	certificateId: string;
	institutionName: string;
}

/**
 * Generate a unique certificate ID
 */
export function generateCertificateId(): string {
	const timestamp = Date.now().toString(36).toUpperCase();
	const random = Math.random().toString(36).substring(2, 8).toUpperCase();
	return `AFL-${timestamp}-${random}`;
}

/**
 * Get discipline-specific colors
 */
function getDisciplineColors(discipline: string): { primary: string; secondary: string; gradient: string } {
	const colors: Record<string, { primary: string; secondary: string; gradient: string }> = {
		Chemistry: { primary: '#06b6d4', secondary: '#0891b2', gradient: 'from-cyan-500 to-teal-500' },
		Biology: { primary: '#10b981', secondary: '#059669', gradient: 'from-emerald-500 to-green-500' },
		Physics: { primary: '#f59e0b', secondary: '#d97706', gradient: 'from-amber-500 to-orange-500' },
		Pharmacy: { primary: '#ec4899', secondary: '#db2777', gradient: 'from-pink-500 to-rose-500' },
		Medical: { primary: '#ef4444', secondary: '#dc2626', gradient: 'from-rose-500 to-red-500' }
	};
	return colors[discipline] || colors.Chemistry;
}

/**
 * Generate printable HTML certificate
 */
export function generateCertificateHTML(data: CertificateData): string {
	const colors = getDisciplineColors(data.labDiscipline);
	const gradeEmoji = data.grade === 'A' ? '🏆' : data.grade === 'B' ? '🥈' : data.grade === 'C' ? '🥉' : '📜';

	return `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Certificate - ${data.labTitle}</title>
	<style>
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}

		@page {
			size: landscape;
			margin: 0;
		}

		body {
			font-family: 'Georgia', 'Times New Roman', serif;
			background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
			min-height: 100vh;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 20px;
		}

		.certificate {
			width: 100%;
			max-width: 1000px;
			aspect-ratio: 1.414;
			background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
			border-radius: 8px;
			position: relative;
			overflow: hidden;
			box-shadow:
				0 25px 50px -12px rgba(0, 0, 0, 0.5),
				0 0 0 1px rgba(255, 255, 255, 0.1);
		}

		/* Decorative border */
		.border-outer {
			position: absolute;
			inset: 12px;
			border: 3px solid ${colors.primary};
			border-radius: 4px;
		}

		.border-inner {
			position: absolute;
			inset: 20px;
			border: 1px solid ${colors.secondary};
			border-radius: 2px;
		}

		/* Corner decorations */
		.corner {
			position: absolute;
			width: 80px;
			height: 80px;
			opacity: 0.15;
		}

		.corner-tl { top: 30px; left: 30px; }
		.corner-tr { top: 30px; right: 30px; transform: rotate(90deg); }
		.corner-bl { bottom: 30px; left: 30px; transform: rotate(-90deg); }
		.corner-br { bottom: 30px; right: 30px; transform: rotate(180deg); }

		.corner svg {
			width: 100%;
			height: 100%;
			fill: ${colors.primary};
		}

		/* Main content */
		.content {
			position: relative;
			height: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 60px 80px;
			text-align: center;
		}

		/* Header */
		.logo {
			font-family: 'Segoe UI', system-ui, sans-serif;
			font-size: 28px;
			font-weight: bold;
			color: ${colors.primary};
			margin-bottom: 8px;
			letter-spacing: 2px;
		}

		.logo span {
			color: #1e293b;
		}

		.subtitle {
			font-size: 12px;
			text-transform: uppercase;
			letter-spacing: 4px;
			color: #64748b;
			margin-bottom: 30px;
		}

		/* Certificate title */
		.title {
			font-size: 42px;
			font-weight: normal;
			color: #1e293b;
			margin-bottom: 8px;
			letter-spacing: 3px;
		}

		.title-line {
			width: 200px;
			height: 2px;
			background: linear-gradient(90deg, transparent, ${colors.primary}, transparent);
			margin: 0 auto 30px;
		}

		/* Certification text */
		.certify-text {
			font-size: 14px;
			color: #64748b;
			margin-bottom: 15px;
		}

		/* Student name */
		.student-name {
			font-size: 36px;
			font-style: italic;
			color: #1e293b;
			margin-bottom: 15px;
			font-weight: normal;
		}

		.student-name-line {
			width: 400px;
			height: 1px;
			background: #cbd5e1;
			margin: 0 auto 25px;
		}

		/* Lab details */
		.completion-text {
			font-size: 14px;
			color: #475569;
			margin-bottom: 8px;
			line-height: 1.8;
		}

		.lab-title {
			font-size: 22px;
			font-weight: bold;
			color: ${colors.primary};
			margin-bottom: 5px;
		}

		.discipline-badge {
			display: inline-block;
			font-size: 11px;
			text-transform: uppercase;
			letter-spacing: 2px;
			color: white;
			background: ${colors.primary};
			padding: 4px 16px;
			border-radius: 20px;
			margin-bottom: 25px;
		}

		/* Achievement section */
		.achievement-row {
			display: flex;
			justify-content: center;
			gap: 50px;
			margin-bottom: 30px;
		}

		.achievement {
			text-align: center;
		}

		.achievement-value {
			font-size: 28px;
			font-weight: bold;
			color: ${colors.primary};
		}

		.achievement-label {
			font-size: 11px;
			text-transform: uppercase;
			letter-spacing: 1px;
			color: #64748b;
		}

		/* Footer */
		.footer {
			display: flex;
			justify-content: space-between;
			align-items: flex-end;
			width: 100%;
			margin-top: auto;
		}

		.signature-block {
			text-align: center;
		}

		.signature-line {
			width: 180px;
			height: 1px;
			background: #1e293b;
			margin-bottom: 8px;
		}

		.signature-label {
			font-size: 11px;
			color: #64748b;
		}

		.certificate-id {
			text-align: center;
		}

		.id-label {
			font-size: 10px;
			color: #94a3b8;
			margin-bottom: 4px;
		}

		.id-value {
			font-family: 'Courier New', monospace;
			font-size: 12px;
			color: #64748b;
			letter-spacing: 1px;
		}

		.date-block {
			text-align: center;
		}

		.date-value {
			font-size: 14px;
			color: #1e293b;
			margin-bottom: 4px;
		}

		.date-label {
			font-size: 11px;
			color: #64748b;
		}

		/* Seal */
		.seal {
			position: absolute;
			bottom: 80px;
			right: 100px;
			width: 100px;
			height: 100px;
			opacity: 0.9;
		}

		.seal-circle {
			width: 100%;
			height: 100%;
			border: 3px solid ${colors.primary};
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			background: linear-gradient(135deg, white, #f1f5f9);
		}

		.seal-inner {
			width: 80%;
			height: 80%;
			border: 1px solid ${colors.secondary};
			border-radius: 50%;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
		}

		.seal-icon {
			font-size: 24px;
			margin-bottom: 2px;
		}

		.seal-text {
			font-size: 8px;
			text-transform: uppercase;
			letter-spacing: 1px;
			color: ${colors.primary};
			font-weight: bold;
		}

		@media print {
			body {
				background: white;
				padding: 0;
			}

			.certificate {
				box-shadow: none;
				max-width: none;
				width: 100%;
				height: 100vh;
				border-radius: 0;
			}

			.border-outer,
			.border-inner,
			.corner,
			.discipline-badge,
			.seal-circle {
				-webkit-print-color-adjust: exact;
				print-color-adjust: exact;
			}
		}
	</style>
</head>
<body>
	<div class="certificate">
		<!-- Decorative borders -->
		<div class="border-outer"></div>
		<div class="border-inner"></div>

		<!-- Corner decorations -->
		<div class="corner corner-tl">
			<svg viewBox="0 0 100 100">
				<path d="M0 0 L100 0 L100 20 L20 20 L20 100 L0 100 Z" />
				<path d="M30 0 L30 10 L100 10 L100 30 L40 30 L40 100 L30 100 L30 40 L10 40 L10 30 L0 30 L0 40 L30 40" fill="none" stroke="currentColor" stroke-width="1" />
			</svg>
		</div>
		<div class="corner corner-tr">
			<svg viewBox="0 0 100 100">
				<path d="M0 0 L100 0 L100 20 L20 20 L20 100 L0 100 Z" />
			</svg>
		</div>
		<div class="corner corner-bl">
			<svg viewBox="0 0 100 100">
				<path d="M0 0 L100 0 L100 20 L20 20 L20 100 L0 100 Z" />
			</svg>
		</div>
		<div class="corner corner-br">
			<svg viewBox="0 0 100 100">
				<path d="M0 0 L100 0 L100 20 L20 20 L20 100 L0 100 Z" />
			</svg>
		</div>

		<!-- Main content -->
		<div class="content">
			<div class="logo">AFRI<span>LAB</span></div>
			<div class="subtitle">Virtual Laboratory Platform</div>

			<h1 class="title">Certificate of Completion</h1>
			<div class="title-line"></div>

			<p class="certify-text">This is to certify that</p>
			<h2 class="student-name">${data.studentName}</h2>
			<div class="student-name-line"></div>

			<p class="completion-text">has successfully completed the virtual laboratory experiment</p>
			<h3 class="lab-title">${data.labTitle}</h3>
			<span class="discipline-badge">${data.labDiscipline}</span>

			<div class="achievement-row">
				<div class="achievement">
					<div class="achievement-value">${data.score}%</div>
					<div class="achievement-label">Score</div>
				</div>
				<div class="achievement">
					<div class="achievement-value">${data.grade}</div>
					<div class="achievement-label">Grade</div>
				</div>
				<div class="achievement">
					<div class="achievement-value">+${data.xpEarned}</div>
					<div class="achievement-label">XP Earned</div>
				</div>
				<div class="achievement">
					<div class="achievement-value">${data.duration}m</div>
					<div class="achievement-label">Duration</div>
				</div>
			</div>

			<div class="footer">
				<div class="signature-block">
					<div class="signature-line"></div>
					<div class="signature-label">Lab Coordinator</div>
				</div>

				<div class="certificate-id">
					<div class="id-label">Certificate ID</div>
					<div class="id-value">${data.certificateId}</div>
				</div>

				<div class="date-block">
					<div class="date-value">${data.completionDate}</div>
					<div class="date-label">Date of Completion</div>
				</div>
			</div>

			<!-- Seal -->
			<div class="seal">
				<div class="seal-circle">
					<div class="seal-inner">
						<span class="seal-icon">${gradeEmoji}</span>
						<span class="seal-text">Verified</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</body>
</html>
`;
}

/**
 * Print certificate via browser print dialog
 */
export function printCertificate(data: CertificateData): void {
	const html = generateCertificateHTML(data);
	const printWindow = window.open('', '_blank');

	if (printWindow) {
		printWindow.document.write(html);
		printWindow.document.close();

		printWindow.onload = () => {
			printWindow.print();
		};
	}
}

/**
 * Download certificate as HTML file
 */
export function downloadCertificateHTML(data: CertificateData): void {
	const html = generateCertificateHTML(data);
	const blob = new Blob([html], { type: 'text/html' });
	const url = URL.createObjectURL(blob);

	const a = document.createElement('a');
	a.href = url;
	a.download = `AfriLab_Certificate_${data.labTitle.replace(/\s+/g, '_')}_${data.studentName.replace(/\s+/g, '_')}.html`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

/**
 * Calculate grade from score
 */
export function calculateGrade(score: number): string {
	if (score >= 90) return 'A';
	if (score >= 80) return 'B';
	if (score >= 70) return 'C';
	if (score >= 60) return 'D';
	return 'F';
}

/**
 * Calculate XP earned based on score and lab difficulty
 */
export function calculateXP(score: number, difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'): number {
	const baseXP = { beginner: 50, intermediate: 100, advanced: 150 };
	const multiplier = score / 100;
	return Math.round(baseXP[difficulty] * multiplier);
}
