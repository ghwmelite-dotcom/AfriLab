/**
 * Dosage Calculations Laboratory Simulation
 * Pharmacy experiment for calculating drug doses across patient populations
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export interface DosageState {
	currentScenarioIndex: number;
	scenarios: PatientScenario[];
	answers: DosageAnswer[];
	completedScenarios: string[];
	quizAnswers: Map<string, string>;
}

export interface PatientScenario {
	id: string;
	name: string;
	age: number;
	weight: number; // kg
	height: number; // cm
	sex: 'male' | 'female';
	condition: string;
	serumCreatinine: number; // mg/dL
	bsa: number; // m² (body surface area, pre-calculated)
	drugOrder: DrugOrder;
	category: 'pediatric' | 'adult' | 'geriatric';
	description: string;
}

export interface DrugOrder {
	drugName: string;
	dosePerKg: number | null; // mg/kg (null if BSA-based)
	dosePerBSA: number | null; // mg/m² (null if weight-based)
	maxSingleDose: number; // mg
	frequency: string; // e.g., "every 8 hours"
	route: 'oral' | 'IV' | 'IM';
	concentration: number; // mg/mL for liquid/injectable forms
	concentrationUnit: string;
	requiresRenalAdjustment: boolean;
	renalThreshold: number; // CrCl below which dose must be reduced
	renalAdjustmentFactor: number; // multiply dose by this if renal impaired
	ivRate: number | null; // mL/hr if IV
	infusionDuration: number | null; // minutes if IV
}

export interface DosageAnswer {
	scenarioId: string;
	calculatedDose: number | null; // mg
	calculatedVolume: number | null; // mL
	calculatedRate: number | null; // mL/hr or drops/min
	creatinineClearance: number | null; // mL/min
	isRenalAdjusted: boolean;
	submittedAt: number;
}

export interface DosageConfig {
	difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// ── Constants ──────────────────────────────────────────────────────────────────

export const PATIENT_SCENARIOS: PatientScenario[] = [
	{
		id: 'ped-amoxicillin',
		name: 'Amara K.',
		age: 5,
		weight: 18,
		height: 108,
		sex: 'female',
		condition: 'Acute otitis media',
		serumCreatinine: 0.4,
		bsa: 0.74,
		category: 'pediatric',
		description: 'A 5-year-old girl presents with ear pain and fever. Diagnosed with acute otitis media.',
		drugOrder: {
			drugName: 'Amoxicillin',
			dosePerKg: 25,
			dosePerBSA: null,
			maxSingleDose: 500,
			frequency: 'every 8 hours',
			route: 'oral',
			concentration: 50, // 250mg/5mL = 50mg/mL
			concentrationUnit: 'mg/mL (250mg/5mL)',
			requiresRenalAdjustment: false,
			renalThreshold: 0,
			renalAdjustmentFactor: 1,
			ivRate: null,
			infusionDuration: null
		}
	},
	{
		id: 'adult-vancomycin',
		name: 'Kwame O.',
		age: 45,
		weight: 78,
		height: 175,
		sex: 'male',
		condition: 'MRSA bacteremia',
		serumCreatinine: 1.1,
		bsa: 1.94,
		category: 'adult',
		description: 'A 45-year-old male admitted with MRSA bloodstream infection. Requires IV vancomycin.',
		drugOrder: {
			drugName: 'Vancomycin',
			dosePerKg: 15,
			dosePerBSA: null,
			maxSingleDose: 2000,
			frequency: 'every 12 hours',
			route: 'IV',
			concentration: 5, // 5 mg/mL after reconstitution
			concentrationUnit: 'mg/mL',
			requiresRenalAdjustment: true,
			renalThreshold: 50,
			renalAdjustmentFactor: 0.5,
			ivRate: null,
			infusionDuration: 60
		}
	},
	{
		id: 'ger-gentamicin',
		name: 'Fatima B.',
		age: 72,
		weight: 55,
		height: 158,
		sex: 'female',
		condition: 'Urinary tract infection (complicated)',
		serumCreatinine: 1.8,
		bsa: 1.55,
		category: 'geriatric',
		description: 'A 72-year-old female with a complicated UTI and declining renal function. Needs gentamicin.',
		drugOrder: {
			drugName: 'Gentamicin',
			dosePerKg: 5,
			dosePerBSA: null,
			maxSingleDose: 500,
			frequency: 'every 24 hours',
			route: 'IV',
			concentration: 10, // 10 mg/mL
			concentrationUnit: 'mg/mL',
			requiresRenalAdjustment: true,
			renalThreshold: 60,
			renalAdjustmentFactor: 0.6,
			ivRate: null,
			infusionDuration: 30
		}
	},
	{
		id: 'ped-methotrexate',
		name: 'Samuel T.',
		age: 8,
		weight: 25,
		height: 128,
		sex: 'male',
		condition: 'Acute lymphoblastic leukemia (maintenance)',
		serumCreatinine: 0.5,
		bsa: 0.95,
		category: 'pediatric',
		description: 'An 8-year-old boy on maintenance chemotherapy for ALL. Requires BSA-based dosing.',
		drugOrder: {
			drugName: 'Methotrexate',
			dosePerKg: null,
			dosePerBSA: 20,
			maxSingleDose: 30,
			frequency: 'once weekly',
			route: 'oral',
			concentration: 2.5, // 2.5 mg/mL oral solution
			concentrationUnit: 'mg/mL',
			requiresRenalAdjustment: true,
			renalThreshold: 60,
			renalAdjustmentFactor: 0.5,
			ivRate: null,
			infusionDuration: null
		}
	},
	{
		id: 'adult-dopamine',
		name: 'Ngozi E.',
		age: 58,
		weight: 82,
		height: 168,
		sex: 'female',
		condition: 'Cardiogenic shock',
		serumCreatinine: 1.3,
		bsa: 1.93,
		category: 'adult',
		description: 'A 58-year-old female in the ICU with cardiogenic shock. Requires dopamine IV drip.',
		drugOrder: {
			drugName: 'Dopamine',
			dosePerKg: 0.005, // 5 mcg/kg/min expressed in mg for calculation
			dosePerBSA: null,
			maxSingleDose: 999,
			frequency: 'continuous infusion',
			route: 'IV',
			concentration: 1.6, // 400mg in 250mL = 1.6 mg/mL
			concentrationUnit: 'mg/mL (400mg/250mL)',
			requiresRenalAdjustment: false,
			renalThreshold: 0,
			renalAdjustmentFactor: 1,
			ivRate: null, // must be calculated
			infusionDuration: null
		}
	}
];

// ── Helper Functions ───────────────────────────────────────────────────────────

/**
 * Cockcroft-Gault equation for creatinine clearance
 */
