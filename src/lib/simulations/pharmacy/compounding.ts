/**
 * Drug Compounding Laboratory Simulation
 * Pharmacy experiment for preparing pharmaceutical compounds
 */

export interface CompoundingState {
	currentRecipeId: string | null;
	selectedIngredients: SelectedIngredient[];
	mortarContents: MortarContent[];
	currentStep: CompoundingStep;
	balanceReading: number;
	targetWeight: number;
	isBalanceOn: boolean;
	isTared: boolean;
	mixingProgress: number;
	mixingTime: number;
	temperature: number;
	humidity: number;
	ppeWorn: PPEItem[];
	errors: CompoundingError[];
	completedSteps: string[];
	observations: string[];
	finalProduct: FinalProduct | null;
}

export interface Ingredient {
	id: string;
	name: string;
	category: 'active' | 'excipient' | 'base' | 'preservative' | 'flavoring';
	form: 'powder' | 'liquid' | 'cream' | 'ointment';
	color: string;
	density: number; // g/mL for liquids, g/cm³ for solids
	description: string;
	hazards: string[];
	storageConditions: string;
}

export interface SelectedIngredient {
	ingredientId: string;
	targetAmount: number;
	actualAmount: number;
	unit: 'g' | 'mg' | 'mL';
	isWeighed: boolean;
}

export interface MortarContent {
	ingredientId: string;
	amount: number;
	isMixed: boolean;
}

export interface CompoundingStep {
	id: string;
	name: string;
	description: string;
	isCompleted: boolean;
	requiredPPE: PPEItem[];
}

export interface PPEItem {
	id: string;
	name: string;
	icon: string;
}

export interface CompoundingError {
	id: string;
	type: 'weight' | 'order' | 'contamination' | 'ppe' | 'technique';
	message: string;
	severity: 'warning' | 'critical';
	timestamp: number;
}

export interface FinalProduct {
	name: string;
	totalWeight: number;
	accuracy: number; // percentage
	appearance: string;
	quality: 'excellent' | 'acceptable' | 'poor' | 'failed';
	beyondUseDate: string;
}

export interface Recipe {
	id: string;
	name: string;
	description: string;
	difficulty: 'beginner' | 'intermediate' | 'advanced';
	dosageForm: 'capsule' | 'cream' | 'ointment' | 'powder' | 'solution';
	ingredients: RecipeIngredient[];
	steps: RecipeStep[];
	finalAmount: number;
	finalUnit: string;
	beyondUseDays: number;
	learningObjectives: string[];
}

export interface RecipeIngredient {
	ingredientId: string;
	amount: number;
	unit: 'g' | 'mg' | 'mL';
	order: number; // Order in which to add to compound
}

export interface RecipeStep {
	id: string;
	instruction: string;
	technique: string;
	duration: number; // seconds
}

// Available ingredients
export const INGREDIENTS: Ingredient[] = [
	{
		id: 'aspirin',
		name: 'Aspirin (Acetylsalicylic Acid)',
		category: 'active',
		form: 'powder',
		color: '#FFFFFF',
		density: 1.4,
		description: 'Non-steroidal anti-inflammatory drug (NSAID)',
		hazards: ['May cause irritation'],
		storageConditions: 'Store in cool, dry place'
	},
	{
		id: 'lactose',
		name: 'Lactose Monohydrate',
		category: 'excipient',
		form: 'powder',
		color: '#FFFEF0',
		density: 1.53,
		description: 'Filler/diluent for solid dosage forms',
		hazards: [],
		storageConditions: 'Protect from moisture'
	},
	{
		id: 'starch',
		name: 'Corn Starch',
		category: 'excipient',
		form: 'powder',
		color: '#FFFFF5',
		density: 1.5,
		description: 'Binding and disintegrating agent',
		hazards: [],
		storageConditions: 'Store in airtight container'
	},
	{
		id: 'mg-stearate',
		name: 'Magnesium Stearate',
		category: 'excipient',
		form: 'powder',
		color: '#FFFFFF',
		density: 1.03,
		description: 'Lubricant for tablet/capsule manufacturing',
		hazards: [],
		storageConditions: 'Store below 30°C'
	},
	{
		id: 'hydrocortisone',
		name: 'Hydrocortisone',
		category: 'active',
		form: 'powder',
		color: '#FFFFFF',
		density: 1.3,
		description: 'Corticosteroid for inflammation',
		hazards: ['Potent - handle with care'],
		storageConditions: 'Protect from light'
	},
	{
		id: 'white-petrolatum',
		name: 'White Petrolatum',
		category: 'base',
		form: 'ointment',
		color: '#FFFEF5',
		density: 0.85,
		description: 'Ointment base (hydrocarbon)',
		hazards: [],
		storageConditions: 'Store at room temperature'
	},
	{
		id: 'lanolin',
		name: 'Lanolin (Anhydrous)',
		category: 'base',
		form: 'ointment',
		color: '#FFF8DC',
		density: 0.93,
		description: 'Emollient and absorption base',
		hazards: ['May cause sensitivity in some patients'],
		storageConditions: 'Store in cool place'
	},
	{
		id: 'methylparaben',
		name: 'Methylparaben',
		category: 'preservative',
		form: 'powder',
		color: '#FFFFFF',
		density: 1.35,
		description: 'Antimicrobial preservative',
		hazards: [],
		storageConditions: 'Store in airtight container'
	}
];

