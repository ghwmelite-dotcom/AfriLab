import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login?redirect=/labs/biology/microscopy');
	}

	return {
		user: locals.user,
		labInfo: {
			id: 'microscopy',
			name: 'Cell Microscopy Lab',
			discipline: 'biology',
			description: 'Learn to operate a compound microscope and identify cell structures',
			duration: '45-60 minutes',
			difficulty: 'intermediate'
		}
	};
};
