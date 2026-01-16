/**
 * Projectile Motion Laboratory Simulation
 * Physics experiment exploring kinematic equations and trajectory analysis
 */

export interface ProjectileState {
	initialVelocity: number; // m/s (5-50)
	launchAngle: number; // degrees (0-90)
	gravity: number; // m/s² (default 9.8, can adjust for different planets)
	isLaunched: boolean;
	currentTime: number; // seconds since launch
	projectileX: number; // current x position (meters)
	projectileY: number; // current y position (meters)
	trajectory: TrajectoryPoint[];
	measurements: ProjectileMeasurement[];
	selectedPlanet: Planet;
	showTheoretical: boolean;
	animationSpeed: number; // 0.5 - 2x
	launchHeight: number; // meters above ground (default 0)
	targetDistance: number | null; // optional target to hit
	hits: number;
	attempts: number;
}

export interface TrajectoryPoint {
	x: number;
	y: number;
	t: number;
	vx: number;
	vy: number;
}

export interface ProjectileMeasurement {
	id: string;
	angle: number;
	velocity: number;
	measuredRange: number;
	theoreticalRange: number;
	measuredMaxHeight: number;
	theoreticalMaxHeight: number;
	flightTime: number;
	timestamp: number;
}

export interface Planet {
	id: string;
	name: string;
	gravity: number;
	color: string;
}

export interface ProjectileConfig {
	initialVelocity: number;
	launchAngle: number;
	gravity: number;
	launchHeight: number;
}

// Available planetary environments
export const PLANETS: Planet[] = [
	{ id: 'earth', name: 'Earth', gravity: 9.8, color: '#3B82F6' },
	{ id: 'moon', name: 'Moon', gravity: 1.62, color: '#9CA3AF' },
	{ id: 'mars', name: 'Mars', gravity: 3.71, color: '#EF4444' },
	{ id: 'jupiter', name: 'Jupiter', gravity: 24.79, color: '#F97316' },
	{ id: 'venus', name: 'Venus', gravity: 8.87, color: '#EAB308' }
];

// Preset launch scenarios
export const PRESETS = [
	{ name: 'Maximum Range', angle: 45, velocity: 20 },
	{ name: 'High Arc', angle: 75, velocity: 15 },
	{ name: 'Low Trajectory', angle: 15, velocity: 30 },
	{ name: 'Cannon Shot', angle: 45, velocity: 40 }
];

// Create initial state
export function createInitialState(config: ProjectileConfig): ProjectileState {
	const planet = PLANETS.find((p) => p.gravity === config.gravity) || PLANETS[0];
	return {
		initialVelocity: config.initialVelocity,
		launchAngle: config.launchAngle,
		gravity: config.gravity,
		isLaunched: false,
		currentTime: 0,
		projectileX: 0,
		projectileY: config.launchHeight,
		trajectory: [],
		measurements: [],
		selectedPlanet: planet,
		showTheoretical: true,
		animationSpeed: 1,
		launchHeight: config.launchHeight,
		targetDistance: null,
		hits: 0,
		attempts: 0
	};
}

// Calculate theoretical values
export function calculateTheoretical(
	velocity: number,
	angleDeg: number,
	gravity: number,
	launchHeight: number = 0
): { range: number; maxHeight: number; flightTime: number } {
	const angleRad = (angleDeg * Math.PI) / 180;
	const vx = velocity * Math.cos(angleRad);
	const vy = velocity * Math.sin(angleRad);

	// Time to reach maximum height
	const timeToApex = vy / gravity;

	// Maximum height above launch point
	const maxHeightAboveLaunch = (vy * vy) / (2 * gravity);
	const maxHeight = launchHeight + maxHeightAboveLaunch;

	// Total flight time (solving y = launchHeight + vy*t - 0.5*g*t² = 0)
	// Using quadratic formula: t = (vy + sqrt(vy² + 2*g*launchHeight)) / g
	const discriminant = vy * vy + 2 * gravity * launchHeight;
	const flightTime = (vy + Math.sqrt(discriminant)) / gravity;

	// Range (horizontal distance)
	const range = vx * flightTime;

	return { range, maxHeight, flightTime };
}

