/**
 * Electrochemistry & Galvanic Cells Simulation Engine
 *
 * Simulates galvanic (voltaic) cells with different metal electrode pairs.
 * Uses standard reduction potentials and the Nernst equation.
 *
 * Nernst Equation: E = E0 - (RT/nF) * ln(Q)
 * At 25C: E = E0 - (0.0592/n) * log(Q)
 */

export interface ElectrochemistryConfig {
	temperature: number; // Kelvin
	defaultConcentration: number; // mol/L
}

export interface ElectrochemistryState {
	anode: Electrode;
	cathode: Electrode;
	cellAssembled: boolean;
	saltBridgeConnected: boolean;
	voltmeterConnected: boolean;
	measuredVoltage: number | null;
	theoreticalVoltage: number;
	nernstVoltage: number;
	isRunning: boolean;
	elapsedTime: number; // seconds
	anodeConcentration: number; // mol/L
	cathodeConcentration: number; // mol/L
	temperature: number; // K
	measurements: CellMeasurement[];
	cellNotation: string;
	reactions: {
		anode: string;
		cathode: string;
		overall: string;
	};
	electronsTransferred: number;
}

export interface Electrode {
	metal: MetalType;
	name: string;
	symbol: string;
	color: string;
	standardPotential: number; // V vs SHE
	ionFormula: string;
	ionCharge: number;
	solutionColor: string;
	solutionName: string;
}

export type MetalType = 'Zn' | 'Cu' | 'Fe' | 'Ag' | 'Pb' | 'Ni' | 'Sn';

export interface CellMeasurement {
	anodeMetal: string;
	cathodeMetal: string;
	anodeConcentration: number;
	cathodeConcentration: number;
	measuredVoltage: number;
	theoreticalVoltage: number;
	nernstVoltage: number;
	timestamp: Date;
}

// Standard reduction potentials (V vs SHE at 25C)
export const ELECTRODE_DATA: Record<MetalType, Electrode> = {
	Zn: {
		metal: 'Zn',
		name: 'Zinc',
		symbol: 'Zn',
		color: '#a1a1aa',
		standardPotential: -0.76,
		ionFormula: 'Zn\u00B2\u207A',
		ionCharge: 2,
		solutionColor: 'rgba(200, 200, 200, 0.3)',
		solutionName: 'ZnSO\u2084 (aq)'
	},
	Cu: {
		metal: 'Cu',
		name: 'Copper',
		symbol: 'Cu',
		color: '#c2702a',
		standardPotential: 0.34,
		ionFormula: 'Cu\u00B2\u207A',
		ionCharge: 2,
		solutionColor: 'rgba(37, 99, 235, 0.4)',
		solutionName: 'CuSO\u2084 (aq)'
	},
	Fe: {
		metal: 'Fe',
		name: 'Iron',
		symbol: 'Fe',
		color: '#78716c',
		standardPotential: -0.44,
		ionFormula: 'Fe\u00B2\u207A',
		ionCharge: 2,
		solutionColor: 'rgba(163, 230, 163, 0.3)',
		solutionName: 'FeSO\u2084 (aq)'
	},
	Ag: {
		metal: 'Ag',
		name: 'Silver',
		symbol: 'Ag',
		color: '#d4d4d8',
		standardPotential: 0.80,
		ionFormula: 'Ag\u207A',
		ionCharge: 1,
		solutionColor: 'rgba(200, 200, 200, 0.2)',
		solutionName: 'AgNO\u2083 (aq)'
	},
	Pb: {
		metal: 'Pb',
		name: 'Lead',
		symbol: 'Pb',
		color: '#6b7280',
		standardPotential: -0.13,
		ionFormula: 'Pb\u00B2\u207A',
		ionCharge: 2,
		solutionColor: 'rgba(200, 200, 200, 0.2)',
		solutionName: 'Pb(NO\u2083)\u2082 (aq)'
	},
	Ni: {
		metal: 'Ni',
		name: 'Nickel',
		symbol: 'Ni',
		color: '#a3a3a3',
		standardPotential: -0.26,
		ionFormula: 'Ni\u00B2\u207A',
		ionCharge: 2,
		solutionColor: 'rgba(74, 222, 128, 0.3)',
		solutionName: 'NiSO\u2084 (aq)'
	},
	Sn: {
		metal: 'Sn',
		name: 'Tin',
		symbol: 'Sn',
		color: '#d6d3d1',
		standardPotential: -0.14,
		ionFormula: 'Sn\u00B2\u207A',
		ionCharge: 2,
		solutionColor: 'rgba(200, 200, 200, 0.2)',
		solutionName: 'SnCl\u2082 (aq)'
	}
};

