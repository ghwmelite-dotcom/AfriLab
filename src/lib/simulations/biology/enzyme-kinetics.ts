/**
 * Enzyme Kinetics Lab Simulation
 * Study catalase enzyme activity under varying conditions
 */

export interface EnzymeConditions {
	temperature: number; // 0-80 degrees C
	pH: number; // 2-12
	substrateConcentration: number; // 0-100 mM H2O2
}

export interface ReactionDataPoint {
	time: number; // seconds
	o2Produced: number; // mL of O2
	rate: number; // mL/s
}

export interface ExperimentRun {
	id: string;
	conditions: EnzymeConditions;
	dataPoints: ReactionDataPoint[];
	initialRate: number; // mL/s (V0)
	maxO2: number;
	timestamp: Date;
}

export interface MichaelisMentenPoint {
	substrateConcentration: number;
	initialRate: number;
}

export interface KineticsState {
	currentConditions: EnzymeConditions;
	isRunning: boolean;
	currentTime: number;
	currentRun: ExperimentRun | null;
	experimentRuns: ExperimentRun[];
	selectedVariable: 'temperature' | 'pH' | 'substrate';
	mmPoints: MichaelisMentenPoint[];
	calculatedVmax: number | null;
	calculatedKm: number | null;
	quizAnswers: Map<string, string>;
	observations: string[];
}

export interface KineticsConfig {
	defaultTemperature: number;
	defaultPH: number;
	defaultSubstrate: number;
}

// Enzyme kinetics constants for catalase
const CATALASE_OPTIMAL_TEMP = 37; // degrees C
const CATALASE_OPTIMAL_PH = 7.0;
const CATALASE_VMAX = 0.85; // mL O2/s at optimal conditions
const CATALASE_KM = 25; // mM (Michaelis constant)
const DENATURATION_TEMP = 60; // degrees C

// Create initial state
export function createInitialState(config: KineticsConfig): KineticsState {
	return {
		currentConditions: {
			temperature: config.defaultTemperature,
			pH: config.defaultPH,
			substrateConcentration: config.defaultSubstrate
		},
		isRunning: false,
		currentTime: 0,
		currentRun: null,
		experimentRuns: [],
		selectedVariable: 'substrate',
		mmPoints: [],
		calculatedVmax: null,
		calculatedKm: null,
		quizAnswers: new Map(),
		observations: []
	};
}

// Calculate temperature effect on enzyme activity (bell-shaped curve)
function temperatureEffect(temp: number): number {
	if (temp >= DENATURATION_TEMP) {
		// Denaturation: rapid drop-off
		const denatFactor = Math.exp(-0.3 * (temp - DENATURATION_TEMP));
		return Math.max(0, denatFactor * 0.5);
	}
	if (temp <= 0) return 0.05;
	// Q10 rule up to optimal, then decline
	const distFromOptimal = Math.abs(temp - CATALASE_OPTIMAL_TEMP);
	// Gaussian-like curve
	return Math.exp(-Math.pow(distFromOptimal, 2) / (2 * Math.pow(18, 2)));
}

// Calculate pH effect on enzyme activity (bell-shaped curve)
function pHEffect(pH: number): number {
	const distFromOptimal = Math.abs(pH - CATALASE_OPTIMAL_PH);
	// Narrower bell curve for pH
	return Math.exp(-Math.pow(distFromOptimal, 2) / (2 * Math.pow(2.5, 2)));
}

// Calculate Michaelis-Menten rate
function michaelisMentenRate(substrateConc: number, vmax: number): number {
	return (vmax * substrateConc) / (CATALASE_KM + substrateConc);
}

// Calculate reaction rate at given conditions
export function calculateReactionRate(conditions: EnzymeConditions): number {
	const tempFactor = temperatureEffect(conditions.temperature);
	const pHFactor = pHEffect(conditions.pH);
	const effectiveVmax = CATALASE_VMAX * tempFactor * pHFactor;
	return michaelisMentenRate(conditions.substrateConcentration, effectiveVmax);
}

// Generate reaction time course data
function generateReactionData(conditions: EnzymeConditions, duration: number = 120): ReactionDataPoint[] {
	const points: ReactionDataPoint[] = [];
	const initialRate = calculateReactionRate(conditions);

	// Substrate depletion model
	let substrate = conditions.substrateConcentration;
	let totalO2 = 0;
	const dt = 2; // 2 second intervals

	for (let t = 0; t <= duration; t += dt) {
		const currentConditions = { ...conditions, substrateConcentration: Math.max(0, substrate) };
		const rate = calculateReactionRate(currentConditions);

		// Add slight noise for realism
		const noise = 1 + (Math.random() - 0.5) * 0.08;
		const adjustedRate = rate * noise;

		totalO2 += adjustedRate * dt;
		// Substrate consumed proportionally
		substrate -= adjustedRate * dt * 0.5;

		points.push({
			time: t,
			o2Produced: Math.round(totalO2 * 100) / 100,
			rate: Math.round(adjustedRate * 1000) / 1000
		});
	}

	return points;
}

