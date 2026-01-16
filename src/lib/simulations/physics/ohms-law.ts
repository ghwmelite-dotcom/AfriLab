/**
 * Ohm's Law Laboratory Simulation
 * Physics experiment for verifying V = IR relationship
 */

export interface OhmsLawState {
	voltage: number; // Volts (0-12V)
	resistance: number; // Ohms (10-1000Ω)
	measuredCurrent: number; // Amperes (calculated with noise)
	voltmeterReading: number; // Displayed voltage with noise
	ammeterReading: number; // Displayed current with noise
	isCircuitClosed: boolean;
	isPowerOn: boolean;
	selectedResistor: ResistorValue;
	measurements: Measurement[];
	graphData: GraphPoint[];
	experimentMode: 'vary-voltage' | 'vary-resistance';
	wireConnections: WireConnection[];
	isCircuitComplete: boolean;
}

export interface Measurement {
	id: string;
	voltage: number;
	current: number;
	resistance: number;
	timestamp: number;
}

export interface GraphPoint {
	x: number; // Voltage or Resistance depending on mode
	y: number; // Current
	label: string;
}

export interface ResistorValue {
	id: string;
	value: number;
	tolerance: number;
	colorBands: string[];
	label: string;
}

export interface WireConnection {
	id: string;
	from: 'power_pos' | 'power_neg' | 'resistor_a' | 'resistor_b' | 'ammeter_pos' | 'ammeter_neg' | 'voltmeter_pos' | 'voltmeter_neg';
	to: 'power_pos' | 'power_neg' | 'resistor_a' | 'resistor_b' | 'ammeter_pos' | 'ammeter_neg' | 'voltmeter_pos' | 'voltmeter_neg';
	color: string;
}

export interface OhmsLawConfig {
	defaultVoltage: number;
	defaultResistance: number;
}

// Available resistors with color codes
export const RESISTORS: ResistorValue[] = [
	{ id: 'r10', value: 10, tolerance: 5, colorBands: ['brown', 'black', 'black', 'gold'], label: '10Ω' },
	{ id: 'r47', value: 47, tolerance: 5, colorBands: ['yellow', 'violet', 'black', 'gold'], label: '47Ω' },
	{ id: 'r100', value: 100, tolerance: 5, colorBands: ['brown', 'black', 'brown', 'gold'], label: '100Ω' },
	{ id: 'r220', value: 220, tolerance: 5, colorBands: ['red', 'red', 'brown', 'gold'], label: '220Ω' },
	{ id: 'r470', value: 470, tolerance: 5, colorBands: ['yellow', 'violet', 'brown', 'gold'], label: '470Ω' },
	{ id: 'r1k', value: 1000, tolerance: 5, colorBands: ['brown', 'black', 'red', 'gold'], label: '1kΩ' }
];

// Resistor color band mapping
export const BAND_COLORS: Record<string, string> = {
	black: '#1a1a1a',
	brown: '#8B4513',
	red: '#DC2626',
	orange: '#F97316',
	yellow: '#EAB308',
	green: '#22C55E',
	blue: '#3B82F6',
	violet: '#8B5CF6',
	gray: '#6B7280',
	white: '#FFFFFF',
	gold: '#FFD700',
	silver: '#C0C0C0'
};

// Create initial state
export function createInitialState(config: OhmsLawConfig): OhmsLawState {
	const resistor = RESISTORS.find((r) => r.value === config.defaultResistance) || RESISTORS[2];
	return {
		voltage: config.defaultVoltage,
		resistance: resistor.value,
		measuredCurrent: 0,
		voltmeterReading: 0,
		ammeterReading: 0,
		isCircuitClosed: false,
		isPowerOn: false,
		selectedResistor: resistor,
		measurements: [],
		graphData: [],
		experimentMode: 'vary-voltage',
		wireConnections: [],
		isCircuitComplete: false
	};
}

// Calculate current using Ohm's law with realistic noise
function calculateCurrent(voltage: number, resistance: number): number {
	if (resistance === 0) return 0;
	const idealCurrent = voltage / resistance;
	// Add small measurement noise (±2%)
	const noise = (Math.random() - 0.5) * 0.04 * idealCurrent;
	return Math.max(0, idealCurrent + noise);
}

// Add measurement noise to readings
function addMeasurementNoise(value: number, noisePercent: number = 2): number {
	const noise = (Math.random() - 0.5) * (noisePercent / 100) * 2 * value;
	return value + noise;
}

// Set voltage
export function setVoltage(state: OhmsLawState, voltage: number): OhmsLawState {
	const clampedVoltage = Math.max(0, Math.min(12, voltage));
	const newState = { ...state, voltage: clampedVoltage };
	return updateMeterReadings(newState);
}

