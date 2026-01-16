/**
 * Cell Division (Mitosis) Lab Simulation
 * Virtual observation and identification of mitosis phases
 */

// Mitosis phases
export type MitosisPhase = 'interphase' | 'prophase' | 'metaphase' | 'anaphase' | 'telophase' | 'cytokinesis';

export interface PhaseInfo {
	id: MitosisPhase;
	name: string;
	description: string;
	keyFeatures: string[];
	duration: string; // Relative duration
	color: string;
}

export const MITOSIS_PHASES: PhaseInfo[] = [
	{
		id: 'interphase',
		name: 'Interphase',
		description: 'The cell grows and replicates its DNA in preparation for division. The nuclear membrane is intact and chromosomes are not visible.',
		keyFeatures: [
			'Nuclear membrane visible',
			'Chromatin (uncondensed DNA)',
			'Cell grows and replicates DNA',
			'Nucleolus visible'
		],
		duration: 'Longest phase (~90% of cell cycle)',
		color: 'rgb(100, 149, 237)' // Cornflower blue
	},
	{
		id: 'prophase',
		name: 'Prophase',
		description: 'Chromatin condenses into visible chromosomes. The nuclear membrane begins to break down and spindle fibers start to form.',
		keyFeatures: [
			'Chromosomes become visible',
			'Nuclear membrane dissolves',
			'Spindle fibers form',
			'Centrioles move to poles'
		],
		duration: '~5% of mitosis',
		color: 'rgb(144, 238, 144)' // Light green
	},
	{
		id: 'metaphase',
		name: 'Metaphase',
		description: 'Chromosomes align at the cell\'s equator (metaphase plate). Spindle fibers attach to the centromeres.',
		keyFeatures: [
			'Chromosomes align at equator',
			'Spindle fibers attach to centromeres',
			'Sister chromatids still joined',
			'Clear metaphase plate visible'
		],
		duration: '~10% of mitosis',
		color: 'rgb(255, 215, 0)' // Gold
	},
	{
		id: 'anaphase',
		name: 'Anaphase',
		description: 'Sister chromatids separate and move to opposite poles of the cell. The cell begins to elongate.',
		keyFeatures: [
			'Sister chromatids separate',
			'Chromatids move to opposite poles',
			'Cell elongates',
			'Spindle fibers shorten'
		],
		duration: '~5% of mitosis (shortest phase)',
		color: 'rgb(255, 165, 0)' // Orange
	},
	{
		id: 'telophase',
		name: 'Telophase',
		description: 'Chromosomes arrive at poles and begin to decondense. Nuclear membranes reform around each set of chromosomes.',
		keyFeatures: [
			'Chromosomes at poles',
			'Nuclear membranes reform',
			'Chromosomes decondense',
			'Spindle fibers disappear'
		],
		duration: '~10% of mitosis',
		color: 'rgb(147, 112, 219)' // Medium purple
	},
	{
		id: 'cytokinesis',
		name: 'Cytokinesis',
		description: 'The cytoplasm divides, forming two separate daughter cells. In animal cells, a cleavage furrow forms.',
		keyFeatures: [
			'Cytoplasm divides',
			'Cleavage furrow forms (animal cells)',
			'Two daughter cells form',
			'Each cell has complete DNA'
		],
		duration: 'Overlaps with telophase',
		color: 'rgb(255, 99, 71)' // Tomato
	}
];

// Cell sample representing a cell in a specific phase
export interface CellSample {
	id: string;
	phase: MitosisPhase;
	x: number; // Position in view (0-100)
	y: number;
	rotation: number; // Degrees
	scale: number; // 0.8 - 1.2
}

// Generate random cell samples for the field of view
export function generateCellField(count: number = 12): CellSample[] {
	const phases: MitosisPhase[] = ['interphase', 'prophase', 'metaphase', 'anaphase', 'telophase', 'cytokinesis'];
	const cells: CellSample[] = [];

	// Ensure at least one of each phase
	phases.forEach((phase, index) => {
		cells.push({
			id: `cell-${index}`,
			phase,
			x: 15 + (index % 3) * 30 + Math.random() * 10,
			y: 20 + Math.floor(index / 3) * 30 + Math.random() * 10,
			rotation: Math.random() * 360,
			scale: 0.85 + Math.random() * 0.3
		});
	});

	// Add more cells up to count
	for (let i = 6; i < count; i++) {
		cells.push({
			id: `cell-${i}`,
			phase: phases[Math.floor(Math.random() * phases.length)],
			x: 10 + Math.random() * 80,
			y: 10 + Math.random() * 80,
			rotation: Math.random() * 360,
			scale: 0.85 + Math.random() * 0.3
		});
	}

	return cells;
}

