/**
 * Photosynthesis & Light Reactions Lab Simulation
 * Investigate O2 production in Elodea under varying light conditions
 */

export type LightColor = 'white' | 'red' | 'blue' | 'green' | 'yellow' | 'orange';

export interface LightCondition {
	intensity: number; // 0-100 (percentage of max ~2000 lux)
	color: LightColor;
	wavelength: number; // nm (dominant wavelength)
	distance: number; // cm from plant (5-50)
}

export interface BubbleCount {
	id: string;
	conditions: LightCondition;
	duration: number; // seconds (always 60)
	bubbleCount: number;
	rate: number; // bubbles per minute
	timestamp: Date;
}

export interface AbsorptionPoint {
	wavelength: number;
	absorbance: number; // 0-1
	pigment: string;
}

export interface PhotosynthesisState {
	lightCondition: LightCondition;
	isRunning: boolean;
	currentTime: number;
	currentBubbles: number;
	measurements: BubbleCount[];
	selectedExperiment: 'intensity' | 'wavelength' | 'absorption';
	temperature: number; // degrees C (fixed at 25 for consistency)
	co2Level: 'low' | 'normal' | 'high';
	showAbsorptionSpectrum: boolean;
	quizAnswers: Map<string, string>;
	observations: string[];
}

export interface PhotosynthesisConfig {
	defaultIntensity: number;
	defaultColor: LightColor;
}

// Light color properties
export const LIGHT_COLORS: Record<LightColor, { wavelength: number; hex: string; label: string }> = {
	white: { wavelength: 550, hex: '#ffffff', label: 'White Light' },
	red: { wavelength: 660, hex: '#ef4444', label: 'Red (660nm)' },
	blue: { wavelength: 450, hex: '#3b82f6', label: 'Blue (450nm)' },
	green: { wavelength: 530, hex: '#22c55e', label: 'Green (530nm)' },
	yellow: { wavelength: 580, hex: '#eab308', label: 'Yellow (580nm)' },
	orange: { wavelength: 610, hex: '#f97316', label: 'Orange (610nm)' }
};

// Chlorophyll absorption spectrum data (simplified)
export const ABSORPTION_SPECTRUM: AbsorptionPoint[] = [
	// Chlorophyll a peaks
	{ wavelength: 400, absorbance: 0.65, pigment: 'Chlorophyll a' },
	{ wavelength: 420, absorbance: 0.82, pigment: 'Chlorophyll a' },
	{ wavelength: 430, absorbance: 0.85, pigment: 'Chlorophyll a' },
	{ wavelength: 440, absorbance: 0.78, pigment: 'Chlorophyll a' },
	{ wavelength: 450, absorbance: 0.70, pigment: 'Chlorophyll a' },
	{ wavelength: 460, absorbance: 0.55, pigment: 'Chlorophyll a' },
	{ wavelength: 470, absorbance: 0.40, pigment: 'Chlorophyll a' },
	{ wavelength: 480, absorbance: 0.25, pigment: 'Chlorophyll a' },
	{ wavelength: 490, absorbance: 0.15, pigment: 'Chlorophyll a' },
	{ wavelength: 500, absorbance: 0.10, pigment: 'Chlorophyll a' },
	{ wavelength: 510, absorbance: 0.08, pigment: 'Chlorophyll a' },
	{ wavelength: 520, absorbance: 0.06, pigment: 'Chlorophyll a' },
	{ wavelength: 530, absorbance: 0.05, pigment: 'Chlorophyll a' },
	{ wavelength: 540, absorbance: 0.04, pigment: 'Chlorophyll a' },
	{ wavelength: 550, absorbance: 0.04, pigment: 'Chlorophyll a' },
	{ wavelength: 560, absorbance: 0.05, pigment: 'Chlorophyll a' },
	{ wavelength: 570, absorbance: 0.06, pigment: 'Chlorophyll a' },
	{ wavelength: 580, absorbance: 0.07, pigment: 'Chlorophyll a' },
	{ wavelength: 590, absorbance: 0.08, pigment: 'Chlorophyll a' },
	{ wavelength: 600, absorbance: 0.10, pigment: 'Chlorophyll a' },
	{ wavelength: 610, absorbance: 0.12, pigment: 'Chlorophyll a' },
	{ wavelength: 620, absorbance: 0.18, pigment: 'Chlorophyll a' },
	{ wavelength: 630, absorbance: 0.28, pigment: 'Chlorophyll a' },
	{ wavelength: 640, absorbance: 0.42, pigment: 'Chlorophyll a' },
	{ wavelength: 650, absorbance: 0.58, pigment: 'Chlorophyll a' },
	{ wavelength: 660, absorbance: 0.75, pigment: 'Chlorophyll a' },
	{ wavelength: 670, absorbance: 0.82, pigment: 'Chlorophyll a' },
	{ wavelength: 680, absorbance: 0.78, pigment: 'Chlorophyll a' },
	{ wavelength: 690, absorbance: 0.55, pigment: 'Chlorophyll a' },
	{ wavelength: 700, absorbance: 0.30, pigment: 'Chlorophyll a' }
];