// PPE items
export const PPE_ITEMS: PPEItem[] = [
	{ id: 'gloves', name: 'Nitrile Gloves', icon: '🧤' },
	{ id: 'gown', name: 'Lab Gown', icon: '🥼' },
	{ id: 'mask', name: 'Face Mask', icon: '😷' },
	{ id: 'goggles', name: 'Safety Goggles', icon: '🥽' },
	{ id: 'hairnet', name: 'Hair Net', icon: '👒' }
];

// Recipes
export const RECIPES: Recipe[] = [
	{
		id: 'aspirin-powder',
		name: 'Aspirin Powder Blend',
		description: 'A simple powder mixture for dispensing aspirin in divided doses',
		difficulty: 'beginner',
		dosageForm: 'powder',
		finalAmount: 10,
		finalUnit: 'g',
		beyondUseDays: 180,
		ingredients: [
			{ ingredientId: 'aspirin', amount: 3.25, unit: 'g', order: 1 },
			{ ingredientId: 'lactose', amount: 6.5, unit: 'g', order: 2 },
			{ ingredientId: 'starch', amount: 0.25, unit: 'g', order: 3 }
		],
		steps: [
			{
				id: 's1',
				instruction: 'Weigh aspirin powder accurately',
				technique: 'Geometric dilution',
				duration: 60
			},
			{
				id: 's2',
				instruction: 'Add lactose to mortar and mix with aspirin',
				technique: 'Trituration',
				duration: 120
			},
			{
				id: 's3',
				instruction: 'Add corn starch and mix thoroughly',
				technique: 'Trituration',
				duration: 60
			},
			{
				id: 's4',
				instruction: 'Transfer to dispensing container',
				technique: 'Spatulation',
				duration: 30
			}
		],
		learningObjectives: [
			'Practice accurate weighing techniques',
			'Understand geometric dilution',
			'Learn proper trituration methods'
		]
	},
	{
		id: 'hydrocortisone-cream',
		name: '1% Hydrocortisone Cream',
		description: 'Topical anti-inflammatory cream preparation',
		difficulty: 'intermediate',
		dosageForm: 'cream',
		finalAmount: 30,
		finalUnit: 'g',
		beyondUseDays: 30,
		ingredients: [
			{ ingredientId: 'hydrocortisone', amount: 300, unit: 'mg', order: 1 },
			{ ingredientId: 'white-petrolatum', amount: 20, unit: 'g', order: 2 },
			{ ingredientId: 'lanolin', amount: 9.5, unit: 'g', order: 3 },
			{ ingredientId: 'methylparaben', amount: 50, unit: 'mg', order: 4 }
		],
		steps: [
			{
				id: 's1',
				instruction: 'Weigh hydrocortisone powder using analytical balance',
				technique: 'Analytical weighing',
				duration: 90
			},
			{
				id: 's2',
				instruction: 'Levigate hydrocortisone with small amount of base',
				technique: 'Levigation',
				duration: 120
			},
			{
				id: 's3',
				instruction: 'Incorporate remaining base using geometric addition',
				technique: 'Geometric incorporation',
				duration: 180
			},
			{
				id: 's4',
				instruction: 'Add preservative and mix until uniform',
				technique: 'Spatulation',
				duration: 60
			},
			{
				id: 's5',
				instruction: 'Package in appropriate container',
				technique: 'Packaging',
				duration: 30
			}
		],
		learningObjectives: [
			'Master levigation technique for incorporating powders into bases',
			'Understand concentration calculations',
			'Learn proper packaging and labeling'
		]
	}
];

