/**
 * Vital Signs Assessment Lab Simulation
 * Virtual patient monitoring for vital signs assessment
 */

// Vital signs normal ranges
export const VITAL_RANGES = {
	heartRate: { min: 60, max: 100, unit: 'bpm', name: 'Heart Rate' },
	systolicBP: { min: 90, max: 120, unit: 'mmHg', name: 'Systolic BP' },
	diastolicBP: { min: 60, max: 80, unit: 'mmHg', name: 'Diastolic BP' },
	respiratoryRate: { min: 12, max: 20, unit: 'breaths/min', name: 'Respiratory Rate' },
	oxygenSaturation: { min: 95, max: 100, unit: '%', name: 'SpO2' },
	temperature: { min: 36.1, max: 37.2, unit: '°C', name: 'Temperature' }
};

// Patient scenarios
export interface PatientScenario {
	id: string;
	name: string;
	age: number;
	gender: 'male' | 'female';
	description: string;
	presentation: string;
	vitalSigns: {
		heartRate: number;
		systolicBP: number;
		diastolicBP: number;
		respiratoryRate: number;
		oxygenSaturation: number;
		temperature: number;
	};
	ecgPattern: 'normal' | 'tachycardia' | 'bradycardia' | 'afib' | 'pvc';
	diagnosis: string;
	treatmentPriority: 'routine' | 'urgent' | 'emergent';
}

export const PATIENT_SCENARIOS: PatientScenario[] = [
	{
		id: 'healthy-adult',
		name: 'James Mensah',
		age: 35,
		gender: 'male',
		description: 'Routine health checkup',
		presentation: 'Patient presents for annual physical examination. No current complaints.',
		vitalSigns: {
			heartRate: 72,
			systolicBP: 118,
			diastolicBP: 76,
			respiratoryRate: 14,
			oxygenSaturation: 98,
			temperature: 36.6
		},
		ecgPattern: 'normal',
		diagnosis: 'Healthy adult - all vitals within normal limits',
		treatmentPriority: 'routine'
	},
	{
		id: 'hypertensive',
		name: 'Mary Okonkwo',
		age: 52,
		gender: 'female',
		description: 'Headache and dizziness',
		presentation: 'Patient complains of persistent headache and occasional dizziness for the past week.',
		vitalSigns: {
			heartRate: 88,
			systolicBP: 158,
			diastolicBP: 98,
			respiratoryRate: 16,
			oxygenSaturation: 97,
			temperature: 36.8
		},
		ecgPattern: 'normal',
		diagnosis: 'Hypertensive crisis - Stage 2 hypertension',
		treatmentPriority: 'urgent'
	},
	{
		id: 'febrile',
		name: 'David Adeyemi',
		age: 28,
		gender: 'male',
		description: 'Fever and malaise',
		presentation: 'Patient reports fever, body aches, and fatigue for 3 days. Recently traveled.',
		vitalSigns: {
			heartRate: 102,
			systolicBP: 110,
			diastolicBP: 70,
			respiratoryRate: 20,
			oxygenSaturation: 96,
			temperature: 38.8
		},
		ecgPattern: 'tachycardia',
		diagnosis: 'Febrile illness - possible infection, requires investigation',
		treatmentPriority: 'urgent'
	},
	{
		id: 'respiratory',
		name: 'Grace Nwosu',
		age: 67,
		gender: 'female',
		description: 'Shortness of breath',
		presentation: 'Patient with history of COPD presents with increased shortness of breath and cough.',
		vitalSigns: {
			heartRate: 96,
			systolicBP: 142,
			diastolicBP: 88,
			respiratoryRate: 26,
			oxygenSaturation: 88,
			temperature: 37.2
		},
		ecgPattern: 'tachycardia',
		diagnosis: 'COPD exacerbation with hypoxemia',
		treatmentPriority: 'emergent'
	}
];

// Vital signs measurement status
export interface MeasurementStatus {
	vital: string;
	measured: boolean;
	value: number | null;
	interpretation: 'normal' | 'low' | 'high' | null;
	timestamp: Date | null;
}

// Vital signs state
export interface VitalSignsState {
	currentPatientId: string | null;
	measurements: {
		heartRate: MeasurementStatus;
		systolicBP: MeasurementStatus;
		diastolicBP: MeasurementStatus;
		respiratoryRate: MeasurementStatus;
		oxygenSaturation: MeasurementStatus;
		temperature: MeasurementStatus;
	};
	ecgRecorded: boolean;
	ecgDuration: number;
	studentNotes: string[];
	assessmentComplete: boolean;
	priorityAssigned: 'routine' | 'urgent' | 'emergent' | null;
}

// Configuration
export interface VitalSignsConfig {
	patientId: string;
	includeEcg: boolean;
}

