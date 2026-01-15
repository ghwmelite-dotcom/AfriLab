import type { TitrationState, TitrationMeasurement } from '$types';
import { getIndicatorColor } from '$lib/utils/helpers';

export interface TitrationConfig {
	acid: {
		name: string;
		formula: string;
		concentration: number; // mol/L
		volume: number; // mL
	};
	base: {
		name: string;
		formula: string;
		concentration: number; // mol/L
		volume: number; // mL (in burette)
	};
	indicator: 'phenolphthalein' | 'methyl-orange' | 'bromothymol-blue';
}

export function createInitialState(config: TitrationConfig): TitrationState {
	// Calculate initial pH of acid solution
	const initialPH = calculatePH(config.acid.concentration, 0, config.acid.volume);

	return {
		buretteVolume: config.base.volume,
		buretteInitialVolume: config.base.volume,
		flaskVolume: config.acid.volume,
		flaskConcentration: config.acid.concentration,
		titrantConcentration: config.base.concentration,
		pH: initialPH,
		indicatorColor: getIndicatorColor(initialPH, config.indicator),
		isPouring: false,
		dropCount: 0,
		measurements: [],
		endpointReached: false
	};
}

/**
 * Calculate pH during titration
 * For strong acid + strong base: HCl + NaOH -> NaCl + H2O
 */
export function calculatePH(
	acidConcentration: number,
	baseVolumeAdded: number,
	acidVolume: number,
	baseConcentration: number = 0.1
): number {
	const totalVolume = acidVolume + baseVolumeAdded;

	// Moles of acid and base
	const molesAcid = acidConcentration * (acidVolume / 1000);
	const molesBase = baseConcentration * (baseVolumeAdded / 1000);

	// Net moles
	const netMoles = molesAcid - molesBase;

	if (Math.abs(netMoles) < 0.0001) {
		// At equivalence point
		return 7.0;
	} else if (netMoles > 0) {
		// Excess acid
		const hConcentration = netMoles / (totalVolume / 1000);
		return -Math.log10(hConcentration);
	} else {
		// Excess base
		const ohConcentration = Math.abs(netMoles) / (totalVolume / 1000);
		const pOH = -Math.log10(ohConcentration);
		return 14 - pOH;
	}
}

/**
 * Calculate expected equivalence point volume
 */
export function calculateEquivalenceVolume(
	acidConcentration: number,
	acidVolume: number,
	baseConcentration: number
): number {
	// At equivalence: moles acid = moles base
	// Ca * Va = Cb * Vb
	// Vb = (Ca * Va) / Cb
	return (acidConcentration * acidVolume) / baseConcentration;
}

/**
 * Add a drop of titrant and update state
 */
export function addDrop(
	state: TitrationState,
	dropVolume: number = 0.05, // mL per drop
	indicator: 'phenolphthalein' | 'methyl-orange' | 'bromothymol-blue' = 'phenolphthalein'
): TitrationState {
	if (state.buretteVolume <= 0) {
		return state;
	}

	const volumeToAdd = Math.min(dropVolume, state.buretteVolume);
	const newBuretteVolume = state.buretteVolume - volumeToAdd;
	const volumeAdded = state.buretteInitialVolume - newBuretteVolume;

	const newPH = calculatePH(
		state.flaskConcentration,
		volumeAdded,
		state.flaskVolume,
		state.titrantConcentration
	);

	const newColor = getIndicatorColor(newPH, indicator);

	// Check if we just passed the endpoint
	const endpointReached = !state.endpointReached && newPH >= 7 && state.pH < 7;

	const measurement: TitrationMeasurement = {
		volumeAdded,
		pH: newPH,
		color: newColor,
		timestamp: new Date()
	};

	return {
		...state,
		buretteVolume: newBuretteVolume,
		pH: newPH,
		indicatorColor: newColor,
		dropCount: state.dropCount + 1,
		measurements: [...state.measurements, measurement],
		endpointReached: state.endpointReached || endpointReached
	};
}

/**
 * Pour continuously (multiple drops)
 */
export function pour(
	state: TitrationState,
	duration: number, // seconds
	flowRate: number = 0.5, // mL/s
	indicator: 'phenolphthalein' | 'methyl-orange' | 'bromothymol-blue' = 'phenolphthalein'
): TitrationState {
	const volumeToAdd = Math.min(duration * flowRate, state.buretteVolume);
	const drops = Math.ceil(volumeToAdd / 0.05);

	let currentState = state;
	for (let i = 0; i < drops; i++) {
		currentState = addDrop(currentState, 0.05, indicator);
	}

	return currentState;
}

/**
 * Get titration analysis results
 */
export function analyzeTitration(state: TitrationState): {
	volumeUsed: number;
	equivalenceVolume: number;
	accuracy: number;
	isComplete: boolean;
	feedback: string;
} {
	const volumeUsed = state.buretteInitialVolume - state.buretteVolume;
	const equivalenceVolume = calculateEquivalenceVolume(
		state.flaskConcentration,
		state.flaskVolume,
		state.titrantConcentration
	);

	// Calculate accuracy (how close to equivalence point)
	const accuracy = Math.max(0, 100 - Math.abs(volumeUsed - equivalenceVolume) * 10);

	const isComplete = state.endpointReached;

	let feedback: string;
	if (!isComplete) {
		feedback = 'Continue adding titrant until you observe the endpoint color change.';
	} else if (accuracy >= 95) {
		feedback = 'Excellent work! Your titration is highly accurate.';
	} else if (accuracy >= 85) {
		feedback = 'Good job! Your result is within acceptable range.';
	} else if (accuracy >= 70) {
		feedback = 'Fair attempt. Try to stop closer to the endpoint next time.';
	} else {
		feedback = 'You may have overshot the endpoint. Practice identifying the color change.';
	}

	return {
		volumeUsed,
		equivalenceVolume,
		accuracy,
		isComplete,
		feedback
	};
}

/**
 * Generate pH curve data for plotting
 */
export function generatePHCurveData(
	acidConcentration: number,
	acidVolume: number,
	baseConcentration: number,
	maxBaseVolume: number,
	points: number = 100
): { volume: number; pH: number }[] {
	const data: { volume: number; pH: number }[] = [];
	const step = maxBaseVolume / points;

	for (let v = 0; v <= maxBaseVolume; v += step) {
		data.push({
			volume: v,
			pH: calculatePH(acidConcentration, v, acidVolume, baseConcentration)
		});
	}

	return data;
}