// Set resistance by selecting a resistor
export function selectResistor(state: OhmsLawState, resistorId: string): OhmsLawState {
	const resistor = RESISTORS.find((r) => r.id === resistorId);
	if (!resistor) return state;

	const newState = {
		...state,
		selectedResistor: resistor,
		resistance: resistor.value
	};
	return updateMeterReadings(newState);
}

// Toggle power supply
export function togglePower(state: OhmsLawState): OhmsLawState {
	const newState = { ...state, isPowerOn: !state.isPowerOn };
	return updateMeterReadings(newState);
}

// Toggle circuit switch
export function toggleSwitch(state: OhmsLawState): OhmsLawState {
	const newState = { ...state, isCircuitClosed: !state.isCircuitClosed };
	return updateMeterReadings(newState);
}

// Update meter readings based on circuit state
function updateMeterReadings(state: OhmsLawState): OhmsLawState {
	if (!state.isPowerOn || !state.isCircuitClosed || !state.isCircuitComplete) {
		return {
			...state,
			measuredCurrent: 0,
			voltmeterReading: 0,
			ammeterReading: 0
		};
	}

	const current = calculateCurrent(state.voltage, state.resistance);
	return {
		...state,
		measuredCurrent: current,
		voltmeterReading: addMeasurementNoise(state.voltage, 1),
		ammeterReading: addMeasurementNoise(current * 1000, 2) // Convert to mA
	};
}

// Add wire connection
export function addWireConnection(state: OhmsLawState, from: WireConnection['from'], to: WireConnection['to']): OhmsLawState {
	// Check if connection already exists
	const exists = state.wireConnections.some(
		(w) => (w.from === from && w.to === to) || (w.from === to && w.to === from)
	);
	if (exists) return state;

	const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B'];
	const newWire: WireConnection = {
		id: `wire-${Date.now()}`,
		from,
		to,
		color: colors[state.wireConnections.length % colors.length]
	};

	const newConnections = [...state.wireConnections, newWire];
	const isComplete = checkCircuitComplete(newConnections);

	const newState = {
		...state,
		wireConnections: newConnections,
		isCircuitComplete: isComplete
	};
	return updateMeterReadings(newState);
}

// Remove wire connection
export function removeWireConnection(state: OhmsLawState, wireId: string): OhmsLawState {
	const newConnections = state.wireConnections.filter((w) => w.id !== wireId);
	const isComplete = checkCircuitComplete(newConnections);

	const newState = {
		...state,
		wireConnections: newConnections,
		isCircuitComplete: isComplete
	};
	return updateMeterReadings(newState);
}

// Check if circuit is complete (simplified check)
function checkCircuitComplete(connections: WireConnection[]): boolean {
	// For a complete circuit, we need:
	// 1. Power positive -> Ammeter positive
	// 2. Ammeter negative -> Resistor A
	// 3. Resistor B -> Power negative
	// 4. Voltmeter connected in parallel across resistor

	const hasPath = (from: string, to: string) =>
		connections.some(
			(w) => (w.from === from && w.to === to) || (w.from === to && w.to === from)
		);

	const seriesCircuit =
		hasPath('power_pos', 'ammeter_pos') &&
		hasPath('ammeter_neg', 'resistor_a') &&
		hasPath('resistor_b', 'power_neg');

	return seriesCircuit;
}

// Record a measurement
export function recordMeasurement(state: OhmsLawState): OhmsLawState {
	if (!state.isPowerOn || !state.isCircuitClosed || state.ammeterReading === 0) {
		return state;
	}

	const measurement: Measurement = {
		id: `m-${Date.now()}`,
		voltage: state.voltmeterReading,
		current: state.ammeterReading,
		resistance: state.resistance,
		timestamp: Date.now()
	};

	const graphPoint: GraphPoint = {
		x: state.experimentMode === 'vary-voltage' ? state.voltage : state.resistance,
		y: state.ammeterReading,
		label: `${state.voltage.toFixed(1)}V, ${state.ammeterReading.toFixed(2)}mA`
	};

	return {
		...state,
		measurements: [...state.measurements, measurement],
		graphData: [...state.graphData, graphPoint]
	};
}

// Clear all measurements
export function clearMeasurements(state: OhmsLawState): OhmsLawState {
	return {
		...state,
		measurements: [],
		graphData: []
	};
}

// Set experiment mode
export function setExperimentMode(state: OhmsLawState, mode: OhmsLawState['experimentMode']): OhmsLawState {
	return {
		...state,
		experimentMode: mode,
		measurements: [],
		graphData: []
	};
}

