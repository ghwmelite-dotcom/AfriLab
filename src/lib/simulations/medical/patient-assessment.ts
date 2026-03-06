/**
 * Patient Assessment & History Lab Simulation
 * Virtual patient scenarios with structured history-taking, physical exam, and clinical reasoning
 */

// History sections
export type HistorySection = 'chief_complaint' | 'hpi' | 'pmh' | 'medications' | 'allergies' | 'social' | 'family' | 'ros';

export interface HistoryItem {
	section: HistorySection;
	sectionLabel: string;
	question: string;
	answer: string;
	revealed: boolean;
}

export interface PhysicalExamRegion {
	id: string;
	name: string;
	findings: string;
	normal: boolean;
	examined: boolean;
	// SVG coordinates for body diagram (percentage-based)
	x: number;
	y: number;
}

export interface Investigation {
	id: string;
	name: string;
	category: 'blood' | 'imaging' | 'other';
	result: string;
	appropriate: boolean; // whether this is an appropriate investigation for the scenario
	ordered: boolean;
}

export interface DifferentialDiagnosis {
	id: string;
	name: string;
	isCorrect: boolean; // is this in the correct differential list
	isPrimary: boolean; // is this the most likely diagnosis
}

export interface PatientScenario {
	id: string;
	name: string;
	age: number;
	gender: 'male' | 'female';
	avatar: string; // first letter
	triage: string;
	history: HistoryItem[];
	physicalExam: PhysicalExamRegion[];
	investigations: Investigation[];
	differentials: DifferentialDiagnosis[];
	primaryDiagnosis: string;
	managementPlan: string[];
}