// State for the cell division lab
export interface CellDivisionState {
	cells: CellSample[];
	selectedCellId: string | null;
	identifications: Map<string, MitosisPhase | null>; // Cell ID -> identified phase
	correctIdentifications: number;
	incorrectIdentifications: number;
	magnification: number;
	focusLevel: number;
	observations: Observation[];
	quizAnswers: Map<string, string>;
}

export interface Observation {
	timestamp: Date;
	cellId: string | null;
	phase: MitosisPhase | null;
	note: string;
}

// Configuration
export interface CellDivisionConfig {
	cellCount: number;
	includeQuiz: boolean;
}

// Create initial state
export function createInitialState(config: CellDivisionConfig): CellDivisionState {
	return {
		cells: generateCellField(config.cellCount),
		selectedCellId: null,
		identifications: new Map(),
		correctIdentifications: 0,
		incorrectIdentifications: 0,
		magnification: 400,
		focusLevel: 50,
		observations: [],
		quizAnswers: new Map()
	};
}

// Select a cell for examination
export function selectCell(state: CellDivisionState, cellId: string): CellDivisionState {
	return {
		...state,
		selectedCellId: cellId
	};
}

// Deselect current cell
export function deselectCell(state: CellDivisionState): CellDivisionState {
	return {
		...state,
		selectedCellId: null
	};
}

// Identify a cell's phase
export function identifyPhase(
	state: CellDivisionState,
	cellId: string,
	identifiedPhase: MitosisPhase
): CellDivisionState {
	const cell = state.cells.find((c) => c.id === cellId);
	if (!cell) return state;

	const newIdentifications = new Map(state.identifications);
	const wasAlreadyIdentified = newIdentifications.has(cellId);
	newIdentifications.set(cellId, identifiedPhase);

	const isCorrect = cell.phase === identifiedPhase;

	let newCorrect = state.correctIdentifications;
	let newIncorrect = state.incorrectIdentifications;

	if (!wasAlreadyIdentified) {
		if (isCorrect) {
			newCorrect++;
		} else {
			newIncorrect++;
		}
	}

	return {
		...state,
		identifications: newIdentifications,
		correctIdentifications: newCorrect,
		incorrectIdentifications: newIncorrect
	};
}

// Adjust magnification
export function setMagnification(state: CellDivisionState, magnification: number): CellDivisionState {
	return {
		...state,
		magnification: Math.max(100, Math.min(1000, magnification))
	};
}

// Adjust focus
export function adjustFocus(state: CellDivisionState, focusLevel: number): CellDivisionState {
	return {
		...state,
		focusLevel: Math.max(0, Math.min(100, focusLevel))
	};
}

// Add observation note
export function addObservation(
	state: CellDivisionState,
	note: string,
	phase?: MitosisPhase
): CellDivisionState {
	const observation: Observation = {
		timestamp: new Date(),
		cellId: state.selectedCellId,
		phase: phase || null,
		note
	};

	return {
		...state,
		observations: [...state.observations, observation]
	};
}

// Answer a quiz question
export function answerQuiz(
	state: CellDivisionState,
	questionId: string,
	answer: string
): CellDivisionState {
	const newAnswers = new Map(state.quizAnswers);
	newAnswers.set(questionId, answer);
	return {
		...state,
		quizAnswers: newAnswers
	};
}

// Get count of cells in each phase
export function getPhaseCounts(state: CellDivisionState): Map<MitosisPhase, number> {
	const counts = new Map<MitosisPhase, number>();
	MITOSIS_PHASES.forEach((phase) => counts.set(phase.id, 0));

	state.cells.forEach((cell) => {
		const current = counts.get(cell.phase) || 0;
		counts.set(cell.phase, current + 1);
	});

	return counts;
}

// Get identified cell count
export function getIdentifiedCount(state: CellDivisionState): number {
	return state.identifications.size;
}

