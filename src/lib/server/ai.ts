import type { AIContext, Discipline } from '$types';

/**
 * Build system prompt for lab assistant
 */
export function buildLabAssistantPrompt(context: AIContext): string {
	const disciplineContext = getDisciplineContext(context.discipline);

	return `You are an expert laboratory assistant for AfriLab, a virtual science laboratory platform for African universities.

## Your Role
- Help students understand and complete their laboratory experiments safely and effectively
- Explain scientific concepts clearly and at an appropriate level for the student
- Guide students through procedures step by step
- Provide hints without giving away answers directly
- Emphasize safety protocols and best practices

## Current Context
- Discipline: ${disciplineContext.name}
- Experiment: ${context.experimentTitle}
- Current Step: ${context.currentStep}
- Student Level: ${context.studentLevel}

${disciplineContext.specificGuidelines}

## Guidelines
1. Be encouraging but accurate - never compromise scientific accuracy
2. If a student is making a mistake, gently guide them to discover the error
3. Use the Socratic method when appropriate - ask leading questions
4. Relate concepts to real-world applications when possible
5. Always prioritize safety - warn about potential hazards
6. Keep responses concise but complete
7. Use proper scientific terminology but explain complex terms

## Recent Measurements
${formatMeasurements(context.recentMeasurements)}

Remember: You are helping students learn, not doing the work for them. Guide and explain, don't just provide answers.`;
}

/**
 * Get discipline-specific context and guidelines
 */
function getDisciplineContext(discipline: Discipline): { name: string; specificGuidelines: string } {
	switch (discipline) {
		case 'chemistry':
			return {
				name: 'Chemistry',
				specificGuidelines: `## Chemistry-Specific Guidelines
- Emphasize proper technique: always add acid to water, never the reverse
- Explain reaction mechanisms when relevant
- Discuss stoichiometry and calculations
- Highlight color changes and their significance
- Explain indicator chemistry and pH concepts
- Discuss sources of error in volumetric analysis`
			};

		case 'biology':
			return {
				name: 'Biology',
				specificGuidelines: `## Biology-Specific Guidelines
- Explain cellular structures and their functions
- Discuss microscopy techniques and magnification
- Relate observations to biological processes
- Explain specimen preparation methods
- Discuss the importance of controls in experiments`
			};

		case 'physics':
			return {
				name: 'Physics',
				specificGuidelines: `## Physics-Specific Guidelines
- Explain physical principles and laws involved
- Discuss measurement uncertainty and error analysis
- Help with unit conversions and calculations
- Relate experiments to theoretical concepts
- Discuss real-world applications of physics concepts`
			};

		case 'pharmacy':
			return {
				name: 'Pharmacy',
				specificGuidelines: `## Pharmacy-Specific Guidelines
- Emphasize precision in measurements and calculations
- Discuss drug interactions and contraindications
- Explain pharmacokinetics and pharmacodynamics concepts
- Highlight compounding best practices
- Discuss patient safety considerations`
			};

		case 'medical':
			return {
				name: 'Medical Sciences',
				specificGuidelines: `## Medical Sciences-Specific Guidelines
- Guide clinical reasoning and differential diagnosis
- Explain anatomical and physiological concepts
- Discuss patient presentation and history taking
- Emphasize evidence-based medicine
- Highlight ethical considerations in patient care`
			};

		default:
			return {
				name: 'General Science',
				specificGuidelines: '## General Guidelines\n- Apply scientific method principles\n- Emphasize observation and data recording'
			};
	}
}

/**
 * Format recent measurements for context
 */
function formatMeasurements(measurements: AIContext['recentMeasurements']): string {
	if (!measurements || measurements.length === 0) {
		return 'No measurements recorded yet.';
	}

	return measurements
		.slice(-5)
		.map((m) => `- ${m.label || m.type}: ${m.value} ${m.unit}`)
		.join('\n');
}

/**
 * Build prompt for generating assessment feedback
 */
export function buildAssessmentPrompt(
	experimentTitle: string,
	learningObjectives: string[],
	sessionData: {
		measurements: { type: string; value: number; unit: string }[];
		completedSteps: number;
		totalSteps: number;
		timeSpent: number;
	},
	expectedResults?: { min: number; max: number; unit: string }
): string {
	return `You are evaluating a student's virtual laboratory session. Provide constructive feedback.

## Experiment
${experimentTitle}

## Learning Objectives
${learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

## Student Performance
- Completed Steps: ${sessionData.completedSteps} of ${sessionData.totalSteps}
- Time Spent: ${Math.round(sessionData.timeSpent / 60)} minutes
- Measurements Recorded: ${sessionData.measurements.length}

## Recorded Measurements
${sessionData.measurements.map((m) => `- ${m.type}: ${m.value} ${m.unit}`).join('\n')}

${expectedResults ? `## Expected Range\n${expectedResults.min} - ${expectedResults.max} ${expectedResults.unit}` : ''}

## Your Task
Provide:
1. A score from 0-100 based on accuracy and technique
2. Specific feedback on what the student did well
3. Areas for improvement
4. Suggestions for further learning

Format your response as JSON:
{
  "score": <number>,
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<improvement1>", "<improvement2>"],
  "feedback": "<detailed paragraph of feedback>",
  "nextSteps": ["<suggestion1>", "<suggestion2>"]
}`;
}

/**
 * Build prompt for generating hints
 */
export function buildHintPrompt(
	experimentTitle: string,
	currentStep: { title: string; description: string },
	previousHints: string[],
	studentAction?: string
): string {
	return `A student is working on "${experimentTitle}" and needs a hint.

## Current Step
${currentStep.title}: ${currentStep.description}

${studentAction ? `## Student's Action\n${studentAction}` : ''}

${previousHints.length > 0 ? `## Previous Hints Given\n${previousHints.map((h, i) => `${i + 1}. ${h}`).join('\n')}` : ''}

Provide a helpful hint that:
1. Guides without revealing the complete answer
2. Builds on previous hints if any were given
3. Uses the Socratic method when possible
4. Is encouraging and supportive

Keep your hint concise (1-2 sentences).`;
}

/**
 * Build prompt for safety warnings
 */
export function buildSafetyPrompt(
	action: string,
	chemicals?: string[],
	equipment?: string[]
): string {
	return `Evaluate the safety implications of this laboratory action and provide any necessary warnings.

## Action
${action}

${chemicals?.length ? `## Chemicals Involved\n${chemicals.join(', ')}` : ''}
${equipment?.length ? `## Equipment\n${equipment.join(', ')}` : ''}

If there are safety concerns, explain:
1. The specific hazard
2. Proper precautions
3. What to do if an accident occurs

If the action is safe, confirm it briefly.

Keep your response concise and actionable.`;
}
