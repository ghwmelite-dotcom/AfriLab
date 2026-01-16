/**
 * Microscopy Lab Simulation
 * Virtual compound microscope for cell observation
 */

// Cell structure definitions
export interface CellStructure {
	id: string;
	name: string;
	description: string;
	color: string;
	x: number; // Relative position (0-100)
	y: number;
	size: number; // Relative size
	shape: 'circle' | 'oval' | 'irregular' | 'rod';
}

export interface CellSample {
	id: string;
	name: string;
	type: 'plant' | 'animal' | 'bacteria';
	description: string;
	color: string;
	backgroundColor: string;
	structures: CellStructure[];
	optimalMagnification: number;
}

// Available cell samples
export const CELL_SAMPLES: CellSample[] = [
	{
		id: 'onion-epidermal',
		name: 'Onion Epidermal Cell',
		type: 'plant',
		description: 'Thin layer of cells from onion skin, ideal for observing cell walls and nuclei.',
		color: 'rgba(200, 230, 200, 0.6)',
		backgroundColor: 'rgba(240, 255, 240, 0.3)',
		optimalMagnification: 400,
		structures: [
			{ id: 'cell-wall', name: 'Cell Wall', description: 'Rigid outer layer made of cellulose', color: 'rgba(34, 139, 34, 0.8)', x: 50, y: 50, size: 95, shape: 'irregular' },
			{ id: 'cell-membrane', name: 'Cell Membrane', description: 'Thin membrane inside the cell wall', color: 'rgba(144, 238, 144, 0.5)', x: 50, y: 50, size: 88, shape: 'irregular' },
			{ id: 'nucleus', name: 'Nucleus', description: 'Contains genetic material (DNA)', color: 'rgba(75, 0, 130, 0.7)', x: 45, y: 40, size: 15, shape: 'oval' },
			{ id: 'nucleolus', name: 'Nucleolus', description: 'Dense region inside nucleus', color: 'rgba(48, 0, 82, 0.9)', x: 45, y: 40, size: 5, shape: 'circle' },
			{ id: 'vacuole', name: 'Central Vacuole', description: 'Large water-filled organelle for storage', color: 'rgba(173, 216, 230, 0.4)', x: 55, y: 55, size: 50, shape: 'irregular' },
			{ id: 'cytoplasm', name: 'Cytoplasm', description: 'Gel-like fluid filling the cell', color: 'rgba(255, 255, 224, 0.3)', x: 50, y: 50, size: 85, shape: 'irregular' }
		]
	},
	{
		id: 'cheek-cell',
		name: 'Human Cheek Cell',
		type: 'animal',
		description: 'Epithelial cells from the inner cheek, showing typical animal cell features.',
		color: 'rgba(255, 218, 185, 0.6)',
		backgroundColor: 'rgba(255, 240, 230, 0.3)',
		optimalMagnification: 400,
		structures: [
			{ id: 'cell-membrane', name: 'Cell Membrane', description: 'Flexible outer boundary of the cell', color: 'rgba(205, 133, 63, 0.6)', x: 50, y: 50, size: 90, shape: 'irregular' },
			{ id: 'nucleus', name: 'Nucleus', description: 'Control center containing DNA', color: 'rgba(139, 69, 19, 0.8)', x: 50, y: 45, size: 20, shape: 'circle' },
			{ id: 'nucleolus', name: 'Nucleolus', description: 'Produces ribosomes', color: 'rgba(101, 67, 33, 0.9)', x: 50, y: 45, size: 6, shape: 'circle' },
			{ id: 'cytoplasm', name: 'Cytoplasm', description: 'Contains organelles and cell fluid', color: 'rgba(255, 228, 196, 0.4)', x: 50, y: 50, size: 85, shape: 'irregular' },
			{ id: 'mitochondria', name: 'Mitochondria', description: 'Powerhouse of the cell - produces ATP', color: 'rgba(255, 99, 71, 0.6)', x: 65, y: 60, size: 8, shape: 'oval' },
			{ id: 'mitochondria-2', name: 'Mitochondria', description: 'Powerhouse of the cell - produces ATP', color: 'rgba(255, 99, 71, 0.6)', x: 35, y: 55, size: 7, shape: 'oval' }
		]
	},
	{
		id: 'elodea-leaf',
		name: 'Elodea Leaf Cell',
		type: 'plant',
		description: 'Aquatic plant cells showing chloroplasts and cytoplasmic streaming.',
		color: 'rgba(144, 238, 144, 0.7)',
		backgroundColor: 'rgba(230, 255, 230, 0.3)',
		optimalMagnification: 400,
		structures: [
			{ id: 'cell-wall', name: 'Cell Wall', description: 'Rigid cellulose structure', color: 'rgba(0, 100, 0, 0.7)', x: 50, y: 50, size: 95, shape: 'irregular' },
			{ id: 'chloroplast-1', name: 'Chloroplast', description: 'Contains chlorophyll for photosynthesis', color: 'rgba(0, 128, 0, 0.8)', x: 30, y: 35, size: 10, shape: 'oval' },
			{ id: 'chloroplast-2', name: 'Chloroplast', description: 'Contains chlorophyll for photosynthesis', color: 'rgba(0, 128, 0, 0.8)', x: 45, y: 30, size: 9, shape: 'oval' },
			{ id: 'chloroplast-3', name: 'Chloroplast', description: 'Contains chlorophyll for photosynthesis', color: 'rgba(0, 128, 0, 0.8)', x: 60, y: 40, size: 10, shape: 'oval' },
			{ id: 'chloroplast-4', name: 'Chloroplast', description: 'Contains chlorophyll for photosynthesis', color: 'rgba(0, 128, 0, 0.8)', x: 70, y: 55, size: 8, shape: 'oval' },
			{ id: 'chloroplast-5', name: 'Chloroplast', description: 'Contains chlorophyll for photosynthesis', color: 'rgba(0, 128, 0, 0.8)', x: 55, y: 65, size: 9, shape: 'oval' },
			{ id: 'chloroplast-6', name: 'Chloroplast', description: 'Contains chlorophyll for photosynthesis', color: 'rgba(0, 128, 0, 0.8)', x: 35, y: 60, size: 10, shape: 'oval' },
			{ id: 'vacuole', name: 'Central Vacuole', description: 'Large storage organelle', color: 'rgba(200, 230, 255, 0.3)', x: 50, y: 50, size: 60, shape: 'irregular' },
			{ id: 'nucleus', name: 'Nucleus', description: 'Genetic control center', color: 'rgba(75, 0, 130, 0.6)', x: 50, y: 75, size: 12, shape: 'oval' }
		]
	},
	{
		id: 'bacteria',
		name: 'Bacillus Bacteria',
		type: 'bacteria',
		description: 'Rod-shaped bacteria showing prokaryotic cell structure.',
		color: 'rgba(147, 112, 219, 0.7)',
		backgroundColor: 'rgba(240, 230, 255, 0.3)',
		optimalMagnification: 1000,
		structures: [
			{ id: 'cell-wall', name: 'Cell Wall', description: 'Peptidoglycan layer for protection', color: 'rgba(138, 43, 226, 0.7)', x: 50, y: 50, size: 90, shape: 'rod' },
			{ id: 'cell-membrane', name: 'Cell Membrane', description: 'Inner phospholipid bilayer', color: 'rgba(186, 85, 211, 0.5)', x: 50, y: 50, size: 82, shape: 'rod' },
			{ id: 'nucleoid', name: 'Nucleoid', description: 'Region containing circular DNA (no membrane)', color: 'rgba(75, 0, 130, 0.5)', x: 50, y: 50, size: 40, shape: 'irregular' },
			{ id: 'ribosome-1', name: 'Ribosomes', description: 'Protein synthesis machinery', color: 'rgba(255, 182, 193, 0.8)', x: 30, y: 45, size: 3, shape: 'circle' },
			{ id: 'ribosome-2', name: 'Ribosomes', description: 'Protein synthesis machinery', color: 'rgba(255, 182, 193, 0.8)', x: 40, y: 55, size: 3, shape: 'circle' },
			{ id: 'ribosome-3', name: 'Ribosomes', description: 'Protein synthesis machinery', color: 'rgba(255, 182, 193, 0.8)', x: 60, y: 48, size: 3, shape: 'circle' },
			{ id: 'ribosome-4', name: 'Ribosomes', description: 'Protein synthesis machinery', color: 'rgba(255, 182, 193, 0.8)', x: 70, y: 52, size: 3, shape: 'circle' },
			{ id: 'flagellum', name: 'Flagellum', description: 'Tail-like structure for movement', color: 'rgba(100, 100, 100, 0.6)', x: 95, y: 50, size: 20, shape: 'rod' }
		]
	}
];

