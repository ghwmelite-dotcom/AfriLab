/**
 * Optics: Lenses & Mirrors Laboratory Simulation
 * Physics experiment exploring image formation using the thin lens/mirror equation
 * 1/f = 1/do + 1/di
 */

export interface OpticsState {
	opticalElement: OpticalElement;
	objectDistance: number; // cm (positive, measured from element)
	focalLength: number; // cm (positive for converging, negative for diverging)
	imageDistance: number; // cm (calculated)
	magnification: number; // calculated
	imageHeight: number; // cm
	objectHeight: number; // cm (fixed at 2cm)
	isVirtual: boolean; // is the image virtual?
	isInverted: boolean; // is the image inverted?
	measurements: OpticsMeasurement[];
	showRays: boolean;
	showGrid: boolean;
	selectedPreset: string | null;
	animating: boolean;
}

export type OpticalElementType = 'convex-lens' | 'concave-lens' | 'convex-mirror' | 'concave-mirror';

export interface OpticalElement {
	id: string;
	name: string;
	type: OpticalElementType;
	defaultFocalLength: number;
	description: string;
}

export interface OpticsMeasurement {
	id: string;
	elementType: OpticalElementType;
	objectDistance: number;
	imageDistance: number;
	focalLength: number;
	magnification: number;
	isVirtual: boolean;
	isInverted: boolean;
	verifiedFocalLength: number; // 1/f calculated from 1/do + 1/di
	timestamp: number;
}

export interface OpticsConfig {
	elementType: OpticalElementType;
	objectDistance: number;
	focalLength: number;
}

// Available optical elements
export const OPTICAL_ELEMENTS: OpticalElement[] = [
	{
		id: 'convex-lens',
		name: 'Convex Lens',
		type: 'convex-lens',
		defaultFocalLength: 10,
		description: 'Converging lens - parallel rays converge to focal point'
	},
	{
		id: 'concave-lens',
		name: 'Concave Lens',
		type: 'concave-lens',
		defaultFocalLength: -10,
		description: 'Diverging lens - parallel rays appear to diverge from focal point'
	},
	{
		id: 'concave-mirror',
		name: 'Concave Mirror',
		type: 'concave-mirror',
		defaultFocalLength: 10,
		description: 'Converging mirror - parallel rays converge to focal point'
	},
	{
		id: 'convex-mirror',
		name: 'Convex Mirror',
		type: 'convex-mirror',
		defaultFocalLength: -10,
		description: 'Diverging mirror - parallel rays appear to diverge from focal point'
	}
];

// Presets for quick exploration
export const PRESETS = [
	{ id: 'beyond-2f', name: 'Object beyond 2F', objectDistance: 25, focalLength: 10, element: 'convex-lens' },
	{ id: 'at-2f', name: 'Object at 2F', objectDistance: 20, focalLength: 10, element: 'convex-lens' },
	{ id: 'between-f-2f', name: 'Object between F and 2F', objectDistance: 15, focalLength: 10, element: 'convex-lens' },
	{ id: 'at-f', name: 'Object at F', objectDistance: 10, focalLength: 10, element: 'convex-lens' },
	{ id: 'inside-f', name: 'Object inside F', objectDistance: 5, focalLength: 10, element: 'convex-lens' },
	{ id: 'concave-mirror-real', name: 'Concave Mirror (real image)', objectDistance: 20, focalLength: 10, element: 'concave-mirror' },
	{ id: 'convex-mirror', name: 'Convex Mirror', objectDistance: 15, focalLength: -10, element: 'convex-mirror' },
	{ id: 'concave-lens', name: 'Concave Lens', objectDistance: 15, focalLength: -10, element: 'concave-lens' }
];

