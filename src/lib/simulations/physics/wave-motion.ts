/**
 * Wave Motion & Interference Laboratory Simulation
 * Physics experiment exploring wave properties and interference patterns
 */

export interface WaveState {
	waveType: 'transverse' | 'longitudinal';
	frequency: number; // Hz (0.5 - 5.0)
	amplitude: number; // arbitrary units (0.1 - 2.0)
	wavelength: number; // meters (0.5 - 5.0)
	waveSpeed: number; // derived: v = f * lambda
	isAnimating: boolean;
	currentTime: number;
	// Interference
	interferenceMode: boolean;
	source2Active: boolean;
	source2Frequency: number;
	source2Amplitude: number;
	sourceSpacing: number; // distance between two sources (meters)
	// Standing waves
	standingWaveMode: boolean;
	stringLength: number; // meters (1.0 - 5.0)
	harmonicNumber: number; // 1, 2, 3, ...
	stringTension: number; // N
	linearDensity: number; // kg/m
	// Measurements
	measurements: WaveMeasurement[];
	// Display
	showEnvelope: boolean;
	showNodes: boolean;
	animationSpeed: number;
	viewMode: 'single' | 'interference' | 'standing';
}

export interface WaveMeasurement {
	id: string;
	type: 'single' | 'interference' | 'standing';
	frequency: number;
	wavelength: number;
	amplitude: number;
	waveSpeed: number;
	harmonicNumber?: number;
	nodesCount?: number;
	antinodesCount?: number;
	timestamp: number;
}

export interface WaveConfig {
	frequency: number;
	amplitude: number;
	wavelength: number;
}

// Create initial state
export function createInitialState(config: WaveConfig): WaveState {
	return {
		waveType: 'transverse',
		frequency: config.frequency,
		amplitude: config.amplitude,
		wavelength: config.wavelength,
		waveSpeed: config.frequency * config.wavelength,
		isAnimating: false,
		currentTime: 0,
		interferenceMode: false,
		source2Active: false,
		source2Frequency: config.frequency,
		source2Amplitude: config.amplitude,
		sourceSpacing: 2.0,
		standingWaveMode: false,
		stringLength: 3.0,
		harmonicNumber: 1,
		stringTension: 10,
		linearDensity: 0.01,
		measurements: [],
		showEnvelope: false,
		showNodes: true,
		animationSpeed: 1,
		viewMode: 'single'
	};
}

// Calculate wave displacement at position x and time t
export function waveDisplacement(
	x: number,
	t: number,
	amplitude: number,
	frequency: number,
	wavelength: number
): number {
	const k = (2 * Math.PI) / wavelength; // wave number
	const omega = 2 * Math.PI * frequency; // angular frequency
	return amplitude * Math.sin(k * x - omega * t);
}

// Calculate interference pattern from two sources
export function interferenceDisplacement(
	x: number,
	t: number,
	amp1: number,
	freq1: number,
	wl1: number,
	amp2: number,
	freq2: number,
	wl2: number,
	spacing: number
): number {
	const y1 = waveDisplacement(x, t, amp1, freq1, wl1);
	const y2 = waveDisplacement(x - spacing, t, amp2, freq2, wl2);
	return y1 + y2; // principle of superposition
}

// Calculate standing wave displacement
export function standingWaveDisplacement(
	x: number,
	t: number,
	amplitude: number,
	stringLength: number,
	harmonicNumber: number,
	frequency: number
): number {
	const k = (harmonicNumber * Math.PI) / stringLength;
	const omega = 2 * Math.PI * frequency;
	return 2 * amplitude * Math.sin(k * x) * Math.cos(omega * t);
}

// Calculate standing wave frequency for nth harmonic
export function harmonicFrequency(
	n: number,
	stringLength: number,
	tension: number,
	linearDensity: number
): number {
	const v = Math.sqrt(tension / linearDensity);
	return (n * v) / (2 * stringLength);
}

// Get node positions for standing wave
export function getNodePositions(stringLength: number, harmonicNumber: number): number[] {
	const nodes: number[] = [];
	for (let i = 0; i <= harmonicNumber; i++) {
		nodes.push((i * stringLength) / harmonicNumber);
	}
	return nodes;
}