// Analysis result
export interface CellDivisionAnalysis {
	totalCells: number;
	identifiedCount: number;
	correctCount: number;
	incorrectCount: number;
	accuracy: number;
	phaseCounts: Map<MitosisPhase, number>;
	observationCount: number;
	feedback: string;
	grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

// Analyze results
export function analyzeCellDivision(state: CellDivisionState): CellDivisionAnalysis {
	const totalCells = state.cells.length;
	const identifiedCount = getIdentifiedCount(state);
	const phaseCounts = getPhaseCounts(state);

	const accuracy =
		identifiedCount > 0
			? Math.round((state.correctIdentifications / identifiedCount) * 100)
			: 0;

	// Calculate overall score
	let score = 0;
	score += (identifiedCount / totalCells) * 40; // 40% for completion
	score += accuracy * 0.4; // 40% for accuracy
	score += Math.min(state.observations.length * 2, 20); // 20% for observations (max 10)

	// Determine grade
	let grade: 'A' | 'B' | 'C' | 'D' | 'F';
	if (score >= 90) grade = 'A';
	else if (score >= 80) grade = 'B';
	else if (score >= 70) grade = 'C';
	else if (score >= 60) grade = 'D';
	else grade = 'F';

	// Generate feedback
	let feedback = '';
	if (accuracy >= 90 && identifiedCount >= totalCells * 0.8) {
		feedback = 'Excellent work! You demonstrated strong understanding of mitosis phases.';
	} else if (accuracy >= 70) {
		feedback = 'Good identification skills! Review the phases you missed for better accuracy.';
	} else if (identifiedCount < totalCells * 0.5) {
		feedback = 'Try to identify more cells. Look carefully at the key features of each phase.';
	} else {
		feedback = 'Keep practicing! Pay attention to the distinguishing features of each phase.';
	}

	return {
		totalCells,
		identifiedCount,
		correctCount: state.correctIdentifications,
		incorrectCount: state.incorrectIdentifications,
		accuracy,
		phaseCounts,
		observationCount: state.observations.length,
		feedback,
		grade
	};
}

// Quiz questions about mitosis
export interface QuizQuestion {
	id: string;
	question: string;
	options: string[];
	correctAnswer: string;
	explanation: string;
}

export const MITOSIS_QUIZ: QuizQuestion[] = [
	{
		id: 'q1',
		question: 'During which phase do chromosomes align at the metaphase plate?',
		options: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'],
		correctAnswer: 'Metaphase',
		explanation: 'During metaphase, chromosomes align along the cell\'s equator, forming the metaphase plate.'
	},
	{
		id: 'q2',
		question: 'What happens to sister chromatids during anaphase?',
		options: [
			'They condense',
			'They align at the equator',
			'They separate and move to opposite poles',
			'They form the nuclear membrane'
		],
		correctAnswer: 'They separate and move to opposite poles',
		explanation: 'During anaphase, spindle fibers pull sister chromatids apart, moving them to opposite poles of the cell.'
	},
	{
		id: 'q3',
		question: 'Which phase is the longest in the cell cycle?',
		options: ['Prophase', 'Metaphase', 'Interphase', 'Telophase'],
		correctAnswer: 'Interphase',
		explanation: 'Interphase is the longest phase, taking up about 90% of the cell cycle, during which the cell grows and replicates its DNA.'
	},
	{
		id: 'q4',
		question: 'During which phase does the nuclear membrane reform?',
		options: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'],
		correctAnswer: 'Telophase',
		explanation: 'During telophase, the nuclear membranes reform around each set of chromosomes at the poles.'
	},
	{
		id: 'q5',
		question: 'What structure forms during cytokinesis in animal cells?',
		options: ['Cell plate', 'Cleavage furrow', 'Metaphase plate', 'Spindle apparatus'],
		correctAnswer: 'Cleavage furrow',
		explanation: 'In animal cells, a cleavage furrow forms during cytokinesis, pinching the cell in two.'
	}
];

// Check quiz answers
export function checkQuizAnswers(state: CellDivisionState): { correct: number; total: number } {
	let correct = 0;
	MITOSIS_QUIZ.forEach((question) => {
		const answer = state.quizAnswers.get(question.id);
		if (answer === question.correctAnswer) {
			correct++;
		}
	});
	return { correct, total: MITOSIS_QUIZ.length };
}