export function calculateCrCl(
	age: number,
	weight: number,
	serumCreatinine: number,
	sex: 'male' | 'female'
): number {
	const base = ((140 - age) * weight) / (72 * serumCreatinine);
	return sex === 'female' ? base * 0.85 : base;
}

/**
 * Calculate weight-based dose in mg
 */
export function calculateWeightBasedDose(weight: number, dosePerKg: number, maxDose: number): number {
	return Math.min(weight * dosePerKg, maxDose);
}

/**
 * Calculate BSA-based dose in mg
 */
export function calculateBSABasedDose(bsa: number, dosePerBSA: number, maxDose: number): number {
	return Math.min(bsa * dosePerBSA, maxDose);
}

/**
 * Calculate volume to administer in mL
 */
export function calculateVolume(doseMg: number, concentrationMgPerMl: number): number {
	return doseMg / concentrationMgPerMl;
}

/**
 * Calculate IV drip rate in mL/hr
 */
export function calculateDripRate(volumeMl: number, durationMinutes: number): number {
	return (volumeMl / durationMinutes) * 60;
}

/**
 * Calculate continuous infusion rate for mcg/kg/min drugs
 * dosePerKg is in mg/kg/min, concentration in mg/mL
 */
export function calculateContinuousRate(
	weight: number,
	doseMgPerKgPerMin: number,
	concentrationMgPerMl: number
): number {
	// rate (mL/hr) = (dose mg/kg/min * weight kg * 60 min) / concentration mg/mL
	return (doseMgPerKgPerMin * weight * 60) / concentrationMgPerMl;
}

/**
 * Get the correct answers for a scenario
 */
export function getCorrectAnswers(scenario: PatientScenario): {
	dose: number;
	volume: number;
	rate: number | null;
	crCl: number;
	needsRenalAdjustment: boolean;
} {
	const crCl = calculateCrCl(
		scenario.age,
		scenario.weight,
		scenario.serumCreatinine,
		scenario.sex
	);

	const needsRenalAdjustment =
		scenario.drugOrder.requiresRenalAdjustment && crCl < scenario.drugOrder.renalThreshold;

	let dose: number;
	if (scenario.drugOrder.dosePerBSA !== null) {
		dose = calculateBSABasedDose(scenario.bsa, scenario.drugOrder.dosePerBSA, scenario.drugOrder.maxSingleDose);
	} else {
		dose = calculateWeightBasedDose(scenario.weight, scenario.drugOrder.dosePerKg!, scenario.drugOrder.maxSingleDose);
	}

	if (needsRenalAdjustment) {
		dose *= scenario.drugOrder.renalAdjustmentFactor;
	}

	const volume = calculateVolume(dose, scenario.drugOrder.concentration);

	let rate: number | null = null;
	if (scenario.drugOrder.route === 'IV') {
		if (scenario.drugOrder.frequency === 'continuous infusion') {
			rate = calculateContinuousRate(
				scenario.weight,
				scenario.drugOrder.dosePerKg!,
				scenario.drugOrder.concentration
			);
		} else if (scenario.drugOrder.infusionDuration) {
			rate = calculateDripRate(volume, scenario.drugOrder.infusionDuration);
		}
	}

	return { dose, volume, rate, crCl, needsRenalAdjustment };
}