export const PATIENT_SCENARIOS: PatientScenario[] = [
	{
		id: 'chest-pain',
		name: 'Kofi Asante',
		age: 55,
		gender: 'male',
		avatar: 'K',
		triage: 'Urgent - Chest pain with exertion',
		history: [
			{ section: 'chief_complaint', sectionLabel: 'Chief Complaint', question: 'What brings you in today?', answer: 'I have been having chest pain that comes on when I walk uphill or climb stairs. It started about 2 weeks ago.', revealed: false },
			{ section: 'hpi', sectionLabel: 'History of Present Illness', question: 'Can you describe the pain?', answer: 'It feels like a heavy pressure in the center of my chest. It radiates to my left arm and jaw. It lasts about 5-10 minutes and goes away when I rest.', revealed: false },
			{ section: 'hpi', sectionLabel: 'History of Present Illness', question: 'How often does this happen?', answer: 'Almost every day now when I exert myself. It has been getting worse - before I could walk 1km, now it comes after just 200 meters.', revealed: false },
			{ section: 'hpi', sectionLabel: 'History of Present Illness', question: 'Any associated symptoms?', answer: 'Sometimes I feel short of breath and a bit sweaty when the pain comes on. No nausea or vomiting.', revealed: false },
			{ section: 'pmh', sectionLabel: 'Past Medical History', question: 'Do you have any medical conditions?', answer: 'I have type 2 diabetes for 8 years, controlled on metformin. High blood pressure diagnosed 5 years ago. High cholesterol.', revealed: false },
			{ section: 'medications', sectionLabel: 'Medications', question: 'What medications are you taking?', answer: 'Metformin 1000mg twice daily, Amlodipine 10mg daily, Atorvastatin 20mg at night. No over-the-counter medications.', revealed: false },
			{ section: 'allergies', sectionLabel: 'Allergies', question: 'Do you have any allergies?', answer: 'No known drug allergies. No food allergies.', revealed: false },
			{ section: 'social', sectionLabel: 'Social History', question: 'Tell me about your lifestyle.', answer: 'I smoke about 10 cigarettes a day for the last 30 years. I drink alcohol socially, maybe 2-3 beers on weekends. I work as a taxi driver. Sedentary lifestyle.', revealed: false },
			{ section: 'family', sectionLabel: 'Family History', question: 'Any medical conditions in your family?', answer: 'My father died of a heart attack at age 58. My mother has diabetes. My brother had a coronary bypass at 60.', revealed: false },
			{ section: 'ros', sectionLabel: 'Review of Systems', question: 'Any other symptoms?', answer: 'I have been feeling more tired lately. I get swollen ankles by the end of the day. No cough, no weight loss, no fever, no urinary symptoms.', revealed: false }
		],
		physicalExam: [
			{ id: 'general', name: 'General Appearance', findings: 'Overweight male, BMI 31. Comfortable at rest, mildly anxious. No acute distress.', normal: false, examined: false, x: 50, y: 5 },
			{ id: 'vitals', name: 'Vital Signs', findings: 'BP 155/95 mmHg, HR 82 bpm regular, RR 16/min, SpO2 97% on room air, Temp 36.7C', normal: false, examined: false, x: 85, y: 15 },
			{ id: 'head', name: 'Head & Neck', findings: 'No JVP elevation. Carotid pulses normal, no bruits. Thyroid normal.', normal: true, examined: false, x: 50, y: 12 },
			{ id: 'chest', name: 'Chest / Heart', findings: 'Heart sounds S1 S2 normal, S4 gallop heard. No murmurs. Apex beat slightly displaced laterally. Lungs clear bilaterally.', normal: false, examined: false, x: 50, y: 30 },
			{ id: 'abdomen', name: 'Abdomen', findings: 'Soft, non-tender. No hepatomegaly. Normal bowel sounds. Obese abdomen.', normal: true, examined: false, x: 50, y: 50 },
			{ id: 'limbs', name: 'Extremities', findings: 'Mild bilateral pedal edema. Peripheral pulses present but diminished dorsalis pedis bilaterally. No cyanosis.', normal: false, examined: false, x: 50, y: 80 }
		],
		investigations: [
			{ id: 'ecg', name: '12-Lead ECG', category: 'other', result: 'Sinus rhythm. ST depression in leads V4-V6 and lateral leads. LVH criteria met.', appropriate: true, ordered: false },
			{ id: 'troponin', name: 'Troponin', category: 'blood', result: 'Troponin I: < 0.04 ng/mL (Normal)', appropriate: true, ordered: false },
			{ id: 'fbc', name: 'Full Blood Count', category: 'blood', result: 'Hb 13.2 g/dL, WBC 7.8, Platelets 245. Normal.', appropriate: true, ordered: false },
			{ id: 'lipids', name: 'Lipid Profile', category: 'blood', result: 'Total Cholesterol 6.8 mmol/L (high), LDL 4.2 (high), HDL 0.9 (low), Triglycerides 2.4 (high)', appropriate: true, ordered: false },
			{ id: 'hba1c', name: 'HbA1c', category: 'blood', result: 'HbA1c: 8.2% (poorly controlled)', appropriate: true, ordered: false },
			{ id: 'renal', name: 'Renal Function', category: 'blood', result: 'Creatinine 110 umol/L, eGFR 68 (mildly reduced). K+ 4.2, Na+ 140.', appropriate: true, ordered: false },
			{ id: 'cxr', name: 'Chest X-Ray', category: 'imaging', result: 'Mild cardiomegaly. No pulmonary congestion. Clear lung fields.', appropriate: true, ordered: false },
			{ id: 'ct-head', name: 'CT Head', category: 'imaging', result: 'Not indicated - no neurological symptoms', appropriate: false, ordered: false },
			{ id: 'urine', name: 'Urinalysis', category: 'other', result: 'Protein trace positive, glucose positive. No blood.', appropriate: true, ordered: false }
		],
		differentials: [
			{ id: 'stable-angina', name: 'Stable Angina Pectoris', isCorrect: true, isPrimary: true },
			{ id: 'unstable-angina', name: 'Unstable Angina / ACS', isCorrect: true, isPrimary: false },
			{ id: 'gerd', name: 'Gastroesophageal Reflux', isCorrect: true, isPrimary: false },
			{ id: 'musculoskeletal', name: 'Musculoskeletal Chest Pain', isCorrect: true, isPrimary: false },
			{ id: 'pneumonia', name: 'Pneumonia', isCorrect: false, isPrimary: false },
			{ id: 'pe', name: 'Pulmonary Embolism', isCorrect: false, isPrimary: false },
			{ id: 'aortic-dissection', name: 'Aortic Dissection', isCorrect: false, isPrimary: false },
			{ id: 'pericarditis', name: 'Pericarditis', isCorrect: false, isPrimary: false }
		],
		primaryDiagnosis: 'Stable Angina Pectoris',
		managementPlan: [
			'Start aspirin 75mg daily',
			'Start GTN sublingual spray PRN for chest pain',
			'Optimize statin - increase atorvastatin to 80mg',
			'Refer for exercise stress test / cardiac catheterization',
			'Smoking cessation counseling and support',
			'Optimize diabetes control - consider adding second agent',
			'Lifestyle modification: diet, exercise, weight loss',
			'Review antihypertensive - add ACE inhibitor'
		]
	},
	{
		id: 'malaria',
		name: 'Amina Diallo',
		age: 32,
		gender: 'female',
		avatar: 'A',
		triage: 'Urgent - High fever with rigors',
		history: [
			{ section: 'chief_complaint', sectionLabel: 'Chief Complaint', question: 'What brings you in today?', answer: 'I have had a high fever for 4 days with shaking chills and body aches. I feel very weak.', revealed: false },
			{ section: 'hpi', sectionLabel: 'History of Present Illness', question: 'Tell me more about the fever.', answer: 'The fever comes and goes in cycles - I feel cold and shake, then get very hot and sweat. It happens roughly every 48 hours. Temperature has been as high as 39.8C.', revealed: false },
			{ section: 'hpi', sectionLabel: 'History of Present Illness', question: 'Any other symptoms?', answer: 'Severe headache, joint pains, loss of appetite, nausea but no vomiting. I have had some dark-colored urine. I also feel dizzy when I stand up.', revealed: false },
			{ section: 'pmh', sectionLabel: 'Past Medical History', question: 'Do you have any medical conditions?', answer: 'I had malaria twice before, when I was younger. Otherwise healthy. I am not pregnant - last period was 2 weeks ago, normal.', revealed: false },
			{ section: 'medications', sectionLabel: 'Medications', question: 'What medications are you taking?', answer: 'No regular medications. I took paracetamol for the fever. I am not on any antimalarial prophylaxis.', revealed: false },
			{ section: 'allergies', sectionLabel: 'Allergies', question: 'Do you have any allergies?', answer: 'No known allergies.', revealed: false },
			{ section: 'social', sectionLabel: 'Social History', question: 'Tell me about your recent activities.', answer: 'I am a teacher. I traveled to a rural area 10 days ago for a school program. I slept without a mosquito net. I do not smoke or drink alcohol.', revealed: false },
			{ section: 'family', sectionLabel: 'Family History', question: 'Any conditions in the family?', answer: 'Both parents alive and well. No sickle cell disease in family. Brother has sickle cell trait.', revealed: false },
			{ section: 'ros', sectionLabel: 'Review of Systems', question: 'Anything else you have noticed?', answer: 'My eyes look a bit yellow, according to my sister. No rash, no cough, no diarrhea, no neck stiffness. I have been urinating less than usual.', revealed: false }
		],
		physicalExam: [
			{ id: 'general', name: 'General Appearance', findings: 'Appears unwell, febrile, mildly jaundiced. Dry mucous membranes. Mild dehydration.', normal: false, examined: false, x: 50, y: 5 },
			{ id: 'vitals', name: 'Vital Signs', findings: 'BP 100/65 mmHg, HR 108 bpm, RR 22/min, SpO2 96%, Temp 39.4C', normal: false, examined: false, x: 85, y: 15 },
			{ id: 'head', name: 'Head & Neck', findings: 'Scleral icterus (jaundice). Conjunctival pallor. No lymphadenopathy. No neck stiffness.', normal: false, examined: false, x: 50, y: 12 },
			{ id: 'chest', name: 'Chest / Heart', findings: 'Tachycardic but regular. No murmurs. Lungs clear. No respiratory distress.', normal: false, examined: false, x: 50, y: 30 },
			{ id: 'abdomen', name: 'Abdomen', findings: 'Tender hepatomegaly (liver palpable 3cm below costal margin). Splenomegaly (spleen palpable). Mild tenderness in left upper quadrant.', normal: false, examined: false, x: 50, y: 50 },
			{ id: 'limbs', name: 'Extremities', findings: 'No edema. Warm peripheries. CRT 3 seconds. No rash. No petechiae.', normal: false, examined: false, x: 50, y: 80 }
		],
		investigations: [
			{ id: 'malaria-rdt', name: 'Malaria RDT', category: 'blood', result: 'Positive for P. falciparum', appropriate: true, ordered: false },
			{ id: 'blood-smear', name: 'Blood Smear (Thick & Thin Film)', category: 'blood', result: 'P. falciparum trophozoites seen. Parasite density 3.2% (moderate parasitemia).', appropriate: true, ordered: false },
			{ id: 'fbc', name: 'Full Blood Count', category: 'blood', result: 'Hb 9.8 g/dL (low), WBC 5.2, Platelets 98 (low - thrombocytopenia)', appropriate: true, ordered: false },
			{ id: 'renal', name: 'Renal Function', category: 'blood', result: 'Creatinine 135 umol/L (elevated), BUN 12.4, K+ 4.0, Na+ 134', appropriate: true, ordered: false },
			{ id: 'lfts', name: 'Liver Function Tests', category: 'blood', result: 'Bilirubin 68 umol/L (elevated), ALT 85 (elevated), AST 92 (elevated), ALP normal', appropriate: true, ordered: false },
			{ id: 'glucose', name: 'Blood Glucose', category: 'blood', result: 'Random glucose 4.2 mmol/L (normal, but monitor for hypoglycemia)', appropriate: true, ordered: false },
			{ id: 'cxr', name: 'Chest X-Ray', category: 'imaging', result: 'Clear lung fields. No consolidation.', appropriate: false, ordered: false },
			{ id: 'urine', name: 'Urinalysis', category: 'other', result: 'Dark amber color, urobilinogen elevated, hemoglobinuria trace.', appropriate: true, ordered: false }
		],
		differentials: [
			{ id: 'malaria', name: 'Plasmodium falciparum Malaria', isCorrect: true, isPrimary: true },
			{ id: 'typhoid', name: 'Typhoid Fever', isCorrect: true, isPrimary: false },
			{ id: 'dengue', name: 'Dengue Fever', isCorrect: true, isPrimary: false },
			{ id: 'uti', name: 'Urinary Tract Infection/Pyelonephritis', isCorrect: true, isPrimary: false },
			{ id: 'meningitis', name: 'Meningitis', isCorrect: false, isPrimary: false },
			{ id: 'appendicitis', name: 'Appendicitis', isCorrect: false, isPrimary: false },
			{ id: 'hepatitis', name: 'Viral Hepatitis', isCorrect: true, isPrimary: false },
			{ id: 'pneumonia', name: 'Pneumonia', isCorrect: false, isPrimary: false }
		],
		primaryDiagnosis: 'Plasmodium falciparum Malaria (Moderate severity)',
		managementPlan: [
			'Admit for IV antimalarial therapy (Artesunate IV)',
			'IV fluid resuscitation - normal saline',
			'Monitor blood glucose 4-hourly (risk of hypoglycemia)',
			'Repeat parasite count at 12 and 24 hours',
			'Paracetamol for fever and pain',
			'Monitor renal function and urine output',
			'Blood transfusion if Hb drops below 7 g/dL',
			'Switch to oral ACT once able to tolerate oral medication',
			'Counsel on mosquito net use and prevention'
		]
	}
];

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
		id: 'pa-q1',
		question: 'In the OLDCARTS mnemonic for pain assessment, what does the "S" stand for?',
		options: ['Severity', 'Site', 'Sensitivity', 'Symptoms'],
		correctIndex: 0,
		explanation: 'OLDCARTS stands for Onset, Location, Duration, Character, Aggravating factors, Relieving factors, Timing, Severity. It is a systematic approach to characterizing pain.'
	},
	{
		id: 'pa-q2',
		question: 'Which of the following is NOT typically part of the Past Medical History?',
		options: ['Previous surgeries', 'Childhood illnesses', 'Current medications', 'Hospitalizations'],
		correctIndex: 2,
		explanation: 'Current medications are documented in a separate section (Medication History). PMH focuses on previous diagnoses, surgeries, hospitalizations, and childhood illnesses.'
	},
	{
		id: 'pa-q3',
		question: 'A 55-year-old man presents with exertional chest pain relieved by rest. The most important initial investigation is:',
		options: ['CT Chest', 'Troponin and ECG', 'Chest X-Ray', 'Echocardiogram'],
		correctIndex: 1,
		explanation: 'For suspected cardiac chest pain, an ECG and troponin are the first-line investigations. ECG may show ischemic changes, and troponin helps rule out myocardial infarction.'
	},
	{
		id: 'pa-q4',
		question: 'Cyclical fever with rigors every 48 hours in a patient from an endemic area is most suggestive of:',
		options: ['Typhoid fever', 'Dengue fever', 'Plasmodium falciparum malaria', 'Tuberculosis'],
		correctIndex: 2,
		explanation: 'Cyclical (tertian) fever with rigors every 48 hours is classic for P. falciparum or P. vivax malaria, especially with travel to endemic areas and mosquito exposure.'
	},
	{
		id: 'pa-q5',
		question: 'Which physical examination finding is MOST concerning for severe malaria?',
		options: [
			'Mild splenomegaly',
			'Temperature of 38.5C',
			'Altered mental status and jaundice',
			'Mild anemia (Hb 11 g/dL)'
		],
		correctIndex: 2,
		explanation: 'Altered mental status (cerebral malaria) with jaundice indicates severe/complicated malaria. WHO criteria for severe malaria include cerebral malaria, severe anemia, renal failure, acidosis, and high parasitemia.'
	}
];