// Chlorophyll b absorption (overlay)
export const CHLOROPHYLL_B_SPECTRUM: AbsorptionPoint[] = [
	{ wavelength: 400, absorbance: 0.45, pigment: 'Chlorophyll b' },
	{ wavelength: 420, absorbance: 0.55, pigment: 'Chlorophyll b' },
	{ wavelength: 440, absorbance: 0.62, pigment: 'Chlorophyll b' },
	{ wavelength: 450, absorbance: 0.70, pigment: 'Chlorophyll b' },
	{ wavelength: 460, absorbance: 0.72, pigment: 'Chlorophyll b' },
	{ wavelength: 470, absorbance: 0.68, pigment: 'Chlorophyll b' },
	{ wavelength: 480, absorbance: 0.55, pigment: 'Chlorophyll b' },
	{ wavelength: 490, absorbance: 0.35, pigment: 'Chlorophyll b' },
	{ wavelength: 500, absorbance: 0.20, pigment: 'Chlorophyll b' },
	{ wavelength: 520, absorbance: 0.08, pigment: 'Chlorophyll b' },
	{ wavelength: 540, absorbance: 0.05, pigment: 'Chlorophyll b' },
	{ wavelength: 560, absorbance: 0.04, pigment: 'Chlorophyll b' },
	{ wavelength: 580, absorbance: 0.05, pigment: 'Chlorophyll b' },
	{ wavelength: 600, absorbance: 0.08, pigment: 'Chlorophyll b' },
	{ wavelength: 620, absorbance: 0.20, pigment: 'Chlorophyll b' },
	{ wavelength: 640, absorbance: 0.48, pigment: 'Chlorophyll b' },
	{ wavelength: 650, absorbance: 0.60, pigment: 'Chlorophyll b' },
	{ wavelength: 660, absorbance: 0.50, pigment: 'Chlorophyll b' },
	{ wavelength: 680, absorbance: 0.30, pigment: 'Chlorophyll b' },
	{ wavelength: 700, absorbance: 0.15, pigment: 'Chlorophyll b' }
];

// Create initial state
export function createInitialState(config: PhotosynthesisConfig): PhotosynthesisState {
	return {
		lightCondition: {
			intensity: config.defaultIntensity,
			color: config.defaultColor,
			wavelength: LIGHT_COLORS[config.defaultColor].wavelength,
			distance: 15
		},
		isRunning: false,
		currentTime: 0,
		currentBubbles: 0,
		measurements: [],
		selectedExperiment: 'intensity',
		temperature: 25,
		co2Level: 'normal',
		showAbsorptionSpectrum: false,
		quizAnswers: new Map(),
		observations: []
	};
}

// Get absorption at a specific wavelength (interpolated)
function getAbsorptionAtWavelength(wavelength: number): number {
	// Combined chlorophyll a + b absorption
	const aSpec = ABSORPTION_SPECTRUM;

	let lower = aSpec[0];
	let upper = aSpec[aSpec.length - 1];

	for (let i = 0; i < aSpec.length - 1; i++) {
		if (aSpec[i].wavelength <= wavelength && aSpec[i + 1].wavelength >= wavelength) {
			lower = aSpec[i];
			upper = aSpec[i + 1];
			break;
		}
	}

	if (wavelength <= lower.wavelength) return lower.absorbance;
	if (wavelength >= upper.wavelength) return upper.absorbance;

	// Linear interpolation
	const t = (wavelength - lower.wavelength) / (upper.wavelength - lower.wavelength);
	return lower.absorbance + t * (upper.absorbance - lower.absorbance);
}