// Compounding steps
const COMPOUNDING_STEPS: CompoundingStep[] = [
	{
		id: 'prep',
		name: 'Preparation',
		description: 'Review recipe and gather materials',
		isCompleted: false,
		requiredPPE: [PPE_ITEMS[0], PPE_ITEMS[1]]
	},
	{
		id: 'ppe',
		name: 'Don PPE',
		description: 'Put on required personal protective equipment',
		isCompleted: false,
		requiredPPE: [PPE_ITEMS[0], PPE_ITEMS[1], PPE_ITEMS[4]]
	},
	{
		id: 'weigh',
		name: 'Weighing',
		description: 'Accurately weigh all ingredients',
		isCompleted: false,
		requiredPPE: [PPE_ITEMS[0]]
	},
	{
		id: 'compound',
		name: 'Compounding',
		description: 'Mix ingredients using proper technique',
		isCompleted: false,
		requiredPPE: [PPE_ITEMS[0]]
	},
	{
		id: 'package',
		name: 'Packaging',
		description: 'Transfer to final container and label',
		isCompleted: false,
		requiredPPE: [PPE_ITEMS[0]]
	}
];

export interface CompoundingConfig {
	defaultRecipeId: string | null;
}

// Create initial state
export function createInitialState(config: CompoundingConfig): CompoundingState {
	return {
		currentRecipeId: config.defaultRecipeId,
		selectedIngredients: [],
		mortarContents: [],
		currentStep: { ...COMPOUNDING_STEPS[0] },
		balanceReading: 0,
		targetWeight: 0,
		isBalanceOn: false,
		isTared: false,
		mixingProgress: 0,
		mixingTime: 0,
		temperature: 22,
		humidity: 45,
		ppeWorn: [],
		errors: [],
		completedSteps: [],
		observations: [],
		finalProduct: null
	};
}

// Select a recipe
export function selectRecipe(state: CompoundingState, recipeId: string): CompoundingState {
	const recipe = RECIPES.find((r) => r.id === recipeId);
	if (!recipe) return state;

	const selectedIngredients: SelectedIngredient[] = recipe.ingredients.map((ri) => ({
		ingredientId: ri.ingredientId,
		targetAmount: ri.amount,
		actualAmount: 0,
		unit: ri.unit,
		isWeighed: false
	}));

	return {
		...state,
		currentRecipeId: recipeId,
		selectedIngredients,
		mortarContents: [],
		completedSteps: [],
		errors: [],
		finalProduct: null
	};
}

// Toggle balance power
export function toggleBalance(state: CompoundingState): CompoundingState {
	return {
		...state,
		isBalanceOn: !state.isBalanceOn,
		balanceReading: !state.isBalanceOn ? 0 : state.balanceReading,
		isTared: false
	};
}

// Tare the balance
export function tareBalance(state: CompoundingState): CompoundingState {
	if (!state.isBalanceOn) return state;
	return {
		...state,
		isTared: true,
		balanceReading: 0
	};
}

// Add weight to balance (simulating adding powder)
export function addToBalance(state: CompoundingState, ingredientId: string, amount: number): CompoundingState {
	if (!state.isBalanceOn) return state;

	const ingredientIndex = state.selectedIngredients.findIndex((i) => i.ingredientId === ingredientId);
	if (ingredientIndex === -1) return state;

	const ingredient = state.selectedIngredients[ingredientIndex];
	const newAmount = ingredient.actualAmount + amount;

	// Add small measurement noise (±0.5%)
	const noise = (Math.random() - 0.5) * 0.01 * amount;
	const displayedWeight = state.balanceReading + amount + noise;

	const newIngredients = [...state.selectedIngredients];
	newIngredients[ingredientIndex] = {
		...ingredient,
		actualAmount: newAmount
	};

	return {
		...state,
		selectedIngredients: newIngredients,
		balanceReading: Math.round(displayedWeight * 1000) / 1000
	};
}

// Mark ingredient as weighed
export function confirmWeight(state: CompoundingState, ingredientId: string): CompoundingState {
	const ingredientIndex = state.selectedIngredients.findIndex((i) => i.ingredientId === ingredientId);
	if (ingredientIndex === -1) return state;

	const ingredient = state.selectedIngredients[ingredientIndex];
	const errorPercent = Math.abs((ingredient.actualAmount - ingredient.targetAmount) / ingredient.targetAmount) * 100;

	const newIngredients = [...state.selectedIngredients];
	newIngredients[ingredientIndex] = {
		...ingredient,
		isWeighed: true
	};

	let newErrors = [...state.errors];

	// Check for weighing errors
	if (errorPercent > 10) {
		newErrors.push({
			id: `err-${Date.now()}`,
			type: 'weight',
			message: `${INGREDIENTS.find((i) => i.id === ingredientId)?.name} is ${errorPercent.toFixed(1)}% off target`,
			severity: errorPercent > 20 ? 'critical' : 'warning',
			timestamp: Date.now()
		});
	}

	return {
		...state,
		selectedIngredients: newIngredients,
		errors: newErrors,
		balanceReading: 0,
		isTared: false
	};
}

