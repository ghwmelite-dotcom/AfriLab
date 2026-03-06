/**
 * Ecosystem Simulation Lab
 * Model population dynamics, food webs, and energy flow
 */

export interface Species {
	id: string;
	name: string;
	trophicLevel: 'producer' | 'primary_consumer' | 'secondary_consumer' | 'tertiary_consumer';
	color: string;
	icon: string; // SVG path descriptor
	initialPopulation: number;
	carryingCapacity: number;
	growthRate: number; // Intrinsic rate of natural increase (r)
	energyContent: number; // kJ per individual
	preyIds: string[]; // What this species eats
	consumptionRate: number; // Fraction of prey consumed per time step
	deathRate: number; // Natural mortality rate per time step
}

export const DEFAULT_SPECIES: Species[] = [
	{
		id: 'grass',
		name: 'Savanna Grass',
		trophicLevel: 'producer',
		color: '#22c55e',
		icon: 'grass',
		initialPopulation: 1000,
		carryingCapacity: 2000,
		growthRate: 0.15,
		energyContent: 10,
		preyIds: [],
		consumptionRate: 0,
		deathRate: 0.02
	},
	{
		id: 'acacia',
		name: 'Acacia Tree',
		trophicLevel: 'producer',
		color: '#16a34a',
		icon: 'tree',
		initialPopulation: 200,
		carryingCapacity: 500,
		growthRate: 0.05,
		energyContent: 50,
		preyIds: [],
		consumptionRate: 0,
		deathRate: 0.01
	},
	{
		id: 'grasshopper',
		name: 'Grasshopper',
		trophicLevel: 'primary_consumer',
		color: '#84cc16',
		icon: 'insect',
		initialPopulation: 500,
		carryingCapacity: 1500,
		growthRate: 0.12,
		energyContent: 5,
		preyIds: ['grass'],
		consumptionRate: 0.08,
		deathRate: 0.05
	},
	{
		id: 'zebra',
		name: 'Zebra',
		trophicLevel: 'primary_consumer',
		color: '#a3a3a3',
		icon: 'herbivore',
		initialPopulation: 100,
		carryingCapacity: 300,
		growthRate: 0.06,
		energyContent: 200,
		preyIds: ['grass', 'acacia'],
		consumptionRate: 0.05,
		deathRate: 0.03
	},
	{
		id: 'bird',
		name: 'Weaver Bird',
		trophicLevel: 'secondary_consumer',
		color: '#f59e0b',
		icon: 'bird',
		initialPopulation: 150,
		carryingCapacity: 400,
		growthRate: 0.08,
		energyContent: 15,
		preyIds: ['grasshopper'],
		consumptionRate: 0.10,
		deathRate: 0.04
	},
	{
		id: 'lion',
		name: 'Lion',
		trophicLevel: 'secondary_consumer',
		color: '#d97706',
		icon: 'predator',
		initialPopulation: 20,
		carryingCapacity: 50,
		growthRate: 0.03,
		energyContent: 500,
		preyIds: ['zebra'],
		consumptionRate: 0.06,
		deathRate: 0.02
	},
	{
		id: 'eagle',
		name: 'African Eagle',
		trophicLevel: 'tertiary_consumer',
		color: '#78716c',
		icon: 'raptor',
		initialPopulation: 10,
		carryingCapacity: 25,
		growthRate: 0.02,
		energyContent: 100,
		preyIds: ['bird', 'grasshopper'],
		consumptionRate: 0.08,
		deathRate: 0.03
	}
];

export type EnvironmentalEvent = 'drought' | 'disease' | 'invasive_species' | 'flood' | 'fire' | 'none';

export interface EventConfig {
	type: EnvironmentalEvent;
	name: string;
	description: string;
	affectedSpeciesIds: string[];
	populationMultiplier: number; // Applied to affected species
	durationSteps: number;
	color: string;
}