/**
 * Calculate standard cell potential
 * E0_cell = E0_cathode - E0_anode
 */
export function calculateStandardPotential(cathode: Electrode, anode: Electrode): number {
	return cathode.standardPotential - anode.standardPotential;
}

/**
 * Calculate cell potential using Nernst equation
 * E = E0 - (0.0592/n) * log10(Q)
 * For Anode: M -> M^n+ + ne-
 * For Cathode: M^n+ + ne- -> M
 * Q = [anode ion]^a / [cathode ion]^c
 */
export function calculateNernstPotential(
	cathode: Electrode,
	anode: Electrode,
	cathodeConcentration: number,
	anodeConcentration: number,
	temperature: number = 298.15
): number {
	const E0 = calculateStandardPotential(cathode, anode);

	// Find number of electrons transferred (LCM of charges)
	const n = lcm(anode.ionCharge, cathode.ionCharge);
	const anodeCoeff = n / anode.ionCharge;
	const cathodeCoeff = n / cathode.ionCharge;

	// Reaction quotient Q = [anode products]^coeff / [cathode reactants]^coeff
	const Q = Math.pow(anodeConcentration, anodeCoeff) / Math.pow(cathodeConcentration, cathodeCoeff);

	// Nernst equation at given temperature
	const R = 8.314; // J/(mol*K)
	const F = 96485; // C/mol
	const E = E0 - (R * temperature) / (n * F) * Math.log(Q);

	return E;
}

function lcm(a: number, b: number): number {
	return (a * b) / gcd(a, b);
}

function gcd(a: number, b: number): number {
	return b === 0 ? a : gcd(b, a % b);
}

/**
 * Generate cell notation
 * Anode | Anode solution || Cathode solution | Cathode
 */
export function generateCellNotation(anode: Electrode, cathode: Electrode, anodeConc: number, cathodeConc: number): string {
	return `${anode.symbol}(s) | ${anode.ionFormula}(${anodeConc} M) || ${cathode.ionFormula}(${cathodeConc} M) | ${cathode.symbol}(s)`;
}

/**
 * Generate half-reactions and overall reaction
 */
export function generateReactions(anode: Electrode, cathode: Electrode): {
	anode: string;
	cathode: string;
	overall: string;
} {
	const n = lcm(anode.ionCharge, cathode.ionCharge);
	const anodeCoeff = n / anode.ionCharge;
	const cathodeCoeff = n / cathode.ionCharge;

	const anodeStr = anodeCoeff > 1
		? `${anodeCoeff}${anode.symbol}(s) -> ${anodeCoeff}${anode.ionFormula}(aq) + ${n}e\u207B`
		: `${anode.symbol}(s) -> ${anode.ionFormula}(aq) + ${anode.ionCharge}e\u207B`;

	const cathodeStr = cathodeCoeff > 1
		? `${cathodeCoeff}${cathode.ionFormula}(aq) + ${n}e\u207B -> ${cathodeCoeff}${cathode.symbol}(s)`
		: `${cathode.ionFormula}(aq) + ${cathode.ionCharge}e\u207B -> ${cathode.symbol}(s)`;

	const overallStr = anodeCoeff > 1 || cathodeCoeff > 1
		? `${anodeCoeff > 1 ? anodeCoeff : ''}${anode.symbol}(s) + ${cathodeCoeff > 1 ? cathodeCoeff : ''}${cathode.ionFormula}(aq) -> ${anodeCoeff > 1 ? anodeCoeff : ''}${anode.ionFormula}(aq) + ${cathodeCoeff > 1 ? cathodeCoeff : ''}${cathode.symbol}(s)`
		: `${anode.symbol}(s) + ${cathode.ionFormula}(aq) -> ${anode.ionFormula}(aq) + ${cathode.symbol}(s)`;

	return { anode: anodeStr, cathode: cathodeStr, overall: overallStr };
}

