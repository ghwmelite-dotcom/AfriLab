/**
 * Mendelian Genetics Lab Simulation
 * Simulate monohybrid and dihybrid crosses with Punnett squares
 */

// Trait definitions
export interface Trait {
	id: string;
	name: string;
	gene: string;
	dominantAllele: string;
	recessiveAllele: string;
	dominantPhenotype: string;
	recessivePhenotype: string;
	dominantColor: string;
	recessiveColor: string;
}

export const TRAITS: Trait[] = [
	{
		id: 'flower-color',
		name: 'Flower Color',
		gene: 'C',
		dominantAllele: 'C',
		recessiveAllele: 'c',
		dominantPhenotype: 'Purple',
		recessivePhenotype: 'White',
		dominantColor: '#9333ea',
		recessiveColor: '#f5f5f5'
	},
	{
		id: 'seed-shape',
		name: 'Seed Shape',
		gene: 'R',
		dominantAllele: 'R',
		recessiveAllele: 'r',
		dominantPhenotype: 'Round',
		recessivePhenotype: 'Wrinkled',
		dominantColor: '#22c55e',
		recessiveColor: '#a3e635'
	},
	{
		id: 'plant-height',
		name: 'Plant Height',
		gene: 'T',
		dominantAllele: 'T',
		recessiveAllele: 't',
		dominantPhenotype: 'Tall',
		recessivePhenotype: 'Short',
		dominantColor: '#059669',
		recessiveColor: '#6ee7b7'
	},
	{
		id: 'seed-color',
		name: 'Seed Color',
		gene: 'Y',
		dominantAllele: 'Y',
		recessiveAllele: 'y',
		dominantPhenotype: 'Yellow',
		recessivePhenotype: 'Green',
		dominantColor: '#eab308',
		recessiveColor: '#16a34a'
	}
];

export type Genotype = [string, string]; // Two alleles

export interface Organism {
	genotypes: Map<string, Genotype>; // traitId -> genotype
}

export interface CrossResult {
	parent1: Organism;
	parent2: Organism;
	traitIds: string[];
	punnettSquare: PunnettCell[][];
	offspringGenotypes: Map<string, number>; // genotype string -> count
	offspringPhenotypes: Map<string, number>; // phenotype string -> count
	expectedRatios: Map<string, number>;
	totalOffspring: number;
}

export interface PunnettCell {
	alleles: string; // Combined genotype string
	row: number;
	col: number;
}

export interface ChiSquareResult {
	degreesOfFreedom: number;
	chiSquareValue: number;
	pValue: number;
	isSignificant: boolean; // p < 0.05
	observed: Map<string, number>;
	expected: Map<string, number>;
}

// State
export interface GeneticsState {
	selectedTraitIds: string[];
	crossType: 'monohybrid' | 'dihybrid';
	parent1Genotypes: Map<string, Genotype>;
	parent2Genotypes: Map<string, Genotype>;
	crossResult: CrossResult | null;
	generation: number;
	crossHistory: CrossResult[];
	observedCounts: Map<string, number>;
	sampleSize: number;
	chiSquareResult: ChiSquareResult | null;
	quizAnswers: Map<string, string>;
}

export interface GeneticsConfig {
	defaultTraitIds: string[];
	defaultCrossType: 'monohybrid' | 'dihybrid';
}

// Create initial state
export function createInitialState(config: GeneticsConfig): GeneticsState {
	const parent1Genotypes = new Map<string, Genotype>();
	const parent2Genotypes = new Map<string, Genotype>();

	config.defaultTraitIds.forEach((traitId) => {
		const trait = TRAITS.find((t) => t.id === traitId);
		if (trait) {
			parent1Genotypes.set(traitId, [trait.dominantAllele, trait.recessiveAllele]);
			parent2Genotypes.set(traitId, [trait.dominantAllele, trait.recessiveAllele]);
		}
	});

	return {
		selectedTraitIds: config.defaultTraitIds,
		crossType: config.defaultCrossType,
		parent1Genotypes,
		parent2Genotypes,
		crossResult: null,
		generation: 0,
		crossHistory: [],
		observedCounts: new Map(),
		sampleSize: 100,
		chiSquareResult: null,
		quizAnswers: new Map()
	};
}

// Set cross type
export function setCrossType(state: GeneticsState, type: 'monohybrid' | 'dihybrid'): GeneticsState {
	const traitIds = type === 'monohybrid' ? [state.selectedTraitIds[0]] : state.selectedTraitIds.slice(0, 2);
	return {
		...state,
		crossType: type,
		selectedTraitIds: traitIds,
		crossResult: null,
		chiSquareResult: null
	};
}