export const ENVIRONMENTAL_EVENTS: EventConfig[] = [
	{
		type: 'drought',
		name: 'Severe Drought',
		description: 'Extended dry period reduces plant growth and water availability.',
		affectedSpeciesIds: ['grass', 'acacia'],
		populationMultiplier: 0.7,
		durationSteps: 8,
		color: '#dc2626'
	},
	{
		type: 'disease',
		name: 'Disease Outbreak',
		description: 'A viral disease spreads among primary consumers.',
		affectedSpeciesIds: ['zebra', 'grasshopper'],
		populationMultiplier: 0.5,
		durationSteps: 5,
		color: '#9333ea'
	},
	{
		type: 'invasive_species',
		name: 'Invasive Plant Species',
		description: 'An invasive plant competes with native producers for resources.',
		affectedSpeciesIds: ['grass', 'acacia'],
		populationMultiplier: 0.6,
		durationSteps: 10,
		color: '#ea580c'
	},
	{
		type: 'flood',
		name: 'Seasonal Flood',
		description: 'Heavy rains flood low-lying areas, temporarily boosting plant growth.',
		affectedSpeciesIds: ['grass'],
		populationMultiplier: 1.5,
		durationSteps: 4,
		color: '#2563eb'
	},
	{
		type: 'fire',
		name: 'Bushfire',
		description: 'A wildfire sweeps through, reducing all terrestrial populations but fertilizing soil.',
		affectedSpeciesIds: ['grass', 'acacia', 'grasshopper'],
		populationMultiplier: 0.4,
		durationSteps: 3,
		color: '#f97316'
	}
];

export interface PopulationDataPoint {
	step: number;
	populations: Map<string, number>;
	energyFlows: Map<string, number>; // Energy transferred at each trophic level
	event: EnvironmentalEvent;
}

export interface EcosystemState {
	species: Species[];
	currentPopulations: Map<string, number>;
	history: PopulationDataPoint[];
	currentStep: number;
	isRunning: boolean;
	speed: number; // 1-5 simulation speed
	activeEvents: { event: EventConfig; remainingSteps: number }[];
	selectedSpeciesId: string | null;
	totalEnergyFlow: Map<string, number>; // Trophic level -> energy
	quizAnswers: Map<string, string>;
	observations: string[];
}

export interface EcosystemConfig {
	species: Species[];
}

// Create initial state
export function createInitialState(config: EcosystemConfig): EcosystemState {
	const populations = new Map<string, number>();
	config.species.forEach((s) => {
		populations.set(s.id, s.initialPopulation);
	});

	const initialPoint: PopulationDataPoint = {
		step: 0,
		populations: new Map(populations),
		energyFlows: new Map(),
		event: 'none'
	};

	return {
		species: config.species,
		currentPopulations: populations,
		history: [initialPoint],
		currentStep: 0,
		isRunning: false,
		speed: 1,
		activeEvents: [],
		selectedSpeciesId: null,
		totalEnergyFlow: new Map(),
		quizAnswers: new Map(),
		observations: []
	};
}

// Simulate one time step using Lotka-Volterra-inspired dynamics
export function simulateStep(state: EcosystemState): EcosystemState {
	const newPops = new Map<string, number>();
	const energyFlows = new Map<string, number>();
	const step = state.currentStep + 1;

	// Check for active events
	const activeEventTypes = state.activeEvents.map((e) => e.event.type);

	state.species.forEach((species) => {
		let pop = state.currentPopulations.get(species.id) || 0;
		if (pop <= 0) {
			newPops.set(species.id, 0);
			return;
		}

		// Producer growth (logistic model)
		if (species.trophicLevel === 'producer') {
			const K = species.carryingCapacity;
			const r = species.growthRate;
			const growth = r * pop * (1 - pop / K);
			pop = pop + growth - species.deathRate * pop;
		} else {
			// Consumer growth depends on prey availability
			let totalPreyEnergy = 0;
			species.preyIds.forEach((preyId) => {
				const preyPop = state.currentPopulations.get(preyId) || 0;
				const prey = state.species.find((s) => s.id === preyId);
				if (prey) {
					const consumed = species.consumptionRate * pop * (preyPop / (preyPop + 100));
					totalPreyEnergy += consumed * prey.energyContent;

					// Reduce prey population
					const currentPreyPop = newPops.get(preyId) ?? (state.currentPopulations.get(preyId) || 0);
					newPops.set(preyId, Math.max(0, currentPreyPop - consumed));
				}
			});

			// Energy transfer efficiency (~10% rule)
			const energyGained = totalPreyEnergy * 0.10;
			const growthFromEnergy = energyGained / Math.max(species.energyContent, 1);

			// Store energy flow
			energyFlows.set(species.id, Math.round(totalPreyEnergy));

			// Population change
			const K = species.carryingCapacity;
			const densityDep = 1 - pop / K;
			pop = pop + growthFromEnergy * densityDep - species.deathRate * pop;
		}

		// Apply environmental event effects
		state.activeEvents.forEach(({ event }) => {
			if (event.affectedSpeciesIds.includes(species.id)) {
				pop = pop * Math.pow(event.populationMultiplier, 1 / event.durationSteps);
			}
		});

		// Minimum viable population (below 2 means extinction)
		if (pop < 2 && species.trophicLevel !== 'producer') {
			pop = 0;
		}

		// Add stochasticity
		const noise = 1 + (Math.random() - 0.5) * 0.05;
		pop = Math.max(0, Math.round(pop * noise));

		newPops.set(species.id, pop);
	});

	// Update active events
	const updatedEvents = state.activeEvents
		.map((e) => ({ ...e, remainingSteps: e.remainingSteps - 1 }))
		.filter((e) => e.remainingSteps > 0);

	const dataPoint: PopulationDataPoint = {
		step,
		populations: new Map(newPops),
		energyFlows,
		event: activeEventTypes.length > 0 ? activeEventTypes[0] : 'none'
	};

	return {
		...state,
		currentPopulations: newPops,
		history: [...state.history, dataPoint],
		currentStep: step,
		activeEvents: updatedEvents,
		totalEnergyFlow: energyFlows
	};
}

