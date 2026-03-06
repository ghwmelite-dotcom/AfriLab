/**
 * Chromatography Simulation Engine
 *
 * Simulates paper chromatography and thin-layer chromatography (TLC).
 * Rf = distance traveled by solute / distance traveled by solvent front
 */

export interface ChromatographyConfig {
	method: 'paper' | 'tlc';
	solvent: {
		name: string;
		formula: string;
		polarity: number; // 0-1 scale
	};
	plateLength: number; // cm
	originLine: number; // cm from bottom
}

export interface ChromatographyState {
	method: 'paper' | 'tlc';
	samples: SampleSpot[];
	solventFrontDistance: number; // cm from origin
	maxSolventDistance: number; // cm
	isRunning: boolean;
	isComplete: boolean;
	elapsedTime: number; // seconds
	developmentSpeed: number; // cm/s
	measurements: RfMeasurement[];
	spotsMeasured: boolean;
	solventName: string;
}

export interface SampleSpot {
	id: string;
	name: string;
	color: string;
	components: SpotComponent[];
	applied: boolean;
	originPosition: number; // x position as fraction 0-1
}

export interface SpotComponent {
	name: string;
	color: string;
	rfValue: number; // true Rf value
	currentDistance: number; // cm from origin
	bandWidth: number; // visual width in cm
	intensity: number; // 0-1
}

export interface RfMeasurement {
	sampleId: string;
	componentName: string;
	componentColor: string;
	distanceTraveled: number;
	solventFrontDistance: number;
	rfValue: number;
	timestamp: Date;
}

// Known samples with their chromatographic properties
export const SAMPLE_LIBRARY = {
	'ink-black': {
		name: 'Black Ink',
		color: '#1a1a1a',
		components: [
			{ name: 'Blue dye', color: '#2563eb', rfValue: 0.45, currentDistance: 0, bandWidth: 0.3, intensity: 0.9 },
			{ name: 'Red dye', color: '#dc2626', rfValue: 0.62, currentDistance: 0, bandWidth: 0.25, intensity: 0.8 },
			{ name: 'Yellow dye', color: '#eab308', rfValue: 0.78, currentDistance: 0, bandWidth: 0.2, intensity: 0.7 }
		]
	},
	'ink-green': {
		name: 'Green Ink',
		color: '#16a34a',
		components: [
			{ name: 'Blue dye', color: '#2563eb', rfValue: 0.45, currentDistance: 0, bandWidth: 0.3, intensity: 0.85 },
			{ name: 'Yellow dye', color: '#eab308', rfValue: 0.78, currentDistance: 0, bandWidth: 0.2, intensity: 0.9 }
		]
	},
	'ink-purple': {
		name: 'Purple Ink',
		color: '#7c3aed',
		components: [
			{ name: 'Blue dye', color: '#2563eb', rfValue: 0.45, currentDistance: 0, bandWidth: 0.3, intensity: 0.85 },
			{ name: 'Red dye', color: '#dc2626', rfValue: 0.62, currentDistance: 0, bandWidth: 0.25, intensity: 0.9 }
		]
	},
	'leaf-extract': {
		name: 'Leaf Extract',
		color: '#365314',
		components: [
			{ name: 'Chlorophyll b', color: '#84cc16', rfValue: 0.32, currentDistance: 0, bandWidth: 0.35, intensity: 0.7 },
			{ name: 'Chlorophyll a', color: '#15803d', rfValue: 0.45, currentDistance: 0, bandWidth: 0.3, intensity: 0.9 },
			{ name: 'Xanthophyll', color: '#facc15', rfValue: 0.62, currentDistance: 0, bandWidth: 0.2, intensity: 0.6 },
			{ name: 'Carotene', color: '#f97316', rfValue: 0.85, currentDistance: 0, bandWidth: 0.15, intensity: 0.8 }
		]
	},
	'unknown-a': {
		name: 'Unknown A',
		color: '#6b7280',
		components: [
			{ name: 'Component 1', color: '#dc2626', rfValue: 0.62, currentDistance: 0, bandWidth: 0.25, intensity: 0.85 },
			{ name: 'Component 2', color: '#eab308', rfValue: 0.78, currentDistance: 0, bandWidth: 0.2, intensity: 0.75 }
		]
	}
} as const;

export const SOLVENT_LIBRARY = {
	'water': { name: 'Water', formula: 'H\u2082O', polarity: 1.0 },
	'ethanol': { name: 'Ethanol', formula: 'C\u2082H\u2085OH', polarity: 0.65 },
	'acetone': { name: 'Acetone', formula: 'CH\u2083COCH\u2083', polarity: 0.56 },
	'hexane': { name: 'Hexane', formula: 'C\u2086H\u2081\u2084', polarity: 0.01 },
	'ethyl-acetate': { name: 'Ethyl Acetate', formula: 'CH\u2083COOC\u2082H\u2085', polarity: 0.23 }
} as const;

