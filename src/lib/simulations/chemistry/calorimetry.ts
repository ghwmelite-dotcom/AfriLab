/**
 * Calorimetry & Thermochemistry Simulation Engine
 *
 * Simulates calorimetric measurements of heat of reaction.
 * q = mc*deltaT (for solution calorimetry)
 * Hess's Law: deltaH_rxn = sum of deltaH values for individual steps
 *
 * Specific heat of water: 4.184 J/(g*C)
 * Density of dilute aqueous solutions: ~1.00 g/mL
 */

export interface CalorimetryConfig {
	calorimeterType: 'coffee-cup' | 'bomb';
	defaultVolume: number; // mL of solution
	ambientTemperature: number; // degC
}

export interface CalorimetryState {
	selectedReaction: ReactionType | null;
	reactions: ReactionRecord[];
	calorimeterVolume: number; // mL
	initialTemperature: number; // degC
	finalTemperature: number; // degC
	currentTemperature: number; // degC
	isReacting: boolean;
	reactionComplete: boolean;
	elapsedTime: number; // seconds
	temperatureHistory: TemperaturePoint[];
	heatReleased: number; // J
	deltaH: number; // kJ/mol
	specificHeatMeasurements: SpecificHeatMeasurement[];
	hessLawVerified: boolean;
	measurements: CalorimetryMeasurement[];
}

export type ReactionType =
	| 'hcl-naoh'
	| 'nh4no3-dissolve'
	| 'cacl2-dissolve'
	| 'mgoh2-hcl'
	| 'mg-hcl'
	| 'mgo-hcl';

export interface ReactionData {
	id: ReactionType;
	name: string;
	equation: string;
	type: 'exothermic' | 'endothermic';
	deltaH: number; // kJ/mol (negative = exothermic)
	moles: number; // moles of limiting reagent per experiment
	reagent1: string;
	reagent2: string;
	temperatureChange: number; // expected deltaT in degC
}

export interface ReactionRecord {
	reactionId: ReactionType;
	measuredDeltaH: number; // kJ/mol
	theoreticalDeltaH: number;
	percentError: number;
	deltaT: number;
	timestamp: Date;
}

export interface TemperaturePoint {
	time: number;
	temperature: number;
}

export interface SpecificHeatMeasurement {
	substance: string;
	mass: number;
	deltaT: number;
	heatAdded: number;
	calculatedSpecificHeat: number;
	timestamp: Date;
}

export interface CalorimetryMeasurement {
	type: string;
	value: number;
	unit: string;
	label: string;
	timestamp: Date;
}