// Get position at time t
export function getPositionAtTime(
	velocity: number,
	angleDeg: number,
	gravity: number,
	t: number,
	launchHeight: number = 0
): { x: number; y: number; vx: number; vy: number } {
	const angleRad = (angleDeg * Math.PI) / 180;
	const vx = velocity * Math.cos(angleRad);
	const vy0 = velocity * Math.sin(angleRad);

	const x = vx * t;
	const y = launchHeight + vy0 * t - 0.5 * gravity * t * t;
	const vyT = vy0 - gravity * t;

	return { x, y, vx, vy: vyT };
}

// Generate full trajectory
export function generateTrajectory(
	velocity: number,
	angleDeg: number,
	gravity: number,
	launchHeight: number = 0,
	timeStep: number = 0.02
): TrajectoryPoint[] {
	const points: TrajectoryPoint[] = [];
	const { flightTime } = calculateTheoretical(velocity, angleDeg, gravity, launchHeight);

	for (let t = 0; t <= flightTime; t += timeStep) {
		const pos = getPositionAtTime(velocity, angleDeg, gravity, t, launchHeight);
		if (pos.y >= 0) {
			points.push({ ...pos, t });
		}
	}

	return points;
}

// Set initial velocity
export function setVelocity(state: ProjectileState, velocity: number): ProjectileState {
	return {
		...state,
		initialVelocity: Math.max(5, Math.min(50, velocity)),
		isLaunched: false,
		currentTime: 0,
		projectileX: 0,
		projectileY: state.launchHeight,
		trajectory: []
	};
}

// Set launch angle
export function setAngle(state: ProjectileState, angle: number): ProjectileState {
	return {
		...state,
		launchAngle: Math.max(0, Math.min(90, angle)),
		isLaunched: false,
		currentTime: 0,
		projectileX: 0,
		projectileY: state.launchHeight,
		trajectory: []
	};
}

// Set gravity (select planet)
export function selectPlanet(state: ProjectileState, planetId: string): ProjectileState {
	const planet = PLANETS.find((p) => p.id === planetId);
	if (!planet) return state;

	return {
		...state,
		selectedPlanet: planet,
		gravity: planet.gravity,
		isLaunched: false,
		currentTime: 0,
		projectileX: 0,
		projectileY: state.launchHeight,
		trajectory: []
	};
}

// Set launch height
export function setLaunchHeight(state: ProjectileState, height: number): ProjectileState {
	return {
		...state,
		launchHeight: Math.max(0, Math.min(50, height)),
		projectileY: height,
		isLaunched: false,
		currentTime: 0,
		projectileX: 0,
		trajectory: []
	};
}

// Launch projectile
export function launch(state: ProjectileState): ProjectileState {
	const trajectory = generateTrajectory(
		state.initialVelocity,
		state.launchAngle,
		state.gravity,
		state.launchHeight
	);

	return {
		...state,
		isLaunched: true,
		currentTime: 0,
		projectileX: 0,
		projectileY: state.launchHeight,
		trajectory,
		attempts: state.attempts + 1
	};
}

// Update simulation (called each animation frame)
export function updateSimulation(state: ProjectileState, deltaTime: number): ProjectileState {
	if (!state.isLaunched) return state;

	const newTime = state.currentTime + deltaTime * state.animationSpeed;
	const pos = getPositionAtTime(
		state.initialVelocity,
		state.launchAngle,
		state.gravity,
		newTime,
		state.launchHeight
	);

	// Check if landed
	if (pos.y <= 0) {
		const { range, maxHeight, flightTime } = calculateTheoretical(
			state.initialVelocity,
			state.launchAngle,
			state.gravity,
			state.launchHeight
		);

		// Find actual measured values from trajectory
		const maxY = Math.max(...state.trajectory.map((p) => p.y));
		const finalX = state.trajectory[state.trajectory.length - 1]?.x || 0;

		// Check if hit target
		let hits = state.hits;
		if (state.targetDistance !== null) {
			const tolerance = 2; // 2 meters tolerance
			if (Math.abs(finalX - state.targetDistance) <= tolerance) {
				hits = state.hits + 1;
			}
		}

		return {
			...state,
			isLaunched: false,
			currentTime: flightTime,
			projectileX: finalX,
			projectileY: 0,
			hits
		};
	}

	return {
		...state,
		currentTime: newTime,
		projectileX: pos.x,
		projectileY: pos.y
	};
}