// Add ingredient to mortar
export function addToMortar(state: CompoundingState, ingredientId: string): CompoundingState {
	const ingredient = state.selectedIngredients.find((i) => i.ingredientId === ingredientId);
	if (!ingredient || !ingredient.isWeighed) return state;

	// Check if already in mortar
	if (state.mortarContents.some((m) => m.ingredientId === ingredientId)) return state;

	const recipe = RECIPES.find((r) => r.id === state.currentRecipeId);
	const recipeIngredient = recipe?.ingredients.find((ri) => ri.ingredientId === ingredientId);

	// Check order
	const expectedOrder = recipeIngredient?.order || 999;
	const currentMaxOrder = Math.max(0, ...state.mortarContents.map((m) => {
		const ri = recipe?.ingredients.find((ri) => ri.ingredientId === m.ingredientId);
		return ri?.order || 0;
	}));

	let newErrors = [...state.errors];
	if (expectedOrder < currentMaxOrder) {
		newErrors.push({
			id: `err-${Date.now()}`,
			type: 'order',
			message: `${INGREDIENTS.find((i) => i.id === ingredientId)?.name} added out of order`,
			severity: 'warning',
			timestamp: Date.now()
		});
	}

	return {
		...state,
		mortarContents: [
			...state.mortarContents,
			{
				ingredientId,
				amount: ingredient.actualAmount,
				isMixed: false
			}
		],
		errors: newErrors,
		mixingProgress: 0
	};
}

// Perform mixing/trituration
export function mix(state: CompoundingState, duration: number): CompoundingState {
	if (state.mortarContents.length < 2) return state;

	const newMixingTime = state.mixingTime + duration;
	const requiredTime = 60 * state.mortarContents.length; // 60 seconds per ingredient
	const newProgress = Math.min(100, (newMixingTime / requiredTime) * 100);

	const newContents = state.mortarContents.map((m) => ({
		...m,
		isMixed: newProgress >= 100
	}));

	return {
		...state,
		mortarContents: newContents,
		mixingProgress: newProgress,
		mixingTime: newMixingTime
	};
}

// Don PPE item
export function wearPPE(state: CompoundingState, ppeId: string): CompoundingState {
	const ppe = PPE_ITEMS.find((p) => p.id === ppeId);
	if (!ppe || state.ppeWorn.some((p) => p.id === ppeId)) return state;

	return {
		...state,
		ppeWorn: [...state.ppeWorn, ppe]
	};
}

// Remove PPE item
export function removePPE(state: CompoundingState, ppeId: string): CompoundingState {
	return {
		...state,
		ppeWorn: state.ppeWorn.filter((p) => p.id !== ppeId)
	};
}

// Complete a step
export function completeStep(state: CompoundingState, stepId: string): CompoundingState {
	if (state.completedSteps.includes(stepId)) return state;

	const stepIndex = COMPOUNDING_STEPS.findIndex((s) => s.id === stepId);
	const nextStep = COMPOUNDING_STEPS[stepIndex + 1] || state.currentStep;

	return {
		...state,
		completedSteps: [...state.completedSteps, stepId],
		currentStep: nextStep
	};
}

// Add observation
export function addObservation(state: CompoundingState, observation: string): CompoundingState {
	return {
		...state,
		observations: [...state.observations, observation]
	};
}