// Auto-connect circuit for beginners
export function autoConnectCircuit(state: OhmsLawState): OhmsLawState {
	const connections: WireConnection[] = [
		{ id: 'w1', from: 'power_pos', to: 'ammeter_pos', color: '#EF4444' },
		{ id: 'w2', from: 'ammeter_neg', to: 'resistor_a', color: '#3B82F6' },
		{ id: 'w3', from: 'resistor_b', to: 'power_neg', color: '#10B981' },
		{ id: 'w4', from: 'resistor_a', to: 'voltmeter_pos', color: '#F59E0B' },
		{ id: 'w5', from: 'resistor_b', to: 'voltmeter_neg', color: '#8B5CF6' }
	];

	const newState = {
		...state,
		wireConnections: connections,
		isCircuitComplete: true
	};
	return updateMeterReadings(newState);
}

// Analysis and grading
export interface OhmsLawAnalysis {
	score: number;
	grade: 'A' | 'B' | 'C' | 'D' | 'F';
	linearityR2: number;
	calculatedResistance: number;
	resistanceError: number;
	feedback: string;
	isOhmsLawVerified: boolean;
}

export function analyzeExperiment(state: OhmsLawState): OhmsLawAnalysis {
	if (state.measurements.length < 3) {
		return {
			score: 0,
			grade: 'F',
			linearityR2: 0,
			calculatedResistance: 0,
			resistanceError: 100,
			feedback: 'Not enough data points. Record at least 3 measurements at different voltages.',
			isOhmsLawVerified: false
		};
	}

	// Calculate linear regression for V vs I
	const n = state.measurements.length;
	const voltages = state.measurements.map((m) => m.voltage);
	const currents = state.measurements.map((m) => m.current / 1000); // Convert mA to A

	const sumV = voltages.reduce((a, b) => a + b, 0);
	const sumI = currents.reduce((a, b) => a + b, 0);
	const sumVI = voltages.reduce((sum, v, i) => sum + v * currents[i], 0);
	const sumV2 = voltages.reduce((sum, v) => sum + v * v, 0);
	const sumI2 = currents.reduce((sum, i) => sum + i * i, 0);

	// Slope = R (resistance)
	const slope = (n * sumVI - sumV * sumI) / (n * sumV2 - sumV * sumV);
	const calculatedResistance = 1 / slope; // R = V/I, slope = I/V, so R = 1/slope

	// R-squared (coefficient of determination)
	const meanI = sumI / n;
	const ssTotal = currents.reduce((sum, i) => sum + Math.pow(i - meanI, 2), 0);
	const ssResidual = currents.reduce((sum, current, idx) => {
		const predicted = voltages[idx] / calculatedResistance;
		return sum + Math.pow(current - predicted, 2);
	}, 0);
	const r2 = 1 - ssResidual / ssTotal;

	// Calculate error from actual resistance
	const resistanceError = Math.abs((calculatedResistance - state.resistance) / state.resistance) * 100;

	// Determine if Ohm's law is verified (R² > 0.95 and error < 10%)
	const isOhmsLawVerified = r2 > 0.95 && resistanceError < 10;

	// Calculate score
	let score = 0;
	score += Math.min(40, state.measurements.length * 8); // Up to 40 points for data collection
	score += Math.min(30, r2 * 30); // Up to 30 points for linearity
	score += Math.min(30, Math.max(0, 30 - resistanceError * 2)); // Up to 30 points for accuracy

	// Determine grade
	let grade: OhmsLawAnalysis['grade'];
	if (score >= 90) grade = 'A';
	else if (score >= 80) grade = 'B';
	else if (score >= 70) grade = 'C';
	else if (score >= 60) grade = 'D';
	else grade = 'F';

	// Generate feedback
	let feedback = '';
	if (isOhmsLawVerified) {
		feedback = `Excellent work! Your data shows a strong linear relationship (R² = ${r2.toFixed(3)}) between voltage and current, confirming Ohm's Law. `;
		feedback += `Your calculated resistance of ${calculatedResistance.toFixed(1)}Ω is within ${resistanceError.toFixed(1)}% of the actual value.`;
	} else if (r2 > 0.9) {
		feedback = `Good attempt. Your data shows reasonable linearity (R² = ${r2.toFixed(3)}). `;
		if (resistanceError > 10) {
			feedback += `However, your calculated resistance has a ${resistanceError.toFixed(1)}% error. Try taking more careful measurements.`;
		}
	} else {
		feedback = `Your data doesn't show a strong linear relationship (R² = ${r2.toFixed(3)}). `;
		feedback += `Make sure the circuit is properly connected and take measurements at evenly spaced voltage intervals.`;
	}

	return {
		score: Math.round(score),
		grade,
		linearityR2: r2,
		calculatedResistance,
		resistanceError,
		feedback,
		isOhmsLawVerified
	};
}
