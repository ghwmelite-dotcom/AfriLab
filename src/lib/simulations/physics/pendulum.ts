/**
 * Simple Pendulum & Simple Harmonic Motion Laboratory Simulation
 * Physics experiment exploring the relationship T = 2*pi*sqrt(L/g)
 */

export interface PendulumState {
	length: number; // meters (0.1 - 2.0)
	initialAngle: number; // degrees (5 - 45)
	gravity: number; // m/s^2 (default 9.81)
	isSwinging: boolean;
	currentTime: number; // seconds since start
	currentAngle: number; // current angular position in degrees
	angularVelocity: number; // rad/s
	period: number; // theoretical period
	stopwatchRunning: boolean;
	stopwatchTime: number; // seconds
	stopwatchLaps: number; // number of full swings counted
	measurements: PendulumMeasurement[];
	graphData: GraphPoint[];
	damping: number; // 0 = none, small values for realistic damping
	showTrail: boolean;
	trailPoints: TrailPoint[];
}

export interface PendulumMeasurement {
	id: string;
	length: number;
	measuredPeriod: number;
	theoreticalPeriod: number;
	percentError: number;
	calculatedG: number;
	swingsCounted: number;
	timestamp: number;
}

export interface GraphPoint {
	length: number;
	periodSquared: number;
	label: string;
}

export interface TrailPoint {
	x: number;
	y: number;
	t: number;
}

export interface PendulumConfig {
	length: number;
	initialAngle: number;
	gravity: number;
}

// Preset lengths for systematic measurement
export const LENGTH_PRESETS = [
	{ label: '0.25 m', value: 0.25 },
	{ label: '0.50 m', value: 0.5 },
	{ label: '0.75 m', value: 0.75 },
	{ label: '1.00 m', value: 1.0 },
	{ label: '1.25 m', value: 1.25 },
	{ label: '1.50 m', value: 1.5 },
	{ label: '1.75 m', value: 1.75 },
	{ label: '2.00 m', value: 2.0 }
];

// Create initial state
export function createInitialState(config: PendulumConfig): PendulumState {
	const period = calculateTheoreticalPeriod(config.length, config.gravity);
	return {
		length: config.length,
		initialAngle: config.initialAngle,
		gravity: config.gravity,
		isSwinging: false,
		currentTime: 0,
		currentAngle: config.initialAngle,
		angularVelocity: 0,
		period,
		stopwatchRunning: false,
		stopwatchTime: 0,
		stopwatchLaps: 0,
		measurements: [],
		graphData: [],
		damping: 0.002,
		showTrail: false,
		trailPoints: []
	};
}

// Calculate theoretical period using T = 2*pi*sqrt(L/g)
export function calculateTheoreticalPeriod(length: number, gravity: number): number {
	return 2 * Math.PI * Math.sqrt(length / gravity);
}

// Calculate g from measured period and length: g = 4*pi^2 * L / T^2
export function calculateGFromMeasurement(length: number, period: number): number {
	if (period <= 0) return 0;
	return (4 * Math.PI * Math.PI * length) / (period * period);
}

// Set pendulum length
export function setLength(state: PendulumState, length: number): PendulumState {
	const clampedLength = Math.max(0.1, Math.min(2.0, length));
	const period = calculateTheoreticalPeriod(clampedLength, state.gravity);
	return {
		...state,
		length: clampedLength,
		period,
		isSwinging: false,
		currentTime: 0,
		currentAngle: state.initialAngle,
		angularVelocity: 0,
		stopwatchRunning: false,
		stopwatchTime: 0,
		stopwatchLaps: 0,
		trailPoints: []
	};
}

// Set initial angle
export function setInitialAngle(state: PendulumState, angle: number): PendulumState {
	const clampedAngle = Math.max(5, Math.min(45, angle));
	return {
		...state,
		initialAngle: clampedAngle,
		currentAngle: clampedAngle,
		isSwinging: false,
		currentTime: 0,
		angularVelocity: 0,
		stopwatchRunning: false,
		stopwatchTime: 0,
		stopwatchLaps: 0,
		trailPoints: []
	};
}

