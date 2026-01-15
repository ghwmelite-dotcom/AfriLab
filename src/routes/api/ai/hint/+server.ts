import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	buildHintSystemPrompt,
	buildHintPrompt,
	getProgressiveHint,
	type HintRequest
} from '$lib/server/ai-hints';

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		const body = await request.json() as HintRequest;

		// Validate required fields
		if (!body.experimentId || body.currentStep === undefined || body.hintLevel === undefined) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Try AI-powered hint generation if Workers AI is available
		if (platform?.env?.AI) {
			try {
				const systemPrompt = buildHintSystemPrompt(body);
				const userPrompt = buildHintPrompt(body);

				const response = await platform.env.AI.run(
					'@cf/meta/llama-3.1-8b-instruct',
					{
						messages: [
							{ role: 'system', content: systemPrompt },
							{ role: 'user', content: userPrompt }
						],
						max_tokens: 256,
						temperature: 0.7
					}
				);

				if (response?.response) {
					// Get related concept from static hints
					const staticHint = getProgressiveHint(
						body.experimentId,
						body.currentStep,
						body.hintLevel,
						body.previousHints
					);

					return json({
						hint: response.response,
						hintLevel: body.hintLevel,
						encouragement: staticHint.encouragement,
						relatedConcept: staticHint.relatedConcept,
						source: 'ai'
					});
				}
			} catch (aiError) {
				console.error('AI hint generation failed, falling back to static hints:', aiError);
			}
		}

		// Fallback to static hints
		const hint = getProgressiveHint(
			body.experimentId,
			body.currentStep,
			body.hintLevel,
			body.previousHints
		);

		return json({
			...hint,
			source: 'static'
		});

	} catch (error) {
		console.error('Hint API error:', error);
		return json({ error: 'Failed to generate hint' }, { status: 500 });
	}
};