// Calculate O2 production rate (bubbles per minute)
export function calculateBubbleRate(conditions: LightCondition, temperature: number, co2Level: string): number {
	// Base rate at max conditions ~30 bubbles/min
	const maxRate = 32;

	// Light intensity effect (proportional up to saturation point ~80%)
	const intensityFactor = conditions.intensity <= 80
		? conditions.intensity / 80
		: 1 - (conditions.intensity - 80) * 0.002; // Slight photoinhibition above 80%

	// Wavelength/color effect based on absorption spectrum
	let wavelengthFactor: number;
	if (conditions.color === 'white') {
		wavelengthFactor = 0.85; // White light is good but not as focused as peak wavelengths
	} else {
		wavelengthFactor = getAbsorptionAtWavelength(conditions.wavelength);
	}

	// Distance effect (inverse square law simplified)
	const referenceDist = 15;
	const distanceFactor = Math.pow(referenceDist / conditions.distance, 1.5);

	// Temperature effect (optimal at 25C for aquatic plants)
	const tempFactor = Math.exp(-Math.pow(temperature - 25, 2) / (2 * 100));

	// CO2 level effect
	const co2Factor = co2Level === 'high' ? 1.3 : co2Level === 'low' ? 0.5 : 1.0;

	const rate = maxRate * intensityFactor * wavelengthFactor * distanceFactor * tempFactor * co2Factor;

	return Math.max(0, Math.round(rate * 10) / 10);
}

// Set light intensity
export function setLightIntensity(state: PhotosynthesisState, intensity: number): PhotosynthesisState {
	return {
		...state,
		lightCondition: { ...state.lightCondition, intensity: Math.max(0, Math.min(100, intensity)) }
	};
}

// Set light color
export function setLightColor(state: PhotosynthesisState, color: LightColor): PhotosynthesisState {
	return {
		...state,
		lightCondition: {
			...state.lightCondition,
			color,
			wavelength: LIGHT_COLORS[color].wavelength
		}
	};
}

// Set distance
export function setDistance(state: PhotosynthesisState, distance: number): PhotosynthesisState {
	return {
		...state,
		lightCondition: { ...state.lightCondition, distance: Math.max(5, Math.min(50, distance)) }
	};
}

// Set CO2 level
export function setCO2Level(state: PhotosynthesisState, level: 'low' | 'normal' | 'high'): PhotosynthesisState {
	return { ...state, co2Level: level };
}

// Set experiment type
export function setExperimentType(state: PhotosynthesisState, type: 'intensity' | 'wavelength' | 'absorption'): PhotosynthesisState {
	return { ...state, selectedExperiment: type };
}

// Run a measurement (count bubbles for 60 seconds)
export function runMeasurement(state: PhotosynthesisState): PhotosynthesisState {
	const rate = calculateBubbleRate(state.lightCondition, state.temperature, state.co2Level);

	// Add realistic variation
	const noise = Math.round((Math.random() - 0.5) * 4);
	const bubbles = Math.max(0, Math.round(rate) + noise);

	const measurement: BubbleCount = {
		id: `m-${state.measurements.length + 1}`,
		conditions: { ...state.lightCondition },
		duration: 60,
		bubbleCount: bubbles,
		rate: bubbles, // bubbles per minute (since duration is 60s)
		timestamp: new Date()
	};

	return {
		...state,
		measurements: [...state.measurements, measurement],
		currentBubbles: bubbles,
		isRunning: false
	};
}

// Toggle absorption spectrum view
export function toggleAbsorptionSpectrum(state: PhotosynthesisState): PhotosynthesisState {
	return { ...state, showAbsorptionSpectrum: !state.showAbsorptionSpectrum };
}

// Add observation
export function addObservation(state: PhotosynthesisState, note: string): PhotosynthesisState {
	return { ...state, observations: [...state.observations, note] };
}

// Clear measurements
export function clearMeasurements(state: PhotosynthesisState): PhotosynthesisState {
	return { ...state, measurements: [], currentBubbles: 0 };
}

// Answer quiz
export function answerQuiz(state: PhotosynthesisState, questionId: string, answer: string): PhotosynthesisState {
	const newAnswers = new Map(state.quizAnswers);
	newAnswers.set(questionId, answer);
	return { ...state, quizAnswers: newAnswers };
}

// Analysis
export interface PhotosynthesisAnalysis {
	totalMeasurements: number;
	colorsExplored: string[];
	intensitiesExplored: number;
	maxRate: number;
	minRate: number;
	quizScore: { correct: number; total: number };
	accuracy: number;
	grade: 'A' | 'B' | 'C' | 'D' | 'F';
	feedback: string;
}