// Start swinging
export function startSwing(state: PendulumState): PendulumState {
	return {
		...state,
		isSwinging: true,
		currentTime: 0,
		currentAngle: state.initialAngle,
		angularVelocity: 0,
		trailPoints: []
	};
}

// Stop swinging
export function stopSwing(state: PendulumState): PendulumState {
	return {
		...state,
		isSwinging: false
	};
}

// Start stopwatch
export function startStopwatch(state: PendulumState): PendulumState {
	return {
		...state,
		stopwatchRunning: true,
		stopwatchTime: 0,
		stopwatchLaps: 0
	};
}

// Stop stopwatch
export function stopStopwatch(state: PendulumState): PendulumState {
	return {
		...state,
		stopwatchRunning: false
	};
}

// Reset stopwatch
export function resetStopwatch(state: PendulumState): PendulumState {
	return {
		...state,
		stopwatchRunning: false,
		stopwatchTime: 0,
		stopwatchLaps: 0
	};
}

// Update simulation (called each animation frame)
export function updateSimulation(state: PendulumState, deltaTime: number): PendulumState {
	if (!state.isSwinging) return state;

	const dt = Math.min(deltaTime, 0.05); // cap to avoid instability
	const newTime = state.currentTime + dt;

	// Use small-angle approximation for SHM: theta(t) = theta0 * cos(omega * t) * exp(-damping * t)
	// where omega = sqrt(g / L)
	const omega = Math.sqrt(state.gravity / state.length);
	const angleRad = (state.initialAngle * Math.PI) / 180;
	const dampingFactor = Math.exp(-state.damping * newTime);
	const newAngleRad = angleRad * Math.cos(omega * newTime) * dampingFactor;
	const newAngleDeg = (newAngleRad * 180) / Math.PI;

	// Angular velocity: d(theta)/dt
	const newAngularVelocity = -angleRad * omega * Math.sin(omega * newTime) * dampingFactor;

	// Update stopwatch
	let stopwatchTime = state.stopwatchTime;
	let stopwatchLaps = state.stopwatchLaps;
	if (state.stopwatchRunning) {
		stopwatchTime += dt;

		// Detect zero-crossing from positive to negative (half period)
		const prevAngle = state.currentAngle;
		if (prevAngle > 0 && newAngleDeg <= 0 && state.currentTime > 0.1) {
			// Count every two zero crossings as one full period
			stopwatchLaps += 1;
		}
	}

	// Trail points
	const bobX = Math.sin(newAngleRad) * state.length;
	const bobY = Math.cos(newAngleRad) * state.length;
	const trailPoints = state.showTrail
		? [...state.trailPoints.slice(-200), { x: bobX, y: bobY, t: newTime }]
		: [];

	// Auto-stop if damped to near zero
	const isSwinging = Math.abs(newAngleDeg) > 0.01;

	return {
		...state,
		currentTime: newTime,
		currentAngle: newAngleDeg,
		angularVelocity: newAngularVelocity,
		isSwinging,
		stopwatchTime,
		stopwatchLaps,
		trailPoints
	};
}

// Record a measurement
export function recordMeasurement(state: PendulumState): PendulumState {
	if (state.stopwatchLaps < 2) return state;

	// Period = total time / (number of half-cycles / 2)
	const fullSwings = Math.floor(state.stopwatchLaps / 2);
	if (fullSwings === 0) return state;

	const measuredPeriod = state.stopwatchTime / fullSwings;
	const theoreticalPeriod = calculateTheoreticalPeriod(state.length, state.gravity);
	const percentError = Math.abs((measuredPeriod - theoreticalPeriod) / theoreticalPeriod) * 100;
	const calculatedG = calculateGFromMeasurement(state.length, measuredPeriod);

	// Add noise to simulate real measurement uncertainty
	const noise = (Math.random() - 0.5) * 0.02;
	const noisyPeriod = measuredPeriod + noise;

	const measurement: PendulumMeasurement = {
		id: `m-${Date.now()}`,
		length: state.length,
		measuredPeriod: noisyPeriod,
		theoreticalPeriod,
		percentError,
		calculatedG,
		swingsCounted: fullSwings,
		timestamp: Date.now()
	};

	const graphPoint: GraphPoint = {
		length: state.length,
		periodSquared: noisyPeriod * noisyPeriod,
		label: `L=${state.length.toFixed(2)}m, T=${noisyPeriod.toFixed(3)}s`
	};

	return {
		...state,
		measurements: [...state.measurements, measurement],
		graphData: [...state.graphData, graphPoint]
	};
}

