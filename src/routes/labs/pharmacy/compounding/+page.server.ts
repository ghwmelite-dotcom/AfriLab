import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login?redirect=/labs/pharmacy/compounding');
	}

	return {
		user: locals.user,
		labInfo: {
			id: 'compounding',
			name: 'Drug Compounding Lab',
			discipline: 'pharmacy',
			description: 'Practice pharmaceutical compounding techniques and dosage calculations',
			duration: '45-60 minutes',
			difficulty: 'intermediate'
		}
	};
};
