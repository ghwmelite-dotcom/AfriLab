/**
 * Pharmacokinetics Simulation Laboratory
 * One-compartment model visualization with dosing regimen design
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PharmacokineticsState {
	parameters: PKParameters;
	dosingRegimen: DosingRegimen;
	simulationData: SimulationPoint[];
	therapeuticWindow: TherapeuticWindow;
	calculatedMetrics: PKMetrics | null;
	isSimulationRun: boolean;
	multiDoseData: SimulationPoint[];
	isMultiDoseRun: boolean;
	selectedDrug: DrugPreset | null;
	completedTasks: string[];
	quizAnswers: Map<string, string>;
}

export interface PKParameters {
	dose: number; // mg
	bioavailability: number; // fraction (0-1)
	volumeOfDistribution: number; // L
	clearance: number; // L/hr
	absorptionRate: number; // hr⁻¹ (ka) for oral, Infinity for IV
	route: 'oral' | 'iv-bolus' | 'iv-infusion';
	infusionDuration: number; // hours (only for iv-infusion)
}

export interface DosingRegimen {
	dose: number; // mg per dose
	interval: number; // hours between doses
	numberOfDoses: number;
	route: 'oral' | 'iv-bolus' | 'iv-infusion';
}

export interface SimulationPoint {
	time: number; // hours
	concentration: number; // mg/L (µg/mL)
	doseNumber?: number;
}

export interface TherapeuticWindow {
	minEffective: number; // MEC - mg/L
	minToxic: number; // MTC - mg/L
	drugName: string;
}

export interface PKMetrics {
	cmax: number; // mg/L
	tmax: number; // hours
	auc: number; // mg·hr/L
	halfLife: number; // hours
	ke: number; // elimination rate constant (hr⁻¹)
	timeAboveMEC: number; // hours
	timeBelowMTC: number; // hours (time within window)
	steadyStateCmin: number | null;
	steadyStateCmax: number | null;
}

export interface DrugPreset {
	id: string;
	name: string;
	parameters: PKParameters;
	therapeuticWindow: TherapeuticWindow;
	typicalRegimen: DosingRegimen;
	description: string;
}

export interface PharmacokineticsConfig {
	drugId: string | null;
}

// ── Drug Presets ───────────────────────────────────────────────────────────────

export const DRUG_PRESETS: DrugPreset[] = [
	{
		id: 'amoxicillin',
		name: 'Amoxicillin',
		parameters: {
			dose: 500,
			bioavailability: 0.9,
			volumeOfDistribution: 20,
			clearance: 15,
			absorptionRate: 2.5,
			route: 'oral',
			infusionDuration: 0
		},
		therapeuticWindow: { minEffective: 2, minToxic: 20, drugName: 'Amoxicillin' },
		typicalRegimen: { dose: 500, interval: 8, numberOfDoses: 6, route: 'oral' },
		description:
			'Broad-spectrum penicillin. Rapidly absorbed orally with ~90% bioavailability. Short half-life requires frequent dosing.'
	},
	{
		id: 'gentamicin',
		name: 'Gentamicin',
		parameters: {
			dose: 350,
			bioavailability: 1.0,
			volumeOfDistribution: 18,
			clearance: 5,
			absorptionRate: Infinity,
			route: 'iv-bolus',
			infusionDuration: 0
		},
		therapeuticWindow: { minEffective: 4, minToxic: 12, drugName: 'Gentamicin' },
		typicalRegimen: { dose: 350, interval: 24, numberOfDoses: 5, route: 'iv-bolus' },
		description:
			'Aminoglycoside antibiotic. Narrow therapeutic index. Concentration-dependent killing favors high peak levels with extended intervals.'
	},
	{
		id: 'vancomycin',
		name: 'Vancomycin',
		parameters: {
			dose: 1000,
			bioavailability: 1.0,
			volumeOfDistribution: 50,
			clearance: 4.5,
			absorptionRate: Infinity,
			route: 'iv-infusion',
			infusionDuration: 1
		},
		therapeuticWindow: { minEffective: 10, minToxic: 25, drugName: 'Vancomycin' },
		typicalRegimen: { dose: 1000, interval: 12, numberOfDoses: 6, route: 'iv-infusion' },
		description:
			'Glycopeptide antibiotic for MRSA. Infused over 1 hour. Trough-guided dosing targets 15-20 mg/L for serious infections.'
	},
	{
		id: 'theophylline',
		name: 'Theophylline',
		parameters: {
			dose: 300,
			bioavailability: 0.96,
			volumeOfDistribution: 35,
			clearance: 2.8,
			absorptionRate: 1.5,
			route: 'oral',
			infusionDuration: 0
		},
		therapeuticWindow: { minEffective: 5, minToxic: 15, drugName: 'Theophylline' },
		typicalRegimen: { dose: 300, interval: 12, numberOfDoses: 6, route: 'oral' },
		description:
			'Methylxanthine bronchodilator. Narrow therapeutic index. Clearance varies widely with age, smoking, and drug interactions.'
	}
];

// ── PK Calculation Engine ──────────────────────────────────────────────────────

/**
 * Calculate elimination rate constant
 */