// Magnification levels
export const MAGNIFICATION_LEVELS = [
	{ power: 40, label: '4x (Scanning)', eyepiece: 10, objective: 4 },
	{ power: 100, label: '10x (Low)', eyepiece: 10, objective: 10 },
	{ power: 400, label: '40x (High)', eyepiece: 10, objective: 40 },
	{ power: 1000, label: '100x (Oil)', eyepiece: 10, objective: 100 }
];

// Microscopy configuration
export interface MicroscopyConfig {
	availableSamples: string[]; // Sample IDs
	requireOilImmersion: boolean;
}

// Microscopy state
export interface MicroscopyState {
	currentSampleId: string | null;
	magnification: number;
	focusLevel: number; // 0-100, 50 is optimal
	fineAdjustment: number; // -10 to 10
	stageX: number; // -50 to 50
	stageY: number; // -50 to 50
	lightIntensity: number; // 0-100
	isLightOn: boolean;
	identifiedStructures: string[];
	observations: Observation[];
	oilApplied: boolean;
}

export interface Observation {
	timestamp: Date;
	sampleId: string;
	magnification: number;
	structureId: string | null;
	note: string;
}

// Initialize state
export function createInitialState(config: MicroscopyConfig): MicroscopyState {
	return {
		currentSampleId: null,
		magnification: 40,
		focusLevel: 30, // Start out of focus
		fineAdjustment: 0,
		stageX: 0,
		stageY: 0,
		lightIntensity: 70,
		isLightOn: true,
		identifiedStructures: [],
		observations: [],
		oilApplied: false
	};
}