/**
 * Create initial chromatography state
 */
export function createInitialState(config: ChromatographyConfig): ChromatographyState {
	const maxSolventDistance = config.plateLength - config.originLine - 0.5;

	return {
		method: config.method,
		samples: [],
		solventFrontDistance: 0,
		maxSolventDistance,
		isRunning: false,
		isComplete: false,
		elapsedTime: 0,
		developmentSpeed: config.method === 'tlc' ? 0.08 : 0.04, // TLC is faster
		measurements: [],
		spotsMeasured: false,
		solventName: config.solvent.name
	};
}

/**
 * Apply a sample to the plate/paper
 */
export function applySample(
	state: ChromatographyState,
	sampleKey: string,
	positionIndex: number
): ChromatographyState {
	if (state.isRunning || state.isComplete) return state;

	const sampleData = SAMPLE_LIBRARY[sampleKey as keyof typeof SAMPLE_LIBRARY];
	if (!sampleData) return state;

	// Check if already applied
	if (state.samples.some(s => s.id === sampleKey)) return state;

	const maxSamples = 5;
	const position = (positionIndex + 1) / (maxSamples + 1);

	const newSample: SampleSpot = {
		id: sampleKey,
		name: sampleData.name,
		color: sampleData.color,
		components: sampleData.components.map(c => ({ ...c, currentDistance: 0 })),
		applied: true,
		originPosition: position
	};

	return {
		...state,
		samples: [...state.samples, newSample]
	};
}

/**
 * Remove a sample from the plate
 */
export function removeSample(state: ChromatographyState, sampleId: string): ChromatographyState {
	if (state.isRunning || state.isComplete) return state;

	return {
		...state,
		samples: state.samples.filter(s => s.id !== sampleId)
	};
}

/**
 * Start the chromatography development
 */
export function startDevelopment(state: ChromatographyState): ChromatographyState {
	if (state.samples.length === 0 || state.isRunning || state.isComplete) return state;

	return {
		...state,
		isRunning: true
	};
}

/**
 * Advance the simulation by a time step
 */
export function advanceTime(state: ChromatographyState, deltaTime: number): ChromatographyState {
	if (!state.isRunning || state.isComplete) return state;

	const newElapsed = state.elapsedTime + deltaTime;
	const newSolventDistance = Math.min(
		state.solventFrontDistance + state.developmentSpeed * deltaTime,
		state.maxSolventDistance
	);

	// Update component positions based on their Rf values
	const newSamples = state.samples.map(sample => ({
		...sample,
		components: sample.components.map(comp => ({
			...comp,
			currentDistance: Math.min(comp.rfValue * newSolventDistance, newSolventDistance)
		}))
	}));

	const isComplete = newSolventDistance >= state.maxSolventDistance;

	return {
		...state,
		solventFrontDistance: newSolventDistance,
		elapsedTime: newElapsed,
		samples: newSamples,
		isRunning: !isComplete,
		isComplete
	};
}

/**
 * Stop development early
 */
export function stopDevelopment(state: ChromatographyState): ChromatographyState {
	if (!state.isRunning) return state;

	return {
		...state,
		isRunning: false,
		isComplete: true
	};
}

/**
 * Measure Rf value for a component
 */
export function measureRf(
	state: ChromatographyState,
	sampleId: string,
	componentIndex: number
): ChromatographyState {
	if (!state.isComplete || state.solventFrontDistance <= 0) return state;

	const sample = state.samples.find(s => s.id === sampleId);
	if (!sample || componentIndex >= sample.components.length) return state;

	const component = sample.components[componentIndex];
	const rfValue = component.currentDistance / state.solventFrontDistance;

	// Check for duplicate measurement
	const existing = state.measurements.find(
		m => m.sampleId === sampleId && m.componentName === component.name
	);
	if (existing) return state;

	const measurement: RfMeasurement = {
		sampleId,
		componentName: component.name,
		componentColor: component.color,
		distanceTraveled: component.currentDistance,
		solventFrontDistance: state.solventFrontDistance,
		rfValue,
		timestamp: new Date()
	};

	return {
		...state,
		measurements: [...state.measurements, measurement],
		spotsMeasured: true
	};
}

/**
 * Analyze chromatography results
 */