export function calculateKe(clearance: number, vd: number): number {
	return clearance / vd;
}

/**
 * Calculate half-life
 */
export function calculateHalfLife(ke: number): number {
	return Math.LN2 / ke;
}

/**
 * Single dose concentration at time t for IV bolus
 */
function ivBolusConcentration(dose: number, vd: number, ke: number, t: number): number {
	const c0 = dose / vd;
	return c0 * Math.exp(-ke * t);
}

/**
 * Single dose concentration at time t for oral (one-compartment with first-order absorption)
 */
function oralConcentration(
	dose: number,
	F: number,
	vd: number,
	ka: number,
	ke: number,
	t: number
): number {
	if (ka === ke) {
		// Edge case: ka = ke (use L'Hopital limit form)
		return ((F * dose * ka) / vd) * t * Math.exp(-ke * t);
	}
	return ((F * dose * ka) / (vd * (ka - ke))) * (Math.exp(-ke * t) - Math.exp(-ka * t));
}

/**
 * Single dose concentration at time t for IV infusion
 */
function ivInfusionConcentration(
	dose: number,
	vd: number,
	ke: number,
	infusionDuration: number,
	t: number
): number {
	const R0 = dose / infusionDuration; // infusion rate mg/hr
	const cl = ke * vd;

	if (t <= infusionDuration) {
		// During infusion
		return (R0 / cl) * (1 - Math.exp(-ke * t));
	} else {
		// After infusion
		const cEnd = (R0 / cl) * (1 - Math.exp(-ke * infusionDuration));
		return cEnd * Math.exp(-ke * (t - infusionDuration));
	}
}

/**
 * Calculate single-dose concentration at time t
 */
export function singleDoseConcentration(params: PKParameters, t: number): number {
	const ke = calculateKe(params.clearance, params.volumeOfDistribution);

	switch (params.route) {
		case 'iv-bolus':
			return ivBolusConcentration(params.dose, params.volumeOfDistribution, ke, t);
		case 'iv-infusion':
			return ivInfusionConcentration(
				params.dose,
				params.volumeOfDistribution,
				ke,
				params.infusionDuration,
				t
			);
		case 'oral':
		default:
			return oralConcentration(
				params.dose,
				params.bioavailability,
				params.volumeOfDistribution,
				params.absorptionRate,
				ke,
				t
			);
	}
}

/**
 * Generate single-dose simulation data points
 */
export function simulateSingleDose(params: PKParameters): SimulationPoint[] {
	const ke = calculateKe(params.clearance, params.volumeOfDistribution);
	const halfLife = calculateHalfLife(ke);
	const totalTime = Math.max(halfLife * 5, 24); // Simulate for 5 half-lives or 24h
	const dt = totalTime / 300; // 300 data points

	const points: SimulationPoint[] = [];
	for (let t = 0; t <= totalTime; t += dt) {
		points.push({
			time: Math.round(t * 100) / 100,
			concentration: Math.max(0, singleDoseConcentration(params, t))
		});
	}

	return points;
}

/**
 * Generate multi-dose simulation data points
 */
export function simulateMultiDose(params: PKParameters, regimen: DosingRegimen): SimulationPoint[] {
	const ke = calculateKe(params.clearance, params.volumeOfDistribution);
	const halfLife = calculateHalfLife(ke);
	const totalTime = regimen.interval * regimen.numberOfDoses + halfLife * 3;
	const dt = totalTime / 500;

	const doseParams: PKParameters = { ...params, dose: regimen.dose, route: regimen.route };

	const points: SimulationPoint[] = [];
	for (let t = 0; t <= totalTime; t += dt) {
		let totalConc = 0;
		let lastDose = 0;

		for (let d = 0; d < regimen.numberOfDoses; d++) {
			const doseTime = d * regimen.interval;
			if (t >= doseTime) {
				totalConc += singleDoseConcentration(doseParams, t - doseTime);
				lastDose = d + 1;
			}
		}

		points.push({
			time: Math.round(t * 100) / 100,
			concentration: Math.max(0, totalConc),
			doseNumber: lastDose
		});
	}

	return points;
}

