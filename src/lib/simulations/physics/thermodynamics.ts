/**
 * Thermodynamics & Heat Transfer Laboratory Simulation
 * Physics experiment exploring calorimetry, specific heat, and thermal equilibrium
 * Q = mcDeltaT
 */

export interface ThermodynamicsState {
	// Calorimeter contents
	substance1: Substance;
	substance2: Substance;
	mass1: number; // grams
	mass2: number; // grams
	temp1: number; // initial temperature in Celsius
	temp2: number; // initial temperature in Celsius
	currentTemp1: number; // current temperature
	currentTemp2: number; // current temperature
	equilibriumTemp: number; // calculated final temperature
	// Simulation state
	isMixing: boolean;
	isMixed: boolean;
	mixingProgress: number; // 0-1
	currentTime: number; // seconds since mixing
	timeToEquilibrium: number;
	// Temperature history
	tempHistory: TempDataPoint[];
	// Conduction comparison
	conductionMode: boolean;
	conductionMaterials: ConductionMaterial[];
	conductionTime: number;
	conductionRunning: boolean;
	// Measurements
	measurements: ThermoMeasurement[];
	// Calculated values
	heatTransferred: number; // Joules
	calculatedSpecificHeat: number;
	// Display
	showThermometer: boolean;
}

export interface Substance {
	id: string;
	name: string;
	specificHeat: number; // J/(g*C)
	color: string;
	density: number; // g/cm^3
}

export interface TempDataPoint {
	time: number;
	temp1: number;
	temp2: number;
	mixedTemp?: number;
}

export interface ConductionMaterial {
	id: string;
	name: string;
	thermalConductivity: number; // W/(m*K)
	color: string;
	currentTemp: number; // temperature at far end
	tempHistory: { time: number; temp: number }[];
}

export interface ThermoMeasurement {
	id: string;
	type: 'calorimetry' | 'conduction';
	substance1Name?: string;
	substance2Name?: string;
	mass1?: number;
	mass2?: number;
	initialTemp1?: number;
	initialTemp2?: number;
	finalTemp?: number;
	heatTransferred?: number;
	calculatedSpecificHeat?: number;
	materialName?: string;
	conductionRate?: number;
	timestamp: number;
}

export interface ThermodynamicsConfig {
	substance1Id: string;
	substance2Id: string;
	mass1: number;
	mass2: number;
	temp1: number;
	temp2: number;
}

// Available substances
export const SUBSTANCES: Substance[] = [
	{ id: 'water', name: 'Water', specificHeat: 4.186, color: '#3B82F6', density: 1.0 },
	{ id: 'aluminum', name: 'Aluminum', specificHeat: 0.897, color: '#9CA3AF', density: 2.7 },
	{ id: 'copper', name: 'Copper', specificHeat: 0.385, color: '#F97316', density: 8.96 },
	{ id: 'iron', name: 'Iron', specificHeat: 0.449, color: '#6B7280', density: 7.87 },
	{ id: 'glass', name: 'Glass', specificHeat: 0.840, color: '#A78BFA', density: 2.5 },
	{ id: 'olive-oil', name: 'Olive Oil', specificHeat: 1.970, color: '#84CC16', density: 0.92 },
	{ id: 'ethanol', name: 'Ethanol', specificHeat: 2.440, color: '#F59E0B', density: 0.789 }
];

// Conduction materials
export const CONDUCTION_MATERIALS: ConductionMaterial[] = [
	{ id: 'copper', name: 'Copper', thermalConductivity: 401, color: '#F97316', currentTemp: 25, tempHistory: [] },
	{ id: 'aluminum', name: 'Aluminum', thermalConductivity: 237, color: '#9CA3AF', currentTemp: 25, tempHistory: [] },
	{ id: 'iron', name: 'Iron', thermalConductivity: 80, color: '#6B7280', currentTemp: 25, tempHistory: [] },
	{ id: 'glass', name: 'Glass', thermalConductivity: 1.05, color: '#A78BFA', currentTemp: 25, tempHistory: [] },
	{ id: 'wood', name: 'Wood', thermalConductivity: 0.15, color: '#92400E', currentTemp: 25, tempHistory: [] }
];

