/**
 * UV-Vis Spectroscopy Simulation
 *
 * Simulates the Beer-Lambert law: A = εlc
 * Where:
 * - A = Absorbance (no units)
 * - ε = Molar absorptivity (L/mol·cm)
 * - l = Path length (cm)
 * - c = Concentration (mol/L)
 */

export interface SpectroscopyConfig {
	sample: {
		name: string;
		formula: string;
		color: string;
		lambdaMax: number; // Wavelength of maximum absorption (nm)
		molarAbsorptivity: number; // ε (L/mol·cm)
	};
	pathLength: number; // cm (standard cuvette is 1 cm)
	concentrationRange: {
		min: number;
		max: number;
		step: number;
	};
	wavelengthRange: {
		min: number; // nm
		max: number;
	};
}

export interface SpectroscopyState {
	wavelength: number;
	concentration: number;
	absorbance: number;
	transmittance: number;
	intensity: number;
	sampleColor: string;
	measurements: SpectroscopyMeasurement[];
	calibrationCurve: CalibrationPoint[];
	isLampOn: boolean;
	isSampleInserted: boolean;
	isBlankSet: boolean;
	blankAbsorbance: number;
}

export interface SpectroscopyMeasurement {
	wavelength: number;
	concentration: number;
	absorbance: number;
	transmittance: number;
	timestamp: Date;
}

export interface CalibrationPoint {
	concentration: number;
	absorbance: number;
}

// Common samples with their spectroscopic properties
export const SAMPLE_LIBRARY = {
	'potassium-permanganate': {
		name: 'Potassium Permanganate',
		formula: 'KMnO₄',
		color: '#8B008B',
		lambdaMax: 525,
		molarAbsorptivity: 2455
	},
	'copper-sulfate': {
		name: 'Copper Sulfate',
		formula: 'CuSO₄',
		color: '#1E90FF',
		lambdaMax: 810,
		molarAbsorptivity: 12
	},
	'methyl-orange': {
		name: 'Methyl Orange',
		formula: 'C₁₄H₁₄N₃NaO₃S',
		color: '#FF8C00',
		lambdaMax: 464,
		molarAbsorptivity: 23000
	},
	'cobalt-chloride': {
		name: 'Cobalt Chloride',
		formula: 'CoCl₂',
		color: '#FF69B4',
		lambdaMax: 510,
		molarAbsorptivity: 4.8
	},
	'bromothymol-blue': {
		name: 'Bromothymol Blue',
		formula: 'C₂₇H₂₈Br₂O₅S',
		color: '#0047AB',
		lambdaMax: 616,
		molarAbsorptivity: 39550
	}
} as const;

/**
 * Calculate absorbance using Beer-Lambert law
 */
export function calculateAbsorbance(
	molarAbsorptivity: number,
	pathLength: number,
	concentration: number
): number {
	return molarAbsorptivity * pathLength * concentration;
}

/**
 * Convert absorbance to transmittance (%)
 * T = 10^(-A) × 100
 */
export function absorbanceToTransmittance(absorbance: number): number {
	return Math.pow(10, -absorbance) * 100;
}

/**
 * Convert transmittance (%) to absorbance
 * A = -log₁₀(T/100)
 */
export function transmittanceToAbsorbance(transmittance: number): number {
	return -Math.log10(transmittance / 100);
}

/**
 * Calculate absorbance at a specific wavelength
 * Uses a Gaussian function centered at lambdaMax
 */
export function calculateAbsorbanceAtWavelength(
	wavelength: number,
	lambdaMax: number,
	maxAbsorbance: number,
	bandWidth: number = 50
): number {
	// Gaussian distribution centered at lambdaMax
	const exponent = -Math.pow(wavelength - lambdaMax, 2) / (2 * Math.pow(bandWidth, 2));
	return maxAbsorbance * Math.exp(exponent);
}

/**
 * Get the color intensity based on concentration and absorbance
 */