// Record measurement
export function recordMeasurement(state: ProjectileState): ProjectileState {
	if (state.trajectory.length === 0) return state;

	const { range, maxHeight, flightTime } = calculateTheoretical(
		state.initialVelocity,
		state.launchAngle,
		state.gravity,
		state.launchHeight
	);

	const maxY = Math.max(...state.trajectory.map((p) => p.y));
	const finalPoint = state.trajectory[state.trajectory.length - 1];

	const measurement: ProjectileMeasurement = {
		id: `m-${Date.now()}`,
		angle: state.launchAngle,
		velocity: state.initialVelocity,
		measuredRange: finalPoint?.x || 0,
		theoreticalRange: range,
		measuredMaxHeight: maxY,
		theoreticalMaxHeight: maxHeight,
		flightTime: finalPoint?.t || flightTime,
		timestamp: Date.now()
	};

	return {
		...state,
		measurements: [...state.measurements, measurement]
	};
}

// Reset to initial state
export function reset(state: ProjectileState): ProjectileState {
	return {
		...state,
		isLaunched: false,
		currentTime: 0,
		projectileX: 0,
		projectileY: state.launchHeight,
		trajectory: []
	};
}

// Clear all measurements
export function clearMeasurements(state: ProjectileState): ProjectileState {
	return {
		...state,
		measurements: []
	};
}

// Set animation speed
export function setAnimationSpeed(state: ProjectileState, speed: number): ProjectileState {
	return {
		...state,
		animationSpeed: Math.max(0.25, Math.min(3, speed))
	};
}

// Toggle theoretical trajectory display
export function toggleTheoretical(state: ProjectileState): ProjectileState {
	return {
		...state,
		showTheoretical: !state.showTheoretical
	};
}

// Set target for challenge mode
export function setTarget(state: ProjectileState, distance: number | null): ProjectileState {
	return {
		...state,
		targetDistance: distance,
		hits: 0,
		attempts: 0
	};
}