// ── State Management ───────────────────────────────────────────────────────────

export function createInitialState(config: DosageConfig): DosageState {
	let scenarios: PatientScenario[];
	switch (config.difficulty) {
		case 'beginner':
			scenarios = PATIENT_SCENARIOS.slice(0, 2);
			break;
		case 'intermediate':
			scenarios = PATIENT_SCENARIOS.slice(0, 4);
			break;
		case 'advanced':
		default:
			scenarios = [...PATIENT_SCENARIOS];
			break;
	}

	return {
		currentScenarioIndex: 0,
		scenarios,
		answers: [],
		completedScenarios: [],
		quizAnswers: new Map()
	};
}

export function selectScenario(state: DosageState, index: number): DosageState {
	if (index < 0 || index >= state.scenarios.length) return state;
	return { ...state, currentScenarioIndex: index };
}

export function submitAnswer(
	state: DosageState,
	scenarioId: string,
	answer: {
		calculatedDose: number | null;
		calculatedVolume: number | null;
		calculatedRate: number | null;
		creatinineClearance: number | null;
		isRenalAdjusted: boolean;
	}
): DosageState {
	const existingIndex = state.answers.findIndex((a) => a.scenarioId === scenarioId);
	const newAnswer: DosageAnswer = {
		scenarioId,
		...answer,
		submittedAt: Date.now()
	};

	let newAnswers: DosageAnswer[];
	if (existingIndex >= 0) {
		newAnswers = [...state.answers];
		newAnswers[existingIndex] = newAnswer;
	} else {
		newAnswers = [...state.answers, newAnswer];
	}

	const newCompleted = state.completedScenarios.includes(scenarioId)
		? state.completedScenarios
		: [...state.completedScenarios, scenarioId];

	return {
		...state,
		answers: newAnswers,
		completedScenarios: newCompleted
	};
}

export function answerQuiz(state: DosageState, questionId: string, answer: string): DosageState {
	const newAnswers = new Map(state.quizAnswers);
	newAnswers.set(questionId, answer);
	return { ...state, quizAnswers: newAnswers };
}

// ── Analysis ───────────────────────────────────────────────────────────────────

export interface DosageAnalysis {
	score: number;
	grade: 'A' | 'B' | 'C' | 'D' | 'F';
	scenarioResults: ScenarioResult[];
	quizScore: { correct: number; total: number };
	feedback: string;
}

export interface ScenarioResult {
	scenarioId: string;
	patientName: string;
	drugName: string;
	doseAccuracy: number;
	volumeAccuracy: number;
	rateAccuracy: number | null;
	crClAccuracy: number | null;
	renalCorrect: boolean;
	overallAccuracy: number;
}

function accuracyPercent(submitted: number | null, correct: number): number {
	if (submitted === null || submitted === 0) return 0;
	return Math.max(0, 100 - Math.abs((submitted - correct) / correct) * 100);
}