export function analyzePhotosynthesis(state: PhotosynthesisState): PhotosynthesisAnalysis {
	const totalMeasurements = state.measurements.length;
	const colorsExplored = [...new Set(state.measurements.map((m) => m.conditions.color))];
	const intensitiesExplored = new Set(state.measurements.map((m) => m.conditions.intensity)).size;
	const rates = state.measurements.map((m) => m.rate);
	const maxRate = rates.length > 0 ? Math.max(...rates) : 0;
	const minRate = rates.length > 0 ? Math.min(...rates) : 0;

	const quizScore = checkQuizAnswers(state);

	let score = 0;
	score += Math.min(totalMeasurements * 5, 25); // Up to 25 for measurements
	score += Math.min(colorsExplored.length * 8, 24); // Up to 24 for color exploration
	score += Math.min(intensitiesExplored * 5, 15); // Up to 15 for intensity exploration
	score += (quizScore.correct / Math.max(quizScore.total, 1)) * 30; // 30 for quiz
	score += state.observations.length > 2 ? 6 : state.observations.length * 3; // Up to 6

	let grade: 'A' | 'B' | 'C' | 'D' | 'F';
	if (score >= 90) grade = 'A';
	else if (score >= 80) grade = 'B';
	else if (score >= 70) grade = 'C';
	else if (score >= 60) grade = 'D';
	else grade = 'F';

	let feedback = '';
	if (score >= 90) feedback = 'Excellent investigation of photosynthesis! You explored multiple light conditions thoroughly.';
	else if (score >= 70) feedback = 'Good work. Try testing more light colors and intensities for a complete analysis.';
	else if (score >= 50) feedback = 'Decent start. Compare different light wavelengths to understand the absorption spectrum.';
	else feedback = 'Keep experimenting! Try changing light color and intensity to see how they affect O2 production.';

	return {
		totalMeasurements,
		colorsExplored,
		intensitiesExplored,
		maxRate,
		minRate,
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

export const PHOTOSYNTHESIS_QUIZ: QuizQuestion[] = [
	{
		id: 'q1',
		question: 'Which light wavelengths are most effectively absorbed by chlorophyll?',
		options: ['Green and yellow', 'Red and blue', 'Orange and green', 'Yellow and red'],
		correctAnswer: 'Red and blue',
		explanation: 'Chlorophyll a and b absorb most strongly in the blue (~430-450nm) and red (~660-680nm) regions of the spectrum, which is why plants appear green (green light is reflected).'
	},
	{
		id: 'q2',
		question: 'Why do plants appear green?',
		options: [
			'They absorb green light efficiently',
			'They reflect green light',
			'Chlorophyll is green colored dye',
			'Green light is the strongest wavelength'
		],
		correctAnswer: 'They reflect green light',
		explanation: 'Chlorophyll absorbs red and blue wavelengths but reflects green light, which is what our eyes see.'
	},
	{
		id: 'q3',
		question: 'What is the gas produced by the light reactions that we measured as bubbles?',
		options: ['Carbon dioxide', 'Nitrogen', 'Oxygen', 'Hydrogen'],
		correctAnswer: 'Oxygen',
		explanation: 'During the light reactions, water molecules are split (photolysis), releasing oxygen gas as a byproduct.'
	},
	{
		id: 'q4',
		question: 'What is the light compensation point?',
		options: [
			'Maximum light intensity plants can tolerate',
			'Light intensity where photosynthesis equals respiration',
			'Wavelength most absorbed by chlorophyll',
			'Distance at which light has no effect'
		],
		correctAnswer: 'Light intensity where photosynthesis equals respiration',
		explanation: 'The compensation point is the light intensity at which the rate of photosynthesis exactly equals the rate of cellular respiration, resulting in no net gas exchange.'
	},
	{
		id: 'q5',
		question: 'What happens to the rate of photosynthesis at very high light intensities?',
		options: [
			'It increases indefinitely',
			'It plateaus (levels off)',
			'It decreases sharply',
			'It doubles'
		],
		correctAnswer: 'It plateaus (levels off)',
		explanation: 'At high light intensities, other factors like CO2 concentration or enzyme capacity become limiting, so the rate plateaus. This is called the light saturation point.'
	}
];

export function checkQuizAnswers(state: PhotosynthesisState): { correct: number; total: number } {
	let correct = 0;
	PHOTOSYNTHESIS_QUIZ.forEach((q) => {
		if (state.quizAnswers.get(q.id) === q.correctAnswer) correct++;
	});
	return { correct, total: PHOTOSYNTHESIS_QUIZ.length };
}
