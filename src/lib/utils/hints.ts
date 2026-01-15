/**
 * AI Hints System (Shared utilities)
 *
 * Provides context-aware, progressive hints for lab experiments
 */

export interface HintResponse {
	hint: string;
	hintLevel: number;
	encouragement?: string;
	relatedConcept?: string;
	nextStepPreview?: string;
}

/**
 * Generate predefined hints for common scenarios (fallback)
 */
export function getStaticHints(experimentId: string, stepId: number, hintLevel: number): string[] {
	const hints: Record<string, Record<number, string[]>> = {
		'chem-titration-01': {
			1: [
				'Before we start, take a moment to identify the safety equipment in your virtual lab.',
				'Look at the burette and flask. What do you notice about their positions?',
				'Safety first! Make sure you know where the emergency equipment is located.'
			],
			2: [
				'The burette contains the base (NaOH). Notice how it\'s positioned above the flask.',
				'The meniscus (curved surface of liquid) is important for accurate readings.',
				'Read the burette scale from the bottom of the meniscus for accurate measurements.'
			],
			3: [
				'Record the initial burette reading. This is your starting point.',
				'The initial reading should be at 0.00 mL if properly set up.',
				'A good scientist always records initial measurements before starting.'
			],
			4: [
				'Add the NaOH solution slowly. Watch for any color changes in the flask.',
				'The indicator (phenolphthalein) is colorless in acid but turns pink in base.',
				'Swirl the flask gently as you add drops to ensure thorough mixing.'
			],
			5: [
				'The endpoint is when the solution first turns pink and stays pink.',
				'A persistent faint pink color that lasts 30 seconds indicates the endpoint.',
				'If you overshoot, the solution will turn deep pink - this means you added too much base.'
			],
			6: [
				'Record the final burette reading accurately.',
				'Volume used = Final reading - Initial reading',
				'Your calculated volume should be close to the theoretical equivalence volume.'
			]
		},
		'chem-spectroscopy-01': {
			1: [
				'Beer-Lambert law relates absorbance to concentration. A = εlc',
				'Think about what each variable represents: A (absorbance), ε (molar absorptivity), l (path length), c (concentration).',
				'This fundamental law is the basis of quantitative spectroscopy.'
			],
			2: [
				'The lamp needs to warm up before taking accurate readings.',
				'A stable light source is essential for consistent measurements.',
				'Look for the "Lamp ON" indicator to confirm the spectrophotometer is ready.'
			],
			3: [
				'λmax is the wavelength where the compound absorbs most strongly.',
				'For potassium permanganate, λmax is around 525 nm (green-yellow region).',
				'Setting the correct wavelength is crucial for maximum sensitivity.'
			],
			4: [
				'The blank (usually distilled water) sets the 100% transmittance reference.',
				'Without a blank, your absorbance readings won\'t be accurate.',
				'The blank corrects for any absorption by the solvent or cuvette.'
			],
			5: [
				'Start with the lowest concentration and work your way up.',
				'Record both the concentration and absorbance for each measurement.',
				'Accurate pipetting is essential for reliable calibration data.'
			],
			6: [
				'A good calibration curve should have R² > 0.99 for accurate analysis.',
				'The slope of the line equals ε × l (molar absorptivity × path length).',
				'If your R² is low, check your technique and consider repeating measurements.'
			]
		}
	};

	const experimentHints = hints[experimentId];
	if (!experimentHints) return ['Keep observing and thinking about what you see.'];

	const stepHints = experimentHints[stepId];
	if (!stepHints) return ['Think about what the current step is asking you to do.'];

	return stepHints;
}

/**
 * Get related scientific concept for educational enrichment
 */
function getRelatedConcept(experimentId: string, stepId: number): string | undefined {
	const concepts: Record<string, Record<number, string>> = {
		'chem-titration-01': {
			1: 'Lab safety protocols are standardized worldwide - the same rules you learn here apply in labs across Africa and beyond.',
			2: 'Volumetric analysis was pioneered in the 19th century and revolutionized quantitative chemistry.',
			3: 'The meniscus forms due to surface tension - water molecules are attracted to glass more than to each other.',
			4: 'Phenolphthalein was first synthesized by Adolf von Baeyer in 1871 and remains one of the most common acid-base indicators.',
			5: 'At the equivalence point, the moles of acid exactly equal the moles of base - this is stoichiometry in action!',
			6: 'Nigerian chemist Ogaga Ifowodo has contributed significantly to analytical chemistry techniques used across West Africa.'
		},
		'chem-spectroscopy-01': {
			1: 'Beer-Lambert law was developed independently by August Beer and Johann Heinrich Lambert in the 18th century.',
			2: 'Modern spectrophotometers can analyze samples in milliseconds - your virtual lab simulates this real-world instrument.',
			3: 'The visible spectrum (380-780 nm) is just a tiny portion of the electromagnetic spectrum.',
			4: 'Blanking the instrument removes background noise and solvent absorption from your measurements.',
			5: 'Calibration curves are used daily in clinical labs across Africa to analyze blood samples and diagnose diseases.',
			6: 'South African spectroscopist Neil Coville has advanced materials characterization techniques used globally.'
		}
	};

	return concepts[experimentId]?.[stepId];
}

/**
 * Get progressive hint based on hint level
 */
export function getProgressiveHint(
	experimentId: string,
	stepId: number,
	hintLevel: number,
	previousHints: string[] = []
): HintResponse {
	const allHints = getStaticHints(experimentId, stepId, hintLevel);
	const hintIndex = Math.min(hintLevel - 1, allHints.length - 1);
	const hint = allHints[hintIndex];

	// Generate encouragement based on hint level
	const encouragements = [
		'You\'re on the right track!',
		'Good thinking! Keep exploring.',
		'Don\'t worry, science is about learning through experimentation.',
		'Every great scientist started exactly where you are.',
		'Curiosity is your best tool in the lab!'
	];

	return {
		hint,
		hintLevel,
		encouragement: encouragements[Math.floor(Math.random() * encouragements.length)],
		relatedConcept: getRelatedConcept(experimentId, stepId)
	};
}
