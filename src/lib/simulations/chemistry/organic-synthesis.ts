/**
 * Organic Synthesis: Aspirin Simulation Engine
 *
 * Simulates the synthesis of aspirin (acetylsalicylic acid) from
 * salicylic acid and acetic anhydride.
 *
 * Reaction: C7H6O3 + C4H6O3 -> C9H8O4 + CH3COOH
 * Salicylic acid + Acetic anhydride -> Aspirin + Acetic acid
 *
 * Molar masses:
 *   Salicylic acid: 138.12 g/mol
 *   Acetic anhydride: 102.09 g/mol
 *   Aspirin: 180.16 g/mol
 *   Acetic acid: 60.05 g/mol
 */

export interface OrganicSynthesisConfig {
	salicylicAcidMass: number; // grams
	aceticAnhydrideVolume: number; // mL
	aceticAnhydrideDensity: number; // g/mL
	phosphoricAcidDrops: number; // catalyst
	theoreticalMeltingPoint: number; // degC for pure aspirin
}

export interface OrganicSynthesisState {
	step: SynthesisStep;
	salicylicAcidMass: number; // g weighed
	aceticAnhydrideVolume: number; // mL added
	catalystAdded: boolean;
	reactionTemperature: number; // degC
	heatingTime: number; // seconds
	reactionComplete: boolean;
	crystalsFormed: boolean;
	filtrationDone: boolean;
	washDone: boolean;
	recrystallizationDone: boolean;
	dryingDone: boolean;
	productMass: number; // g of crude product
	purifiedMass: number; // g after recrystallization
	meltingPointStart: number; // degC observed
	meltingPointEnd: number; // degC observed
	meltingPointTested: boolean;
	ferricChlorideTest: 'not-done' | 'positive' | 'negative';
	percentYield: number;
	purityAssessment: string;
	actions: SynthesisAction[];
	measurements: SynthesisMeasurement[];
}

export type SynthesisStep =
	| 'weigh-reagents'
	| 'mix-reagents'
	| 'heat-reaction'
	| 'cool-and-crystallize'
	| 'filter'
	| 'wash'
	| 'recrystallize'
	| 'dry'
	| 'melting-point'
	| 'purity-test'
	| 'complete';

export interface SynthesisAction {
	step: SynthesisStep;
	description: string;
	timestamp: Date;
}

export interface SynthesisMeasurement {
	type: string;
	value: number;
	unit: string;
	label: string;
	timestamp: Date;
}

// Constants
const MOLAR_MASS = {
	salicylicAcid: 138.12,
	aceticAnhydride: 102.09,
	aspirin: 180.16,
	aceticAcid: 60.05
} as const;

const PURE_ASPIRIN_MP = 135; // degC
const ACETIC_ANHYDRIDE_DENSITY = 1.08; // g/mL

/**
 * Create initial synthesis state
 */
export function createInitialState(_config: OrganicSynthesisConfig): OrganicSynthesisState {
	return {
		step: 'weigh-reagents',
		salicylicAcidMass: 0,
		aceticAnhydrideVolume: 0,
		catalystAdded: false,
		reactionTemperature: 25,
		heatingTime: 0,
		reactionComplete: false,
		crystalsFormed: false,
		filtrationDone: false,
		washDone: false,
		recrystallizationDone: false,
		dryingDone: false,
		productMass: 0,
		purifiedMass: 0,
		meltingPointStart: 0,
		meltingPointEnd: 0,
		meltingPointTested: false,
		ferricChlorideTest: 'not-done',
		percentYield: 0,
		purityAssessment: '',
		actions: [],
		measurements: []
	};
}

/**
 * Weigh salicylic acid
 */