// Calculate thermal equilibrium temperature
export function calculateEquilibriumTemp(
	m1: number,
	c1: number,
	t1: number,
	m2: number,
	c2: number,
	t2: number
): number {
	// m1*c1*(Tf - T1) + m2*c2*(Tf - T2) = 0
	// Tf = (m1*c1*T1 + m2*c2*T2) / (m1*c1 + m2*c2)
	const numerator = m1 * c1 * t1 + m2 * c2 * t2;
	const denominator = m1 * c1 + m2 * c2;
	if (denominator === 0) return (t1 + t2) / 2;
	return numerator / denominator;
}

// Calculate heat transferred: Q = mcDeltaT
export function calculateHeat(mass: number, specificHeat: number, deltaT: number): number {
	return mass * specificHeat * Math.abs(deltaT);
}

// Create initial state
export function createInitialState(config: ThermodynamicsConfig): ThermodynamicsState {
	const s1 = SUBSTANCES.find((s) => s.id === config.substance1Id) || SUBSTANCES[0];
	const s2 = SUBSTANCES.find((s) => s.id === config.substance2Id) || SUBSTANCES[1];

	const eqTemp = calculateEquilibriumTemp(
		config.mass1,
		s1.specificHeat,
		config.temp1,
		config.mass2,
		s2.specificHeat,
		config.temp2
	);

	const heat = calculateHeat(config.mass1, s1.specificHeat, eqTemp - config.temp1);

	return {
		substance1: s1,
		substance2: s2,
		mass1: config.mass1,
		mass2: config.mass2,
		temp1: config.temp1,
		temp2: config.temp2,
		currentTemp1: config.temp1,
		currentTemp2: config.temp2,
		equilibriumTemp: eqTemp,
		isMixing: false,
		isMixed: false,
		mixingProgress: 0,
		currentTime: 0,
		timeToEquilibrium: 30, // seconds for visual convergence
		tempHistory: [{ time: 0, temp1: config.temp1, temp2: config.temp2 }],
		conductionMode: false,
		conductionMaterials: CONDUCTION_MATERIALS.map((m) => ({ ...m, currentTemp: 25, tempHistory: [] })),
		conductionTime: 0,
		conductionRunning: false,
		measurements: [],
		heatTransferred: heat,
		calculatedSpecificHeat: 0,
		showThermometer: true
	};
}

// Set substance 1
export function setSubstance1(state: ThermodynamicsState, substanceId: string): ThermodynamicsState {
	const s = SUBSTANCES.find((sub) => sub.id === substanceId);
	if (!s) return state;

	const eqTemp = calculateEquilibriumTemp(
		state.mass1, s.specificHeat, state.temp1,
		state.mass2, state.substance2.specificHeat, state.temp2
	);
	const heat = calculateHeat(state.mass1, s.specificHeat, eqTemp - state.temp1);

	return {
		...state,
		substance1: s,
		equilibriumTemp: eqTemp,
		heatTransferred: heat,
		currentTemp1: state.temp1,
		currentTemp2: state.temp2,
		isMixing: false,
		isMixed: false,
		mixingProgress: 0,
		currentTime: 0,
		tempHistory: [{ time: 0, temp1: state.temp1, temp2: state.temp2 }]
	};
}

// Set substance 2
export function setSubstance2(state: ThermodynamicsState, substanceId: string): ThermodynamicsState {
	const s = SUBSTANCES.find((sub) => sub.id === substanceId);
	if (!s) return state;

	const eqTemp = calculateEquilibriumTemp(
		state.mass1, state.substance1.specificHeat, state.temp1,
		state.mass2, s.specificHeat, state.temp2
	);
	const heat = calculateHeat(state.mass1, state.substance1.specificHeat, eqTemp - state.temp1);

	return {
		...state,
		substance2: s,
		equilibriumTemp: eqTemp,
		heatTransferred: heat,
		currentTemp1: state.temp1,
		currentTemp2: state.temp2,
		isMixing: false,
		isMixed: false,
		mixingProgress: 0,
		currentTime: 0,
		tempHistory: [{ time: 0, temp1: state.temp1, temp2: state.temp2 }]
	};
}

// Set mass
export function setMass1(state: ThermodynamicsState, mass: number): ThermodynamicsState {
	const m = Math.max(10, Math.min(500, mass));
	const eqTemp = calculateEquilibriumTemp(
		m, state.substance1.specificHeat, state.temp1,
		state.mass2, state.substance2.specificHeat, state.temp2
	);
	const heat = calculateHeat(m, state.substance1.specificHeat, eqTemp - state.temp1);

	return { ...state, mass1: m, equilibriumTemp: eqTemp, heatTransferred: heat };
}

