import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getInstructorStudents } from '$server/db';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	if (locals.user.role !== 'instructor' && locals.user.role !== 'admin') {
		throw redirect(302, '/dashboard');
	}

	if (!platform?.env) {
		return {
			studentCount: 0,
			activeLabsCount: 0,
			completedThisWeek: 0,
			avgScore: null,
			recentActivity: []
		};
	}

	const students = await getInstructorStudents(platform.env.DB, locals.user.id);

	return {
		studentCount: students.length,
		activeLabsCount: 0, // Would be calculated from actual data
		completedThisWeek: 0,
		avgScore: null,
		recentActivity: []
	};
};