/**
 * Create initial electrochemistry state
 */
export function createInitialState(config: ElectrochemistryConfig): ElectrochemistryState {
	const anode = { ...ELECTRODE_DATA.Zn };
	const cathode = { ...ELECTRODE_DATA.Cu };
	const conc = config.defaultConcentration;
	const E0 = calculateStandardPotential(cathode, anode);
	const nernstE = calculateNernstPotential(cathode, anode, conc, conc, config.temperature);
	const n = lcm(anode.ionCharge, cathode.ionCharge);

	return {
		anode,
		cathode,
		cellAssembled: false,
		saltBridgeConnected: false,
		voltmeterConnected: false,
		measuredVoltage: null,
		theoreticalVoltage: E0,
		nernstVoltage: nernstE,
		isRunning: false,
		elapsedTime: 0,
		anodeConcentration: conc,
		cathodeConcentration: conc,
		temperature: config.temperature,
		measurements: [],
		cellNotation: generateCellNotation(anode, cathode, conc, conc),
		reactions: generateReactions(anode, cathode),
		electronsTransferred: n
	};
}

/**
 * Select anode metal
 */
export function selectAnode(
	state: ElectrochemistryState,
	metal: MetalType
): ElectrochemistryState {
	if (state.isRunning) return state;
	if (metal === state.cathode.metal) return state; // Can't use same metal for both

	const anode = { ...ELECTRODE_DATA[metal] };
	const cathode = state.cathode;

	// Ensure anode has lower (more negative) potential
	let actualAnode = anode;
	let actualCathode = cathode;
	if (anode.standardPotential > cathode.standardPotential) {
		actualAnode = cathode;
		actualCathode = anode;
	}

	const E0 = calculateStandardPotential(actualCathode, actualAnode);
	const nernstE = calculateNernstPotential(actualCathode, actualAnode, state.cathodeConcentration, state.anodeConcentration, state.temperature);
	const n = lcm(actualAnode.ionCharge, actualCathode.ionCharge);

	return {
		...state,
		anode: actualAnode,
		cathode: actualCathode,
		cellAssembled: false,
		saltBridgeConnected: false,
		voltmeterConnected: false,
		measuredVoltage: null,
		theoreticalVoltage: E0,
		nernstVoltage: nernstE,
		cellNotation: generateCellNotation(actualAnode, actualCathode, state.anodeConcentration, state.cathodeConcentration),
		reactions: generateReactions(actualAnode, actualCathode),
		electronsTransferred: n
	};
}

/**
 * Select cathode metal
 */
export function selectCathode(
	state: ElectrochemistryState,
	metal: MetalType
): ElectrochemistryState {
	if (state.isRunning) return state;
	if (metal === state.anode.metal) return state;

	const cathode = { ...ELECTRODE_DATA[metal] };
	const anode = state.anode;

	let actualAnode = anode;
	let actualCathode = cathode;
	if (anode.standardPotential > cathode.standardPotential) {
		actualAnode = cathode;
		actualCathode = anode;
	}

	const E0 = calculateStandardPotential(actualCathode, actualAnode);
	const nernstE = calculateNernstPotential(actualCathode, actualAnode, state.cathodeConcentration, state.anodeConcentration, state.temperature);
	const n = lcm(actualAnode.ionCharge, actualCathode.ionCharge);

	return {
		...state,
		anode: actualAnode,
		cathode: actualCathode,
		cellAssembled: false,
		saltBridgeConnected: false,
		voltmeterConnected: false,
		measuredVoltage: null,
		theoreticalVoltage: E0,
		nernstVoltage: nernstE,
		cellNotation: generateCellNotation(actualAnode, actualCathode, state.anodeConcentration, state.cathodeConcentration),
		reactions: generateReactions(actualAnode, actualCathode),
		electronsTransferred: n
	};
}

/**
 * Assemble the cell
 */
export function assembleCell(state: ElectrochemistryState): ElectrochemistryState {
	return {
		...state,
		cellAssembled: true
	};
}

/**
 * Connect salt bridge
 */
