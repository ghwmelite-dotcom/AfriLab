/**
 * ECG Reading & Interpretation Lab Simulation
 * Display ECG waveforms, identify components, calculate heart rate, diagnose rhythms
 */

// ECG rhythm types
export type RhythmType = 'normal_sinus' | 'sinus_tachycardia' | 'sinus_bradycardia' | 'atrial_fibrillation' | 'ventricular_tachycardia';

export interface ECGRhythm {
	id: RhythmType;
	name: string;
	heartRate: number; // bpm
	rrInterval: number; // ms
	regular: boolean;
	pWavePresent: boolean;
	qrsWidth: 'narrow' | 'wide';
	qrsDurationMs: number;
	prIntervalMs: number;
	qtIntervalMs: number;
	description: string;
	clinicalSignificance: string;
	characteristics: string[];
}

export const ECG_RHYTHMS: ECGRhythm[] = [
	{
		id: 'normal_sinus',
		name: 'Normal Sinus Rhythm',
		heartRate: 75,
		rrInterval: 800,
		regular: true,
		pWavePresent: true,
		qrsWidth: 'narrow',
		qrsDurationMs: 80,
		prIntervalMs: 160,
		qtIntervalMs: 380,
		description: 'Regular rhythm with consistent P waves preceding each QRS complex at a rate of 60-100 bpm.',
		clinicalSignificance: 'Normal cardiac electrical activity. No intervention required.',
		characteristics: [
			'Rate: 60-100 bpm',
			'Regular R-R intervals',
			'Upright P waves in leads I, II, aVF',
			'Each P wave followed by a QRS complex',
			'PR interval 120-200 ms',
			'QRS duration < 120 ms'
		]
	},
	{
		id: 'sinus_tachycardia',
		name: 'Sinus Tachycardia',
		heartRate: 120,
		rrInterval: 500,
		regular: true,
		pWavePresent: true,
		qrsWidth: 'narrow',
		qrsDurationMs: 82,
		prIntervalMs: 140,
		qtIntervalMs: 320,
		description: 'Regular sinus rhythm with rate exceeding 100 bpm. P waves present and normal morphology.',
		clinicalSignificance: 'May indicate fever, pain, anxiety, dehydration, anemia, or thyrotoxicosis. Treat underlying cause.',
		characteristics: [
			'Rate: > 100 bpm',
			'Regular rhythm',
			'Normal P waves present',
			'1:1 P-to-QRS relationship',
			'Shortened PR and QT intervals',
			'Normal narrow QRS'
		]
	},
	{
		id: 'sinus_bradycardia',
		name: 'Sinus Bradycardia',
		heartRate: 48,
		rrInterval: 1250,
		regular: true,
		pWavePresent: true,
		qrsWidth: 'narrow',
		qrsDurationMs: 84,
		prIntervalMs: 180,
		qtIntervalMs: 440,
		description: 'Regular sinus rhythm with rate below 60 bpm. Normal P-QRS-T morphology.',
		clinicalSignificance: 'May be normal in athletes. Can indicate hypothyroidism, increased vagal tone, or drug effects (beta-blockers).',
		characteristics: [
			'Rate: < 60 bpm',
			'Regular rhythm',
			'Normal P waves present',
			'Normal PR interval',
			'Normal narrow QRS',
			'May be physiological in athletes'
		]
	},
	{
		id: 'atrial_fibrillation',
		name: 'Atrial Fibrillation',
		heartRate: 110,
		rrInterval: 545,
		regular: false,
		pWavePresent: false,
		qrsWidth: 'narrow',
		qrsDurationMs: 86,
		prIntervalMs: 0,
		qtIntervalMs: 340,
		description: 'Irregularly irregular rhythm with no discernible P waves. Fibrillatory baseline with chaotic atrial activity.',
		clinicalSignificance: 'Increased risk of stroke and heart failure. Requires rate/rhythm control and anticoagulation assessment (CHA2DS2-VASc score).',
		characteristics: [
			'Irregularly irregular R-R intervals',
			'Absent P waves',
			'Fibrillatory baseline',
			'Variable ventricular rate',
			'Narrow QRS (unless aberrant conduction)',
			'No consistent PR interval'
		]
	},
	{
		id: 'ventricular_tachycardia',
		name: 'Ventricular Tachycardia',
		heartRate: 180,
		rrInterval: 333,
		regular: true,
		pWavePresent: false,
		qrsWidth: 'wide',
		qrsDurationMs: 160,
		prIntervalMs: 0,
		qtIntervalMs: 280,
		description: 'Wide-complex tachycardia originating from the ventricles. Three or more consecutive ventricular beats at rate > 100 bpm.',
		clinicalSignificance: 'Medical emergency. May degenerate into ventricular fibrillation. Requires immediate intervention - cardioversion or antiarrhythmics.',
		characteristics: [
			'Rate: typically 150-250 bpm',
			'Regular or slightly irregular',
			'Wide QRS complexes (> 120 ms)',
			'AV dissociation may be present',
			'No preceding P waves',
			'Concordance pattern in precordial leads'
		]
	}
];