// Set conditions
export function setTemperature(state: KineticsState, temperature: number): KineticsState {
	return {
		...state,
		currentConditions: {
			...state.currentConditions,
			temperature: Math.max(0, Math.min(80, temperature))
		}
	};
}

export function setPH(state: KineticsState, pH: number): KineticsState {
	return {
		...state,
		currentConditions: {
			...state.currentConditions,
			pH: Math.max(2, Math.min(12, Math.round(pH * 10) / 10))
		}
	};
}

export function setSubstrateConcentration(state: KineticsState, concentration: number): KineticsState {
	return {
		...state,
		currentConditions: {
			...state.currentConditions,
			substrateConcentration: Math.max(0, Math.min(100, concentration))
		}
	};
}

export function setSelectedVariable(state: KineticsState, variable: 'temperature' | 'pH' | 'substrate'): KineticsState {
	return { ...state, selectedVariable: variable };
}

// Run experiment
export function runExperiment(state: KineticsState): KineticsState {
	const dataPoints = generateReactionData(state.currentConditions);
	const initialRate = calculateReactionRate(state.currentConditions);
	const maxO2 = dataPoints[dataPoints.length - 1].o2Produced;

	const run: ExperimentRun = {
		id: `run-${state.experimentRuns.length + 1}`,
		conditions: { ...state.currentConditions },
		dataPoints,
		initialRate: Math.round(initialRate * 1000) / 1000,
		maxO2: Math.round(maxO2 * 100) / 100,
		timestamp: new Date()
	};

	// Add to MM points if substrate was varied
	const newMmPoints = [...state.mmPoints];
	if (state.selectedVariable === 'substrate') {
		newMmPoints.push({
			substrateConcentration: state.currentConditions.substrateConcentration,
			initialRate: run.initialRate
		});
	}

	return {
		...state,
		currentRun: run,
		experimentRuns: [...state.experimentRuns, run],
		mmPoints: newMmPoints,
		isRunning: false
	};
}

// Calculate Vmax and Km from collected data points
export function calculateKineticParameters(state: KineticsState): KineticsState {
	if (state.mmPoints.length < 3) return state;

	// Lineweaver-Burk linearization to estimate Vmax and Km
	// 1/V = (Km/Vmax)(1/[S]) + 1/Vmax
	const points = state.mmPoints.filter((p) => p.substrateConcentration > 0 && p.initialRate > 0);
	if (points.length < 2) return state;

	const x = points.map((p) => 1 / p.substrateConcentration);
	const y = points.map((p) => 1 / p.initialRate);

	// Linear regression
	const n = x.length;
	const sumX = x.reduce((a, b) => a + b, 0);
	const sumY = y.reduce((a, b) => a + b, 0);
	const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
	const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);

	const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
	const intercept = (sumY - slope * sumX) / n;

	const vmax = intercept > 0 ? Math.round((1 / intercept) * 1000) / 1000 : null;
	const km = vmax && slope > 0 ? Math.round(slope * vmax * 100) / 100 : null;

	return {
		...state,
		calculatedVmax: vmax,
		calculatedKm: km
	};
}

// Add observation
export function addObservation(state: KineticsState, note: string): KineticsState {
	return { ...state, observations: [...state.observations, note] };
}

// Clear experiment runs
export function clearRuns(state: KineticsState): KineticsState {
	return {
		...state,
		experimentRuns: [],
		mmPoints: [],
		currentRun: null,
		calculatedVmax: null,
		calculatedKm: null
	};
}

// Answer quiz
export function answerQuiz(state: KineticsState, questionId: string, answer: string): KineticsState {
	const newAnswers = new Map(state.quizAnswers);
	newAnswers.set(questionId, answer);
	return { ...state, quizAnswers: newAnswers };
}

// Get rate at various temperatures (for plotting)
export function getTemperatureCurve(pH: number, substrate: number): { temp: number; rate: number }[] {
	const points: { temp: number; rate: number }[] = [];
	for (let t = 0; t <= 80; t += 2) {
		const rate = calculateReactionRate({ temperature: t, pH, substrateConcentration: substrate });
		points.push({ temp: t, rate: Math.round(rate * 1000) / 1000 });
	}
	return points;
}

// Get rate at various pH values
export function getPHCurve(temp: number, substrate: number): { pH: number; rate: number }[] {
	const points: { pH: number; rate: number }[] = [];
	for (let p = 2; p <= 12; p += 0.5) {
		const rate = calculateReactionRate({ temperature: temp, pH: p, substrateConcentration: substrate });
		points.push({ pH: p, rate: Math.round(rate * 1000) / 1000 });
	}
	return points;
}

// Analysis
export interface KineticsAnalysis {
	totalExperiments: number;
	variablesExplored: string[];
	vmaxAccuracy: number | null;
	kmAccuracy: number | null;
	quizScore: { correct: number; total: number };
	observationCount: number;
	accuracy: number;
	grade: 'A' | 'B' | 'C' | 'D' | 'F';
	feedback: string;
}

