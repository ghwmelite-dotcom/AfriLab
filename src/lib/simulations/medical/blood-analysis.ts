/**
 * Blood Typing & Analysis Lab Simulation
 * Simulate ABO/Rh blood typing, agglutination reactions, and CBC interpretation
 */

// Blood type definitions
export type ABOType = 'A' | 'B' | 'AB' | 'O';
export type RhType = '+' | '-';
export type BloodType = `${ABOType}${RhType}`;
export type Serum = 'anti-A' | 'anti-B' | 'anti-Rh';

export interface AgglutinationResult {
	serum: Serum;
	applied: boolean;
	agglutinated: boolean | null; // null = not yet tested
}

export interface CBCValue {
	name: string;
	value: number;
	unit: string;
	normalMin: number;
	normalMax: number;
	interpretation: 'normal' | 'low' | 'high' | null;
}

export interface BloodSample {
	id: string;
	label: string;
	trueType: BloodType;
	aboType: ABOType;
	rhType: RhType;
	cbc: CBCValue[];
	description: string;
}

// Transfusion compatibility matrix
export const TRANSFUSION_COMPATIBILITY: Record<BloodType, BloodType[]> = {
	'A+': ['A+', 'A-', 'O+', 'O-'],
	'A-': ['A-', 'O-'],
	'B+': ['B+', 'B-', 'O+', 'O-'],
	'B-': ['B-', 'O-'],
	'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
	'AB-': ['A-', 'B-', 'AB-', 'O-'],
	'O+': ['O+', 'O-'],
	'O-': ['O-']
};

export const ALL_BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// CBC normal ranges
function createCBC(overrides: Partial<Record<string, number>> = {}): CBCValue[] {
	const defaults: CBCValue[] = [
		{ name: 'WBC', value: 7.0, unit: 'x10^9/L', normalMin: 4.5, normalMax: 11.0, interpretation: null },
		{ name: 'RBC', value: 4.8, unit: 'x10^12/L', normalMin: 4.2, normalMax: 5.9, interpretation: null },
		{ name: 'Hemoglobin', value: 14.0, unit: 'g/dL', normalMin: 12.0, normalMax: 17.5, interpretation: null },
		{ name: 'Hematocrit', value: 42.0, unit: '%', normalMin: 36.0, normalMax: 52.0, interpretation: null },
		{ name: 'Platelets', value: 250, unit: 'x10^9/L', normalMin: 150, normalMax: 400, interpretation: null },
		{ name: 'MCV', value: 88.0, unit: 'fL', normalMin: 80.0, normalMax: 100.0, interpretation: null },
		{ name: 'MCH', value: 29.0, unit: 'pg', normalMin: 27.0, normalMax: 33.0, interpretation: null },
		{ name: 'MCHC', value: 33.5, unit: 'g/dL', normalMin: 31.5, normalMax: 35.5, interpretation: null }
	];

	return defaults.map((cbc) => {
		const val = overrides[cbc.name] ?? cbc.value;
		return { ...cbc, value: val };
	});
}

export const BLOOD_SAMPLES: BloodSample[] = [
	{
		id: 'sample-1',
		label: 'Sample A',
		trueType: 'A+',
		aboType: 'A',
		rhType: '+',
		cbc: createCBC(),
		description: 'Healthy adult donor sample'
	},
	{
		id: 'sample-2',
		label: 'Sample B',
		trueType: 'B-',
		aboType: 'B',
		rhType: '-',
		cbc: createCBC({ Hemoglobin: 10.5, RBC: 3.6, Hematocrit: 31.0, MCV: 72.0 }),
		description: 'Patient with suspected iron deficiency'
	},
	{
		id: 'sample-3',
		label: 'Sample C',
		trueType: 'O+',
		aboType: 'O',
		rhType: '+',
		cbc: createCBC({ WBC: 15.2, Platelets: 420 }),
		description: 'Patient presenting with fever and infection'
	},
	{
		id: 'sample-4',
		label: 'Sample D',
		trueType: 'AB+',
		aboType: 'AB',
		rhType: '+',
		cbc: createCBC({ Platelets: 95, WBC: 3.2 }),
		description: 'Patient with bruising and fatigue'
	}
];