export function analyzeDosageCalculations(state: DosageState): DosageAnalysis {
	const scenarioResults: ScenarioResult[] = state.scenarios.map((scenario) => {
		const answer = state.answers.find((a) => a.scenarioId === scenario.id);
		const correct = getCorrectAnswers(scenario);

		if (!answer) {
			return {
				scenarioId: scenario.id,
				patientName: scenario.name,
				drugName: scenario.drugOrder.drugName,
				doseAccuracy: 0,
				volumeAccuracy: 0,
				rateAccuracy: null,
				crClAccuracy: scenario.drugOrder.requiresRenalAdjustment ? 0 : null,
				renalCorrect: false,
				overallAccuracy: 0
			};
		}

		const doseAcc = accuracyPercent(answer.calculatedDose, correct.dose);
		const volAcc = accuracyPercent(answer.calculatedVolume, correct.volume);
		const rateAcc = correct.rate !== null ? accuracyPercent(answer.calculatedRate, correct.rate) : null;
		const crClAcc = scenario.drugOrder.requiresRenalAdjustment
			? accuracyPercent(answer.creatinineClearance, correct.crCl)
			: null;
		const renalCorrect = answer.isRenalAdjusted === correct.needsRenalAdjustment;

		const components = [doseAcc, volAcc];
		if (rateAcc !== null) components.push(rateAcc);
		if (crClAcc !== null) components.push(crClAcc);
		if (scenario.drugOrder.requiresRenalAdjustment) components.push(renalCorrect ? 100 : 0);

		const overallAccuracy = components.reduce((a, b) => a + b, 0) / components.length;

		return {
			scenarioId: scenario.id,
			patientName: scenario.name,
			drugName: scenario.drugOrder.drugName,
			doseAccuracy: doseAcc,
			volumeAccuracy: volAcc,
			rateAccuracy: rateAcc,
			crClAccuracy: crClAcc,
			renalCorrect,
			overallAccuracy
		};
	});

	// Quiz scoring (30% of total)
	let quizCorrect = 0;
	for (const q of DOSAGE_QUIZ) {
		if (state.quizAnswers.get(q.id) === q.correctAnswer) quizCorrect++;
	}

	const avgScenarioScore =
		scenarioResults.length > 0
			? scenarioResults.reduce((s, r) => s + r.overallAccuracy, 0) / scenarioResults.length
			: 0;

	// 70% scenarios, 30% quiz
	const score = Math.round(
		avgScenarioScore * 0.7 + (quizCorrect / DOSAGE_QUIZ.length) * 100 * 0.3
	);

	let grade: DosageAnalysis['grade'];
	if (score >= 90) grade = 'A';
	else if (score >= 80) grade = 'B';
	else if (score >= 70) grade = 'C';
	else if (score >= 60) grade = 'D';
	else grade = 'F';

	let feedback: string;
	if (grade === 'A') {
		feedback =
			'Excellent! Your dosage calculations are accurate and you demonstrate strong understanding of pharmacokinetic principles.';
	} else if (grade === 'B') {
		feedback =
			'Good work. Minor calculation errors were present. Double-check unit conversions and rounding.';
	} else if (grade === 'C') {
		feedback =
			'Fair performance. Review weight-based and BSA-based dosing formulas carefully.';
	} else {
		feedback =
			'Significant errors detected. Revisit the Cockcroft-Gault equation, mg/kg dosing, and IV rate calculations.';
	}

	return {
		score,
		grade,
		scenarioResults,
		quizScore: { correct: quizCorrect, total: DOSAGE_QUIZ.length },
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

export const DOSAGE_QUIZ: QuizQuestion[] = [
	{
		id: 'dq1',
		question: 'The Cockcroft-Gault equation estimates which pharmacokinetic parameter?',
		options: [
			'Volume of distribution',
			'Creatinine clearance',
			'Hepatic clearance',
			'Bioavailability'
		],
		correctAnswer: 'Creatinine clearance',
		explanation:
			'The Cockcroft-Gault equation estimates creatinine clearance (CrCl) using age, weight, serum creatinine, and sex. It is widely used for renal dose adjustments.'
	},
	{
		id: 'dq2',
		question: 'A 70 kg patient needs amikacin at 15 mg/kg/day in 3 divided doses. What is each dose?',
		options: ['150 mg', '250 mg', '350 mg', '500 mg'],
		correctAnswer: '350 mg',
		explanation:
			'Total daily dose = 70 kg x 15 mg/kg = 1050 mg. Divided into 3 doses: 1050 / 3 = 350 mg per dose.'
	},
	{
		id: 'dq3',
		question:
			'A drug is available as 125 mg/5 mL. How many mL are needed for a 200 mg dose?',
		options: ['6 mL', '8 mL', '10 mL', '12 mL'],
		correctAnswer: '8 mL',
		explanation:
			'Concentration = 125 mg / 5 mL = 25 mg/mL. Volume = 200 mg / 25 mg/mL = 8 mL.'
	},
	{
		id: 'dq4',
		question:
			'Which factor in the Cockcroft-Gault equation accounts for lower muscle mass in females?',
		options: [
			'Multiply by 1.15',
			'Multiply by 0.85',
			'Multiply by 0.72',
			'Divide by 140'
		],
		correctAnswer: 'Multiply by 0.85',
		explanation:
			'For females, the CrCl from the Cockcroft-Gault equation is multiplied by 0.85 to account for lower muscle mass and creatinine production.'
	},
	{
		id: 'dq5',
		question:
			'An IV bag contains 1 g of drug in 250 mL. The order is for 500 mg over 30 min. What is the rate in mL/hr?',
		options: ['125 mL/hr', '250 mL/hr', '500 mL/hr', '62.5 mL/hr'],
		correctAnswer: '250 mL/hr',
		explanation:
			'Concentration = 1000 mg / 250 mL = 4 mg/mL. Volume for 500 mg = 500 / 4 = 125 mL. Rate = 125 mL / 0.5 hr = 250 mL/hr.'
	}
];