/**
 * Calculate PK metrics from simulation data
 */
export function calculateMetrics(
	params: PKParameters,
	data: SimulationPoint[],
	window: TherapeuticWindow
): PKMetrics {
	const ke = calculateKe(params.clearance, params.volumeOfDistribution);
	const halfLife = calculateHalfLife(ke);

	// Find Cmax and Tmax
	let cmax = 0;
	let tmax = 0;
	for (const point of data) {
		if (point.concentration > cmax) {
			cmax = point.concentration;
			tmax = point.time;
		}
	}

	// Calculate AUC using trapezoidal rule
	let auc = 0;
	for (let i = 1; i < data.length; i++) {
		const dt = data[i].time - data[i - 1].time;
		auc += ((data[i].concentration + data[i - 1].concentration) / 2) * dt;
	}

	// Time above MEC
	let timeAboveMEC = 0;
	for (let i = 1; i < data.length; i++) {
		if (data[i].concentration >= window.minEffective) {
			timeAboveMEC += data[i].time - data[i - 1].time;
		}
	}

	// Time below MTC (within safe range)
	let timeBelowMTC = 0;
	for (let i = 1; i < data.length; i++) {
		if (data[i].concentration < window.minToxic) {
			timeBelowMTC += data[i].time - data[i - 1].time;
		}
	}

	return {
		cmax: Math.round(cmax * 100) / 100,
		tmax: Math.round(tmax * 100) / 100,
		auc: Math.round(auc * 100) / 100,
		halfLife: Math.round(halfLife * 100) / 100,
		ke: Math.round(ke * 10000) / 10000,
		timeAboveMEC: Math.round(timeAboveMEC * 100) / 100,
		timeBelowMTC: Math.round(timeBelowMTC * 100) / 100,
		steadyStateCmin: null,
		steadyStateCmax: null
	};
}

/**
 * Calculate steady-state metrics from multi-dose data
 */
export function calculateSteadyStateMetrics(
	params: PKParameters,
	regimen: DosingRegimen
): { cssMax: number; cssMin: number } {
	const ke = calculateKe(params.clearance, params.volumeOfDistribution);
	const tau = regimen.interval;
	const F = params.route === 'oral' ? params.bioavailability : 1;
	const vd = params.volumeOfDistribution;

	// For IV bolus steady state
	const accumFactor = 1 / (1 - Math.exp(-ke * tau));

	if (params.route === 'iv-bolus') {
		const c0 = regimen.dose / vd;
		const cssMax = c0 * accumFactor;
		const cssMin = cssMax * Math.exp(-ke * tau);
		return {
			cssMax: Math.round(cssMax * 100) / 100,
			cssMin: Math.round(cssMin * 100) / 100
		};
	}

	// For oral, approximate using simulation
	const data = simulateMultiDose(params, { ...regimen, numberOfDoses: 20 });
	// Look at last dosing interval
	const lastDoseTime = 19 * regimen.interval;
	const lastInterval = data.filter(
		(p) => p.time >= lastDoseTime && p.time <= lastDoseTime + tau
	);

	let cssMax = 0;
	let cssMin = Infinity;
	for (const p of lastInterval) {
		if (p.concentration > cssMax) cssMax = p.concentration;
		if (p.concentration < cssMin) cssMin = p.concentration;
	}

	return {
		cssMax: Math.round(cssMax * 100) / 100,
		cssMin: Math.round(Math.max(0, cssMin) * 100) / 100
	};
}

// ── State Management ───────────────────────────────────────────────────────────

export function createInitialState(config: PharmacokineticsConfig): PharmacokineticsState {
	const drug = config.drugId
		? DRUG_PRESETS.find((d) => d.id === config.drugId) || DRUG_PRESETS[0]
		: DRUG_PRESETS[0];

	return {
		parameters: { ...drug.parameters },
		dosingRegimen: { ...drug.typicalRegimen },
		simulationData: [],
		therapeuticWindow: { ...drug.therapeuticWindow },
		calculatedMetrics: null,
		isSimulationRun: false,
		multiDoseData: [],
		isMultiDoseRun: false,
		selectedDrug: drug,
		completedTasks: [],
		quizAnswers: new Map()
	};
}