// Select trait
export function selectTrait(state: GeneticsState, traitId: string, index: number): GeneticsState {
	const newTraitIds = [...state.selectedTraitIds];
	newTraitIds[index] = traitId;

	const trait = TRAITS.find((t) => t.id === traitId);
	const newP1 = new Map(state.parent1Genotypes);
	const newP2 = new Map(state.parent2Genotypes);

	if (trait) {
		newP1.set(traitId, [trait.dominantAllele, trait.recessiveAllele]);
		newP2.set(traitId, [trait.dominantAllele, trait.recessiveAllele]);
	}

	return {
		...state,
		selectedTraitIds: newTraitIds,
		parent1Genotypes: newP1,
		parent2Genotypes: newP2,
		crossResult: null,
		chiSquareResult: null
	};
}

// Set parent genotype
export function setParentGenotype(
	state: GeneticsState,
	parent: 1 | 2,
	traitId: string,
	genotype: Genotype
): GeneticsState {
	if (parent === 1) {
		const newP1 = new Map(state.parent1Genotypes);
		newP1.set(traitId, genotype);
		return { ...state, parent1Genotypes: newP1, crossResult: null, chiSquareResult: null };
	} else {
		const newP2 = new Map(state.parent2Genotypes);
		newP2.set(traitId, genotype);
		return { ...state, parent2Genotypes: newP2, crossResult: null, chiSquareResult: null };
	}
}

// Get phenotype from genotype
export function getPhenotype(traitId: string, genotype: Genotype): string {
	const trait = TRAITS.find((t) => t.id === traitId);
	if (!trait) return 'Unknown';
	// Dominant if at least one dominant allele
	const hasDominant = genotype.some((a) => a === trait.dominantAllele);
	return hasDominant ? trait.dominantPhenotype : trait.recessivePhenotype;
}

// Get genotype string (sorted so Aa = Aa not aA)
export function genotypeString(genotype: Genotype): string {
	return genotype[0] <= genotype[1] ? genotype.join('') : [genotype[1], genotype[0]].join('');
}

// Get possible gametes for a set of traits
function getGametes(genotypes: Map<string, Genotype>, traitIds: string[]): string[][] {
	if (traitIds.length === 0) return [[]];
	const [firstTrait, ...restTraits] = traitIds;
	const alleles = genotypes.get(firstTrait) || ['?', '?'];
	const restGametes = getGametes(genotypes, restTraits);

	const gametes: string[][] = [];
	for (const allele of alleles) {
		for (const rest of restGametes) {
			gametes.push([allele, ...rest]);
		}
	}
	return gametes;
}

// Perform cross
export function performCross(state: GeneticsState): GeneticsState {
	const traitIds = state.selectedTraitIds;
	const p1Gametes = getGametes(state.parent1Genotypes, traitIds);
	const p2Gametes = getGametes(state.parent2Genotypes, traitIds);

	const punnettSquare: PunnettCell[][] = [];
	const offspringGenotypes = new Map<string, number>();
	const offspringPhenotypes = new Map<string, number>();

	for (let row = 0; row < p1Gametes.length; row++) {
		const punnettRow: PunnettCell[] = [];
		for (let col = 0; col < p2Gametes.length; col++) {
			// Combine gametes
			const alleleStrs: string[] = [];
			const phenotypeStrs: string[] = [];

			for (let t = 0; t < traitIds.length; t++) {
				const a1 = p1Gametes[row][t];
				const a2 = p2Gametes[col][t];
				const geno: Genotype = [a1, a2];
				const sortedGeno = genotypeString(geno);
				alleleStrs.push(sortedGeno);
				phenotypeStrs.push(getPhenotype(traitIds[t], geno));
			}

			const genoKey = alleleStrs.join(' ');
			const phenoKey = phenotypeStrs.join(', ');

			offspringGenotypes.set(genoKey, (offspringGenotypes.get(genoKey) || 0) + 1);
			offspringPhenotypes.set(phenoKey, (offspringPhenotypes.get(phenoKey) || 0) + 1);

			punnettRow.push({ alleles: genoKey, row, col });
		}
		punnettSquare.push(punnettRow);
	}

	// Calculate expected ratios
	const total = p1Gametes.length * p2Gametes.length;
	const expectedRatios = new Map<string, number>();
	offspringPhenotypes.forEach((count, pheno) => {
		expectedRatios.set(pheno, count / total);
	});

	const parent1: Organism = { genotypes: new Map(state.parent1Genotypes) };
	const parent2: Organism = { genotypes: new Map(state.parent2Genotypes) };

	const crossResult: CrossResult = {
		parent1,
		parent2,
		traitIds,
		punnettSquare,
		offspringGenotypes,
		offspringPhenotypes,
		expectedRatios,
		totalOffspring: total
	};

	// Generate observed counts from sample with realistic random variation
	const observedCounts = new Map<string, number>();
	let remaining = state.sampleSize;
	const phenoEntries = Array.from(offspringPhenotypes.entries());

	for (let i = 0; i < phenoEntries.length; i++) {
		const [pheno, count] = phenoEntries[i];
		const expectedCount = (count / total) * state.sampleSize;

		if (i === phenoEntries.length - 1) {
			observedCounts.set(pheno, remaining);
		} else {
			// Add some random variation (binomial-like)
			const stdDev = Math.sqrt(expectedCount * (1 - count / total));
			const variation = (Math.random() - 0.5) * 2 * stdDev;
			const observed = Math.max(0, Math.round(expectedCount + variation));
			observedCounts.set(pheno, observed);
			remaining -= observed;
		}
	}

	return {
		...state,
		crossResult,
		generation: state.generation + 1,
		crossHistory: [...state.crossHistory, crossResult],
		observedCounts,
		chiSquareResult: null
	};
}