// Get antinode positions for standing wave
export function getAntinodePositions(stringLength: number, harmonicNumber: number): number[] {
	const antinodes: number[] = [];
	for (let i = 0; i < harmonicNumber; i++) {
		antinodes.push(((i + 0.5) * stringLength) / harmonicNumber);
	}
	return antinodes;
}

// Set frequency
export function setFrequency(state: WaveState, frequency: number): WaveState {
	const f = Math.max(0.5, Math.min(5.0, frequency));
	return {
		...state,
		frequency: f,
		waveSpeed: f * state.wavelength
	};
}

// Set amplitude
export function setAmplitude(state: WaveState, amplitude: number): WaveState {
	return {
		...state,
		amplitude: Math.max(0.1, Math.min(2.0, amplitude))
	};
}

// Set wavelength
export function setWavelength(state: WaveState, wavelength: number): WaveState {
	const wl = Math.max(0.5, Math.min(5.0, wavelength));
	return {
		...state,
		wavelength: wl,
		waveSpeed: state.frequency * wl
	};
}

// Set wave type
export function setWaveType(state: WaveState, waveType: 'transverse' | 'longitudinal'): WaveState {
	return {
		...state,
		waveType
	};
}

// Set view mode
export function setViewMode(state: WaveState, viewMode: WaveState['viewMode']): WaveState {
	return {
		...state,
		viewMode,
		isAnimating: false,
		currentTime: 0
	};
}

// Toggle second source
export function toggleSource2(state: WaveState): WaveState {
	return {
		...state,
		source2Active: !state.source2Active
	};
}

// Set second source frequency
export function setSource2Frequency(state: WaveState, frequency: number): WaveState {
	return {
		...state,
		source2Frequency: Math.max(0.5, Math.min(5.0, frequency))
	};
}

// Set source spacing
export function setSourceSpacing(state: WaveState, spacing: number): WaveState {
	return {
		...state,
		sourceSpacing: Math.max(0.5, Math.min(5.0, spacing))
	};
}

// Set harmonic number
export function setHarmonic(state: WaveState, n: number): WaveState {
	const harmonic = Math.max(1, Math.min(8, Math.round(n)));
	const freq = harmonicFrequency(harmonic, state.stringLength, state.stringTension, state.linearDensity);
	return {
		...state,
		harmonicNumber: harmonic,
		frequency: freq
	};
}

// Set string length
export function setStringLength(state: WaveState, length: number): WaveState {
	const l = Math.max(1.0, Math.min(5.0, length));
	const freq = harmonicFrequency(state.harmonicNumber, l, state.stringTension, state.linearDensity);
	return {
		...state,
		stringLength: l,
		frequency: freq
	};
}

// Toggle animation
export function toggleAnimation(state: WaveState): WaveState {
	return {
		...state,
		isAnimating: !state.isAnimating,
		currentTime: state.isAnimating ? state.currentTime : 0
	};
}

// Update simulation
export function updateSimulation(state: WaveState, deltaTime: number): WaveState {
	if (!state.isAnimating) return state;

	return {
		...state,
		currentTime: state.currentTime + deltaTime * state.animationSpeed
	};
}

// Toggle nodes display
export function toggleNodes(state: WaveState): WaveState {
	return {
		...state,
		showNodes: !state.showNodes
	};
}

// Toggle envelope display
export function toggleEnvelope(state: WaveState): WaveState {
	return {
		...state,
		showEnvelope: !state.showEnvelope
	};
}

// Set animation speed
export function setAnimationSpeed(state: WaveState, speed: number): WaveState {
	return {
		...state,
		animationSpeed: Math.max(0.25, Math.min(3, speed))
	};
}

// Record measurement
export function recordMeasurement(state: WaveState): WaveMeasurement {
	const measurement: WaveMeasurement = {
		id: `m-${Date.now()}`,
		type: state.viewMode,
		frequency: state.frequency,
		wavelength: state.wavelength,
		amplitude: state.amplitude,
		waveSpeed: state.waveSpeed,
		timestamp: Date.now()
	};

	if (state.viewMode === 'standing') {
		measurement.harmonicNumber = state.harmonicNumber;
		measurement.nodesCount = state.harmonicNumber + 1;
		measurement.antinodesCount = state.harmonicNumber;
	}

	return measurement;
}

