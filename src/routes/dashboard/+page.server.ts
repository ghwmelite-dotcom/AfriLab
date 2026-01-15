import type { PageServerLoad } from './$types';
import { getDashboardStats } from '$server/db';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user || !platform?.env) {
		return { stats: null };
	}

	const stats = await getDashboardStats(platform.env.DB, locals.user.id);

	return { stats };
};