export function weighSalicylicAcid(
	state: OrganicSynthesisState,
	mass: number
): OrganicSynthesisState {
	if (state.step !== 'weigh-reagents') return state;

	// Clamp to reasonable range
	const clampedMass = Math.max(0.5, Math.min(5.0, mass));

	return {
		...state,
		salicylicAcidMass: clampedMass,
		actions: [...state.actions, {
			step: 'weigh-reagents',
			description: `Weighed ${clampedMass.toFixed(2)} g salicylic acid`,
			timestamp: new Date()
		}],
		measurements: [...state.measurements, {
			type: 'mass',
			value: clampedMass,
			unit: 'g',
			label: 'Salicylic acid mass',
			timestamp: new Date()
		}]
	};
}

/**
 * Add acetic anhydride
 */
export function addAceticAnhydride(
	state: OrganicSynthesisState,
	volume: number
): OrganicSynthesisState {
	if (state.step !== 'weigh-reagents' && state.step !== 'mix-reagents') return state;

	const clampedVolume = Math.max(1.0, Math.min(10.0, volume));

	return {
		...state,
		aceticAnhydrideVolume: clampedVolume,
		step: state.salicylicAcidMass > 0 ? 'mix-reagents' : state.step,
		actions: [...state.actions, {
			step: 'mix-reagents',
			description: `Added ${clampedVolume.toFixed(1)} mL acetic anhydride`,
			timestamp: new Date()
		}],
		measurements: [...state.measurements, {
			type: 'volume',
			value: clampedVolume,
			unit: 'mL',
			label: 'Acetic anhydride volume',
			timestamp: new Date()
		}]
	};
}

/**
 * Add catalyst (phosphoric acid)
 */
export function addCatalyst(state: OrganicSynthesisState): OrganicSynthesisState {
	if (state.step !== 'mix-reagents') return state;

	return {
		...state,
		catalystAdded: true,
		actions: [...state.actions, {
			step: 'mix-reagents',
			description: 'Added 5 drops of phosphoric acid catalyst',
			timestamp: new Date()
		}]
	};
}

/**
 * Start mixing reagents and proceed to heating
 */
export function startMixing(state: OrganicSynthesisState): OrganicSynthesisState {
	if (state.step !== 'mix-reagents' || state.salicylicAcidMass <= 0 || state.aceticAnhydrideVolume <= 0) {
		return state;
	}

	return {
		...state,
		step: 'heat-reaction',
		actions: [...state.actions, {
			step: 'mix-reagents',
			description: 'Mixed reagents in flask, ready for heating',
			timestamp: new Date()
		}]
	};
}

/**
 * Heat the reaction mixture
 */
export function heatReaction(
	state: OrganicSynthesisState,
	temperature: number,
	timeIncrement: number
): OrganicSynthesisState {
	if (state.step !== 'heat-reaction') return state;

	const newTemp = Math.max(25, Math.min(100, temperature));
	const newTime = state.heatingTime + timeIncrement;

	// Reaction completes after heating at 75-85 degC for ~15 minutes (900s simulated)
	const isInRange = newTemp >= 70 && newTemp <= 90;
	const effectiveTime = isInRange ? newTime : state.heatingTime;
	const reactionComplete = effectiveTime >= 900; // 15 min at proper temp

	return {
		...state,
		reactionTemperature: newTemp,
		heatingTime: newTime,
		reactionComplete,
		actions: [...state.actions, {
			step: 'heat-reaction',
			description: `Heating at ${newTemp.toFixed(0)} C for ${Math.round(newTime / 60)} min`,
			timestamp: new Date()
		}]
	};
}

/**
 * Proceed to cooling and crystallization
 */