export function connectSaltBridge(state: ElectrochemistryState): ElectrochemistryState {
	if (!state.cellAssembled) return state;

	return {
		...state,
		saltBridgeConnected: true
	};
}

/**
 * Connect voltmeter
 */
export function connectVoltmeter(state: ElectrochemistryState): ElectrochemistryState {
	if (!state.cellAssembled) return state;

	return {
		...state,
		voltmeterConnected: true
	};
}

/**
 * Start the cell and measure voltage
 */
export function startCell(state: ElectrochemistryState): ElectrochemistryState {
	if (!state.cellAssembled || !state.saltBridgeConnected || !state.voltmeterConnected) {
		return state;
	}

	// Add small random error to simulate real measurement
	const error = (Math.random() - 0.5) * 0.02;
	const measured = state.nernstVoltage + error;

	return {
		...state,
		isRunning: true,
		measuredVoltage: parseFloat(measured.toFixed(3))
	};
}

/**
 * Set concentration of anode solution
 */
export function setAnodeConcentration(
	state: ElectrochemistryState,
	concentration: number
): ElectrochemistryState {
	const conc = Math.max(0.001, Math.min(2.0, concentration));
	const nernstE = calculateNernstPotential(state.cathode, state.anode, state.cathodeConcentration, conc, state.temperature);

	const measured = state.isRunning
		? parseFloat((nernstE + (Math.random() - 0.5) * 0.02).toFixed(3))
		: state.measuredVoltage;

	return {
		...state,
		anodeConcentration: conc,
		nernstVoltage: nernstE,
		measuredVoltage: measured,
		cellNotation: generateCellNotation(state.anode, state.cathode, conc, state.cathodeConcentration)
	};
}

/**
 * Set concentration of cathode solution
 */
export function setCathodeConcentration(
	state: ElectrochemistryState,
	concentration: number
): ElectrochemistryState {
	const conc = Math.max(0.001, Math.min(2.0, concentration));
	const nernstE = calculateNernstPotential(state.cathode, state.anode, conc, state.anodeConcentration, state.temperature);

	const measured = state.isRunning
		? parseFloat((nernstE + (Math.random() - 0.5) * 0.02).toFixed(3))
		: state.measuredVoltage;

	return {
		...state,
		cathodeConcentration: conc,
		nernstVoltage: nernstE,
		measuredVoltage: measured,
		cellNotation: generateCellNotation(state.anode, state.cathode, state.anodeConcentration, conc)
	};
}

/**
 * Record a measurement
 */
export function recordMeasurement(state: ElectrochemistryState): ElectrochemistryState {
	if (!state.isRunning || state.measuredVoltage === null) return state;

	const measurement: CellMeasurement = {
		anodeMetal: state.anode.symbol,
		cathodeMetal: state.cathode.symbol,
		anodeConcentration: state.anodeConcentration,
		cathodeConcentration: state.cathodeConcentration,
		measuredVoltage: state.measuredVoltage,
		theoreticalVoltage: state.theoreticalVoltage,
		nernstVoltage: state.nernstVoltage,
		timestamp: new Date()
	};

	return {
		...state,
		measurements: [...state.measurements, measurement]
	};
}

/**
 * Reset the cell for a new experiment
 */
export function resetCell(state: ElectrochemistryState): ElectrochemistryState {
	return {
		...state,
		cellAssembled: false,
		saltBridgeConnected: false,
		voltmeterConnected: false,
		measuredVoltage: null,
		isRunning: false,
		elapsedTime: 0
	};
}

/**
 * Analyze electrochemistry experiment
 */