// Serum information
export const SERA_INFO: Record<Serum, { color: string; target: string; description: string }> = {
	'anti-A': {
		color: '#3B82F6',
		target: 'A antigen',
		description: 'Contains anti-A antibodies. Causes agglutination if A antigens are present on RBCs.'
	},
	'anti-B': {
		color: '#F59E0B',
		target: 'B antigen',
		description: 'Contains anti-B antibodies. Causes agglutination if B antigens are present on RBCs.'
	},
	'anti-Rh': {
		color: '#10B981',
		target: 'Rh(D) antigen',
		description: 'Contains anti-D antibodies. Causes agglutination if Rh(D) antigen is present on RBCs.'
	}
};

// Quiz questions
export interface QuizQuestion {
	id: string;
	question: string;
	options: string[];
	correctIndex: number;
	explanation: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
	{
		id: 'q1',
		question: 'A blood sample agglutinates with anti-A and anti-Rh but NOT anti-B. What is the blood type?',
		options: ['A+', 'B+', 'AB+', 'O+'],
		correctIndex: 0,
		explanation: 'Agglutination with anti-A indicates A antigens. Agglutination with anti-Rh indicates Rh positive. No reaction with anti-B means no B antigens. Therefore the type is A+.'
	},
	{
		id: 'q2',
		question: 'Which blood type is the universal donor for red blood cells?',
		options: ['AB+', 'O+', 'O-', 'A-'],
		correctIndex: 2,
		explanation: 'O- (O negative) is the universal donor because O type RBCs lack both A and B antigens, and Rh negative means no D antigen, minimizing transfusion reactions.'
	},
	{
		id: 'q3',
		question: 'Which blood type is the universal recipient?',
		options: ['O-', 'O+', 'AB-', 'AB+'],
		correctIndex: 3,
		explanation: 'AB+ is the universal recipient because their plasma contains no anti-A, anti-B, or anti-D antibodies, so they can receive any blood type.'
	},
	{
		id: 'q4',
		question: 'A patient has type B- blood. Which of these can they safely receive?',
		options: ['A-', 'B+', 'AB-', 'O-'],
		correctIndex: 3,
		explanation: 'B- patients can receive B- and O- blood. O- lacks all major antigens, and the patient already has B antigens so anti-B is not present. However B+ is unsafe due to Rh incompatibility.'
	},
	{
		id: 'q5',
		question: 'What does agglutination indicate in a blood typing test?',
		options: [
			'The antibody has been destroyed',
			'The corresponding antigen is present on the RBCs',
			'The blood sample is hemolyzed',
			'The serum has expired'
		],
		correctIndex: 1,
		explanation: 'Agglutination (clumping) occurs when antibodies in the serum bind to their corresponding antigens on the red blood cell surface, cross-linking the cells together.'
	}
];

// State
export interface BloodAnalysisState {
	currentSampleId: string | null;
	agglutinationResults: Record<string, AgglutinationResult[]>; // keyed by sample id
	studentTypeDetermination: Record<string, BloodType | null>; // student's guess per sample
	cbcInterpreted: Record<string, boolean>;
	transfusionAnswers: Record<string, BloodType[]>; // student's compatibility answers
	quizAnswers: Record<string, number | null>;
	completedSamples: string[];
	step: 'typing' | 'cbc' | 'transfusion' | 'quiz';
}

export function createInitialState(): BloodAnalysisState {
	const agglutinationResults: Record<string, AgglutinationResult[]> = {};
	const studentTypeDetermination: Record<string, BloodType | null> = {};
	const cbcInterpreted: Record<string, boolean> = {};
	const transfusionAnswers: Record<string, BloodType[]> = {};

	for (const sample of BLOOD_SAMPLES) {
		agglutinationResults[sample.id] = [
			{ serum: 'anti-A', applied: false, agglutinated: null },
			{ serum: 'anti-B', applied: false, agglutinated: null },
			{ serum: 'anti-Rh', applied: false, agglutinated: null }
		];
		studentTypeDetermination[sample.id] = null;
		cbcInterpreted[sample.id] = false;
		transfusionAnswers[sample.id] = [];
	}

	const quizAnswers: Record<string, number | null> = {};
	for (const q of QUIZ_QUESTIONS) {
		quizAnswers[q.id] = null;
	}

	return {
		currentSampleId: null,
		agglutinationResults,
		studentTypeDetermination,
		cbcInterpreted,
		transfusionAnswers,
		quizAnswers,
		completedSamples: [],
		step: 'typing'
	};
}