// Perform chi-square test
export function performChiSquare(state: GeneticsState): GeneticsState {
	if (!state.crossResult) return state;

	const observed = state.observedCounts;
	const expected = new Map<string, number>();
	const total = state.sampleSize;

	state.crossResult.expectedRatios.forEach((ratio, pheno) => {
		expected.set(pheno, ratio * total);
	});

	let chiSquare = 0;
	observed.forEach((obs, pheno) => {
		const exp = expected.get(pheno) || 1;
		chiSquare += Math.pow(obs - exp, 2) / exp;
	});

	const df = observed.size - 1;

	// Approximate p-value using chi-square distribution
	const pValue = chiSquarePValue(chiSquare, df);

	const chiSquareResult: ChiSquareResult = {
		degreesOfFreedom: df,
		chiSquareValue: Math.round(chiSquare * 1000) / 1000,
		pValue: Math.round(pValue * 10000) / 10000,
		isSignificant: pValue < 0.05,
		observed,
		expected
	};

	return { ...state, chiSquareResult };
}

// Simple chi-square p-value approximation
function chiSquarePValue(x: number, df: number): number {
	if (x <= 0) return 1;
	// Use Wilson-Hilferty approximation
	const z = Math.pow(x / df, 1 / 3) - (1 - 2 / (9 * df));
	const denom = Math.sqrt(2 / (9 * df));
	const normalZ = z / denom;
	// Normal CDF approximation
	return 1 - normalCDF(normalZ);
}

function normalCDF(x: number): number {
	const a1 = 0.254829592;
	const a2 = -0.284496736;
	const a3 = 1.421413741;
	const a4 = -1.453152027;
	const a5 = 1.061405429;
	const p = 0.3275911;
	const sign = x < 0 ? -1 : 1;
	x = Math.abs(x) / Math.sqrt(2);
	const t = 1.0 / (1.0 + p * x);
	const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
	return 0.5 * (1.0 + sign * y);
}

// Set sample size
export function setSampleSize(state: GeneticsState, size: number): GeneticsState {
	return { ...state, sampleSize: Math.max(10, Math.min(1000, size)) };
}

// Answer quiz
export function answerQuiz(state: GeneticsState, questionId: string, answer: string): GeneticsState {
	const newAnswers = new Map(state.quizAnswers);
	newAnswers.set(questionId, answer);
	return { ...state, quizAnswers: newAnswers };
}

// Get genotype options for a trait
export function getGenotypeOptions(traitId: string): { label: string; genotype: Genotype }[] {
	const trait = TRAITS.find((t) => t.id === traitId);
	if (!trait) return [];
	const D = trait.dominantAllele;
	const d = trait.recessiveAllele;
	return [
		{ label: `${D}${D} (Homozygous Dominant)`, genotype: [D, D] },
		{ label: `${D}${d} (Heterozygous)`, genotype: [D, d] },
		{ label: `${d}${d} (Homozygous Recessive)`, genotype: [d, d] }
	];
}