// ECG wave components for identification exercise
export interface WaveComponent {
	id: string;
	name: string;
	description: string;
	normalDuration: string;
	significance: string;
}

export const WAVE_COMPONENTS: WaveComponent[] = [
	{
		id: 'p-wave',
		name: 'P Wave',
		description: 'Represents atrial depolarization (contraction of both atria)',
		normalDuration: '< 120 ms, < 2.5 mm amplitude',
		significance: 'Absent in AFib, inverted in junctional rhythms, peaked in right atrial enlargement'
	},
	{
		id: 'pr-interval',
		name: 'PR Interval',
		description: 'Time from start of atrial depolarization to start of ventricular depolarization',
		normalDuration: '120-200 ms (3-5 small squares)',
		significance: 'Prolonged in AV block, shortened in pre-excitation (WPW syndrome)'
	},
	{
		id: 'qrs-complex',
		name: 'QRS Complex',
		description: 'Represents ventricular depolarization (contraction of both ventricles)',
		normalDuration: '80-120 ms (2-3 small squares)',
		significance: 'Wide QRS suggests bundle branch block or ventricular origin. Amplitude changes indicate hypertrophy.'
	},
	{
		id: 'st-segment',
		name: 'ST Segment',
		description: 'Period between ventricular depolarization and repolarization',
		normalDuration: 'Isoelectric (at baseline level)',
		significance: 'Elevation indicates MI or pericarditis. Depression indicates ischemia or digoxin effect.'
	},
	{
		id: 't-wave',
		name: 'T Wave',
		description: 'Represents ventricular repolarization (relaxation of ventricles)',
		normalDuration: 'Upright in most leads, asymmetric',
		significance: 'Peaked in hyperkalemia, inverted in ischemia, flattened in hypokalemia'
	},
	{
		id: 'qt-interval',
		name: 'QT Interval',
		description: 'Total time for ventricular depolarization and repolarization',
		normalDuration: '350-450 ms (corrected QTc)',
		significance: 'Prolonged QT increases risk of Torsades de Pointes. Can be drug-induced.'
	}
];

// Quiz questions
export interface QuizQuestion {
	id: string;
	question: string;
	options: string[];
	correctIndex: number;
	explanation: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
	{
		id: 'ecg-q1',
		question: 'How do you calculate heart rate from an ECG when the rhythm is regular?',
		options: [
			'Count QRS complexes in 6 seconds and multiply by 10',
			'Divide 300 by the number of large boxes between R waves',
			'Count P waves in 10 seconds and multiply by 6',
			'Measure the QT interval and divide by 2'
		],
		correctIndex: 1,
		explanation: 'For regular rhythms, dividing 300 by the number of large boxes (0.2s each) between consecutive R waves gives the heart rate. For example, 4 large boxes = 300/4 = 75 bpm.'
	},
	{
		id: 'ecg-q2',
		question: 'Which finding is characteristic of atrial fibrillation?',
		options: [
			'Regular rhythm with peaked P waves',
			'Wide QRS complexes at 180 bpm',
			'Irregularly irregular rhythm with absent P waves',
			'Regular narrow complex tachycardia at 150 bpm'
		],
		correctIndex: 2,
		explanation: 'Atrial fibrillation is characterized by an irregularly irregular ventricular rate and the absence of organized P waves, replaced by chaotic fibrillatory baseline activity.'
	},
	{
		id: 'ecg-q3',
		question: 'A wide QRS complex (> 120 ms) tachycardia should be presumed to be which rhythm until proven otherwise?',
		options: [
			'Sinus tachycardia with bundle branch block',
			'Supraventricular tachycardia with aberrancy',
			'Ventricular tachycardia',
			'Atrial flutter with variable block'
		],
		correctIndex: 2,
		explanation: 'A wide complex tachycardia should always be presumed to be ventricular tachycardia until proven otherwise, as misdiagnosis can be fatal. VT is the most dangerous and common cause.'
	},
	{
		id: 'ecg-q4',
		question: 'What does ST segment elevation on an ECG most commonly indicate?',
		options: [
			'Hyperkalemia',
			'Acute myocardial infarction',
			'Digitalis toxicity',
			'Right bundle branch block'
		],
		correctIndex: 1,
		explanation: 'ST segment elevation is the hallmark of acute myocardial infarction (STEMI). It indicates transmural ischemia and requires immediate intervention (PCI or fibrinolysis).'
	},
	{
		id: 'ecg-q5',
		question: 'What is the normal PR interval range?',
		options: ['60-100 ms', '80-120 ms', '120-200 ms', '200-400 ms'],
		correctIndex: 2,
		explanation: 'The normal PR interval is 120-200 ms (3-5 small squares). A PR interval > 200 ms indicates first-degree AV block. A shortened PR may indicate pre-excitation syndrome.'
	}
];

