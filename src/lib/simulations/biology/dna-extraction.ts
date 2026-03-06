/**
 * DNA Extraction & Gel Electrophoresis Lab Simulation
 * Extract DNA, load gel, run electrophoresis, analyze fragments
 */

export type ExtractionStep = 'sample-prep' | 'lysis' | 'protease' | 'precipitation' | 'spooling' | 'loading' | 'running' | 'staining' | 'analysis';

export interface DNASample {
	id: string;
	name: string;
	source: string;
	color: string;
	fragments: DNAFragment[]; // Known fragment sizes
}

export interface DNAFragment {
	size: number; // base pairs
	intensity: number; // 0-1 relative band brightness
}

export const DNA_SAMPLES: DNASample[] = [
	{
		id: 'banana',
		name: 'Banana',
		source: 'Fruit tissue',
		color: '#fde047',
		fragments: [
			{ size: 10000, intensity: 0.6 },
			{ size: 5000, intensity: 0.9 },
			{ size: 3000, intensity: 0.7 },
			{ size: 1500, intensity: 0.5 },
			{ size: 800, intensity: 0.3 }
		]
	},
	{
		id: 'strawberry',
		name: 'Strawberry',
		source: 'Fruit tissue (octoploid)',
		color: '#f87171',
		fragments: [
			{ size: 12000, intensity: 0.5 },
			{ size: 8000, intensity: 0.8 },
			{ size: 4500, intensity: 0.9 },
			{ size: 2000, intensity: 0.6 },
			{ size: 1000, intensity: 0.4 },
			{ size: 500, intensity: 0.3 }
		]
	},
	{
		id: 'onion',
		name: 'Onion',
		source: 'Bulb cells',
		color: '#d4d4d8',
		fragments: [
			{ size: 15000, intensity: 0.4 },
			{ size: 7000, intensity: 0.7 },
			{ size: 3500, intensity: 0.8 },
			{ size: 2500, intensity: 0.6 },
			{ size: 1200, intensity: 0.5 }
		]
	}
];

// Molecular weight ladder (standard marker)
export const MW_LADDER: DNAFragment[] = [
	{ size: 10000, intensity: 0.8 },
	{ size: 8000, intensity: 0.7 },
	{ size: 6000, intensity: 0.7 },
	{ size: 5000, intensity: 0.8 },
	{ size: 4000, intensity: 0.7 },
	{ size: 3000, intensity: 0.8 },
	{ size: 2000, intensity: 0.7 },
	{ size: 1500, intensity: 0.8 },
	{ size: 1000, intensity: 0.9 },
	{ size: 750, intensity: 0.7 },
	{ size: 500, intensity: 0.8 },
	{ size: 250, intensity: 0.6 }
];

export interface GelWell {
	id: number;
	sampleId: string | null; // null = empty, 'ladder' = MW ladder
	loaded: boolean;
}

export interface ExtractionState {
	currentStep: ExtractionStep;
	selectedSampleId: string;
	stepsCompleted: ExtractionStep[];
	// Extraction parameters
	lysisBufferAdded: boolean;
	lysisTime: number; // minutes (optimal: 10-15)
	proteaseAdded: boolean;
	proteaseTime: number; // minutes (optimal: 5-10)
	ethanolAdded: boolean;
	ethanolCold: boolean; // Cold ethanol works better
	dnaVisible: boolean;
	dnaSpooled: boolean;
	dnaYield: number; // 0-100 quality percentage
	// Gel electrophoresis
	gelConcentration: number; // 0.8, 1.0, 1.5, 2.0%
	wells: GelWell[];
	voltage: number; // 80-150V
	runTime: number; // minutes (0-60)
	isGelRunning: boolean;
	gelStained: boolean;
	// Analysis
	identifiedBands: Map<string, number[]>; // wellId -> estimated sizes
	quizAnswers: Map<string, string>;
	observations: string[];
}

export interface ExtractionConfig {
	defaultSample: string;
	wellCount: number;
}

// Create initial state
export function createInitialState(config: ExtractionConfig): ExtractionState {
	const wells: GelWell[] = [];
	for (let i = 0; i < config.wellCount; i++) {
		wells.push({ id: i, sampleId: null, loaded: false });
	}
	// First well is typically the ladder
	wells[0] = { id: 0, sampleId: 'ladder', loaded: false };

	return {
		currentStep: 'sample-prep',
		selectedSampleId: config.defaultSample,
		stepsCompleted: [],
		lysisBufferAdded: false,
		lysisTime: 0,
		proteaseAdded: false,
		proteaseTime: 0,
		ethanolAdded: false,
		ethanolCold: false,
		dnaVisible: false,
		dnaSpooled: false,
		dnaYield: 0,
		gelConcentration: 1.0,
		wells,
		voltage: 100,
		runTime: 0,
		isGelRunning: false,
		gelStained: false,
		identifiedBands: new Map(),
		quizAnswers: new Map(),
		observations: []
	};
}

