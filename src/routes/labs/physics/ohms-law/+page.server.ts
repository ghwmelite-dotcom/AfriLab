import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login?redirect=/labs/physics/ohms-law');
	}

	return {
		user: locals.user,
		labInfo: {
			id: 'ohms-law',
			name: "Ohm's Law Verification",
			discipline: 'physics',
			description: 'Verify the linear relationship between voltage and current in resistive circuits',
			duration: '35-45 minutes',
			difficulty: 'beginner'
		}
	};
};