export function getSampleColor(baseColor: string, concentration: number, maxConcentration: number): string {
	// Parse hex color
	const r = parseInt(baseColor.slice(1, 3), 16);
	const g = parseInt(baseColor.slice(3, 5), 16);
	const b = parseInt(baseColor.slice(5, 7), 16);

	// Intensity based on concentration
	const intensity = Math.min(concentration / maxConcentration, 1);
	const alpha = 0.2 + (intensity * 0.8);

	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Get wavelength color (visible spectrum)
 */
export function wavelengthToColor(wavelength: number): string {
	let r = 0, g = 0, b = 0;

	if (wavelength >= 380 && wavelength < 440) {
		r = -(wavelength - 440) / (440 - 380);
		b = 1;
	} else if (wavelength >= 440 && wavelength < 490) {
		g = (wavelength - 440) / (490 - 440);
		b = 1;
	} else if (wavelength >= 490 && wavelength < 510) {
		g = 1;
		b = -(wavelength - 510) / (510 - 490);
	} else if (wavelength >= 510 && wavelength < 580) {
		r = (wavelength - 510) / (580 - 510);
		g = 1;
	} else if (wavelength >= 580 && wavelength < 645) {
		r = 1;
		g = -(wavelength - 645) / (645 - 580);
	} else if (wavelength >= 645 && wavelength <= 780) {
		r = 1;
	}

	// Intensity falloff at edges
	let intensity = 1;
	if (wavelength >= 380 && wavelength < 420) {
		intensity = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
	} else if (wavelength >= 700 && wavelength <= 780) {
		intensity = 0.3 + 0.7 * (780 - wavelength) / (780 - 700);
	}

	r = Math.round(r * intensity * 255);
	g = Math.round(g * intensity * 255);
	b = Math.round(b * intensity * 255);

	return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Create initial spectroscopy state
 */
export function createInitialState(config: SpectroscopyConfig): SpectroscopyState {
	const initialConcentration = config.concentrationRange.min;
	const maxAbsorbance = calculateAbsorbance(
		config.sample.molarAbsorptivity,
		config.pathLength,
		initialConcentration
	);

	const absorbance = calculateAbsorbanceAtWavelength(
		config.sample.lambdaMax,
		config.sample.lambdaMax,
		maxAbsorbance
	);

	return {
		wavelength: config.sample.lambdaMax,
		concentration: initialConcentration,
		absorbance: 0,
		transmittance: 100,
		intensity: 100,
		sampleColor: getSampleColor(
			config.sample.color,
			initialConcentration,
			config.concentrationRange.max
		),
		measurements: [],
		calibrationCurve: [],
		isLampOn: false,
		isSampleInserted: false,
		isBlankSet: false,
		blankAbsorbance: 0
	};
}

/**
 * Set wavelength and recalculate values
 */
export function setWavelength(
	state: SpectroscopyState,
	wavelength: number,
	config: SpectroscopyConfig
): SpectroscopyState {
	const maxAbsorbance = calculateAbsorbance(
		config.sample.molarAbsorptivity,
		config.pathLength,
		state.concentration
	);

	const absorbance = state.isBlankSet && state.isSampleInserted
		? calculateAbsorbanceAtWavelength(wavelength, config.sample.lambdaMax, maxAbsorbance) - state.blankAbsorbance
		: 0;

	const transmittance = absorbanceToTransmittance(Math.max(0, absorbance));

	return {
		...state,
		wavelength,
		absorbance: Math.max(0, absorbance),
		transmittance,
		intensity: transmittance
	};
}

/**
 * Set concentration and recalculate values
 */
export function setConcentration(
	state: SpectroscopyState,
	concentration: number,
	config: SpectroscopyConfig
): SpectroscopyState {
	const maxAbsorbance = calculateAbsorbance(
		config.sample.molarAbsorptivity,
		config.pathLength,
		concentration
	);

	const absorbance = state.isBlankSet && state.isSampleInserted
		? calculateAbsorbanceAtWavelength(state.wavelength, config.sample.lambdaMax, maxAbsorbance) - state.blankAbsorbance
		: 0;

	const transmittance = absorbanceToTransmittance(Math.max(0, absorbance));

	return {
		...state,
		concentration,
		absorbance: Math.max(0, absorbance),
		transmittance,
		intensity: transmittance,
		sampleColor: getSampleColor(config.sample.color, concentration, config.concentrationRange.max)
	};
}

/**
 * Toggle lamp on/off
 */
export function toggleLamp(state: SpectroscopyState): SpectroscopyState {
	return {
		...state,
		isLampOn: !state.isLampOn
	};
}

/**
 * Insert/remove sample
 */
export function toggleSample(
	state: SpectroscopyState,
	config: SpectroscopyConfig
): SpectroscopyState {
	const isSampleInserted = !state.isSampleInserted;

	if (!isSampleInserted || !state.isBlankSet || !state.isLampOn) {
		return {
			...state,
			isSampleInserted,
			absorbance: 0,
			transmittance: 100,
			intensity: state.isLampOn ? 100 : 0
		};
	}

	const maxAbsorbance = calculateAbsorbance(
		config.sample.molarAbsorptivity,
		config.pathLength,
		state.concentration
	);

	const absorbance = calculateAbsorbanceAtWavelength(
		state.wavelength,
		config.sample.lambdaMax,
		maxAbsorbance
	) - state.blankAbsorbance;

	const transmittance = absorbanceToTransmittance(Math.max(0, absorbance));

	return {
		...state,
		isSampleInserted,
		absorbance: Math.max(0, absorbance),
		transmittance,
		intensity: transmittance
	};
}

/**
 * Set blank (zero absorbance reference)
 */
export function setBlank(state: SpectroscopyState): SpectroscopyState {
	return {
		...state,
		isBlankSet: true,
		blankAbsorbance: 0,
		absorbance: 0,
		transmittance: 100
	};
}

/**
 * Record a measurement
 */
export function recordMeasurement(state: SpectroscopyState): SpectroscopyState {
	if (!state.isLampOn || !state.isSampleInserted || !state.isBlankSet) {
		return state;
	}

	const measurement: SpectroscopyMeasurement = {
		wavelength: state.wavelength,
		concentration: state.concentration,
		absorbance: state.absorbance,
		transmittance: state.transmittance,
		timestamp: new Date()
	};

	return {
		...state,
		measurements: [...state.measurements, measurement]
	};
}

/**
 * Add point to calibration curve
 */
export function addCalibrationPoint(state: SpectroscopyState): SpectroscopyState {
	if (!state.isLampOn || !state.isSampleInserted || !state.isBlankSet) {
		return state;
	}

	const point: CalibrationPoint = {
		concentration: state.concentration,
		absorbance: state.absorbance
	};

	// Avoid duplicate concentrations
	const existingIndex = state.calibrationCurve.findIndex(
		p => Math.abs(p.concentration - point.concentration) < 0.0001
	);

	if (existingIndex >= 0) {
		const newCurve = [...state.calibrationCurve];
		newCurve[existingIndex] = point;
		return { ...state, calibrationCurve: newCurve };
	}

	return {
		...state,
		calibrationCurve: [...state.calibrationCurve, point].sort(
			(a, b) => a.concentration - b.concentration
		)
	};
}

/**
 * Calculate linear regression for calibration curve
 */
export function calculateCalibrationRegression(points: CalibrationPoint[]): {
	slope: number;
	intercept: number;
	rSquared: number;
} {
	if (points.length < 2) {
		return { slope: 0, intercept: 0, rSquared: 0 };
	}

	const n = points.length;
	const sumX = points.reduce((sum, p) => sum + p.concentration, 0);
	const sumY = points.reduce((sum, p) => sum + p.absorbance, 0);
	const sumXY = points.reduce((sum, p) => sum + p.concentration * p.absorbance, 0);
	const sumX2 = points.reduce((sum, p) => sum + p.concentration * p.concentration, 0);
	const sumY2 = points.reduce((sum, p) => sum + p.absorbance * p.absorbance, 0);

	const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
	const intercept = (sumY - slope * sumX) / n;

	// Calculate R²
	const meanY = sumY / n;
	const ssTotal = points.reduce((sum, p) => sum + Math.pow(p.absorbance - meanY, 2), 0);
	const ssResidual = points.reduce((sum, p) => {
		const predicted = slope * p.concentration + intercept;
		return sum + Math.pow(p.absorbance - predicted, 2);
	}, 0);

	const rSquared = ssTotal > 0 ? 1 - (ssResidual / ssTotal) : 0;

	return { slope, intercept, rSquared };
}

/**
 * Generate spectrum data for plotting
 */
export function generateSpectrum(
	config: SpectroscopyConfig,
	concentration: number
): { wavelength: number; absorbance: number }[] {
	const spectrum: { wavelength: number; absorbance: number }[] = [];
	const maxAbsorbance = calculateAbsorbance(
		config.sample.molarAbsorptivity,
		config.pathLength,
		concentration
	);

	for (let wl = config.wavelengthRange.min; wl <= config.wavelengthRange.max; wl += 5) {
		const absorbance = calculateAbsorbanceAtWavelength(wl, config.sample.lambdaMax, maxAbsorbance);
		spectrum.push({ wavelength: wl, absorbance });
	}

	return spectrum;
}

/**
 * Analyze spectroscopy results
 */
export function analyzeResults(state: SpectroscopyState, config: SpectroscopyConfig): {
	experimentalMolarAbsorptivity: number;
	theoreticalMolarAbsorptivity: number;
	percentError: number;
	feedback: string;
} {
	const regression = calculateCalibrationRegression(state.calibrationCurve);

	// Experimental ε = slope / path length
	const experimentalMolarAbsorptivity = regression.slope / config.pathLength;
	const theoreticalMolarAbsorptivity = config.sample.molarAbsorptivity;

	const percentError = Math.abs(
		(experimentalMolarAbsorptivity - theoreticalMolarAbsorptivity) / theoreticalMolarAbsorptivity
	) * 100;

	let feedback: string;
	if (state.calibrationCurve.length < 3) {
		feedback = 'You need at least 3 data points for a reliable calibration curve. Add more concentration points.';
	} else if (regression.rSquared >= 0.99) {
		feedback = `Excellent work! Your R² of ${regression.rSquared.toFixed(4)} indicates a very linear relationship, confirming Beer-Lambert law.`;
	} else if (regression.rSquared >= 0.95) {
		feedback = `Good calibration curve with R² = ${regression.rSquared.toFixed(4)}. Minor deviations may be due to instrumental factors.`;
	} else if (regression.rSquared >= 0.90) {
		feedback = `Fair results with R² = ${regression.rSquared.toFixed(4)}. Consider checking your blank calibration and sample preparation.`;
	} else {
		feedback = `Your R² of ${regression.rSquared.toFixed(4)} suggests significant non-linearity. This may indicate concentration is too high or instrumental issues.`;
	}

	return {
		experimentalMolarAbsorptivity,
		theoreticalMolarAbsorptivity,
		percentError,
		feedback
	};
}
