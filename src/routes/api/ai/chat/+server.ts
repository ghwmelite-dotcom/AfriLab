import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { buildLabAssistantPrompt } from '$server/ai';
import type { AIContext } from '$types';

export const POST: RequestHandler = async ({ request, platform, locals }) => {
	// Check authentication
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (!platform?.env?.AI) {
		// Fallback for development without AI binding
		return json({
			reply: 'AI service is not available in development mode. In production, this would connect to Cloudflare Workers AI with Llama.'
		});
	}

	try {
		const { message, context } = await request.json() as {
			message: string;
			context: AIContext | null;
		};

		if (!message || typeof message !== 'string') {
			return json({ error: 'Message is required' }, { status: 400 });
		}

		// Build the system prompt based on context
		const systemPrompt = context
			? buildLabAssistantPrompt(context)
			: `You are a helpful laboratory assistant for AfriLab, a virtual science laboratory platform.
			   Help students with their experiments, explain scientific concepts, and provide guidance.
			   Be encouraging, accurate, and prioritize safety in all your responses.`;

		// Call Cloudflare Workers AI
		const response = await platform.env.AI.run(
			'@cf/meta/llama-3.1-70b-instruct',
			{
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: message }
				],
				max_tokens: 1024,
				temperature: 0.7
			}
		);

		return json({
			reply: response.response || 'I apologize, but I was unable to generate a response. Please try again.'
		});
	} catch (error) {
		console.error('AI chat error:', error);

		return json({
			reply: 'I encountered an error while processing your request. Please try again.',
			error: 'AI service error'
		}, { status: 500 });
	}
};