export function analyzeChromatography(state: ChromatographyState): {
	totalComponents: number;
	measuredComponents: number;
	rfAccuracy: number;
	separationQuality: string;
	identifiedUnknowns: string[];
	score: number;
	feedback: string;
} {
	const totalComponents = state.samples.reduce((sum, s) => sum + s.components.length, 0);
	const measuredComponents = state.measurements.length;

	// Calculate Rf accuracy
	let totalError = 0;
	let errorCount = 0;

	state.measurements.forEach(m => {
		const sample = state.samples.find(s => s.id === m.sampleId);
		if (sample) {
			const component = sample.components.find(c => c.name === m.componentName);
			if (component) {
				totalError += Math.abs(m.rfValue - component.rfValue);
				errorCount++;
			}
		}
	});

	const avgError = errorCount > 0 ? totalError / errorCount : 1;
	const rfAccuracy = Math.max(0, 100 - avgError * 200);

	// Check separation quality
	let separationQuality: string;
	if (state.solventFrontDistance >= state.maxSolventDistance * 0.8) {
		separationQuality = 'Excellent';
	} else if (state.solventFrontDistance >= state.maxSolventDistance * 0.5) {
		separationQuality = 'Good';
	} else {
		separationQuality = 'Poor - solvent front did not travel far enough';
	}

	// Try to identify unknowns by matching Rf values
	const identifiedUnknowns: string[] = [];
	const unknownMeasurements = state.measurements.filter(m => m.sampleId.startsWith('unknown'));
	unknownMeasurements.forEach(m => {
		// Compare with known sample Rf values
		const knownSamples = state.samples.filter(s => !s.id.startsWith('unknown'));
		knownSamples.forEach(known => {
			known.components.forEach(kc => {
				if (Math.abs(m.rfValue - kc.rfValue) < 0.05) {
					identifiedUnknowns.push(`${m.componentName} matches ${kc.name} from ${known.name} (Rf ~ ${kc.rfValue.toFixed(2)})`);
				}
			});
		});
	});

	// Calculate overall score
	const completenessScore = totalComponents > 0 ? (measuredComponents / totalComponents) * 40 : 0;
	const accuracyScore = rfAccuracy * 0.4;
	const separationScore = state.isComplete ? 20 : 0;
	const score = Math.min(100, Math.round(completenessScore + accuracyScore + separationScore));

	let feedback: string;
	if (score >= 90) {
		feedback = 'Outstanding work! You have accurately separated and measured all components.';
	} else if (score >= 75) {
		feedback = 'Good job! Most components were identified correctly. Review your Rf measurements for precision.';
	} else if (score >= 60) {
		feedback = 'Fair attempt. Try measuring more components and ensure the solvent front travels sufficiently.';
	} else {
		feedback = 'More practice needed. Make sure to apply samples, run the development fully, and measure all spots.';
	}

	return {
		totalComponents,
		measuredComponents,
		rfAccuracy,
		separationQuality,
		identifiedUnknowns,
		score,
		feedback
	};
}

/**
 * Quiz questions for chromatography
 */
export const quizQuestions = [
	{
		id: 'q1',
		question: 'What does a higher Rf value indicate about a component?',
		options: [
			'It is more polar',
			'It is less polar and more soluble in the mobile phase',
			'It has a higher molecular weight',
			'It is colored more intensely'
		],
		correctIndex: 1,
		explanation: 'A higher Rf value means the component traveled farther with the solvent, indicating greater affinity for the mobile phase (less polar in normal-phase chromatography).'
	},
	{
		id: 'q2',
		question: 'Why must the solvent level be below the origin line?',
		options: [
			'To prevent the plate from dissolving',
			'To keep the samples from dissolving directly into the solvent',
			'To slow down the development',
			'To make the colors more visible'
		],
		correctIndex: 1,
		explanation: 'If the solvent level is above the origin, the sample spots would dissolve directly into the solvent reservoir rather than being carried up by capillary action.'
	},
	{
		id: 'q3',
		question: 'Why is TLC generally faster than paper chromatography?',
		options: [
			'TLC uses a stronger solvent',
			'The silica gel stationary phase has smaller, more uniform particles with better capillary action',
			'Paper is thicker than TLC plates',
			'TLC uses heat to speed up development'
		],
		correctIndex: 1,
		explanation: 'TLC plates have a thin, uniform layer of silica gel with excellent capillary properties, allowing faster and more efficient separation compared to cellulose fibers in paper.'
	},
	{
		id: 'q4',
		question: 'Two components have the same Rf value. What does this suggest?',
		options: [
			'They are definitely the same compound',
			'They may be the same compound, but further tests are needed',
			'They have different molecular weights',
			'The experiment failed'
		],
		correctIndex: 1,
		explanation: 'Identical Rf values suggest the compounds may be the same, but co-spotting and other analytical methods are needed for confirmation, as different compounds can have similar Rf values.'
	}
];