// Apply preset
export function applyPreset(
	state: ProjectileState,
	preset: { angle: number; velocity: number }
): ProjectileState {
	return {
		...state,
		launchAngle: preset.angle,
		initialVelocity: preset.velocity,
		isLaunched: false,
		currentTime: 0,
		projectileX: 0,
		projectileY: state.launchHeight,
		trajectory: []
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

export const PROJECTILE_QUIZ: QuizQuestion[] = [
	{
		id: 'q1',
		question: 'At what angle does a projectile achieve maximum horizontal range (on flat ground)?',
		options: ['30°', '45°', '60°', '90°'],
		correctAnswer: '45°',
		explanation: 'A 45° angle provides the optimal balance between horizontal velocity and time in the air, resulting in maximum range on flat ground.'
	},
	{
		id: 'q2',
		question: 'What happens to the horizontal velocity of a projectile during flight (ignoring air resistance)?',
		options: ['It increases', 'It decreases', 'It remains constant', 'It becomes zero at the peak'],
		correctAnswer: 'It remains constant',
		explanation: 'With no horizontal forces (ignoring air resistance), horizontal velocity remains constant throughout the flight according to Newton\'s first law.'
	},
	{
		id: 'q3',
		question: 'At the highest point of its trajectory, what is the vertical velocity of a projectile?',
		options: ['Maximum', 'Half of initial', 'Zero', 'Negative'],
		correctAnswer: 'Zero',
		explanation: 'At the apex, the projectile momentarily stops moving vertically before gravity pulls it back down, so vertical velocity is zero.'
	},
	{
		id: 'q4',
		question: 'If you double the initial velocity, how does the maximum height change?',
		options: ['Doubles', 'Quadruples', 'Stays the same', 'Triples'],
		correctAnswer: 'Quadruples',
		explanation: 'Maximum height is proportional to v² (h = v²sin²θ/2g). Doubling velocity means height increases by 2² = 4 times.'
	},
	{
		id: 'q5',
		question: 'Two balls are launched at the same speed but at complementary angles (e.g., 30° and 60°). How do their ranges compare?',
		options: ['30° goes farther', '60° goes farther', 'They travel the same distance', 'Cannot determine'],
		correctAnswer: 'They travel the same distance',
		explanation: 'Complementary angles (angles that sum to 90°) produce the same horizontal range: R = v²sin(2θ)/g, and sin(2×30°) = sin(2×60°) = sin(60°) = sin(120°).'
	}
];

// Analysis result
export interface ProjectileAnalysis {
	score: number;
	grade: 'A' | 'B' | 'C' | 'D' | 'F';
	averageRangeError: number;
	averageHeightError: number;
	feedback: string;
	quizScore: { correct: number; total: number };
	challengeAccuracy: number;
}

// Analyze experiment results
export function analyzeExperiment(state: ProjectileState, quizAnswers: Map<string, string>): ProjectileAnalysis {
	// Check quiz answers
	let quizCorrect = 0;
	PROJECTILE_QUIZ.forEach((q) => {
		if (quizAnswers.get(q.id) === q.correctAnswer) {
			quizCorrect++;
		}
	});

	// Calculate measurement accuracy
	let totalRangeError = 0;
	let totalHeightError = 0;
	state.measurements.forEach((m) => {
		const rangeError = Math.abs(m.measuredRange - m.theoreticalRange) / m.theoreticalRange;
		const heightError = Math.abs(m.measuredMaxHeight - m.theoreticalMaxHeight) / m.theoreticalMaxHeight;
		totalRangeError += rangeError * 100;
		totalHeightError += heightError * 100;
	});

	const avgRangeError = state.measurements.length > 0 ? totalRangeError / state.measurements.length : 100;
	const avgHeightError = state.measurements.length > 0 ? totalHeightError / state.measurements.length : 100;

	// Challenge accuracy
	const challengeAccuracy = state.attempts > 0 ? (state.hits / state.attempts) * 100 : 0;

	// Calculate score
	let score = 0;
	score += (quizCorrect / PROJECTILE_QUIZ.length) * 40; // 40% from quiz
	score += Math.max(0, 30 - avgRangeError); // Up to 30% from measurement accuracy
	score += Math.min(state.measurements.length * 5, 20); // Up to 20% from data collection
	score += challengeAccuracy * 0.1; // Up to 10% from challenge mode

	// Determine grade
	let grade: ProjectileAnalysis['grade'];
	if (score >= 90) grade = 'A';
	else if (score >= 80) grade = 'B';
	else if (score >= 70) grade = 'C';
	else if (score >= 60) grade = 'D';
	else grade = 'F';

	// Generate feedback
	let feedback = '';
	if (score >= 80) {
		feedback = 'Excellent work! You demonstrated a strong understanding of projectile motion principles.';
	} else if (score >= 60) {
		feedback = 'Good effort! Review the relationship between launch angle and range for better results.';
	} else {
		feedback = 'Keep practicing! Focus on understanding how velocity and angle affect the trajectory.';
	}

	return {
		score: Math.round(score),
		grade,
		averageRangeError: avgRangeError,
		averageHeightError: avgHeightError,
		feedback,
		quizScore: { correct: quizCorrect, total: PROJECTILE_QUIZ.length },
		challengeAccuracy
	};
}