// Clear all measurements
export function clearMeasurements(state: PendulumState): PendulumState {
	return {
		...state,
		measurements: [],
		graphData: []
	};
}

// Toggle trail display
export function toggleTrail(state: PendulumState): PendulumState {
	return {
		...state,
		showTrail: !state.showTrail,
		trailPoints: []
	};
}

// Set damping
export function setDamping(state: PendulumState, damping: number): PendulumState {
	return {
		...state,
		damping: Math.max(0, Math.min(0.1, damping))
	};
}

// Reset to initial state
export function resetSimulation(state: PendulumState): PendulumState {
	return {
		...state,
		isSwinging: false,
		currentTime: 0,
		currentAngle: state.initialAngle,
		angularVelocity: 0,
		stopwatchRunning: false,
		stopwatchTime: 0,
		stopwatchLaps: 0,
		trailPoints: []
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

export const PENDULUM_QUIZ: QuizQuestion[] = [
	{
		id: 'q1',
		question: 'What happens to the period of a pendulum if you double its length?',
		options: ['It doubles', 'It increases by a factor of sqrt(2)', 'It halves', 'It stays the same'],
		correctAnswer: 'It increases by a factor of sqrt(2)',
		explanation: 'Since T = 2*pi*sqrt(L/g), doubling L gives T_new = 2*pi*sqrt(2L/g) = sqrt(2) * T_original. The period increases by about 41%.'
	},
	{
		id: 'q2',
		question: 'Does the mass of the pendulum bob affect the period?',
		options: ['Yes, heavier bobs swing slower', 'Yes, heavier bobs swing faster', 'No, mass does not affect the period', 'Only for large masses'],
		correctAnswer: 'No, mass does not affect the period',
		explanation: 'The period of a simple pendulum depends only on its length and gravitational acceleration, not on the mass of the bob. This is because mass cancels in the equation of motion.'
	},
	{
		id: 'q3',
		question: 'For the small-angle approximation to be valid, the initial angle should be:',
		options: ['Less than about 15 degrees', 'Exactly 45 degrees', 'Greater than 60 degrees', 'Any angle works'],
		correctAnswer: 'Less than about 15 degrees',
		explanation: 'The simple pendulum equation T = 2*pi*sqrt(L/g) uses the small-angle approximation sin(theta) ~ theta, which is accurate to within about 1% for angles less than about 15 degrees.'
	},
	{
		id: 'q4',
		question: 'If a pendulum has a period of 2 seconds on Earth, what would its period be on the Moon (g_moon = 1.62 m/s^2)?',
		options: ['About 2 seconds', 'About 4.9 seconds', 'About 0.8 seconds', 'About 1 second'],
		correctAnswer: 'About 4.9 seconds',
		explanation: 'T_moon/T_earth = sqrt(g_earth/g_moon) = sqrt(9.81/1.62) ~ 2.46. So T_moon ~ 2 * 2.46 ~ 4.9 seconds. Lower gravity means longer periods.'
	},
	{
		id: 'q5',
		question: 'In a T^2 vs L graph for a simple pendulum, the slope equals:',
		options: ['2*pi/g', '4*pi^2/g', 'g/(4*pi^2)', 'g/(2*pi)'],
		correctAnswer: '4*pi^2/g',
		explanation: 'From T = 2*pi*sqrt(L/g), we get T^2 = (4*pi^2/g) * L. This is a linear equation y = mx where m = 4*pi^2/g, the slope of the T^2 vs L graph.'
	}
];

// Analysis result
export interface PendulumAnalysis {
	score: number;
	grade: 'A' | 'B' | 'C' | 'D' | 'F';
	averagePercentError: number;
	averageCalculatedG: number;
	gError: number;
	slopeFromGraph: number;
	gFromSlope: number;
	feedback: string;
	quizScore: { correct: number; total: number };
}

// Analyze experiment results
export function analyzeExperiment(state: PendulumState, quizAnswers: Map<string, string>): PendulumAnalysis {
	// Check quiz answers
	let quizCorrect = 0;
	PENDULUM_QUIZ.forEach((q) => {
		if (quizAnswers.get(q.id) === q.correctAnswer) {
			quizCorrect++;
		}
	});

	// Calculate average percent error
	let totalError = 0;
	let totalG = 0;
	state.measurements.forEach((m) => {
		totalError += m.percentError;
		totalG += m.calculatedG;
	});

	const avgError = state.measurements.length > 0 ? totalError / state.measurements.length : 100;
	const avgG = state.measurements.length > 0 ? totalG / state.measurements.length : 0;
	const gError = Math.abs((avgG - 9.81) / 9.81) * 100;

	// Calculate slope from T^2 vs L data using linear regression
	let slopeFromGraph = 0;
	let gFromSlope = 0;
	if (state.graphData.length >= 2) {
		const n = state.graphData.length;
		const sumL = state.graphData.reduce((s, p) => s + p.length, 0);
		const sumT2 = state.graphData.reduce((s, p) => s + p.periodSquared, 0);
		const sumLT2 = state.graphData.reduce((s, p) => s + p.length * p.periodSquared, 0);
		const sumL2 = state.graphData.reduce((s, p) => s + p.length * p.length, 0);

		slopeFromGraph = (n * sumLT2 - sumL * sumT2) / (n * sumL2 - sumL * sumL);
		gFromSlope = slopeFromGraph > 0 ? (4 * Math.PI * Math.PI) / slopeFromGraph : 0;
	}

	// Calculate score
	let score = 0;
	score += (quizCorrect / PENDULUM_QUIZ.length) * 35; // 35% from quiz
	score += Math.max(0, 25 - avgError * 2); // Up to 25% from measurement accuracy
	score += Math.min(state.measurements.length * 5, 25); // Up to 25% from data collection (5 points each)
	score += gError < 5 ? 15 : gError < 10 ? 10 : gError < 20 ? 5 : 0; // Up to 15% from g calculation

	// Determine grade
	let grade: PendulumAnalysis['grade'];
	if (score >= 90) grade = 'A';
	else if (score >= 80) grade = 'B';
	else if (score >= 70) grade = 'C';
	else if (score >= 60) grade = 'D';
	else grade = 'F';

	// Generate feedback
	let feedback = '';
	if (score >= 80) {
		feedback = `Excellent work! Your measurements verify the pendulum equation with an average error of ${avgError.toFixed(1)}%. `;
		feedback += `Your calculated value of g = ${avgG.toFixed(2)} m/s^2 is within ${gError.toFixed(1)}% of the accepted value.`;
	} else if (score >= 60) {
		feedback = `Good effort. Your average measurement error is ${avgError.toFixed(1)}%. `;
		feedback += `Try measuring more swings per data point to improve accuracy.`;
	} else {
		feedback = `Keep practicing! Make sure to count multiple full swings and divide the total time to get an accurate period measurement.`;
	}

	return {
		score: Math.round(score),
		grade,
		averagePercentError: avgError,
		averageCalculatedG: avgG,
		gError,
		slopeFromGraph,
		gFromSlope,
		feedback,
		quizScore: { correct: quizCorrect, total: PENDULUM_QUIZ.length }
	};
}