// Calculate image using thin lens/mirror equation: 1/f = 1/do + 1/di
export function calculateImage(
	objectDistance: number,
	focalLength: number
): { imageDistance: number; magnification: number; isVirtual: boolean; isInverted: boolean } {
	// 1/di = 1/f - 1/do
	const invDi = 1 / focalLength - 1 / objectDistance;

	if (Math.abs(invDi) < 0.0001) {
		// Object at focal point - image at infinity
		return {
			imageDistance: Infinity,
			magnification: Infinity,
			isVirtual: false,
			isInverted: false
		};
	}

	const imageDistance = 1 / invDi;
	const magnification = -imageDistance / objectDistance;

	// For lenses: positive di = real image, negative di = virtual image
	// For mirrors: positive di = real (in front), negative di = virtual (behind)
	const isVirtual = imageDistance < 0;
	const isInverted = magnification < 0;

	return {
		imageDistance,
		magnification,
		isVirtual,
		isInverted
	};
}

// Create initial state
export function createInitialState(config: OpticsConfig): OpticsState {
	const element = OPTICAL_ELEMENTS.find((e) => e.type === config.elementType) || OPTICAL_ELEMENTS[0];
	const { imageDistance, magnification, isVirtual, isInverted } = calculateImage(
		config.objectDistance,
		config.focalLength
	);

	const objectHeight = 2; // fixed object height in cm
	const imageHeight = Math.abs(magnification) * objectHeight;

	return {
		opticalElement: element,
		objectDistance: config.objectDistance,
		focalLength: config.focalLength,
		imageDistance,
		magnification,
		imageHeight: isFinite(imageHeight) ? imageHeight : 0,
		objectHeight,
		isVirtual,
		isInverted,
		measurements: [],
		showRays: true,
		showGrid: true,
		selectedPreset: null,
		animating: false
	};
}

// Set optical element type
export function setElement(state: OpticsState, elementType: OpticalElementType): OpticsState {
	const element = OPTICAL_ELEMENTS.find((e) => e.type === elementType);
	if (!element) return state;

	const focalLength = element.defaultFocalLength;
	const result = calculateImage(state.objectDistance, focalLength);
	const imageHeight = isFinite(result.magnification)
		? Math.abs(result.magnification) * state.objectHeight
		: 0;

	return {
		...state,
		opticalElement: element,
		focalLength,
		imageDistance: result.imageDistance,
		magnification: result.magnification,
		imageHeight,
		isVirtual: result.isVirtual,
		isInverted: result.isInverted,
		selectedPreset: null
	};
}

// Set object distance
export function setObjectDistance(state: OpticsState, distance: number): OpticsState {
	const d = Math.max(2, Math.min(50, distance));
	const result = calculateImage(d, state.focalLength);
	const imageHeight = isFinite(result.magnification)
		? Math.abs(result.magnification) * state.objectHeight
		: 0;

	return {
		...state,
		objectDistance: d,
		imageDistance: result.imageDistance,
		magnification: result.magnification,
		imageHeight,
		isVirtual: result.isVirtual,
		isInverted: result.isInverted,
		selectedPreset: null
	};
}

// Set focal length
export function setFocalLength(state: OpticsState, focalLength: number): OpticsState {
	const f = Math.max(-30, Math.min(30, focalLength));
	if (Math.abs(f) < 1) return state; // prevent very small focal lengths

	const result = calculateImage(state.objectDistance, f);
	const imageHeight = isFinite(result.magnification)
		? Math.abs(result.magnification) * state.objectHeight
		: 0;

	return {
		...state,
		focalLength: f,
		imageDistance: result.imageDistance,
		magnification: result.magnification,
		imageHeight,
		isVirtual: result.isVirtual,
		isInverted: result.isInverted,
		selectedPreset: null
	};
}

// Apply preset
export function applyPreset(state: OpticsState, presetId: string): OpticsState {
	const preset = PRESETS.find((p) => p.id === presetId);
	if (!preset) return state;

	const element = OPTICAL_ELEMENTS.find((e) => e.id === preset.element) || state.opticalElement;
	const result = calculateImage(preset.objectDistance, preset.focalLength);
	const imageHeight = isFinite(result.magnification)
		? Math.abs(result.magnification) * state.objectHeight
		: 0;

	return {
		...state,
		opticalElement: element,
		objectDistance: preset.objectDistance,
		focalLength: preset.focalLength,
		imageDistance: result.imageDistance,
		magnification: result.magnification,
		imageHeight,
		isVirtual: result.isVirtual,
		isInverted: result.isInverted,
		selectedPreset: presetId
	};
}