// Select a sample
export function selectSample(state: BloodAnalysisState, sampleId: string): BloodAnalysisState {
	return { ...state, currentSampleId: sampleId };
}

// Apply serum to current sample
export function applySerum(state: BloodAnalysisState, serum: Serum): BloodAnalysisState {
	const sampleId = state.currentSampleId;
	if (!sampleId) return state;

	const sample = BLOOD_SAMPLES.find((s) => s.id === sampleId);
	if (!sample) return state;

	// Determine if agglutination occurs
	let agglutinated = false;
	if (serum === 'anti-A' && (sample.aboType === 'A' || sample.aboType === 'AB')) {
		agglutinated = true;
	} else if (serum === 'anti-B' && (sample.aboType === 'B' || sample.aboType === 'AB')) {
		agglutinated = true;
	} else if (serum === 'anti-Rh' && sample.rhType === '+') {
		agglutinated = true;
	}

	const newResults = state.agglutinationResults[sampleId].map((r) =>
		r.serum === serum ? { ...r, applied: true, agglutinated } : r
	);

	return {
		...state,
		agglutinationResults: {
			...state.agglutinationResults,
			[sampleId]: newResults
		}
	};
}

// Student determines blood type for a sample
export function setTypeDetermination(
	state: BloodAnalysisState,
	sampleId: string,
	bloodType: BloodType
): BloodAnalysisState {
	return {
		...state,
		studentTypeDetermination: {
			...state.studentTypeDetermination,
			[sampleId]: bloodType
		}
	};
}

// Mark CBC as interpreted
export function markCBCInterpreted(state: BloodAnalysisState, sampleId: string): BloodAnalysisState {
	return {
		...state,
		cbcInterpreted: {
			...state.cbcInterpreted,
			[sampleId]: true
		}
	};
}

// Interpret CBC values
export function interpretCBC(cbc: CBCValue[]): CBCValue[] {
	return cbc.map((val) => ({
		...val,
		interpretation:
			val.value < val.normalMin ? 'low' : val.value > val.normalMax ? 'high' : 'normal'
	}));
}

// Set transfusion compatibility answer
export function setTransfusionAnswer(
	state: BloodAnalysisState,
	sampleId: string,
	compatibleTypes: BloodType[]
): BloodAnalysisState {
	return {
		...state,
		transfusionAnswers: {
			...state.transfusionAnswers,
			[sampleId]: compatibleTypes
		}
	};
}

// Toggle a compatible type in transfusion answer
export function toggleTransfusionType(
	state: BloodAnalysisState,
	sampleId: string,
	bloodType: BloodType
): BloodAnalysisState {
	const current = state.transfusionAnswers[sampleId] || [];
	const newTypes = current.includes(bloodType)
		? current.filter((t) => t !== bloodType)
		: [...current, bloodType];

	return {
		...state,
		transfusionAnswers: {
			...state.transfusionAnswers,
			[sampleId]: newTypes
		}
	};
}

// Answer quiz question
export function answerQuiz(
	state: BloodAnalysisState,
	questionId: string,
	answerIndex: number
): BloodAnalysisState {
	return {
		...state,
		quizAnswers: {
			...state.quizAnswers,
			[questionId]: answerIndex
		}
	};
}

// Mark sample as completed
export function completeSample(state: BloodAnalysisState, sampleId: string): BloodAnalysisState {
	if (state.completedSamples.includes(sampleId)) return state;
	return {
		...state,
		completedSamples: [...state.completedSamples, sampleId]
	};
}

// Change step
export function setStep(
	state: BloodAnalysisState,
	step: BloodAnalysisState['step']
): BloodAnalysisState {
	return { ...state, step };
}