// Reaction library with thermochemical data
export const REACTION_LIBRARY: Record<ReactionType, ReactionData> = {
	'hcl-naoh': {
		id: 'hcl-naoh',
		name: 'Neutralization of HCl with NaOH',
		equation: 'HCl(aq) + NaOH(aq) -> NaCl(aq) + H\u2082O(l)',
		type: 'exothermic',
		deltaH: -57.1,
		moles: 0.05,
		reagent1: '50 mL of 1.0 M HCl',
		reagent2: '50 mL of 1.0 M NaOH',
		temperatureChange: 6.8
	},
	'nh4no3-dissolve': {
		id: 'nh4no3-dissolve',
		name: 'Dissolving Ammonium Nitrate',
		equation: 'NH\u2084NO\u2083(s) -> NH\u2084\u207A(aq) + NO\u2083\u207B(aq)',
		type: 'endothermic',
		deltaH: 25.7,
		moles: 0.0625,
		reagent1: '5.0 g NH\u2084NO\u2083',
		reagent2: '50 mL H\u2082O',
		temperatureChange: -7.7
	},
	'cacl2-dissolve': {
		id: 'cacl2-dissolve',
		name: 'Dissolving Calcium Chloride',
		equation: 'CaCl\u2082(s) -> Ca\u00B2\u207A(aq) + 2Cl\u207B(aq)',
		type: 'exothermic',
		deltaH: -81.3,
		moles: 0.045,
		reagent1: '5.0 g CaCl\u2082',
		reagent2: '50 mL H\u2082O',
		temperatureChange: 17.5
	},
	'mgoh2-hcl': {
		id: 'mgoh2-hcl',
		name: 'Mg(OH)\u2082 + HCl (Hess Step 1)',
		equation: 'Mg(OH)\u2082(s) + 2HCl(aq) -> MgCl\u2082(aq) + 2H\u2082O(l)',
		type: 'exothermic',
		deltaH: -96.0,
		moles: 0.025,
		reagent1: '1.46 g Mg(OH)\u2082',
		reagent2: '50 mL of 1.0 M HCl',
		temperatureChange: 11.5
	},
	'mg-hcl': {
		id: 'mg-hcl',
		name: 'Mg + HCl (Hess Step 2)',
		equation: 'Mg(s) + 2HCl(aq) -> MgCl\u2082(aq) + H\u2082(g)',
		type: 'exothermic',
		deltaH: -462.0,
		moles: 0.025,
		reagent1: '0.60 g Mg ribbon',
		reagent2: '50 mL of 1.0 M HCl',
		temperatureChange: 55.3
	},
	'mgo-hcl': {
		id: 'mgo-hcl',
		name: 'MgO + HCl (Hess Step 3)',
		equation: 'MgO(s) + 2HCl(aq) -> MgCl\u2082(aq) + H\u2082O(l)',
		type: 'exothermic',
		deltaH: -145.6,
		moles: 0.025,
		reagent1: '1.01 g MgO',
		reagent2: '50 mL of 1.0 M HCl',
		temperatureChange: 17.4
	}
};

// Hess's Law relationship:
// Mg(s) + 1/2 O2(g) -> MgO(s)
// Using: Mg + 2HCl -> MgCl2 + H2  (deltaH1)
//        MgO + 2HCl -> MgCl2 + H2O (deltaH2)
//        H2 + 1/2 O2 -> H2O         (deltaH3 = -285.8 kJ/mol)
// deltaH_formation = deltaH1 - deltaH2 + deltaH3 (should be ~-601.6 kJ/mol)

const SPECIFIC_HEAT_WATER = 4.184; // J/(g*C)
const SOLUTION_DENSITY = 1.00; // g/mL

/**
 * Create initial calorimetry state
 */
export function createInitialState(config: CalorimetryConfig): CalorimetryState {
	return {
		selectedReaction: null,
		reactions: [],
		calorimeterVolume: config.defaultVolume,
		initialTemperature: config.ambientTemperature,
		finalTemperature: config.ambientTemperature,
		currentTemperature: config.ambientTemperature,
		isReacting: false,
		reactionComplete: false,
		elapsedTime: 0,
		temperatureHistory: [{ time: 0, temperature: config.ambientTemperature }],
		heatReleased: 0,
		deltaH: 0,
		specificHeatMeasurements: [],
		hessLawVerified: false,
		measurements: []
	};
}

/**
 * Select a reaction to perform
 */
export function selectReaction(
	state: CalorimetryState,
	reactionType: ReactionType
): CalorimetryState {
	if (state.isReacting) return state;

	const rxn = REACTION_LIBRARY[reactionType];

	return {
		...state,
		selectedReaction: reactionType,
		initialTemperature: state.currentTemperature,
		finalTemperature: state.currentTemperature,
		reactionComplete: false,
		elapsedTime: 0,
		temperatureHistory: [{ time: 0, temperature: state.currentTemperature }],
		heatReleased: 0,
		deltaH: 0,
		calorimeterVolume: 100 // 50 mL + 50 mL typically
	};
}

/**
 * Set the calorimeter volume (total solution)
 */
export function setCalorimeterVolume(
	state: CalorimetryState,
	volume: number
): CalorimetryState {
	if (state.isReacting) return state;

	return {
		...state,
		calorimeterVolume: Math.max(25, Math.min(250, volume))
	};
}

