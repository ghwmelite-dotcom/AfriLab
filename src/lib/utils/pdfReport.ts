/**
 * Lab Report PDF Generation Utility
 * Generates downloadable PDF lab reports for completed experiments
 */

export interface LabReportData {
	// Student info
	studentName: string;
	studentId: string;
	institutionName: string;

	// Lab info
	labTitle: string;
	labDiscipline: string;
	labDate: string;
	duration: number; // minutes

	// Results
	score: number;
	grade: string;
	objectives: string[];
	completedObjectives: string[];
	observations: string[];
	measurements: { label: string; value: string; unit: string }[];

	// Analysis
	analysis: string;
	feedback: string;
	techniques: string[];
}

/**
 * Generate a printable HTML report that can be converted to PDF
 */
export function generateReportHTML(data: LabReportData): string {
	const completionRate = Math.round((data.completedObjectives.length / data.objectives.length) * 100);
	const gradeColor = getGradeColor(data.grade);

	return `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Lab Report - ${data.labTitle}</title>
	<style>
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}

		body {
			font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
			line-height: 1.6;
			color: #1f2937;
			background: #ffffff;
			padding: 40px;
			max-width: 800px;
			margin: 0 auto;
		}

		.header {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			margin-bottom: 30px;
			padding-bottom: 20px;
			border-bottom: 3px solid #10b981;
		}

		.logo {
			font-size: 24px;
			font-weight: bold;
			color: #10b981;
		}

		.logo span {
			color: #1f2937;
		}

		.report-meta {
			text-align: right;
			color: #6b7280;
			font-size: 12px;
		}

		.title-section {
			text-align: center;
			margin-bottom: 30px;
		}

		.title-section h1 {
			font-size: 28px;
			color: #1f2937;
			margin-bottom: 5px;
		}

		.title-section .subtitle {
			color: #6b7280;
			font-size: 14px;
		}

		.info-grid {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 20px;
			margin-bottom: 30px;
		}

		.info-card {
			background: #f9fafb;
			padding: 15px;
			border-radius: 8px;
			border: 1px solid #e5e7eb;
		}

		.info-card h3 {
			font-size: 12px;
			color: #6b7280;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			margin-bottom: 5px;
		}

		.info-card p {
			font-size: 14px;
			color: #1f2937;
		}

		.score-section {
			display: flex;
			justify-content: center;
			align-items: center;
			gap: 40px;
			margin-bottom: 30px;
			padding: 25px;
			background: linear-gradient(135deg, #ecfdf5, #f0fdf4);
			border-radius: 12px;
			border: 1px solid #a7f3d0;
		}

		.score-circle {
			width: 100px;
			height: 100px;
			border-radius: 50%;
			background: #ffffff;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		}

		.score-value {
			font-size: 32px;
			font-weight: bold;
			color: #1f2937;
		}

		.score-label {
			font-size: 12px;
			color: #6b7280;
		}

		.grade-badge {
			font-size: 48px;
			font-weight: bold;
			color: ${gradeColor};
		}

		.section {
			margin-bottom: 25px;
		}

		.section h2 {
			font-size: 16px;
			color: #1f2937;
			padding-bottom: 8px;
			border-bottom: 2px solid #e5e7eb;
			margin-bottom: 15px;
		}

		.objectives-list {
			list-style: none;
		}

		.objectives-list li {
			padding: 8px 0;
			padding-left: 25px;
			position: relative;
			font-size: 14px;
		}

		.objectives-list li::before {
			content: '';
			position: absolute;
			left: 0;
			top: 50%;
			transform: translateY(-50%);
			width: 16px;
			height: 16px;
			border-radius: 50%;
			background: #e5e7eb;
		}

		.objectives-list li.completed::before {
			background: #10b981;
		}

		.objectives-list li.completed::after {
			content: '✓';
			position: absolute;
			left: 3px;
			top: 50%;
			transform: translateY(-50%);
			color: white;
			font-size: 10px;
		}

		.measurements-table {
			width: 100%;
			border-collapse: collapse;
			font-size: 14px;
		}

		.measurements-table th,
		.measurements-table td {
			padding: 10px;
			text-align: left;
			border-bottom: 1px solid #e5e7eb;
		}

		.measurements-table th {
			background: #f9fafb;
			font-weight: 600;
			font-size: 12px;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			color: #6b7280;
		}

		.observations-list {
			list-style: decimal;
			padding-left: 20px;
		}

		.observations-list li {
			padding: 5px 0;
			font-size: 14px;
		}

		.analysis-text {
			font-size: 14px;
			color: #374151;
			line-height: 1.8;
		}

		.feedback-box {
			background: #fef3c7;
			border: 1px solid #fcd34d;
			border-radius: 8px;
			padding: 15px;
			font-size: 14px;
			color: #92400e;
		}

		.techniques-list {
			display: flex;
			flex-wrap: wrap;
			gap: 8px;
		}

		.technique-badge {
			background: #e0f2fe;
			color: #0369a1;
			padding: 4px 12px;
			border-radius: 999px;
			font-size: 12px;
		}

		.footer {
			margin-top: 40px;
			padding-top: 20px;
			border-top: 1px solid #e5e7eb;
			display: flex;
			justify-content: space-between;
			align-items: center;
			color: #9ca3af;
			font-size: 11px;
		}

		.signature-line {
			width: 200px;
			border-top: 1px solid #1f2937;
			padding-top: 5px;
			text-align: center;
		}

		@media print {
			body {
				padding: 20px;
			}

			.score-section {
				-webkit-print-color-adjust: exact;
				print-color-adjust: exact;
			}
		}
	</style>
</head>
<body>
	<div class="header">
		<div class="logo">Afri<span>Lab</span></div>
		<div class="report-meta">
			<div>Virtual Laboratory Report</div>
			<div>Generated: ${new Date().toLocaleDateString()}</div>
		</div>
	</div>

	<div class="title-section">
		<h1>${data.labTitle}</h1>
		<div class="subtitle">${data.labDiscipline} Laboratory Experiment</div>
	</div>

	<div class="info-grid">
		<div class="info-card">
			<h3>Student</h3>
			<p><strong>${data.studentName}</strong></p>
			<p>ID: ${data.studentId}</p>
		</div>
		<div class="info-card">
			<h3>Institution</h3>
			<p>${data.institutionName}</p>
		</div>
		<div class="info-card">
			<h3>Date Completed</h3>
			<p>${data.labDate}</p>
		</div>
		<div class="info-card">
			<h3>Duration</h3>
			<p>${data.duration} minutes</p>
		</div>
	</div>

	<div class="score-section">
		<div class="score-circle">
			<div class="score-value">${data.score}</div>
			<div class="score-label">Score</div>
		</div>
		<div>
			<div class="grade-badge">${data.grade}</div>
			<div class="score-label" style="text-align: center;">Grade</div>
		</div>
		<div class="score-circle">
			<div class="score-value">${completionRate}%</div>
			<div class="score-label">Completion</div>
		</div>
	</div>

	<div class="section">
		<h2>Learning Objectives</h2>
		<ul class="objectives-list">
			${data.objectives.map(obj =>
				`<li class="${data.completedObjectives.includes(obj) ? 'completed' : ''}">${obj}</li>`
			).join('')}
		</ul>
	</div>

	${data.measurements.length > 0 ? `
	<div class="section">
		<h2>Measurements & Data</h2>
		<table class="measurements-table">
			<thead>
				<tr>
					<th>Parameter</th>
					<th>Value</th>
					<th>Unit</th>
				</tr>
			</thead>
			<tbody>
				${data.measurements.map(m =>
					`<tr><td>${m.label}</td><td>${m.value}</td><td>${m.unit}</td></tr>`
				).join('')}
			</tbody>
		</table>
	</div>
	` : ''}

	${data.observations.length > 0 ? `
	<div class="section">
		<h2>Observations</h2>
		<ol class="observations-list">
			${data.observations.map(obs => `<li>${obs}</li>`).join('')}
		</ol>
	</div>
	` : ''}

	<div class="section">
		<h2>Analysis</h2>
		<p class="analysis-text">${data.analysis}</p>
	</div>

	<div class="section">
		<h2>Instructor Feedback</h2>
		<div class="feedback-box">${data.feedback}</div>
	</div>

	${data.techniques.length > 0 ? `
	<div class="section">
		<h2>Techniques Practiced</h2>
		<div class="techniques-list">
			${data.techniques.map(t => `<span class="technique-badge">${t}</span>`).join('')}
		</div>
	</div>
	` : ''}

	<div class="footer">
		<div>
			<div>This report was auto-generated by AfriLab Virtual Laboratory Platform</div>
			<div>For verification, contact your institution's lab coordinator</div>
		</div>
		<div class="signature-line">
			Instructor Signature
		</div>
	</div>
</body>
</html>
`;
}

function getGradeColor(grade: string): string {
	switch (grade) {
		case 'A': return '#10b981';
		case 'B': return '#06b6d4';
		case 'C': return '#f59e0b';
		case 'D': return '#f97316';
		default: return '#ef4444';
	}
}

/**
 * Trigger browser print dialog for the report
 */
export function printReport(data: LabReportData): void {
	const html = generateReportHTML(data);
	const printWindow = window.open('', '_blank');

	if (printWindow) {
		printWindow.document.write(html);
		printWindow.document.close();

		// Wait for content to load before printing
		printWindow.onload = () => {
			printWindow.print();
		};
	}
}

/**
 * Download report as HTML file (user can save as PDF)
 */
export function downloadReportHTML(data: LabReportData): void {
	const html = generateReportHTML(data);
	const blob = new Blob([html], { type: 'text/html' });
	const url = URL.createObjectURL(blob);

	const a = document.createElement('a');
	a.href = url;
	a.download = `${data.labTitle.replace(/\s+/g, '_')}_Report_${data.studentName.replace(/\s+/g, '_')}.html`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