// Calculate blur amount based on focus
export function calculateBlur(state: MicroscopyState): number {
	const optimalFocus = 50;
	const focusDeviation = Math.abs(state.focusLevel + state.fineAdjustment - optimalFocus);
	// More blur at higher magnifications when out of focus
	const magnificationFactor = state.magnification / 100;
	return Math.min(focusDeviation * magnificationFactor * 0.3, 20);
}

// Calculate image clarity (0-100)
export function calculateClarity(state: MicroscopyState): number {
	const blur = calculateBlur(state);
	const lightFactor = state.isLightOn ? state.lightIntensity / 100 : 0;
	const clarity = Math.max(0, 100 - blur * 5) * lightFactor;
	return Math.round(clarity);
}

// Check if oil immersion is needed
export function needsOilImmersion(state: MicroscopyState): boolean {
	return state.magnification >= 1000 && !state.oilApplied;
}

// Set sample slide
export function setSample(state: MicroscopyState, sampleId: string): MicroscopyState {
	return {
		...state,
		currentSampleId: sampleId,
		identifiedStructures: [],
		focusLevel: 30, // Reset focus when changing slides
		stageX: 0,
		stageY: 0
	};
}

// Adjust coarse focus
export function adjustCoarseFocus(state: MicroscopyState, delta: number): MicroscopyState {
	const newFocus = Math.max(0, Math.min(100, state.focusLevel + delta));
	return {
		...state,
		focusLevel: newFocus
	};
}

// Adjust fine focus
export function adjustFineFocus(state: MicroscopyState, delta: number): MicroscopyState {
	const newFine = Math.max(-10, Math.min(10, state.fineAdjustment + delta));
	return {
		...state,
		fineAdjustment: newFine
	};
}

// Move stage
export function moveStage(state: MicroscopyState, deltaX: number, deltaY: number): MicroscopyState {
	return {
		...state,
		stageX: Math.max(-50, Math.min(50, state.stageX + deltaX)),
		stageY: Math.max(-50, Math.min(50, state.stageY + deltaY))
	};
}

// Change magnification
export function setMagnification(state: MicroscopyState, power: number): MicroscopyState {
	// Higher magnification = narrower depth of field
	const focusShift = (power - state.magnification) / 50;
	return {
		...state,
		magnification: power,
		focusLevel: Math.max(0, Math.min(100, state.focusLevel - focusShift * 5)),
		fineAdjustment: 0 // Reset fine focus on magnification change
	};
}

// Toggle light
export function toggleLight(state: MicroscopyState): MicroscopyState {
	return {
		...state,
		isLightOn: !state.isLightOn
	};
}

// Adjust light intensity
export function setLightIntensity(state: MicroscopyState, intensity: number): MicroscopyState {
	return {
		...state,
		lightIntensity: Math.max(0, Math.min(100, intensity))
	};
}