// Select sample
export function selectSample(state: ExtractionState, sampleId: string): ExtractionState {
	return { ...state, selectedSampleId: sampleId };
}

// Advance step
export function advanceStep(state: ExtractionState, step: ExtractionStep): ExtractionState {
	const completed = state.stepsCompleted.includes(step)
		? state.stepsCompleted
		: [...state.stepsCompleted, step];
	return { ...state, currentStep: step, stepsCompleted: completed };
}

// Add lysis buffer (dish soap + salt solution)
export function addLysisBuffer(state: ExtractionState): ExtractionState {
	return { ...state, lysisBufferAdded: true };
}

// Set lysis incubation time
export function setLysisTime(state: ExtractionState, minutes: number): ExtractionState {
	return { ...state, lysisTime: Math.max(0, Math.min(30, minutes)) };
}

// Add protease (meat tenderizer / pineapple juice)
export function addProtease(state: ExtractionState): ExtractionState {
	return { ...state, proteaseAdded: true };
}

// Set protease time
export function setProteaseTime(state: ExtractionState, minutes: number): ExtractionState {
	return { ...state, proteaseTime: Math.max(0, Math.min(20, minutes)) };
}

// Add ethanol to precipitate DNA
export function addEthanol(state: ExtractionState, cold: boolean): ExtractionState {
	// Calculate DNA yield based on steps
	let yield_ = 20; // Base yield
	if (state.lysisBufferAdded) yield_ += 20;
	if (state.lysisTime >= 8 && state.lysisTime <= 18) yield_ += 15;
	else if (state.lysisTime > 0) yield_ += 5;
	if (state.proteaseAdded) yield_ += 15;
	if (state.proteaseTime >= 4 && state.proteaseTime <= 12) yield_ += 10;
	else if (state.proteaseTime > 0) yield_ += 3;
	if (cold) yield_ += 20;
	else yield_ += 8;

	const dnaVisible = yield_ >= 50;

	return {
		...state,
		ethanolAdded: true,
		ethanolCold: cold,
		dnaVisible,
		dnaYield: Math.min(100, yield_)
	};
}

// Spool DNA
export function spoolDNA(state: ExtractionState): ExtractionState {
	if (!state.dnaVisible) return state;
	return { ...state, dnaSpooled: true };
}

// Set gel concentration
export function setGelConcentration(state: ExtractionState, concentration: number): ExtractionState {
	return { ...state, gelConcentration: concentration };
}

// Load a well
export function loadWell(state: ExtractionState, wellIndex: number, sampleId: string | null): ExtractionState {
	const newWells = [...state.wells];
	newWells[wellIndex] = { ...newWells[wellIndex], sampleId, loaded: sampleId !== null };
	return { ...state, wells: newWells };
}

// Set voltage
export function setVoltage(state: ExtractionState, voltage: number): ExtractionState {
	return { ...state, voltage: Math.max(50, Math.min(200, voltage)) };
}

// Run gel
export function startGelRun(state: ExtractionState): ExtractionState {
	return { ...state, isGelRunning: true };
}

// Set run time (simulate advancing the gel)
export function setRunTime(state: ExtractionState, minutes: number): ExtractionState {
	return { ...state, runTime: Math.max(0, Math.min(60, minutes)), isGelRunning: minutes < 60 };
}

// Stain gel
export function stainGel(state: ExtractionState): ExtractionState {
	return { ...state, gelStained: true };
}

// Calculate band migration distance (smaller fragments migrate further)
export function calculateMigrationDistance(
	fragmentSize: number,
	gelConcentration: number,
	voltage: number,
	runTime: number
): number {
	// Log-linear relationship: distance = k * log10(maxSize/fragmentSize)
	const maxSize = 15000;
	const k = (voltage / 100) * (runTime / 30) * (gelConcentration / 1.0) * 0.8;
	const logRatio = Math.log10(maxSize / Math.max(fragmentSize, 100));
	return Math.min(0.95, Math.max(0.02, logRatio * k * 0.4));
}

// Identify a band size
export function identifyBand(state: ExtractionState, wellId: string, estimatedSize: number): ExtractionState {
	const newBands = new Map(state.identifiedBands);
	const existing = newBands.get(wellId) || [];
	newBands.set(wellId, [...existing, estimatedSize]);
	return { ...state, identifiedBands: newBands };
}

// Add observation
export function addObservation(state: ExtractionState, note: string): ExtractionState {
	return { ...state, observations: [...state.observations, note] };
}

// Answer quiz
export function answerQuiz(state: ExtractionState, questionId: string, answer: string): ExtractionState {
	const newAnswers = new Map(state.quizAnswers);
	newAnswers.set(questionId, answer);
	return { ...state, quizAnswers: newAnswers };
}

// Analysis
export interface ExtractionAnalysis {
	extractionQuality: number;
	stepsCompleted: number;
	totalSteps: number;
	gelRunCorrectly: boolean;
	bandsIdentified: number;
	quizScore: { correct: number; total: number };
	accuracy: number;
	grade: 'A' | 'B' | 'C' | 'D' | 'F';
	feedback: string;
}