// Diagnosis matching scenarios
export interface DiagnosisScenario {
	id: string;
	rhythmId: RhythmType;
	clinicalContext: string;
	correctDiagnosis: string;
	differentials: string[];
}

export const DIAGNOSIS_SCENARIOS: DiagnosisScenario[] = [
	{
		id: 'dx-1',
		rhythmId: 'sinus_tachycardia',
		clinicalContext: '28-year-old runner presents after a 10km race, feeling dizzy. Temperature 37.1C.',
		correctDiagnosis: 'Sinus Tachycardia - likely dehydration and exertion',
		differentials: ['Sinus Tachycardia', 'SVT', 'Atrial Flutter', 'Ventricular Tachycardia']
	},
	{
		id: 'dx-2',
		rhythmId: 'atrial_fibrillation',
		clinicalContext: '72-year-old with palpitations and an irregularly irregular pulse. History of hypertension.',
		correctDiagnosis: 'Atrial Fibrillation',
		differentials: ['Atrial Fibrillation', 'Multifocal Atrial Tachycardia', 'Frequent PVCs', 'Sinus Arrhythmia']
	},
	{
		id: 'dx-3',
		rhythmId: 'ventricular_tachycardia',
		clinicalContext: '58-year-old with chest pain, diaphoresis. History of prior MI. BP 80/50.',
		correctDiagnosis: 'Ventricular Tachycardia - hemodynamically unstable',
		differentials: ['Ventricular Tachycardia', 'SVT with Aberrancy', 'Atrial Fibrillation with WPW', 'Torsades de Pointes']
	},
	{
		id: 'dx-4',
		rhythmId: 'sinus_bradycardia',
		clinicalContext: '22-year-old elite cyclist at routine sports physical. Asymptomatic, resting HR 46 bpm.',
		correctDiagnosis: 'Sinus Bradycardia - physiological (athlete\'s heart)',
		differentials: ['Sinus Bradycardia', 'Second-degree AV Block', 'Junctional Rhythm', 'Sick Sinus Syndrome']
	}
];

// State
export interface ECGState {
	currentRhythmId: RhythmType | null;
	viewedRhythms: RhythmType[];
	componentIdentifications: Record<string, boolean>; // which components the student has identified
	heartRateCalculations: Record<RhythmType, number | null>; // student's calculated HR per rhythm
	diagnosisAnswers: Record<string, string | null>; // student's diagnosis per scenario
	quizAnswers: Record<string, number | null>;
	step: 'waveforms' | 'components' | 'rhythms' | 'diagnosis' | 'quiz';
}

export function createInitialState(): ECGState {
	const componentIdentifications: Record<string, boolean> = {};
	for (const c of WAVE_COMPONENTS) {
		componentIdentifications[c.id] = false;
	}

	const heartRateCalculations: Record<string, number | null> = {};
	for (const r of ECG_RHYTHMS) {
		heartRateCalculations[r.id] = null;
	}

	const diagnosisAnswers: Record<string, string | null> = {};
	for (const d of DIAGNOSIS_SCENARIOS) {
		diagnosisAnswers[d.id] = null;
	}

	const quizAnswers: Record<string, number | null> = {};
	for (const q of QUIZ_QUESTIONS) {
		quizAnswers[q.id] = null;
	}

	return {
		currentRhythmId: null,
		viewedRhythms: [],
		componentIdentifications,
		heartRateCalculations,
		diagnosisAnswers,
		quizAnswers,
		step: 'waveforms'
	};
}

// Actions
export function selectRhythm(state: ECGState, rhythmId: RhythmType): ECGState {
	const viewed = state.viewedRhythms.includes(rhythmId)
		? state.viewedRhythms
		: [...state.viewedRhythms, rhythmId];
	return { ...state, currentRhythmId: rhythmId, viewedRhythms: viewed };
}

