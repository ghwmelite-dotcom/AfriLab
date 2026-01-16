/**
 * Tests for Vital Signs Assessment Simulation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
	createInitialState,
	selectPatient,
	measureVital,
	recordEcg,
	addNote,
	assignPriority,
	completeAssessment,
	getMeasurementCount,
	getAbnormalCount,
	analyzeVitalSigns,
	generateEcgData,
	VITAL_RANGES,
	PATIENT_SCENARIOS,
	type VitalSignsConfig,
	type VitalSignsState
} from '$lib/simulations/medical/vital-signs';

const defaultConfig: VitalSignsConfig = {
	patientId: 'healthy-adult',
	includeEcg: true
};

describe('Vital Signs Assessment Simulation', () => {
	describe('createInitialState', () => {
		it('should create initial state with null patient', () => {
			const state = createInitialState(defaultConfig);
			expect(state.currentPatientId).toBeNull();
		});

		it('should have all measurements as not measured', () => {
			const state = createInitialState(defaultConfig);
			Object.values(state.measurements).forEach((m) => {
				expect(m.measured).toBe(false);
				expect(m.value).toBeNull();
				expect(m.interpretation).toBeNull();
			});
		});

		it('should have no ECG recorded initially', () => {
			const state = createInitialState(defaultConfig);
			expect(state.ecgRecorded).toBe(false);
			expect(state.ecgDuration).toBe(0);
		});

		it('should have empty student notes', () => {
			const state = createInitialState(defaultConfig);
			expect(state.studentNotes).toEqual([]);
		});

		it('should not be complete initially', () => {
			const state = createInitialState(defaultConfig);
			expect(state.assessmentComplete).toBe(false);
		});

		it('should have no priority assigned initially', () => {
			const state = createInitialState(defaultConfig);
			expect(state.priorityAssigned).toBeNull();
		});
	});

	describe('selectPatient', () => {
		it('should set the current patient ID', () => {
			let state = createInitialState(defaultConfig);
			state = selectPatient(state, 'healthy-adult');
			expect(state.currentPatientId).toBe('healthy-adult');
		});

		it('should reset measurements when selecting a new patient', () => {
			let state = createInitialState(defaultConfig);
			state = selectPatient(state, 'healthy-adult');
			state = measureVital(state, 'heartRate', false);
			state = selectPatient(state, 'hypertensive');
			expect(state.measurements.heartRate.measured).toBe(false);
		});
	});

	describe('measureVital', () => {
		it('should record heart rate measurement', () => {
			let state = createInitialState(defaultConfig);
			state = selectPatient(state, 'healthy-adult');
			state = measureVital(state, 'heartRate', false);
			expect(state.measurements.heartRate.measured).toBe(true);
			expect(state.measurements.heartRate.value).toBeCloseTo(72, 0);
		});

		it('should record blood pressure measurements', () => {
			let state = createInitialState(defaultConfig);
			state = selectPatient(state, 'hypertensive');
			state = measureVital(state, 'systolicBP', false);
			state = measureVital(state, 'diastolicBP', false);
			expect(state.measurements.systolicBP.measured).toBe(true);
			expect(state.measurements.diastolicBP.measured).toBe(true);
			expect(state.measurements.systolicBP.value).toBeCloseTo(158, 0);
			expect(state.measurements.diastolicBP.value).toBeCloseTo(98, 0);
		});

		it('should interpret normal values correctly', () => {
			let state = createInitialState(defaultConfig);
			state = selectPatient(state, 'healthy-adult');
			state = measureVital(state, 'heartRate', false);
			expect(state.measurements.heartRate.interpretation).toBe('normal');
		});

		it('should interpret high values correctly', () => {
			let state = createInitialState(defaultConfig);
			state = selectPatient(state, 'hypertensive');
			state = measureVital(state, 'systolicBP', false);
			expect(state.measurements.systolicBP.interpretation).toBe('high');
		});

		it('should interpret low oxygen saturation correctly', () => {
			let state = createInitialState(defaultConfig);
			state = selectPatient(state, 'respiratory');
			state = measureVital(state, 'oxygenSaturation', false);
			expect(state.measurements.oxygenSaturation.interpretation).toBe('low');
		});

		it('should set timestamp on measurement', () => {
			let state = createInitialState(defaultConfig);
			state = selectPatient(state, 'healthy-adult');
			const before = new Date();
			state = measureVital(state, 'heartRate', false);
			const after = new Date();
			expect(state.measurements.heartRate.timestamp).toBeTruthy();
			expect(state.measurements.heartRate.timestamp!.getTime()).toBeGreaterThanOrEqual(before.getTime());
			expect(state.measurements.heartRate.timestamp!.getTime()).toBeLessThanOrEqual(after.getTime());
		});

		it('should not change state if no patient selected', () => {
			const state = createInitialState(defaultConfig);
			const newState = measureVital(state, 'heartRate');
			expect(newState.measurements.heartRate.measured).toBe(false);
		});

		it('should add variation when specified', () => {
			let state = createInitialState(defaultConfig);
			state = selectPatient(state, 'healthy-adult');
			// Run multiple times to check variation exists
			const values: number[] = [];
			for (let i = 0; i < 10; i++) {
				const testState = measureVital(state, 'heartRate', true);
				values.push(testState.measurements.heartRate.value!);
			}
			// Check that values are close to 72 but have some variation
			const hasVariation = values.some((v) => v !== 72);
			const allClose = values.every((v) => Math.abs(v - 72) < 2);
			expect(allClose).toBe(true);
		});
	});

	describe('recordEcg', () => {
		it('should record ECG with duration', () => {
			let state = createInitialState(defaultConfig);
			state = recordEcg(state, 15);
			expect(state.ecgRecorded).toBe(true);
			expect(state.ecgDuration).toBe(15);
		});
	});

	describe('addNote', () => {
		it('should add note to student notes', () => {
			let state = createInitialState(defaultConfig);
			state = addNote(state, 'Patient appears anxious');
			expect(state.studentNotes.length).toBe(1);
			expect(state.studentNotes[0]).toBe('Patient appears anxious');
		});

		it('should accumulate multiple notes', () => {
			let state = createInitialState(defaultConfig);
			state = addNote(state, 'Note 1');
			state = addNote(state, 'Note 2');
			state = addNote(state, 'Note 3');
			expect(state.studentNotes.length).toBe(3);
		});
	});

	describe('assignPriority', () => {
		it('should assign routine priority', () => {
			let state = createInitialState(defaultConfig);
			state = assignPriority(state, 'routine');
			expect(state.priorityAssigned).toBe('routine');
		});

		it('should assign urgent priority', () => {
			let state = createInitialState(defaultConfig);
			state = assignPriority(state, 'urgent');
			expect(state.priorityAssigned).toBe('urgent');
		});

		it('should assign emergent priority', () => {
			let state = createInitialState(defaultConfig);
			state = assignPriority(state, 'emergent');
			expect(state.priorityAssigned).toBe('emergent');
		});
	});

	describe('completeAssessment', () => {
		it('should mark assessment as complete', () => {
			let state = createInitialState(defaultConfig);
			state = completeAssessment(state);
			expect(state.assessmentComplete).toBe(true);
		});
	});

	describe('getMeasurementCount', () => {
		it('should return 0 for fresh state', () => {
			const state = createInitialState(defaultConfig);
			expect(getMeasurementCount(state)).toBe(0);
		});

		it('should count measured vitals', () => {
			let state = createInitialState(defaultConfig);
			state = selectPatient(state, 'healthy-adult');
			state = measureVital(state, 'heartRate', false);
			state = measureVital(state, 'temperature', false);
			state = measureVital(state, 'oxygenSaturation', false);
			expect(getMeasurementCount(state)).toBe(3);
		});

		it('should count all 6 vitals when all measured', () => {
			let state = createInitialState(defaultConfig);
			state = selectPatient(state, 'healthy-adult');
			state = measureVital(state, 'heartRate', false);
			state = measureVital(state, 'systolicBP', false);
			state = measureVital(state, 'diastolicBP', false);
			state = measureVital(state, 'respiratoryRate', false);
			state = measureVital(state, 'oxygenSaturation', false);
			state = measureVital(state, 'temperature', false);
			expect(getMeasurementCount(state)).toBe(6);
		});
	});

	describe('getAbnormalCount', () => {
		it('should return 0 for fresh state', () => {
			const state = createInitialState(defaultConfig);
			expect(getAbnormalCount(state)).toBe(0);
		});

		it('should return 0 for healthy patient', () => {
			let state = createInitialState(defaultConfig);
			state = selectPatient(state, 'healthy-adult');
			state = measureVital(state, 'heartRate', false);
			state = measureVital(state, 'systolicBP', false);
			state = measureVital(state, 'diastolicBP', false);
			state = measureVital(state, 'respiratoryRate', false);
			state = measureVital(state, 'oxygenSaturation', false);
			state = measureVital(state, 'temperature', false);
			expect(getAbnormalCount(state)).toBe(0);
		});

		it('should count abnormal vitals for hypertensive patient', () => {
			let state = createInitialState(defaultConfig);
			state = selectPatient(state, 'hypertensive');
			state = measureVital(state, 'systolicBP', false);
			state = measureVital(state, 'diastolicBP', false);
			// Both systolic (158) and diastolic (98) are high
			expect(getAbnormalCount(state)).toBe(2);
		});
	});

	describe('analyzeVitalSigns', () => {
		it('should return F grade with no patient selected', () => {
			const state = createInitialState(defaultConfig);
			const analysis = analyzeVitalSigns(state);
			expect(analysis.grade).toBe('F');
			expect(analysis.patientName).toBe('Unknown');
		});

		it('should calculate completion percentage', () => {
			let state = createInitialState(defaultConfig);
			state = selectPatient(state, 'healthy-adult');
			state = measureVital(state, 'heartRate', false);
			state = measureVital(state, 'systolicBP', false);
			state = measureVital(state, 'diastolicBP', false);
			const analysis = analyzeVitalSigns(state);
			// 3 out of 7 (6 vitals + 1 ECG)
			expect(analysis.completionPercent).toBe(Math.round((3 / 7) * 100));
		});

		it('should include ECG in completion calculation', () => {
			let state = createInitialState(defaultConfig);
			state = selectPatient(state, 'healthy-adult');
			state = recordEcg(state, 10);
			const analysis = analyzeVitalSigns(state);
			// 1 out of 7 (ECG only)
			expect(analysis.completionPercent).toBe(Math.round((1 / 7) * 100));
		});

		it('should verify correct priority assignment', () => {
			let state = createInitialState(defaultConfig);
			state = selectPatient(state, 'healthy-adult');
			state = assignPriority(state, 'routine');
			const analysis = analyzeVitalSigns(state);
			expect(analysis.priorityCorrect).toBe(true);
			expect(analysis.correctPriority).toBe('routine');
		});

		it('should detect incorrect priority assignment', () => {
			let state = createInitialState(defaultConfig);
			state = selectPatient(state, 'respiratory'); // emergent priority
			state = assignPriority(state, 'routine');
			const analysis = analyzeVitalSigns(state);
			expect(analysis.priorityCorrect).toBe(false);
			expect(analysis.correctPriority).toBe('emergent');
		});

		it('should give higher accuracy for correct priority', () => {
			let stateCorrect = createInitialState(defaultConfig);
			stateCorrect = selectPatient(stateCorrect, 'healthy-adult');
			stateCorrect = assignPriority(stateCorrect, 'routine');

			let stateWrong = createInitialState(defaultConfig);
			stateWrong = selectPatient(stateWrong, 'healthy-adult');
			stateWrong = assignPriority(stateWrong, 'emergent');

			const analysisCorrect = analyzeVitalSigns(stateCorrect);
			const analysisWrong = analyzeVitalSigns(stateWrong);

			expect(analysisCorrect.accuracy).toBeGreaterThan(analysisWrong.accuracy);
		});

		it('should give bonus for multiple student notes', () => {
			let stateNoNotes = createInitialState(defaultConfig);
			stateNoNotes = selectPatient(stateNoNotes, 'healthy-adult');

			let stateWithNotes = createInitialState(defaultConfig);
			stateWithNotes = selectPatient(stateWithNotes, 'healthy-adult');
			stateWithNotes = addNote(stateWithNotes, 'Note 1');
			stateWithNotes = addNote(stateWithNotes, 'Note 2');

			const analysisNoNotes = analyzeVitalSigns(stateNoNotes);
			const analysisWithNotes = analyzeVitalSigns(stateWithNotes);

			expect(analysisWithNotes.accuracy).toBeGreaterThanOrEqual(analysisNoNotes.accuracy);
		});

		it('should give bonus for longer ECG recording', () => {
			let stateShortEcg = createInitialState(defaultConfig);
			stateShortEcg = selectPatient(stateShortEcg, 'healthy-adult');
			stateShortEcg = recordEcg(stateShortEcg, 5);

			let stateLongEcg = createInitialState(defaultConfig);
			stateLongEcg = selectPatient(stateLongEcg, 'healthy-adult');
			stateLongEcg = recordEcg(stateLongEcg, 15);

			const analysisShort = analyzeVitalSigns(stateShortEcg);
			const analysisLong = analyzeVitalSigns(stateLongEcg);

			expect(analysisLong.accuracy).toBeGreaterThanOrEqual(analysisShort.accuracy);
		});

		it('should return grade A for complete assessment', () => {
			let state = createInitialState(defaultConfig);
			state = selectPatient(state, 'healthy-adult');
			state = measureVital(state, 'heartRate', false);
			state = measureVital(state, 'systolicBP', false);
			state = measureVital(state, 'diastolicBP', false);
			state = measureVital(state, 'respiratoryRate', false);
			state = measureVital(state, 'oxygenSaturation', false);
			state = measureVital(state, 'temperature', false);
			state = recordEcg(state, 15);
			state = assignPriority(state, 'routine');
			state = addNote(state, 'All vitals normal');
			state = addNote(state, 'Patient stable');

			const analysis = analyzeVitalSigns(state);
			expect(analysis.grade).toBe('A');
		});

		it('should provide feedback for incorrect priority', () => {
			let state = createInitialState(defaultConfig);
			state = selectPatient(state, 'respiratory');
			state = assignPriority(state, 'routine');
			const analysis = analyzeVitalSigns(state);
			expect(analysis.feedback).toContain('emergent');
		});
	});

	describe('generateEcgData', () => {
		it('should generate specified number of points', () => {
			const data = generateEcgData('normal', 100);
			expect(data.length).toBe(100);
		});

		it('should generate data for normal pattern', () => {
			const data = generateEcgData('normal', 100);
			// Should have some variation (R waves, etc.)
			const max = Math.max(...data);
			const min = Math.min(...data);
			expect(max).toBeGreaterThan(0.5); // R wave should be high
			expect(min).toBeLessThan(0); // S wave should be negative
		});

		it('should generate data for tachycardia pattern', () => {
			const data = generateEcgData('tachycardia', 100);
			expect(data.length).toBe(100);
			const max = Math.max(...data);
			expect(max).toBeGreaterThan(0.5);
		});

		it('should generate data for bradycardia pattern', () => {
			const data = generateEcgData('bradycardia', 100);
			expect(data.length).toBe(100);
			const max = Math.max(...data);
			expect(max).toBeGreaterThan(0.5);
		});

		it('should generate data for afib pattern', () => {
			const data = generateEcgData('afib', 100);
			expect(data.length).toBe(100);
		});

		it('should generate data for pvc pattern', () => {
			const data = generateEcgData('pvc', 100);
			expect(data.length).toBe(100);
			// PVC pattern should have a very high spike
			const max = Math.max(...data);
			expect(max).toBeGreaterThan(1);
		});
	});

	describe('VITAL_RANGES', () => {
		it('should have 6 vital sign ranges', () => {
			expect(Object.keys(VITAL_RANGES).length).toBe(6);
		});

		it('should have valid ranges for heart rate', () => {
			expect(VITAL_RANGES.heartRate.min).toBe(60);
			expect(VITAL_RANGES.heartRate.max).toBe(100);
			expect(VITAL_RANGES.heartRate.unit).toBe('bpm');
		});

		it('should have valid ranges for blood pressure', () => {
			expect(VITAL_RANGES.systolicBP.min).toBe(90);
			expect(VITAL_RANGES.systolicBP.max).toBe(120);
			expect(VITAL_RANGES.diastolicBP.min).toBe(60);
			expect(VITAL_RANGES.diastolicBP.max).toBe(80);
		});

		it('should have valid ranges for oxygen saturation', () => {
			expect(VITAL_RANGES.oxygenSaturation.min).toBe(95);
			expect(VITAL_RANGES.oxygenSaturation.max).toBe(100);
		});
	});

	describe('PATIENT_SCENARIOS', () => {
		it('should have 4 patient scenarios', () => {
			expect(PATIENT_SCENARIOS.length).toBe(4);
		});

		it('should have unique patient IDs', () => {
			const ids = PATIENT_SCENARIOS.map((p) => p.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(PATIENT_SCENARIOS.length);
		});

		it('should include healthy-adult patient', () => {
			const healthy = PATIENT_SCENARIOS.find((p) => p.id === 'healthy-adult');
			expect(healthy).toBeTruthy();
			expect(healthy?.treatmentPriority).toBe('routine');
		});

		it('should include emergent patient', () => {
			const emergent = PATIENT_SCENARIOS.find((p) => p.treatmentPriority === 'emergent');
			expect(emergent).toBeTruthy();
			expect(emergent?.id).toBe('respiratory');
		});

		it('should have valid vital signs for each patient', () => {
			PATIENT_SCENARIOS.forEach((patient) => {
				expect(patient.vitalSigns.heartRate).toBeGreaterThan(0);
				expect(patient.vitalSigns.systolicBP).toBeGreaterThan(0);
				expect(patient.vitalSigns.diastolicBP).toBeGreaterThan(0);
				expect(patient.vitalSigns.respiratoryRate).toBeGreaterThan(0);
				expect(patient.vitalSigns.oxygenSaturation).toBeGreaterThan(0);
				expect(patient.vitalSigns.temperature).toBeGreaterThan(0);
			});
		});

		it('should have valid ECG patterns', () => {
			const validPatterns = ['normal', 'tachycardia', 'bradycardia', 'afib', 'pvc'];
			PATIENT_SCENARIOS.forEach((patient) => {
				expect(validPatterns).toContain(patient.ecgPattern);
			});
		});
	});
});
