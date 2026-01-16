/**
 * Tests for Cell Division (Mitosis) Simulation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
	createInitialState,
	selectCell,
	deselectCell,
	identifyPhase,
	generateCellField,
	analyzeCellDivision,
	getPhaseCounts,
	getIdentifiedCount,
	answerQuiz,
	checkQuizAnswers,
	MITOSIS_PHASES,
	MITOSIS_QUIZ,
	type CellDivisionConfig,
	type MitosisPhase
} from '$lib/simulations/biology/cell-division';

const defaultConfig: CellDivisionConfig = {
	cellCount: 12,
	includeQuiz: true
};

describe('Cell Division Simulation', () => {
	describe('createInitialState', () => {
		it('should create initial state with correct cell count', () => {
			const state = createInitialState(defaultConfig);
			expect(state.cells.length).toBe(12);
		});

		it('should have no selected cell initially', () => {
			const state = createInitialState(defaultConfig);
			expect(state.selectedCellId).toBeNull();
		});

		it('should have empty identifications initially', () => {
			const state = createInitialState(defaultConfig);
			expect(state.identifications.size).toBe(0);
		});

		it('should start with zero correct and incorrect counts', () => {
			const state = createInitialState(defaultConfig);
			expect(state.correctIdentifications).toBe(0);
			expect(state.incorrectIdentifications).toBe(0);
		});

		it('should have default magnification of 400', () => {
			const state = createInitialState(defaultConfig);
			expect(state.magnification).toBe(400);
		});
	});

	describe('generateCellField', () => {
		it('should generate at least one cell for each phase', () => {
			const cells = generateCellField(12);
			const phases = new Set(cells.map(c => c.phase));

			// All 6 phases should be present
			MITOSIS_PHASES.forEach(phase => {
				expect(phases.has(phase.id)).toBe(true);
			});
		});

		it('should generate cells with valid positions', () => {
			const cells = generateCellField(12);
			cells.forEach(cell => {
				expect(cell.x).toBeGreaterThanOrEqual(0);
				expect(cell.x).toBeLessThanOrEqual(100);
				expect(cell.y).toBeGreaterThanOrEqual(0);
				expect(cell.y).toBeLessThanOrEqual(100);
			});
		});

		it('should generate cells with valid scales', () => {
			const cells = generateCellField(12);
			cells.forEach(cell => {
				expect(cell.scale).toBeGreaterThanOrEqual(0.85);
				expect(cell.scale).toBeLessThanOrEqual(1.15);
			});
		});

		it('should generate unique cell IDs', () => {
			const cells = generateCellField(12);
			const ids = cells.map(c => c.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(cells.length);
		});
	});

	describe('selectCell', () => {
		it('should select a cell by ID', () => {
			const state = createInitialState(defaultConfig);
			const cellId = state.cells[0].id;
			const newState = selectCell(state, cellId);
			expect(newState.selectedCellId).toBe(cellId);
		});
	});

	describe('deselectCell', () => {
		it('should deselect the current cell', () => {
			let state = createInitialState(defaultConfig);
			state = selectCell(state, state.cells[0].id);
			state = deselectCell(state);
			expect(state.selectedCellId).toBeNull();
		});
	});

	describe('identifyPhase', () => {
		it('should record correct identification', () => {
			const state = createInitialState(defaultConfig);
			const cell = state.cells[0];
			const newState = identifyPhase(state, cell.id, cell.phase);

			expect(newState.identifications.get(cell.id)).toBe(cell.phase);
			expect(newState.correctIdentifications).toBe(1);
			expect(newState.incorrectIdentifications).toBe(0);
		});

		it('should record incorrect identification', () => {
			const state = createInitialState(defaultConfig);
			const cell = state.cells[0];
			// Find a different phase
			const wrongPhase = MITOSIS_PHASES.find(p => p.id !== cell.phase)?.id as MitosisPhase;
			const newState = identifyPhase(state, cell.id, wrongPhase);

			expect(newState.identifications.get(cell.id)).toBe(wrongPhase);
			expect(newState.correctIdentifications).toBe(0);
			expect(newState.incorrectIdentifications).toBe(1);
		});

		it('should not increment counters when re-identifying same cell', () => {
			let state = createInitialState(defaultConfig);
			const cell = state.cells[0];

			// First identification
			state = identifyPhase(state, cell.id, cell.phase);
			const correctAfterFirst = state.correctIdentifications;

			// Re-identify the same cell
			state = identifyPhase(state, cell.id, cell.phase);
			expect(state.correctIdentifications).toBe(correctAfterFirst);
		});
	});

	describe('getPhaseCounts', () => {
		it('should count cells in each phase', () => {
			const state = createInitialState(defaultConfig);
			const counts = getPhaseCounts(state);

			let total = 0;
			counts.forEach(count => {
				total += count;
			});

			expect(total).toBe(state.cells.length);
		});
	});

	describe('getIdentifiedCount', () => {
		it('should return 0 for fresh state', () => {
			const state = createInitialState(defaultConfig);
			expect(getIdentifiedCount(state)).toBe(0);
		});

		it('should increment as cells are identified', () => {
			let state = createInitialState(defaultConfig);
			state = identifyPhase(state, state.cells[0].id, 'interphase');
			state = identifyPhase(state, state.cells[1].id, 'prophase');

			expect(getIdentifiedCount(state)).toBe(2);
		});
	});

	describe('answerQuiz', () => {
		it('should record quiz answers', () => {
			let state = createInitialState(defaultConfig);
			state = answerQuiz(state, 'q1', 'Metaphase');

			expect(state.quizAnswers.get('q1')).toBe('Metaphase');
		});

		it('should allow changing answers', () => {
			let state = createInitialState(defaultConfig);
			state = answerQuiz(state, 'q1', 'Metaphase');
			state = answerQuiz(state, 'q1', 'Prophase');

			expect(state.quizAnswers.get('q1')).toBe('Prophase');
		});
	});

	describe('checkQuizAnswers', () => {
		it('should count correct answers', () => {
			let state = createInitialState(defaultConfig);

			// Answer all questions correctly
			MITOSIS_QUIZ.forEach(q => {
				state = answerQuiz(state, q.id, q.correctAnswer);
			});

			const result = checkQuizAnswers(state);
			expect(result.correct).toBe(MITOSIS_QUIZ.length);
			expect(result.total).toBe(MITOSIS_QUIZ.length);
		});

		it('should count incorrect answers', () => {
			let state = createInitialState(defaultConfig);

			// Answer all questions incorrectly
			MITOSIS_QUIZ.forEach(q => {
				const wrongAnswer = q.options.find(o => o !== q.correctAnswer) as string;
				state = answerQuiz(state, q.id, wrongAnswer);
			});

			const result = checkQuizAnswers(state);
			expect(result.correct).toBe(0);
		});
	});

	describe('analyzeCellDivision', () => {
		it('should return F grade with no identifications', () => {
			const state = createInitialState(defaultConfig);
			const analysis = analyzeCellDivision(state);

			expect(analysis.identifiedCount).toBe(0);
			expect(analysis.accuracy).toBe(0);
		});

		it('should calculate accuracy correctly', () => {
			let state = createInitialState(defaultConfig);

			// Identify first 4 cells correctly
			for (let i = 0; i < 4; i++) {
				const cell = state.cells[i];
				state = identifyPhase(state, cell.id, cell.phase);
			}

			const analysis = analyzeCellDivision(state);
			expect(analysis.identifiedCount).toBe(4);
			expect(analysis.accuracy).toBe(100);
			expect(analysis.correctCount).toBe(4);
		});

		it('should return grade based on performance', () => {
			let state = createInitialState(defaultConfig);

			// Identify all cells correctly
			state.cells.forEach(cell => {
				state = identifyPhase(state, cell.id, cell.phase);
			});

			const analysis = analyzeCellDivision(state);
			expect(['A', 'B']).toContain(analysis.grade);
		});
	});

	describe('MITOSIS_PHASES', () => {
		it('should have 6 phases', () => {
			expect(MITOSIS_PHASES.length).toBe(6);
		});

		it('should include all mitosis phases in correct order', () => {
			const expectedPhases = ['interphase', 'prophase', 'metaphase', 'anaphase', 'telophase', 'cytokinesis'];
			const actualPhases = MITOSIS_PHASES.map(p => p.id);
			expect(actualPhases).toEqual(expectedPhases);
		});

		it('should have descriptions and key features', () => {
			MITOSIS_PHASES.forEach(phase => {
				expect(phase.name).toBeTruthy();
				expect(phase.description).toBeTruthy();
				expect(phase.keyFeatures.length).toBeGreaterThan(0);
				expect(phase.color).toBeTruthy();
			});
		});
	});

	describe('MITOSIS_QUIZ', () => {
		it('should have questions with correct answers', () => {
			MITOSIS_QUIZ.forEach(q => {
				expect(q.options).toContain(q.correctAnswer);
			});
		});

		it('should have explanations for all questions', () => {
			MITOSIS_QUIZ.forEach(q => {
				expect(q.explanation).toBeTruthy();
			});
		});
	});
});