/**
 * Record initial temperature
 */
export function recordInitialTemperature(
	state: CalorimetryState,
	temperature: number
): CalorimetryState {
	return {
		...state,
		initialTemperature: temperature,
		currentTemperature: temperature,
		temperatureHistory: [{ time: 0, temperature }],
		measurements: [...state.measurements, {
			type: 'temperature',
			value: temperature,
			unit: '\u00B0C',
			label: 'Initial temperature',
			timestamp: new Date()
		}]
	};
}

/**
 * Start the reaction
 */
export function startReaction(state: CalorimetryState): CalorimetryState {
	if (!state.selectedReaction || state.isReacting || state.reactionComplete) return state;

	return {
		...state,
		isReacting: true,
		elapsedTime: 0
	};
}

/**
 * Advance time during reaction
 */
export function advanceReactionTime(
	state: CalorimetryState,
	deltaTime: number
): CalorimetryState {
	if (!state.isReacting || !state.selectedReaction) return state;

	const rxn = REACTION_LIBRARY[state.selectedReaction];
	const newTime = state.elapsedTime + deltaTime;

	// Simulate temperature change over ~30 seconds
	const reactionDuration = 30; // seconds for reaction to complete
	const progress = Math.min(newTime / reactionDuration, 1);

	// Temperature change follows an exponential approach to final value
	// Add small noise for realism
	const noise = (Math.random() - 0.5) * 0.1;
	const tempChange = rxn.temperatureChange * (1 - Math.exp(-3 * progress));
	const newTemp = state.initialTemperature + tempChange + noise;

	const isComplete = progress >= 1;

	const newHistory = [...state.temperatureHistory, { time: newTime, temperature: newTemp }];

	return {
		...state,
		elapsedTime: newTime,
		currentTemperature: parseFloat(newTemp.toFixed(2)),
		finalTemperature: isComplete ? parseFloat((state.initialTemperature + rxn.temperatureChange + noise).toFixed(2)) : state.finalTemperature,
		temperatureHistory: newHistory,
		isReacting: !isComplete,
		reactionComplete: isComplete
	};
}

/**
 * Calculate heat and enthalpy after reaction completes
 */
export function calculateResults(state: CalorimetryState): CalorimetryState {
	if (!state.reactionComplete || !state.selectedReaction) return state;

	const rxn = REACTION_LIBRARY[state.selectedReaction];
	const deltaT = state.finalTemperature - state.initialTemperature;
	const mass = state.calorimeterVolume * SOLUTION_DENSITY; // grams
	const q = mass * SPECIFIC_HEAT_WATER * Math.abs(deltaT); // Joules

	// Calculate deltaH per mole of limiting reagent
	const sign = rxn.type === 'exothermic' ? -1 : 1;
	const deltaH = (sign * q) / (rxn.moles * 1000); // kJ/mol

	const percentError = Math.abs((deltaH - rxn.deltaH) / rxn.deltaH) * 100;

	const record: ReactionRecord = {
		reactionId: state.selectedReaction,
		measuredDeltaH: parseFloat(deltaH.toFixed(1)),
		theoreticalDeltaH: rxn.deltaH,
		percentError: parseFloat(percentError.toFixed(1)),
		deltaT: parseFloat(deltaT.toFixed(2)),
		timestamp: new Date()
	};

	// Check Hess's Law verification
	const allReactions = [...state.reactions, record];
	const hessVerified = checkHessLaw(allReactions);

	return {
		...state,
		heatReleased: parseFloat(q.toFixed(1)),
		deltaH: parseFloat(deltaH.toFixed(1)),
		reactions: allReactions,
		hessLawVerified: hessVerified,
		measurements: [...state.measurements, {
			type: 'heat',
			value: parseFloat(q.toFixed(1)),
			unit: 'J',
			label: `Heat (${rxn.name})`,
			timestamp: new Date()
		}, {
			type: 'enthalpy',
			value: parseFloat(deltaH.toFixed(1)),
			unit: 'kJ/mol',
			label: `deltaH (${rxn.name})`,
			timestamp: new Date()
		}, {
			type: 'temperature',
			value: parseFloat(deltaT.toFixed(2)),
			unit: '\u00B0C',
			label: `deltaT (${rxn.name})`,
			timestamp: new Date()
		}]
	};
}

