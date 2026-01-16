/**
 * Tests for Projectile Motion Simulation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
	createInitialState,
	setVelocity,
	setAngle,
	selectPlanet,
	setLaunchHeight,
	launch,
	updateSimulation,
	recordMeasurement,
	reset,
	clearMeasurements,
	calculateTheoretical,
	generateTrajectory,
	getPositionAtTime,
	applyPreset,
	PLANETS,
	PRESETS,
	PROJECTILE_QUIZ,
	analyzeExperiment,
	type ProjectileConfig
} from '$lib/simulations/physics/projectile-motion';

const defaultConfig: ProjectileConfig = {
	initialVelocity: 20,
	launchAngle: 45,
	gravity: 9.8,
	launchHeight: 0
};

describe('Projectile Motion Simulation', () => {
	describe('createInitialState', () => {
		it('should create initial state with correct defaults', () => {
			const state = createInitialState(defaultConfig);

			expect(state.initialVelocity).toBe(20);
			expect(state.launchAngle).toBe(45);
			expect(state.gravity).toBe(9.8);
			expect(state.launchHeight).toBe(0);
		});

		it('should not be launched initially', () => {
			const state = createInitialState(defaultConfig);
			expect(state.isLaunched).toBe(false);
		});

		it('should start at origin', () => {
			const state = createInitialState(defaultConfig);
			expect(state.projectileX).toBe(0);
			expect(state.projectileY).toBe(0);
		});

		it('should have Earth as default planet', () => {
			const state = createInitialState(defaultConfig);
			expect(state.selectedPlanet.id).toBe('earth');
		});

		it('should have empty measurements', () => {
			const state = createInitialState(defaultConfig);
			expect(state.measurements).toEqual([]);
		});
	});

	describe('calculateTheoretical', () => {
		it('should calculate correct range at 45 degrees', () => {
			// Range = v^2 * sin(2*theta) / g
			// For v=20, theta=45, g=9.8: R = 400 * sin(90) / 9.8 = 40.82
			const result = calculateTheoretical(20, 45, 9.8, 0);
			expect(result.range).toBeCloseTo(40.82, 1);
		});

		it('should calculate correct max height', () => {
			// H = v^2 * sin^2(theta) / (2*g)
			// For v=20, theta=45, g=9.8: H = 400 * 0.5 / 19.6 = 10.2
			const result = calculateTheoretical(20, 45, 9.8, 0);
			expect(result.maxHeight).toBeCloseTo(10.2, 1);
		});

		it('should return 0 range for 0 degree angle', () => {
			const result = calculateTheoretical(20, 0, 9.8, 0);
			expect(result.range).toBeCloseTo(0, 1);
		});

		it('should return 0 range for 90 degree angle (on flat ground)', () => {
			const result = calculateTheoretical(20, 90, 9.8, 0);
			expect(result.range).toBeCloseTo(0, 1);
		});

		it('should increase range with lower gravity', () => {
			const earthResult = calculateTheoretical(20, 45, 9.8, 0);
			const moonResult = calculateTheoretical(20, 45, 1.62, 0);
			expect(moonResult.range).toBeGreaterThan(earthResult.range);
		});

		it('should account for launch height', () => {
			const groundResult = calculateTheoretical(20, 45, 9.8, 0);
			const elevatedResult = calculateTheoretical(20, 45, 9.8, 10);
			expect(elevatedResult.range).toBeGreaterThan(groundResult.range);
			expect(elevatedResult.maxHeight).toBeGreaterThan(groundResult.maxHeight);
		});
	});

	describe('getPositionAtTime', () => {
		it('should return starting position at t=0', () => {
			const pos = getPositionAtTime(20, 45, 9.8, 0, 0);
			expect(pos.x).toBe(0);
			expect(pos.y).toBe(0);
		});

		it('should have correct horizontal velocity', () => {
			// vx = v * cos(45) = 20 * 0.7071 = 14.14
			const pos = getPositionAtTime(20, 45, 9.8, 0, 0);
			expect(pos.vx).toBeCloseTo(14.14, 1);
		});

		it('should decrease vertical velocity over time', () => {
			const pos0 = getPositionAtTime(20, 45, 9.8, 0, 0);
			const pos1 = getPositionAtTime(20, 45, 9.8, 1, 0);
			expect(pos1.vy).toBeLessThan(pos0.vy);
		});
	});

	describe('generateTrajectory', () => {
		it('should generate trajectory points', () => {
			const trajectory = generateTrajectory(20, 45, 9.8, 0);
			expect(trajectory.length).toBeGreaterThan(0);
		});

		it('should start at origin', () => {
			const trajectory = generateTrajectory(20, 45, 9.8, 0);
			expect(trajectory[0].x).toBe(0);
			expect(trajectory[0].y).toBe(0);
		});

		it('should only contain non-negative y values', () => {
			const trajectory = generateTrajectory(20, 45, 9.8, 0);
			trajectory.forEach(point => {
				expect(point.y).toBeGreaterThanOrEqual(0);
			});
		});
	});

	describe('setVelocity', () => {
		it('should update velocity', () => {
			const state = createInitialState(defaultConfig);
			const newState = setVelocity(state, 30);
			expect(newState.initialVelocity).toBe(30);
		});

		it('should clamp velocity to valid range', () => {
			const state = createInitialState(defaultConfig);

			const lowState = setVelocity(state, 1);
			expect(lowState.initialVelocity).toBe(5);

			const highState = setVelocity(state, 100);
			expect(highState.initialVelocity).toBe(50);
		});

		it('should reset launch state', () => {
			let state = createInitialState(defaultConfig);
			state = launch(state);
			state = setVelocity(state, 30);
			expect(state.isLaunched).toBe(false);
		});
	});

	describe('setAngle', () => {
		it('should update angle', () => {
			const state = createInitialState(defaultConfig);
			const newState = setAngle(state, 60);
			expect(newState.launchAngle).toBe(60);
		});

		it('should clamp angle to valid range', () => {
			const state = createInitialState(defaultConfig);

			const lowState = setAngle(state, -10);
			expect(lowState.launchAngle).toBe(0);

			const highState = setAngle(state, 100);
			expect(highState.launchAngle).toBe(90);
		});
	});

	describe('selectPlanet', () => {
		it('should change planet', () => {
			const state = createInitialState(defaultConfig);
			const newState = selectPlanet(state, 'moon');
			expect(newState.selectedPlanet.id).toBe('moon');
			expect(newState.gravity).toBe(1.62);
		});

		it('should not change for invalid planet ID', () => {
			const state = createInitialState(defaultConfig);
			const newState = selectPlanet(state, 'invalid');
			expect(newState.selectedPlanet.id).toBe('earth');
		});
	});

	describe('setLaunchHeight', () => {
		it('should update launch height', () => {
			const state = createInitialState(defaultConfig);
			const newState = setLaunchHeight(state, 10);
			expect(newState.launchHeight).toBe(10);
			expect(newState.projectileY).toBe(10);
		});

		it('should clamp height to valid range', () => {
			const state = createInitialState(defaultConfig);

			const lowState = setLaunchHeight(state, -5);
			expect(lowState.launchHeight).toBe(0);

			const highState = setLaunchHeight(state, 100);
			expect(highState.launchHeight).toBe(50);
		});
	});

	describe('launch', () => {
		it('should set isLaunched to true', () => {
			const state = createInitialState(defaultConfig);
			const newState = launch(state);
			expect(newState.isLaunched).toBe(true);
		});

		it('should generate trajectory', () => {
			const state = createInitialState(defaultConfig);
			const newState = launch(state);
			expect(newState.trajectory.length).toBeGreaterThan(0);
		});

		it('should increment attempts', () => {
			const state = createInitialState(defaultConfig);
			expect(state.attempts).toBe(0);
			const newState = launch(state);
			expect(newState.attempts).toBe(1);
		});
	});

	describe('updateSimulation', () => {
		it('should return unchanged state if not launched', () => {
			const state = createInitialState(defaultConfig);
			const newState = updateSimulation(state, 0.1);
			expect(newState).toEqual(state);
		});

		it('should update position when launched', () => {
			let state = createInitialState(defaultConfig);
			state = launch(state);
			const newState = updateSimulation(state, 0.1);
			expect(newState.currentTime).toBeGreaterThan(0);
		});
	});

	describe('recordMeasurement', () => {
		it('should record measurement after launch', () => {
			let state = createInitialState(defaultConfig);
			state = launch(state);
			// Simulate until landed
			while (state.isLaunched) {
				state = updateSimulation(state, 0.1);
			}
			state = recordMeasurement(state);
			expect(state.measurements.length).toBe(1);
		});

		it('should not record with empty trajectory', () => {
			const state = createInitialState(defaultConfig);
			const newState = recordMeasurement(state);
			expect(newState.measurements.length).toBe(0);
		});
	});

	describe('reset', () => {
		it('should reset to initial position', () => {
			let state = createInitialState(defaultConfig);
			state = launch(state);
			state = reset(state);

			expect(state.isLaunched).toBe(false);
			expect(state.currentTime).toBe(0);
			expect(state.projectileX).toBe(0);
			expect(state.trajectory).toEqual([]);
		});
	});

	describe('clearMeasurements', () => {
		it('should clear all measurements', () => {
			let state = createInitialState(defaultConfig);
			state = launch(state);
			while (state.isLaunched) {
				state = updateSimulation(state, 0.1);
			}
			state = recordMeasurement(state);
			state = clearMeasurements(state);
			expect(state.measurements.length).toBe(0);
		});
	});

	describe('applyPreset', () => {
		it('should apply preset values', () => {
			const state = createInitialState(defaultConfig);
			const preset = PRESETS[0];
			const newState = applyPreset(state, preset);
			expect(newState.launchAngle).toBe(preset.angle);
			expect(newState.initialVelocity).toBe(preset.velocity);
		});
	});

	describe('PLANETS', () => {
		it('should have 5 planets', () => {
			expect(PLANETS.length).toBe(5);
		});

		it('should include Earth', () => {
			const earth = PLANETS.find(p => p.id === 'earth');
			expect(earth).toBeTruthy();
			expect(earth?.gravity).toBeCloseTo(9.8, 1);
		});

		it('should have Moon with lower gravity', () => {
			const moon = PLANETS.find(p => p.id === 'moon');
			const earth = PLANETS.find(p => p.id === 'earth');
			expect(moon).toBeTruthy();
			expect(moon!.gravity).toBeLessThan(earth!.gravity);
		});
	});

	describe('PROJECTILE_QUIZ', () => {
		it('should have questions', () => {
			expect(PROJECTILE_QUIZ.length).toBeGreaterThan(0);
		});

		it('should have correct answers in options', () => {
			PROJECTILE_QUIZ.forEach(q => {
				expect(q.options).toContain(q.correctAnswer);
			});
		});
	});

	describe('analyzeExperiment', () => {
		it('should calculate quiz score', () => {
			const state = createInitialState(defaultConfig);
			const quizAnswers = new Map<string, string>();

			// Answer first question correctly
			quizAnswers.set(PROJECTILE_QUIZ[0].id, PROJECTILE_QUIZ[0].correctAnswer);

			const analysis = analyzeExperiment(state, quizAnswers);
			expect(analysis.quizScore.correct).toBe(1);
		});

		it('should return grade', () => {
			const state = createInitialState(defaultConfig);
			const quizAnswers = new Map<string, string>();

			const analysis = analyzeExperiment(state, quizAnswers);
			expect(['A', 'B', 'C', 'D', 'F']).toContain(analysis.grade);
		});
	});
});