export function selectDrug(state: PharmacokineticsState, drugId: string): PharmacokineticsState {
	const drug = DRUG_PRESETS.find((d) => d.id === drugId);
	if (!drug) return state;

	return {
		...state,
		parameters: { ...drug.parameters },
		dosingRegimen: { ...drug.typicalRegimen },
		therapeuticWindow: { ...drug.therapeuticWindow },
		selectedDrug: drug,
		simulationData: [],
		multiDoseData: [],
		calculatedMetrics: null,
		isSimulationRun: false,
		isMultiDoseRun: false
	};
}

export function updateParameter(
	state: PharmacokineticsState,
	key: keyof PKParameters,
	value: number | string
): PharmacokineticsState {
	return {
		...state,
		parameters: { ...state.parameters, [key]: value },
		// Clear previous simulation when parameters change
		simulationData: [],
		multiDoseData: [],
		calculatedMetrics: null,
		isSimulationRun: false,
		isMultiDoseRun: false
	};
}

export function updateRegimen(
	state: PharmacokineticsState,
	key: keyof DosingRegimen,
	value: number | string
): PharmacokineticsState {
	return {
		...state,
		dosingRegimen: { ...state.dosingRegimen, [key]: value },
		multiDoseData: [],
		isMultiDoseRun: false
	};
}

export function runSingleDoseSimulation(state: PharmacokineticsState): PharmacokineticsState {
	const data = simulateSingleDose(state.parameters);
	const metrics = calculateMetrics(state.parameters, data, state.therapeuticWindow);

	const newCompleted = state.completedTasks.includes('single-dose')
		? state.completedTasks
		: [...state.completedTasks, 'single-dose'];

	return {
		...state,
		simulationData: data,
		calculatedMetrics: metrics,
		isSimulationRun: true,
		completedTasks: newCompleted
	};
}

export function runMultiDoseSimulation(state: PharmacokineticsState): PharmacokineticsState {
	const data = simulateMultiDose(state.parameters, state.dosingRegimen);
	const ss = calculateSteadyStateMetrics(state.parameters, state.dosingRegimen);

	const metrics = state.calculatedMetrics
		? { ...state.calculatedMetrics, steadyStateCmax: ss.cssMax, steadyStateCmin: ss.cssMin }
		: null;

	const newCompleted = state.completedTasks.includes('multi-dose')
		? state.completedTasks
		: [...state.completedTasks, 'multi-dose'];

	return {
		...state,
		multiDoseData: data,
		calculatedMetrics: metrics,
		isMultiDoseRun: true,
		completedTasks: newCompleted
	};
}

export function answerQuiz(
	state: PharmacokineticsState,
	questionId: string,
	answer: string
): PharmacokineticsState {
	const newAnswers = new Map(state.quizAnswers);
	newAnswers.set(questionId, answer);
	return { ...state, quizAnswers: newAnswers };
}

// ── Analysis ───────────────────────────────────────────────────────────────────

export interface PharmacokineticsAnalysis {
	score: number;
	grade: 'A' | 'B' | 'C' | 'D' | 'F';
	tasksCompleted: number;
	totalTasks: number;
	regimenQuality: 'optimal' | 'acceptable' | 'suboptimal' | 'dangerous';
	quizScore: { correct: number; total: number };
	feedback: string;
}