// State
export interface PatientAssessmentState {
	currentScenarioId: string | null;
	revealedHistory: Record<string, boolean[]>; // scenario id -> array of revealed indices
	examinedRegions: Record<string, boolean[]>; // scenario id -> array of examined indices
	orderedInvestigations: Record<string, boolean[]>; // scenario id -> array of ordered indices
	selectedDifferentials: Record<string, string[]>; // scenario id -> selected differential ids
	primaryDiagnosisGuess: Record<string, string | null>;
	quizAnswers: Record<string, number | null>;
	notes: string[];
	step: 'history' | 'exam' | 'investigations' | 'diagnosis' | 'quiz';
}

export function createInitialState(): PatientAssessmentState {
	const revealedHistory: Record<string, boolean[]> = {};
	const examinedRegions: Record<string, boolean[]> = {};
	const orderedInvestigations: Record<string, boolean[]> = {};
	const selectedDifferentials: Record<string, string[]> = {};
	const primaryDiagnosisGuess: Record<string, string | null> = {};

	for (const scenario of PATIENT_SCENARIOS) {
		revealedHistory[scenario.id] = scenario.history.map(() => false);
		examinedRegions[scenario.id] = scenario.physicalExam.map(() => false);
		orderedInvestigations[scenario.id] = scenario.investigations.map(() => false);
		selectedDifferentials[scenario.id] = [];
		primaryDiagnosisGuess[scenario.id] = null;
	}

	const quizAnswers: Record<string, number | null> = {};
	for (const q of QUIZ_QUESTIONS) {
		quizAnswers[q.id] = null;
	}

	return {
		currentScenarioId: null,
		revealedHistory,
		examinedRegions,
		orderedInvestigations,
		selectedDifferentials,
		primaryDiagnosisGuess,
		quizAnswers,
		notes: [],
		step: 'history'
	};
}