/**
 * Reset for a new reaction (keep previous measurements)
 */
export function resetForNewReaction(state: CalorimetryState): CalorimetryState {
	return {
		...state,
		selectedReaction: null,
		initialTemperature: 25.0,
		finalTemperature: 25.0,
		currentTemperature: 25.0,
		isReacting: false,
		reactionComplete: false,
		elapsedTime: 0,
		temperatureHistory: [{ time: 0, temperature: 25.0 }],
		heatReleased: 0,
		deltaH: 0
	};
}

/**
 * Measure specific heat of a metal
 */
export function measureSpecificHeat(
	state: CalorimetryState,
	substance: string,
	metalMass: number,
	metalInitialTemp: number,
	waterMass: number,
	waterInitialTemp: number,
	finalTemp: number
): CalorimetryState {
	// q_metal = -q_water
	// m_metal * c_metal * (T_final - T_metal_initial) = -m_water * c_water * (T_final - T_water_initial)
	const qWater = waterMass * SPECIFIC_HEAT_WATER * (finalTemp - waterInitialTemp);
	const metalDeltaT = finalTemp - metalInitialTemp;
	const specificHeat = metalDeltaT !== 0
		? Math.abs(qWater) / (metalMass * Math.abs(metalDeltaT))
		: 0;

	const measurement: SpecificHeatMeasurement = {
		substance,
		mass: metalMass,
		deltaT: metalDeltaT,
		heatAdded: Math.abs(qWater),
		calculatedSpecificHeat: parseFloat(specificHeat.toFixed(3)),
		timestamp: new Date()
	};

	return {
		...state,
		specificHeatMeasurements: [...state.specificHeatMeasurements, measurement],
		measurements: [...state.measurements, {
			type: 'specific-heat',
			value: parseFloat(specificHeat.toFixed(3)),
			unit: 'J/(g*C)',
			label: `Specific heat of ${substance}`,
			timestamp: new Date()
		}]
	};
}

/**
 * Check if Hess's Law is verified
 * Using Mg + HCl and MgO + HCl reactions:
 * deltaH(Mg->MgO) = deltaH(Mg+HCl) - deltaH(MgO+HCl) + deltaH(H2O formation)
 */
function checkHessLaw(reactions: ReactionRecord[]): boolean {
	const mgHcl = reactions.find(r => r.reactionId === 'mg-hcl');
	const mgoHcl = reactions.find(r => r.reactionId === 'mgo-hcl');

	if (!mgHcl || !mgoHcl) return false;

	// If both have been measured, Hess's Law is being tested
	return true;
}

/**
 * Calculate Hess's Law result
 */
export function calculateHessLaw(state: CalorimetryState): {
	step1: number;
	step2: number;
	waterFormation: number;
	calculated: number;
	literature: number;
	percentError: number;
} | null {
	const mgHcl = state.reactions.find(r => r.reactionId === 'mg-hcl');
	const mgoHcl = state.reactions.find(r => r.reactionId === 'mgo-hcl');

	if (!mgHcl || !mgoHcl) return null;

	const waterFormation = -285.8; // kJ/mol
	const calculated = mgHcl.measuredDeltaH - mgoHcl.measuredDeltaH + waterFormation;
	const literature = -601.6; // kJ/mol for MgO formation

	return {
		step1: mgHcl.measuredDeltaH,
		step2: mgoHcl.measuredDeltaH,
		waterFormation,
		calculated: parseFloat(calculated.toFixed(1)),
		literature,
		percentError: parseFloat((Math.abs((calculated - literature) / literature) * 100).toFixed(1))
	};
}