export function coolAndCrystallize(state: OrganicSynthesisState): OrganicSynthesisState {
	if (state.step !== 'heat-reaction' || !state.reactionComplete) return state;

	// Calculate product mass based on stoichiometry
	const molesSA = state.salicylicAcidMass / MOLAR_MASS.salicylicAcid;
	const molesAA = (state.aceticAnhydrideVolume * ACETIC_ANHYDRIDE_DENSITY) / MOLAR_MASS.aceticAnhydride;

	// Limiting reagent determines yield
	const limitingMoles = Math.min(molesSA, molesAA);
	const theoreticalYield = limitingMoles * MOLAR_MASS.aspirin;

	// Practical yield: 70-90% depending on technique
	// Add some randomness to simulate real lab conditions
	const yieldFraction = 0.75 + Math.random() * 0.15;
	const crudeProduct = theoreticalYield * yieldFraction;

	return {
		...state,
		step: 'cool-and-crystallize',
		reactionTemperature: 25,
		crystalsFormed: true,
		productMass: parseFloat(crudeProduct.toFixed(3)),
		actions: [...state.actions, {
			step: 'cool-and-crystallize',
			description: 'Cooled reaction mixture, added cold water, crystals forming',
			timestamp: new Date()
		}]
	};
}

/**
 * Filter the crystals (vacuum filtration)
 */
export function filterProduct(state: OrganicSynthesisState): OrganicSynthesisState {
	if (state.step !== 'cool-and-crystallize' || !state.crystalsFormed) return state;

	return {
		...state,
		step: 'filter',
		filtrationDone: true,
		actions: [...state.actions, {
			step: 'filter',
			description: 'Vacuum filtration of crude aspirin crystals',
			timestamp: new Date()
		}],
		measurements: [...state.measurements, {
			type: 'mass',
			value: state.productMass,
			unit: 'g',
			label: 'Crude product mass',
			timestamp: new Date()
		}]
	};
}

/**
 * Wash the crystals
 */
export function washProduct(state: OrganicSynthesisState): OrganicSynthesisState {
	if (state.step !== 'filter' || !state.filtrationDone) return state;

	return {
		...state,
		step: 'wash',
		washDone: true,
		actions: [...state.actions, {
			step: 'wash',
			description: 'Washed crystals with cold distilled water',
			timestamp: new Date()
		}]
	};
}

/**
 * Recrystallize for purification
 */
export function recrystallize(state: OrganicSynthesisState): OrganicSynthesisState {
	if (state.step !== 'wash' || !state.washDone) return state;

	// Recrystallization loses ~10-20% of product
	const lossFraction = 0.85 + Math.random() * 0.1;
	const purifiedMass = parseFloat((state.productMass * lossFraction).toFixed(3));

	return {
		...state,
		step: 'recrystallize',
		recrystallizationDone: true,
		purifiedMass,
		actions: [...state.actions, {
			step: 'recrystallize',
			description: 'Dissolved in minimum ethanol, recrystallized from hot water',
			timestamp: new Date()
		}]
	};
}

/**
 * Dry the purified product
 */
export function dryProduct(state: OrganicSynthesisState): OrganicSynthesisState {
	if (state.step !== 'recrystallize' || !state.recrystallizationDone) return state;

	// Calculate percent yield
	const molesSA = state.salicylicAcidMass / MOLAR_MASS.salicylicAcid;
	const molesAA = (state.aceticAnhydrideVolume * ACETIC_ANHYDRIDE_DENSITY) / MOLAR_MASS.aceticAnhydride;
	const limitingMoles = Math.min(molesSA, molesAA);
	const theoreticalYield = limitingMoles * MOLAR_MASS.aspirin;
	const percentYield = (state.purifiedMass / theoreticalYield) * 100;

	return {
		...state,
		step: 'dry',
		dryingDone: true,
		percentYield: parseFloat(percentYield.toFixed(1)),
		actions: [...state.actions, {
			step: 'dry',
			description: `Dried purified product: ${state.purifiedMass.toFixed(3)} g`,
			timestamp: new Date()
		}],
		measurements: [...state.measurements, {
			type: 'mass',
			value: state.purifiedMass,
			unit: 'g',
			label: 'Purified product mass',
			timestamp: new Date()
		}, {
			type: 'yield',
			value: parseFloat(percentYield.toFixed(1)),
			unit: '%',
			label: 'Percent yield',
			timestamp: new Date()
		}]
	};
}