export function analyzeElectrochemistry(state: ElectrochemistryState): {
	uniqueCellsTested: number;
	averageError: number;
	electrochemicalSeriesVerified: boolean;
	nernstEquationVerified: boolean;
	score: number;
	feedback: string;
} {
	// Count unique cell combinations tested
	const uniqueCells = new Set(state.measurements.map(m => `${m.anodeMetal}-${m.cathodeMetal}`));
	const uniqueCellsTested = uniqueCells.size;

	// Average measurement error
	let totalError = 0;
	state.measurements.forEach(m => {
		totalError += Math.abs(m.measuredVoltage - m.nernstVoltage);
	});
	const averageError = state.measurements.length > 0
		? totalError / state.measurements.length
		: 0;

	// Check if electrochemical series is verified (tested >= 3 different cell combos)
	const electrochemicalSeriesVerified = uniqueCellsTested >= 3;

	// Check if Nernst equation is verified (varied concentration for same cell)
	const nernstVerificationCells = new Map<string, CellMeasurement[]>();
	state.measurements.forEach(m => {
		const key = `${m.anodeMetal}-${m.cathodeMetal}`;
		if (!nernstVerificationCells.has(key)) nernstVerificationCells.set(key, []);
		nernstVerificationCells.get(key)!.push(m);
	});
	const nernstEquationVerified = Array.from(nernstVerificationCells.values())
		.some(measurements => {
			const concentrations = measurements.map(m => `${m.anodeConcentration}-${m.cathodeConcentration}`);
			return new Set(concentrations).size >= 2;
		});

	// Score calculation
	let score = 0;

	// Unique cells tested (40 pts)
	score += Math.min(40, uniqueCellsTested * 13);

	// Measurement accuracy (25 pts)
	if (averageError < 0.02) score += 25;
	else if (averageError < 0.05) score += 18;
	else if (averageError < 0.1) score += 10;

	// Series verification (15 pts)
	if (electrochemicalSeriesVerified) score += 15;

	// Nernst verification (20 pts)
	if (nernstEquationVerified) score += 20;

	let feedback: string;
	if (score >= 90) {
		feedback = 'Excellent! You have thoroughly explored electrochemistry, verified the series, and demonstrated the Nernst equation.';
	} else if (score >= 75) {
		feedback = 'Good work! Try varying concentrations to verify the Nernst equation for full credit.';
	} else if (score >= 60) {
		feedback = 'Fair progress. Test more cell combinations to verify the electrochemical series.';
	} else {
		feedback = 'Keep exploring! Assemble different galvanic cells and record their potentials to build understanding.';
	}

	return {
		uniqueCellsTested,
		averageError: parseFloat(averageError.toFixed(4)),
		electrochemicalSeriesVerified,
		nernstEquationVerified,
		score: Math.min(100, score),
		feedback
	};
}

/**
 * Quiz questions for electrochemistry
 */
export const quizQuestions = [
	{
		id: 'q1',
		question: 'In a galvanic cell, oxidation occurs at which electrode?',
		options: ['Cathode', 'Anode', 'Salt bridge', 'Both electrodes'],
		correctIndex: 1,
		explanation: 'Oxidation occurs at the anode (remember: AN OX - anode oxidation). The anode is the electrode with the more negative standard reduction potential.'
	},
	{
		id: 'q2',
		question: 'What is the purpose of the salt bridge in a galvanic cell?',
		options: [
			'To conduct electrons between half-cells',
			'To maintain electrical neutrality by allowing ion migration',
			'To increase the voltage',
			'To prevent the reaction from occurring'
		],
		correctIndex: 1,
		explanation: 'The salt bridge allows ions to migrate between half-cells, maintaining electrical neutrality. Without it, charge buildup would quickly stop the cell from functioning.'
	},
	{
		id: 'q3',
		question: 'According to the Nernst equation, what happens to cell potential when cathode ion concentration increases?',
		options: [
			'Cell potential decreases',
			'Cell potential increases',
			'Cell potential stays the same',
			'The cell stops working'
		],
		correctIndex: 1,
		explanation: 'Increasing cathode ion concentration decreases Q (reaction quotient), which makes the log(Q) term more negative, thus increasing the cell potential (E = E0 - (0.0592/n)logQ).'
	},
	{
		id: 'q4',
		question: 'Which cell would produce the highest voltage?',
		options: [
			'Zn-Cu (E0 = 1.10 V)',
			'Zn-Ag (E0 = 1.56 V)',
			'Fe-Cu (E0 = 0.78 V)',
			'Ni-Cu (E0 = 0.60 V)'
		],
		correctIndex: 1,
		explanation: 'Zn-Ag has the largest difference in standard reduction potentials: E0(Ag+/Ag) = +0.80 V and E0(Zn2+/Zn) = -0.76 V, giving E0_cell = 1.56 V.'
	}
];