// Finalize the compound
export function finalizeCompound(state: CompoundingState): CompoundingState {
	const recipe = RECIPES.find((r) => r.id === state.currentRecipeId);
	if (!recipe || state.mortarContents.length === 0) return state;

	// Calculate total weight and accuracy
	const totalActual = state.selectedIngredients.reduce((sum, i) => {
		const multiplier = i.unit === 'mg' ? 0.001 : 1;
		return sum + i.actualAmount * multiplier;
	}, 0);

	const totalTarget = recipe.ingredients.reduce((sum, ri) => {
		const multiplier = ri.unit === 'mg' ? 0.001 : 1;
		return sum + ri.amount * multiplier;
	}, 0);

	const accuracy = 100 - Math.abs((totalActual - totalTarget) / totalTarget) * 100;

	// Determine quality
	let quality: FinalProduct['quality'];
	if (accuracy >= 95 && state.mixingProgress >= 100 && state.errors.filter((e) => e.severity === 'critical').length === 0) {
		quality = 'excellent';
	} else if (accuracy >= 90 && state.mixingProgress >= 80) {
		quality = 'acceptable';
	} else if (accuracy >= 80) {
		quality = 'poor';
	} else {
		quality = 'failed';
	}

	// Generate beyond use date
	const bud = new Date();
	bud.setDate(bud.getDate() + recipe.beyondUseDays);

	const finalProduct: FinalProduct = {
		name: recipe.name,
		totalWeight: totalActual,
		accuracy,
		appearance: state.mixingProgress >= 100 ? 'Uniform, well-mixed' : 'Inconsistent mixture',
		quality,
		beyondUseDate: bud.toISOString().split('T')[0]
	};

	return {
		...state,
		finalProduct
	};
}

// Analysis and grading
export interface CompoundingAnalysis {
	score: number;
	grade: 'A' | 'B' | 'C' | 'D' | 'F';
	weighingAccuracy: number;
	techniqueScore: number;
	safetyScore: number;
	feedback: string;
}

export function analyzeCompounding(state: CompoundingState): CompoundingAnalysis {
	const recipe = RECIPES.find((r) => r.id === state.currentRecipeId);
	if (!recipe || !state.finalProduct) {
		return {
			score: 0,
			grade: 'F',
			weighingAccuracy: 0,
			techniqueScore: 0,
			safetyScore: 0,
			feedback: 'Compound was not completed.'
		};
	}

	// Calculate weighing accuracy (40 points)
	const weighingErrors = state.selectedIngredients.map((i) => {
		return Math.abs((i.actualAmount - i.targetAmount) / i.targetAmount) * 100;
	});
	const avgWeighingError = weighingErrors.reduce((a, b) => a + b, 0) / weighingErrors.length;
	const weighingAccuracy = Math.max(0, 100 - avgWeighingError);
	const weighingScore = (weighingAccuracy / 100) * 40;

	// Calculate technique score (35 points)
	const mixingScore = (state.mixingProgress / 100) * 20;
	const orderErrors = state.errors.filter((e) => e.type === 'order').length;
	const orderScore = Math.max(0, 15 - orderErrors * 5);
	const techniqueScore = mixingScore + orderScore;

	// Calculate safety score (25 points)
	const requiredPPE = ['gloves', 'gown'];
	const ppeWorn = state.ppeWorn.filter((p) => requiredPPE.includes(p.id)).length;
	const ppeScore = (ppeWorn / requiredPPE.length) * 15;
	const criticalErrors = state.errors.filter((e) => e.severity === 'critical').length;
	const safetyDeduction = criticalErrors * 5;
	const safetyScore = Math.max(0, ppeScore + 10 - safetyDeduction);

	const totalScore = Math.round(weighingScore + techniqueScore + safetyScore);

	// Determine grade
	let grade: CompoundingAnalysis['grade'];
	if (totalScore >= 90) grade = 'A';
	else if (totalScore >= 80) grade = 'B';
	else if (totalScore >= 70) grade = 'C';
	else if (totalScore >= 60) grade = 'D';
	else grade = 'F';

	// Generate feedback
	let feedback = '';
	if (grade === 'A') {
		feedback = 'Excellent work! Your compound meets pharmaceutical standards with accurate weighing and proper technique.';
	} else if (grade === 'B') {
		feedback = 'Good job! Minor improvements in weighing accuracy or technique could improve your compound quality.';
	} else if (weighingAccuracy < 90) {
		feedback = 'Your weighing accuracy needs improvement. Always double-check weights against target amounts.';
	} else if (state.mixingProgress < 80) {
		feedback = 'The compound was not mixed thoroughly enough. Ensure complete homogeneity before packaging.';
	} else {
		feedback = 'Review proper compounding techniques and safety procedures for better results.';
	}

	return {
		score: totalScore,
		grade,
		weighingAccuracy,
		techniqueScore: (techniqueScore / 35) * 100,
		safetyScore: (safetyScore / 25) * 100,
		feedback
	};
}

// Helper to get recipe by ID
export function getRecipe(recipeId: string): Recipe | undefined {
	return RECIPES.find((r) => r.id === recipeId);
}

// Helper to get ingredient by ID
export function getIngredient(ingredientId: string): Ingredient | undefined {
	return INGREDIENTS.find((i) => i.id === ingredientId);
}