// Toggle ray display
export function toggleRays(state: OpticsState): OpticsState {
	return { ...state, showRays: !state.showRays };
}

// Toggle grid display
export function toggleGrid(state: OpticsState): OpticsState {
	return { ...state, showGrid: !state.showGrid };
}

// Record measurement
export function recordMeasurement(state: OpticsState): OpticsState {
	if (!isFinite(state.imageDistance)) return state;

	const verifiedF = 1 / (1 / state.objectDistance + 1 / state.imageDistance);

	const measurement: OpticsMeasurement = {
		id: `m-${Date.now()}`,
		elementType: state.opticalElement.type,
		objectDistance: state.objectDistance,
		imageDistance: state.imageDistance,
		focalLength: state.focalLength,
		magnification: state.magnification,
		isVirtual: state.isVirtual,
		isInverted: state.isInverted,
		verifiedFocalLength: verifiedF,
		timestamp: Date.now()
	};

	return {
		...state,
		measurements: [...state.measurements, measurement]
	};
}

// Clear measurements
export function clearMeasurements(state: OpticsState): OpticsState {
	return { ...state, measurements: [] };
}

// Get ray paths for visualization (returns 3 principal rays)
export function getRayPaths(
	objectDistance: number,
	focalLength: number,
	objectHeight: number,
	imageDistance: number,
	magnification: number,
	elementType: OpticalElementType
): RayPath[] {
	const rays: RayPath[] = [];
	const isMirror = elementType.includes('mirror');
	const isConverging = focalLength > 0;
	const f = Math.abs(focalLength);

	// Object tip position (left of element)
	const objX = -objectDistance;
	const objY = objectHeight;

	// Ray 1: Parallel to axis, then through/from focal point
	if (isConverging) {
		rays.push({
			id: 'ray1',
			color: '#EF4444',
			segments: [
				{ x1: objX, y1: objY, x2: 0, y2: objY },
				{
					x1: 0,
					y1: objY,
					x2: isMirror ? -50 : 50,
					y2: isMirror
						? objY + ((objY - 0) / (0 - (-f))) * (-50 - 0)
						: objY + ((0 - objY) / (f - 0)) * (50 - 0)
				}
			],
			label: 'Parallel ray'
		});
	} else {
		rays.push({
			id: 'ray1',
			color: '#EF4444',
			segments: [
				{ x1: objX, y1: objY, x2: 0, y2: objY },
				{
					x1: 0,
					y1: objY,
					x2: isMirror ? -50 : 50,
					y2: isMirror
						? objY + ((objY) / (f)) * 50
						: objY + ((objY) / (f)) * 50
				}
			],
			label: 'Parallel ray (diverging)'
		});
	}

	// Ray 2: Through center of lens / center of curvature for mirror
	rays.push({
		id: 'ray2',
		color: '#22C55E',
		segments: [
			{
				x1: objX,
				y1: objY,
				x2: isMirror ? -50 : 50,
				y2: isMirror
					? objY + ((-objY) / (objectDistance)) * (-50 - objX)
					: -objY * (50 - objX) / objectDistance + objY
			}
		],
		label: isMirror ? 'Through center of curvature' : 'Through optical center'
	});

	// Ray 3: Through focal point to element, then parallel
	rays.push({
		id: 'ray3',
		color: '#3B82F6',
		segments: [
			{
				x1: objX,
				y1: objY,
				x2: 0,
				y2: isConverging
					? (isMirror ? objY - (objY / (objectDistance - f)) * objectDistance : objY + ((0 - objY) / (focalLength + objectDistance)) * objectDistance)
					: objY
			},
			{
				x1: 0,
				y1: isConverging ? 0 : objY,
				x2: isMirror ? -50 : 50,
				y2: isConverging ? 0 : objY
			}
		],
		label: 'Through focal point'
	});

	return rays;
}

export interface RayPath {
	id: string;
	color: string;
	segments: RaySegment[];
	label: string;
}

export interface RaySegment {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
}

// Quiz questions
export interface QuizQuestion {
	id: string;
	question: string;
	options: string[];
	correctAnswer: string;
	explanation: string;
}