// Analysis
export interface BloodAnalysisResult {
	totalSamples: number;
	samplesTyped: number;
	correctTypes: number;
	seraApplied: number;
	totalSera: number;
	cbcInterpreted: number;
	transfusionScore: number;
	quizScore: number;
	quizTotal: number;
	overallScore: number;
	grade: 'A' | 'B' | 'C' | 'D' | 'F';
	feedback: string;
}

export function analyzeBloodLab(state: BloodAnalysisState): BloodAnalysisResult {
	const totalSamples = BLOOD_SAMPLES.length;
	let samplesTyped = 0;
	let correctTypes = 0;
	let seraApplied = 0;
	const totalSera = totalSamples * 3;
	let cbcCount = 0;
	let transfusionScore = 0;

	for (const sample of BLOOD_SAMPLES) {
		// Typing accuracy
		const studentType = state.studentTypeDetermination[sample.id];
		if (studentType) {
			samplesTyped++;
			if (studentType === sample.trueType) correctTypes++;
		}

		// Sera applied
		const results = state.agglutinationResults[sample.id] || [];
		seraApplied += results.filter((r) => r.applied).length;

		// CBC
		if (state.cbcInterpreted[sample.id]) cbcCount++;

		// Transfusion compatibility
		const studentAnswer = state.transfusionAnswers[sample.id] || [];
		const correctAnswer = TRANSFUSION_COMPATIBILITY[sample.trueType] || [];
		if (studentAnswer.length > 0) {
			const correctSet = new Set(correctAnswer);
			const studentSet = new Set(studentAnswer);
			let matches = 0;
			let total = correctSet.size;
			for (const t of studentSet) {
				if (correctSet.has(t)) matches++;
				else matches--; // penalty for wrong answers
			}
			transfusionScore += Math.max(0, matches / total);
		}
	}

	// Quiz scoring
	let quizCorrect = 0;
	for (const q of QUIZ_QUESTIONS) {
		if (state.quizAnswers[q.id] === q.correctIndex) quizCorrect++;
	}

	const typingScore = totalSamples > 0 ? (correctTypes / totalSamples) * 100 : 0;
	const seraScore = totalSera > 0 ? (seraApplied / totalSera) * 100 : 0;
	const cbcScore = totalSamples > 0 ? (cbcCount / totalSamples) * 100 : 0;
	const transfusionPct =
		totalSamples > 0 ? (transfusionScore / totalSamples) * 100 : 0;
	const quizPct = QUIZ_QUESTIONS.length > 0 ? (quizCorrect / QUIZ_QUESTIONS.length) * 100 : 0;

	// Weighted overall: typing 30%, sera 15%, CBC 15%, transfusion 20%, quiz 20%
	const overallScore = Math.round(
		typingScore * 0.3 + seraScore * 0.15 + cbcScore * 0.15 + transfusionPct * 0.2 + quizPct * 0.2
	);

	let grade: 'A' | 'B' | 'C' | 'D' | 'F';
	if (overallScore >= 90) grade = 'A';
	else if (overallScore >= 80) grade = 'B';
	else if (overallScore >= 70) grade = 'C';
	else if (overallScore >= 60) grade = 'D';
	else grade = 'F';

	let feedback = '';
	if (overallScore >= 90) {
		feedback = 'Outstanding work! You demonstrated excellent understanding of blood typing, CBC interpretation, and transfusion compatibility.';
	} else if (overallScore >= 75) {
		feedback = 'Good job! You have a solid grasp of blood analysis. Review any samples where your type determination differed from the correct answer.';
	} else if (overallScore >= 50) {
		feedback = 'Decent progress. Focus on understanding which antigens react with which sera, and review the transfusion compatibility rules.';
	} else {
		feedback = 'Keep practicing! Remember: anti-A agglutinates A and AB types, anti-B agglutinates B and AB types, and anti-Rh agglutinates Rh-positive types.';
	}

	return {
		totalSamples,
		samplesTyped,
		correctTypes,
		seraApplied,
		totalSera,
		cbcInterpreted: cbcCount,
		transfusionScore: Math.round(transfusionPct),
		quizScore: quizCorrect,
		quizTotal: QUIZ_QUESTIONS.length,
		overallScore,
		grade,
		feedback
	};
}