export function identifyComponent(state: ECGState, componentId: string): ECGState {
	return {
		...state,
		componentIdentifications: {
			...state.componentIdentifications,
			[componentId]: true
		}
	};
}

export function setHeartRateCalculation(state: ECGState, rhythmId: RhythmType, hr: number): ECGState {
	return {
		...state,
		heartRateCalculations: {
			...state.heartRateCalculations,
			[rhythmId]: hr
		}
	};
}

export function setDiagnosisAnswer(state: ECGState, scenarioId: string, diagnosis: string): ECGState {
	return {
		...state,
		diagnosisAnswers: {
			...state.diagnosisAnswers,
			[scenarioId]: diagnosis
		}
	};
}

export function answerQuiz(state: ECGState, questionId: string, answerIndex: number): ECGState {
	return {
		...state,
		quizAnswers: {
			...state.quizAnswers,
			[questionId]: answerIndex
		}
	};
}

export function setStep(state: ECGState, step: ECGState['step']): ECGState {
	return { ...state, step };
}

// Generate ECG waveform data points for SVG rendering
export function generateECGWaveform(rhythm: ECGRhythm, totalPoints: number = 400): number[] {
	const data: number[] = [];
	const noise = () => (Math.random() - 0.5) * 0.02;

	// Determine cycle length in data points based on heart rate
	const cycleLength = Math.round((60 / rhythm.heartRate) * 50); // ~50 points per second

	for (let i = 0; i < totalPoints; i++) {
		let value = 0;

		if (rhythm.id === 'atrial_fibrillation') {
			// Irregular rhythm - vary cycle length
			const irregularCycle = cycleLength + Math.floor((Math.sin(i * 0.37) + Math.cos(i * 0.23)) * cycleLength * 0.2);
			const pos = i % Math.max(irregularCycle, 8);
			const mid = Math.floor(irregularCycle * 0.4);

			// Fibrillatory baseline
			value = (Math.sin(i * 0.8) + Math.sin(i * 1.3) + Math.sin(i * 2.1)) * 0.03;

			// QRS complex (narrow)
			if (pos === mid - 1) value += -0.08 + noise();
			else if (pos === mid) value += 0.85 + noise();
			else if (pos === mid + 1) value += -0.15 + noise();
			// T wave
			else if (pos >= mid + 3 && pos <= mid + 6) value += 0.15 * Math.sin(((pos - mid - 3) / 3) * Math.PI) + noise();
		} else if (rhythm.id === 'ventricular_tachycardia') {
			// Wide complex tachycardia
			const pos = i % Math.max(cycleLength, 6);
			const qrsWidth = Math.floor(cycleLength * 0.4); // Wide QRS

			if (pos < qrsWidth) {
				// Wide bizarre QRS
				const phase = pos / qrsWidth;
				if (phase < 0.2) value = -0.3 * (phase / 0.2) + noise();
				else if (phase < 0.4) value = -0.3 + 1.4 * ((phase - 0.2) / 0.2) + noise();
				else if (phase < 0.6) value = 1.1 - 1.6 * ((phase - 0.4) / 0.2) + noise();
				else if (phase < 0.8) value = -0.5 + 0.5 * ((phase - 0.6) / 0.2) + noise();
				else value = 0 + noise();
			} else {
				// ST-T changes
				const restPhase = (pos - qrsWidth) / (cycleLength - qrsWidth);
				value = -0.1 * Math.sin(restPhase * Math.PI) + noise();
			}
		} else {
			// Normal sinus, sinus tachy, sinus brady - standard PQRST
			const pos = i % Math.max(cycleLength, 8);
			const pStart = Math.floor(cycleLength * 0.08);
			const pEnd = Math.floor(cycleLength * 0.18);
			const qStart = Math.floor(cycleLength * 0.25);
			const rPeak = Math.floor(cycleLength * 0.3);
			const sEnd = Math.floor(cycleLength * 0.35);
			const tStart = Math.floor(cycleLength * 0.5);
			const tEnd = Math.floor(cycleLength * 0.7);

			// P wave
			if (pos >= pStart && pos <= pEnd) {
				const pPhase = (pos - pStart) / (pEnd - pStart);
				value = 0.15 * Math.sin(pPhase * Math.PI) + noise();
			}
			// Q wave
			else if (pos === qStart) {
				value = -0.08 + noise();
			}
			// R wave
			else if (pos === rPeak) {
				value = 0.9 + noise();
			}
			// S wave
			else if (pos === rPeak + 1) {
				value = -0.2 + noise();
			}
			// ST segment (at baseline)
			else if (pos > sEnd && pos < tStart) {
				value = noise();
			}
			// T wave
			else if (pos >= tStart && pos <= tEnd) {
				const tPhase = (pos - tStart) / (tEnd - tStart);
				value = 0.25 * Math.sin(tPhase * Math.PI) + noise();
			}
			// Baseline
			else {
				value = noise();
			}
		}

		data.push(value);
	}

	return data;
}