// Apply oil immersion
export function applyOil(state: MicroscopyState): MicroscopyState {
	return {
		...state,
		oilApplied: true
	};
}

// Identify a structure
export function identifyStructure(state: MicroscopyState, structureId: string): MicroscopyState {
	if (state.identifiedStructures.includes(structureId)) {
		return state;
	}

	const sample = CELL_SAMPLES.find(s => s.id === state.currentSampleId);
	const structure = sample?.structures.find(s => s.id === structureId);

	if (!structure) return state;

	const observation: Observation = {
		timestamp: new Date(),
		sampleId: state.currentSampleId!,
		magnification: state.magnification,
		structureId,
		note: `Identified ${structure.name}`
	};

	return {
		...state,
		identifiedStructures: [...state.identifiedStructures, structureId],
		observations: [...state.observations, observation]
	};
}

// Add custom observation
export function addObservation(state: MicroscopyState, note: string): MicroscopyState {
	const observation: Observation = {
		timestamp: new Date(),
		sampleId: state.currentSampleId || '',
		magnification: state.magnification,
		structureId: null,
		note
	};

	return {
		...state,
		observations: [...state.observations, observation]
	};
}

// Analysis result
export interface MicroscopyAnalysis {
	sampleName: string;
	totalStructures: number;
	identifiedCount: number;
	completionPercent: number;
	observationCount: number;
	accuracy: number;
	feedback: string;
	grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

// Analyze results
export function analyzeMicroscopy(state: MicroscopyState): MicroscopyAnalysis {
	const sample = CELL_SAMPLES.find(s => s.id === state.currentSampleId);

	if (!sample) {
		return {
			sampleName: 'Unknown',
			totalStructures: 0,
			identifiedCount: 0,
			completionPercent: 0,
			observationCount: 0,
			accuracy: 0,
			feedback: 'No sample was examined.',
			grade: 'F'
		};
	}

	// Count unique structures (some have same name like chloroplasts)
	const uniqueStructureNames = [...new Set(sample.structures.map(s => s.name))];
	const totalStructures = uniqueStructureNames.length;

	// Count identified unique structures
	const identifiedNames = state.identifiedStructures.map(id => {
		const structure = sample.structures.find(s => s.id === id);
		return structure?.name;
	}).filter(Boolean);
	const uniqueIdentified = [...new Set(identifiedNames)].length;

	const completionPercent = Math.round((uniqueIdentified / totalStructures) * 100);
	const observationCount = state.observations.length;

	// Calculate accuracy based on completion and observations
	let accuracy = completionPercent;
	if (observationCount >= 5) accuracy = Math.min(100, accuracy + 10);
	if (observationCount >= 10) accuracy = Math.min(100, accuracy + 5);

	// Determine grade
	let grade: 'A' | 'B' | 'C' | 'D' | 'F';
	if (accuracy >= 90) grade = 'A';
	else if (accuracy >= 80) grade = 'B';
	else if (accuracy >= 70) grade = 'C';
	else if (accuracy >= 60) grade = 'D';
	else grade = 'F';

	// Generate feedback
	let feedback = '';
	if (completionPercent === 100) {
		feedback = 'Excellent work! You identified all cell structures correctly.';
	} else if (completionPercent >= 75) {
		feedback = 'Good observation skills! You identified most structures. Review the ones you missed.';
	} else if (completionPercent >= 50) {
		feedback = 'Decent progress. Try adjusting focus and magnification to see more detail.';
	} else {
		feedback = 'Keep practicing! Focus carefully and explore different magnifications.';
	}

	return {
		sampleName: sample.name,
		totalStructures,
		identifiedCount: uniqueIdentified,
		completionPercent,
		observationCount,
		accuracy,
		feedback,
		grade
	};
}

// Get visible structures based on magnification and focus
export function getVisibleStructures(state: MicroscopyState): CellStructure[] {
	const sample = CELL_SAMPLES.find(s => s.id === state.currentSampleId);
	if (!sample) return [];

	const clarity = calculateClarity(state);
	if (clarity < 20) return []; // Too blurry to see anything

	// Filter structures visible at current magnification
	return sample.structures.filter(structure => {
		// Smaller structures need higher magnification
		const minMagnification = structure.size < 10 ? 400 : structure.size < 20 ? 100 : 40;
		return state.magnification >= minMagnification;
	});
}