export function analyzeExtraction(state: ExtractionState): ExtractionAnalysis {
	const totalSteps = 9;
	const stepsCompleted = state.stepsCompleted.length;
	const gelRunCorrectly = state.runTime >= 20 && state.gelStained && state.voltage >= 80 && state.voltage <= 150;
	const bandsIdentified = Array.from(state.identifiedBands.values()).reduce((sum, bands) => sum + bands.length, 0);
	const quizScore = checkQuizAnswers(state);

	let score = 0;
	score += (stepsCompleted / totalSteps) * 30; // 30 for completing steps
	score += Math.min(state.dnaYield * 0.2, 20); // 20 for extraction quality
	score += gelRunCorrectly ? 15 : 0;
	score += Math.min(bandsIdentified * 3, 15); // 15 for band identification
	score += (quizScore.correct / Math.max(quizScore.total, 1)) * 20; // 20 for quiz

	let grade: 'A' | 'B' | 'C' | 'D' | 'F';
	if (score >= 90) grade = 'A';
	else if (score >= 80) grade = 'B';
	else if (score >= 70) grade = 'C';
	else if (score >= 60) grade = 'D';
	else grade = 'F';

	let feedback = '';
	if (score >= 90) feedback = 'Excellent work! You extracted DNA efficiently and analyzed the gel results accurately.';
	else if (score >= 70) feedback = 'Good technique. Try optimizing incubation times and using cold ethanol for better yields.';
	else if (score >= 50) feedback = 'Decent progress. Make sure to complete all extraction steps before loading the gel.';
	else feedback = 'Keep practicing! Follow the protocol carefully and ensure each step is done properly.';

	return {
		extractionQuality: state.dnaYield,
		stepsCompleted,
		totalSteps,
		gelRunCorrectly,
		bandsIdentified,
		quizScore,
		accuracy: Math.round(score),
		grade,
		feedback
	};
}

// Quiz
export interface QuizQuestion {
	id: string;
	question: string;
	options: string[];
	correctAnswer: string;
	explanation: string;
}

export const DNA_QUIZ: QuizQuestion[] = [
	{
		id: 'q1',
		question: 'What is the purpose of the lysis buffer (soap and salt) in DNA extraction?',
		options: [
			'To stain the DNA',
			'To break open cell and nuclear membranes',
			'To make the DNA visible',
			'To separate DNA fragments by size'
		],
		correctAnswer: 'To break open cell and nuclear membranes',
		explanation: 'Soap (detergent) dissolves the lipid bilayer of cell and nuclear membranes, releasing the cell contents including DNA. Salt helps denature proteins.'
	},
	{
		id: 'q2',
		question: 'Why is cold ethanol used to precipitate DNA?',
		options: [
			'DNA dissolves better in cold ethanol',
			'Cold ethanol reduces DNA solubility, causing it to precipitate',
			'It kills bacteria on the DNA',
			'It changes the color of DNA'
		],
		correctAnswer: 'Cold ethanol reduces DNA solubility, causing it to precipitate',
		explanation: 'DNA is not soluble in cold ethanol. When cold ethanol is layered on top, DNA comes out of solution and can be seen as white, stringy precipitate.'
	},
	{
		id: 'q3',
		question: 'In gel electrophoresis, smaller DNA fragments migrate:',
		options: [
			'Slower (stay near wells)',
			'Faster (travel further from wells)',
			'At the same rate as large fragments',
			'In the opposite direction'
		],
		correctAnswer: 'Faster (travel further from wells)',
		explanation: 'Smaller fragments move through the gel matrix more easily, migrating further from the wells. Larger fragments are impeded by the gel pores.'
	},
	{
		id: 'q4',
		question: 'What is the purpose of the molecular weight ladder in electrophoresis?',
		options: [
			'To provide a visual marker for the gel edge',
			'To calibrate and estimate the size of unknown DNA fragments',
			'To speed up the separation process',
			'To stain the gel'
		],
		correctAnswer: 'To calibrate and estimate the size of unknown DNA fragments',
		explanation: 'The ladder contains fragments of known sizes. By comparing the migration distance of unknown fragments to the ladder, you can estimate their sizes.'
	},
	{
		id: 'q5',
		question: 'Why does DNA migrate toward the positive electrode in electrophoresis?',
		options: [
			'DNA is positively charged',
			'DNA is negatively charged due to phosphate groups',
			'The gel pushes it that direction',
			'Gravity pulls it down'
		],
		correctAnswer: 'DNA is negatively charged due to phosphate groups',
		explanation: 'DNA has a net negative charge from its phosphate backbone. In an electric field, negatively charged molecules migrate toward the positive electrode (anode).'
	}
];

export function checkQuizAnswers(state: ExtractionState): { correct: number; total: number } {
	let correct = 0;
	DNA_QUIZ.forEach((q) => {
		if (state.quizAnswers.get(q.id) === q.correctAnswer) correct++;
	});
	return { correct, total: DNA_QUIZ.length };
}