/**
 * Analyze calorimetry experiment
 */
export function analyzeCalorimetry(state: CalorimetryState): {
	reactionsCompleted: number;
	averagePercentError: number;
	hessLawVerified: boolean;
	hessLawResult: ReturnType<typeof calculateHessLaw>;
	score: number;
	feedback: string;
} {
	const reactionsCompleted = state.reactions.length;

	const avgError = reactionsCompleted > 0
		? state.reactions.reduce((sum, r) => sum + r.percentError, 0) / reactionsCompleted
		: 100;

	const hessLawResult = calculateHessLaw(state);
	const hessLawVerified = state.hessLawVerified;

	// Score calculation
	let score = 0;

	// Reactions completed (40 pts)
	score += Math.min(40, reactionsCompleted * 10);

	// Accuracy (30 pts)
	if (avgError < 5) score += 30;
	else if (avgError < 10) score += 22;
	else if (avgError < 20) score += 15;
	else if (avgError < 30) score += 8;

	// Hess's Law (20 pts)
	if (hessLawVerified) {
		score += 20;
	}

	// Specific heat measurements (10 pts)
	if (state.specificHeatMeasurements.length > 0) {
		score += 10;
	}

	let feedback: string;
	if (score >= 90) {
		feedback = 'Excellent calorimetry work! You demonstrated strong understanding of thermochemistry and Hess\'s Law.';
	} else if (score >= 75) {
		feedback = 'Good job! Try completing more reactions and verifying Hess\'s Law for a perfect score.';
	} else if (score >= 60) {
		feedback = 'Fair progress. Review your calculations and try the Mg/MgO reactions to verify Hess\'s Law.';
	} else {
		feedback = 'Keep practicing! Run multiple reactions and carefully measure temperature changes for accurate results.';
	}

	return {
		reactionsCompleted,
		averagePercentError: parseFloat(avgError.toFixed(1)),
		hessLawVerified,
		hessLawResult,
		score: Math.min(100, score),
		feedback
	};
}

/**
 * Quiz questions for calorimetry
 */
export const quizQuestions = [
	{
		id: 'q1',
		question: 'In a coffee-cup calorimeter, if the temperature increases, the reaction is:',
		options: ['Endothermic', 'Exothermic', 'Neither - temperature always increases', 'It depends on the solvent'],
		correctIndex: 1,
		explanation: 'An exothermic reaction releases heat to the surroundings (the solution), causing the temperature to increase. Endothermic reactions absorb heat, causing the temperature to decrease.'
	},
	{
		id: 'q2',
		question: 'The formula q = mc*deltaT calculates:',
		options: [
			'The molar mass of the product',
			'The heat absorbed or released by the solution',
			'The concentration of the reactant',
			'The rate of the reaction'
		],
		correctIndex: 1,
		explanation: 'q = mc*deltaT relates the heat (q) to the mass (m), specific heat capacity (c), and temperature change (deltaT) of the solution. This is the fundamental calorimetry equation.'
	},
	{
		id: 'q3',
		question: 'Hess\'s Law states that:',
		options: [
			'All reactions are exothermic',
			'The enthalpy change of a reaction depends on the pathway taken',
			'The enthalpy change of a reaction is independent of the pathway',
			'Enthalpy cannot be measured directly'
		],
		correctIndex: 2,
		explanation: 'Hess\'s Law states that the total enthalpy change for a reaction is the same regardless of whether it occurs in one step or multiple steps. This is because enthalpy is a state function.'
	},
	{
		id: 'q4',
		question: 'Why is a coffee-cup calorimeter insulated?',
		options: [
			'To prevent the reaction from occurring',
			'To minimize heat exchange with the environment',
			'To increase the reaction rate',
			'To keep the solutions at boiling point'
		],
		correctIndex: 1,
		explanation: 'Insulation minimizes heat loss to (or gain from) the environment, ensuring that the heat measured is primarily from the reaction. This makes q_reaction approximately equal to q_solution.'
	}
];