export function setMass2(state: ThermodynamicsState, mass: number): ThermodynamicsState {
	const m = Math.max(10, Math.min(500, mass));
	const eqTemp = calculateEquilibriumTemp(
		state.mass1, state.substance1.specificHeat, state.temp1,
		m, state.substance2.specificHeat, state.temp2
	);
	const heat = calculateHeat(state.mass1, state.substance1.specificHeat, eqTemp - state.temp1);

	return { ...state, mass2: m, equilibriumTemp: eqTemp, heatTransferred: heat };
}

// Set temperatures
export function setTemp1(state: ThermodynamicsState, temp: number): ThermodynamicsState {
	const t = Math.max(0, Math.min(100, temp));
	const eqTemp = calculateEquilibriumTemp(
		state.mass1, state.substance1.specificHeat, t,
		state.mass2, state.substance2.specificHeat, state.temp2
	);
	const heat = calculateHeat(state.mass1, state.substance1.specificHeat, eqTemp - t);

	return {
		...state,
		temp1: t,
		currentTemp1: t,
		equilibriumTemp: eqTemp,
		heatTransferred: heat,
		isMixing: false,
		isMixed: false,
		mixingProgress: 0,
		currentTime: 0,
		tempHistory: [{ time: 0, temp1: t, temp2: state.temp2 }]
	};
}

export function setTemp2(state: ThermodynamicsState, temp: number): ThermodynamicsState {
	const t = Math.max(0, Math.min(100, temp));
	const eqTemp = calculateEquilibriumTemp(
		state.mass1, state.substance1.specificHeat, state.temp1,
		state.mass2, state.substance2.specificHeat, t
	);
	const heat = calculateHeat(state.mass1, state.substance1.specificHeat, eqTemp - state.temp1);

	return {
		...state,
		temp2: t,
		currentTemp2: t,
		equilibriumTemp: eqTemp,
		heatTransferred: heat,
		isMixing: false,
		isMixed: false,
		mixingProgress: 0,
		currentTime: 0,
		tempHistory: [{ time: 0, temp1: state.temp1, temp2: t }]
	};
}

// Start mixing
export function startMixing(state: ThermodynamicsState): ThermodynamicsState {
	return {
		...state,
		isMixing: true,
		isMixed: false,
		mixingProgress: 0,
		currentTime: 0,
		currentTemp1: state.temp1,
		currentTemp2: state.temp2,
		tempHistory: [{ time: 0, temp1: state.temp1, temp2: state.temp2 }]
	};
}

// Update mixing simulation
export function updateMixing(state: ThermodynamicsState, deltaTime: number): ThermodynamicsState {
	if (!state.isMixing) return state;

	const newTime = state.currentTime + deltaTime;
	const progress = Math.min(1, newTime / state.timeToEquilibrium);

	// Exponential approach to equilibrium
	const factor = 1 - Math.exp(-3 * progress);

	const newTemp1 = state.temp1 + (state.equilibriumTemp - state.temp1) * factor;
	const newTemp2 = state.temp2 + (state.equilibriumTemp - state.temp2) * factor;

	// Add noise to temperature readings
	const noise1 = (Math.random() - 0.5) * 0.2;
	const noise2 = (Math.random() - 0.5) * 0.2;

	const tempPoint: TempDataPoint = {
		time: newTime,
		temp1: newTemp1 + noise1,
		temp2: newTemp2 + noise2,
		mixedTemp: progress > 0.1 ? (newTemp1 + newTemp2) / 2 + (Math.random() - 0.5) * 0.1 : undefined
	};

	const isMixed = progress >= 0.99;

	return {
		...state,
		currentTime: newTime,
		mixingProgress: progress,
		currentTemp1: newTemp1 + noise1,
		currentTemp2: newTemp2 + noise2,
		tempHistory: [...state.tempHistory, tempPoint],
		isMixing: !isMixed,
		isMixed
	};
}

// Toggle conduction mode
export function toggleConductionMode(state: ThermodynamicsState): ThermodynamicsState {
	return {
		...state,
		conductionMode: !state.conductionMode,
		conductionRunning: false,
		conductionTime: 0,
		conductionMaterials: CONDUCTION_MATERIALS.map((m) => ({ ...m, currentTemp: 25, tempHistory: [] }))
	};
}