// Add measurement to state
export function addMeasurement(state: WaveState): WaveState {
	const measurement = recordMeasurement(state);
	return {
		...state,
		measurements: [...state.measurements, measurement]
	};
}

// Clear measurements
export function clearMeasurements(state: WaveState): WaveState {
	return {
		...state,
		measurements: []
	};
}

// Reset
export function resetSimulation(state: WaveState): WaveState {
	return {
		...state,
		isAnimating: false,
		currentTime: 0
	};
}

// Quiz questions
export interface QuizQuestion {
	id: string;
	question: string;
	options: string[];
	correctAnswer: string;
	explanation: string;
}

export const WAVE_QUIZ: QuizQuestion[] = [
	{
		id: 'q1',
		question: 'What is the relationship between wave speed, frequency, and wavelength?',
		options: ['v = f + lambda', 'v = f * lambda', 'v = f / lambda', 'v = lambda / f'],
		correctAnswer: 'v = f * lambda',
		explanation: 'The fundamental wave equation states that wave speed equals frequency times wavelength: v = f * lambda.'
	},
	{
		id: 'q2',
		question: 'When two waves of equal amplitude and frequency meet in phase, the resulting amplitude is:',
		options: ['Zero', 'Same as original', 'Twice the original', 'Half the original'],
		correctAnswer: 'Twice the original',
		explanation: 'Constructive interference occurs when waves meet in phase, and their amplitudes add together: A_total = A1 + A2 = 2A.'
	},
	{
		id: 'q3',
		question: 'In a standing wave, points that never move are called:',
		options: ['Antinodes', 'Nodes', 'Crests', 'Amplitudes'],
		correctAnswer: 'Nodes',
		explanation: 'Nodes are points of zero displacement in a standing wave. They occur where destructive interference is permanent.'
	},
	{
		id: 'q4',
		question: 'The third harmonic of a string fixed at both ends has how many antinodes?',
		options: ['1', '2', '3', '4'],
		correctAnswer: '3',
		explanation: 'The nth harmonic has n antinodes (points of maximum displacement). The third harmonic has 3 antinodes and 4 nodes (including the endpoints).'
	},
	{
		id: 'q5',
		question: 'What type of wave requires a medium to travel through?',
		options: ['Electromagnetic waves', 'Light waves', 'Mechanical waves', 'Radio waves'],
		correctAnswer: 'Mechanical waves',
		explanation: 'Mechanical waves (sound, water waves, waves on strings) require a physical medium. Electromagnetic waves can travel through vacuum.'
	}
];

// Analysis
export interface WaveAnalysis {
	score: number;
	grade: 'A' | 'B' | 'C' | 'D' | 'F';
	measurementCount: number;
	feedback: string;
	quizScore: { correct: number; total: number };
}

export function analyzeExperiment(state: WaveState, quizAnswers: Map<string, string>): WaveAnalysis {
	let quizCorrect = 0;
	WAVE_QUIZ.forEach((q) => {
		if (quizAnswers.get(q.id) === q.correctAnswer) {
			quizCorrect++;
		}
	});

	// Score: 40% quiz, 30% measurement variety, 30% data collection
	let score = 0;
	score += (quizCorrect / WAVE_QUIZ.length) * 40;

	// Check variety of measurements (different modes)
	const modes = new Set(state.measurements.map((m) => m.type));
	score += Math.min(modes.size * 10, 30);

	// Data collection
	score += Math.min(state.measurements.length * 5, 30);

	let grade: WaveAnalysis['grade'];
	if (score >= 90) grade = 'A';
	else if (score >= 80) grade = 'B';
	else if (score >= 70) grade = 'C';
	else if (score >= 60) grade = 'D';
	else grade = 'F';

	let feedback = '';
	if (score >= 80) {
		feedback = 'Excellent understanding of wave phenomena! You explored multiple wave modes and demonstrated strong conceptual knowledge.';
	} else if (score >= 60) {
		feedback = 'Good work. Try exploring all three modes (single wave, interference, and standing waves) for a more complete understanding.';
	} else {
		feedback = 'Keep exploring! Experiment with different frequencies and wavelengths to see how wave properties change.';
	}

	return {
		score: Math.round(score),
		grade,
		measurementCount: state.measurements.length,
		feedback,
		quizScore: { correct: quizCorrect, total: WAVE_QUIZ.length }
	};
}