// Actions
export function selectScenario(state: PatientAssessmentState, scenarioId: string): PatientAssessmentState {
	return { ...state, currentScenarioId: scenarioId };
}

export function revealHistory(state: PatientAssessmentState, scenarioId: string, index: number): PatientAssessmentState {
	const current = [...(state.revealedHistory[scenarioId] || [])];
	current[index] = true;
	return {
		...state,
		revealedHistory: { ...state.revealedHistory, [scenarioId]: current }
	};
}

export function examineRegion(state: PatientAssessmentState, scenarioId: string, index: number): PatientAssessmentState {
	const current = [...(state.examinedRegions[scenarioId] || [])];
	current[index] = true;
	return {
		...state,
		examinedRegions: { ...state.examinedRegions, [scenarioId]: current }
	};
}

export function orderInvestigation(state: PatientAssessmentState, scenarioId: string, index: number): PatientAssessmentState {
	const current = [...(state.orderedInvestigations[scenarioId] || [])];
	current[index] = true;
	return {
		...state,
		orderedInvestigations: { ...state.orderedInvestigations, [scenarioId]: current }
	};
}

export function toggleDifferential(state: PatientAssessmentState, scenarioId: string, differentialId: string): PatientAssessmentState {
	const current = state.selectedDifferentials[scenarioId] || [];
	const newList = current.includes(differentialId)
		? current.filter((d) => d !== differentialId)
		: [...current, differentialId];
	return {
		...state,
		selectedDifferentials: { ...state.selectedDifferentials, [scenarioId]: newList }
	};
}