export function analyzeKinetics(state: KineticsState): KineticsAnalysis {
	const totalExperiments = state.experimentRuns.length;
	const variablesExplored: string[] = [];

	// Check which variables were explored
	const temps = new Set(state.experimentRuns.map((r) => r.conditions.temperature));
	const pHs = new Set(state.experimentRuns.map((r) => r.conditions.pH));
	const substrates = new Set(state.experimentRuns.map((r) => r.conditions.substrateConcentration));

	if (temps.size > 1) variablesExplored.push('temperature');
	if (pHs.size > 1) variablesExplored.push('pH');
	if (substrates.size > 1) variablesExplored.push('substrate');

	// Vmax and Km accuracy
	let vmaxAccuracy: number | null = null;
	let kmAccuracy: number | null = null;
	if (state.calculatedVmax) {
		vmaxAccuracy = Math.round((1 - Math.abs(state.calculatedVmax - CATALASE_VMAX) / CATALASE_VMAX) * 100);
	}
	if (state.calculatedKm) {
		kmAccuracy = Math.round((1 - Math.abs(state.calculatedKm - CATALASE_KM) / CATALASE_KM) * 100);
	}

	const quizScore = checkQuizAnswers(state);

	let score = 0;
	score += Math.min(totalExperiments * 5, 20); // Up to 20 for experiments
	score += variablesExplored.length * 10; // Up to 30 for exploring variables
	score += (quizScore.correct / Math.max(quizScore.total, 1)) * 30; // 30 for quiz
	if (state.calculatedVmax) score += 10;
	if (state.calculatedKm) score += 10;

	let grade: 'A' | 'B' | 'C' | 'D' | 'F';
	if (score >= 90) grade = 'A';
	else if (score >= 80) grade = 'B';
	else if (score >= 70) grade = 'C';
	else if (score >= 60) grade = 'D';
	else grade = 'F';

	let feedback = '';
	if (score >= 90) feedback = 'Outstanding work! You thoroughly explored enzyme kinetics and accurately determined kinetic parameters.';
	else if (score >= 70) feedback = 'Good exploration of enzyme behavior. Try varying more conditions and calculating Vmax/Km.';
	else if (score >= 50) feedback = 'Decent start. Run more experiments at different substrate concentrations to build a Michaelis-Menten curve.';
	else feedback = 'Keep experimenting! Vary temperature, pH, and substrate concentration to understand enzyme behavior.';

	return {
		totalExperiments,
		variablesExplored,
		vmaxAccuracy,
		kmAccuracy,
		quizScore,
		observationCount: state.observations.length,
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

export const KINETICS_QUIZ: QuizQuestion[] = [
	{
		id: 'q1',
		question: 'What does Vmax represent in Michaelis-Menten kinetics?',
		options: [
			'The substrate concentration at half maximum rate',
			'The maximum reaction rate when enzyme is saturated',
			'The optimal temperature for the enzyme',
			'The activation energy of the reaction'
		],
		correctAnswer: 'The maximum reaction rate when enzyme is saturated',
		explanation: 'Vmax is the maximum velocity achieved when all enzyme active sites are occupied by substrate (enzyme saturation).'
	},
	{
		id: 'q2',
		question: 'What does Km (Michaelis constant) represent?',
		options: [
			'Maximum reaction velocity',
			'Substrate concentration at which rate is half of Vmax',
			'Optimal pH for the enzyme',
			'Temperature coefficient'
		],
		correctAnswer: 'Substrate concentration at which rate is half of Vmax',
		explanation: 'Km is the substrate concentration at which the reaction rate is exactly half of Vmax. A lower Km indicates higher enzyme-substrate affinity.'
	},
	{
		id: 'q3',
		question: 'Why does enzyme activity decline at very high temperatures?',
		options: [
			'Substrate breaks down',
			'Water evaporates',
			'The enzyme denatures (loses its 3D shape)',
			'Products inhibit the enzyme'
		],
		correctAnswer: 'The enzyme denatures (loses its 3D shape)',
		explanation: 'High temperatures disrupt hydrogen bonds and other weak interactions that maintain the enzyme\'s 3D structure, causing denaturation and loss of function.'
	},
	{
		id: 'q4',
		question: 'What is the substrate for catalase?',
		options: ['Oxygen gas', 'Water', 'Hydrogen peroxide', 'Carbon dioxide'],
		correctAnswer: 'Hydrogen peroxide',
		explanation: 'Catalase breaks down hydrogen peroxide (H2O2) into water and oxygen gas (2H2O2 -> 2H2O + O2).'
	},
	{
		id: 'q5',
		question: 'At very low substrate concentrations, enzyme kinetics are approximately:',
		options: ['Zero order', 'First order', 'Second order', 'Mixed order'],
		correctAnswer: 'First order',
		explanation: 'At low [S] (much less than Km), the rate is approximately proportional to substrate concentration (first-order kinetics). At high [S], it approaches zero-order.'
	}
];

export function checkQuizAnswers(state: KineticsState): { correct: number; total: number } {
	let correct = 0;
	KINETICS_QUIZ.forEach((q) => {
		if (state.quizAnswers.get(q.id) === q.correctAnswer) correct++;
	});
	return { correct, total: KINETICS_QUIZ.length };
}
