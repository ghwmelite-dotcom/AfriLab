/**
 * Quality Control Testing Laboratory Simulation
 * Pharmacy experiment for pharmaceutical quality control testing (USP standards)
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export interface QualityControlState {
	selectedBatch: Batch | null;
	dissolutionTest: DissolutionTest;
	contentUniformity: ContentUniformityTest;
	hardnessTest: HardnessTest;
	friabilityTest: FriabilityTest;
	completedTests: string[];
	observations: string[];
	passFailResults: Record<string, boolean | null>;
	quizAnswers: Map<string, string>;
}

export interface Batch {
	id: string;
	drugName: string;
	batchNumber: string;
	dosageForm: 'tablet' | 'capsule';
	labelClaim: number; // mg per unit
	manufactureDate: string;
	expiryDate: string;
	batchSize: number;
	description: string;
	// Hidden quality parameters (determines test outcomes)
	qualityProfile: QualityProfile;
}

export interface QualityProfile {
	meanContent: number; // percentage of label claim
	contentSD: number; // standard deviation
	hardnessMean: number; // kP (kiloponds)
	hardnessSD: number;
	friabilityPercent: number; // weight loss %
	dissolutionProfile: number[]; // cumulative % dissolved at 5, 10, 15, 20, 30, 45, 60 min
	defectLevel: 'none' | 'minor' | 'major';
}

// Dissolution
export interface DissolutionTest {
	isRunning: boolean;
	currentTime: number; // minutes
	vessels: DissolutionVessel[];
	medium: string;
	apparatus: 'paddle' | 'basket';
	rpm: number;
	temperature: number; // °C
	timePoints: number[]; // predefined sampling times
	sampledPoints: DissolutionSample[];
}

export interface DissolutionVessel {
	id: number;
	tabletAdded: boolean;
	percentDissolved: number;
}

export interface DissolutionSample {
	time: number;
	vesselReadings: number[]; // percent dissolved for each vessel
	mean: number;
}

// Content Uniformity
export interface ContentUniformityTest {
	isRunning: boolean;
	tablets: TabletWeight[];
	assayResults: number[]; // percent of label claim per unit
	acceptanceValue: number | null;
}

export interface TabletWeight {
	id: number;
	weight: number; // mg
	isWeighed: boolean;
}

// Hardness
export interface HardnessTest {
	isRunning: boolean;
	readings: HardnessReading[];
	currentTablet: number;
}

export interface HardnessReading {
	tabletId: number;
	hardness: number; // kP
	isTested: boolean;
}

// Friability
export interface FriabilityTest {
	isRunning: boolean;
	initialWeight: number; // g
	finalWeight: number | null; // g
	percentLoss: number | null;
	rotations: number;
	isComplete: boolean;
}

export interface QualityControlConfig {
	batchId: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────

export const BATCHES: Batch[] = [
	{
		id: 'batch-good',
		drugName: 'Ibuprofen',
		batchNumber: 'IBU-2026-001',
		dosageForm: 'tablet',
		labelClaim: 200,
		manufactureDate: '2026-01-15',
		expiryDate: '2028-01-15',
		batchSize: 100000,
		description: 'Ibuprofen 200 mg film-coated tablets - Batch produced under optimal conditions.',
		qualityProfile: {
			meanContent: 99.5,
			contentSD: 1.8,
			hardnessMean: 12,
			hardnessSD: 1.0,
			friabilityPercent: 0.3,
			dissolutionProfile: [25, 52, 72, 85, 94, 98, 99],
			defectLevel: 'none'
		}
	},
	{
		id: 'batch-borderline',
		drugName: 'Ibuprofen',
		batchNumber: 'IBU-2026-002',
		dosageForm: 'tablet',
		labelClaim: 200,
		manufactureDate: '2026-02-01',
		expiryDate: '2028-02-01',
		batchSize: 100000,
		description:
			'Ibuprofen 200 mg tablets - Batch produced with minor compression force variation.',
		qualityProfile: {
			meanContent: 96.0,
			contentSD: 4.5,
			hardnessMean: 8,
			hardnessSD: 2.5,
			friabilityPercent: 0.85,
			dissolutionProfile: [15, 35, 55, 68, 80, 88, 93],
			defectLevel: 'minor'
		}
	},
	{
		id: 'batch-failed',
		drugName: 'Ibuprofen',
		batchNumber: 'IBU-2026-003',
		dosageForm: 'tablet',
		labelClaim: 200,
		manufactureDate: '2026-02-15',
		expiryDate: '2028-02-15',
		batchSize: 100000,
		description:
			'Ibuprofen 200 mg tablets - Batch produced with suspected blending issues.',
		qualityProfile: {
			meanContent: 88.0,
			contentSD: 8.0,
			hardnessMean: 5.5,
			hardnessSD: 3.0,
			friabilityPercent: 1.5,
			dissolutionProfile: [8, 20, 35, 48, 60, 70, 78],
			defectLevel: 'major'
		}
	}
];

// USP specification limits
export const USP_SPECS = {
	dissolution: {
		Q: 80, // % dissolved at 30 min (Q value)
		timePoint: 30, // minutes
		stage1MinVessels: 6, // vessels that must meet Q
		stage1Tolerance: 5 // individual units must be >= Q + 5 at stage 1? Actually Q alone at S1
	},
	contentUniformity: {
		acceptanceValueLimit: 15, // L1 for n=10
		meanRange: { min: 85, max: 115 }, // % of label claim
		individualRange: { min: 75, max: 125 },
		k: 2.4 // acceptability constant for n=10
	},
	hardness: {
		minHardness: 4, // kP minimum recommended
		typicalRange: { min: 6, max: 18 }
	},
	friability: {
		maxPercentLoss: 1.0, // max 1% weight loss
		rotations: 100,
		duration: 4 // minutes
	}
};

const DISSOLUTION_TIME_POINTS = [5, 10, 15, 20, 30, 45, 60]; // minutes

// ── Helper Functions ───────────────────────────────────────────────────────────

function gaussianRandom(mean: number, sd: number): number {
	// Box-Muller transform
	const u1 = Math.random();
	const u2 = Math.random();
	const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
	return mean + z * sd;
}

function generateTabletWeights(batch: Batch, count: number): TabletWeight[] {
	// Average tablet weight ~500 mg for 200 mg ibuprofen (with excipients)
	const avgWeight = 500;
	const weightSD = batch.qualityProfile.defectLevel === 'major' ? 25 : batch.qualityProfile.defectLevel === 'minor' ? 12 : 5;

	return Array.from({ length: count }, (_, i) => ({
		id: i + 1,
		weight: Math.round(gaussianRandom(avgWeight, weightSD) * 10) / 10,
		isWeighed: false
	}));
}

function generateContentAssay(batch: Batch, count: number): number[] {
	return Array.from({ length: count }, () =>
		Math.round(gaussianRandom(batch.qualityProfile.meanContent, batch.qualityProfile.contentSD) * 10) / 10
	);
}

function generateHardnessReadings(batch: Batch, count: number): HardnessReading[] {
	return Array.from({ length: count }, (_, i) => ({
		tabletId: i + 1,
		hardness: Math.round(gaussianRandom(batch.qualityProfile.hardnessMean, batch.qualityProfile.hardnessSD) * 10) / 10,
		isTested: false
	}));
}

function generateDissolutionVessel(batch: Batch, timeIndex: number): number {
	const baseValue = batch.qualityProfile.dissolutionProfile[timeIndex] || 0;
	const noise = gaussianRandom(0, 3);
	return Math.max(0, Math.min(100, Math.round((baseValue + noise) * 10) / 10));
}

// ── State Management ───────────────────────────────────────────────────────────

export function createInitialState(config: QualityControlConfig): QualityControlState {
	const batch = BATCHES.find((b) => b.id === config.batchId) || BATCHES[0];

	return {
		selectedBatch: batch,
		dissolutionTest: {
			isRunning: false,
			currentTime: 0,
			vessels: Array.from({ length: 6 }, (_, i) => ({
				id: i + 1,
				tabletAdded: false,
				percentDissolved: 0
			})),
			medium: '0.1 N HCl, 900 mL',
			apparatus: 'paddle',
			rpm: 50,
			temperature: 37,
			timePoints: DISSOLUTION_TIME_POINTS,
			sampledPoints: []
		},
		contentUniformity: {
			isRunning: false,
			tablets: generateTabletWeights(batch, 10),
			assayResults: generateContentAssay(batch, 10),
			acceptanceValue: null
		},
		hardnessTest: {
			isRunning: false,
			readings: generateHardnessReadings(batch, 10),
			currentTablet: 0
		},
		friabilityTest: {
			isRunning: false,
			initialWeight: 0,
			finalWeight: null,
			percentLoss: null,
			rotations: 0,
			isComplete: false
		},
		completedTests: [],
		observations: [],
		passFailResults: {
			dissolution: null,
			contentUniformity: null,
			hardness: null,
			friability: null
		},
		quizAnswers: new Map()
	};
}

export function selectBatch(state: QualityControlState, batchId: string): QualityControlState {
	return createInitialState({ batchId });
}

// Dissolution test actions
export function startDissolution(state: QualityControlState): QualityControlState {
	if (!state.selectedBatch) return state;

	const vessels = state.dissolutionTest.vessels.map((v) => ({
		...v,
		tabletAdded: true,
		percentDissolved: 0
	}));

	return {
		...state,
		dissolutionTest: {
			...state.dissolutionTest,
			isRunning: true,
			currentTime: 0,
			vessels,
			sampledPoints: []
		}
	};
}

export function advanceDissolutionTime(state: QualityControlState, minutes: number): QualityControlState {
	if (!state.selectedBatch || !state.dissolutionTest.isRunning) return state;

	const newTime = state.dissolutionTest.currentTime + minutes;
	const timeIndex = DISSOLUTION_TIME_POINTS.findIndex((t) => t >= newTime);
	const effectiveIndex = timeIndex >= 0 ? timeIndex : DISSOLUTION_TIME_POINTS.length - 1;

	const vessels = state.dissolutionTest.vessels.map((v) => ({
		...v,
		percentDissolved: v.tabletAdded
			? generateDissolutionVessel(state.selectedBatch!, effectiveIndex)
			: 0
	}));

	return {
		...state,
		dissolutionTest: {
			...state.dissolutionTest,
			currentTime: Math.min(newTime, 60),
			vessels
		}
	};
}

export function sampleDissolution(state: QualityControlState): QualityControlState {
	if (!state.dissolutionTest.isRunning) return state;

	const readings = state.dissolutionTest.vessels.map((v) => v.percentDissolved);
	const mean = readings.reduce((a, b) => a + b, 0) / readings.length;

	const sample: DissolutionSample = {
		time: state.dissolutionTest.currentTime,
		vesselReadings: readings,
		mean: Math.round(mean * 10) / 10
	};

	return {
		...state,
		dissolutionTest: {
			...state.dissolutionTest,
			sampledPoints: [...state.dissolutionTest.sampledPoints, sample]
		}
	};
}

export function completeDissolution(state: QualityControlState): QualityControlState {
	// Check if Q value met at 30 min
	const sample30 = state.dissolutionTest.sampledPoints.find((s) => s.time >= 30);
	const pass = sample30 ? sample30.vesselReadings.every((r) => r >= USP_SPECS.dissolution.Q) : false;

	return {
		...state,
		dissolutionTest: { ...state.dissolutionTest, isRunning: false },
		completedTests: state.completedTests.includes('dissolution')
			? state.completedTests
			: [...state.completedTests, 'dissolution'],
		passFailResults: { ...state.passFailResults, dissolution: pass }
	};
}

// Content uniformity actions
export function weighTablet(state: QualityControlState, tabletIndex: number): QualityControlState {
	const newTablets = [...state.contentUniformity.tablets];
	newTablets[tabletIndex] = { ...newTablets[tabletIndex], isWeighed: true };

	return {
		...state,
		contentUniformity: {
			...state.contentUniformity,
			isRunning: true,
			tablets: newTablets
		}
	};
}

export function calculateAcceptanceValue(state: QualityControlState): QualityControlState {
	const results = state.contentUniformity.assayResults;
	if (results.length === 0) return state;

	const mean = results.reduce((a, b) => a + b, 0) / results.length;
	const sd = Math.sqrt(results.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (results.length - 1));
	const k = USP_SPECS.contentUniformity.k;

	// AV = |M - Xbar| + k * s (simplified USP <905>)
	const referenceValue = mean <= 101.5 ? mean : 101.5;
	const av = Math.abs(referenceValue - mean) + k * sd;

	const pass = av <= USP_SPECS.contentUniformity.acceptanceValueLimit;

	return {
		...state,
		contentUniformity: {
			...state.contentUniformity,
			acceptanceValue: Math.round(av * 10) / 10
		},
		completedTests: state.completedTests.includes('contentUniformity')
			? state.completedTests
			: [...state.completedTests, 'contentUniformity'],
		passFailResults: { ...state.passFailResults, contentUniformity: pass }
	};
}

// Hardness test actions
export function testHardness(state: QualityControlState, tabletIndex: number): QualityControlState {
	const newReadings = [...state.hardnessTest.readings];
	newReadings[tabletIndex] = { ...newReadings[tabletIndex], isTested: true };

	const allTested = newReadings.every((r) => r.isTested);
	let newCompleted = state.completedTests;
	let newPassFail = state.passFailResults;

	if (allTested) {
		const avgHardness = newReadings.reduce((s, r) => s + r.hardness, 0) / newReadings.length;
		const pass = avgHardness >= USP_SPECS.hardness.minHardness;
		newCompleted = state.completedTests.includes('hardness')
			? state.completedTests
			: [...state.completedTests, 'hardness'];
		newPassFail = { ...state.passFailResults, hardness: pass };
	}

	return {
		...state,
		hardnessTest: {
			...state.hardnessTest,
			isRunning: true,
			readings: newReadings,
			currentTablet: tabletIndex
		},
		completedTests: newCompleted,
		passFailResults: newPassFail
	};
}

// Friability test actions
export function startFriability(state: QualityControlState): QualityControlState {
	if (!state.selectedBatch) return state;

	// 20 tablets, average ~500 mg each = ~10 g
	const initialWeight = Math.round(gaussianRandom(10.0, 0.05) * 1000) / 1000;

	return {
		...state,
		friabilityTest: {
			...state.friabilityTest,
			isRunning: true,
			initialWeight,
			finalWeight: null,
			percentLoss: null,
			rotations: 0,
			isComplete: false
		}
	};
}

export function advanceFriability(state: QualityControlState, rotations: number): QualityControlState {
	const newRotations = Math.min(state.friabilityTest.rotations + rotations, 100);

	return {
		...state,
		friabilityTest: {
			...state.friabilityTest,
			rotations: newRotations
		}
	};
}

export function completeFriability(state: QualityControlState): QualityControlState {
	if (!state.selectedBatch) return state;

	const lossPercent = state.selectedBatch.qualityProfile.friabilityPercent;
	const noise = gaussianRandom(0, 0.05);
	const actualLoss = Math.max(0, lossPercent + noise);
	const finalWeight =
		Math.round((state.friabilityTest.initialWeight * (1 - actualLoss / 100)) * 1000) / 1000;
	const percentLoss = Math.round(actualLoss * 100) / 100;

	const pass = percentLoss <= USP_SPECS.friability.maxPercentLoss;

	return {
		...state,
		friabilityTest: {
			...state.friabilityTest,
			isRunning: false,
			finalWeight,
			percentLoss,
			rotations: 100,
			isComplete: true
		},
		completedTests: state.completedTests.includes('friability')
			? state.completedTests
			: [...state.completedTests, 'friability'],
		passFailResults: { ...state.passFailResults, friability: pass }
	};
}

export function addObservation(state: QualityControlState, observation: string): QualityControlState {
	return { ...state, observations: [...state.observations, observation] };
}

export function answerQuiz(state: QualityControlState, questionId: string, answer: string): QualityControlState {
	const newAnswers = new Map(state.quizAnswers);
	newAnswers.set(questionId, answer);
	return { ...state, quizAnswers: newAnswers };
}

// ── Analysis ───────────────────────────────────────────────────────────────────

export interface QualityControlAnalysis {
	score: number;
	grade: 'A' | 'B' | 'C' | 'D' | 'F';
	testsCompleted: number;
	totalTests: number;
	testsPassed: number;
	batchDisposition: 'release' | 'reject' | 'investigate';
	quizScore: { correct: number; total: number };
	feedback: string;
}

export function analyzeQualityControl(state: QualityControlState): QualityControlAnalysis {
	const totalTests = 4;
	const testsCompleted = state.completedTests.length;

	const results = state.passFailResults;
	const testsPassed = Object.values(results).filter((v) => v === true).length;
	const testsFailed = Object.values(results).filter((v) => v === false).length;

	let batchDisposition: 'release' | 'reject' | 'investigate';
	if (testsFailed > 0) {
		batchDisposition = testsFailed >= 2 ? 'reject' : 'investigate';
	} else if (testsCompleted === totalTests) {
		batchDisposition = 'release';
	} else {
		batchDisposition = 'investigate';
	}

	let quizCorrect = 0;
	for (const q of QC_QUIZ) {
		if (state.quizAnswers.get(q.id) === q.correctAnswer) quizCorrect++;
	}

	// 60% test completion & accuracy, 40% quiz
	const completionScore = (testsCompleted / totalTests) * 100;
	const score = Math.round(
		completionScore * 0.6 + (quizCorrect / QC_QUIZ.length) * 100 * 0.4
	);

	let grade: QualityControlAnalysis['grade'];
	if (score >= 90) grade = 'A';
	else if (score >= 80) grade = 'B';
	else if (score >= 70) grade = 'C';
	else if (score >= 60) grade = 'D';
	else grade = 'F';

	let feedback: string;
	if (grade === 'A') {
		feedback =
			'Excellent! You completed all QC tests and demonstrated thorough understanding of USP specifications.';
	} else if (grade === 'B') {
		feedback =
			'Good work. Most tests were completed correctly. Review acceptance criteria for any missed items.';
	} else if (grade === 'C') {
		feedback =
			'Fair performance. Some tests were incomplete or misinterpreted. Review USP general chapters.';
	} else {
		feedback =
			'Significant gaps in QC testing knowledge. Review dissolution testing, content uniformity, and physical test procedures.';
	}

	return {
		score,
		grade,
		testsCompleted,
		totalTests,
		testsPassed,
		batchDisposition,
		quizScore: { correct: quizCorrect, total: QC_QUIZ.length },
		feedback
	};
}

// ── Quiz ───────────────────────────────────────────────────────────────────────

export interface QuizQuestion {
	id: string;
	question: string;
	options: string[];
	correctAnswer: string;
	explanation: string;
}

export const QC_QUIZ: QuizQuestion[] = [
	{
		id: 'qc1',
		question: 'What is the USP acceptance criterion for friability?',
		options: [
			'Not more than 0.5% weight loss',
			'Not more than 1.0% weight loss',
			'Not more than 2.0% weight loss',
			'Not more than 0.1% weight loss'
		],
		correctAnswer: 'Not more than 1.0% weight loss',
		explanation:
			'USP <1216> specifies that tablet friability should not exceed 1.0% weight loss after 100 rotations in the friabilator.'
	},
	{
		id: 'qc2',
		question:
			'In USP dissolution testing, what does "Q" represent?',
		options: [
			'The total drug content',
			'The specified percentage of labeled drug dissolved',
			'The quality factor',
			'The quartile value'
		],
		correctAnswer: 'The specified percentage of labeled drug dissolved',
		explanation:
			'Q is the amount of dissolved active ingredient specified in the individual monograph, expressed as a percentage of the labeled content.'
	},
	{
		id: 'qc3',
		question: 'How many units are tested in Stage 1 of USP content uniformity?',
		options: ['6', '10', '20', '30'],
		correctAnswer: '10',
		explanation:
			'USP <905> Uniformity of Dosage Units tests 10 units in Stage 1. If the acceptance value exceeds L1 (15.0), Stage 2 testing with 20 additional units may be performed.'
	},
	{
		id: 'qc4',
		question: 'Which dissolution apparatus uses a rotating basket?',
		options: ['Apparatus 1', 'Apparatus 2', 'Apparatus 3', 'Apparatus 4'],
		correctAnswer: 'Apparatus 1',
		explanation:
			'Apparatus 1 (basket) uses a rotating basket. Apparatus 2 (paddle) uses a paddle stirrer. These are the two most commonly used dissolution apparatus types.'
	},
	{
		id: 'qc5',
		question:
			'A batch of tablets has an acceptance value (AV) of 18.2. What is the disposition?',
		options: [
			'Pass - release batch',
			'Fail Stage 1 - proceed to Stage 2',
			'Fail - reject batch',
			'Pass with conditions'
		],
		correctAnswer: 'Fail Stage 1 - proceed to Stage 2',
		explanation:
			'An AV of 18.2 exceeds L1 (15.0) but the batch is not automatically rejected. Stage 2 testing with 20 additional units is performed, where the combined AV must not exceed L2 (25.0).'
	}
];