export const OPTICS_QUIZ: QuizQuestion[] = [
	{
		id: 'q1',
		question: 'What is the thin lens equation?',
		options: ['1/f = 1/do - 1/di', '1/f = 1/do + 1/di', 'f = do + di', 'f = do * di'],
		correctAnswer: '1/f = 1/do + 1/di',
		explanation: 'The thin lens equation is 1/f = 1/do + 1/di, where f is focal length, do is object distance, and di is image distance.'
	},
	{
		id: 'q2',
		question: 'A convex lens always produces a virtual image when the object is:',
		options: ['Beyond 2F', 'At 2F', 'Between F and 2F', 'Between F and the lens'],
		correctAnswer: 'Between F and the lens',
		explanation: 'When the object is between the focal point and the lens, the light rays diverge after passing through. The virtual image is upright and magnified.'
	},
	{
		id: 'q3',
		question: 'The magnification is negative. This means the image is:',
		options: ['Virtual', 'Smaller', 'Inverted', 'Larger'],
		correctAnswer: 'Inverted',
		explanation: 'A negative magnification (m = -di/do) indicates the image is inverted (flipped upside down) relative to the object.'
	},
	{
		id: 'q4',
		question: 'A concave mirror can produce a real image when the object is:',
		options: ['Between F and the mirror', 'At F', 'Beyond F', 'At any distance'],
		correctAnswer: 'Beyond F',
		explanation: 'A concave mirror produces a real, inverted image when the object is beyond the focal point. Inside F, it produces a virtual, upright, magnified image.'
	},
	{
		id: 'q5',
		question: 'A convex mirror always produces images that are:',
		options: ['Real and inverted', 'Virtual, upright, and diminished', 'Virtual, upright, and magnified', 'Real and magnified'],
		correctAnswer: 'Virtual, upright, and diminished',
		explanation: 'Convex mirrors always produce virtual, upright, and diminished images regardless of object position, which is why they are used as car side mirrors.'
	}
];

// Analysis
export interface OpticsAnalysis {
	score: number;
	grade: 'A' | 'B' | 'C' | 'D' | 'F';
	averageFocalError: number;
	elementsCovered: number;
	feedback: string;
	quizScore: { correct: number; total: number };
}

export function analyzeExperiment(state: OpticsState, quizAnswers: Map<string, string>): OpticsAnalysis {
	let quizCorrect = 0;
	OPTICS_QUIZ.forEach((q) => {
		if (quizAnswers.get(q.id) === q.correctAnswer) {
			quizCorrect++;
		}
	});

	// Average focal length error
	let totalFocalError = 0;
	state.measurements.forEach((m) => {
		const error = Math.abs((m.verifiedFocalLength - m.focalLength) / m.focalLength) * 100;
		totalFocalError += error;
	});
	const avgFocalError = state.measurements.length > 0 ? totalFocalError / state.measurements.length : 100;

	// Elements covered
	const elementsCovered = new Set(state.measurements.map((m) => m.elementType)).size;

	// Score: 35% quiz, 25% accuracy, 25% data collection, 15% variety
	let score = 0;
	score += (quizCorrect / OPTICS_QUIZ.length) * 35;
	score += Math.max(0, 25 - avgFocalError);
	score += Math.min(state.measurements.length * 5, 25);
	score += Math.min(elementsCovered * 5, 15);

	let grade: OpticsAnalysis['grade'];
	if (score >= 90) grade = 'A';
	else if (score >= 80) grade = 'B';
	else if (score >= 70) grade = 'C';
	else if (score >= 60) grade = 'D';
	else grade = 'F';

	let feedback = '';
	if (score >= 80) {
		feedback = 'Outstanding work! You demonstrated thorough understanding of image formation by lenses and mirrors.';
	} else if (score >= 60) {
		feedback = 'Good effort. Try exploring different optical elements and object positions to deepen your understanding.';
	} else {
		feedback = 'Keep experimenting! Move the object to different positions and observe how the image changes.';
	}

	return {
		score: Math.round(score),
		grade,
		averageFocalError: avgFocalError,
		elementsCovered,
		feedback,
		quizScore: { correct: quizCorrect, total: OPTICS_QUIZ.length }
	};
}