// Run multiple steps
export function simulateSteps(state: EcosystemState, count: number): EcosystemState {
	let current = state;
	for (let i = 0; i < count; i++) {
		current = simulateStep(current);
	}
	return current;
}

// Introduce environmental event
export function introduceEvent(state: EcosystemState, eventType: EnvironmentalEvent): EcosystemState {
	const eventConfig = ENVIRONMENTAL_EVENTS.find((e) => e.type === eventType);
	if (!eventConfig) return state;

	return {
		...state,
		activeEvents: [...state.activeEvents, { event: eventConfig, remainingSteps: eventConfig.durationSteps }]
	};
}

// Select species
export function selectSpecies(state: EcosystemState, speciesId: string | null): EcosystemState {
	return { ...state, selectedSpeciesId: speciesId };
}

// Set simulation speed
export function setSpeed(state: EcosystemState, speed: number): EcosystemState {
	return { ...state, speed: Math.max(1, Math.min(5, speed)) };
}

// Toggle running
export function toggleRunning(state: EcosystemState): EcosystemState {
	return { ...state, isRunning: !state.isRunning };
}

// Reset simulation
export function resetSimulation(state: EcosystemState): EcosystemState {
	return createInitialState({ species: state.species });
}

// Add observation
export function addObservation(state: EcosystemState, note: string): EcosystemState {
	return { ...state, observations: [...state.observations, note] };
}

// Answer quiz
export function answerQuiz(state: EcosystemState, questionId: string, answer: string): EcosystemState {
	const newAnswers = new Map(state.quizAnswers);
	newAnswers.set(questionId, answer);
	return { ...state, quizAnswers: newAnswers };
}

// Calculate trophic level energy
export function getTrophicEnergy(state: EcosystemState): Map<string, number> {
	const energy = new Map<string, number>();
	const levels = ['producer', 'primary_consumer', 'secondary_consumer', 'tertiary_consumer'];

	levels.forEach((level) => {
		let total = 0;
		state.species.forEach((s) => {
			if (s.trophicLevel === level) {
				const pop = state.currentPopulations.get(s.id) || 0;
				total += pop * s.energyContent;
			}
		});
		energy.set(level, total);
	});

	return energy;
}

// Analysis
export interface EcosystemAnalysis {
	totalSteps: number;
	eventsIntroduced: number;
	extinctions: string[];
	populationChanges: Map<string, { initial: number; final: number; change: number }>;
	quizScore: { correct: number; total: number };
	accuracy: number;
	grade: 'A' | 'B' | 'C' | 'D' | 'F';
	feedback: string;
}