// Create initial state
export function createInitialState(_config: VitalSignsConfig): VitalSignsState {
	const createMeasurement = (vital: string): MeasurementStatus => ({
		vital,
		measured: false,
		value: null,
		interpretation: null,
		timestamp: null
	});

	return {
		currentPatientId: null,
		measurements: {
			heartRate: createMeasurement('Heart Rate'),
			systolicBP: createMeasurement('Systolic BP'),
			diastolicBP: createMeasurement('Diastolic BP'),
			respiratoryRate: createMeasurement('Respiratory Rate'),
			oxygenSaturation: createMeasurement('SpO2'),
			temperature: createMeasurement('Temperature')
		},
		ecgRecorded: false,
		ecgDuration: 0,
		studentNotes: [],
		assessmentComplete: false,
		priorityAssigned: null
	};
}

// Select patient
export function selectPatient(state: VitalSignsState, patientId: string): VitalSignsState {
	return {
		...createInitialState({ patientId, includeEcg: true }),
		currentPatientId: patientId
	};
}

// Interpret a vital sign value
function interpretVital(
	vital: keyof typeof VITAL_RANGES,
	value: number
): 'normal' | 'low' | 'high' {
	const range = VITAL_RANGES[vital];
	if (value < range.min) return 'low';
	if (value > range.max) return 'high';
	return 'normal';
}

// Measure a vital sign
export function measureVital(
	state: VitalSignsState,
	vital: keyof VitalSignsState['measurements'],
	addVariation: boolean = true
): VitalSignsState {
	const patient = PATIENT_SCENARIOS.find((p) => p.id === state.currentPatientId);
	if (!patient) return state;

	// Get the true value with optional small variation to simulate measurement
	let trueValue: number;
	if (vital === 'systolicBP' || vital === 'diastolicBP') {
		trueValue = patient.vitalSigns[vital];
	} else {
		trueValue = patient.vitalSigns[vital as keyof typeof patient.vitalSigns] as number;
	}

	const variation = addVariation ? (Math.random() - 0.5) * 2 : 0;
	const measuredValue = Math.round((trueValue + variation) * 10) / 10;

	// Determine which range to use for interpretation
	let rangeKey: keyof typeof VITAL_RANGES;
	if (vital === 'systolicBP') rangeKey = 'systolicBP';
	else if (vital === 'diastolicBP') rangeKey = 'diastolicBP';
	else rangeKey = vital as keyof typeof VITAL_RANGES;

	return {
		...state,
		measurements: {
			...state.measurements,
			[vital]: {
				vital: VITAL_RANGES[rangeKey].name,
				measured: true,
				value: measuredValue,
				interpretation: interpretVital(rangeKey, measuredValue),
				timestamp: new Date()
			}
		}
	};
}

// Record ECG
export function recordEcg(state: VitalSignsState, duration: number): VitalSignsState {
	return {
		...state,
		ecgRecorded: true,
		ecgDuration: duration
	};
}

// Add student note
export function addNote(state: VitalSignsState, note: string): VitalSignsState {
	return {
		...state,
		studentNotes: [...state.studentNotes, note]
	};
}

// Assign treatment priority
export function assignPriority(
	state: VitalSignsState,
	priority: 'routine' | 'urgent' | 'emergent'
): VitalSignsState {
	return {
		...state,
		priorityAssigned: priority
	};
}

// Complete assessment
export function completeAssessment(state: VitalSignsState): VitalSignsState {
	return {
		...state,
		assessmentComplete: true
	};
}

// Get count of measurements taken
export function getMeasurementCount(state: VitalSignsState): number {
	return Object.values(state.measurements).filter((m) => m.measured).length;
}

// Get count of abnormal vitals
export function getAbnormalCount(state: VitalSignsState): number {
	return Object.values(state.measurements).filter(
		(m) => m.measured && m.interpretation !== 'normal'
	).length;
}

// Analysis result
export interface VitalSignsAnalysis {
	patientName: string;
	totalVitals: number;
	measuredCount: number;
	normalCount: number;
	abnormalCount: number;
	ecgRecorded: boolean;
	priorityCorrect: boolean;
	completionPercent: number;
	accuracy: number;
	feedback: string;
	grade: 'A' | 'B' | 'C' | 'D' | 'F';
	correctPriority: string;
}