// Start conduction experiment
export function startConduction(state: ThermodynamicsState): ThermodynamicsState {
	return {
		...state,
		conductionRunning: true,
		conductionTime: 0,
		conductionMaterials: state.conductionMaterials.map((m) => ({
			...m,
			currentTemp: 25,
			tempHistory: [{ time: 0, temp: 25 }]
		}))
	};
}

// Update conduction simulation
export function updateConduction(state: ThermodynamicsState, deltaTime: number): ThermodynamicsState {
	if (!state.conductionRunning) return state;

	const newTime = state.conductionTime + deltaTime;
	const hotEndTemp = 100; // boiling water at one end
	const rodLength = 0.2; // 20cm rods
	const crossSection = 0.0001; // 1cm^2

	const updatedMaterials = state.conductionMaterials.map((mat) => {
		// Simplified conduction model: dT/dt proportional to k
		// Temperature at far end approaches hot end exponentially
		const tau = (rodLength * rodLength * 1000) / (mat.thermalConductivity * 4); // time constant
		const tempRise = (hotEndTemp - 25) * (1 - Math.exp(-newTime / tau));
		const newTemp = 25 + tempRise + (Math.random() - 0.5) * 0.3;

		return {
			...mat,
			currentTemp: Math.min(100, newTemp),
			tempHistory: [
				...mat.tempHistory,
				{ time: newTime, temp: Math.min(100, newTemp) }
			]
		};
	});

	return {
		...state,
		conductionTime: newTime,
		conductionMaterials: updatedMaterials
	};
}

// Record measurement
export function recordMeasurement(state: ThermodynamicsState): ThermodynamicsState {
	let measurement: ThermoMeasurement;

	if (state.conductionMode) {
		// Record conduction data for fastest material
		const fastest = [...state.conductionMaterials].sort((a, b) => b.currentTemp - a.currentTemp)[0];
		measurement = {
			id: `m-${Date.now()}`,
			type: 'conduction',
			materialName: fastest.name,
			conductionRate: (fastest.currentTemp - 25) / Math.max(1, state.conductionTime),
			timestamp: Date.now()
		};
	} else {
		// Record calorimetry data
		const measuredEqTemp = state.isMixed ? (state.currentTemp1 + state.currentTemp2) / 2 : state.currentTemp1;

		// Calculate specific heat of substance 2 from: m1*c1*(Tf-T1) = -m2*c2*(Tf-T2)
		const deltaT1 = measuredEqTemp - state.temp1;
		const deltaT2 = measuredEqTemp - state.temp2;
		let calcC2 = 0;
		if (Math.abs(deltaT2) > 0.01 && state.mass2 > 0) {
			calcC2 = -(state.mass1 * state.substance1.specificHeat * deltaT1) / (state.mass2 * deltaT2);
		}

		measurement = {
			id: `m-${Date.now()}`,
			type: 'calorimetry',
			substance1Name: state.substance1.name,
			substance2Name: state.substance2.name,
			mass1: state.mass1,
			mass2: state.mass2,
			initialTemp1: state.temp1,
			initialTemp2: state.temp2,
			finalTemp: measuredEqTemp,
			heatTransferred: state.heatTransferred,
			calculatedSpecificHeat: calcC2,
			timestamp: Date.now()
		};
	}

	return {
		...state,
		measurements: [...state.measurements, measurement]
	};
}

// Clear measurements
export function clearMeasurements(state: ThermodynamicsState): ThermodynamicsState {
	return { ...state, measurements: [] };
}