// Analysis
export interface ECGAnalysisResult {
	rhythmsViewed: number;
	totalRhythms: number;
	componentsIdentified: number;
	totalComponents: number;
	hrAccuracy: number; // percentage of correct HR calculations (within 10 bpm)
	diagnosisCorrect: number;
	totalDiagnoses: number;
	quizScore: number;
	quizTotal: number;
	overallScore: number;
	grade: 'A' | 'B' | 'C' | 'D' | 'F';
	feedback: string;
}

export function analyzeECGLab(state: ECGState): ECGAnalysisResult {
	const rhythmsViewed = state.viewedRhythms.length;
	const totalRhythms = ECG_RHYTHMS.length;

	const componentsIdentified = Object.values(state.componentIdentifications).filter(Boolean).length;
	const totalComponents = WAVE_COMPONENTS.length;

	// HR calculation accuracy
	let hrCorrect = 0;
	let hrAttempted = 0;
	for (const rhythm of ECG_RHYTHMS) {
		const studentHR = state.heartRateCalculations[rhythm.id];
		if (studentHR !== null && studentHR !== undefined) {
			hrAttempted++;
			if (Math.abs(studentHR - rhythm.heartRate) <= 10) hrCorrect++;
		}
	}
	const hrAccuracy = hrAttempted > 0 ? (hrCorrect / hrAttempted) * 100 : 0;

	// Diagnosis accuracy
	let diagnosisCorrect = 0;
	for (const scenario of DIAGNOSIS_SCENARIOS) {
		if (state.diagnosisAnswers[scenario.id] === scenario.differentials[0]) {
			diagnosisCorrect++;
		}
	}
	const totalDiagnoses = DIAGNOSIS_SCENARIOS.length;

	// Quiz
	let quizCorrect = 0;
	for (const q of QUIZ_QUESTIONS) {
		if (state.quizAnswers[q.id] === q.correctIndex) quizCorrect++;
	}

	// Weighted score: viewing 10%, components 20%, HR calc 20%, diagnosis 25%, quiz 25%
	const viewScore = totalRhythms > 0 ? (rhythmsViewed / totalRhythms) * 100 : 0;
	const compScore = totalComponents > 0 ? (componentsIdentified / totalComponents) * 100 : 0;
	const diagScore = totalDiagnoses > 0 ? (diagnosisCorrect / totalDiagnoses) * 100 : 0;
	const quizPct = QUIZ_QUESTIONS.length > 0 ? (quizCorrect / QUIZ_QUESTIONS.length) * 100 : 0;

	const overallScore = Math.round(
		viewScore * 0.1 + compScore * 0.2 + hrAccuracy * 0.2 + diagScore * 0.25 + quizPct * 0.25
	);

	let grade: 'A' | 'B' | 'C' | 'D' | 'F';
	if (overallScore >= 90) grade = 'A';
	else if (overallScore >= 80) grade = 'B';
	else if (overallScore >= 70) grade = 'C';
	else if (overallScore >= 60) grade = 'D';
	else grade = 'F';

	let feedback = '';
	if (overallScore >= 90) {
		feedback = 'Excellent ECG interpretation skills! You correctly identified wave components, calculated heart rates, and matched rhythms to diagnoses.';
	} else if (overallScore >= 75) {
		feedback = 'Good work on ECG reading. Review the rhythms you found challenging and practice the systematic approach to interpretation.';
	} else if (overallScore >= 50) {
		feedback = 'You are developing your ECG skills. Focus on the systematic approach: Rate, Rhythm, P waves, PR interval, QRS width.';
	} else {
		feedback = 'Keep practicing! Remember the systematic approach: check Rate, Rhythm, Axis, P waves, PR interval, QRS complex, ST segment, and T waves.';
	}

	return {
		rhythmsViewed,
		totalRhythms,
		componentsIdentified,
		totalComponents,
		hrAccuracy: Math.round(hrAccuracy),
		diagnosisCorrect,
		totalDiagnoses,
		quizScore: quizCorrect,
		quizTotal: QUIZ_QUESTIONS.length,
		overallScore,
		grade,
		feedback
	};
}