/**
 * Perform melting point test
 */
export function performMeltingPointTest(state: OrganicSynthesisState): OrganicSynthesisState {
	if (state.step !== 'dry' || !state.dryingDone) return state;

	// Melting point range depends on purity
	// Pure aspirin: 135 degC (sharp)
	// Impure: lower and broader range
	const purityFactor = state.recrystallizationDone ? 0.95 : 0.8;
	const mpStart = PURE_ASPIRIN_MP - (1 - purityFactor) * 15 + (Math.random() - 0.5) * 2;
	const mpEnd = mpStart + (1 - purityFactor) * 8 + Math.random() * 2;

	return {
		...state,
		step: 'melting-point',
		meltingPointTested: true,
		meltingPointStart: parseFloat(mpStart.toFixed(1)),
		meltingPointEnd: parseFloat(mpEnd.toFixed(1)),
		actions: [...state.actions, {
			step: 'melting-point',
			description: `Melting point: ${mpStart.toFixed(1)}-${mpEnd.toFixed(1)} C`,
			timestamp: new Date()
		}],
		measurements: [...state.measurements, {
			type: 'temperature',
			value: parseFloat(mpStart.toFixed(1)),
			unit: '\u00B0C',
			label: 'Melting point start',
			timestamp: new Date()
		}, {
			type: 'temperature',
			value: parseFloat(mpEnd.toFixed(1)),
			unit: '\u00B0C',
			label: 'Melting point end',
			timestamp: new Date()
		}]
	};
}

/**
 * Perform ferric chloride purity test
 */
export function performFerricChlorideTest(state: OrganicSynthesisState): OrganicSynthesisState {
	if (!state.dryingDone) return state;

	// FeCl3 reacts with phenol group of unreacted salicylic acid (purple color)
	// Pure aspirin gives no color (acetyl group blocks the phenol)
	const hasImpurity = !state.recrystallizationDone || Math.random() < 0.1;
	const result = hasImpurity ? 'positive' : 'negative';

	let purityAssessment: string;
	if (result === 'negative') {
		purityAssessment = 'No unreacted salicylic acid detected. Product appears pure.';
	} else {
		purityAssessment = 'Traces of unreacted salicylic acid detected. Further purification recommended.';
	}

	return {
		...state,
		step: 'purity-test',
		ferricChlorideTest: result,
		purityAssessment,
		actions: [...state.actions, {
			step: 'purity-test',
			description: `Ferric chloride test: ${result} (${result === 'negative' ? 'pure' : 'impure'})`,
			timestamp: new Date()
		}]
	};
}

/**
 * Analyze synthesis results
 */
