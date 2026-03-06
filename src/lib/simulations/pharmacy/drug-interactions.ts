/**
 * Drug Interactions Laboratory Simulation
 * Pharmacy experiment for identifying and managing drug-drug interactions
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export interface DrugInteractionState {
	patient: VirtualPatient;
	currentMedications: Medication[];
	detectedInteractions: DetectedInteraction[];
	recommendations: Recommendation[];
	assessments: InteractionAssessment[];
	completedTasks: string[];
	quizAnswers: Map<string, string>;
}

export interface VirtualPatient {
	id: string;
	name: string;
	age: number;
	sex: 'male' | 'female';
	weight: number;
	conditions: string[];
	allergies: string[];
	description: string;
}

export interface Medication {
	id: string;
	name: string;
	genericName: string;
	drugClass: string;
	dose: string;
	frequency: string;
	route: string;
	indication: string;
	cyp450: CYP450Profile;
	proteinBinding: number; // percentage
	renalElimination: number; // percentage
	narrowTherapeuticIndex: boolean;
}

export interface CYP450Profile {
	substrate: string[]; // e.g., ['CYP3A4', 'CYP2D6']
	inhibitor: string[];
	inducer: string[];
}

export interface DrugInteraction {
	drug1Id: string;
	drug2Id: string;
	severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
	mechanism: InteractionMechanism;
	description: string;
	clinicalEffect: string;
	management: string;
	evidenceLevel: 'established' | 'probable' | 'suspected' | 'theoretical';
}

export type InteractionMechanism =
	| 'cyp450-inhibition'
	| 'cyp450-induction'
	| 'protein-binding'
	| 'renal-competition'
	| 'pharmacodynamic-synergism'
	| 'pharmacodynamic-antagonism'
	| 'absorption-alteration'
	| 'qta-prolongation';

export interface DetectedInteraction {
	id: string;
	drug1: Medication;
	drug2: Medication;
	interaction: DrugInteraction;
	isIdentifiedByStudent: boolean;
}

export interface Recommendation {
	id: string;
	interactionId: string;
	type: 'monitor' | 'dose-adjust' | 'substitute' | 'discontinue';
	description: string;
	alternativeDrug: string | null;
}

export interface InteractionAssessment {
	interactionId: string;
	studentSeverity: string;
	studentMechanism: string;
	studentRecommendation: string;
	isCorrect: boolean;
}

export interface DrugInteractionConfig {
	patientId: string;
}

// ── Data ───────────────────────────────────────────────────────────────────────

export const PATIENTS: VirtualPatient[] = [
	{
		id: 'patient-1',
		name: 'Blessing A.',
		age: 65,
		sex: 'female',
		weight: 70,
		conditions: ['Hypertension', 'Type 2 Diabetes', 'Atrial Fibrillation', 'Depression'],
		allergies: ['Sulfonamides'],
		description:
			'A 65-year-old woman with multiple chronic conditions presenting for medication review.'
	},
	{
		id: 'patient-2',
		name: 'Ibrahim M.',
		age: 52,
		sex: 'male',
		weight: 85,
		conditions: ['HIV/AIDS', 'Tuberculosis', 'Hypertension'],
		allergies: [],
		description:
			'A 52-year-old man on antiretroviral therapy co-infected with TB, requiring anti-TB medications.'
	}
];

export const MEDICATION_DATABASE: Medication[] = [
	{
		id: 'warfarin',
		name: 'Warfarin',
		genericName: 'Warfarin sodium',
		drugClass: 'Anticoagulant',
		dose: '5 mg',
		frequency: 'Once daily',
		route: 'Oral',
		indication: 'Atrial fibrillation',
		cyp450: { substrate: ['CYP2C9', 'CYP3A4', 'CYP1A2'], inhibitor: [], inducer: [] },
		proteinBinding: 99,
		renalElimination: 0,
		narrowTherapeuticIndex: true
	},
	{
		id: 'metformin',
		name: 'Metformin',
		genericName: 'Metformin hydrochloride',
		drugClass: 'Biguanide',
		dose: '500 mg',
		frequency: 'Twice daily',
		route: 'Oral',
		indication: 'Type 2 Diabetes',
		cyp450: { substrate: [], inhibitor: [], inducer: [] },
		proteinBinding: 0,
		renalElimination: 90,
		narrowTherapeuticIndex: false
	},
	{
		id: 'amlodipine',
		name: 'Amlodipine',
		genericName: 'Amlodipine besylate',
		drugClass: 'Calcium channel blocker',
		dose: '5 mg',
		frequency: 'Once daily',
		route: 'Oral',
		indication: 'Hypertension',
		cyp450: { substrate: ['CYP3A4'], inhibitor: [], inducer: [] },
		proteinBinding: 93,
		renalElimination: 10,
		narrowTherapeuticIndex: false
	},
	{
		id: 'fluoxetine',
		name: 'Fluoxetine',
		genericName: 'Fluoxetine hydrochloride',
		drugClass: 'SSRI',
		dose: '20 mg',
		frequency: 'Once daily',
		route: 'Oral',
		indication: 'Depression',
		cyp450: { substrate: ['CYP2D6'], inhibitor: ['CYP2D6', 'CYP2C19', 'CYP3A4'], inducer: [] },
		proteinBinding: 95,
		renalElimination: 11,
		narrowTherapeuticIndex: false
	},
	{
		id: 'simvastatin',
		name: 'Simvastatin',
		genericName: 'Simvastatin',
		drugClass: 'HMG-CoA reductase inhibitor',
		dose: '20 mg',
		frequency: 'Once daily at bedtime',
		route: 'Oral',
		indication: 'Hyperlipidemia',
		cyp450: { substrate: ['CYP3A4'], inhibitor: [], inducer: [] },
		proteinBinding: 95,
		renalElimination: 13,
		narrowTherapeuticIndex: false
	},
	{
		id: 'omeprazole',
		name: 'Omeprazole',
		genericName: 'Omeprazole',
		drugClass: 'Proton pump inhibitor',
		dose: '20 mg',
		frequency: 'Once daily',
		route: 'Oral',
		indication: 'GERD prophylaxis',
		cyp450: { substrate: ['CYP2C19', 'CYP3A4'], inhibitor: ['CYP2C19'], inducer: [] },
		proteinBinding: 95,
		renalElimination: 77,
		narrowTherapeuticIndex: false
	},
	{
		id: 'rifampicin',
		name: 'Rifampicin',
		genericName: 'Rifampicin',
		drugClass: 'Rifamycin antibiotic',
		dose: '600 mg',
		frequency: 'Once daily',
		route: 'Oral',
		indication: 'Tuberculosis',
		cyp450: { substrate: [], inhibitor: [], inducer: ['CYP3A4', 'CYP2C9', 'CYP2C19', 'CYP1A2'] },
		proteinBinding: 89,
		renalElimination: 15,
		narrowTherapeuticIndex: false
	},
	{
		id: 'efavirenz',
		name: 'Efavirenz',
		genericName: 'Efavirenz',
		drugClass: 'NNRTI',
		dose: '600 mg',
		frequency: 'Once daily at bedtime',
		route: 'Oral',
		indication: 'HIV/AIDS',
		cyp450: { substrate: ['CYP2B6', 'CYP3A4'], inhibitor: ['CYP2C9', 'CYP2C19'], inducer: ['CYP3A4'] },
		proteinBinding: 99.5,
		renalElimination: 1,
		narrowTherapeuticIndex: false
	},
	{
		id: 'isoniazid',
		name: 'Isoniazid',
		genericName: 'Isoniazid',
		drugClass: 'Anti-tuberculosis',
		dose: '300 mg',
		frequency: 'Once daily',
		route: 'Oral',
		indication: 'Tuberculosis',
		cyp450: { substrate: [], inhibitor: ['CYP2C19', 'CYP2E1'], inducer: [] },
		proteinBinding: 10,
		renalElimination: 75,
		narrowTherapeuticIndex: false
	},
	{
		id: 'aspirin',
		name: 'Aspirin (low-dose)',
		genericName: 'Acetylsalicylic acid',
		drugClass: 'NSAID / Antiplatelet',
		dose: '81 mg',
		frequency: 'Once daily',
		route: 'Oral',
		indication: 'Cardiovascular prophylaxis',
		cyp450: { substrate: [], inhibitor: [], inducer: [] },
		proteinBinding: 87,
		renalElimination: 80,
		narrowTherapeuticIndex: false
	},
	{
		id: 'erythromycin',
		name: 'Erythromycin',
		genericName: 'Erythromycin',
		drugClass: 'Macrolide antibiotic',
		dose: '500 mg',
		frequency: 'Four times daily',
		route: 'Oral',
		indication: 'Infection',
		cyp450: { substrate: ['CYP3A4'], inhibitor: ['CYP3A4'], inducer: [] },
		proteinBinding: 84,
		renalElimination: 15,
		narrowTherapeuticIndex: false
	},
	{
		id: 'carbamazepine',
		name: 'Carbamazepine',
		genericName: 'Carbamazepine',
		drugClass: 'Anticonvulsant',
		dose: '200 mg',
		frequency: 'Twice daily',
		route: 'Oral',
		indication: 'Seizures / Neuropathic pain',
		cyp450: { substrate: ['CYP3A4'], inhibitor: [], inducer: ['CYP3A4', 'CYP2C9', 'CYP1A2'] },
		proteinBinding: 76,
		renalElimination: 3,
		narrowTherapeuticIndex: true
	}
];

// Pre-defined interactions
export const KNOWN_INTERACTIONS: DrugInteraction[] = [
	{
		drug1Id: 'warfarin',
		drug2Id: 'fluoxetine',
		severity: 'major',
		mechanism: 'cyp450-inhibition',
		description:
			'Fluoxetine inhibits CYP2C9, the primary metabolic pathway for the more potent S-warfarin enantiomer.',
		clinicalEffect: 'Increased anticoagulant effect, risk of bleeding.',
		management:
			'Monitor INR closely. Consider reducing warfarin dose by 25-50%. Use alternative SSRI (e.g., sertraline) with less CYP interaction.',
		evidenceLevel: 'established'
	},
	{
		drug1Id: 'warfarin',
		drug2Id: 'aspirin',
		severity: 'major',
		mechanism: 'pharmacodynamic-synergism',
		description:
			'Both drugs impair hemostasis through different mechanisms (coagulation cascade vs platelet inhibition).',
		clinicalEffect: 'Significantly increased bleeding risk, especially GI bleeds.',
		management:
			'Evaluate risk/benefit. If both needed, use lowest effective aspirin dose and monitor for bleeding.',
		evidenceLevel: 'established'
	},
	{
		drug1Id: 'warfarin',
		drug2Id: 'omeprazole',
		severity: 'moderate',
		mechanism: 'cyp450-inhibition',
		description: 'Omeprazole inhibits CYP2C19 which contributes to R-warfarin metabolism.',
		clinicalEffect: 'Mildly increased anticoagulant effect.',
		management: 'Monitor INR when starting or stopping PPI. Consider pantoprazole as alternative.',
		evidenceLevel: 'probable'
	},
	{
		drug1Id: 'simvastatin',
		drug2Id: 'fluoxetine',
		severity: 'moderate',
		mechanism: 'cyp450-inhibition',
		description: 'Fluoxetine inhibits CYP3A4, the primary metabolic pathway for simvastatin.',
		clinicalEffect: 'Increased simvastatin levels, elevated risk of myopathy/rhabdomyolysis.',
		management:
			'Limit simvastatin dose to 20 mg/day or switch to rosuvastatin (not CYP3A4 dependent).',
		evidenceLevel: 'probable'
	},
	{
		drug1Id: 'simvastatin',
		drug2Id: 'erythromycin',
		severity: 'contraindicated',
		mechanism: 'cyp450-inhibition',
		description: 'Erythromycin is a strong CYP3A4 inhibitor. Simvastatin is extensively metabolized by CYP3A4.',
		clinicalEffect: 'Markedly increased simvastatin levels with high risk of rhabdomyolysis.',
		management: 'Combination is contraindicated. Use azithromycin or switch statin to rosuvastatin.',
		evidenceLevel: 'established'
	},
	{
		drug1Id: 'simvastatin',
		drug2Id: 'amlodipine',
		severity: 'moderate',
		mechanism: 'cyp450-inhibition',
		description: 'Amlodipine weakly inhibits CYP3A4 and may increase simvastatin exposure.',
		clinicalEffect: 'Increased statin levels; limit simvastatin to 20 mg daily.',
		management: 'Do not exceed simvastatin 20 mg/day with amlodipine.',
		evidenceLevel: 'established'
	},
	{
		drug1Id: 'rifampicin',
		drug2Id: 'efavirenz',
		severity: 'major',
		mechanism: 'cyp450-induction',
		description: 'Rifampicin induces CYP3A4, reducing efavirenz plasma concentrations.',
		clinicalEffect: 'Subtherapeutic antiretroviral levels, risk of HIV treatment failure.',
		management:
			'Increase efavirenz to 800 mg/day or use rifabutin instead of rifampicin. Monitor viral load.',
		evidenceLevel: 'established'
	},
	{
		drug1Id: 'rifampicin',
		drug2Id: 'warfarin',
		severity: 'major',
		mechanism: 'cyp450-induction',
		description:
			'Rifampicin is a potent inducer of CYP2C9 and CYP3A4, dramatically increasing warfarin clearance.',
		clinicalEffect: 'Markedly reduced anticoagulant effect; INR may drop to subtherapeutic levels.',
		management:
			'Increase warfarin dose significantly (may need 2-3x dose). Monitor INR very closely. Adjust dose when rifampicin is stopped.',
		evidenceLevel: 'established'
	},
	{
		drug1Id: 'isoniazid',
		drug2Id: 'carbamazepine',
		severity: 'major',
		mechanism: 'cyp450-inhibition',
		description:
			'Isoniazid inhibits CYP enzymes that metabolize carbamazepine, increasing its plasma levels.',
		clinicalEffect: 'Carbamazepine toxicity: dizziness, ataxia, nystagmus, visual disturbances.',
		management:
			'Monitor carbamazepine levels. May need to reduce carbamazepine dose by 30-50%. Watch for toxicity signs.',
		evidenceLevel: 'established'
	},
	{
		drug1Id: 'fluoxetine',
		drug2Id: 'carbamazepine',
		severity: 'moderate',
		mechanism: 'cyp450-inhibition',
		description: 'Fluoxetine inhibits CYP3A4, potentially increasing carbamazepine levels.',
		clinicalEffect: 'Increased carbamazepine levels with risk of toxicity.',
		management: 'Monitor carbamazepine levels; consider alternative antidepressant.',
		evidenceLevel: 'probable'
	}
];

export const MECHANISM_LABELS: Record<InteractionMechanism, string> = {
	'cyp450-inhibition': 'CYP450 Enzyme Inhibition',
	'cyp450-induction': 'CYP450 Enzyme Induction',
	'protein-binding': 'Protein Binding Displacement',
	'renal-competition': 'Renal Elimination Competition',
	'pharmacodynamic-synergism': 'Pharmacodynamic Synergism',
	'pharmacodynamic-antagonism': 'Pharmacodynamic Antagonism',
	'absorption-alteration': 'Absorption Alteration',
	'qta-prolongation': 'QT Prolongation Additive'
};

export const SEVERITY_COLORS: Record<string, string> = {
	minor: '#22c55e',
	moderate: '#f59e0b',
	major: '#ef4444',
	contraindicated: '#991b1b'
};

// ── State Management ───────────────────────────────────────────────────────────

function findInteractionBetween(id1: string, id2: string): DrugInteraction | null {
	return (
		KNOWN_INTERACTIONS.find(
			(i) =>
				(i.drug1Id === id1 && i.drug2Id === id2) ||
				(i.drug1Id === id2 && i.drug2Id === id1)
		) || null
	);
}

export function createInitialState(config: DrugInteractionConfig): DrugInteractionState {
	const patient = PATIENTS.find((p) => p.id === config.patientId) || PATIENTS[0];

	// Assign initial medications based on patient conditions
	let initialMeds: Medication[];
	if (patient.id === 'patient-1') {
		initialMeds = [
			MEDICATION_DATABASE.find((m) => m.id === 'warfarin')!,
			MEDICATION_DATABASE.find((m) => m.id === 'metformin')!,
			MEDICATION_DATABASE.find((m) => m.id === 'amlodipine')!
		];
	} else {
		initialMeds = [
			MEDICATION_DATABASE.find((m) => m.id === 'efavirenz')!,
			MEDICATION_DATABASE.find((m) => m.id === 'amlodipine')!
		];
	}

	return {
		patient,
		currentMedications: initialMeds,
		detectedInteractions: [],
		recommendations: [],
		assessments: [],
		completedTasks: [],
		quizAnswers: new Map()
	};
}

export function addMedication(state: DrugInteractionState, medicationId: string): DrugInteractionState {
	const med = MEDICATION_DATABASE.find((m) => m.id === medicationId);
	if (!med || state.currentMedications.some((m) => m.id === medicationId)) return state;

	const newMeds = [...state.currentMedications, med];

	// Detect new interactions
	const newDetected = [...state.detectedInteractions];
	for (const existing of state.currentMedications) {
		const interaction = findInteractionBetween(med.id, existing.id);
		if (interaction && !newDetected.some((d) => d.interaction === interaction)) {
			newDetected.push({
				id: `int-${med.id}-${existing.id}`,
				drug1: existing,
				drug2: med,
				interaction,
				isIdentifiedByStudent: false
			});
		}
	}

	return {
		...state,
		currentMedications: newMeds,
		detectedInteractions: newDetected
	};
}

export function removeMedication(state: DrugInteractionState, medicationId: string): DrugInteractionState {
	return {
		...state,
		currentMedications: state.currentMedications.filter((m) => m.id !== medicationId),
		detectedInteractions: state.detectedInteractions.filter(
			(d) => d.drug1.id !== medicationId && d.drug2.id !== medicationId
		)
	};
}

export function identifyInteraction(state: DrugInteractionState, interactionId: string): DrugInteractionState {
	const newDetected = state.detectedInteractions.map((d) =>
		d.id === interactionId ? { ...d, isIdentifiedByStudent: true } : d
	);
	return { ...state, detectedInteractions: newDetected };
}

export function submitAssessment(
	state: DrugInteractionState,
	interactionId: string,
	severity: string,
	mechanism: string,
	recommendation: string
): DrugInteractionState {
	const detected = state.detectedInteractions.find((d) => d.id === interactionId);
	if (!detected) return state;

	const isCorrect =
		severity === detected.interaction.severity && mechanism === detected.interaction.mechanism;

	const existing = state.assessments.findIndex((a) => a.interactionId === interactionId);
	const assessment: InteractionAssessment = {
		interactionId,
		studentSeverity: severity,
		studentMechanism: mechanism,
		studentRecommendation: recommendation,
		isCorrect
	};

	let newAssessments: InteractionAssessment[];
	if (existing >= 0) {
		newAssessments = [...state.assessments];
		newAssessments[existing] = assessment;
	} else {
		newAssessments = [...state.assessments, assessment];
	}

	const newCompleted = state.completedTasks.includes(interactionId)
		? state.completedTasks
		: [...state.completedTasks, interactionId];

	return {
		...state,
		assessments: newAssessments,
		completedTasks: newCompleted
	};
}

export function answerQuiz(state: DrugInteractionState, questionId: string, answer: string): DrugInteractionState {
	const newAnswers = new Map(state.quizAnswers);
	newAnswers.set(questionId, answer);
	return { ...state, quizAnswers: newAnswers };
}

export function selectPatient(state: DrugInteractionState, patientId: string): DrugInteractionState {
	return createInitialState({ patientId });
}

// ── Analysis ───────────────────────────────────────────────────────────────────

export interface DrugInteractionAnalysis {
	score: number;
	grade: 'A' | 'B' | 'C' | 'D' | 'F';
	identificationScore: number;
	assessmentScore: number;
	quizScore: { correct: number; total: number };
	totalInteractions: number;
	identifiedCount: number;
	correctAssessments: number;
	feedback: string;
}

export function analyzeDrugInteractions(state: DrugInteractionState): DrugInteractionAnalysis {
	const totalInteractions = state.detectedInteractions.length;
	const identifiedCount = state.detectedInteractions.filter((d) => d.isIdentifiedByStudent).length;
	const correctAssessments = state.assessments.filter((a) => a.isCorrect).length;

	const identificationScore = totalInteractions > 0 ? (identifiedCount / totalInteractions) * 100 : 0;
	const assessmentScore =
		state.assessments.length > 0
			? (correctAssessments / state.assessments.length) * 100
			: 0;

	let quizCorrect = 0;
	for (const q of INTERACTION_QUIZ) {
		if (state.quizAnswers.get(q.id) === q.correctAnswer) quizCorrect++;
	}

	// 30% identification, 40% assessment, 30% quiz
	const score = Math.round(
		identificationScore * 0.3 +
			assessmentScore * 0.4 +
			(quizCorrect / INTERACTION_QUIZ.length) * 100 * 0.3
	);

	let grade: DrugInteractionAnalysis['grade'];
	if (score >= 90) grade = 'A';
	else if (score >= 80) grade = 'B';
	else if (score >= 70) grade = 'C';
	else if (score >= 60) grade = 'D';
	else grade = 'F';

	let feedback: string;
	if (grade === 'A') {
		feedback =
			'Outstanding performance! You demonstrated thorough understanding of drug interaction mechanisms and clinical management.';
	} else if (grade === 'B') {
		feedback =
			'Good work. You identified most interactions correctly. Review CYP450 enzyme pathways for full mastery.';
	} else if (grade === 'C') {
		feedback =
			'Fair. Several interactions were missed or misclassified. Focus on mechanism-based classification.';
	} else {
		feedback =
			'Review drug interaction fundamentals, particularly CYP450 metabolism, protein binding, and pharmacodynamic interactions.';
	}

	return {
		score,
		grade,
		identificationScore,
		assessmentScore,
		quizScore: { correct: quizCorrect, total: INTERACTION_QUIZ.length },
		totalInteractions,
		identifiedCount,
		correctAssessments,
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

export const INTERACTION_QUIZ: QuizQuestion[] = [
	{
		id: 'iq1',
		question: 'Which CYP450 enzyme is most commonly involved in drug interactions?',
		options: ['CYP1A2', 'CYP2D6', 'CYP3A4', 'CYP2E1'],
		correctAnswer: 'CYP3A4',
		explanation:
			'CYP3A4 metabolizes approximately 50% of all drugs and is the most common enzyme involved in drug interactions.'
	},
	{
		id: 'iq2',
		question: 'Rifampicin is a potent enzyme _____, which _____ the metabolism of many drugs.',
		options: [
			'inhibitor; decreases',
			'inducer; increases',
			'substrate; alters',
			'inhibitor; increases'
		],
		correctAnswer: 'inducer; increases',
		explanation:
			'Rifampicin is one of the most potent CYP enzyme inducers known, increasing metabolism and reducing plasma levels of co-administered drugs.'
	},
	{
		id: 'iq3',
		question:
			'A drug with 99% protein binding is displaced by another drug, increasing free fraction to 2%. What is the expected effect?',
		options: [
			'Drug effect doubles',
			'No significant change - free drug redistributes',
			'Drug effect halves',
			'Protein binding is irrelevant'
		],
		correctAnswer: 'No significant change - free drug redistributes',
		explanation:
			'For most drugs, protein binding displacement alone is clinically insignificant because the free drug redistributes into tissues and clearance increases proportionally.'
	},
	{
		id: 'iq4',
		question:
			'Which interaction severity level means the drugs should NEVER be used together?',
		options: ['Minor', 'Moderate', 'Major', 'Contraindicated'],
		correctAnswer: 'Contraindicated',
		explanation:
			'Contraindicated interactions indicate that the risk outweighs any benefit and the combination should be avoided entirely.'
	},
	{
		id: 'iq5',
		question: 'Warfarin plus aspirin is an example of which type of interaction?',
		options: [
			'CYP450 inhibition',
			'Pharmacodynamic synergism',
			'Protein binding displacement',
			'Absorption alteration'
		],
		correctAnswer: 'Pharmacodynamic synergism',
		explanation:
			'Both drugs impair hemostasis through different pharmacodynamic mechanisms (coagulation cascade and platelet function), producing synergistic bleeding risk.'
	}
];