export function setPrimaryDiagnosis(state: PatientAssessmentState, scenarioId: string, diagnosis: string): PatientAssessmentState {
	return {
		...state,
		primaryDiagnosisGuess: { ...state.primaryDiagnosisGuess, [scenarioId]: diagnosis }
	};
}

export function addNote(state: PatientAssessmentState, note: string): PatientAssessmentState {
	return { ...state, notes: [...state.notes, note] };
}

export function answerQuiz(state: PatientAssessmentState, questionId: string, answerIndex: number): PatientAssessmentState {
	return { ...state, quizAnswers: { ...state.quizAnswers, [questionId]: answerIndex } };
}

export function setStep(state: PatientAssessmentState, step: PatientAssessmentState['step']): PatientAssessmentState {
	return { ...state, step };
}

// Analysis
export interface PatientAssessmentResult {
	scenarioName: string;
	historyScore: number;
	examScore: number;
	investigationScore: number;
	differentialScore: number;
	primaryDiagnosisCorrect: boolean;
	quizScore: number;
	quizTotal: number;
	overallScore: number;
	grade: 'A' | 'B' | 'C' | 'D' | 'F';
	feedback: string;
}

export function analyzeAssessment(state: PatientAssessmentState): PatientAssessmentResult {
	const scenarioId = state.currentScenarioId;
	const scenario = PATIENT_SCENARIOS.find((s) => s.id === scenarioId);

	if (!scenario) {
		return {
			scenarioName: 'Unknown',
			historyScore: 0,
			examScore: 0,
			investigationScore: 0,
			differentialScore: 0,
			primaryDiagnosisCorrect: false,
			quizScore: 0,
			quizTotal: QUIZ_QUESTIONS.length,
			overallScore: 0,
			grade: 'F',
			feedback: 'No scenario was selected.'
		};
	}

	// History score: percentage of questions revealed
	const revealed = state.revealedHistory[scenario.id] || [];
	const historyScore = Math.round((revealed.filter(Boolean).length / scenario.history.length) * 100);

	// Exam score: percentage of regions examined
	const examined = state.examinedRegions[scenario.id] || [];
	const examScore = Math.round((examined.filter(Boolean).length / scenario.physicalExam.length) * 100);

	// Investigation score: reward appropriate orders, penalize inappropriate
	const ordered = state.orderedInvestigations[scenario.id] || [];
	const appropriateOrdered = scenario.investigations.filter((inv, i) => ordered[i] && inv.appropriate).length;
	const inappropriateOrdered = scenario.investigations.filter((inv, i) => ordered[i] && !inv.appropriate).length;
	const totalAppropriate = scenario.investigations.filter((inv) => inv.appropriate).length;
	const investigationScore = Math.round(
		Math.max(0, ((appropriateOrdered - inappropriateOrdered * 0.5) / totalAppropriate) * 100)
	);

	// Differential score
	const selectedDiffs = state.selectedDifferentials[scenario.id] || [];
	const correctDiffs = scenario.differentials.filter((d) => d.isCorrect);
	const correctSelected = selectedDiffs.filter((id) => correctDiffs.some((d) => d.id === id)).length;
	const incorrectSelected = selectedDiffs.filter((id) => !correctDiffs.some((d) => d.id === id)).length;
	const differentialScore = correctDiffs.length > 0
		? Math.round(Math.max(0, ((correctSelected - incorrectSelected * 0.5) / correctDiffs.length) * 100))
		: 0;

	// Primary diagnosis
	const primaryDiagnosisCorrect =
		state.primaryDiagnosisGuess[scenario.id] === scenario.differentials.find((d) => d.isPrimary)?.id;

	// Quiz
	let quizCorrect = 0;
	for (const q of QUIZ_QUESTIONS) {
		if (state.quizAnswers[q.id] === q.correctIndex) quizCorrect++;
	}

	// Weighted: history 20%, exam 20%, investigations 15%, differential 20%, primary dx 10%, quiz 15%
	const overallScore = Math.round(
		historyScore * 0.2 +
		examScore * 0.2 +
		investigationScore * 0.15 +
		differentialScore * 0.2 +
		(primaryDiagnosisCorrect ? 100 : 0) * 0.1 +
		(QUIZ_QUESTIONS.length > 0 ? (quizCorrect / QUIZ_QUESTIONS.length) * 100 : 0) * 0.15
	);

	let grade: 'A' | 'B' | 'C' | 'D' | 'F';
	if (overallScore >= 90) grade = 'A';
	else if (overallScore >= 80) grade = 'B';
	else if (overallScore >= 70) grade = 'C';
	else if (overallScore >= 60) grade = 'D';
	else grade = 'F';

	let feedback = '';
	if (overallScore >= 90) {
		feedback = 'Excellent clinical assessment! You conducted a thorough history, examination, and arrived at the correct diagnosis with appropriate investigations.';
	} else if (overallScore >= 75) {
		feedback = 'Good clinical reasoning. Review areas where you may have missed history questions or physical exam findings to improve your systematic approach.';
	} else if (overallScore >= 50) {
		feedback = 'Developing clinical skills. Remember to take a complete history using the structured approach, examine all relevant systems, and consider a broad differential before narrowing down.';
	} else {
		feedback = 'Keep practicing! A systematic approach is key: thorough history (OLDCARTS for pain), complete physical exam, targeted investigations, then develop your differential diagnosis.';
	}

	return {
		scenarioName: scenario.name,
		historyScore,
		examScore,
		investigationScore,
		differentialScore,
		primaryDiagnosisCorrect,
		quizScore: quizCorrect,
		quizTotal: QUIZ_QUESTIONS.length,
		overallScore,
		grade,
		feedback
	};
}