export function analyzeEcosystem(state: EcosystemState): EcosystemAnalysis {
	const totalSteps = state.currentStep;
	const eventsIntroduced = state.history.filter((h) => h.event !== 'none').length > 0
		? new Set(state.history.filter((h) => h.event !== 'none').map((h) => h.event)).size
		: 0;

	const extinctions: string[] = [];
	const populationChanges = new Map<string, { initial: number; final: number; change: number }>();

	state.species.forEach((s) => {
		const initial = s.initialPopulation;
		const final = state.currentPopulations.get(s.id) || 0;
		const change = Math.round(((final - initial) / Math.max(initial, 1)) * 100);
		populationChanges.set(s.id, { initial, final, change });
		if (final === 0 && initial > 0) extinctions.push(s.name);
	});

	const quizScore = checkQuizAnswers(state);

	let score = 0;
	score += Math.min(totalSteps * 0.5, 20); // Up to 20 for running simulation
	score += Math.min(eventsIntroduced * 10, 20); // Up to 20 for events
	score += (quizScore.correct / Math.max(quizScore.total, 1)) * 40; // 40 for quiz
	score += Math.min(state.observations.length * 5, 20); // Up to 20 for observations

	let grade: 'A' | 'B' | 'C' | 'D' | 'F';
	if (score >= 90) grade = 'A';
	else if (score >= 80) grade = 'B';
	else if (score >= 70) grade = 'C';
	else if (score >= 60) grade = 'D';
	else grade = 'F';

	let feedback = '';
	if (score >= 90) feedback = 'Excellent understanding of ecosystem dynamics and trophic interactions!';
	else if (score >= 70) feedback = 'Good exploration. Try introducing different environmental events to see cascading effects.';
	else if (score >= 50) feedback = 'Decent start. Run the simulation longer and observe how populations interact over time.';
	else feedback = 'Keep exploring! Introduce environmental changes and observe how they cascade through the food web.';

	return {
		totalSteps,
		eventsIntroduced,
		extinctions,
		populationChanges,
		quizScore,
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

export const ECOSYSTEM_QUIZ: QuizQuestion[] = [
	{
		id: 'q1',
		question: 'What percentage of energy is typically transferred from one trophic level to the next?',
		options: ['1%', '10%', '50%', '90%'],
		correctAnswer: '10%',
		explanation: 'The "10% rule" states that roughly 10% of energy is transferred between trophic levels. The rest is lost as heat through metabolic processes.'
	},
	{
		id: 'q2',
		question: 'What would happen to herbivore populations if all predators were removed?',
		options: [
			'Herbivores would stay the same',
			'Herbivores would increase then crash due to resource depletion',
			'Herbivores would go extinct',
			'Herbivores would decrease'
		],
		correctAnswer: 'Herbivores would increase then crash due to resource depletion',
		explanation: 'Without predator control, herbivore populations would initially boom, overgraze vegetation, and then crash as food resources become depleted (a trophic cascade).'
	},
	{
		id: 'q3',
		question: 'Why are there typically fewer organisms at higher trophic levels?',
		options: [
			'Higher trophic levels have more diseases',
			'Energy loss at each transfer limits populations at higher levels',
			'Predators eat each other',
			'They have slower reproduction rates only'
		],
		correctAnswer: 'Energy loss at each transfer limits populations at higher levels',
		explanation: 'Because only ~10% of energy transfers between levels, there is progressively less energy available to support populations at higher trophic levels.'
	},
	{
		id: 'q4',
		question: 'What is carrying capacity (K)?',
		options: [
			'The maximum speed of population growth',
			'The maximum population size an environment can sustain',
			'The number of species in an ecosystem',
			'The amount of energy in a food web'
		],
		correctAnswer: 'The maximum population size an environment can sustain',
		explanation: 'Carrying capacity is the maximum population size that an environment can sustain indefinitely, given the available resources.'
	},
	{
		id: 'q5',
		question: 'What type of growth curve does a population show when resources are limited?',
		options: ['Exponential (J-curve)', 'Logistic (S-curve)', 'Linear', 'Declining'],
		correctAnswer: 'Logistic (S-curve)',
		explanation: 'With limited resources, populations follow logistic growth: initial exponential growth that slows as the population approaches carrying capacity, forming an S-shaped curve.'
	}
];

export function checkQuizAnswers(state: EcosystemState): { correct: number; total: number } {
	let correct = 0;
	ECOSYSTEM_QUIZ.forEach((q) => {
		if (state.quizAnswers.get(q.id) === q.correctAnswer) correct++;
	});
	return { correct, total: ECOSYSTEM_QUIZ.length };
}