// Analyze results
export function analyzeVitalSigns(state: VitalSignsState): VitalSignsAnalysis {
	const patient = PATIENT_SCENARIOS.find((p) => p.id === state.currentPatientId);

	if (!patient) {
		return {
			patientName: 'Unknown',
			totalVitals: 6,
			measuredCount: 0,
			normalCount: 0,
			abnormalCount: 0,
			ecgRecorded: false,
			priorityCorrect: false,
			completionPercent: 0,
			accuracy: 0,
			feedback: 'No patient was selected.',
			grade: 'F',
			correctPriority: 'routine'
		};
	}

	const measuredCount = getMeasurementCount(state);
	const abnormalCount = getAbnormalCount(state);
	const normalCount = measuredCount - abnormalCount;
	const totalVitals = 6;

	const completionPercent = Math.round(
		((measuredCount + (state.ecgRecorded ? 1 : 0)) / (totalVitals + 1)) * 100
	);

	const priorityCorrect = state.priorityAssigned === patient.treatmentPriority;

	// Calculate accuracy
	let accuracy = completionPercent;
	if (priorityCorrect) accuracy = Math.min(100, accuracy + 20);
	if (state.studentNotes.length >= 2) accuracy = Math.min(100, accuracy + 5);
	if (state.ecgRecorded && state.ecgDuration >= 10) accuracy = Math.min(100, accuracy + 5);

	// Determine grade
	let grade: 'A' | 'B' | 'C' | 'D' | 'F';
	if (accuracy >= 90) grade = 'A';
	else if (accuracy >= 80) grade = 'B';
	else if (accuracy >= 70) grade = 'C';
	else if (accuracy >= 60) grade = 'D';
	else grade = 'F';

	// Generate feedback
	let feedback = '';
	if (accuracy >= 90) {
		feedback =
			'Excellent assessment! You measured all vitals correctly and identified the appropriate treatment priority.';
	} else if (accuracy >= 75) {
		feedback =
			'Good work! Your assessment was thorough. Review any missed measurements or priority assessment.';
	} else if (accuracy >= 50) {
		feedback =
			'Decent progress. Make sure to measure all vital signs and consider the clinical presentation when assigning priority.';
	} else {
		feedback = 'Keep practicing! A complete vital signs assessment requires measuring all parameters.';
	}

	if (!priorityCorrect && state.priorityAssigned) {
		feedback += ` The correct priority for this patient was "${patient.treatmentPriority}".`;
	}

	return {
		patientName: patient.name,
		totalVitals,
		measuredCount,
		normalCount,
		abnormalCount,
		ecgRecorded: state.ecgRecorded,
		priorityCorrect,
		completionPercent,
		accuracy,
		feedback,
		grade,
		correctPriority: patient.treatmentPriority
	};
}

// Generate ECG data points for visualization
export function generateEcgData(pattern: PatientScenario['ecgPattern'], points: number = 100): number[] {
	const data: number[] = [];
	const baselineNoise = () => (Math.random() - 0.5) * 0.05;

	for (let i = 0; i < points; i++) {
		const t = (i / points) * Math.PI * 4;
		let value = 0;

		switch (pattern) {
			case 'normal':
				// Normal sinus rhythm
				if (i % 25 === 10) value = 0.8 + baselineNoise(); // R wave
				else if (i % 25 === 8) value = -0.1 + baselineNoise(); // Q wave
				else if (i % 25 === 12) value = -0.2 + baselineNoise(); // S wave
				else if (i % 25 === 5) value = 0.15 + baselineNoise(); // P wave
				else if (i % 25 >= 15 && i % 25 <= 18) value = 0.2 + baselineNoise(); // T wave
				else value = baselineNoise();
				break;

			case 'tachycardia':
				// Faster heart rate
				if (i % 15 === 6) value = 0.75 + baselineNoise();
				else if (i % 15 === 5) value = -0.1 + baselineNoise();
				else if (i % 15 === 7) value = -0.15 + baselineNoise();
				else if (i % 15 === 3) value = 0.12 + baselineNoise();
				else if (i % 15 >= 9 && i % 15 <= 11) value = 0.15 + baselineNoise();
				else value = baselineNoise();
				break;

			case 'bradycardia':
				// Slower heart rate
				if (i % 40 === 15) value = 0.85 + baselineNoise();
				else if (i % 40 === 13) value = -0.1 + baselineNoise();
				else if (i % 40 === 17) value = -0.2 + baselineNoise();
				else if (i % 40 === 8) value = 0.18 + baselineNoise();
				else if (i % 40 >= 22 && i % 40 <= 28) value = 0.25 + baselineNoise();
				else value = baselineNoise();
				break;

			case 'afib':
				// Irregular rhythm
				const irregularBase = i % (20 + Math.floor(Math.random() * 10));
				if (irregularBase === 8) value = 0.7 + Math.random() * 0.3;
				else if (irregularBase === 6) value = -0.05 - Math.random() * 0.1;
				else if (irregularBase === 10) value = -0.1 - Math.random() * 0.15;
				else value = (Math.random() - 0.5) * 0.15; // Irregular baseline
				break;

			case 'pvc':
				// Premature ventricular contractions
				const isPvc = i >= 45 && i <= 55;
				if (isPvc) {
					if (i === 48) value = -0.6 + baselineNoise();
					else if (i === 50) value = 1.2 + baselineNoise();
					else if (i === 52) value = -0.4 + baselineNoise();
					else value = baselineNoise() * 2;
				} else {
					if (i % 25 === 10) value = 0.8 + baselineNoise();
					else if (i % 25 === 8) value = -0.1 + baselineNoise();
					else if (i % 25 === 12) value = -0.2 + baselineNoise();
					else if (i % 25 === 5) value = 0.15 + baselineNoise();
					else if (i % 25 >= 15 && i % 25 <= 18) value = 0.2 + baselineNoise();
					else value = baselineNoise();
				}
				break;
		}

		data.push(value);
	}

	return data;
}