// Reset simulation
export function resetSimulation(state: ThermodynamicsState): ThermodynamicsState {
	return {
		...state,
		currentTemp1: state.temp1,
		currentTemp2: state.temp2,
		isMixing: false,
		isMixed: false,
		mixingProgress: 0,
		currentTime: 0,
		tempHistory: [{ time: 0, temp1: state.temp1, temp2: state.temp2 }],
		conductionRunning: false,
		conductionTime: 0,
		conductionMaterials: CONDUCTION_MATERIALS.map((m) => ({ ...m, currentTemp: 25, tempHistory: [] }))
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

export const THERMO_QUIZ: QuizQuestion[] = [
	{
		id: 'q1',
		question: 'The equation Q = mc*Delta*T is used to calculate:',
		options: ['Kinetic energy', 'Heat transferred', 'Work done', 'Potential energy'],
		correctAnswer: 'Heat transferred',
		explanation: 'Q = mcDeltaT calculates the heat (thermal energy) transferred to or from a substance, where m is mass, c is specific heat capacity, and DeltaT is the temperature change.'
	},
	{
		id: 'q2',
		question: 'Which substance has the highest specific heat capacity?',
		options: ['Copper', 'Iron', 'Water', 'Aluminum'],
		correctAnswer: 'Water',
		explanation: 'Water has an exceptionally high specific heat capacity (4.186 J/g*C), which is why it is so effective at storing thermal energy and moderating temperatures.'
	},
	{
		id: 'q3',
		question: 'When a hot object is placed in contact with a cold object, heat flows:',
		options: ['From cold to hot', 'From hot to cold', 'In both directions equally', 'Only if they are the same material'],
		correctAnswer: 'From hot to cold',
		explanation: 'The second law of thermodynamics states that heat spontaneously flows from a hotter object to a cooler one until thermal equilibrium is reached.'
	},
	{
		id: 'q4',
		question: 'At thermal equilibrium, what is true about two objects in contact?',
		options: ['They have the same mass', 'They have the same temperature', 'They have the same heat content', 'They have the same specific heat'],
		correctAnswer: 'They have the same temperature',
		explanation: 'Thermal equilibrium means both objects reach the same temperature. They do not need to have the same mass, heat content, or specific heat.'
	},
	{
		id: 'q5',
		question: 'Which metal is the best conductor of heat?',
		options: ['Iron', 'Aluminum', 'Copper', 'Glass'],
		correctAnswer: 'Copper',
		explanation: 'Copper has the highest thermal conductivity (401 W/m*K) among common metals, making it excellent for heat exchangers and cookware.'
	}
];

// Analysis
export interface ThermoAnalysis {
	score: number;
	grade: 'A' | 'B' | 'C' | 'D' | 'F';
	specificHeatAccuracy: number;
	feedback: string;
	quizScore: { correct: number; total: number };
}

export function analyzeExperiment(state: ThermodynamicsState, quizAnswers: Map<string, string>): ThermoAnalysis {
	let quizCorrect = 0;
	THERMO_QUIZ.forEach((q) => {
		if (quizAnswers.get(q.id) === q.correctAnswer) {
			quizCorrect++;
		}
	});

	// Calculate specific heat accuracy from calorimetry measurements
	let specificHeatAccuracy = 0;
	const calorimMeasurements = state.measurements.filter((m) => m.type === 'calorimetry' && m.calculatedSpecificHeat);
	if (calorimMeasurements.length > 0) {
		let totalError = 0;
		calorimMeasurements.forEach((m) => {
			const actual = state.substance2.specificHeat;
			const error = Math.abs((m.calculatedSpecificHeat! - actual) / actual) * 100;
			totalError += error;
		});
		specificHeatAccuracy = 100 - Math.min(100, totalError / calorimMeasurements.length);
	}

	// Score: 35% quiz, 25% accuracy, 25% data collection, 15% variety
	let score = 0;
	score += (quizCorrect / THERMO_QUIZ.length) * 35;
	score += (specificHeatAccuracy / 100) * 25;
	score += Math.min(state.measurements.length * 5, 25);

	const types = new Set(state.measurements.map((m) => m.type));
	score += Math.min(types.size * 7.5, 15);

	let grade: ThermoAnalysis['grade'];
	if (score >= 90) grade = 'A';
	else if (score >= 80) grade = 'B';
	else if (score >= 70) grade = 'C';
	else if (score >= 60) grade = 'D';
	else grade = 'F';

	let feedback = '';
	if (score >= 80) {
		feedback = 'Excellent work! You demonstrated strong understanding of heat transfer and calorimetry principles.';
	} else if (score >= 60) {
		feedback = 'Good effort. Try mixing different substance combinations and compare the conduction rates of different materials.';
	} else {
		feedback = 'Keep exploring! Mix hot and cold substances, observe the temperature changes, and try the conduction experiment too.';
	}

	return {
		score: Math.round(score),
		grade,
		specificHeatAccuracy,
		feedback,
		quizScore: { correct: quizCorrect, total: THERMO_QUIZ.length }
	};
}
