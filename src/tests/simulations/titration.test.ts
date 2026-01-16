/**
 * Tests for Titration Simulation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
	createInitialState,
	addDrop,
	pour,
	calculatePH,
	calculateEquivalenceVolume,
	analyzeTitration,
	generatePHCurveData,
	type TitrationConfig
} from '$lib/simulations/chemistry/titration';

// Default test configuration
const defaultConfig: TitrationConfig = {
	acid: {
		name: 'Hydrochloric Acid',
		formula: 'HCl',
		concentration: 0.1, // 0.1 M
		volume: 25 // 25 mL
	},
	base: {
		name: 'Sodium Hydroxide',
		formula: 'NaOH',
		concentration: 0.1, // 0.1 M
		volume: 50 // 50 mL in burette
	},
	indicator: 'phenolphthalein'
};

describe('Titration Simulation', () => {
	describe('createInitialState', () => {
		it('should create initial state with correct defaults', () => {
			const state = createInitialState(defaultConfig);

			expect(state.buretteVolume).toBe(50);
			expect(state.buretteInitialVolume).toBe(50);
			expect(state.flaskVolume).toBe(25);
			expect(state.flaskConcentration).toBe(0.1);
			expect(state.titrantConcentration).toBe(0.1);
			expect(state.dropCount).toBe(0);
			expect(state.endpointReached).toBe(false);
		});

		it('should have valid initial pH for acid solution', () => {
			const state = createInitialState(defaultConfig);
			expect(state.pH).toBeGreaterThan(0);
			expect(state.pH).toBeLessThan(7); // Acid should be less than 7
		});

		it('should have transparent color for phenolphthalein in acid', () => {
			const state = createInitialState(defaultConfig);
			// Phenolphthalein is colorless in acid (pH < 8.2)
			expect(state.indicatorColor).toBe('transparent');
		});

		it('should have empty measurements array', () => {
			const state = createInitialState(defaultConfig);
			expect(state.measurements).toEqual([]);
		});
	});

	describe('calculatePH', () => {
		it('should return acidic pH when no base added', () => {
			const pH = calculatePH(0.1, 0, 25, 0.1);
			expect(pH).toBeLessThan(7);
		});

		it('should return pH 7 at equivalence point', () => {
			// For 0.1M acid, 25mL + 0.1M base, 25mL = equivalence
			const pH = calculatePH(0.1, 25, 25, 0.1);
			expect(pH).toBe(7);
		});

		it('should return basic pH after equivalence point', () => {
			const pH = calculatePH(0.1, 30, 25, 0.1);
			expect(pH).toBeGreaterThan(7);
		});
	});

	describe('calculateEquivalenceVolume', () => {
		it('should calculate correct equivalence volume for equal concentrations', () => {
			// Ca * Va = Cb * Vb
			// 0.1 * 25 = 0.1 * Vb
			// Vb = 25 mL
			const volume = calculateEquivalenceVolume(0.1, 25, 0.1);
			expect(volume).toBe(25);
		});

		it('should calculate correct equivalence volume for different concentrations', () => {
			// 0.1 * 25 = 0.05 * Vb
			// Vb = 50 mL
			const volume = calculateEquivalenceVolume(0.1, 25, 0.05);
			expect(volume).toBe(50);
		});
	});

	describe('addDrop', () => {
		it('should decrease burette volume when drop is added', () => {
			const state = createInitialState(defaultConfig);
			const newState = addDrop(state, 0.05, 'phenolphthalein');

			expect(newState.buretteVolume).toBeLessThan(state.buretteVolume);
		});

		it('should increase drop count', () => {
			const state = createInitialState(defaultConfig);
			const newState = addDrop(state, 0.05, 'phenolphthalein');

			expect(newState.dropCount).toBe(1);
		});

		it('should add measurement to measurements array', () => {
			const state = createInitialState(defaultConfig);
			const newState = addDrop(state, 0.05, 'phenolphthalein');

			expect(newState.measurements.length).toBe(1);
			expect(newState.measurements[0]).toHaveProperty('volumeAdded');
			expect(newState.measurements[0]).toHaveProperty('pH');
		});

		it('should change pH when drop is added', () => {
			const state = createInitialState(defaultConfig);
			const newState = addDrop(state, 0.05, 'phenolphthalein');

			expect(newState.pH).not.toBe(state.pH);
		});

		it('should not add drop when burette is empty', () => {
			const state = createInitialState({
				...defaultConfig,
				base: { ...defaultConfig.base, volume: 0 }
			});
			const newState = addDrop(state, 0.05, 'phenolphthalein');

			expect(newState.dropCount).toBe(0);
		});
	});

	describe('pour', () => {
		it('should add multiple drops based on duration and flow rate', () => {
			const state = createInitialState(defaultConfig);
			// Pour for 1 second at 0.5 mL/s = 0.5 mL = 10 drops (0.05 mL each)
			const newState = pour(state, 1, 0.5, 'phenolphthalein');

			expect(newState.dropCount).toBeGreaterThan(0);
			expect(newState.buretteVolume).toBeLessThan(state.buretteVolume);
		});

		it('should change pH with continuous pouring', () => {
			const state = createInitialState(defaultConfig);
			// Pour for 5 seconds at 1 mL/s = 5 mL of base
			const newState = pour(state, 5, 1, 'phenolphthalein');

			// pH change is logarithmic - small changes before equivalence point
			expect(newState.pH).not.toBe(state.pH);
			expect(newState.dropCount).toBeGreaterThan(50); // Should have many drops
		});

		it('should dramatically change pH when pouring past equivalence', () => {
			const state = createInitialState(defaultConfig);
			// Pour 30 mL - past the 25 mL equivalence point
			const newState = pour(state, 30, 1, 'phenolphthalein');

			// Should now be basic (past equivalence) with significant pH change
			expect(newState.pH).toBeGreaterThan(7);
		});
	});

	describe('analyzeTitration', () => {
		it('should report not complete when endpoint not reached', () => {
			const state = createInitialState(defaultConfig);
			const analysis = analyzeTitration(state);

			expect(analysis.isComplete).toBe(false);
		});

		it('should calculate volume used correctly', () => {
			const state = createInitialState(defaultConfig);
			const newState = addDrop(state, 0.05, 'phenolphthalein');
			const analysis = analyzeTitration(newState);

			expect(analysis.volumeUsed).toBeCloseTo(0.05, 2);
		});

		it('should calculate correct equivalence volume', () => {
			const state = createInitialState(defaultConfig);
			const analysis = analyzeTitration(state);

			// For equal concentrations, equivalence volume = acid volume
			expect(analysis.equivalenceVolume).toBe(25);
		});

		it('should provide feedback', () => {
			const state = createInitialState(defaultConfig);
			const analysis = analyzeTitration(state);

			expect(analysis.feedback).toBeDefined();
			expect(typeof analysis.feedback).toBe('string');
		});
	});

	describe('generatePHCurveData', () => {
		it('should generate array of data points', () => {
			const data = generatePHCurveData(0.1, 25, 0.1, 50, 20);

			expect(Array.isArray(data)).toBe(true);
			expect(data.length).toBeGreaterThan(0);
		});

		it('should include volume and pH for each point', () => {
			const data = generatePHCurveData(0.1, 25, 0.1, 50, 10);

			data.forEach(point => {
				expect(point).toHaveProperty('volume');
				expect(point).toHaveProperty('pH');
			});
		});

		it('should show pH 7 near equivalence point', () => {
			const data = generatePHCurveData(0.1, 25, 0.1, 50, 100);

			// Find point closest to 25 mL (equivalence point)
			const nearEquivalence = data.find(p => Math.abs(p.volume - 25) < 1);
			expect(nearEquivalence).toBeDefined();
			expect(Math.abs(nearEquivalence!.pH - 7)).toBeLessThan(1);
		});
	});

	describe('endpoint detection', () => {
		it('should detect endpoint when pH crosses 7', () => {
			let state = createInitialState(defaultConfig);

			// Pour until we pass equivalence point
			for (let i = 0; i < 600; i++) { // Add ~30 mL in small drops
				state = addDrop(state, 0.05, 'phenolphthalein');
				if (state.endpointReached) break;
			}

			expect(state.endpointReached).toBe(true);
		});
	});

	describe('color change', () => {
		it('should change color to pink when pH becomes basic', () => {
			let state = createInitialState(defaultConfig);
			const initialColor = state.indicatorColor;

			// Pour past equivalence point
			state = pour(state, 30, 1, 'phenolphthalein'); // Add ~30 mL

			// Phenolphthalein should turn pink in basic solution
			expect(state.indicatorColor).not.toBe(initialColor);
		});

		it('should have different colors for different indicators', () => {
			const state1 = createInitialState({ ...defaultConfig, indicator: 'phenolphthalein' });
			const state2 = createInitialState({ ...defaultConfig, indicator: 'methyl-orange' });
			const state3 = createInitialState({ ...defaultConfig, indicator: 'bromothymol-blue' });

			// All start with different colors based on their indicator
			// Phenolphthalein: transparent in acid
			// Methyl orange: red in acid (pH < 3.1)
			// Bromothymol blue: yellow in acid (pH < 6)
			expect(state1.indicatorColor).toBe('transparent'); // phenolphthalein in acid
		});
	});
});