export function analyzePharmacokinetics(state: PharmacokineticsState): PharmacokineticsAnalysis {
	const totalTasks = 3; // single-dose, multi-dose, quiz
	const tasksCompleted = state.completedTasks.length;

	// Evaluate regimen quality
	let regimenQuality: PharmacokineticsAnalysis['regimenQuality'] = 'suboptimal';

	if (state.calculatedMetrics && state.isMultiDoseRun) {
		const ss = state.calculatedMetrics;
		const win = state.therapeuticWindow;

		if (ss.steadyStateCmax !== null && ss.steadyStateCmin !== null) {
			const maxOk = ss.steadyStateCmax <= win.minToxic;
			const minOk = ss.steadyStateCmin >= win.minEffective;

			if (maxOk && minOk) {
				regimenQuality = 'optimal';
			} else if (maxOk && ss.steadyStateCmin >= win.minEffective * 0.7) {
				regimenQuality = 'acceptable';
			} else if (ss.steadyStateCmax > win.minToxic * 1.2) {
				regimenQuality = 'dangerous';
			} else {
				regimenQuality = 'suboptimal';
			}
		}
	}

	let quizCorrect = 0;
	for (const q of PK_QUIZ) {
		if (state.quizAnswers.get(q.id) === q.correctAnswer) quizCorrect++;
	}

	// Scoring: 20% single-dose, 30% multi-dose + regimen, 50% quiz
	let score = 0;
	if (state.completedTasks.includes('single-dose')) score += 20;
	if (state.completedTasks.includes('multi-dose')) {
		score += 15;
		if (regimenQuality === 'optimal') score += 15;
		else if (regimenQuality === 'acceptable') score += 10;
		else if (regimenQuality === 'suboptimal') score += 5;
	}
	score += (quizCorrect / PK_QUIZ.length) * 50;
	score = Math.round(score);

	let grade: PharmacokineticsAnalysis['grade'];
	if (score >= 90) grade = 'A';
	else if (score >= 80) grade = 'B';
	else if (score >= 70) grade = 'C';
	else if (score >= 60) grade = 'D';
	else grade = 'F';

	let feedback: string;
	if (grade === 'A') {
		feedback =
			'Excellent! You demonstrated strong command of pharmacokinetic principles and designed an optimal dosing regimen.';
	} else if (grade === 'B') {
		feedback =
			'Good understanding of PK concepts. Your dosing regimen could be further optimized for the therapeutic window.';
	} else if (grade === 'C') {
		feedback =
			'Fair. Review the relationship between clearance, volume of distribution, and half-life.';
	} else {
		feedback =
			'Review fundamental PK equations: Ke = CL/Vd, t1/2 = 0.693/Ke, and the one-compartment model equations.';
	}

	return {
		score,
		grade,
		tasksCompleted,
		totalTasks,
		regimenQuality,
		quizScore: { correct: quizCorrect, total: PK_QUIZ.length },
		feedback
	};
}

// ── Quiz ───────────────────────────────────────────────────────────────────────

export interface QuizQuestion {
	id: string;
	question: string;
	options: string[];
	correctAnswer: string;
	explanation: string;
}

export const PK_QUIZ: QuizQuestion[] = [
	{
		id: 'pk1',
		question: 'The elimination rate constant (Ke) is calculated as:',
		options: ['Vd / CL', 'CL / Vd', 'CL x Vd', '0.693 / CL'],
		correctAnswer: 'CL / Vd',
		explanation:
			'Ke = CL / Vd. The elimination rate constant relates clearance (volume cleared per time) to the volume of distribution.'
	},
	{
		id: 'pk2',
		question: 'Half-life (t1/2) is related to Ke by:',
		options: ['t1/2 = Ke / 0.693', 't1/2 = 0.693 / Ke', 't1/2 = 0.693 x Ke', 't1/2 = ln(2) x Ke'],
		correctAnswer: 't1/2 = 0.693 / Ke',
		explanation:
			't1/2 = 0.693 / Ke = ln(2) / Ke. This is derived from the first-order elimination equation.'
	},
	{
		id: 'pk3',
		question: 'Steady state is typically reached after approximately:',
		options: ['1-2 half-lives', '3-5 half-lives', '7-10 half-lives', '1 half-life'],
		correctAnswer: '3-5 half-lives',
		explanation:
			'Steady state is reached after approximately 4-5 half-lives when drug input equals drug elimination. At 5 half-lives, ~97% of steady state is achieved.'
	},
	{
		id: 'pk4',
		question: 'Increasing the volume of distribution (Vd) while keeping clearance constant will:',
		options: [
			'Decrease half-life and increase Cmax',
			'Increase half-life and decrease Cmax',
			'Decrease both half-life and Cmax',
			'Have no effect on half-life'
		],
		correctAnswer: 'Increase half-life and decrease Cmax',
		explanation:
			'A larger Vd means the drug distributes into more tissue, reducing peak concentration (Cmax = Dose/Vd for IV). Since t1/2 = 0.693 x Vd/CL, increasing Vd increases half-life.'
	},
	{
		id: 'pk5',
		question:
			'AUC (Area Under the Curve) after a single oral dose is calculated as:',
		options: ['F x Dose / CL', 'Dose / Vd', 'F x Dose / Vd', 'Dose x CL'],
		correctAnswer: 'F x Dose / CL',
		explanation:
			'AUC = F x Dose / CL. This reflects total drug exposure. For IV (F=1), AUC = Dose / CL.'
	}
];