// Analysis
export interface GeneticsAnalysis {
	crossesPerformed: number;
	correctQuizAnswers: number;
	totalQuizQuestions: number;
	chiSquareCompleted: boolean;
	accuracy: number;
	grade: 'A' | 'B' | 'C' | 'D' | 'F';
	feedback: string;
}

export function analyzeGenetics(state: GeneticsState): GeneticsAnalysis {
	const crossesPerformed = state.crossHistory.length;
	const quizResults = checkQuizAnswers(state);
	const chiSquareCompleted = state.chiSquareResult !== null;

	let score = 0;
	score += Math.min(crossesPerformed * 15, 30); // Up to 30 for crosses
	score += (quizResults.correct / Math.max(quizResults.total, 1)) * 50; // 50 for quiz
	score += chiSquareCompleted ? 20 : 0; // 20 for chi-square

	let grade: 'A' | 'B' | 'C' | 'D' | 'F';
	if (score >= 90) grade = 'A';
	else if (score >= 80) grade = 'B';
	else if (score >= 70) grade = 'C';
	else if (score >= 60) grade = 'D';
	else grade = 'F';

	let feedback = '';
	if (score >= 90) feedback = 'Excellent understanding of Mendelian genetics and inheritance patterns!';
	else if (score >= 70) feedback = 'Good grasp of genetic crosses. Review chi-square analysis for deeper understanding.';
	else if (score >= 50) feedback = 'Decent progress. Practice more crosses and review Punnett square mechanics.';
	else feedback = 'Keep studying! Focus on understanding dominant/recessive inheritance and genotype-phenotype relationships.';

	return {
		crossesPerformed,
		correctQuizAnswers: quizResults.correct,
		totalQuizQuestions: quizResults.total,
		chiSquareCompleted,
		accuracy: Math.round(score),
		grade,
		feedback
	};
}

// Quiz
export interface QuizQuestion {
	id: string;
	question: string;
	options: string[];
	correctAnswer: string;
	explanation: string;
}

export const GENETICS_QUIZ: QuizQuestion[] = [
	{
		id: 'q1',
		question: 'In a monohybrid cross between two heterozygous parents (Aa x Aa), what is the expected phenotypic ratio?',
		options: ['1:1', '1:2:1', '3:1', '1:3'],
		correctAnswer: '3:1',
		explanation: 'A cross of Aa x Aa produces 1 AA : 2 Aa : 1 aa genotypes, but since A is dominant, both AA and Aa show the dominant phenotype, giving a 3:1 phenotypic ratio.'
	},
	{
		id: 'q2',
		question: 'What genotypic ratio is expected from a cross between two heterozygous organisms (Aa x Aa)?',
		options: ['3:1', '1:2:1', '1:1', '2:1:1'],
		correctAnswer: '1:2:1',
		explanation: 'The cross Aa x Aa produces 1 AA : 2 Aa : 1 aa, a 1:2:1 genotypic ratio.'
	},
	{
		id: 'q3',
		question: 'In a dihybrid cross (AaBb x AaBb), what is the expected phenotypic ratio?',
		options: ['3:1', '9:3:3:1', '1:1:1:1', '9:7'],
		correctAnswer: '9:3:3:1',
		explanation: 'A dihybrid cross between two double heterozygotes yields a 9:3:3:1 phenotypic ratio when both traits show complete dominance.'
	},
	{
		id: 'q4',
		question: 'What does a chi-square test help determine in genetics?',
		options: [
			'The dominant allele',
			'Whether observed results match expected ratios',
			'The number of chromosomes',
			'Which allele is recessive'
		],
		correctAnswer: 'Whether observed results match expected ratios',
		explanation: 'The chi-square test compares observed offspring numbers with expected numbers to determine if deviations are due to chance or indicate a different inheritance pattern.'
	},
	{
		id: 'q5',
		question: 'If a homozygous dominant plant (TT) is crossed with a homozygous recessive plant (tt), what are all F1 offspring?',
		options: ['TT', 'Tt', 'tt', 'TT or tt'],
		correctAnswer: 'Tt',
		explanation: 'All F1 offspring are heterozygous (Tt) because each parent can only contribute one type of allele.'
	}
];

export function checkQuizAnswers(state: GeneticsState): { correct: number; total: number } {
	let correct = 0;
	GENETICS_QUIZ.forEach((q) => {
		if (state.quizAnswers.get(q.id) === q.correctAnswer) correct++;
	});
	return { correct, total: GENETICS_QUIZ.length };
}