export function analyzeSynthesis(state: OrganicSynthesisState): {
	theoreticalYield: number;
	actualYield: number;
	percentYield: number;
	purity: string;
	meltingPointRange: string;
	score: number;
	feedback: string;
	limitingReagent: string;
} {
	const molesSA = state.salicylicAcidMass / MOLAR_MASS.salicylicAcid;
	const molesAA = (state.aceticAnhydrideVolume * ACETIC_ANHYDRIDE_DENSITY) / MOLAR_MASS.aceticAnhydride;
	const limitingMoles = Math.min(molesSA, molesAA);
	const theoreticalYield = limitingMoles * MOLAR_MASS.aspirin;
	const limitingReagent = molesSA <= molesAA ? 'Salicylic acid' : 'Acetic anhydride';

	const mpRange = state.meltingPointTested
		? `${state.meltingPointStart.toFixed(1)}-${state.meltingPointEnd.toFixed(1)} \u00B0C`
		: 'Not tested';

	const mpDeviation = state.meltingPointTested
		? Math.abs(state.meltingPointStart - PURE_ASPIRIN_MP)
		: 10;
	const mpRangeWidth = state.meltingPointTested
		? state.meltingPointEnd - state.meltingPointStart
		: 10;

	let purity: string;
	if (mpDeviation < 2 && mpRangeWidth < 3) {
		purity = 'High purity';
	} else if (mpDeviation < 5 && mpRangeWidth < 5) {
		purity = 'Moderate purity';
	} else {
		purity = 'Low purity - significant impurities';
	}

	// Score calculation
	let score = 0;

	// Yield score (30 pts)
	if (state.percentYield >= 70) score += 30;
	else if (state.percentYield >= 50) score += 20;
	else if (state.percentYield > 0) score += 10;

	// Melting point score (25 pts)
	if (state.meltingPointTested) {
		if (mpDeviation < 2) score += 25;
		else if (mpDeviation < 5) score += 18;
		else score += 10;
	}

	// Purity test score (15 pts)
	if (state.ferricChlorideTest === 'negative') score += 15;
	else if (state.ferricChlorideTest === 'positive') score += 8;

	// Completeness (30 pts)
	if (state.reactionComplete) score += 5;
	if (state.filtrationDone) score += 5;
	if (state.washDone) score += 5;
	if (state.recrystallizationDone) score += 5;
	if (state.dryingDone) score += 5;
	if (state.meltingPointTested) score += 5;

	let feedback: string;
	if (score >= 90) {
		feedback = 'Excellent synthesis! Your product has high purity and good yield. Well done!';
	} else if (score >= 75) {
		feedback = 'Good work! The synthesis was successful with reasonable yield and purity.';
	} else if (score >= 60) {
		feedback = 'Fair attempt. Consider optimizing heating time and performing recrystallization carefully.';
	} else {
		feedback = 'The synthesis needs improvement. Review the procedure and ensure each step is performed correctly.';
	}

	return {
		theoreticalYield: parseFloat(theoreticalYield.toFixed(3)),
		actualYield: state.purifiedMass,
		percentYield: state.percentYield,
		purity,
		meltingPointRange: mpRange,
		score: Math.min(100, score),
		feedback,
		limitingReagent
	};
}

/**
 * Quiz questions for organic synthesis
 */
export const quizQuestions = [
	{
		id: 'q1',
		question: 'What is the role of phosphoric acid in the aspirin synthesis?',
		options: [
			'It is a reactant',
			'It acts as a catalyst to speed up the reaction',
			'It neutralizes the product',
			'It acts as the solvent'
		],
		correctIndex: 1,
		explanation: 'Phosphoric acid is a catalyst that protonates acetic anhydride, making it more electrophilic and speeding up the esterification reaction.'
	},
	{
		id: 'q2',
		question: 'Why is the crude product washed with cold water?',
		options: [
			'To dissolve the aspirin crystals',
			'To remove unreacted acetic anhydride and acetic acid byproduct',
			'To heat the product',
			'To add color to the crystals'
		],
		correctIndex: 1,
		explanation: 'Cold water washes away water-soluble impurities (acetic acid, phosphoric acid) while the insoluble aspirin crystals remain on the filter.'
	},
	{
		id: 'q3',
		question: 'What does a positive ferric chloride test indicate?',
		options: [
			'Pure aspirin is present',
			'The reaction did not occur',
			'Unreacted salicylic acid (free phenol group) is present',
			'The product has decomposed'
		],
		correctIndex: 2,
		explanation: 'FeCl3 reacts with the free phenol (-OH) group of salicylic acid to give a purple color. Aspirin has its phenol group acetylated, so pure aspirin gives no color.'
	},
	{
		id: 'q4',
		question: 'How does recrystallization improve product purity?',
		options: [
			'It removes all water from the product',
			'The product dissolves in hot solvent and impurities remain dissolved as crystals form on cooling',
			'It changes the chemical structure',
			'It increases the reaction yield'
		],
		correctIndex: 1,
		explanation: 'In recrystallization, the product dissolves in hot solvent along with impurities. On cooling, the desired product crystallizes out in a pure form while impurities remain dissolved in the solvent.'
	}
];
